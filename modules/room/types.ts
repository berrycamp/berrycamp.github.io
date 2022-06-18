import {Entities} from "../data/dataTypes";

export interface AreaData {
  id: string;
  gameId: string;
  name: string;
  link: string;
}

export interface ChapterData {
  id: string;
  gameId: string;
  name: string;
  link: string;
}

export interface SideData {
  id: string;
  name: string;
}

export interface CheckpointData {
  name: string;
}

export interface RoomData {
  name?: string;
  debugId: string;
  roomId: string;
  checkpointRoomNo: string;
  levelRoomNo: string;
  teleportParams: string;
  tags: string[]
  entities: Partial<Entities>;
}

export interface NavRoomData {
  name?: string;
  link: string;
}