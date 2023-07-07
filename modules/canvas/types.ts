import {ExtentCanvasPoint, ExtentCanvasViewBox, ExtentCanvasViewChangeReason} from "extent-canvas";
import {MutableRefObject} from "react";
import {CanvasImage} from "./CampCanvas";

export interface CampCanvasProps {
  view: ExtentCanvasViewBox | undefined;
  rooms: CanvasRoom[];
  imagesRef: MutableRefObject<CanvasImage[]>;
  contentViewRef: MutableRefObject<ExtentCanvasViewBox | undefined>;
  onViewChange: (reason: ExtentCanvasViewChangeReason) => void;
  onSelectRoom: (x: number, y: number) => void;
  onTeleport: (x: number, y: number) => void;
}

export interface CanvasRoom {
  id: string;
  position: ExtentCanvasPoint;
  view: ExtentCanvasViewBox;
  image: string;
}
