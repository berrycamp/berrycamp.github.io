import {ExpandLess, ExpandMore, Launch} from "@mui/icons-material";
import {Box, Collapse, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Tooltip} from "@mui/material";
import Link from "next/link";
import {FC, useState} from "react";
import {BerryPoint, Point} from "~/modules/data/dataTypes";
import {useCampContext} from "~/modules/provide/CampContext";
import {teleport} from "~/modules/teleport/teleport";
import {RoomData} from "../types";

interface EntityListProps {
  areaId: string;
  areaGameId: string;
  chapterId: string;
  chapterGameId: string;
  sideId: string;
  room: RoomData;
}

export const EntityList: FC<EntityListProps> = ({areaId, areaGameId, chapterId, chapterGameId, sideId, room}) => {
  const mapRoomUrl: string = `/map/${areaId}/${chapterId}/${sideId}?room=${room.debugId}`;
  const teleportParams: string = `?area=${areaGameId}/${chapterGameId}&side=${sideId}&level=${room.debugId}`;

  return (
    <Box pb={1}>
      {room.entities.spawn && (
        <EntityGroup
          name="Spawns"
          entities={room.entities.spawn}
          createItemName={(({x, y, name}: Record<string, unknown>) => `(${x}, ${y})${name ? ` - ${name}` : ""}`) as never}
          mapRoomUrl={mapRoomUrl}
          teleportParams={teleportParams}
        />
      )}
      {room.entities.berry && (
        <EntityGroup
          name="Strawberries"
          entities={room.entities.berry}
          createItemName={((berry: BerryPoint) => `${room.debugId}:${berry.id}`) as never}
          mapRoomUrl={mapRoomUrl}
        />
      )}
      {room.entities.cassette && room.entities.cassette[0] && (
        <Box mt={1}>
          <EntityItem
            name="Cassette"
            entity={room.entities.cassette[0]}
            mapRoomUrl={mapRoomUrl}
          />
        </Box>
      )}
      {room.entities.heart && room.entities.heart[0] && (
        <Box mt={1}>
          <EntityItem
            name="Crystal Heart"
            entity={room.entities.heart[0]}
            mapRoomUrl={mapRoomUrl}
          />
        </Box>
      )}
    </Box>
  );
}

interface EntityGroupProps {
  name: string;
  entities: Point[];
  createItemName: (entity: Point, index: number) => string;
  mapRoomUrl: string;
  teleportParams?: string;
}

const EntityGroup: FC<EntityGroupProps> = ({name, entities, createItemName, mapRoomUrl, teleportParams}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (): void => {
    setOpen(prev => !prev);
  };

  return (
    <Paper sx={{mt: 1}}>
      <ListItemButton onClick={handleClick}>
        <ListItemText>{name}</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>
        <List disablePadding>
          {entities.map((entity, index) => (
            <EntityItem
              key={index}
              name={createItemName(entity, index)}
              entity={entity}
              mapRoomUrl={mapRoomUrl}
              {...teleportParams && {teleportParams}}
            />
          ))}
        </List>
      </Collapse>
    </Paper>
  )
}

interface EntityItem {
  name: string;
  entity: Point;
  mapRoomUrl: string;
  teleportParams?: string;
}

const EntityItem: FC<EntityItem> = ({name, entity, mapRoomUrl, teleportParams}) => {
  const {settings: {port}} = useCampContext();

  const handleTeleport = async () => {
    await teleport(port, `${teleportParams}&x=${entity.x}&y=${entity.y}`);
  }

  return (
    <ListItem
      component={Paper}
      disablePadding
      {...teleportParams && {
        secondaryAction: (
          <Tooltip title="Teleport" enterDelay={750} placement="right">
            <IconButton size="small" onClick={handleTeleport} color="primary">
              <Launch fontSize="small"/>
            </IconButton>
          </Tooltip>
        ),
      }}
    >
      <Link passHref href={`${mapRoomUrl}&x=${entity.x}&y=${entity.y}`}>
        <ListItemButton component="a" onClick={handleTeleport}>
          <ListItemText>{name}</ListItemText>
        </ListItemButton>
      </Link>
    </ListItem>
  )
}