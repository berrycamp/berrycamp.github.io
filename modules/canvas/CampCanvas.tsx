import {Button, Theme, useTheme} from "@mui/material";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {CanvasImage, CanvasSize, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({name, rooms, view}) => {
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<CanvasImage[]>([]);
  const viewRef = useRef<View | undefined>(view);
  const contentViewRef = useRef<View | undefined>();

  const [outputDisabled, setOutputDisabled] = useState(true);

  /**
   * Set the current view.
   */
  const handleSetView = useCallback((view: View) => {
    viewRef.current = view;
    setOutputDisabled(
      contentViewRef.current !== undefined && viewTooLarge(calculateCanvasSize(contentViewRef.current))
    );
  }, []);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (canvasRef.current === null) {
      return;
    }

    contentViewRef.current = undefined;

    /**
     * Load new rooms.
     */
    rooms.forEach(({image, position, view}, i) => {
      if (viewRef.current === undefined) {
        return;
      }

      // Don't render if not in view.
      const inView: boolean = viewsCollide(view, viewRef.current);
      if (!inView) {
        return;
      }

      if (contentViewRef.current === undefined) {
        contentViewRef.current = {
          top: Math.max(view.top, viewRef.current.top),
          bottom: Math.min(view.bottom, viewRef.current.bottom),
          left: Math.max(view.left, viewRef.current.left),
          right: Math.min(view.right, viewRef.current.right),
        };
      }
      if (contentViewRef.current.top > view.top) {
        contentViewRef.current.top = Math.max(view.top, viewRef.current.top)
      }
      if (contentViewRef.current.bottom < view.bottom) {
        contentViewRef.current.bottom = Math.min(view.bottom, viewRef.current.bottom)
      }
      if (contentViewRef.current.left > view.left) {
        contentViewRef.current.left = Math.max(view.left, viewRef.current.left)
      }
      if (contentViewRef.current.right < view.right) {
        contentViewRef.current.right = Math.min(view.right, viewRef.current.right)
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
    if (contentViewRef.current === undefined) {
      return;
    }

    const size: CanvasSize = calculateCanvasSize(contentViewRef.current)
    if (viewTooLarge(size)) {
      return;
    }

    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d");
    if (context === null) {
      return;
    }

    virtualCanvas.width = size.width;
    virtualCanvas.height = size.height;
    context.translate(-contentViewRef.current.left, -contentViewRef.current.top);
    
    imagesRef.current.forEach(({img, position: {x, y}, view}) => {
      if (contentViewRef.current === undefined || !viewsCollide(view, contentViewRef.current)) {
        return;
      }
      context.drawImage(img, x, y);
    });


    // context.font = "100px Calibri";
    // context.fillStyle = "#FFFFFF"

    // const watermark: string = "🍓camp";
    // const watermarkWidth: TextMetrics = context.measureText(watermark);

    // console.log(context.measureText(watermark));
    // context.fillText(
    //   "🍓camp",
    //   -contentViewRef.current.left + (size.width / 2) - Math.floor(watermarkWidth.width),
    //   // -viewRef.current.top - size.height + 5,
    //   0,
    // );

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = `${name}_${size.width}x${size.height}.png`;
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
      <Button
        onClick={save}
        disabled={outputDisabled}
        variant="contained"
        sx={{position: "absolute", bottom: 0}}
      >
          Output
      </Button>
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


/**
 * Calculate the canvas size from a view.
 * @param view The view.
 * @returns The canvas size.
 */
const calculateCanvasSize = ({top, bottom, left, right}: View): CanvasSize => ({
  width: right - left, 
  height: bottom - top,
}) 

/**
 * Determine if the view is too large to render.
 * 
 * @param width The image width.
 * @param height The image height.
 * @returns If the view is too large.
 */
const viewTooLarge = ({width, height}: CanvasSize): boolean => {
  return width * height > 268435456;
};
