/**
 * TempDivide — B02. THE mechanism beat.
 *
 * Two moves, in the order the course implementation performs them:
 *   1. subtract the largest score  ->  [1,2,3] becomes [-2,-1,0]
 *   2. divide every difference by T
 *
 * Rendered as a number line so the viewer SEES the gaps stretch at low T and
 * compress at high T. Temperature never moves a score on its own; it only rescales
 * the spacing between them. That is the whole intervention.
 *
 * Use when: a beat must show temperature acting on differences, not on values.
 *
 * Source: lessons/01-.../code/main.py:14-15 (peak = max(logits);
 *         exp((x - peak) / temperature)); chapter :152-164.
 * synonyms: temperature, divide, max subtraction, shift, logit gap, mechanism
 */
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, FONT} from '../tokens/aperture';
import {Heading, Panel, Stage, useRise, useAt} from './apertureKit';

export const tempDivideSchema = z.object({
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  scores: z.array(z.number()).default([1, 2, 3]),
  shifted: z.array(z.number()).default([-2, -1, 0]),
  /** divided_scores per temperature, from numbers.json */
  stops: z
    .array(z.object({t: z.number(), divided: z.array(z.number()), gap: z.string()}))
    .default([
      {t: 1.0, divided: [-2, -1, 0], gap: '1'},
      {t: 0.5, divided: [-4, -2, 0], gap: '2'},
      {t: 2.0, divided: [-1, -0.5, 0], gap: '0.5'},
    ]),
});

type Props = z.infer<typeof tempDivideSchema>;
const COLORS = [AP.OUT_A, AP.OUT_B, AP.OUT_C];

export const TempDivide: React.FC<Props> = ({labels, scores, shifted, stops}) => {
  const frame = useCurrentFrame();
  const {height, width, fps} = useVideoConfig();

  const at = useAt();
  const step1 = useRise(at(0.09));
  const lineIn = useRise(at(0.22));

  // The widest exponent we ever plot sets the scale, so the line never overflows.
  const span = Math.max(...stops.flatMap((s) => s.divided.map(Math.abs))) || 1;

  const start = at(0.34);
  const hold = Math.max(fps, at(0.21));
  const prog = Math.max(0, (frame - start) / hold);
  const idx = Math.min(stops.length - 1, Math.floor(prog));
  const nextIdx = Math.min(stops.length - 1, idx + 1);
  const mix = interpolate(prog - idx, [0.3, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cur = stops[idx];
  const nxt = stops[nextIdx];
  const posNow = cur.divided.map((v, i) => v + (nxt.divided[i] - v) * mix);
  // Same rule as TempHook: point positions may tween, but the T readout and the
  // divided scores only ever show verified values. The label snaps to the stop being
  // moved toward; the numbers fade while in transit rather than counting through
  // values that were never computed.
  const tNow = mix > 0 ? nxt.t : cur.t;
  const settled = mix > 0 ? nxt : cur;
  const atStop = mix === 0 || mix >= 1;

  const lineW = width * 0.74;
  const xOf = (v: number) => lineW * (1 + v / span) ; // v in [-span, 0] -> [0, lineW]

  return (
    <Stage eyebrow="the mechanism" chips={['COURSE CODE · main.py']}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: height * 0.034}}>
        <Heading delay={at(0.02)}>Temperature rescales the gaps.</Heading>

        {/* step 1 — subtract the peak */}
        <div style={{display: 'flex', alignItems: 'center', gap: width * 0.016, ...step1}}>
          <Panel style={{padding: `${height * 0.016}px ${height * 0.024}px`}}>
            <span style={{fontFamily: FONT.mono, fontSize: height * 0.024, color: AP.INK}}>
              [{scores.join(', ')}]
            </span>
          </Panel>
          <span style={{fontFamily: FONT.mono, fontSize: height * 0.022, color: AP.ACCENT}}>
            − max = {Math.max(...scores)}
          </span>
          <span style={{fontSize: height * 0.03, color: AP.INK_FAINT}}>→</span>
          <Panel style={{padding: `${height * 0.016}px ${height * 0.024}px`}}>
            <span style={{fontFamily: FONT.mono, fontSize: height * 0.024, color: AP.INK}}>
              [{shifted.join(', ')}]
            </span>
          </Panel>
          <span style={{fontSize: height * 0.021, color: AP.INK_FAINT, marginLeft: width * 0.01}}>
            same distribution, smaller exponents
          </span>
        </div>

        {/* step 2 — divide by T, shown as spacing on a line */}
        <Panel
          strong
          style={{
            padding: `${height * 0.05}px ${height * 0.05}px ${height * 0.04}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: height * 0.03,
            ...lineIn,
          }}
        >
          <div style={{display: 'flex', alignItems: 'baseline', gap: width * 0.014}}>
            <span style={{fontFamily: FONT.mono, fontSize: height * 0.022, color: AP.INK_FAINT, textTransform: 'uppercase', letterSpacing: height * 0.003}}>
              divide every difference by
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.056,
                fontWeight: 600,
                color: AP.ACCENT,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              T = {tNow.toFixed(1)}
            </span>
          </div>

          <div style={{position: 'relative', height: height * 0.3, width: lineW, margin: '0 auto'}}>
            {/* the axis, with integer ticks so the empty span reads as measured distance */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: Math.max(1, height * 0.0015),
                background: AP.HAIRLINE,
              }}
            />
            {Array.from({length: span * 2 + 1}, (_, k) => -span + k * 0.5).map((tick) => (
              <div
                key={`tick-${tick}`}
                style={{
                  position: 'absolute',
                  left: xOf(tick),
                  top: '50%',
                  transform: 'translateX(-50%)',
                  width: 1,
                  height: height * (Number.isInteger(tick) ? 0.014 : 0.008),
                  background: AP.HAIRLINE,
                }}
              />
            ))}

            {/* the B -> C gap, drawn as a bracket and labelled with its width */}
            <div
              style={{
                position: 'absolute',
                left: xOf(posNow[1]),
                width: Math.max(0, xOf(posNow[2]) - xOf(posNow[1])),
                top: '22%',
                height: height * 0.028,
                borderLeft: `2px solid ${AP.ACCENT}`,
                borderRight: `2px solid ${AP.ACCENT}`,
                borderTop: `2px solid ${AP.ACCENT}`,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                opacity: 0.85,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -height * 0.042,
                  transform: 'translateX(-50%)',
                  fontFamily: FONT.mono,
                  fontSize: height * 0.026,
                  color: AP.ACCENT,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  opacity: atStop ? 1 : 0.4,
                }}
              >
                gap = {settled.gap}
              </div>
            </div>

            {posNow.map((v, i) => {
              const x = xOf(v);
              return (
                <div
                  key={labels[i]}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: height * 0.008,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: height * 0.03,
                      fontWeight: 600,
                      color: COLORS[i],
                      fontVariantNumeric: 'tabular-nums',
                      opacity: atStop ? 1 : 0.3,
                      marginBottom: height * 0.004,
                    }}
                  >
                    {settled.divided[i]}
                  </div>
                  <div
                    style={{
                      width: height * 0.022,
                      height: height * 0.022,
                      borderRadius: '50%',
                      background: COLORS[i],
                      border: `2px solid ${AP.GROUND}`,
                      boxShadow: `0 0 ${height * 0.026}px ${COLORS[i]}88`,
                    }}
                  />
                  <div style={{fontFamily: FONT.mono, fontSize: height * 0.023, color: AP.INK, fontWeight: 600, marginTop: height * 0.022}}>
                    {labels[i]}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{textAlign: 'center', fontSize: height * 0.024, color: AP.INK_DIM}}>
            low T spreads the gaps &nbsp;·&nbsp; high T pulls them together
          </div>
        </Panel>
      </div>
    </Stage>
  );
};
