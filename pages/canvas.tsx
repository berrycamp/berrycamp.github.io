import {Button} from "@mui/material";
import city from "data/temp/city.json";
import {useExtentCanvas} from "logic/canvas/useExtentCanvas";
import {CampHead} from "modules/head/CampHead";
import {NextPage} from "next";
import {Fragment, useCallback, useEffect, useRef, useState} from "react";

/**
 * TODO: calculate from image size.
 */
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;

/**
 * Render a scrollable and pannable canvas.
 * TODO: Add touch zoom.
 * 
 * Adapted from: https://theleo.zone/posts/html-canvas-pan-zoom-react/ 
 */
export const CanvasPage: NextPage<ImageCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [images, setImages] = useState<{image: HTMLImageElement, x: number, y: number}[]>([]);

  const handleExport = () => {
    if (canvasRef.current === null) {
      return;
    }

    const link = document.createElement("a");
    link.download = "file.png";
    link.href = canvasRef.current.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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

  const {x, y} = city.canvas.position

  useExtentCanvas(canvasRef, handleDraw, {x: -x, y: -y}, 1 / 16);

  /**
   * Load the image and set it.
   */
  useEffect(() => {
    const paths: {src: string, x: number, y: number}[] = Object.entries(city.rooms).map(([id, {canvas: {position: {x, y}}}]) => ({
      src: `https://cdn.berry.camp/file/berrycamp/images/rooms/city/a/${id}.png`,
      x,
      y,
    }));

    // [
    //   {
    //     src: "/canvas/sr.png",
    //     x: 0,
    //     y: 0,
    //   },
    // {
    //   src: "/canvas/1.png",
    //   x: 0,
    //   y: 0,
    // },
    // {
    //   src: "/canvas/2.png",
    //   x: 240,
    //   y: -180,
    // }
    // ];

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
      <Button onClick={handleExport}>Export</Button>
    </Fragment>
  )
}

export default CanvasPage;

interface ImageCanvasProps {
}
