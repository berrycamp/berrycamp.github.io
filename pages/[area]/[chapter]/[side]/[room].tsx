import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Button, Container, Dialog, Divider, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
import {DATA} from "logic/data/data";
import {AreaData, ChapterData, CheckpointData, RoomData, SideData} from "logic/data/dataTree";
import {getTitle} from "logic/utils/title";
import {GetStaticPaths, GetStaticProps, NextPage} from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {IMAGE_URL} from "pages/[area]/[chapter]";
import {ParsedUrlQuery} from "querystring";
import {Fragment, useState} from "react";
import styles from "../../../Common.module.css";

const Room: NextPage<RoomProps> = (props) => {
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  let prevRoom: RoomData | undefined = props.checkpoint.rooms[props.roomIndex - 1] ?? props.side.checkpoints[props.checkpointIndex - 1]?.rooms.at(-1);
  let nextRoom: RoomData | undefined = props.checkpoint.rooms[props.roomIndex + 1] ?? props.side.checkpoints[props.checkpointIndex + 1]?.rooms.at(0);

  let sideRoomNo: number = props.roomIndex;
  const sideRoomTotal: number = props.side.checkpoints.reduce<number>((prev, curr, index) => {
    if (index < props.checkpointIndex) {
      sideRoomNo += curr.rooms.length;
    }
    return prev + curr.rooms.length;
  }, 0);

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    const sideId: string | undefined = props.chapter.sides[props.sideIndex]?.name;
    if (sideId === undefined) {
      return;
    }

    try {
      await fetch(`http://localhost:32270/tp?area=${props.area.id}/${props.chapter.id}&side=${sideId}&level=${props.room.id}`);
    } catch (e) {
      // Do nothing.
    }
  }

  console.log(JSON.stringify(prevRoom));
  console.log(JSON.stringify(nextRoom));

  return (
    <Fragment>
      <Head>
        <title>{getTitle(props.room.name)}</title>
      </Head>
      <Container maxWidth="md">
        <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)}>
          <AspectBox>
            <Image
              className={styles.roomimage}
              unoptimized
              src={`${IMAGE_URL}/${props.chapterId}/${props.sideIndex + 1}/${props.checkpointIndex + 1}/${props.roomIndex + 1}.png`}
              alt={`${props.room.name} image`}
              layout="fill"
            />
          </AspectBox>
        </Dialog>
        <AspectBox marginTop={1} marginBottom={1}>
          <Image
            priority
            onClick={() => isUpMdWidth && setImageOpen(true)}
            className={styles.roomimage}
            unoptimized
            src={`${IMAGE_URL}/${props.chapterId}/${props.sideIndex + 1}/${props.checkpointIndex + 1}/${props.roomIndex + 1}.png`}
            alt={`${props.room.name} image`}
            layout="fill"
          />
        </AspectBox>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h4">{(props.subroom === undefined && props.room.subroom && props.room.fullRoomName) ? props.room.fullRoomName : props.room.name}</Typography>
          <Tooltip enterDelay={750} title={Number(props.room.subroom) - 1 ? "Location may not be accurate" : "Opens if Everest is installed and running."}>
            <Button
              variant="contained"
              color={Number(props.room.subroom) - 1 ? "warning" : "primary"}
              endIcon={Number(props.room.subroom) - 1 ? <Info /> : <Launch />}
              onClick={handleOpenRoom}
            >
              Open
            </Button>
          </Tooltip>
        </Box>
        <Typography color="GrayText">{props.chapter.name}</Typography>
        <Typography color="GrayText">{props.side.name} Side</Typography>
        <Typography color="GrayText">{props.checkpoint.name}</Typography>
        <Divider orientation="horizontal" sx={{marginTop: 1, marginBottom: 1}} />
        <Typography color="GrayText">Debug id: {props.room.id}</Typography>
        <Typography color="GrayText">Room id: {props.checkpoint.abbreviation}-{props.roomIndex + 1}</Typography>
        <Typography color="GrayText" sx={{marginTop: 1}}>Checkpoint Room: {props.roomIndex + 1}/{props.checkpoint.rooms.length}</Typography>
        <Typography color="GrayText">Side Room: {sideRoomNo}/{sideRoomTotal}</Typography>
        <Box display="flex" justifyContent="space-between" marginTop={1}>
          <Box>
            {prevRoom && (
              <Link passHref href={`/${props.areaId}/${props.chapterId}/${props.side.name.toLowerCase()}/${prevRoom.id}${prevRoom.subroom ? `/${prevRoom.subroom}` : ""}`}>
                <Button size="small" variant="outlined" startIcon={<NavigateBefore />}>{prevRoom.name}</Button>
              </Link>
            )}
          </Box>
          <Box>
            {nextRoom && (
              <Link passHref href={`/${props.areaId}/${props.chapterId}/${props.side.name.toLowerCase()}/${nextRoom.id}${nextRoom.subroom ? `/${nextRoom.subroom}` : ""}`}>
                <Button size="small" variant="outlined" endIcon={<NavigateNext />}>{nextRoom.name}</Button>
              </Link>
            )}
          </Box>
        </Box>
      </Container >
    </Fragment>
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

export default Room;