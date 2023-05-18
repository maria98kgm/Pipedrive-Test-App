import { useEffect, useState } from "react";
import AppExtensionsSDK, { Command } from "@pipedrive/app-extensions-sdk";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [token, setToken] = useState("");

  useEffect(() => {
    initializeSDK();
  }, []);

  async function initializeSDK() {
    const sdk = await new AppExtensionsSDK().initialize();
    const { token } = await sdk.execute(Command.GET_SIGNED_TOKEN);

    if (token) setToken(token);
  }

  console.log(token);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>{token}</p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
