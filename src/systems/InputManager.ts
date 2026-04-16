import Phaser from 'phaser';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  kick: boolean;
  kickJustPressed: boolean;
  kickHeldMs: number;
}

// Unified input: keyboard + touch. Create per-scene.
export class InputManager {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private kickHeldTime = 0;
  private kickWasDown = false;

  // Touch state (set by TouchControls DOM overlay)
  public touchLeft = false;
  public touchRight = false;
  public touchUp = false;
  public touchDown = false;
  public touchKick = false;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(delta: number): InputState {
    const left = this.cursors.left.isDown || this.wasd.A.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || this.touchRight;
    const up = this.cursors.up.isDown || this.wasd.W.isDown || this.touchUp;
    const down = this.cursors.down.isDown || this.wasd.S.isDown || this.touchDown;
    const kick = this.spaceKey.isDown || this.touchKick;

    const kickJustPressed = kick && !this.kickWasDown;

    if (kick) {
      this.kickHeldTime += delta;
    } else {
      this.kickHeldTime = 0;
    }

    this.kickWasDown = kick;

    return { left, right, up, down, kick, kickJustPressed, kickHeldMs: this.kickHeldTime };
  }
}
