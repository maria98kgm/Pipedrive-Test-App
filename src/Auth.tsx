import { useSearchParams } from "react-router-dom";

const Auth = () => {
  const [searchParams] = useSearchParams();

  console.log(searchParams);

  return <div>Auth</div>;
};

export default Auth;
