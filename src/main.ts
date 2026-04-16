import '@fontsource/press-start-2p';
import Phaser from 'phaser';
import { createGameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { SuperIntroScene } from './scenes/SuperIntroScene';
import { HUDScene } from './scenes/HUDScene';
import { ActIntroScene } from './scenes/ActIntroScene';
import { Act1Scene } from './scenes/Act1Scene';
import { Act2Scene } from './scenes/Act2Scene';
import { Act3Scene } from './scenes/Act3Scene';
import { Act4Scene } from './scenes/Act4Scene';
import { Act5Scene } from './scenes/Act5Scene';
import { ActOutroScene } from './scenes/ActOutroScene';
import { RecapScene } from './scenes/RecapScene';

const config = createGameConfig([
  BootScene,
  PreloadScene,
  TitleScene,
  SuperIntroScene,
  HUDScene,
  ActIntroScene,
  Act1Scene,
  Act2Scene,
  Act3Scene,
  Act4Scene,
  Act5Scene,
  ActOutroScene,
  RecapScene,
]);

(window as any).game = new Phaser.Game(config);
