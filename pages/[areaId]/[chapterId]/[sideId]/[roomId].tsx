import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {GetStaticPaths, GetStaticProps} from "next";
import NextImage from "next/image";
import Link from "next/link";
import {NextRouter, useRouter} from "next/router";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, useEffect, useState} from "react";
import {AspectBox} from "~/modules/common/aspectBox/AspectBox";
import {Area, Chapter, Checkpoint, Room, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getRoomPreviewUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {useCampContext} from "~/modules/provide/CampContext";
import {AreaData, ChapterData, CheckpointData, NavRoomData, RoomData, SideData} from "~/modules/room";

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

  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  const image: string = getRoomPreviewUrl(area.id, chapter.id, side.id, room.debugId);
  const isASide: boolean = side.name === "A";

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    try {
      const port: number = settings.port ?? 32270;
      const baseUrl: string = `http://localhost:${port}`;

      await fetch(`${baseUrl}/tp${room.teleportParams}`, {mode: "no-cors"});
      await fetch(`${baseUrl}/focus`);
    } catch (e) {
      // Do nothing.
    }
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
  }, [nextRoom?.link, prevRoom?.link, router])

  return (
    <Fragment>
      <CampHead
        title={`${room.name} (${room.debugId})`}
        description={`${area.name} - ${chapter.name} - ${side.name} side - ${checkpoint.name}`}
        image={image}
      />
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 2, marginBottom: 2}}>
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
        <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)} onClick={() => setImageOpen(false)}>
          <ImageView image={image} roomName={room.name ?? room.debugId}/>
        </Dialog>
        <ImageView image={image} roomName={room.name ?? room.debugId} onClick={() => isUpMdWidth && setImageOpen(true)}/>
        <Box display="flex" marginTop={2} justifyContent="space-between">
          <Typography component="div" variant="h4">{room.name}</Typography>
          <Tooltip enterDelay={750} title={isASide ? "Teleport to room if Everest is installed and running" : "May not work for B and C sides due to Everest bug"}>
            <Button
              variant="contained"
              color={isASide ? "primary" : "warning"}
              endIcon={isASide ? <Launch /> : <Info />}
              onClick={handleOpenRoom}
              aria-label="Teleports to the current room in Celeste"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                }
              }}
            >
              Teleport
            </Button>
          </Tooltip>
        </Box>
        <Typography component="div" color="text.secondary">{chapter.name}</Typography>
        <Typography component="div" color="text.secondary">{side.name} Side</Typography>
        <Typography component="div" color="text.secondary">{checkpoint.name}</Typography>
        <Divider orientation="horizontal" sx={{marginTop: 1, marginBottom: 1}} />
        <Typography component="div" color="text.secondary">Debug id: {room.debugId}</Typography>
        <Typography component="div" color="text.secondary">Room id: {room.roomId}</Typography>
        <Typography component="div" color="text.secondary" sx={{marginTop: 1}}>Checkpoint room: {room.checkpointRoomNo}</Typography>
        <Typography component="div" color="text.secondary">Level room: {room.levelRoomNo}</Typography>
        <Box display="flex" gap={1} marginTop={1} marginBottom={1}>
          <Box width="100%">
            {prevRoom?.link && (
              <Link passHref href={prevRoom.link}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {prevRoom.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box width="100%">
            {nextRoom?.link && (
              <Link passHref href={nextRoom.link}>
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {nextRoom.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Container >
    </Fragment>
  );
}

const ImageView: FC<{image: string, roomName: string, onClick?: () => void}> = ({image, roomName, onClick}) => {
  return (
    <AspectBox>
      <NextImage
        unoptimized
        src={image}
        onClick={onClick}
        alt={`image of room ${roomName}`}
        layout="fill"
        style={{imageRendering: "pixelated"}}
      />
    </AspectBox>
  );
}

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
        name: area.name,
        link: `/${areaId}`,
      },
      chapter: {
        id: chapterId,
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
        ...room.name && {name: room.name},
        debugId: roomId,
        roomId: `${checkpoint.abbreviation}-${roomIndex + 1}`,
        levelRoomNo: `${sideRoomIndex + 1}/${side.roomCount}`,
        checkpointRoomNo: `${roomIndex + 1}/${checkpoint.roomCount}`,
        teleportParams: `?area=${area.gameId}/${chapter.gameId}&side=${sideId}&level=${roomId}${(room.entities.spawn && room.entities.spawn[0]?.x && room.entities.spawn[0]?.y) ? `&x=${room.entities.spawn[0].x}&y=${room.entities.spawn[0].y}` : ""}`,
      },
      ...prevRoom && {
        prevRoom: {
          ...prevRoom.name && {name: prevRoom.name},
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}`,
        }
      },
      ...nextRoom && {
        nextRoom: {
          ...nextRoom.name && {name: nextRoom.name},
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}`,
        }
      },
    }
  }
}

export default RoomPage;