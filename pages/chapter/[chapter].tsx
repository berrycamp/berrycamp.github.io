import {Container, Paper, Typography} from "@mui/material";
import Head from "next/head";
import {GetStaticPaths, GetStaticProps, NextPage} from "next/types";
import {ParsedUrlQuery} from "querystring";
import {Fragment} from "react";
import {DATA_URL, LEVEL_NAMES} from "..";
import {Chapter} from "../../logic/data/dataTree";
import fetchJson from "../../logic/fetch/fetchJson";

const Chapter: NextPage<ChapterProps> = (props) => {
  const title = `${props.chapter.chapter_no ? `Chapter ${props.chapter.chapter_no} - ` : ""}${props.chapter.name}`;

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
      </Head>
      <Container>
        <Paper elevation={2} sx={{padding: 4, margin: 4}}>
          <Typography variant="h4">{title}</Typography>
          <Typography variant="overline">{props.chapter.sides.length} Sides</Typography>
          <Typography variant="body1">{props.chapter.desc}</Typography>
        </Paper>
      </Container>
    </Fragment>
  )
}

interface ChapterProps {
  chapter: Chapter;
}

interface ChapterParams extends ParsedUrlQuery {
  chapter: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  return {
    paths: LEVEL_NAMES.map(chapter => ({params: {chapter}})),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<ChapterProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  return {
    props: {
      chapter: await fetchJson<Chapter>(`${DATA_URL}/${params.chapter}.json`),
    }
  }
}

export default Chapter;