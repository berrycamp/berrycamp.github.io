import {Fullscreen} from "@mui/icons-material";
import {Box, debounce, IconButton, ListItemText, Menu, MenuItem, Theme, useTheme} from "@mui/material";
import {calculateCanvasView, ExtentCanvasArgs, ExtentCanvasPoint, ExtentCanvasView, ExtentCanvasViewBox, useExtentCanvas} from "extent-canvas";
import {NextRouter, useRouter} from "next/router";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import {useCampContext} from "../provide/CampContext";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({
  view,
  rooms,
  imagesRef,
  contentViewRef,
  onViewChange,
  onTeleport,
  onSelectRoom,
}) => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const {settings: {everest}} = useCampContext();

  const router: NextRouter = useRouter();
  
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const ref = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<ExtentCanvasView | undefined>();
  const viewBoxRef = useRef<ExtentCanvasViewBox | undefined>();

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number,
    mouseY: number,
    x: number,
    y: number,
  } | null>(null);

  const updateViewParams = useRef<() => void>(debounce(() => {
    if (viewBoxRef.current === undefined) {
      return;
    }

    const {areaId, chapterId, sideId} = router.query;
    router.replace({query: {areaId, chapterId, sideId, ...viewBoxRef.current}}, undefined, {shallow: true})
  }, 150));

  /**
   * Set the current view.
   */
  const handleViewBoxChange: Exclude<ExtentCanvasArgs["onViewBoxChange"], undefined> = useCallback((view, reason) => {
    if (reason !== "set") {
      updateViewParams.current();
    }
    
    viewBoxRef.current = view;
    onViewChange(reason);
  }, [onViewChange]);
  
  const handleViewChange: Exclude<ExtentCanvasArgs["onViewChange"], undefined> = useCallback((view) => {
    viewRef.current = view;
  }, [])

  /**
   * Handle canvas customization.
   */
  const handleBeforeDraw: Exclude<ExtentCanvasArgs["onBeforeDraw"], undefined> = useCallback((context) => {
    if (viewRef.current === undefined) {
      return;
    }

    // Sharp images.
    context.imageSmoothingEnabled = viewRef.current.scale <= 1;
    // Hide edge seams.
    context.globalCompositeOperation = "lighter";
  }, []);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (ref.current === null) {
      return;
    }

    contentViewRef.current = undefined;

    /**
     * Load new rooms.
     */
    rooms.forEach(({image, position, view}, i) => {
      if (viewBoxRef.current === undefined) {
        return;
      }

      // Don't render if not in view.
      const inView: boolean = viewsCollide(view, viewBoxRef.current);
      if (!inView) {
        return;
      }

      if (contentViewRef.current === undefined) {
        contentViewRef.current = {
          top: Math.max(view.top, viewBoxRef.current.top),
          bottom: Math.min(view.bottom, viewBoxRef.current.bottom),
          left: Math.max(view.left, viewBoxRef.current.left),
          right: Math.min(view.right, viewBoxRef.current.right),
        };
      }
      if (contentViewRef.current.top > view.top) {
        contentViewRef.current.top = Math.max(view.top, viewBoxRef.current.top)
      }
      if (contentViewRef.current.bottom < view.bottom) {
        contentViewRef.current.bottom = Math.min(view.bottom, viewBoxRef.current.bottom)
      }
      if (contentViewRef.current.left > view.left) {
        contentViewRef.current.left = Math.max(view.left, viewBoxRef.current.left)
      }
      if (contentViewRef.current.right < view.right) {
        contentViewRef.current.right = Math.min(view.right, viewBoxRef.current.right)
      }

      const loadedImage: CanvasImage | undefined = imagesRef.current[i];
      if (loadedImage) {
        const {img, position: {x, y}} = loadedImage;
        context.drawImage(img, x, y);
      } else {
        const img = new Image();
        img.src = image;
        imagesRef.current[i] = {img, position, view};
        img.onload = () => {
          context.drawImage(img, position.x, position.y);
        }
      }
    });
  }, [contentViewRef, imagesRef, rooms]);

  const {setViewBox, draw} = useExtentCanvas({
    ref,
    onContextInit: setContext,
    onBeforeDraw: handleBeforeDraw,
    onDraw: handleDraw,
    onViewBoxChange: handleViewBoxChange,
    onViewChange: handleViewChange,
  });

  /**
   * Close the context menu;
   */
  const handleClose = () => {
    setContextMenu(null);
  }

  /**
   * Teleport and close the context menu.
   */
  const handleTeleport = () => {
    if (contextMenu) {
      onTeleport(contextMenu.x, contextMenu.y);
    }
    handleClose();
  };

  /**
   * Find the room and close the context menu.
   */
  const handleSelectRoom = () => {
    if (contextMenu) {
      onSelectRoom(contextMenu.x, contextMenu.y);
    }
    handleClose();
  };

  const handleFullscreen = () => {
    void ref.current?.requestFullscreen();
  }

  /**
   * Add a listener for context menu right clicks.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (viewBoxRef.current === undefined) {
        return;
      }

      const {clientX, clientY} = event;
      const rect: DOMRect = context.canvas.getBoundingClientRect();

      setContextMenu({
        mouseX: clientX + 2,
        mouseY: clientY - 6,
        x: viewBoxRef.current.left + clientX - rect.left,
        y: viewBoxRef.current.right + clientY - rect.top,
      });
    }

    context.canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      context.canvas.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [context]);

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
      if (viewBoxRef.current === undefined) {
        return;
      }

      const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
      const tempContext: CanvasRenderingContext2D = tempCanvas.getContext("2d", {alpha: true}) as CanvasRenderingContext2D;
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        tempContext.drawImage(context.canvas, 0, 0);
      }

      const isFullscreen: boolean = Boolean(document.fullscreenElement);
      const entry: ResizeObserverEntry | undefined = entries[0];
      if (isFullscreen) {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
      } else if(entry) {
        context.canvas.width = entry.contentRect.width;
        context.canvas.height = entry.contentRect.height;
      }

      if (context.canvas.width > 0 && context.canvas.height > 0) {
        const {offset} = calculateCanvasView(tempContext.canvas, viewBoxRef.current);
        context.drawImage(tempContext.canvas, offset.x, offset.y);
      }
      draw();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(context.canvas);

    // Set the initial size.
    const {width, height} = context.canvas.getBoundingClientRect();
    context.canvas.width = width;
    context.canvas.height = height;

    return () => {
      observer.disconnect();
    }
  }, [context, draw]);

  /**
   * Initialise the room image array.
   */
  useEffect(() => {
    imagesRef.current = [];
  }, [imagesRef, rooms]);

  useEffect(() => {
    if (view === undefined) {
      return;
    }
    
    setViewBox(view);
    viewBoxRef.current = view;
  }, [setViewBox, view]);


  return (
    <Box position="relative" width="100%" height="100%">
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        {...contextMenu && {anchorPosition: {top: contextMenu.mouseY, left: contextMenu.mouseX}}}
        onContextMenu={event => {
          event.preventDefault();
          handleClose();
        }}
      >
        <MenuItem onClick={handleSelectRoom}>
          <ListItemText>Select room</ListItemText>
        </MenuItem>
        {everest && (
          <MenuItem onClick={handleTeleport}>
            <ListItemText>Teleport here</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <canvas
        ref={ref}
        style={{
          background,
          position: "relative",
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
      <IconButton
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1,
          }}
          onClick={handleFullscreen}
        >
          <Fullscreen/>
        </IconButton>
    </Box>
  );
});

export const CAMP_CANVAS_CHANNEL = "campcanvas" as const;

/**
 * Determine if two views collide.
 * 
 * @param v1 The first view.
 * @param v2 The second view.
 * @returns True if v1 and v2 collide.
 */
export const viewsCollide = (v1: ExtentCanvasViewBox, v2: ExtentCanvasViewBox): boolean => {
  return v1.left < v2.right && v1.right > v2.left && v1.top < v2.bottom && v1.bottom > v2.top;
}

export interface CanvasImage {
  img: CanvasImageSource;
  position: ExtentCanvasPoint;
  view: ExtentCanvasViewBox;
}
