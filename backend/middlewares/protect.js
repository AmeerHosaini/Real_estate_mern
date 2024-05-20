import jwt from "jsonwebtoken";

const portect = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: "Forbidden!" });
    }
    req.user = decoded.userInfo.username;
    req.id = decoded.userInfo.id;
    req.avatar = decoded.userInfo.avatar;
    next();
  });
};

export default portect;
