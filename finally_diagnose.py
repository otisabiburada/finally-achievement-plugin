#!/usr/bin/env python3
"""Overlay self-check. Uses only the standard library, so it still works when
the overlay itself can't start (missing Python packages or libraries). Run by
main.py with the same interpreter and environment the popup overlay gets;
prints one JSON object: {"checks": [{"name","ok","detail","fatal"}...]}."""
import ctypes
import ctypes.util
import glob
import json
import os
import sys

checks = []


def add(name, ok, detail="", fatal=True):
    checks.append({"name": name, "ok": bool(ok), "detail": str(detail), "fatal": bool(fatal)})

add("Plugin build", True, "overlay fallbacks v3 (tries 6 window setups)", fatal=False)


def try_import(label, fn, hint):
    try:
        fn()
        add(label, True)
        return True
    except Exception as err:  # ImportError, ValueError (gi.require_version), ...
        add(label, False, f"{type(err).__name__}: {err}. {hint}")
        return False


def load_lib(label, names, hint):
    tried = list(names)
    found = ctypes.util.find_library(label.split()[0])
    if found:
        tried.append(found)
    for name in tried:
        try:
            lib = ctypes.CDLL(name)
            add(f"{label} library", True, name)
            return lib
        except OSError:
            continue
    add(f"{label} library", False, f"Not found (tried {', '.join(tried)}). {hint}")
    return None


add("Python", True, f"{sys.version.split()[0]} at {sys.executable}", fatal=False)

# --- drawing libraries ---------------------------------------------------------
# The popup draws with pycairo + PyGObject when both exist; otherwise with the
# built-in ctypes layer (finally_cairo_ctypes.py), which needs only the system C
# libraries below. Either one is enough.
def _have(fn):
    try:
        fn()
        return True, ""
    except Exception as err:
        return False, f"{type(err).__name__}: {err}"


def _gi_namespace(name, version):
    def _do():
        import gi
        gi.require_version(name, version)
        __import__("gi.repository", fromlist=[name])
        getattr(__import__("gi.repository", fromlist=[name]), name)
    return _do


def _can_load(names, find_as):
    tried = list(names)
    found = ctypes.util.find_library(find_as)
    if found:
        tried.append(found)
    for base in ("/usr/lib64/", "/usr/lib/x86_64-linux-gnu/", "/usr/lib/"):
        tried.extend(base + n for n in names if "." in n and not n.endswith(".so"))
    for name in tried:
        try:
            ctypes.CDLL(name)
            return True, name
        except OSError:
            continue
    return False, ""


cairo_ok, cairo_err = _have(lambda: __import__("cairo"))
gi_results = []
gi_present, gi_err = _have(lambda: __import__("gi"))
gi_results.append(("PyGObject (gi)", gi_present, gi_err, "Install PyGObject (python3-gobject / python3-gi)."))
if gi_present:
    for label, ns, ver, hint in (
        ("Pango", "Pango", "1.0", "Install the Pango GObject typelib (gir1.2-pango / pango)."),
        ("PangoCairo", "PangoCairo", "1.0", "Install the PangoCairo typelib."),
        ("GdkPixbuf", "GdkPixbuf", "2.0", "Install the GdkPixbuf typelib."),
        ("Gdk", "Gdk", "3.0", "Install the Gdk 3.0 typelib (gtk3)."),
    ):
        ok, err = _have(_gi_namespace(ns, ver))
        gi_results.append((label, ok, err, hint))
gi_all_ok = gi_present and all(ok for _l, ok, _e, _h in gi_results)

native = {}
for label, names, find_as in (
    ("libcairo", ("libcairo.so.2", "libcairo.so"), "cairo"),
    ("libpango", ("libpango-1.0.so.0", "libpango-1.0.so"), "pango-1.0"),
    ("libpangocairo", ("libpangocairo-1.0.so.0", "libpangocairo-1.0.so"), "pangocairo-1.0"),
    ("libgdk_pixbuf", ("libgdk_pixbuf-2.0.so.0", "libgdk_pixbuf-2.0.so"), "gdk_pixbuf-2.0"),
    ("libgobject", ("libgobject-2.0.so.0", "libgobject-2.0.so"), "gobject-2.0"),
):
    native[label] = _can_load(names, find_as)
ctypes_stack_ok = all(ok for ok, _n in native.values())
missing_native = [label for label, (ok, _n) in native.items() if not ok]

if cairo_ok and gi_all_ok:
    add("Drawing libraries", True, "pycairo + PyGObject (same as a Steam Deck)")
elif ctypes_stack_ok:
    add("Drawing libraries", True, "built-in ctypes layer using the system cairo/pango libraries (pycairo/PyGObject aren't needed)")
else:
    add("Drawing libraries", False,
        "Neither pycairo + PyGObject nor the system libraries are available"
        + (f" (missing: {', '.join(missing_native)})" if missing_native else "")
        + ". Install python3-cairo and python3-gobject, or those libraries.")

drawing_ok = (cairo_ok and gi_all_ok) or ctypes_stack_ok
# Individual packages: informational once one complete stack works.
fatal_pkgs = not drawing_ok
add("pycairo", cairo_ok, "" if cairo_ok else f"{cairo_err}. Not needed while the built-in drawing layer works." if drawing_ok else f"{cairo_err}. Install pycairo (python3-cairo).", fatal=fatal_pkgs)
for label, ok, err, hint in gi_results:
    add(label, ok, "" if ok else (f"{err}. Not needed while the built-in drawing layer works." if drawing_ok else f"{err}. {hint}"), fatal=fatal_pkgs)
for label, (ok, name) in native.items():
    add(label, ok, name if ok else "not found", fatal=False)

# --- native libraries ----------------------------------------------------------
glfw = load_lib("glfw", ("libglfw.so.3", "libglfw.so", "/usr/lib64/libglfw.so.3", "/usr/lib/x86_64-linux-gnu/libglfw.so.3", "/usr/lib/libglfw.so.3"), "Install GLFW 3 (glfw).")
load_lib("GL", ("libGL.so.1", "libGL.so", "/usr/lib64/libGL.so.1", "/usr/lib/x86_64-linux-gnu/libGL.so.1"), "Install the OpenGL library (mesa-libGL / libgl1).")
x11 = load_lib("X11", ("libX11.so.6", "libX11.so", "/usr/lib64/libX11.so.6", "/usr/lib/x86_64-linux-gnu/libX11.so.6"), "Install libX11.")

# --- environment ---------------------------------------------------------------
display = os.environ.get("DISPLAY", "")
runtime = os.environ.get("XDG_RUNTIME_DIR", "")
add("XDG_RUNTIME_DIR", bool(runtime) and os.path.isdir(runtime), runtime or "not set")
sockets = sorted(os.path.basename(p) for p in glob.glob("/tmp/.X11-unix/X*"))
add("X11 sockets", bool(sockets), ", ".join(sockets) or "none found in /tmp/.X11-unix", fatal=False)
num = display.split(":")[-1].split(".")[0] if ":" in display else ""
add("Display socket", bool(num) and f"X{num}" in sockets, f"DISPLAY={display or 'unset'}")

# --- can we actually reach the display, and create a window? -------------------
if x11 is not None:
    try:
        x11.XOpenDisplay.restype = ctypes.c_void_p
        x11.XOpenDisplay.argtypes = (ctypes.c_char_p,)
        x11.XDefaultScreen.argtypes = (ctypes.c_void_p,)
        x11.XDisplayWidth.argtypes = (ctypes.c_void_p, ctypes.c_int)
        x11.XDisplayHeight.argtypes = (ctypes.c_void_p, ctypes.c_int)
        x11.XCloseDisplay.argtypes = (ctypes.c_void_p,)
        handle = x11.XOpenDisplay((display or ":0").encode())
        if handle:
            screen = x11.XDefaultScreen(handle)
            add("X display connection", True, f"{display or ':0'} is {x11.XDisplayWidth(handle, screen)}x{x11.XDisplayHeight(handle, screen)}")
            x11.XCloseDisplay(handle)
        else:
            add("X display connection", False, f"Could not connect to {display or ':0'}. The popup can't open a window without it.")
    except Exception as err:
        add("X display connection", False, f"{type(err).__name__}: {err}")

if glfw is not None:
    try:
        glfw.glfwInit.restype = ctypes.c_int
        glfw.glfwWindowHint.argtypes = (ctypes.c_int, ctypes.c_int)
        glfw.glfwCreateWindow.argtypes = (ctypes.c_int, ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p, ctypes.c_void_p)
        glfw.glfwCreateWindow.restype = ctypes.c_void_p
        glfw.glfwDestroyWindow.argtypes = (ctypes.c_void_p,)
        glfw.glfwTerminate.restype = None
        glfw.glfwDefaultWindowHints.restype = None

        def last_glfw_error():
            try:
                glfw.glfwGetError.argtypes = (ctypes.POINTER(ctypes.c_char_p),)
                glfw.glfwGetError.restype = ctypes.c_int
                desc = ctypes.c_char_p()
                glfw.glfwGetError(ctypes.byref(desc))
                return desc.value.decode("utf-8", "replace") if desc.value else ""
            except Exception:
                return ""

        def prefer_x11():
            # Same as the popup: GLFW 3.4+ may otherwise pick Wayland.
            try:
                glfw.glfwInitHint.argtypes = (ctypes.c_int, ctypes.c_int)
                glfw.glfwInitHint.restype = None
                glfw.glfwInitHint(0x00050003, 0x00060004)   # GLFW_PLATFORM = X11
            except Exception:
                pass

        VISIBLE, TRANSPARENT, DEPTH, STENCIL = 0x00020004, 0x0002000A, 0x00021005, 0x00021006
        VER_MAJOR, VER_MINOR = 0x00022002, 0x00022003
        RGBA = [(0x00021001, 8), (0x00021002, 8), (0x00021003, 8), (0x00021004, 8)]
        EGL = [(0x0002200B, 0x00036002)]   # GLFW_CONTEXT_CREATION_API = EGL
        base = [(VISIBLE, 0), (TRANSPARENT, 1)]          # hidden, transparent
        popup = base + [(VER_MAJOR, 3), (VER_MINOR, 0), (DEPTH, 0), (STENCIL, 0)]   # what the popup asks for first
        attempts = [
            ("exact", popup),
            ("no OpenGL version", base + [(DEPTH, 0), (STENCIL, 0)]),
            ("default depth/stencil", base),
            ("explicit RGBA8", base + RGBA),
            ("EGL context", base + EGL),
            ("EGL context, exact buffers", base + [(DEPTH, 0), (STENCIL, 0)] + EGL),
        ]

        def try_display(label):
            """Returns (worked_with, errors) for the display GLFW is currently pointed at."""
            if not glfw.glfwInit():
                return None, ["glfwInit failed: " + (last_glfw_error() or "could not connect to the display")]
            last_glfw_error()
            errors = []
            worked = None
            for name, hints in attempts:
                glfw.glfwDefaultWindowHints()
                for hint, value in hints:
                    glfw.glfwWindowHint(hint, value)
                last_glfw_error()
                window = glfw.glfwCreateWindow(64, 64, b"finally diagnose", None, None)
                if window:
                    glfw.glfwDestroyWindow(window)
                    worked = name
                    break
                errors.append(name + ": " + (last_glfw_error() or "no error reported"))
            glfw.glfwTerminate()
            return worked, errors

        prefer_x11()
        worked, errors = try_display(display)
        add("GLFW init", worked is not None or not (errors and errors[0].startswith("glfwInit failed")),
            "" if not (errors and errors[0].startswith("glfwInit failed")) else errors[0])
        if worked:
            add("OpenGL window", True, "Created a transparent test window (hidden) using: " + worked
                + (". The popup falls back to this automatically." if worked != "exact" else ""))
        elif errors and errors[0].startswith("glfwInit failed"):
            pass
        else:
            add("OpenGL window", False, "GLFW started but could not create a transparent OpenGL window on "
                + (display or ":0") + ". GLFW said: " + "; ".join(errors)
                + ". The X server has no matching transparent graphics mode.")
            # Informational: does another display work? (The popup uses the one above.)
            for sock in sockets:
                other = ":" + sock[1:]
                if other == (display or ":0"):
                    continue
                os.environ["DISPLAY"] = other
                alt_ok, alt_errors = try_display(other)
                os.environ["DISPLAY"] = display
                add("OpenGL window on " + other, alt_ok is not None,
                    ("works using: " + alt_ok) if alt_ok else ("; ".join(alt_errors)), fatal=False)
    except Exception as err:
        add("GLFW init", False, f"{type(err).__name__}: {err}")

# --- helper programs -----------------------------------------------------------
add("paplay (sound)", any(os.access(os.path.join(p, "paplay"), os.X_OK) for p in os.environ.get("PATH", "").split(os.pathsep)), "", fatal=False)

print(json.dumps({"checks": checks}))
