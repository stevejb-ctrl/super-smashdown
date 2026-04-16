import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_START_X, OBJ_SCALE, WALK_MIN_Y, WALK_MAX_Y } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { BALANCE } from '../config/BalanceConfig';
import { gameState } from '../systems/GameState';
import { InputManager } from '../systems/InputManager';
import { JuiceManager } from '../systems/JuiceManager';
import { ParallaxManager } from '../systems/ParallaxManager';
import { Player } from '../entities/Player';

// Lifestyle creep temptation types
const TEMPTATION_TYPES = [
  { key: 'tempt-sneakers', name: 'SNEAKERS', color: '#e04060' },
  { key: 'tempt-skateboard', name: 'SKATEBOARD', color: '#d04030' },
  { key: 'tempt-tv', name: 'NEW TV', color: '#4080e0' },
  { key: 'tempt-phone', name: 'NEW PHONE', color: '#40c0e0' },
  { key: 'tempt-headphones', name: 'HEADPHONES', color: '#e04060' },
  { key: 'tempt-gaming', name: 'GAMING', color: '#4040c0' },
];

interface GiantCoin { sprite: Phaser.GameObjects.Sprite; alive: boolean; }
interface Temptation {
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  targetCoin: GiantCoin;
  active: boolean;
  typeName: string;
}

type Act2Phase = 'intro' | 'playing' | 'complete';

export class Act2Scene extends Phaser.Scene {
  private player!: Player;
  private inputMgr!: InputManager;
  private juice!: JuiceManager;
  private parallax!: ParallaxManager;
  private coins: GiantCoin[] = [];
  private temptations: Temptation[] = [];
  private spawnTimer = 0;
  private spawned = 0;
  private instructionText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private phase: Act2Phase = 'intro';
  private introObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() { super(SCENES.ACT2); }

  create(): void {
    this.parallax = new ParallaxManager(this, 2);
    this.parallax.setSpeed(0); // Stopped during intro

    this.phase = 'intro';
    this.spawnTimer = 0;
    this.spawned = 0;
    this.temptations = [];
    this.coins = [];
    this.introObjects = [];

    this.showIntroSequence();
  }

  /** Pre-gameplay sequence: show super growing over years of work */
  private showIntroSequence(): void {
    const rawBalance = gameState.get('superBalance');
    const startDisplay = Math.round(rawBalance); // e.g. $40
    const endDisplay = Math.round(rawBalance * 250); // e.g. $10,000

    // Set the display multiplier for the rest of the game
    gameState.set('superDisplayMultiplier', 250);

    // Dark overlay
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0.97
    ).setDepth(500);
    this.introObjects.push(overlay);

    // "YEARS LATER..." title
    const yearsText = this.add.text(GAME_WIDTH / 2, 50, 'A FEW YEARS LATER...', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.introObjects.push(yearsText);
    this.tweens.add({ targets: yearsText, alpha: 1, duration: 500, delay: 200 });

    // Narrative line 1
    const line1 = this.add.text(GAME_WIDTH / 2, 86, 'You have been working hard and your', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line1);
    this.tweens.add({ targets: line1, alpha: 1, duration: 300, delay: 700 });

    const line1b = this.add.text(GAME_WIDTH / 2, 102, 'employer has been paying super every month.', {
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

    // The big ticking counter
    const counterText = this.add.text(GAME_WIDTH / 2, 170, `$${startDisplay}`, {
      fontFamily: PIXEL_FONT, fontSize: '24px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(3, 3, '#000000', 0);
    this.introObjects.push(counterText);
    this.tweens.add({ targets: counterText, alpha: 1, duration: 300, delay: 1400 });

    // Tick up the counter after a short pause
    this.time.delayedCall(1800, () => {
      const tickDuration = 2500; // 2.5 seconds to tick up
      const startTime = this.time.now;
      const tickEvent = this.time.addEvent({
        delay: 30,
        repeat: -1,
        callback: () => {
          const elapsed = this.time.now - startTime;
          const progress = Math.min(1, elapsed / tickDuration);
          // Ease-out for a satisfying slow-down at the end
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startDisplay + (endDisplay - startDisplay) * eased);
          counterText.setText(`$${current.toLocaleString()}`);

          // Pulse green on milestones
          if (progress < 1 && Math.random() < 0.08) {
            counterText.setScale(1.05);
            this.tweens.add({
              targets: counterText, scaleX: 1, scaleY: 1, duration: 100,
            });
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
            this.showIntroPartTwo();
          }
        },
      });
    });
  }

  /** Second part of intro: "good start but need more" + instructions */
  private showIntroPartTwo(): void {
    const endDisplay = gameState.getDisplayBalance();

    const line2 = this.add.text(GAME_WIDTH / 2, 210, `$${endDisplay.toLocaleString()} is a good start, but you`, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line2);
    this.tweens.add({ targets: line2, alpha: 1, duration: 300, delay: 300 });

    const line2b = this.add.text(GAME_WIDTH / 2, 226, 'need a LOT more to retire comfortably.', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line2b);
    this.tweens.add({ targets: line2b, alpha: 1, duration: 300, delay: 500 });

    const line3 = this.add.text(GAME_WIDTH / 2, 252, 'But watch out — lifestyle temptations are', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act2.neonPink,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3);
    this.tweens.add({ targets: line3, alpha: 1, duration: 300, delay: 800 });

    const line3b = this.add.text(GAME_WIDTH / 2, 268, 'coming for your savings!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.act2.neonPink,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(line3b);
    this.tweens.add({ targets: line3b, alpha: 1, duration: 300, delay: 1000 });

    // Instructions
    const instrText = this.add.text(GAME_WIDTH / 2, 300, 'KICK TEMPTATIONS AWAY TO PROTECT YOUR COINS!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(501).setAlpha(0).setShadow(1, 1, '#000000', 0);
    this.introObjects.push(instrText);
    this.tweens.add({ targets: instrText, alpha: 1, duration: 300, delay: 1300 });

    // "Press space" prompt
    const prompt = this.add.text(GAME_WIDTH / 2, 332, 'PRESS SPACE TO BEGIN', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    this.introObjects.push(prompt);

    const promptDelay = 1600;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({
        targets: prompt, alpha: 0.3, duration: 500,
        yoyo: true, repeat: -1,
      });
    });

    // Wait for space
    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      this.beginGameplay();
    };
    this.time.delayedCall(1400, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }

  /** Transition from intro to actual gameplay */
  private beginGameplay(): void {
    // Flash transition
    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
    ).setDepth(600);
    this.tweens.add({
      targets: flash, alpha: 1, duration: 150,
      onComplete: () => {
        // Clean up intro objects
        for (const obj of this.introObjects) obj.destroy();
        this.introObjects = [];

        // Set up gameplay
        this.setupGameplay();

        // Fade flash out
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
      },
    });
  }

  /** Set up the actual gameplay elements */
  private setupGameplay(): void {
    this.phase = 'playing';
    this.parallax.setSpeed(15);

    this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 3, GAME_WIDTH, 6, 0x4a3a3a).setDepth(0);

    // Place coins across the walkable area
    const coinCount = BALANCE.act2.giantCoinCount;
    this.coins = [];
    for (let i = 0; i < coinCount; i++) {
      const x = 80 + (GAME_WIDTH - 160) * (i / (coinCount - 1));
      const y = Phaser.Math.Between(WALK_MIN_Y + 20, WALK_MAX_Y - 10);
      const sprite = this.add.sprite(x, y, 'giant-coin');
      sprite.setOrigin(0.5, 1).setDepth(y).setScale(OBJ_SCALE);
      this.tweens.add({
        targets: sprite, y: sprite.y - 5, duration: 800 + i * 100,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.coins.push({ sprite, alive: true });
    }

    this.player = new Player(this, PLAYER_START_X, (WALK_MIN_Y + WALK_MAX_Y) / 2);
    this.inputMgr = new InputManager(this);
    this.juice = new JuiceManager(this);

    this.instructionText = this.add.text(GAME_WIDTH / 2, 34, 'KICK AWAY THE LIFESTYLE CREEP!', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({ targets: this.instructionText, alpha: 0, delay: 4000, duration: 1000 });

    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5).setDepth(20);
  }

  update(_time: number, delta: number): void {
    if (this.phase !== 'playing') return;

    this.parallax.update(delta);
    const inputState = this.inputMgr.update(delta);
    this.player.handleInput(inputState, delta);
    this.player.clampPosition();

    this.spawnTimer += delta;
    if (this.spawnTimer >= BALANCE.act2.spawnIntervalMs && this.spawned < BALANCE.act2.temptationCount) {
      this.spawnTemptation();
      this.spawnTimer = 0;
    }

    const hitbox = this.player.getKickHitbox();
    if (hitbox) {
      for (const t of this.temptations) {
        if (!t.active) continue;
        if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox.getBounds(), t.sprite.getBounds())) {
          this.kickTemptation(t);
        }
      }
    }

    for (const t of this.temptations) {
      if (!t.active) continue;
      if (!t.targetCoin.alive) {
        t.active = false;
        t.sprite.destroy();
        t.label.destroy();
        continue;
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(t.sprite.getBounds(), t.targetCoin.sprite.getBounds())) {
        this.temptationHitsCoin(t);
      }
    }

    const alive = this.coins.filter(c => c.alive).length;
    const displayBal = gameState.getDisplayBalance();
    this.statusText.setText(`SAVINGS: ${alive}/${BALANCE.act2.giantCoinCount}  KICKED: ${gameState.get('temptationsKicked')}  SUPER: $${displayBal.toLocaleString()}`);

    if (this.spawned >= BALANCE.act2.temptationCount && this.temptations.filter(t => t.active).length === 0) {
      this.completeAct();
    }
  }

  private spawnTemptation(): void {
    this.spawned++;
    const aliveCoins = this.coins.filter(c => c.alive);
    if (aliveCoins.length === 0) return;

    const targetCoin = Phaser.Utils.Array.GetRandom(aliveCoins);
    const type = Phaser.Utils.Array.GetRandom(TEMPTATION_TYPES);
    const fromRight = Math.random() > 0.5;
    const x = fromRight ? GAME_WIDTH + 24 : -24;
    const y = Phaser.Math.Between(WALK_MIN_Y + 10, WALK_MAX_Y - 10);

    const sprite = this.add.sprite(x, y, type.key);
    sprite.setDepth(y).setScale(OBJ_SCALE);

    // Label floating above the temptation
    const label = this.add.text(x, y - 22, type.name, {
      fontFamily: PIXEL_FONT, fontSize: '5px', color: type.color,
    }).setOrigin(0.5).setDepth(y + 1);

    const temptation: Temptation = { sprite, label, targetCoin, active: true, typeName: type.name };
    this.temptations.push(temptation);

    const speed = Phaser.Math.Between(BALANCE.act2.temptationSpeedMin, BALANCE.act2.temptationSpeedMax);
    const dist = Math.abs(targetCoin.sprite.x - x);
    const duration = dist / speed * 1000;

    this.tweens.add({
      targets: sprite, x: targetCoin.sprite.x, y: targetCoin.sprite.y,
      duration, ease: 'Linear',
      onUpdate: () => {
        sprite.setDepth(sprite.y);
        label.setPosition(sprite.x, sprite.y - 22);
        label.setDepth(sprite.y + 1);
      },
    });
  }

  private kickTemptation(t: Temptation): void {
    t.active = false;
    gameState.increment('temptationsKicked');
    this.juice.shake('light');
    this.juice.starburst(t.sprite.x, t.sprite.y);
    this.juice.kickEffect(this.player.x + (this.player.isFacingRight() ? 24 : -24), this.player.y - 16, this.player.isFacingRight());
    this.juice.floatingText(t.sprite.x, t.sprite.y - 16, `NO ${t.typeName}!`, PALETTE.act2.neonPink);
    this.tweens.killTweensOf(t.sprite);
    const dir = this.player.isFacingRight() ? 1 : -1;
    this.tweens.add({
      targets: [t.sprite, t.label],
      x: t.sprite.x + dir * 100, y: t.sprite.y - 50,
      alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: 300,
      onComplete: () => { t.sprite.destroy(); t.label.destroy(); },
    });
  }

  private temptationHitsCoin(t: Temptation): void {
    t.active = false;
    t.targetCoin.alive = false;
    this.juice.shake('medium');
    this.juice.emitParticles(t.targetCoin.sprite.x, t.targetCoin.sprite.y, 'particle', 10, 0xf0d040);
    this.juice.floatingText(t.targetCoin.sprite.x, t.targetCoin.sprite.y - 24, `SPENT ON ${t.typeName}!`, PALETTE.ui.red);
    this.tweens.killTweensOf(t.targetCoin.sprite);
    this.tweens.add({
      targets: t.targetCoin.sprite, scaleX: 0, scaleY: 0, alpha: 0, duration: 200,
      onComplete: () => t.targetCoin.sprite.destroy(),
    });
    t.sprite.destroy();
    t.label.destroy();
  }

  private completeAct(): void {
    this.phase = 'complete';
    const aliveCoins = this.coins.filter(c => c.alive);
    const savedCount = aliveCoins.length;

    // Capture the display balance BEFORE adding coins
    const COIN_VALUE = 1000;
    const balBefore = gameState.getDisplayBalance();
    const balAfter = balBefore + savedCount * COIN_VALUE;

    this.statusText.setText('').setAlpha(0);

    // Dark overlay for the results sequence
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a, 0
    ).setDepth(400);
    this.tweens.add({ targets: overlay, alpha: 0.92, duration: 500 });

    // "WELL DONE!" header
    const wellDone = this.add.text(GAME_WIDTH / 2, 36, 'WELL DONE!', {
      fontFamily: PIXEL_FONT, fontSize: '16px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setDepth(401).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.tweens.add({ targets: wellDone, alpha: 1, duration: 300, delay: 400 });

    const balLabel = this.add.text(GAME_WIDTH / 2, 66, 'YOUR SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    this.tweens.add({ targets: balLabel, alpha: 1, duration: 300, delay: 600 });

    const balCounter = this.add.text(GAME_WIDTH / 2, 88, `$${balBefore.toLocaleString()}`, {
      fontFamily: PIXEL_FONT, fontSize: '18px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setDepth(401).setAlpha(0).setShadow(2, 2, '#000000', 0);
    this.tweens.add({ targets: balCounter, alpha: 1, duration: 300, delay: 700 });

    // Animate each surviving coin flying to the counter
    const coinStartDelay = 1200;
    let runningBal = balBefore;

    aliveCoins.forEach((coin, i) => {
      const delay = coinStartDelay + i * 500;

      this.time.delayedCall(delay, () => {
        // Stop coin bobbing
        this.tweens.killTweensOf(coin.sprite);

        // Create a "+$1,000" label that flies with the coin
        const plusText = this.add.text(coin.sprite.x, coin.sprite.y - 20, '+$1,000', {
          fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.gold,
        }).setOrigin(0.5).setDepth(402).setShadow(1, 1, '#000000', 0);

        // Fly coin + label up to the counter
        this.tweens.add({
          targets: coin.sprite,
          x: GAME_WIDTH / 2, y: 88,
          scaleX: 0.5, scaleY: 0.5, alpha: 0.6,
          duration: 500, ease: 'Power2',
          onComplete: () => {
            coin.sprite.destroy();

            // Add to gameState as each coin lands
            gameState.increment('giantCoinsSaved');
            gameState.addSuper(BALANCE.act2.superPerCoinSaved);

            // Update running balance
            runningBal += COIN_VALUE;
            balCounter.setText(`$${runningBal.toLocaleString()}`);
            balCounter.setScale(1.15);
            this.tweens.add({
              targets: balCounter, scaleX: 1, scaleY: 1,
              duration: 200, ease: 'Bounce.easeOut',
            });

            this.juice.emitParticles(GAME_WIDTH / 2, 88, 'super-particle', 4);
          },
        });

        this.tweens.add({
          targets: plusText,
          x: GAME_WIDTH / 2, y: 70, alpha: 0,
          duration: 600, ease: 'Power2',
          onComplete: () => plusText.destroy(),
        });
      });
    });

    // After all coins collected, show the compound growth impact
    const afterCoinsDelay = coinStartDelay + savedCount * 500 + 600;
    this.time.delayedCall(afterCoinsDelay, () => {
      this.showCompoundGrowth(savedCount, balAfter);
    });
  }

  /** Show the compound growth impact of the saved amount */
  private showCompoundGrowth(savedCount: number, _totalBal: number): void {
    const COIN_VALUE = 1000;
    const savedAmount = savedCount * COIN_VALUE;
    const GROWTH_RATE = 0.07; // 7% p.a. high-growth after fees
    const YEARS = 42; // age 25 to 67
    const futureValue = Math.round(savedAmount * Math.pow(1 + GROWTH_RATE, YEARS));

    // Summary line
    const summaryText = savedCount > 0
      ? `You added $${savedAmount.toLocaleString()} to super\nby avoiding temptations!`
      : 'Temptations got the better of you this time.\nEvery dollar counts!';

    const summary = this.add.text(GAME_WIDTH / 2, 124, summaryText, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.lightGrey,
      align: 'center',
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    this.tweens.add({ targets: summary, alpha: 1, duration: 300 });

    if (savedCount > 0) {
      // Compound growth reveal
      const growthLabel = this.add.text(GAME_WIDTH / 2, 170, 'BUT HERE IS THE AMAZING PART...', {
        fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.cyan,
      }).setOrigin(0.5).setDepth(401).setAlpha(0);
      this.tweens.add({ targets: growthLabel, alpha: 1, duration: 300, delay: 600 });

      const explainText = this.add.text(GAME_WIDTH / 2, 192,
        `If you invest $${savedAmount.toLocaleString()} at age 25 in\na high-growth super fund (7% p.a.)...`, {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
        align: 'center',
      }).setOrigin(0.5).setDepth(401).setAlpha(0);
      this.tweens.add({ targets: explainText, alpha: 1, duration: 300, delay: 1000 });

      const byRetirement = this.add.text(GAME_WIDTH / 2, 222, 'By retirement at 67, it becomes:', {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
      }).setOrigin(0.5).setDepth(401).setAlpha(0);
      this.tweens.add({ targets: byRetirement, alpha: 1, duration: 300, delay: 1400 });

      // Big future value — tick up for drama
      const futureText = this.add.text(GAME_WIDTH / 2, 252, `$${savedAmount.toLocaleString()}`, {
        fontFamily: PIXEL_FONT, fontSize: '20px', color: PALETTE.act1.superGreen,
      }).setOrigin(0.5).setDepth(401).setAlpha(0).setShadow(3, 3, '#000000', 0);
      this.tweens.add({ targets: futureText, alpha: 1, duration: 300, delay: 1800 });

      // Tick up the future value counter
      this.time.delayedCall(2200, () => {
        const tickDuration = 2000;
        const startTime = this.time.now;
        const tickEvent = this.time.addEvent({
          delay: 30, repeat: -1,
          callback: () => {
            const elapsed = this.time.now - startTime;
            const progress = Math.min(1, elapsed / tickDuration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(savedAmount + (futureValue - savedAmount) * eased);
            futureText.setText(`$${current.toLocaleString()}`);

            if (progress >= 1) {
              tickEvent.remove();
              futureText.setText(`$${futureValue.toLocaleString()}`);
              futureText.setColor(PALETTE.ui.gold);
              futureText.setScale(1.15);
              this.tweens.add({
                targets: futureText, scaleX: 1, scaleY: 1,
                duration: 300, ease: 'Bounce.easeOut',
              });
              this.juice.emitParticles(GAME_WIDTH / 2, 252, 'super-particle', 12);
              this.showCompoundPunchline(savedAmount, futureValue);
            }
          },
        });
      });
    } else {
      // No coins saved — still show the lesson
      const missedText = this.add.text(GAME_WIDTH / 2, 180,
        'Each $1,000 saved at age 25 could grow\nto over $18,000 by retirement!', {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.orange,
        align: 'center',
      }).setOrigin(0.5).setDepth(401).setAlpha(0);
      this.tweens.add({ targets: missedText, alpha: 1, duration: 300, delay: 600 });

      this.time.delayedCall(2500, () => this.showContinuePrompt());
    }
  }

  /** Final punchline after the compound growth reveal */
  private showCompoundPunchline(savedAmount: number, futureValue: number): void {
    const multiplier = Math.round(futureValue / savedAmount);

    const punchline = this.add.text(GAME_WIDTH / 2, 286,
      `That is ${multiplier}x your original savings!\nCompound interest is a superpower.`, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
      align: 'center',
    }).setOrigin(0.5).setDepth(401).setAlpha(0).setShadow(1, 1, '#000000', 0);
    this.tweens.add({ targets: punchline, alpha: 1, duration: 400, delay: 300 });

    this.time.delayedCall(1200, () => this.showContinuePrompt());
  }

  /** Show the "press space" prompt and wait for input */
  private showContinuePrompt(): void {
    const prompt = this.add.text(GAME_WIDTH / 2, 326, 'PRESS SPACE TO CONTINUE', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300 });
    this.time.delayedCall(200, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      const flash = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
      ).setDepth(500);
      this.tweens.add({
        targets: flash, alpha: 1, duration: 150,
        onComplete: () => {
          this.parallax.destroy();
          this.scene.start(SCENES.ACT_OUTRO, { actNumber: 2 });
        },
      });
    };
    this.time.delayedCall(400, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }
}
