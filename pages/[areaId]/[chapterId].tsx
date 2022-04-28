import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Card, CardActionArea, CardMedia, Container, Divider, ImageListItemBar, Link as MuiLink, List, ListItemButton, Tab, Tabs, Typography} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
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
import {FC, Fragment, useState} from "react";
import {Area, Chapter, Room, Side} from "../../logic/data/dataTree";

const ChapterPage: CampPage<ChapterProps> = ({areaId, area, chapterId, chapter}) => {
  const {settings} = useCampContext();

  const [sideId, setSideId] = useState<string>("a");

  const roomCount: number | undefined = chapter.sides[sideId]?.roomCount;

  const chapterKeys: string[] = Object.keys(area.chapters);
  const prevChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) - 1];
  const prevChapter: Chapter | undefined = prevChapterId ? area.chapters[prevChapterId] : undefined;
  const nextChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) + 1];
  const nextChapter: Chapter | undefined = nextChapterId ? area.chapters[nextChapterId] : undefined;

  const side: Side | undefined = chapter.sides[sideId];

  return (
    <Fragment>
      <CampHead
        title={chapter.name}
        description={chapter.desc}
        image={chapter.image}
      />
      <Container>
        <Breadcrumbs sx={{marginTop: 1, marginBottom: 1}}>
          <MuiLink href={`/${areaId}`} underline="always">
            {area.name}
          </MuiLink>
          <Typography color="text.primary">{chapter.name}</Typography>
        </Breadcrumbs>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
            gridGap: "0.5rem",
            width: "100%",
            marginBottom: "0.5rem",
          }}
        >
          <AspectBox>
            <Image
              unoptimized
              src={getScreenURL(chapter.image)}
              alt={`Image of chapter ${chapter.name}`}
              objectFit="cover"
              layout="fill"
              style={{
                imageRendering: "pixelated",
              }}
            />
          </AspectBox>
          <Box>
            <Typography component="div" variant="h4">{`${chapter.chapterNo ? `Chapter ${chapter.chapterNo} - ` : ""}${chapter.name}`}</Typography>
            <Typography component="div" color="text.secondary">{chapter.gameId}</Typography>
            <Typography component="div" color="text.secondary" marginTop={2}>{chapter.desc}</Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Box>
            {prevChapter && prevChapterId && (
              <Link passHref href={`/${areaId}/${prevChapterId}`}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<NavigateBefore />}
                  aria-label={`Go to previous chapter ${prevChapter.name}`}
                >
                  {prevChapter.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box>
            {nextChapter && nextChapterId && (
              <Link passHref href={`/${areaId}/${nextChapterId}`}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<NavigateNext />}
                  aria-label={`Go to previous chapter ${nextChapter.name}`}
                >
                  {nextChapter.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        <Tabs variant="fullWidth" value={sideId} onChange={(_, value) => setSideId(value)}>
          {Object.entries(chapter.sides).map(([sideKey, side]) => (
            <Tab key={side.name} value={sideKey} label={`${side.name}-side`} />
          ))}
        </Tabs>
        {roomCount && (
          <Typography component="div" variant="body1" color="text.secondary" marginTop={2} textAlign="center">
            {pluralize(roomCount, "room")}
          </Typography>
        )}
        {side && (
          <Fragment>
            {settings.listMode ? (
              <ListChapterView areaId={areaId} chapterId={chapterId} sideId={sideId} side={side} hideSubrooms={Boolean(settings.hideSubrooms)} />
            ) : (
              <GridChapterView areaId={areaId} chapterId={chapterId} sideId={sideId} side={side} hideSubrooms={Boolean(settings.hideSubrooms)} />
            )}
          </Fragment>
        )}
      </Container>
    </Fragment>
  )
}


interface ViewProps {
  areaId: string;
  chapterId: string;
  sideId: string;
  side: Side;
  hideSubrooms: boolean;
}

interface ViewItemProps {
  roomId: string;
  roomName: string;
  href: string,
  image: string
}

const GridChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, hideSubrooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => (
        <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginTop: 2, marginBottom: 2, padding: 0}}>
          <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
            {checkpoint.roomOrder.map(roomId => {
              const room: Room | undefined = side.rooms[roomId];
              if (room === undefined) {
                return undefined;
              }

              return (
                <Fragment key={roomId}>
                  {!hideSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => (
                    <GridChapterItem
                      key={subroomIndex}
                      roomId={roomId}
                      roomName={subroom.name}
                      image={subroom.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                    />
                  )) : (
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
      ))}
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

const ListChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, hideSubrooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => (
        <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginTop: 2, marginBottom: 2, padding: 0}}>
          <Typography component="div" variant="h5" color="text.secondary" marginTop={4} marginBottom={1}>
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <List disablePadding>
            {checkpoint.roomOrder.map((roomId, roomIndex) => {
              const room: Room | undefined = side.rooms[roomId];
              if (room === undefined) {
                return undefined;
              }

              return (
                <Fragment key={roomId}>
                  {!hideSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => (
                    <ListChapterItem
                      key={subroomIndex}
                      roomId={roomId}
                      roomName={subroom.name}
                      roomNo={roomIndex + 1}
                      image={subroom.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                    />
                  )) : (
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
      ))}
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
          width={128}
          height={72}
        />
        <Typography component="div" variant="h6" marginLeft={2} color="text.secondary">{roomNo}.</Typography>
        <Typography component="div" variant="h6" marginLeft={2} flexGrow={1}>{roomName}</Typography>
        <Typography component="div" variant="h6" color="text.secondary" marginRight={0.5}>{roomId}</Typography>
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