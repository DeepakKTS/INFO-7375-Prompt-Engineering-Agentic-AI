/**
 * apertureKit.tsx — shared parts for the INFO 7375 "temperature" scenes.
 *
 * Not a composition. A small kit so the eight Temp* scenes stay short and share one
 * visual grammar: glass chrome, opaque ink, one accent, calm springs.
 *
 * LAYOUT CONTRACT: everything is expressed as a fraction of `height`, never in fixed
 * pixels, so the same source renders correctly at 1080p and at --scale=2 (4K).
 */
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AP, APERTURE_BG, EASE_SMOOTH, FONT, chipStyle, glass} from '../tokens/aperture';
import {useGeist} from '../tokens/geistFont';

/**
 * Fraction-of-beat timing.
 *
 * Every beat's real length is the measured Kokoro mp3, so a hard-coded frame delay
 * would finish the animation in the first few seconds and leave a frozen slide for
 * the rest of the narration — the PPT-test failure. Scenes therefore express every
 * reveal as a FRACTION of the beat and let this convert it, which keeps motion in
 * step with whatever the audio clock turns out to be.
 *
 * Composition duration is supplied per beat by calculateMetadata in Root.tsx.
 */
export const useAt = () => {
  const {durationInFrames} = useVideoConfig();
  return (fraction: number) => Math.round(fraction * durationInFrames);
};

/** Fade/rise helper driven by a spring, staggered by `delay` frames. */
export const useRise = (delay: number, config = EASE_SMOOTH) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config});
  return {
    opacity: interpolate(s, [0, 1], [0, 1], {extrapolateRight: 'clamp'}),
    transform: `translateY(${interpolate(s, [0, 1], [height * 0.022, 0])}px)`,
    s,
  };
};

/**
 * The stage every Temp* scene sits on: fixed ground + aurora, safe-area padding,
 * an eyebrow, and the provenance chips. Holds the frame until Geist is loaded.
 */
export const Stage: React.FC<{
  eyebrow?: string;
  chips?: string[];
  children: React.ReactNode;
}> = ({eyebrow, chips = [], children}) => {
  const {height, width} = useVideoConfig();
  const ready = useGeist();
  const head = useRise(0);

  // Hold on the ground rather than paint text in a fallback face.
  if (!ready) return <AbsoluteFill style={APERTURE_BG} />;

  return (
    <AbsoluteFill style={{...APERTURE_BG, fontFamily: FONT.sans, color: AP.INK}}>
      <AbsoluteFill
        style={{
          paddingLeft: width * 0.05,
          paddingRight: width * 0.05,
          paddingTop: height * 0.05,
          paddingBottom: height * 0.05,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {(eyebrow || chips.length > 0) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: width * 0.02,
              ...head,
            }}
          >
            {eyebrow ? (
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: height * 0.0185,
                  letterSpacing: height * 0.0035,
                  textTransform: 'uppercase',
                  color: AP.INK_DIM,
                  fontWeight: 500,
                }}
              >
                {eyebrow}
              </div>
            ) : (
              <div />
            )}
            <div style={{display: 'flex', gap: width * 0.008}}>
              {chips.map((c) => (
                <div key={c} style={chipStyle(height)}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A glass panel. Chrome only — its children must carry their own opaque ink. */
export const Panel: React.FC<{
  style?: React.CSSProperties;
  strong?: boolean;
  children?: React.ReactNode;
}> = ({style, strong, children}) => (
  <div style={{...glass({strong}), ...style}}>{children}</div>
);

/** A score/value tile: mono numeral over a label. The workhorse of the reel. */
export const ValueTile: React.FC<{
  label: string;
  value: string;
  tint?: string;
  delay?: number;
  sub?: string;
  size?: number;
}> = ({label, value, tint = AP.INK, delay = 0, sub, size = 1}) => {
  const {height} = useVideoConfig();
  const r = useRise(delay);
  return (
    <Panel
      style={{
        padding: `${height * 0.026}px ${height * 0.034}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: height * 0.008,
        minWidth: height * 0.21 * size,
        ...r,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: height * 0.019,
          letterSpacing: height * 0.003,
          textTransform: 'uppercase',
          color: AP.INK_FAINT,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: height * 0.085 * size,
          fontWeight: 600,
          color: tint,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: height * 0.018,
            color: AP.INK_DIM,
          }}
        >
          {sub}
        </div>
      )}
    </Panel>
  );
};

/** Section heading. Sentence case, Geist, tight. */
export const Heading: React.FC<{children: React.ReactNode; delay?: number; size?: number}> = ({
  children,
  delay = 0,
  size = 0.052,
}) => {
  const {height} = useVideoConfig();
  const r = useRise(delay);
  return (
    <div
      style={{
        fontSize: height * size,
        fontWeight: 600,
        letterSpacing: -height * 0.0011,
        lineHeight: 1.12,
        color: AP.INK,
        ...r,
      }}
    >
      {children}
    </div>
  );
};

/** Secondary line under a heading. */
export const Sub: React.FC<{children: React.ReactNode; delay?: number}> = ({
  children,
  delay = 0,
}) => {
  const {height} = useVideoConfig();
  const r = useRise(delay);
  return (
    <div
      style={{
        fontSize: height * 0.0265,
        lineHeight: 1.45,
        color: AP.INK_DIM,
        fontWeight: 400,
        ...r,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A vertical probability bar with its percentage above it.
 *
 * The bar is an OPAQUE fill (never glass) so Gate V's contrast audit has something
 * deterministic to measure. `grow` is supplied by the caller so several bars can be
 * animated from one shared spring and stay in lockstep.
 */
export const ProbBar: React.FC<{
  label: string;
  score: number;
  pct: number;
  grow: number;
  color: string;
  plotH: number;
  barW: number;
  dim?: boolean;
}> = ({label, score, pct, grow, color, plotH, barW, dim}) => {
  const {height} = useVideoConfig();
  const h = Math.max(2, (pct / 100) * plotH * grow);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: height * 0.012}}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: height * 0.032,
          fontWeight: 600,
          color: dim ? AP.INK_DIM : AP.INK,
          fontVariantNumeric: 'tabular-nums',
          opacity: interpolate(grow, [0.4, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        {pct.toFixed(1)}%
      </div>
      <div style={{height: plotH, display: 'flex', alignItems: 'flex-end'}}>
        <div
          style={{
            width: barW,
            height: h,
            background: color,
            borderRadius: height * 0.006,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: height * 0.021,
          color: AP.INK_DIM,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        <div style={{color: AP.INK, fontWeight: 600}}>{label}</div>
        <div>z = {score}</div>
      </div>
    </div>
  );
};

/** The arrow that carries the eye between stages of the transformation. */
export const FlowArrow: React.FC<{delay?: number; label?: string}> = ({delay = 0, label}) => {
  const {height} = useVideoConfig();
  const r = useRise(delay);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: height * 0.006,
        ...r,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: height * 0.019,
            color: AP.ACCENT,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
      <div style={{fontSize: height * 0.036, color: AP.INK_FAINT, lineHeight: 1}}>→</div>
    </div>
  );
};
