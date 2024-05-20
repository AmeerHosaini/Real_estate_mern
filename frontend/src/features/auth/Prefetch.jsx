import { store } from "../app/store";
import { listingsApiSlice } from "../listings/listingsApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const Prefetch = () => {
  useEffect(() => {
    store.dispatch(
      listingsApiSlice.util.prefetch("getListings", "listings", {
        force: true,
      }),
      usersApiSlice.util.prefetch("getUsers", "users", { force: true })
    );
  }, []);

  return <Outlet />;
};

export default Prefetch;
