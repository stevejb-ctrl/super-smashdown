import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_START_X, WALK_MIN_Y, WALK_MAX_Y, OBJ_SCALE } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { BALANCE } from '../config/BalanceConfig';
import { gameState } from '../systems/GameState';
import { InputManager } from '../systems/InputManager';
import { JuiceManager } from '../systems/JuiceManager';
import { ParallaxManager } from '../systems/ParallaxManager';
import { Player } from '../entities/Player';

// ACT 1 — WORK & PAY: Employer Super
// Boss throws payslips. Normal ones must be CAUGHT (walk into them) for super.
// Dodgy "SUPER MISSING" ones must be KICKED back to the boss to fix them.

interface Payslip {
  sprite: Phaser.GameObjects.Sprite;
  isMissing: boolean;
  kicked: boolean;
  caught: boolean;
  label?: Phaser.GameObjects.Text;
}

export class Act1Scene extends Phaser.Scene {
  private player!: Player;
  private inputMgr!: InputManager;
  private juice!: JuiceManager;
  private parallax!: ParallaxManager;
  private payslips: Payslip[] = [];
  private boss!: Phaser.GameObjects.Sprite;
  private bossShadow!: Phaser.GameObjects.Ellipse;
  private spawnTimer = 0;
  private spawned = 0;
  private actTimer = 0;
  private statusText!: Phaser.GameObjects.Text;
  private bossStatusText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private superScoreText!: Phaser.GameObjects.Text;
  private completed = false;

  constructor() {
    super(SCENES.ACT1);
  }

  create(): void {
    this.parallax = new ParallaxManager(this, 1);
    this.parallax.setSpeed(20);

    const bossY = (WALK_MIN_Y + WALK_MAX_Y) / 2;
    this.bossShadow = this.add.ellipse(GAME_WIDTH - 80, bossY + 3, 40, 14, 0x000000, 0.3);
    this.bossShadow.setDepth(bossY - 1);
    this.boss = this.add.sprite(GAME_WIDTH - 80, bossY, 'boss');
    this.boss.setOrigin(0.5, 1).setDepth(bossY);

    this.add.text(GAME_WIDTH - 80, bossY - 78, 'BOSS', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(bossY + 1);

    this.bossStatusText = this.add.text(GAME_WIDTH - 80, bossY - 90, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(200);

    this.player = new Player(this, PLAYER_START_X, bossY);
    this.inputMgr = new InputManager(this);
    this.juice = new JuiceManager(this);

    this.instructionText = this.add.text(GAME_WIDTH / 2, 34, 'CATCH PAYSLIPS! KICK DODGY ONES BACK!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: this.instructionText, alpha: 0, delay: 5000, duration: 1000 });

    this.superScoreText = this.add.text(GAME_WIDTH / 2, 16, 'SUPER: $0', {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(200);

    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(20);

    this.spawnTimer = 0;
    this.spawned = 0;
    this.actTimer = 0;
    this.payslips = [];
    this.completed = false;
  }

  update(_time: number, delta: number): void {
    if (this.completed) return;

    this.parallax.update(delta);
    const inputState = this.inputMgr.update(delta);
    this.player.handleInput(inputState, delta);
    this.player.clampPosition();

    this.actTimer += delta;

    const progress = this.spawned / BALANCE.act1.payslipCount;
    const spawnInterval = Phaser.Math.Linear(
      BALANCE.act1.spawnIntervalStart,
      BALANCE.act1.spawnIntervalEnd,
      progress
    );
    this.spawnTimer += delta;
    if (this.spawnTimer >= spawnInterval && this.spawned < BALANCE.act1.payslipCount) {
      this.spawnPayslip();
      if (progress > 0.6 && Math.random() < 0.4 && this.spawned < BALANCE.act1.payslipCount) {
        this.time.delayedCall(150, () => this.spawnPayslip());
      }
      this.spawnTimer = 0;
    }

    // Check kick collisions
    const hitbox = this.player.getKickHitbox();
    if (hitbox) {
      for (const ps of this.payslips) {
        if (ps.kicked || ps.caught) continue;
        if (Phaser.Geom.Intersects.RectangleToRectangle(
          hitbox.getBounds(), ps.sprite.getBounds()
        )) {
          if (ps.isMissing) {
            this.kickPayslip(ps);
          } else {
            this.catchPayslip(ps);
          }
        }
      }
    }

    // Check body collisions for catching normal payslips
    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - 18, this.player.y - 60, 36, 60
    );
    for (const ps of this.payslips) {
      if (ps.kicked || ps.caught) continue;
      if (!ps.isMissing && Phaser.Geom.Intersects.RectangleToRectangle(
        playerBounds, ps.sprite.getBounds()
      )) {
        this.catchPayslip(ps);
      }
    }

    const displayBal = gameState.getDisplayBalance();
    this.superScoreText.setText(`SUPER: $${displayBal.toLocaleString()}`);
    this.statusText.setText(
      `CAUGHT: ${gameState.get('employerFixes')}  MISSED: ${gameState.get('employerMisses')}  LEFT: ${BALANCE.act1.payslipCount - this.spawned}`
    );

    if (this.spawned >= BALANCE.act1.payslipCount && this.payslips.length === 0) {
      this.completeAct();
    }
  }

  private spawnPayslip(): void {
    this.spawned++;
    const progress = (this.spawned - 1) / Math.max(1, BALANCE.act1.payslipCount - 1);
    const missingRate = Phaser.Math.Linear(BALANCE.act1.missingRateStart, BALANCE.act1.missingRateEnd, progress);
    const isMissing = Math.random() < missingRate;
    const texture = isMissing ? 'payslip-missing' : 'payslip';

    const targetY = Phaser.Math.Between(WALK_MIN_Y + 8, WALK_MAX_Y - 8);
    const startX = this.boss.x - 16;
    const startY = this.boss.y - 30;
    const sprite = this.add.sprite(startX, startY, texture);
    sprite.setScale(OBJ_SCALE).setDepth(startY);

    const speedMin = Phaser.Math.Linear(BALANCE.act1.payslipSpeedMin, BALANCE.act1.payslipSpeedEndMin, progress);
    const speedMax = Phaser.Math.Linear(BALANCE.act1.payslipSpeedMax, BALANCE.act1.payslipSpeedEndMax, progress);
    const speed = Phaser.Math.Between(Math.round(speedMin), Math.round(speedMax));

    const payslip: Payslip = { sprite, isMissing, kicked: false, caught: false };
    this.payslips.push(payslip);

    this.tweens.add({
      targets: this.boss, x: this.boss.x - 4, duration: 80, yoyo: true, ease: 'Power1',
    });

    const targetX = -40;
    const duration = (GAME_WIDTH + 60) / speed * 1000;
    this.tweens.add({
      targets: sprite, x: targetX, y: targetY, duration, ease: 'Linear',
      onUpdate: () => { sprite.setDepth(sprite.y); },
      onComplete: () => {
        if (!payslip.kicked && !payslip.caught) {
          gameState.increment('employerMisses');
          if (isMissing) {
            this.juice.floatingText(sprite.x + 50, sprite.y - 16, 'DODGY MISSED!', PALETTE.ui.red);
          } else {
            this.juice.floatingText(sprite.x + 50, sprite.y - 16, 'LOST PAY!', PALETTE.ui.red);
            gameState.removeSuper(BALANCE.act1.penaltyPerMiss);
          }
          this.removePayslip(payslip);
        }
      },
    });

    if (isMissing) {
      const label = this.add.text(startX, startY - 16, '!DODGY!', {
        fontFamily: PIXEL_FONT, fontSize: '6px', color: PALETTE.act1.errorRed,
      }).setOrigin(0.5).setDepth(startY + 1);
      this.tweens.add({
        targets: label, x: targetX, y: targetY - 16, duration, ease: 'Linear',
        onUpdate: () => { label.setDepth(sprite.depth + 1); },
        onComplete: () => label.destroy(),
      });
      payslip.label = label;
    } else {
      const label = this.add.text(startX, startY - 16, '+$', {
        fontFamily: PIXEL_FONT, fontSize: '6px', color: PALETTE.act1.superGreen,
      }).setOrigin(0.5).setDepth(startY + 1);
      this.tweens.add({
        targets: label, x: targetX, y: targetY - 16, duration, ease: 'Linear',
        onUpdate: () => { label.setDepth(sprite.depth + 1); },
        onComplete: () => label.destroy(),
      });
      payslip.label = label;
    }
  }

  private catchPayslip(ps: Payslip): void {
    ps.caught = true;
    this.tweens.killTweensOf(ps.sprite);
    if (ps.label) { this.tweens.killTweensOf(ps.label); ps.label.destroy(); }

    this.juice.starburst(ps.sprite.x, ps.sprite.y);
    gameState.increment('employerFixes');
    gameState.addSuper(BALANCE.act1.superPerCatch);
    this.juice.emitParticles(ps.sprite.x, ps.sprite.y, 'super-particle', 4);
    this.spawnDollarFlyUp(ps.sprite.x, ps.sprite.y, BALANCE.act1.superPerCatch);

    this.tweens.add({
      targets: ps.sprite, scaleX: 0, scaleY: 0, alpha: 0, duration: 200,
      onComplete: () => this.removePayslip(ps),
    });
  }

  private spawnDollarFlyUp(fromX: number, fromY: number, amount: number): void {
    const count = Math.min(amount, 6);
    for (let i = 0; i < count; i++) {
      const dollar = this.add.text(fromX, fromY, '$', {
        fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.act1.superGreen,
      }).setOrigin(0.5).setDepth(300);

      const burstX = fromX + Phaser.Math.Between(-30, 30);
      const burstY = fromY + Phaser.Math.Between(-40, -8);
      const delay = i * 60;

      this.tweens.add({
        targets: dollar, x: burstX, y: burstY, duration: 200, delay, ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: dollar, x: GAME_WIDTH / 2, y: 16, alpha: 0.6,
            scaleX: 0.5, scaleY: 0.5, duration: 400, ease: 'Power2',
            onComplete: () => {
              dollar.destroy();
              if (i === count - 1) {
                this.superScoreText.setScale(1.3);
                this.tweens.add({
                  targets: this.superScoreText, scaleX: 1, scaleY: 1,
                  duration: 200, ease: 'Bounce.easeOut',
                });
              }
            },
          });
        },
      });
    }
  }

  private kickPayslip(ps: Payslip): void {
    ps.kicked = true;
    this.tweens.killTweensOf(ps.sprite);
    if (ps.label) { this.tweens.killTweensOf(ps.label); ps.label.destroy(); }

    this.juice.shake('light');
    this.juice.kickEffect(this.player.x + (this.player.isFacingRight() ? 24 : -24), this.player.y - 16, this.player.isFacingRight());
    this.juice.starburst(ps.sprite.x, ps.sprite.y);

    this.tweens.add({
      targets: ps.sprite, x: this.boss.x, y: this.boss.y - 30,
      scaleX: 0.5 * OBJ_SCALE, scaleY: 0.5 * OBJ_SCALE, duration: 300, ease: 'Power2',
      onComplete: () => {
        gameState.increment('employerFixes');
        gameState.addSuper(BALANCE.act1.superPerFix);
        this.showBossStatus('FIXED!', PALETTE.act1.superGreen);
        this.juice.emitParticles(this.boss.x, this.boss.y - 40, 'super-particle', 8);
        this.juice.shake('medium');
        this.spawnDollarFlyUp(this.boss.x, this.boss.y - 45, BALANCE.act1.superPerFix);
        this.removePayslip(ps);
      },
    });
  }

  private showBossStatus(text: string, color: string): void {
    this.bossStatusText.setText(text).setColor(color).setAlpha(1);
    this.tweens.add({ targets: this.bossStatusText, alpha: 0, delay: 600, duration: 400 });
  }

  private removePayslip(ps: Payslip): void {
    ps.sprite.destroy();
    this.payslips = this.payslips.filter(p => p !== ps);
  }

  private completeAct(): void {
    this.completed = true;
    const bal = gameState.get('superBalance');
    this.statusText.setText('ACT 1 COMPLETE!').setColor(PALETTE.ui.gold);
    this.superScoreText.setText(`SUPER: $${Math.round(bal)}`).setColor(PALETTE.ui.gold);
    this.time.delayedCall(2000, () => {
      this.parallax.destroy();
      this.scene.start(SCENES.ACT_OUTRO, { actNumber: 1 });
    });
  }
}
