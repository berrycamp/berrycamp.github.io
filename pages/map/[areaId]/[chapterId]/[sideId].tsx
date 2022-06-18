import {Clear, Search} from "@mui/icons-material";
import {Box, Divider, IconButton, TextField} from "@mui/material";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {ParsedUrlQuery} from "querystring";
import {useCallback, useMemo, useState} from "react";
import {CampCanvas, CanvasRoom} from "~/modules/canvas";
import {showRoom} from "~/modules/chapter";
import {Area, BoundingBox, Chapter, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl, getRoomImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaData, ChapterData, CheckpointData, CheckpointDataExtended, MapRoomMenu, RoomData, SideData} from "~/modules/map";
import {EntityList} from "~/modules/map/InfoMenu";
import {generateRoomTags} from "~/modules/room";
import {CampPage} from "~/pages/_app";

export const SideMapPage: CampPage<SideMapPageProps> = ({area, chapter, side}) => {
  const {query} = useRouter();

  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<RoomData | undefined>();
  const [boundingBox, setBoundingBox] = useState<BoundingBox>(side.boundingBox);

  const checkpoints = useMemo(() => side.checkpoints.reduce<CheckpointDataExtended[]>((prev, checkpoint) => {
    const rooms: RoomData[] = checkpoint.roomOrder.reduce<RoomData[]>((prev, order) => {
      const newRoom: RoomData | undefined = side.rooms.find(room => room.id === order);
      if (newRoom) {
        showRoom(searchValue.toLowerCase(), newRoom) && prev.push(newRoom);
        if (typeof query.room === "string" && query.room === newRoom.id) {
          setSelectedRoom(newRoom);
          if (typeof query.x === "string" && typeof query.y === "string") {
            setBoundingBox(getEntityViewBox(newRoom.canvas.boundingBox, Number(query.x), Number(query.y)));
          } else {
            setBoundingBox(newRoom.canvas.boundingBox);
          }
        }
      }
      return prev;
    }, []);
    rooms.length > 0 && prev.push({...checkpoint, rooms});
    return prev;
  }, []), [query.room, query.x, query.y, searchValue, side.checkpoints, side.rooms])

  const rooms: CanvasRoom[] = useMemo(() => side.rooms.map(room => ({
    position: room.canvas.position,
    image: getRoomImageUrl(area.id, chapter.id, side.id, room.id),
  })), [area.id, chapter.id, side.id, side.rooms]);

  const handleViewChange = useCallback((box: BoundingBox): void => {
    setBoundingBox({...box});
  }, [])

  return (
    <>
      <CampHead
        title={`${chapter.name} (${side.name})`}
        description="View an interactive fully rendered map."
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Box display="flex" height="100%" overflow="hidden">
        <Box display="flex" flexDirection="column">
          <Box
            height="70%"
            display="flex"
            flexDirection="column"
            width={300}
            minHeight={0}
            sx={{overflowX: "hidden", overflowY: "auto", resize: "both"}}
          >
            <TextField
              fullWidth
              id="room-search"
              size="small"
              variant="standard"
              placeholder="Search rooms"
              value={searchValue}
              onChange={({target: {value}}) => setSearchValue(value)}
              sx={{p: 2}}
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
          <Divider sx={{borderBottomWidth: 8}}/>
          <Box sx={{overflowY: "auto", overflowX: "hidden"}}>
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
        </Box>
        <Box flex={1}>
          <CampCanvas
            boundingBox={boundingBox}
            rooms={rooms}
            url={`/map/${area.id}/${chapter.id}/${side.id}`}
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
export const getEntityViewBox = ({left, top}: BoundingBox, x: number, y: number): BoundingBox => {
  return {left: left + x - 160, right: left + x + 160, top: top + y - 90, bottom: top + y + 90}
}
