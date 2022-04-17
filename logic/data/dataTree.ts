export type DataTree = Record<string, Area>;

export interface Area {
  gameId: string;
  name: string;
  desc: string;
  imageUrl: string;
  chapters: Record<string, Chapter>
}

export interface Chapter {
  gameId: string;
  name: string
  desc: string;
  imageUrl: string;
  chapter_no?: number;
  sides: Record<string, Side>;
}

export interface Side {
  name: string
  checkpoints: Checkpoint[];
  rooms: Record<string, Room>;
  roomOrder: string[];
}

export interface Checkpoint {
  name: string
  abbreviation: string;
}

export interface Room {
  name: string;
  checkpointNo: number;
  imageUrl: string;
  subrooms?: Subroom[];
}

export interface Subroom {
  name: string;
  imageUrl: string;
  x: number;
  y: number;
}