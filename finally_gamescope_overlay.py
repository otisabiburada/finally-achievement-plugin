#!/usr/bin/env python3
import ctypes
import colorsys
import math
import os
import re
import sys
import time


def _early_display_check(display=None, cdll=None):
    """Before the heavy imports (PyGObject, GLFW): can we reach the X display?
    A missing X authorization cookie used to make the helper crash (SIGSEGV)
    after libX11/GTK printed "Authorization required". This turns it into a
    clean exit with a message the plugin recognises, so it can retry with
    another display or X authority file. Returns an error string or None."""
    target = (display if display is not None else os.environ.get("DISPLAY", "")) or ":0"
    try:
        lib = (cdll or ctypes.CDLL)("libX11.so.6")
        lib.XOpenDisplay.restype = ctypes.c_void_p
        lib.XOpenDisplay.argtypes = (ctypes.c_char_p,)
        handle = lib.XOpenDisplay(target.encode())
        if not handle:
            return f"Cannot open display {target} (X authorization required, or the display isn't running)"
        lib.XCloseDisplay.argtypes = (ctypes.c_void_p,)
        lib.XCloseDisplay(handle)
    except OSError:
        return None            # no libX11 to test with: let the normal startup report what's missing
    return None


if __name__ == "__main__" and "--selftest" not in sys.argv:
    _early_error = _early_display_check()
    if _early_error:
        sys.stderr.write(_early_error + "\n")
        raise SystemExit(3)

# Drawing libraries. pycairo + PyGObject when both are available (SteamOS, the
# original path); otherwise the ctypes layer in finally_cairo_ctypes.py, which
# needs only the system libcairo/libpango/libgdk_pixbuf. That is what makes the
# popup work on handhelds whose Python has no pycairo (e.g. a Legion Go).
# FINALLY_FORCE_CTYPES_DRAWING=1 forces the ctypes layer.
DRAWING_STACK = "pycairo"
try:
    if os.environ.get("FINALLY_FORCE_CTYPES_DRAWING") == "1":
        raise ImportError("ctypes drawing forced")
    import cairo
    import gi

    gi.require_version("Pango", "1.0")
    gi.require_version("PangoCairo", "1.0")
    gi.require_version("GdkPixbuf", "2.0")
    gi.require_version("Gdk", "3.0")
    from gi.repository import Gdk, GdkPixbuf, Pango, PangoCairo
except (ImportError, ValueError):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import finally_cairo_ctypes as _drawing

    cairo, Gdk, GdkPixbuf, Pango, PangoCairo = (
        _drawing.cairo, _drawing.Gdk, _drawing.GdkPixbuf, _drawing.Pango, _drawing.PangoCairo,
    )
    DRAWING_STACK = "ctypes"


def _load(names, find_as=None):
    """Loads the first library that works: the given names, the usual
    absolute locations on other distros, then ctypes' own search."""
    tried = list(names)
    for base in ("/usr/lib64/", "/usr/lib/x86_64-linux-gnu/", "/usr/lib/"):
        tried.extend(base + n for n in names if "." in n and not n.endswith(".so"))
    if find_as:
        import ctypes.util
        located = ctypes.util.find_library(find_as)
        if located:
            tried.append(located)
    for name in tried:
        try:
            return ctypes.CDLL(name)
        except OSError:
            pass
    raise OSError(f"Unable to load any of: {', '.join(names)} (also tried {len(tried) - len(names)} other locations)")


glfw = _load(("libglfw.so.3", "libglfw.so"), "glfw")
gl = _load(("libGL.so.1", "libGL.so"), "GL")
x11 = _load(("libX11.so.6", "libX11.so"), "X11")

GLFW_FALSE = 0
GLFW_TRUE = 1
GLFW_FOCUSED = 0x00020001
GLFW_RESIZABLE = 0x00020003
GLFW_VISIBLE = 0x00020004
GLFW_DECORATED = 0x00020005
GLFW_FLOATING = 0x00020007
GLFW_FOCUS_ON_SHOW = 0x0002000C
GLFW_MOUSE_PASSTHROUGH = 0x0002000D
GLFW_TRANSPARENT_FRAMEBUFFER = 0x0002000A
GLFW_X11_CLASS_NAME = 0x00024001
GLFW_X11_INSTANCE_NAME = 0x00024002
GLFW_DEPTH_BITS = 0x00021005
GLFW_STENCIL_BITS = 0x00021006
GLFW_CONTEXT_VERSION_MAJOR = 0x00022002
GLFW_CONTEXT_VERSION_MINOR = 0x00022003
GLFW_RED_BITS = 0x00021001
GLFW_GREEN_BITS = 0x00021002
GLFW_BLUE_BITS = 0x00021003
GLFW_ALPHA_BITS = 0x00021004
GLFW_CONTEXT_CREATION_API = 0x0002200B
GLFW_EGL_CONTEXT_API = 0x00036002
GLFW_PLATFORM = 0x00050003          # init hint (GLFW 3.4+)
GLFW_PLATFORM_X11 = 0x00060004

GL_COLOR_BUFFER_BIT = 0x00004000
GL_TEXTURE_2D = 0x0DE1
GL_RGBA = 0x1908
GL_BGRA = 0x80E1
GL_UNSIGNED_BYTE = 0x1401
GL_BLEND = 0x0BE2
GL_ONE = 1
GL_ONE_MINUS_SRC_ALPHA = 0x0303
GL_PROJECTION = 0x1701
GL_MODELVIEW = 0x1700
GL_QUADS = 0x0007
GL_TEXTURE_MIN_FILTER = 0x2801
GL_TEXTURE_MAG_FILTER = 0x2800
GL_LINEAR = 0x2601


def _glfw_prefer_x11():
    """GLFW 3.4+ can pick Wayland when WAYLAND_DISPLAY is set. This plugin
    needs an X11 window (it sets X properties for gamescope), so ask for X11.
    Older GLFW rejects the hint harmlessly."""
    try:
        glfw.glfwInitHint.argtypes = (ctypes.c_int, ctypes.c_int)
        glfw.glfwInitHint.restype = None
        glfw.glfwInitHint(GLFW_PLATFORM, GLFW_PLATFORM_X11)
    except Exception:
        return
    _glfw_error()  # clear the "invalid enum" error old GLFW versions record


def _glfw_error():
    """Last GLFW error description (or "") -- shows why a window failed."""
    try:
        glfw.glfwGetError.argtypes = (ctypes.POINTER(ctypes.c_char_p),)
        glfw.glfwGetError.restype = ctypes.c_int
        desc = ctypes.c_char_p()
        glfw.glfwGetError(ctypes.byref(desc))
        return desc.value.decode("utf-8", "replace") if desc.value else ""
    except Exception:
        return ""


_CONTEXT_HINTS = (GLFW_CONTEXT_VERSION_MAJOR, GLFW_CONTEXT_VERSION_MINOR)
_BUFFER_HINTS = (GLFW_DEPTH_BITS, GLFW_STENCIL_BITS)


def _glfw_window_attempts(hints):
    """Hint sets to try, most exact first. Some X servers (Legion Go and
    other non-Deck setups) have no transparent GLX config with the exact
    buffers the popup asks for, so relax them step by step."""
    no_version = [h for h in hints if h[0] not in _CONTEXT_HINTS]
    no_buffers = [h for h in no_version if h[0] not in _BUFFER_HINTS]
    rgba8 = no_buffers + [(GLFW_RED_BITS, 8), (GLFW_GREEN_BITS, 8), (GLFW_BLUE_BITS, 8), (GLFW_ALPHA_BITS, 8)]
    egl = [(GLFW_CONTEXT_CREATION_API, GLFW_EGL_CONTEXT_API)]
    return [
        ("exact", list(hints)),
        ("no OpenGL version", no_version),
        ("default depth/stencil", no_buffers),
        ("explicit RGBA8", rgba8),
        ("EGL context", no_buffers + egl),
        ("EGL context, exact buffers", no_version + egl),
    ]


def _glfw_create_window(hints, width, height, title):
    """Create the transparent overlay window, trying progressively more
    forgiving settings. Returns (window, note); window is 0/None if every
    attempt failed, and note then lists what GLFW said."""
    errors = []
    for name, attempt in _glfw_window_attempts(hints):
        try:
            glfw.glfwDefaultWindowHints.restype = None
            glfw.glfwDefaultWindowHints()
        except Exception:
            pass
        for hint, value in attempt:
            glfw.glfwWindowHint(hint, value)
        glfw.glfwWindowHintString(GLFW_X11_CLASS_NAME, b"mangoapp overlay window")
        glfw.glfwWindowHintString(GLFW_X11_INSTANCE_NAME, b"mangoapp overlay window")
        _glfw_error()  # clear anything left from the previous attempt
        window = glfw.glfwCreateWindow(width, height, title, None, None)
        if window:
            print(f"[overlay] window created ({name})", file=sys.stderr)
            return window, name
        errors.append(f"{name}: {_glfw_error() or 'no error reported'}")
    return None, "; ".join(errors)


def _configure_ctypes():
    glfw.glfwInit.restype = ctypes.c_int
    glfw.glfwWindowHint.argtypes = (ctypes.c_int, ctypes.c_int)
    glfw.glfwWindowHintString.argtypes = (ctypes.c_int, ctypes.c_char_p)
    glfw.glfwCreateWindow.argtypes = (ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_void_p)
    glfw.glfwCreateWindow.restype = ctypes.c_void_p
    glfw.glfwMakeContextCurrent.argtypes = (ctypes.c_void_p,)
    glfw.glfwSwapInterval.argtypes = (ctypes.c_int,)
    glfw.glfwSwapBuffers.argtypes = (ctypes.c_void_p,)
    glfw.glfwPollEvents.restype = None
    glfw.glfwSetWindowPos.argtypes = (ctypes.c_void_p, ctypes.c_int, ctypes.c_int)
    glfw.glfwShowWindow.argtypes = (ctypes.c_void_p,)
    glfw.glfwTerminate.restype = None
    glfw.glfwGetX11Display.restype = ctypes.c_void_p
    glfw.glfwGetX11Window.argtypes = (ctypes.c_void_p,)
    glfw.glfwGetX11Window.restype = ctypes.c_ulong

    x11.XOpenDisplay.argtypes = (ctypes.c_char_p,)
    x11.XOpenDisplay.restype = ctypes.c_void_p
    x11.XDefaultScreen.argtypes = (ctypes.c_void_p,)
    x11.XDefaultScreen.restype = ctypes.c_int
    x11.XDisplayWidth.argtypes = (ctypes.c_void_p, ctypes.c_int)
    x11.XDisplayWidth.restype = ctypes.c_int
    x11.XDisplayHeight.argtypes = (ctypes.c_void_p, ctypes.c_int)
    x11.XDisplayHeight.restype = ctypes.c_int
    x11.XCloseDisplay.argtypes = (ctypes.c_void_p,)
    x11.XInternAtom.argtypes = (ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int)
    x11.XInternAtom.restype = ctypes.c_ulong
    x11.XChangeProperty.argtypes = (
        ctypes.c_void_p,
        ctypes.c_ulong,
        ctypes.c_ulong,
        ctypes.c_ulong,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.POINTER(ctypes.c_ulong),
        ctypes.c_int,
    )
    x11.XFlush.argtypes = (ctypes.c_void_p,)

    gl.glViewport.argtypes = (ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int)
    gl.glClearColor.argtypes = (ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)
    gl.glClear.argtypes = (ctypes.c_uint,)
    gl.glEnable.argtypes = (ctypes.c_uint,)
    gl.glBlendFunc.argtypes = (ctypes.c_uint, ctypes.c_uint)
    gl.glMatrixMode.argtypes = (ctypes.c_uint,)
    gl.glLoadIdentity.restype = None
    gl.glOrtho.argtypes = (ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double)
    gl.glColor4f.argtypes = (ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)
    gl.glGenTextures.argtypes = (ctypes.c_int, ctypes.POINTER(ctypes.c_uint))
    gl.glBindTexture.argtypes = (ctypes.c_uint, ctypes.c_uint)
    gl.glTexParameteri.argtypes = (ctypes.c_uint, ctypes.c_uint, ctypes.c_int)
    gl.glTexImage2D.argtypes = (
        ctypes.c_uint,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_int,
        ctypes.c_uint,
        ctypes.c_uint,
        ctypes.c_void_p,
    )
    gl.glBegin.argtypes = (ctypes.c_uint,)
    gl.glEnd.restype = None
    gl.glTexCoord2f.argtypes = (ctypes.c_float, ctypes.c_float)
    gl.glVertex2f.argtypes = (ctypes.c_float, ctypes.c_float)


def _display_size() -> tuple[int, int]:
    if os.environ.get("FINALLY_WIDTH") and os.environ.get("FINALLY_HEIGHT"):
        return int(os.environ["FINALLY_WIDTH"]), int(os.environ["FINALLY_HEIGHT"])
    display = x11.XOpenDisplay(os.environ.get("DISPLAY", ":0").encode())
    if not display:
        return 1280, 800
    try:
        screen = x11.XDefaultScreen(display)
        return x11.XDisplayWidth(display, screen), x11.XDisplayHeight(display, screen)
    finally:
        x11.XCloseDisplay(display)


def _rounded_rect(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


def _chamfered_rect(ctx, x, y, w, h, cut):
    """A rectangle with its four corners cut at 45 degrees (an octagon
    outline) -- used by the angular 'Cyber Glass' template instead of a
    rounded rect."""
    cut = min(cut, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.move_to(x + cut, y)
    ctx.line_to(x + w - cut, y)
    ctx.line_to(x + w, y + cut)
    ctx.line_to(x + w, y + h - cut)
    ctx.line_to(x + w - cut, y + h)
    ctx.line_to(x + cut, y + h)
    ctx.line_to(x, y + h - cut)
    ctx.line_to(x, y + cut)
    ctx.close_path()


def _hex_path(ctx, cx, cy, r):
    ctx.new_sub_path()
    for i in range(7):
        angle = -math.pi / 2 + i * math.pi / 3
        px, py = cx + r * math.cos(angle), cy + r * math.sin(angle)
        if i == 0:
            ctx.move_to(px, py)
        else:
            ctx.line_to(px, py)
    ctx.close_path()


def _shape_path(ctx, shape, x, y, w, h, radius_hint):
    """Traces the outline for a card/frame region for the given
    icon/card 'shape' key, using w/h as a bounding box. radius_hint is used
    for the rounded-square corner radius."""
    cx, cy = x + w / 2, y + h / 2
    r = min(w, h) / 2
    if shape == "circle":
        ctx.new_sub_path()
        ctx.arc(cx, cy, r, 0, math.tau)
    elif shape == "hex":
        _hex_path(ctx, cx, cy, r)
    elif shape == "square_sharp":
        ctx.new_sub_path()
        ctx.rectangle(x, y, w, h)
    elif shape == "cut":
        _chamfered_rect(ctx, x, y, w, h, radius_hint)
    else:  # "rounded_square" (default)
        _rounded_rect(ctx, x, y, w, h, radius_hint)


def _measure_text(ctx, text, size, weight, family="DejaVu Sans"):
    """Returns the (width, height) a _text() call with these parameters
    would take up, without drawing anything -- used to size label pills."""
    layout = PangoCairo.create_layout(ctx)
    desc = Pango.FontDescription()
    desc.set_family(family)
    desc.set_absolute_size(size * Pango.SCALE)
    desc.set_weight(weight)
    layout.set_font_description(desc)
    layout.set_text(text, -1)
    w, h = layout.get_pixel_size()
    return w, h


def _text(ctx, text, x, y, size, color, weight=Pango.Weight.BOLD, width=None, family="DejaVu Sans", max_lines=None):
    layout = PangoCairo.create_layout(ctx)
    desc = Pango.FontDescription()
    desc.set_family(family)
    desc.set_absolute_size(size * Pango.SCALE)
    desc.set_weight(weight)
    layout.set_font_description(desc)
    layout.set_text(text, -1)
    if width:
        layout.set_width(int(width * Pango.SCALE))
        layout.set_ellipsize(Pango.EllipsizeMode.END)
        if max_lines and max_lines > 1:
            layout.set_height(-int(max_lines))     # negative height = at most N lines, "..." on the last
    ctx.set_source_rgba(*color)
    ctx.move_to(x, y)
    PangoCairo.show_layout(ctx, layout)



def _clamp(value, low, high):
    return max(low, min(high, value))


def _parse_color(value, fallback):
    if not value:
        return fallback

    text = value.strip()
    match = re.fullmatch(
        r"hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)",
        text,
        re.IGNORECASE,
    )
    if match:
        h = (float(match.group(1)) % 360.0) / 360.0
        s = _clamp(float(match.group(2)) / 100.0, 0.0, 1.0)
        lightness = _clamp(float(match.group(3)) / 100.0, 0.0, 1.0)
        alpha = _clamp(float(match.group(4) or fallback[3]), 0.0, 1.0)
        r, g, b = colorsys.hls_to_rgb(h, lightness, s)
        return r, g, b, alpha

    match = re.fullmatch(r"#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?", text)
    if match:
        rgb = match.group(1)
        alpha_hex = match.group(2)
        alpha = int(alpha_hex, 16) / 255.0 if alpha_hex else fallback[3]
        return (
            int(rgb[0:2], 16) / 255.0,
            int(rgb[2:4], 16) / 255.0,
            int(rgb[4:6], 16) / 255.0,
            _clamp(alpha, 0.0, 1.0),
        )

    return fallback


def _color_with_alpha(color, alpha):
    return color[0], color[1], color[2], color[3] * alpha


def _extract_icon_colors(icon_path):
    """Best-effort dominant-color extraction from an icon file, for the
    "gradient from icon colors" setting. Loads the icon small (24x24) for
    speed, throws out near-transparent pixels (so a transparent background
    doesn't wash out the result), then runs a tiny deterministic 2-means
    clustering over the remaining pixels to find two representative
    colors -- the same basic idea behind "extract colors from album art"
    style dynamic theming, just done directly against the icon file we
    already have on disk rather than needing any extra library.

    Returns ((r, g, b), (r, g, b)) as 0-1 floats, lighter color first, or
    None if the icon is missing/unreadable/has too little color variation
    to bother with -- callers should fall back to the user's configured
    static gradient colors in that case, never guess.
    """
    if not icon_path or not os.path.exists(icon_path):
        return None
    try:
        pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(icon_path, 24, 24, True)
        width, height = pixbuf.get_width(), pixbuf.get_height()
        if width <= 0 or height <= 0:
            return None
        channels = pixbuf.get_n_channels()
        has_alpha = pixbuf.get_has_alpha()
        rowstride = pixbuf.get_rowstride()
        pixels = pixbuf.get_pixels()

        samples = []
        for row in range(height):
            row_offset = row * rowstride
            for col in range(width):
                offset = row_offset + col * channels
                r, g, b = pixels[offset], pixels[offset + 1], pixels[offset + 2]
                if has_alpha and pixels[offset + 3] < 40:
                    continue
                samples.append((r / 255.0, g / 255.0, b / 255.0))

        if len(samples) < 8:
            return None

        def luminance(c):
            return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

        def saturation(c):
            lo, hi = min(c), max(c)
            return 0.0 if hi <= 0 else (hi - lo) / hi

        # Bias toward the icon's actual *colorful* pixels rather than its
        # darkest/lightest ones. Without this, an icon with (very common)
        # neutral touches -- a black outline, a light/white backing plate
        # -- would seed the clustering on those neutrals instead of the
        # vivid color in between, producing a washed-out, muted-looking
        # gradient that reads as "locked" rather than the colorful
        # "unlocked" identity the icon actually has. Falls back to every
        # pixel if the icon turns out to be genuinely low-saturation (a
        # true grayscale/silver icon), so those still work.
        vivid = [s for s in samples if saturation(s) > 0.25]
        working = vivid if len(vivid) >= 8 else samples

        # Deterministic seeding: the most saturated pixel, and whichever
        # pixel is most different (by straight RGB distance) from it --
        # rather than random picks, so the same icon always produces the
        # same gradient instead of jittering between runs.
        c_a = max(working, key=saturation)

        def dist2(a, b):
            return sum((a[i] - b[i]) ** 2 for i in range(3))

        c_b = max(working, key=lambda s: dist2(s, c_a))

        for _ in range(4):
            bucket_a, bucket_b = [], []
            for s in working:
                da = dist2(s, c_a)
                db = dist2(s, c_b)
                (bucket_a if da <= db else bucket_b).append(s)
            if bucket_a:
                c_a = tuple(sum(v[i] for v in bucket_a) / len(bucket_a) for i in range(3))
            if bucket_b:
                c_b = tuple(sum(v[i] for v in bucket_b) / len(bucket_b) for i in range(3))

        lighter, darker = (c_a, c_b) if luminance(c_a) >= luminance(c_b) else (c_b, c_a)
        return lighter, darker
    except Exception:
        return None


def _lighten(component, amount):
    return _clamp(component + (1.0 - component) * amount, 0.0, 1.0)


def _blend(base_rgb, tint_rgb, amount):
    r = base_rgb[0] * (1 - amount) + tint_rgb[0] * amount
    g = base_rgb[1] * (1 - amount) + tint_rgb[1] * amount
    b = base_rgb[2] * (1 - amount) + tint_rgb[2] * amount
    return r, g, b


def _ease_out(value):
    value = _clamp(value, 0.0, 1.0)
    return 1 - (1 - value) ** 3


def _ease_in(value):
    value = _clamp(value, 0.0, 1.0)
    return value ** 3


def _ease_out_back(value, overshoot=1.2):
    """A gentle 'spring' curve: slides slightly past its resting point
    then settles back, instead of a flat linear/cubic slide-in."""
    value = _clamp(value, 0.0, 1.0)
    c1 = overshoot
    c3 = c1 + 1.0
    t = value - 1.0
    return 1.0 + c3 * (t ** 3) + c1 * (t ** 2)


def _ease_out_elastic(value, bounciness=0.42):
    value = _clamp(value, 0.0, 1.0)
    if value <= 0.0 or value >= 1.0:
        return value
    return (2 ** (-10 * value)) * math.sin((value - bounciness / 4) * (2 * math.pi) / bounciness) + 1


def _reveal(progress, start, end, travel=10.0):
    """Generic staggered 'slide up + fade in' progress for one element.
    Returns (alpha 0-1, y_shift px, eased 0-1)."""
    span = max(end - start, 1e-6)
    t = _clamp((progress - start) / span, 0.0, 1.0)
    eased = _ease_out(t)
    return eased, (1.0 - eased) * travel, eased


class AnimState:
    __slots__ = (
        "container_alpha", "container_scale", "quad_slide", "bounce_y",
        "bar_wipe", "icon_scale", "icon_rotation", "icon_alpha",
        "label_alpha", "label_y", "title_alpha", "title_y",
        "subtitle_alpha", "subtitle_y", "pill_alpha", "pill_scale",
        "shine", "glow_pulse_active",
    )

    def __init__(self, **kw):
        for k, v in kw.items():
            setattr(self, k, v)


def _animation_state(progress):
    """
    Every element below animates on its own staggered window (as a fraction
    of the toast's total on-screen duration), instead of the whole card
    moving as one rigid, flat unit:

      0.00 - 0.16  container: scales/fades in with a soft spring overshoot
                   and slides in from off-screen (slide is applied at the
                   GL-quad level, not baked into this texture)
      0.04 - 0.20  left accent bar wipes in top-to-bottom
      0.09 - 0.33  achievement icon pops in with an elastic bounce + a
                   slight counter-rotation settle
      0.17 - 0.30  eyebrow label slides up + fades in
      0.23 - 0.37  title slides up + fades in
      0.29 - 0.43  subtitle slides up + fades in
      0.36 - 0.50  gamerscore pill pops in
      0.42 - 0.68  a single soft light sheen sweeps across the card
      0.16 - 0.84  held steady on screen (icon glow/sparkles continue)
      0.84 - 1.00  quick fade + slide out, everything moves together
    """
    EXIT_START = 0.84

    # Overall container: appears fast, disappears together with everything
    # else on exit.
    if progress < 0.16:
        t = progress / 0.16
        entrance = _ease_out_back(t, overshoot=1.35)
        container_scale = 0.90 + 0.10 * entrance
        container_alpha = _ease_out(_clamp(progress / 0.08, 0.0, 1.0))
        quad_slide = 130.0 * (1.0 - entrance)
        bounce_y = 10.0 * (1.0 - _ease_out(t))
        exit_amount = 0.0
    elif progress > EXIT_START:
        exit_amount = _ease_in((progress - EXIT_START) / (1.0 - EXIT_START))
        container_scale = 1.0 - 0.05 * exit_amount
        container_alpha = 1.0 - exit_amount
        quad_slide = 90.0 * exit_amount
        bounce_y = 6.0 * exit_amount
    else:
        container_scale = 1.0
        container_alpha = 1.0
        quad_slide = 0.0
        bounce_y = 0.0
        exit_amount = 0.0

    bar_alpha, _, bar_wipe = _reveal(progress, 0.04, 0.20, travel=0.0)

    if progress < 0.09:
        icon_scale = 0.0
        icon_alpha = 0.0
    elif progress < 0.33:
        icon_t = _clamp((progress - 0.09) / 0.24, 0.0, 1.0)
        icon_scale = _ease_out_elastic(icon_t, bounciness=0.48)
        icon_alpha = _clamp(icon_t * 2.4, 0.0, 1.0)
    else:
        icon_scale = 1.0
        icon_alpha = 1.0
    icon_rotation = (1.0 - _clamp(icon_scale, 0.0, 1.0)) * -0.28

    label_alpha, label_y, _ = _reveal(progress, 0.17, 0.30)
    title_alpha, title_y, _ = _reveal(progress, 0.23, 0.37)
    subtitle_alpha, subtitle_y, _ = _reveal(progress, 0.29, 0.43)
    pill_alpha, _, pill_eased = _reveal(progress, 0.36, 0.50, travel=0.0)
    pill_scale = 0.55 + 0.45 * _ease_out_back(pill_eased, overshoot=1.6) if pill_eased > 0 else 0.55

    shine = (progress - 0.42) / 0.26 if 0.42 <= progress <= 0.68 else None

    fade = container_alpha  # everything fades together on exit
    return AnimState(
        container_alpha=container_alpha,
        container_scale=container_scale,
        quad_slide=quad_slide,
        bounce_y=bounce_y,
        bar_wipe=bar_wipe,
        icon_scale=icon_scale,
        icon_rotation=icon_rotation,
        icon_alpha=icon_alpha * fade,
        label_alpha=label_alpha * fade,
        label_y=label_y,
        title_alpha=title_alpha * fade,
        title_y=title_y,
        subtitle_alpha=subtitle_alpha * fade,
        subtitle_y=subtitle_y,
        pill_alpha=pill_alpha * fade,
        pill_scale=pill_scale,
        shine=shine,
        glow_pulse_active=progress >= 0.33,
    )


def _animation_state_door(progress):
    """Timeline for the 'classic' door-wipe reveal (xbox_360_classic):
    a small circular badge pops in with a radar-style double ping, holds
    briefly on its own, then a pill 'door' grows out from behind it to
    reveal the text -- mirroring the classic Xbox 360/One achievement
    toast, instead of the shared card-slide entrance every other template
    uses. Exit mirrors the entrance in reverse. Returns a plain object with
    everything the door-wipe drawer needs; unrelated to AnimState/
    _animation_state above, which the GL-quad slide step still uses
    independently (see draw_card in main()) -- this template just asks for
    zero slide distance (see the "slide" flag on its TEMPLATES entry).
    """
    ring1_t = _clamp(progress / 0.05, 0.0, 1.0)
    ring1_alpha = 0.0 if ring1_t <= 0 or ring1_t >= 1 else math.sin(ring1_t * math.pi) * 0.55
    ring2_t = _clamp((progress - 0.02) / 0.05, 0.0, 1.0)
    ring2_alpha = 0.0 if ring2_t <= 0 or ring2_t >= 1 else math.sin(ring2_t * math.pi) * 0.4

    exit_ring1_t = _clamp((progress - 0.95) / 0.05, 0.0, 1.0)
    exit_ring1_alpha = 0.0 if exit_ring1_t <= 0 or exit_ring1_t >= 1 else math.sin(exit_ring1_t * math.pi) * 0.55

    if progress < 0.02:
        badge_scale, badge_alpha = 0.0, 0.0
    elif progress < 0.07:
        t = (progress - 0.02) / 0.05
        badge_scale = _ease_out_back(t, overshoot=1.5)
        badge_alpha = _ease_out(t * 1.6)
    elif progress < 0.955:
        badge_scale, badge_alpha = 1.0, 1.0
    elif progress < 1.0:
        t = (progress - 0.955) / 0.045
        badge_scale = 1.0 - _ease_in(t)
        badge_alpha = 1.0 - _ease_in(t)
    else:
        badge_scale, badge_alpha = 0.0, 0.0

    if progress < 0.12:
        door_t = 0.0
    elif progress < 0.26:
        door_t = _ease_out((progress - 0.12) / 0.14)
    elif progress < 0.88:
        door_t = 1.0
    elif progress < 0.94:
        door_t = 1.0 - _ease_in((progress - 0.88) / 0.06)
    else:
        door_t = 0.0

    label_alpha, label_y, _ = _reveal(progress, 0.27, 0.34, travel=6.0)
    title_alpha, title_y, _ = _reveal(progress, 0.30, 0.38, travel=6.0)
    subtitle_alpha, subtitle_y, _ = _reveal(progress, 0.33, 0.42, travel=6.0)
    if progress > 0.84:
        text_fade = 1.0 - _ease_in(_clamp((progress - 0.84) / 0.04, 0.0, 1.0))
        label_alpha *= text_fade
        title_alpha *= text_fade
        subtitle_alpha *= text_fade

    return AnimState(
        container_alpha=1.0, container_scale=1.0, quad_slide=0.0, bounce_y=0.0,
        bar_wipe=max(ring1_alpha, ring2_alpha, exit_ring1_alpha),
        icon_scale=badge_scale, icon_rotation=0.0, icon_alpha=badge_alpha,
        label_alpha=label_alpha, label_y=label_y,
        title_alpha=title_alpha, title_y=title_y,
        subtitle_alpha=subtitle_alpha, subtitle_y=subtitle_y,
        pill_alpha=0.0, pill_scale=1.0, shine=None, glow_pulse_active=door_t >= 1.0,
    ), door_t, max(ring1_alpha, exit_ring1_alpha), ring2_alpha


def _door_v2_slide_x(progress):
    """xbox_360_v2 only: how far (logical px, positive = toward screen
    center) the whole canvas should be shifted from its natural resting
    position at this point in the timeline.

    The badge sits near the LEFT edge of the canvas (so the pill has room
    to grow rightward out of it), which is well left of true screen center
    once the canvas itself is centered on screen (force_position:
    "bottom_center"). This returns the offset needed to pull the whole
    canvas back to the right, so the badge visually starts at bottom
    MIDDLE of the screen, then reads as "sliding left" as this value eases
    down to 0 -- and the reverse on the way out.

    It only moves during the two windows where _animation_state_door's own
    timeline already has the badge sitting alone with the pill still
    closed (0.07-0.12 entrance, 0.94-0.955 exit) -- i.e. exactly when a
    horizontal travel reads as "the circle slides in/out" rather than
    fighting the pill's own open/close motion, which always happens at
    the settled, centered (slide=0) position.
    """
    distance = CANVAS_W / 2.0 - (PAD_X + CARD_H / 2.0)
    if progress < 0.07:
        return distance
    if progress < 0.12:
        t = _ease_out((progress - 0.07) / 0.05)
        return distance * (1.0 - t)
    if progress < 0.94:
        return 0.0
    if progress < 0.955:
        t = _ease_in((progress - 0.94) / 0.015)
        return distance * t
    return distance


# Ring size multiplier (FINALLY_RING_SIZE / 50): 1.0 is the original look,
# 0 hides the rings, 2.0 doubles how far they spread. Applies to the badge
# halo rings, ping rings, ambient halo and pulse ring.
RING_SCALE = 1.0


def _fit_ring(cx, cy, r, margin=3.0):
    """Clamp a ring radius so it never pokes past the transparent canvas
    (which would slice it flat). Only matters for enlarged rings."""
    limit = min(cx, CANVAS_W - cx, cy, CANVAS_H - cy) - margin
    return min(r, max(limit, 0.0))


def _draw_ping_rings(ctx, cx, cy, icon_radius, accent, rings, glow_scale=1.0, shape="circle"):
    """Draws one or more expanding, fading 'sonar ping' rings centered on
    (cx, cy) -- these are the other circular glow-like effect (distinct
    from the ambient icon halo/pulse ring), so they respect the same
    "Icon glow" toggle/intensity setting via `glow_scale`; at 0 (glow
    off) they're skipped entirely. The 0.55x expansion factor is
    deliberately conservative: it keeps the ring's max radius well inside
    the card's own padding (PAD_X/PAD_Y) so it can never poke past the
    edge of the transparent canvas around the card and get its top/bottom
    sliced off -- which is exactly what a too-large 1.3x factor here used
    to do (visible as a flat-cut arc at both the entrance and exit ping).
    `rings` is a list of (alpha, local_progress) pairs."""
    if glow_scale <= 0 or RING_SCALE <= 0:
        return
    for ring_alpha, ring_progress in rings:
        if ring_alpha > 0:
            ring_r = icon_radius * (1.0 + 0.55 * RING_SCALE * _clamp(ring_progress / 0.05, 0.0, 1.0))
            ring_r = _fit_ring(cx, cy, ring_r)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], ring_alpha * glow_scale)
            ctx.set_line_width(3.0)
            _shape_path(ctx, shape, cx - ring_r, cy - ring_r, ring_r * 2, ring_r * 2, ring_r * 0.3)
            ctx.stroke()


def _animation_state_door_v2_extra(progress, base_icon_alpha):
    """Extra timeline on top of the shared door-wipe base (see
    _animation_state_door) for xbox_360_v2: an original reimagining of the
    classic reveal where a generic placeholder badge crossfades into the
    real achievement icon, and the text exits by sliding further up rather
    than just fading in place. Returns (placeholder_alpha, real_icon_alpha,
    exit_lift)."""
    if progress < 0.02:
        placeholder_frac, icon_frac = 0.0, 0.0
    elif progress < 0.16:
        placeholder_frac, icon_frac = 1.0, 0.0
    elif progress < 0.24:
        t = _ease_out((progress - 0.16) / 0.08)
        placeholder_frac, icon_frac = 1.0 - t, t
    else:
        placeholder_frac, icon_frac = 0.0, 1.0

    exit_lift = 0.0
    if progress > 0.86:
        exit_lift = -22.0 * _ease_in(_clamp((progress - 0.86) / 0.10, 0.0, 1.0))

    return placeholder_frac * base_icon_alpha, icon_frac * base_icon_alpha, exit_lift


def _make_surface_door_wipe(
    width, height, scale, title, subtitle, is_rare, progress, icon_path,
    gradient_start, gradient_end, circle_color, template, total_seconds,
    label_font_size, title_font_size, subtitle_font_size,
    glow_enabled=True, glow_intensity=50, gradient_direction="vertical",
    glow_normal_enabled=False, icon_gradient_active=False,
    percent=None,
):
    """Draws the door-wipe family of templates: a fixed circular badge at
    the left edge that pops in with a double 'ping', then a pill grows out
    to its right revealing the text -- see _animation_state_door above.
    xbox_360_v2 layers a placeholder-to-icon crossfade and a sliding text
    exit on top of this same shared engine (see
    _animation_state_door_v2_extra); xbox_360_classic just gets the plain
    version of every one of those (icon shown immediately, no crossfade,
    no extra exit slide) by using this function's defaults."""
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, width, height)
    ctx = cairo.Context(surface)
    ctx.set_operator(cairo.OPERATOR_CLEAR)
    ctx.paint()
    ctx.set_operator(cairo.OPERATOR_OVER)
    ctx.scale(scale, scale)

    anim, door_t, ring1_alpha, ring2_alpha = _animation_state_door(progress)
    variant = template.get("variant", "v1")
    if variant == "v2":
        placeholder_alpha, real_icon_alpha, exit_lift = _animation_state_door_v2_extra(
            progress, anim.icon_alpha
        )
    else:
        placeholder_alpha, real_icon_alpha, exit_lift = 0.0, anim.icon_alpha, 0.0

    mythic = bool(template.get("mythic"))
    if mythic:
        # Its own fixed look, whatever colors/template the user picked.
        gradient_start, gradient_end = MYTHIC_GRADIENT_START, MYTHIC_GRADIENT_END
        circle_color = MYTHIC_ACCENT
        is_rare = True
        placeholder_alpha, real_icon_alpha = 0.0, anim.icon_alpha
        title_font_size = min(title_font_size, 24)

    elapsed = progress * total_seconds
    accent = circle_color
    glow_scale = (glow_intensity / 50.0) if glow_enabled else 0.0

    x = float(PAD_X)
    y = PAD_Y
    card_h = CARD_H
    # The pill is a perfect circle (diameter == card_h) at rest (door_t=0),
    # then grows wider to the right while its height stays fixed -- so the
    # corner radius stays a constant card_h/2 throughout (never exceeding
    # half of whichever side is shorter, which is always card_h here).
    circle_d = card_h
    max_w = CARD_W
    cur_w = circle_d + (max_w - circle_d) * door_t
    # "badge_shape": "circle" (default -- round badge, pill-shaped card) or
    # "rounded_square" (xbox_360_v2_square -- rounded-square badge and a
    # rounded-rectangle card instead of a pill).
    badge_shape = template.get("badge_shape", "circle")
    radius = card_h / 2 if badge_shape == "circle" else card_h * 0.18
    badge_cx, badge_cy = x + circle_d / 2, y + card_h / 2
    icon_radius = circle_d / 2 - 14

    # Ping rings, centered on the badge, drawn before anything else so the
    # pill/badge fill sits on top of them.
    _draw_ping_rings(
        ctx, badge_cx, badge_cy, icon_radius, accent,
        ((ring1_alpha, progress), (ring2_alpha, progress - 0.02)),
        glow_scale=glow_scale, shape=badge_shape,
    )

    if anim.icon_alpha <= 0 and door_t <= 0:
        surface.flush()
        return surface

    # --- Pill body (only visible once the badge has started popping in) ---
    body_alpha = anim.icon_alpha
    if cur_w > 0 and body_alpha > 0:
        ctx.save()
        cx_pivot, cy_pivot = badge_cx, badge_cy
        ctx.translate(cx_pivot, cy_pivot)
        ctx.scale(max(anim.icon_scale, 0.001), max(anim.icon_scale, 0.001))
        ctx.translate(-cx_pivot, -cy_pivot)

        _shape_path(ctx, "rounded_square", x + 3, y + 4, cur_w, card_h, radius)
        ctx.set_source_rgba(0, 0, 0, 0.35 * body_alpha)
        ctx.fill()

        top = _blend((0.06, 0.09, 0.05), gradient_start[:3], 0.85)
        bottom = _blend((0.03, 0.05, 0.025), gradient_end[:3], 0.85)
        _set_gradient_source(
            ctx, x, y, cur_w, card_h, gradient_direction,
            top, bottom, 0.97 * body_alpha, 0.97 * body_alpha,
        )
        _shape_path(ctx, "rounded_square", x, y, cur_w, card_h, radius)
        ctx.fill()

        ctx.save()
        _shape_path(ctx, "rounded_square", x, y, cur_w, card_h, radius)
        ctx.clip()
        highlight = cairo.LinearGradient(x, y, x, y + card_h * 0.4)
        highlight.add_color_stop_rgba(0, 1, 1, 1, 0.08 * body_alpha)
        highlight.add_color_stop_rgba(1, 1, 1, 1, 0.0)
        ctx.set_source(highlight)
        ctx.rectangle(x, y, cur_w, card_h * 0.4)
        ctx.fill()

        # A rare achievement gets a single soft shine sweeping across the
        # pill once it's fully open, echoing the sparkle/shine flourish the
        # other rare templates use elsewhere in this file.
        if is_rare and variant == "v2" and door_t >= 1.0:
            sheen_period = 1.8 if (TIER == "ultra_rare" and not mythic) else 3.2
            shine_t = ((elapsed % sheen_period) / sheen_period)
            band_w = cur_w * 0.3
            band_x = x - band_w + shine_t * (cur_w + band_w * 2)
            sheen = cairo.LinearGradient(band_x, 0, band_x + band_w, 0)
            sheen.add_color_stop_rgba(0, 1, 1, 1, 0.0)
            sheen.add_color_stop_rgba(0.5, 1, 1, 1, (0.28 if mythic else 0.16) * body_alpha)
            sheen.add_color_stop_rgba(1, 1, 1, 1, 0.0)
            ctx.set_source(sheen)
            ctx.rectangle(x, y, cur_w, card_h)
            ctx.fill()
        ctx.restore()

        if (icon_gradient_active or PRESET_ACTIVE) and is_rare and door_t > 0:
            # Gold edge so rare unlocks stay recognizable when the card is
            # using icon-derived colors.
            edge_rgb = RARE_EDGE_GOLD
            _shape_path(ctx, "rounded_square", x + 1, y + 1, cur_w - 2, card_h - 2, radius)
            ctx.set_line_width(2.5)
            ctx.set_source_rgba(edge_rgb[0], edge_rgb[1], edge_rgb[2], 0.9 * door_t * body_alpha)
            ctx.stroke()

        if mythic and door_t > 0:
            _shape_path(ctx, "rounded_square", x + 1, y + 1, cur_w - 2, card_h - 2, radius)
            ctx.set_line_width(2.0)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.85 * door_t * body_alpha)
            ctx.stroke()

        # --- Badge circle + icon (always at the fixed left edge) ---
        if not mythic:
            backing_r = icon_radius + 3
            _shape_path(ctx, badge_shape, badge_cx - backing_r, badge_cy - backing_r,
                        backing_r * 2, backing_r * 2, backing_r * 0.3)
            ctx.set_source_rgba(0.05, 0.06, 0.05, body_alpha)
            ctx.fill()

        if mythic:
            if real_icon_alpha > 0:
                _draw_mythic_badge(ctx, badge_cx, badge_cy, icon_radius + 8, real_icon_alpha, elapsed)
                if door_t > 0:
                    _draw_sparkles(ctx, badge_cx, badge_cy, door_t * body_alpha, elapsed, accent)
        else:
            if placeholder_alpha > 0:
                _draw_placeholder(ctx, badge_cx, badge_cy, icon_radius, placeholder_alpha, accent, badge_shape)
            if real_icon_alpha > 0:
                _draw_icon(
                    ctx, icon_path, badge_cx, badge_cy, icon_radius, real_icon_alpha, accent,
                    scale=1.0, rotation=0.0, shape=badge_shape,
                )
        if not mythic and TIER == "ultra_rare" and door_t > 0 and (real_icon_alpha + placeholder_alpha) > 0:
            _draw_sparkles(ctx, badge_cx, badge_cy, door_t * body_alpha, elapsed, accent,
                           offsets=_SPARKLE_OFFSETS + _ULTRA_SPARKLE_OFFSETS)
        if (is_rare or glow_normal_enabled) and door_t > 0:
            if glow_scale > 0 and RING_SCALE > 0:
                # door_t itself is already a smoothly-eased 0->1->0 curve
                # (see _animation_state_door) tracking how open the pill
                # currently is -- using it directly here means the ring
                # eases in as the door opens and eases back out as it
                # closes, instead of snapping on the instant the door
                # finishes opening and snapping off the instant it starts
                # closing.
                pulse = 0.5 + 0.5 * math.sin(elapsed * 3.4)
                ctx.set_line_width(2.5)
                pulse_r = _fit_ring(badge_cx, badge_cy, icon_radius + (6 + pulse * 3) * RING_SCALE)
                _shape_path(ctx, badge_shape, badge_cx - pulse_r, badge_cy - pulse_r,
                            pulse_r * 2, pulse_r * 2, pulse_r * 0.3)
                ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.6 * glow_scale * door_t * body_alpha)
                ctx.stroke()
        ctx.restore()

    # --- Text, revealed once the door has mostly opened -------------------
    tx = x + circle_d + 22
    text_width = max(cur_w - circle_d - 44, 0)
    label_style = template["label_style"]
    label_text = _label_text(is_rare, label_style, TIER or None)
    if mythic:
        label_text = "\u2009".join(list(MYTHIC_LABEL))

    if text_width > 20:
        if anim.label_alpha > 0:
            label_clear = _top_badge_clearance(ctx, percent, template["font_family"], radius) if text_width > 220 else 0.0
            _text(ctx, label_text, tx, y + 26 + anim.label_y + exit_lift, max(label_font_size - 1, 8),
                  (_lighten(accent[0], 0.35), _lighten(accent[1], 0.35), _lighten(accent[2], 0.35), anim.label_alpha),
                  Pango.Weight.BOLD, max(text_width - label_clear, 60) if label_clear else text_width, template["font_family"])
        if anim.title_alpha > 0:
            _text(ctx, title or "Achievement Unlocked", tx, y + 50 + anim.title_y + exit_lift, title_font_size,
                  (1, 1, 1, anim.title_alpha), Pango.Weight.BOLD, text_width, template["font_family"])
        if subtitle and anim.subtitle_alpha > 0:
            subtitle_width = text_width
            if percent is not None and text_width > 220 and not PERCENT_AT_TOP:
                pill_extra = _pill_right_gap(radius) - 16.0
                subtitle_width = max(text_width - _percent_pill_width(ctx, percent, template["font_family"]) - 12 - pill_extra, 60)
            _text(ctx, subtitle, tx, y + 50 + title_font_size + 8 + anim.subtitle_y + exit_lift, max(subtitle_font_size - 2, 9),
                  (0.80, 0.90, 0.82, 0.92 * anim.subtitle_alpha), Pango.Weight.NORMAL, subtitle_width, template["font_family"],
                  max_lines=2 if PERCENT_AT_TOP else None)
        if percent is not None and text_width > 220:
            if PERCENT_AT_TOP:
                _draw_percent_pill(ctx, x + cur_w - _pill_right_gap(radius), 0.0, True, percent,
                                   anim.subtitle_alpha if subtitle else anim.title_alpha,
                                   False, template["font_family"], top_y=y + PERCENT_TOP_GAP + exit_lift)
            else:
                _draw_percent_pill(ctx, x + cur_w - _pill_right_gap(radius), y + card_h - 12 + exit_lift, True, percent,
                                   anim.subtitle_alpha if subtitle else anim.title_alpha,
                                   False, template["font_family"])

    surface.flush()
    return surface


def _draw_gear_polygon(ctx, cx, cy, outer_r, inner_r, teeth, rotation=0.0):
    ctx.new_sub_path()
    steps = teeth * 2
    for i in range(steps + 1):
        angle = rotation + (i * math.pi / teeth)
        r = outer_r if i % 2 == 0 else inner_r
        point_x = cx + r * math.cos(angle)
        point_y = cy + r * math.sin(angle)
        if i == 0:
            ctx.move_to(point_x, point_y)
        else:
            ctx.line_to(point_x, point_y)
    ctx.close_path()


def _draw_star_polygon(ctx, cx, cy, outer_r, inner_r, points=5, rotation=-math.pi / 2):
    ctx.new_sub_path()
    steps = points * 2
    for i in range(steps + 1):
        angle = rotation + (i * math.pi / points)
        r = outer_r if i % 2 == 0 else inner_r
        point_x = cx + r * math.cos(angle)
        point_y = cy + r * math.sin(angle)
        if i == 0:
            ctx.move_to(point_x, point_y)
        else:
            ctx.line_to(point_x, point_y)
    ctx.close_path()


def _draw_achievement_badge(ctx, cx, cy, radius, alpha, accent):
    """The default 'achievement unlocked' rosette shown whenever no
    game-specific achievement art is available. This is an original,
    abstract badge design (a rosette ring around a star) evoking the
    generic achievement-badge look used across modern game UIs, rather
    than a copy of any single platform's actual icon artwork."""
    r, g, b = accent[0], accent[1], accent[2]

    for i in range(3):
        if RING_SCALE <= 0:
            break
        glow_r = _fit_ring(cx, cy, radius * (1.0 + (0.30 + i * 0.24) * RING_SCALE))
        glow_alpha = (0.11 - i * 0.03) * alpha
        if glow_alpha <= 0:
            continue
        ctx.set_source_rgba(r, g, b, glow_alpha)
        ctx.arc(cx, cy, glow_r, 0, math.tau)
        ctx.fill()

    ctx.set_source_rgba(0.07, 0.08, 0.09, alpha)
    ctx.arc(cx, cy, radius * 1.02, 0, math.tau)
    ctx.fill()

    _draw_gear_polygon(ctx, cx, cy, radius, radius * 0.86, teeth=12)
    ring = cairo.LinearGradient(cx, cy - radius, cx, cy + radius)
    ring.add_color_stop_rgba(0, _lighten(r, 0.35), _lighten(g, 0.35), _lighten(b, 0.35), alpha)
    ring.add_color_stop_rgba(1, r * 0.55, g * 0.55, b * 0.55, alpha)
    ctx.set_source(ring)
    ctx.fill()

    ctx.set_source_rgba(0.09, 0.10, 0.115, alpha)
    ctx.arc(cx, cy, radius * 0.72, 0, math.tau)
    ctx.fill()

    ctx.set_line_width(max(1.5, radius * 0.045))
    ctx.set_source_rgba(r, g, b, 0.9 * alpha)
    ctx.arc(cx, cy, radius * 0.72, 0, math.tau)
    ctx.stroke()

    _draw_star_polygon(ctx, cx, cy, radius * 0.40, radius * 0.17)
    ctx.set_source_rgba(0.97, 0.98, 0.99, alpha)
    ctx.fill()


# Placeholder icon style, set from FINALLY_PLACEHOLDER_STYLE in main():
#   "auto"      -> the gear+star badge (original behavior)
#   "trophy"    -> a trophy cup
#   "game_icon" -> the game's own icon (PLACEHOLDER_ICON_PATH), trophy if none
PLACEHOLDER_STYLE = "auto"
PLACEHOLDER_ICON_PATH = ""


def _draw_trophy_badge(ctx, cx, cy, radius, alpha, accent):
    """Trophy cup on the same dark disc + accent ring as the default badge."""
    r, g, b = accent[0], accent[1], accent[2]

    for i in range(3):
        if RING_SCALE <= 0:
            break
        glow_r = _fit_ring(cx, cy, radius * (1.0 + (0.30 + i * 0.24) * RING_SCALE))
        glow_alpha = (0.11 - i * 0.03) * alpha
        if glow_alpha <= 0:
            continue
        ctx.set_source_rgba(r, g, b, glow_alpha)
        ctx.arc(cx, cy, glow_r, 0, math.tau)
        ctx.fill()

    ctx.set_source_rgba(0.09, 0.10, 0.115, alpha)
    ctx.arc(cx, cy, radius * 1.02, 0, math.tau)
    ctx.fill()
    ctx.set_line_width(max(1.5, radius * 0.045))
    ctx.set_source_rgba(r, g, b, 0.9 * alpha)
    ctx.arc(cx, cy, radius * 0.9, 0, math.tau)
    ctx.stroke()

    gold_hi = (1.0, 0.86, 0.42)
    gold_lo = (0.82, 0.55, 0.12)
    fill = cairo.LinearGradient(cx, cy - radius * 0.5, cx, cy + radius * 0.5)
    fill.add_color_stop_rgba(0, gold_hi[0], gold_hi[1], gold_hi[2], alpha)
    fill.add_color_stop_rgba(1, gold_lo[0], gold_lo[1], gold_lo[2], alpha)

    # Handles (drawn first so the cup body overlaps their inner ends).
    ctx.set_line_width(max(1.5, radius * 0.075))
    ctx.set_source(fill)
    for side in (-1, 1):
        ctx.new_sub_path()
        ctx.arc(cx + side * radius * 0.36, cy - radius * 0.20, radius * 0.15, 0, math.tau)
        ctx.stroke()

    # Cup body.
    ctx.new_path()
    ctx.move_to(cx - radius * 0.32, cy - radius * 0.42)
    ctx.line_to(cx + radius * 0.32, cy - radius * 0.42)
    ctx.curve_to(cx + radius * 0.32, cy - radius * 0.04, cx + radius * 0.17, cy + radius * 0.14, cx, cy + radius * 0.14)
    ctx.curve_to(cx - radius * 0.17, cy + radius * 0.14, cx - radius * 0.32, cy - radius * 0.04, cx - radius * 0.32, cy - radius * 0.42)
    ctx.close_path()
    ctx.set_source(fill)
    ctx.fill()

    # Stem and base.
    ctx.rectangle(cx - radius * 0.05, cy + radius * 0.12, radius * 0.10, radius * 0.20)
    ctx.set_source(fill)
    ctx.fill()
    ctx.rectangle(cx - radius * 0.22, cy + radius * 0.32, radius * 0.44, radius * 0.11)
    ctx.set_source(fill)
    ctx.fill()


def _draw_placeholder(ctx, cx, cy, radius, alpha, accent, shape="rounded_square"):
    """Whatever the user chose to show when there's no (or not yet a)
    achievement icon. Never recurses into _draw_icon."""
    style = PLACEHOLDER_STYLE
    if style == "auto" and "pixel_star" in ACTIVE_FX:
        _draw_pixel_star(ctx, cx, cy, radius, alpha)
        return
    if style == "trophy":
        _draw_trophy_badge(ctx, cx, cy, radius, alpha, accent)
        return
    if style == "game_icon":
        surface = _load_icon_surface(PLACEHOLDER_ICON_PATH, int(radius * 2))
        if surface is not None:
            ctx.save()
            _shape_path(ctx, shape, cx - radius, cy - radius, radius * 2, radius * 2, radius * 0.28)
            ctx.clip()
            ctx.set_source_surface(surface, cx - radius, cy - radius)
            ctx.paint_with_alpha(alpha)
            ctx.restore()
            return
        _draw_trophy_badge(ctx, cx, cy, radius, alpha, accent)
        return
    _draw_achievement_badge(ctx, cx, cy, radius, alpha, accent)


def _pick_gradient_colors(icon_path, use_game_art=False, game_art_path=""):
    """Colors for the icon-driven gradient. "Gradient from icon colors"
    uses the achievement icon; "Gradient from game artwork colors" uses the
    game's art (one shared palette per game), falling back to the
    achievement icon if the art can't be read. None means the caller uses
    the static configured colors."""
    extracted = None
    if use_game_art:
        extracted = _extract_icon_colors(game_art_path)
    if not extracted:
        extracted = _extract_icon_colors(icon_path)
    return extracted


# --- Mythic (100% complete) toast -------------------------------------
# Deliberately its own look, separate from the user's chosen template and
# colors: emerald card, mint laurel-wreath medallion around a faceted star.
MYTHIC_ACCENT = (0.42, 0.93, 0.66)
MYTHIC_GRADIENT_START = (0.05, 0.32, 0.16, 0.96)
MYTHIC_GRADIENT_END = (0.02, 0.17, 0.08, 0.96)
MYTHIC_LABEL = "100% COMPLETE"


def _draw_mythic_leaf(ctx, px, py, angle, length, width, color, alpha):
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(angle)
    ctx.move_to(0, 0)
    ctx.curve_to(length * 0.3, -width, length * 0.75, -width * 0.8, length, 0)
    ctx.curve_to(length * 0.75, width * 0.8, length * 0.3, width, 0, 0)
    ctx.close_path()
    ctx.set_source_rgba(color[0], color[1], color[2], alpha)
    ctx.fill()
    ctx.restore()


def _draw_mythic_badge(ctx, cx, cy, radius, alpha, elapsed):
    """Laurel-wreath medallion around a faceted four-point star. Original
    artwork drawn from paths; the star gently pulses."""
    mr, mg, mb = MYTHIC_ACCENT
    pulse = 0.5 + 0.5 * math.sin(elapsed * 2.6)

    # Soft halo (respects the Ring size setting).
    for i in range(3):
        if RING_SCALE <= 0:
            break
        halo_r = _fit_ring(cx, cy, radius * (1.0 + (0.22 + i * 0.20) * RING_SCALE))
        halo_a = (0.16 - i * 0.045) * alpha * (0.75 + 0.25 * pulse)
        if halo_a <= 0:
            continue
        ctx.set_source_rgba(mr, mg, mb, halo_a)
        ctx.arc(cx, cy, halo_r, 0, math.tau)
        ctx.fill()

    # Medallion disc + gradient rim.
    ctx.set_source_rgba(0.02, 0.15, 0.08, alpha)
    ctx.arc(cx, cy, radius * 0.80, 0, math.tau)
    ctx.fill()
    rim = cairo.LinearGradient(cx, cy - radius, cx, cy + radius)
    rim.add_color_stop_rgba(0, 0.80, 1.0, 0.88, alpha)
    rim.add_color_stop_rgba(1, 0.16, 0.62, 0.38, alpha)
    ctx.set_source(rim)
    ctx.set_line_width(max(2.0, radius * 0.07))
    ctx.arc(cx, cy, radius * 0.78, 0, math.tau)
    ctx.stroke()

    # Laurel wreath: nine leaves up each side, open at the top. The right
    # side is computed; the left is the same drawing mirrored.
    wreath_r = radius * 0.86
    leaves = 9
    for side in (1, -1):
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(side, 1)
        for i in range(leaves):
            t = i / (leaves - 1)
            ang = math.radians(84 - t * 130)
            px, py = wreath_r * math.cos(ang), wreath_r * math.sin(ang)
            leaf_angle = ang - math.pi / 2 + 0.55
            shade = (0.50 + 0.22 * t, 0.90 + 0.06 * t, 0.66 + 0.12 * t)
            _draw_mythic_leaf(ctx, px, py, leaf_angle, radius * 0.30, radius * 0.12, shade, alpha)
        ctx.restore()

    # Back star (dark green, eight points) behind the main star.
    _draw_star_polygon(ctx, cx, cy, radius * 0.60, radius * 0.31, points=8,
                       rotation=-math.pi / 2 + math.pi / 8)
    ctx.set_source_rgba(0.10, 0.52, 0.30, 0.95 * alpha)
    ctx.fill()

    # Main four-point star with a light-to-mint gradient.
    outer, inner = radius * 0.56, radius * 0.16
    _draw_star_polygon(ctx, cx, cy, outer, inner, points=4)
    body = cairo.LinearGradient(cx - outer, cy - outer, cx + outer, cy + outer)
    body.add_color_stop_rgba(0, 0.96, 1.0, 0.98, alpha)
    body.add_color_stop_rgba(1, 0.42, 0.84, 0.60, alpha)
    ctx.set_source(body)
    ctx.fill()

    # Facets: one darker triangle per point for the cut-gem look.
    for k in range(4):
        a0 = -math.pi / 2 + k * math.pi / 2
        a1 = a0 + math.pi / 4
        ctx.move_to(cx, cy)
        ctx.line_to(cx + outer * math.cos(a0), cy + outer * math.sin(a0))
        ctx.line_to(cx + inner * 1.6 * math.cos(a1), cy + inner * 1.6 * math.sin(a1))
        ctx.close_path()
        ctx.set_source_rgba(0.08, 0.45, 0.28, 0.30 * alpha)
        ctx.fill()

    # Bright center gem that shimmers.
    gem = radius * 0.13
    ctx.move_to(cx, cy - gem)
    ctx.line_to(cx + gem, cy)
    ctx.line_to(cx, cy + gem)
    ctx.line_to(cx - gem, cy)
    ctx.close_path()
    ctx.set_source_rgba(1, 1, 1, (0.80 + 0.20 * pulse) * alpha)
    ctx.fill()


def _draw_rare_corner_badge(ctx, cx, cy, radius, alpha, accent):
    r, g, b = accent[0], accent[1], accent[2]
    ctx.set_source_rgba(0.06, 0.07, 0.05, alpha)
    ctx.arc(cx, cy, radius + 2.5, 0, math.tau)
    ctx.fill()
    _draw_star_polygon(ctx, cx, cy, radius, radius * 0.42, points=4)
    ctx.set_source_rgba(_lighten(r, 0.2), _lighten(g, 0.2), _lighten(b, 0.2), alpha)
    ctx.fill()


_SPARKLE_OFFSETS = (
    (-40, -52, 0.0, 5.0),
    (46, -56, 1.7, 6.2),
    (60, 34, 3.1, 4.6),
    (-52, 40, 4.4, 5.6),
)


# Extra sparkles that only ultra rare unlocks get, on top of the usual four.
_ULTRA_SPARKLE_OFFSETS = (
    (-64, -18, 0.9, 6.8),
    (68, -12, 2.3, 5.2),
    (-28, 62, 3.7, 6.0),
    (24, 64, 5.1, 4.8),
    (-70, 14, 1.4, 5.9),
    (72, 20, 4.0, 6.4),
    (2, -66, 2.8, 5.5),
    (-58, -50, 0.4, 4.9),
)


RARE_EDGE_GOLD = (1.0, 0.78, 0.25)


def _percent_text(percent):
    return "<0.1% of players" if percent < 0.1 else f"{percent:.1f}% of players"


# Size of the unlock-percentage badge as a multiplier (FINALLY_PERCENT_SIZE / 100).
PERCENT_SCALE = 1.0
# Where the badge sits: False = bottom corner (the original layout), True = top
# right corner. Top right frees the whole description line, so descriptions
# get the full width and may wrap onto two lines instead of ending in "...".
# Set from FINALLY_PERCENT_POSITION in main().
PERCENT_AT_TOP = False
PERCENT_TOP_GAP = 12.0


def _top_badge_clearance(ctx, percent, font_family, radius):
    """Width to keep clear at the right end of the label line when the badge
    is in the top right corner (0 in the default bottom layout)."""
    if not PERCENT_AT_TOP or percent is None:
        return 0.0
    return _percent_pill_width(ctx, percent, font_family) + 12 + (_pill_right_gap(radius) - 16.0)


def _percent_pill_width(ctx, percent, font_family):
    if percent is None:
        return 0
    tw, _ = _measure_text(ctx, _percent_text(percent), 12 * PERCENT_SCALE, Pango.Weight.BOLD, font_family)
    return tw + 20 * PERCENT_SCALE


def _pill_right_gap(radius, base=16.0, bottom_gap=12.0, margin=5.0):
    """How far in from the card's right edge the unlock-percentage badge
    must sit so its bottom-right corner stays inside the card's rounded
    corner. Small radii keep the usual 16px; a fully rounded pill end
    (radius 76) needs about 45px, otherwise the badge pokes out through
    the curve."""
    inner = radius - margin
    dy = radius - bottom_gap
    room = inner * inner - dy * dy
    if room <= 0:
        return max(base, float(radius))
    return max(base, radius - math.sqrt(room))


def _draw_percent_pill(ctx, anchor_x, bottom_y, align_right, percent, alpha, light_text, font_family, top_y=None):
    """Small rounded badge with the achievement's global unlock percentage,
    anchored to a bottom corner of the card (or, with `top_y`, hanging from
    the top edge at that y)."""
    if alpha <= 0 or percent is None:
        return
    text = _percent_text(percent)
    size = 12 * PERCENT_SCALE
    tw, th = _measure_text(ctx, text, size, Pango.Weight.BOLD, font_family)
    pad_x, pad_y = 10 * PERCENT_SCALE, 4 * PERCENT_SCALE
    pw, ph = tw + pad_x * 2, th + pad_y * 2
    px = anchor_x - pw if align_right else anchor_x
    py = bottom_y - ph if top_y is None else top_y
    _rounded_rect(ctx, px, py, pw, ph, ph / 2)
    if light_text:
        ctx.set_source_rgba(0, 0, 0, 0.08 * alpha)
    else:
        ctx.set_source_rgba(1, 1, 1, 0.10 * alpha)
    ctx.fill()
    color = (0.25, 0.26, 0.28, alpha) if light_text else (0.86, 0.88, 0.91, 0.9 * alpha)
    _text(ctx, text, px + pad_x, py + pad_y, size, color, Pango.Weight.BOLD, None, font_family)


def _draw_sparkles(ctx, cx, cy, alpha, elapsed, accent, offsets=None):
    r, g, b = accent[0], accent[1], accent[2]
    for dx, dy, phase, speed in (offsets or _SPARKLE_OFFSETS):
        twinkle = 0.5 + 0.5 * math.sin(elapsed * speed + phase)
        a = alpha * twinkle * 0.85
        if a <= 0.02:
            continue
        size = 3.0 + twinkle * 2.4
        sx, sy = cx + dx, cy + dy
        ctx.set_source_rgba(_lighten(r, 0.3), _lighten(g, 0.3), _lighten(b, 0.3), a)
        ctx.move_to(sx - size, sy)
        ctx.line_to(sx, sy - size)
        ctx.line_to(sx + size, sy)
        ctx.line_to(sx, sy + size)
        ctx.close_path()
        ctx.fill()


def _draw_icon(ctx, icon_path, cx, cy, radius, alpha, accent, scale=1.0, rotation=0.0, shape="rounded_square"):
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.scale(max(scale, 0.001), max(scale, 0.001))
    ctx.translate(-cx, -cy)

    icon_surface = _load_icon_surface(icon_path, int(radius * 2))
    if icon_surface is None:
        _draw_placeholder(ctx, cx, cy, radius, alpha, accent, shape)
        ctx.restore()
        return

    corner = radius * 0.28
    _shape_path(ctx, shape, cx - radius, cy - radius, radius * 2, radius * 2, corner)
    ctx.clip()
    ctx.set_source_surface(icon_surface, cx - radius, cy - radius)
    ctx.paint_with_alpha(alpha)
    ctx.restore()


# (path, size) -> cairo.ImageSurface, or None for "couldn't load". The icon
# used to be read from disk, decoded, rescaled and converted to a Cairo
# source on *every frame* (~60x a second for the whole toast). The file
# never changes during a toast, so it's now done once and reused.
_ICON_SURFACE_CACHE = {}


def _load_icon_surface(icon_path, size):
    if not icon_path or size <= 0:
        return None
    key = (icon_path, size)
    if key in _ICON_SURFACE_CACHE:
        return _ICON_SURFACE_CACHE[key]
    surface = None
    try:
        if os.path.exists(icon_path):
            pixbuf = None
            # Wide images (the game's capsule/header art) used to be
            # squashed into a square. Center-crop those instead; square
            # icons take the original path untouched.
            try:
                info = GdkPixbuf.Pixbuf.get_file_info(icon_path)
                iw, ih = int(info[1]), int(info[2])
                if iw > 0 and ih > 0 and abs(iw / ih - 1.0) > 0.03:
                    full = GdkPixbuf.Pixbuf.new_from_file(icon_path)
                    k = size / float(min(iw, ih))
                    sw, sh = max(size, int(round(iw * k))), max(size, int(round(ih * k)))
                    scaled = full.scale_simple(sw, sh, GdkPixbuf.InterpType.BILINEAR)
                    pixbuf = scaled.new_subpixbuf((sw - size) // 2, (sh - size) // 2, size, size)
            except Exception:
                pixbuf = None
            if pixbuf is None:
                pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(icon_path, size, size, False)
            surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, size, size)
            icon_ctx = cairo.Context(surface)
            Gdk.cairo_set_source_pixbuf(icon_ctx, pixbuf, 0, 0)
            icon_ctx.paint()
            surface.flush()
    except Exception:
        surface = None
    _ICON_SURFACE_CACHE[key] = surface
    return surface


CARD_W = 680
CARD_H = 152
# Symmetric padding around the card for shadow/glow bleed only. Unlike the
# old layout, this padding is the SAME on every side, so the visible card is
# always dead-center in the texture -- and therefore dead-center on screen,
# regardless of animation state. All slide-in/out motion is handled at the
# GL-quad level (see draw_card in main()), not baked into this texture.
PAD_X = 60
PAD_Y = 54
CANVAS_W = CARD_W + PAD_X * 2
CANVAS_H = CARD_H + PAD_Y * 2

# Six on-screen anchors the user can choose between. h/v describe which
# screen edge (or center) the card rests against; slide_dx/slide_dy is the
# unit direction the card travels in as it slides in/out (see draw_card):
# corner positions slide in from their nearest side edge, "*_center"
# positions slide in from the top/bottom edge instead, which reads more
# naturally than a sideways slide for a horizontally-centered toast.
POSITIONS = {
    "top_left": dict(h="left", v="top", slide_dx=-1, slide_dy=0),
    "top_center": dict(h="center", v="top", slide_dx=0, slide_dy=-1),
    "top_right": dict(h="right", v="top", slide_dx=1, slide_dy=0),
    "bottom_left": dict(h="left", v="bottom", slide_dx=-1, slide_dy=0),
    "bottom_center": dict(h="center", v="bottom", slide_dx=0, slide_dy=1),
    "bottom_right": dict(h="right", v="bottom", slide_dx=1, slide_dy=0),
}
DEFAULT_POSITION = "bottom_center"
EDGE_MARGIN_X = 40
EDGE_MARGIN_Y = 70


def _resolve_position(name):
    return POSITIONS.get((name or "").strip().lower(), POSITIONS[DEFAULT_POSITION])


# Eight distinct, original card designs. Each one only changes *shape,
# layout, typography and accent treatment* -- the colors the user picked in
# the settings panel (gradient_start/end, circle_color) still tint whichever
# template they choose, and the shared animation/positioning engine above
# (staggered reveal, centered geometry, slide direction) applies to all of
# them equally. None of these reproduce any platform's actual logo, button
# glyphs, or icon artwork -- they're original layouts loosely evoking each
# platform's *vibe* (palette/shape language), the same way the existing
# Xbox rosette badge is an original abstract design, not a copied asset.
TEMPLATES = {
    "xbox_modern": dict(
        label="Xbox Modern",
        corner_radius=16,
        background="glass",
        accent="left_bar",
        icon_shape="rounded_square",
        # The icon artwork itself stays in its rounded-square frame, but
        # the halo/ring around it read as circular, matching the Xbox 360
        # templates' look.
        glow_shape="circle",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=False,
    ),
    "playstation_trophy": dict(
        label="Trophy Case",
        corner_radius=24,
        background="glass_diagonal",
        accent="top_line",
        icon_shape="circle",
        icon_side="right",
        label_style="tight_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=False,
    ),
    "switch_bold": dict(
        label="Handheld Bold",
        corner_radius=20,
        background="split_block",
        accent="block_fill",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="pill_caps",
        font_family="DejaVu Sans",
        border=("solid", 3),
        compact=False,
    ),
    "steam_flat": dict(
        label="Steam Flat",
        corner_radius=6,
        background="flat",
        accent="corner_ribbon",
        icon_shape="square_sharp",
        icon_side="left",
        label_style="caps",
        font_family="DejaVu Sans",
        border=("hairline", 1),
        compact=True,
    ),
    "material_minimal": dict(
        label="Material Minimal",
        corner_radius=28,
        background="minimal",
        accent="icon_glow_only",
        icon_shape="circle",
        icon_side="left",
        label_style="small_tight",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
    ),
    "retro_arcade": dict(
        label="Retro Arcade",
        corner_radius=3,
        background="scanline",
        accent="pixel_border",
        icon_shape="square_sharp",
        icon_side="left",
        label_style="bracket",
        font_family="DejaVu Sans Mono",
        border=("thick", 3),
        compact=True,
    ),
    "chat_toast": dict(
        label="Chat Toast",
        corner_radius=14,
        background="flat_dark",
        accent="avatar_ring",
        icon_shape="circle",
        icon_side="left",
        label_style="small_tight",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
    ),
    "cyber_glass": dict(
        label="Cyber Glass",
        corner_radius=16,
        background="glass_neon",
        accent="outline_glow",
        icon_shape="hex",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=("neon", 2),
        compact=False,
    ),
    "xbox_360_classic": dict(
        label="Xbox 360 Classic",
        corner_radius=0,
        background="classic_solid",
        accent="none",
        icon_shape="circle",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
        # Custom reveal, not the shared card-slide animation: see
        # _animation_state_door/_make_surface_door_wipe. "slide": False
        # keeps the GL-quad entrance/exit slide (see draw_card in main())
        # from also being applied on top of the door-wipe reveal.
        layout="door_wipe",
        slide=False,
    ),
    "xbox_360_v2": dict(
        label="Xbox 360 Classic v2",
        corner_radius=0,
        background="classic_solid",
        accent="none",
        icon_shape="circle",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
        # Same door-wipe engine as xbox_360_classic (see
        # _make_surface_door_wipe), but with "variant": "v2" turned on:
        # the badge shows a placeholder that crossfades into the real icon
        # before the door opens, and the text exits by sliding further up
        # rather than just fading in place -- an original reimagining of
        # the classic double-ping-then-reveal toast.
        layout="door_wipe",
        slide=False,
        variant="v2",
        # This template always starts/ends at bottom-center of the screen
        # regardless of the user's chosen position setting -- see
        # _door_v2_slide_x below for the badge's own left/right travel.
        force_position="bottom_center",
    ),
    "xbox_360_v2_square": dict(
        label="Xbox 360 Classic v2 (Square)",
        corner_radius=0,
        background="classic_solid",
        accent="none",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
        # Identical choreography to xbox_360_v2 (door-wipe engine, v2
        # crossfade, bottom-center start sliding left and back), but with
        # a rounded-square badge and a rounded-rectangle card instead of a
        # circular badge and pill.
        layout="door_wipe",
        slide=False,
        variant="v2",
        badge_shape="rounded_square",
        force_position="bottom_center",
    ),
    "mythic_completion": dict(
        label="Pinnacle Completion",
        corner_radius=0,
        background="classic_solid",
        accent="none",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
        icon_gradient=False,
        # Shown only when every achievement in a game is unlocked (see
        # main.py); not offered in the template picker. Same door-wipe
        # choreography as xbox_360_v2_square, with its own emerald look.
        layout="door_wipe",
        slide=False,
        variant="v2",
        badge_shape="rounded_square",
        force_position="bottom_center",
        mythic=True,
    ),
    "game_art": dict(
        label="Game Art Blur",
        corner_radius=16,
        background="game_art",
        accent="none",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=("hairline", 1),
        compact=False,
    ),
    "win11_glass": dict(
        label="Fluent Glass",
        corner_radius=20,
        background="glass",
        accent="top_line",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="tight_caps",
        font_family="DejaVu Sans",
        border=("hairline", 1),
        compact=False,
    ),
    "discord_bar": dict(
        label="Chat Bar",
        corner_radius=14,
        background="flat_dark",
        accent="avatar_ring",
        icon_shape="circle",
        icon_side="left",
        label_style="small_tight",
        font_family="DejaVu Sans",
        border=None,
        compact=True,
        # Always appears like a system notification banner at the top of
        # the screen, regardless of the user's chosen position setting.
        force_position="top_center",
    ),
    "vaporwave": dict(
        label="Vaporwave",
        corner_radius=6,
        background="vaporwave",
        accent="outline_glow",
        icon_shape="hex",
        icon_side="left",
        label_style="spaced_caps",
        font_family="DejaVu Sans",
        border=("neon", 2),
        compact=False,
    ),
    "light_card": dict(
        label="Paper Light",
        corner_radius=18,
        background="light_card",
        accent="left_bar",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="tight_caps",
        font_family="DejaVu Sans",
        border=None,
        compact=False,
        # The one template so far with a light/cream body -- needs dark
        # text instead of the light text every other template uses.
        light_text=True,
        # Excluded from "Gradient from icon colors": a vivid icon-derived
        # gradient on a light card would fight the dark text's contrast.
        icon_gradient=False,
    ),
    "wood_plaque": dict(
        label="Trophy Plaque",
        corner_radius=10,
        background="wood_plaque",
        accent="none",
        icon_shape="rounded_square",
        icon_side="left",
        label_style="tight_caps",
        font_family="DejaVu Sans",
        border=("solid", 3),
        compact=False,
    ),
    "terminal_hacker": dict(
        label="Terminal",
        corner_radius=0,
        background="terminal",
        accent="none",
        icon_shape="square_sharp",
        icon_side="left",
        label_style="bracket",
        font_family="DejaVu Sans Mono",
        border=("hairline", 1),
        compact=True,
    ),
}
DEFAULT_TEMPLATE = "xbox_modern"


# ---------------------------------------------------------------------------
# Template preset colors ("Use each template's own colors" setting).
#
# One built-in palette per template, loosely inspired by the look of the
# platform each template evokes (approximations of brand colors, not any
# platform's artwork). (top gradient, bottom gradient, accent) as hex. When
# the setting is on these replace the user's gradient/circle colors, the
# gradient direction, and both "gradient from ..." options.
# ---------------------------------------------------------------------------
TEMPLATE_PRESET_COLORS = {
    "xbox_modern": ("#124D18", "#072A0C", "#52B043"),
    "xbox_360_classic": ("#3A3D3A", "#1E201E", "#8CC63F"),
    "xbox_360_v2": ("#3A3D3A", "#1E201E", "#8CC63F"),
    "xbox_360_v2_square": ("#3A3D3A", "#1E201E", "#8CC63F"),
    "playstation_trophy": ("#0A3A82", "#041C45", "#0070D1"),
    "switch_bold": ("#2B2F3A", "#191C24", "#FF3C4E"),
    "steam_flat": ("#2A475E", "#1B2838", "#66C0F4"),
    "material_minimal": ("#2B2930", "#1D1B20", "#D0BCFF"),
    "retro_arcade": ("#1A0B3D", "#0A0520", "#FFD400"),
    "chat_toast": ("#2C2C2E", "#1C1C1E", "#0A84FF"),
    "cyber_glass": ("#170B3B", "#080522", "#00F0FF"),
    "win11_glass": ("#2D2D2D", "#1F1F1F", "#4CC2FF"),
    "discord_bar": ("#313338", "#2B2D31", "#5865F2"),
    "vaporwave": ("#6A26B0", "#095A80", "#FF8AD8"),
    "light_card": ("#FFF8E7", "#EADFC6", "#E8830C"),
    "wood_plaque": ("#6B4423", "#33200F", "#D4A24C"),
    "terminal_hacker": ("#05140A", "#020A05", "#33FF66"),
    "game_art": ("#0B0F14", "#040608", "#7CC7FF"),
}
# Set from FINALLY_TEMPLATE_COLORS in main(); read by the card drawing code.
PRESET_ACTIVE = False


def _hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def _resolve_template_name(name):
    key = (name or "").strip().lower()
    return key if key in TEMPLATES else DEFAULT_TEMPLATE


def _template_preset(name):
    """((r,g,b) top, (r,g,b) bottom, (r,g,b) accent) for a template, or None
    (the completion popup, unknown names)."""
    entry = TEMPLATE_PRESET_COLORS.get(_resolve_template_name(name))
    if entry is None:
        return None
    return tuple(_hex_rgb(v) for v in entry)


def _apply_preset_colors(enabled, template_name, gradient_start, gradient_end, circle_color, gradient_direction):
    """Returns (active, start, end, circle, direction). With the setting on
    and a palette for this template, the palette replaces the user's colors
    (keeping their card opacity) and the gradient direction is reset to
    vertical; otherwise everything is returned unchanged."""
    if not enabled:
        return False, gradient_start, gradient_end, circle_color, gradient_direction
    preset = _template_preset(template_name)
    if preset is None:
        return False, gradient_start, gradient_end, circle_color, gradient_direction
    return (
        True,
        (*preset[0], gradient_start[3]),
        (*preset[1], gradient_end[3]),
        (*preset[2], 1.0),
        "vertical",
    )


def _resolve_template(name):
    return TEMPLATES.get((name or "").strip().lower(), TEMPLATES[DEFAULT_TEMPLATE])


GRADIENT_DIRECTIONS = ("vertical", "left_right", "right_left", "solid")
DEFAULT_GRADIENT_DIRECTION = "vertical"


def _resolve_gradient_direction(name):
    name = (name or "").strip().lower()
    return name if name in GRADIENT_DIRECTIONS else DEFAULT_GRADIENT_DIRECTION


def _set_gradient_source(ctx, x, y, w, h, direction, top_rgb, bottom_rgb, alpha_top, alpha_bottom):
    """Sets ctx's fill source to either a directional gradient or a flat
    solid color, per the user's "Gradient direction" setting:
      "vertical"   -- top-to-bottom (the original, and still default, look)
      "left_right" -- left-to-right
      "right_left" -- right-to-left
      "solid"      -- one flat color (the midpoint blend of the two
                      configured colors), no gradient at all
    top_rgb/bottom_rgb are (r, g, b) triples; alpha_top/alpha_bottom are
    whatever alpha would apply at each end of the gradient. This only
    changes the *axis* of a template's body fill -- each template's own
    colors and alpha treatment are untouched.
    """
    if direction == "solid":
        r = (top_rgb[0] + bottom_rgb[0]) / 2
        g = (top_rgb[1] + bottom_rgb[1]) / 2
        b = (top_rgb[2] + bottom_rgb[2]) / 2
        a = (alpha_top + alpha_bottom) / 2
        ctx.set_source_rgba(r, g, b, a)
        return
    if direction == "left_right":
        grad = cairo.LinearGradient(x, y, x + w, y)
    elif direction == "right_left":
        grad = cairo.LinearGradient(x + w, y, x, y)
    else:  # "vertical"
        grad = cairo.LinearGradient(x, y, x, y + h)
    grad.add_color_stop_rgba(0, top_rgb[0], top_rgb[1], top_rgb[2], alpha_top)
    grad.add_color_stop_rgba(1, bottom_rgb[0], bottom_rgb[1], bottom_rgb[2], alpha_bottom)
    ctx.set_source(grad)


# Rarity tier of the current toast ("uncommon" / "rare" / "ultra_rare", or ""),
# set from FINALLY_TIER in main(). Drives the label wording and, for ultra
# rare, extra sparkles and a longer shine.
TIER = ""

_TIER_NAMES = {"uncommon": "UNCOMMON", "ultra_rare": "ULTRA RARE"}


def _tier_label(style, tier):
    """Label for the tiers that don't already have their own wording
    ("rare" keeps each style's existing rare label)."""
    name = _TIER_NAMES[tier]
    table = {
        "spaced_caps": (f"{name} ACHIEVEMENT", True),
        "tight_caps": (f"{name} TROPHY", False),
        "pill_caps": (f"{name} UNLOCK!", False),
        "caps": (f"{name} ACHIEVEMENT", False),
        "small_tight": (f"{name.capitalize()} achievement", False),
        "bracket": (f"[{name} UNLOCK]", False),
    }
    text, spaced = table.get(style, table["spaced_caps"])
    if spaced:
        text = "\u2009".join(list(text))
    return text


def _label_text(is_rare, style, tier=None):
    """Each template phrases its eyebrow label a little differently (own
    wording + spacing), not just a re-colored copy of the same string --
    small thing, but it's part of what makes each template feel like its
    own design rather than a Xbox card with a different border. Font size
    is a user preference now (see FINALLY_LABEL_SIZE), not baked in here."""
    if tier in _TIER_NAMES:
        return _tier_label(style, tier)
    table = {
        "spaced_caps": ("RARE ACHIEVEMENT UNLOCKED" if is_rare else "ACHIEVEMENT UNLOCKED", True),
        "tight_caps": ("RARE TROPHY UNLOCKED" if is_rare else "TROPHY UNLOCKED", False),
        "pill_caps": ("RARE UNLOCK!" if is_rare else "UNLOCKED!", False),
        "caps": ("RARE ACHIEVEMENT" if is_rare else "ACHIEVEMENT UNLOCKED", False),
        "small_tight": ("Rare achievement" if is_rare else "New achievement", False),
        "bracket": ("[RARE UNLOCK]" if is_rare else "[ACHIEVEMENT]", False),
    }
    text, spaced = table.get(style, table["spaced_caps"])
    if spaced:
        text = "\u2009".join(list(text))
    return text


def _draw_template_border(ctx, shape, x, y, w, h, radius, alpha, accent, border, glow_scale=1.0):
    """Draws the outer stroke each template's `border` config asks for, on
    top of everything else. `border` is (kind, width) or None. `glow_scale`
    (from the "Glow" setting) only affects the "neon" kind's soft widening
    halo strokes -- the crisp bright line on top is always drawn, so
    turning glow off leaves a clean outline rather than no border at all."""
    if not border:
        return
    kind, width = border
    r, g, b = accent[0], accent[1], accent[2]

    if kind == "hairline":
        _shape_path(ctx, shape, x, y, w, h, radius)
        ctx.set_line_width(width)
        ctx.set_source_rgba(1, 1, 1, 0.10 * alpha)
        ctx.stroke()
    elif kind == "solid":
        _shape_path(ctx, shape, x, y, w, h, radius)
        ctx.set_line_width(width)
        ctx.set_source_rgba(r, g, b, 0.9 * alpha)
        ctx.stroke()
    elif kind == "thick":
        # A blocky "pixel art" double outline: a bright accent stroke with
        # a thin dark inset line just inside it for contrast.
        _shape_path(ctx, shape, x, y, w, h, radius)
        ctx.set_line_width(width)
        ctx.set_source_rgba(r, g, b, 0.95 * alpha)
        ctx.stroke()
        inset = width + 2
        _shape_path(ctx, shape, x + inset, y + inset, w - inset * 2, h - inset * 2, max(radius - inset, 0))
        ctx.set_line_width(1.5)
        ctx.set_source_rgba(0, 0, 0, 0.5 * alpha)
        ctx.stroke()
    elif kind == "neon":
        # Soft glow built from several widening, fading strokes, plus one
        # crisp bright line on top.
        if glow_scale > 0:
            for i in range(4, 0, -1):
                _shape_path(ctx, shape, x, y, w, h, radius)
                ctx.set_line_width(width + i * 3)
                ctx.set_source_rgba(r, g, b, 0.05 * glow_scale * alpha)
                ctx.stroke()
        _shape_path(ctx, shape, x, y, w, h, radius)
        ctx.set_line_width(width)
        ctx.set_source_rgba(_lighten(r, 0.4), _lighten(g, 0.4), _lighten(b, 0.4), 0.9 * alpha)
        ctx.stroke()


# ---------------------------------------------------------------------------
# Per-template flourishes ("Template effects" setting).
#
# Extra, template-specific touches layered on the shared card engine: typing
# text, animated backgrounds, glitches, screws, and so on. Each is a small
# self-contained drawing routine keyed by a name in TEMPLATE_FX; a template
# with no entry (and any template when the setting is off) draws exactly as
# before. All of it is drawn with paths -- no image assets.
# ---------------------------------------------------------------------------
FX_ENABLED = True
GAME_NAME = ""
ACTIVE_FX = ()

TEMPLATE_FX = {
    "retro_arcade": ("typewriter", "crt_sweep", "pixel_star"),
    "terminal_hacker": ("typewriter", "prompt", "glitch"),
    "chat_toast": ("typing_dots", "bubble", "timestamp"),
    "vaporwave": ("sun_grid", "chroma_text"),
    "wood_plaque": ("wood_grain", "engraved", "screws", "serif"),
    "switch_bold": ("bounce", "hatch"),
    "playstation_trophy": ("drop_in", "trophy_ghost"),
    "cyber_glass": ("scan_sweep", "hex_pulse", "glitch"),
    "win11_glass": ("app_header",),
    "steam_flat": ("progress_line",),
    "material_minimal": ("progress_line",),
    "light_card": ("edge_stripe",),
    "discord_bar": ("status_dot",),
}
for _fx_name, _fx_template in TEMPLATES.items():
    _fx_template.setdefault("fx", TEMPLATE_FX.get(_fx_name, ()))


def _slide_shift(template, anim, overlay_scale, position):
    """Quad slide offset (x, y). Templates flagged "drop_in" always enter
    from the top edge, whatever screen position is chosen."""
    if not template.get("slide", True):
        return 0.0, 0.0
    if FX_ENABLED and "drop_in" in template.get("fx", ()):
        return 0.0, -anim.quad_slide * overlay_scale
    return (
        anim.quad_slide * overlay_scale * position["slide_dx"],
        anim.quad_slide * overlay_scale * position["slide_dy"],
    )


def _typed(text, progress, start, end):
    """The part of `text` typed so far, and whether typing is still going."""
    if not text:
        return "", False
    t = _clamp((progress - start) / max(end - start, 1e-6), 0.0, 1.0)
    return text[: int(round(len(text) * t))], t < 1.0


def _glitch_amount(progress, elapsed):
    """0..1 glitch strength: a burst as the title arrives, then a brief
    twitch about every 1.7 seconds while it's on screen."""
    if 0.20 <= progress < 0.25:
        return 1.0 - (progress - 0.20) / 0.05
    if 0.40 < progress < 0.80 and (elapsed * 0.6) % 1.0 < 0.05:
        return 0.7
    return 0.0


def _text_ghosts(ctx, text, x, y, size, weight, width, family, ghosts, max_lines=None):
    for dx, dy, color in ghosts:
        _text(ctx, text, x + dx, y + dy, size, color, weight, width, family, max_lines=max_lines)


def _trophy_silhouette(ctx, cx, cy, r, rgba):
    """Flat trophy-cup shape (same outline as the trophy placeholder)."""
    ctx.set_source_rgba(*rgba)
    ctx.set_line_width(max(1.5, r * 0.075))
    for side in (-1, 1):
        ctx.new_sub_path()
        ctx.arc(cx + side * r * 0.36, cy - r * 0.20, r * 0.15, 0, math.tau)
        ctx.stroke()
    ctx.new_path()
    ctx.move_to(cx - r * 0.32, cy - r * 0.42)
    ctx.line_to(cx + r * 0.32, cy - r * 0.42)
    ctx.curve_to(cx + r * 0.32, cy - r * 0.04, cx + r * 0.17, cy + r * 0.14, cx, cy + r * 0.14)
    ctx.curve_to(cx - r * 0.17, cy + r * 0.14, cx - r * 0.32, cy - r * 0.04, cx - r * 0.32, cy - r * 0.42)
    ctx.close_path()
    ctx.fill()
    ctx.rectangle(cx - r * 0.05, cy + r * 0.12, r * 0.10, r * 0.20)
    ctx.fill()
    ctx.rectangle(cx - r * 0.22, cy + r * 0.32, r * 0.44, r * 0.11)
    ctx.fill()


_PIXEL_STAR = (
    "....#....",
    "....#....",
    "...###...",
    "#########",
    ".#######.",
    "..#####..",
    "..#####..",
    ".###.###.",
    ".##...##.",
)


def _draw_pixel_star(ctx, cx, cy, radius, alpha):
    """Blocky 9x9 pixel-art star, the Retro Arcade placeholder."""
    cell = radius * 1.55 / len(_PIXEL_STAR)
    left = cx - cell * len(_PIXEL_STAR[0]) / 2
    top = cy - cell * len(_PIXEL_STAR) / 2
    for layer, (dx, dy, color) in enumerate((
        (cell * 0.45, cell * 0.45, (0.0, 0.0, 0.0, 0.38 * alpha)),
        (0.0, 0.0, (1.0, 0.84, 0.22, alpha)),
    )):
        ctx.set_source_rgba(*color)
        for row, line in enumerate(_PIXEL_STAR):
            for col, ch in enumerate(line):
                if ch == "#":
                    ctx.rectangle(left + dx + col * cell, top + dy + row * cell, cell, cell)
        ctx.fill()


def _draw_fx_background(ctx, fx, template, x, y, card_w, card_h, alpha, accent, anim, progress, elapsed):
    """Effects drawn on the card body, inside its clip."""
    if not fx or alpha <= 0:
        return
    ar, ag, ab = accent[0], accent[1], accent[2]

    if "crt_sweep" in fx:
        band_h = 26.0
        sweep_y = y - band_h + ((elapsed * 0.55) % 1.0) * (card_h + band_h)
        band = cairo.LinearGradient(0, sweep_y, 0, sweep_y + band_h)
        band.add_color_stop_rgba(0, 1, 1, 1, 0.0)
        band.add_color_stop_rgba(0.5, 1, 1, 1, 0.075 * alpha)
        band.add_color_stop_rgba(1, 1, 1, 1, 0.0)
        ctx.set_source(band)
        ctx.rectangle(x, sweep_y, card_w, band_h)
        ctx.fill()
        if int(elapsed * 24) % 9 == 0:  # brief brightness flicker
            ctx.set_source_rgba(1, 1, 1, 0.022 * alpha)
            ctx.rectangle(x, y, card_w, card_h)
            ctx.fill()

    if "sun_grid" in fx:
        horizon = y + card_h * 0.64
        below = y + card_h - horizon
        sun_cx, sun_r = x + card_w * 0.80, 34.0
        sun = cairo.LinearGradient(0, horizon - sun_r, 0, horizon)
        sun.add_color_stop_rgba(0, 1.0, 0.88, 0.32, 0.55 * alpha)
        sun.add_color_stop_rgba(1, 1.0, 0.30, 0.62, 0.55 * alpha)
        ctx.new_path()
        ctx.arc(sun_cx, horizon, sun_r, math.pi, math.tau)
        ctx.close_path()
        ctx.set_source(sun)
        ctx.fill()
        for k in range(1, 5):  # dark slits across the lower half of the sun
            slit_y = horizon - sun_r * (0.62 - k * 0.14)
            ctx.set_source_rgba(0.10, 0.03, 0.22, 0.42 * alpha)
            ctx.rectangle(sun_cx - sun_r, slit_y, sun_r * 2, 1.5 + k * 0.5)
            ctx.fill()
        ctx.set_line_width(1.0)
        vanish_x = x + card_w * 0.5
        for i in range(-8, 9):  # perspective lines fanning out from the horizon
            ctx.move_to(vanish_x, horizon)
            ctx.line_to(vanish_x + i * card_w * 0.13, y + card_h)
            ctx.set_source_rgba(1.0, 0.45, 0.88, 0.16 * alpha)
            ctx.stroke()
        for k in range(6):  # horizontal lines scrolling toward the viewer
            t = (k + (elapsed * 0.7) % 1.0) / 6.0
            line_y = horizon + below * (t ** 2)
            ctx.move_to(x, line_y)
            ctx.line_to(x + card_w, line_y)
            ctx.set_source_rgba(0.45, 0.95, 1.0, 0.22 * t * alpha)
            ctx.stroke()

    if "wood_grain" in fx:
        ctx.set_line_width(1.2)
        for i in range(9):
            base_y = y + card_h * (i + 0.5) / 9.0
            ctx.move_to(x, base_y)
            for step in range(0, int(card_w) + 1, 20):
                ctx.line_to(x + step, base_y + 2.4 * math.sin(step * 0.031 + i * 1.7))
            ctx.set_source_rgba(0.04, 0.015, 0.0, 0.15 * alpha)
            ctx.stroke()

    if "scan_sweep" in fx and 0.16 < progress < 0.86:
        band_w = 46.0
        sweep_x = x - band_w + ((elapsed * 0.42) % 1.0) * (card_w + band_w)
        band = cairo.LinearGradient(sweep_x, 0, sweep_x + band_w, 0)
        band.add_color_stop_rgba(0, ar, ag, ab, 0.0)
        band.add_color_stop_rgba(0.85, ar, ag, ab, 0.20 * alpha)
        band.add_color_stop_rgba(1, 1, 1, 1, 0.34 * alpha)
        ctx.set_source(band)
        ctx.rectangle(sweep_x, y, band_w, card_h)
        ctx.fill()

    if "bubble" in fx:
        if template["icon_side"] == "left":
            bx = x + 22 + 104 + 12
        else:
            bx = x + 10
        bubble_a = 0.055 * anim.title_alpha
        if bubble_a > 0:
            _rounded_rect(ctx, bx, y + 12, x + card_w - 12 - bx, card_h - 24, 16)
            ctx.set_source_rgba(1, 1, 1, bubble_a)
            ctx.fill()

    if "edge_stripe" in fx and anim.bar_wipe > 0:
        stripe = cairo.LinearGradient(x, y, x, y + card_h)
        stripe.add_color_stop_rgba(0, _lighten(ar, 0.1), _lighten(ag, 0.1), _lighten(ab, 0.1), alpha)
        stripe.add_color_stop_rgba(1, ar * 0.7, ag * 0.7, ab * 0.7, alpha)
        ctx.set_source(stripe)
        ctx.rectangle(x, y, 8, card_h * anim.bar_wipe)
        ctx.fill()

    if "trophy_ghost" in fx:
        _trophy_silhouette(ctx, x + card_w * 0.33, y + card_h * 0.52, 74.0, (1, 1, 1, 0.045 * alpha))

    if "progress_line" in fx and 0.16 < progress < 0.90:
        remaining = 1.0 - _clamp((progress - 0.30) / 0.54, 0.0, 1.0)
        thick = 3.0 if template["background"] == "flat" else 2.0
        ctx.set_source_rgba(_lighten(ar, 0.2), _lighten(ag, 0.2), _lighten(ab, 0.2), 0.85 * alpha)
        ctx.rectangle(x, y + card_h - thick, card_w * remaining, thick)
        ctx.fill()


def _draw_fx_decor(ctx, fx, x, y, card_w, card_h, alpha, anim):
    """Corner hardware drawn over the card edge (Wood Plaque's screws)."""
    if "screws" not in fx or alpha <= 0 or anim.bar_wipe <= 0:
        return
    a = alpha * _clamp(anim.bar_wipe, 0.0, 1.0)
    for i, (sx, sy) in enumerate((
        (x + 15, y + 15), (x + card_w - 15, y + 15),
        (x + 15, y + card_h - 15), (x + card_w - 15, y + card_h - 15),
    )):
        ctx.set_source_rgba(0.36, 0.23, 0.07, a)
        ctx.arc(sx, sy, 6.2, 0, math.tau)
        ctx.fill()
        ctx.set_source_rgba(0.86, 0.66, 0.30, a)
        ctx.arc(sx, sy, 5.0, 0, math.tau)
        ctx.fill()
        ctx.set_source_rgba(1.0, 0.92, 0.66, 0.55 * a)
        ctx.arc(sx - 1.4, sy - 1.6, 1.7, 0, math.tau)
        ctx.fill()
        ang = 0.6 + i * 0.9  # each slot turned a different amount
        ctx.set_line_width(1.5)
        ctx.move_to(sx - 3.6 * math.cos(ang), sy - 3.6 * math.sin(ang))
        ctx.line_to(sx + 3.6 * math.cos(ang), sy + 3.6 * math.sin(ang))
        ctx.set_source_rgba(0.24, 0.15, 0.04, 0.9 * a)
        ctx.stroke()


def _draw_fx_icon(ctx, fx, icon_cx, icon_cy, icon_radius, icon_alpha, accent, glow_scale, elapsed):
    """Effects around the icon: Cyber Glass's expanding hex ping and the
    Discord bar's status dot."""
    if not fx or icon_alpha <= 0:
        return
    if "hex_pulse" in fx and glow_scale > 0 and RING_SCALE > 0:
        t = (elapsed * 0.9) % 1.0
        ping_r = _fit_ring(icon_cx, icon_cy, icon_radius + 4 + t * 16 * RING_SCALE)
        _hex_path(ctx, icon_cx, icon_cy, ping_r)
        ctx.set_line_width(2.0)
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.55 * (1.0 - t) * glow_scale * icon_alpha)
        ctx.stroke()
    if "status_dot" in fx:
        dot_x = icon_cx + icon_radius * 0.72
        dot_y = icon_cy + icon_radius * 0.72
        ctx.set_source_rgba(0.13, 0.14, 0.16, icon_alpha)
        ctx.arc(dot_x, dot_y, 10.5, 0, math.tau)
        ctx.fill()
        ctx.set_source_rgba(0.24, 0.66, 0.36, icon_alpha)
        ctx.arc(dot_x, dot_y, 7.0, 0, math.tau)
        ctx.fill()


# ---------------------------------------------------------------------------
# "Game Art Blur" template background: the game's own artwork, blurred, under
# a dark vignette. Cairo has no blur, so the art is shrunk to a small bitmap,
# box-blurred there, and scaled back up with smooth filtering (cheap, and the
# blur strength scales with the card).
# ---------------------------------------------------------------------------
GAME_ART_PATH = ""            # set from FINALLY_GAME_ART_PATH (toast) / the tracker style
ART_BLUR_DIVISOR = 8          # 1 art texel = 8 card pixels
ART_BLUR_RADIUS = 2
_ART_BG_CACHE = {}


def _box_blur_bgra(data, w, h, radius, passes=2):
    """In-place separable box blur of a w x h BGRA byte buffer. Alpha is
    blurred like the colour channels (edges are clamped, not wrapped)."""
    if radius <= 0 or w <= 0 or h <= 0:
        return data
    size = 2 * radius + 1
    for _ in range(passes):
        for horizontal in (True, False):
            lines = h if horizontal else w
            length = w if horizontal else h
            step = 4 if horizontal else 4 * w
            line_step = 4 * w if horizontal else 4
            for line in range(lines):
                base = line * line_step
                for ch in range(4):
                    vals = [data[base + i * step + ch] for i in range(length)]
                    acc = sum(vals[min(max(j, 0), length - 1)] for j in range(-radius, radius + 1))
                    for i in range(length):
                        data[base + i * step + ch] = acc // size
                        acc += vals[min(i + radius + 1, length - 1)] - vals[max(i - radius, 0)]
    return data


def _art_background(path, card_w, card_h):
    """(surface, width, height) of the blurred, cover-cropped art for a card
    of this size, or None if the image can't be used. Cached per file+size."""
    if not path or not os.path.exists(path):
        return None
    sw = max(int(card_w / ART_BLUR_DIVISOR), 8)
    sh = max(int(card_h / ART_BLUR_DIVISOR), 4)
    key = (path, sw, sh)
    if key in _ART_BG_CACHE:
        return _ART_BG_CACHE[key]
    result = None
    try:
        iw, ih = (int(v) for v in GdkPixbuf.Pixbuf.get_file_info(path)[1:3])
        k = max(sw / float(iw), sh / float(ih))
        fw, fh = max(sw, int(math.ceil(iw * k))), max(sh, int(math.ceil(ih * k)))
        full = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, fw, fh, False)
        pixbuf = full.new_subpixbuf((fw - sw) // 2, (fh - sh) // 2, sw, sh)
        small = cairo.ImageSurface(cairo.FORMAT_ARGB32, sw, sh)
        small_ctx = cairo.Context(small)
        Gdk.cairo_set_source_pixbuf(small_ctx, pixbuf, 0, 0)
        small_ctx.paint()
        small.flush()
        buf = small.get_data()
        data = bytearray(buf)
        _box_blur_bgra(data, sw, sh, ART_BLUR_RADIUS)
        buf[:] = bytes(data)
        small.mark_dirty()
        result = (small, sw, sh)
    except Exception:
        result = None
    _ART_BG_CACHE[key] = result
    return result


def _draw_art_background(ctx, x, y, w, h, alpha):
    """Blurred art + darkening + vignette, clipped by the caller."""
    art = _art_background(GAME_ART_PATH, w, h)
    if art is not None:
        surface, sw, sh = art
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(w / float(sw), h / float(sh))
        ctx.set_source_surface(surface, 0, 0)
        ctx.get_source().set_filter(cairo.FILTER_BILINEAR)
        ctx.paint_with_alpha(alpha)
        ctx.restore()
    # Even darkening so text stays readable on bright art...
    ctx.set_source_rgba(0.02, 0.02, 0.03, (0.50 if art is not None else 0.0) * alpha)
    ctx.rectangle(x, y, w, h)
    ctx.fill()
    # ...then a black vignette closing in on the edges.
    vignette = cairo.RadialGradient(x + w / 2, y + h / 2, min(w, h) * 0.18, x + w / 2, y + h / 2, max(w, h) * 0.62)
    vignette.add_color_stop_rgba(0, 0, 0, 0, 0.0)
    vignette.add_color_stop_rgba(0.55, 0, 0, 0, 0.32 * alpha)
    vignette.add_color_stop_rgba(1, 0, 0, 0, 0.90 * alpha)
    ctx.set_source(vignette)
    ctx.rectangle(x, y, w, h)
    ctx.fill()


def _draw_card_body(
    ctx, template, body_shape, x, y, card_w, card_h, radius, alpha,
    gradient_start, gradient_end, gradient_direction, icon_gradient_active,
    accent, bar_wipe, art_size, fx, inside_clip=None, border_glow_scale=1.0, shadow=True,
):
    """The card itself -- shadow, body fill for the template's background
    style, its texture/decoration layers, colored icon block, accent
    flourish and border. Shared by the toast popup and the achievement
    tracker so the tracker looks exactly like the chosen template.
    `inside_clip` (optional) draws extra layers (the toast's animated
    shine and effects) inside the card's clip, after the static layers."""
    # --- Drop shadow (softer/bigger for lighter/gentler templates) -------
    shadow_offsets = [(4, 12, 0.22)] if template["background"] in ("minimal", "light_card") else [(4, 8, 0.40)]
    for dx, dy, a in (shadow_offsets if shadow else ()):
        _shape_path(ctx, body_shape, x + dx, y + dy, card_w, card_h, radius)
        ctx.set_source_rgba(0, 0, 0, a * alpha)
        ctx.fill()

    # --- Card body ---------------------------------------------------------
    # When "Gradient from icon colors" is active, every template's body
    # tint is boosted to at least 60% so the icon's own colors are clearly
    # visible. Without this, most templates only blended 12-22% of the
    # gradient colors into their dark base -- plenty for the subtle default
    # palette, but it made icon-derived colors look washed out/"locked"
    # everywhere except the Xbox 360 templates (which already use 85%).
    def tint(base_weight):
        if PRESET_ACTIVE:
            return max(base_weight, 0.90)   # palette shows almost exactly
        return max(base_weight, 0.60) if icon_gradient_active else base_weight

    top = _blend((0.085, 0.095, 0.105), gradient_start[:3], tint(0.14))
    bottom = _blend((0.045, 0.05, 0.058), gradient_end[:3], tint(0.12))
    bg = template["background"]

    if bg in ("glass", "glass_diagonal", "glass_neon"):
        body_a = 0.90 if bg == "glass_neon" else 0.97
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            top, bottom, body_a * alpha, (body_a + 0.015) * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    elif bg == "split_block":
        # Dark base first; the colored block gets painted on top of it,
        # clipped to the card outline, once we know the icon column width.
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            top if icon_gradient_active else bottom, bottom, 0.97 * alpha, 0.97 * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    elif bg == "light_card":
        # A light/cream card -- everything else so far has been dark-mode.
        # Custom/icon-extracted colors still tint it, just gently (20%),
        # so it stays readable and doesn't turn muddy.
        light_top = _blend((0.96, 0.95, 0.93), gradient_start[:3], 0.20)
        light_bottom = _blend((0.90, 0.89, 0.87), gradient_end[:3], 0.20)
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            light_top, light_bottom, 0.97 * alpha, 0.97 * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    elif bg == "vaporwave":
        vw_top = _blend((0.62, 0.16, 0.55), gradient_start[:3], tint(0.55) if not icon_gradient_active else 0.75)
        vw_bottom = _blend((0.10, 0.55, 0.68), gradient_end[:3], tint(0.55) if not icon_gradient_active else 0.75)
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            vw_top, vw_bottom, 0.95 * alpha, 0.95 * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    elif bg == "wood_plaque":
        wood_top = _blend((0.32, 0.19, 0.10), gradient_start[:3], tint(0.22))
        wood_bottom = _blend((0.16, 0.09, 0.05), gradient_end[:3], tint(0.18))
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            wood_top, wood_bottom, 0.97 * alpha, 0.97 * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    elif bg == "game_art":
        # Base first (visible when there is no artwork), then the blurred art
        # with its vignette clipped to the card.
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            _blend((0.06, 0.07, 0.08), gradient_start[:3], tint(0.20)),
            _blend((0.03, 0.035, 0.04), gradient_end[:3], tint(0.20)),
            0.97 * alpha, 0.97 * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
        ctx.save()
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.clip()
        _draw_art_background(ctx, x, y, card_w, card_h, alpha)
        ctx.restore()
    elif bg == "terminal":
        # Deliberately no gradient at all -- a flat near-black "screen",
        # matching the template's terminal/CRT identity.
        if icon_gradient_active:
            term_top = _blend((0.02, 0.025, 0.02), gradient_start[:3], 0.45)
            term_bottom = _blend((0.02, 0.025, 0.02), gradient_end[:3], 0.45)
            _set_gradient_source(
                ctx, x, y, card_w, card_h, gradient_direction,
                term_top, term_bottom, 0.97 * alpha, 0.97 * alpha,
            )
        else:
            ctx.set_source_rgba(0.02, 0.025, 0.02, 0.97 * alpha)
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()
    else:  # "flat", "minimal", "scanline", "flat_dark"
        # These previously rendered as a solid fill blending in only
        # 10-16% of a single color (gradient_start) on a mostly-fixed dark
        # base -- gradient_end and the gradient-direction setting were
        # ignored entirely. That's why a vivid extracted icon-gradient
        # color (or any custom color, really) barely showed through and
        # still looked "locked"/neutral on these templates specifically.
        # Now uses the same two-tone _set_gradient_source as the glass
        # templates, just with a lower blend weight so these keep their
        # comparatively flatter, quieter identity.
        weight = tint(0.30 if bg == "minimal" else 0.40)
        flat_top = _blend((0.09, 0.10, 0.115), gradient_start[:3], weight)
        flat_bottom = _blend((0.07, 0.08, 0.09), gradient_end[:3], weight)
        flat_a = {"flat": 0.95, "minimal": 0.92, "scanline": 0.95, "flat_dark": 0.95}[bg]
        _set_gradient_source(
            ctx, x, y, card_w, card_h, gradient_direction,
            flat_top, flat_bottom, flat_a * alpha, flat_a * alpha,
        )
        _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
        ctx.fill()

    ctx.save()
    _shape_path(ctx, body_shape, x, y, card_w, card_h, radius)
    ctx.clip()

    if bg in ("glass", "glass_diagonal", "glass_neon"):
        highlight = cairo.LinearGradient(x, y, x, y + 28)
        highlight.add_color_stop_rgba(0, 1, 1, 1, 0.07 * alpha)
        highlight.add_color_stop_rgba(1, 1, 1, 1, 0.0)
        ctx.set_source(highlight)
        ctx.rectangle(x, y, card_w, 28)
        ctx.fill()

    if bg == "scanline":
        line_y = y
        while line_y < y + card_h:
            ctx.set_source_rgba(1, 1, 1, 0.045 * alpha)
            ctx.rectangle(x, line_y, card_w, 1)
            ctx.fill()
            line_y += 4

    if bg == "vaporwave" and "sun_grid" not in fx:
        # A handful of thin horizontal "horizon grid" lines, evenly spaced
        # and fading out toward the bottom, evoking synthwave sun-grid art
        # -- but built from a couple of primitives, not any copied artwork.
        grid_rows = 7
        for i in range(1, grid_rows + 1):
            line_y = y + card_h * (i / (grid_rows + 1))
            fade = 1.0 - (i / grid_rows) * 0.75
            ctx.set_source_rgba(1, 1, 1, 0.10 * fade * alpha)
            ctx.rectangle(x, line_y, card_w, 1)
            ctx.fill()

    if bg == "wood_plaque":
        # A thin inset highlight just inside the edge, for an
        # "engraved plaque" feel instead of a flat brown rectangle.
        inset = 6
        _shape_path(ctx, body_shape, x + inset, y + inset, card_w - inset * 2, card_h - inset * 2, max(radius - inset, 0))
        ctx.set_line_width(1.5)
        ctx.set_source_rgba(1, 0.85, 0.55, 0.18 * alpha)
        ctx.stroke()

    art_size = 104
    icon_column_w = art_size + 44

    if bg == "split_block":
        block_h = card_h * bar_wipe
        if block_h > 0:
            block_x = x if template["icon_side"] == "left" else x + card_w - icon_column_w
            # With icon colors active, the colored block uses them too
            # (it's this template's most prominent color area).
            block_src = gradient_start if icon_gradient_active else accent
            block_src2 = gradient_end if icon_gradient_active else accent
            _set_gradient_source(
                ctx, block_x, y, icon_column_w, card_h, gradient_direction,
                (_lighten(block_src[0], 0.15), _lighten(block_src[1], 0.15), _lighten(block_src[2], 0.15)),
                (block_src2[0] * 0.7, block_src2[1] * 0.7, block_src2[2] * 0.7),
                alpha, alpha,
            )
            ctx.rectangle(block_x, y, icon_column_w, block_h)
            ctx.fill()
            if "hatch" in fx:
                # Diagonal hatching on the colored block for a chunkier,
                # printed-panel look.
                ctx.save()
                ctx.rectangle(block_x, y, icon_column_w, block_h)
                ctx.clip()
                ctx.set_line_width(5.0)
                ctx.set_source_rgba(1, 1, 1, 0.09 * alpha)
                for k in range(-2, int((icon_column_w + card_h) / 16) + 2):
                    ctx.move_to(block_x + k * 16, y + card_h)
                    ctx.line_to(block_x + k * 16 + card_h, y)
                    ctx.stroke()
                ctx.restore()

    # --- Accent flourish (only some templates draw one here; others rely
    # purely on the icon's own glow ring, or on the outer border pass) -----
    accent_style = template["accent"]
    if accent_style == "left_bar":
        bar_h = card_h * bar_wipe
        if bar_h > 0:
            bar = cairo.LinearGradient(x, y, x, y + card_h)
            bar.add_color_stop_rgba(0, _lighten(accent[0], 0.25), _lighten(accent[1], 0.25), _lighten(accent[2], 0.25), alpha)
            bar.add_color_stop_rgba(1, accent[0] * 0.55, accent[1] * 0.55, accent[2] * 0.55, alpha)
            ctx.rectangle(x, y, 6, bar_h)
            ctx.set_source(bar)
            ctx.fill()
    elif accent_style == "top_line":
        line_w = card_w * bar_wipe
        if line_w > 0:
            line = cairo.LinearGradient(x, y, x + line_w, y)
            line.add_color_stop_rgba(0, _lighten(accent[0], 0.3), _lighten(accent[1], 0.3), _lighten(accent[2], 0.3), alpha)
            line.add_color_stop_rgba(1, accent[0] * 0.6, accent[1] * 0.6, accent[2] * 0.6, alpha)
            ctx.rectangle(x, y, line_w, 4)
            ctx.set_source(line)
            ctx.fill()
    elif accent_style == "corner_ribbon" and bar_wipe > 0:
        rb = 34 * bar_wipe
        ctx.move_to(x, y)
        ctx.line_to(x + rb, y)
        ctx.line_to(x, y + rb)
        ctx.close_path()
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.85 * alpha)
        ctx.fill()

    if inside_clip is not None:
        inside_clip()
    ctx.restore()

    _draw_template_border(ctx, body_shape, x, y, card_w, card_h, radius, alpha, accent, template["border"], glow_scale=border_glow_scale)


# ---------------------------------------------------------------------------
# Achievement tracker card
#
# The small always-on-screen card for the pinned achievement (drawn by
# tracker_overlay.py). It is built from the same pieces as the toast popup --
# the chosen template's card body, icon shape, fonts, border, and the same
# colour pipeline (fixed colours, per-template preset colours, gradient from
# the achievement icon or game art) -- so it always matches the toasts.
# ---------------------------------------------------------------------------
TRK_CARD_W = 380
TRK_CARD_H = 100
TRK_PAD = 30
TRK_ICON = 64
TRACKER_HIDE_SECONDS = 0.35     # slide/fade out (and back in) around a toast
TRACKER_EDGE_MARGIN = 28
TRACKER_POSITIONS = {
    "top_left": ("left", "top"),
    "top_right": ("right", "top"),
    "bottom_left": ("left", "bottom"),
    "bottom_right": ("right", "bottom"),
}
_TRACKER_EXTRACT_CACHE = {}


def _tracker_label(label_style, achieved):
    word = "UNLOCKED" if achieved else "TRACKING"
    if label_style == "spaced_caps":
        return "\u2009".join(list(word))
    if label_style == "small_tight":
        return word.capitalize()
    if label_style == "bracket":
        return f"[{word}]"
    return word


def _tracker_colors(style, icon_path, template, template_name):
    """(preset_active, icon_gradient_active, start, end, circle, direction)
    -- the same decisions main() makes for a toast, for the tracker card."""
    start = _parse_color(style.get("normal_gradient_start"), (0.09, 0.32, 0.14, 0.94))
    end = _parse_color(style.get("normal_gradient_end"), (0.04, 0.16, 0.07, 0.94))
    circle = _parse_color(style.get("normal_circle_color"), (0.24, 0.78, 0.35, 1.0))
    direction = _resolve_gradient_direction(style.get("gradient_direction"))
    preset, start, end, circle, direction = _apply_preset_colors(
        bool(style.get("template_colors_enabled")), template_name, start, end, circle, direction,
    )
    icon_gradient = False
    art_on = bool(style.get("game_art_gradient_enabled"))
    icon_on = bool(style.get("icon_gradient_enabled")) or art_on
    if not preset and icon_on and template.get("icon_gradient", True):
        art_path = str(style.get("game_art_path") or "") if art_on else ""
        key = (icon_path or "", art_path, art_on)
        if key not in _TRACKER_EXTRACT_CACHE:
            _TRACKER_EXTRACT_CACHE[key] = _pick_gradient_colors(icon_path, use_game_art=art_on, game_art_path=art_path)
        extracted = _TRACKER_EXTRACT_CACHE[key]
        if extracted:
            icon_gradient = True
            (lr, lg, lb), (dr, dg, db) = extracted
            start = (lr, lg, lb, start[3])
            end = (dr, dg, db, end[3])
    return preset, icon_gradient, start, end, circle, direction


def _make_tracker_surface(width, height, scale, target, state, style, alpha=1.0):
    """One frame of the tracker card. `style` carries the toast settings
    that matter (template, colours, fonts, glow); `alpha` is the overall
    visibility, animated by the overlay loop for the hide/show around toasts."""
    global PRESET_ACTIVE, GAME_ART_PATH
    target = target if isinstance(target, dict) else None
    state = state if isinstance(state, dict) else None
    style = style if isinstance(style, dict) else {}
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, width, height)
    ctx = cairo.Context(surface)
    ctx.set_operator(cairo.OPERATOR_CLEAR)
    ctx.paint()
    ctx.set_operator(cairo.OPERATOR_OVER)
    ctx.scale(scale, scale)
    if alpha <= 0:
        surface.flush()
        return surface

    name = _resolve_template_name(style.get("template"))
    if name == "mythic_completion":
        name = DEFAULT_TEMPLATE
    template = TEMPLATES[name]
    door = template.get("layout") == "door_wipe"
    bg = template["background"]
    icon_path = (target or {}).get("icon_path")
    preset, icon_gradient, gradient_start, gradient_end, circle_color, direction = _tracker_colors(
        style, icon_path, template, name,
    )
    PRESET_ACTIVE = preset
    GAME_ART_PATH = str(style.get("game_art_path") or "")
    accent = circle_color

    x = y = float(TRK_PAD)
    w, h = float(TRK_CARD_W), float(TRK_CARD_H)
    glow_enabled = bool(style.get("icon_glow_enabled", True))
    glow_scale = (float(style.get("icon_glow_intensity", 50)) / 50.0) if glow_enabled else 0.0
    if door:
        radius = h / 2 if template.get("badge_shape", "circle") == "circle" else h * 0.18
        body_shape = "rounded_square"
        icon_shape = "circle" if template.get("badge_shape", "circle") == "circle" else "rounded_square"
        icon_side = "left"
        font_family = template["font_family"]
    else:
        radius = min(float(template["corner_radius"]), h / 2)
        body_shape = "cut" if bg == "glass_neon" else "rounded_square"
        icon_shape = template["icon_shape"]
        icon_side = template["icon_side"]
        font_family = template["font_family"]
    glow_shape = template.get("glow_shape", icon_shape)

    if door:
        top = _blend((0.06, 0.09, 0.05), gradient_start[:3], 0.85)
        bottom = _blend((0.03, 0.05, 0.025), gradient_end[:3], 0.85)
        _set_gradient_source(ctx, x, y, w, h, direction, top, bottom, 0.97 * alpha, 0.97 * alpha)
        _shape_path(ctx, body_shape, x, y, w, h, radius)
        ctx.fill()
        ctx.save()
        _shape_path(ctx, body_shape, x, y, w, h, radius)
        ctx.clip()
        highlight = cairo.LinearGradient(x, y, x, y + h * 0.4)
        highlight.add_color_stop_rgba(0, 1, 1, 1, 0.08 * alpha)
        highlight.add_color_stop_rgba(1, 1, 1, 1, 0.0)
        ctx.set_source(highlight)
        ctx.rectangle(x, y, w, h * 0.4)
        ctx.fill()
        ctx.restore()
    else:
        _draw_card_body(
            ctx, template, body_shape, x, y, w, h, radius, alpha,
            gradient_start, gradient_end, direction, icon_gradient,
            accent, 1.0, TRK_ICON, (), inside_clip=None, border_glow_scale=glow_scale, shadow=False,
        )

    # --- Icon ---
    size = float(TRK_ICON)
    icon_x = (x + 18 if door else x + 22) if icon_side == "left" else x + w - size - 22
    icon_y = y + (h - size) / 2
    icon_cx, icon_cy = icon_x + size / 2, icon_y + size / 2
    if glow_scale > 0:
        halo = size / 2 + 8
        _shape_path(ctx, glow_shape, icon_cx - halo, icon_cy - halo, halo * 2, halo * 2, halo)
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.14 * glow_scale * alpha)
        ctx.fill()
    if style.get("icon_frame_ring_enabled", True):
        _shape_path(ctx, glow_shape, icon_x - 3, icon_y - 3, size + 6, size + 6, 14)
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.55 * alpha)
        ctx.fill()
    _shape_path(ctx, icon_shape, icon_x, icon_y, size, size, 12)
    ctx.set_source_rgba(0.08, 0.09, 0.10, alpha)
    ctx.fill()
    _draw_icon(ctx, icon_path, icon_cx, icon_cy, size / 2 - 2, alpha, accent, scale=1.0, rotation=0.0, shape=icon_shape)

    # --- Text ---
    if icon_side == "left":
        tx = icon_x + size + 18
        text_width = x + w - tx - 16
    else:
        tx = x + 18
        text_width = icon_x - tx - 14
    light_text = template.get("light_text", False)
    if light_text:
        title_rgb, sub_rgb = (0.12, 0.12, 0.14), (0.38, 0.40, 0.43)
        label_tint = lambda c: _clamp(c * 0.55, 0.0, 1.0)
        track_rgba = (0, 0, 0, 0.12)
    else:
        title_rgb, sub_rgb = (1, 1, 1), (0.72, 0.75, 0.78)
        label_tint = lambda c: _lighten(c, 0.35)
        track_rgba = (1, 1, 1, 0.14)
    compact = 1 if template.get("compact") else 0
    label_size = _clamp(float(style.get("label_font_size", 13)) * 0.8, 8, 12) - compact * 0.5
    title_size = _clamp(float(style.get("title_font_size", 26)) * 0.62, 12, 20) - compact
    status_size = _clamp(float(style.get("subtitle_font_size", 18)) * 0.72, 10, 15) - compact * 0.5
    title_weight = Pango.Weight.NORMAL if bg == "minimal" else Pango.Weight.BOLD

    achieved = bool(state and state.get("achieved"))
    label = _tracker_label(template["label_style"], achieved)
    label_y = y + 12
    label_color = (label_tint(accent[0]), label_tint(accent[1]), label_tint(accent[2]), alpha)
    if template["label_style"] == "pill_caps" and text_width > 40:
        lw, lh = _measure_text(ctx, label, label_size, Pango.Weight.BOLD, font_family)
        pill_w, pill_h = lw + 16, lh + 6
        _rounded_rect(ctx, tx, label_y - 2, pill_w, pill_h, pill_h / 2)
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.85 * alpha)
        ctx.fill()
        _text(ctx, label, tx + 8, label_y, label_size, (0.05, 0.05, 0.06, alpha), Pango.Weight.BOLD, pill_w, font_family)
        label_h = pill_h
    else:
        _text(ctx, label, tx, label_y, label_size, label_color, Pango.Weight.BOLD, text_width, font_family)
        label_h = label_size * 1.25

    name_text = (target or {}).get("name") or "Achievement"
    title_y = label_y + label_h + 4
    _text(ctx, name_text, tx, title_y, title_size, (*title_rgb, alpha), title_weight, text_width, font_family)
    status_y = title_y + title_size * 1.3 + 2

    if state is None:
        _text(ctx, "Loading...", tx, status_y, status_size, (*sub_rgb, 0.85 * alpha), Pango.Weight.NORMAL, text_width, font_family)
    elif achieved:
        _text(ctx, "\u2713 Unlocked", tx, status_y, status_size + 1, (label_tint(accent[0]), label_tint(accent[1]), label_tint(accent[2]), alpha),
              Pango.Weight.BOLD, text_width, font_family)
    elif state.get("has_progress") and state.get("max"):
        current = max(0, int(state.get("current") or 0))
        total = max(1, int(state.get("max")))
        frac = _clamp(current / total, 0.0, 1.0)
        bar_h = 7.0
        bar_y = y + h - 20
        rounded_bar = radius > 8
        for value, color in ((1.0, track_rgba), (frac, (accent[0], accent[1], accent[2], alpha))):
            if value <= 0:
                continue
            if rounded_bar:
                _rounded_rect(ctx, tx, bar_y, max(text_width * value, bar_h), bar_h, bar_h / 2)
            else:
                ctx.rectangle(tx, bar_y, text_width * value, bar_h)
            ctx.set_source_rgba(color[0], color[1], color[2], color[3] * (alpha if color is track_rgba else 1.0))
            ctx.fill()
        _text(ctx, f"{current} / {total}", tx, status_y, status_size, (*sub_rgb, 0.95 * alpha), Pango.Weight.NORMAL, text_width, font_family)
    else:
        # The achievement's own description (secret ones have none yet).
        description = str((target or {}).get("description") or "").strip() or "In progress"
        _text(ctx, description, tx, status_y, status_size, (*sub_rgb, 0.9 * alpha), Pango.Weight.NORMAL, text_width, font_family,
              max_lines=2)

    surface.flush()
    return surface


def _tracker_card_pixels(overlay_scale):
    return int((TRK_CARD_W + TRK_PAD * 2) * overlay_scale), int((TRK_CARD_H + TRK_PAD * 2) * overlay_scale)


def _tracker_layout(position, screen_w, screen_h, overlay_scale):
    """Top-left pixel of the tracker texture for a corner position. The
    visible card (not its transparent padding) sits EDGE_MARGIN from the edge."""
    h_side, v_side = TRACKER_POSITIONS.get(position, TRACKER_POSITIONS["top_right"])
    tex_w, tex_h = _tracker_card_pixels(overlay_scale)
    pad = TRK_PAD * overlay_scale
    margin = TRACKER_EDGE_MARGIN * overlay_scale
    left = margin - pad if h_side == "left" else screen_w - margin - tex_w + pad
    top = margin - pad if v_side == "top" else screen_h - margin - tex_h + pad
    return int(left), int(top)


def _tracker_visibility(vis, want_visible, dt, seconds=TRACKER_HIDE_SECONDS):
    """Moves `vis` (0 hidden .. 1 fully shown) toward its target at a fixed
    rate, so a hide or show always takes `seconds` end to end."""
    step = dt / max(seconds, 1e-6)
    if want_visible:
        return min(1.0, vis + step)
    return max(0.0, vis - step)


def _tracker_motion(position, vis, overlay_scale):
    """(alpha, x_offset, y_offset) for a visibility value: the card fades and
    slides toward the screen edge it sits against as it hides."""
    h_side, _v = TRACKER_POSITIONS.get(position, TRACKER_POSITIONS["top_right"])
    eased = _ease_out(_clamp(vis, 0.0, 1.0))
    slide = (1.0 - eased) * 90.0 * overlay_scale
    return eased, (-slide if h_side == "left" else slide), 0.0


def _make_surface(
    width, height, scale, title, subtitle, is_rare, progress, icon_path,
    gradient_start, gradient_end, circle_color, template=None, total_seconds=5.8,
    label_font_size=13, title_font_size=26, subtitle_font_size=18,
    glow_enabled=True, glow_intensity=50, gradient_direction="vertical",
    glow_normal_enabled=False, frame_ring_enabled=True, icon_gradient_active=False,
    percent=None,
):
    global ACTIVE_FX
    template = template or TEMPLATES[DEFAULT_TEMPLATE]
    if template.get("layout") == "door_wipe":
        return _make_surface_door_wipe(
            width, height, scale, title, subtitle, is_rare, progress, icon_path,
            gradient_start, gradient_end, circle_color, template, total_seconds,
            label_font_size, title_font_size, subtitle_font_size,
            glow_enabled, glow_intensity, gradient_direction, glow_normal_enabled,
            icon_gradient_active, percent,
        )
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, width, height)
    ctx = cairo.Context(surface)
    ctx.set_operator(cairo.OPERATOR_CLEAR)
    ctx.paint()
    ctx.set_operator(cairo.OPERATOR_OVER)
    ctx.scale(scale, scale)

    anim = _animation_state(progress)
    elapsed = progress * total_seconds
    alpha = anim.container_alpha
    fx = tuple(template.get("fx", ())) if FX_ENABLED else ()
    ACTIVE_FX = fx
    if "bounce" in fx and 0.04 < progress < 0.40:
        # Switch Bold: a livelier landing -- the card overshoots, then
        # wobbles a couple of times before settling.
        tb = progress - 0.04
        anim.container_scale += 0.07 * math.exp(-tb * 12.0) * math.sin(tb * 38.0)

    card_w, card_h = CARD_W, CARD_H
    radius = template["corner_radius"]
    # "cut" gives the angular chamfered-corner look used by Cyber Glass;
    # every other template uses a normal rounded rect.
    body_shape = "cut" if template["background"] == "glass_neon" else "rounded_square"
    font_family = "DejaVu Serif" if "serif" in fx else template["font_family"]
    title_weight = Pango.Weight.NORMAL if template["background"] == "minimal" else Pango.Weight.BOLD

    # Font sizes are a user preference (see the "Font sizes" sliders in
    # settings) rather than fixed per template. The handful of "compact"
    # templates (Steam Flat, Material Minimal, Retro Arcade, Chat Toast)
    # still read a touch smaller than the rest, proportional to whatever
    # base sizes the user picked, so their tighter layout is preserved.
    if template["compact"]:
        label_size = max(label_font_size - 1, 8)
        title_size = max(title_font_size - 4, 12)
        subtitle_size = max(subtitle_font_size - 1, 9)
        label_top = 20
    else:
        label_size = label_font_size
        title_size = title_font_size
        subtitle_size = subtitle_font_size
        label_top = 24

    # Each line's vertical position is derived from the actual size of the
    # line above it, so bumping any of the three sizes pushes the rest of
    # the stack down instead of overlapping it.
    label_y_off = label_top
    title_y_off = label_y_off + label_size + 13
    subtitle_y_off = title_y_off + title_size + 10

    # Fixed, symmetric anchor -- the card never shifts position within its
    # own texture. All entrance/exit travel happens at the GL-quad level.
    x = float(PAD_X)
    y = PAD_Y + anim.bounce_y

    accent = circle_color

    # The whole container breathes in with a soft spring scale, anchored on
    # its own center, so it doesn't drift while it grows.
    ctx.save()
    cx_pivot, cy_pivot = x + card_w / 2, y + card_h / 2
    ctx.translate(cx_pivot, cy_pivot)
    ctx.scale(anim.container_scale, anim.container_scale)
    ctx.translate(-cx_pivot, -cy_pivot)

    bg = template["background"]
    art_size = 104
    def _toast_layers_in_clip():
        # A single soft light sheen sweeping across the card, timed to land after
        # everything else has settled in. Skipped on the flatter/minimal looks
        # where a glossy sweep would clash with the design.
        if anim.shine is not None and bg in ("glass", "glass_diagonal", "glass_neon", "split_block"):
            shine_alpha = math.sin(_clamp(anim.shine, 0.0, 1.0) * math.pi)
            band_w = card_w * 0.35
            band_x = x - band_w + anim.shine * (card_w + band_w * 2)
            sheen = cairo.LinearGradient(band_x, 0, band_x + band_w, 0)
            sheen.add_color_stop_rgba(0, 1, 1, 1, 0.0)
            sheen.add_color_stop_rgba(0.5, 1, 1, 1, 0.14 * shine_alpha * alpha)
            sheen.add_color_stop_rgba(1, 1, 1, 1, 0.0)
            ctx.set_source(sheen)
            ctx.rectangle(x, y, card_w, card_h)
            ctx.fill()
        # Ultra rare: a second, slightly stronger sheen after the first has
        # passed, so the shine lasts longer (same glass-style looks only).
        if TIER == "ultra_rare" and bg in ("glass", "glass_diagonal", "glass_neon", "split_block") and 0.68 <= progress <= 0.88:
            shine2 = (progress - 0.68) / 0.20
            band_w = card_w * 0.35
            band_x = x - band_w + shine2 * (card_w + band_w * 2)
            sheen2 = cairo.LinearGradient(band_x, 0, band_x + band_w, 0)
            sheen2.add_color_stop_rgba(0, 1, 1, 1, 0.0)
            sheen2.add_color_stop_rgba(0.5, 1, 1, 1, 0.2 * math.sin(_clamp(shine2, 0.0, 1.0) * math.pi) * alpha)
            sheen2.add_color_stop_rgba(1, 1, 1, 1, 0.0)
            ctx.set_source(sheen2)
            ctx.rectangle(x, y, card_w, card_h)
            ctx.fill()
        _draw_fx_background(ctx, fx, template, x, y, card_w, card_h, alpha, accent, anim, progress, elapsed)
    _draw_card_body(
        ctx, template, body_shape, x, y, card_w, card_h, radius, alpha,
        gradient_start, gradient_end, gradient_direction, icon_gradient_active,
        accent, anim.bar_wipe, art_size, fx, inside_clip=_toast_layers_in_clip,
        border_glow_scale=(glow_intensity / 50.0) if glow_enabled else 0.0,
    )
    if (icon_gradient_active or PRESET_ACTIVE) and is_rare:
        # With icon colors, rare and normal unlocks would otherwise share
        # the same icon-derived palette -- a gold edge keeps rare ones
        # recognizable at a glance.
        edge_rgb = RARE_EDGE_GOLD
        _shape_path(ctx, body_shape, x + 1, y + 1, card_w - 2, card_h - 2, radius)
        ctx.set_line_width(2.5)
        ctx.set_source_rgba(edge_rgb[0], edge_rgb[1], edge_rgb[2], 0.9 * alpha)
        ctx.stroke()

    _draw_fx_decor(ctx, fx, x, y, card_w, card_h, alpha, anim)

    # --- Icon --------------------------------------------------------------
    icon_shape = template["icon_shape"]
    # The halo and frame ring use their own shape, defaulting to the
    # template's icon_shape but overridable per-template (e.g. Xbox Modern
    # keeps a rounded-square icon frame for the real icon artwork, but its
    # halo/ring specifically read as circular, matching the Xbox 360
    # templates) -- see TEMPLATES' "glow_shape" field.
    glow_shape = template.get("glow_shape", icon_shape)
    if template["icon_side"] == "left":
        art_x = x + 22
    else:
        art_x = x + card_w - art_size - 22
    art_y = y + (card_h - art_size) / 2
    icon_cx, icon_cy = art_x + art_size / 2, art_y + art_size / 2
    icon_radius = art_size / 2
    icon_alpha = anim.icon_alpha
    # At the default intensity (50), this multiplier is exactly 1.0 --
    # today's look is unchanged unless the user actually touches the
    # setting. 0 turns the glow off entirely (same as the toggle), 100
    # doubles it.
    glow_scale = (glow_intensity / 50.0) if glow_enabled else 0.0
    frame_ring_scale = 1.0 if frame_ring_enabled else 0.0

    if icon_alpha > 0:
        if glow_scale > 0 and RING_SCALE > 0:
            halo_r = _fit_ring(icon_cx, icon_cy, icon_radius + 14 * RING_SCALE)
            _shape_path(ctx, glow_shape, icon_cx - halo_r, icon_cy - halo_r, halo_r * 2, halo_r * 2, halo_r)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.14 * glow_scale * icon_alpha)
            ctx.fill()

        if frame_ring_scale > 0:
            # The colored ring framing the icon -- this is the "layered
            # target" look, a separate on/off from the ambient glow above.
            # With it off, skip straight to a plain dark backing so the
            # icon still has *something* behind it, just not a colored ring.
            _shape_path(ctx, glow_shape, art_x - 3, art_y - 3, art_size + 6, art_size + 6, 18)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.55 * icon_alpha)
            ctx.fill()
        _shape_path(ctx, icon_shape, art_x, art_y, art_size, art_size, 15)
        ctx.set_source_rgba(0.08, 0.09, 0.10, icon_alpha)
        ctx.fill()

        _draw_icon(
            ctx, icon_path, icon_cx, icon_cy, icon_radius - 2, icon_alpha, accent,
            scale=anim.icon_scale, rotation=anim.icon_rotation, shape=icon_shape,
        )

    if (is_rare or glow_normal_enabled) and icon_alpha > 0:
        if glow_scale > 0 and RING_SCALE > 0:
            # Uses icon_alpha itself (already a smoothly-eased 0->1->0
            # curve tied to the icon's own pop-in/pop-out) as the ring's
            # own reveal, instead of a hard on/off switch at a fixed
            # progress threshold -- so it now fades in and out with the
            # icon rather than snapping on and off.
            pulse = 0.5 + 0.5 * math.sin(elapsed * 3.4)
            ctx.set_line_width(2.5)
            pulse_r = _fit_ring(icon_cx, icon_cy, icon_radius + (7 + pulse * 3) * RING_SCALE)
            _shape_path(ctx, glow_shape, icon_cx - pulse_r, icon_cy - pulse_r,
                        pulse_r * 2, pulse_r * 2, pulse_r * 0.3)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.6 * glow_scale * icon_alpha)
            ctx.stroke()
    _draw_fx_icon(ctx, fx, icon_cx, icon_cy, icon_radius, icon_alpha, accent, glow_scale, elapsed)
    if is_rare and anim.glow_pulse_active:
        _draw_rare_corner_badge(ctx, art_x + art_size - 6, art_y + art_size - 6, 13, alpha, accent)
        _draw_sparkles(ctx, icon_cx, icon_cy, alpha, elapsed, accent)
        if TIER == "ultra_rare":
            _draw_sparkles(ctx, icon_cx, icon_cy, alpha, elapsed, accent, offsets=_ULTRA_SPARKLE_OFFSETS)

    # The container's own pop-in/pop-out scale ends here, *before* any text
    # is drawn. That scale factor changes continuously every frame (the
    # entrance overshoot, and a small continuous shrink during the exit
    # fade) -- text glyphs re-rasterized at a slightly different effective
    # size on every single frame causes visible jitter/"crumbling" as
    # Pango's hinting snaps to different pixel boundaries frame to frame,
    # most noticeable on smaller text (which is exactly why it showed up
    # on Steam Flat's compact font sizes first). The background/icon
    # aren't text, so they don't have this problem and can keep the pop
    # effect; text now draws at a constant size throughout, so it only
    # ever fades, never visibly trembles.
    ctx.restore()  # container scale

    # --- Text ---------------------------------------------------------------
    if template["icon_side"] == "left":
        tx = art_x + art_size + 26
        text_width = card_w - (tx - x) - 24
    else:
        tx = x + 24
        text_width = art_x - tx - 20

    label_style = template["label_style"]
    label_text = _label_text(is_rare, label_style, TIER or None)
    if "app_header" in fx and GAME_NAME:
        # Windows-toast style header: the game's name, then the label.
        label_text = f"{GAME_NAME}  \u2022  {label_text}"

    # Everything so far has been a dark card with light text. A "light_text"
    # template (light/cream card body) needs the opposite: dark text, and
    # a darkened (not lightened) accent tint for the label so it still has
    # contrast against a pale background instead of washing out.
    light_text = template.get("light_text", False)
    if light_text:
        title_rgb = (0.12, 0.12, 0.14)
        subtitle_rgb = (0.38, 0.40, 0.43)
        label_tint = lambda c: _clamp(c * 0.55, 0.0, 1.0)
    else:
        title_rgb = (1, 1, 1)
        subtitle_rgb = (0.72, 0.75, 0.78)
        label_tint = lambda c: _lighten(c, 0.35)
        if "engraved" in fx:
            title_rgb = (0.98, 0.93, 0.80)
            subtitle_rgb = (0.80, 0.72, 0.58)

    if anim.label_alpha > 0:
        label_color = (label_tint(accent[0]), label_tint(accent[1]), label_tint(accent[2]), anim.label_alpha)
        if label_style == "pill_caps":
            layout_w, layout_h = _measure_text(ctx, label_text, label_size, Pango.Weight.BOLD, font_family)
            pill_pad_x, pill_pad_y = 10, 5
            pill_w, pill_h = layout_w + pill_pad_x * 2, layout_h + pill_pad_y * 2
            pill_y = y + label_y_off + anim.label_y - pill_h + 4
            _rounded_rect(ctx, tx, pill_y, pill_w, pill_h, pill_h / 2)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.85 * anim.label_alpha)
            ctx.fill()
            _text(ctx, label_text, tx + pill_pad_x, pill_y + pill_pad_y - 2, label_size,
                  (0.05, 0.05, 0.06, anim.label_alpha), Pango.Weight.BOLD, pill_w, font_family)
        else:
            label_clear = _top_badge_clearance(ctx, percent, font_family, radius)
            _text(ctx, label_text, tx, y + label_y_off + anim.label_y, label_size,
                  label_color, Pango.Weight.BOLD, max(text_width - label_clear, 60) if label_clear else text_width, font_family)

    if fx and "timestamp" in fx and anim.label_alpha > 0:
        stamp_w, _stamp_h = _measure_text(ctx, "now", label_size, Pango.Weight.NORMAL, font_family)
        # With the badge in the top right corner, the "now" stamp moves left of it.
        _text(ctx, "now", x + card_w - 18 - stamp_w - _top_badge_clearance(ctx, percent, font_family, radius), y + label_y_off + anim.label_y, label_size,
              (0.62, 0.66, 0.72, 0.9 * anim.label_alpha), Pango.Weight.NORMAL, stamp_w + 4, font_family)

    if fx and "typing_dots" in fx:
        # Three bouncing dots in a little bubble just before the message
        # arrives, like a chat app's typing indicator.
        dots_a = _clamp((progress - 0.10) / 0.05, 0.0, 1.0) * (1.0 - _clamp((progress - 0.23) / 0.05, 0.0, 1.0))
        if dots_a > 0:
            dots_y = y + title_y_off + title_size * 0.62
            _rounded_rect(ctx, tx - 4, dots_y - 14, 66, 28, 14)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.22 * dots_a)
            ctx.fill()
            for i in range(3):
                bounce = 3.0 * max(0.0, math.sin(elapsed * 9.0 - i * 0.9))
                ctx.set_source_rgba(1, 1, 1, 0.85 * dots_a)
                ctx.arc(tx + 12 + i * 17, dots_y - bounce, 4.0, 0, math.tau)
                ctx.fill()

    title_line = title or "Achievement Unlocked"
    if fx and "prompt" in fx:
        title_line = "> " + title_line
    title_typing = False
    if fx and "typewriter" in fx:
        title_line, title_typing = _typed(title_line, progress, 0.23, 0.42)
    if fx and anim.title_alpha > 0:
        title_y_px = y + title_y_off + anim.title_y
        ghosts = []
        if "chroma_text" in fx:
            ghosts = [(-2.0, 0.0, (0.15, 0.95, 1.0, 0.55 * anim.title_alpha)),
                      (2.0, 0.0, (1.0, 0.25, 0.85, 0.55 * anim.title_alpha))]
        elif "engraved" in fx:
            ghosts = [(-1.0, -1.0, (0.0, 0.0, 0.0, 0.55 * anim.title_alpha)),
                      (1.0, 1.0, (1.0, 0.90, 0.68, 0.26 * anim.title_alpha))]
        glitch = _glitch_amount(progress, elapsed) if "glitch" in fx else 0.0
        if glitch > 0.05:
            jitter = 3.0 * glitch
            ghosts = [(-jitter, 0.0, (1.0, 0.2, 0.3, 0.45 * anim.title_alpha)),
                      (jitter, 0.0, (0.2, 1.0, 1.0, 0.45 * anim.title_alpha))]
        if title_line:
            _text_ghosts(ctx, title_line, tx, title_y_px, title_size, title_weight, text_width, font_family, ghosts)
            _text(ctx, title_line, tx, title_y_px, title_size,
                  (*title_rgb, anim.title_alpha), title_weight, text_width, font_family)
        if glitch > 0.05:
            slice_y = title_y_px + ((int(elapsed * 30) % 5) * 5.0)
            ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.22 * anim.title_alpha)
            ctx.rectangle(tx, slice_y, min(text_width, 260.0), 3.0)
            ctx.fill()
        want_cursor = (bg == "terminal" and int(elapsed * 2) % 2 == 0) or (
            title_typing and "typewriter" in fx and int(elapsed * 8) % 2 == 0
        )
        if want_cursor:
            title_w, title_h = _measure_text(ctx, title_line or " ", title_size, title_weight, font_family)
            cursor_x = tx + min(title_w, text_width) + 4
            ctx.rectangle(cursor_x, title_y_px + title_h * 0.08, title_size * 0.55, title_h * 0.82)
            ctx.set_source_rgba(*title_rgb, anim.title_alpha)
            ctx.fill()
    elif anim.title_alpha > 0:
        _text(ctx, title or "Achievement Unlocked", tx, y + title_y_off + anim.title_y, title_size,
              (*title_rgb, anim.title_alpha), title_weight, text_width, font_family)
        if bg == "terminal" and int(elapsed * 2) % 2 == 0:
            # A blinking block cursor right after the title, like a
            # terminal prompt -- toggles twice a second.
            title_w, title_h = _measure_text(ctx, title or "Achievement Unlocked", title_size, title_weight, font_family)
            cursor_x = tx + min(title_w, text_width) + 4
            ctx.rectangle(cursor_x, y + title_y_off + anim.title_y + title_h * 0.08, title_size * 0.55, title_h * 0.82)
            ctx.set_source_rgba(*title_rgb, anim.title_alpha)
            ctx.fill()

    if subtitle and anim.subtitle_alpha > 0:
        # The description can wrap onto a second line; keep it clear of the
        # unlock-percentage badge in the bottom corner.
        subtitle_width = text_width
        if percent is not None and not PERCENT_AT_TOP:
            subtitle_width = max(text_width - _percent_pill_width(ctx, percent, font_family) - 12, 60)
        sub_lines = 2 if PERCENT_AT_TOP else None       # top-right badge: full width, up to two lines
        subtitle_line = subtitle
        if fx and "typewriter" in fx:
            subtitle_line, _sub_typing = _typed(subtitle, progress, 0.34, 0.62)
        sub_y_px = y + subtitle_y_off + anim.subtitle_y
        if fx and "engraved" in fx and subtitle_line:
            _text_ghosts(ctx, subtitle_line, tx, sub_y_px, subtitle_size, Pango.Weight.NORMAL, subtitle_width, font_family,
                         [(-1.0, -1.0, (0.0, 0.0, 0.0, 0.45 * anim.subtitle_alpha)),
                          (1.0, 1.0, (1.0, 0.90, 0.68, 0.20 * anim.subtitle_alpha))], max_lines=sub_lines)
        if subtitle_line:
            _text(ctx, subtitle_line, tx, sub_y_px, subtitle_size,
                  (*subtitle_rgb, 0.92 * anim.subtitle_alpha), Pango.Weight.NORMAL, subtitle_width, font_family,
                  max_lines=sub_lines)

    # Gamerscore is shown only when supplied by the caller; never fake a value.
    score = os.environ.get("FINALLY_GAMERSCORE", "").strip()

    # Unlock percentage in the bottom corner on the text side (away from
    # the icon); steps aside for the gamerscore pill if that's ever shown.
    if percent is not None:
        percent_alpha = anim.subtitle_alpha if subtitle else anim.title_alpha
        score_offset = 92 if score else 0
        # Right-aligned to the end of the text area on every layout: for
        # icon-left templates that's the card's right edge, for icon-right
        # ones (Trophy Case) it's just left of the icon. Either way it sits
        # beside the (narrowed) description, never under its first words.
        if template["icon_side"] == "left":
            pill_right = x + card_w - _pill_right_gap(radius) - score_offset
        else:
            pill_right = tx + text_width - score_offset
        if PERCENT_AT_TOP:
            _draw_percent_pill(ctx, pill_right, 0.0, True, percent, percent_alpha, light_text, font_family,
                               top_y=y + PERCENT_TOP_GAP)
        else:
            _draw_percent_pill(ctx, pill_right, y + card_h - 12, True,
                               percent, percent_alpha, light_text, font_family)

    if score and anim.pill_alpha > 0:
        pill_w, pill_h = 84, 32
        pill_x = x + 20 if template["icon_side"] == "right" else x + card_w - pill_w - 20
        pill_y = y + card_h - pill_h - 14
        ctx.save()
        pcx, pcy = pill_x + pill_w / 2, pill_y + pill_h / 2
        ctx.translate(pcx, pcy)
        ctx.scale(max(anim.pill_scale, 0.001), max(anim.pill_scale, 0.001))
        ctx.translate(-pcx, -pcy)
        _rounded_rect(ctx, pill_x, pill_y, pill_w, pill_h, pill_h / 2)
        ctx.set_source_rgba(accent[0], accent[1], accent[2], 0.16 * anim.pill_alpha)
        ctx.fill()
        coin_cx, coin_cy = pill_x + 18, pcy
        _draw_star_polygon(ctx, coin_cx, coin_cy, 9, 4)
        ctx.set_source_rgba(_lighten(accent[0], 0.3), _lighten(accent[1], 0.3), _lighten(accent[2], 0.3), anim.pill_alpha)
        ctx.fill()
        _text(ctx, f"{score}G", pill_x + 32, pill_y + 7, 16,
              (1, 1, 1, anim.pill_alpha), Pango.Weight.BOLD, pill_w - 36, font_family)
        ctx.restore()

    surface.flush()
    return surface


def _set_cardinal(display, window, name, value=1):
    atom = x11.XInternAtom(display, name.encode("ascii"), 0)
    cardinal = x11.XInternAtom(display, b"CARDINAL", 0)
    data = (ctypes.c_ulong * 1)(value)
    x11.XChangeProperty(display, window, atom, cardinal, 32, 0, data, 1)


def main():
    _configure_ctypes()
    title = os.environ.get("FINALLY_TITLE", sys.argv[1] if len(sys.argv) > 1 else "Achievement Unlocked")
    subtitle = os.environ.get("FINALLY_SUBTITLE", sys.argv[2] if len(sys.argv) > 2 else "")
    is_rare = os.environ.get("FINALLY_RARE", "0") == "1"
    seconds = float(os.environ.get("FINALLY_SECONDS", "5.8"))
    icon_path = os.environ.get("FINALLY_ICON_PATH", "")
    global PLACEHOLDER_STYLE, PLACEHOLDER_ICON_PATH, RING_SCALE, PERCENT_SCALE, TIER, FX_ENABLED, GAME_NAME, PRESET_ACTIVE, PERCENT_AT_TOP
    FX_ENABLED = os.environ.get("FINALLY_TEMPLATE_FX", "1") != "0"
    global GAME_ART_PATH
    GAME_ART_PATH = os.environ.get("FINALLY_GAME_ART_PATH", "")
    GAME_NAME = os.environ.get("FINALLY_GAME_NAME", "").strip()
    TIER = os.environ.get("FINALLY_TIER", "")
    if TIER not in ("uncommon", "rare", "ultra_rare"):
        TIER = ""
    PLACEHOLDER_STYLE = os.environ.get("FINALLY_PLACEHOLDER_STYLE", "auto")
    if PLACEHOLDER_STYLE not in ("auto", "trophy", "game_icon"):
        PLACEHOLDER_STYLE = "auto"
    PLACEHOLDER_ICON_PATH = os.environ.get("FINALLY_PLACEHOLDER_ICON_PATH", "")
    size_percent = _clamp(float(os.environ.get("FINALLY_SIZE_PERCENT", "50")), 0.0, 100.0)
    if size_percent <= 0:
        return
    position = _resolve_position(os.environ.get("FINALLY_POSITION", DEFAULT_POSITION))
    template = _resolve_template(os.environ.get("FINALLY_TEMPLATE", DEFAULT_TEMPLATE))
    if template.get("force_position"):
        position = _resolve_position(template["force_position"])

    def _env_font_size(name, default, lo, hi):
        try:
            return _clamp(float(os.environ.get(name, str(default))), lo, hi)
        except (TypeError, ValueError):
            return default

    label_font_size = _env_font_size("FINALLY_LABEL_SIZE", 13, 9, 18)
    title_font_size = _env_font_size("FINALLY_TITLE_SIZE", 26, 18, 34)
    subtitle_font_size = _env_font_size("FINALLY_SUBTITLE_SIZE", 18, 12, 22)
    glow_enabled = os.environ.get("FINALLY_GLOW_ENABLED", "1") != "0"
    glow_intensity = _clamp(_env_font_size("FINALLY_GLOW_INTENSITY", 50, 0, 100), 0, 100)
    RING_SCALE = _clamp(_env_font_size("FINALLY_RING_SIZE", 50, 0, 100), 0, 100) / 50.0
    PERCENT_SCALE = _clamp(_env_font_size("FINALLY_PERCENT_SIZE", 100, 70, 150), 70, 150) / 100.0
    PERCENT_AT_TOP = os.environ.get("FINALLY_PERCENT_POSITION", "bottom_right") == "top_right"
    gradient_direction = _resolve_gradient_direction(os.environ.get("FINALLY_GRADIENT_DIRECTION"))
    glow_normal_enabled = os.environ.get("FINALLY_GLOW_NORMAL", "0") == "1"
    frame_ring_enabled = os.environ.get("FINALLY_FRAME_RING_ENABLED", "1") != "0"
    percent = None
    if os.environ.get("FINALLY_PERCENT_ENABLED", "1") != "0":
        try:
            percent_raw = os.environ.get("FINALLY_PERCENT", "").strip()
            percent = _clamp(float(percent_raw), 0.0, 100.0) if percent_raw else None
        except ValueError:
            percent = None
    # Modern Xbox-style defaults: deep charcoal card, Xbox green for normal
    # unlocks, gold for rare ones (matching the "rare achievement" treatment
    # on the Xbox dashboard).
    normal_start = _parse_color(os.environ.get("FINALLY_NORMAL_GRADIENT_START"), (0.09, 0.32, 0.14, 0.94))
    normal_end = _parse_color(os.environ.get("FINALLY_NORMAL_GRADIENT_END"), (0.04, 0.16, 0.07, 0.94))
    rare_start = _parse_color(os.environ.get("FINALLY_RARE_GRADIENT_START"), (0.55, 0.42, 0.05, 0.95))
    rare_end = _parse_color(os.environ.get("FINALLY_RARE_GRADIENT_END"), (0.30, 0.20, 0.03, 0.95))
    normal_circle = _parse_color(os.environ.get("FINALLY_NORMAL_CIRCLE_COLOR"), (0.24, 0.78, 0.35, 1.0))
    rare_circle = _parse_color(os.environ.get("FINALLY_RARE_CIRCLE_COLOR"), (0.96, 0.78, 0.25, 1.0))
    gradient_start = rare_start if is_rare else normal_start
    gradient_end = rare_end if is_rare else normal_end
    circle_color = rare_circle if is_rare else normal_circle

    game_art_gradient_enabled = os.environ.get("FINALLY_GAME_ART_GRADIENT_ENABLED", "0") == "1"
    # Either source turns on the same icon-driven gradient machinery below.
    icon_gradient_enabled = (
        os.environ.get("FINALLY_ICON_GRADIENT_ENABLED", "0") == "1" or game_art_gradient_enabled
    )
    icon_gradient_active = False

    # "Use each template's own colors": the template's built-in palette
    # replaces every user color choice (fixed colors, direction, and both
    # gradient-from-image options).
    PRESET_ACTIVE, gradient_start, gradient_end, circle_color, gradient_direction = _apply_preset_colors(
        os.environ.get("FINALLY_TEMPLATE_COLORS", "0") == "1",
        os.environ.get("FINALLY_TEMPLATE", DEFAULT_TEMPLATE),
        gradient_start, gradient_end, circle_color, gradient_direction,
    )
    if PRESET_ACTIVE:
        icon_gradient_enabled = False
    # Templates can opt out (Paper Light does -- see its "icon_gradient"
    # flag); for those the setting is simply ignored.
    if icon_gradient_enabled and template.get("icon_gradient", True):
        extracted = _pick_gradient_colors(
            icon_path,
            use_game_art=game_art_gradient_enabled,
            game_art_path=os.environ.get("FINALLY_GAME_ART_PATH", ""),
        )
        if extracted:
            icon_gradient_active = True
            (lr, lg, lb), (dr, dg, db) = extracted
            # Keep the configured alpha (normal/rare card opacity); only
            # the RGB comes from the icon. Falls back to the static
            # configured gradient above if extraction found nothing usable.
            gradient_start = (lr, lg, lb, gradient_start[3])
            gradient_end = (dr, dg, db, gradient_end[3])

    width, height = _display_size()

    _glfw_prefer_x11()
    if not glfw.glfwInit():
        raise SystemExit("glfwInit failed: " + (_glfw_error() or "could not connect to the display"))
    try:
        window_hints = (
            (GLFW_CONTEXT_VERSION_MAJOR, 3),
            (GLFW_CONTEXT_VERSION_MINOR, 0),
            (GLFW_DEPTH_BITS, 0),
            (GLFW_STENCIL_BITS, 0),
            (GLFW_DECORATED, GLFW_FALSE),
            (GLFW_RESIZABLE, GLFW_TRUE),
            (GLFW_VISIBLE, GLFW_FALSE),
            (GLFW_FLOATING, GLFW_TRUE),
            (GLFW_FOCUSED, GLFW_FALSE),
            (GLFW_FOCUS_ON_SHOW, GLFW_FALSE),
            (GLFW_MOUSE_PASSTHROUGH, GLFW_TRUE),
            (GLFW_TRANSPARENT_FRAMEBUFFER, GLFW_TRUE),
        )
        win, note = _glfw_create_window(window_hints, width, height, b"mangoapp overlay window")
        if not win:
            raise SystemExit("glfwCreateWindow failed: " + note)
        glfw.glfwSetWindowPos(win, 0, 0)
        glfw.glfwMakeContextCurrent(win)
        glfw.glfwSwapInterval(1)

        display = glfw.glfwGetX11Display()
        xwin = glfw.glfwGetX11Window(win)
        _set_cardinal(display, xwin, "GAMESCOPE_EXTERNAL_OVERLAY", 1)
        _set_cardinal(display, xwin, "GAMESCOPE_NO_FOCUS", 1)
        x11.XFlush(display)

        scale = _clamp(min(width / 1920, height / 1080), 0.85, 2.0)
        overlay_scale = scale * (size_percent / 100.0)
        card_width = int(CANVAS_W * overlay_scale)
        card_height = int(CANVAS_H * overlay_scale)

        # Resting position for the chosen anchor. The texture has symmetric
        # padding (see CANVAS_W/CANVAS_H), so the card's actual visible edge
        # sits PAD*_scale inside the quad's edge on every side -- account
        # for that so "left"/"right"/"top" margins measure the visible card,
        # not the invisible padding around it.
        pad_x_px = PAD_X * overlay_scale
        pad_y_px = PAD_Y * overlay_scale
        margin_x_px = EDGE_MARGIN_X * overlay_scale
        margin_y_px = EDGE_MARGIN_Y * overlay_scale

        if position["h"] == "left":
            card_x = int(margin_x_px - pad_x_px)
        elif position["h"] == "right":
            card_x = int(width - margin_x_px - card_width + pad_x_px)
        else:
            card_x = int((width - card_width) / 2)

        if position["v"] == "top":
            card_y = int(margin_y_px - pad_y_px)
        else:
            card_y = int(height - card_height - margin_y_px + pad_y_px)

        surface = _make_surface(
            card_width,
            card_height,
            overlay_scale,
            title,
            subtitle,
            is_rare,
            0.0,
            icon_path,
            gradient_start,
            gradient_end,
            circle_color,
            template=template,
            total_seconds=seconds,
            label_font_size=label_font_size,
            title_font_size=title_font_size,
            subtitle_font_size=subtitle_font_size,
            glow_enabled=glow_enabled,
            glow_intensity=glow_intensity,
            gradient_direction=gradient_direction,
            glow_normal_enabled=glow_normal_enabled,
            frame_ring_enabled=frame_ring_enabled,
            icon_gradient_active=icon_gradient_active,
            percent=percent,
        )
        texture_buf = ctypes.create_string_buffer(bytes(surface.get_data()))
        tex = ctypes.c_uint()
        gl.glGenTextures(1, ctypes.byref(tex))
        gl.glBindTexture(GL_TEXTURE_2D, tex.value)
        gl.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        gl.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
        gl.glTexImage2D(
            GL_TEXTURE_2D,
            0,
            GL_RGBA,
            card_width,
            card_height,
            0,
            GL_BGRA,
            GL_UNSIGNED_BYTE,
            ctypes.cast(texture_buf, ctypes.c_void_p),
        )

        def draw_card(progress):
            surface = _make_surface(
                card_width,
                card_height,
                overlay_scale,
                title,
                subtitle,
                is_rare,
                progress,
                icon_path,
                gradient_start,
                gradient_end,
                circle_color,
                template=template,
                total_seconds=seconds,
                label_font_size=label_font_size,
                title_font_size=title_font_size,
                subtitle_font_size=subtitle_font_size,
                glow_enabled=glow_enabled,
                glow_intensity=glow_intensity,
                gradient_direction=gradient_direction,
                glow_normal_enabled=glow_normal_enabled,
                frame_ring_enabled=frame_ring_enabled,
            icon_gradient_active=icon_gradient_active,
            percent=percent,
            )
            frame_buf = ctypes.create_string_buffer(bytes(surface.get_data()))
            gl.glBindTexture(GL_TEXTURE_2D, tex.value)
            gl.glTexImage2D(
                GL_TEXTURE_2D,
                0,
                GL_RGBA,
                card_width,
                card_height,
                0,
                GL_BGRA,
                GL_UNSIGNED_BYTE,
                ctypes.cast(frame_buf, ctypes.c_void_p),
            )

            anim = _animation_state(progress)
            # Slide-in/out is applied here, at the GL-quad level, against a
            # texture whose visible content is always dead-center. That's
            # what keeps the resting position perfectly centered (or flush
            # against whichever edge the user picked) no matter how far the
            # entrance/exit slide travels. The direction depends on the
            # chosen screen position (see POSITIONS above). Templates with
            # their own built-in reveal animation (e.g. xbox_360_classic's
            # door-wipe) opt out via "slide": False, so this generic slide
            # doesn't fight with their own entrance/exit motion.
            x_shift, y_shift = _slide_shift(template, anim, overlay_scale, position)
            if template.get("layout") == "door_wipe" and template.get("variant") == "v2":
                # This template's own bottom-middle-to-left-and-back travel
                # (see _door_v2_slide_x), instead of the generic slide.
                x_shift = _door_v2_slide_x(progress) * overlay_scale

            gl.glViewport(0, 0, width, height)
            gl.glClearColor(0, 0, 0, 0)
            gl.glClear(GL_COLOR_BUFFER_BIT)
            gl.glEnable(GL_BLEND)
            gl.glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA)
            gl.glEnable(GL_TEXTURE_2D)
            gl.glBindTexture(GL_TEXTURE_2D, tex.value)
            gl.glColor4f(1.0, 1.0, 1.0, 1.0)
            gl.glMatrixMode(GL_PROJECTION)
            gl.glLoadIdentity()
            gl.glOrtho(0, width, height, 0, -1, 1)
            gl.glMatrixMode(GL_MODELVIEW)
            gl.glLoadIdentity()
            qx = card_x + x_shift
            qy = card_y + y_shift
            gl.glBegin(GL_QUADS)
            gl.glTexCoord2f(0, 0)
            gl.glVertex2f(qx, qy)
            gl.glTexCoord2f(1, 0)
            gl.glVertex2f(qx + card_width, qy)
            gl.glTexCoord2f(1, 1)
            gl.glVertex2f(qx + card_width, qy + card_height)
            gl.glTexCoord2f(0, 1)
            gl.glVertex2f(qx, qy + card_height)
            gl.glEnd()
            glfw.glfwSwapBuffers(win)
            glfw.glfwPollEvents()

        draw_card(0.0)
        glfw.glfwShowWindow(win)
        x11.XFlush(display)

        started_at = time.time()
        deadline = started_at + seconds
        while time.time() < deadline:
            progress = _clamp((time.time() - started_at) / seconds, 0.0, 1.0)
            draw_card(progress)
    finally:
        glfw.glfwTerminate()


if __name__ == "__main__":
    main()
