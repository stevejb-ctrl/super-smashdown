import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_START_X, OBJ_SCALE, WALK_MIN_Y, WALK_MAX_Y } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { BALANCE } from '../config/BalanceConfig';
import { gameState } from '../systems/GameState';
import { InputManager } from '../systems/InputManager';
import { JuiceManager } from '../systems/JuiceManager';
import { ParallaxManager } from '../systems/ParallaxManager';
import { Player } from '../entities/Player';

type FeeType = 'admin' | 'investment' | 'specialServices' | 'performance';

interface Fee {
  type: FeeType;
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  active: boolean;
  hp: number;
  stunned: boolean;
  respawnAt: number; // absolute time (ms) to respawn at, 0 = no respawn
  damage: number;    // $ to drain if it reaches the vault
  speed: number;     // base horizontal speed (px/sec)
  vy: number;        // vertical velocity (px/sec)
  // Investment dash state
  dashState: 'none' | 'telegraph' | 'dashing' | 'done';
  dashTimer: number; // ms remaining in current dash state
  telegraphGlow?: Phaser.GameObjects.Rectangle;
}

type Act4Phase = 'intro' | 'playing' | 'complete';

export class Act4Scene extends Phaser.Scene {
  private player!: Player;
  private inputMgr!: InputManager;
  private juice!: JuiceManager;
  private parallax!: ParallaxManager;

  // Vault
  private vault!: Phaser.GameObjects.Sprite;
  private vaultStartingBalance = 0; // display balance at start of gameplay
  private vaultBarBg!: Phaser.GameObjects.Rectangle;
  private vaultBarFill!: Phaser.GameObjects.Rectangle;
  private vaultBarLabel!: Phaser.GameObjects.Text;

  // Wave management
  private gameplayTimer = 0;
  private currentWave: 0 | 1 | 2 = 0;
  private adminTimer = 0;
  private investmentTimer = 0;
  private specialServicesTimer = 0;
  private performanceTimer = 0;
  private sawFirstSpecialServices = false;
  private inIntermission = false;
  private intermissionShown = false;

  // Fees in play
  private fees: Fee[] = [];

  // Phase + UI
  private phase: Act4Phase = 'intro';
  private introObjects: Phaser.GameObjects.GameObject[] = [];
  private waveLabel!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() { super(SCENES.ACT4); }

  create(): void {
    this.parallax = new ParallaxManager(this, 4);
    this.parallax.setSpeed(0);

    this.phase = 'intro';
    this.fees = [];
    this.introObjects = [];
    this.gameplayTimer = 0;
    this.currentWave = 0;
    this.adminTimer = 0;
    this.investmentTimer = 0;
    this.specialServicesTimer = 0;
    this.performanceTimer = 0;
    this.sawFirstSpecialServices = false;
    this.inIntermission = false;
    this.intermissionShown = false;

    this.showIntroSequence();
  }

  // ── INTRO SEQUENCE (x2 multiplier reveal — unchanged) ──

  private showIntroSequence(): void {
    const currentMultiplier = gameState.get('superDisplayMultiplier');
    const rawBalance = gameState.get('superBalance');
    const startDisplay = Math.round(rawBalance * currentMultiplier);
    const newMultiplier = currentMultiplier * 2;
    const endDisplay = Math.round(rawBalance * newMultiplier);

    gameState.set('superDisplayMultiplier', newMultiplier);

    // Dark overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.97
    ).setDepth(500);
    this.introObjects.push(overlay);

    const yearsText = this.add.text(GAME_WIDTH / 2, 50, 'STILL MORE YEARS PASS...', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.introObjects.push(yearsText);
    this.tweens.add({ targets: yearsText, alpha: 1, duration: 500, delay: 200 });

    const line1 = this.add.text(GAME_WIDTH / 2, 86, 'You rode out the market crashes and', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1);
    this.tweens.add({ targets: line1, alpha: 1, duration: 300, delay: 700 });

    const line1b = this.add.text(GAME_WIDTH / 2, 102, 'kept contributing — your super keeps growing.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1b);
    this.tweens.add({ targets: line1b, alpha: 1, duration: 300, delay: 900 });

    const balLabel = this.add.text(GAME_WIDTH / 2, 140, 'YOUR SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(balLabel);
    this.tweens.add({ targets: balLabel, alpha: 1, duration: 300, delay: 1200 });

    const counterText = this.add.text(GAME_WIDTH / 2, 170, `$${startDisplay.toLocaleString()}`, {
      fontFamily: PIXEL_FONT, fontSize: '24px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(3, 3, '#000000', 0);
    this.introObjects.push(counterText);
    this.tweens.add({ targets: counterText, alpha: 1, duration: 300, delay: 1400 });

    this.time.delayedCall(1800, () => {
      const tickDuration = 2500;
      const startTime = this.time.now;
      const tickEvent = this.time.addEvent({
        delay: 30, repeat: -1,
        callback: () => {
          const elapsed = this.time.now - startTime;
          const progress = Math.min(1, elapsed / tickDuration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startDisplay + (endDisplay - startDisplay) * eased);
          counterText.setText(`$${current.toLocaleString()}`);

          if (progress < 1 && Math.random() < 0.08) {
            counterText.setScale(1.05);
            this.tweens.add({ targets: counterText, scaleX: 1, scaleY: 1, duration: 100 });
          }

          if (progress >= 1) {
            tickEvent.remove();
            counterText.setText(`$${endDisplay.toLocaleString()}`);
            counterText.setColor(PALETTE.ui.gold);
            counterText.setScale(1.15);
            this.tweens.add({
              targets: counterText, scaleX: 1, scaleY: 1,
              duration: 300, ease: 'Bounce.easeOut',
            });
            this.showIntroPartTwo(endDisplay);
          }
        },
      });
    });
  }

  private showIntroPartTwo(endDisplay: number): void {
    const line2 = this.add.text(GAME_WIDTH / 2, 210, `$${endDisplay.toLocaleString()} — looking good!`, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line2);
    this.tweens.add({ targets: line2, alpha: 1, duration: 300, delay: 300 });

    const line3 = this.add.text(GAME_WIDTH / 2, 236, 'But your super fund charges FEES', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act4.leakGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3);
    this.tweens.add({ targets: line3, alpha: 1, duration: 300, delay: 600 });

    const line3b = this.add.text(GAME_WIDTH / 2, 252, 'to manage your money — and they add up!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act4.leakGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3b);
    this.tweens.add({ targets: line3b, alpha: 1, duration: 300, delay: 800 });

    const instrText = this.add.text(GAME_WIDTH / 2, 284, 'INTERCEPT FEES BEFORE THEY REACH YOUR VAULT!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(1, 1, '#000000', 0);
    this.introObjects.push(instrText);
    this.tweens.add({ targets: instrText, alpha: 1, duration: 300, delay: 1100 });

    const prompt = this.add.text(GAME_WIDTH / 2, 320, 'PRESS SPACE TO BEGIN', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(prompt);

    const promptDelay = 1400;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      this.beginGameplay();
    };
    this.time.delayedCall(1200, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }

  private beginGameplay(): void {
    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
    ).setDepth(600);
    this.tweens.add({
      targets: flash, alpha: 1, duration: 150,
      onComplete: () => {
        for (const obj of this.introObjects) obj.destroy();
        this.introObjects = [];
        this.setupGameplay();
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
      },
    });
  }

  // ── GAMEPLAY SETUP ──

  private setupGameplay(): void {
    this.phase = 'playing';

    // Ground line
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 3, GAME_WIDTH, 6, 0x3a3a4a).setDepth(0);

    // Super vault on the left
    const vaultY = (WALK_MIN_Y + WALK_MAX_Y) / 2 + 10;
    this.vault = this.add.sprite(BALANCE.act4.vaultX, vaultY, 'super-vault')
      .setOrigin(0.5, 0.5).setDepth(5).setScale(OBJ_SCALE);

    // Vault glow
    this.add.rectangle(BALANCE.act4.vaultX, vaultY, 64, 56, 0xf0d060, 0.12).setDepth(4);

    // Gentle bob
    this.tweens.add({
      targets: this.vault, y: vaultY - 3, duration: 1100,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Capture starting display balance for the health bar
    this.vaultStartingBalance = gameState.getDisplayBalance();

    // Vault health bar (top of screen)
    const barW = 320, barH = 14;
    const barX = GAME_WIDTH / 2;
    const barY = 34;
    this.vaultBarBg = this.add.rectangle(barX, barY, barW + 4, barH + 4, 0x000000, 0.75)
      .setStrokeStyle(1, 0xf0c040).setDepth(19);
    this.vaultBarFill = this.add.rectangle(barX - barW / 2, barY, barW, barH, 0x40e060)
      .setOrigin(0, 0.5).setDepth(20);
    this.vaultBarLabel = this.add.text(barX, barY, `SUPER VAULT: $${this.vaultStartingBalance.toLocaleString()}`, {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(21).setShadow(1, 1, '#000000', 0);

    // Wave label (below bar)
    this.waveLabel = this.add.text(GAME_WIDTH / 2, 54, 'WAVE 1 — ADMIN FEES', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(20);

    // Player (start mid-screen)
    this.player = new Player(this, PLAYER_START_X + 60, (WALK_MIN_Y + WALK_MAX_Y) / 2);
    this.inputMgr = new InputManager(this);
    this.juice = new JuiceManager(this);

    // Status line at bottom
    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(20);

    this.parallax.setSpeed(20);
  }

  // ── UPDATE LOOP ──

  update(_time: number, delta: number): void {
    if (this.phase !== 'playing') return;

    this.parallax.update(delta);
    const inputState = this.inputMgr.update(delta);

    // Tactical charge cost: slow the player while holding a charge
    const chargeLv = this.player.getChargeLevel();
    const slowed = chargeLv >= BALANCE.act4.chargedSlowThreshold;
    (this.player as any).moveSpeed = BALANCE.player.moveSpeed * (slowed ? BALANCE.act4.chargedSlowFactor : 1);

    this.player.handleInput(inputState, delta);
    this.player.clampPosition();

    this.gameplayTimer += delta;
    const t = this.gameplayTimer;
    const bal = BALANCE.act4;

    // Advance waves
    this.updateWave(t);

    // Spawn new fees based on current wave (if not in intermission)
    if (!this.inIntermission) {
      this.updateSpawners(delta);
    }

    // Move and check each fee
    this.updateFees(delta);

    // Check kick collisions
    this.handleKickCollisions();

    // Update vault health bar
    this.updateVaultBar();

    // Status text
    const cancelledTxt = gameState.get('specialServicesCancelled');
    const blocked = gameState.get('feesBlocked');
    const leaked = gameState.get('feesLeaked');
    this.statusText.setText(
      `BLOCKED: ${blocked}   LEAKED: ${leaked}   CANCELLED: ${cancelledTxt}   HOLD SPACE FOR CHARGED KICK`
    );

    // Act ends
    if (t >= bal.wave3EndMs) {
      this.completeAct();
    }
  }

  /** Move waves forward based on elapsed time */
  private updateWave(t: number): void {
    const bal = BALANCE.act4;

    if (t < bal.wave1EndMs) {
      if (this.currentWave !== 0) this.setWave(0);
    } else if (t < bal.wave2EndMs) {
      if (this.currentWave !== 1) this.setWave(1);
    } else if (t < bal.intermissionEndMs) {
      // Intermission
      if (!this.intermissionShown) {
        this.showIntermission();
      }
    } else if (t < bal.wave3EndMs) {
      if (this.currentWave !== 2) {
        this.inIntermission = false;
        this.setWave(2);
      }
    }
  }

  private setWave(wave: 0 | 1 | 2): void {
    this.currentWave = wave;
    const labels = [
      'WAVE 1 — ADMIN FEES',
      'WAVE 2 — MIXED FEES',
      'WAVE 3 — FULL ASSAULT',
    ];
    this.waveLabel.setText(labels[wave]).setScale(1.3);
    this.tweens.add({ targets: this.waveLabel, scaleX: 1, scaleY: 1, duration: 400, ease: 'Bounce.easeOut' });
    this.juice.shake('light');
    // Brief flash at start of each new wave
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0c040, 0)
      .setDepth(100);
    this.tweens.add({
      targets: flash, alpha: 0.25, duration: 120, yoyo: true,
      onComplete: () => flash.destroy(),
    });
  }

  private showIntermission(): void {
    this.intermissionShown = true;
    this.inIntermission = true;
    this.waveLabel.setText('REVIEW YOUR SUPER STATEMENT ANNUALLY!').setColor(PALETTE.ui.gold);

    // Big reminder text
    const reminder = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'CHECK YOUR STATEMENT!', {
      fontFamily: PIXEL_FONT, fontSize: '16px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(150).setAlpha(0).setShadow(2, 2, '#000000', 0);
    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 'Know what you are being charged for.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(150).setAlpha(0);

    this.tweens.add({ targets: [reminder, sub], alpha: 1, duration: 300 });
    this.time.delayedCall(3200, () => {
      this.tweens.add({
        targets: [reminder, sub], alpha: 0, duration: 400,
        onComplete: () => { reminder.destroy(); sub.destroy(); },
      });
      this.waveLabel.setColor(PALETTE.ui.cyan);
    });
  }

  // ── SPAWNERS ──

  private updateSpawners(delta: number): void {
    const bal = BALANCE.act4;
    const wave = this.currentWave;

    // Admin — spawn in clusters across multiple Y lanes
    const adminInterval = bal.adminSpawnMs[wave];
    if (adminInterval > 0) {
      this.adminTimer += delta;
      if (this.adminTimer >= adminInterval) {
        this.adminTimer = 0;
        this.spawnCluster('admin', bal.adminClusterSize[wave]);
      }
    }

    // Investment — bursts of 1-2 that will later dash
    const invInterval = bal.investmentSpawnMs[wave];
    if (invInterval > 0) {
      this.investmentTimer += delta;
      if (this.investmentTimer >= invInterval) {
        this.investmentTimer = 0;
        this.spawnCluster('investment', bal.investmentClusterSize[wave]);
      }
    }

    // Special Services — single spawn
    const ssInterval = bal.specialServicesSpawnMs[wave];
    if (ssInterval > 0) {
      this.specialServicesTimer += delta;
      if (this.specialServicesTimer >= ssInterval) {
        this.specialServicesTimer = 0;
        this.spawnFee('specialServices');
      }
    }

    // Performance — single spawn (diagonal from top)
    const perfInterval = bal.performanceSpawnMs[wave];
    if (perfInterval > 0) {
      this.performanceTimer += delta;
      if (this.performanceTimer >= perfInterval) {
        this.performanceTimer = 0;
        this.spawnFee('performance');
      }
    }
  }

  /** Spawn `count` fees of the given type across distinct Y lanes */
  private spawnCluster(type: FeeType, count: number): void {
    if (count <= 0) return;
    // Pick `count` distinct Y positions across the walk band
    const lanes = this.pickLanes(count);
    lanes.forEach((y, i) => {
      // Tiny stagger so they don't visually perfectly overlap on the right edge
      this.time.delayedCall(i * 60, () => this.spawnFee(type, y));
    });
  }

  private pickLanes(count: number): number[] {
    const top = WALK_MIN_Y + 12;
    const bot = WALK_MAX_Y - 12;
    const range = bot - top;
    const slots: number[] = [];
    // Divide the walkable band into `count` sub-bands, random Y within each
    for (let i = 0; i < count; i++) {
      const bandTop = top + (range * i) / count;
      const bandBot = top + (range * (i + 1)) / count;
      slots.push(Phaser.Math.Between(Math.floor(bandTop), Math.floor(bandBot)));
    }
    // Shuffle so order isn't always top-to-bottom
    Phaser.Utils.Array.Shuffle(slots);
    return slots;
  }

  private spawnFee(type: FeeType, yOverride?: number): void {
    const bal = BALANCE.act4;
    const x = GAME_WIDTH + 30;

    let key = '';
    let damage = 0;
    let speed = 0;
    let vy = 0;
    let hp = 1;
    let nameLabel = '';
    let colour = '#ffffff';
    let y = yOverride ?? Phaser.Math.Between(WALK_MIN_Y + 10, WALK_MAX_Y - 10);

    switch (type) {
      case 'admin':
        key = 'fee-admin'; damage = bal.adminDamage; speed = bal.adminSpeed;
        nameLabel = `ADMIN -$${damage}`; colour = '#c0c8d0';
        break;
      case 'investment':
        key = 'fee-investment'; damage = bal.investmentDamage; speed = bal.investmentSpeed;
        nameLabel = `INVESTMENT -$${damage}`; colour = '#c080ff';
        break;
      case 'specialServices':
        key = 'fee-special-services'; damage = bal.specialServicesDamage; speed = bal.specialServicesSpeed;
        hp = bal.specialServicesHp;
        nameLabel = `SPECIAL SERVICES -$${damage}`; colour = '#ff6060';
        break;
      case 'performance':
        key = 'fee-performance'; damage = bal.performanceDamage; speed = bal.performanceSpeed;
        nameLabel = `PERFORMANCE -$${damage}`; colour = '#f0d040';
        // Diagonal: start from top band, drift downward
        y = Phaser.Math.Between(bal.performanceSpawnYMin, bal.performanceSpawnYMax);
        vy = bal.performanceVy;
        break;
    }

    const sprite = this.add.sprite(x, y, key).setOrigin(0.5, 0.5).setDepth(y).setScale(OBJ_SCALE);
    const label = this.add.text(x, y - 22, nameLabel, {
      fontFamily: PIXEL_FONT, fontSize: '5px', color: colour,
    }).setOrigin(0.5).setDepth(y + 1).setShadow(1, 1, '#000000', 0);

    const fee: Fee = {
      type, sprite, label, active: true, hp, stunned: false, respawnAt: 0, damage, speed, vy,
      dashState: 'none', dashTimer: 0,
    };
    this.fees.push(fee);

    // First special services spawn: show a one-time tutorial hint
    if (type === 'specialServices' && !this.sawFirstSpecialServices) {
      this.sawFirstSpecialServices = true;
      const hint = this.add.text(GAME_WIDTH / 2, 80, 'HOLD SPACE — CHARGED KICK CANCELS IT!', {
        fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.gold,
      }).setOrigin(0.5).setDepth(200).setAlpha(0).setShadow(1, 1, '#000000', 0);
      this.tweens.add({ targets: hint, alpha: 1, duration: 300 });
      this.time.delayedCall(3500, () => {
        this.tweens.add({ targets: hint, alpha: 0, duration: 400, onComplete: () => hint.destroy() });
      });
    }
  }

  // ── FEE MOVEMENT + COLLISIONS ──

  private updateFees(delta: number): void {
    const dt = delta / 1000;
    const now = this.time.now;
    const bal = BALANCE.act4;
    const vaultX = bal.vaultX + 14;

    for (const fee of this.fees) {
      if (!fee.active) {
        // Handle respawn of stunned special services
        if (fee.respawnAt > 0 && now >= fee.respawnAt) {
          fee.respawnAt = 0;
          this.respawnSpecialServices(fee);
        }
        continue;
      }

      // Investment dash state machine
      let effectiveSpeed = fee.speed;
      if (fee.type === 'investment') {
        if (fee.dashState === 'none' && fee.sprite.x <= bal.investmentDashTriggerX) {
          fee.dashState = 'telegraph';
          fee.dashTimer = bal.investmentTelegraphMs;
          this.createTelegraphGlow(fee);
        } else if (fee.dashState === 'telegraph') {
          fee.dashTimer -= delta;
          effectiveSpeed = fee.speed * 0.15; // almost frozen while telegraphing
          if (fee.dashTimer <= 0) {
            fee.dashState = 'dashing';
            fee.dashTimer = bal.investmentDashMs;
            this.destroyTelegraphGlow(fee);
            // Red tint for the dash itself
            fee.sprite.setTint(0xff6060);
          }
        } else if (fee.dashState === 'dashing') {
          fee.dashTimer -= delta;
          effectiveSpeed = fee.speed * bal.investmentDashMultiplier;
          if (fee.dashTimer <= 0) {
            fee.dashState = 'done';
            fee.sprite.clearTint();
          }
        }
      }

      // Horizontal move
      fee.sprite.x -= effectiveSpeed * dt;

      // Vertical move (diagonal fees)
      if (fee.vy !== 0) {
        fee.sprite.y += fee.vy * dt;
        if (fee.sprite.y > WALK_MAX_Y - 10) {
          fee.sprite.y = WALK_MAX_Y - 10;
          fee.vy = 0;
        }
      }

      fee.label.setPosition(fee.sprite.x, fee.sprite.y - 22);
      fee.sprite.setDepth(fee.sprite.y);

      // Keep telegraph glow aligned
      if (fee.telegraphGlow) {
        fee.telegraphGlow.setPosition(fee.sprite.x, fee.sprite.y);
      }

      // Reached the vault?
      if (fee.sprite.x <= vaultX) {
        this.feeReachesVault(fee);
      }
    }

    // Clean up dead fees
    this.fees = this.fees.filter(f => f.active || f.respawnAt > 0);
  }

  private createTelegraphGlow(fee: Fee): void {
    const glow = this.add.rectangle(fee.sprite.x, fee.sprite.y, 36, 32, 0xff3030, 0.35)
      .setDepth(fee.sprite.depth - 1);
    fee.telegraphGlow = glow;
    // Pulse the glow
    this.tweens.add({
      targets: glow, alpha: 0.7, scaleX: 1.25, scaleY: 1.25,
      duration: 220, yoyo: true, repeat: -1,
    });
  }

  private destroyTelegraphGlow(fee: Fee): void {
    if (fee.telegraphGlow) {
      this.tweens.killTweensOf(fee.telegraphGlow);
      fee.telegraphGlow.destroy();
      fee.telegraphGlow = undefined;
    }
  }

  private handleKickCollisions(): void {
    const hitbox = this.player.getKickHitbox();
    if (!hitbox) return;

    const hitboxBounds = hitbox.getBounds();
    const charge = this.player.getChargeLevel();
    const isCharged = charge >= BALANCE.act4.chargedKickThreshold;

    for (const fee of this.fees) {
      if (!fee.active || fee.stunned) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitboxBounds, fee.sprite.getBounds())) {
        this.kickFee(fee, isCharged);
      }
    }
  }

  private kickFee(fee: Fee, charged: boolean): void {
    this.juice.kickEffect(
      this.player.x + (this.player.isFacingRight() ? 24 : -24),
      this.player.y - 16,
      this.player.isFacingRight()
    );

    if (fee.type === 'specialServices') {
      if (charged) {
        // PERMANENT CANCEL
        this.cancelSpecialServices(fee);
        return;
      }
      // Regular kick: stun + knock back, will respawn
      fee.hp -= 1;
      if (fee.hp > 0) {
        fee.stunned = true;
        fee.sprite.setTint(0x555555);
        this.juice.shake('light');
        this.juice.floatingText(fee.sprite.x, fee.sprite.y - 28, 'STUNNED!', PALETTE.ui.orange);
        // Knock back off-screen to the right
        this.tweens.add({
          targets: [fee.sprite, fee.label],
          x: GAME_WIDTH + 40,
          duration: 300, ease: 'Power2',
          onComplete: () => {
            fee.active = false;
            fee.respawnAt = this.time.now + BALANCE.act4.specialServicesStunMs;
          },
        });
        return;
      }
      // hp depleted via normal kicks — still counts as blocked but not "cancelled"
      this.destroyFeeBlocked(fee);
      return;
    }

    // Normal fee: destroyed in one kick
    this.destroyFeeBlocked(fee);
  }

  private destroyFeeBlocked(fee: Fee): void {
    fee.active = false;
    this.destroyTelegraphGlow(fee);
    gameState.increment('feesBlocked');
    const current = gameState.get('totalFeesSaved');
    (gameState as any).state.totalFeesSaved = current + fee.damage;

    this.juice.shake('light');
    this.juice.starburst(fee.sprite.x, fee.sprite.y);
    this.juice.floatingText(fee.sprite.x, fee.sprite.y - 24, `+$${fee.damage}`, PALETTE.act1.superGreen);
    this.tweens.killTweensOf(fee.sprite);
    const dir = this.player.isFacingRight() ? 1 : -1;
    this.tweens.add({
      targets: [fee.sprite, fee.label],
      x: fee.sprite.x + dir * 80, y: fee.sprite.y - 40,
      alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: 280,
      onComplete: () => { fee.sprite.destroy(); fee.label.destroy(); },
    });
  }

  private cancelSpecialServices(fee: Fee): void {
    fee.active = false;
    this.destroyTelegraphGlow(fee);
    gameState.increment('feesBlocked');
    gameState.increment('specialServicesCancelled');
    const current = gameState.get('totalFeesSaved');
    (gameState as any).state.totalFeesSaved = current + fee.damage;

    this.juice.shake('medium');
    this.juice.starburst(fee.sprite.x, fee.sprite.y);
    this.juice.emitParticles(fee.sprite.x, fee.sprite.y, 'super-particle', 14);
    this.juice.floatingText(fee.sprite.x, fee.sprite.y - 24, 'CANCELLED!', PALETTE.ui.gold);
    this.juice.floatingText(fee.sprite.x, fee.sprite.y - 10, `+$${fee.damage}`, PALETTE.act1.superGreen);
    this.tweens.killTweensOf(fee.sprite);
    this.tweens.add({
      targets: [fee.sprite, fee.label],
      alpha: 0, scaleX: 2, scaleY: 2, duration: 350,
      onComplete: () => { fee.sprite.destroy(); fee.label.destroy(); },
    });
  }

  private respawnSpecialServices(fee: Fee): void {
    // Place it fresh back at the right edge with full hp
    const y = Phaser.Math.Between(WALK_MIN_Y + 10, WALK_MAX_Y - 10);
    fee.sprite.setPosition(GAME_WIDTH + 30, y);
    fee.sprite.setAlpha(1).clearTint();
    fee.label.setPosition(fee.sprite.x, fee.sprite.y - 22);
    fee.label.setAlpha(1);
    fee.hp = BALANCE.act4.specialServicesHp;
    fee.stunned = false;
    fee.active = true;
    fee.dashState = 'none';
    fee.dashTimer = 0;
    this.destroyTelegraphGlow(fee);
  }

  private feeReachesVault(fee: Fee): void {
    fee.active = false;
    this.destroyTelegraphGlow(fee);
    gameState.increment('feesLeaked');
    const current = gameState.get('totalFeesDrained');
    (gameState as any).state.totalFeesDrained = current + fee.damage;

    // Drain internal super by an amount that shows on screen as `fee.damage`
    const mult = gameState.get('superDisplayMultiplier');
    if (mult > 0) {
      gameState.removeSuper(fee.damage / mult);
    }

    // Vault shake + red flash
    this.juice.shake('medium');
    this.vault.setTint(0xff4040);
    this.time.delayedCall(150, () => this.vault.clearTint());
    this.tweens.add({
      targets: this.vault,
      x: this.vault.x - 4, duration: 60, yoyo: true, repeat: 2,
    });

    this.juice.floatingText(this.vault.x, this.vault.y - 30, `-$${fee.damage}`, PALETTE.ui.red);
    fee.sprite.destroy();
    fee.label.destroy();
  }

  // ── VAULT HEALTH BAR ──

  private updateVaultBar(): void {
    const current = gameState.getDisplayBalance();
    const startBal = this.vaultStartingBalance;
    // Clamp progress — can't exceed 1, can't go below 0.1 (always show some fill for readability)
    const progress = Math.max(0.02, Math.min(1, current / Math.max(1, startBal)));
    const fullW = 320;
    this.vaultBarFill.width = fullW * progress;

    // Colour changes based on health
    let colour = 0x40e060; // green
    if (progress < 0.85) colour = 0xe0c040; // gold
    if (progress < 0.6) colour = 0xe08030;  // orange
    if (progress < 0.3) colour = 0xe04040;  // red
    this.vaultBarFill.fillColor = colour;

    this.vaultBarLabel.setText(`SUPER VAULT: $${current.toLocaleString()}`);
  }

  // ── COMPLETION ──

  private completeAct(): void {
    this.phase = 'complete';

    // Destroy any remaining fees
    for (const fee of this.fees) {
      this.destroyTelegraphGlow(fee);
      if (fee.sprite) fee.sprite.destroy();
      if (fee.label) fee.label.destroy();
    }
    this.fees = [];

    this.waveLabel.setText('ACT 4 COMPLETE!').setColor(PALETTE.ui.gold).setScale(1.3);
    this.tweens.add({ targets: this.waveLabel, scaleX: 1, scaleY: 1, duration: 400 });

    this.time.delayedCall(2000, () => {
      this.parallax.destroy();
      this.scene.start(SCENES.ACT_OUTRO, { actNumber: 4 });
    });
  }
}
