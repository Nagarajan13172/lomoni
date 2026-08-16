// Preset poses are stored as *offsets from the rest pose*, in radians,
// per joint: { jointName: [x, y, z] }. Applying a preset first resets every
// joint to rest, then adds these offsets — so presets are absolute, not
// cumulative. They are deliberately gentle "starting points"; the exact look
// depends on the rig's axis conventions, so fine-tune with the sliders/gizmo.

import { buildPose } from "./anatomy";

const d = (deg) => (deg * Math.PI) / 180;

export const PRESETS = [
  {
    id: "rest",
    label: "Rest",
    icon: "🧍",
    pose: {}, // empty -> pure reset
  },
  {
    id: "wave",
    label: "Wave",
    icon: "👋",
    pose: {
      r_shoulder: [0, 0, d(115)],
      r_forearm: [d(35), 0, d(10)],
      r_hand: [0, 0, d(-15)],
      l_shoulder: [0, 0, d(-12)],
      body: [0, d(10), d(-4)],
      head: [0, d(14), d(-4)],
    },
  },
  {
    id: "cheer",
    label: "Cheer",
    icon: "🙌",
    pose: {
      l_shoulder: [0, 0, d(-150)],
      r_shoulder: [0, 0, d(150)],
      l_forearm: [d(20), 0, 0],
      r_forearm: [d(20), 0, 0],
      body: [d(-8), 0, 0],
      head: [d(-10), 0, 0],
    },
  },
  {
    id: "sit",
    label: "Sit",
    icon: "🪑",
    pose: {
      l_thigh: [d(-90), 0, 0],
      r_thigh: [d(-90), 0, 0],
      l_shin: [d(90), 0, 0],
      r_shin: [d(90), 0, 0],
      l_shoulder: [0, 0, d(-12)],
      r_shoulder: [0, 0, d(12)],
      l_forearm: [d(35), 0, 0],
      r_forearm: [d(35), 0, 0],
      waist: [0, 0, 0],
    },
  },
  {
    id: "run",
    label: "Run",
    icon: "🏃",
    // Authored through the calibrated anatomy engine (T-pose rest): arms must be
    // LOWERED to the sides before swinging, and the knee hinge is -X. The old
    // raw-euler version rotated the still-horizontal arms overhead and bent the
    // knees backward. Mid-stride: right leg drives forward, left trails; arms
    // swing in opposition (left forward / right back) with bent elbows.
    pose: buildPose((a) => {
      a.bendForward(15); // torso pitched into the run
      a.twist(-6); // slight counter-rotation, left shoulder forward

      // Legs — right drives up-and-forward, left pushes off behind.
      a.hipFlex("r", 52);
      a.knee("r", 70);
      a.ankle("r", 10);
      a.hipExtend("l", 30);
      a.knee("l", 55);
      a.ankle("l", -25); // plantarflex — toe-off

      // Arms — down at the sides, then opposite swing with ~90° elbows.
      a.lowerArm("l", 80);
      a.lowerArm("r", 80);
      a.armForward("l", 40);
      a.armBack("r", 40);
      a.elbow("l", 90);
      a.elbow("r", 90);

      a.headNod(-6); // eyes up, looking ahead
    }),
  },
  {
    id: "think",
    label: "Thinker",
    icon: "🤔",
    pose: {
      body: [d(18), d(-6), 0],
      head: [d(14), d(-10), 0],
      r_shoulder: [0, 0, d(70)],
      r_forearm: [d(110), 0, 0],
      r_hand: [d(20), 0, 0],
      l_shoulder: [0, 0, d(-10)],
      l_thigh: [d(-15), 0, 0],
    },
  },
  {
    id: "kick",
    label: "Kick",
    icon: "🦵",
    pose: {
      r_thigh: [d(-95), 0, 0],
      r_shin: [d(20), 0, 0],
      l_thigh: [d(10), 0, 0],
      body: [d(-10), d(-8), 0],
      l_shoulder: [0, 0, d(-55)],
      r_shoulder: [0, 0, d(35)],
      l_forearm: [d(40), 0, 0],
      head: [0, d(-8), 0],
    },
  },
  {
    id: "dab",
    label: "Dab",
    icon: "😎",
    pose: {
      l_shoulder: [0, 0, d(-140)],
      l_forearm: [d(30), 0, 0],
      r_shoulder: [0, 0, d(-40)],
      r_forearm: [d(20), 0, 0],
      head: [d(20), d(-25), d(-10)],
      body: [0, d(-10), 0],
    },
  },
];
