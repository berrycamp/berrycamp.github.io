import {Map} from "@mui/icons-material";
import {Button, Card, CardActionArea, CardActions, CardMedia, Grid, ImageListItemBar} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC} from "react";
import {AspectBox} from "../common/aspectBox/AspectBox";

export interface ChapterViewItemProps {
  name: string;
  roomCount: number;
  href: string;
  src: string;
}

export interface ChapterViewProps {
  sides: Array<ChapterViewItemProps>
}

export const ChapterGridView: FC<ChapterViewProps> = ({sides}) => {
  return (
    <Grid container spacing={1} pb={1} alignSelf="center">
      {sides.map(side => <ChapterGridViewItem {...side} key={side.name} />)}
    </Grid>
  );
}

const ChapterGridViewItem: FC<ChapterViewItemProps> = ({name, roomCount, href, src}) => {
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
                src={src}
                alt={`Thumbnail for side ${name}`}
                style={{
                  imageRendering: "pixelated",
                }}
              />
            </CardMedia>
            <ImageListItemBar
              title={`${name}`}
              subtitle={`${roomCount} rooms`}
              sx={{
                pr: 1,
                background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0))",
              }}
             />
          </CardActionArea>
        </Link>
        <CardActions sx={{p: 0}}>
          <Link passHref href={`/map${href}`}>
            <Button fullWidth variant="contained" endIcon={<Map/>} size="medium">Level Map</Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
}
