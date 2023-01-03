import {Container, Link as MuiLink, List, Paper, Typography} from "@mui/material";
import {GetStaticProps} from "next";
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
      <Container sx={{marginTop: 4}}>
        <Paper elevation={2} sx={{padding: 2}}>
          <Typography component="div" variant="h6">
            Welcome to <Typography component="span" color="secondary" variant="h6">Berry Camp</Typography>!
          </Typography>
          <Typography marginTop={1}>
            Browse rooms from the video game Celeste and open them in-game if <MuiLink underline="hover" href="https://everestapi.github.io/">Everest</MuiLink> is running.
          </Typography>
          <Typography color="text.secondary" marginTop={1}>
            Send any feedback to
            <Typography component="strong" color="secondary"> wishcresp#0141 </Typography>
            on the <MuiLink underline="hover" href="https://discord.gg/Celeste">Celeste Discord</MuiLink>.
          </Typography>
          <Typography marginTop={4}>
            <strong>This website contains spoilers for Celeste.</strong>
          </Typography>
        </Paper>
        <List>
        
        <AreaView area={area} chapters={chapters}/>
        {/* {VALID_AREAS.map(area => (
          <Link key={area} passHref href={`/${area}`}>
            <ListItemButton
              disableGutters
              component="a"
              sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
            >
              <Typography component="div" color="text.secondary">{area}</Typography>
            </ListItemButton>
          </Link>
        ))} */}
      </List>
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
