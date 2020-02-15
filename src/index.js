import "@babel/polyfill";

import "./style.scss";

import createMixer from "./core/mixer";
import createSequencer, { play, pause, reset } from "./core/sequencer";
import loop from "./core/loop";
import setupControls from "./controls";
import { randomize, initScene } from "./generator/scene";
import { setState } from "./ui/state";

const context = {};

const randomizeScene = () => {
  context.scene = randomize(setState);
};

const createActions = context => ({
  play: () => {
    play(context.sequencer);
  },
  pause: () => {
    pause(context.sequencer);
  },
  reset: () => {
    reset(context.sequencer);
  },
  randomize: () => {
    randomizeScene();
  }
});

const setup = () => {
  const root = document.getElementById("app");
  context.mixer = createMixer();
  context.sequencer = createSequencer();
  context.actions = createActions(context);
  setupControls(root, context.actions);
  initScene(context);
  randomizeScene();
  loop(context);
  play(context.sequencer);
};

const hideStart = () => {
  const btn = document.getElementById("start");
  btn.style.display = "none";
};

const setupStart = () => {
  const btn = document.getElementById("start");
  btn.addEventListener("click", () => {
    setup();
    hideStart();
  });
};

if (process.env.NODE_ENV === "production") {
  setupStart();
} else {
  hideStart();
  setup();
}
