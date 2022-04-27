import {Container, Link, Paper, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {Area} from "logic/data/dataTree";
import {CampHead} from "modules/head/CampHead";
import {Fragment} from "react";
import {AreaView} from "./[areaId]";
import {CampPage} from "./_app";

const DEFAULT_AREA: Area = DATA["celeste"];

export const HomePage: CampPage = () => {
  return (
    <Fragment>
      <CampHead
        description="Browse rooms from the video game Celeste"
        image="city/1/2/3"
      />
      <Container sx={{marginTop: 4}}>
        <Paper elevation={2} sx={{padding: 2}}>
          <Typography component="div" variant="h6">
            Welcome to <Typography component="span" color="secondary" variant="h6">Berry Camp</Typography>!
          </Typography>
          <Typography marginTop={1}>
            Browse rooms from the video game Celeste and open them in-game if <Link underline="hover" href="https://everestapi.github.io/">Everest</Link> is running.
          </Typography>
          <Typography color="text.secondary" marginTop={1}>
            Send any feedback to
            <Typography component="strong" color="secondary"> wishcresp#0141 </Typography>
            on the <Link underline="hover" href="https://discord.gg/Celeste">Celeste Discord</Link>.
          </Typography>
          <Typography marginTop={4}>
            <strong>This website contains spoilers for Celeste.</strong>
          </Typography>
        </Paper>
      </Container>
      <AreaView areaId="celeste" area={DEFAULT_AREA} />
    </Fragment>
  )
}

export default HomePage;