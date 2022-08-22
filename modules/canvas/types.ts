import {MutableRefObject} from "react";
import {ViewChangeReason} from '~/modules/canvas';
import {CanvasImage, Point, View} from "./useExtentCanvas";

export interface CampCanvasProps {
  rooms: CanvasRoom[];
  imagesRef: MutableRefObject<CanvasImage[]>;
  contentViewRef: MutableRefObject<View | undefined>;
  onViewChange: (reason: ViewChangeReason) => void;
  onSelectRoom: (x: number, y: number) => void;
  onTeleport: (x: number, y: number) => void;
}

export interface CanvasRoom {
  id: string;
  position: Point;
  view: View;
  image: string;
}
