import Phaser from 'phaser';

// Typed event bus singleton shared across all scenes and systems
export const EventBus = new Phaser.Events.EventEmitter();

// Event name constants
export const EVENTS = {
  SUPER_CHANGED: 'super-changed',
  COINS_CHANGED: 'coins-changed',
  ACT_CHANGED: 'act-changed',
  PLAYER_KICK: 'player-kick',
  PLAYER_HIT: 'player-hit',
  OBJECT_FIXED: 'object-fixed',
  OBJECT_MISSED: 'object-missed',
  TEMPTATION_KICKED: 'temptation-kicked',
  COIN_SAVED: 'coin-saved',
  COIN_LOST: 'coin-lost',
  CRASH_CLEARED: 'crash-cleared',
  HOLD_COMPLETED: 'hold-completed',
  LEAK_SEALED: 'leak-sealed',
  DOOR_OPENED: 'door-opened',
  POWER_CHANGED: 'power-changed',
  GAME_OVER: 'game-over',
  SHAKE: 'shake',
} as const;
