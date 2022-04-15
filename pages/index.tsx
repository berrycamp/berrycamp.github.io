import {DATA} from "logic/data/data";
import {AreaData as AreaType} from "logic/data/dataTree";
import {Layout} from "modules/layout/Layout";
import {Area} from "./[area]";
import {AppNextPage} from "./_app";

const DEFAULT_AREA = "celeste";

export const HomePage: AppNextPage = ({mode, toggleMode, view, setView}) => {
  const area: AreaType | undefined = DATA[DEFAULT_AREA];
  if (area === undefined) {
    return null;
  }

  return (
    <Layout
      title={"Browse rooms"}
      description={"Browse rooms from the video game Celeste"}
      imgUrl={"https://cdn.berrycamp.com/file/berrycamp/static/welcome/images/1.png"}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Area areaId="celeste" area={area} />
    </Layout>
  )
}

export default HomePage;