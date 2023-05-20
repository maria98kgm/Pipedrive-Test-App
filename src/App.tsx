import { useEffect, useState } from "react";
import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
import "./App.css";

function App() {
  const [dealId, setDealId] = useState("");

  useEffect(() => {
    initializeSDK();
  }, []);

  async function initializeSDK() {
    await new AppExtensionsSDK().initialize();
  }

  console.log(window.location.href);

  return (
    <>
      <div></div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
