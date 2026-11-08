import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const auth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required.",
    });
  }

  try {
    const token = authorization.slice(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }
    const googleToken = token.length > 1000;
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
      };
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { id, name, photoURL } = decodedToken;
      req.user = { id, name, photoURL };
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "Something is wrong with your authorization!",
    });
  }
};

export default auth;
