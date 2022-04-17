import {DATA} from "logic/data/data";
import {Area, Chapter, Checkpoint, Room, Side} from "logic/data/dataTree";
import {GetStaticPaths, GetStaticProps} from "next";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import RoomPage from "../[room]";

const SubroomPage: AppNextPage<SubroomProps> = (props) => {
  return (
    <RoomPage {...props} />
  )
}

interface SubroomProps {
  areaId: string;
  area: Area;
  chapterId: string;
  chapter: Chapter;
  sideIndex: number;
  side: Side;
  checkpointIndex: number;
  checkpoint: Checkpoint;
  roomIndex: number;
  room: Room;
  subroom: number;
}

interface SubroomParams extends ParsedUrlQuery {
  area: string;
  chapter: string;
  side: string;
  room: string;
  subroom: string;
}

export const getStaticPaths: GetStaticPaths<SubroomParams> = async () => {
  const paths: {params: SubroomParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const [chapterId, chapter] of Object.entries(area.chapters)) {
      for (const side of chapter.sides) {
        for (const checkpoint of side.checkpoints) {
          for (const room of checkpoint.rooms) {
            if (room.subroom) {
              paths.push({params: {area: areaId, chapter: chapterId, side: side.name.toLowerCase(), room: room.id, subroom: String(room.subroom)}});
            }
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

export const getStaticProps: GetStaticProps<SubroomProps, SubroomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined");
  }

  const {area: areaId, chapter: chapterId, side: sideId, room: roomId, subroom} = params;
  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid`);
  }

  const chapter: Chapter | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  const sideIndex: number = chapter.sides.findIndex(s => s.name.toLowerCase() === sideId.toLowerCase())
  const side: Side | undefined = chapter.sides[sideIndex];
  if (side === undefined) {
    throw Error("Side not defined");
  }

  const roomData: {checkpointIndex: number, checkpoint: Checkpoint, roomIndex: number, room: Room} | undefined = getRoomData(side, roomId, subroom);
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
      subroom: Number(subroom),
    }
  }
}

/**
 * TODO get the subroom
 * 
 * Find the room by id in a side.
 * 
 * @param side The side to search.
 * @param roomId The room id.
 * @param subroom The subroom.
 * @returns The room data.
 */
const getRoomData = (side: Side, roomId: string, subroom: string): {checkpointIndex: number, checkpoint: Checkpoint, roomIndex: number, room: Room} | undefined => {
  for (let checkpointIndex = 0; checkpointIndex < side.checkpoints.length; checkpointIndex++) {
    const checkpoint: Checkpoint = side.checkpoints[checkpointIndex] as Checkpoint;
    for (let roomIndex = 0; roomIndex < checkpoint.rooms.length; roomIndex++) {
      const room: Room = checkpoint.rooms[roomIndex] as Room;
      if (room.id === roomId && room.subroom === Number(subroom)) {
        return {checkpointIndex, checkpoint, roomIndex, room}
      }
    }
  }

  return undefined;
}

export default SubroomPage;