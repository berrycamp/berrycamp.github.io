import {Area, Chapter, Side} from "logic/data/dataTypes";
import {fetchJson} from 'logic/fetch/fetchJson';

const BASE_URL = "https://cdn.berry.camp/file/berrycamp";

export const fetchArea = (areaId: string): Promise<Area> => {
  return fetchJson(`${BASE_URL}/data/${areaId}/area.json`);
}

export const fetchChapter = (areaId: string, chapterId: string): Promise<Chapter> => {
  return fetchJson(`${BASE_URL}/data/${areaId}/${chapterId}/chapter.json`);
}

export const fetchSide = (areaId: string, chapterId: string, sideId: string): Promise<Side> => {
  return fetchJson(`${BASE_URL}/data/${areaId}/${chapterId}/${sideId}.json`);
}

export const getRoomPreviewUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${BASE_URL}/images/${areaId}/previews/${chapterId}/${sideId}/${roomId}.png`;
};

export const getRoomImageUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${BASE_URL}/images/${areaId}/rooms/${chapterId}/${sideId}/${roomId}.png`
}

// TODO
export const getRoomSpawnImageUrl = (areaId: string, chapterId: string, sideId: string, roomId: string, spawnid: number): string => {
  return "";
}