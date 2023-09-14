import {List, ListItemButton, Typography} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC} from "react";
import {ChapterViewItemProps, ChapterViewProps} from "../chapter/types";
import {getRoomPreviewUrl} from "../fetch/dataApi";

export const SideListView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoint}) => (
  <List disablePadding sx={{pb: 1}}>
    {checkpoint.rooms.map((room, roomIndex) => (
      <SideListViewItem
        key={`${sideId}-${room.id}`}
        roomId={room.id}
        abbr={checkpoint.abbreviation}
        roomNo={roomIndex + 1}
        image={getRoomPreviewUrl(areaId, chapterId, sideId, room.id)}
        href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
      />
    ))}
  </List>
);

const SideListViewItem: FC<ChapterViewItemProps & {abbr: string; roomNo: number}> = ({roomId, roomName, href, image, roomNo, abbr}) => (
  <Link passHref href={href}>
    <ListItemButton
      disableGutters
      component="a"
      sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
    >
      <Image
        unoptimized
        src={image}
        alt={`Image of room ${roomName}`}
        width={80}
        height={45}
      />
      <Typography component="div" marginLeft={2} flexGrow={1}>{roomId}</Typography>
      <Typography component="div" color="text.secondary" marginRight={0.5}>{abbr}-{roomNo}</Typography>
    </ListItemButton>
  </Link>
);