export type DataTree = Record<string, Chapter>;

export interface Section {
  name: string;
}

export interface Chapter extends Section {
  chapter_no?: number;
  desc: string;
  official?: boolean;
  sides: Side[];
}

export interface Side extends Section {
  official?: boolean;
  checkpoints: Checkpoint[];
}

export interface Checkpoint extends Section {
  abbreviation: string;
  rooms: Room[];
}

export interface Room extends Section {
  id: string;
}