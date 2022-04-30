import {Box, Card, CardActionArea, CardContent, CardMedia, Container, List, ListItemButton, Typography} from '@mui/material'
import {DATA} from 'logic/data/data'
import {getScreenURL} from 'logic/fetch/image'
import {useCampContext} from 'logic/provide/CampContext'
import {CampHead} from 'modules/head/CampHead'
import Image from "next/image"
import Link from "next/link"
import {GetStaticPaths, GetStaticProps} from 'next/types'
import {ParsedUrlQuery} from 'querystring'
import {FC, Fragment} from 'react'
import {Area} from '../logic/data/dataTree'
import {CampPage} from './_app'

const AreaPage: CampPage<AreaProps> = ({areaId, area}) => {
  return (
    <Fragment>
      <CampHead
        title={area.name}
        description={area.desc}
        image={area.image}
      />
      <AreaView areaId={areaId} area={area} />
    </Fragment>
  )
}

export const AreaView: FC<AreaProps> = ({areaId, area}) => {
  const {settings: {listMode}} = useCampContext();

  return (
    <Fragment>
      {listMode ? <ListArea areaId={areaId} area={area} /> : <GridArea areaId={areaId} area={area} />}
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
                <Link passHref href={`/${areaId}/${chapterId}`}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      src={getScreenURL(chapter.image)}
                      alt={`An image of chapter ${chapter.name}`}
                      style={{
                        imageRendering: "pixelated",
                      }}
                    />
                    <CardContent>
                      <Typography component="div" variant="h6">
                        {chapter.chapterNo && `Chapter ${chapter.chapterNo} - `}
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

const ListArea: FC<AreaProps> = ({areaId, area}) => {
  return (
    <Fragment>
      <Container>
        <Typography component="div" variant="h4" marginTop={4} marginBottom={1}>{area.name}</Typography>
        <Typography component="div" color="text.secondary" marginBottom={2}>{area.desc}</Typography>
        <List disablePadding>
          {Object.entries(area.chapters).map(([chapterId, chapter]) => (
            <Link key={chapterId} passHref href={`/${areaId}/${chapterId}`}>
              <ListItemButton
                disableGutters
                component="a"
                sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
              >
                <Image
                  unoptimized
                  src={getScreenURL(chapter.image)}
                  alt={`Image of chapter ${chapter.name}`}
                  width={80}
                  height={45}
                />
                <Typography component="div" marginLeft={2} color="text.secondary" width="1rem">{chapter.chapterNo ? chapter.chapterNo : ""}</Typography>
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
