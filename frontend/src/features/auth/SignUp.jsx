import { useState } from "react";
import { Link } from "react-router-dom";
import { useSignupMutation } from "../auth/authApiSlice";
import { Toaster, toast } from "react-hot-toast";
import useTitle from "../../hooks/useTitle";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [signup, { isLoading }] = useSignupMutation();

  const canSave =
    [username, email, password, confirmPassword].every(Boolean) && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        return toast.error("Passwords do not match!");
      } else {
        await signup({ username, email, password }).unwrap();
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        return toast.success("Account was successfully registered!");
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  useTitle("Sign Up");
  return (
    <>
      <Toaster />
      <section className="p-3 max-w-lg mx-auto mt-10">
        <header>
          <h1 className="text-center text-3xl font-semibold my-7">Sign Up</h1>
        </header>
        <main>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                autoComplete="off"
                className="border p-3 rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
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
            <div className="flex flex-col">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                className="border p-3 rounded-lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              disabled={!canSave}
              className="bg-blue-950 p-3 text-white rounded-lg uppercase hover:bg-white hover:text-blue-950 border border-blue-950 transition duration-300 ease-in-out disabled:opacity-80 disabled:hover:bg-blue-950 disabled:hover:text-white"
            >
              {isLoading ? "Loading..." : "Sign up"}
            </button>
          </form>
          <div className="flex gap-2 mt-5">
            <p>Already have an account?</p>
            <Link to="/auth/signin" className="text-blue-700">
              Sign in.
            </Link>
          </div>
        </main>
      </section>
    </>
  );
};

export default SignUp;
