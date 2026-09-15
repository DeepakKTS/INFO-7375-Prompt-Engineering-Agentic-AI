/**
 * TempBoundary — B06. The required limitation, stated on screen and in narration.
 *
 * Stipulates an answer key in which the WRONG outcome holds the largest score, then
 * lowers T. The distribution concentrates harder on the wrong answer. The mechanism
 * is working exactly as designed; treating its preference as a truth signal is the
 * error.
 *
 * LABELLING: the answer key is the only invented element in the entire reel. The
 * chapter calls it "an explicitly constructed hypothetical" (:214) and warns against
 * reporting it as an observed model error (:216) — so the chip uses the chapter's own
 * words and the scene never implies a real run.
 *
 * Use when: a beat must state what the explanation does NOT establish.
 *
 * Source: chapters/01-...:192, :212, :214-216; lessons/01-.../docs/en.md:27.
 * synonyms: limitation, boundary, truth, calibration, wrong answer, not a fact checker
 */
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, EASE_SMOOTH, EASE_SOFT, FONT} from '../tokens/aperture';
import {Heading, Panel, Stage, useRise, useAt} from './apertureKit';

export const tempBoundarySchema = z.object({
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  scores: z.array(z.number()).default([1, 2, 3]),
  /** the low-T distribution: concentration lands on the stipulated-wrong outcome */
  pct: z.array(z.number()).default([1.587624, 11.73104278, 86.68133322]),
  correctIndex: z.number().int().default(0),
  temperature: z.number().default(0.5),
  claim: z.string().default('Temperature changes the shape of the distribution.'),
  limit: z.string().default('It does not tell us whether the preferred answer is true.'),
});

type Props = z.infer<typeof tempBoundarySchema>;
const COLORS = [AP.OUT_A, AP.OUT_B, AP.OUT_C];

export const TempBoundary: React.FC<Props> = ({
  labels,
  scores,
  pct,
  correctIndex,
  temperature,
  claim,
  limit,
}) => {
  const frame = useCurrentFrame();
  const {height, width, fps} = useVideoConfig();
  const at = useAt();
  const keyIn = useRise(at(0.06));
  const chainIn = useRise(at(0.54));
  const plotH = height * 0.2;

  return (
    <Stage
      eyebrow="the boundary"
      chips={['CONSTRUCTED HYPOTHETICAL · ch.1 §214', 'NOT A CLAUDE RUN']}
    >
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: height * 0.03}}>
        <Heading delay={at(0.01)} size={0.046}>
          Confident, repeatable — and wrong.
        </Heading>

        <div style={{display: 'flex', gap: width * 0.03, alignItems: 'center'}}>
          {/* stipulated answer key + the low-T distribution */}
          <Panel
            style={{
              padding: `${height * 0.028}px ${height * 0.034}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: height * 0.018,
              ...keyIn,
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.019,
                color: AP.INK_FAINT,
                textTransform: 'uppercase',
                letterSpacing: height * 0.003,
              }}
            >
              stipulated answer key · T = {temperature.toFixed(1)}
            </div>
            <div style={{display: 'flex', gap: width * 0.028, alignItems: 'flex-end'}}>
              {pct.map((v, i) => {
                const s = spring({frame: frame - at(0.22) - i * at(0.03), fps, config: EASE_SOFT});
                const isCorrect = i === correctIndex;
                return (
                  <div key={labels[i]} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: height * 0.01}}>
                    <div
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: height * 0.026,
                        fontWeight: 600,
                        color: AP.INK,
                        fontVariantNumeric: 'tabular-nums',
                        opacity: s,
                      }}
                    >
                      {v.toFixed(1)}%
                    </div>
                    <div style={{height: plotH, display: 'flex', alignItems: 'flex-end'}}>
                      <div
                        style={{
                          width: width * 0.032,
                          height: Math.max(2, (v / 100) * plotH * s),
                          background: COLORS[i],
                          borderRadius: height * 0.005,
                        }}
                      />
                    </div>
                    <div style={{textAlign: 'center', fontFamily: FONT.mono, fontSize: height * 0.019, lineHeight: 1.4}}>
                      <div style={{color: AP.INK, fontWeight: 600}}>{labels[i]}</div>
                      <div style={{color: isCorrect ? AP.BLUE : AP.INK_FAINT}}>
                        {isCorrect ? 'CORRECT' : 'wrong'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize: height * 0.021, color: AP.INK_DIM, maxWidth: width * 0.33, lineHeight: 1.45}}>
              Lowering T concentrates <span style={{color: AP.OUT_C, fontWeight: 600}}>harder on C</span> — the
              answer the key says is wrong.
            </div>
          </Panel>

          {/* the chain: what temperature reaches, and where it stops */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: height * 0.016, ...chainIn}}>
            {[
              {a: 'TEMPERATURE', b: 'DISTRIBUTION SHAPE', ok: true},
              {a: 'TEMPERATURE', b: 'TRUTH', ok: false},
            ].map((row, i) => {
              const s = spring({frame: frame - at(0.60) - i * at(0.11), fps, config: EASE_SMOOTH});
              return (
                <Panel
                  key={row.b}
                  strong={!row.ok}
                  style={{
                    padding: `${height * 0.022}px ${height * 0.03}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: width * 0.014,
                    opacity: s,
                    transform: `translateX(${(1 - s) * width * 0.012}px)`,
                    borderLeft: `${Math.max(2, height * 0.004)}px solid ${row.ok ? AP.BLUE : AP.ACCENT}`,
                  }}
                >
                  <span style={{fontFamily: FONT.mono, fontSize: height * 0.026, color: AP.INK_DIM, letterSpacing: height * 0.002}}>
                    {row.a}
                  </span>
                  <span style={{fontSize: height * 0.03, color: row.ok ? AP.BLUE : AP.ACCENT}}>
                    {row.ok ? '→' : '↛'}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: height * 0.03,
                      fontWeight: 600,
                      color: AP.INK,
                      letterSpacing: height * 0.002,
                    }}
                  >
                    {row.b}
                  </span>
                </Panel>
              );
            })}
            <div style={{fontSize: height * 0.024, color: AP.INK_DIM, lineHeight: 1.5, marginTop: height * 0.006}}>
              {claim}
              <br />
              <span style={{color: AP.INK, fontWeight: 500}}>{limit}</span>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};
