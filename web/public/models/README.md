# Characters

Models the studio can pose. Each becomes a card in the **Characters** tab.

## What's here

- `lay_figure.glb` — the native rigged wooden mannequin. Its bone names
  (`waist`, `body`, `head`, `l_shoulder`, `l_forearm`, `l_hand`, `l_thigh`, …)
  are the reference rig the entire pose library is authored against.
- `paper-bust*.glb` — static (unrigged) busts; not poseable.

## Add a Mixamo character (with your own license)

Mixamo characters ride a different skeleton (`mixamorig:Hips`, `mixamorig:LeftArm`,
…), so the studio remaps them on load — see `src/mannequin/character/retarget.js`.
You just supply the file:

1. On **mixamo.com**, pick a character, choose the **T-pose** (no animation), and
   **Download** as **Format: glTF Binary (.glb)**.
   *(If you can only get FBX, convert to GLB — e.g. with `fbx2gltf` or Blender.)*
2. Drop the `.glb` into this folder, e.g. `models/mixamo-xbot.glb`.
3. Register it in `src/mannequin/character/characters.js`:

   ```js
   {
     id: "mixamo-xbot",
     name: "X Bot",
     url: "/models/mixamo-xbot.glb",
     icon: "🤖",
     source: "mixamo",
     retarget: MIXAMO_PROFILE,
   }
   ```

That's it — the character appears in the Characters tab and all 110 poses,
presets, mirror, and randomize drive it.

### If a character imports facing away or a joint won't move
- **Facing / on its side:** set `rootRotationDeg: [x, y, z]` on that character's
  `retarget` (a copy of `MIXAMO_PROFILE`) — usually `[0, 180, 0]`.
- **A joint doesn't pose:** the Characters tab shows which bones didn't map (also
  logged to the console). Add the source bone name to the `map` in the profile.

### Licensing
Your Mixamo license lets you **use** these assets in your project. Do **not**
commit them to a public repository unless your license permits redistribution —
keep them local or in a private/ignored path.
