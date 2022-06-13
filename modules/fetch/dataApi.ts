import {Area} from "modules/data/dataTypes";
import {fetchJson} from 'modules/fetch/fetchJson';

const baseUrl = "https://cdn.berry.camp/file/berrycamp";

/**
 * Cache the areas.
 */
const areaCache: Record<string, Area> = {};

/**
 * Fetch and cache the area during build.
 * 
 * @param areaId The area to get.
 * @returns The area.
 */
export const fetchArea = async (areaId: string): Promise<Area> => {
  let area: Area | undefined = areaCache[areaId];
  if (area === undefined) {
    area = await fetchJson<Area>(`${baseUrl}/areas/${areaId}.json`);
    areaCache[areaId] = area;
  } else {
    console.log("fetched from cache");
  }
  return area;
};

export const getAreaImageUrl = (areaId: string): string => {
  return `${baseUrl}/images/${areaId}/${areaId}.png`;
};

export const getChapterImageUrl = (areaId: string, chapterId: string): string => {
  return `${baseUrl}/images/${areaId}/chapters/${chapterId}.png`;
};

export const getRoomPreviewUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseUrl}/images/${areaId}/previews/${chapterId}/${sideId}/${roomId}.png`;
};

export const getRoomImageUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseUrl}/images/${areaId}/rooms/${chapterId}/${sideId}/${roomId}.png`
};
