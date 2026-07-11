//made this to check if user is loggedin

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization; //req and next will be given by frontend , res is middleware output
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "middle ware doesnt know this user , deny access" });
  }

  // The header looks like "Bearer eyJhbGciOiJIUzI1NiIs..."
  // so we need only second waala part , which is actual token
  const token = authHeader.split(" ")[1];

  try {
    //to verify ki koi tampering nhi hui he token ke saath , we will compare with jwt token , agar valid hua tom user detail le lenge aur aage badhenge toward destination route
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // The user object (including ID and Role) will now be attached
    next();
  } catch (err) {
    //fake token , expired token , tampered token
    return res.status(401).json({ message: "not valid" });
  }
};

module.exports = auth;
