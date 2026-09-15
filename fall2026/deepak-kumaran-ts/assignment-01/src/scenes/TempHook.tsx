/**
 * TempHook — B00 cold open for "Temperature as a Concentration Control" (INFO 7375 W1).
 *
 * Poses the question over a live distribution: the three scores stay pinned while the
 * temperature readout steps 2.0 -> 1.0 -> 0.5 and the bars re-concentrate.
 *
 * Use when: opening a reel that must establish "same input, one moving part".
 *
 * HONESTY NOTE: no percentages are shown here. The bar heights tween between verified
 * distributions, and an interpolated number is not a verified number. The only figure
 * on screen is T, and it snaps to the stop the bars are moving toward — it never shows
 * an intermediate value it cannot support. Percentages arrive in TempSoftmax and
 * TempTriptych, parked on course-recorded values.
 *
 * synonyms: temperature, hook, cold open, distribution, concentration, softmax
 */
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, FONT} from '../tokens/aperture';
import {Heading, Panel, Stage, useRise, useAt} from './apertureKit';

export const tempHookSchema = z.object({
  title: z.string().default('Temperature as a concentration control'),
  question: z.string().default('What does temperature actually change?'),
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  scores: z.array(z.number()).default([1, 2, 3]),
  /** Verified distributions, ordered to match `stops`. */
  frames: z
    .array(z.object({t: z.number(), pct: z.array(z.number())}))
    .default([
      {t: 2.0, pct: [18.63237232, 30.71958857, 50.64803911]},
      {t: 1.0, pct: [9.003057317, 24.47284711, 66.52409558]},
      {t: 0.5, pct: [1.587624, 11.73104278, 86.68133322]},
    ]),
});

type Props = z.infer<typeof tempHookSchema>;

const COLORS = [AP.OUT_A, AP.OUT_B, AP.OUT_C];

export const TempHook: React.FC<Props> = ({title, question, labels, scores, frames}) => {
  const frame = useCurrentFrame();
  const {height, width, fps} = useVideoConfig();

  const at = useAt();
  const t1 = useRise(at(0.14));
  const chartIn = useRise(at(0.22));

  // Step through the verified stops, spread across the beat's measured window.
  const start = at(0.30);
  const hold = Math.max(fps, at(0.21));
  const prog = Math.max(0, (frame - start) / hold);
  const idx = Math.min(frames.length - 1, Math.floor(prog));
  const nextIdx = Math.min(frames.length - 1, idx + 1);
  const mix = interpolate(prog - idx, [0.25, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cur = frames[idx];
  const nxt = frames[nextIdx];
  const pctNow = cur.pct.map((v, i) => v + (nxt.pct[i] - v) * mix);
  // The T readout NEVER shows an interpolated value. Bar heights may tween between
  // two verified distributions — that is a visual transition — but a number on screen
  // is a claim. Mid-tween the label would have read "T = 0.9" beside bars that are a
  // linear blend, not the real distribution at 0.9. So the label snaps to the stop the
  // bars are moving TOWARD, and every value it displays is course-chosen.
  const tNow = mix > 0 ? nxt.t : cur.t;

  const plotH = height * 0.3;
  const barW = width * 0.055;

  return (
    <Stage eyebrow="INFO 7375 · Week 01 · Chapter 1">
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: width * 0.05,
        }}
      >
        {/* left: the question */}
        <div style={{flex: '0 0 44%', display: 'flex', flexDirection: 'column', gap: height * 0.03}}>
          <Heading delay={at(0.03)} size={0.062}>
            {title}
          </Heading>
          <div
            style={{
              fontSize: height * 0.034,
              color: AP.ACCENT,
              fontWeight: 500,
              lineHeight: 1.35,
              ...t1,
            }}
          >
            {question}
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: height * 0.021,
              color: AP.INK_DIM,
              lineHeight: 1.6,
              ...t1,
            }}
          >
            scores fixed at [{scores.join(', ')}]
            <br />
            only T moves
          </div>
        </div>

        {/* right: the live distribution */}
        <Panel
          strong
          style={{
            flex: '0 0 48%',
            padding: height * 0.045,
            display: 'flex',
            flexDirection: 'column',
            gap: height * 0.028,
            ...chartIn,
          }}
        >
          <div style={{display: 'flex', alignItems: 'baseline', gap: width * 0.012}}>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.024,
                color: AP.INK_FAINT,
                textTransform: 'uppercase',
                letterSpacing: height * 0.003,
              }}
            >
              temperature
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.062,
                fontWeight: 600,
                color: AP.ACCENT,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              T = {tNow.toFixed(1)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: plotH,
            }}
          >
            {pctNow.map((p, i) => (
              <div key={labels[i]} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: height * 0.014}}>
                <div style={{height: plotH, display: 'flex', alignItems: 'flex-end'}}>
                  <div
                    style={{
                      width: barW,
                      height: Math.max(2, (p / 100) * plotH),
                      background: COLORS[i],
                      borderRadius: height * 0.006,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: height * 0.022,
                    color: AP.INK,
                    fontWeight: 600,
                  }}
                >
                  {labels[i]}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Stage>
  );
};
