#!/usr/bin/env python3
"""Persistent, always-on-screen overlay for the pinned achievement.

Runs for as long as main.py keeps it alive and redraws a small card from a
few tiny JSON files main.py writes: the pinned achievement, its last known
live state, the toast plugin's style settings (template, colours, fonts),
and a control file. The card is drawn by the toast renderer's own code
(finally_gamescope_overlay.py) so it always matches the chosen toast template
and colours.

While a toast is on screen the control file asks this process to hide: the
card slides and fades out toward its screen edge, then its window is
DESTROYED (gamescope shows only one external-overlay window, so the toast's
window must have the slot to itself). When the toast is done the window is
recreated and the card slides back in.
"""
import ctypes
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import finally_gamescope_overlay as toast  # noqa: E402  (shares GLFW/GL/X11 handles and all drawing code)

glfw, gl, x11 = toast.glfw, toast.gl, toast.x11
_read_cache = {}


def _read_json(path):
    """Reads a JSON file, re-parsing only when it changed on disk."""
    if not path:
        return None
    try:
        stamp = os.stat(path).st_mtime_ns
    except OSError:
        _read_cache.pop(path, None)
        return None
    cached = _read_cache.get(path)
    if cached and cached[0] == stamp:
        return cached[1]
    try:
        with open(path, "r", encoding="utf-8") as stream:
            data = json.load(stream)
    except Exception:
        return None
    if not isinstance(data, dict):
        return None                            # every file we read is a JSON object
    _read_cache[path] = (stamp, data)
    return data


def _configure_extra():
    glfw.glfwDestroyWindow.argtypes = (ctypes.c_void_p,)
    glfw.glfwDestroyWindow.restype = None
    glfw.glfwMakeContextCurrent.argtypes = (ctypes.c_void_p,)


class OverlayWindow:
    """One GLFW window + GL texture. Created and destroyed as the tracker
    hides and shows."""

    def __init__(self, width, height):
        toast_hints = (
            (toast.GLFW_CONTEXT_VERSION_MAJOR, 3),
            (toast.GLFW_CONTEXT_VERSION_MINOR, 0),
            (toast.GLFW_DEPTH_BITS, 0),
            (toast.GLFW_STENCIL_BITS, 0),
            (toast.GLFW_DECORATED, toast.GLFW_FALSE),
            (toast.GLFW_RESIZABLE, toast.GLFW_TRUE),
            (toast.GLFW_VISIBLE, toast.GLFW_FALSE),
            (toast.GLFW_FLOATING, toast.GLFW_TRUE),
            (toast.GLFW_FOCUSED, toast.GLFW_FALSE),
            (toast.GLFW_FOCUS_ON_SHOW, toast.GLFW_FALSE),
            (toast.GLFW_MOUSE_PASSTHROUGH, toast.GLFW_TRUE),
            (toast.GLFW_TRANSPARENT_FRAMEBUFFER, toast.GLFW_TRUE),
        )
        self.win, note = toast._glfw_create_window(toast_hints, width, height, b"mangoapp overlay window")
        if not self.win:
            raise RuntimeError("glfwCreateWindow failed: " + note)
        glfw.glfwSetWindowPos(self.win, 0, 0)
        glfw.glfwMakeContextCurrent(self.win)
        glfw.glfwSwapInterval(1)
        self.display = glfw.glfwGetX11Display()
        xwin = glfw.glfwGetX11Window(self.win)
        toast._set_cardinal(self.display, xwin, "GAMESCOPE_EXTERNAL_OVERLAY", 1)
        toast._set_cardinal(self.display, xwin, "GAMESCOPE_NO_FOCUS", 1)
        x11.XFlush(self.display)
        self.tex = ctypes.c_uint()
        gl.glGenTextures(1, ctypes.byref(self.tex))
        gl.glBindTexture(toast.GL_TEXTURE_2D, self.tex.value)
        gl.glTexParameteri(toast.GL_TEXTURE_2D, toast.GL_TEXTURE_MIN_FILTER, toast.GL_LINEAR)
        gl.glTexParameteri(toast.GL_TEXTURE_2D, toast.GL_TEXTURE_MAG_FILTER, toast.GL_LINEAR)
        glfw.glfwShowWindow(self.win)
        x11.XFlush(self.display)
        self.uploaded = None     # (key, w, h) of the surface currently in the texture

    def upload(self, key, surface, tex_w, tex_h):
        if self.uploaded == (key, tex_w, tex_h):
            return
        frame_buf = ctypes.create_string_buffer(bytes(surface.get_data()))
        gl.glBindTexture(toast.GL_TEXTURE_2D, self.tex.value)
        gl.glTexImage2D(
            toast.GL_TEXTURE_2D, 0, toast.GL_RGBA, tex_w, tex_h, 0,
            toast.GL_BGRA, toast.GL_UNSIGNED_BYTE, ctypes.cast(frame_buf, ctypes.c_void_p),
        )
        self.uploaded = (key, tex_w, tex_h)

    def draw(self, screen_w, screen_h, x, y, tex_w, tex_h):
        gl.glViewport(0, 0, screen_w, screen_h)
        gl.glClearColor(0, 0, 0, 0)
        gl.glClear(toast.GL_COLOR_BUFFER_BIT)
        gl.glEnable(toast.GL_BLEND)
        gl.glBlendFunc(toast.GL_ONE, toast.GL_ONE_MINUS_SRC_ALPHA)
        gl.glEnable(toast.GL_TEXTURE_2D)
        gl.glBindTexture(toast.GL_TEXTURE_2D, self.tex.value)
        gl.glColor4f(1.0, 1.0, 1.0, 1.0)
        gl.glMatrixMode(toast.GL_PROJECTION)
        gl.glLoadIdentity()
        gl.glOrtho(0, screen_w, screen_h, 0, -1, 1)
        gl.glMatrixMode(toast.GL_MODELVIEW)
        gl.glLoadIdentity()
        gl.glBegin(toast.GL_QUADS)
        gl.glTexCoord2f(0, 0)
        gl.glVertex2f(x, y)
        gl.glTexCoord2f(1, 0)
        gl.glVertex2f(x + tex_w, y)
        gl.glTexCoord2f(1, 1)
        gl.glVertex2f(x + tex_w, y + tex_h)
        gl.glTexCoord2f(0, 1)
        gl.glVertex2f(x, y + tex_h)
        gl.glEnd()
        glfw.glfwSwapBuffers(self.win)
        glfw.glfwPollEvents()

    def destroy(self):
        try:
            glfw.glfwMakeContextCurrent(None)
        finally:
            glfw.glfwDestroyWindow(self.win)
        self.win = None


class TrackerRunner:
    """The overlay's whole per-frame decision logic, separate from the
    infinite loop so it can be driven step by step (and tested)."""

    def __init__(self, paths, screen_w, screen_h, window_factory=None, clock=time.monotonic, wall=time.time):
        self.paths = paths                      # dict: target, state, style, control
        self.screen_w, self.screen_h = screen_w, screen_h
        self.window_factory = window_factory or OverlayWindow
        self.clock, self.wall = clock, wall
        self.window = None
        self.vis = 0.0
        self.last_tick = clock()
        self.idle_since = wall()
        self.base_scale = toast._clamp(min(screen_w / 1920, screen_h / 1080), 0.85, 2.0)

    def _close_window(self):
        if self.window is not None:
            try:
                self.window.destroy()
            finally:
                self.window = None

    def step(self):
        """Runs one iteration. Returns seconds to sleep before the next one,
        or None when the overlay should exit."""
        now = self.clock()
        dt = min(now - self.last_tick, 0.25)
        self.last_tick = now

        target = _read_json(self.paths.get("target"))
        if target is None:
            self._close_window()
            self.vis = 0.0
            if self.wall() - self.idle_since > 30:
                return None                    # nothing pinned for 30s straight; don't linger
            return 0.25
        self.idle_since = self.wall()

        state = _read_json(self.paths.get("state"))
        style = _read_json(self.paths.get("style")) or {}
        control = _read_json(self.paths.get("control")) or {}
        want_visible = not bool(control.get("hidden"))

        # Hiding: animate out, then destroy the window entirely (frees the
        # single gamescope overlay slot for the toast). Showing: recreate the
        # window and animate back in.
        if not want_visible and self.vis <= 0.0:
            self._close_window()
            return 0.05
        self.vis = toast._tracker_visibility(self.vis, want_visible, dt)

        if self.window is None:
            try:
                self.window = self.window_factory(self.screen_w, self.screen_h)
            except Exception as err:
                print(f"tracker overlay: window create failed: {err}", flush=True)
                return 1.0

        position = style.get("position") if style.get("position") in toast.TRACKER_POSITIONS else "top_right"
        size_percent = toast._clamp(float(style.get("size_percent", 100) or 100), 50, 150)
        overlay_scale = self.base_scale * (size_percent / 100.0)
        tex_w, tex_h = toast._tracker_card_pixels(overlay_scale)
        alpha, slide_x, slide_y = toast._tracker_motion(position, self.vis, overlay_scale)
        card_x, card_y = toast._tracker_layout(position, self.screen_w, self.screen_h, overlay_scale)

        # Re-render only when something visible changed; a plain slide reuses
        # the texture already uploaded.
        key = json.dumps([target, state, style, round(alpha, 3), round(overlay_scale, 3)], sort_keys=True, default=str)
        if self.window.uploaded is None or self.window.uploaded[0] != key:
            try:
                surface = toast._make_tracker_surface(tex_w, tex_h, overlay_scale, target, state, style, alpha)
            except Exception as err:            # a bad frame must never kill the overlay
                print(f"tracker overlay: render failed: {err}", flush=True)
                return 1.0
            self.window.upload(key, surface, tex_w, tex_h)
        self.window.draw(self.screen_w, self.screen_h, card_x + slide_x, card_y + slide_y, tex_w, tex_h)

        animating = self.vis < 1.0 if want_visible else self.vis > 0.0
        return 0.0 if animating else 0.1       # vsync paces animation frames; settled = relax


def main():
    toast._configure_ctypes()
    _configure_extra()
    target_file = os.environ.get("FINALLY_TRACKER_TARGET_FILE")
    if not target_file:
        return
    paths = {
        "target": target_file,
        "state": os.environ.get("FINALLY_TRACKER_STATE_FILE"),
        "style": os.environ.get("FINALLY_TRACKER_STYLE_FILE"),
        "control": os.environ.get("FINALLY_TRACKER_CONTROL_FILE"),
    }
    width, height = toast._display_size()
    toast._glfw_prefer_x11()
    if not glfw.glfwInit():
        raise SystemExit("glfwInit failed: " + (toast._glfw_error() or "could not connect to the display"))
    runner = TrackerRunner(paths, width, height)
    try:
        while True:
            delay = runner.step()
            if delay is None:
                break
            if delay > 0:
                time.sleep(delay)
    finally:
        runner._close_window()
        glfw.glfwTerminate()


if __name__ == "__main__":
    main()
