import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT, ACT_NAMES } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { gameState } from '../systems/GameState';
import { musicManager } from '../systems/MusicManager';

// Educational content for each act
const ACT_EDUCATION: Record<number, { heading: string; lines: string[]; tip: string }> = {
  1: {
    heading: 'EMPLOYER SUPER',
    lines: [
      'When you start working, your employer must',
      'pay 12% of your wage into a super account.',
      '',
      'It is YOUR responsibility to check your',
      'payslip and make sure super is being paid.',
      '',
      'If it is missing, talk to your employer.',
      'If they refuse, report it to the ATO.',
    ],
    tip: 'CATCH GOOD PAYSLIPS. KICK DODGY ONES BACK!',
  },
  2: {
    heading: 'EXTRA CONTRIBUTIONS',
    lines: [
      'As you work, your super grows over time.',
      'But you can BOOST it by putting in extra',
      'from your own pay — voluntary contributions.',
      '',
      'It is important to enjoy life, but trading',
      'short-term splurges for long-term savings',
      'means way more choices when you retire.',
      '',
      'Even a small extra amount each week adds',
      'up to thousands over your working life.',
    ],
    tip: 'PROTECT YOUR SAVINGS FROM TEMPTATIONS!',
  },
  3: {
    heading: 'MARKET SHOCKS',
    lines: [
      'Super is invested in the market.',
      'Markets go up AND down - that is normal.',
      '',
      'The worst thing you can do during a crash',
      'is panic and pull your money out.',
      '',
      'Historically, markets always recover.',
      'Staying invested through crashes means',
      'you benefit from the recovery.',
    ],
    tip: 'SURVIVE THE CRASH. HOLD THE LINE!',
  },
  4: {
    heading: 'FEES & CHARGES',
    lines: [
      'Super funds charge many kinds of fees:',
      'ADMIN, INVESTMENT, PERFORMANCE and more.',
      '',
      'Some fees are reasonable. Others are',
      'suspicious - like "SPECIAL SERVICES"',
      'charges you never asked for.',
      '',
      'If you see a fee you do not understand,',
      'ASK your fund what it is for!',
    ],
    tip: 'INTERCEPT FEES! HOLD SPACE TO CANCEL SUSPICIOUS CHARGES!',
  },
  5: {
    heading: 'THE RETIREMENT VAULT',
    lines: [
      'Your super is a vault of CHOICES.',
      'The more you built, the more you get',
      'to unlock when you retire.',
      '',
      'Every door is a life reward:',
      'health, holidays, a home, travel,',
      'helping family, pursuing joys.',
      '',
      'Choose carefully — your super',
      'pays for the life you want.',
    ],
    tip: 'HOLD SPACE FOR A CHARGED KICK — PATIENCE PAYS!',
  },
};

export class ActIntroScene extends Phaser.Scene {
  private phase: 'title' | 'education' = 'title';
  private actNumber = 1;

  constructor() {
    super(SCENES.ACT_INTRO);
  }

  create(data: { actNumber: number }): void {
    this.phase = 'title';
    this.actNumber = data.actNumber || 1;
    const info = ACT_NAMES[this.actNumber];
    gameState.set('currentAct', this.actNumber);

    // Switch to the act's music as soon as the big act card appears —
    // the theme carries through the "Did You Know?" education screen
    // and all the way through gameplay.
    musicManager.playTrack(`act${this.actNumber}`);

    this.cameras.main.setBackgroundColor('#000000');

    // Flash white briefly
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 1);
    flash.setDepth(20);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, ease: 'Power2' });

    // Horizontal line sweep — brand magenta
    const line = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, 3, 0xED008C, 1);
    line.setDepth(15);
    this.tweens.add({ targets: line, scaleY: 40, alpha: 0, duration: 600, ease: 'Power3' });

    // Act number — big
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 32, info.title, {
      fontFamily: PIXEL_FONT, fontSize: '30px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setAlpha(0).setShadow(3, 3, '#000000', 0);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16, info.subtitle, {
      fontFamily: PIXEL_FONT, fontSize: '16px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setAlpha(0).setShadow(2, 2, '#000000', 0);

    // Decorative lines — magenta accent
    const deco = this.add.graphics();
    deco.setAlpha(0);
    deco.fillStyle(0xED008C, 1);
    deco.fillRect(GAME_WIDTH / 2 - 116, GAME_HEIGHT / 2 - 3, 232, 2);
    deco.fillStyle(0xf0c040, 1);
    deco.fillRect(GAME_WIDTH / 2 - 84, GAME_HEIGHT / 2 + 40, 168, 2);

    // Fade in sequence
    this.tweens.add({ targets: title, alpha: 1, duration: 300, delay: 200, ease: 'Power2' });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 300, delay: 400, ease: 'Power2' });
    this.tweens.add({ targets: deco, alpha: 1, duration: 300, delay: 500, ease: 'Power2' });

    // After title display, transition to education screen
    this.time.delayedCall(2200, () => {
      this.showEducationScreen();
    });
  }

  private showEducationScreen(): void {
    this.phase = 'education';

    // Fade out existing content
    this.tweens.add({
      targets: this.children.list.filter(c => c.type !== 'Rectangle'),
      alpha: 0, duration: 300,
    });

    const edu = ACT_EDUCATION[this.actNumber];
    if (!edu) { this.startAct(); return; }

    // Education panel background — purple-tinted
    const panelX = GAME_WIDTH / 2;
    const panel = this.add.graphics().setAlpha(0);
    panel.fillStyle(0x14001a, 0.95);
    panel.fillRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40);
    panel.lineStyle(2, 0xED008C, 0.6);
    panel.strokeRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40);

    // "DID YOU KNOW?" header
    const header = this.add.text(panelX, 42, 'DID YOU KNOW?', {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.ui.cyan,
    }).setOrigin(0.5).setAlpha(0);

    // Topic heading
    const heading = this.add.text(panelX, 62, edu.heading, {
      fontFamily: PIXEL_FONT, fontSize: '12px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setAlpha(0).setShadow(2, 2, '#000000', 0);

    // Decorative line — magenta accent
    const decoLine = this.add.graphics().setAlpha(0);
    decoLine.fillStyle(0xED008C, 1);
    decoLine.fillRect(panelX - 100, 78, 200, 2);

    // Educational text lines
    const textObjects: Phaser.GameObjects.Text[] = [];
    edu.lines.forEach((line, i) => {
      const t = this.add.text(panelX, 94 + i * 18, line, {
        fontFamily: PIXEL_FONT, fontSize: '7px',
        color: line === '' ? PALETTE.ui.black : PALETTE.ui.lightGrey,
      }).setOrigin(0.5).setAlpha(0);
      textObjects.push(t);
    });

    // Gameplay tip
    const tip = this.add.text(panelX, GAME_HEIGHT - 80, edu.tip, {
      fontFamily: PIXEL_FONT, fontSize: '8px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setAlpha(0).setShadow(1, 1, '#000000', 0);

    // Press space prompt
    const prompt = this.add.text(panelX, GAME_HEIGHT - 50, 'PRESS SPACE TO PLAY', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setAlpha(0);

    // Fade in everything with stagger
    this.tweens.add({ targets: panel, alpha: 1, duration: 300, delay: 200 });
    this.tweens.add({ targets: header, alpha: 1, duration: 300, delay: 300 });
    this.tweens.add({ targets: heading, alpha: 1, duration: 300, delay: 400 });
    this.tweens.add({ targets: decoLine, alpha: 1, duration: 300, delay: 450 });

    textObjects.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: 500 + i * 80 });
    });

    this.tweens.add({ targets: tip, alpha: 1, duration: 300, delay: 500 + edu.lines.length * 80 });
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: 600 + edu.lines.length * 80 });

    // Blink the prompt
    this.time.delayedCall(700 + edu.lines.length * 80, () => {
      this.tweens.add({
        targets: prompt, alpha: 0.3, duration: 500,
        yoyo: true, repeat: -1,
      });
    });

    // Wait for space press
    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      this.startAct();
    };
    // Small delay before accepting input so player doesn't skip accidentally
    this.time.delayedCall(800, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }

  private startAct(): void {
    const sceneMap: Record<number, string> = {
      1: SCENES.ACT1, 2: SCENES.ACT2, 3: SCENES.ACT3,
      4: SCENES.ACT4, 5: SCENES.ACT5,
    };

    // Flash out
    const flashOut = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0);
    flashOut.setDepth(30);
    this.tweens.add({
      targets: flashOut, alpha: 1, duration: 150,
      onComplete: () => {
        this.scene.start(sceneMap[this.actNumber]);
        this.scene.launch(SCENES.HUD);
      },
    });
  }
}
