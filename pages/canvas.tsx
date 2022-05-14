import {useExtentCanvas} from "logic/canvas/useExtentCanvas";
import {CampHead} from "modules/head/CampHead";
import {NextPage} from "next";
import {Fragment, useCallback, useEffect, useRef, useState} from "react";

/**
 * TODO: calculate from image size.
 */
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

/**
 * Render a scrollable and pannable canvas.
 * TODO: Add touch zoom.
 * 
 * Adapted from: https://theleo.zone/posts/html-canvas-pan-zoom-react/ 
 */
export const CanvasPage: NextPage<ImageCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [image, setImage] = useState<HTMLImageElement | undefined>();

  /**
   * Draw to the canvas.
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (image === undefined) {
      return;
    }

    context.drawImage(image, 50, 50);
  }, [image]);

  const {} = useExtentCanvas(canvasRef, handleDraw);

  /**
   * Load the image and set it.
   */
  useEffect(() => {
    const image = new Image();
    image.src = "/canvas/1.png";
    image.onload = () => {
      setImage(image);
    }
  }, []);

  return (
    <Fragment>
      <CampHead
        description={"Test display canvas"}
        image={"farewell/1/1/2"}
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          imageRendering: "pixelated",
          display: "block",
        }}
      >
      </canvas>
    </Fragment>
  )
}

export default CanvasPage;

interface ImageCanvasProps {
}
