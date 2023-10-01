// Extends the Express Request type with our custom user data

declare namespace Express {
  interface Request {
    user?: {
      username?: string;
      displayName?: string;
      email?: string;
      id?: string;
      roles: string[];
      permissions: string[];
    };
  }
}
