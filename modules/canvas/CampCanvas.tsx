import {Button, Theme, useTheme} from "@mui/material";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {Point, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({name, rooms, boundingBox, url}) => {
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imgs, setImgs] = useState<{img: HTMLImageElement, position: Point}[]>([]);

  const [currView, setCurrView] = useState<View>();

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
    console.log(currView);
    if (currView === undefined) {
      return;
    }

    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const virtualContext: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d");
    if (virtualContext === null) {
      return;
    }

    const {left, right, top, bottom} = currView;
    const width: number = right - left;
    const height: number = bottom - top;
    if (width * height > 268435456) {
      throw Error("Too large");
    }

    virtualCanvas.width = width;
    virtualCanvas.height = height;
    virtualContext.translate(-left, -top);

    imgs.forEach(({img, position: {x, y}}) => virtualContext.drawImage(img, x, y));

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = name;
    link.click();
  }, [currView, imgs, name])

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

  const {setView, redraw} = useExtentCanvas({
    canvasRef,
    onDraw: handleDraw,
    onViewChange: setCurrView,
  });

  /**
   * Update the size on resize.
   * 
   * @param size The new size.
   */
  // const handleResize = (): void => {
  //   redraw();
  // };

  /**
   * Redraw on resize;
   */
  useEffect(() => {
    setView(boundingBox);
    setCurrView(boundingBox);
  }, [boundingBox, redraw, setView]);

  return (
    <>
      <AutoSizer style={{width: "100%",  height: "100%"}} defaultWidth={320} defaultHeight={180}>
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
