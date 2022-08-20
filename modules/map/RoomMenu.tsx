import {ExpandLess, ExpandMore, Info, RocketLaunch} from "@mui/icons-material";
import {Collapse, IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import Link from "next/link";
import {FC, memo, useEffect, useRef, useState} from "react";
import {AreaData, ChapterData, CheckpointDataExtended, OnRoomSelectFn, OnViewChangeFn, RoomData, SideData} from ".";
import {useCampContext} from "../provide/CampContext";
import {teleport} from "../teleport/teleport";

interface MapRoomMenuProps {
  area: AreaData;
  chapter: ChapterData;
  side: SideData;
  checkpoints: CheckpointDataExtended[];
  onViewChange: OnViewChangeFn;
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn
}

export const MapRoomMenu: FC<MapRoomMenuProps> = memo(({area, chapter, side, checkpoints, onViewChange, selectedRoom, onRoomSelect}) => {
  const teleportParams = `?area=${area.gameId}/${chapter.gameId}&side=${side.id}`;

  return (
    <>
      <List dense disablePadding sx={{width: "100%", whiteSpace: "nowrap"}}>
        <ListItem
          disablePadding
          secondaryAction={(
            <Link passHref href={`/${area.id}/${chapter.id}?side=${side.id}`}>
              <IconButton component="a" size="small" color="primary">
                <Info fontSize="small"/>
              </IconButton>
            </Link>
          )}
        >
          <ListItemButton onClick={() => onViewChange(side.boundingBox)} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
            <ListItemText>{chapter.name} - {side.name} side</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <List dense disablePadding>
        {checkpoints.map((checkpoint, index) => (
          <CheckpointItem
            key={index}
            checkpoint={checkpoint}
            onViewChange={onViewChange}
            onRoomSelect={onRoomSelect}
            selectedRoom={selectedRoom}
            teleportParams={teleportParams}
          />
        ))}
      </List>
    </>
  );
});

interface CheckpointItemProps {
  checkpoint: CheckpointDataExtended;
  onViewChange: OnViewChangeFn;
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn;
  teleportParams: string;
}

export const CheckpointItem: FC<CheckpointItemProps> = ({checkpoint, onViewChange, onRoomSelect, selectedRoom, teleportParams}) => {
  const [open, setOpen] = useState<boolean>(true);

  const handleClick = (): void => {
    setOpen(prev => !prev);
    onViewChange(checkpoint.boundingBox)
  }

  return (
    <>
      <ListItemButton
        key={checkpoint.name}
        onClick={handleClick}
        sx={{whiteSpace: "nowrap"}}
      >
        <ListItemText>{checkpoint.name}</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} unmountOnExit>
        <List dense disablePadding>
          {checkpoint.rooms.map(room => (
           <RoomItem
            key={room.id}
            room={room}
            onViewChange={onViewChange}
            selectedRoom={selectedRoom}
            onRoomSelect={onRoomSelect}
            teleportParams={teleportParams}
           />
          ))}
        </List>
      </Collapse>
    </>
  );
}

interface RoomItemProps {
  room: RoomData;
  onViewChange: OnViewChangeFn;
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn;
  teleportParams: string
}

export const RoomItem: FC<RoomItemProps> = ({room, onViewChange, onRoomSelect, selectedRoom, teleportParams}) => {
  const {settings: {port}} = useCampContext();
  const ref = useRef<HTMLLIElement | null>(null);
  const selected: boolean = selectedRoom === room.id;

  const handleClick = (): void => {
    onViewChange(room.canvas.boundingBox)
    onRoomSelect(room);
  };

  const handleTeleport = (): void => {
    teleport(port, `${teleportParams}&level=${room.id}&x=${room.defaultSpawn.x}&y=${room.defaultSpawn.y}`)
  };

  /**
   * Scroll into view on selection.
   */
  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({block: "nearest", behavior: "smooth"})
    }
  }, [selected]);

  return (
    <ListItem
      ref={ref}
      disablePadding
      secondaryAction={(
        <Tooltip title="Launch" enterDelay={750} placement="right">
          <IconButton size="small" onClick={handleTeleport} color="primary">
            <RocketLaunch fontSize="small"/>
          </IconButton>
        </Tooltip>
      )}
    >
      <ListItemButton
        selected={selectedRoom === room.id}
        key={room.id}
        onClick={handleClick}
        sx={{pl: 4, whiteSpace: "nowrap"}}
      >
        <ListItemText><strong>{room.id}</strong>{room.name && <span> - {room.name}</span>}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}
