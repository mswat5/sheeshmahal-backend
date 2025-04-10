import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, data: {}, message: "unauthorised user" });
  }
};

export default authenticateToken;
