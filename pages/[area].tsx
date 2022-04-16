import {Box, Card, CardActionArea, CardContent, CardMedia, Container, List, ListItemButton, Typography} from '@mui/material'
import {DATA} from 'logic/data/data'
import {Layout} from 'modules/layout/Layout'
import Image from "next/image"
import Link from "next/link"
import {GetStaticPaths, GetStaticProps} from 'next/types'
import styles from "pages/Common.module.css"
import {ParsedUrlQuery} from 'querystring'
import {FC, Fragment} from 'react'
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
      {view === "grid" ? (
        <GridArea areaId={areaId} area={area} />
      ) : (view === "list") && (
        <ListArea areaId={areaId} area={area} />
      )}
    </Layout >
  )
}

const GridArea: FC<AreaProps> = ({areaId, area}) => {
  return (
    <Fragment>
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))",
              gridGap: "0.5rem",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          >
            <Box gridColumn="1 / -1">
              <Typography variant="h4" color="text.secondary" marginTop={4} marginBottom={1}>{area.name}</Typography>
              <Typography variant="body2">{area.desc}</Typography>
            </Box>
            {Object.entries(area.chapters).map(([chapterId, chapter]) => (
              <Card key={chapterId}>
                <CardActionArea
                  sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
                  href={`/${areaId}/${chapterId}`}
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
                    <Typography variant="body2" color="textSecondary">{chapter.id}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Fragment>
  );
}

const ListArea: FC<AreaProps> = ({areaId, area}) => {
  return (
    <Fragment>
      <Container>
        <Typography variant="h4" color="text.secondary" marginTop={4} marginBottom={1}>{area.name}</Typography>
        <Typography variant="body2">{area.desc}</Typography>
        <List>
          {Object.entries(area.chapters).map(([chapterId, chapter]) => (
            <Link
              key={chapterId}
              passHref
              href={`/${areaId}/${chapterId}`}
            >
              <ListItemButton>
                <Image
                  className={styles.roomimage}
                  unoptimized
                  src={`${CHAPTER_IMG_BASE_URL}${chapterId}.png`}
                  alt={`${chapter.name} image`}
                  width={128}
                  height={72}
                />
                <Typography variant="h6" marginLeft={2} color="text.secondary" width="1rem">{chapter.chapter_no ? chapter.chapter_no : ""}</Typography>
                <Typography variant="h6" marginLeft={2} flexGrow={1}>{chapter.name}</Typography>
                <Typography variant="h6" color="text.secondary">{chapter.id}</Typography>
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Container>
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

export default AreaPage;
