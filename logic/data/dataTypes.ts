export interface Area {
  id: string;
  gameId: string;
  name: string;
  desc: string;
  image: string;
  chapters: string[];
}

export interface Chapter {
  id: string;
  gameId: string;
  name: string
  desc: string;
  chapterNo?: number;
  // TODO: Add suitable images.
  image: string;
  sides: string[];
}

export interface Side {
  id: string;
  name: string
  checkpoints: Checkpoint[];
  rooms: Record<string, Room>;
  roomCount: number;
  canvas: Canvas;
}

/**
 * @property name The name of the checkpoint.
 * @property abbreviation A checkpoint abbrivation.
 * @property roomCount The number of unique rooms in the checkpoint.
 * @property roomOrder The order of the rooms in the checkpoint.
 */
export interface Checkpoint {
  name: string
  abbreviation: string;
  roomCount: number;
  roomOrder: string[];
  canvas: Canvas;
}

export interface Room {
  name?: string;
  checkpointNo: number;
  defaultSpawn: Point;
  entities: Partial<{
    spawn: SpawnPoint[];
    berry: BerryPoint[];
    golden: Point[];
    moon: Point[];
    heart: Point[];
    cassette: Point[];
  }>;
  canvas: Canvas;
}

export interface Point {
  x: number;
  y: number;
}

export interface SpawnPoint extends Point {
  name?: string;
}

export interface BerryPoint extends Point {
  id: number;
  checkpointId: number;
  order: number;
}

export interface Canvas {
  position: Point;
  size: {
    width: number,
    height: number,
  };
  boundingBox: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}