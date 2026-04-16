import Phaser from 'phaser';
import { SCENES, PIXEL_FONT, GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';
import { SpriteFactory } from '../systems/SpriteFactory';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  create(): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'GENERATING SPRITES...', {
      fontFamily: PIXEL_FONT,
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);

    SpriteFactory.generateAll(this);

    // Player animations — 48x72 frames
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'player', frame: 1 },
        { key: 'player', frame: 0 },
        { key: 'player', frame: 2 },
        { key: 'player', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-kick',
      frames: [{ key: 'player', frame: 3 }],
      frameRate: 1,
      repeat: 0,
    });

    text.destroy();
    this.scene.start(SCENES.TITLE);
  }
}
