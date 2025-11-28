export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Meditate', // Simplified Buddha approximation
  FIREWORK = 'Firework'
}

export interface HandGestureState {
  detected: boolean;
  pinchDistance: number; // 0 to 1 (Closed to Open)
  handPosition: { x: number; y: number };
}

export interface ParticleConfig {
  color: string;
  shape: ShapeType;
  count: number;
  speed: number;
}