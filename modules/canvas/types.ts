export interface CampCanvasProps {
  rooms: CanvasRoom[];
  boundingBox: BoundingBox;
}

export interface CanvasRoom {
  position: Point;
  image: string;
}
