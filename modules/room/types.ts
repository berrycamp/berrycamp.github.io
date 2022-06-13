export interface AreaData {
  id: string;
  name: string;
  link: string;
}

export interface ChapterData {
  id: string;
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
}

export interface NavRoomData {
  name?: string;
  link: string;
}