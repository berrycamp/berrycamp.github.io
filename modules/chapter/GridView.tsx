import {Box, Card, CardActionArea, CardMedia, Divider, ImageListItemBar, Typography} from "@mui/material";
import Link from "next/link";
import {FC, useState} from "react";
import {getRoomPreviewUrl} from "../fetch/dataApi";
import {ChapterViewItemProps, ChapterViewProps} from "./types";

export const ChapterGridView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoints}) => (
  <>
    {checkpoints.map((checkpoint, checkpointIndex) => (
      <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
        <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
          {checkpointIndex + 1}. {checkpoint.name}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
          {checkpoint.rooms.map(room => (
            <ChapterGridItem
              key={room.id}
              roomId={room.id}
              {...room.name && {roomName: room.name}}
              image={getRoomPreviewUrl(areaId, chapterId, sideId, room.id)}
              href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
            />
          ))}
        </Box>
        <Divider flexItem />
      </Box>
    ))}
  </>
);

export const ChapterGridItem: FC<ChapterViewItemProps> = ({roomId, roomName, href, image})=> {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Card sx={{width: 320, height: 180}}>
      <Link passHref href={href}>
        <CardActionArea
          sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            imageRendering: "pixelated",
          }}
        >
          <CardMedia
            component="img"
            src={image}
            alt={`Thumbnail for room ${roomName}`}
            style={{
              imageRendering: "pixelated",
            }}
          />
          {hover && (
            <ImageListItemBar
              title={roomName}
              subtitle={roomId}
              sx={{fontSize: 26}}
            />
          )}
        </CardActionArea>
      </Link>
    </Card>
  );
}