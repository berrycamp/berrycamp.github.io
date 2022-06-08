import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
import {Area, Chapter, Checkpoint, Room, Side} from "logic/data/dataTypes";
import {VALID_AREAS} from "logic/data/validAreas";
import {fetchArea, fetchChapter, fetchSide} from "logic/fetch/dataApi";
import {getCampImageUrl} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {CampHead} from "modules/head/CampHead";
import {GetStaticPaths, GetStaticProps} from "next";
import Image from "next/image";
import Link from "next/link";
import {NextRouter, useRouter} from "next/router";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {Fragment, useEffect, useState} from "react";

const RoomPage: CampPage<RoomProps> = ({
  area,
  chapter,
  side,
  checkpointName,
  room,
  nextRoom,
  prevRoom,
}) => {
  const {settings} = useCampContext();

  const router: NextRouter = useRouter();

  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

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

  const isASide: boolean = side.name === "A";

  return (
    <Fragment>
      <CampHead
        title={`${room.name} (${room.debugId})`}
        description={`${area.name} - ${chapter.name} - ${side.name} side - ${checkpointName}`}
        image={`image/${area.id}/previews/${chapter.id}/${side.id}/${room.debugId}`}
      />
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 2}}>
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
          <Typography color="text.secondary">{checkpointName}</Typography>
          <Typography color="text.primary">{room.name} ({room.debugId})</Typography>
        </Breadcrumbs>
        <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)} onClick={() => setImageOpen(false)}>
          <AspectBox>
            <Image
              unoptimized
              src={getCampImageUrl(`image/${area.id}/previews/${chapter.id}/${side.id}/${room.debugId}`)}
              alt={`Very large image of room ${room.name}`}
              layout="fill"
              style={{
                imageRendering: "pixelated",
              }}
            />
          </AspectBox>
        </Dialog>
        <AspectBox marginTop={2} marginBottom={2}>
          <Image
            unoptimized
            priority
            onClick={() => isUpMdWidth && setImageOpen(true)}
            src={getCampImageUrl(`image/${area.id}/previews/${chapter.id}/${side.id}/${room.debugId}`)}
            alt={`Large image of room ${room.name}`}
            layout="fill"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </AspectBox>
        <Box display="flex" justifyContent="space-between">
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
        <Typography component="div" color="text.secondary">{checkpointName}</Typography>
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
  )
}

interface NamedLink {
  id: string;
  name: string;
  link: string;
}

interface PartiallyNamedLink {
  name?: string;
  link: string;
}

export interface RoomProps {
  area: NamedLink;
  chapter: NamedLink;
  side: {
    id: string;
    name: string;
  };
  checkpointName: string;
  room: {
    name?: string;
    debugId: string;
    roomId: string;
    checkpointRoomNo: string;
    levelRoomNo: string;
    teleportParams: string;
  };
  prevRoom?: PartiallyNamedLink;
  nextRoom?: PartiallyNamedLink;
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
    const area: Area = await fetchArea(areaId);
    for (const chapterId of area.chapters) {
      const chapter: Chapter = await fetchChapter(areaId, chapterId);
      for (const sideId of chapter.sides) {
        const side: Side = await fetchSide(areaId, chapterId, sideId);
        for (const roomId of Object.keys(side.rooms)) {
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

export const getStaticProps: GetStaticProps<RoomProps, RoomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId, sideId, roomId} = params;

  const area: Area = await fetchArea(areaId);
  area.id = areaId;

  const chapter: Chapter = await fetchChapter(areaId, chapterId);
  chapter.id = chapterId;

  const side: Side = await fetchSide(areaId, chapterId, sideId);
  side.id = sideId;

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
      checkpointName: checkpoint.name,
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