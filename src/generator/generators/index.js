import fourbyfour from "./drums/fourbyfour";
import breakbeat from "./drums/breakbeat";
import { sample } from "../../utils";
import downbeats from "./drums/downbeats";
import eighths from "./drums/eighths";
import offbeats from "./drums/offbeats";
import busy from "./drums/busy";
import sparse from "./drums/sparse";

const all = {
  "drums/fourbyfour": { generator: fourbyfour, for: ["BD", "CP", "HC"] },
  "drums/breakbeat": { generator: breakbeat, for: ["BD"] },
  "drums/downbeats": { generator: downbeats, for: ["SN", "CP"] },
  "drums/eighths": { generator: eighths, for: ["HC", "HO"] },
  "drums/offbeats": { generator: offbeats, for: ["HC", "HO"] },
  "drums/busy": { generator: busy, for: ["HC"] },
  "drums/sparse": { generator: sparse, for: ["PR", "HO"] }
};

const getRandomGenerator = suitableFor => {
  let choices = [];
  if (suitableFor) {
    Object.keys(all).forEach(key => {
      suitableFor.forEach(preferred => {
        if (all[key].for && all[key].for.includes(preferred)) {
          choices.push(key);
        }
      });
    });
  }
  if (!choices || choices.length === 0) {
    choices = Object.keys(all);
  }
  return all[sample(choices)].generator;
};

export { all as default, getRandomGenerator };
