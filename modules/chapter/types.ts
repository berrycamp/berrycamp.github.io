export interface AreaData {
  id: string;
  name: string;
  desc: string;
};

export interface ChapterData {
  id: string;
  gameId: string;
  name: string;
  desc: string;
  no?: number;
}

export interface SideData {
  id: string;
  name: string;
  roomCount: number;
  checkpoints: CheckpointData[];
}

export interface CheckpointData {
  name: string;
  abbreviation: string;
  rooms: RoomData[];
}

export interface RoomData {
  id: string;
  name?: string;
  tags: string[];
}

export interface ChapterViewProps {
  areaId: string;
  chapterId: string;
  sideId: string;
  checkpoints: CheckpointData[];
};

export interface ChapterViewItemProps {
  roomId: string;
  roomName?: string;
  href: string,
  image: string
};