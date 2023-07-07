import {Clear, ScreenshotMonitor, Search} from "@mui/icons-material";
import {Box, Button, IconButton, TextField} from "@mui/material";
import {ExtentCanvasSize, ExtentCanvasViewBox} from "extent-canvas";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {ParsedUrlQuery} from "querystring";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {CampCanvas, CanvasImage, CanvasRoom, viewsCollide} from "~/modules/canvas";
import {showRoom} from "~/modules/chapter";
import {ResizableDivider} from "~/modules/common/resizableDivider/ResizableDivider";
import {useMobile} from "~/modules/common/useMobile";
import {useResize} from "~/modules/common/useResize";
import {Area, Chapter, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getRoomImageUrl, getRoomPreviewUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaData, ChapterData, CheckpointData, CheckpointDataExtended, MapRoomMenu, RoomData, SideData} from "~/modules/map";
import {MapEntityMenu} from "~/modules/map/MapEntityMenu";
import {useCampContext} from "~/modules/provide/CampContext";
import {generateRoomTags} from "~/modules/room";
import {teleport} from "~/modules/teleport/teleport";
import {CampPage} from "~/pages/_app";

const headerSize: number = 48;
const halfDividerSize: number = 16;

const ROOM_WIDTH = 320;
const ROOM_HEIGHT = 184;

export const SideMapPage: CampPage<SideMapPageProps> = ({area, chapter, side}) => {
  const {settings: {everestUrl}} = useCampContext();
  const {isReady, query} = useRouter();
  const {isLargeScreen} = useMobile();

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [view, setView] = useState<ExtentCanvasViewBox | undefined>()

  const [searchValue, setSearchValue] = useState<string>("");

  const [selectedRoom, setSelectedRoom] = useState<RoomData | undefined>();
  const [oversized, setOversized] = useState<boolean>(false);

  const imagesRef = useRef<CanvasImage[]>([]);
  const contentViewRef = useRef<ExtentCanvasViewBox | undefined>();

  const {
    size: sidebarSize,
    setSize: setSidebarSize,
    enableMouse: enableSidebarMouseResize,
    enableTouch: enableSidebarTouchResize,
  } = useResize({
    horizontal: isLargeScreen,
    minSize: isLargeScreen ? halfDividerSize : halfDividerSize + headerSize,
  });
  const {
    size: roomMenuSize,
    setSize: setRoomMenuSize,
    enableMouse: enableRoomMenuMouseResize,
    enableTouch: enableRoomMenuTouchResize,
  } = useResize({
    horizontal: !isLargeScreen,
    minSize: isLargeScreen ? halfDividerSize + headerSize : halfDividerSize,
  });

  const checkpoints: CheckpointDataExtended[] = useMemo(() => side.checkpoints.reduce<CheckpointDataExtended[]>((prev, checkpoint, index) => {
    const rooms: RoomData[] = checkpoint.roomOrder.reduce<RoomData[]>((prev, order) => {
      const newRoom: RoomData | undefined = side.rooms.find(room => room.id === order);
      newRoom && showRoom(searchValue.toLowerCase(), newRoom) && prev.push(newRoom);
      return prev;
    }, []);

    rooms.length > 0 && prev.push({...checkpoint, id: index + 1, rooms});
    return prev;
  }, []), [searchValue, side.checkpoints, side.rooms]);

  const canvasRooms: CanvasRoom[] = useMemo(() => side.rooms.map(room => {
    const {id, canvas: {position, boundingBox: view}} = room;
    return ({
      id,
      position,
      view,
      image: getRoomImageUrl(area.id, chapter.id, side.id, id),
    })
  }), [area.id, chapter.id, side.id, side.rooms]);

  /**
   * Handle changes to the canvas view.
   */
  const handleViewChange = useCallback(() => {
    if (contentViewRef.current === undefined) {
      return;
    }

    setOversized(oversizedCanvas(calculateCanvasSize(contentViewRef.current)));
  }, []);

  /**
   * Draw images to a virtual canvas to save the canvas view as a full res image.
   */
  const handleSave = useCallback(async () => {
    if (contentViewRef.current === undefined) {
      return;
    }

    const size: ExtentCanvasSize = calculateCanvasSize(contentViewRef.current)
    if (oversizedCanvas(size)) {
      return;
    }

    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d", {alpha: true});
    if (context === null) {
      return;
    }

    virtualCanvas.width = size.width;
    virtualCanvas.height = size.height;
    context.translate(-contentViewRef.current.left, -contentViewRef.current.top);
    
    imagesRef.current.forEach(({img, position: {x, y}, view}) => {
      if (contentViewRef.current === undefined || !viewsCollide(view, contentViewRef.current)) {
        return;
      }
      context.drawImage(img, x, y);
    });

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("image/png");
    link.download = `${area.id}-${chapter.id}-${side.id}_${size.width}x${size.height}.png`;
    link.click();
  }, [area.id, chapter.id, side.id]);

  /**
   * Try to teleport to the room at the coordinates.
   */
  const handleTeleport = useCallback(async (x: number, y: number): Promise<void> => {
    const room: RoomData | undefined = findRoom(side.rooms, x, y);
    if (room === undefined) {
      return;
    }

    const roomX: number = x - room.canvas.position.x;
    const roomY: number = y - room.canvas.position.y;
    void teleport({url: everestUrl, params: `?area=${area.gameId}/${chapter.gameId}&side=${side.id}&level=${room.id}&x=${roomX}&y=${roomY}`});
  }, [area.gameId, chapter.gameId, everestUrl, side.id, side.rooms]);

  /**
   * Try to select the room at the coorindates.
   */
  const handleSelectRoom = useCallback((x: number, y: number): void => {
    const room: RoomData | undefined = findRoom(side.rooms, x, y);
    if (room === undefined) {
      return;
    }

    setSelectedRoom(room);
  }, [side.rooms]);

  /**
   * Update the canvas from the router query.
   */
  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isFirstLoad){
      setIsFirstLoad(false);
    }

    const {checkpoint, room, top, bottom, left, right, x, y} = query;
    
    if (typeof checkpoint === "string") {
      const data: CheckpointData | undefined = side.checkpoints[Number(query.checkpoint) - 1];
      if (data !== undefined) {
        setView(data.boundingBox)
      }
      return;
    }

    if (typeof room === "string") {
      const canvasRoom: CanvasRoom | undefined = canvasRooms.find(({id}) => id === room);
      if (canvasRoom === undefined) {
        return;
      }

      setSelectedRoom(side.rooms.find(({id}) => id === canvasRoom.id));

      if (typeof x === "string" && typeof y === "string") {
        setView(getEntityViewBox(canvasRoom.view, Number(x), Number(y)));
      } else {
        setView(canvasRoom.view);
      }
      return;
    }

    if (typeof top === "string" && typeof bottom === "string" && typeof left === "string" && typeof right === "string") {
      if (isFirstLoad) {
        setView({top: Number(top), bottom: Number(bottom), left: Number(left), right: Number(right)});
        setIsFirstLoad(false);
      }
      return;
    }
    
    setView(side.boundingBox)
  }, [canvasRooms, isFirstLoad, isReady, query, side.boundingBox, side.checkpoints, side.rooms]);

  /**
   * Update the layout for desktop/mobile.
   */
  useEffect(() => {
    setSidebarSize(
      calculateLayoutSize(isLargeScreen, window.innerWidth, window.innerHeight)
      + (isLargeScreen ? halfDividerSize * 2 : headerSize + halfDividerSize)
    );
    setRoomMenuSize(isLargeScreen ? window.innerHeight / 2 : window.innerWidth / 2);
  }, [isLargeScreen, setRoomMenuSize, setSidebarSize]);

  return (
    <>
      <CampHead
        title={`${chapter.name} (${side.name})`}
        description="View an interactive fully rendered map."
        image={getRoomPreviewUrl(area.id, chapter.id, side.id, side.img)}
      />
      <Box
        display="flex"
        flexDirection={isLargeScreen ? "row" : "column-reverse"}
        height={`calc(100vh - ${headerSize}px)`}
        overflow="hidden"
      >
        <Box
          display="flex"
          flexDirection={isLargeScreen ? "column" : "row"}
          {...isLargeScreen ? {
            width: `${sidebarSize - halfDividerSize}px`
          } : {
            flex: 1,
            overflow: "hidden"
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            {...isLargeScreen ? {
              height: `${roomMenuSize - headerSize - halfDividerSize}px`
            } : {
              width: `${roomMenuSize - halfDividerSize}px`
            }}
          >
            <TextField
              fullWidth
              id="room-search"
              size="small"
              variant="standard"
              placeholder="Search rooms"
              value={searchValue}
              onChange={({target: {value}}) => setSearchValue(value)}
              sx={{
                p: 1,
                overflow: "hidden",
                pointerEvents: "none",
                minHeight: 54,
              }}
              InputProps={{
                sx: {
                  overflow: "hidden",
                  pointerEvents: "auto",
                },
                endAdornment: (
                  <Box display="flex" alignItems="center" gap={0.5} margin={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => setSearchValue("")}
                      aria-label="clear search"
                    >
                      <Clear fontSize="small"/>
                    </IconButton>
                    <Search color="primary" fontSize="small"/>
                  </Box>
                ),
              }}
            />
            <Box sx={{overflowX: "hidden", overflowY: "auto", flex: 1}}>
              <MapRoomMenu
                area={area}
                chapter={chapter}
                side={side}
                checkpoints={checkpoints}
                selectedRoom={selectedRoom?.id ?? ""}
                onRoomSelect={setSelectedRoom}
              />
            </Box>
          </Box>
          <ResizableDivider
            onMouseDown={enableRoomMenuMouseResize}
            onTouchStart={enableRoomMenuTouchResize}
            orientation={isLargeScreen ? "horizontal": "vertical"}
            sx={{
              zIndex: 1,
              bgcolor: "background.paper",
            }}
          />
          <Box
            display="flex"
            flexDirection="column"
            width="100%" 
            height="100%"
            flex={1}
            sx={{
              overflow: "hidden",
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <Box flex={1} sx={{overflowX: "hidden", overflowY: "auto"}}>
              {selectedRoom && (
                <MapEntityMenu
                  areaId={area.id}
                  areaGameId={area.gameId}
                  chapterId={chapter.id}
                  chapterGameId={chapter.gameId}
                  sideId={side.id}
                  room={selectedRoom}
                />
              )}
            </Box>
            <Button
              fullWidth
              variant="contained"
              endIcon={!oversized && <ScreenshotMonitor/>}
              sx={{borderRadius: 0, whiteSpace: "nowrap"}}
              onClick={handleSave}
              disabled={oversized}
            >
              {oversized ? "Oversized" : "Save Image"}
            </Button>
          </Box>
        </Box>
        <ResizableDivider
          onMouseDown={enableSidebarMouseResize}
          onTouchStart={enableSidebarTouchResize}
          orientation={isLargeScreen ? "vertical" : "horizontal"}
          sx={{
            zIndex: 2,
            bgcolor: "background.paper",
          }}
        />
        <Box {...isLargeScreen ? {flex: 1} : {height: `${sidebarSize - headerSize - halfDividerSize}px`}}>
          <CampCanvas
            view={view}
            rooms={canvasRooms}
            imagesRef={imagesRef}
            contentViewRef={contentViewRef}
            onViewChange={handleViewChange}
            onTeleport={handleTeleport}
            onSelectRoom={handleSelectRoom}
          />
        </Box>
      </Box>
    </>
  );
}

export default SideMapPage;

interface SideMapPageParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
}

export const getStaticPaths: GetStaticPaths<SideMapPageParams> = async () => {
  const paths: {params: SideMapPageParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const {chapters}: Area = await fetchArea(areaId);
    for (const {id: chapterId, sides} of chapters) {
      for (const {id: sideId} of sides) {
        paths.push({params: {areaId, chapterId, sideId}});
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

interface SideMapPageProps {
  area: AreaData;
  chapter: ChapterData;
  side: SideData;
};

export interface MapParams {
  areaId: string;
  chapterId: string;
  sideId: string;
}

export interface MapRoomParams extends MapParams {
  room: string;
}

export const getStaticProps: GetStaticProps<SideMapPageProps, SideMapPageParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId, sideId} = params;

  const area: Area = await fetchArea(areaId);

  const chapter: Chapter | undefined = area.chapters.find(chapter => chapter.id === chapterId);
  if (chapter === undefined) {
    throw Error(`Chapter not found for ${chapterId}`);
  }

  const side: Side | undefined = chapter.sides.find(side => side.id === sideId);
  if (side === undefined) {
    throw Error(`Side not found for ${sideId} in chpater ${chapterId}`);
  }

  return {
    props: {
      area: {
        id: area.id,
        name: area.name,
        gameId: area.gameId,
      },
      chapter: {
        id: chapter.id,
        gameId: chapter.gameId,
        name: chapter.name,
        ...(chapter.chapterNo && {no: chapter?.chapterNo}),
      },
      side: {
        id: side.id,
        name: side.name,
        boundingBox: side.canvas.boundingBox,
        img: side.img,
        rooms: Object.entries(side.rooms).map(([id, room]) => ({
          id,
          tags: generateRoomTags(room),
          ...room,
        })),
        checkpoints: side.checkpoints.map<CheckpointData>(checkpoint => ({
          name: checkpoint.name,
          boundingBox: checkpoint.canvas.boundingBox,
          roomOrder: checkpoint.roomOrder,
        })),
      },
    }
  };
}

/**
 * Calculate the bounding box for viewing an entity.
 */
export const getEntityViewBox = ({left, top}: ExtentCanvasViewBox, x: number, y: number): ExtentCanvasViewBox => {
  return {left: left + x - 160, right: left + x + 160, top: top + y - 90, bottom: top + y + 90}
}

/**
 * Calculate the canvas size from a view.
 * @param view The view.
 * @returns The canvas size.
 */
 const calculateCanvasSize = ({top, bottom, left, right}: ExtentCanvasViewBox): ExtentCanvasSize => ({
  width: right - left, 
  height: bottom - top,
}) 

/**
 * Determine if the view is too large to render.
 * 
 * @param width The image width.
 * @param height The image height.
 * @returns If the view is too large.
 */
 const oversizedCanvas = ({width, height}: ExtentCanvasSize): boolean => {
  return width * height > 268435456;
};

/**
 * Find a room for the given coordinates.
 */
const findRoom = (rooms: RoomData[], x: number, y: number): RoomData | undefined => {
  return rooms.find(({canvas: {boundingBox: {top, bottom, left, right}}}) => (
    left <= x && x <= right && top <= y && y <= bottom
  ));
};

/**
 * Calculate a best fit size for the layout by trying to fit the map to a celeste room
 * aspect ratio and keep the sidebar size to a reasonable minimum.
 * 
 * For a large screen this is the sidebar size. For a small screen, it's the map size.
 */
const calculateLayoutSize = (isLargeScreen: boolean, width: number, height: number): number => {
  if (isLargeScreen) {
    return width - ((height * ROOM_WIDTH) / ROOM_HEIGHT);
  } else {
    return (width * ROOM_HEIGHT) / ROOM_WIDTH;
  }
}
