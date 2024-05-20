import { Outlet, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";
import Loader from "../../components/Loading";

const PersistLogin = () => {
  const [persist] = usePersist(true);
  const token = useSelector(selectCurrentToken);

  // handles the strict mode
  const effectRan = useRef(false);
  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isLoading, isSuccess, isError, error, isUninitialized }] =
    useRefreshMutation();

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      const verifyRefreshToken = async () => {
        console.log("Verifying refresh token");
        try {
          await refresh();
          setTrueSuccess(true);
        } catch (error) {
          console.log(error);
        }
      };

      if (!token && persist) verifyRefreshToken();
    }

    return () => (effectRan.current = true);
  }, []);

  let content;
  if (token && !persist) {
    // persist: no
    console.log("no persist");
    content = <Outlet />;
  }
  // else if (!token || !persist) {
  //   content = <Link to="/auth/signin">Please login again</Link>;
  // }
  else if (isLoading) {
    //persist: yes, token: no
    console.log("loading");
    content = <Loader />;
  } else if (isError) {
    //persist: yes, token: no
    console.log("error");
    content = (
      <p>
        {`${error?.data?.message} - `}
        <Link to="/auth/signin">Please login again</Link>.
      </p>
    );
  } else if (isSuccess && trueSuccess) {
    //persist: yes, token: yes
    console.log("success");
    content = <Outlet />;
  } else if (token && isUninitialized) {
    //persist: yes, token: yes
    console.log("token and uninit");
    console.log(isUninitialized);
    content = <Outlet />;
  } else {
    content = <Outlet />;
  }

  return content;
};

export default PersistLogin;
