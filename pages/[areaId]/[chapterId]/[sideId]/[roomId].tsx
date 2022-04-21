import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
import {DATA} from "logic/data/data";
import {Area, Chapter, Checkpoint, Room, Side, Subroom} from "logic/data/dataTree";
import {Layout} from "modules/layout/Layout";
import {GetStaticPaths, GetStaticProps} from "next";
import Image from "next/image";
import Link from "next/link";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {useEffect, useState} from "react";

const RoomPage: AppNextPage<RoomProps> = ({
  areaId,
  area,
  chapterId,
  chapter,
  sideId,
  side,
  checkpoint,
  roomIndex,
  room,
  subroomId,
  subroom,
  mode,
  toggleMode,
  view,
  setView,
}) => {
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  const prevRoomId: string | undefined = checkpoint.roomOrder[roomIndex - 1] ?? side.checkpoints[room.checkpointNo - 1]?.roomOrder.slice(-1)[0];
  const nextRoomId: string | undefined = checkpoint.roomOrder[roomIndex + 1] ?? side.checkpoints[room.checkpointNo + 1]?.roomOrder[0];
  const prevRoom: Room | undefined = prevRoomId ? side.rooms[prevRoomId] : undefined;
  const nextRoom: Room | undefined = nextRoomId ? side.rooms[nextRoomId] : undefined;

  const sideRoomIndex = side.checkpoints.slice(room.checkpointNo - 1).reduce<number>((prev, curr) => prev + curr.roomCount, 0) + roomIndex;

  const prevRoomLink: string | undefined = prevRoom ? `/${areaId}/${chapterId}/${sideId}${prevRoom.subroom ? `/${prevRoom.subroom}` : ""}` : undefined;
  const nextRoomLink: string | undefined = nextRoom ? `/${areaId}/${chapterId}/${sideId}/${nextRoom.id}${nextRoom.subroom ? `/${nextRoom.subroom}` : ""}` : undefined;

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    const sideId: string | undefined = chapter.sides[sideIndex]?.name;
    if (sideId === undefined) {
      return;
    }

    try {
      await fetch(`http://localhost:32270/tp?area=${area.id}/${chapter.gameId}&side=${sideId}&level=${room.id}`, {mode: "no-cors"});
    } catch (e) {
      // Do nothing.
    }
  }

  /**
   * Listen for left and right presses to navigate rooms.
   */
  useEffect(() => {
    const listener = (event: WindowEventMap["keydown"]) => {
      if (event.key === "ArrowLeft" && prevRoomLink) {
        window.location.href = prevRoomLink;
      } else if (event.key === "ArrowRight" && nextRoomLink) {
        window.location.href = nextRoomLink;
      }
    }

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [nextRoomLink, prevRoomLink])

  return (
    <Layout
      title={`${room.name} (${room.id})`}
      description={`${area.name} - ${chapter.name} - ${side.name} side - ${checkpoint.name}`}
      imgUrl={roomImageUrl}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 2}}>
          <MuiLink href={`/${areaId}`} underline="always">
            {area.name}
          </MuiLink>
          <MuiLink href={`/${areaId}/${chapterId}`} underline="always">
            {chapter.name}
          </MuiLink>
          <Typography color="text.secondary">{side.name}</Typography>
          <Typography color="text.secondary">{checkpoint.name}</Typography>
          <Typography color="text.primary">{room.name} ({room.id}{room.subroom ? ` / ${room.subroom}` : ""})</Typography>
        </Breadcrumbs>
        <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)} onClick={() => setImageOpen(false)}>
          <AspectBox>
            <Image
              unoptimized
              className="pixelated-image"
              src={roomImageUrl}
              alt={`Very large image of room ${room.name}`}
              layout="fill"
            />
          </AspectBox>
        </Dialog>
        <AspectBox marginTop={2} marginBottom={2}>
          <Image
            unoptimized
            priority
            onClick={() => isUpMdWidth && setImageOpen(true)}
            className="pixelated-image"
            src={roomImageUrl}
            alt={`Large image of room ${room.name}`}
            layout="fill"
          />
        </AspectBox>
        <Box display="flex" justifyContent="space-between">
          <Typography component="div" variant="h4">{(subroom === undefined && room.subroom && room.fullRoomName) ? room.fullRoomName : room.name}</Typography>
          <Tooltip enterDelay={750} title={Number(room.subroom) - 1 ? "Location may not be accurate" : "Opens if Everest is installed and running"}>
            <Button
              variant="contained"
              color={Number(room.subroom) - 1 ? "warning" : "primary"}
              endIcon={Number(room.subroom) - 1 ? <Info /> : <Launch />}
              onClick={handleOpenRoom}
              aria-label="Open the current room in Celeste"
            >
              Open
            </Button>
          </Tooltip>
        </Box>
        <Typography component="div" color="text.secondary">{chapter.name}</Typography>
        <Typography component="div" color="text.secondary">{side.name} Side</Typography>
        <Typography component="div" color="text.secondary">{checkpoint.name}</Typography>
        <Divider orientation="horizontal" sx={{marginTop: 1, marginBottom: 1}} />
        <Typography component="div" color="text.secondary">Debug id: {room.id}</Typography>
        <Typography component="div" color="text.secondary">Room id: {checkpoint.abbreviation}-{roomIndex + 1}</Typography>
        {room.subroom && <Typography component="div" color="text.secondary">Subroom: {room.subroom}</Typography>}
        <Typography component="div" color="text.secondary" sx={{marginTop: 1}}>Room in checkpoint: {roomIndex + 1}/{checkpoint.rooms.length}</Typography>
        <Typography component="div" color="text.secondary">Room in level: {sideRoomIndex + 1}/{side.roomCount}</Typography>
        <Box display="flex" justifyContent="space-between" marginTop={1}>
          <Box>
            {prevRoom && prevRoomLink && (
              <Link passHref href={prevRoomLink}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevRoom.name}`}
                >
                  {prevRoom.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box>
            {nextRoom && nextRoomLink && (
              <Link passHref href={nextRoomLink}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextRoom.name}`}
                >
                  {nextRoom.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Container >
    </Layout>
  )
}

interface RoomProps {
  areaId: string;
  area: Area;
  chapterId: string;
  chapter: Chapter;
  sideId: string;
  side: Side;
  checkpoint: Checkpoint;
  roomId: string;
  roomIndex: number;
  room: Room;
  subroomId?: number;
  subroom?: Subroom;
}

interface RoomParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
  roomId: string;
}

export const getStaticPaths: GetStaticPaths<RoomParams> = async () => {
  const paths: {params: RoomParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const [chapterId, chapter] of Object.entries(area.chapters)) {
      for (const [sideId, side] of Object.entries(chapter.sides)) {
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
    throw Error("Params was not defined");
  }

  const {areaId, chapterId, sideId, roomId} = params;
  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid`);
  }

  const chapter: Chapter | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  const side: Side | undefined = chapter.sides[sideId];
  if (side === undefined) {
    throw Error("Side not defined");
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

  return {
    props: {
      areaId,
      area,
      chapterId,
      chapter,
      sideId,
      side,
      checkpoint,
      roomId,
      roomIndex,
      room,
    }
  }
}

export default RoomPage;