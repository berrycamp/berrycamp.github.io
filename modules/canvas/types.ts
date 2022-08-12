import {BoundingBox, Point} from "../data/dataTypes";

export interface CampCanvasProps {
  name: string;
  url: string;
  rooms: CanvasRoom[];
  boundingBox: BoundingBox;
}

export interface CanvasRoom {
  position: Point;
  image: string;
}
