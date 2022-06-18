import {BoundingBox, Point} from "../data/dataTypes";

export interface CampCanvasProps {
  url: string;
  rooms: CanvasRoom[];
  boundingBox: BoundingBox;
}

export interface CanvasRoom {
  position: Point;
  image: string;
}
