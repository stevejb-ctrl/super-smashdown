import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, GROUND_Y, OBJ_SCALE } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { BALANCE } from '../config/BalanceConfig';
import { gameState } from '../systems/GameState';
import { InputManager } from '../systems/InputManager';
import { JuiceManager } from '../systems/JuiceManager';
import { ParallaxManager } from '../systems/ParallaxManager';
import { Player } from '../entities/Player';

type Act5Phase = 'intro' | 'powerReveal' | 'playing' | 'complete';

interface Door {
  index: number;
  x: number;
  sprite: Phaser.GameObjects.Sprite;
  rewardSprite: Phaser.GameObjects.Sprite;
  costPlaque: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  cost: number;
  opened: boolean;
  attempted: boolean;
  lightColumn?: Phaser.GameObjects.Rectangle;
}

export class Act5Scene extends Phaser.Scene {
  private phase: Act5Phase = 'intro';

  // Gameplay objects
  private player!: Player;
  private inputMgr!: InputManager;
  private juice!: JuiceManager;
  private parallax!: ParallaxManager;
  private doors: Door[] = [];

  // Power state
  private power = 0;
  private startingPower = 0;
  private displayedPower = 0; // animated number shown on HUD

  // HUD
  private powerBarBg!: Phaser.GameObjects.Rectangle;
  private powerBarFill!: Phaser.GameObjects.Rectangle;
  private powerBarLabel!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;

  // Charge + kick management
  private isCharging = false;
  private chargeBar!: Phaser.GameObjects.Graphics;
  private kickCooldown = 0;

  // Intro overlay objects (destroyed on beginGameplay)
  private introObjects: Phaser.GameObjects.GameObject[] = [];
  private counterText!: Phaser.GameObjects.Text;
  // Objects that must be destroyed before the power-reveal sub-phase
  private partTwoObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() { super(SCENES.ACT5); }

  create(): void {
    this.phase = 'intro';
    this.parallax = new ParallaxManager(this, 5);
    this.doors = [];
    this.introObjects = [];
    this.power = 0;
    this.startingPower = 0;
    this.displayedPower = 0;
    this.isCharging = false;
    this.kickCooldown = 0;
    this.partTwoObjects = [];

    this.showIntroSequence();
  }

  // ── INTRO SEQUENCE (x2 multiplier reveal, mirrors Act4) ──

  private showIntroSequence(): void {
    const currentMultiplier = gameState.get('superDisplayMultiplier');
    const rawBalance = gameState.get('superBalance');
    const startDisplay = Math.round(rawBalance * currentMultiplier);
    const newMultiplier = currentMultiplier * BALANCE.act5.introMultiplier;
    const endDisplay = Math.round(rawBalance * newMultiplier);

    gameState.set('superDisplayMultiplier', newMultiplier);

    // Dark overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.97
    ).setDepth(500);
    this.introObjects.push(overlay);

    const yearsText = this.add.text(GAME_WIDTH / 2, 42, 'YOUR FINAL WORKING YEARS...', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.introObjects.push(yearsText);
    this.tweens.add({ targets: yearsText, alpha: 1, duration: 500, delay: 200 });

    const line1 = this.add.text(GAME_WIDTH / 2, 78, 'You kept contributing through the last', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1);
    this.tweens.add({ targets: line1, alpha: 1, duration: 300, delay: 700 });

    const line1b = this.add.text(GAME_WIDTH / 2, 94, 'decade of work. Compound interest', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1b);
    this.tweens.add({ targets: line1b, alpha: 1, duration: 300, delay: 900 });

    const line1c = this.add.text(GAME_WIDTH / 2, 110, 'did the heavy lifting.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1c);
    this.tweens.add({ targets: line1c, alpha: 1, duration: 300, delay: 1050 });

    const balLabel = this.add.text(GAME_WIDTH / 2, 140, 'YOUR SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(balLabel);
    this.partTwoObjects.push(balLabel);
    this.tweens.add({ targets: balLabel, alpha: 1, duration: 300, delay: 1300 });

    this.counterText = this.add.text(GAME_WIDTH / 2, 172, `$${startDisplay.toLocaleString()}`, {
      fontFamily: PIXEL_FONT, fontSize: '24px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(3, 3, '#000000', 0);
    this.introObjects.push(this.counterText);
    this.tweens.add({ targets: this.counterText, alpha: 1, duration: 300, delay: 1500 });

    this.time.delayedCall(1900, () => {
      const tickDuration = 2500;
      const startTime = this.time.now;
      const tickEvent = this.time.addEvent({
        delay: 30, repeat: -1,
        callback: () => {
          const elapsed = this.time.now - startTime;
          const progress = Math.min(1, elapsed / tickDuration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startDisplay + (endDisplay - startDisplay) * eased);
          this.counterText.setText(`$${current.toLocaleString()}`);

          if (progress < 1 && Math.random() < 0.08) {
            this.counterText.setScale(1.05);
            this.tweens.add({ targets: this.counterText, scaleX: 1, scaleY: 1, duration: 100 });
          }

          if (progress >= 1) {
            tickEvent.remove();
            this.counterText.setText(`$${endDisplay.toLocaleString()}`);
            this.counterText.setColor(PALETTE.ui.gold);
            this.counterText.setScale(1.15);
            this.tweens.add({
              targets: this.counterText, scaleX: 1, scaleY: 1,
              duration: 300, ease: 'Bounce.easeOut',
            });
            this.showIntroPartTwo(endDisplay);
          }
        },
      });
    });
  }

  private showIntroPartTwo(endDisplay: number): void {
    const line2 = this.add.text(GAME_WIDTH / 2, 210, `$${endDisplay.toLocaleString()} — now it's time to retire.`, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line2);
    this.partTwoObjects.push(line2);
    this.tweens.add({ targets: line2, alpha: 1, duration: 300, delay: 300 });

    const line3 = this.add.text(GAME_WIDTH / 2, 240, 'Time to see what your super', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3);
    this.partTwoObjects.push(line3);
    this.tweens.add({ targets: line3, alpha: 1, duration: 300, delay: 600 });

    const line3b = this.add.text(GAME_WIDTH / 2, 256, 'can buy you...', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3b);
    this.partTwoObjects.push(line3b);
    this.tweens.add({ targets: line3b, alpha: 1, duration: 300, delay: 800 });

    const prompt = this.add.text(GAME_WIDTH / 2, 300, 'PRESS SPACE TO CONTINUE', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(prompt);
    this.partTwoObjects.push(prompt);

    const promptDelay = 1200;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      this.showPowerReveal(endDisplay);
    };
    this.time.delayedCall(1000, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }

  // ── POWER REVEAL SUB-PHASE ──

  private showPowerReveal(endDisplay: number): void {
    this.phase = 'powerReveal';

    this.startingPower = Math.max(0, Math.floor(endDisplay * BALANCE.act5.powerPerDollar));

    // Kill any lingering tweens on part-two objects (e.g. blinking yoyo on prompt)
    for (const obj of this.partTwoObjects) {
      this.tweens.killTweensOf(obj);
    }
    // Fade out everything from the super-balance phase together
    const fadeTargets: Phaser.GameObjects.GameObject[] = [this.counterText, ...this.partTwoObjects];
    this.tweens.add({
      targets: fadeTargets,
      alpha: 0,
      duration: 280,
      onComplete: () => {
        for (const obj of this.partTwoObjects) obj.destroy();
        this.partTwoObjects = [];
      },
    });

    // New label: RETIREMENT POWER
    const powerLabel = this.add.text(GAME_WIDTH / 2, 140, 'RETIREMENT POWER', {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.introObjects.push(powerLabel);
    this.tweens.add({ targets: powerLabel, alpha: 1, duration: 400, delay: 350 });

    // Big gold counter
    const powerCounter = this.add.text(GAME_WIDTH / 2, 174, '0', {
      fontFamily: PIXEL_FONT, fontSize: '28px', color: PALETTE.act5.goldGlow,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(3, 3, '#000000', 0);
    this.introObjects.push(powerCounter);
    this.tweens.add({ targets: powerCounter, alpha: 1, duration: 400, delay: 400 });

    // Decorative gold bar beneath
    const barBg = this.add.rectangle(GAME_WIDTH / 2, 210, 260, 10, 0x1a1a2a, 1)
      .setStrokeStyle(1, 0xf0c040, 0.6)
      .setDepth(501)
      .setAlpha(0);
    const barFill = this.add.rectangle(
      GAME_WIDTH / 2 - 129, 210, 2, 8, 0xf0c040, 1
    ).setOrigin(0, 0.5).setDepth(502).setAlpha(0);
    this.introObjects.push(barBg, barFill);
    this.tweens.add({ targets: [barBg, barFill], alpha: 1, duration: 400, delay: 500 });

    // Tick up
    this.time.delayedCall(900, () => {
      const tickDuration = 1500;
      const startTime = this.time.now;
      const tickEvent = this.time.addEvent({
        delay: 30, repeat: -1,
        callback: () => {
          const elapsed = this.time.now - startTime;
          const progress = Math.min(1, elapsed / tickDuration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(this.startingPower * eased);
          powerCounter.setText(current.toLocaleString());
          barFill.width = Math.max(2, 258 * eased);

          if (progress >= 1) {
            tickEvent.remove();
            powerCounter.setText(this.startingPower.toLocaleString());
            powerCounter.setScale(1.2);
            this.tweens.add({
              targets: powerCounter, scaleX: 1, scaleY: 1,
              duration: 350, ease: 'Bounce.easeOut',
            });
            // Store power state
            gameState.set('retirementPowerStarting', this.startingPower);
            gameState.set('retirementPower', this.startingPower);
            this.power = this.startingPower;
            this.displayedPower = this.startingPower;

            // Enter-vault prompt
            const enterPrompt = this.add.text(GAME_WIDTH / 2, 260, 'PRESS SPACE TO ENTER THE VAULT', {
              fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
            }).setOrigin(0.5).setDepth(501).setAlpha(0);
            this.introObjects.push(enterPrompt);
            this.tweens.add({ targets: enterPrompt, alpha: 1, duration: 300, delay: 200 });
            this.time.delayedCall(500, () => {
              this.tweens.add({ targets: enterPrompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
            });

            const enterHandler = () => {
              this.input.keyboard!.off('keydown-SPACE', enterHandler);
              this.beginGameplay();
            };
            this.time.delayedCall(600, () => {
              this.input.keyboard!.on('keydown-SPACE', enterHandler);
            });
          }
        },
      });
    });
  }

  // ── GAMEPLAY SETUP ──

  private beginGameplay(): void {
    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
    ).setDepth(600);
    this.tweens.add({
      targets: flash, alpha: 1, duration: 150,
      onComplete: () => {
        for (const obj of this.introObjects) obj.destroy();
        this.introObjects = [];
        this.setupHall();
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
      },
    });
  }

  private setupHall(): void {
    this.phase = 'playing';

    // Ground line
    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 3, GAME_WIDTH, 6, 0x4a3a2a).setDepth(0);

    // Build doors
    const doorCount = BALANCE.act5.doorCount;
    const leftMargin = 78;
    const rightMargin = 42;
    const span = GAME_WIDTH - leftMargin - rightMargin;
    const spacing = span / (doorCount - 1);

    for (let i = 0; i < doorCount; i++) {
      const x = leftMargin + spacing * i;

      // Light column behind door (hint at reward)
      const lightCol = this.add.rectangle(x, GROUND_Y - 40, 6, 80, 0xf0d060, 0.18)
        .setDepth(2);

      // Reward sprite hidden behind the door
      const reward = this.add.sprite(x, GROUND_Y - 42, BALANCE.act5.rewardSprites[i])
        .setOrigin(0.5, 0.5)
        .setDepth(4)
        .setScale(OBJ_SCALE)
        .setVisible(false);

      // Door sprite
      const sprite = this.add.sprite(x, GROUND_Y, 'door')
        .setOrigin(0.5, 1)
        .setDepth(5)
        .setScale(OBJ_SCALE);

      // Cost plaque above
      const cost = BALANCE.act5.doorCosts[i];
      const plaqueText = cost === 0 ? 'FREE' : cost.toLocaleString();
      const costPlaque = this.add.text(x, GROUND_Y - 96, plaqueText, {
        fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.white,
        backgroundColor: '#1a1a2a', padding: { x: 3, y: 2 },
      }).setOrigin(0.5).setDepth(6);

      // Category label under the plaque
      const label = this.add.text(x, GROUND_Y - 78, BALANCE.act5.doorLabels[i], {
        fontFamily: PIXEL_FONT, fontSize: '5px', color: PALETTE.ui.white,
        align: 'center',
      }).setOrigin(0.5).setDepth(6);

      this.doors.push({
        index: i,
        x,
        sprite,
        rewardSprite: reward,
        costPlaque,
        label,
        cost,
        opened: false,
        attempted: false,
        lightColumn: lightCol,
      });
    }

    // Power HUD at top
    const hudY = 20;
    this.powerBarBg = this.add.rectangle(GAME_WIDTH / 2, hudY, 280, 14, 0x1a1a2a, 0.9)
      .setStrokeStyle(2, 0xf0c040, 0.8)
      .setDepth(20);
    this.powerBarFill = this.add.rectangle(
      GAME_WIDTH / 2 - 138, hudY, 276, 10, 0xf0c040, 1
    ).setOrigin(0, 0.5).setDepth(21);
    this.powerBarLabel = this.add.text(
      GAME_WIDTH / 2, hudY, `RETIREMENT POWER: ${this.startingPower.toLocaleString()}`, {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.white,
      }).setOrigin(0.5).setDepth(22).setShadow(1, 1, '#000000', 0);

    this.instructionText = this.add.text(
      GAME_WIDTH / 2, 38, 'WALK UP TO A DOOR AND KICK — HOLD FOR CHARGED KICK (−50%)', {
        fontFamily: PIXEL_FONT, fontSize: '6px', color: PALETTE.ui.lightGrey,
      }).setOrigin(0.5).setDepth(20);

    // Player + input + juice
    this.player = new Player(this, 34, GROUND_Y);
    this.inputMgr = new InputManager(this);
    this.juice = new JuiceManager(this);
    this.chargeBar = this.add.graphics().setDepth(20);

    // Initial plaque colours
    this.updatePlaqueColors();
  }

  // ── MAIN LOOP ──

  update(_time: number, delta: number): void {
    if (this.phase !== 'playing') return;

    this.parallax.update(delta);
    const inputState = this.inputMgr.update(delta);
    this.player.handleInput(inputState, delta);
    this.player.clampPosition();

    if (this.kickCooldown > 0) this.kickCooldown -= delta;

    // Charge tracking: start on press, resolve on release
    if (inputState.kick) this.isCharging = true;
    if (this.isCharging && !inputState.kick) {
      this.isCharging = false;
      const chargeLevel = this.player.getChargeLevel();
      this.handleKickCollisions(chargeLevel);
      this.player.resetCharge();
    }

    // Charge bar over player head
    this.chargeBar.clear();
    if (inputState.kick) {
      const charge = this.player.getChargeLevel();
      const bw = 50, bh = 6;
      const bx = this.player.x - bw / 2;
      const by = this.player.y - 64;
      this.chargeBar.fillStyle(0x1a1a2a, 1);
      this.chargeBar.fillRect(bx, by, bw, bh);
      const color = charge >= BALANCE.act5.chargedKickThreshold ? 0x40e060 : charge >= 0.4 ? 0xe0c020 : 0xe04040;
      this.chargeBar.fillStyle(color, 1);
      this.chargeBar.fillRect(bx, by, bw * charge, bh);
      this.chargeBar.lineStyle(1, 0xffffff, 0.5);
      this.chargeBar.strokeRect(bx, by, bw, bh);
    }

    this.updatePowerBar(delta);
    this.updatePlaqueColors();
    this.checkCompletion();
  }

  // ── KICK HANDLING ──

  private handleKickCollisions(chargeLevel: number): void {
    if (this.kickCooldown > 0) return;

    // The Player's performKick is triggered internally on release; we spawn a
    // kick-effect + hitbox manually for door-targeting.
    const facingRight = this.player.isFacingRight();
    const kickX = this.player.x + (facingRight ? 26 : -26);
    const kickY = this.player.y - 16;
    const hitbox = new Phaser.Geom.Rectangle(kickX - 20, kickY - 18, 40, 36);

    // Find the door nearest the player that the hitbox overlaps
    let targetDoor: Door | null = null;
    let bestDist = Infinity;
    for (const door of this.doors) {
      if (door.opened) continue;
      const doorBounds = door.sprite.getBounds();
      const doorRect = new Phaser.Geom.Rectangle(doorBounds.x, doorBounds.y, doorBounds.width, doorBounds.height);
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, doorRect)) {
        const dist = Math.abs(door.x - this.player.x);
        if (dist < bestDist) {
          bestDist = dist;
          targetDoor = door;
        }
      }
    }

    if (!targetDoor) return;

    this.juice.kickEffect(kickX, kickY, facingRight);
    this.attemptDoor(targetDoor, chargeLevel);
    this.kickCooldown = 300;
  }

  private attemptDoor(door: Door, chargeLevel: number): void {
    door.attempted = true;
    const charged = chargeLevel >= BALANCE.act5.chargedKickThreshold;
    const effectiveCost = charged
      ? Math.floor(door.cost * (1 - BALANCE.act5.chargedKickDiscount))
      : door.cost;

    if (this.power >= effectiveCost) {
      this.power -= effectiveCost;
      gameState.set('retirementPower', this.power);
      this.openDoor(door, charged, effectiveCost);
    } else {
      // Not enough power
      const shortfall = effectiveCost - this.power;
      this.juice.shake('light');
      this.juice.floatingText(
        door.x, door.sprite.y - 96,
        `NEED ${shortfall.toLocaleString()} MORE POWER!`,
        PALETTE.ui.red
      );
      // Briefly flash the door red
      const orig = door.sprite.tintTopLeft;
      door.sprite.setTint(0xe04040);
      this.time.delayedCall(180, () => {
        door.sprite.clearTint();
        if (orig !== 0xffffff) door.sprite.setTint(orig);
      });
      door.attempted = false; // allow retry later if more power somehow becomes available
    }
  }

  private openDoor(door: Door, charged: boolean, effectiveCost: number): void {
    door.opened = true;
    gameState.increment('doorsOpened');

    // Hit stop + juice
    this.juice.hitStop(100);
    this.juice.shake('medium');
    this.juice.starburst(door.x, door.sprite.y - 42);
    this.juice.emitParticles(door.x, door.sprite.y - 42, 'super-particle', 14);

    // Door swing-open tween
    this.tweens.add({
      targets: door.sprite,
      scaleX: OBJ_SCALE * 0.2,
      alpha: 0.4,
      angle: -8,
      duration: 250,
      ease: 'Power2',
    });

    // Brighten the light column
    if (door.lightColumn) {
      this.tweens.add({
        targets: door.lightColumn,
        fillAlpha: 0.6,
        scaleX: 2,
        duration: 350,
      });
    }

    // Reward reveal: fade/scale/rise with bounce
    const reward = door.rewardSprite;
    reward.setVisible(true).setAlpha(0).setScale(OBJ_SCALE * 0.3);
    const targetY = reward.y - 16;
    this.tweens.add({
      targets: reward,
      alpha: 1,
      scaleX: OBJ_SCALE * 1.15,
      scaleY: OBJ_SCALE * 1.15,
      y: targetY,
      duration: 380,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Settle to normal scale
        this.tweens.add({
          targets: reward,
          scaleX: OBJ_SCALE,
          scaleY: OBJ_SCALE,
          duration: 180,
        });
      },
    });

    // Label recolor
    const nice = door.label.text.replace('\n', ' ');
    door.label.setColor(PALETTE.ui.gold);

    // Floating UNLOCKED text
    this.juice.floatingText(
      door.x, door.sprite.y - 110,
      `${nice} UNLOCKED!`,
      PALETTE.act5.goldGlow
    );

    if (charged) {
      this.time.delayedCall(180, () => {
        this.juice.floatingText(
          door.x, door.sprite.y - 128,
          'PATIENCE PAYS!  -50%',
          PALETTE.ui.green
        );
      });
    }

    // Cost plaque fade out
    this.tweens.add({
      targets: door.costPlaque, alpha: 0, duration: 250,
    });

    // Small gold trail from HUD to the door
    const trail = this.add.rectangle(GAME_WIDTH / 2, 20, 6, 6, 0xf0c040, 1).setDepth(25);
    this.tweens.add({
      targets: trail,
      x: door.x,
      y: door.sprite.y - 30,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeIn',
      onComplete: () => trail.destroy(),
    });

    // Briefly pulse instruction text to show the cost spent
    this.instructionText.setText(`-${effectiveCost.toLocaleString()} POWER SPENT`);
    this.instructionText.setColor(PALETTE.act5.goldGlow);
    this.time.delayedCall(1200, () => {
      if (this.phase === 'playing') {
        this.instructionText.setText('WALK UP TO A DOOR AND KICK — HOLD FOR CHARGED KICK (-50%)');
        this.instructionText.setColor(PALETTE.ui.lightGrey);
      }
    });
  }

  // ── HUD UPDATES ──

  private updatePowerBar(delta: number): void {
    // Animate displayedPower toward real power
    if (this.displayedPower !== this.power) {
      const diff = this.power - this.displayedPower;
      const step = Math.sign(diff) * Math.max(1, Math.abs(diff) * delta * 0.006);
      if (Math.abs(step) >= Math.abs(diff)) this.displayedPower = this.power;
      else this.displayedPower += step;
    }

    const ratio = this.startingPower > 0 ? this.power / this.startingPower : 0;
    const targetW = Math.max(0, 276 * ratio);
    // Smooth width tween-like update
    const currentW = this.powerBarFill.width;
    const newW = currentW + (targetW - currentW) * Math.min(1, delta * 0.01);
    this.powerBarFill.width = newW;

    this.powerBarLabel.setText(
      `RETIREMENT POWER: ${Math.round(this.displayedPower).toLocaleString()}`
    );
  }

  private updatePlaqueColors(): void {
    for (const door of this.doors) {
      if (door.opened) continue;
      const chargedCost = Math.floor(door.cost * (1 - BALANCE.act5.chargedKickDiscount));
      let color = PALETTE.ui.red;
      let bg = '#3a1a1a';
      if (door.cost === 0) {
        color = PALETTE.ui.green;
        bg = '#1a3a1a';
      } else if (this.power >= door.cost) {
        color = PALETTE.ui.green;
        bg = '#1a3a1a';
      } else if (this.power >= chargedCost) {
        color = PALETTE.ui.gold;
        bg = '#3a2a1a';
      }
      if (door.costPlaque.style.color !== color) {
        door.costPlaque.setColor(color);
        door.costPlaque.setBackgroundColor(bg);
      }
    }
  }

  // ── COMPLETION ──

  private checkCompletion(): void {
    if (this.phase !== 'playing') return;

    // All 7 doors opened → done
    const anyUnopened = this.doors.some(d => !d.opened);
    if (!anyUnopened) {
      this.phase = 'complete';
      this.time.delayedCall(1500, () => this.completeAct());
      return;
    }

    // Or: no unopened door is affordable even at charged cost → done
    const anyAffordable = this.doors.some(d => {
      if (d.opened) return false;
      const chargedCost = Math.floor(d.cost * (1 - BALANCE.act5.chargedKickDiscount));
      return this.power >= chargedCost;
    });
    if (!anyAffordable) {
      this.phase = 'complete';
      this.time.delayedCall(1500, () => this.completeAct());
    }
  }

  private completeAct(): void {
    const outcome = gameState.calculateOutcome();
    gameState.set('outcomeTier', outcome);
    gameState.set('retirementPowerSpent', this.startingPower - this.power);

    const doorsOpened = gameState.get('doorsOpened');
    const summary = `YOU UNLOCKED ${doorsOpened} RETIREMENT CHOICES`;
    this.instructionText.setText(summary)
      .setColor(outcome === 'best' ? PALETTE.ui.gold : outcome === 'ok' ? PALETTE.ui.green : PALETTE.ui.orange)
      .setFontSize('10px');

    this.time.delayedCall(2200, () => {
      this.parallax.destroy();
      this.scene.start(SCENES.ACT_OUTRO, { actNumber: 5 });
    });
  }
}
