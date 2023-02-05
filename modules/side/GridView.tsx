import {Card, CardActionArea, CardMedia, Grid, ImageListItemBar} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC} from "react";
import {ChapterViewItemProps, ChapterViewProps} from "../chapter/types";
import {AspectBox} from "../common/aspectBox/AspectBox";
import {getRoomPreviewUrl} from "../fetch/dataApi";

export const SideGridView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoint}) => (
  <Grid container spacing={1} pb={1} alignSelf="center">
    {checkpoint.rooms.map(room => (
      <SideGridItem
        key={`${sideId}-${room.id}`}
        roomId={room.id}
        {...room.name && {roomName: room.name}}
        image={getRoomPreviewUrl(areaId, chapterId, sideId, room.id)}
        href={`/${areaId}/${chapterId}/${sideId}/${room.id}`}
      />
    ))}
  </Grid>
);

export const SideGridItem: FC<ChapterViewItemProps> = ({roomId, roomName, href, image}) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <Link passHref href={href}>
          <CardActionArea
            sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%", width: "100%"}}
            style={{
              imageRendering: "pixelated",
            }}
          >
            <CardMedia component={AspectBox}>
              <Image
                unoptimized
                layout="fill"
                src={image}
                alt={`Thumbnail for room ${roomName}`}
                style={{
                  imageRendering: "pixelated",
                }}
              />
            </CardMedia>
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
};