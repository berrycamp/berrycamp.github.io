import type {CanvasSize, Point, View} from "../canvas";

export interface Area {
  id: string;
  gameId: string;
  name: string;
  desc: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  gameId: string;
  name: string
  desc: string;
  chapterNo?: number;
  sides: Side[];
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
  entities: Partial<Entities>;
  canvas: Canvas;
}

export interface Entities {
  spawn: SpawnPoint[];
  berry: BerryPoint[];
  golden: Point[];
  heart: Point[];
  cassette: Point[];
}

export interface SpawnPoint extends Point {
  name?: string;
}

export interface BerryPoint extends Point {
  id: number;
  checkpointId: number;

  // Currently broken.
  order: number;
}

export interface Canvas {
  position: Point;
  size: CanvasSize;
  boundingBox: View;
}