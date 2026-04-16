// Internal game resolution — rendered at this size, then scaled up with nearest-neighbor
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

// Physics
export const GRAVITY = 800;

// Double Dragon-style walkable zone:
// The "ground plane" occupies roughly the bottom 60% of the screen.
// Players walk freely between WALK_MIN_Y (back of street) and WALK_MAX_Y (front).
export const WALK_MIN_Y = 167;  // Top of walkable area (far from camera)
export const WALK_MAX_Y = 333;  // Bottom of walkable area (close to camera)
export const GROUND_Y = WALK_MAX_Y;

// Player
export const PLAYER_START_X = 100;
export const PLAYER_START_Y = 267; // Start mid-depth

// Sprite scale for non-player objects (player/boss are natively sized)
export const OBJ_SCALE = 1.6;

// Scenes
export const SCENES = {
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  TITLE: 'Title',
  SUPER_INTRO: 'SuperIntro',
  HUD: 'HUD',
  ACT_INTRO: 'ActIntro',
  ACT1: 'Act1',
  ACT2: 'Act2',
  ACT3: 'Act3',
  ACT4: 'Act4',
  ACT5: 'Act5',
  ACT_OUTRO: 'ActOutro',
  RECAP: 'Recap',
} as const;

// Act names for display
export const ACT_NAMES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'ACT 1', subtitle: 'WORK & PAY' },
  2: { title: 'ACT 2', subtitle: 'EXTRA CONTRIBUTIONS' },
  3: { title: 'ACT 3', subtitle: 'MARKET SHOCKS' },
  4: { title: 'ACT 4', subtitle: 'FEE FACTORY' },
  5: { title: 'ACT 5', subtitle: 'RETIREMENT DOORS' },
};

// Font
export const PIXEL_FONT = '"Press Start 2P"';
