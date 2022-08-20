import {MutableRefObject} from "react";
import {CanvasImage, Point, View} from "./useExtentCanvas";

export interface CampCanvasProps {
  rooms: CanvasRoom[];
  view: View | undefined;
  imagesRef: MutableRefObject<CanvasImage[]>;
  contentViewRef: MutableRefObject<View | undefined>;
  onViewChange: () => void;
}

export interface CanvasRoom {
  position: Point;
  view: View;
  image: string;
}
