export type DataTree = Record<string, Area>;

export interface Area {
  gameId: string;
  name: string;
  desc: string;
  imageUrl: string;
  chapters: Record<string, Chapter>
  chapterCount: number;
}

export interface Chapter {
  gameId: string;
  name: string
  desc: string;
  imageUrl: string;
  chapterNo?: number;
  sides: Record<"a", Side> & Partial<Record<"b" | "c", Side>>;
  sideCount: number;
}

export interface Side {
  name: string
  checkpoints: Checkpoint[];
  rooms: Record<string, Room>;
  roomCount: number;
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
  x?: number;
  y?: number;
}

export interface Subroom {
  name: string;
  imageUrl: string;
  x: number;
  y: number;
}