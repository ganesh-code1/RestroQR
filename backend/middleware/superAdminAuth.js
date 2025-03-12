import jwt from "jsonwebtoken";

export const verifySuperAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], "secretkey");
    if (verified.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};