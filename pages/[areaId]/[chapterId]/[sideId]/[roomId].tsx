import {Fullscreen, FullscreenExit, NavigateBefore, NavigateNext, RocketLaunch, TravelExplore} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Chip, Container, Link as MuiLink, Paper, Stack, ToggleButton, Tooltip, Typography} from "@mui/material";
import {GetStaticPaths, GetStaticProps} from "next";
import NextImage from "next/image";
import Link from "next/link";
import {NextRouter, useRouter} from "next/router";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, useEffect, useRef, useState} from "react";
import {EverestOnly} from "~/modules/common/everestOnly/EverestOnly";
import {Area, Chapter, Checkpoint, Room, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getRoomImageUrl, getRoomPreviewUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {useCampContext} from "~/modules/provide/CampContext";
import {AreaData, ChapterData, CheckpointData, generateRoomTags, NavRoomData, RoomData, SideData} from "~/modules/room";
import {EntityList} from "~/modules/room/entityList/EntityList";
import {teleport} from "~/modules/teleport/teleport";

const RoomPage: CampPage<RoomProps> = ({
  area,
  chapter,
  side,
  checkpoint,
  room,
  nextRoom,
  prevRoom,
}) => {
  const {settings} = useCampContext();
  const router: NextRouter = useRouter();

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [fullImage, setFullImage] = useState<boolean>(false);

  const image: string = fullImage
    ? getRoomImageUrl(area.id, chapter.id, side.id, room.debugId)
    : getRoomPreviewUrl(area.id, chapter.id, side.id, room.debugId);

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = (): void => {
    void teleport({url: settings.everestUrl, params: room.teleportParams});
  }

  /**
   * Listen for left and right presses to navigate rooms.
   */
  useEffect(() => {
    const listener = (event: WindowEventMap["keydown"]) => {
      if (event.key === "ArrowLeft" && prevRoom?.link) {
        router.push(prevRoom.link);
      } else if (event.key === "ArrowRight" && nextRoom?.link) {
        router.push(nextRoom.link);
      }
    }

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [nextRoom?.link, prevRoom?.link, router]);

  /**
   * Manage image fullscreen state.
   */
  useEffect(() => {
    if (!imgRef.current) {
      return;
    }

    if (isFullscreen) {
      imgRef.current.requestFullscreen();
    } else if (Boolean(document.fullscreenElement)) {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  /**
   * Listen for fullscreen changes and store state locally.
   */
  useEffect(() => {
    const handleFullscreenChange = (event: Event) => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, []);

  return (
    <Fragment>
      <CampHead
        title={room.name ? `${room.name} (${room.debugId})` : room.debugId}
        description={`${area.name} - ${chapter.name} - ${side.name} side - ${checkpoint.name}`}
        image={image}
      />
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 1, marginBottom: 1}}>
          <Link passHref href={area.link}>
            <MuiLink underline="always">
              {area.name}
            </MuiLink>
          </Link>
          <Link passHref href={chapter.link}>
            <MuiLink underline="always">
              {chapter.name}
            </MuiLink>
          </Link>
          <Typography color="text.secondary">{side.name}</Typography>
          <Typography color="text.secondary">{checkpoint.name}</Typography>
          <Typography color="text.primary">{room.name} ({room.debugId})</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1} mb={1}>
          <Box width="50%">
            {prevRoom?.link && (
              <Link passHref href={prevRoom.link}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevRoom.name}`}
                  sx={{width: "100%"}}
                >
                  <Typography noWrap variant="button" component="span">
                    {prevRoom.name}
                  </Typography>
                </Button>
              </Link>
            )}
          </Box>
          <Box width="50%">
            {nextRoom?.link && (
              <Link passHref href={nextRoom.link}>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextRoom.name}`}
                  sx={{width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}
                >
                  <Typography noWrap variant="button" component="span">
                    {nextRoom.name}
                  </Typography>
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        <Paper ref={imgRef} sx={{position: "relative"}}>
          <ImageView image={image} roomName={room.name ?? room.debugId} onClick={() => !isFullscreen && setFullImage(prev => !prev)}/>
            <ToggleButton
              sx={{position: "absolute", top: 0, right: 0, margin: 0.5, border: "none", background: "background.paper"}}
              size="small"
              value="full"
              onChange={() => setIsFullscreen(prev => !prev)}
            >
              {isFullscreen ? <FullscreenExit color="primary"/> : <Fullscreen color="primary"/>}
            </ToggleButton>
        </Paper>
        <Typography component="div" variant="h5" mt={1}>{room.name}</Typography>
        <Typography component="div" color="text.secondary">{chapter.name} · {side.name} Side · {checkpoint.name}</Typography>
        <Typography component="div" color="text.secondary">{room.debugId} · {room.roomId} · {room.levelRoomNo}</Typography>
        <Stack direction="row" mt={1} mb={1.5} spacing={1}>
          {room.tags.map(tag => (
            <Link
              key={tag}
              passHref
              href={`/${area.id}/${chapter.id}?side=${side.id}&search=${tag}`}
            >
              <Chip component="a" size="small" label={tag} sx={{textTransform: "capitalize"}}/>
            </Link>
          ))}
        </Stack>
        <Box display="flex" mt={1} mb={1} justifyContent="flex-end">
          <Box display="flex" gap={1}>
            <Tooltip enterDelay={750} title={"View room in interactive map viewer"}>
              <Link
                passHref
                href={`/map/${area.id}/${chapter.id}/${side.id}?room=${room.debugId}`}
              >
                <Button
                  component="a"
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<TravelExplore />}
                  aria-label="Opens the map viewer"
                >
                  View Map
                </Button>
              </Link>
            </Tooltip>
            <EverestOnly>
              <Tooltip enterDelay={750} title={"Open room in Celeste (Everest)"}>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<RocketLaunch />}
                  onClick={handleOpenRoom}
                  aria-label="Open room in Celeste (Everest)"
                >
                  Teleport
                </Button>
              </Tooltip>
            </EverestOnly>
          </Box>
        </Box>
        <EntityList
          areaId={area.id}
          areaGameId={area.gameId}
          chapterId={chapter.id}
          chapterGameId={chapter.gameId}
          sideId={side.id}
          room={room}
        />
      </Container>
    </Fragment>
  );
}

interface ImageViewProps {
  image: string;
  roomName: string;
  onClick?: () => void;
}

const ImageView: FC<ImageViewProps> = ({image, roomName, onClick}) => (
  <NextImage
    unoptimized
    src={image}
    onClick={onClick}
    alt={`image of room ${roomName}`}
    layout="responsive"
    width={320}
    height={180}
    objectFit="contain"
    style={{imageRendering: "pixelated"}}
  />
);

interface RoomParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
  roomId: string;
}

export const getStaticPaths: GetStaticPaths<RoomParams> = async () => {
  const paths: {params: RoomParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const {chapters}: Area = await fetchArea(areaId);
    for (const {id: chapterId, sides} of chapters) {
      for (const {id: sideId, rooms} of sides) {
        for (const roomId in rooms) {
          paths.push({params: {areaId, chapterId, sideId, roomId}});
        }
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

interface RoomProps {
  area: AreaData;
  chapter: ChapterData;
  side: SideData;
  checkpoint: CheckpointData;
  room: RoomData;
  prevRoom?: NavRoomData;
  nextRoom?: NavRoomData;
}

export const getStaticProps: GetStaticProps<RoomProps, RoomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId, sideId, roomId} = params;

  const area: Area =  await fetchArea(areaId);

  const chapter: Chapter | undefined = area.chapters.find(chapter => chapter.id === chapterId);
  if (chapter === undefined) {
    throw Error(`Chapter not found for ${chapterId}`);
  }

  const side: Side | undefined = chapter.sides.find(side => side.id === sideId);
  if (side === undefined) {
    throw Error(`Side not found for ${sideId} in chpater ${chapterId}`);
  }

  const room: Room | undefined = side.rooms[roomId];
  if (room === undefined) {
    throw Error(`Could not find room ${roomId} in side ${side.name}`);
  }

  const checkpoint: Checkpoint | undefined = side.checkpoints[room.checkpointNo];
  if (checkpoint === undefined) {
    throw Error(`Could not find checkpoint ${room.checkpointNo} in side ${side.name}`);
  }

  const roomIndex: number = checkpoint.roomOrder.findIndex(id => id === roomId);

  const prevRoomId: string | undefined = checkpoint.roomOrder[roomIndex - 1] ?? side.checkpoints[room.checkpointNo - 1]?.roomOrder.slice(-1)[0];
  const nextRoomId: string | undefined = checkpoint.roomOrder[roomIndex + 1] ?? side.checkpoints[room.checkpointNo + 1]?.roomOrder[0];
  const prevRoom: Room | undefined = prevRoomId ? side.rooms[prevRoomId] : undefined;
  const nextRoom: Room | undefined = nextRoomId ? side.rooms[nextRoomId] : undefined;

  const sideRoomIndex = side.checkpoints.slice(0, room.checkpointNo).reduce<number>((prev, curr) => prev + curr.roomCount, 0) + roomIndex;

  return {
    props: {
      area: {
        id: areaId,
        gameId: area.gameId,
        name: area.name,
        link: `/${areaId}`,
      },
      chapter: {
        id: chapterId,
        gameId: chapter.gameId,
        name: chapter.name,
        link: `/${areaId}/${chapterId}`
      },
      side: {
        id: sideId,
        name: side.name,
      },
      checkpoint: {
        name: checkpoint.name,
      },
      room: {
        ...(room.name && {name: room.name}),
        debugId: roomId,
        roomId: `${checkpoint.abbreviation}-${roomIndex + 1}`,
        levelRoomNo: `${sideRoomIndex + 1}/${side.roomCount}`,
        checkpointRoomNo: `${roomIndex + 1}/${checkpoint.roomCount}`,
        teleportParams: `?area=${area.gameId}/${chapter.gameId}&side=${sideId}&level=${roomId}${(room.entities.spawn && room.entities.spawn[0]?.x && room.entities.spawn[0]?.y) ? `&x=${room.entities.spawn[0].x}&y=${room.entities.spawn[0].y}` : ""}`,
        entities: room.entities,
        tags: generateRoomTags(room),
      },
      ...(prevRoom && {
        prevRoom: {
          ...(prevRoom.name && {name: prevRoom.name}),
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}`,
        }
      }),
      ...(nextRoom && {
        nextRoom: {
          ...(nextRoom.name && {name: nextRoom.name}),
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}`,
        }
      }),
    }
  };
}

export default RoomPage;