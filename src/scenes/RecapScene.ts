import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { gameState } from '../systems/GameState';

export class RecapScene extends Phaser.Scene {
  constructor() { super(SCENES.RECAP); }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.ui.black);
    const state = gameState.getAll();
    const outcome = state.outcomeTier;

    const outcomeLabels = {
      'best': { text: 'BEST RETIREMENT', color: PALETTE.ui.gold },
      'ok': { text: 'OK RETIREMENT', color: PALETTE.ui.green },
      'getting-by': { text: 'JUST GETTING BY', color: PALETTE.ui.orange },
    };
    const ol = outcomeLabels[outcome];

    this.add.text(GAME_WIDTH / 2, 20, 'GAME OVER', {
      fontFamily: PIXEL_FONT, fontSize: '16px', color: PALETTE.ui.white,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 46, ol.text, {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: ol.color,
    }).setOrigin(0.5);

    const stats = [
      `SUPER BALANCE: $${gameState.getDisplayBalance().toLocaleString()}`,
      `MISSING SUPER FIXED: ${state.employerFixes}`,
      `EMPLOYER PAYMENTS MISSED: ${state.employerMisses}`,
      `TEMPTATIONS KICKED: ${state.temptationsKicked}`,
      `GIANT COINS SAVED: ${state.giantCoinsSaved}`,
      `CRASHES CLEARED: ${state.crashesCleared}`,
      `HOLDS COMPLETED: ${state.holdsCompleted}`,
      `LEAKS SEALED: ${state.leaksSealed}`,
      `DOORS OPENED: ${state.doorsOpened}/7`,
    ];

    stats.forEach((line, i) => {
      this.add.text(GAME_WIDTH / 2, 72 + i * 16, line, {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.lightGrey,
      }).setOrigin(0.5);
    });

    const takeaways = [
      'CHECK YOUR PAY - MAKE SURE SUPER IS INCLUDED.',
      'SAVING NOW OPENS MORE DOORS LATER.',
      'MARKETS DIP BUT RECOVER - STAYING IN PAYS OFF.',
    ];

    const takeawayY = 246;
    this.add.text(GAME_WIDTH / 2, takeawayY, 'KEY TAKEAWAYS:', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.brand.magenta,
    }).setOrigin(0.5);

    takeaways.forEach((t, i) => {
      this.add.text(GAME_WIDTH / 2, takeawayY + 20 + i * 15, t, {
        fontFamily: PIXEL_FONT, fontSize: '6px', color: PALETTE.ui.white,
      }).setOrigin(0.5);
    });

    if (state.teacherMode) {
      const questions = [
        '1. WHAT MADE THE BIGGEST DIFFERENCE TO DOORS OPENED?',
        '2. WHERE DID YOU TAKE ACTION AND WHAT CHANGED?',
        '3. WHAT WOULD YOU DO DIFFERENTLY NEXT RUN?',
      ];
      this.add.text(GAME_WIDTH / 2, takeawayY + 72, 'DISCUSSION:', {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.cyan,
      }).setOrigin(0.5);
      questions.forEach((q, i) => {
        this.add.text(GAME_WIDTH / 2, takeawayY + 88 + i * 13, q, {
          fontFamily: PIXEL_FONT, fontSize: '5px', color: PALETTE.ui.lightGrey,
        }).setOrigin(0.5);
      });
    }

    const replayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'PRESS SPACE TO PLAY AGAIN', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: replayText, alpha: 0.3, duration: 600, yoyo: true, repeat: -1,
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start(SCENES.TITLE);
    });
  }
}
