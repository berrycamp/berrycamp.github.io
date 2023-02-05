import {alpha, Box, Paper, Typography} from "@mui/material";
import Image from "next/image";
import {FC} from "react";
import {AreaData, ChapterData} from ".";
import {getChapterImageUrl} from "../fetch/dataApi";

export const ChapterHeaderImage: FC<ChapterHeaderImageProps> = ({area, chapter}) => (
  <Box
    sx={{
      position: "relative",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
      gridGap: "0.5rem",
      width: "100%",
      marginBottom: "0.5rem",
      height: {xs: 250, md: 400},
      "& .MuiPaper-root": {
        borderRadius: 0,
      }
    }}
  >
    <Image
      unoptimized
      priority
      src={getChapterImageUrl(area.id, chapter.id)}
      alt={`Image of chapter ${chapter.name}`}
      objectFit="cover"
      layout="fill"
      style={{
        imageRendering: "pixelated",
      }}
    />
    <Paper
      elevation={0}
      sx={theme => ({
        position: "absolute",
        maxWidth: {md: 500},
        padding: 3,
        margin: {xs: 0, md: 2},
        top: {xs: 0, md: "40%"},
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: "blur(4px)",
        color: theme.palette.mode === "dark" ? "white" : "black",
      })}
    >
      <Typography component="div" variant="h5">
        {`${chapter.no ? `Chapter ${chapter.no} - ` : ""}${chapter.name}`}
      </Typography>
      <Typography component="div" color="text.secondary">{chapter.gameId}</Typography>
      <Typography component="div" marginTop={2}>{chapter.desc}</Typography>
    </Paper>
  </Box>
);

export interface ChapterHeaderImageProps {
  area: AreaData;
  chapter: ChapterData;
}