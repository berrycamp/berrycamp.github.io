import {Clear, ScreenshotMonitor, Search} from "@mui/icons-material";
import {Box, Button, Divider, IconButton, TextField} from "@mui/material";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {ParsedUrlQuery} from "querystring";
import {useCallback, useMemo, useRef, useState} from "react";
import {CampCanvas, CanvasImage, CanvasRoom, CanvasSize, View, viewsCollide} from "~/modules/canvas";
import {showRoom} from "~/modules/chapter";
import {useResize} from "~/modules/common/useResize";
import {Area, Chapter, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl, getRoomImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaData, ChapterData, CheckpointData, CheckpointDataExtended, MapRoomMenu, RoomData, SideData} from "~/modules/map";
import {EntityList} from "~/modules/map/InfoMenu";
import {useCampContext} from "~/modules/provide/CampContext";
import {generateRoomTags} from "~/modules/room";
import {CampPage} from "~/pages/_app";

export const SideMapPage: CampPage<SideMapPageProps> = ({area, chapter, side}) => {
  const {settings: {showWatermark}} = useCampContext();
  const {query} = useRouter();

  const [searchValue, setSearchValue] = useState<string>("");

  const [selectedRoom, setSelectedRoom] = useState<RoomData | undefined>();
  const [view, setView] = useState<View | undefined>();
  const [oversized, setOversized] = useState<boolean>(false);

  const imagesRef = useRef<CanvasImage[]>([]);
  const contentViewRef = useRef<View | undefined>();

  const {width, enableResize} = useResize({initialWidth: 400, minWidth: 0});

  const checkpoints = useMemo(() => side.checkpoints.reduce<CheckpointDataExtended[]>((prev, checkpoint) => {
    const rooms: RoomData[] = checkpoint.roomOrder.reduce<RoomData[]>((prev, order) => {
      const newRoom: RoomData | undefined = side.rooms.find(room => room.id === order);
      if (!newRoom) {
        return prev;
      }

      showRoom(searchValue.toLowerCase(), newRoom) && prev.push(newRoom);
      if (typeof query.room === "string" && query.room === newRoom.id) {
        setSelectedRoom(newRoom);
        if (typeof query.x === "string" && typeof query.y === "string") {
          setView(getEntityViewBox(newRoom.canvas.boundingBox, Number(query.x), Number(query.y)));
        } else {
          setView(newRoom.canvas.boundingBox);
        }
      } else {
        setView(side.boundingBox);
      }
      return prev;
    }, []);
    rooms.length > 0 && prev.push({...checkpoint, rooms});
    return prev;
  }, []), [query.room, query.x, query.y, searchValue, side.boundingBox, side.checkpoints, side.rooms])

  const rooms: CanvasRoom[] = useMemo(() => side.rooms.map(({id, canvas: {position, boundingBox: view}}) => ({
    position,
    view,
    image: getRoomImageUrl(area.id, chapter.id, side.id, id),
  })), [area.id, chapter.id, side.id, side.rooms]);

  /**
   * Handle setting the view.
   */
  const handleViewChange = useCallback((view: View): void => {
    setView({...view});
  }, []);

  /**
   * Handle changes to the canvas view for save button updates.
   */
  const handleContentViewChange = useCallback(() => {
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
      const textHeight: number = Math.floor(0.05 * size.height);
      const textPadding: number = Math.floor(0.25 * textHeight);
      context.font = `${textHeight}px Calibri`;
      context.fillStyle = "#FFFFFF"
  
      const watermark: string = "🍓camp";
      const {width: logoWidth}: TextMetrics = context.measureText(watermark);
  
      context.fillText(
        watermark,
        contentViewRef.current.left + size.width - Math.floor(logoWidth) - textPadding,
        contentViewRef.current.top + size.height - textPadding * 2,
      );
    }

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = virtualCanvas.toDataURL("data:image/png");
    link.download = `${area.id}-${chapter.id}-${side.id}_${size.width}x${size.height}.png`;
    link.click();
  }, [area.id, chapter.id, side.id, showWatermark]);

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
                onViewChange={handleViewChange}
                selectedRoom={selectedRoom?.id ?? ""}
                onRoomSelect={setSelectedRoom}
              />
            </Box>
            <Divider sx={{borderBottomWidth: 4}}/>
            <Box sx={{overflowY: "auto", overflowX: "hidden", height: "30%"}}>
              {selectedRoom && (
                <EntityList
                  areaId={area.id}
                  areaGameId={area.gameId}
                  chapterId={chapter.id}
                  chapterGameId={chapter.gameId}
                  sideId={side.id}
                  room={selectedRoom}
                  onViewChange={handleViewChange}
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
            view={view}
            rooms={rooms}
            imagesRef={imagesRef}
            contentViewRef={contentViewRef}
            onViewChange={handleContentViewChange}
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
          ...room
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
