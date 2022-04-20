import {Box, Card, CardActionArea, CardContent, CardMedia, Container, List, ListItemButton, Typography} from '@mui/material'
import {DATA} from 'logic/data/data'
import {getImageURL} from 'logic/fetch/image'
import {Layout} from 'modules/layout/Layout'
import Image from "next/image"
import Link from "next/link"
import {GetStaticPaths, GetStaticProps} from 'next/types'
import {ParsedUrlQuery} from 'querystring'
import {FC, Fragment} from 'react'
import {Area} from '../logic/data/dataTree'
import {AppNextPage} from './_app'

const AreaPage: AppNextPage<AreaProps> = ({areaId, area, mode, toggleMode, view, setView}) => {
  return (
    <Layout
      title={area.name}
      description={area.desc}
      imgUrl={getImageURL(area.image)}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <AreaView areaId={areaId} area={area} view={view} />
    </Layout >
  )
}

export const AreaView: FC<AreaProps & {view: "grid" | "list"}> = ({areaId, area, view}) => {
  return (
    <Fragment>
      {view === "grid" ? (
        <GridArea areaId={areaId} area={area} />
      ) : (view === "list") && (
        <ListArea areaId={areaId} area={area} />
      )}
    </Fragment>
  );
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
              <Typography component="div" variant="h4" marginTop={4} marginBottom={1}>{area.name}</Typography>
              <Typography component="div" color="text.secondary" marginBottom={2}>{area.desc}</Typography>
            </Box>
            {Object.entries(area.chapters).map(([chapterId, chapter]) => (
              <Card key={chapterId}>
                <CardActionArea href={`/${areaId}/${chapterId}`}>
                  <CardMedia
                    component="img"
                    className="pixelated-image"
                    src={getImageURL(chapter.image)}
                    alt={`An image of chapter ${chapter.name}`}
                  />
                  <CardContent>
                    <Typography component="div" variant="h6">
                      {chapter.chapterNo && `Chapter ${chapter.chapterNo} - `}
                      {chapter.name}
                    </Typography>
                    <Typography component="div" variant="body2" color="textSecondary">{chapter.gameId}</Typography>
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
        <Typography component="div" variant="h4" marginTop={4} marginBottom={1}>{area.name}</Typography>
        <Typography component="div" color="text.secondary" marginBottom={2}>{area.desc}</Typography>
        <List disablePadding>
          {Object.entries(area.chapters).map(([chapterId, chapter]) => (
            <ListItemButton
              key={chapterId}
              disableGutters
              sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
              component="a"
              LinkComponent={Link}
              href={`/${areaId}/${chapterId}`}
            >
              <Image
                unoptimized
                src={getImageURL(chapter.image)}
                alt={`Image of chapter ${chapter.name}`}
                width={128}
                height={72}
              />
              <Typography component="div" variant="h6" marginLeft={2} color="text.secondary" width="1rem">{chapter.chapterNo ? chapter.chapterNo : ""}</Typography>
              <Typography component="div" variant="h6" marginLeft={2} flexGrow={1}>{chapter.name}</Typography>
              <Typography component="div" variant="h6" color="text.secondary" marginRight={0.5} sx={{display: {xs: "none", sm: "block"}}}>{chapter.gameId}</Typography>
            </ListItemButton>
          ))}
        </List>
      </Container>
    </Fragment>
  )
}

interface AreaProps {
  areaId: string;
  area: Area;
}

interface AreaParams extends ParsedUrlQuery {
  areaId: string;
}

export const getStaticPaths: GetStaticPaths<AreaParams> = async () => {
  return {
    paths: Object.keys(DATA).map(areaId => ({params: {areaId}})),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<AreaProps, AreaParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params is not defined");
  }

  const {areaId} = params;

  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not defined`);
  }

  return {
    props: {
      areaId,
      area,
    }
  }
};

export default AreaPage;
