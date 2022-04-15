import {Box, Container, Tab, Tabs, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {Layout} from "modules/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import {GetStaticPaths, GetStaticProps, NextPage} from "next/types";
import {CHAPTER_IMG_BASE_URL} from "pages/[area]";
import {ParsedUrlQuery} from "querystring";
import {Fragment, useState} from "react";
import {AreaData, ChapterData} from "../../logic/data/dataTree";

export const IMAGE_URL = "https://cdn.berrycamp.com/file/strawberry-house/screens";

const ChapterPage: NextPage<ChapterProps> = (props) => {
  const [sideNo, setSideNo] = useState<number>(0);

  return (
    <Layout
      title={`${props.chapter.chapter_no ? `Chp${props.chapter.chapter_no} - ` : ""}${props.chapter.name}`}
      description={props.chapter.desc}
      imgUrl={`${CHAPTER_IMG_BASE_URL}${props.chapterId}.png`}
    >
      <Container>
        <Box paddingTop={8} paddingBottom={4}>
          <Typography variant="h4">{`${props.chapter.chapter_no ? `Chapter ${props.chapter.chapter_no} - ` : ""}${props.chapter.name}`}</Typography>
          <Typography variant="overline">{props.chapter.sides.length} Sides</Typography>
          <Typography variant="body1">{props.chapter.desc}</Typography>
        </Box>
        <Tabs variant="fullWidth" value={sideNo} onChange={(_, value) => setSideNo(value)}>
          {props.chapter.sides.map((side, newSideNo) => (
            <Tab key={side.name} value={newSideNo} label={`${side.name}-side`} />
          ))}
        </Tabs>
        <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
          {props.chapter.sides[sideNo]?.checkpoints.map((checkpoint, checkpointNo) => (
            <Fragment key={checkpoint.name}>
              {checkpoint.rooms.map((room, roomNo) => (
                <Box key={room.id} width={320} height={180} position="relative">
                  <Link passHref href={`/${props.areaId}/${props.chapterId}/${props.chapter.sides[sideNo]?.name.toLowerCase()}/${room.id}${room.subroom ? `/${room.subroom}` : ""}`}>
                    <Image
                      unoptimized
                      src={`${IMAGE_URL}/${props.chapterId}/${sideNo + 1}/${checkpointNo + 1}/${roomNo + 1}.png`}
                      alt={`${room.name} image`}
                      layout="fill"
                    />
                  </Link>
                </Box>
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