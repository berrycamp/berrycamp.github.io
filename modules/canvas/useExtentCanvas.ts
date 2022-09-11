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

  const posRef = useRef<Point>(ORIGIN);
  const prevPosRef = useRef<Point>(ORIGIN);
  const viewRef = useRef<CanvasView>({offset: ORIGIN, scale: 1});

  /**
   * Redraw the canvas.
   */
  const draw = useCallback(() => {
    if (context === null || context.canvas.width === 0 || context.canvas.height === 0) {
      return;
    }

    context.resetTransform();

    // Render pixelated.
    context.imageSmoothingEnabled = viewRef.current.scale < 0.5;

    // Hide seams between images.
    context.globalCompositeOperation = "lighter";
    
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

    onDraw?.(context);
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

    onViewChange?.(calculateView(context.canvas, canvasView), "jump");
    draw();
  }, [context, onViewChange, draw])

  /**
   * Set the context.
   */
  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    setContext(canvasRef.current.getContext("2d", {alpha: true}));
  }, [canvasRef, draw]);

  /**
   * Attach draw context listeners.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    let isDragging: boolean = false;
    let prevPinchDistance: number = 0;

    /**
     * Handle mouse down on the canvas.
     */
    const handleMouseDown = ({clientX, clientY}: MouseEvent) => {
      isDragging = true;
      posRef.current = getCursorOffset(clientX, clientY, context);
    }

    /**
     * Handle panning on mouse move on the canvas.
     */
    const handleMouseMove = ({clientX, clientY}: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      prevPosRef.current = posRef.current;
      posRef.current = getCursorOffset(clientX, clientY, context);

      const newDiff: Point = scale(diff(posRef.current, prevPosRef.current), viewRef.current.scale);
      viewRef.current.offset = add(viewRef.current.offset, newDiff);

      onViewChange?.(calculateView(context.canvas, viewRef.current), "move");
      draw();
    }

    /**
     * Handle mouse up on the canvas.
     */
    const handleMouseUp = (): void => {
      isDragging = false;
    }

    /**
     * Handle zooming on wheel events on the canvas.
     */
    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();

      prevPosRef.current = posRef.current;
      posRef.current = getCursorOffset(event.clientX, event.clientY, context);

      const absDelta: number = 1 - (Math.abs(event.deltaY) / SCROLL_SENSITIVITY);
      const positive: boolean = event.deltaY > 0;
      const unclamedScale: number = positive ? viewRef.current.scale * absDelta : viewRef.current.scale / absDelta;
      const clampedScale: number = Math.max(Math.min(unclamedScale, MAX_SCALE), MIN_SCALE);

      const newOffset = diff(
        viewRef.current.offset,
        diff(scale(posRef.current, viewRef.current.scale), scale(posRef.current, clampedScale))
      );

      viewRef.current.offset = newOffset;
      viewRef.current.scale = clampedScale;

      onViewChange?.(calculateView(context.canvas, viewRef.current), "zoom");
      draw();
    };

    const handleTouchStart = ({touches, timeStamp}: TouchEvent) => {
      const [touch1 = EMPTY_TOUCH, touch2 = EMPTY_TOUCH] = touches;
      const diviser = touches.length === 2 ? 2 : 1;
      const x: number = (touch1.clientX + touch2.clientX) / diviser;
      const y: number = (touch1.clientY + touch2.clientY) / diviser;
      
      posRef.current = getCursorOffset(x, y, context);
      prevPosRef.current = posRef.current;

      if (touches.length > 1) {
        prevPinchDistance = getTouchDistance(touch1, touch2);
      }
    }
    
    const handleTouchMove = ({touches, timeStamp}: TouchEvent) => {
      const [touch1 = EMPTY_TOUCH, touch2 = EMPTY_TOUCH] = touches;
      const diviser = touches.length === 2 ? 2 : 1;
      const x: number = (touch1.clientX + touch2.clientX) / diviser;
      const y: number = (touch1.clientY + touch2.clientY) / diviser;

      const newDiff: Point = scale(diff(posRef.current, prevPosRef.current), viewRef.current.scale);
      viewRef.current.offset = add(viewRef.current.offset, newDiff);

      prevPosRef.current = posRef.current;
      posRef.current = getCursorOffset(x, y, context);

      let pinchRatio = 1;
      if (touches.length > 1) {
        const pinchDistance: number = touches.length === 1 ? 1 : getTouchDistance(touch1, touch2);
        pinchRatio =  pinchDistance / prevPinchDistance;
        prevPinchDistance = pinchDistance;
      }
      
      const newScale: number = Math.max(
        Math.min(viewRef.current.scale * pinchRatio, MAX_SCALE),
        MIN_SCALE
      );

      const newOffset = diff(
        viewRef.current.offset,
        diff(scale(posRef.current, viewRef.current.scale), scale(posRef.current, newScale))
      );

      viewRef.current.offset = newOffset;
      viewRef.current.scale = newScale;

      onViewChange?.(calculateView(context.canvas, viewRef.current), "zoom");
      draw();
    };

    context.canvas.addEventListener("mousedown", handleMouseDown);
    context.canvas.addEventListener("mousemove", handleMouseMove);
    context.canvas.addEventListener("mouseup", handleMouseUp);
    context.canvas.addEventListener("mouseleave", handleMouseUp);
    context.canvas.addEventListener("wheel", handleWheel);
    context.canvas.addEventListener("touchstart", handleTouchStart);
    context.canvas.addEventListener("touchmove", handleTouchMove);
    context.canvas.addEventListener("touchend", handleTouchStart);

    return () => {
      context.canvas.removeEventListener("mousedown", handleMouseDown);
      context.canvas.removeEventListener("mousemove", handleMouseMove);
      context.canvas.removeEventListener("mouseup", handleMouseUp)
      context.canvas.removeEventListener("mouseleave", handleMouseUp);
      context.canvas.removeEventListener("wheel", handleWheel);
      context.canvas.removeEventListener("touchstart", handleTouchStart);
      context.canvas.removeEventListener("touchmove", handleTouchMove);
      context.canvas.removeEventListener("touchend", handleTouchStart);
    }
  }, [context, onViewChange, draw]);

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

    draw();
  }, [context, draw])

  /**
   * Redraw the canvas on resize.
   */
  useEffect(() => {
    if (context === null || context.canvas.parentElement === null) {
      return;
    }

    /**
     * Resize the canvas, draw the current view to an offscreen canvas and copy it back after resize
     * to reduce flicker.
     * 
     * @param entries The resize observer entries.
     */
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
      const tempContext: CanvasRenderingContext2D = tempCanvas.getContext("2d", {alpha: true}) as CanvasRenderingContext2D;
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        tempContext.drawImage(context.canvas, 0, 0);
      }

      const entry: ResizeObserverEntry | undefined = entries[0];
      if(entry) {
        context.canvas.width = entry.contentRect.width;
        context.canvas.height = entry.contentRect.height;
      }

      if (context.canvas.width > 0 && context.canvas.height > 0) {
        context.drawImage(tempContext.canvas, viewRef.current.offset.x, viewRef.current.offset.y);
      }
      draw();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(context.canvas.parentElement);

    return () => {
      observer.disconnect();
    }
  }, [context, draw]);

  return {setView, redraw: draw};
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
const EMPTY_TOUCH: PartialTouch = {clientX: 0, clientY: 0};

/**
 * Get the mouse cursor offset relative to the canvas origin.
 * @returns The offset point.
 */
const getCursorOffset = (clientX: number, clientY: number, context: CanvasRenderingContext2D): Point => {
  const {left, top}: DOMRect = context.canvas.getBoundingClientRect();
  return diff({x: clientX, y: clientY}, {x: left, y: top});
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

type PartialTouch = Pick<Touch, "clientX" | "clientY">;

/**
 * Get the distance between two touches.
 * 
 * @param touch1 The first touch.
 * @param touch2 The second touch.
 * @returns The distance.
 */
const getTouchDistance = (touch1: PartialTouch, touch2: PartialTouch): number => {
  return Math.sqrt(Math.pow(touch1.clientX - touch2.clientX, 2) + Math.pow(touch1.clientY - touch2.clientY, 2))
}
