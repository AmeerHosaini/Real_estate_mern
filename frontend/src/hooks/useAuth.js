import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  if (token) {
    const decoded = jwtDecode(token);
    const { username, avatar, id } = decoded.userInfo;
    return { isAuth: true, username, avatar, id };
  }

  return {
    isAuth: false,
    username: "",
    avatar: "",
    id: null,
  };
};

export default useAuth;
