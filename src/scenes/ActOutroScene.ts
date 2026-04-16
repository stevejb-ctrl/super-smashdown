import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { gameState } from '../systems/GameState';

// Completion summaries per act — dynamic based on player performance
const ACT_OUTRO: Record<number, {
  getTitle: () => string;
  getLines: () => string[];
  nextAct: number | null; // null = go to recap
}> = {
  1: {
    getTitle: () => 'ACT 1 COMPLETE!',
    getLines: () => {
      const fixes = gameState.get('employerFixes');
      const misses = gameState.get('employerMisses');
      const displayBal = gameState.getDisplayBalance();
      const lines = [
        `You caught ${fixes} payslips and built $${displayBal.toLocaleString()} in super!`,
      ];
      if (misses === 0) {
        lines.push('Perfect! Every payslip accounted for!');
      } else {
        lines.push(`${misses} payslips got away - that is lost super.`);
        lines.push('In real life, always check your payslip!');
      }
      lines.push('');
      lines.push('REMEMBER: If your employer is not paying');
      lines.push('super, you can report it to the ATO.');
      return lines;
    },
    nextAct: 2,
  },
  2: {
    getTitle: () => 'ACT 2 COMPLETE!',
    getLines: () => {
      const coins = gameState.get('giantCoinsSaved');
      const kicked = gameState.get('temptationsKicked');
      const displayBal = gameState.getDisplayBalance();
      const lines = [
        `You protected ${coins} savings and kicked ${kicked} temptations!`,
        `Super balance: $${displayBal.toLocaleString()}`,
      ];
      if (coins >= 5) {
        lines.push('Great discipline! Your future self thanks you.');
      } else if (coins >= 3) {
        lines.push('Good effort! Every dollar saved counts.');
      } else {
        lines.push('Temptations won this round. Saving is tough!');
      }
      lines.push('');
      lines.push('REMEMBER: Extra voluntary contributions');
      lines.push('can make a huge difference by retirement.');
      return lines;
    },
    nextAct: 3,
  },
  3: {
    getTitle: () => 'ACT 3 COMPLETE!',
    getLines: () => {
      const cleared = gameState.get('crashesCleared');
      const displayBal = gameState.getDisplayBalance();
      const lines = [
        `You survived ${cleared} market storms!`,
        `Super balance: $${displayBal.toLocaleString()}`,
      ];
      if (cleared >= 4) {
        lines.push('You held through every crash. That takes guts!');
      } else {
        lines.push('Markets are tough, but recovery always comes.');
      }
      lines.push('');
      lines.push('REMEMBER: Markets always recover over time.');
      lines.push('Never panic sell during a downturn!');
      lines.push('Stay invested and collect the recovery.');
      return lines;
    },
    nextAct: 4,
  },
  4: {
    getTitle: () => 'ACT 4 COMPLETE!',
    getLines: () => {
      const blocked = gameState.get('feesBlocked');
      const leaked = gameState.get('feesLeaked');
      const cancelled = gameState.get('specialServicesCancelled');
      const saved = gameState.get('totalFeesSaved');
      const drained = gameState.get('totalFeesDrained');
      const displayBal = gameState.getDisplayBalance();
      const lines = [
        `You blocked ${blocked} fees worth $${saved.toLocaleString()}!`,
        `Super balance: $${displayBal.toLocaleString()}`,
      ];
      if (cancelled > 0) {
        lines.push(`Cancelled ${cancelled} suspicious "Special Services" fees!`);
      }
      if (leaked > 0) {
        lines.push(`$${drained.toLocaleString()} in fees still drained your super.`);
      } else {
        lines.push('Perfect defence! Not a single fee got through!');
      }
      lines.push('');
      lines.push('REMEMBER: Review your super statement yearly.');
      lines.push('If you see a fee you do not understand,');
      lines.push('ASK your fund what it is for!');
      return lines;
    },
    nextAct: 5,
  },
  5: {
    getTitle: () => 'ACT 5 COMPLETE!',
    getLines: () => {
      const doors = gameState.get('doorsOpened');
      const outcome = gameState.get('outcomeTier');
      const spent = gameState.get('retirementPowerSpent');
      const starting = gameState.get('retirementPowerStarting');
      const lines = [
        `You unlocked ${doors} of 7 retirement choices!`,
        `Power spent: ${spent.toLocaleString()} of ${starting.toLocaleString()}`,
      ];
      if (outcome === 'best') {
        lines.push('BEST RETIREMENT - every door open!');
        lines.push('Your super bought you real freedom.');
      } else if (outcome === 'ok') {
        lines.push('SOLID RETIREMENT - a good life.');
        lines.push('More saving early = more doors next time.');
      } else {
        lines.push('JUST GETTING BY - you have the basics.');
        lines.push('Small changes early unlock big doors later.');
      }
      lines.push('');
      lines.push('REMEMBER: Super is the vault that');
      lines.push('unlocks the life you want at retirement.');
      return lines;
    },
    nextAct: null,
  },
};

export class ActOutroScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ACT_OUTRO);
  }

  create(data: { actNumber: number }): void {
    const act = data.actNumber || 1;
    const outro = ACT_OUTRO[act];
    if (!outro) return;

    this.cameras.main.setBackgroundColor('#000000');

    // Panel background — purple-tinted with magenta border
    const panel = this.add.graphics();
    panel.fillStyle(0x14001a, 0.95);
    panel.fillRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40);
    panel.lineStyle(2, 0xED008C, 0.6);
    panel.strokeRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40);

    // "WELL DONE!" header
    const wellDone = this.add.text(GAME_WIDTH / 2, 44, 'WELL DONE!', {
      fontFamily: PIXEL_FONT, fontSize: '14px', color: PALETTE.ui.gold,
    }).setOrigin(0.5).setAlpha(0).setShadow(2, 2, '#000000', 0);

    // Act complete title
    const title = this.add.text(GAME_WIDTH / 2, 68, outro.getTitle(), {
      fontFamily: PIXEL_FONT, fontSize: '10px', color: PALETTE.act1.superGreen,
    }).setOrigin(0.5).setAlpha(0);

    // Decorative line — magenta accent
    const deco = this.add.graphics().setAlpha(0);
    deco.fillStyle(0xED008C, 1);
    deco.fillRect(GAME_WIDTH / 2 - 100, 82, 200, 2);

    // Dynamic result lines
    const lines = outro.getLines();
    const textObjects: Phaser.GameObjects.Text[] = [];
    lines.forEach((line, i) => {
      const isRemember = line.startsWith('REMEMBER:');
      const t = this.add.text(GAME_WIDTH / 2, 100 + i * 20, line, {
        fontFamily: PIXEL_FONT, fontSize: '7px',
        color: isRemember ? PALETTE.ui.cyan : (line === '' ? PALETTE.ui.black : PALETTE.ui.lightGrey),
      }).setOrigin(0.5).setAlpha(0);
      textObjects.push(t);
    });

    // Continue prompt
    const nextText = outro.nextAct
      ? 'PRESS SPACE TO CONTINUE'
      : 'PRESS SPACE FOR RESULTS';
    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, nextText, {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({ targets: wellDone, alpha: 1, duration: 300, delay: 100 });
    this.tweens.add({ targets: title, alpha: 1, duration: 300, delay: 250 });
    this.tweens.add({ targets: deco, alpha: 1, duration: 300, delay: 350 });

    textObjects.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: 400 + i * 100 });
    });

    const promptDelay = 500 + lines.length * 100;
    this.tweens.add({ targets: prompt, alpha: 1, duration: 300, delay: promptDelay });
    this.time.delayedCall(promptDelay + 100, () => {
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    });

    // Wait for space (with delay to prevent accidental skip)
    const spaceHandler = () => {
      this.input.keyboard!.off('keydown-SPACE', spaceHandler);
      // Flash out
      const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0);
      flash.setDepth(30);
      this.tweens.add({
        targets: flash, alpha: 1, duration: 150,
        onComplete: () => {
          if (outro.nextAct) {
            this.scene.start(SCENES.ACT_INTRO, { actNumber: outro.nextAct });
          } else {
            this.scene.stop(SCENES.HUD);
            this.scene.start(SCENES.RECAP);
          }
        },
      });
    };
    this.time.delayedCall(1000, () => {
      this.input.keyboard!.on('keydown-SPACE', spaceHandler);
    });
  }
}
