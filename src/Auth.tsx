import { useSearchParams } from "react-router-dom";

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  console.log(searchParams);

  return <div>Auth</div>;
};

export default Auth;
