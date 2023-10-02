import type Express from "express";

/**
 * Checks if the token is in the Authorization: header as a Bearer token.
 */
export const requireBearerToken =
  (authToken: string) =>
  (req: Express.Request, res: Express.Response, next) => {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(401).send("You must authorize with a bearer token");
    }
    const usedToken = req.headers.authorization.replace("Bearer ", "");
    if (usedToken !== authToken) {
      return res.status(403).send("Incorrect auth token");
    }
    next();
  };
