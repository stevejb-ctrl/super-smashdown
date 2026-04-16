import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { gameState } from '../systems/GameState';
import { musicManager } from '../systems/MusicManager';

export class TitleScene extends Phaser.Scene {
  private blinkTimer = 0;
  private startText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.TITLE);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Scanline overlay effect (subtle)
    const scanlines = this.add.graphics();
    scanlines.setDepth(100).setAlpha(0.08);
    for (let y = 0; y < GAME_HEIGHT; y += 2) {
      scanlines.fillStyle(0x000000, 1);
      scanlines.fillRect(0, y, GAME_WIDTH, 1);
    }

    // Decorative top/bottom bars — arcade cabinet frame (brand magenta)
    const barGfx = this.add.graphics();
    barGfx.fillStyle(0xED008C, 1);
    barGfx.fillRect(0, 0, GAME_WIDTH, 3);
    barGfx.fillRect(0, GAME_HEIGHT - 3, GAME_WIDTH, 3);
    barGfx.fillRect(0, 0, 3, GAME_HEIGHT);
    barGfx.fillRect(GAME_WIDTH - 3, 0, 3, GAME_HEIGHT);

    // Title — big and bold
    this.add.text(GAME_WIDTH / 2, 38, 'SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '30px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setShadow(3, 3, '#000000', 0);

    this.add.text(GAME_WIDTH / 2, 78, 'SMASHDOWN', {
      fontFamily: PIXEL_FONT, fontSize: '22px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setShadow(3, 3, '#000000', 0);

    this.add.text(GAME_WIDTH / 2, 106, 'THE LONG GAME', {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setShadow(2, 2, '#000000', 0);

    // Decorative line under title
    const line = this.add.graphics();
    line.fillStyle(0xED008C, 1);
    line.fillRect(GAME_WIDTH / 2 - 130, 122, 260, 2);
    line.fillStyle(0xf0c040, 0.6);
    line.fillRect(GAME_WIDTH / 2 - 100, 126, 200, 2);

    // Controls box — deep purple tint
    const boxX = GAME_WIDTH / 2 - 150;
    const boxY = 136;
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0x2a0030, 0.85);
    boxGfx.fillRect(boxX, boxY, 300, 62);
    boxGfx.lineStyle(1, 0xED008C, 0.4);
    boxGfx.strokeRect(boxX, boxY, 300, 62);

    this.add.text(GAME_WIDTH / 2, boxY + 10, 'CONTROLS', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.gold,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, boxY + 26, 'MOVE: WASD / ARROW KEYS', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, boxY + 40, 'KICK: SPACE', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, boxY + 52, 'CHARGE KICK: HOLD SPACE', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
    }).setOrigin(0.5);

    // Blinking start prompt
    this.startText = this.add.text(GAME_WIDTH / 2, 220, 'PRESS SPACE TO START', {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setShadow(2, 2, '#000000', 0);

    // Settings row
    this.add.text(GAME_WIDTH / 2, 256, '[S] SOUND  [M] MOTION  [H] CONTRAST', {
      fontFamily: PIXEL_FONT, fontSize: '6px', color: '#4a4a5a',
    }).setOrigin(0.5);

    // Footer — brand presence
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'Supported by a Super Helpful Fund', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.brand.magenta,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '2026 SUPER SMASHDOWN', {
      fontFamily: PIXEL_FONT, fontSize: '6px', color: '#5a4a5a',
    }).setOrigin(0.5);

    // Start the arcade title theme (will unlock on first user gesture if needed).
    musicManager.playTrack('title');

    // Keyboard input
    this.input.keyboard!.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard!.on('keydown-S', () => {
      const next = !gameState.get('soundEnabled');
      gameState.set('soundEnabled', next);
      musicManager.setEnabled(next);
    });
    this.input.keyboard!.on('keydown-M', () => {
      gameState.set('reducedMotion', !gameState.get('reducedMotion'));
    });
    this.input.keyboard!.on('keydown-H', () => {
      gameState.set('highContrast', !gameState.get('highContrast'));
    });

    // Touch start
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y > 200 && p.y < 240) this.startGame();
    });

    if (window.location.search.includes('debug=1')) {
      gameState.set('debugMode', true);
    }

    this.blinkTimer = 0;
  }

  private startGame(): void {
    gameState.reset();
    this.scene.start(SCENES.SUPER_INTRO);
  }

  update(_time: number, delta: number): void {
    this.blinkTimer += delta;
    const phase = (this.blinkTimer % 1200);
    this.startText.setAlpha(phase < 800 ? 1 : 0);
  }
}
