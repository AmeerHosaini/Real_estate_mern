import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { setCredentials } from "./authSlice";
import { useLoginMutation } from "./authApiSlice";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import useTitle from "../../hooks/useTitle";
import usePersist from "../../hooks/usePersist";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = usePersist();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const canSave = [email, password].every(Boolean) && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { accessToken } = await login({ email, password }).unwrap();
      dispatch(setCredentials({ accessToken }));
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      if (!error.status) {
        return toast.error("No server response");
      } else if (error.status === 400) {
        return toast.error("Missing username or password");
      } else if (error.status === 401) {
        return toast.error("Unauthorized");
      } else {
        return toast.error(error?.data?.message);
      }
    }
  };

  useTitle("Sign In");
  return (
    <>
      <Toaster />
      <section className="p-3 max-w-lg mx-auto mt-10">
        <header>
          <h1 className="text-center text-3xl font-semibold my-7">Sign In</h1>
        </header>
        <main>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="border p-3 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="border p-3 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="persist" className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="persist"
                  className="w-4 h-4"
                  checked={persist}
                  onChange={() => setPersist((prev) => !prev)}
                />
                Keep me signed in
              </label>
            </div>
            <button
              disabled={!canSave}
              className="bg-blue-950 p-3 text-white rounded-lg uppercase hover:bg-white hover:text-blue-950 border border-blue-950 transition duration-300 ease-in-out disabled:opacity-80 disabled:hover:bg-blue-950 disabled:hover:text-white"
            >
              {isLoading ? "Loading..." : "Sign in"}
            </button>
          </form>
          <div className="flex gap-2 mt-5">
            <p>Do not have an account?</p>
            <Link to="/auth/signup" className="text-blue-700">
              Sign up.
            </Link>
          </div>
        </main>
      </section>
    </>
  );
};

export default Signin;
