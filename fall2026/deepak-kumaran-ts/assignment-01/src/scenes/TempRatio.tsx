/**
 * TempRatio — B05. Why it happens: the ratio law, with the normaliser cancelling.
 *
 *     p_i / p_k = exp((z_i − z_k) / T)
 *
 * With the course's logits the gap between the top two outcomes is exactly 1, so the
 * ratio collapses to e^(1/T) — 7.389 / 2.718 / 1.649. This is the beat that replaces
 * the "creativity knob" story with an actual mechanism, which is precisely how the
 * chapter frames it.
 *
 * Use when: a beat must explain WHY concentration changes, not just that it does.
 *
 * Source: chapters/01-randomness-and-first-prompts.md:194-200.
 * synonyms: ratio, odds, exponent, mechanism, why, creativity misconception
 */
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, EASE_SMOOTH, FONT} from '../tokens/aperture';
import {Heading, Panel, Stage, useRise, useAt} from './apertureKit';

export const tempRatioSchema = z.object({
  law: z.string().default('p_i / p_k  =  exp( (z_i − z_k) / T )'),
  gapNote: z.string().default('here z_C − z_B = 1, so the ratio is simply e^(1/T)'),
  rows: z
    .array(z.object({t: z.number(), ratio: z.string(), note: z.string()}))
    .default([
      {t: 0.5, ratio: '7.389', note: 'C is 7.4× B'},
      {t: 1.0, ratio: '2.718', note: 'C is 2.7× B'},
      {t: 2.0, ratio: '1.649', note: 'C is 1.6× B'},
    ]),
  misconception: z.string().default('temperature ≠ “creativity”'),
  correction: z.string().default('temperature → how sharply score gaps become odds'),
});

type Props = z.infer<typeof tempRatioSchema>;

export const TempRatio: React.FC<Props> = ({law, gapNote, rows, misconception, correction}) => {
  const frame = useCurrentFrame();
  const {height, width, fps} = useVideoConfig();
  const at = useAt();
  const lawIn = useRise(at(0.05));
  const gapIn = useRise(at(0.18));
  const fixIn = useRise(at(0.78));
  const strike = spring({frame: frame - at(0.83), fps, config: EASE_SMOOTH});

  return (
    <Stage eyebrow="why it happens" chips={['COURSE SOURCE · ch.1 §194']}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: height * 0.03}}>
        <Heading delay={at(0.01)} size={0.046}>
          The normaliser cancels. What is left is the gap over T.
        </Heading>

        <Panel
          strong
          style={{
            alignSelf: 'flex-start',
            padding: `${height * 0.03}px ${height * 0.042}px`,
            ...lawIn,
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: height * 0.05,
              fontWeight: 600,
              color: AP.INK,
              letterSpacing: height * 0.0008,
            }}
          >
            {law}
          </span>
        </Panel>

        {/* Typeset e^(1/T) with a real superscript rather than a caret — this is a
            mathematics beat and the exponent is the thing being talked about. */}
        <div style={{fontSize: height * 0.028, color: AP.ACCENT, ...gapIn}}>
          {gapNote.split('e^(1/T)')[0]}
          <span style={{fontFamily: FONT.mono, fontWeight: 600}}>
            e
            <sup style={{fontSize: '0.62em', verticalAlign: 'super', lineHeight: 0}}>1/T</sup>
          </span>
          {gapNote.split('e^(1/T)')[1] ?? ''}
        </div>

        <div style={{display: 'flex', gap: width * 0.018}}>
          {rows.map((r, i) => {
            const delay = at(0.34) + i * at(0.10);
            const s = spring({frame: frame - delay, fps, config: EASE_SMOOTH});
            return (
              <Panel
                key={r.t}
                style={{
                  flex: 1,
                  padding: `${height * 0.026}px ${height * 0.03}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: height * 0.008,
                  opacity: s,
                  transform: `translateY(${(1 - s) * height * 0.02}px)`,
                }}
              >
                <div style={{fontFamily: FONT.mono, fontSize: height * 0.024, color: AP.INK_DIM}}>
                  T = {r.t.toFixed(1)}
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: height * 0.072,
                    fontWeight: 600,
                    color: AP.ACCENT,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {r.ratio}
                </div>
                <div style={{fontFamily: FONT.mono, fontSize: height * 0.02, color: AP.INK_FAINT}}>
                  {r.note}
                </div>
              </Panel>
            );
          })}
        </div>

        {/* the misconception, struck through and replaced */}
        <div style={{display: 'flex', alignItems: 'center', gap: width * 0.02, ...fixIn}}>
          <div style={{position: 'relative', display: 'inline-block'}}>
            <span style={{fontSize: height * 0.028, color: AP.INK_FAINT}}>{misconception}</span>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '52%',
                height: Math.max(2, height * 0.0026),
                background: AP.ACCENT,
                transform: `scaleX(${strike})`,
                transformOrigin: 'left center',
              }}
            />
          </div>
          <span style={{fontSize: height * 0.028, color: AP.INK, fontWeight: 500}}>{correction}</span>
        </div>
      </div>
    </Stage>
  );
};
