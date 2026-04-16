import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

interface ParallaxLayer {
  tileSprite: Phaser.GameObjects.TileSprite;
  speedFactor: number;
}

// Manages parallax scrolling background layers per act.
export class ParallaxManager {
  private layers: ParallaxLayer[] = [];
  private scrollSpeed = 0;

  constructor(scene: Phaser.Scene, actNumber: number) {
    const configs: Record<number, { far: string; near: string }> = {
      1: { far: 'bg-act1-far', near: 'bg-act1-near' },
      2: { far: 'bg-act2-far', near: 'bg-act2-near' },
      3: { far: 'bg-act3-far', near: 'bg-act3-near' },
      4: { far: 'bg-act4-far', near: 'bg-act4-near' },
      5: { far: 'bg-act5-far', near: 'bg-act5-near' },
    };

    const cfg = configs[actNumber];
    if (!cfg) return;

    // Far background layer (slow scroll)
    const far = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, cfg.far);
    far.setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
    this.layers.push({ tileSprite: far, speedFactor: 0.1 });

    // Near background layer (faster scroll)
    const near = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, cfg.near);
    near.setOrigin(0, 0).setScrollFactor(0).setDepth(-5);
    this.layers.push({ tileSprite: near, speedFactor: 0.4 });
  }

  setSpeed(speed: number): void {
    this.scrollSpeed = speed;
  }

  update(delta: number): void {
    const dt = delta / 1000;
    for (const layer of this.layers) {
      layer.tileSprite.tilePositionX += this.scrollSpeed * layer.speedFactor * dt;
    }
  }

  destroy(): void {
    for (const layer of this.layers) {
      layer.tileSprite.destroy();
    }
    this.layers = [];
  }
}
