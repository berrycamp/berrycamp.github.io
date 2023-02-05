import {Alert, Avatar, Box, Chip, Container, Paper, Typography} from "@mui/material";
import {GetStaticProps} from "next";
import Link from "next/link";
import {Fragment} from "react";
import {Area} from "~/modules/data/dataTypes";
import {fetchArea, getRootImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaProps, AreaView} from "./[areaId]";
import {CampPage} from "./_app";

export const HomePage: CampPage<AreaProps> = ({area, chapters}) => {
  return (
    <Fragment>
      <CampHead
        description="Browse rooms from the video game Celeste"
        image={getRootImageUrl()}
      />
      <Container>
        <Paper elevation={2} sx={{padding: 2, mt: 2}}>
          <Typography component="div" variant="h6">
            Welcome to <Typography component="span" color="secondary" variant="h6">Berry Camp</Typography>!
          </Typography>
          <Typography marginTop={1}>
            Browse rooms from the video game Celeste and open them in-game with Everest.
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            pt={3}
          >
            <Chip
              clickable
              component="a"
              href="https://github.com/berrycamp/berrycamp.github.io"
              avatar={<Avatar src="https://github.com/berrycamp.png?size=64"/>}
              label="Berry Camp"
            />
            <Typography>was made by</Typography>
            <Chip
              clickable
              component="a"
              href="https://github.com/wishcresp"
              avatar={<Avatar src="https://github.com/wishcresp.png?size=64"/>}
              label="wishcresp"
            />
          </Box>
        </Paper>
        <Alert
          severity="info"
          variant="outlined"
          sx={{mt: 2}}
        >
          {"Berry Camp has moved to "}
          <strong>
            <Link href="https://berrycamp.github.io">
              https://berrycamp.github.io
            </Link>
          </strong>
          {". Old links will stop working in April so update your bookmarks!"}
        </Alert>
        <AreaView area={area} chapters={chapters}/>
      </Container>
    </Fragment>
  )
};

export default HomePage;

export const getStaticProps: GetStaticProps<AreaProps> = async () => {
  const {id, name, desc, chapters}: Area =  await fetchArea("celeste");

  return {
    props: {
      area: {id, name, desc},
      chapters: chapters.map(({id, gameId, chapterNo: no, name}) => ({id, gameId, name, ...(no && {no})})),
    },
  };
};
