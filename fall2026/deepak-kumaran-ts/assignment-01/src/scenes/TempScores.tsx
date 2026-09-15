/**
 * TempScores — B01. The starting point: three scores that are not yet probabilities.
 *
 * Shows logits [1,2,3] as tiles, then states the two conditions a probability
 * distribution must meet, then rules out the naive normaliser (divide by the sum)
 * with the chapter's own reason: it would not survive a negative score.
 *
 * Use when: a beat must establish "these numbers rank outcomes but are not chances".
 *
 * Source: chapters/01-randomness-and-first-prompts.md:134-136.
 * synonyms: logits, scores, normalisation, probability, starting point
 */
import React from 'react';
import {useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, FONT} from '../tokens/aperture';
import {Heading, Panel, Stage, Sub, ValueTile, useRise, useAt} from './apertureKit';

export const tempScoresSchema = z.object({
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  scores: z.array(z.number()).default([1, 2, 3]),
  heading: z.string().default('Three scores. Not yet probabilities.'),
});

type Props = z.infer<typeof tempScoresSchema>;

export const TempScores: React.FC<Props> = ({labels, scores, heading}) => {
  const {height, width} = useVideoConfig();
  const sum = scores.reduce((a, b) => a + b, 0);
  const at = useAt();
  const rules = useRise(at(0.38));
  const reject = useRise(at(0.58));
  const strike = useRise(at(0.63));

  return (
    <Stage
      eyebrow="the starting point"
      chips={['COURSE INPUT · ch.1 §134', 'CHOSEN BY HAND · NOT MODEL OUTPUT']}
    >
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: height * 0.042}}>
        <Heading delay={at(0.02)}>{heading}</Heading>

        <div style={{display: 'flex', gap: width * 0.018, alignItems: 'flex-end'}}>
          {scores.map((z_, i) => (
            <ValueTile
              key={labels[i]}
              label={`outcome ${labels[i]}`}
              value={String(z_)}
              tint={[AP.OUT_A, AP.OUT_B, AP.OUT_C][i]}
              delay={at(0.08) + i * at(0.045)}
              sub="score z"
            />
          ))}
        </div>

        <div style={{display: 'flex', gap: width * 0.03, alignItems: 'center', ...rules}}>
          <Panel
            style={{
              padding: `${height * 0.024}px ${height * 0.032}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: height * 0.01,
            }}
          >
            <div style={{fontFamily: FONT.mono, fontSize: height * 0.019, color: AP.INK_FAINT, textTransform: 'uppercase', letterSpacing: height * 0.003}}>
              a distribution must
            </div>
            <div style={{fontSize: height * 0.028, color: AP.INK, lineHeight: 1.5}}>
              be non-negative &nbsp;·&nbsp; sum to one
            </div>
          </Panel>

          <div style={{display: 'flex', flexDirection: 'column', gap: height * 0.008, ...reject}}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.034,
                color: AP.INK_DIM,
                fontVariantNumeric: 'tabular-nums',
                position: 'relative',
                // align-self, not inline-block: the parent is a flex COLUMN, whose
                // children stretch to full width by default — which made the
                // strike-through rule run far past the end of "these sum to 6".
                display: 'inline-block',
                alignSelf: 'flex-start',
              }}
            >
              these sum to {sum}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '52%',
                  height: Math.max(2, height * 0.0028),
                  background: AP.ACCENT,
                  transform: `scaleX(${strike.s})`,
                  transformOrigin: 'left center',
                }}
              />
            </div>
            <div style={{fontSize: height * 0.0225, color: AP.INK_FAINT, lineHeight: 1.45, maxWidth: width * 0.34}}>
              dividing by {sum} would normalise this one list — but it breaks on a negative score
            </div>
          </div>
        </div>

        <Sub delay={at(0.82)}>
          The transformation we want has to work for any finite score.
        </Sub>
      </div>
    </Stage>
  );
};
