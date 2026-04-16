import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { PALETTE } from '../config/Palette';

export class SuperIntroScene extends Phaser.Scene {
  constructor() {
    super(SCENES.SUPER_INTRO);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Magenta frame — consistent with title screen
    const frame = this.add.graphics();
    frame.fillStyle(0xED008C, 1);
    frame.fillRect(0, 0, GAME_WIDTH, 3);
    frame.fillRect(0, GAME_HEIGHT - 3, GAME_WIDTH, 3);
    frame.fillRect(0, 0, 3, GAME_HEIGHT);
    frame.fillRect(GAME_WIDTH - 3, 0, 3, GAME_HEIGHT);

    // Purple-tinted panel
    const panel = this.add.graphics();
    panel.fillStyle(0x14001a, 0.9);
    panel.fillRect(30, 14, GAME_WIDTH - 60, GAME_HEIGHT - 28);
    panel.lineStyle(2, 0xED008C, 0.5);
    panel.strokeRect(30, 14, GAME_WIDTH - 60, GAME_HEIGHT - 28);

    const cx = GAME_WIDTH / 2;

    // Heading
    const heading = this.add.text(cx, 36, 'WHAT IS SUPERANNUATION?', {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setAlpha(0).setShadow(2, 2, '#000000', 0);

    // Magenta underline
    const decoLine = this.add.graphics().setAlpha(0);
    decoLine.fillStyle(0xED008C, 1);
    decoLine.fillRect(cx - 140, 52, 280, 2);

    // Explanation text — chunked into readable lines
    const lines = [
      { text: 'Superannuation (or "super") is money', color: PALETTE.ui.lightGrey },
      { text: 'set aside throughout your working life', color: PALETTE.ui.lightGrey },
      { text: 'so you have income when you retire.', color: PALETTE.ui.lightGrey },
      { text: '', color: PALETTE.ui.black },
      { text: 'Your employer MUST pay a percentage of', color: PALETTE.ui.lightGrey },
      { text: 'your wage into a super fund for you.', color: PALETTE.ui.lightGrey },
      { text: '', color: PALETTE.ui.black },
      { text: 'Over decades, that money gets INVESTED', color: PALETTE.ui.white },
      { text: 'and grows through compound returns.', color: PALETTE.ui.white },
      { text: '', color: PALETTE.ui.black },
      { text: 'The choices you make along the way —', color: PALETTE.ui.lightGrey },
      { text: 'checking payslips, saving extra, staying', color: PALETTE.ui.lightGrey },
      { text: 'invested, and watching fees — all affect', color: PALETTE.ui.lightGrey },
      { text: 'how much you retire with.', color: PALETTE.ui.lightGrey },
    ];

    const lineObjs: Phaser.GameObjects.Text[] = [];
    const startY = 68;
    const lineHeight = 16;

    lines.forEach((line, i) => {
      const t = this.add.text(cx, startY + i * lineHeight, line.text, {
        fontFamily: PIXEL_FONT, fontSize: '7px', color: line.color,
      }).setOrigin(0.5).setAlpha(0);
      lineObjs.push(t);
    });

    // Call to action — gold
    const cta = this.add.text(cx, startY + lines.length * lineHeight + 10, 'YOUR MISSION: BUILD YOUR SUPER!', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.brand.magenta,
    }).setOrigin(0.5).setAlpha(0).setShadow(1, 1, '#000000', 0);

    // Prompt
    const prompt = this.add.text(cx, GAME_HEIGHT - 32, 'PRESS SPACE TO BEGIN', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setAlpha(0);

    // Staggered fade-in
    this.tweens.add({ targets: heading, alpha: 1, duration: 300, delay: 100 });
    this.tweens.add({ targets: decoLine, alpha: 1, duration: 300, delay: 200 });

    lineObjs.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: 350 + i * 80 });
    });

    const ctaDelay = 350 + lines.length * 80 + 100;
    this.tweens.add({ targets: cta, alpha: 1, duration: 300, delay: ctaDelay });

    const promptDelay = ctaDelay + 300;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    // Space to proceed
    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      const flash = this.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
      ).setDepth(30);
      this.tweens.add({
        targets: flash, alpha: 1, duration: 150,
        onComplete: () => {
          this.scene.start(SCENES.ACT_INTRO, { actNumber: 1 });
        },
      });
    };
    this.time.delayedCall(800, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }
}
