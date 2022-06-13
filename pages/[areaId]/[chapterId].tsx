import {Clear, NavigateBefore, NavigateNext, Search} from "@mui/icons-material";
import {alpha, Box, Breadcrumbs, Button, Container, IconButton, Link as MuiLink, Paper, Tab, Tabs, TextField, Typography} from "@mui/material";
import {AreaData, ChapterData, CheckpointData, SideData} from "modules/chapter/types";
import {VALID_AREAS} from "modules/data/validAreas";
import {fetchArea, getChapterImageUrl} from "modules/fetch/dataApi";
import {CampHead} from "modules/head/CampHead";
import {useCampContext} from "modules/provide/CampContext";
import Image from "next/image";
import Link from "next/link";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {createElement, Fragment, useEffect, useState} from "react";
import {ChapterGridView, ChapterListView, filterCheckpoints} from "~/modules/chapter";
import {pluralize} from "~/modules/common/pluralize";
import {generateRoomTags} from "~/modules/room/generateTags";
import {Area, Chapter, Room} from "../../modules/data/dataTypes";

const ChapterPage: CampPage<ChapterProps> = ({area, chapter, sides, prevChapter, nextChapter}) => {
  const {settings} = useCampContext();

  const [searchValue, setSearchValue] = useState<string>("");
  const [side, setSide] = useState<SideData | undefined>(sides[0]);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(side?.checkpoints ?? []);

  /**
   * Update the filtered rooms.
   */
  useEffect(() => {
    setCheckpoints(side ? filterCheckpoints(searchValue, side) : []);
  }, [searchValue, side])

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Container>
        <Breadcrumbs sx={{marginTop: 1, marginBottom: 1}}>
          <Link passHref href={`/${area.id}`}>
            <MuiLink underline="always">
              {area.name}
            </MuiLink>
          </Link>
          <Typography color="text.primary">{chapter.name}</Typography>
        </Breadcrumbs>
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
            gridGap: "0.5rem",
            width: "100%",
            marginBottom: "0.5rem",
            height: {
              xs: 250,
              md: 400,
            },
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
              maxWidth: {
                md: 500,
              },
              padding: 3,
              margin: {
                xs: 0,
                md: 2,
              },
              top: {
                xs: 0,
                md: "40%",
              },
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: "blur(4px)",
              color: theme.palette.mode === "dark" ? "white" : "black",
            })}
          >
            <Typography component="div" variant="h5">{`${chapter.no ? `Chapter ${chapter.no} - ` : ""}${chapter.name}`}</Typography>
            <Typography component="div">{chapter.gameId}</Typography>
            <Typography component="div" marginTop={2}>{chapter.desc}</Typography>
          </Paper>
        </Box>
        <Box display="flex" gap={1} marginTop={1}>
          <Box width="100%">
            {prevChapter && (
              <Link passHref href={`/${area.id}/${prevChapter.id}`}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous chapter ${prevChapter.name}`}
                  sx={{width: "100%"}}
                >
                  {prevChapter.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box width="100%">
            {nextChapter && (
              <Link passHref href={`/${area.id}/${nextChapter.id}`}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to previous chapter ${nextChapter.name}`}
                  sx={{width: "100%"}}
                >
                  {nextChapter.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        <TextField
          fullWidth
          placeholder="Search rooms"
          autoComplete="off"
          variant="standard"
          value={searchValue}
          InputProps={{
            endAdornment: (
              <Box display="flex" alignItems="center" gap={0.5} margin={0.5}>
                <IconButton
                  size="small"
                  onClick={() => setSearchValue("")}
                  aria-label="clear search"
                >
                  <Clear />
                </IconButton>
                <Search color="primary" />
              </Box>
            ),
          }}
          onChange={event => setSearchValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && side !== undefined) {
              setCheckpoints(filterCheckpoints(searchValue, side, true))
            }
          }}
          aria-label="search rooms"
          sx={{
            marginTop: 2,
            marginBottom: 2,
          }}
        />
        <Tabs variant="fullWidth" value={side} onChange={(_, newSide) => setSide(newSide)}>
          {sides.map(side => (
            <Tab key={side.name} value={side} label={`${side.name}-side`} />
          ))}
        </Tabs>
        {side && (
          <Fragment>
            <Typography component="div" variant="body1" color="text.secondary" marginTop={2} marginBottom={2} textAlign="center">
              {pluralize(side.roomCount, "room")}
            </Typography>
            {Boolean(searchValue) && checkpoints && checkpoints.length === 0 && (
              <Box display="flex" justifyContent="center" padding={3}>
                <Typography component="div" fontSize="large" color="text.secondary">{`No rooms found for '${searchValue}'`}</Typography>
              </Box>
            )}
            {createElement(settings.listMode ? ChapterListView : ChapterGridView, {
              areaId: area.id,
              chapterId: chapter.id,
              sideId: side.id,
              checkpoints,
            })}
          </Fragment>
        )}
      </Container>
    </Fragment>
  )
}

interface ChapterParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const area: Area = await fetchArea(areaId);
    for (const {id} of area.chapters) {
      paths.push({params: {areaId, chapterId: id}});
    }
  }

  return {
    paths,
    fallback: false,
  }
}

interface ChapterProps {
  area: AreaData;
  chapter: ChapterData;
  sides: SideData[];
  prevChapter?: Pick<ChapterData, "id" | "name">;
  nextChapter?: Pick<ChapterData, "id" | "name">;
};

export const getStaticProps: GetStaticProps<ChapterProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId} = params;

  const area: Area =  await fetchArea(areaId);

  const chapterIndex: number = area.chapters.findIndex(chapter => chapter.id === chapterId);
  const chapter: Chapter | undefined = area.chapters[chapterIndex];
  if (chapter === undefined) {
    throw Error(`Chapter not found for ${chapterId}`);
  }

  const prevChapter: Chapter | undefined = area.chapters[chapterIndex - 1];
  const nextChapter: Chapter | undefined = area.chapters[chapterIndex + 1];

  return {
    props: {
      area: {
        id: area.id,
        name: area.name,
        desc: area.desc,
      },
      chapter: {
        id: chapter.id,
        gameId: chapter.gameId,
        name: chapter.name,
        desc: chapter.desc,
        ...chapter.chapterNo && {no: chapter?.chapterNo},
      },
      sides: chapter.sides.map<SideData>(side => ({
        id: side.id,
        name: side.name,
        roomCount: side.roomCount,
        checkpoints: side.checkpoints.map<CheckpointData>(checkpoint => ({
          name: checkpoint.name,
          abbreviation: checkpoint.abbreviation,
          rooms: checkpoint.roomOrder.map(id => {
            const room: Room | undefined = side.rooms[id];
            if (room === undefined) {
              throw Error(`Room ${id} not found`);
            }
            return {
              id,
              ...room.name && {name: room.name},
              checkpointNo: room.checkpointNo,
              tags: generateRoomTags(room),
            };
          }),
        })),
      })),
      ...prevChapter && {prevChapter},
      ...nextChapter && {nextChapter},
    }
  }
}

export default ChapterPage;
