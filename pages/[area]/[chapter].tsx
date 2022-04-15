import {Box, Card, CardActionArea, CardMedia, Container, Tab, Tabs, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {Layout} from "modules/layout/Layout";
import {GetStaticPaths, GetStaticProps} from "next/types";
import styles from "pages/Common.module.css";
import {CHAPTER_IMG_BASE_URL} from "pages/[area]";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {Fragment, useState} from "react";
import {AreaData, ChapterData} from "../../logic/data/dataTree";

export const IMAGE_URL = "https://cdn.berrycamp.com/file/strawberry-house/screens";

const ChapterPage: AppNextPage<ChapterProps> = ({areaId, chapterId, chapter, mode, toggleMode, view, setView}) => {
  const [sideNo, setSideNo] = useState<number>(0);

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
          <Typography variant="overline">{chapter.sides.length} Sides</Typography>
          <Typography variant="body1">{chapter.desc}</Typography>
        </Box>
        <Tabs variant="fullWidth" value={sideNo} onChange={(_, value) => setSideNo(value)}>
          {chapter.sides.map((side, newSideNo) => (
            <Tab key={side.name} value={newSideNo} label={`${side.name}-side`} />
          ))}
        </Tabs>
        <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
          {chapter.sides[sideNo]?.checkpoints.map((checkpoint, checkpointNo) => (
            <Fragment key={checkpoint.name}>
              {checkpoint.rooms.map((room, roomNo) => (
                <Card key={roomNo} sx={{width: 320, height: 180}}>
                  <CardActionArea
                    className={styles.roomimage as never}
                    sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
                    href={`/${areaId}/${chapterId}/${chapter.sides[sideNo]?.name.toLowerCase()}/${room.id}${room.subroom ? `/${room.subroom}` : ""}`}
                  >
                    <CardMedia
                      component="img"
                      image={`${IMAGE_URL}/${chapterId}/${sideNo + 1}/${checkpointNo + 1}/${roomNo + 1}.png`}
                    />
                  </CardActionArea>
                </Card>
              ))}
            </Fragment>
          ))}
        </Box>
      </Container>
    </Layout>
  )
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