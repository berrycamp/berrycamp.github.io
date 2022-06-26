import {Clear, Search, TravelExplore} from "@mui/icons-material";
import {Box, Button, Container, IconButton, Paper, Tab, Tabs, TextField, Typography} from "@mui/material";
import Link from "next/link";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {createElement, Fragment, useEffect, useState} from "react";
import {ChapterGridView, ChapterListView, filterCheckpoints} from "~/modules/chapter";
import {ChapterBreadcrumbs} from "~/modules/chapter/Breadcrumbs";
import {ChapterHeaderImage} from "~/modules/chapter/HeaderImage";
import {HeaderNav} from "~/modules/chapter/HeaderNav";
import {AreaData, ChapterData, ChapterNav, CheckpointData, SideData} from "~/modules/chapter/types";
import {pluralize} from "~/modules/common/pluralize";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {useCampContext} from "~/modules/provide/CampContext";
import {generateRoomTags} from "~/modules/room/generateTags";
import {Area, Chapter, Room} from "../../modules/data/dataTypes";

const ChapterPage: CampPage<ChapterProps> = ({area, chapter, sides, prevChapter, nextChapter}) => {
  const {settings} = useCampContext();
  const {query} = useRouter();

  const [searchValue, setSearchValue] = useState<string>("");
  const [side, setSide] = useState<SideData | undefined>(sides[0]);

  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(side?.checkpoints ?? []);

  /**
   * Filter the checkpoint rooms.
   */
  useEffect(() => {
    setSide(sides.find(newSide => newSide.id === side?.id) ?? sides[0]);
    setCheckpoints(side ? filterCheckpoints(searchValue, side) : []);
  }, [searchValue, side, sides]);

  /**
   * Search from the query.
   */
  useEffect(() => {
    if (typeof query.search !== "string") {
      return;
    }

    setSearchValue(query.search);
  }, [query.search]);

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Container>
        <ChapterBreadcrumbs areaId={area.id} areaName={area.name} chapterName={chapter.name}/>
        <ChapterHeaderImage area={area} chapter={chapter} />
        <HeaderNav areaId={area.id} {...prevChapter && {prevChapter}} {...nextChapter && {nextChapter}}/>
        {side && (
          <Paper elevation={1} sx={{display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, mt: 2, mb: 2}}>
          <Typography component="div" variant="body1" color="text.secondary" textAlign="center">
              {pluralize(side.roomCount, "room")}
            </Typography>
            <Link passHref href={`/map/${area.id}/${chapter.id}/${side.id}`}>
              <Button variant="contained" endIcon={<TravelExplore/>}>View Map</Button>
            </Link>
          </Paper>
        )}
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
          sx={{marginTop: 2, marginBottom: 2}}
        />
        <Tabs variant="fullWidth" value={side} onChange={(_, newSide) => setSide(newSide)} sx={{mb: 2}}>
          {sides.map(side => <Tab key={side.name} value={side} label={`${side.name}-side`}/>)}
        </Tabs>
        {side && (
          <Fragment>
            {Boolean(searchValue) && checkpoints && checkpoints.length === 0 && (
              <Box display="flex" justifyContent="center" padding={2}>
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
  prevChapter?: ChapterNav;
  nextChapter?: ChapterNav;
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
