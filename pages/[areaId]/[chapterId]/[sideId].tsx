import {Clear, Map, Search, Tag} from "@mui/icons-material";
import {Box, Button, Container, IconButton, Tab, Tabs, TextField, Typography} from "@mui/material";
import Link from "next/link";
import {useRouter} from "next/router";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, createElement, useEffect, useState} from "react";
import {Breadcrumbs} from "~/modules/breadcrumbs";
import {SideGridView, SideListView, filterCheckpoints} from "~/modules/chapter";
import {AreaData, ChapterData, CheckpointData, SideData} from "~/modules/chapter/types";
import {Area, Chapter, Room, Side} from "~/modules/data/dataTypes";
import {VALID_AREAS} from "~/modules/data/validAreas";
import {fetchArea, getChapterImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {useCampContext} from "~/modules/provide/CampContext";
import {generateRoomTags} from "~/modules/room/generateTags";

const SidePage: CampPage<SideProps> = ({area, chapter, sides, side}) => {
  const {settings} = useCampContext();
  const {query} = useRouter();

  const [tabValue, setTabValue] = useState<string>(side.id);

  const [searchValue, setSearchValue] = useState<string>("");
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(side.checkpoints);

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    setTabValue(value);
  }

  /**
   * Filter the checkpoint rooms.
   */
  useEffect(() => {
    setCheckpoints(filterCheckpoints(searchValue, side));
  }, [searchValue, side]);

  /**
   * Search from the query.
   */
  useEffect(() => {
    if (typeof query.search === "string") {
      setSearchValue(query.search);
    }
  }, [query.search]);

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={getChapterImageUrl(area.id, chapter.id)}
      />
      <Container maxWidth="lg">
        <Breadcrumbs
          crumbs={[
            {name: area.name, href: `/${area.id}`},
            {name: chapter.name, href: `/${area.id}/${chapter.id}`},
            {name: side.name},
          ]}
        />
        <Tabs variant="fullWidth" value={tabValue} sx={{mb: 2}} onChange={handleTabChange}>
          {sides.map(({id, name}) => (
            <LinkTab
              key={id}
              value={id}
              label={`${name}-side`}
              href={`/${area.id}/${chapter.id}/${id}`}
            />
          ))}
        </Tabs>
        <Link passHref href={`/map/${area.id}/${chapter.id}/${side.id}`}>
          <Button fullWidth variant="contained" endIcon={<Map/>} size="large">Level Map</Button>
        </Link>
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
            if (event.key === "Enter") {
              setCheckpoints(filterCheckpoints(searchValue, side, true))
            }
          }}
          aria-label="search rooms"
          sx={{marginTop: 2, marginBottom: 2}}
        />
        {side && (
          <Fragment>
            {Boolean(searchValue) && checkpoints && checkpoints.length === 0 && (
              <Box display="flex" justifyContent="center" padding={2}>
                <Typography component="div" fontSize="large" color="text.secondary">{`No rooms found for '${searchValue}'`}</Typography>
              </Box>
            )}
            {checkpoints.map(checkpoint => (
              <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
                <Typography
                  id={checkpoint.name}
                  component="a"
                  href={`#${checkpoint.name}`}
                  variant="h5"
                  color="text.secondary"
                  mt={1}
                  mb={1}
                  display="flex"
                  alignItems="center"
                  sx={{
                    ":hover": {
                      textDecoration: "underline",
                      "#anchor-link": {
                        display: "block",
                      }
                    }
                  }}
                >
                  {checkpoint.name}
                  <Tag id="anchor-link" fontSize="small" sx={{display: "none", ml: 0.5}} />
                </Typography>
                {createElement(settings.listMode ? SideListView : SideGridView, {
                  areaId: area.id,
                  chapterId: chapter.id,
                  sideId: side.id,
                  checkpoint,
                })}
              </Box>
            ))}
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
}

const LinkTab: FC<{label: string, href: string, value: string}> = ({href, ...other}) =>  (
  <Link passHref href={href}>
    <Tab component="a" {...other} />
  </Link>
);

interface ChapterParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const area: Area = await fetchArea(areaId);
    for (const {id: chapterId, sides} of area.chapters) {
      for (const {id: sideId} of sides) {
        paths.push({params: {areaId, chapterId, sideId}});
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

interface SideProps {
  area: AreaData;
  chapter: ChapterData;
  sides: Array<{id: string, name: string}>;
  side: SideData;
};

export const getStaticProps: GetStaticProps<SideProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId, sideId} = params;

  const area: Area =  await fetchArea(areaId);

  const chapterIndex: number = area.chapters.findIndex(chapter => chapter.id === chapterId);
  const chapter: Chapter | undefined = area.chapters[chapterIndex];
  if (chapter === undefined) {
    throw Error(`Chapter not found for ${chapterId}`);
  }

  const side: Side | undefined = chapter.sides.find(({id}) => id === sideId);
  if (side === undefined) {
    throw Error(`Side not found for ${sideId}`);
  }

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
        ...(chapter.chapterNo && {no: chapter?.chapterNo}),
      },
      sides: chapter.sides.map(({id, name}) => ({id, name})),
      side: {
        id: side.id,
        name: side.name,
        roomCount: side.roomCount,
        checkpoints: side.checkpoints.map<CheckpointData>(checkpoint => ({
          name: checkpoint.name,
          abbreviation: checkpoint.abbreviation,
          rooms: checkpoint.roomOrder.map((id, i) => {
            const room: Room | undefined = side.rooms[id];
            if (room === undefined) {
              throw Error(`Room ${id} not found`);
            }
            return {
              id,
              no: i + 1,
              ...(room.name && {name: room.name}),
              checkpointNo: room.checkpointNo,
              tags: generateRoomTags(room),
            };
          }),
        })),
      },
    }
  };
}

export default SidePage;
