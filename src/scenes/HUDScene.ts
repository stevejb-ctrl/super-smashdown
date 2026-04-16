import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, ACT_NAMES } from '../utils/Constants';
import { PALETTE } from '../config/Palette';
import { gameState } from '../systems/GameState';
import { EventBus, EVENTS } from '../utils/EventBus';

export class HUDScene extends Phaser.Scene {
  private superText!: Phaser.GameObjects.Text;
  private superBar!: Phaser.GameObjects.Graphics;
  private actLabel!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = false;

  constructor() {
    super(SCENES.HUD);
  }

  create(): void {
    this.superBar = this.add.graphics();
    this.drawSuperBar();

    this.add.text(6, 4, 'SUPER', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.white,
    });

    this.superText = this.add.text(132, 4, '$0', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.act1.superGreen,
    });

    this.actLabel = this.add.text(GAME_WIDTH - 6, 4, 'ACT 1', {
      fontFamily: PIXEL_FONT, fontSize: '9px', color: PALETTE.ui.gold,
    }).setOrigin(1, 0);

    this.coinsText = this.add.text(6, 22, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.act2.coinGold,
    });

    this.debugText = this.add.text(6, 50, '', {
      fontFamily: PIXEL_FONT, fontSize: '7px', color: PALETTE.ui.green,
    }).setVisible(false);

    EventBus.on(EVENTS.SUPER_CHANGED, () => this.updateDisplay());
    EventBus.on(EVENTS.COINS_CHANGED, () => this.updateDisplay());
    EventBus.on(EVENTS.ACT_CHANGED, () => this.updateDisplay());

    this.input.keyboard!.on('keydown-BACKQUOTE', () => {
      this.showDebug = !this.showDebug;
      this.debugText.setVisible(this.showDebug);
    });

    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (!gameState.get('debugMode') && !this.showDebug) return;
      switch (event.key) {
        case '1': this.scene.start(SCENES.ACT_INTRO, { actNumber: 1 }); break;
        case '2': this.scene.start(SCENES.ACT_INTRO, { actNumber: 2 }); break;
        case '3': this.scene.start(SCENES.ACT_INTRO, { actNumber: 3 }); break;
        case '4': this.scene.start(SCENES.ACT_INTRO, { actNumber: 4 }); break;
        case '5': this.scene.start(SCENES.ACT_INTRO, { actNumber: 5 }); break;
        case '=': case '+': gameState.addSuper(10); break;
        case '-': gameState.removeSuper(10); break;
      }
    });

    this.updateDisplay();
  }

  private updateDisplay(): void {
    const displayBal = gameState.getDisplayBalance();
    this.superText.setText(`$${displayBal.toLocaleString()}`);
    this.drawSuperBar();

    const act = gameState.get('currentAct');
    const actInfo = ACT_NAMES[act];
    if (actInfo) this.actLabel.setText(actInfo.title);

    const coins = gameState.get('giantCoinsSaved');
    this.coinsText.setText(coins > 0 ? `COINS: ${coins}` : '');

    if (this.showDebug) {
      const state = gameState.getAll();
      this.debugText.setText(
        Object.entries(state)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      );
    }
  }

  private drawSuperBar(): void {
    this.superBar.clear();
    const x = 50, y = 5, w = 76, h = 9;
    this.superBar.fillStyle(0x1a1a2a, 1);
    this.superBar.fillRect(x, y, w, h);
    const pct = gameState.get('superBalance') / 100;
    const fillColor = pct > 0.6 ? 0x40e060 : pct > 0.3 ? 0xe0c020 : 0xe04040;
    this.superBar.fillStyle(fillColor, 1);
    this.superBar.fillRect(x, y, w * pct, h);
    this.superBar.lineStyle(1, 0xffffff, 0.5);
    this.superBar.strokeRect(x, y, w, h);
  }

  update(): void {
    if (this.showDebug) this.updateDisplay();
  }
}
