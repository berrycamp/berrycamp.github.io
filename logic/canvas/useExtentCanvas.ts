import {RefObject, useCallback, useEffect, useRef, useState} from "react";

/**
 * Give a canvas an extent that can be panned and zoomed.
 * 
 * @param canvasRef The ref of the canvas element.
 * @param onDraw Callback to draw content to the canvas.
 */
export const useExtentCanvas = (
  canvasRef: RefObject<HTMLCanvasElement>,
  onDraw: (context: CanvasRenderingContext2D) => void,
): TiledCanvasData => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const cursorPosRef = useRef<Point>(ORIGIN);
  const prevCursorPosRef = useRef<Point>(ORIGIN);

  const offsetRef = useRef<Point>(ORIGIN);
  const scaleRef = useRef<number>(1);

  const isDraggingRef = useRef<boolean>(false);

  /**
   * Redraw the canvas.
   */
  const redraw = useCallback(() => {
    if (context === null) {
      return;
    }

    const {devicePixelRatio: ratio} = window;

    context.clearRect(0, 0, context.canvas.width * ratio, context.canvas.height * ratio);
    context.resetTransform();

    context.scale(scaleRef.current * ratio, scaleRef.current * ratio);
    context.translate(offsetRef.current.x, offsetRef.current.y);
    onDraw(context);
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
   * Init the context.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    context.imageSmoothingEnabled = false;
    redraw();
  }, [context, redraw])

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
    const handleMouseDown = ({pageX, pageY}: MouseEvent) => {
      isDraggingRef.current = true;
      cursorPosRef.current = getCursorOffset(pageX, pageY, context);
    }

    /**
     * Handle panning on mouse move on the canvas.
     */
    const handleMouseMove = ({pageX, pageY}: MouseEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      prevCursorPosRef.current = cursorPosRef.current;
      cursorPosRef.current = getCursorOffset(pageX, pageY, context);

      const newDiff: Point = scale(diff(cursorPosRef.current, prevCursorPosRef.current), scaleRef.current);
      offsetRef.current = add(offsetRef.current, newDiff);

      redraw();
    }

    /**
     * Handle mouse up on the canvas.
     */
    const handleMouseUp = (): void => {
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
        Math.min(scaleRef.current * (1 - event.deltaY / SCALE_SENSITIVITY), MAX_SCALE),
        MIN_SCALE
      );

      const newOffset = diff(
        offsetRef.current,
        diff(scale(cursorPosRef.current, scaleRef.current), scale(cursorPosRef.current, newScale))
      );

      offsetRef.current = newOffset;
      scaleRef.current = newScale;

      redraw();
    }

    // const handleResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    //   const canvasEntry: ResizeObserverEntry | undefined = entries[0];
    //   if (canvasEntry === undefined) {
    //     return;
    //   }

    //   const width = canvasEntry.borderBoxSize[0]?.inlineSize
    //   const height = canvasEntry.borderBoxSize[1]?.inlineSize
    //   if (width === undefined || height === undefined) {
    //     return;
    //   }

    //   redraw();
    // }

    context.canvas.addEventListener("mousedown", handleMouseDown);
    context.canvas.addEventListener("mousemove", handleMouseMove);
    context.canvas.addEventListener("mouseup", handleMouseUp)
    context.canvas.addEventListener("wheel", handleWheel);
    // const resizeObserver = new ResizeObserver(handleResize);
    // resizeObserver.observe(context.canvas)

    return () => {
      context.canvas.removeEventListener("mousedown", handleMouseDown);
      context.canvas.removeEventListener("mousemove", handleMouseMove);
      context.canvas.removeEventListener("mouseup", handleMouseUp)
      context.canvas.removeEventListener("wheel", handleWheel);
      // resizeObserver.disconnect();
    }
  }, [context, redraw]);

  return {}
}

export interface Point {
  x: number;
  y: number;
}

export interface View {
  offset: Point;
  scale: number;
}

export type ViewCallback = (view: View) => void;

export interface TiledCanvasData {
}

const ORIGIN: Point = {x: 0, y: 0};

const SCALE_SENSITIVITY = 500;

const MIN_SCALE = 1 / 32;
const MAX_SCALE = 4;

/**
 * Get the mouse cursor offset relative to the canvas origin.
 * @returns The offset point.
 */
const getCursorOffset = (pageX: number, pageY: number, context: CanvasRenderingContext2D): Point => {
  const {left, top}: DOMRect = context.canvas.getBoundingClientRect();

  console.log(left, top);

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
