import {Box, Card, CardActionArea, CardContent, CardMedia, Container, CssBaseline, Grid, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material'
import {DATA} from 'logic/data/data'
import {pluralize} from 'logic/utils/pluralize'
import Head from 'next/head'
import {GetStaticPaths, GetStaticProps, NextPage} from 'next/types'
import {ParsedUrlQuery} from 'querystring'
import {Fragment} from 'react'
import {AreaData} from '../logic/data/dataTree'

/**
 * Static room information.
 */
export const DATA_URL = 'https://cdn.berrycamp.com/file/berrycamp/data';

export const CHAPTER_IMG_BASE_URL = 'https://cdn.berrycamp.com/file/berrycamp/static/navigation/chapters/images/'

const Area: NextPage<AreaProps> = (props) => {
  return (
    <Fragment>
      <Head>
        <title>Berry Camp</title>
        <meta name="description" content="Browse rooms from the video game celeste" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline />
      <main>
        <Container>
          <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", padding: 2}}>
            <ToggleButtonGroup sx={{marginBottom: 2}}>
              <ToggleButton value="card">Card View</ToggleButton>
              <ToggleButton value="list">List View</ToggleButton>
            </ToggleButtonGroup>
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(props.area.chapters).map(([chapterId, chapter]) => (
                <Grid item key={chapterId} sx={{width: 300}}>
                  <Card sx={{height: "100%"}}>
                    <CardActionArea
                      sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
                      href={`/${props.areaId}/${chapterId}`}
                    >
                      <CardMedia
                        component="img"
                        image={`${CHAPTER_IMG_BASE_URL}${chapterId}.png`}
                      />
                      <CardContent sx={{flex: "1"}}>
                        <Typography variant="h6">
                          {chapter.chapter_no && `Chapter ${chapter.chapter_no} - `}
                          {chapter.name}
                        </Typography>
                        <Typography variant="body2">{pluralize(chapter.sides.length, "side")}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </main>
      <footer />
    </Fragment>
  )
}

interface AreaProps {
  areaId: string;
  area: AreaData;
}

interface AreaParams extends ParsedUrlQuery {
  area: string;
}

export const getStaticPaths: GetStaticPaths<AreaParams> = async () => {
  return {
    paths: Object.keys(DATA).map(area => ({params: {area}})),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<AreaProps, AreaParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params is not defined");
  }

  const area: AreaData | undefined = DATA[params.area];
  if (area === undefined) {
    throw Error(`Area ${params.area} is not defined`);
  }

  return {
    props: {
      areaId: params.area,
      area,
    }
  }
};

export default Area;
