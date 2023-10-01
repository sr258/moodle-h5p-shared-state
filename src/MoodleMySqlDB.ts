import mysql, { RowDataPacket } from "mysql2/promise";
import debug from "debug";
import {
  ContentId,
  ContentParameters,
  IContentMetadata,
} from "@lumieducation/h5p-server";

const log = debug("wp-microservice:db");

/**
 * Queries the Moodle database
 */
export default class MoodleMySqlDB {
  /**
   * @param dbHost the hostname of the MySQL / MariaDB database server
   * @param dbUser the username of a user that can access the Moodle database
   * @param dbPassword the password of a user that can access the Moodle database
   * @param dbDatabase the database in which Moodle stores its data
   * @param prefix the Moodle prefix used in the database (normally m_)
   */
  constructor(
    private dbHost: string,
    private dbUser: string,
    private dbPassword: string,
    private dbDatabase: string,
    private prefix: string = "m_"
  ) {}

  /**
   * Returns information about content
   */
  public getContentMetadata = async (
    contentId: ContentId
  ): Promise<IContentMetadata> => {
    const connection = await this.getConnection();

    const contentIdNumber = Number.parseInt(contentId);

    try {
      const [cRows] = await connection.query(
        `SELECT c.name, 
                c.embed_type, 
                c.content_type, 
                c.authors,
                c.source,
                c.year_from, 
                c.year_to, 
                c.license, 
                c.license_version, 
                c.license_extras, 
                c.author_comments, 
                c.changes, 
                c.default_language, 
                c.a11y_title, 
                l.machine_name 
                FROM ${this.prefix}hvp AS c
                JOIN ${this.prefix}hvp_libraries AS l
                ON c.main_library_id = l.id
                WHERE c.id = ?`,
        [contentIdNumber]
      );

      log("Got content info.");
      if (!cRows[0]) {
        throw new Error("No content with this contentId!");
      }

      const [lRows] = (await connection.query(
        `SELECT l.machine_name,
                l.major_version,
                l.minor_version,
                cl.dependency_type
                FROM ${this.prefix}hvp_libraries AS l
                JOIN ${this.prefix}hvp_contents_libraries AS cl
                ON l.id = cl.library_id
                WHERE cl.hvp_id = ?`,
        [contentIdNumber]
      )) as RowDataPacket[][];

      return {
        a11yTitle: cRows[0].a11y_title,
        authorComments: cRows[0].author_comments,
        authors: JSON.parse(cRows[0].authors),
        changes: JSON.parse(cRows[0].changes),
        contentType: cRows[0].content_type,
        defaultLanguage: cRows[0].default_language,
        editorDependencies: lRows
          .filter((d) => d.dependency_type === "editor")
          .map((d) => ({
            machineName: d.machine_name,
            majorVersion: d.major_version,
            minorVersion: d.minor_version,
          })),
        embedTypes: [cRows[0].embed_type],
        language: cRows[0].default_language,
        license: cRows[0].license,
        licenseExtras: cRows[0].license_extras,
        licenseVersion: cRows[0].license_version,
        mainLibrary: cRows[0].machine_name,
        preloadedDependencies: lRows
          .filter((d) => d.dependency_type === "preloaded")
          .map((d) => ({
            machineName: d.machine_name,
            majorVersion: d.major_version,
            minorVersion: d.minor_version,
          })),
        source: cRows[0].source,
        title: cRows[0].name,
        yearFrom: cRows[0].year_from,
        yearTo: cRows[0].year_to,
      };
    } catch (error) {
      log("Error while getting content metadata from database: %s", error);
      throw error;
    } finally {
      await connection.end();
    }
  };

  /**
   * Returns the parameters (= the actual content data) for a content object.
   */
  public getContentParameters = async (
    contentId: ContentId
  ): Promise<ContentParameters> => {
    const connection = await this.getConnection();

    const contentIdNumber = Number.parseInt(contentId);

    try {
      const [cRows] = await connection.query(
        `SELECT json_content
                FROM ${this.prefix}hvp
                WHERE id = ?`,
        [contentIdNumber]
      );
      log("Got content parameters.");
      if (!cRows[0]) {
        throw new Error("No content with this contentId!");
      }

      return JSON.parse(cRows[0].json_content);
    } catch (error) {
      log("Error while getting parameters from database: %s", error);
      throw error;
    } finally {
      await connection.end();
    }
  };

  /**
   * Returns a connection to the Moodle database. This connection must be
   * manually ended after use.
   * @returns
   */
  private getConnection = async (): Promise<mysql.Connection> => {
    let connection: mysql.Connection;
    try {
      connection = await mysql.createConnection({
        host: this.dbHost,
        user: this.dbUser,
        password: this.dbPassword,
        database: this.dbDatabase,
      });
    } catch (error) {
      console.error("Error while connecting to database: ", error);
      throw error;
    }
    return connection;
  };
}
