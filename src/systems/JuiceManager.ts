import Phaser from 'phaser';
import { gameState } from '../systems/GameState';

// Screen shake, hit-stop, flash, particles — the "game feel" system.
export class JuiceManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  shake(intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
    if (gameState.get('reducedMotion')) return;
    const presets = { light: [80, 0.003], medium: [120, 0.007], heavy: [200, 0.012] };
    const [duration, amount] = presets[intensity];
    this.scene.cameras.main.shake(duration, amount);
  }

  hitStop(durationMs = 60): void {
    if (gameState.get('reducedMotion')) return;
    this.scene.time.timeScale = 0.01;
    this.scene.physics.world.timeScale = 100;
    this.scene.time.delayedCall(durationMs * 0.01, () => {
      this.scene.time.timeScale = 1;
      this.scene.physics.world.timeScale = 1;
    });
  }

  flash(sprite: Phaser.GameObjects.Sprite, durationMs = 80): void {
    sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(durationMs, () => {
      sprite.clearTint();
    });
  }

  starburst(x: number, y: number): void {
    const star = this.scene.add.sprite(x, y, 'starburst');
    star.setScale(0.8);
    this.scene.tweens.add({
      targets: star,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: gameState.get('reducedMotion') ? 100 : 250,
      onComplete: () => star.destroy(),
    });
  }

  floatingText(x: number, y: number, text: string, color = '#40e060'): void {
    const t = this.scene.add.text(x, y, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color,
    }).setOrigin(0.5).setDepth(250);
    this.scene.tweens.add({
      targets: t,
      y: y - 35,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  emitParticles(x: number, y: number, textureKey = 'particle', count = 6, tint?: number): void {
    if (gameState.get('reducedMotion')) count = 2;
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.sprite(x, y, textureKey);
      if (tint !== undefined) p.setTint(tint);
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300 + Math.random() * 200,
        onComplete: () => p.destroy(),
      });
    }
  }

  kickEffect(x: number, y: number, facingRight: boolean): void {
    const effect = this.scene.add.sprite(x, y, 'kick-effect');
    effect.setFlipX(!facingRight);
    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scaleX: 2,
      duration: 150,
      onComplete: () => effect.destroy(),
    });
  }
}
