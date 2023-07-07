import {ExtentCanvasPoint, ExtentCanvasSize, ExtentCanvasViewBox} from "extent-canvas";

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
  name: string;
  checkpoints: Checkpoint[];
  rooms: Record<string, Room>;
  roomCount: number;
  canvas: Canvas;
  img: string;
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
  name: string;
  checkpointNo: number;
  defaultSpawn: ExtentCanvasPoint;
  entities: Partial<Entities>;
  canvas: Canvas;
}

export interface Entities {
  spawn: SpawnPoint[];
  berry: BerryPoint[];
  golden: ExtentCanvasPoint[];
  heart: ExtentCanvasPoint[];
  cassette: ExtentCanvasPoint[];
}

export interface SpawnPoint extends ExtentCanvasPoint {
  name?: string;
}

export interface BerryPoint extends ExtentCanvasPoint {
  id: number;
  checkpointId: number;

  // Currently broken.
  order: number;
}

export interface Canvas {
  position: ExtentCanvasPoint;
  size: ExtentCanvasSize;
  boundingBox: ExtentCanvasViewBox;
}