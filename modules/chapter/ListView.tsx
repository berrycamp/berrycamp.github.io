import {Box, Divider, List, ListItemButton, Typography} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC} from "react";
import {getRoomPreviewUrl} from "../fetch/dataApi";
import {ChapterViewItemProps, ChapterViewProps} from "./types";

export const ChapterListView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoints}) => (
  <>
    {checkpoints.map((checkpoint, checkpointIndex) => (
      <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
        <Typography component="div" variant="h5" color="text.secondary" marginTop={1} marginBottom={1}>
          {checkpointIndex + 1}. {checkpoint.name}
        </Typography>
        <List disablePadding>
          {checkpoint.rooms.map((room, roomIndex) => (
            <ChapterListViewItem
              key={`${sideId}-${room.id}`}
              roomId={room.id}
              {...room.name && {roomName: room.name}}
              roomNo={roomIndex + 1}
              image={getRoomPreviewUrl(areaId, chapterId, sideId, room.id)}
              href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
            />
          ))}
        </List>
        <Divider flexItem sx={{marginTop: 2, marginBottom: 1}} />
      </Box>
    ))}
  </>
);

const ChapterListViewItem: FC<ChapterViewItemProps & {roomNo: number}> = ({roomId, roomName, href, image, roomNo}) => (
  <Link passHref href={href} legacyBehavior>
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
      <Typography component="div" marginLeft={2} color="text.secondary">{roomNo}.</Typography>
      <Typography component="div" marginLeft={1} flexGrow={1}>{roomName}</Typography>
      <Typography component="div" color="text.secondary" marginRight={0.5}>{roomId}</Typography>
    </ListItemButton>
  </Link>
);