import {EventHandler, MouseEvent, SyntheticEvent, useCallback, useEffect, useState} from "react";

/**
 * Make an element resizable. From: https://stackoverflow.com/a/68742668
 * Defaults to vertical.
 */
export const useResize = ({
  initialSize,
  maxSize,
  minSize = 0,
  horizontal = false,
}: {
  initialSize: number,
  maxSize?: number,
  minSize?: number,
  horizontal?: boolean,
}): {size: number, enableResize: EventHandler<SyntheticEvent>} => {
  const [size, setSize] = useState<number>(initialSize)
  const [resizing, setResizing] = useState<boolean>(false);

  const enableResize = useCallback((event: MouseEvent<HTMLElement>): void => {
    console.log(event.clientX, event.pageX, event.screenX)
    event.preventDefault();
    setResizing(true);
  }, []);

  const disableResize = useCallback((): void => {
    setResizing(false);
  }, []);

  const resize = useCallback(({clientX, clientY}: MouseEvent) => {
    if (!resizing) {
      return;
    }
    const clientVal = horizontal ? clientY : clientX;
    const minBounded = Math.max(clientVal, minSize);
    const minMaxBounded = maxSize ? Math.min(minBounded, maxSize) : minBounded;
    setSize(minMaxBounded);
  }, [horizontal, maxSize, minSize, resizing]);

  useEffect(() => {
    document.addEventListener("pointermove", resize);
    document.addEventListener("pointerup", disableResize);

    return () => {
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", disableResize);
    }
  }, [disableResize, resize])

  return {size, enableResize};
}
