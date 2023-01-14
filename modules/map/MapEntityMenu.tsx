import {ExpandLess, ExpandMore, RocketLaunch} from "@mui/icons-material";
import {Collapse, IconButton, Link as MuiLink, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import Link from "next/link";
import {useRouter} from "next/router";
import {FC, memo, useState} from "react";
import {RoomData} from ".";
import {Point} from "../canvas";
import {useMobile} from "../common/useMobile";
import {BerryPoint} from "../data/dataTypes";
import {useCampContext} from "../provide/CampContext";
import {teleport} from "../teleport/teleport";

interface MapEntityMenuProps {
  areaGameId: string;
  chapterGameId: string;
  areaId: string;
  chapterId: string;
  sideId: string;
  room: RoomData;
  teleportParams?: string;
}

export const MapEntityMenu: FC<MapEntityMenuProps> = memo(({areaGameId, chapterGameId, areaId, chapterId, sideId, room}) => {
  const teleportParams: string = `?area=${areaGameId}/${chapterGameId}&side=${sideId}&level=${room.id}`

  return <>
    <List dense disablePadding sx={{whiteSpace: "nowrap", flex: 1}}>
      <ListItem>
        <Link
          passHref
          href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
        >
          <MuiLink underline="hover" color="inherit">
            {room.id}{room.name && ` - ${room.name}`}
          </MuiLink>
        </Link>
      </ListItem>
    </List>
    <List dense disablePadding sx={{whiteSpace: "nowrap"}}>
      {room.entities.spawn && (
        <MapEntityMenuGroup
          name="Spawns"
          entities={room.entities.spawn}
          createItemName={(({x, y, name}: Record<string, unknown>) => `(${x}, ${y})${name ? ` - ${name}` : ""}`) as never}
          roomId={room.id}
          teleportParams={teleportParams}
        />
      )}
      {room.entities.berry && (
        <MapEntityMenuGroup
          name="Strawberries"
          entities={room.entities.berry}
          roomId={room.id}
          createItemName={((berry: BerryPoint) => `${room.id}:${berry.id}`) as never}
        />
      )}
      {room.entities.cassette && room.entities.cassette[0] && (
        <MapEntityMenuItem
          name="Cassette"
          entity={room.entities.cassette[0]}
          roomId={room.id}
        />
      )}
      {room.entities.heart && room.entities.heart[0] && (
        <MapEntityMenuItem
          name="Crystal Heart"
          entity={room.entities.heart[0]}
          roomId={room.id}
        />
      )}
    </List>
  </>;
});

interface MapEntityMenuGroupProps {
  name: string;
  entities: Point[];
  createItemName: (entity: Point, index: number) => string;
  roomId: string;
  teleportParams?: string;
}

export const MapEntityMenuGroup: FC<MapEntityMenuGroupProps> = ({
  name,
  entities,
  createItemName,
  roomId,
  teleportParams,
}) => {
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
            <MapEntityMenuItem
              key={index}
              name={createItemName(entity, index)}
              entity={entity}
              roomId={roomId}
              indent={3}
              {...teleportParams && {teleportParams}}
            />
          ))}
        </List>
      </Collapse>
    </>
  )
}

interface MapEntityMenuItemProps {
  name: string;
  entity: Point;
  roomId: string;
  indent?: number;
  teleportParams?: string;
}

export const MapEntityMenuItem: FC<MapEntityMenuItemProps> = ({
  name,
  entity: {x, y},
  indent,
  roomId,
  teleportParams,
}) => { 
  const {settings: {everestUrl, everest}} = useCampContext();
  const {isMobile} = useMobile();
  const router = useRouter();

  const handleClick = () => {
    const {areaId, chapterId, sideId} = router.query;
    router.replace({query: {areaId, chapterId, sideId, room: roomId, x, y}}, undefined, {shallow: true});
  }

  const handleTeleport = () => {
    void teleport({url: everestUrl, params: `${teleportParams}&x=${x}&y=${y}`});
  }

  return (
    <ListItem
      disablePadding
      sx={{
        "& .MuiListItemSecondaryAction-root": {
          right: 4,
        }
      }}
      {...!isMobile && everest && teleportParams && {
        secondaryAction: (
          <Tooltip title="Open" enterDelay={750}>
            <IconButton size="small" onClick={handleTeleport} color="primary">
              <RocketLaunch fontSize="small"/>
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