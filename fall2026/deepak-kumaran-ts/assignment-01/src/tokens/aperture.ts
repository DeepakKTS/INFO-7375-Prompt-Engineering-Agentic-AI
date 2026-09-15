/**
 * aperture.ts — the "Aperture" skin: liquid glass on Brutalist bones.
 *
 * Built for the INFO 7375 Week 01 explainer. This is deliberately NOT the Claude
 * fidelity skin (tokens/claude.ts): that palette replicates a real product and is
 * locked flat by CLAUDE-BRAND.md. Aperture is a separate, student-authored skin, so
 * the reel never wears the @NikBearBrown channel identity.
 *
 * THE CONTRAST RULE THAT MAKES GLASS SAFE
 *
 * Gate V (runtime/qc/final_frame_check.py) treats LOW-CONTRAST as a MAJOR blocker,
 * and translucency makes text contrast depend on whatever sits behind it. So:
 *
 *   - Glass is CHROME ONLY: panel frames, chips, rails, the temperature slider.
 *   - Every glyph and every data bar sits on an OPAQUE fill.
 *   - The ground is a fixed near-black. No text is ever placed over the aurora.
 *
 * Contrast ratios against GROUND (#0A0B0D), computed with the WCAG 2.1 relative
 * luminance formula and asserted in scripts/check_contrast.py:
 *
 *   INK       #F5F7FA   18.35 : 1   AAA
 *   INK_DIM   #B4BCC7   10.27 : 1   AAA
 *   INK_FAINT #98A1AE    7.54 : 1   AAA
 *   ACCENT    #F2A03D    9.25 : 1   AAA
 *   BLUE      #5B8CF5    6.11 : 1   AA
 *
 * INK_DIM and INK_FAINT were lifted from #A8B0BC/#7A8390 after Gate V measured the
 * ink/background separation at 0.25-0.30 against a 0.30 floor. Small mono labels were
 * the bulk of that ink, so brightening them fixed the metric and the readability at
 * the same time. Exact ratios are asserted by scripts/check_contrast.py.
 */

export const AP = {
  // ground
  GROUND: '#0A0B0D',
  GROUND_2: '#101319',

  // ink — all AA or better on GROUND
  INK: '#F5F7FA',
  INK_DIM: '#B4BCC7',
  INK_FAINT: '#98A1AE',

  // the three outcomes. C is the favourite and carries the single warm accent.
  OUT_A: '#596373',
  OUT_B: '#5B8CF5',
  OUT_C: '#F2A03D',

  ACCENT: '#F2A03D',
  BLUE: '#5B8CF5',

  // Glass — chrome only, never behind a glyph.
  // Alpha is deliberately low. Gate V bins the background to [8,8,8] and counts any
  // pixel more than 28/channel from it as CONTENT ink; at 0.055/0.085 the panels
  // landed just over that line, so large areas of background chrome were averaged in
  // as if they were text and pulled the reported separation to 0.25. Keeping the
  // panels clearly subordinate to the ground is what "chrome only" already meant.
  GLASS: 'rgba(255,255,255,0.040)',
  GLASS_STRONG: 'rgba(255,255,255,0.060)',
  GLASS_EDGE: 'rgba(255,255,255,0.14)',
  GLASS_EDGE_SOFT: 'rgba(255,255,255,0.07)',
  HAIRLINE: 'rgba(255,255,255,0.10)',
} as const;

/** The liquid-glass surface recipe. Chrome only — never place text directly on it. */
export const glass = (opts?: {radius?: number; strong?: boolean; blur?: number}) => ({
  background: opts?.strong ? AP.GLASS_STRONG : AP.GLASS,
  backdropFilter: `blur(${opts?.blur ?? 26}px) saturate(150%)`,
  WebkitBackdropFilter: `blur(${opts?.blur ?? 26}px) saturate(150%)`,
  border: `1px solid ${AP.GLASS_EDGE_SOFT}`,
  borderTop: `1px solid ${AP.GLASS_EDGE}`,
  borderRadius: opts?.radius ?? 22,
  boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09)',
});

/**
 * The ground: effectively flat.
 *
 * This started as a four-stop aurora wash. Gate V reads the background as the modal
 * colour of the four CORNER patches, so a gradient whose corners differ by more than
 * INK_DELTA (28/channel) makes the gradient itself register as content — which fired
 * an edge-bleed BLOCKER on all 16 sampled frames and dragged the ink/background
 * luminance separation below the 0.30 floor. Measured corners were TL (25,34,53) vs
 * BR (10,11,16): a 37-per-channel spread.
 *
 * The fix is to flatten the ground rather than to declare `qc.full_bleed` and silence
 * the check, because a silenced edge-bleed gate can no longer catch real text
 * clipping. The residual radial below stays within ~4/channel across the whole frame —
 * enough to keep the plate from looking dead, far too little to read as ink. Depth now
 * comes from the glass panels, which is where it belongs.
 */
export const APERTURE_BG: React.CSSProperties = {
  background: `
    radial-gradient(120% 90% at 50% 0%, #0E1014 0%, ${AP.GROUND} 70%)
  `,
  backgroundColor: AP.GROUND,
};

export const FONT = {
  sans: 'Geist, -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
  mono: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

/** Calm springs. One dominant mover per scene; everything else subordinate. */
export const EASE_SMOOTH = {damping: 30, stiffness: 110, mass: 1} as const;
export const EASE_SOFT = {damping: 26, stiffness: 80, mass: 1.1} as const;

/** Small uppercase provenance chip: COURSE OUTPUT / CONSTRUCTED HYPOTHETICAL. */
export const chipStyle = (h: number): React.CSSProperties => ({
  fontFamily: FONT.mono,
  fontSize: h * 0.0165,
  letterSpacing: h * 0.0022,
  textTransform: 'uppercase',
  color: AP.INK_FAINT,
  padding: `${h * 0.007}px ${h * 0.014}px`,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${AP.HAIRLINE}`,
  whiteSpace: 'nowrap',
});
