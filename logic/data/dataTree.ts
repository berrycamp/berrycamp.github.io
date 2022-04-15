export type DataTree = Record<string, AreaData>;

export interface AreaData {
  id: string;
  name: string;
  desc: string;
  imageUrl: string;
  chapters: Record<string, ChapterData>
}

export interface ChapterData {
  id: string;
  name: string
  chapter_no?: number;
  desc: string;
  sides: SideData[];
}

export interface SideData {
  name: string
  checkpoints: CheckpointData[];
}

export interface CheckpointData {
  name: string
  abbreviation: string;
  rooms: RoomData[];
}

export interface RoomData {
  name: string
  id: string;
  subroom?: number;
  fullRoomName?: string;
}