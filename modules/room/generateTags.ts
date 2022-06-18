import {Room} from "../data/dataTypes";

export const generateRoomTags = (room: Room): string[] => {
  const tags: string[] = [];
  if (room.entities?.berry) {
    tags.push("strawberry")
  }
  if (room.entities?.cassette) {
    tags.push("cassette");
  }
  if (room.entities?.golden) {
    tags.push("golden");
  }
  if (room.entities?.heart) {
    tags.push("crystal heart")
  }
  return tags;
}