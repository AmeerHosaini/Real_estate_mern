import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSendLogoutMutation } from "../features/auth/authApiSlice";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const Header = () => {
  const { isAuth, avatar } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sendLogout, { isSuccess, isError, error }] = useSendLogoutMutation();

  useEffect(() => {
    if (isSuccess) navigate("/auth/signin");
  }, [isSuccess, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermUrl = urlParams.get("searchTerm");
    if (searchTermUrl) {
      setSearchTerm(searchTermUrl);
    }
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Keep track of the previous search
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onLogoutClicked = () => sendLogout();

  if (isError) {
    return toast.error(error?.data?.message);
  }

  return (
    <>
      <Toaster />
      <header className="bg-gray-50 shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
          {/* logo */}
          <Link to="/">
            <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
              <span className="text-black">Dream</span>
              <span className="text-slate-500">Space</span>
            </h1>
          </Link>
          {/* search icon */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-100 p-3 rounded-lg flex items-center"
          >
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent focus:outline-none w-24 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>
              <FaSearch className="text-slate-500" />
            </button>
          </form>
          {/* links */}
          <ul className="flex items-center gap-4 text-black">
            <Link to="/">
              <li className="hidden sm:inline hover:underline">Home</li>
            </Link>
            <Link to="/about">
              <li className="hover:underline">About</li>
            </Link>
            {isAuth ? (
              <div className="flex item-center gap-2">
                <Link to="/profile">
                  <img
                    src={avatar}
                    alt="profile"
                    className="rounded-full h-7 w-7 object-cover"
                  />
                </Link>
                <button className="hover:underline" onClick={onLogoutClicked}>
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/auth/signin">
                <li className="hover:underline">Sign in</li>
              </Link>
            )}
          </ul>
        </div>
      </header>
    </>
  );
};

export default Header;
