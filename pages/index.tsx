import {DATA} from "logic/data/data";
import {AreaData as AreaType} from "logic/data/dataTree";
import {NextPage} from "next/types";
import Area from "./[area]";

const DEFAULT_AREA = "celeste";

export const DefaultArea: NextPage = () => {
  const area: AreaType | undefined = DATA[DEFAULT_AREA];
  if (area === undefined) {
    return null;
  }

  return (
    <Area areaId="celeste" area={area} />
  )
}

export default DefaultArea;