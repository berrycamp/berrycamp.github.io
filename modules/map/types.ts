import {View} from '../canvas';
import {Room} from './../data/dataTypes';

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
  img: string;
  boundingBox: View;
  rooms: RoomData[];
  checkpoints: CheckpointData[];
}

export interface RoomData extends Room {
  id: string;
  name: string;
  tags: string[];
}

export interface CheckpointData {
  name: string;
  boundingBox: View;
  roomOrder: string[];
}

export interface CheckpointDataExtended extends CheckpointData {
  id: number;
  rooms: RoomData[];
}

export type OnRoomSelectFn = (room: RoomData | undefined) => void;
