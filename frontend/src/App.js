import { lazy } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Layout from "./Layouts/Layout";
import useTitle from "./hooks/useTitle";
import PersistLogin from "./features/auth/PersistLogin";
import ProtectedRoute from "./features/auth/ProtectedRoute";

const Prefetch = lazy(() => import("./features/auth/Prefetch"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Search = lazy(() => import("./pages/Search"));
const SignUp = lazy(() => import("./features/auth/SignUp"));
const Signin = lazy(() => import("./features/auth/Signin"));
const Listing = lazy(() => import("./features/listings/Listing"));
const Profile = lazy(() => import("./features/users/Profile"));
const NewListing = lazy(() => import("./features/listings/NewListing"));
const EditListing = lazy(() => import("./features/listings/EditListing"));

const App = () => {
  useTitle("Home");
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route element={<PersistLogin />}>
          <Route index element={<Home />} />
          <Route path="listing/:id" element={<Listing />} />
          <Route path="search" element={<Search />} />

          <Route path="auth/signup" element={<SignUp />} />
          <Route path="auth/signin" element={<Signin />} />
          <Route path="about" element={<About />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Prefetch />}>
              <Route path="profile" element={<Profile />} />
              <Route path="create-listing" element={<NewListing />} />
              <Route path="update-listing/:id" element={<EditListing />} />
            </Route>
          </Route>
        </Route>
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};

export default App;
