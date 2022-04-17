import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
import {DATA} from "logic/data/data";
import {AreaData, ChapterData, CheckpointData, RoomData, SideData} from "logic/data/dataTree";
import {Layout} from "modules/layout/Layout";
import {GetStaticPaths, GetStaticProps} from "next";
import Image from "next/image";
import Link from "next/link";
import {IMAGE_URL} from "pages/[area]/[chapter]";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {useEffect, useState} from "react";

const RoomPage: AppNextPage<RoomProps> = ({
  areaId,
  area,
  chapterId,
  chapter,
  sideIndex,
  side,
  checkpointIndex,
  checkpoint,
  roomIndex,
  room,
  subroom,
  mode,
  toggleMode,
  view,
  setView,
}) => {
  const roomImageUrl: string = `${IMAGE_URL}/${chapterId}/${sideIndex + 1}/${checkpointIndex + 1}/${roomIndex + 1}.png`;

  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  let prevRoom: RoomData | undefined = checkpoint.rooms[roomIndex - 1] ?? side.checkpoints[checkpointIndex - 1]?.rooms.slice(-1)[0];
  let nextRoom: RoomData | undefined = checkpoint.rooms[roomIndex + 1] ?? side.checkpoints[checkpointIndex + 1]?.rooms[0];

  let sideRoomIndex: number = roomIndex;
  const sideRoomTotal: number = side.checkpoints.reduce<number>((prev, curr, index) => {
    if (index < checkpointIndex) {
      sideRoomIndex += curr.rooms.length;
    }
    return prev + curr.rooms.length;
  }, 0);

  const prevRoomLink: string | undefined = prevRoom ? `/${areaId}/${chapterId}/${side.name.toLowerCase()}/${prevRoom.id}${prevRoom.subroom ? `/${prevRoom.subroom}` : ""}` : undefined;
  const nextRoomLink: string | undefined = nextRoom ? `/${areaId}/${chapterId}/${side.name.toLowerCase()}/${nextRoom.id}${nextRoom.subroom ? `/${nextRoom.subroom}` : ""}` : undefined;

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    const sideId: string | undefined = chapter.sides[sideIndex]?.name;
    if (sideId === undefined) {
      return;
    }

    try {
      await fetch(`http://localhost:32270/tp?area=${area.id}/${chapter.id}&side=${sideId}&level=${room.id}`, {mode: "no-cors"});
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
              className="pixelated-image"
              unoptimized
              src={roomImageUrl}
              alt={`Very large image of room ${room.name}`}
              layout="fill"
            />
          </AspectBox>
        </Dialog>
        <AspectBox marginTop={2} marginBottom={2}>
          <Image
            priority
            onClick={() => isUpMdWidth && setImageOpen(true)}
            className="pixelated-image"
            unoptimized
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
        <Typography component="div" color="text.secondary">Room in level: {sideRoomIndex + 1}/{sideRoomTotal}</Typography>
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
  area: AreaData;
  chapterId: string;
  chapter: ChapterData;
  sideIndex: number;
  side: SideData;
  checkpointIndex: number;
  checkpoint: CheckpointData;
  roomIndex: number;
  room: RoomData;
  subroom?: number;
}

interface RoomParams extends ParsedUrlQuery {
  area: string;
  chapter: string;
  side: string;
  room: string;
}

export const getStaticPaths: GetStaticPaths<RoomParams> = async () => {
  const paths: {params: RoomParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const [chapterId, chapter] of Object.entries(area.chapters)) {
      for (const side of chapter.sides) {
        for (const checkpoint of side.checkpoints) {
          for (const room of checkpoint.rooms) {
            paths.push({params: {area: areaId, chapter: chapterId, side: side.name.toLowerCase(), room: room.id}});
          }
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

  const {area: areaId, chapter: chapterId, side: sideId, room: roomId} = params;
  const area: AreaData | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid`);
  }

  const chapter: ChapterData | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  const sideIndex: number = chapter.sides.findIndex(s => s.name.toLowerCase() === sideId.toLowerCase())
  const side: SideData | undefined = chapter.sides[sideIndex];
  if (side === undefined) {
    throw Error("Side not defined");
  }

  const roomData: {checkpointIndex: number, checkpoint: CheckpointData, roomIndex: number, room: RoomData} | undefined = getRoomData(side, roomId);
  if (roomData === undefined) {
    throw Error(`Could not find room ${roomId} in side ${side.name}`);
  }
  const {checkpointIndex, checkpoint, roomIndex, room} = roomData;

  return {
    props: {
      areaId,
      area,
      chapterId,
      chapter,
      sideIndex,
      side,
      checkpointIndex,
      checkpoint,
      roomIndex,
      room,
    }
  }
}

/**
 * Find the room by id in a side.
 * 
 * @param side The side to search.
 * @param roomId The room id.
 * @returns The room data.
 */
const getRoomData = (side: SideData, roomId: string): {checkpointIndex: number, checkpoint: CheckpointData, roomIndex: number, room: RoomData} | undefined => {
  for (let checkpointIndex = 0; checkpointIndex < side.checkpoints.length; checkpointIndex++) {
    const checkpoint: CheckpointData = side.checkpoints[checkpointIndex] as CheckpointData;
    for (let roomIndex = 0; roomIndex < checkpoint.rooms.length; roomIndex++) {
      const room: RoomData = checkpoint.rooms[roomIndex] as RoomData;
      if (room.id === roomId) {
        return {checkpointIndex, checkpoint, roomIndex, room}
      }
    }
  }

  return undefined;
}

export default RoomPage;