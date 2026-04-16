import Phaser from 'phaser';
import { EventBus, EVENTS } from '../utils/EventBus';
import { BALANCE } from '../config/BalanceConfig';

export type OutcomeTier = 'best' | 'ok' | 'getting-by';

export interface GameStateData {
  currentAct: number;
  superBalance: number;
  superDisplayMultiplier: number; // 1 in Act 1, 50 from Act 2 onward (years of work)
  giantCoinsSaved: number;
  employerFixes: number;
  employerMisses: number;
  temptationsKicked: number;
  crashesCleared: number;
  holdsCompleted: number;
  leaksSealed: number;
  feesBlocked: number;
  feesLeaked: number;
  specialServicesCancelled: number;
  totalFeesSaved: number;
  totalFeesDrained: number;
  doorsOpened: number;
  retirementPower: number;
  retirementPowerStarting: number;
  retirementPowerSpent: number;
  outcomeTier: OutcomeTier;
  teacherMode: boolean;
  debugMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
}

class GameStateManager {
  private state: GameStateData;

  constructor() {
    this.state = this.getDefaults();
  }

  private getDefaults(): GameStateData {
    return {
      currentAct: 1,
      superBalance: BALANCE.initial.superBalance,
      superDisplayMultiplier: 1,
      giantCoinsSaved: 0,
      employerFixes: 0,
      employerMisses: 0,
      temptationsKicked: 0,
      crashesCleared: 0,
      holdsCompleted: 0,
      leaksSealed: 0,
      feesBlocked: 0,
      feesLeaked: 0,
      specialServicesCancelled: 0,
      totalFeesSaved: 0,
      totalFeesDrained: 0,
      doorsOpened: 0,
      retirementPower: 0,
      retirementPowerStarting: 0,
      retirementPowerSpent: 0,
      outcomeTier: 'getting-by',
      teacherMode: false,
      debugMode: false,
      reducedMotion: false,
      highContrast: false,
      soundEnabled: true,
    };
  }

  reset(): void {
    this.state = this.getDefaults();
  }

  get<K extends keyof GameStateData>(key: K): GameStateData[K] {
    return this.state[key];
  }

  set<K extends keyof GameStateData>(key: K, value: GameStateData[K]): void {
    this.state[key] = value;
    if (key === 'superBalance') EventBus.emit(EVENTS.SUPER_CHANGED, value);
    if (key === 'giantCoinsSaved') EventBus.emit(EVENTS.COINS_CHANGED, value);
    if (key === 'currentAct') EventBus.emit(EVENTS.ACT_CHANGED, value);
    if (key === 'retirementPower') EventBus.emit(EVENTS.POWER_CHANGED, value);
  }

  addSuper(amount: number): void {
    const newVal = Math.max(0, this.state.superBalance + amount);
    this.set('superBalance', newVal);
  }

  removeSuper(amount: number): void {
    this.addSuper(-amount);
  }

  increment(key: 'employerFixes' | 'employerMisses' | 'temptationsKicked' | 'giantCoinsSaved' | 'crashesCleared' | 'holdsCompleted' | 'leaksSealed' | 'feesBlocked' | 'feesLeaked' | 'specialServicesCancelled' | 'doorsOpened'): void {
    (this.state[key] as number)++;
  }

  calculateMaxDoors(): number {
    const bal = this.state.superBalance;
    const thresholds = BALANCE.act5.superThresholds;
    if (bal >= thresholds.best) return 7;
    if (bal >= thresholds.ok) return Phaser.Math.Between(4, 5);
    return Math.max(BALANCE.act5.minDoorsOpen, Phaser.Math.Between(2, 3));
  }

  calculateOutcome(): OutcomeTier {
    const doors = this.state.doorsOpened;
    if (doors >= 6) return 'best';
    if (doors >= 4) return 'ok';
    return 'getting-by';
  }

  getAll(): GameStateData {
    return { ...this.state };
  }

  /** Returns the super balance formatted for display (with multiplier applied). */
  getDisplayBalance(): number {
    return Math.round(this.state.superBalance * this.state.superDisplayMultiplier);
  }

  getMarketResilience(): number {
    return this.state.giantCoinsSaved * BALANCE.act3.resiliencePerCoin;
  }

  /** Convert the current display balance to Act 5 retirement power. */
  calculateRetirementPower(): number {
    return Math.max(0, Math.floor(this.getDisplayBalance() * BALANCE.act5.powerPerDollar));
  }
}

export const gameState = new GameStateManager();
(window as any).gameState = gameState;
