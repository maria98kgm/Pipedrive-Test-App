import { useEffect, useState } from "react";
import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
import "./App.css";

const apiBase = "https://pipedrive-app-backend.onrender.com";

interface UserData {
  userId?: string;
}

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    initializeSDK();
    getUserData();
  }, []);

  const initializeSDK = async () => {
    await new AppExtensionsSDK().initialize();
  };

  const getUserData = () => {
    const userData: UserData = {};
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));

    userData.userId = searchParams.user_id;
    fetch(`${apiBase}/user?user_id=${searchParams.user_id}`, {
      headers: {
        "Access-Control-Allow-Origin": "https://pipedrive-app-backend.onrender.com",
      },
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

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
