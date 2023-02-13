import {Fullscreen} from "@mui/icons-material";
import {Box, debounce, IconButton, ListItemText, Menu, MenuItem, Theme, useTheme} from "@mui/material";
import {ExtentCanvasArgs, ExtentCanvasPoint, ExtentCanvasViewBox, useExtentCanvas} from "extent-canvas";
import {NextRouter, useRouter} from "next/router";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import {useCampContext} from "../provide/CampContext";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({
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
  const viewRef = useRef<ExtentCanvasViewBox | undefined>();

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number,
    mouseY: number,
    x: number,
    y: number,
  } | null>(null);

  const updateViewParams = useRef<() => void>(debounce(() => {
    if (viewRef.current === undefined) {
      return;
    }

    const {areaId, chapterId, sideId} = router.query;
    router.replace({query: {areaId, chapterId, sideId, ...viewRef.current}}, undefined, {shallow: true})
  }, 1000));

  /**
   * Set the current view.
   */
  const handleViewBoxChange: Exclude<ExtentCanvasArgs["onViewBoxChange"], undefined> = useCallback((view, reason) => {
    if (reason !== "set") {
      updateViewParams.current();
    }
    
    viewRef.current = view;
    onViewChange(reason);
  }, [onViewChange]);

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
      if (viewRef.current === undefined) {
        return;
      }

      // Don't render if not in view.
      const inView: boolean = viewsCollide(view, viewRef.current);
      if (!inView) {
        return;
      }

      if (contentViewRef.current === undefined) {
        contentViewRef.current = {
          top: Math.max(view.top, viewRef.current.top),
          bottom: Math.min(view.bottom, viewRef.current.bottom),
          left: Math.max(view.left, viewRef.current.left),
          right: Math.min(view.right, viewRef.current.right),
        };
      }
      if (contentViewRef.current.top > view.top) {
        contentViewRef.current.top = Math.max(view.top, viewRef.current.top)
      }
      if (contentViewRef.current.bottom < view.bottom) {
        contentViewRef.current.bottom = Math.min(view.bottom, viewRef.current.bottom)
      }
      if (contentViewRef.current.left > view.left) {
        contentViewRef.current.left = Math.max(view.left, viewRef.current.left)
      }
      if (contentViewRef.current.right < view.right) {
        contentViewRef.current.right = Math.min(view.right, viewRef.current.right)
      }

      const loadedImage: CanvasImage | undefined = imagesRef.current[i];
      if (loadedImage) {
        const {img, position: {x, y}} = loadedImage;
        context.drawImage(img, x, y);
      } else {
        const img = new Image();
        img.src = image;
        img.crossOrigin = "anonymous";
        imagesRef.current[i] = {img, position, view};
        img.onload = () => {
          context.drawImage(img, position.x, position.y);
        }
      }
    });
  }, [contentViewRef, imagesRef, rooms]);

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

  const {setViewBox} = useExtentCanvas({
    ref,
    onContextInit: setContext,
    onDraw: handleDraw,
    onViewBoxChange: handleViewBoxChange,
  });

 

  /**
   * Add a listener for context menu right clicks.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (viewRef.current === undefined) {
        return;
      }

      const {clientX, clientY} = event;
      const rect: DOMRect = context.canvas.getBoundingClientRect();

      setContextMenu({
        mouseX: clientX + 2,
        mouseY: clientY - 6,
        x: viewRef.current.left + clientX - rect.left,
        y: viewRef.current.right + clientY - rect.top,
      });
    }

    context.canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      context.canvas.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [context])

  /**
   * Initialise the room image array.
   */
  useEffect(() => {
    imagesRef.current = [];
  }, [imagesRef, rooms]);

  /**
   * Listen for canvas update requests.
   */
  useEffect(() => {
    const channel = new BroadcastChannel(CAMP_CANVAS_CHANNEL);
    channel.onmessage = ({data: viewBox}: {data: ExtentCanvasViewBox}) => {
      setViewBox(viewBox);
      viewRef.current = viewBox;
    }

    return () => {
      channel.close();
    }
  }, [setViewBox]);


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
