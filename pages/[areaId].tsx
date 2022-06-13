import {Box, Card, CardActionArea, CardContent, CardMedia, Container, List, ListItemButton, Typography} from '@mui/material'
import {VALID_AREAS} from 'modules/data/validAreas'
import {fetchArea, getAreaImageUrl, getChapterImageUrl} from 'modules/fetch/dataApi'
import {useCampContext} from 'modules/provide/CampContext'
import {CampHead} from 'modules/head/CampHead'
import Image from "next/image"
import Link from "next/link"
import {GetStaticPaths, GetStaticProps} from 'next/types'
import {ParsedUrlQuery} from 'querystring'
import {FC, Fragment} from 'react'
import {Area} from '../modules/data/dataTypes'
import {CampPage} from './_app'

const AreaPage: CampPage<AreaProps> = ({area, chapters}) => {
  return (
    <Fragment>
      <CampHead
        title={area.name}
        description={area.desc}
        image={getAreaImageUrl(area.id)}
      />
      <AreaView area={area} chapters={chapters}/>
    </Fragment>
  )
}

export const AreaView: FC<AreaProps> = ({area, chapters}) => {
  const {settings: {listMode}} = useCampContext();

  return (
    <Fragment>
      {listMode ? (
        <ListArea area={area} chapters={chapters}/>
      ) : (
        <GridArea area={area} chapters={chapters}/>
      )}
    </Fragment>
  );
}

const GridArea: FC<AreaProps> = ({area, chapters}) => {
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
            {chapters.map(chapter => (
              <Card key={chapter.id}>
                <Link passHref href={`/${area.id}/${chapter.id}`}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      src={getChapterImageUrl(area.id, chapter.id)}
                      alt={`An image of chapter ${chapter.name}`}
                      style={{
                        imageRendering: "pixelated",
                      }}
                    />
                    <CardContent>
                      <Typography component="div" variant="h6">
                        {chapter.no && `Chapter ${chapter.no} - `}
                        {chapter.name}
                      </Typography>
                      <Typography component="div" variant="body2" color="textSecondary">{chapter.gameId}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Fragment>
  );
}

const ListArea: FC<AreaProps> = ({area, chapters}) => {
  return (
    <Fragment>
      <Container>
        <Typography component="div" variant="h4" marginTop={4} marginBottom={1}>{area.name}</Typography>
        <Typography component="div" color="text.secondary" marginBottom={2}>{area.desc}</Typography>
        <List disablePadding>
          {chapters.map(chapter => (
            <Link key={chapter.id} passHref href={`/${area.id}/${chapter.id}`}>
              <ListItemButton
                disableGutters
                component="a"
                sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
              >
                <Image
                  unoptimized
                  src={getChapterImageUrl(area.id, chapter.id)}
                  alt={`Image of chapter ${chapter.name}`}
                  width={80}
                  height={45}
                />
                <Typography component="div" marginLeft={2} color="text.secondary" width="1rem">{chapter.no ? chapter.no : ""}</Typography>
                <Typography component="div" marginLeft={1} flexGrow={1}>{chapter.name}</Typography>
                <Typography component="div" color="text.secondary" marginRight={0.5}>{chapter.gameId}</Typography>
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Container>
    </Fragment>
  )
}

export interface AreaProps {
  area: AreaData;
  chapters: ChapterData[]; 
}

interface AreaData {
  id: string;
  name: string;
  desc: string;
};

interface ChapterData {
  id: string;
  gameId: string;
  name: string;
  no?: number;
}

interface AreaParams extends ParsedUrlQuery {
  areaId: string;
}

export const getStaticPaths: GetStaticPaths<AreaParams> = async () => {
  return {
    paths: VALID_AREAS.map(areaId => ({params: {areaId}})),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<AreaProps, AreaParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params is not defined");
  }

  const {id, name, desc, chapters}: Area =  await fetchArea(params.areaId);

  return {
    props: {
      area: {id, name, desc},
      chapters: chapters.map(({id, gameId, chapterNo: no, name}) => ({id, gameId, name, ...no && {no}})),
    },
  }
};

export default AreaPage;
