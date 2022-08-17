import {Point, View} from "./useExtentCanvas";

export interface CampCanvasProps {
  name: string;
  url: string;
  rooms: CanvasRoom[];
  view: View | undefined;
}

export interface CanvasRoom {
  position: Point;
  view: View;
  image: string;
}
