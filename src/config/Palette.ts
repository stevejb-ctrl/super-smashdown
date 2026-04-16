// 16-bit color palettes — limited palettes per act for authentic retro feel

export const PALETTE = {
  // Brand colours — woven subtly through the arcade aesthetic
  brand: {
    magenta: '#ED008C',
    magentaDark: '#DB0081',
    deepPurple: '#55005A',
    lilac: '#F6F2F7',
    peach: '#FEF6EF',
    lightPink: '#FDD7F0',
  },

  // Shared UI colors
  ui: {
    white: '#ffffff',
    black: '#000000',
    darkGrey: '#2a2a3a',
    midGrey: '#5a5a6a',
    lightGrey: '#9a9aaa',
    gold: '#f0c040',
    red: '#e04040',
    green: '#40c040',
    blue: '#4080e0',
    cyan: '#40d0d0',
    orange: '#e08020',
    pink: '#ED008C',
  },

  // Player colors
  player: {
    skin: '#e8c170',
    hair: '#6a3020',
    shirt: '#c0208a',
    pants: '#55005A',
    shoes: '#3a2020',
    outline: '#1a1a2a',
    belt: '#f0c040',
  },

  // Act 1 — Work & Pay (office/workplace, warm)
  act1: {
    sky: '#304060',
    buildings: '#2a3a4a',
    buildingsLight: '#3a4a5a',
    ground: '#5a5060',
    groundLight: '#6a6070',
    accent: '#e0a030',
    payslipBg: '#f0e0c0',
    payslipText: '#2a2a3a',
    portalFrame: '#4a4a6a',
    portalGlow: '#60c0e0',
    superGreen: '#40e060',
    errorRed: '#e04040',
  },

  // Act 2 — Spend vs Save (mall, neon)
  act2: {
    sky: '#1a1a3a',
    walls: '#3a2a4a',
    floor: '#4a3a3a',
    neonPink: '#e060a0',
    neonBlue: '#60a0e0',
    coinGold: '#f0d040',
    coinShine: '#fff0a0',
    temptRed: '#e04060',
    temptOrange: '#e08030',
  },

  // Act 3 — Market Shocks (trading floor, dramatic)
  act3: {
    sky: '#0a0a2a',
    bg: '#1a2a3a',
    floor: '#2a3a3a',
    crashRed: '#c02020',
    crashOrange: '#e06020',
    holdYellow: '#e0c020',
    recoveryGreen: '#20c060',
    recoveryBlue: '#2080e0',
    alarmRed: '#ff2020',
    screenGlow: '#203040',
  },

  // Act 4 — Fee Factory (industrial, grey/green)
  act4: {
    sky: '#1a2020',
    walls: '#2a3030',
    pipes: '#4a5a5a',
    pipesLight: '#6a7a7a',
    conveyor: '#3a3a4a',
    leakGreen: '#40e060',
    leakDrip: '#20a040',
    steam: '#8a9a9a',
    gearBrown: '#6a5030',
    gearLight: '#8a7050',
  },

  // Act 5 — Retirement Doors (corridor, warm/hopeful)
  act5: {
    sky: '#e08040',
    skyLight: '#f0a060',
    walls: '#5a4a3a',
    floor: '#4a3a2a',
    doorWood: '#8a6030',
    doorLight: '#a07040',
    doorFrame: '#6a5020',
    doorLocked: '#4a4a5a',
    doorOpen: '#f0e0a0',
    goldGlow: '#f0d060',
  },
} as const;
