# Super Smashdown: The Long Game

A 16-bit arcade-style educational browser game teaching Australian superannuation concepts to Years 7–9 students. Inspired by Double Dragon and classic beat-em-up games.

## How to Run

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move | WASD / Arrow Keys | D-pad (planned) |
| Kick | Space | Kick button (planned) |
| Charge Kick | Hold Space | Hold kick button |

### Debug / Playtest

- **\`** (backtick): Toggle debug overlay showing all game state
- **1-5**: Jump to Act 1–5 (when debug overlay is visible)
- **+/-**: Add/remove super balance

## Game Structure (5 Acts)

### Act 1 — Work & Pay
**Teaches:** Employer super — notice when super is missing and take action.
- Payslips fly across the screen. Some are stamped "SUPER MISSING" (red border).
- Kick missing payslips into the Payroll Portal to fix them.
- Each fix adds to your Super balance. Missed payments create penalties later.

### Act 2 — Spend vs Save
**Teaches:** Short-term temptations block long-term benefits.
- Giant Coins sit across the stage representing long-term savings.
- Temptations fly in trying to destroy the coins.
- Kick temptations away to protect your coins.

### Act 3 — Market Shocks
**Teaches:** Market crashes are temporary — staying engaged leads to recovery.
- 4 cycles of: Crash Block → Pressure Wall → Recovery Surge.
- Kick crash blocks to shatter them. Kick the pressure wall to hold the line.
- Recovery always gives back more than the crash took away (net positive).

### Act 4 — Fee Factory
**Teaches:** Ongoing fees quietly erode outcomes; reducing them helps.
- Pipes leak, draining your Super balance over time.
- Kick leaks shut to stop the drain.
- Seal enough leaks to trigger an Efficiency Upgrade (reduced drain rate).

### Act 5 — Retirement Doors
**Teaches:** More super = more retirement options.
- 7 doors representing retirement options (Home, Holidays, Vehicle, etc.).
- Hold Space to charge, release to kick each door.
- Results: BLAST OPEN / CRACK OPEN / WON'T BUDGE based on charge + accumulated super.
- Everyone opens at least 2 doors (no fail state).

## How to Extend

### Replace Placeholder Art
All sprites are generated programmatically in `src/systems/SpriteFactory.ts`. To replace with real art:
1. Add image files to a `public/assets/` folder
2. Load them in `PreloadScene.ts` using `this.load.spritesheet()`
3. Remove the corresponding `generate*()` call from SpriteFactory

### Tune Game Balance
All numbers are in `src/config/BalanceConfig.ts` — speeds, timings, damage values, thresholds.

### Change Color Palettes
Edit `src/config/Palette.ts` to change the color scheme per act.

### Add Sound
The game has `soundEnabled` state ready. Add audio files and play them conditionally:
```ts
if (gameState.get('soundEnabled')) {
  this.sound.play('kick-sfx');
}
```

## Tech Stack
- TypeScript + Phaser 3 + Vite
- Internal resolution: 384×216, scaled with nearest-neighbor
- All sprites generated at runtime (zero external image assets)
- Press Start 2P font via @fontsource

## Content Rules
- Non-promotional: no fund names, no calls to action, no advice
- School-safe: no violence against people — kicking objects/systems only
- "Supported by Aware Super" appears as a tiny footer on the title screen only
