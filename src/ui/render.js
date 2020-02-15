import inputs, { createCallback } from "./inputs";
import all from "../generator/generators";
import CATALOG from "../generator/catalog";

const getSampleLabel = spec => `${spec.name}${spec.index}(${spec.style})`;

const prepareSampleList = () => {
  const choices = [];
  const keys = Object.keys(CATALOG).sort();
  keys.forEach(inst => {
    choices.push({ group: true, label: inst });
    CATALOG[inst].forEach(sample => {
      for (let i = 0; i < sample.amount; ++i) {
        choices.push({ ...sample, index: i + 1 });
      }
    });
  });
  return choices;
};

const sampleChoices = prepareSampleList();

const renderSelect = (id, options, selected, valueFn, groups) => {
  let inGroup = false;
  return `<select id="${id}">
  ${options
    .map(x => {
      if (groups && x.group) {
        let out = "";
        if (inGroup) {
          inGroup = false;
          out += `</optgroup>`;
        }
        return out + `<optgroup label="${valueFn(x)}">`;
      }
      const value = valueFn ? valueFn(x) : x;
      return `<option value="${value}" ${
        selected === value ? "selected" : ""
      }>${value}</option>`;
    })
    .join("")}
  </select>
  `;
};

const renderSampleValue = x => {
  if (x.group) {
    return x.label;
  }
  return getSampleLabel(x);
};

const renderSample = (spec, i) => {
  const value = getSampleLabel(spec);
  return renderSelect(
    `sample-select-${i}`,
    sampleChoices,
    value,
    renderSampleValue,
    true
  );
};

const renderGenerator = (scene, key, i) => {
  const value = scene.generators[key] ? scene.generators[key].name : null;
  if (value) {
    return renderSelect(`generator-select-${i}`, Object.keys(all), value);
  } else {
    return "";
  }
};

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
  const trackIds = Object.keys(state.scene.generators).map((x, i) => i);
  const generatorIds = trackIds.map(i => `generator-select-${i}`);
  const sampleIds = trackIds.map(i => `sample-select-${i}`);
  generatorIds.forEach(id => {
    const callback = createCallback(id);
    addListener(id, callback);
    listeners[id] = { callback, id };
  });
  sampleIds.forEach(id => {
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
    sect({ [`${key}-generator`]: renderGenerator(scene, key, i) }, "td");
    sect({ [`${key}-sample`]: renderSample(inst.specs[key].sample, i) }, "td");
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
