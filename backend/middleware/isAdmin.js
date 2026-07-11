//ek baar auth.js run ho gaya to hamare paas req.user() me data hoga , iss file me we will see if he is admin

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication needed " });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "you dont have permision" });
  }
  next();
};

module.exports = isAdmin;
