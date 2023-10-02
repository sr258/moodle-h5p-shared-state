import bodyParser from "body-parser";
import express from "express";
import http from "http";
import SharedStateServer from "@lumieducation/h5p-shared-state-server";
import debug from "debug";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import querystring from "node:querystring";
import url from "node:url";

import Settings from "./Settings";
import MoodleMySqlDB from "./MoodleMySqlDB";
import * as h5pRepository from "./h5pRepository";
import { requireBearerToken } from "./tokenAuth";

const log = debug("wp-microservice");

let db: MoodleMySqlDB;
let settings: Settings;

const main = async (): Promise<void> => {
  // Get settings (from environment variables or .env file. See example.env what
  // variables can and must be set)
  settings = Settings.load();
  log("Settings loaded");

  // Set up database repository
  db = new MoodleMySqlDB(
    settings.dbHost,
    settings.dbUser,
    settings.dbPassword,
    settings.dbName,
    settings.tablePrefix
  );

  // Create express server
  const app = express();

  app.use(morgan("dev"));

  app.use(bodyParser.json({ limit: "500mb" }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  // We need CORS for the HTTP XHR request sent to /auth-data/:contentId. We
  // only allow requests originating from the Moodle site and also allow the
  // cookie.
  app.use(cors({ origin: settings.moodleUrl, credentials: true }));

  // We need to create our own http server to pass it to the shared state
  // package.
  const server = http.createServer(app);

  // Add shared state websocket and ShareDB to the server
  const sharedStateServer = new SharedStateServer(
    server,
    h5pRepository.getLibraryMetadata(settings),
    h5pRepository.getLibraryFileAsJson(settings),
    async (req: http.IncomingMessage) => {
      if (!req.url) {
        throw new Error("No URL in request object. Cannot get query string");
      }
      const u = url.parse(req.url);
      const parsedQuery = querystring.decode(u.query ?? "");

      console.log(parsedQuery);

      if (!parsedQuery.token || typeof parsedQuery.token !== "string") {
        throw new Error(
          "Unauthenticated user tried to connect to Websocket endpoint"
        );
      }

      const token = parsedQuery.token;

      let decodedToken: {
        iat: number;
        uid: string;
        exp: number;
        iss: string;
        h5pcid: number;
        level: "privileged" | "user";
        /**
         * Display Name
         */
        dn: string;
        /*
         * E-Mail
         */
        em?: string;
      };
      try {
        decodedToken = jwt.verify(token, settings.jwtSecret) as any;
      } catch {
        log("Failed token verification");
        return undefined as any;
      }

      if (
        !decodedToken.uid ||
        !decodedToken.level ||
        !decodedToken.dn ||
        !["privileged", "user"].includes(decodedToken.level)
      ) {
        throw new Error("Invalid JSON webtoken token");
      }

      log(decodedToken);

      return {
        type: "local",
        name: decodedToken.dn,
        email: decodedToken.em ?? "",
        id: decodedToken.uid,
        level: decodedToken.level,
      };
    },
    async (user) => {
      return (user as any).level;
    },
    db.getContentMetadata,
    db.getContentParameters
  );

  app.delete(
    "/shared-state/:contentId",
    requireBearerToken(settings.restAuthToken),
    async (req: express.Request<{ contentId: string }>, res) => {
      try {
        console.log(
          "Deleting shared state for contentId",
          req.params.contentId
        );
        await sharedStateServer.deleteState(req.params.contentId);
      } catch {
        res.status(404).send();
      }
      res.status(204).send();
    }
  );

  process.on("uncaughtException", (error) => {
    log(error);
  });

  server.listen(settings.port, () => {
    console.log(`Microservice listening at http://localhost:${settings.port}`);
    console.log(`Microservice public URL is ${settings.microserviceUrl}`);
  });
};

// We can't use await outside a an async function, so we use the main()
// function as a workaround.
main();
