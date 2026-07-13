# Room 3D Asset Attributions

## Used

- Furniture Kit by Kenney
  Source: https://kenney.nl/assets/furniture-kit
  License: Creative Commons CC0
  Local archive: `kenney_furniture-kit.zip`
  Used for: desk, chair, cabinet, bookcase, rug, sofa, pillow, books, plant, lamp, radio, speaker, computer screen, keyboard, mouse.

- Pothos plant model (`../plants/pothos.glb`)
  Generated in-house with Blender 5.1 via `scripts/make_plants.py` (procedural, no external assets).
  (The orchid GLB was retired — `Orchid.tsx` uses the hand-tuned three.js version instead.)
  Regenerate: `/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/make_plants.py`

- Black cat body parts (`../cat.glb`)
  Generated in-house with Blender 5.1 via `scripts/make_cat.py` (lofted subdivision surfaces, no external assets).
  Split by animation pivot: body / head (ears attached) / leg_front / leg_hind; eyes, nose,
  whiskers and tail remain procedural in `src/site/room/objects/Cat.tsx`.
  Regenerate: `/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/make_cat.py`

## Notes

- Sketchfab search results were evaluated for retro computer, typewriter, record player, and handheld console assets, but the public download endpoint requires an authenticated Sketchfab API token.
- If a Sketchfab token is provided later, `scripts/download_room_assets.mjs` can be adapted to fetch those CC/NonCommercial models and merge them into the room.
