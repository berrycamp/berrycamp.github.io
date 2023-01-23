import {Card, CardActionArea, CardMedia, Grid, ImageListItemBar} from "@mui/material";
import Link from "next/link";
import {FC} from "react";
import {getRoomPreviewUrl} from "../fetch/dataApi";
import {ChapterViewItemProps, ChapterViewProps} from "./types";

export const ChapterGridView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoint}) => (
  <Grid container spacing={1} alignSelf="center">
    {checkpoint.rooms.map(room => (
      <ChapterGridItem
        key={`${sideId}-${room.id}`}
        roomId={room.id}
        {...room.name && {roomName: room.name}}
        image={getRoomPreviewUrl(areaId, chapterId, sideId, room.id)}
        href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
      />
    ))}
  </Grid>
);

export const ChapterGridItem: FC<ChapterViewItemProps> = ({roomId, roomName, href, image})=> (
  <Grid item xs={12} sm={6} md={4}>
    <Card sx={{width: "100%", height: "100%"}}>
      <Link passHref href={href}>
        <CardActionArea
          sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
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
          <ImageListItemBar
            title={roomName}
            subtitle={roomId}
            sx={{
              fontSize: 26,
              background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0))",
            }}
          />
        </CardActionArea>
      </Link>
    </Card>
  </Grid>
);