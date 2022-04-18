import {Container, Link, Paper, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {Area} from "logic/data/dataTree";
import {Layout} from "modules/layout/Layout";
import {AreaView} from "./[area]";
import {AppNextPage} from "./_app";

const DEFAULT_AREA = "celeste";

export const HomePage: AppNextPage = ({mode, toggleMode, view, setView}) => {

  const area: Area | undefined = DATA[DEFAULT_AREA];

  return (
    <Layout
      description={"Browse rooms from the video game Celeste"}
      imgUrl={"https://f002.backblazeb2.com/file/berrycamp/screens/city/1/2/3.png"}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Container sx={{marginTop: 4}}>
        <Paper elevation={2} sx={{padding: 2}}>
          <Typography component="div" variant="h6">
            Welcome to <Typography component="span" color="secondary" variant="h6">Berry Camp</Typography>,
          </Typography>
          <Typography marginTop={1}>
            an index of all rooms in the video game Celeste, with rich embeds for sharing on Discord and the ability to load rooms
            in-game if <Link underline="hover" href="https://everestapi.github.io/">Everest</Link> is running.
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
      {area && <AreaView areaId="celeste" area={area} view={view} />}
    </Layout >
  )
}

export default HomePage;