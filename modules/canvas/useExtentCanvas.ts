import {RefObject, useCallback, useEffect, useRef, useState} from "react";

export type UseExtentCanvas = (options: CanvasOptions) => ExtentCanvas

export interface CanvasOptions {
  canvasRef: RefObject<HTMLCanvasElement>,
  defaultView?: View,
  onDraw?: (context: CanvasRenderingContext2D) => void,
  onViewChange?: (view: View) => void,
}

/**
 * Give a canvas an extent that can be panned and zoomed.
 */
export const useExtentCanvas: UseExtentCanvas = ({
  canvasRef,
  onDraw,
  onViewChange,
  defaultView,
}) => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const cursorPosRef = useRef<Point>(origin);
  const prevCursorPosRef = useRef<Point>(origin);

  const offsetRef = useRef<Point>(defaultView?.offset ?? origin);
  const scaleRef = useRef<number>(defaultView?.scale ?? 1);

  const isDraggingRef = useRef<boolean>(false);

  /**
   * Update the canvas view.
   */
  const setView: ViewCallback = useCallback(({offset, scale}) => {
    if (offset) {
      offsetRef.current = offset;
    }
    if (scale) {
      scaleRef.current = scale;
    }
  }, [])

  /**
   * Redraw the canvas.
   */
  const redraw = useCallback(() => {
    if (context === null) {
      return;
    }
    
    context.imageSmoothingEnabled = false;

    const width: number = context.canvas.width;
    const height: number = context.canvas.height;

    context.resetTransform();
    context.scale(scaleRef.current, scaleRef.current);
    context.translate(offsetRef.current.x, offsetRef.current.y);

    // Wipe slightly more than the visible canvas to prevent visual issues on mouse leave.
    context.clearRect(
      -offsetRef.current.x - width,
      -offsetRef.current.y - height,
      (width / scaleRef.current) + 2 * width,
      (height / scaleRef.current) + 2 * height,
    );

    if (onDraw) {
      onDraw(context);
    }
  }, [context, onDraw]);

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
   * Attach context listeners.
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

      const newDiff: Point = scale(diff(cursorPosRef.current, prevCursorPosRef.current), scaleRef.current);
      offsetRef.current = add(offsetRef.current, newDiff);

      redraw();

      if (onViewChange) {
        onViewChange({offset: offsetRef.current, scale: scaleRef.current});
      }
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
        Math.min(scaleRef.current * (1 - event.deltaY / scrollSensitivity), maxScale),
        minScale
      );

      const newOffset = diff(
        offsetRef.current,
        diff(scale(cursorPosRef.current, scaleRef.current), scale(cursorPosRef.current, newScale))
      );

      offsetRef.current = newOffset;
      scaleRef.current = newScale;

      redraw();

      if (onViewChange) {
        onViewChange({offset: offsetRef.current, scale: scaleRef.current});
      }
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
   * Init the context.
   */
   useEffect(() => {
    if (context === null) {
      return;
    }

    redraw();
  }, [context, redraw])

  return {redraw, setView};
}

export interface ExtentCanvas {
  redraw: () => void;
  setView: ViewCallback;
}

export interface Point {
  x: number;
  y: number;
}

export interface View {
  offset: Point;
  scale: number;
}

export type ViewCallback = (view: Partial<View>) => void;

const origin: Point = {x: 0, y: 0};
const scrollSensitivity = 320;
const minScale = 1 / 512;
const maxScale = 64;

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
