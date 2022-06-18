import {ExpandLess, ExpandMore, InsertLink, Launch} from "@mui/icons-material";
import {Collapse, IconButton, Link as MuiLink, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import Link from "next/link";
import {FC, useState} from "react";
import {OnViewChangeFn, RoomData} from ".";
import {Point} from "../canvas";
import {BerryPoint, BoundingBox} from "../data/dataTypes";
import {useCampContext} from "../provide/CampContext";
import {teleport} from "../teleport/teleport";

interface EntityListProps {
  areaId: string;
  areaGameId: string;
  chapterId: string;
  chapterGameId: string;
  sideId: string;
  room: RoomData;
  onViewChange: OnViewChangeFn;
  teleportParams?: string;
}

export const EntityList: FC<EntityListProps> = ({areaId, areaGameId, chapterId, chapterGameId, sideId, room, onViewChange}) => {
  const teleportParams: string = `?area=${areaGameId}/${chapterGameId}&side=${sideId}&level=${room.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${process.env.CAMP_URL}/map/${areaId}/${chapterId}/${sideId}?room=${room.id}`);
  }

  return (
    <>
      <List dense disablePadding>
        <ListItem
          secondaryAction={(
            <Tooltip title="Copy room map link" placement="right">
              <IconButton size="small" onClick={handleCopyLink}>
                <InsertLink fontSize="small"/>
              </IconButton>
            </Tooltip>
          )}
        >
          <Link passHref href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}>
            <MuiLink underline="hover" color="inherit">
              {room.id}{room.name && ` - ${room.name}`}
            </MuiLink>
          </Link>
        </ListItem>
      </List>
      <List dense disablePadding>
        {room.entities.spawn && (
          <EntityGroup
            name="Spawns"
            entities={room.entities.spawn}
            roomBox={room.canvas.boundingBox}
            onViewChange={onViewChange}
            createItemName={(({x, y, name}: Record<string, unknown>) => `(${x}, ${y})${name ? ` - ${name}` : ""}`) as never}
            teleportParams={teleportParams}
          />
        )}
        {room.entities.berry && (
          <EntityGroup
            name="Strawberries"
            entities={room.entities.berry}
            roomBox={room.canvas.boundingBox}
            onViewChange={onViewChange}
            createItemName={((berry: BerryPoint) => `${room.id}:${berry.id}`) as never}
          />
        )}
        {room.entities.cassette && room.entities.cassette[0] && (
          <EntityItem
            name="Cassette"
            entity={room.entities.cassette[0]}
            roomBox={room.canvas.boundingBox}
            onViewChange={onViewChange}
          />
        )}
        {room.entities.heart && room.entities.heart[0] && (
          <EntityItem
            name="Crystal Heart"
            entity={room.entities.heart[0]}
            roomBox={room.canvas.boundingBox}
            onViewChange={onViewChange}
          />
        )}
      </List>
    </>
  );
}

interface EntityGroupProps {
  name: string;
  entities: Point[];
  roomBox: BoundingBox;
  onViewChange: OnViewChangeFn;
  createItemName: (entity: Point, index: number) => string;
  teleportParams?: string;
}

export const EntityGroup: FC<EntityGroupProps> = ({name, entities, roomBox, onViewChange, createItemName, teleportParams}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (): void => {
    setOpen(prev => !prev);
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemText>{name}</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>
        <List dense disablePadding>
          {entities.map((entity, index) => (
            <EntityItem
              key={index}
              name={createItemName(entity, index)}
              entity={entity}
              roomBox={roomBox}
              onViewChange={onViewChange}
              indent={3}
              {...teleportParams && {teleportParams}}
            />
          ))}
        </List>
      </Collapse>
    </>
  )
}

interface EntityItemProps {
  name: string;
  entity: Point;
  roomBox: BoundingBox;
  indent?: number;
  onViewChange: OnViewChangeFn;
  teleportParams?: string;
}

export const EntityItem: FC<EntityItemProps> = ({
  name,
  entity: {x, y},
  roomBox: {left, top},
  onViewChange,
  indent,
  teleportParams,
}) => { 
  const {settings: {port}} = useCampContext();

  const handleClick = () => {
    onViewChange({left: left + x - 160, right: left + x + 160, top: top + y - 90, bottom: top + y + 90});
  }

  const handleTeleport = () => {
    teleport(port, `${teleportParams}&x=${x}&y=${y}`)
  }

  return (
    <ListItem
      disablePadding
      {...teleportParams && {
        secondaryAction: (
          <Tooltip title="Teleport" enterDelay={750}>
            <IconButton size="small" onClick={handleTeleport} color="primary">
              <Launch fontSize="small"/>
            </IconButton>
          </Tooltip>
        ),
      }}
    >
      <ListItemButton onClick={handleClick} {...indent && {sx: {pl: indent}}}>
        <ListItemText>{name}</ListItemText>
      </ListItemButton>
    </ListItem>
  )
}