import {CheckpointData, RoomData, SideData} from './types';

/**
 * Filters rooms to only those matching the search term.
 * 
 * @param searchValue The search term.
 * @param side The side to search.
 * @param exact If the rooms should be filtered with an exact value.
 * @returns Filtered rooms.
 */
 export const filterCheckpoints = (searchValue: string, side: SideData, exact: boolean = false): CheckpointData[] => {
  const value: string = searchValue.toLowerCase();

  return side.checkpoints.reduce<CheckpointData[]>((prev, checkpoint) => {
    const rooms: RoomData[] = checkpoint.rooms.filter((room, index) => {
      return showRoom(value, room, exact) || showRoomForCheckpoint(value, checkpoint, index + 1, exact);
    });
    if (rooms.length > 0) {
      prev.push({...checkpoint, rooms});
    }

    return prev;
  }, []);
}

const showRoom = (value: string, room: RoomData, exact: boolean = false): boolean => {
  return exact ? matchesRoomExact(value, room) : matchesRoom(value, room);
};

const showRoomForCheckpoint = (value: string, checkpoint: CheckpointData, roomNo: number, exact: boolean = false) => {
  return exact ? matchesCheckpointExact(value, checkpoint, roomNo) : matchesCheckpoint(value, checkpoint, roomNo);;
};

const matchesRoom = (value: string, room: RoomData): boolean => {
  return room.name?.toLowerCase().includes(value)
    || room.id.toLowerCase().includes(value)
    || Boolean(room.tags.some(tag => tag.toLowerCase().includes(value)));
};

const matchesRoomExact = (value: string, room: RoomData) => {
  return room.name?.toLowerCase() === value.trim()
    || room.id.toLowerCase() === value
    || Boolean(room.tags.some(tag => tag.toLowerCase() === value.trim()));
};

const matchesCheckpoint = (value: string, checkpoint: CheckpointData, roomNo: number): boolean => {
  return checkpoint.name.toLowerCase().includes(value)
    || checkpoint.abbreviation.toLowerCase().includes(value)
    || `${checkpoint.abbreviation.toLocaleLowerCase()}-${roomNo}` === value;
}

const matchesCheckpointExact = (value: string, checkpoint: CheckpointData, roomNo: number) => {
  return checkpoint.name.toLowerCase() === value
    || checkpoint.abbreviation.toLowerCase() === value
    || `${checkpoint.abbreviation.toLocaleLowerCase()}-${roomNo}` === value;
}