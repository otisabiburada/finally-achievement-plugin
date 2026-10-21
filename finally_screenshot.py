#!/usr/bin/env python3
"""Asks gamescope for a screenshot (the same request Steam's own screenshot
button makes): sets GAMESCOPECTRL_REQUEST_SCREENSHOT on the X root window.
Gamescope then writes /tmp/gamescope.png.

Usage: finally_screenshot.py [type]     (1 = game only, 2 = game plus overlays)
Needs only libX11. Exit 0 once the request is sent."""
import ctypes
import sys

ATOM_NAME = b"GAMESCOPECTRL_REQUEST_SCREENSHOT"
XA_CARDINAL = 6


def request(shot_type=1, display_name=None):
    x11 = ctypes.CDLL("libX11.so.6")
    x11.XOpenDisplay.restype = ctypes.c_void_p
    x11.XOpenDisplay.argtypes = (ctypes.c_char_p,)
    x11.XDefaultRootWindow.restype = ctypes.c_ulong
    x11.XDefaultRootWindow.argtypes = (ctypes.c_void_p,)
    x11.XInternAtom.restype = ctypes.c_ulong
    x11.XInternAtom.argtypes = (ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int)
    x11.XChangeProperty.argtypes = (
        ctypes.c_void_p, ctypes.c_ulong, ctypes.c_ulong, ctypes.c_ulong,
        ctypes.c_int, ctypes.c_int, ctypes.c_void_p, ctypes.c_int,
    )
    x11.XSync.argtypes = (ctypes.c_void_p, ctypes.c_int)
    x11.XCloseDisplay.argtypes = (ctypes.c_void_p,)

    display = x11.XOpenDisplay(display_name.encode() if display_name else None)
    if not display:
        raise SystemExit("Cannot open display")
    try:
        root = x11.XDefaultRootWindow(display)
        atom = x11.XInternAtom(display, ATOM_NAME, 0)
        data = (ctypes.c_ulong * 1)(int(shot_type))      # format 32 is passed as C longs
        x11.XChangeProperty(display, root, atom, XA_CARDINAL, 32, 0, data, 1)
        x11.XSync(display, 0)
    finally:
        x11.XCloseDisplay(display)


if __name__ == "__main__":
    kind = 2 if len(sys.argv) > 1 and sys.argv[1] == "2" else 1
    request(kind)
