import Phaser from 'phaser';
import { BALANCE } from '../config/BalanceConfig';
import { WALK_MIN_Y, WALK_MAX_Y, GAME_WIDTH } from '../utils/Constants';
import { InputState } from '../systems/InputManager';

// Player character — Double Dragon style beat-em-up protagonist.
// 48x72 sprite. Free movement within the walkable depth zone.
export class Player extends Phaser.GameObjects.Sprite {
  private facingRight = true;
  private isKicking = false;
  private kickCooldown = 0;
  private kickHitbox: Phaser.GameObjects.Rectangle | null = null;
  private chargeLevel = 0;
  private moveSpeed: number;
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.moveSpeed = BALANCE.player.moveSpeed;
    this.setOrigin(0.5, 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 60);
    body.setOffset(10, 12);
    body.setCollideWorldBounds(true);

    // Drop shadow for depth
    this.shadow = scene.add.ellipse(x, y + 3, 34, 12, 0x000000, 0.3);
  }

  handleInput(input: InputState, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Movement — 8-directional like a belt-scroller
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= this.moveSpeed;
    if (input.right) vx += this.moveSpeed;
    if (input.up) vy -= this.moveSpeed * 0.7;
    if (input.down) vy += this.moveSpeed * 0.7;
    body.setVelocity(vx, vy);

    // Clamp to walkable zone
    if (this.y < WALK_MIN_Y) this.y = WALK_MIN_Y;
    if (this.y > WALK_MAX_Y) this.y = WALK_MAX_Y;
    if (this.x < 26) this.x = 26;
    if (this.x > GAME_WIDTH - 26) this.x = GAME_WIDTH - 26;

    // Facing direction
    if (vx > 0) { this.facingRight = true; this.setFlipX(false); }
    if (vx < 0) { this.facingRight = false; this.setFlipX(true); }

    // Depth sort: closer to camera (higher Y) = higher depth
    this.setDepth(this.y);
    this.shadow.setDepth(this.y - 1);

    // Kick cooldown
    if (this.kickCooldown > 0) this.kickCooldown -= delta;

    // Charge tracking
    if (input.kick) {
      this.chargeLevel = Math.min(1, input.kickHeldMs / BALANCE.player.chargeTimeMs);
    }

    // Kick on press
    if (input.kickJustPressed && this.kickCooldown <= 0) {
      this.performKick();
    }

    // Animation
    if (this.isKicking) {
      // Held by kick anim timeout
    } else if (vx !== 0 || vy !== 0) {
      this.play('player-walk', true);
    } else {
      this.play('player-idle', true);
    }

    // Update shadow position
    this.shadow.setPosition(this.x, this.y + 3);
  }

  performKick(): void {
    this.isKicking = true;
    this.kickCooldown = BALANCE.player.kickCooldownMs;
    this.play('player-kick');

    // Create temporary hitbox in front of player
    const hbX = this.facingRight ? this.x + 30 : this.x - 30;
    this.kickHitbox = this.scene.add.rectangle(hbX, this.y - 28, 36, 36);
    this.scene.physics.add.existing(this.kickHitbox, false);

    // End kick after short duration
    this.scene.time.delayedCall(180, () => {
      this.isKicking = false;
      if (this.kickHitbox) {
        this.kickHitbox.destroy();
        this.kickHitbox = null;
      }
    });
  }

  getKickHitbox(): Phaser.GameObjects.Rectangle | null {
    return this.kickHitbox;
  }

  isFacingRight(): boolean {
    return this.facingRight;
  }

  getChargeLevel(): number {
    return this.chargeLevel;
  }

  resetCharge(): void {
    this.chargeLevel = 0;
  }

  clampPosition(): void {
    if (this.x < 26) this.x = 26;
    if (this.x > GAME_WIDTH - 26) this.x = GAME_WIDTH - 26;
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
