import React, { useState } from "react";
import "./styles.css";

const json = {};

function readAtPrefix(prefix) {
  return prefix.reduce((acc, prop) => acc[prop], json);
}

function Editor({ prefix = [] }: { prefix?: (string | number)[] }) {
  const [currentObject, setCurrentObject] = useState(readAtPrefix(prefix));

  // Node Operations (directly in the Editor)
  const addProp = () => {
    const newKey = `key-${Object.keys(currentObject).length}`;
    currentObject[newKey] = "newValue";
    setCurrentObject({ ...currentObject });
  };

  const renameProp = (key, e) => {
    const newKey = e.target.value;
    const value = currentObject[key];
    delete currentObject[key];
    currentObject[newKey] = value;
    setCurrentObject({ ...currentObject });
  };

  const changeType = (key, e) => {
    const value = e.target.value;
    if (value === "undefined") {
      currentObject[key] = undefined;
    } else if (value === "value") {
      currentObject[key] = "newValue";
    } else if (value === "object") {
      currentObject[key] = {};
    } else if (value === "array") {
      currentObject[key] = [];
    }
    setCurrentObject({ ...currentObject });
  };

  const setText = (key, e) => {
    currentObject[key] = e.target.value;
    setCurrentObject({ ...currentObject });
  };

  const addArrayElement = (key) => {
    currentObject[key].push({});
    setCurrentObject({ ...currentObject });
  };

  const removeArrayElement = (key, index) => {
    currentObject[key].splice(index, 1);
    setCurrentObject({ ...currentObject });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>{prefix.length ? prefix.join(".") : "<root>"}</th>
          <th>
            <button onClick={addProp}>Add property</button>
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(currentObject).map(([key, value], i) => (
          <tr key={i}>
            <td>
              <input
                type="text"
                value={key}
                onChange={(e) => renameProp(key, e)}
              />
            </td>
            <td>
              <select
                value={
                  value === undefined
                    ? "undefined"
                    : typeof value === "string"
                    ? "value"
                    : Array.isArray(value)
                    ? "array"
                    : "object"
                }
                onChange={(e) => changeType(key, e)}
              >
                <option value="undefined">undefined</option>
                <option value="value">value</option>
                <option value="object">object</option>
                <option value="array">array</option>
              </select>
            </td>
            <td>
              {value === undefined && "undefined"}
              {typeof value === "string" && (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setText(key, e)}
                />
              )}
              {typeof value === "object" && !Array.isArray(value) && (
                <Editor prefix={[...prefix, key]} />
              )}
              {Array.isArray(value) && (
                <div>
                  <button onClick={() => addArrayElement(key)}>
                    Add array element
                  </button>
                  {value.map((_, i) => (
                    <div key={i}>
                      <button onClick={() => removeArrayElement(key, i)}>
                        Remove
                      </button>
                      <Editor prefix={[...prefix, key, i]} />
                    </div>
                  ))}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  return (
    <div>
      <Editor />
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
}

export default App;
