export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type ControlMode = 'FOLLOW' | 'DIRECT';

export interface Point {
  x: number;
  y: number;
}

export interface Segment extends Point {
  angle: number;
  radius: number;
}

export interface OrbTypeConfig {
  id: string;
  name: string;
  points: number;
  growth: number;
  color: string;
  glowColor: string;
  innerColor: string;
  radius: number;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface Orb {
  id: number;
  x: number;
  y: number;
  type: OrbTypeConfig;
  bobOffset: number;
  pulsePhase: number;
  radius: number;
  collected?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface SnakeTheme {
  id: string;
  name: string;
  headColor: string;
  headGlow: string;
  bodyGradientStart: string;
  bodyGradientEnd: string;
  bellyColor: string;
  eyeSclera: string;
  eyeIris: string;
  eyePupil: string;
  tongueColor: string;
  outlineColor: string;
}

export interface GameStats {
  score: number;
  highScore: number;
  gemsCollected: number;
  length: number;
  timeSurvivedSeconds: number;
  maxCombo: number;
}

export interface GameSettings {
  controlMode: ControlMode;
  themeId: string;
  soundEnabled: boolean;
  screenShake: boolean;
  speedMode: 'normal' | 'fast' | 'chill';
  particlesLevel: 'high' | 'low';
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  length: number;
  maxCombo: number;
  timeSurvivedSeconds: number;
  themeId: string;
  updatedAt?: number;
}

export interface PlayerProfile {
  uid: string;
  nickname: string;
}

