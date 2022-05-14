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
): void => {
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

    console.log(offsetRef.current);

    const width: number = context.canvas.width * ratio;
    const height: number = context.canvas.height * ratio;

    // Wipe slightly more than the visible canvas to prevent visual issues on mouse leave.
    context.clearRect(
      -offsetRef.current.x - width,
      -offsetRef.current.y - height,
      (width / scaleRef.current) + 2 * width,
      (height / scaleRef.current) + 2 * height,
    );
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

    context.canvas.addEventListener("mousedown", handleMouseDown);
    context.canvas.addEventListener("mousemove", handleMouseMove);
    context.canvas.addEventListener("mouseup", handleMouseUp)
    context.canvas.addEventListener("wheel", handleWheel);

    return () => {
      context.canvas.removeEventListener("mousedown", handleMouseDown);
      context.canvas.removeEventListener("mousemove", handleMouseMove);
      context.canvas.removeEventListener("mouseup", handleMouseUp)
      context.canvas.removeEventListener("wheel", handleWheel);
    }
  }, [context, redraw]);
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
