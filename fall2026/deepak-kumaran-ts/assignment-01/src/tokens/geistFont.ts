/**
 * geistFont.ts — loads Geist + Geist Mono for the INFO 7375 Aperture scenes.
 *
 * Geist is SIL OFL 1.1, (c) 2023 Vercel in collaboration with basement.studio.
 * Files live at runtime/remotion/public/fonts/, license alongside them.
 *
 * WHY THE HOOK, NOT MODULE SCOPE
 *
 * Root.tsx imports 600+ compositions. A module-scope delayRender() would block every
 * one of them on a font only these eight scenes use — the exact warning carried by
 * scenes/LogoMotion.tsx. So this is a hook, called inside each component.
 *
 * WHY IT MUST NOT FAIL SILENTLY
 *
 * tokens/vox.ts admits Montserrat "has silently been rendering in the system sans"
 * because nothing ever loaded it. A catch-and-continue would reproduce that bug in a
 * video whose typeface is a stated design decision. So a load failure THROWS rather
 * than falling back — a hard build failure is honest, a silent Helvetica is not.
 *
 * useGeist() returns true once the faces are in document.fonts, so a scene can hold
 * its first frame until text will actually paint in Geist.
 */
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

type Face = {family: string; file: string; weight: number};

const FACES: Face[] = [
  {family: 'Geist', file: 'fonts/Geist-Regular.woff2', weight: 400},
  {family: 'Geist', file: 'fonts/Geist-Medium.woff2', weight: 500},
  {family: 'Geist', file: 'fonts/Geist-SemiBold.woff2', weight: 600},
  {family: 'Geist', file: 'fonts/Geist-Bold.woff2', weight: 700},
  {family: 'Geist Mono', file: 'fonts/GeistMono-Regular.woff2', weight: 400},
  {family: 'Geist Mono', file: 'fonts/GeistMono-Medium.woff2', weight: 500},
  {family: 'Geist Mono', file: 'fonts/GeistMono-SemiBold.woff2', weight: 600},
];

let cached: Promise<void> | null = null;

const loadAll = (): Promise<void> => {
  if (cached) return cached;
  cached = Promise.all(
    FACES.map(async (f) => {
      const face = new FontFace(
        f.family,
        `url(${staticFile(f.file)}) format('woff2')`,
        {weight: String(f.weight), style: 'normal'},
      );
      const loaded = await face.load();
      (document.fonts as unknown as {add: (x: FontFace) => void}).add(loaded);
    }),
  ).then(() => undefined);
  return cached;
};

/** Blocks the render until Geist is really available. Throws if it is not. */
export const useGeist = (): boolean => {
  const [handle] = useState(() => delayRender('Aperture: loading Geist'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadAll()
      .then(() => {
        if (!alive) return;
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        // Deliberately NOT continueRender(handle) on the happy path here:
        // fail loudly instead of shipping a silent system-font fallback.
        throw new Error(
          `Geist failed to load — refusing to render in a fallback face. ${String(err)}`,
        );
      });
    return () => {
      alive = false;
    };
  }, [handle]);

  return ready;
};
