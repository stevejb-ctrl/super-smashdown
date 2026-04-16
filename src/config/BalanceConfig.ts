// All game tuning knobs in one file. Tweak here for playtesting.

export const BALANCE = {
  player: {
    moveSpeed: 120,         // pixels/sec
    kickCooldownMs: 350,    // ms between kicks
    chargeTimeMs: 800,      // ms to fully charge a kick
    chargeKickPower: 2.5,   // multiplier for charged kick
    iFramesMs: 500,         // invincibility after being hit
  },

  // Act 1 — Work & Pay (ramps up over 3 waves)
  act1: {
    payslipCount: 24,           // total payslips in the act
    missingRateStart: 0.25,     // fraction dodgy at start
    missingRateEnd: 0.65,       // fraction dodgy by final wave
    payslipSpeedMin: 50,        // pixels/sec (start)
    payslipSpeedMax: 80,
    payslipSpeedEndMin: 100,    // pixels/sec (end — much faster)
    payslipSpeedEndMax: 160,
    spawnIntervalStart: 2000,   // ms between spawns at start (easy)
    spawnIntervalEnd: 550,      // ms between spawns at end (frantic)
    superPerCatch: 4,           // super gained per normal payslip caught
    superPerFix: 8,             // super gained per dodgy payslip kicked back
    penaltyPerMiss: 3,          // super lost when normal payslip flies off screen
    durationSec: 60,            // act duration
  },

  // Act 2 — Spend vs Save
  act2: {
    giantCoinCount: 6,          // coins to protect
    temptationCount: 15,        // total temptations
    temptationSpeedMin: 60,
    temptationSpeedMax: 110,
    spawnIntervalMs: 1500,
    superPerCoinSaved: 4,       // super gained per surviving coin (4 × 250 multiplier = $1,000 display)
    durationSec: 60,
  },

  // Act 3 — Market Shocks (Storm Shelter)
  act3: {
    cycleCount: 4,
    // Storm phase
    debrisPerCycle: [5, 8, 12, 16],         // debris spawned per cycle
    debrisSpeedMin: [60, 80, 100, 120],     // pixels/sec per cycle
    debrisSpeedMax: [90, 120, 150, 180],
    debrisSpawnMs: [800, 600, 450, 350],    // ms between debris spawns
    debrisDamage: 2,                        // super lost per vault hit (internal units)
    // SELL NOW traps
    sellNowPerCycle: [1, 2, 3, 5],         // sell-now traps per cycle
    sellNowPenalty: 4,                      // super lost if player kicks a sell-now
    sellNowMoveCycles: [false, false, true, true], // do sell-now signs chase vault?
    sellNowSpeed: 30,                       // pixels/sec when moving toward vault
    // Recovery phase
    dividendsPerCycle: [6, 6, 5, 10],      // dividend coins per recovery
    dividendValue: 5,                       // super gained per dividend collected
    feeLeeches: [0, 2, 2, 2],             // red leeches mixed in (cycle 2+)
    feeLeechPenalty: 2,                     // super lost if player touches a leech
    dividendFallSpeed: 40,                  // pixels/sec
    // Stay the Course (cycle 4 only)
    stayTheCourseDuration: 4000,            // ms of vault shield
    // Resilience from Act 2
    resiliencePerCoin: 0.1,
    durationSec: 90,
  },

  // Act 4 — Fee Type Invasion
  act4: {
    durationSec: 80,
    vaultX: 48,                   // vault position on left side
    // Wave timings (ms from start of gameplay)
    wave1EndMs: 22000,
    wave2EndMs: 48000,
    intermissionEndMs: 52000,
    wave3EndMs: 80000,
    // Spawn intervals per wave (ms between cluster spawns). 0 = no spawn this wave.
    adminSpawnMs: [1100, 800, 550],
    investmentSpawnMs: [0, 1800, 1200],
    specialServicesSpawnMs: [0, 5500, 4000],
    performanceSpawnMs: [0, 0, 3800],
    // How many admin fees in each cluster per wave (at different Y lanes)
    adminClusterSize: [2, 3, 3],
    // How many investment fees per burst
    investmentClusterSize: [0, 1, 2],
    // Fee damage values (displayed in $ and used to compute internal super cost)
    adminDamage: 50,
    investmentDamage: 150,
    specialServicesDamage: 300,
    performanceDamage: 400,
    // Fee speeds (pixels/sec) — bumped up from the first pass
    adminSpeed: 48,
    investmentSpeed: 78,
    specialServicesSpeed: 55,
    performanceSpeed: 105,
    // Special Services mechanic
    specialServicesHp: 3,
    specialServicesStunMs: 2800,
    chargedKickThreshold: 0.75,
    // Investment DASH — telegraph, then burst forward
    investmentDashTriggerX: 380,     // x-position where telegraph begins
    investmentTelegraphMs: 450,      // glow time before dash
    investmentDashMultiplier: 3.2,   // speed multiplier during dash
    investmentDashMs: 900,           // how long the dash lasts
    // Performance fees come from top-right, moving diagonally
    performanceSpawnYMin: 160,       // top of walk zone area
    performanceSpawnYMax: 200,
    performanceVy: 18,               // downward drift
    // Charged kick tactical cost: player slows while charging
    chargedSlowThreshold: 0.3,       // charge >= this → slow movement
    chargedSlowFactor: 0.55,         // move at 55% speed while charging
    // Legacy fields retained so older references (e.g. outro historical checks) still compile
    missedSuperJamCount: 1,
  },

  // Act 5 — The Retirement Vault
  act5: {
    doorCount: 7,
    // Act 5 intro: super display multiplier is multiplied by this (cumulative becomes 5000×)
    introMultiplier: 2,
    // Display balance → retirement power conversion: every $100 of display = 1 power point
    powerPerDollar: 1 / 100,
    // Per-door costs in power points (index 0..6 matches doorLabels order)
    doorCosts: [0, 0, 400, 800, 1200, 1400, 2000],
    doorLabels: [
      'AGE\nPENSION',
      'SIMPLE\nJOYS',
      'HELPING\nFAMILY',
      'HEALTH &\nCARE',
      'HOLIDAYS',
      'COMFORTABLE\nHOME',
      'WORLD\nTRAVEL',
    ],
    rewardSprites: [
      'reward-pension',
      'reward-joys',
      'reward-family',
      'reward-health',
      'reward-holidays',
      'reward-home',
      'reward-travel',
    ],
    // Charged-kick efficiency bonus — "patience compounds"
    chargedKickThreshold: 0.9,
    chargedKickDiscount: 0.5,  // 50% off cost when kicked with full charge
    // Outcome tiering (still based on doors opened for backward compat)
    superThresholds: {
      best: 70,
      ok: 40,
      gettingBy: 0,
    },
    minDoorsOpen: 2,
    // Legacy field kept for type compat with old code
    chargeToOpen: {
      blastOpen: 0.9,
      crackOpen: 0.4,
    },
  },

  // Starting state
  initial: {
    superBalance: 0,
  },
} as const;
