export type DataTree = Record<string, Area>;

export interface Area {
  id: string;
  name: string;
  chapters: Record<string, Chapter>
}

export interface Chapter {
  id: string;
  name: string
  chapter_no?: number;
  desc: string;
  sides: Side[];
}

export interface Side {
  name: string
  checkpoints: Checkpoint[];
}

export interface Checkpoint {
  name: string
  abbreviation: string;
  rooms: Room[];
}

export interface Room {
  name: string
  id: string;
  subroom?: number;
}