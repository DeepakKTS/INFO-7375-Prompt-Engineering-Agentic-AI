#!/usr/bin/env bash
# Copy the authored scene sources from the toolkit's Remotion project into this
# submission, so the archived copies never drift from what actually rendered.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TK="${1:-$HERE/../../../../brutalist.art/runtime/remotion/src}"
cp "$TK/tokens/aperture.ts" "$TK/tokens/geistFont.ts" "$HERE/src/tokens/"
cp "$TK/scenes/apertureKit.tsx" "$TK"/scenes/Temp*.tsx "$HERE/src/scenes/"
{
  echo "// Root.tsx registration block for the INFO 7375 Aperture scenes."
  echo "// Paste into brutalist.art/runtime/remotion/src/Root.tsx."
  echo "// Without a <Composition>, remotion_scenes.py cannot see a scene file at all."
  echo
  echo "// --- 1. imports (beside the other scene imports) ---"
  grep "from './scenes/Temp" "$TK/Root.tsx"
  echo
  echo "// --- 2. the metadata calculator (above 'export const RemotionRoot') ---"
  sed -n '/^const apertureMetadata/,/^};/p' "$TK/Root.tsx"
  echo
  echo "// --- 3. the compositions (inside the returned fragment) ---"
  sed -n '/<Folder name="INFO7375-Temperature">/,/<\/Folder>/p' "$TK/Root.tsx"
} > "$HERE/src/Root.registration.tsx.txt"
echo "synced src/ from $TK"
