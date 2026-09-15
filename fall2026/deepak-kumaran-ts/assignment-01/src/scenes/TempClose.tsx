/**
 * TempClose — B07. The takeaway, then the card: author, course, and disclosures.
 *
 * The closing sentence is written to be mathematically faithful rather than tidy:
 * it names what temperature acts on (existing score differences) and what it produces
 * (sampling probabilities), and claims nothing else.
 *
 * The card carries the synthetic-narration disclosure, because the course prerequisite
 * requires disclosing it and the reel's own subject is honest reporting.
 *
 * Use when: closing a student explainer that must credit its tools truthfully.
 *
 * synonyms: takeaway, outro, close, credits, disclosure, summary
 */
import React from 'react';
import {useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AP, FONT} from '../tokens/aperture';
import {Panel, Stage, useRise, useAt} from './apertureKit';

export const tempCloseSchema = z.object({
  takeaway: z
    .string()
    .default(
      'Temperature is a concentration control: it changes how sharply the model’s existing score differences translate into sampling probabilities.',
    ),
  title: z.string().default('Temperature as a Concentration Control'),
  author: z.string().default('Deepak Kumaran Thoppudu Sudharsanan'),
  course: z.string().default('INFO 7375 · Prompt Engineering for Generative AI · Week 01'),
  notes: z
    .array(z.string())
    .default([
      'All values computed by scripts/verify_temperature.py and checked against the course’s recorded worked examples',
      'Narration: Kokoro af_bella — synthetic voice, local, disclosed',
      'Built with brutalist.art · not affiliated with or endorsed by the instructor’s channel',
    ]),
});

type Props = z.infer<typeof tempCloseSchema>;

export const TempClose: React.FC<Props> = ({takeaway, title, author, course, notes}) => {
  const {height, width} = useVideoConfig();
  const at = useAt();
  const line = useRise(at(0.04));
  const rule = useRise(at(0.34));
  const card = useRise(at(0.44));

  return (
    <Stage eyebrow="the takeaway">
      {/* space-between, not center: centring left the lower half of the safe area
          empty, which Gate V correctly flagged as underfill at 51%. */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: height * 0.045,
          paddingBottom: 0,
          gap: height * 0.04,
        }}
      >
        <div
          style={{
            fontSize: height * 0.068,
            fontWeight: 600,
            lineHeight: 1.28,
            letterSpacing: -height * 0.0009,
            color: AP.INK,
            maxWidth: width * 0.94,
            ...line,
          }}
        >
          {takeaway.split('concentration control').length > 1 ? (
            <>
              {takeaway.split('concentration control')[0]}
              <span style={{color: AP.ACCENT}}>concentration control</span>
              {takeaway.split('concentration control')[1]}
            </>
          ) : (
            takeaway
          )}
        </div>

        <div
          style={{
            height: Math.max(1, height * 0.0016),
            background: AP.HAIRLINE,
            width: '100%',
            transformOrigin: 'left center',
            transform: `scaleX(${rule.s})`,
          }}
        />

        <Panel
          style={{
            padding: `${height * 0.038}px ${height * 0.042}px`,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: width * 0.04,
            ...card,
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: height * 0.008, flex: '0 0 auto'}}>
            <div style={{fontSize: height * 0.034, fontWeight: 600, color: AP.INK}}>{title}</div>
            <div style={{fontSize: height * 0.027, color: AP.INK_DIM}}>{author}</div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: height * 0.018,
                color: AP.INK_FAINT,
                whiteSpace: 'nowrap',
              }}
            >
              {course}
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: height * 0.009, maxWidth: width * 0.40}}>
            {notes.map((n) => (
              <div
                key={n}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: height * 0.018,
                  color: AP.INK_FAINT,
                  lineHeight: 1.5,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Stage>
  );
};
