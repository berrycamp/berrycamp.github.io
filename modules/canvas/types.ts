import {Point, View} from "./useExtentCanvas";

export interface CampCanvasProps {
  name: string;
  rooms: CanvasRoom[];
  view: View | undefined;
}

export interface CanvasRoom {
  position: Point;
  view: View;
  image: string;
}
