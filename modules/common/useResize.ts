import {useCallback, useEffect, useState} from "react";

/**
 * Make an element resizable. From: https://stackoverflow.com/a/68742668
 */
export const useResize = ({
  initialWidth,
  minWidth
}: {
  initialWidth: number,
  minWidth: number,
}): {width: number, enableResize: () => void} => {
  const [width, setWidth] = useState<number>(initialWidth)
  const [resizing, setResizing] = useState<boolean>(false);

  const enableResize = useCallback((): void => {
    setResizing(true);
  }, []);

  const disableResize = useCallback((): void => {
    setResizing(false);
  }, []);

  const resize = useCallback(({clientX}: MouseEvent) => {
    if (!resizing || clientX < minWidth) {
      return;
    }
    setWidth(clientX);
  }, [minWidth, resizing]);

  useEffect(() => {
    document.addEventListener("pointermove", resize);
    document.addEventListener("pointerup", disableResize);

    return () => {
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", disableResize);
    }
  }, [disableResize, resize])

  return {width, enableResize};
}
