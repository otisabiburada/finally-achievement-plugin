"""Drawing layer for the popup/tracker renderer that needs only the system
C libraries (libcairo, libpango, libpangocairo, libgdk_pixbuf, libgobject),
reached through ctypes. No pycairo, no PyGObject.

Why it exists: the renderer was written against pycairo and PyGObject, which
SteamOS ships but other handheld images (for example a Legion Go) often don't
-- the popup then never appears. This module provides the same small API
surface the renderer actually uses (nothing more), under the same names:

    cairo      ImageSurface, Context, LinearGradient, RadialGradient + constants
    Pango      Weight, SCALE, EllipsizeMode, FontDescription
    PangoCairo create_layout, show_layout
    GdkPixbuf  Pixbuf (file loading, scaling, cropping, pixel access), InterpType
    Gdk        cairo_set_source_pixbuf

finally_gamescope_overlay.py uses pycairo/PyGObject when both are importable
(the Steam Deck path, unchanged) and falls back to this module otherwise.
Set FINALLY_FORCE_CTYPES_DRAWING=1 to use this module even when they exist.
"""
import ctypes
import ctypes.util
import types

_DOUBLE = ctypes.c_double
_VP = ctypes.c_void_p


def _load(label, names, find_as):
    tried = list(names)
    for base in ("/usr/lib64/", "/usr/lib/x86_64-linux-gnu/", "/usr/lib/"):
        tried.extend(base + n for n in names if "." in n and not n.endswith(".so"))
    located = ctypes.util.find_library(find_as)
    if located:
        tried.append(located)
    for name in tried:
        try:
            return ctypes.CDLL(name)
        except OSError:
            continue
    raise ImportError(f"{label} not found (tried {', '.join(names)}); install it to use the built-in drawing layer")


_cairo = _load("libcairo", ("libcairo.so.2", "libcairo.so"), "cairo")
_pango = _load("libpango", ("libpango-1.0.so.0", "libpango-1.0.so"), "pango-1.0")
_pangocairo = _load("libpangocairo", ("libpangocairo-1.0.so.0", "libpangocairo-1.0.so"), "pangocairo-1.0")
_gobject = _load("libgobject", ("libgobject-2.0.so.0", "libgobject-2.0.so"), "gobject-2.0")
_glib = _load("libglib", ("libglib-2.0.so.0", "libglib-2.0.so"), "glib-2.0")
_pixbuf = _load("libgdk_pixbuf", ("libgdk_pixbuf-2.0.so.0", "libgdk_pixbuf-2.0.so"), "gdk_pixbuf-2.0")


def _sig(lib, name, restype, *argtypes):
    func = getattr(lib, name)
    func.restype = restype
    func.argtypes = list(argtypes)
    return func


# --- cairo -----------------------------------------------------------------
_c_surface_create = _sig(_cairo, "cairo_image_surface_create", _VP, ctypes.c_int, ctypes.c_int, ctypes.c_int)
_c_surface_destroy = _sig(_cairo, "cairo_surface_destroy", None, _VP)
_c_surface_flush = _sig(_cairo, "cairo_surface_flush", None, _VP)
_c_surface_dirty = _sig(_cairo, "cairo_surface_mark_dirty", None, _VP)
_c_surface_data = _sig(_cairo, "cairo_image_surface_get_data", _VP, _VP)
_c_surface_stride = _sig(_cairo, "cairo_image_surface_get_stride", ctypes.c_int, _VP)
_c_surface_width = _sig(_cairo, "cairo_image_surface_get_width", ctypes.c_int, _VP)
_c_surface_height = _sig(_cairo, "cairo_image_surface_get_height", ctypes.c_int, _VP)
_c_surface_png = _sig(_cairo, "cairo_surface_write_to_png", ctypes.c_int, _VP, ctypes.c_char_p)
_c_create = _sig(_cairo, "cairo_create", _VP, _VP)
_c_destroy = _sig(_cairo, "cairo_destroy", None, _VP)
_c_save = _sig(_cairo, "cairo_save", None, _VP)
_c_restore = _sig(_cairo, "cairo_restore", None, _VP)
_c_translate = _sig(_cairo, "cairo_translate", None, _VP, _DOUBLE, _DOUBLE)
_c_scale = _sig(_cairo, "cairo_scale", None, _VP, _DOUBLE, _DOUBLE)
_c_rotate = _sig(_cairo, "cairo_rotate", None, _VP, _DOUBLE)
_c_set_rgba = _sig(_cairo, "cairo_set_source_rgba", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_set_source = _sig(_cairo, "cairo_set_source", None, _VP, _VP)
_c_set_source_surface = _sig(_cairo, "cairo_set_source_surface", None, _VP, _VP, _DOUBLE, _DOUBLE)
_c_get_source = _sig(_cairo, "cairo_get_source", _VP, _VP)
_c_set_operator = _sig(_cairo, "cairo_set_operator", None, _VP, ctypes.c_int)
_c_paint = _sig(_cairo, "cairo_paint", None, _VP)
_c_paint_alpha = _sig(_cairo, "cairo_paint_with_alpha", None, _VP, _DOUBLE)
_c_fill = _sig(_cairo, "cairo_fill", None, _VP)
_c_stroke = _sig(_cairo, "cairo_stroke", None, _VP)
_c_clip = _sig(_cairo, "cairo_clip", None, _VP)
_c_new_path = _sig(_cairo, "cairo_new_path", None, _VP)
_c_new_sub_path = _sig(_cairo, "cairo_new_sub_path", None, _VP)
_c_move_to = _sig(_cairo, "cairo_move_to", None, _VP, _DOUBLE, _DOUBLE)
_c_line_to = _sig(_cairo, "cairo_line_to", None, _VP, _DOUBLE, _DOUBLE)
_c_curve_to = _sig(_cairo, "cairo_curve_to", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_arc = _sig(_cairo, "cairo_arc", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_close_path = _sig(_cairo, "cairo_close_path", None, _VP)
_c_rectangle = _sig(_cairo, "cairo_rectangle", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_line_width = _sig(_cairo, "cairo_set_line_width", None, _VP, _DOUBLE)
_c_pattern_linear = _sig(_cairo, "cairo_pattern_create_linear", _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_pattern_radial = _sig(_cairo, "cairo_pattern_create_radial", _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_pattern_destroy = _sig(_cairo, "cairo_pattern_destroy", None, _VP)
_c_stop_rgba = _sig(_cairo, "cairo_pattern_add_color_stop_rgba", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_stop_rgb = _sig(_cairo, "cairo_pattern_add_color_stop_rgb", None, _VP, _DOUBLE, _DOUBLE, _DOUBLE, _DOUBLE)
_c_pattern_filter = _sig(_cairo, "cairo_pattern_set_filter", None, _VP, ctypes.c_int)

FORMAT_ARGB32 = 0
FORMAT_RGB24 = 1
OPERATOR_CLEAR = 0
OPERATOR_SOURCE = 1
OPERATOR_OVER = 2
FILL_RULE_WINDING = 0
FILL_RULE_EVEN_ODD = 1
FILTER_FAST = 0
FILTER_GOOD = 1
FILTER_BEST = 2
FILTER_NEAREST = 3
FILTER_BILINEAR = 4


class ImageSurface:
    def __init__(self, fmt, width, height):
        self._ptr = _c_surface_create(int(fmt), int(width), int(height))
        if not self._ptr:
            raise MemoryError("cairo could not create an image surface")

    def get_width(self):
        return _c_surface_width(self._ptr)

    def get_height(self):
        return _c_surface_height(self._ptr)

    def get_stride(self):
        return _c_surface_stride(self._ptr)

    def flush(self):
        _c_surface_flush(self._ptr)

    def mark_dirty(self):
        _c_surface_dirty(self._ptr)

    def get_data(self):
        """Writable memoryview over the pixels (premultiplied BGRA bytes),
        like pycairo's. Valid while the surface is alive."""
        size = self.get_stride() * self.get_height()
        return memoryview((ctypes.c_char * size).from_address(_c_surface_data(self._ptr))).cast("B")

    def write_to_png(self, path):
        status = _c_surface_png(self._ptr, str(path).encode())
        if status != 0:
            raise OSError(f"cairo_surface_write_to_png failed ({status})")

    def __del__(self):
        try:
            if getattr(self, "_ptr", None):
                _c_surface_destroy(self._ptr)
                self._ptr = None
        except Exception:
            pass


class Pattern:
    _owned = True

    def set_filter(self, filter_):
        _c_pattern_filter(self._ptr, int(filter_))

    def __del__(self):
        try:
            if self._owned and getattr(self, "_ptr", None):
                _c_pattern_destroy(self._ptr)
                self._ptr = None
        except Exception:
            pass


class LinearGradient(Pattern):
    def __init__(self, x0, y0, x1, y1):
        self._ptr = _c_pattern_linear(x0, y0, x1, y1)

    def add_color_stop_rgba(self, offset, r, g, b, a):
        _c_stop_rgba(self._ptr, offset, r, g, b, a)

    def add_color_stop_rgb(self, offset, r, g, b):
        _c_stop_rgb(self._ptr, offset, r, g, b)


class RadialGradient(Pattern):
    def __init__(self, cx0, cy0, r0, cx1, cy1, r1):
        self._ptr = _c_pattern_radial(cx0, cy0, r0, cx1, cy1, r1)

    def add_color_stop_rgba(self, offset, r, g, b, a):
        _c_stop_rgba(self._ptr, offset, r, g, b, a)

    def add_color_stop_rgb(self, offset, r, g, b):
        _c_stop_rgb(self._ptr, offset, r, g, b)


class _BorrowedPattern(Pattern):
    """The pattern cairo_get_source returns belongs to the context."""
    _owned = False

    def __init__(self, ptr):
        self._ptr = ptr


class Context:
    def __init__(self, surface):
        self._surface = surface              # keep it alive as long as the context
        self._ptr = _c_create(surface._ptr)
        if not self._ptr:
            raise MemoryError("cairo could not create a context")

    def save(self): _c_save(self._ptr)
    def restore(self): _c_restore(self._ptr)
    def translate(self, x, y): _c_translate(self._ptr, x, y)
    def scale(self, sx, sy): _c_scale(self._ptr, sx, sy)
    def rotate(self, angle): _c_rotate(self._ptr, angle)
    def set_source_rgba(self, r, g, b, a=1.0): _c_set_rgba(self._ptr, r, g, b, a)
    def set_source_rgb(self, r, g, b): _c_set_rgba(self._ptr, r, g, b, 1.0)
    def set_source(self, pattern): _c_set_source(self._ptr, pattern._ptr)
    def set_source_surface(self, surface, x=0.0, y=0.0): _c_set_source_surface(self._ptr, surface._ptr, x, y)
    def get_source(self): return _BorrowedPattern(_c_get_source(self._ptr))
    def set_operator(self, op): _c_set_operator(self._ptr, int(op))
    def paint(self): _c_paint(self._ptr)
    def paint_with_alpha(self, alpha): _c_paint_alpha(self._ptr, alpha)
    def fill(self): _c_fill(self._ptr)
    def stroke(self): _c_stroke(self._ptr)
    def clip(self): _c_clip(self._ptr)
    def new_path(self): _c_new_path(self._ptr)
    def new_sub_path(self): _c_new_sub_path(self._ptr)
    def move_to(self, x, y): _c_move_to(self._ptr, x, y)
    def line_to(self, x, y): _c_line_to(self._ptr, x, y)
    def curve_to(self, x1, y1, x2, y2, x3, y3): _c_curve_to(self._ptr, x1, y1, x2, y2, x3, y3)
    def arc(self, xc, yc, radius, angle1, angle2): _c_arc(self._ptr, xc, yc, radius, angle1, angle2)
    def close_path(self): _c_close_path(self._ptr)
    def rectangle(self, x, y, width, height): _c_rectangle(self._ptr, x, y, width, height)
    def set_line_width(self, width): _c_line_width(self._ptr, width)

    def __del__(self):
        try:
            if getattr(self, "_ptr", None):
                _c_destroy(self._ptr)
                self._ptr = None
        except Exception:
            pass


# --- Pango -------------------------------------------------------------------
_p_fd_new = _sig(_pango, "pango_font_description_new", _VP)
_p_fd_free = _sig(_pango, "pango_font_description_free", None, _VP)
_p_fd_family = _sig(_pango, "pango_font_description_set_family", None, _VP, ctypes.c_char_p)
_p_fd_size = _sig(_pango, "pango_font_description_set_absolute_size", None, _VP, _DOUBLE)
_p_fd_weight = _sig(_pango, "pango_font_description_set_weight", None, _VP, ctypes.c_int)
_p_layout_font = _sig(_pango, "pango_layout_set_font_description", None, _VP, _VP)
_p_layout_text = _sig(_pango, "pango_layout_set_text", None, _VP, ctypes.c_char_p, ctypes.c_int)
_p_layout_width = _sig(_pango, "pango_layout_set_width", None, _VP, ctypes.c_int)
_p_layout_height = _sig(_pango, "pango_layout_set_height", None, _VP, ctypes.c_int)
_p_layout_ellipsize = _sig(_pango, "pango_layout_set_ellipsize", None, _VP, ctypes.c_int)
_p_layout_pixel_size = _sig(_pango, "pango_layout_get_pixel_size", None, _VP, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int))
_pc_create_layout = _sig(_pangocairo, "pango_cairo_create_layout", _VP, _VP)
_pc_show_layout = _sig(_pangocairo, "pango_cairo_show_layout", None, _VP, _VP)
_g_object_unref = _sig(_gobject, "g_object_unref", None, _VP)


class FontDescription:
    def __init__(self):
        self._ptr = _p_fd_new()

    def set_family(self, family): _p_fd_family(self._ptr, str(family).encode())
    def set_absolute_size(self, size): _p_fd_size(self._ptr, float(size))
    def set_weight(self, weight): _p_fd_weight(self._ptr, int(weight))

    def __del__(self):
        try:
            if getattr(self, "_ptr", None):
                _p_fd_free(self._ptr)
                self._ptr = None
        except Exception:
            pass


class Layout:
    def __init__(self, ptr):
        self._ptr = ptr

    def set_font_description(self, desc): _p_layout_font(self._ptr, desc._ptr)
    def set_text(self, text, length=-1): _p_layout_text(self._ptr, str(text).encode("utf-8"), -1 if length < 0 else int(length))
    def set_width(self, width): _p_layout_width(self._ptr, int(width))
    def set_height(self, height): _p_layout_height(self._ptr, int(height))
    def set_ellipsize(self, mode): _p_layout_ellipsize(self._ptr, int(mode))

    def get_pixel_size(self):
        w, h = ctypes.c_int(), ctypes.c_int()
        _p_layout_pixel_size(self._ptr, ctypes.byref(w), ctypes.byref(h))
        return w.value, h.value

    def __del__(self):
        try:
            if getattr(self, "_ptr", None):
                _g_object_unref(self._ptr)
                self._ptr = None
        except Exception:
            pass


def _create_layout(ctx):
    return Layout(_pc_create_layout(ctx._ptr))


def _show_layout(ctx, layout):
    _pc_show_layout(ctx._ptr, layout._ptr)


# --- GdkPixbuf ---------------------------------------------------------------
class _GError(ctypes.Structure):
    _fields_ = [("domain", ctypes.c_uint32), ("code", ctypes.c_int), ("message", ctypes.c_char_p)]


_GErrorPtr = ctypes.POINTER(_GError)
_g_error_free = _sig(_glib, "g_error_free", None, _VP)
_pb_from_file = _sig(_pixbuf, "gdk_pixbuf_new_from_file", _VP, ctypes.c_char_p, ctypes.POINTER(_GErrorPtr))
_pb_from_file_scaled = _sig(_pixbuf, "gdk_pixbuf_new_from_file_at_scale", _VP, ctypes.c_char_p, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.POINTER(_GErrorPtr))
_pb_file_info = _sig(_pixbuf, "gdk_pixbuf_get_file_info", _VP, ctypes.c_char_p, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int))
_pb_width = _sig(_pixbuf, "gdk_pixbuf_get_width", ctypes.c_int, _VP)
_pb_height = _sig(_pixbuf, "gdk_pixbuf_get_height", ctypes.c_int, _VP)
_pb_rowstride = _sig(_pixbuf, "gdk_pixbuf_get_rowstride", ctypes.c_int, _VP)
_pb_channels = _sig(_pixbuf, "gdk_pixbuf_get_n_channels", ctypes.c_int, _VP)
_pb_has_alpha = _sig(_pixbuf, "gdk_pixbuf_get_has_alpha", ctypes.c_int, _VP)
_pb_pixels = _sig(_pixbuf, "gdk_pixbuf_get_pixels_with_length", _VP, _VP, ctypes.POINTER(ctypes.c_uint))
_pb_subpixbuf = _sig(_pixbuf, "gdk_pixbuf_new_subpixbuf", _VP, _VP, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int)
_pb_scale_simple = _sig(_pixbuf, "gdk_pixbuf_scale_simple", _VP, _VP, ctypes.c_int, ctypes.c_int, ctypes.c_int)


def _raise_gerror(err):
    if err:
        message = err.contents.message.decode("utf-8", "replace") if err.contents.message else "unknown pixbuf error"
        _g_error_free(ctypes.cast(err, _VP))
        raise OSError(message)
    raise OSError("could not load the image")


class Pixbuf:
    def __init__(self, ptr, parent=None):
        self._ptr = ptr
        self._parent = parent               # a sub-pixbuf shares its parent's pixels

    @staticmethod
    def new_from_file(path):
        err = _GErrorPtr()
        ptr = _pb_from_file(str(path).encode(), ctypes.byref(err))
        if not ptr:
            _raise_gerror(err)
        return Pixbuf(ptr)

    @staticmethod
    def new_from_file_at_scale(path, width, height, preserve_aspect_ratio):
        err = _GErrorPtr()
        ptr = _pb_from_file_scaled(str(path).encode(), int(width), int(height), 1 if preserve_aspect_ratio else 0, ctypes.byref(err))
        if not ptr:
            _raise_gerror(err)
        return Pixbuf(ptr)

    @staticmethod
    def get_file_info(path):
        w, h = ctypes.c_int(), ctypes.c_int()
        fmt = _pb_file_info(str(path).encode(), ctypes.byref(w), ctypes.byref(h))
        return (fmt, w.value, h.value) if fmt else None

    def get_width(self): return _pb_width(self._ptr)
    def get_height(self): return _pb_height(self._ptr)
    def get_rowstride(self): return _pb_rowstride(self._ptr)
    def get_n_channels(self): return _pb_channels(self._ptr)
    def get_has_alpha(self): return bool(_pb_has_alpha(self._ptr))

    def get_pixels(self):
        length = ctypes.c_uint()
        base = _pb_pixels(self._ptr, ctypes.byref(length))
        return ctypes.string_at(base, length.value)

    def new_subpixbuf(self, x, y, width, height):
        ptr = _pb_subpixbuf(self._ptr, int(x), int(y), int(width), int(height))
        if not ptr:
            raise ValueError("sub-pixbuf is outside the image")
        return Pixbuf(ptr, parent=self)

    def scale_simple(self, width, height, interp):
        ptr = _pb_scale_simple(self._ptr, int(width), int(height), int(interp))
        if not ptr:
            raise MemoryError("could not scale the image")
        return Pixbuf(ptr)

    def __del__(self):
        try:
            if getattr(self, "_ptr", None):
                _g_object_unref(self._ptr)
                self._ptr = None
        except Exception:
            pass


def _pixbuf_to_surface(pixbuf):
    """Pixbuf (RGB or RGBA bytes) -> cairo ARGB32 surface (premultiplied BGRA)."""
    width, height = pixbuf.get_width(), pixbuf.get_height()
    rowstride, channels = pixbuf.get_rowstride(), pixbuf.get_n_channels()
    has_alpha = pixbuf.get_has_alpha() and channels >= 4
    pixels = pixbuf.get_pixels()
    surface = ImageSurface(FORMAT_ARGB32, width, height)
    stride = surface.get_stride()
    surface.flush()
    target = surface.get_data()
    for row in range(height):
        line = pixels[row * rowstride: row * rowstride + width * channels]
        out = bytearray(width * 4)
        if has_alpha:
            alpha = line[3::channels]
            for slot, source in ((0, 2), (1, 1), (2, 0)):          # B, G, R from the pixbuf's R, G, B
                out[slot::4] = bytes((c * a + 127) // 255 for c, a in zip(line[source::channels], alpha))
            out[3::4] = alpha
        else:
            out[0::4] = line[2::channels]
            out[1::4] = line[1::channels]
            out[2::4] = line[0::channels]
            out[3::4] = b"\xff" * width
        target[row * stride: row * stride + width * 4] = out
    surface.mark_dirty()
    return surface


def _set_source_pixbuf(ctx, pixbuf, x, y):
    ctx.set_source_surface(_pixbuf_to_surface(pixbuf), x, y)        # cairo keeps its own reference


# --- namespaces shaped like the pycairo / PyGObject modules the renderer imports ---
cairo = types.SimpleNamespace(
    ImageSurface=ImageSurface, Context=Context, LinearGradient=LinearGradient, RadialGradient=RadialGradient,
    FORMAT_ARGB32=FORMAT_ARGB32, FORMAT_RGB24=FORMAT_RGB24,
    OPERATOR_CLEAR=OPERATOR_CLEAR, OPERATOR_SOURCE=OPERATOR_SOURCE, OPERATOR_OVER=OPERATOR_OVER,
    FILL_RULE_WINDING=FILL_RULE_WINDING, FILL_RULE_EVEN_ODD=FILL_RULE_EVEN_ODD,
    FILTER_FAST=FILTER_FAST, FILTER_GOOD=FILTER_GOOD, FILTER_BEST=FILTER_BEST,
    FILTER_NEAREST=FILTER_NEAREST, FILTER_BILINEAR=FILTER_BILINEAR,
)
Pango = types.SimpleNamespace(
    SCALE=1024,
    Weight=types.SimpleNamespace(NORMAL=400, BOLD=700),
    EllipsizeMode=types.SimpleNamespace(NONE=0, START=1, MIDDLE=2, END=3),
    FontDescription=FontDescription,
)
PangoCairo = types.SimpleNamespace(create_layout=_create_layout, show_layout=_show_layout)
GdkPixbuf = types.SimpleNamespace(Pixbuf=Pixbuf, InterpType=types.SimpleNamespace(NEAREST=0, TILES=1, BILINEAR=2, HYPER=3))
Gdk = types.SimpleNamespace(cairo_set_source_pixbuf=_set_source_pixbuf)
