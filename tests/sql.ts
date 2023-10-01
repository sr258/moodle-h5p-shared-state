import Settings from "../src/Settings";
import MoodlePressDB from "../src/MoodleMySqlDB";

// Not a proper unit test, but a test that must be called manually.

let settings: Settings;

const getContentMetadata = async () => {
  const db = new MoodlePressDB(
    settings.dbHost,
    settings.dbUser,
    settings.dbPassword,
    settings.dbName
  );
  const metadata = await db.getContentMetadata("2");
  console.log(metadata);
};

const getContentParameters = async () => {
  const db = new MoodlePressDB(
    settings.dbHost,
    settings.dbUser,
    settings.dbPassword,
    settings.dbName
  );
  const params = await db.getContentParameters("3");
  console.log(params);
};

const start = async () => {
  settings = Settings.load();
  await getContentMetadata();
  await getContentParameters();
  process.exit(0);
};

start();
