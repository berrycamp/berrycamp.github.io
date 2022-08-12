import {fetchJson} from 'modules/fetch/fetchJson';
import {Area} from "~/modules/data/dataTypes";

const baseDataUrl = "https://wishcresp.github.io/berrycamp-data";

const baseImageUrl = "https://wishcresp.github.io/berrycamp-images";

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
    area = await fetchJson<Area>(`${baseDataUrl}/${areaId}.json`);
    areaCache[areaId] = area;
  } else {
    console.log("fetched from cache");
  }
  return area;
};

export const getRootImageUrl = (): string => {
  return `${baseImageUrl}/celeste/chapters/city.png`
}

export const getAreaImageUrl = (areaId: string): string => {
  return `${baseImageUrl}/${areaId}/${areaId}.png`;
};

export const getChapterImageUrl = (areaId: string, chapterId: string): string => {
  return `${baseImageUrl}/${areaId}/chapters/${chapterId}.png`;
};

export const getRoomPreviewUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseImageUrl}/${areaId}/previews/${chapterId}/${sideId}/${roomId}.png`;
};

export const getRoomImageUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseImageUrl}/${areaId}/rooms/${chapterId}/${sideId}/${roomId}.png`
};
