import {Box, Theme, useTheme} from "@mui/material";
import {Point, useExtentCanvas, View} from "modules/canvas/useExtentCanvas";
import {BoundingBox} from "modules/data/dataTypes";
import {getCampImageUrl} from "logic/fetch/image";
import {FC, Fragment, memo, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer, {Size} from "react-virtualized-auto-sizer";

export interface CampCanvasProps {
  rooms: CanvasRoom[];
  boundingBox: BoundingBox;
}

export interface CanvasRoom {
  position: Point;
  image: string;
}

export const CampCanvas: FC<CampCanvasProps> = memo(({rooms, boundingBox}) => {
  const theme: Theme = useTheme();
  const bgColor = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>();
  const [imgs, setImgs] = useState<{img: CanvasImageSource, position: Point}[]>([]);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (canvasRef.current === null) {
      return;
    }

    imgs.forEach(({img, position: {x, y}}) => context.drawImage(img, x, y));
  }, [imgs]);

  /**
   * Load the room images.
   */
  useEffect(() => {
    setImgs([]);
    rooms.forEach(({image, position}) => {
      const img = new Image();
      img.src = getCampImageUrl(image)
      img.onload = () => setImgs(prev => [...prev, {img, position}]);
    });
  }, [rooms]);

  const {redraw, setView} = useExtentCanvas(canvasRef, handleDraw, bgColor);

  /**
   * Update the size on resize.
   * 
   * @param size The new size.
   */
  const handleResize = (size: Size) => {
    setSize(size);
  };

  /**
   * Redraw on resize;
   */
  useEffect(() => {
    if (size === undefined) {
      return;
    }

    redraw();
    setView(calculateView(size, boundingBox));
  }, [boundingBox, redraw, setView, size]);


  return (
    <Fragment>
      <Box sx={{width: "100%", height: "100%", aspectRatio: "16 / 9"}}>
        <AutoSizer style={{width: "100%", height: "100%"}} onResize={handleResize} defaultWidth={320} defaultHeight={180}>
          {({width, height}) => (
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              style={{
                width: "100%",
                height: "100%",
                imageRendering: "pixelated",
                touchAction: "none",
              }}
            />
          )}
        </AutoSizer>
      </Box>
    </Fragment>
  );
});

const calculateView = ({width, height}: Size, {top, bottom, left, right}: BoundingBox): View => {
  const scale = Math.min(height / (bottom - top - 4), width / (right - left));
  const x = -((left + ((right - left) / 2)) - (width / (2 * scale)));
  const y = -((top + ((bottom - top - 4) / 2)) - (height / (2 * scale)));
  return {scale, offset: {x, y}};
}