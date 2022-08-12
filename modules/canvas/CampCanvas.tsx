import {Button, Theme, useTheme} from "@mui/material";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer, {Size} from "react-virtualized-auto-sizer";
import {Point, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {BoundingBox} from "~/modules/data/dataTypes";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({name, rooms, boundingBox, url}) => {
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>();
  const [imgs, setImgs] = useState<{img: HTMLImageElement, position: Point}[]>([]);

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
   * Save the canvas content as a full image.
   */
  const save = useCallback(async () => {
    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const virtualContext: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d");
    if (virtualContext === null) {
      return;
    }

    const maxPx = 268435456;
    const maxSizePx = 32767;
    const sizeFixPx = 16384;

    const size: Size = {
      width: boundingBox.right - boundingBox.left,
      height: boundingBox.bottom - boundingBox.top,
    };

    if (
      size.width > maxSizePx
      || size.height > maxSizePx
      || (size.width * size.height > maxPx)
    ) {
      size.width = sizeFixPx;
      size.height = sizeFixPx;
    }

    console.log(size, boundingBox);

    virtualCanvas.width = size.width;
    virtualCanvas.height = size.height;

    const {offset, scale} = calculateView(size, boundingBox);
    virtualContext.scale(scale, scale);
    virtualContext.translate(offset.x, offset.y);

    imgs.forEach(({img, position: {x, y}}) => virtualContext.drawImage(img, x, y));

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = name;
    link.click();
  }, [boundingBox.bottom, boundingBox.left, boundingBox.right, boundingBox.top, imgs, name])

  /**
   * Load the room images.
   */
  useEffect(() => {
    setImgs([]);
    rooms.forEach(({image, position}) => {
      const img = new Image();
      img.src = image;
      img.crossOrigin = "anonymous"
      img.onload = () => setImgs(prev => [...prev, {img, position}]);
    });
  }, [rooms]);

  const {redraw, setView} = useExtentCanvas({
    canvasRef,
    ...size && {view: calculateView(size, boundingBox)},
    onDraw: handleDraw,
  });

  /**
   * Update the size on resize.
   * 
   * @param size The new size.
   */
  const handleResize = (size: Size) => {
    setSize(size);
    redraw();
  };

  /**
   * Redraw on resize;
   */
  useEffect(() => {
    if (size === undefined) {
      return;
    }

    setView(calculateView(size, boundingBox));
    redraw();
  }, [boundingBox, redraw, setView, size]);

  return (
    <>
      <AutoSizer style={{width: "100%",  height: "100%"}} onResize={handleResize} defaultWidth={320} defaultHeight={180}>
        {({width, height}) => (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              background,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              touchAction: "none",
            }}
          />
        )}
      </AutoSizer>
      <Button onClick={save} variant="contained" sx={{position: "absolute", bottom: 0}}>Output</Button>
    </>
  );
});

const calculateView = ({width, height}: Size, {top, bottom, left, right}: BoundingBox): View => {
  const scale = Math.min(height / (bottom - top - 4), width / (right - left));
  const x = -((left + ((right - left) / 2)) - (width / (2 * scale)));
  const y = -((top + ((bottom - top - 4) / 2)) - (height / (2 * scale)));
  return {scale, offset: {x, y}};
}