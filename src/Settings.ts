// This load the contents of the .env file to the process.XXX
import "dotenv/config";

/**
 * Central repository for global settings. Initialize with the load() factory
 * method.
 *
 * The repository loads the settings from environment variables or from a .env
 * file. See `example.env` for the values you can set.
 */
export default class Settings {
  private constructor() {}

  public moodleUrl: string = "";
  public moodleUrlFetch: string = "";
  public microserviceUrl: string = "";
  public dbHost: string = "";
  public dbUser: string = "";
  public dbPassword: string = "";
  public dbName: string = "";
  public dbPort: number = 3306;
  public tablePrefix: string = "m_";
  public port: number = 3000;
  public jwtSecret: string = "";

  /**
   * Factory method that loads the settings from the environment variables and
   * returns an instance of the settings class
   * @returns an instance of the settings class
   */
  public static load(): Settings {
    const settings = new Settings();
    if (settings.checkEnvVars()) {
      console.error(
        "The H5P shared state microservice cannot be started as the configuration is invalid."
      );
      process.exit(1);
    }
    settings.loadEnvVars();
    return settings;
  }

  /**
   * Loads the settings from the environment variables
   */
  private loadEnvVars() {
    this.moodleUrl = process.env.MOODLE_URL as string;
    if (this.moodleUrl.endsWith("/")) {
      this.moodleUrl = this.moodleUrl.substring(
        0,
        this.moodleUrl.lastIndexOf("/")
      );
    }
    this.moodleUrlFetch = process.env.MOODLE_URL_FETCH as string;
    if (!this.moodleUrlFetch) {
      this.moodleUrlFetch = this.moodleUrl;
    }
    if (this.moodleUrlFetch.endsWith("/")) {
      this.moodleUrlFetch = this.moodleUrlFetch.substring(
        0,
        this.moodleUrlFetch.lastIndexOf("/")
      );
    }
    this.microserviceUrl = process.env.MICROSERVICE_URL as string;
    this.dbHost = process.env.MOODLE_DB_HOST as string;
    this.dbUser = process.env.MOODLE_DB_USER as string;
    this.dbPassword = process.env.MOODLE_DB_PASSWORD as string;
    this.dbName = process.env.MOODLE_DB_NAME as string;
    this.jwtSecret = process.env.JWT_SECRET as string;
    if (process.env.MOODLE_DB_PORT) {
      this.dbPort = Number.parseInt(process.env.MOODLE_DB_PORT);
    }
    if (process.env.MOODLE_TABLE_PREFIX) {
      this.tablePrefix = process.env.MOODLE_TABLE_PREFIX;
    }
    if (process.env.PORT) {
      this.port = Number.parseInt(process.env.PORT);
    }
  }

  /**
   * Checks the environment variables and reports errors in the console.
   * @returns true if there was an error false if there was none
   */
  private checkEnvVars(): boolean {
    let err: boolean = false;
    if (!process.env.MOODLE_URL) {
      console.error("MOODLE_URL must be set for the microservice to run.");
      err = true;
    }
    if (!process.env.MICROSERVICE_URL) {
      console.error(
        "MICROSERVICE_URL must be set for the microservice to run."
      );
      err = true;
    }
    if (!process.env.MOODLE_DB_HOST) {
      console.error("MOODLE_DB_HOST must be set for the microservice to run.");
      err = true;
    }
    if (!process.env.MOODLE_DB_USER) {
      console.error("MOODLE_DB_USER must be set for the microservice to run.");
      err = true;
    }
    if (!process.env.MOODLE_DB_PASSWORD) {
      console.error(
        "MOODLE_DB_PASSWORD must be set for the microservice to run."
      );
      err = true;
    }
    if (!process.env.MOODLE_DB_NAME) {
      console.error("MOODLE_DB_NAME must be set for the microservice to run.");
      err = true;
    }
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET must be set for the microservice to run.");
      err = true;
    }
    if (
      process.env.MOODLE_DB_PORT &&
      Number.parseInt(process.env.MOODLE_DB_PORT) === Number.NaN
    ) {
      console.error("MOODLE_DB_PORT has an invalid value.");
      err = true;
    }

    return err;
  }
}
