import {Box, Card, CardActionArea, CardMedia, Container, Divider, ImageListItemBar, List, ListItemButton, Tab, Tabs, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {Layout} from "modules/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import {GetStaticPaths, GetStaticProps} from "next/types";
import styles from "pages/Common.module.css";
import {CHAPTER_IMG_BASE_URL} from "pages/[area]";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, useState} from "react";
import {AreaData, ChapterData, RoomData} from "../../logic/data/dataTree";

export const IMAGE_URL = "https://cdn.berrycamp.com/file/strawberry-house/screens";

const ChapterPage: AppNextPage<ChapterProps> = ({areaId, area, chapterId, chapter, mode, toggleMode, view, setView}) => {
  const [sideIndex, setSideIndex] = useState<number>(0);

  return (
    <Layout
      title={chapter.name}
      description={chapter.desc}
      imgUrl={`${CHAPTER_IMG_BASE_URL}${chapterId}.png`}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Container>
        <Box paddingTop={8} paddingBottom={4}>
          <Typography variant="h4">{`${chapter.chapter_no ? `Chapter ${chapter.chapter_no} - ` : ""}${chapter.name}`}</Typography>
          <Typography variant="body1" color="text.secondary">{chapter.sides.length} Sides</Typography>
          <Typography variant="body1" color="text.secondary">{chapter.desc}</Typography>
        </Box>
        <Tabs variant="fullWidth" value={sideIndex} onChange={(_, value) => setSideIndex(value)}>
          {chapter.sides.map((side, newSideNo) => (
            <Tab key={side.name} value={newSideNo} label={`${side.name}-side`} />
          ))}
        </Tabs>
        {view === "grid" ? (
          <GridChapterView areaId={areaId} area={area} chapterId={chapterId} chapter={chapter} sideIndex={sideIndex} />
        ) : (view === "list") && (
          <ListChapterView areaId={areaId} area={area} chapterId={chapterId} chapter={chapter} sideIndex={sideIndex} />
        )}
      </Container>
    </Layout>
  )
}

const GridChapterView: FC<ChapterProps & {sideIndex: number}> = ({areaId, chapterId, chapter, sideIndex}) => {
  return (
    <Fragment>
      {chapter.sides[sideIndex]?.checkpoints.map((checkpoint, checkpointIndex) => (
        <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginTop: 4, padding: 0}}>
          <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
            {checkpoint.rooms.map((room, roomIndex) => (
              <GridChapterItem
                key={roomIndex}
                room={room}
                href={`/${areaId}/${chapterId}/${chapter.sides[sideIndex]?.name.toLowerCase()}/${room.id}${room.subroom ? `/${room.subroom}` : ""}`}
                imageUrl={`${IMAGE_URL}/${chapterId}/${sideIndex + 1}/${checkpointIndex + 1}/${roomIndex + 1}.png`}
              />
            ))}
          </Box>
          <Divider flexItem />
        </Box>
      ))}
    </Fragment>
  );
}

const GridChapterItem: FC<{room: RoomData, href: string, imageUrl: string}> = ({room, href, imageUrl}) => {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Card sx={{width: 320, height: 180}}>
      <CardActionArea
        className={styles.roomimage as never}
        sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
        href={href}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <CardMedia
          component="img"
          image={imageUrl}
        />
        {hover && (
          <ImageListItemBar
            title={room.name}
            subtitle={room.id}
            sx={{fontSize: 26}}
          />
        )}
      </CardActionArea>
    </Card>
  );
}

const ListChapterView: FC<ChapterProps & {sideIndex: number}> = ({areaId, chapterId, chapter, sideIndex}) => {
  return (
    <Fragment>
      {chapter.sides[sideIndex]?.checkpoints.map((checkpoint, checkpointIndex) => (
        <Fragment key={checkpointIndex}>
          <Typography variant="h5" color="text.secondary" marginTop={4} marginBottom={1}>
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <List disablePadding>
            {checkpoint.rooms.map((room, roomIndex) => (
              <ListItemButton
                key={roomIndex}
                disableGutters
                sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
                component="a"
                LinkComponent={Link}
                href={`/${areaId}/${chapterId}/${chapter.sides[sideIndex]?.name.toLowerCase()}/${room.id}${room.subroom ? `/${room.subroom}` : ""}`}
              >
                <Image
                  className={styles.roomimage}
                  unoptimized
                  src={`${IMAGE_URL}/${chapterId}/${sideIndex + 1}/${checkpointIndex + 1}/${roomIndex + 1}.png`}
                  alt={`${room.name} image`}
                  width={128}
                  height={72}
                />
                <Typography variant="h6" marginLeft={2} color="text.secondary">{roomIndex + 1}.</Typography>
                <Typography variant="h6" marginLeft={2} flexGrow={1}>{room.name}</Typography>
                <Typography variant="h6" color="text.secondary" marginRight={0.5}>{room.id}</Typography>
              </ListItemButton>
            ))}
          </List>
        </Fragment>
      ))}
    </Fragment>
  );
}

interface ChapterProps {
  areaId: string;
  area: AreaData;
  chapterId: string;
  chapter: ChapterData;
}

interface ChapterParams extends ParsedUrlQuery {
  area: string;
  chapter: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const chapter of Object.keys(area.chapters)) {
      paths.push({params: {area: areaId, chapter}});
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

  const area: AreaData | undefined = DATA[params.area];
  if (area === undefined) {
    throw Error(`Area ${params.area} is not valid.`)
  }

  const chapter: ChapterData | undefined = area.chapters[params.chapter];
  if (chapter === undefined) {
    throw Error(`Chapter ${params.chapter} is not valid`);
  }

  return {
    props: {
      areaId: params.area,
      area,
      chapterId: params.chapter,
      chapter,
    }
  }
}

export default ChapterPage;