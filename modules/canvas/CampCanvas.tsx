import {debounce, ListItemText, Menu, MenuItem, Theme, useTheme} from "@mui/material";
import {NextRouter, useRouter} from "next/router";
import {FC, memo, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {CanvasImage, OnRightClickCallback, OnViewChangeCallback, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({
  rooms,
  imagesRef,
  contentViewRef,
  onViewChange,
  onTeleport,
  onSelectRoom,
}) => {
  const router: NextRouter = useRouter();
  
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<View | undefined>();

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
  const handleViewChange: OnViewChangeCallback = useCallback((view, reason) => {
    if (reason !== "jump") {
      updateViewParams.current();
    }
    
    viewRef.current = view;
    onViewChange(reason);
  }, [onViewChange]);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (canvasRef.current === null) {
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
   * Open the context menu.
   */
  const handleContextMenu: OnRightClickCallback = useCallback(({clientX, clientY, x, y}) => {
    setContextMenu({mouseX: clientX + 2, mouseY: clientY - 6, x, y});
  }, []);

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

  /**
   * Initialise the room image array.
   */
  useEffect(() => {
    imagesRef.current = [];
  }, [imagesRef, rooms]);

  const {setView} = useExtentCanvas({
    canvasRef,
    onDraw: handleDraw,
    onViewChange: handleViewChange,
    onRightClick: handleContextMenu,
  });

  /**
   * Listen for canvas update requests.
   */
  useEffect(() => {
    const channel = new BroadcastChannel(CAMP_CANVAS_CHANNEL);
    channel.onmessage = ({data: view}: {data: View}) => {
      setView(view);
      viewRef.current = view;
    }

    return () => {
      channel.close();
    }
  }, [setView]);

  return (
    <>
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
        <MenuItem onClick={handleTeleport}>
          <ListItemText>Teleport here</ListItemText>
        </MenuItem>
      </Menu>
      <AutoSizer style={{width: "100%",  height: "100%"}} defaultWidth={320} defaultHeight={180}>
        {({width, height}) => (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              background,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              touchAction: "none",
            }}
          />
        )}
      </AutoSizer>
    </>
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
export const viewsCollide = (v1: View, v2: View): boolean => {
  return v1.left < v2.right && v1.right > v2.left && v1.top < v2.bottom && v1.bottom > v2.top;
}
