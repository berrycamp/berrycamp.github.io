import {debounce} from "@mui/material";
import {RefObject, useCallback, useEffect, useRef, useState} from "react";

export type UseExtentCanvas = (options: CanvasOptions) => ExtentCanvas

export interface CanvasOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  setView?: SetViewCallback;
  onDraw?: (context: CanvasRenderingContext2D) => void;
  onViewChange?: OnViewChangeCallback;
  onRightClick?: OnRightClickCallback;
}

/**
 * Give a canvas an extent that can be panned and zoomed.
 */
export const useExtentCanvas: UseExtentCanvas = ({
  canvasRef,
  onDraw,
  onViewChange,
  onRightClick,
}) => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const cursorPosRef = useRef<Point>(ORIGIN);
  const prevCursorPosRef = useRef<Point>(ORIGIN);
  const viewRef = useRef<CanvasView>({offset: ORIGIN, scale: 1});

  const isDraggingRef = useRef<boolean>(false);

  /**
   * Redraw the canvas.
   */
  const redraw = useCallback(() => {
    if (context === null) {
      return;
    }

    // Render pixelated.
    context.imageSmoothingEnabled = false;

    // Hide seams between images.
    context.globalCompositeOperation = "lighter";

    context.resetTransform();
    
    context.scale(viewRef.current.scale, viewRef.current.scale);
    context.translate(viewRef.current.offset.x, viewRef.current.offset.y);

    const {width, height} = context.canvas;

    // Wipe slightly more than the visible canvas to prevent visual issues on mouse leave.
    context.clearRect(
      -viewRef.current.offset.x - width,
      -viewRef.current.offset.y - height,
      (width / viewRef.current.scale) + 2 * width,
      (height / viewRef.current.scale) + 2 * height,
    );

    if (onDraw) {
      onDraw(context);
    }
  }, [context, onDraw]);

  /**
   * Update the canvas view.
   */
  const setView: SetViewCallback = useCallback((view): void => {
    if (context === null) {
      return;
    }

    const canvasView: CanvasView = calculateCanvasView(context.canvas, view);
    viewRef.current.offset = canvasView.offset;
    viewRef.current.scale = canvasView.scale;

    if (onViewChange) {
      onViewChange(calculateView(context.canvas, canvasView), "jump");
    }

    redraw();
  }, [context, onViewChange, redraw])

  /**
   * Set the context.
   */
  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    setContext(canvasRef.current.getContext("2d"));
  }, [canvasRef]);

  /**
   * Attach draw context listeners.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    /**
     * Handle mouse down on the canvas.
     */
    const handlePointerDown = ({pageX, pageY}: PointerEvent) => {
      isDraggingRef.current = true;
      cursorPosRef.current = getCursorOffset(pageX, pageY, context);
    }

    /**
     * Handle panning on mouse move on the canvas.
     */
    const handlePointerMove = ({pageX, pageY}: MouseEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      prevCursorPosRef.current = cursorPosRef.current;
      cursorPosRef.current = getCursorOffset(pageX, pageY, context);

      const newDiff: Point = scale(diff(cursorPosRef.current, prevCursorPosRef.current), viewRef.current.scale);
      viewRef.current.offset = add(viewRef.current.offset, newDiff);

      if (onViewChange) {
        onViewChange(calculateView(context.canvas, viewRef.current), "move");
      }

      redraw();
    }

    /**
     * Handle mouse up on the canvas.
     */
    const handlePointerUp = (): void => {
      isDraggingRef.current = false;
    }

    /**
     * Handle zooming on wheel events on the canvas.
     */
    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();

      prevCursorPosRef.current = cursorPosRef.current;
      cursorPosRef.current = getCursorOffset(event.pageX, event.pageY, context);

      const newScale: number = Math.max(
        Math.min(viewRef.current.scale * (1 - event.deltaY / SCROLL_SENSITIVITY), MAX_SCALE),
        MIN_SCALE
      );

      const newOffset = diff(
        viewRef.current.offset,
        diff(scale(cursorPosRef.current, viewRef.current.scale), scale(cursorPosRef.current, newScale))
      );

      viewRef.current.offset = newOffset;
      viewRef.current.scale = newScale;

      if (onViewChange) {
        onViewChange(calculateView(context.canvas, viewRef.current), "zoom");
      }

      redraw();
    };

    // let prevPinchDistance: number | null = null;
    
    // const handleTouchMove = ({touches}: TouchEvent) => {
    //   const touch1: Touch | undefined = touches[0];
    //   const touch2: Touch | undefined = touches[1];
    //   if (touches.length !== 2 || touch1 === undefined || touch2 === undefined) {
    //     return;
    //   }

    //   const distance: number = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2));
      
    //   if (prevPinchDistance === null) {
    //     prevPinchDistance = distance;
    //   } else {
    //     const scaledDistance = distance / SCALE_SENSITIVITY;
    //     const newScale: number = Math.max(
    //       Math.min(scaleRef.current + (1 - (scaledDistance / prevPinchDistance)), MAX_SCALE),
    //       MIN_SCALE
    //     );

    //     scaleRef.current = newScale;
    //     redraw();
    //   }
    // };

    // context.canvas.addEventListener("touchmove", handleTouchMove);
    context.canvas.addEventListener("pointerdown", handlePointerDown);
    context.canvas.addEventListener("pointermove", handlePointerMove);
    context.canvas.addEventListener("pointerup", handlePointerUp);
    context.canvas.addEventListener("pointerleave", handlePointerUp);
    context.canvas.addEventListener("wheel", handleWheel);

    return () => {
      // context.canvas.removeEventListener("touchmove", handleTouchMove);
      context.canvas.removeEventListener("pointerdown", handlePointerDown);
      context.canvas.removeEventListener("pointermove", handlePointerMove);
      context.canvas.removeEventListener("pointerup", handlePointerUp)
      context.canvas.removeEventListener("pointerleave", handlePointerUp);
      context.canvas.removeEventListener("wheel", handleWheel);
    }
  }, [context, onViewChange, redraw]);

  /**
   * Attach other listeners.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    /**
     * Handle right click events on the canvas.
     */
    const handleRightClick = (event: MouseEvent): void => {
      event.preventDefault();
      if (onRightClick) {
        const {clientX, clientY} = event;
        const {left, top} = context.canvas.getBoundingClientRect();
        onRightClick({clientX, clientY, ...calculateCanvasPosition({
          view: viewRef.current,
          canvasX: clientX - left,
          canvasY: clientY - top,
        })});
      }
    }

    context.canvas.addEventListener("contextmenu", handleRightClick);

    return () => {
      context.canvas.removeEventListener("contextmenu", handleRightClick);
    }
  }, [context, onRightClick]);

  /**
   * Init the context.
   */
   useEffect(() => {
    if (context === null) {
      return;
    }

    redraw();
  }, [context, redraw])

  /**
   * Redraw the canvas on resize.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    const resize = debounce(redraw, 10);

    const observer = new ResizeObserver(resize);
    observer.observe(context.canvas);
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    }
  }, [context, redraw]);

  return {setView, redraw};
}

export interface ExtentCanvas {
  setView: SetViewCallback;
  redraw: () => void;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface View {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasView {
  offset: Point;
  scale: number;
}

export type SetViewCallback = (view: View) => void;

export type OnViewChangeCallback = (view: View, reason: ViewChangeReason) => void

export type OnRightClickCallback = ({
  clientX, clientY, x, y,
}: {
  clientX: number, clientY: number, x: number, y: number,
}) => void;

export interface CanvasImage {
  img: CanvasImageSource;
  position: Point;
  view: View;
}

/**
 * The reasons the view was changed
 */
export type ViewChangeReason = "move" | "zoom" | "jump"

const ORIGIN: Point = {x: 0, y: 0};
const SCROLL_SENSITIVITY = 320;
const MIN_SCALE = 1 / 512;
const MAX_SCALE = 64;

/**
 * Get the mouse cursor offset relative to the canvas origin.
 * @returns The offset point.
 */
const getCursorOffset = (pageX: number, pageY: number, context: CanvasRenderingContext2D): Point => {
  const {left, top}: DOMRect = context.canvas.getBoundingClientRect();
  return diff({x: pageX, y: pageY}, {x: left, y: top});
}

/**
 * Get the difference between two points.
 * 
 * @param p1 Point 1.
 * @param p2 Point 2.
 * @returns The difference between the points.
 */
const diff = (p1: Point, p2: Point): Point => ({x: p1.x - p2.x, y: p1.y - p2.y});

/**
 * Add two points.
 * 
 * @param p1 Point 1.
 * @param p2 Point 2.
 * @returns The sum of two points.
 */
const add = (p1: Point, p2: Point): Point => ({x: p1.x + p2.x, y: p1.y + p2.y});

/**
 * Scale a point.
 * 
 * @param p The point.
 * @param scale The amount to scale.
 * @returns The scaled point.
 */
const scale = (p: Point, scale: number): Point => ({x: p.x / scale, y: p.y / scale});

/**
 * Calculate the view from the canvas size and canvas view.
 * 
 * @param - The size of the canvas.
 * @param - The canvas view.
 * @returns The view.
 */
const calculateView = ({width, height}: CanvasSize, {offset: {x, y}, scale}: CanvasView): View => {
  x *= -1;
  y *= -1;
  
  const left: number = Math.round(x);
  const right: number = Math.round(x + (width / scale));
  const top: number = Math.round(y);
  const bottom: number = Math.round(y + (height / scale));

  return {top, bottom, left, right};
}

/**
 * Calculate the canvas view from the canvas size and bounding box.
 * 
 * @param - The size of the canvas.
 * @param - The view.
 * @returns The canvas view.
 */
const calculateCanvasView = ({width, height}: CanvasSize, {top, bottom, left, right}: View): CanvasView => {
  // Calculate the dimensions of the box.
  const boxWidth: number = right - left;
  const boxHeight: number = bottom - top - 4;
  
  // Scale to the min of width or height.
  const scale = Math.min(width / boxWidth, height / boxHeight);

  // Calculate the scaled offset.
  let x = left + (right - left) / 2 - width / (2 * scale);
  let y = top + boxHeight / 2 - height / (2 * scale);

  // Reverse the offset signs.
  x *= -1;
  y *= -1;

  return {scale, offset: {x, y}};
}

/**
 * Calculate the position on the canvas.
 * 
 * @returns The x, y canvas position.
 */
const calculateCanvasPosition = ({
  view: {offset, scale},
  canvasX,
  canvasY,
}: {
  view: CanvasView;
  canvasX: number;
  canvasY: number;
}): {x: number, y: number} => ({
  x: Math.round(offset.x * -1 + canvasX / scale),
  y: Math.round(offset.y * -1 + canvasY / scale),
});
