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

  const [images, setImages] = useState<{image: HTMLImageElement, x: number, y: number}[]>([]);

  /**
   * Draw to the canvas.
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (images === undefined) {
      return;
    }

    images.forEach(({image, x, y}) => {
      context.drawImage(image, x, y);
    })
  }, [images]);

  useExtentCanvas(canvasRef, handleDraw);

  /**
   * Load the image and set it.
   */
  useEffect(() => {
    const paths: {src: string, x: number, y: number}[] = [
      {
        src: "/canvas/1.png",
        x: 0,
        y: 0,
      },
      {
        src: "/canvas/2.png",
        x: 240,
        y: -180,
      }
    ];

    paths.forEach(({src, x, y}) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        setImages(prevImages => ([...prevImages, {image, x, y}]));
      }
    })
  }, []);

  return (
    <Fragment>
      <CampHead
        description={"Test display canvas"}
        image={"farewell/1/1/2"}
      />
      {/* <Box width="100%" style={{height: "calc(100vh - 30px)"}}>
        <AutoSizer>
          {({height, width}) => ( */}
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
      {/* )}
        </AutoSizer>
      </Box> */}
    </Fragment>
  )
}

export default CanvasPage;

interface ImageCanvasProps {
}
