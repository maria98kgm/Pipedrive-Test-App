import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  api_domain: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("code")) {
      const code = searchParams.get("code");
      const authBody = {
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://starlit-cajeta-9f6abf.netlify.app/",
      };

      fetch("https://oauth.pipedrive.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(authBody),
      })
        .then((res) => res.json())
        .then((data: AuthResponse) => {
          console.log(data);
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("api_domain", data.api_domain);
        });
    }
  }, []);

  return <div>Auth</div>;
};

export default Auth;
