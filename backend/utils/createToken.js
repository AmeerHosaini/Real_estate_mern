import jwt from "jsonwebtoken";

const createToken = {
  accessToken: (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {
      expiresIn: "15min",
    });
  },
  refreshToken: (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: "1d",
    });
  },
};

export default createToken;
