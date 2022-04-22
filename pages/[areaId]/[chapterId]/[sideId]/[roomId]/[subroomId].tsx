import {DATA} from "logic/data/data";
import {Area, Chapter, Checkpoint, Room, Side, Subroom} from "logic/data/dataTree";
import {GetStaticPaths, GetStaticProps} from "next";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import RoomPage, {RoomProps} from "../[roomId]";

const SubroomPage: AppNextPage<RoomProps> = (props) => {
  return (
    <RoomPage {...props} />
  )
}

interface SubroomParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
  roomId: string;
  subroomId: string;
}

export const getStaticPaths: GetStaticPaths<SubroomParams> = async () => {
  const paths: {params: SubroomParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const [chapterId, chapter] of Object.entries(area.chapters)) {
      for (const [sideId, side] of Object.entries(chapter.sides)) {
        for (const [roomId, room] of Object.entries(side.rooms)) {
          room.subrooms?.forEach((_, subroomIndex) => {
            paths.push({params: {areaId, chapterId, sideId, roomId, subroomId: String(subroomIndex + 1)}});
          })
        }
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<RoomProps, SubroomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined");
  }

  const {areaId, chapterId, sideId, roomId, subroomId} = params;
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

  const subrooms: Subroom[] | undefined = room.subrooms;
  if (subrooms === undefined || subrooms.length === 0) {
    throw Error(`Room ${roomId} has no subrooms.`)
  }

  const subroomIndex: number = Number(subroomId) - 1;
  const subroom: Subroom | undefined = subrooms[subroomIndex];
  if (subroom === undefined) {
    throw Error(`Could not find subroom ${subroomId} in room ${roomId}`)
  }

  const prevSubroom: Subroom | undefined = subrooms[subroomIndex - 1];
  const nextSubroom: Subroom | undefined = subrooms[subroomIndex + 1];

  const roomIndex: number = checkpoint.roomOrder.findIndex(id => id === roomId);

  const prevRoomId: string | undefined = checkpoint.roomOrder[roomIndex - 1] ?? side.checkpoints[room.checkpointNo - 1]?.roomOrder.slice(-1)[0];
  const nextRoomId: string | undefined = checkpoint.roomOrder[roomIndex + 1] ?? side.checkpoints[room.checkpointNo + 1]?.roomOrder[0];
  const prevRoom: Room | undefined = prevRoomId ? side.rooms[prevRoomId] : undefined;
  const nextRoom: Room | undefined = nextRoomId ? side.rooms[nextRoomId] : undefined;

  const sideRoomIndex = side.checkpoints.slice(0, room.checkpointNo).reduce<number>((prev, curr) => prev + curr.roomCount, 0) + roomIndex;

  return {
    props: {
      area: {
        name: area.name,
        link: `/${areaId}`,
      },
      chapter: {
        name: chapter.name,
        link: `/${areaId}/${chapterId}`
      },
      sideName: side.name,
      checkpointName: checkpoint.name,
      room: {
        name: subroom.name,
        image: subroom.image,
        debugId: roomId,
        roomId: `${checkpoint.abbreviation}-${roomIndex + 1}`,
        levelRoomNo: `${sideRoomIndex + 1}/${side.roomCount}`,
        checkpointRoomNo: `${roomIndex + 1}/${checkpoint.roomCount}`,
        teleportParams: `?area=${areaId}/${chapterId}&side=${sideId}&level=${roomId}&x=${subroom.x}&y=${subroom.y}`,
      },
      ...prevRoom && {
        prevRoom: {
          name: prevRoom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}`,
        }
      },
      ...nextRoom && {
        nextRoom: {
          name: nextRoom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}`,
        }
      },
      ...prevSubroom && {
        prevSubroom: {
          name: prevSubroom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex}`,
        }
      },
      ...nextSubroom && {
        nextSubroom: {
          name: nextSubroom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 2}`,
        }
      }
    }
  }
}

export default SubroomPage;