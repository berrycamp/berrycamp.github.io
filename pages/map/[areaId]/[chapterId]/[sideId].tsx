import {Clear, ScreenshotMonitor, Search} from "@mui/icons-material";
import {Box, Button, Divider, IconButton, TextField} from "@mui/material";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {ParsedUrlQuery} from "querystring";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {CampCanvas, CAMP_CANVAS_CHANNEL, CanvasImage, CanvasRoom, CanvasSize, View, ViewChangeReason, viewsCollide} from "~/modules/canvas";
import {showRoom} from "~/modules/chapter";
import {useResize} from "~/modules/common/useResize";
import {Area, Chapter, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl, getRoomImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaData, ChapterData, CheckpointData, CheckpointDataExtended, MapRoomMenu, RoomData, SideData} from "~/modules/map";
import {MapEntityMenu} from "~/modules/map/MapEntityMenu";
import {useCampContext} from "~/modules/provide/CampContext";
import {generateRoomTags} from "~/modules/room";
import {CampPage} from "~/pages/_app";

export const SideMapPage: CampPage<SideMapPageProps> = ({area, chapter, side}) => {
  const {settings: {showWatermark}} = useCampContext();
  const router = useRouter();

  const [channel, setChannel] = useState<BroadcastChannel | undefined>();

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const [searchValue, setSearchValue] = useState<string>("");

  const [selectedRoom, setSelectedRoom] = useState<RoomData | undefined>();
  const [oversized, setOversized] = useState<boolean>(false);

  const imagesRef = useRef<CanvasImage[]>([]);
  const contentViewRef = useRef<View | undefined>();

  const {width, enableResize} = useResize({initialWidth: 400, minWidth: 0});

  const checkpoints: CheckpointDataExtended[] = useMemo(() => side.checkpoints.reduce<CheckpointDataExtended[]>((prev, checkpoint, index) => {
    const rooms: RoomData[] = checkpoint.roomOrder.reduce<RoomData[]>((prev, order) => {
      const newRoom: RoomData | undefined = side.rooms.find(room => room.id === order);
      newRoom && showRoom(searchValue.toLowerCase(), newRoom) && prev.push(newRoom);
      return prev;
    }, []);

    rooms.length > 0 && prev.push({...checkpoint, id: index + 1, rooms});
    return prev;
  }, []), [searchValue, side.checkpoints, side.rooms]);

  const rooms: CanvasRoom[] = useMemo(() => side.rooms.map(({id, canvas: {position, boundingBox: view}}) => ({
    id,
    position,
    view,
    image: getRoomImageUrl(area.id, chapter.id, side.id, id),
  })), [area.id, chapter.id, side.id, side.rooms]);

  /**
   * Handle changes to the canvas view.
   */
  const handleViewChange = useCallback((reason: ViewChangeReason) => {
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

    const size: CanvasSize = calculateCanvasSize(contentViewRef.current)
    if (oversizedCanvas(size)) {
      return;
    }

    const virtualCanvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D | null = virtualCanvas.getContext("2d");
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

    // Apply logo watermark
    if (showWatermark && size.width >= 320 && size.height >= 184) {
      const minTextHeight = 10;
      const horizontalScaleFactor = 2.157;
      const textHeight: number = Math.floor(
        Math.max(
          minTextHeight,
          0.05 * Math.min(
            size.height,
            size.width * horizontalScaleFactor,
          ),
        ),
      );

      const textPadding: number = Math.floor(0.25 * textHeight);
      context.font = `${textHeight}px Calibri`;
      context.fillStyle = "#FFFFFF"
  
      const watermark: string = "🍓camp";
      const {width: logoWidth}: TextMetrics = context.measureText(watermark);
  
      context.fillText(
        watermark,
        Math.floor(contentViewRef.current.left + size.width - logoWidth - textPadding),
        Math.floor(contentViewRef.current.top + size.height - textPadding * 1.75),
      );
    }

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = `${area.id}-${chapter.id}-${side.id}_${size.width}x${size.height}.png`;
    link.click();
  }, [area.id, chapter.id, side.id, showWatermark]);

  /**
   * Create the broadcast channel for requests to the canvas.
   */
  useEffect(() => {
    const channel: BroadcastChannel = new BroadcastChannel(CAMP_CANVAS_CHANNEL);
    setChannel(channel);

    return () => {
      channel.close();
    }
  }, []);

  /**
   * Update the canvas from the router query.
   */
  useEffect(() => {
    if (channel === undefined) {
      return;
    }

    if (!router.isReady) {
      return;
    }

    setIsFirstLoad(false);

    // Go to room if valid.
    if (typeof router.query.room === "string") {
      const canvasRoom: CanvasRoom | undefined = rooms.find(room => room.id === router.query.room);
      if (canvasRoom === undefined) {
        return;
      }

      channel.postMessage(typeof router.query.x === "string" && typeof router.query.y === "string"
        ? getEntityViewBox(canvasRoom.view, Number(router.query.x), Number(router.query.y))
        : canvasRoom.view);
      return;
    }
    
    // Go to checkpoint if valid.
    if (typeof router.query.checkpoint === "string") {
      const checkpoint: CheckpointData | undefined = side.checkpoints[Number(router.query.checkpoint) - 1];
      if (checkpoint === undefined) {
        return;
      }
      channel.postMessage(checkpoint.boundingBox);
      return;
    }
    
    // Go to view box only on first load.
    if (
      typeof router.query.top === "string"
      && typeof router.query.bottom === "string"
      && typeof router.query.left === "string"
      && typeof router.query.right === "string"
    ) {
      isFirstLoad && channel.postMessage({
        top: Number(router.query.top),
        bottom: Number(router.query.bottom),
        left: Number(router.query.left),
        right: Number(router.query.right),
      })
      return;
    }
    
    // Go to side.
    channel.postMessage(side.boundingBox);
  }, [
    channel,
    isFirstLoad,
    rooms,
    router.isReady,
    router.query.bottom,
    router.query.checkpoint,
    router.query.left,
    router.query.right,
    router.query.room,
    router.query.top,
    router.query.x,
    router.query.y,
    side.boundingBox,
    side.checkpoints,
    side.rooms,
  ]);

  return (
    <>
      <CampHead
        title={`${chapter.name} (${side.name})`}
        description="View an interactive fully rendered map."
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Box display="flex" height="100%" overflow="hidden">
        <Box display="flex" height="100%">
          <Box
            display="flex"
            flexDirection="column"
            style={{width}}
          >
            <TextField
              fullWidth
              id="room-search"
              size="small"
              variant="standard"
              placeholder="Search rooms"
              value={searchValue}
              onChange={({target: {value}}) => setSearchValue(value)}
              sx={{p: 1}}
              InputProps={{
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
            <Box
              height="70%"
              display="flex"
              flexDirection="column"
              width={300}
              minHeight={0}
              sx={{overflowX: "hidden", overflowY: "auto", width: "100%"}}
            >
              <MapRoomMenu
                area={area}
                chapter={chapter}
                side={side}
                checkpoints={checkpoints}
                selectedRoom={selectedRoom?.id ?? ""}
                onRoomSelect={setSelectedRoom}
              />
            </Box>
            <Divider sx={{borderBottomWidth: 4}}/>
            <Box sx={{overflowY: "auto", overflowX: "hidden", height: "30%"}}>
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
              sx={{borderRadius: 0}}
              onClick={handleSave}
              disabled={oversized}
            >
              {oversized ? "Oversized" : "Save Image"}
            </Button>
          </Box>
          <Box
            onPointerDown={enableResize}
            sx={{
              cursor: "col-resize",
              touchAction: "none",
              width: 4,
              zIndex: 1,
              bgcolor: "divider"
            }}
          />
        </Box>
        <Box flex={1}>
          <CampCanvas
            rooms={rooms}
            imagesRef={imagesRef}
            contentViewRef={contentViewRef}
            onViewChange={handleViewChange}
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
        ...chapter.chapterNo && {no: chapter?.chapterNo},
      },
      side: {
        id: side.id,
        name: side.name,
        boundingBox: side.canvas.boundingBox,
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
  }
}

/**
 * Calculate the bounding box for viewing an entity.
 */
export const getEntityViewBox = ({left, top}: View, x: number, y: number): View => {
  return {left: left + x - 160, right: left + x + 160, top: top + y - 90, bottom: top + y + 90}
}

/**
 * Calculate the canvas size from a view.
 * @param view The view.
 * @returns The canvas size.
 */
 const calculateCanvasSize = ({top, bottom, left, right}: View): CanvasSize => ({
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
 const oversizedCanvas = ({width, height}: CanvasSize): boolean => {
  return width * height > 268435456;
};
