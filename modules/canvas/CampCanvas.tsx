import {Button, Theme, useTheme} from "@mui/material";
import {FC, memo, useCallback, useEffect, useRef} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {CanvasImage, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({name, rooms, view, url}) => {
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<CanvasImage[]>([]);
  const viewRef = useRef<View | undefined>(view);

  /**
   * Set the current view.
   */
  const handleSetView = useCallback((view: View) => {
    viewRef.current = view;
  }, []);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (canvasRef.current === null || viewRef === undefined) {
      return;
    }

    /**
     * Load new rooms.
     */
    rooms.forEach(({image, position, view}, i) => {
      if (viewRef.current === undefined) {
        return;
      }

      const inView: boolean = viewsCollide(view, viewRef.current);
      if (!inView) {
        return;
      }

      const loadedImage: CanvasImage | undefined = imagesRef.current[i];
      if (loadedImage) {
        const {img, position: {x, y}} = loadedImage;
        context.drawImage(img, x, y);
      } else {
        const img = new Image();
        img.src = image;
        img.crossOrigin = "anonymous";
        imagesRef.current[i] = {img, position, view};
        img.onload = () => {
          context.drawImage(img, position.x, position.y);
        }
      }
    });
  }, [rooms]);

  /**
   * Save the canvas content as a full image.
   */
  const save = useCallback(async () => {
    if (viewRef.current === undefined) {
      return;
    }

    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const virtualContext: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d");
    if (virtualContext === null) {
      return;
    }

    const {left, right, top, bottom} = viewRef.current;
    const width: number = right - left;
    const height: number = bottom - top;
    if (width * height > 268435456) {
      throw Error("Too large");
    }

    virtualCanvas.width = width;
    virtualCanvas.height = height;
    virtualContext.translate(-left, -top);

    imagesRef.current.forEach(({img, position: {x, y}, view}) => {
      if (viewRef.current && viewsCollide(view, viewRef.current)) {
        virtualContext.drawImage(img, x, y);
      }
    });

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = name;
    link.click();
  }, [name])

  /**
   * Initialise the room image array.
   */
  useEffect(() => {
    imagesRef.current = [];
  }, [rooms]);

  const {setView} = useExtentCanvas({
    canvasRef,
    onDraw: handleDraw,
    onViewChange: handleSetView,
  });

  /**
   * Redraw on resize;
   */
  useEffect(() => {
    if (view !== undefined) {
      setView(view);
    }

    viewRef.current = view;
  }, [view, setView]);

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

/**
 * Determine if two views collide.
 * 
 * @param v1 The first view.
 * @param v2 The second view.
 * @returns True if v1 and v2 collide.
 */
 const viewsCollide = (v1: View, v2: View): boolean => {
  return v1.left < v2.right && v1.right > v2.left && v1.top < v2.bottom && v1.bottom > v2.top;
}



