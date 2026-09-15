# BUILD-PROMPT — how to rebuild this video from scratch

Every command below was actually run on macOS (Darwin 25.6, Apple Silicon) during the
build. Nothing here is aspirational; where a documented command fails, the failure and
its workaround are recorded rather than hidden.

Total cost: **$0.00**. No API key, no account, no paid service.

---

## 0. Prerequisites

| Need | Version used | Install |
|---|---|---|
| Python | 3.13.2 | preinstalled / python.org |
| Node | 26.5.0 (needs ≥ 20) | nodejs.org or nvm |
| ffmpeg + ffprobe | 9.0.1 | `brew install ffmpeg` |
| git | 2.51.2 | preinstalled |

LaTeX/dvisvgm is **not** required. This reel has zero Manim beats; all mathematics is
typeset in Remotion. `./setup` will still report the Manim rows as blocked — see §2.

---

## 1. Get the course checkout

The video's numbers come from the course repository. Place a checkout as a sibling of
this submission's repo root:

```
INFO 7375 …/
├── info-7375-course/          ← the course checkout
├── brutalist.art/             ← the toolkit (step 2)
└── Assignment 1/              ← this git repo
    └── fall2026/deepak-kumaran-ts/assignment-01/
```

`scripts/verify_temperature.py` defaults to `../../../../info-7375-course` and accepts
`--course-repo /your/path` if yours lives elsewhere.

## 2. Get and install the toolkit

```bash
cd "INFO 7375 Prompt Engineering & Agentic AI"
git clone https://github.com/nikbearbrown/brutalist.art.git
cd brutalist.art
git rev-parse HEAD          # ba2d0e0f043f5b3b35a50d336e0fc66fbfecfc0c at time of build
python3 -m venv .venv && source .venv/bin/activate
./setup --install
```

### `./setup --install` will fail. This is expected.

```
ERROR: No matching distribution found for manim<0.19,>=0.18
```

`manim` has no 0.18.x release on PyPI (versions jump 0.14.0 → 0.19.0), so the
toolkit's pin is an empty window. Because pip aborts the whole requirements file on one
failure, this also blocks Pillow, kokoro-onnx and faster-whisper. Install them
individually, omitting Manim:

```bash
python3 -m pip install "kokoro-onnx>=0.4" "mutagen>=1.47,<1.48" "Pillow>=10.2,<11" \
                       "numpy>=2.0.2" "faster-whisper>=1.0,<2"
./setup
```

Expected result — every feature this reel uses is ready, Manim stays blocked:

```
  audio (Kokoro Bella/Onyx)    ✅ ready
  captions + word clock        ✅ ready
  Manim beats                  ❌ blocked      ← unused
  Manim equation beats         ❌ blocked      ← unused
  Remotion beats + bookends    ✅ ready
  slates / previz / compile    ✅ ready
  fonts (EB Garamond + Oswald) ✅ ready
```

The Kokoro model (~340 MB) is downloaded by `--install` even though the pip step failed,
because that happens in a later stage of the script. Confirm with:

```bash
ls runtime/models/kokoro/          # kokoro-v1.0.onnx, voices-v1.0.bin
```

### `./art smoke` also fails. Also expected.

```
[kokoro] REFUSED: metadata.slug must be a filename, not a path
```

The toolkit's smoke fixture is slugged `_smoke`, but `build_safety.py:186` requires the
first character to be alphanumeric. The fixture fails its own validator. To prove the
pipeline anyway, copy it and change only the slug:

```bash
T=$(mktemp -d)/smoketest && mkdir -p "$T"
cp examples/_smoke/beat_sheet.json "$T/"
python3 -c "import json,sys;p='$T/beat_sheet.json';d=json.load(open(p));d['metadata']['slug']='smoketest';json.dump(d,open(p,'w'),indent=2)"
python3 runtime/scripts/generate_audio_kokoro.py "$T"
ART_FACTS=0 ART_QC=0 python3 runtime/scripts/compile.py "$T" --review --height 360
```

That produced a 13.9s mp4 with both streams decoding.

## 3. Install Geist

Geist is not on Google Fonts, so it is fetched from npm and placed in Remotion's
`public/` directory:

```bash
cd /tmp && npm pack geist && tar xzf geist-*.tgz
DEST="…/brutalist.art/runtime/remotion/public/fonts"
for w in Regular Medium SemiBold Bold;  do cp package/dist/fonts/geist-sans/Geist-$w.woff2 "$DEST/"; done
for w in Regular Medium SemiBold;       do cp package/dist/fonts/geist-mono/GeistMono-$w.woff2 "$DEST/"; done
cp package/LICENSE.txt "$DEST/Geist-LICENSE-OFL.txt"
```

`src/tokens/geistFont.ts` **throws** if the faces fail to load rather than falling back
to a system face — a silent fallback is a documented failure mode in this toolkit
(`tokens/vox.ts` admits Montserrat never loaded), and it would be dishonest in a video
whose typeface is a stated design choice.

## 4. Install the scene components

Copy this project's `src/` into the toolkit's Remotion project and register them:

```bash
TK="…/brutalist.art/runtime/remotion/src"
cp src/tokens/aperture.ts src/tokens/geistFont.ts "$TK/tokens/"
cp src/scenes/apertureKit.tsx src/scenes/Temp*.tsx "$TK/scenes/"
```

Then in `$TK/Root.tsx` add the imports, the `apertureMetadata` calculator, and a
`<Folder name="INFO7375-Temperature">` containing a `<Composition>` per scene. A
composition is invisible to the pipeline without this. The exact block is reproduced in
`src/Root.registration.tsx.txt`.

```bash
cd …/brutalist.art
./art scene-index                                  # regenerate scenes.json
./art scenes --check TempHook TempTriptych …       # all should say RENDERABLE
```

## 5. Verify the numbers — before anything is rendered

```bash
cd …/assignment-01
python3 scripts/verify_temperature.py
```

Five checks must pass: sum-to-one, the ratio law, max-subtracted vs direct softmax,
**exact agreement with `research/worked-examples.json`**, and a live subprocess run of
the course `main.py`. It writes `numbers.json`. If any check fails the build stops —
nothing may reach the screen unverified.

## 6. Build the beat sheet, generate audio, rebuild

`build_beat_sheet.py` runs **twice**. The first pass writes narration; the second feeds
the measured audio durations back in, so each scene's animation spans its real spoken
window instead of finishing in the first few seconds.

```bash
python3 scripts/build_beat_sheet.py                       # pass 1 — narration
cd …/brutalist.art && source .venv/bin/activate
python3 runtime/scripts/generate_audio_kokoro.py "$REEL"  # Kokoro af_bella; ffprobe = the clock
cd "$REEL" && python3 scripts/build_beat_sheet.py         # pass 2 — real durations into props
```

## 7. Render and assemble

```bash
cd …/brutalist.art && source .venv/bin/activate
export REEL="…/fall2026/deepak-kumaran-ts/assignment-01"
./art run   "$REEL"                                        # gates + render + review cut
./art todo  "$REEL"                                        # anything unfilled
./art final "$REEL" --height 1080 --out "$REEL/video"      # the master
```

`./art run` takes roughly 25 minutes: each beat renders at `--scale=2` (true 3840×2160)
with `--concurrency=1`. Re-running skips already-filled slots, so an interrupted build
resumes. The course prerequisite specifies a 1080p master, which is why `--height 1080`
is passed explicitly — the toolkit defaults to 4K.

## 8. QC

```bash
python3 runtime/qc/final_frame_check.py "$REEL" --mp4 "$REEL/video/<slug>.mp4"
# then read $REEL/_qc/REPORT.md and $REEL/_qc/contact_sheet.png

ffmpeg -i "$REEL/video/<slug>.mp4" -vf fps=2 "$REEL/_qc/frames/%05d.png"
```

Then **look at the frames**. A clean ffprobe says a file decodes; it cannot tell you a
number is wrong, a label is stale, or the typeface silently fell back. Results are in
`CHECKS-REPORT.md` and `REVIEW.md`.

---

## The one-command rebuild

With prerequisites in place and the toolkit installed:

```bash
cd …/assignment-01 && python3 scripts/verify_temperature.py && python3 scripts/build_beat_sheet.py \
&& cd …/brutalist.art && source .venv/bin/activate \
&& python3 runtime/scripts/generate_audio_kokoro.py "$REEL" \
&& (cd "$REEL" && python3 scripts/build_beat_sheet.py) \
&& ./art run "$REEL" && ./art final "$REEL" --height 1080 --out "$REEL/video"
```
