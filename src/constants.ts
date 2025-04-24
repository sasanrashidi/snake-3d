// Game board size
export const GRID_SIZE = 20;

// Game speed (lower is faster)
export const INITIAL_GAME_SPEED = 200; // milliseconds
export const MIN_GAME_SPEED = 80; // fastest possible speed
export const SPEED_INCREASE_RATE = 5; // ms to decrease per food eaten

// Directions
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

// Key mappings
export const KEY_MAPPINGS = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
};

// Direction vectors
export const DIRECTION_VECTORS = {
  [Direction.UP]: { x: 0, y: 0, z: -1 },
  [Direction.DOWN]: { x: 0, y: 0, z: 1 },
  [Direction.LEFT]: { x: -1, y: 0, z: 0 },
  [Direction.RIGHT]: { x: 1, y: 0, z: 0 },
};
