import city from "data/rooms/city.json";
import core from "data/rooms/core.json";
import epilogue from "data/rooms/epilogue.json";
import farewell from "data/rooms/farewell.json";
import prologue from "data/rooms/prologue.json";
import reflection from "data/rooms/reflection.json";
import resort from "data/rooms/resort.json";
import ridge from "data/rooms/ridge.json";
import site from "data/rooms/site.json";
import summit from "data/rooms/summit.json";
import temple from "data/rooms/temple.json";
import {DataTree} from './dataTree';

export const DATA: DataTree = {
  celeste: {
    id: "Celeste",
    name: "Celeste",
    desc: "Includes the base game from 2018 and the Farewell expansion from 2019.",
    imageUrl: "https://cdn.berrycamp.com/file/berrycamp/static/navigation/chapters/images/ridge.png",
    chapters: {
      prologue,
      city,
      site,
      resort,
      ridge,
      temple,
      reflection,
      summit,
      epilogue,
      core,
      farewell,
    }
  }
};