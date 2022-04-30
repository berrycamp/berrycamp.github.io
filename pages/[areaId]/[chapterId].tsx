import {Clear, NavigateBefore, NavigateNext, Search} from "@mui/icons-material";
import {alpha, Box, Breadcrumbs, Button, Card, CardActionArea, CardMedia, Container, Divider, IconButton, ImageListItemBar, Link as MuiLink, List, ListItemButton, Paper, Tab, Tabs, TextField, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {getScreenURL} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {pluralize} from "logic/utils/pluralize";
import {CampHead} from "modules/head/CampHead";
import Image from "next/image";
import Link from "next/link";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, useEffect, useState} from "react";
import {Area, Chapter, Checkpoint, Room, Side, Subroom} from "../../logic/data/dataTree";

const ChapterPage: CampPage<ChapterProps> = ({areaId, area, chapterId, chapter}) => {
  const {settings} = useCampContext();

  const [sideId, setSideId] = useState<string>("a");

  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredRooms, setFilteredRooms] = useState<Map<number, Set<string>> | undefined>();

  const roomCount: number | undefined = chapter.sides[sideId]?.roomCount;

  const chapterKeys: string[] = Object.keys(area.chapters);
  const prevChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) - 1];
  const prevChapter: Chapter | undefined = prevChapterId ? area.chapters[prevChapterId] : undefined;
  const nextChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) + 1];
  const nextChapter: Chapter | undefined = nextChapterId ? area.chapters[nextChapterId] : undefined;

  const side: Side | undefined = chapter.sides[sideId];

  /**
   * Update the filtered rooms.
   */
  useEffect(() => {
    if (side !== undefined) {
      setFilteredRooms(filterRooms(searchValue, side, Boolean(settings.hideSubrooms)));
    } else {
      setFilteredRooms(undefined);
    }
  }, [searchValue, settings.hideSubrooms, side])

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={chapter.image}
      />
      <Container>
        <Breadcrumbs sx={{marginTop: 1, marginBottom: 1}}>
          <Link passHref href={`/${areaId}`}>
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
            src={getScreenURL(chapter.image)}
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
            <Typography component="div" variant="h5">{`${chapter.chapterNo ? `Chapter ${chapter.chapterNo} - ` : ""}${chapter.name}`}</Typography>
            <Typography component="div">{chapter.gameId}</Typography>
            <Typography component="div" marginTop={2}>{chapter.desc}</Typography>
          </Paper>
        </Box>
        <Box display="flex" gap={1} marginTop={1}>
          <Box sx={{width: "100%"}}>
            {prevChapter && prevChapterId && (
              <Link passHref href={`/${areaId}/${prevChapterId}`}>
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
          <Box sx={{width: "100%"}}>
            {nextChapter && nextChapterId && (
              <Link passHref href={`/${areaId}/${nextChapterId}`}>
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
              setFilteredRooms(filterRooms(searchValue, side, Boolean(settings.hideSubrooms), true))
            }
          }}
          aria-label="search rooms"
          sx={{
            marginTop: 2,
            marginBottom: 2,
          }}
        />
        <Tabs variant="fullWidth" value={sideId} onChange={(_, value) => setSideId(value)}>
          {Object.entries(chapter.sides).map(([sideKey, side]) => (
            <Tab key={side.name} value={sideKey} label={`${side.name}-side`} />
          ))}
        </Tabs>
        {roomCount && (
          <Typography component="div" variant="body1" color="text.secondary" marginTop={2} marginBottom={2} textAlign="center">
            {pluralize(roomCount, "room")}
          </Typography>
        )}
        {side && (
          <Fragment>
            {Boolean(searchValue) && filteredRooms && filteredRooms.size === 0 && (
              <Box display="flex" justifyContent="center" padding={3}>
                <Typography component="div" fontSize="large" color="text.secondary">{`No rooms found for '${searchValue}'`}</Typography>
              </Box>
            )}
            {settings.listMode ? (
              <ListChapterView
                areaId={areaId}
                chapterId={chapterId}
                sideId={sideId}
                side={side}
                hideSubrooms={Boolean(settings.hideSubrooms)}
                searchPerformed={Boolean(searchValue)}
                filteredRooms={filteredRooms}
              />
            ) : (
              <GridChapterView
                areaId={areaId}
                chapterId={chapterId}
                sideId={sideId}
                side={side}
                hideSubrooms={Boolean(settings.hideSubrooms)}
                searchPerformed={Boolean(searchValue)}
                filteredRooms={filteredRooms}
              />
            )}
          </Fragment>
        )}
      </Container>
    </Fragment >
  )
}

/**
 * Filters a sides rooms to only those matching the search term.
 * 
 * @param searchValue The search term.
 * @param side The side to search.
 * @param exact If the rooms should be filtered with an exact value.
 * @returns A map of checkpoints to a set of roomId's matching the search term.
 */
const filterRooms = (searchValue: string, side: Side, hideSubrooms: boolean, exact: boolean = false): Map<number, Set<string>> => {
  const filteredRooms = new Map<number, Set<string>>();

  side.checkpoints.forEach((checkpoint, checkpointIndex) => {
    checkpoint.roomOrder.forEach((roomId, roomIndex) => {
      const room: Room | undefined = side.rooms[roomId];
      if (room === undefined) {
        return;
      }

      const normalisedSearchValue: string = searchValue.toLowerCase();
      const roomNo: number = roomIndex + 1;

      if (hideSubrooms) {
        if (showRoom(normalisedSearchValue, checkpoint, roomId, room, roomNo, exact)) {
          addToCheckpointRoomSet(filteredRooms, checkpointIndex, roomId);
        }
      } else {
        const subrooms: Subroom[] | undefined = room.subrooms;
        if (subrooms === undefined || subrooms.length === 0) {
          if (showRoom(normalisedSearchValue, checkpoint, roomId, room, roomNo, exact)) {
            addToCheckpointRoomSet(filteredRooms, checkpointIndex, roomId);
          }
        } else {
          for (let i = 0; i < subrooms.length; i++) {
            const subroom: Subroom = subrooms[i]!;
            if (showSubroom(normalisedSearchValue, checkpoint, roomId, roomNo, subroom, exact)) {
              addToCheckpointRoomSet(filteredRooms, checkpointIndex, roomId);
              addToCheckpointRoomSet(filteredRooms, checkpointIndex, `${roomId}/${i + 1}`);
            }
          }
        }
      }
    });
  });

  return filteredRooms;
}

/**
 * Add the roomId to the appropriate checkpoint room set.
 * 
 * @param filteredRooms The filtered rooms map containing the checkpoint room sets.
 * @param checkpointIndex The index of the checkpoint to get the set for.
 * @param roomId The room id to add to the checkpoint room set.
 */
const addToCheckpointRoomSet = (filteredRooms: Map<number, Set<string>>, checkpointIndex: number, roomId: string) => {

  // Get the previous or create a new set if required.
  let checkpointRoomSet: Set<string> | undefined = filteredRooms.get(checkpointIndex);
  if (checkpointRoomSet === undefined) {
    checkpointRoomSet = new Set<string>();
  }

  checkpointRoomSet.add(roomId);

  filteredRooms.set(checkpointIndex, checkpointRoomSet);
}

/**
 * Determine if a room should e shown if value matches specific room values.
 * 
 * @param value The search value.
 * @param checkpoint The checkpoint.
 * @param roomId The room id.
 * @param room The room.
 * @param roomNo The room number.
 * @returns If the room should be shown.
 */
const showRoom = (value: string, checkpoint: Checkpoint, roomId: string, room: Room, roomNo: number, exact: boolean = false): boolean => {
  if (exact) {
    return showCommonRoom(value, checkpoint, roomId, roomNo)
      || room.name.toLowerCase() === value.trim()
      || Boolean(room.subrooms?.some(subroom => subroom.name.toLowerCase() === value.trim()));
  } else {
    return showCommonRoom(value, checkpoint, roomId, roomNo)
      || room.name.toLowerCase().includes(value)
      || Boolean(room.subrooms?.some(subroom => subroom.name.toLowerCase().includes(value)));
  }
}

/**
 * Determine if a room should be shown if value matches subroom specific values.
 * 
 * @param value The search value.
 * @param checkpoint The checkpoint.
 * @param roomId The room id.
 * @param roomNo The room number.
 * @param subroom The subroom.
 * @returns If the subroom should be shown.
 */
const showSubroom = (value: string, checkpoint: Checkpoint, roomId: string, roomNo: number, subroom: Subroom, exact: boolean = false): boolean => {
  if (exact) {
    return showCommonRoom(value, checkpoint, roomId, roomNo)
      || subroom.name.toLowerCase() === value;
  } else {
    return showCommonRoom(value, checkpoint, roomId, roomNo)
      || subroom.name.toLowerCase().includes(value);
  }
}

/**
 * Determine if a room should be shown if the value matches common values.
 * 
 * @param value The search value.
 * @param checkpoint The checkpoint.
 * @param roomId The room id.
 * @param roomNo The room number.
 * @param exact If the search should be exact.
 * @returns If the room should be shown based on the common values.
 */
const showCommonRoom = (value: string, checkpoint: Checkpoint, roomId: string, roomNo: number, exact: boolean = false): boolean => {
  if (exact) {
    return roomId.toLowerCase() === value
      || checkpoint.name.toLowerCase() === value
      || checkpoint.abbreviation.toLowerCase() === value
      || `${checkpoint.abbreviation.toLocaleLowerCase()}-${roomNo}` === value;
  } else {
    return roomId.toLowerCase().includes(value)
      || checkpoint.name.toLowerCase().includes(value)
      || checkpoint.abbreviation.toLowerCase().includes(value)
      || `${checkpoint.abbreviation.toLocaleLowerCase()}-${roomNo}` === value;
  }
}

interface ViewProps {
  areaId: string;
  chapterId: string;
  sideId: string;
  side: Side;
  hideSubrooms: boolean;
  searchPerformed: boolean;
  filteredRooms: Map<number, Set<string>> | undefined;
}

interface ViewItemProps {
  roomId: string;
  roomName: string;
  href: string,
  image: string
}

const GridChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, hideSubrooms, searchPerformed, filteredRooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => {

        // Filter out any checkpoints with no results for any searches.
        const checkpointFilteredRooms: Set<string> | undefined = filteredRooms?.get(checkpointIndex)
        if (searchPerformed && !checkpointFilteredRooms) {
          return undefined;
        }

        return (
          <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
            <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
              {checkpointIndex + 1}. {checkpoint.name}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
              {checkpoint.roomOrder.map(roomId => {
                const room: Room | undefined = side.rooms[roomId];
                if (room === undefined || (searchPerformed && checkpointFilteredRooms && !checkpointFilteredRooms.has(roomId))) {
                  return undefined;
                }

                return (
                  <Fragment key={roomId}>
                    {!hideSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => {
                      if (searchPerformed && checkpointFilteredRooms && !checkpointFilteredRooms.has(`${roomId}/${subroomIndex + 1}`)) {
                        return undefined;
                      }

                      return (
                        <GridChapterItem
                          key={subroomIndex}
                          roomId={roomId}
                          roomName={subroom.name}
                          image={subroom.image}
                          href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                        />
                      );
                    }) : (
                      <GridChapterItem
                        key={roomId}
                        roomId={roomId}
                        roomName={room.name}
                        image={room.image}
                        href={`/${areaId}/${chapterId}/${sideId}/${roomId}`}
                      />
                    )}
                  </Fragment>
                )
              })}
            </Box>
            <Divider flexItem />
          </Box>
        );
      })}
    </Fragment>
  );
}

const GridChapterItem: FC<ViewItemProps> = ({roomId, roomName, href, image}) => {
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
            src={getScreenURL(image)}
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

const ListChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, hideSubrooms, searchPerformed, filteredRooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => {

        // Filter out any checkpoints with no results.
        const checkpointFilteredRooms: Set<string> | undefined = filteredRooms?.get(checkpointIndex)
        if (searchPerformed && checkpointFilteredRooms === undefined) {
          return undefined;
        }

        return (
          <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginBottom: 2, padding: 0}}>
            <Typography component="div" variant="h5" color="text.secondary" marginTop={1} marginBottom={1}>
              {checkpointIndex + 1}. {checkpoint.name}
            </Typography>
            <List disablePadding>
              {checkpoint.roomOrder.map((roomId, roomIndex) => {
                const room: Room | undefined = side.rooms[roomId];
                if (room === undefined || (searchPerformed && checkpointFilteredRooms && !checkpointFilteredRooms.has(roomId))) {
                  return undefined;
                }

                return (
                  <Fragment key={roomId}>
                    {!hideSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => {
                      if (searchPerformed && checkpointFilteredRooms && !checkpointFilteredRooms.has(`${roomId}/${subroomIndex + 1}`)) {
                        return undefined;
                      }

                      return (
                        <ListChapterItem
                          key={subroomIndex}
                          roomId={roomId}
                          roomName={subroom.name}
                          roomNo={roomIndex + 1}
                          image={subroom.image}
                          href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                        />
                      );
                    }) : (
                      <ListChapterItem
                        key={roomId}
                        roomId={roomId}
                        roomName={room.name}
                        roomNo={roomIndex + 1}
                        image={room.image}
                        href={`/${areaId}/${chapterId}/${sideId}/${roomId}`}
                      />
                    )}
                  </Fragment>
                )
              })}
            </List>
            <Divider flexItem sx={{marginTop: 2, marginBottom: 1}} />
          </Box>
        );
      })}
    </Fragment>
  );
}

const ListChapterItem: FC<ViewItemProps & {roomNo: number}> = ({roomId, roomName, roomNo, href, image}) => {
  return (
    <Link passHref href={href}>
      <ListItemButton
        disableGutters
        component="a"
        sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
      >
        <Image
          unoptimized
          src={getScreenURL(image)}
          alt={`Image of room ${roomName}`}
          width={80}
          height={45}
        />
        <Typography component="div" marginLeft={2} color="text.secondary">{roomNo}.</Typography>
        <Typography component="div" marginLeft={1} flexGrow={1}>{roomName}</Typography>
        <Typography component="div" color="text.secondary" marginRight={0.5}>{roomId}</Typography>
      </ListItemButton>
    </Link>
  )
}

interface ChapterProps {
  areaId: string;
  area: Area;
  chapterId: string;
  chapter: Chapter;
}

interface ChapterParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const chapterId of Object.keys(area.chapters)) {
      paths.push({params: {areaId, chapterId}});
    }
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<ChapterProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId} = params;
  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid.`)
  }

  const chapter: Chapter | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  return {
    props: {
      areaId,
      area,
      chapterId,
      chapter,
    }
  }
}

export default ChapterPage;