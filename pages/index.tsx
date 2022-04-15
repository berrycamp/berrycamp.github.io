import {DATA} from "logic/data/data";
import {AreaData as AreaType} from "logic/data/dataTree";
import {Layout} from "modules/layout/Layout";
import {NextPage} from "next/types";
import {Area} from "./[area]";

const DEFAULT_AREA = "celeste";

export const HomePage: NextPage = () => {
  const area: AreaType | undefined = DATA[DEFAULT_AREA];
  if (area === undefined) {
    return null;
  }

  return (
    <Layout title={"Browse rooms"} description={"Browse rooms from the video game Celeste"} imgUrl={"https://cdn.berrycamp.com/file/berrycamp/static/welcome/images/1.png"}>
      <Area areaId="celeste" area={area} />
    </Layout>
  )
}

export default HomePage;