/**
 * TempSoftmax — B03. Scores become probabilities: exponentiate, total, normalise.
 *
 * A left-to-right pipeline at T = 1, using the chapter's own intermediate values:
 * weights 0.135335 / 0.367879 / 1, total 1.503215, then the recorded probabilities.
 *
 * Use when: a beat must show the softmax step without turning into a softmax lecture.
 *
 * Source: chapters/01-randomness-and-first-prompts.md:154 (weights and total) and
 *         :206-210 / research/worked-examples.json (the probabilities).
 * synonyms: softmax, exponentiate, normalise, weights, probabilities
 */
import React from 'react';
import {useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, FONT} from '../tokens/aperture';
import {FlowArrow, Heading, Panel, Stage, useRise, useAt} from './apertureKit';

export const tempSoftmaxSchema = z.object({
  labels: z.array(z.string()).default(['A', 'B', 'C']),
  divided: z.array(z.number()).default([-2, -1, 0]),
  weights: z.array(z.string()).default(['0.135335', '0.367879', '1.000000']),
  total: z.string().default('1.503215'),
  percent: z.array(z.string()).default(['9.00', '24.47', '66.52']),
  temperature: z.number().default(1.0),
  formula: z.string().default('p_i = exp(z_i / T) ÷ Σ exp(z_j / T)'),
});

type Props = z.infer<typeof tempSoftmaxSchema>;
const COLORS = [AP.OUT_A, AP.OUT_B, AP.OUT_C];

const Col: React.FC<{
  title: string;
  rows: string[];
  delay: number;
  tinted?: boolean;
  labels: string[];
  big?: boolean;
}> = ({title, rows, delay, tinted, labels, big}) => {
  const {height} = useVideoConfig();
  const r = useRise(delay);
  return (
    <Panel
      style={{
        padding: `${height * 0.026}px ${height * 0.03}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: height * 0.014,
        minWidth: height * 0.26,
        ...r,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: height * 0.0175,
          color: AP.INK_FAINT,
          textTransform: 'uppercase',
          letterSpacing: height * 0.0028,
        }}
      >
        {title}
      </div>
      {rows.map((v, i) => (
        <div key={labels[i]} style={{display: 'flex', alignItems: 'baseline', gap: height * 0.012}}>
          <span style={{fontFamily: FONT.mono, fontSize: height * 0.02, color: AP.INK_FAINT, width: height * 0.022}}>
            {labels[i]}
          </span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: height * (big ? 0.038 : 0.03),
              fontWeight: 600,
              color: tinted ? COLORS[i] : AP.INK,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </Panel>
  );
};

export const TempSoftmax: React.FC<Props> = ({
  labels,
  divided,
  weights,
  total,
  percent,
  temperature,
  formula,
}) => {
  const {height, width} = useVideoConfig();
  const at = useAt();
  const totalIn = useRise(at(0.62));
  const note = useRise(at(0.82));

  return (
    <Stage eyebrow={`softmax · T = ${temperature.toFixed(1)}`} chips={['COURSE OUTPUT · ch.1 §154']}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: height * 0.03}}>
        <Heading delay={at(0.02)}>Exponentiate, total, normalise.</Heading>

        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: height * 0.028,
            color: AP.INK_DIM,
            ...useRise(at(0.08)),
          }}
        >
          {formula}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: width * 0.012, flexWrap: 'nowrap'}}>
          <Col title="z − max, ÷ T" rows={divided.map(String)} delay={at(0.16)} labels={labels} />
          <FlowArrow delay={at(0.26)} label="exp" />
          <Col title="weights" rows={weights} delay={at(0.32)} labels={labels} />
          <FlowArrow delay={at(0.50)} label={`÷ ${total}`} />
          <Col title="probability" rows={percent.map((p) => `${p}%`)} delay={at(0.60)} labels={labels} tinted big />
        </div>

        <div style={{display: 'flex', gap: width * 0.02, alignItems: 'center', ...totalIn}}>
          <Panel style={{padding: `${height * 0.014}px ${height * 0.024}px`}}>
            <span style={{fontFamily: FONT.mono, fontSize: height * 0.022, color: AP.INK_DIM}}>
              total weight = <span style={{color: AP.ACCENT, fontWeight: 600}}>{total}</span>
            </span>
          </Panel>
        </div>

        <div style={{fontSize: height * 0.026, color: AP.INK_DIM, ...note}}>
          The ordering came through untouched — the largest score still has the largest probability.
        </div>
      </div>
    </Stage>
  );
};
