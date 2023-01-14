import {Box, Card, CardActionArea, CardMedia, Divider, Grid, ImageListItemBar, Typography} from "@mui/material";
import Link from "next/link";
import {FC} from "react";
import {getRoomPreviewUrl} from "../fetch/dataApi";
import {ChapterViewItemProps, ChapterViewProps} from "./types";

export const ChapterGridView: FC<ChapterViewProps> = ({areaId, chapterId, sideId, checkpoints}) => (
  <>
    {checkpoints.map((checkpoint, checkpointIndex) => (
      <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
        <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
          {checkpointIndex + 1}. {checkpoint.name}
        </Typography>
        <Grid container spacing={1} pt={2} pb={2}>
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
        <Divider flexItem />
      </Box>
    ))}
  </>
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