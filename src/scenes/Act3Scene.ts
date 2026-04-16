import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, GROUND_Y, WALK_MIN_Y, WALK_MAX_Y, PLAYER_START_X, OBJ_SCALE } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { BALANCE } from '../config/BalanceConfig';
import { gameState } from '../systems/GameState';
import { InputManager } from '../systems/InputManager';
import { JuiceManager } from '../systems/JuiceManager';
import { ParallaxManager } from '../systems/ParallaxManager';
import { Player } from '../entities/Player';

type Phase = 'intro' | 'storm' | 'recovery' | 'complete';

const CYCLE_NAMES = ['THE DIP', 'THE CORRECTION', 'THE BEAR MARKET', 'THE CRISIS'];

interface Debris {
  sprite: Phaser.GameObjects.Sprite;
  vx: number;
  vy: number;
  active: boolean;
}

interface SellNow {
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  active: boolean;
  moves: boolean;
}

interface Dividend {
  sprite: Phaser.GameObjects.Sprite;
  isLeech: boolean;
  active: boolean;
}

export class Act3Scene extends Phaser.Scene {
  private player!: Player;
  private inputMgr!: InputManager;
  private juice!: JuiceManager;
  private parallax!: ParallaxManager;
  private phase: Phase = 'intro';
  private cycleIndex = 0;

  // Vault
  private vault!: Phaser.GameObjects.Sprite;
  private vaultGlow!: Phaser.GameObjects.Rectangle;
  private vaultShielded = false;
  private shieldTimer = 0;
  private shieldVisual: Phaser.GameObjects.Rectangle | null = null;

  // Storm objects
  private debrisList: Debris[] = [];
  private sellNowList: SellNow[] = [];
  private debrisSpawned = 0;
  private sellNowSpawned = 0;
  private spawnTimer = 0;
  private sellNowSpawnTimer = 0;
  private stormActive = false;

  // Recovery objects
  private dividendList: Dividend[] = [];

  // Intro sequence
  private introObjects: Phaser.GameObjects.GameObject[] = [];

  // UI
  private phaseText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private cycleLabel!: Phaser.GameObjects.Text;
  private alarmOverlay!: Phaser.GameObjects.Rectangle;

  constructor() { super(SCENES.ACT3); }

  create(): void {
    this.parallax = new ParallaxManager(this, 3);
    this.parallax.setSpeed(10);

    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 3, GAME_WIDTH, 6, 0x2a3a3a).setDepth(0);

    // Super vault at center
    const vaultY = (WALK_MIN_Y + WALK_MAX_Y) / 2;
    this.vaultGlow = this.add.rectangle(GAME_WIDTH / 2, vaultY, 56, 50, 0xf0d060, 0.15)
      .setDepth(4);
    this.vault = this.add.sprite(GAME_WIDTH / 2, vaultY, 'super-vault')
      .setOrigin(0.5, 0.5).setDepth(5).setScale(OBJ_SCALE);

    // Gentle vault bob
    this.tweens.add({
      targets: [this.vault, this.vaultGlow],
      y: vaultY - 3, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.player = new Player(this, PLAYER_START_X, (WALK_MIN_Y + WALK_MAX_Y) / 2);
    this.inputMgr = new InputManager(this);
    this.juice = new JuiceManager(this);

    this.alarmOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0
    ).setDepth(15);

    this.phaseText = this.add.text(GAME_WIDTH / 2, 40, '', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(20);

    this.instructionText = this.add.text(GAME_WIDTH / 2, 66, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(20);

    this.cycleLabel = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontFamily: PIXEL_FONT, fontSize: '6px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(20);

    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(20);

    this.cycleIndex = 0;
    this.phase = 'intro';
    this.debrisList = [];
    this.sellNowList = [];
    this.dividendList = [];
    this.introObjects = [];
    this.vaultShielded = false;
    this.shieldTimer = 0;

    this.showIntroSequence();
  }

  // ── INTRO SEQUENCE ──

  private showIntroSequence(): void {
    const currentMultiplier = gameState.get('superDisplayMultiplier');
    const rawBalance = gameState.get('superBalance');
    const startDisplay = Math.round(rawBalance * currentMultiplier);
    const newMultiplier = currentMultiplier * 5;
    const endDisplay = Math.round(rawBalance * newMultiplier);

    // Apply the new multiplier
    gameState.set('superDisplayMultiplier', newMultiplier);

    // Dark overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.97
    ).setDepth(500);
    this.introObjects.push(overlay);

    // "MORE YEARS PASS..." title
    const yearsText = this.add.text(GAME_WIDTH / 2, 50, 'MORE YEARS PASS...', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.introObjects.push(yearsText);
    this.tweens.add({ targets: yearsText, alpha: 1, duration: 500, delay: 200 });

    // Narrative
    const line1 = this.add.text(GAME_WIDTH / 2, 86, 'Your contributions and compound interest', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1);
    this.tweens.add({ targets: line1, alpha: 1, duration: 300, delay: 700 });

    const line1b = this.add.text(GAME_WIDTH / 2, 102, 'have been growing your super balance.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1b);
    this.tweens.add({ targets: line1b, alpha: 1, duration: 300, delay: 900 });

    // Super balance label
    const balLabel = this.add.text(GAME_WIDTH / 2, 140, 'YOUR SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(balLabel);
    this.tweens.add({ targets: balLabel, alpha: 1, duration: 300, delay: 1200 });

    // Ticking counter
    const counterText = this.add.text(GAME_WIDTH / 2, 170, `$${startDisplay.toLocaleString()}`, {
      fontFamily: PIXEL_FONT, fontSize: '24px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(3, 3, '#000000', 0);
    this.introObjects.push(counterText);
    this.tweens.add({ targets: counterText, alpha: 1, duration: 300, delay: 1400 });

    // Tick up the counter
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
    const line2 = this.add.text(GAME_WIDTH / 2, 210, `$${endDisplay.toLocaleString()} — your super is really growing!`, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line2);
    this.tweens.add({ targets: line2, alpha: 1, duration: 300, delay: 300 });

    const line3 = this.add.text(GAME_WIDTH / 2, 236, 'But markets do not always go up.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act3.crashRed,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3);
    this.tweens.add({ targets: line3, alpha: 1, duration: 300, delay: 600 });

    const line3b = this.add.text(GAME_WIDTH / 2, 252, 'Crashes happen — protect your vault!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act3.crashRed,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3b);
    this.tweens.add({ targets: line3b, alpha: 1, duration: 300, delay: 800 });

    // Instructions
    const instrText = this.add.text(GAME_WIDTH / 2, 284, 'KICK DEBRIS AWAY — DO NOT KICK THE SELL SIGNS!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(1, 1, '#000000', 0);
    this.introObjects.push(instrText);
    this.tweens.add({ targets: instrText, alpha: 1, duration: 300, delay: 1100 });

    // Press space prompt
    const prompt = this.add.text(GAME_WIDTH / 2, 320, 'PRESS SPACE TO BEGIN', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(prompt);

    const promptDelay = 1400;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    // Wait for space
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
        this.startStormCycle();
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
      },
    });
  }

  // ── STORM PHASE ──

  private startStormCycle(): void {
    this.phase = 'storm';
    this.stormActive = true;
    this.debrisSpawned = 0;
    this.sellNowSpawned = 0;
    this.spawnTimer = 0;
    this.sellNowSpawnTimer = 0;
    this.debrisList = [];
    this.sellNowList = [];

    const name = CYCLE_NAMES[this.cycleIndex] || 'STORM';
    this.cycleLabel.setText(`CYCLE ${this.cycleIndex + 1}/4: ${name}`);
    this.phaseText.setText(name).setColor(PALETTE.act3.crashRed);
    this.instructionText.setText('KICK DEBRIS AWAY FROM THE VAULT!');
    this.tweens.add({ targets: this.instructionText, alpha: 0, delay: 3000, duration: 500 });

    // Alarm flash intensity scales with cycle
    const alarmAlpha = 0.08 + this.cycleIndex * 0.04;
    this.tweens.add({
      targets: this.alarmOverlay, alpha: alarmAlpha,
      duration: 300, yoyo: true, repeat: 3,
    });

    // Cycle 4: screen shake throughout
    if (this.cycleIndex >= 3) {
      this.time.addEvent({
        delay: 1500, repeat: 8,
        callback: () => { if (this.phase === 'storm') this.juice.shake('light'); },
      });
    }

    // Spawn "STAY THE COURSE" powerup in cycle 4
    if (this.cycleIndex === 3) {
      this.time.delayedCall(3000, () => this.spawnStayCourse());
    }
  }

  private spawnDebris(): void {
    const ci = this.cycleIndex;
    const bal = BALANCE.act3;
    this.debrisSpawned++;

    const variant = Phaser.Math.Between(0, 2);
    const sprite = this.add.sprite(0, 0, `market-debris-${variant}`);
    sprite.setDepth(8).setScale(OBJ_SCALE);

    // Determine spawn direction based on cycle
    const directions: string[] = [];
    directions.push('right');
    if (ci >= 1) directions.push('left');
    if (ci >= 2) directions.push('top');
    const dir = Phaser.Utils.Array.GetRandom(directions);

    const vaultX = this.vault.x;
    const vaultY = this.vault.y;
    const speed = Phaser.Math.Between(
      (bal.debrisSpeedMin as unknown as number[])[ci],
      (bal.debrisSpeedMax as unknown as number[])[ci],
    );

    let sx: number, sy: number;
    if (dir === 'right') {
      sx = GAME_WIDTH + 20;
      sy = Phaser.Math.Between(WALK_MIN_Y, WALK_MAX_Y);
    } else if (dir === 'left') {
      sx = -20;
      sy = Phaser.Math.Between(WALK_MIN_Y, WALK_MAX_Y);
    } else {
      sx = Phaser.Math.Between(GAME_WIDTH / 2 - 120, GAME_WIDTH / 2 + 120);
      sy = WALK_MIN_Y - 40;
    }

    sprite.setPosition(sx, sy);

    // Calculate velocity toward vault
    const dx = vaultX - sx;
    const dy = vaultY - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    this.debrisList.push({ sprite, vx, vy, active: true });
  }

  private spawnSellNow(): void {
    const ci = this.cycleIndex;
    this.sellNowSpawned++;

    const fromRight = Math.random() > 0.5;
    const x = fromRight ? GAME_WIDTH + 30 : -30;
    const y = Phaser.Math.Between(WALK_MIN_Y + 20, WALK_MAX_Y - 20);

    const sprite = this.add.sprite(x, y, 'sell-now-sign')
      .setDepth(9).setScale(OBJ_SCALE);

    const label = this.add.text(x, y - 22, 'SELL NOW!', {
      fontFamily: PIXEL_FONT, fontSize: '6px', color: '#f0d040',
    }).setOrigin(0.5).setDepth(10);

    const moves = (BALANCE.act3.sellNowMoveCycles as unknown as boolean[])[ci];

    const sellNow: SellNow = { sprite, label, active: true, moves };

    if (moves) {
      // Move toward vault
      const speed = BALANCE.act3.sellNowSpeed;
      const dx = this.vault.x - x;
      const dy = this.vault.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const duration = (dist / speed) * 1000;
      this.tweens.add({
        targets: sprite, x: this.vault.x, y: this.vault.y,
        duration, ease: 'Linear',
        onUpdate: () => {
          label.setPosition(sprite.x, sprite.y - 22);
          sprite.setDepth(sprite.y);
          label.setDepth(sprite.y + 1);
        },
      });
    } else {
      // Float in and hover — auto-fade after a few seconds
      const targetX = Phaser.Math.Between(120, GAME_WIDTH - 120);
      this.tweens.add({
        targets: sprite, x: targetX, duration: 1000, ease: 'Power2',
        onUpdate: () => {
          label.setPosition(sprite.x, sprite.y - 22);
        },
      });
      // Blink to tempt, then fade
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [sprite, label], alpha: 0, duration: 1500,
          onComplete: () => {
            if (sellNow.active) {
              sellNow.active = false;
              sprite.destroy();
              label.destroy();
            }
          },
        });
      });
    }

    this.sellNowList.push(sellNow);
  }

  private spawnStayCourse(): void {
    if (this.phase !== 'storm') return;

    const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
    const y = WALK_MIN_Y - 20;
    const sprite = this.add.sprite(x, y, 'stay-course').setDepth(9).setScale(OBJ_SCALE);

    const label = this.add.text(x, y - 18, 'STAY THE COURSE!', {
      fontFamily: PIXEL_FONT, fontSize: '5px', color: '#40d0f0',
    }).setOrigin(0.5).setDepth(10);

    // Float down into the play area
    const targetY = Phaser.Math.Between(WALK_MIN_Y + 30, WALK_MAX_Y - 30);
    this.tweens.add({
      targets: sprite, y: targetY, duration: 1000, ease: 'Sine.easeOut',
      onUpdate: () => label.setPosition(sprite.x, sprite.y - 18),
    });

    // Pulsing glow
    this.tweens.add({
      targets: sprite, scaleX: OBJ_SCALE * 1.15, scaleY: OBJ_SCALE * 1.15,
      duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Treat it like a special debris that grants shield on kick
    const stayDebris: Debris = { sprite, vx: 0, vy: 0, active: true };
    // Store label ref for cleanup
    (stayDebris as any).isStayCourse = true;
    (stayDebris as any).label = label;
    this.debrisList.push(stayDebris);
  }

  private activateShield(): void {
    this.vaultShielded = true;
    this.shieldTimer = BALANCE.act3.stayTheCourseDuration;

    this.shieldVisual = this.add.rectangle(
      this.vault.x, this.vault.y, 66, 58, 0x40d0f0, 0.3
    ).setDepth(6).setStrokeStyle(2, 0x40d0f0, 0.8);

    this.tweens.add({
      targets: this.shieldVisual, alpha: 0.15,
      duration: 300, yoyo: true, repeat: -1,
    });

    this.juice.floatingText(this.vault.x, this.vault.y - 40, 'SHIELDED!', PALETTE.ui.cyan);
    this.juice.emitParticles(this.vault.x, this.vault.y, 'super-particle', 10);
  }

  // ── RECOVERY PHASE ──

  private startRecovery(): void {
    this.phase = 'recovery';
    this.dividendList = [];

    const ci = this.cycleIndex;
    this.phaseText.setText('RECOVERY!').setColor(PALETTE.act3.recoveryGreen);
    this.instructionText.setText('COLLECT THE GREEN DIVIDENDS!').setAlpha(1);
    this.tweens.add({ targets: this.instructionText, alpha: 0, delay: 2500, duration: 500 });

    const numDividends = (BALANCE.act3.dividendsPerCycle as unknown as number[])[ci];
    const numLeeches = (BALANCE.act3.feeLeeches as unknown as number[])[ci];
    const total = numDividends + numLeeches;

    // Spawn them spread across the top, falling down
    const items: { isLeech: boolean }[] = [];
    for (let i = 0; i < numDividends; i++) items.push({ isLeech: false });
    for (let i = 0; i < numLeeches; i++) items.push({ isLeech: true });
    Phaser.Utils.Array.Shuffle(items);

    items.forEach((item, i) => {
      this.time.delayedCall(200 + i * 300, () => {
        const x = 60 + (GAME_WIDTH - 120) * (i / Math.max(1, total - 1)) + Phaser.Math.Between(-20, 20);
        const y = WALK_MIN_Y - 30;
        const key = item.isLeech ? 'fee-leech' : 'dividend-coin';
        const sprite = this.add.sprite(x, y, key).setDepth(8).setScale(OBJ_SCALE);

        const targetY = Phaser.Math.Between(WALK_MIN_Y + 20, WALK_MAX_Y - 20);
        this.tweens.add({
          targets: sprite, y: targetY,
          duration: 1500 + Phaser.Math.Between(0, 500),
          ease: 'Bounce.easeOut',
        });

        // Gentle bob after landing
        this.time.delayedCall(2200, () => {
          if (sprite.active) {
            this.tweens.add({
              targets: sprite, y: targetY - 4,
              duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
          }
        });

        this.dividendList.push({ sprite, isLeech: item.isLeech, active: true });
      });
    });

    // Auto-end recovery after some time
    this.time.delayedCall(6000 + total * 300, () => {
      if (this.phase === 'recovery') this.endRecovery();
    });
  }

  private endRecovery(): void {
    // Clean up remaining dividends
    for (const d of this.dividendList) {
      if (d.active) {
        d.active = false;
        this.tweens.add({
          targets: d.sprite, alpha: 0, scaleX: 0, scaleY: 0, duration: 300,
          onComplete: () => d.sprite.destroy(),
        });
      }
    }
    this.dividendList = [];

    gameState.increment('crashesCleared');
    this.cycleIndex++;

    if (this.cycleIndex >= BALANCE.act3.cycleCount) {
      this.completeAct();
    } else {
      this.phaseText.setText('').setAlpha(1);
      this.time.delayedCall(1000, () => this.startStormCycle());
    }
  }

  // ── UPDATE LOOP ──

  update(_time: number, delta: number): void {
    if (this.phase === 'complete') return;

    this.parallax.update(delta);
    const inputState = this.inputMgr.update(delta);
    this.player.handleInput(inputState, delta);
    this.player.clampPosition();

    // Shield timer
    if (this.vaultShielded) {
      this.shieldTimer -= delta;
      if (this.shieldTimer <= 0) {
        this.vaultShielded = false;
        if (this.shieldVisual) {
          this.tweens.add({
            targets: this.shieldVisual, alpha: 0, duration: 300,
            onComplete: () => { this.shieldVisual?.destroy(); this.shieldVisual = null; },
          });
        }
      } else if (this.shieldVisual) {
        this.shieldVisual.setPosition(this.vault.x, this.vault.y);
      }
    }

    if (this.phase === 'storm') {
      this.updateStorm(delta);
    } else if (this.phase === 'recovery') {
      this.updateRecovery();
    }

    this.statusText.setText(
      `CYCLE: ${Math.min(this.cycleIndex + 1, 4)}/4  SUPER: $${gameState.getDisplayBalance().toLocaleString()}`
    );
  }

  private updateStorm(delta: number): void {
    const ci = this.cycleIndex;
    const bal = BALANCE.act3;
    const maxDebris = (bal.debrisPerCycle as unknown as number[])[ci];
    const maxSellNow = (bal.sellNowPerCycle as unknown as number[])[ci];
    const spawnMs = (bal.debrisSpawnMs as unknown as number[])[ci];

    // Spawn debris
    this.spawnTimer += delta;
    if (this.spawnTimer >= spawnMs && this.debrisSpawned < maxDebris) {
      this.spawnDebris();
      this.spawnTimer = 0;
    }

    // Spawn sell-now traps (staggered through the storm)
    this.sellNowSpawnTimer += delta;
    const sellNowInterval = (maxDebris * spawnMs) / (maxSellNow + 1);
    if (this.sellNowSpawnTimer >= sellNowInterval && this.sellNowSpawned < maxSellNow) {
      this.spawnSellNow();
      this.sellNowSpawnTimer = 0;
    }

    const hitbox = this.player.getKickHitbox();

    // Update debris
    for (const d of this.debrisList) {
      if (!d.active) continue;

      const isStayCourse = (d as any).isStayCourse === true;

      if (!isStayCourse) {
        // Move toward vault
        d.sprite.x += d.vx * (delta / 1000);
        d.sprite.y += d.vy * (delta / 1000);
        d.sprite.setDepth(d.sprite.y);
      }

      // Check kick collision
      if (hitbox && Phaser.Geom.Intersects.RectangleToRectangle(
        hitbox.getBounds(), d.sprite.getBounds()
      )) {
        if (isStayCourse) {
          // Activate shield!
          d.active = false;
          const lbl = (d as any).label as Phaser.GameObjects.Text;
          this.tweens.killTweensOf(d.sprite);
          this.activateShield();
          d.sprite.destroy();
          lbl?.destroy();
        } else {
          // Kick debris away
          d.active = false;
          this.juice.shake('light');
          this.juice.starburst(d.sprite.x, d.sprite.y);
          this.juice.kickEffect(
            this.player.x + (this.player.isFacingRight() ? 24 : -24),
            this.player.y - 16, this.player.isFacingRight()
          );
          const dir = this.player.isFacingRight() ? 1 : -1;
          this.tweens.add({
            targets: d.sprite,
            x: d.sprite.x + dir * 120, y: d.sprite.y - 40,
            alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: 300,
            onComplete: () => d.sprite.destroy(),
          });
        }
        continue;
      }

      // Check vault collision (not for stay-course)
      if (!isStayCourse) {
        const vaultBounds = this.vault.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(d.sprite.getBounds(), vaultBounds)) {
          d.active = false;

          if (this.vaultShielded) {
            // Shield absorbs it
            this.juice.emitParticles(d.sprite.x, d.sprite.y, 'particle', 4, 0x40d0f0);
            d.sprite.destroy();
          } else {
            // Vault takes damage
            gameState.removeSuper(bal.debrisDamage);
            this.juice.shake('medium');
            this.juice.emitParticles(d.sprite.x, d.sprite.y, 'particle', 6, 0xc02020);
            this.juice.floatingText(
              this.vault.x, this.vault.y - 30,
              `-$${(bal.debrisDamage * gameState.get('superDisplayMultiplier')).toLocaleString()}`,
              PALETTE.ui.red,
            );
            // Vault shake
            this.tweens.add({
              targets: this.vault, x: this.vault.x - 4, duration: 50,
              yoyo: true, repeat: 3,
              onComplete: () => this.vault.setX(GAME_WIDTH / 2),
            });
            d.sprite.destroy();
          }
        }
      }
    }

    // Update sell-now traps
    for (const s of this.sellNowList) {
      if (!s.active) continue;

      // Check kick collision — this is a TRAP
      if (hitbox && Phaser.Geom.Intersects.RectangleToRectangle(
        hitbox.getBounds(), s.sprite.getBounds()
      )) {
        s.active = false;
        this.tweens.killTweensOf(s.sprite);
        gameState.removeSuper(bal.sellNowPenalty);
        this.juice.shake('heavy');
        this.juice.hitStop(60);
        this.juice.floatingText(
          s.sprite.x, s.sprite.y - 20,
          'PANIC SOLD!',
          PALETTE.ui.red,
        );
        this.juice.floatingText(
          s.sprite.x, s.sprite.y - 36,
          `-$${(bal.sellNowPenalty * gameState.get('superDisplayMultiplier')).toLocaleString()}`,
          PALETTE.ui.red,
        );
        this.juice.emitParticles(s.sprite.x, s.sprite.y, 'particle', 8, 0xe02020);
        this.tweens.add({
          targets: [s.sprite, s.label], alpha: 0, scaleX: 2, scaleY: 2, duration: 300,
          onComplete: () => { s.sprite.destroy(); s.label.destroy(); },
        });
        continue;
      }

      // Moving sell-now: check if it reached the vault
      if (s.moves) {
        const vaultBounds = this.vault.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(s.sprite.getBounds(), vaultBounds)) {
          s.active = false;
          this.tweens.killTweensOf(s.sprite);
          gameState.removeSuper(bal.sellNowPenalty);
          this.juice.shake('heavy');
          this.juice.floatingText(
            this.vault.x, this.vault.y - 30,
            'AUTO-SOLD!', PALETTE.ui.red,
          );
          this.juice.floatingText(
            this.vault.x, this.vault.y - 46,
            `-$${(bal.sellNowPenalty * gameState.get('superDisplayMultiplier')).toLocaleString()}`,
            PALETTE.ui.red,
          );
          this.juice.emitParticles(this.vault.x, this.vault.y, 'particle', 8, 0xe02020);
          s.sprite.destroy();
          s.label.destroy();
        }
      }
    }

    // Clean up dead items
    this.debrisList = this.debrisList.filter(d => d.active);
    this.sellNowList = this.sellNowList.filter(s => s.active);

    // Check if storm is over
    if (this.debrisSpawned >= maxDebris && this.debrisList.length === 0 &&
        this.sellNowSpawned >= maxSellNow && this.sellNowList.length === 0) {
      this.stormActive = false;
      this.time.delayedCall(500, () => {
        if (this.phase === 'storm') this.startRecovery();
      });
    }
  }

  private updateRecovery(): void {
    // Check body collision with dividends/leeches
    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - 14, this.player.y - 50, 28, 50
    );

    for (const d of this.dividendList) {
      if (!d.active) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, d.sprite.getBounds())) {
        d.active = false;
        if (d.isLeech) {
          // Fee leech — penalty
          gameState.removeSuper(BALANCE.act3.feeLeechPenalty);
          this.juice.shake('light');
          this.juice.floatingText(d.sprite.x, d.sprite.y - 16, 'FEE LEECH!', PALETTE.ui.red);
          this.juice.emitParticles(d.sprite.x, d.sprite.y, 'particle', 4, 0xe04040);
        } else {
          // Dividend collected
          gameState.addSuper(BALANCE.act3.dividendValue);
          this.juice.floatingText(
            d.sprite.x, d.sprite.y - 16,
            `+$${(BALANCE.act3.dividendValue * gameState.get('superDisplayMultiplier')).toLocaleString()}`,
            PALETTE.act3.recoveryGreen,
          );
          this.juice.emitParticles(d.sprite.x, d.sprite.y, 'super-particle', 4);
        }
        this.tweens.killTweensOf(d.sprite);
        this.tweens.add({
          targets: d.sprite, alpha: 0, scaleX: 0, scaleY: 0, duration: 200,
          onComplete: () => d.sprite.destroy(),
        });
      }
    }
  }

  // ── COMPLETION ──

  private completeAct(): void {
    this.phase = 'complete';
    this.phaseText.setText('MARKETS STABILISED').setColor(PALETTE.ui.gold);
    this.instructionText.setText('');
    this.cycleLabel.setText('');
    this.statusText.setText('ACT 3 COMPLETE!').setColor(PALETTE.ui.gold);
    this.time.delayedCall(2000, () => {
      this.parallax.destroy();
      this.scene.start(SCENES.ACT_OUTRO, { actNumber: 3 });
    });
  }
}
