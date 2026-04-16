import Phaser from 'phaser';
import { PALETTE } from '../config/Palette';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

// Generates all game textures programmatically with chunky 16-bit pixel art style.
// Sprites are drawn at actual pixel scale — big, bold, readable silhouettes like Double Dragon.

export class SpriteFactory {
  static generateAll(scene: Phaser.Scene): void {
    this.generatePlayer(scene);
    this.generatePayslip(scene);
    this.generatePayslipMissing(scene);
    this.generatePortal(scene);
    this.generateBoss(scene);
    this.generateTemptation(scene);
    this.generateGiantCoin(scene);
    this.generateCrashBlock(scene);
    this.generatePressureWall(scene);
    this.generateRecoverySurge(scene);
    this.generateSuperVault(scene);
    this.generateMarketDebris(scene);
    this.generateSellNowSign(scene);
    this.generateDividendCoin(scene);
    this.generateFeeLeeech(scene);
    this.generateStayCourse(scene);
    this.generatePipe(scene);
    this.generateLeak(scene);
    this.generateFeeAdmin(scene);
    this.generateFeeInvestment(scene);
    this.generateFeeSpecialServices(scene);
    this.generateFeePerformance(scene);
    this.generateDoor(scene);
    this.generateDoorOpen(scene);
    this.generateDoorCracked(scene);
    this.generateDoorLocked(scene);
    this.generateRewardPension(scene);
    this.generateRewardJoys(scene);
    this.generateRewardFamily(scene);
    this.generateRewardHealth(scene);
    this.generateRewardHolidays(scene);
    this.generateRewardHome(scene);
    this.generateRewardTravel(scene);
    this.generateParticle(scene);
    this.generateStarburst(scene);
    this.generateSuperParticle(scene);
    this.generateBackgrounds(scene);
    this.generateGround(scene);
    this.generateKickEffect(scene);
  }

  // Helper: draw a pixel grid from a string template
  // Each character maps to a color. '.' = transparent.
  private static drawPixelArt(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    pixelSize: number,
    rows: string[],
    palette: Record<string, string>
  ): void {
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const ch = rows[y][x];
        if (ch === '.' || !palette[ch]) continue;
        ctx.fillStyle = palette[ch];
        ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  // 48x72 player character — chunky Double Dragon proportions
  // 4 frames: idle, walk1, walk2, kick
  static generatePlayer(scene: Phaser.Scene): void {
    const W = 48, H = 72;
    const totalW = W * 4;
    const canvas = scene.textures.createCanvas('player', totalW, H);
    if (!canvas) return;
    const ctx = canvas.context;
    const P = 3; // pixel size — each "pixel" is 3x3 real pixels

    const pal: Record<string, string> = {
      'O': PALETTE.player.outline,
      'S': PALETTE.player.skin,
      'H': PALETTE.player.hair,
      'B': PALETTE.player.shirt,
      'b': '#a01870', // darker shirt
      'P': PALETTE.player.pants,
      'p': '#3a0042', // darker pants
      'K': PALETTE.player.shoes,
      'E': '#ffffff', // eyes white
      'e': '#1a1a2a', // eyes pupil
      'L': PALETTE.player.belt,
      'W': PALETTE.player.skin,
    };

    // IDLE frame (16x24 in pixel-grid, drawn at 2x = 32x48)
    const idle = [
      '....OOOO........',
      '...OHHHHO.......',
      '...OHHHHO.......',
      '..OOSSSOO.......',
      '..OSEeSEeO......',
      '..OSSSSSO.......',
      '..OSSMSSSO......',
      '...OSSSO........',
      '..OOBBBBO.......',
      '.OWOBBBBObO.....',
      '.OWOBBBBObO.....',
      '.OWOBBBBObO.....',
      '..OOBBBBO.......',
      '..OOLLLOO.......',
      '..OOPPPOO.......',
      '..OOPPPOO.......',
      '..OPPOPPO.......',
      '..OPPOPPO.......',
      '..OPPOPPO.......',
      '..OPPOPPO.......',
      '..OKKOKKO.......',
      '..OKKOKKO.......',
      '.OOKKOKKO.......',
      '.OKKKOKKO.......',
    ];

    // WALK1 — left leg forward
    const walk1 = [
      '....OOOO........',
      '...OHHHHO.......',
      '...OHHHHO.......',
      '..OOSSSOO.......',
      '..OSEeSEeO......',
      '..OSSSSSO.......',
      '..OSSMSSSO......',
      '...OSSSO........',
      '..OOBBBBO.......',
      '.OWOBBBBObO.....',
      '.OWOBBBBObO.....',
      '..WOBBBBOb......',
      '..OOBBBBO.......',
      '..OOLLLOO.......',
      '..OOPPPOO.......',
      '...OPPPOO.......',
      '..OPPOPPO.......',
      '.OPP..OPPO......',
      '.OPP...PPO......',
      'OPP....OPPO.....',
      'OKK....OKKO.....',
      'OKKK...OKKO.....',
      '.OOO...OKKO.....',
      '........OOO.....',
    ];

    // WALK2 — right leg forward
    const walk2 = [
      '....OOOO........',
      '...OHHHHO.......',
      '...OHHHHO.......',
      '..OOSSSOO.......',
      '..OSEeSEeO......',
      '..OSSSSSO.......',
      '..OSSMSSSO......',
      '...OSSSO........',
      '..OOBBBBO.......',
      '.OWOBBBBObO.....',
      '.OWOBBBBObO.....',
      '..WOBBBBOb......',
      '..OOBBBBO.......',
      '..OOLLLOO.......',
      '..OOPPPOO.......',
      '..OOPPPOO.......',
      '..OPPOPPO.......',
      '...OPP.OPP......',
      '...PP...PP......',
      '..OPPO..OPPO....',
      '..OKKO..OKKO....',
      '..OKKO..OKKKO...',
      '..OKKO...OOO....',
      '...OOO..........',
    ];

    // KICK — roundhouse kick extended right
    const kick = [
      '....OOOO........',
      '...OHHHHO.......',
      '...OHHHHO.......',
      '..OOSSSOO.......',
      '..OSEeSEeO......',
      '..OSSSSSO.......',
      '..OSSMSSSO......',
      '...OSSSO........',
      '.OOOBBBBO.......',
      'OWWOBBBBO.......',
      'OWWOBBBBO.......',
      '.OOOBBBBOO......',
      '..OOBBBBO.......',
      '..OOLLLOO.......',
      '..OOPPPPPPPOO...',
      '..OOPPPPPPPPPOO.',
      '..OPPOOOOOPPPPOO',
      '..OPP.....OKKKO.',
      '..OPP......OKKO.',
      '..OPPO......OOO.',
      '..OKKO..........',
      '.OKKKO..........',
      '.OKKKO..........',
      '..OOO...........',
    ];

    const frames = [idle, walk1, walk2, kick];
    frames.forEach((frame, i) => {
      this.drawPixelArt(ctx, i * W, 0, P, frame, pal);
    });

    canvas.refresh();

    // Register frames
    for (let i = 0; i < 4; i++) {
      scene.textures.get('player').add(i, 0, i * W, 0, W, H);
    }
  }

  // Payslip — paper document
  static generatePayslip(scene: Phaser.Scene): void {
    const w = 24, h = 18;
    const canvas = scene.textures.createCanvas('payslip', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Paper
    ctx.fillStyle = '#f0e8d0';
    ctx.fillRect(0, 0, w, h);
    // Border
    ctx.fillStyle = '#8a7a60';
    ctx.fillRect(0, 0, w, 1); ctx.fillRect(0, h-1, w, 1);
    ctx.fillRect(0, 0, 1, h); ctx.fillRect(w-1, 0, 1, h);
    // Text lines
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(3, 3, 12, 2);
    ctx.fillRect(3, 7, 10, 1);
    ctx.fillRect(3, 10, 14, 1);
    ctx.fillRect(3, 13, 8, 1);
    // Checkmark
    ctx.fillStyle = '#40c040';
    ctx.fillRect(18, 11, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19, 13, 1, 1);
    ctx.fillRect(20, 14, 1, 1);
    ctx.fillRect(21, 13, 1, 1);
    canvas.refresh();
  }

  static generatePayslipMissing(scene: Phaser.Scene): void {
    const w = 24, h = 18;
    const canvas = scene.textures.createCanvas('payslip-missing', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Paper
    ctx.fillStyle = '#f0e0d0';
    ctx.fillRect(0, 0, w, h);
    // Red border (warning)
    ctx.fillStyle = '#e04040';
    ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h-2, w, 2);
    ctx.fillRect(0, 0, 2, h); ctx.fillRect(w-2, 0, 2, h);
    // Text lines
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(3, 4, 12, 2);
    ctx.fillRect(3, 8, 10, 1);
    ctx.fillRect(3, 11, 14, 1);
    // Red X
    ctx.fillStyle = '#e04040';
    ctx.fillRect(17, 10, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 11, 1, 1); ctx.fillRect(20, 11, 1, 1);
    ctx.fillRect(19, 12, 1, 1);
    ctx.fillRect(18, 13, 1, 1); ctx.fillRect(20, 13, 1, 1);
    canvas.refresh();
  }

  static generatePortal(scene: Phaser.Scene): void {
    const w = 40, h = 56;
    const canvas = scene.textures.createCanvas('portal', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Outer frame — metallic
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(0, 0, w, h);
    // Inner frame
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(3, 3, w-6, h-6);
    // Screen glow
    ctx.fillStyle = '#2060a0';
    ctx.fillRect(5, 5, w-10, h-10);
    // Screen scanlines
    ctx.fillStyle = '#1850a0';
    for (let y = 7; y < h - 5; y += 3) {
      ctx.fillRect(5, y, w - 10, 1);
    }
    // Center icon — gear/cog
    ctx.fillStyle = '#80c0e0';
    ctx.fillRect(14, 20, 12, 12);
    ctx.fillRect(12, 22, 16, 8);
    ctx.fillRect(16, 18, 8, 16);
    ctx.fillStyle = '#2060a0';
    ctx.fillRect(17, 23, 6, 6);
    // Top label area
    ctx.fillStyle = '#80c0e0';
    ctx.fillRect(10, 7, 20, 6);
    ctx.fillStyle = '#2060a0';
    ctx.fillRect(12, 9, 16, 2);
    // Bottom slots
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(8, h - 10, 8, 4);
    ctx.fillRect(w - 16, h - 10, 8, 4);
    canvas.refresh();
  }

  // Boss character — 48x72 sprite like the player, but in a suit
  // Stands at the right side of Act 1 — you kick payslips back to them
  static generateBoss(scene: Phaser.Scene): void {
    const W = 48, H = 72;
    const canvas = scene.textures.createCanvas('boss', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    const P = 3;

    const pal: Record<string, string> = {
      'O': '#1a1a2a',    // outline
      'S': '#d8a860',    // skin
      'H': '#2a2a3a',    // hair (dark, slicked)
      'T': '#3a3a4a',    // suit jacket
      't': '#2a2a3a',    // suit dark
      'W': '#e0d8d0',    // shirt white
      'N': '#a02020',    // tie red
      'P': '#3a3a4a',    // pants
      'p': '#2a2a3a',    // pants dark
      'K': '#1a1a1a',    // shoes
      'E': '#ffffff',    // eyes white
      'e': '#1a1a2a',    // eyes pupil
      'G': '#8a8070',    // glasses
      'B': '#4a4040',    // belt
    };

    const boss = [
      '....OOOO........',
      '...OHHHHO.......',
      '..OHHHHHHO......',
      '..OHHHHHHO......',
      '..OSSESSES......',
      '..OSSeeSSeO.....',
      '..OSSSSSSO......',
      '..OOSSSOO.......',
      '...OSSSO........',
      '...OOOOO........',
      '..OTWWWTO.......',
      '.OTTWNNTO.......',
      '.OTTWNNTO.......',
      'OOTTWNNTOO......',
      'OSOTTTTTOS......',
      'OSOTTTTTOS......',
      'OS.OTTTTO.S.....',
      'OS.OTBBTO.S.....',
      '.S.OPPPO..S.....',
      '...OPPPO........',
      '...OPPPO........',
      '...OPpPO........',
      '..OO.P.OO.......',
      '..OK...KO.......',
    ];

    this.drawPixelArt(ctx, 0, 0, P, boss, pal);
    canvas.refresh();
  }

  static generateTemptation(scene: Phaser.Scene): void {
    // Generate multiple lifestyle temptation sprites
    this.generateTemptationItem(scene, 'tempt-sneakers', {
      'O': '#1a1a2a', 'W': '#ffffff', 'R': '#e04060', 'r': '#c03050', 'G': '#c0c0c0', 'B': '#4080e0',
    }, [
      '...............',
      '...............',
      '...............',
      '...............',
      '....OOOOOOO....',
      '...OWWWWWWWO...',
      '..OWWRRRWWWWO..',
      '.OWWWRRRWWWWWO.',
      '.OWWWWWWWWWWWO.',
      'OWWBBBWWWWWWWWO',
      'OWBBBBBWWWWWWWO',
      'OWWWWWWWWWWWWWO',
      '.OGGGGGGGGGGGO.',
      '.OGGGOGGGOGGO..',
      '..OOOO...OOOO..',
      '...............',
    ]);
    this.generateTemptationItem(scene, 'tempt-skateboard', {
      'O': '#1a1a2a', 'W': '#d04030', 'Y': '#f0c040', 'G': '#808080', 'g': '#505050',
    }, [
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...OOOOOOOOO...',
      '..OWWWWWWWWWO..',
      '.OWWYWYWYWWWWO.',
      '.OWWWWWWWWWWWO.',
      'OWWWWWWWWWWWWWO',
      '.OOOOOOOOOOOOO.',
      '..OGgO...OGgO..',
      '..OOOO...OOOO..',
      '...............',
      '...............',
    ]);
    this.generateTemptationItem(scene, 'tempt-tv', {
      'O': '#1a1a2a', 'D': '#2a2a3a', 'S': '#4080e0', 's': '#3060a0', 'G': '#808080', 'W': '#ffffff',
    }, [
      '...............',
      '.OOOOOOOOOOOOO.',
      '.ODDDDDDDDDDDO.',
      '.ODSSSSSSSSsDO.',
      '.ODSSSSSSSSsDO.',
      '.ODSSSWSSSSsDO.',
      '.ODSSSSSSSSsDO.',
      '.ODSSSSSSSSsDO.',
      '.ODSSSSSSSssDO.',
      '.ODsssssssssDO.',
      '.ODDDDDDDDDDDO.',
      '.OOOOOOOOOOOOO.',
      '....OGGGGGO....',
      '...OGGGGGGO....',
      '...OOOOOOOO....',
      '...............',
    ]);
    this.generateTemptationItem(scene, 'tempt-phone', {
      'O': '#1a1a2a', 'D': '#2a2a3a', 'S': '#40c0e0', 's': '#3090a0', 'G': '#808080', 'W': '#ffffff',
    }, [
      '...............',
      '...............',
      '....OOOOOOO....',
      '....ODDDDDO....',
      '....ODSSEDO....',
      '....ODSSEDO....',
      '....ODSSEDO....',
      '....ODSSEDO....',
      '....ODSSEDO....',
      '....ODSSEDO....',
      '....ODDDDDO....',
      '....ODOODO.....',
      '....OOOOOOO....',
      '...............',
      '...............',
      '...............',
    ]);
    this.generateTemptationItem(scene, 'tempt-headphones', {
      'O': '#1a1a2a', 'D': '#3a3a4a', 'G': '#808080', 'R': '#e04060', 'W': '#c0c0c0',
    }, [
      '...............',
      '....OOOOOOO....',
      '...OD.....DO...',
      '..OD.......DO..',
      '..OD.......DO..',
      '.OD.........DO.',
      '.OD.........DO.',
      'ORRRO.....ORRRO',
      'ORRRO.....ORRRO',
      'ORRRO.....ORRRO',
      'ORRRO.....ORRRO',
      '.OOO.......OOO.',
      '...............',
      '...............',
      '...............',
      '...............',
    ]);
    this.generateTemptationItem(scene, 'tempt-gaming', {
      'O': '#1a1a2a', 'D': '#2a2a3a', 'G': '#505050', 'B': '#4040c0', 'R': '#c04040', 'Y': '#40c040', 'P': '#c040c0',
    }, [
      '...............',
      '...............',
      '...............',
      '...OOOOOOOOO...',
      '..ODDDDDDDDO..',
      '.ODDGDDDDGDDO..',
      '.ODGGGDDGGGDO..',
      'ODDGDDDDDDGDDO',
      'ODDDDOBRDDDDDDO',
      'ODDDDYPDDDDDO.',
      '.ODDDDDDDDDDO.',
      '..ODDDDDDDDDO..',
      '...OOOOOOOOO...',
      '...............',
      '...............',
      '...............',
    ]);
  }

  private static generateTemptationItem(
    scene: Phaser.Scene, key: string,
    pal: Record<string, string>, art: string[]
  ): void {
    const w = 24, h = 24;
    const canvas = scene.textures.createCanvas(key, w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Scale pixel art to fit 24x24 (art is ~15 wide, use 1.5px per pixel)
    this.drawPixelArt(ctx, 0, 0, 1.5, art, pal);
    canvas.refresh();
  }

  static generateGiantCoin(scene: Phaser.Scene): void {
    const w = 24, h = 24;
    const canvas = scene.textures.createCanvas('giant-coin', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Coin body — circle approximation
    ctx.fillStyle = '#d0a020';
    ctx.fillRect(6, 0, 12, 24);
    ctx.fillRect(4, 2, 16, 20);
    ctx.fillRect(2, 4, 20, 16);
    ctx.fillRect(0, 6, 24, 12);
    // Inner ring
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(6, 2, 12, 20);
    ctx.fillRect(4, 4, 16, 16);
    ctx.fillRect(2, 6, 20, 12);
    // Highlight
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(6, 3, 6, 3);
    ctx.fillRect(4, 5, 4, 4);
    // $ sign
    ctx.fillStyle = '#906010';
    ctx.fillRect(10, 6, 4, 2);  // top
    ctx.fillRect(9, 7, 3, 3);   // left curve
    ctx.fillRect(10, 10, 4, 2); // middle
    ctx.fillRect(12, 12, 3, 3); // right curve
    ctx.fillRect(10, 14, 4, 2); // bottom
    ctx.fillRect(11, 5, 2, 13); // vertical line
    canvas.refresh();
  }

  static generateCrashBlock(scene: Phaser.Scene): void {
    const w = 36, h = 36;
    const canvas = scene.textures.createCanvas('crash-block', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Chunky red/orange block with cracks
    ctx.fillStyle = '#c02020';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e06020';
    ctx.fillRect(2, 2, w-4, h-4);
    // Diagonal cracks
    ctx.fillStyle = '#c02020';
    for (let i = 0; i < 28; i++) {
      ctx.fillRect(4 + i, 4 + i * 0.8, 2, 2);
      ctx.fillRect(28 - i, 6 + i * 0.8, 2, 2);
    }
    // Down arrow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 8, 6, 14);
    ctx.fillRect(12, 18, 12, 3);
    ctx.fillRect(15, 21, 6, 3);
    // Outline
    ctx.fillStyle = '#801010';
    ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h-2, w, 2);
    ctx.fillRect(0, 0, 2, h); ctx.fillRect(w-2, 0, 2, h);
    canvas.refresh();
  }

  static generatePressureWall(scene: Phaser.Scene): void {
    const w = 24, h = 56;
    const canvas = scene.textures.createCanvas('pressure-wall', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Brick wall
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(0, 0, w, h);
    // Bricks
    ctx.fillStyle = '#a08010';
    for (let y = 0; y < h; y += 8) {
      ctx.fillRect(0, y, w, 1);
      const off = (Math.floor(y / 8) % 2) * 12;
      ctx.fillRect(off, y, 1, 8);
      ctx.fillRect(off + 12, y, 1, 8);
    }
    // Arrow pointing left
    ctx.fillStyle = '#e04020';
    ctx.fillRect(4, 22, 14, 6);
    ctx.fillRect(2, 24, 4, 6);
    ctx.fillRect(0, 26, 4, 2);
    // Border
    ctx.fillStyle = '#806010';
    ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h-2, w, 2);
    canvas.refresh();
  }

  static generateRecoverySurge(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('recovery-surge', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Green burst
    ctx.fillStyle = '#20a050';
    ctx.fillRect(8, 0, 16, 32);
    ctx.fillRect(0, 8, 32, 16);
    ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = '#40e070';
    ctx.fillRect(10, 2, 12, 28);
    ctx.fillRect(2, 10, 28, 12);
    ctx.fillRect(6, 6, 20, 20);
    // Up arrow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 6, 6, 16);
    ctx.fillRect(10, 12, 12, 3);
    ctx.fillRect(13, 9, 6, 3);
    canvas.refresh();
  }

  // ── Act 3 Storm Shelter sprites ──

  static generateSuperVault(scene: Phaser.Scene): void {
    const w = 40, h = 36;
    const canvas = scene.textures.createCanvas('super-vault', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Golden safe body
    ctx.fillStyle = '#b09020';
    ctx.fillRect(2, 6, 36, 28);
    ctx.fillStyle = '#d0b040';
    ctx.fillRect(4, 8, 32, 24);
    // Lid / top
    ctx.fillStyle = '#c0a030';
    ctx.fillRect(0, 4, 40, 6);
    // Lock circle
    ctx.fillStyle = '#806010';
    ctx.fillRect(16, 16, 8, 8);
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(18, 18, 4, 4);
    // Keyhole
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(19, 19, 2, 2);
    // Handle
    ctx.fillStyle = '#e0c050';
    ctx.fillRect(28, 18, 6, 3);
    // $ symbol on front
    ctx.fillStyle = '#f0e080';
    ctx.fillRect(8, 14, 2, 10);
    ctx.fillRect(6, 16, 6, 2);
    ctx.fillRect(6, 20, 6, 2);
    ctx.fillRect(6, 14, 4, 2);
    ctx.fillRect(8, 22, 4, 2);
    // Bottom/base
    ctx.fillStyle = '#806010';
    ctx.fillRect(2, 32, 36, 4);
    // Outline
    ctx.fillStyle = '#4a3008';
    ctx.fillRect(0, 4, 40, 2); ctx.fillRect(0, 34, 40, 2);
    ctx.fillRect(0, 4, 2, 32); ctx.fillRect(38, 4, 2, 32);
    canvas.refresh();
  }

  static generateMarketDebris(scene: Phaser.Scene): void {
    // 3 variants of red/orange crash chunks
    for (let v = 0; v < 3; v++) {
      const w = 18, h = 18;
      const canvas = scene.textures.createCanvas(`market-debris-${v}`, w, h);
      if (!canvas) continue;
      const ctx = canvas.context;
      const colors = ['#c02020', '#e04020', '#a01818'];
      const inner = ['#e06030', '#f08040', '#c03020'];
      ctx.fillStyle = colors[v];
      // Different shapes per variant
      if (v === 0) { // chunky square
        ctx.fillRect(2, 2, 14, 14);
        ctx.fillStyle = inner[v];
        ctx.fillRect(4, 4, 10, 10);
        // crack
        ctx.fillStyle = colors[v];
        ctx.fillRect(6, 4, 2, 10);
      } else if (v === 1) { // diamond-ish
        ctx.fillRect(6, 0, 6, 18);
        ctx.fillRect(2, 4, 14, 10);
        ctx.fillStyle = inner[v];
        ctx.fillRect(6, 2, 6, 14);
        ctx.fillRect(4, 6, 10, 6);
      } else { // jagged
        ctx.fillRect(0, 4, 16, 10);
        ctx.fillRect(4, 0, 10, 18);
        ctx.fillStyle = inner[v];
        ctx.fillRect(2, 6, 12, 6);
        ctx.fillRect(6, 2, 6, 14);
      }
      // Down arrow
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 5, 4, 6);
      ctx.fillRect(6, 9, 6, 2);
      canvas.refresh();
    }
  }

  static generateSellNowSign(scene: Phaser.Scene): void {
    const w = 32, h = 24;
    const canvas = scene.textures.createCanvas('sell-now-sign', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Red sign background
    ctx.fillStyle = '#e02020';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(2, 2, w - 4, h - 4);
    // Border flash (yellow to look tempting)
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, h - 2, w, 2);
    ctx.fillRect(0, 0, 2, h); ctx.fillRect(w - 2, 0, 2, h);
    // "SELL" text approximation (pixel blocks)
    ctx.fillStyle = '#ffffff';
    // S
    ctx.fillRect(4, 6, 4, 2); ctx.fillRect(4, 6, 2, 4);
    ctx.fillRect(4, 10, 4, 2); ctx.fillRect(6, 10, 2, 4);
    ctx.fillRect(4, 14, 4, 2);
    // E
    ctx.fillRect(10, 6, 4, 2); ctx.fillRect(10, 6, 2, 10);
    ctx.fillRect(10, 10, 3, 2); ctx.fillRect(10, 14, 4, 2);
    // L
    ctx.fillRect(16, 6, 2, 10); ctx.fillRect(16, 14, 4, 2);
    // L
    ctx.fillRect(22, 6, 2, 10); ctx.fillRect(22, 14, 4, 2);
    // Exclamation mark
    ctx.fillRect(28, 6, 2, 6); ctx.fillRect(28, 14, 2, 2);
    canvas.refresh();
  }

  static generateDividendCoin(scene: Phaser.Scene): void {
    const w = 14, h = 14;
    const canvas = scene.textures.createCanvas('dividend-coin', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Green coin
    ctx.fillStyle = '#20a050';
    ctx.fillRect(4, 0, 6, 14);
    ctx.fillRect(2, 2, 10, 10);
    ctx.fillRect(0, 4, 14, 6);
    ctx.fillStyle = '#40e070';
    ctx.fillRect(4, 2, 6, 10);
    ctx.fillRect(2, 4, 10, 6);
    // + symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 2, 6);
    ctx.fillRect(4, 6, 6, 2);
    canvas.refresh();
  }

  static generateFeeLeeech(scene: Phaser.Scene): void {
    const w = 14, h = 14;
    const canvas = scene.textures.createCanvas('fee-leech', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Red coin (looks similar to dividend but red)
    ctx.fillStyle = '#a02020';
    ctx.fillRect(4, 0, 6, 14);
    ctx.fillRect(2, 2, 10, 10);
    ctx.fillRect(0, 4, 14, 6);
    ctx.fillStyle = '#e04040';
    ctx.fillRect(4, 2, 6, 10);
    ctx.fillRect(2, 4, 10, 6);
    // - symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 6, 6, 2);
    canvas.refresh();
  }

  static generateStayCourse(scene: Phaser.Scene): void {
    const w = 24, h = 24;
    const canvas = scene.textures.createCanvas('stay-course', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Blue/gold shield shape
    ctx.fillStyle = '#2060c0';
    ctx.fillRect(4, 0, 16, 20);
    ctx.fillRect(2, 2, 20, 16);
    ctx.fillRect(6, 18, 12, 4);
    ctx.fillRect(8, 22, 8, 2);
    // Gold inner
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(6, 2, 12, 16);
    ctx.fillRect(4, 4, 16, 12);
    ctx.fillRect(8, 18, 8, 2);
    // Star in center
    ctx.fillStyle = '#2060c0';
    ctx.fillRect(10, 6, 4, 10);
    ctx.fillRect(6, 8, 12, 4);
    ctx.fillRect(8, 7, 2, 2);
    ctx.fillRect(14, 7, 2, 2);
    ctx.fillRect(8, 13, 2, 2);
    ctx.fillRect(14, 13, 2, 2);
    canvas.refresh();
  }

  static generatePipe(scene: Phaser.Scene): void {
    const w = 20, h = 56;
    const canvas = scene.textures.createCanvas('pipe', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Pipe body
    ctx.fillStyle = '#5a6a6a';
    ctx.fillRect(0, 0, w, h);
    // Highlight
    ctx.fillStyle = '#7a8a8a';
    ctx.fillRect(3, 0, 5, h);
    // Shadow
    ctx.fillStyle = '#3a4a4a';
    ctx.fillRect(w-4, 0, 4, h);
    // Joints/flanges
    ctx.fillStyle = '#6a5030';
    ctx.fillRect(-1, 0, w+2, 4);
    ctx.fillRect(-1, h-4, w+2, 4);
    ctx.fillRect(-1, h/2 - 2, w+2, 4);
    // Rivets
    ctx.fillStyle = '#8a7050';
    ctx.fillRect(3, 1, 2, 2); ctx.fillRect(w-5, 1, 2, 2);
    ctx.fillRect(3, h-3, 2, 2); ctx.fillRect(w-5, h-3, 2, 2);
    canvas.refresh();
  }

  static generateLeak(scene: Phaser.Scene): void {
    const w = 14, h = 18;
    const canvas = scene.textures.createCanvas('leak', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Spray shape
    ctx.fillStyle = '#40e060';
    ctx.fillRect(5, 0, 4, 4);
    ctx.fillRect(3, 3, 8, 5);
    ctx.fillRect(2, 6, 10, 5);
    ctx.fillRect(1, 9, 12, 5);
    ctx.fillRect(0, 12, 14, 6);
    // Highlights
    ctx.fillStyle = '#80ff90';
    ctx.fillRect(6, 1, 2, 2);
    ctx.fillRect(4, 5, 2, 3);
    // Drops
    ctx.fillStyle = '#20a040';
    ctx.fillRect(3, 15, 2, 3);
    ctx.fillRect(9, 14, 2, 4);
    canvas.refresh();
  }

  // ── ACT 4 FEE SPRITES ──

  /** Admin Fee — small grey clipboard/paper */
  static generateFeeAdmin(scene: Phaser.Scene): void {
    const w = 18, h = 18;
    const canvas = scene.textures.createCanvas('fee-admin', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Outline
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(2, 0, 14, 18);
    ctx.fillRect(0, 2, 18, 14);
    // Paper body
    ctx.fillStyle = '#8a9aaa';
    ctx.fillRect(3, 1, 12, 16);
    ctx.fillRect(1, 3, 16, 12);
    // Paper highlight
    ctx.fillStyle = '#aabac0';
    ctx.fillRect(4, 2, 10, 14);
    ctx.fillRect(2, 4, 14, 10);
    // Clip at top
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(6, 0, 6, 3);
    ctx.fillRect(7, 1, 4, 3);
    // Text lines
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(3, 6, 12, 1);
    ctx.fillRect(3, 9, 12, 1);
    ctx.fillRect(3, 12, 8, 1);
    // $ corner
    ctx.fillStyle = '#e04040';
    ctx.fillRect(13, 12, 3, 4);
    canvas.refresh();
  }

  /** Investment Fee — medium purple briefcase */
  static generateFeeInvestment(scene: Phaser.Scene): void {
    const w = 22, h = 20;
    const canvas = scene.textures.createCanvas('fee-investment', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Outline
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(1, 4, 20, 16);
    ctx.fillRect(0, 6, 22, 12);
    // Briefcase body
    ctx.fillStyle = '#8040c0';
    ctx.fillRect(2, 5, 18, 14);
    // Body highlight
    ctx.fillStyle = '#a060e0';
    ctx.fillRect(3, 6, 16, 4);
    // Body shadow
    ctx.fillStyle = '#5020a0';
    ctx.fillRect(3, 15, 16, 4);
    // Handle
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(7, 2, 8, 2);
    ctx.fillRect(6, 3, 2, 3);
    ctx.fillRect(14, 3, 2, 3);
    // Latch
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(10, 10, 2, 2);
    // Divider line
    ctx.fillStyle = '#5020a0';
    ctx.fillRect(2, 12, 18, 1);
    canvas.refresh();
  }

  /** Special Services Fee — mysterious red envelope with "?" */
  static generateFeeSpecialServices(scene: Phaser.Scene): void {
    const w = 26, h = 24;
    const canvas = scene.textures.createCanvas('fee-special-services', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Outline
    ctx.fillStyle = '#2a0a0a';
    ctx.fillRect(1, 2, 24, 20);
    ctx.fillRect(0, 4, 26, 16);
    // Envelope body
    ctx.fillStyle = '#e04040';
    ctx.fillRect(2, 3, 22, 18);
    // Highlight
    ctx.fillStyle = '#ff6060';
    ctx.fillRect(3, 4, 20, 3);
    // Shadow
    ctx.fillStyle = '#a02020';
    ctx.fillRect(3, 17, 20, 4);
    // Envelope flap triangle
    ctx.fillStyle = '#a02020';
    ctx.fillRect(2, 3, 22, 2);
    ctx.fillRect(4, 5, 18, 2);
    ctx.fillRect(6, 7, 14, 2);
    ctx.fillRect(8, 9, 10, 2);
    ctx.fillRect(10, 11, 6, 1);
    // Flap highlight
    ctx.fillStyle = '#c03030';
    ctx.fillRect(3, 3, 20, 1);
    ctx.fillRect(5, 5, 16, 1);
    // Big "?" mark in yellow (ambiguity)
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(11, 12, 4, 2);
    ctx.fillRect(14, 13, 2, 2);
    ctx.fillRect(13, 14, 2, 2);
    ctx.fillRect(12, 15, 2, 2);
    ctx.fillRect(12, 18, 2, 2);
    // "?" outline
    ctx.fillStyle = '#2a0a0a';
    ctx.fillRect(10, 11, 6, 1);
    canvas.refresh();
  }

  /** Performance Fee — gold star with sparkle */
  static generateFeePerformance(scene: Phaser.Scene): void {
    const w = 22, h = 22;
    const canvas = scene.textures.createCanvas('fee-performance', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Star outline
    ctx.fillStyle = '#6a4a00';
    ctx.fillRect(9, 1, 4, 3);
    ctx.fillRect(7, 4, 8, 3);
    ctx.fillRect(1, 7, 20, 4);
    ctx.fillRect(3, 11, 16, 3);
    ctx.fillRect(5, 14, 4, 4);
    ctx.fillRect(13, 14, 4, 4);
    ctx.fillRect(3, 17, 3, 4);
    ctx.fillRect(16, 17, 3, 4);
    // Star body
    ctx.fillStyle = '#f0d040';
    ctx.fillRect(10, 2, 2, 2);
    ctx.fillRect(8, 4, 6, 4);
    ctx.fillRect(2, 8, 18, 3);
    ctx.fillRect(4, 11, 14, 3);
    ctx.fillRect(6, 14, 3, 3);
    ctx.fillRect(13, 14, 3, 3);
    ctx.fillRect(4, 17, 2, 3);
    ctx.fillRect(16, 17, 2, 3);
    // Star highlight
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(9, 5, 4, 2);
    ctx.fillRect(4, 9, 4, 1);
    ctx.fillRect(10, 9, 2, 1);
    // Sparkles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(20, 1, 1, 1);
    ctx.fillRect(19, 5, 1, 1);
    canvas.refresh();
  }

  static generateDoor(scene: Phaser.Scene): void {
    const w = 32, h = 52;
    const canvas = scene.textures.createCanvas('door', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Frame
    ctx.fillStyle = '#6a5020';
    ctx.fillRect(0, 0, w, h);
    // Door body
    ctx.fillStyle = '#8a6030';
    ctx.fillRect(3, 3, w-6, h-6);
    // Panels
    ctx.fillStyle = '#a07040';
    ctx.fillRect(5, 5, w-10, 18);
    ctx.fillRect(5, 27, w-10, 18);
    // Panel insets
    ctx.fillStyle = '#7a5828';
    ctx.fillRect(6, 6, w-12, 1);
    ctx.fillRect(6, 22, w-12, 1);
    ctx.fillRect(6, 28, w-12, 1);
    ctx.fillRect(6, 44, w-12, 1);
    // Handle
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(w-9, 25, 4, 4);
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(w-8, 26, 2, 2);
    // Keyhole
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(w-8, 31, 2, 3);
    canvas.refresh();
  }

  static generateDoorOpen(scene: Phaser.Scene): void {
    const w = 32, h = 52;
    const canvas = scene.textures.createCanvas('door-open', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Frame
    ctx.fillStyle = '#6a5020';
    ctx.fillRect(0, 0, w, h);
    // Bright golden interior
    ctx.fillStyle = '#f0d860';
    ctx.fillRect(3, 3, w-6, h-6);
    // Glowing center
    ctx.fillStyle = '#fff8c0';
    ctx.fillRect(8, 8, w-16, h-16);
    // Rays
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(w/2-1, 3, 2, h-6);
    ctx.fillRect(3, h/2-1, w-6, 2);
    // Star sparkles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 14, 2, 2);
    ctx.fillRect(20, 20, 2, 2);
    ctx.fillRect(14, 36, 2, 2);
    canvas.refresh();
  }

  static generateDoorCracked(scene: Phaser.Scene): void {
    const w = 32, h = 52;
    const canvas = scene.textures.createCanvas('door-cracked', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Frame
    ctx.fillStyle = '#6a5020';
    ctx.fillRect(0, 0, w, h);
    // Door body — slightly open
    ctx.fillStyle = '#8a6030';
    ctx.fillRect(3, 3, w-10, h-6);
    // Crack of light on right side
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(w-8, 3, 5, h-6);
    // Light rays through crack
    ctx.fillStyle = '#e0c040';
    ctx.fillRect(w-10, 10, 2, 8);
    ctx.fillRect(w-10, 30, 2, 8);
    canvas.refresh();
  }

  static generateDoorLocked(scene: Phaser.Scene): void {
    const w = 32, h = 52;
    const canvas = scene.textures.createCanvas('door-locked', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Frame
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(0, 0, w, h);
    // Dark door
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(3, 3, w-6, h-6);
    // Chains/bars
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(5, 16, w-10, 3);
    ctx.fillRect(5, 32, w-10, 3);
    // X mark
    ctx.fillStyle = '#c03030';
    for (let i = 0; i < 16; i++) {
      ctx.fillRect(8 + i, 10 + i * 2, 3, 3);
      ctx.fillRect(22 - i, 10 + i * 2, 3, 3);
    }
    canvas.refresh();
  }

  // === ACT 5 REWARD SPRITES (32x32) ===
  // Each reward sprite represents a life choice unlocked by a door.

  static generateRewardPension(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-pension', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Safety-net card — navy background
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(3, 5, 26, 22);
    // Card border
    ctx.fillStyle = '#8090b0';
    ctx.fillRect(3, 5, 26, 2);
    ctx.fillRect(3, 25, 26, 2);
    ctx.fillRect(3, 5, 2, 22);
    ctx.fillRect(27, 5, 2, 22);
    // Gold seal / crest
    ctx.fillStyle = '#f0c040';
    ctx.fillRect(13, 10, 6, 6);
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(14, 11, 4, 4);
    ctx.fillStyle = '#a07010';
    ctx.fillRect(15, 12, 2, 2);
    // Text lines on card
    ctx.fillStyle = '#c0d0e0';
    ctx.fillRect(7, 19, 18, 1);
    ctx.fillRect(7, 21, 14, 1);
    ctx.fillRect(7, 23, 16, 1);
    canvas.refresh();
  }

  static generateRewardJoys(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-joys', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Flowerpot
    ctx.fillStyle = '#a05030';
    ctx.fillRect(11, 22, 10, 7);
    ctx.fillStyle = '#c06838';
    ctx.fillRect(11, 22, 10, 2);
    ctx.fillStyle = '#703818';
    ctx.fillRect(11, 28, 10, 1);
    // Stem
    ctx.fillStyle = '#40a040';
    ctx.fillRect(15, 14, 2, 8);
    // Leaves
    ctx.fillStyle = '#60c060';
    ctx.fillRect(12, 17, 3, 2);
    ctx.fillRect(17, 19, 3, 2);
    // Flower petals (pink)
    ctx.fillStyle = '#e070a0';
    ctx.fillRect(13, 8, 6, 2);
    ctx.fillRect(11, 10, 10, 4);
    ctx.fillRect(13, 14, 6, 1);
    // Highlight petals
    ctx.fillStyle = '#ff90c0';
    ctx.fillRect(14, 9, 4, 1);
    ctx.fillRect(12, 11, 3, 2);
    // Flower center
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(15, 11, 2, 2);
    canvas.refresh();
  }

  static generateRewardFamily(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-family', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Back heart (larger, behind)
    const drawHeart = (cx: number, cy: number, color: string, highlight: string) => {
      ctx.fillStyle = color;
      // Top lobes
      ctx.fillRect(cx - 6, cy - 5, 4, 4);
      ctx.fillRect(cx + 2, cy - 5, 4, 4);
      ctx.fillRect(cx - 7, cy - 4, 6, 5);
      ctx.fillRect(cx + 1, cy - 4, 6, 5);
      // Body
      ctx.fillRect(cx - 6, cy, 12, 3);
      ctx.fillRect(cx - 5, cy + 3, 10, 2);
      ctx.fillRect(cx - 3, cy + 5, 6, 2);
      ctx.fillRect(cx - 1, cy + 7, 2, 1);
      // Highlight
      ctx.fillStyle = highlight;
      ctx.fillRect(cx - 5, cy - 3, 2, 2);
      ctx.fillRect(cx - 6, cy - 2, 1, 1);
    };
    drawHeart(12, 14, '#a02040', '#e060a0');
    drawHeart(20, 18, '#e04060', '#ff80a0');
    canvas.refresh();
  }

  static generateRewardHealth(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-health', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Circle (approximate)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 6, 12, 20);
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillRect(6, 10, 20, 12);
    // Outline
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(10, 5, 12, 1);
    ctx.fillRect(10, 26, 12, 1);
    ctx.fillRect(5, 10, 1, 12);
    ctx.fillRect(26, 10, 1, 12);
    ctx.fillRect(7, 8, 1, 2);
    ctx.fillRect(24, 8, 1, 2);
    ctx.fillRect(7, 22, 1, 2);
    ctx.fillRect(24, 22, 1, 2);
    // Red cross
    ctx.fillStyle = '#e02030';
    ctx.fillRect(14, 10, 4, 12);
    ctx.fillRect(10, 14, 12, 4);
    // Cross highlight
    ctx.fillStyle = '#ff5060';
    ctx.fillRect(14, 10, 1, 12);
    ctx.fillRect(10, 14, 12, 1);
    canvas.refresh();
  }

  static generateRewardHolidays(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-holidays', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Sand
    ctx.fillStyle = '#f0d890';
    ctx.fillRect(0, 26, w, 6);
    ctx.fillStyle = '#d0b860';
    ctx.fillRect(0, 26, w, 1);
    // Umbrella pole
    ctx.fillStyle = '#6a4018';
    ctx.fillRect(15, 10, 2, 18);
    // Umbrella — alternating red/white stripes
    ctx.fillStyle = '#e03030';
    ctx.fillRect(6, 8, 20, 2);
    ctx.fillRect(4, 10, 24, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 6, 4, 2);
    ctx.fillRect(16, 6, 4, 2);
    ctx.fillStyle = '#e03030';
    ctx.fillRect(12, 6, 4, 2);
    ctx.fillRect(20, 6, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 4, 2);
    ctx.fillRect(14, 4, 4, 2);
    ctx.fillRect(22, 4, 4, 2);
    // Tip
    ctx.fillStyle = '#f0c040';
    ctx.fillRect(15, 3, 2, 2);
    // Tiny sun in corner
    ctx.fillStyle = '#ffe060';
    ctx.fillRect(27, 2, 3, 3);
    ctx.fillRect(26, 3, 1, 1);
    ctx.fillRect(30, 3, 1, 1);
    canvas.refresh();
  }

  static generateRewardHome(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-home', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Chimney
    ctx.fillStyle = '#a05028';
    ctx.fillRect(22, 5, 4, 6);
    ctx.fillStyle = '#703818';
    ctx.fillRect(22, 5, 4, 1);
    // Smoke puffs
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(23, 2, 2, 2);
    ctx.fillRect(25, 0, 2, 2);
    // Roof triangle
    ctx.fillStyle = '#c04030';
    ctx.fillRect(15, 7, 2, 2);
    ctx.fillRect(13, 9, 6, 2);
    ctx.fillRect(11, 11, 10, 2);
    ctx.fillRect(9, 13, 14, 2);
    ctx.fillRect(7, 15, 18, 2);
    // Roof highlight
    ctx.fillStyle = '#e05040';
    ctx.fillRect(15, 7, 1, 2);
    ctx.fillRect(13, 9, 1, 2);
    ctx.fillRect(11, 11, 1, 2);
    // House body
    ctx.fillStyle = '#e8c890';
    ctx.fillRect(8, 17, 16, 12);
    ctx.fillStyle = '#c0a068';
    ctx.fillRect(8, 28, 16, 1);
    // Door
    ctx.fillStyle = '#6a3818';
    ctx.fillRect(14, 21, 4, 8);
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(17, 25, 1, 1);
    // Window (lit)
    ctx.fillStyle = '#ffe060';
    ctx.fillRect(10, 20, 3, 3);
    ctx.fillStyle = '#ffffa0';
    ctx.fillRect(10, 20, 1, 1);
    // Window frame
    ctx.fillStyle = '#6a3818';
    ctx.fillRect(9, 19, 5, 1);
    ctx.fillRect(9, 23, 5, 1);
    // Second window
    ctx.fillStyle = '#ffe060';
    ctx.fillRect(19, 20, 3, 3);
    ctx.fillStyle = '#6a3818';
    ctx.fillRect(18, 19, 5, 1);
    ctx.fillRect(18, 23, 5, 1);
    canvas.refresh();
  }

  static generateRewardTravel(scene: Phaser.Scene): void {
    const w = 32, h = 32;
    const canvas = scene.textures.createCanvas('reward-travel', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Motion lines (behind plane)
    ctx.fillStyle = '#80c0f0';
    ctx.fillRect(0, 12, 6, 1);
    ctx.fillRect(0, 17, 8, 1);
    ctx.fillRect(0, 22, 5, 1);
    ctx.fillStyle = '#c0e0ff';
    ctx.fillRect(2, 14, 4, 1);
    ctx.fillRect(2, 20, 6, 1);
    // Plane body (fuselage)
    ctx.fillStyle = '#e0e0f0';
    ctx.fillRect(8, 15, 18, 4);
    ctx.fillRect(10, 14, 14, 6);
    // Nose cone
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(24, 15, 2, 4);
    ctx.fillRect(26, 16, 2, 2);
    // Body shading
    ctx.fillStyle = '#b0b0c0';
    ctx.fillRect(10, 19, 14, 1);
    // Main wing
    ctx.fillStyle = '#a0a0b0';
    ctx.fillRect(12, 19, 10, 5);
    ctx.fillRect(14, 24, 6, 1);
    // Wing highlight
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(12, 19, 10, 1);
    // Tail fin
    ctx.fillStyle = '#a0a0b0';
    ctx.fillRect(8, 10, 3, 5);
    ctx.fillRect(9, 9, 2, 1);
    // Cockpit window
    ctx.fillStyle = '#5080b0';
    ctx.fillRect(21, 15, 3, 2);
    ctx.fillStyle = '#80b0e0';
    ctx.fillRect(21, 15, 1, 1);
    // Passenger windows
    ctx.fillStyle = '#5080b0';
    ctx.fillRect(13, 16, 1, 1);
    ctx.fillRect(15, 16, 1, 1);
    ctx.fillRect(17, 16, 1, 1);
    ctx.fillRect(19, 16, 1, 1);
    canvas.refresh();
  }

  static generateParticle(scene: Phaser.Scene): void {
    const canvas = scene.textures.createCanvas('particle', 4, 4);
    if (!canvas) return;
    canvas.context.fillStyle = '#ffffff';
    canvas.context.fillRect(0, 0, 4, 4);
    canvas.refresh();
  }

  static generateStarburst(scene: Phaser.Scene): void {
    const w = 24, h = 24;
    const canvas = scene.textures.createCanvas('starburst', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Star shape
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 0, 4, 24);
    ctx.fillRect(0, 10, 24, 4);
    // Diagonal arms
    ctx.fillStyle = '#f0d060';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(i*2, i*2, 3, 3);
      ctx.fillRect(22 - i*2, i*2, 3, 3);
    }
    // Center bright
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 9, 6, 6);
    canvas.refresh();
  }

  static generateSuperParticle(scene: Phaser.Scene): void {
    const canvas = scene.textures.createCanvas('super-particle', 6, 6);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.fillStyle = '#40e060';
    ctx.fillRect(1, 0, 4, 6);
    ctx.fillRect(0, 1, 6, 4);
    ctx.fillStyle = '#80ff90';
    ctx.fillRect(2, 1, 2, 2);
    canvas.refresh();
  }

  static generateKickEffect(scene: Phaser.Scene): void {
    const w = 28, h = 16;
    const canvas = scene.textures.createCanvas('kick-effect', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    // Swoosh arc — motion lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 6, 20, 4);
    ctx.fillRect(16, 3, 8, 3);
    ctx.fillRect(20, 0, 6, 3);
    ctx.fillRect(16, 10, 8, 3);
    ctx.fillRect(20, 13, 6, 3);
    // Speed lines
    ctx.fillStyle = '#f0d060';
    ctx.fillRect(2, 5, 6, 1);
    ctx.fillRect(4, 10, 8, 1);
    ctx.fillRect(0, 8, 4, 1);
    canvas.refresh();
  }

  // === BACKGROUNDS ===

  static generateBackgrounds(scene: Phaser.Scene): void {
    this.generateAct1Bg(scene);
    this.generateAct2Bg(scene);
    this.generateAct3Bg(scene);
    this.generateAct4Bg(scene);
    this.generateAct5Bg(scene);
  }

  // FLOOR_Y: where the ground plane starts — Double Dragon style, floor takes ~60% of screen
  private static readonly FLOOR_Y = 134;

  static generateAct1Bg(scene: Phaser.Scene): void {
    const w = 384, h = GAME_HEIGHT;
    const FY = this.FLOOR_Y;

    // Far layer — office wall with windows (top band above the floor)
    let canvas = scene.textures.createCanvas('bg-act1-far', w, h);
    if (!canvas) return;
    let ctx = canvas.context;
    // Office wall
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(0, 0, w, FY);
    // Wainscoting / lower wall panel
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(0, FY - 20, w, 20);
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(0, FY - 20, w, 2);
    // Windows with blinds (showing city outside)
    const windowPositions = [30, 120, 210, 300];
    windowPositions.forEach(wx => {
      // Window frame
      ctx.fillStyle = '#6a6a7a';
      ctx.fillRect(wx, 8, 50, 48);
      // Glass — sky gradient
      ctx.fillStyle = '#5080b0';
      ctx.fillRect(wx + 3, 11, 44, 42);
      // City silhouette through window
      ctx.fillStyle = '#304060';
      ctx.fillRect(wx + 3, 35, 10, 18);
      ctx.fillRect(wx + 15, 30, 8, 23);
      ctx.fillRect(wx + 25, 38, 12, 15);
      ctx.fillRect(wx + 39, 32, 8, 21);
      // Blinds
      ctx.fillStyle = '#7a8a9a';
      for (let by = 11; by < 53; by += 6) {
        ctx.fillRect(wx + 3, by, 44, 1);
      }
    });
    // Motivational poster between windows
    ctx.fillStyle = '#e0d0a0';
    ctx.fillRect(85, 20, 22, 28);
    ctx.fillStyle = '#6080a0';
    ctx.fillRect(87, 22, 18, 14);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(89, 40, 14, 2);
    ctx.fillRect(91, 44, 10, 1);
    // Clock on wall
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(180, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(180, 25, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(180, 25, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(180, 20, 1, 5); // clock hand
    ctx.fillRect(180, 25, 4, 1); // clock hand
    canvas.refresh();

    // Near layer — office floor (carpet/tiles — fills bottom 60%+)
    canvas = scene.textures.createCanvas('bg-act1-near', w, h);
    if (!canvas) return;
    ctx = canvas.context;
    // Carpet base
    ctx.fillStyle = '#5a5060';
    ctx.fillRect(0, FY, w, h - FY);
    // Carpet pattern — subtle grid (commercial office carpet)
    ctx.fillStyle = '#524a58';
    for (let y = FY; y < h; y += 8) {
      ctx.fillRect(0, y, w, 1);
    }
    for (let x = 0; x < w; x += 8) {
      ctx.fillRect(x, FY, 1, h - FY);
    }
    // Slightly lighter carpet squares for texture
    ctx.fillStyle = '#5e566a';
    for (let y = FY + 4; y < h; y += 16) {
      for (let x = 4; x < w; x += 16) {
        ctx.fillRect(x, y, 8, 8);
      }
    }
    // Office furniture silhouettes in the back (near FY line)
    // Desks along the back wall
    ctx.fillStyle = '#6a5a40';
    ctx.fillRect(10, FY + 2, 50, 8);
    ctx.fillRect(140, FY + 2, 50, 8);
    ctx.fillRect(270, FY + 2, 50, 8);
    // Desk legs
    ctx.fillStyle = '#5a4a30';
    ctx.fillRect(12, FY + 10, 2, 6);
    ctx.fillRect(56, FY + 10, 2, 6);
    ctx.fillRect(142, FY + 10, 2, 6);
    ctx.fillRect(186, FY + 10, 2, 6);
    ctx.fillRect(272, FY + 10, 2, 6);
    ctx.fillRect(316, FY + 10, 2, 6);
    // Computer monitors on desks
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(25, FY - 4, 14, 10);
    ctx.fillStyle = '#4080a0';
    ctx.fillRect(27, FY - 2, 10, 6);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(155, FY - 4, 14, 10);
    ctx.fillStyle = '#4080a0';
    ctx.fillRect(157, FY - 2, 10, 6);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(285, FY - 4, 14, 10);
    ctx.fillStyle = '#4080a0';
    ctx.fillRect(287, FY - 2, 10, 6);
    // Filing cabinet
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(100, FY + 2, 16, 14);
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(102, FY + 4, 12, 4);
    ctx.fillRect(102, FY + 10, 12, 4);
    // Water cooler
    ctx.fillStyle = '#a0c0d0';
    ctx.fillRect(230, FY + 2, 8, 14);
    ctx.fillStyle = '#80a0b0';
    ctx.fillRect(232, FY + 4, 4, 4);
    canvas.refresh();
  }

  static generateAct2Bg(scene: Phaser.Scene): void {
    const w = 384, h = GAME_HEIGHT;
    const FY = this.FLOOR_Y;

    let canvas = scene.textures.createCanvas('bg-act2-far', w, h);
    if (!canvas) return;
    let ctx = canvas.context;
    // Dark mall wall (only the top band)
    ctx.fillStyle = '#1a1030';
    ctx.fillRect(0, 0, w, FY);
    // Neon signs in the wall area
    const signs = [
      { x: 20, y: 15, w: 50, h: 12, color: '#e060a0' },
      { x: 100, y: 10, w: 60, h: 10, color: '#60a0e0' },
      { x: 200, y: 14, w: 55, h: 12, color: '#e060a0' },
      { x: 290, y: 12, w: 65, h: 10, color: '#60e0a0' },
    ];
    signs.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(s.x - 3, s.y - 3, s.w + 6, s.h + 6);
      ctx.globalAlpha = 1;
    });
    // Wall base / wainscoting
    ctx.fillStyle = '#2a1a3a';
    ctx.fillRect(0, FY - 15, w, 15);
    // Shelves
    ctx.fillStyle = '#3a2a4a';
    ctx.fillRect(0, 35, w, 3);
    ctx.fillRect(0, 55, w, 3);
    canvas.refresh();

    // Near layer — big mall floor with checker tiles
    canvas = scene.textures.createCanvas('bg-act2-near', w, h);
    if (!canvas) return;
    ctx = canvas.context;
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(0, FY, w, h - FY);
    // Checker pattern across the floor
    for (let x = 0; x < w; x += 16) {
      for (let y = FY; y < h; y += 16) {
        if (((x / 16) + (y / 16)) % 2 === 0) {
          ctx.fillStyle = '#4a3838';
          ctx.fillRect(x, y, 16, 16);
        }
      }
    }
    // Floor edge
    ctx.fillStyle = '#5a4a4a';
    ctx.fillRect(0, FY, w, 2);
    canvas.refresh();
  }

  static generateAct3Bg(scene: Phaser.Scene): void {
    const w = 384, h = GAME_HEIGHT;
    const FY = this.FLOOR_Y;

    let canvas = scene.textures.createCanvas('bg-act3-far', w, h);
    if (!canvas) return;
    let ctx = canvas.context;
    // Dark trading floor wall (top band)
    ctx.fillStyle = '#0a0a20';
    ctx.fillRect(0, 0, w, FY);
    // Trading screens on the wall
    const screens = [
      { x: 10, y: 8, w: 70, h: 35 },
      { x: 100, y: 5, w: 80, h: 40 },
      { x: 200, y: 10, w: 65, h: 32 },
      { x: 290, y: 6, w: 75, h: 38 },
    ];
    screens.forEach(s => {
      ctx.fillStyle = '#102030';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(s.x, s.y, s.w, 2);
      ctx.fillRect(s.x, s.y + s.h - 2, s.w, 2);
      ctx.fillStyle = '#40c060';
      let ly = s.y + s.h / 2;
      for (let i = 0; i < s.w - 8; i++) {
        ly += Math.sin(i * 0.3 + s.x) * 2;
        ly = Math.max(s.y + 4, Math.min(s.y + s.h - 4, ly));
        ctx.fillRect(s.x + 4 + i, ly, 1, 1);
      }
      ctx.fillStyle = '#e04040';
      ly = s.y + s.h * 0.4;
      for (let i = 0; i < s.w - 8; i++) {
        ly += Math.sin(i * 0.2 + s.x * 0.5 + 2) * 2.5;
        ly = Math.max(s.y + 4, Math.min(s.y + s.h - 4, ly));
        ctx.fillRect(s.x + 4 + i, ly, 1, 1);
      }
    });
    // Wall base
    ctx.fillStyle = '#151530';
    ctx.fillRect(0, FY - 10, w, 10);
    canvas.refresh();

    // Near layer — big trading floor
    canvas = scene.textures.createCanvas('bg-act3-near', w, h);
    if (!canvas) return;
    ctx = canvas.context;
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(0, FY, w, h - FY);
    // Floor grid
    ctx.fillStyle = '#222a3a';
    for (let x = 0; x < w; x += 20) {
      ctx.fillRect(x, FY, 1, h - FY);
    }
    for (let y = FY; y < h; y += 20) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.fillStyle = '#2a3545';
    ctx.fillRect(0, FY, w, 2);
    canvas.refresh();
  }

  static generateAct4Bg(scene: Phaser.Scene): void {
    const w = 384, h = GAME_HEIGHT;
    const FY = this.FLOOR_Y;

    let canvas = scene.textures.createCanvas('bg-act4-far', w, h);
    if (!canvas) return;
    let ctx = canvas.context;
    // Factory wall (top band)
    ctx.fillStyle = '#1a2020';
    ctx.fillRect(0, 0, w, FY);
    ctx.fillStyle = '#2a3030';
    ctx.fillRect(0, 15, w, FY - 15);
    // Horizontal pipes on the wall
    ctx.fillStyle = '#4a5a5a';
    ctx.fillRect(0, 25, w, 6);
    ctx.fillRect(0, 48, w, 6);
    ctx.fillStyle = '#6a7a7a';
    ctx.fillRect(0, 26, w, 2);
    ctx.fillRect(0, 49, w, 2);
    // Rivets
    ctx.fillStyle = '#8a7050';
    for (let x = 0; x < w; x += 24) {
      ctx.fillRect(x+2, 28, 3, 2);
      ctx.fillRect(x+2, 51, 3, 2);
    }
    // Warning stripes at wall base
    for (let x = 0; x < w; x += 16) {
      ctx.fillStyle = (x / 16) % 2 === 0 ? '#c0a020' : '#2a3030';
      ctx.fillRect(x, FY - 6, 8, 6);
    }
    canvas.refresh();

    // Near layer — big conveyor/factory floor
    canvas = scene.textures.createCanvas('bg-act4-near', w, h);
    if (!canvas) return;
    ctx = canvas.context;
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, FY, w, h - FY);
    // Belt segments (vertical lines)
    ctx.fillStyle = '#343444';
    for (let x = 0; x < w; x += 14) {
      ctx.fillRect(x, FY, 2, h - FY);
    }
    // Horizontal metal seams
    ctx.fillStyle = '#3a3a4a';
    for (let y = FY + 20; y < h; y += 25) {
      ctx.fillRect(0, y, w, 1);
    }
    // Metal edge at top
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(0, FY, w, 2);
    canvas.refresh();
  }

  static generateAct5Bg(scene: Phaser.Scene): void {
    const w = 384, h = GAME_HEIGHT;
    const FY = this.FLOOR_Y;

    let canvas = scene.textures.createCanvas('bg-act5-far', w, h);
    if (!canvas) return;
    let ctx = canvas.context;
    // Sunset corridor wall (top band)
    const grad = ctx.createLinearGradient(0, 0, 0, FY);
    grad.addColorStop(0, '#e06030');
    grad.addColorStop(0.6, '#f0a050');
    grad.addColorStop(1, '#c07030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, FY);
    // Crown molding
    ctx.fillStyle = '#7a6040';
    ctx.fillRect(0, FY - 4, w, 4);
    // Wainscoting
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(0, FY - 20, w, 16);
    canvas.refresh();

    // Near layer — big carpet floor
    canvas = scene.textures.createCanvas('bg-act5-near', w, h);
    if (!canvas) return;
    ctx = canvas.context;
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(0, FY, w, h - FY);
    // Carpet pattern
    ctx.fillStyle = '#553828';
    for (let x = 0; x < w; x += 12) {
      for (let y = FY + 4; y < h; y += 12) {
        ctx.fillRect(x, y, 6, 2);
        ctx.fillRect(x + 6, y + 6, 6, 2);
      }
    }
    // Carpet edge / baseboard
    ctx.fillStyle = '#6a4830';
    ctx.fillRect(0, FY, w, 3);
    canvas.refresh();
  }

  static generateGround(scene: Phaser.Scene): void {
    const canvas = scene.textures.createCanvas('ground', GAME_WIDTH, 4);
    if (!canvas) return;
    canvas.context.fillStyle = '#5a5a6a';
    canvas.context.fillRect(0, 0, GAME_WIDTH, 4);
    canvas.refresh();
  }
}
