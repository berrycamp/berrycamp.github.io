import {BoundingBox, Room} from './../data/dataTypes';

export interface AreaData {
  id: string;
  gameId: string;
  name: string;
}

export interface ChapterData {
  id: string;
  gameId: string;
  name: string;
  no?: number;
}

export interface SideData {
  id: string;
  name: string;
  boundingBox: BoundingBox;
  rooms: RoomData[];
  checkpoints: CheckpointData[];
}

export interface RoomData extends Room {
  id: string;
  name?: string;
  tags: string[];
}

export interface CheckpointData {
  name: string;
  boundingBox: BoundingBox;
  roomOrder: string[];
}

export interface CheckpointDataExtended extends CheckpointData {
  rooms: RoomData[];
}

export type OnViewChangeFn = (box: BoundingBox) => void;

export type OnRoomSelectFn = (room: RoomData) => void;
