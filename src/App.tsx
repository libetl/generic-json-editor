import * as React from "react";
import "./styles.css";
import data from "./some-value.json";

type Json = { [field: string]: string | Json[] | Json | undefined };

const JsonContext = React.createContext<{
  json: Json;
  nodeOperations: {
    addProp: (currentObject: Json, prefix: (string | number)[]) => void;
    renameProp: (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      e: Event
    ) => void;
    changeType: (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      e: Event
    ) => void;
    setText: (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      e: Event
    ) => void;
    addArrayElement: (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      value: Json[]
    ) => void;
    removeArrayElement: (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      value: Json[],
      i: number
    ) => void;
  };
}>({
  json: {},
  nodeOperations: {
    addProp: () => {},
    renameProp: () => {},
    changeType: () => {},
    setText: () => {},
    addArrayElement: () => {},
    removeArrayElement: () => {},
  },
});

const readAtPrefix = (json: Json, prefix: (string | number)[]) =>
  prefix.reduce((acc, prop) => acc[prop] as Json, json);

function Editor({ prefix = [] }: { prefix?: (string | number)[] }) {
  const {
    json,
    nodeOperations: {
      addProp,
      renameProp,
      changeType,
      setText,
      addArrayElement,
      removeArrayElement,
    },
  } = React.useContext(JsonContext);
  const currentObject = React.useMemo(
    () => readAtPrefix(json, prefix),
    [prefix]
  );

  return (
    <table>
      <tr>
        <th>{prefix.length ? prefix.join(".") : "<root>"}</th>
        <th>
          <button onClick={addProp.bind(null, currentObject, prefix)}>
            Add property
          </button>
        </th>
        <th></th>
      </tr>
      {Object.entries(
        typeof currentObject === "object"
          ? currentObject
          : { [""]: currentObject }
      ).map(([key, value], i) => (
        <tr key={i}>
          <td>
            {key !== "" && (
              <input
                type="text"
                name={`${prefix}-prop${i}`}
                value={key}
                onChange={renameProp.bind(null, currentObject, prefix, key)}
              />
            )}
          </td>
          <td>
            <select
              name={`${prefix}-type${i}`}
              onChange={changeType.bind(null, currentObject, prefix, key)}
            >
              <option value="undefined" selected={value === undefined}>
                undefined
              </option>
              <option
                value="value"
                selected={
                  typeof value !== "object" &&
                  typeof value !== "function" &&
                  !Array.isArray(value)
                }
              >
                value
              </option>
              <option
                value="object"
                selected={typeof value === "object" && !Array.isArray(value)}
              >
                object
              </option>
              <option value="array" selected={Array.isArray(value)}>
                array
              </option>
            </select>
          </td>
          <td>
            {typeof value === "undefined" && "undefined"}
            {typeof value !== "object" && typeof value !== "function" && (
              <input
                type="text"
                name={`${prefix}-value${i}`}
                value={value}
                onChange={setText.bind(null, currentObject, prefix, key)}
              />
            )}
            {!Array.isArray(value) && typeof value === "object" && (
              <Editor prefix={[...prefix, key]} />
            )}
            {Array.isArray(value) && (
              <table>
                <tr>
                  <th>{[...prefix, key].join(".") + "[]"}</th>
                  <th>
                    <button
                      onClick={addArrayElement.bind(
                        null,
                        currentObject,
                        prefix,
                        key,
                        value
                      )}
                    >
                      Add array element
                    </button>
                  </th>
                  {value.map((_, i) => (
                    <tr>
                      <td>
                        <button
                          onClick={removeArrayElement.bind(
                            null,
                            currentObject,
                            prefix,
                            key,
                            value,
                            i
                          )}
                        >
                          Remove
                        </button>
                      </td>
                      <td>
                        <Editor prefix={[...prefix, key, i]} />
                      </td>
                    </tr>
                  ))}
                </tr>
              </table>
            )}
          </td>
        </tr>
      ))}
    </table>
  );
}

function JsonObjectManipulator({
  initialJson,
  children,
}: {
  initialJson?: any;
  children: React.ReactNode;
}) {
  const [json, setJson] = React.useState(initialJson ?? {});
  const reset = React.useCallback(() => {
    setJson({});
  }, [json]);
  const setAtPrefix = React.useCallback(
    (newJson: Json, prefix: (string | number)[]) => {
      const currentObject = readAtPrefix(json, prefix);
      if (typeof currentObject === "object") {
        Object.keys(currentObject).forEach((key) => {
          delete currentObject[key];
        });
        Object.entries(newJson).map(([newKey, newValue]) => {
          currentObject[newKey] = newValue;
        });
      } else {
        const currentParent = readAtPrefix(json, prefix.slice(0, -1));
        currentParent[prefix.slice(-1)[0]] = newJson;
      }
      setJson(JSON.parse(JSON.stringify(json)));
    },
    [json]
  );

  const addProp = React.useCallback(
    (currentObject: Json, prefix: (string | number)[]) => {
      setAtPrefix(
        {
          ...currentObject,
          [`key-${Object.keys(currentObject).length}`]: "newValue",
        },
        prefix
      );
    },
    [json, setAtPrefix]
  );
  const renameProp = React.useCallback(
    (currentObject: Json, prefix: (string | number)[], key: string, e: Event) =>
      setAtPrefix(
        Object.fromEntries(
          Object.entries(currentObject).map(([key1, value1]) => [
            key1 === key
              ? (e.currentTarget as HTMLInputElement).value ?? ""
              : key1,
            value1,
          ])
        ),
        prefix
      ),
    []
  );
  const changeType = React.useCallback(
    (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      e: Event
    ) => {
      const target = e.currentTarget as HTMLInputElement;
      setAtPrefix(
        Object.fromEntries(
          Object.entries(currentObject).map(([key1, value1]) => [
            key1,
            key1 === key
              ? target.value === "undefined"
                ? undefined
                : target.value === "value"
                ? "newValue"
                : target.value === "object"
                ? {}
                : target.value === "array"
                ? []
                : undefined
              : value1,
          ])
        ),
        prefix
      );
    },
    []
  );
  const setText = React.useCallback(
    (currentObject: Json, prefix: (string | number)[], key: string, e: Event) =>
      setAtPrefix(
        typeof currentObject === "object"
          ? Object.fromEntries(
              Object.entries(currentObject).map(([key1, value1]) => [
                key1,
                key1 === key
                  ? (e.currentTarget as HTMLInputElement).value
                  : value1,
              ])
            )
          : ((e.currentTarget as HTMLInputElement).value as unknown as Json),
        prefix
      ),
    []
  );
  const addArrayElement = React.useCallback(
    (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      value: Json[]
    ) =>
      setAtPrefix(
        Object.fromEntries(
          Object.entries(currentObject).map(([key1, value1]) => [
            key1,
            key1 === key ? value.concat({}) : value1,
          ])
        ),
        prefix
      ),
    []
  );
  const removeArrayElement = React.useCallback(
    (
      currentObject: Json,
      prefix: (string | number)[],
      key: string,
      value: Json[],
      i: number
    ) =>
      setAtPrefix(
        Object.fromEntries(
          Object.entries(currentObject).map(([key1, value1]) => [
            key1,
            key1 === key ? value.filter((_, i1) => i !== i1) : value1,
          ])
        ),
        prefix
      ),
    []
  );
  return (
    <JsonContext
      value={{
        json,
        nodeOperations: {
          addProp,
          renameProp,
          changeType,
          setText,
          addArrayElement,
          removeArrayElement,
        },
      }}
    >
      {children}
      <button onClick={reset}>Reset</button>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </JsonContext>
  );
}

export default function App() {
  return (
    <JsonObjectManipulator initialJson={data}>
      <Editor />
    </JsonObjectManipulator>
  );
}
