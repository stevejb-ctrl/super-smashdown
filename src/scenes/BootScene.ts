import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create(): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LOADING...', {
      fontFamily: PIXEL_FONT,
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.time.delayedCall(200, () => {
          text.destroy();
          this.scene.start(SCENES.PRELOAD);
        });
      });
    } else {
      this.time.delayedCall(500, () => {
        text.destroy();
        this.scene.start(SCENES.PRELOAD);
      });
    }
  }
}
