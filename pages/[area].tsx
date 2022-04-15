import {Box, Card, CardActionArea, CardContent, CardMedia, Container, Grid, Typography} from '@mui/material'
import {DATA} from 'logic/data/data'
import {pluralize} from 'logic/utils/pluralize'
import {Layout} from 'modules/layout/Layout'
import {GetStaticPaths, GetStaticProps} from 'next/types'
import {ParsedUrlQuery} from 'querystring'
import {FC} from 'react'
import {AreaData} from '../logic/data/dataTree'
import {AppNextPage} from './_app'

export const CHAPTER_IMG_BASE_URL = 'https://cdn.berrycamp.com/file/berrycamp/static/navigation/chapters/images/'

const AreaPage: AppNextPage<AreaProps> = ({areaId, area, mode, toggleMode, view, setView}) => {
  return (
    <Layout
      title={area.name}
      description={area.desc}
      imgUrl={area.imageUrl}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Area areaId={areaId} area={area} />
    </Layout >
  )
}

export const Area: FC<AreaProps> = (props) => {
  return (
    <Container>
      <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", padding: 2}}>
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
  );
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

export default AreaPage;
