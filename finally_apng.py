"""Joins PNG frames into one animated PNG (APNG), which the panel's browser plays in a plain <img>. Stdlib only."""
import struct
import zlib

SIGNATURE = b"\x89PNG\r\n\x1a\n"


def _chunks(png):
    """(type, data) for every chunk of a PNG file's bytes."""
    if png[:8] != SIGNATURE:
        raise ValueError("not a PNG")
    pos, out = 8, []
    while pos + 8 <= len(png):
        size = struct.unpack(">I", png[pos:pos + 4])[0]
        kind = png[pos + 4:pos + 8]
        out.append((kind, png[pos + 8:pos + 8 + size]))
        pos += 12 + size
    return out


def _chunk(kind, data):
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def frames_to_apng(frames, delays_ms):
    """`frames`: PNG file bytes, all the same size. `delays_ms`: how long each one shows. Loops forever."""
    if not frames or len(frames) != len(delays_ms):
        raise ValueError("need one delay per frame")
    ihdr = None
    out = [SIGNATURE]
    seq = 0
    for index, png in enumerate(frames):
        parts = _chunks(png)
        header = next(data for kind, data in parts if kind == b"IHDR")
        if ihdr is None:
            ihdr = header
            out.append(_chunk(b"IHDR", header))
            out.append(_chunk(b"acTL", struct.pack(">II", len(frames), 0)))
        elif header != ihdr:
            raise ValueError("frames differ in size or format")
        width, height = struct.unpack(">II", header[:8])
        # whole-frame replace (blend source, no dispose), so transparent areas clear properly
        out.append(_chunk(b"fcTL", struct.pack(">IIIIIHHBB", seq, width, height, 0, 0, max(1, int(delays_ms[index])), 1000, 0, 0)))
        seq += 1
        pixels = b"".join(data for kind, data in parts if kind == b"IDAT")
        if index == 0:
            out.append(_chunk(b"IDAT", pixels))
        else:
            out.append(_chunk(b"fdAT", struct.pack(">I", seq) + pixels))
            seq += 1
    out.append(_chunk(b"IEND", b""))
    return b"".join(out)
