/**
 * TempTriptych — B04. THE CENTREPIECE: same scores, three temperatures, side by side.
 *
 * The logits are pinned in a header strip so the viewer can see they never change.
 * Three panels then reveal left to right at T = 0.5, 1.0, 2.0 with the course's own
 * recorded probabilities. Holding the comparison on screen simultaneously (rather
 * than cutting between states) is what makes the causality legible.
 *
 * Use when: a beat must prove a one-variable controlled comparison.
 *
 * Source: research/worked-examples.json -> chapters.01; chapter table :206-210.
 * synonyms: temperature, comparison, distribution, concentration, bar chart, triptych
 */
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, EASE_SMOOTH, EASE_SOFT, FONT} from '../tokens/aperture';
import {Heading, Panel, ProbBar, Stage, useRise, useAt} from './apertureKit';

export const tempTriptychSchema = z.object({
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  scores: z.array(z.number()).default([1, 2, 3]),
  panels: z
    .array(
      z.object({
        t: z.number(),
        pct: z.array(z.number()),
        caption: z.string(),
      }),
    )
    .default([
      {t: 0.5, pct: [1.587624, 11.73104278, 86.68133322], caption: 'concentrated'},
      {t: 1.0, pct: [9.003057317, 24.47284711, 66.52409558], caption: 'baseline'},
      {t: 2.0, pct: [18.63237232, 30.71958857, 50.64803911], caption: 'flatter'},
    ]),
});

type Props = z.infer<typeof tempTriptychSchema>;
const COLORS = [AP.OUT_A, AP.OUT_B, AP.OUT_C];

export const TempTriptych: React.FC<Props> = ({labels, scores, panels}) => {
  const frame = useCurrentFrame();
  const {height, width, fps} = useVideoConfig();
  const at = useAt();
  const pin = useRise(at(0.05));
  const foot = useRise(at(0.86));

  const plotH = height * 0.3;
  const barW = width * 0.028;

  return (
    <Stage eyebrow="same scores · one variable" chips={['COURSE OUTPUT · worked-examples.json']}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: height * 0.024, justifyContent: 'center'}}>
        <Heading delay={at(0.01)} size={0.046}>
          Hold the scores still. Move only T.
        </Heading>

        {/* the pinned input — visibly identical across all three panels */}
        <Panel
          style={{
            padding: `${height * 0.014}px ${height * 0.026}px`,
            alignSelf: 'flex-start',
            display: 'flex',
            gap: width * 0.016,
            alignItems: 'center',
            ...pin,
          }}
        >
          <span style={{fontFamily: FONT.mono, fontSize: height * 0.019, color: AP.INK_FAINT, textTransform: 'uppercase', letterSpacing: height * 0.003}}>
            fixed input
          </span>
          {scores.map((z_, i) => (
            <span key={labels[i]} style={{fontFamily: FONT.mono, fontSize: height * 0.026, color: COLORS[i], fontWeight: 600}}>
              {labels[i]} = {z_}
            </span>
          ))}
        </Panel>

        <div style={{display: 'flex', gap: width * 0.018, alignItems: 'stretch'}}>
          {panels.map((p, pi) => {
            // No hooks in this loop (rules of hooks) — springs are computed directly.
            const delay = at(0.20) + pi * at(0.21);
            const enter = spring({frame: frame - delay, fps, config: EASE_SMOOTH});
            const r: React.CSSProperties = {
              opacity: enter,
              transform: `translateY(${(1 - enter) * height * 0.022}px)`,
            };
            const grow = spring({frame: frame - delay - at(0.02), fps, config: EASE_SOFT});
            const isFocus = pi === 0;
            return (
              <Panel
                key={p.t}
                strong={isFocus}
                style={{
                  flex: 1,
                  padding: `${height * 0.028}px ${height * 0.022}px ${height * 0.022}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: height * 0.018,
                  alignItems: 'center',
                  ...r,
                }}
              >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: height * 0.004}}>
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: height * 0.05,
                      fontWeight: 600,
                      color: AP.ACCENT,
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    T = {p.t.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: height * 0.019,
                      color: AP.INK_DIM,
                      textTransform: 'uppercase',
                      letterSpacing: height * 0.003,
                    }}
                  >
                    {p.caption}
                  </div>
                </div>

                <div style={{display: 'flex', gap: width * 0.018, alignItems: 'flex-end'}}>
                  {p.pct.map((v, i) => (
                    <ProbBar
                      key={labels[i]}
                      label={labels[i]}
                      score={scores[i]}
                      pct={v}
                      grow={grow}
                      color={COLORS[i]}
                      plotH={plotH}
                      barW={barW}
                    />
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        <div style={{display: 'flex', gap: width * 0.03, fontSize: height * 0.025, color: AP.INK_DIM, ...foot}}>
          <span>
            <span style={{color: AP.OUT_C, fontWeight: 600}}>C stays the favourite at every T.</span>{' '}
            What moves is how much it holds — 86.7% down to 50.6%.
          </span>
        </div>
      </div>
    </Stage>
  );
};
