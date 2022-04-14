import {DATA} from "logic/data/data";
import {Area, Chapter, Checkpoint, Room, Side} from "logic/data/dataTree";
import {GetStaticPaths, GetStaticProps, NextPage} from "next";
import {ParsedUrlQuery} from "querystring";
import {Fragment} from "react";

const Subroom: NextPage<SubroomProps> = (props) => {
  return (
    <Fragment>
      {JSON.stringify(props)}
    </Fragment>
  )
}

interface SubroomProps {
  chapter: Chapter;
  side: Side;
  checkpoint: Checkpoint;
  room: Room;
  roomNo: number;
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

  const side: Side | undefined = chapter.sides.find(s => s.name.toLowerCase() === sideId.toLowerCase());
  if (side === undefined) {
    throw Error("Side not defined");
  }

  const roomData: {checkpoint: Checkpoint, room: Room, roomNo: number} | undefined = getRoomData(side, roomId);
  if (roomData === undefined) {
    throw Error(`Could not find room ${roomId} in side ${side.name}`);
  }
  const {checkpoint, room, roomNo} = roomData;

  return {
    props: {
      chapter,
      side,
      checkpoint,
      room,
      roomNo,
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
 * @returns The room data.
 */
const getRoomData = (side: Side, roomId: string): {checkpoint: Checkpoint, room: Room, roomNo: number} | undefined => {
  for (let i = 0; i < side.checkpoints.length; i++) {
    const checkpoint: Checkpoint = side.checkpoints[i] as Checkpoint;
    for (let j = 0; j < checkpoint.rooms.length; j++) {
      const room: Room = checkpoint.rooms[j] as Room;
      if (room.id === roomId) {
        return {checkpoint, room, roomNo: j + 1}
      }
    }
  }

  return undefined;
}

export default Subroom;