import inputs, { createCallback } from "./inputs";
import all from "../generator/generators";

const formatSample = spec => `${spec.name}${spec.index}(${spec.style})`;

const attr = obj => {
  const key = Object.keys(obj)[0];
  const value = Object.values(obj)[0];
  if (typeof value === "undefined") {
    return "";
  }
  return `${key}=${value}`;
};

const input = props => {
  const { id, type, label } = props;
  return `<div class="form-group">
  <label for="${id}">${label || id}</label>
  <input ${["id", "value", "min", "max"]
    .map(x => attr({ [x]: props[x] }))
    .join(" ")}
  ${attr({ type: type || "text" })} />
  </div>`;
};

const listeners = {};

const addListener = (id, callback, type) => {
  const e = document.getElementById(id);
  if (e) {
    e.addEventListener(type || "change", callback);
  }
};

const removeListener = (id, callback, type) => {
  const e = document.getElementById(id);
  if (e) {
    e.removeEventListener(type || "change", callback);
  }
};

const renderPattern = pattern => {
  if (!pattern) {
    return "";
  }
  return `
  <div class="pattern">
  ${pattern
    .map(x => {
      const empty = !(x && x.velocity);
      const velo = empty ? null : Math.floor(255 * x.velocity);
      return empty
        ? '<div class="note empty"></div>'
        : `<div class="note" style="background-color: rgba(${velo},0,0,255);"></div>`;
    })
    .join("")}
  </div>
  `;
};

const renderGenerator = (scene, key) => {
  const value = scene.generators[key] ? scene.generators[key].name : null;
  if (value) {
    return `
    <select id="generator">
    ${Object.keys(all).map(
      x => `<option value="${x}" ${value === x ? "selected" : ""}>${x}</option>`
    )}
    </select>
    `;
  } else {
    return "";
  }
};

const section = (sections, obj, tag) => {
  const t = tag || "div";
  const id = Object.keys(obj)[0];
  const value = `<${t} id="${id}">${Object.values(obj)[0]}</${t}>`;
  sections[id] = value;
  return value;
};

const cache = {};

let firstRenderDone = false;

let logged = false;
const logOnce = (...params) => {
  if (!logged) {
    console.log(...params);
    logged = true;
  }
};

const addListeners = state => {
  const generatorIds = Object.keys(state.scene.generators).map(
    x => `${x}-generator`
  );
  generatorIds.forEach(id => {
    const callback = createCallback(id);
    addListener(id, callback);
    listeners[id] = { callback, id };
  });
  Object.keys(inputs).forEach(key => {
    const spec = inputs[key];
    addListener(key, spec.callback);
    listeners[key] = { ...spec, id: key };
  });
};

const removeListeners = () => {
  Object.keys(listeners).forEach(key => {
    removeListener(key, listeners[key].callback);
  });
};

const render = state => {
  const el = document.getElementById("content");
  const { scene } = state;
  const sections = {};

  const sect = (obj, tag) => section(sections, obj, tag);

  sect({
    header: input({
      value: scene.tempo,
      id: "tempo",
      type: "number",
      min: 30,
      max: 250
    })
  });
  sect(
    {
      debug: JSON.stringify(state, null, 2)
    },
    "pre"
  );
  sect(
    {
      tableHeader: `${["#", "pattern", "generator", "sample"]
        .map(x => `<th>${x}</th>`)
        .join("")}`
    },
    "tr"
  );

  const instruments = Object.keys(scene.instruments);

  instruments.forEach((key, i) => {
    const inst = scene.instruments[key];
    sect({ [`${key}-index`]: i + 1 }, "td");
    sect(
      { [`${key}-pattern`]: renderPattern((state.pattern || {})[key]) },
      "td"
    );
    sect({ [`${key}-generator`]: renderGenerator(scene, key) }, "td");
    sect({ [`${key}-sample`]: formatSample(inst.specs[key].sample) }, "td");
  });

  const changed = {};
  let anyChanged = false;
  Object.keys(sections).forEach(s => {
    const same = cache[s] && sections[s] === cache[s];
    changed[s] = !same;
    if (!same) {
      anyChanged = true;
    }
  });

  //logOnce(sections);

  if (!anyChanged) {
    return;
  }

  if (firstRenderDone) {
    removeListeners();
    Object.keys(changed).forEach(s => {
      if (changed[s]) {
        const e = document.getElementById(s);
        if (e) {
          e.outerHTML = sections[s];
          cache[s] = sections[s];
        }
      }
    });
    addListeners(state);
    return;
  }

  const html = `
<div>
  ${sections.header}
  <table>
    ${sections.tableHeader}
    ${instruments
      .map(
        key => `<tr>
    ${["index", "pattern", "generator", "sample"]
      .map(cell => sections[`${key}-${cell}`])
      .join("")}
    </tr>`
      )
      .join("")}
  </table>
  ${sections.debug}
</div>
`;

  removeListeners();
  el.innerHTML = html;
  firstRenderDone = true;
  addListeners(state);
};

export default render;
