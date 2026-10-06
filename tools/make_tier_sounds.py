"""Original synthesized tier sounds, written to feel like the reference clip's character:
a cinematic rising swell into a bright impact, glassy bell shimmer in F# major, a fast sparkle run and a long
reverb tail. Scaled by rarity: common = a tiny bell ping ... ultra rare = full swell, sub hit, sparkle run and tail.
Everything is generated from sine partials and filtered noise; no audio from the reference is used."""
import numpy as np, wave, sys
from scipy import signal
SR = 44100
rng = np.random.default_rng(20261001)
midi = lambda n: 440.0 * 2 ** ((n - 69) / 12.0)
# F# major pitch classes (the reference's tonal centre): F#=66, A#=70, C#=73 in octave 4/5
F3, Ab3, Cs4 = 54, 58, 61
Fs4, As4, Cs5 = 66, 70, 73
Fs5, As5, Cs6, Fs6 = 78, 82, 85, 90
As2, Cs3 = 46, 49
SUB = 30                         # F#1 ~ 46 Hz

class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR); self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def add(self, sig, start, pan=0.0, gain=1.0):
        i = int(start * SR)
        if i >= self.n: return
        j = min(self.n, i + len(sig)); s = sig[: j - i] * gain
        ang = (pan + 1) * np.pi / 4                      # constant-power pan, -1 .. +1
        self.L[i:j] += s * np.cos(ang); self.R[i:j] += s * np.sin(ang)

def bell(f, dur, decay=0.6, bright=1.0, attack=0.003):
    """Glassy bell: inharmonic partials, higher ones die faster, two slightly detuned voices for width."""
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    for ratio, a, dfac in ((1.0, 1.0, 1.0), (2.0, 0.42, 0.6), (3.01, 0.26, 0.42), (4.2, 0.16, 0.30), (5.43, 0.10, 0.22), (6.8, 0.06, 0.16)):
        ff = f * ratio
        if ff > SR * 0.42: continue
        env = np.exp(-t / (decay * dfac + 0.02))
        for cents in (-4, 4):
            y += a * (bright if ratio > 1 else 1.0) * 0.5 * np.sin(2 * np.pi * ff * 2 ** (cents / 1200) * t + rng.uniform(0, 6.283)) * env
    return y * np.minimum(1.0, t / attack) * np.minimum(1.0, (dur - t) / 0.01)

def pad(freqs, dur, rise, hold_from, tau):
    """Warm low swell: a few partials per note, slow vibrato, rises over `rise`, decays after `hold_from`."""
    t = np.arange(int(dur * SR)) / SR
    env = np.where(t < rise, (t / max(rise, 1e-3)) ** 2.2, 1.0) * np.where(t > hold_from, np.exp(-(t - hold_from) / tau), 1.0)
    y = np.zeros_like(t)
    for f in freqs:
        vib = 1 + 0.002 * np.sin(2 * np.pi * 5.1 * t + rng.uniform(0, 6.28))
        for h, a in ((1, 1.0), (2, 0.35), (3, 0.16), (4, 0.07)):
            y += a * np.sin(2 * np.pi * f * h * vib * t + rng.uniform(0, 6.28)) / len(freqs)
    return y * env

def riser(dur, f0=500, f1=7000, peak=1.0):
    """Rising 'whoosh': noise through a band that sweeps upward, swelling in level."""
    n = int(dur * SR); noise = rng.standard_normal(n); out = np.zeros(n); blk = int(0.01 * SR)
    zi = None
    for k in range(0, n, blk):
        frac = k / n
        fc = f0 * (f1 / f0) ** frac
        sos = signal.butter(2, [fc * 0.7, min(fc * 1.4, SR * 0.45)], btype="band", fs=SR, output="sos")
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        seg, zi = signal.sosfilt(sos, noise[k:k + blk], zi=zi); out[k:k + blk] = seg
    return out / (np.abs(out).max() + 1e-9) * (np.linspace(0, 1, n) ** 2.4) * peak

def sub_hit(dur=0.9, f_start=95.0, f_end=46.2):
    t = np.arange(int(dur * SR)) / SR
    f = f_end + (f_start - f_end) * np.exp(-t / 0.045)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t / 0.28) * np.minimum(1.0, t / 0.004)

def reverb(L, R, rt60, wet, predelay=0.014, damp=0.55):
    n = int((rt60 * 1.15 + predelay) * SR); t = np.arange(n) / SR
    outs = []
    for x in (L, R):
        ir = rng.standard_normal(n) * 10 ** (-3 * np.clip(t - predelay, 0, None) / rt60)     # -60 dB at rt60
        ir[t < predelay] = 0
        b = [1 - damp]; a = [1, -damp]                                                        # one-pole dark-ening of the tail
        ir = signal.lfilter(b, a, ir); ir /= np.sqrt((ir ** 2).sum())
        outs.append(signal.fftconvolve(x, ir)[: len(x) + n])
    m = max(len(L), len(outs[0]))
    pad_ = lambda v: np.pad(v, (0, m - len(v)))
    return (pad_(L) * (1 - wet) + pad_(outs[0]) * wet * 2.2, pad_(R) * (1 - wet) + pad_(outs[1]) * wet * 2.2)

def finish(L, R, rms_db, peak_cap=0.89, tail_cut_db=-48, fade_s=0.35):
    """Soft-limit, trim the inaudible tail, then set loudness by RMS over the audible part (so tiers step up
    evenly), never exceeding peak_cap."""
    stack = np.vstack([L, R]); stack = np.tanh(stack * 1.1) / np.tanh(1.1)
    stack /= np.abs(stack).max()
    env = np.abs(stack).max(axis=0)
    # smooth envelope so a single zero crossing doesn't end the sound early
    h = int(0.02 * SR); sm = np.convolve(env, np.ones(h) / h, mode="same")
    idx = np.where(sm > 10 ** (tail_cut_db / 20))[0]
    end = min(stack.shape[1], (idx[-1] if len(idx) else stack.shape[1]) + int(0.05 * SR))
    stack = stack[:, :end]
    audible = np.where(sm[:end] > 10 ** (-40 / 20))[0]
    rms = np.sqrt((stack[:, : audible[-1] + 1] ** 2).mean())
    stack *= 10 ** (rms_db / 20) / rms
    if np.abs(stack).max() > peak_cap: stack *= peak_cap / np.abs(stack).max()
    fade = min(int(fade_s * SR), stack.shape[1] // 3); stack[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    stack[:, :64] *= np.linspace(0, 1, 64)
    return stack

def save(name, stack):
    pcm = np.clip(stack.T * 32767, -32768, 32767).astype("<i2")
    with wave.open(name, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def sparkle(m, start, count, spacing, notes, decay, amp, spread=0.8, shape="arch"):
    for i in range(count):
        base = notes[i % len(notes)] + (12 if (i // len(notes)) % 2 else 0) * 0
        shape_amp = np.sin(np.pi * (i + 0.5) / count) if shape == "arch" else 1.0
        vel = amp * (0.35 + 0.65 * shape_amp) * rng.uniform(0.85, 1.0)
        t0 = start + i * spacing + rng.uniform(-0.006, 0.006)
        m.add(bell(midi(base), decay * 4, decay, bright=1.2), t0, pan=spread * np.sin(i * 1.9 + 0.7), gain=vel)

def common():
    m = Mix(2.2)
    m.add(bell(midi(Fs5), 1.0, 0.34), 0.0, pan=-0.1, gain=1.0)
    m.add(bell(midi(Cs6), 0.8, 0.22, bright=1.1), 0.035, pan=0.2, gain=0.42)
    L, R = reverb(m.L, m.R, rt60=0.55, wet=0.20)
    return finish(L, R, -26.0)

def uncommon():
    m = Mix(3.0)
    m.add(pad([midi(Ab3), midi(Fs4)], 1.2, 0.18, 0.18, 0.35), 0.0, gain=0.22)
    for k, (note, t0, g) in enumerate(((Fs5, 0.0, 0.95), (As5, 0.11, 0.85), (Cs6, 0.23, 0.80))):
        m.add(bell(midi(note), 1.2, 0.42), t0, pan=(-0.25, 0.0, 0.25)[k], gain=g)
    m.add(bell(midi(Fs6), 0.8, 0.22, bright=1.15), 0.36, pan=0.3, gain=0.34)
    L, R = reverb(m.L, m.R, rt60=0.95, wet=0.28)
    return finish(L, R, -23.0)

def rare():
    imp = 0.42
    m = Mix(5.0)
    m.add(riser(imp, 600, 6500, 0.55), 0.0, gain=0.55)
    m.add(pad([midi(42), midi(F3)], 3.5, imp, imp, 1.0), 0.0, gain=0.80)
    m.add(pad([midi(As2), midi(Cs3), midi(Ab3)], 3.5, imp, imp, 1.0), 0.0, gain=0.30)
    m.add(sub_hit(0.8, 90, 46.2), imp, gain=0.45)
    for k, note in enumerate((Fs4, As4, Cs5, Fs5)):
        m.add(bell(midi(note), 2.2, 0.85), imp + 0.012 * k, pan=(-0.4, -0.1, 0.15, 0.4)[k], gain=0.78)
    sparkle(m, imp + 0.06, 14, 0.052, [Fs5, Cs6, Fs6, As5, Cs6, Fs5], 0.34, 0.50, spread=0.55)
    m.add(bell(midi(Cs6), 2.0, 0.7, bright=1.1), imp + 0.85, pan=0.2, gain=0.35)
    L, R = reverb(m.L, m.R, rt60=1.7, wet=0.36)
    return finish(L, R, -19.5)

def ultra():
    imp = 0.80
    m = Mix(8.5)
    m.add(riser(imp, 450, 8000, 0.75), 0.0, gain=0.50)
    m.add(pad([midi(42), midi(F3), midi(Fs4)], 6.5, imp * 1.1, imp, 1.9), 0.0, gain=0.95)
    m.add(pad([midi(As2), midi(Cs3), midi(Ab3), midi(Cs4)], 6.5, imp * 1.1, imp, 1.9), 0.0, gain=0.34)
    m.add(sub_hit(1.1, 100, 46.2), imp, gain=0.55)
    for k, note in enumerate((F3, Ab3, Cs4, Fs4, As4, Cs5, Fs5)):
        m.add(bell(midi(note), 3.4, 1.35), imp + 0.010 * k, pan=np.linspace(-0.55, 0.55, 7)[k], gain=0.62)
    sparkle(m, imp + 0.05, 40, 0.050, [Fs5, Cs6, Fs6, As5, Fs5, Cs6, Fs6, Cs6], 0.42, 0.55, spread=0.55)
    m.add(riser(0.7, 1500, 9000, 0.25), imp + 1.15, gain=0.30)
    m.add(bell(midi(Fs6), 3.0, 1.2, bright=1.15), imp + 2.15, pan=-0.15, gain=0.50)
    m.add(bell(midi(As5), 3.0, 1.1), imp + 2.17, pan=0.15, gain=0.22)
    m.add(bell(midi(Cs6), 3.0, 1.1), imp + 2.19, pan=0.0, gain=0.42)
    L, R = reverb(m.L, m.R, rt60=3.2, wet=0.42)
    return finish(L, R, -17.0)

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    for name, fn in (("finally_common", common), ("finally_uncommon", uncommon), ("finally_rare", rare), ("finally_ultra_rare", ultra)):
        stack = fn(); save(f"{out}/{name}.wav", stack); print(name, "%.2fs" % (stack.shape[1] / SR))
