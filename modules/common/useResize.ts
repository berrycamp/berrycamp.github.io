import {MouseEvent, TouchEvent, useCallback, useEffect, useState} from "react";

/**
 * Make an element resizable. Adapted from: https://stackoverflow.com/a/68742668
 * Defaults to horizontally
 */
export const useResize = ({
  maxSize,
  minSize = 0,
  horizontal = true,
}: {
  maxSize?: number,
  minSize?: number,
  horizontal?: boolean,
}): {
  size: number,
  setSize: (newSize: number) => void,
  enableMouse: (event: MouseEvent) => void,
  enableTouch: (event: TouchEvent) => void,
} => {
  const [size, setSize] = useState<number>(0)
  const [resizing, setResizing] = useState<boolean>(false);

  const [touchTarget, setTouchTarget] = useState<EventTarget | undefined>();
  
  const enableMouse = useCallback((event: MouseEvent): void => {
    event.preventDefault();
    setResizing(true);
  }, []);

  const enableTouch = useCallback((event: TouchEvent): void => {
    setResizing(true);
    setTouchTarget(event.currentTarget)
  }, []);

  const disableResize = useCallback((): void => {
    setResizing(false);
    setTouchTarget(undefined);
  }, []);

  const resize = useCallback((clientVal: number) => {
    const minBounded = Math.max(clientVal, minSize);
    const minMaxBounded = maxSize ? Math.min(minBounded, maxSize) : minBounded;
    setSize(minMaxBounded);
  }, [maxSize, minSize]);

  const mouseResize = useCallback(({clientX, clientY}: MouseEvent) => {
    if (!resizing) {
      return;
    }
    resize(horizontal ? clientX : clientY)
  }, [horizontal, resize, resizing]);

  const touchResize = useCallback(({touches}: TouchEvent) => {
    if (!resizing) {
      return;
    }

    const touch = touches[0];
    if (touch === undefined) {
      return;
    }

    resize(horizontal ? touch.clientX : touch.clientY)
  }, [horizontal, resize, resizing]);

  useEffect(() => {
    document.addEventListener("mousemove", mouseResize as never);
    document.addEventListener("mouseup", disableResize);

    return () => {
      document.removeEventListener("mousemove", mouseResize as never);
      document.removeEventListener("mouseup", disableResize);
    };
  }, [disableResize, mouseResize]);

  useEffect(() => {
    if (touchTarget === undefined) {
      return;
    }

    touchTarget.addEventListener("touchmove", touchResize as never);
    touchTarget.addEventListener("touchend", disableResize);

    return () => {
      touchTarget.removeEventListener("touchmove", touchResize as never);
      touchTarget.removeEventListener("touchend", disableResize);
    }
  }, [disableResize, mouseResize, touchResize, touchTarget]);

  return {size, enableMouse, enableTouch, setSize};
}
