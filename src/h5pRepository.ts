import {
  ILibraryMetadata,
  ILibraryName,
  LibraryName,
} from "@lumieducation/h5p-server";
import Settings from "./Settings";

/**
 * Returns library metadata by getting it from the Moodle HTTP server.
 */
export const getLibraryMetadata =
  (settings: Settings) =>
  async (library: ILibraryName): Promise<ILibraryMetadata> => {
    const ubername = LibraryName.toUberName(library);
    const result = await fetch(
      settings.moodleUrlFetch +
        "/pluginfile.php/1/mod_hvp/libraries/" +
        ubername +
        "/library.json"
    );
    return (await result.json()) as ILibraryMetadata;
  };

/**
 * Returns an arbitrary library file by getting it from the Moodle HTTP server.
  * @throws an error if you request a file that is not valid JSON
 */
export const getLibraryFileAsJson =
  (settings: Settings) =>
  async (libraryName: ILibraryName, filename: string): Promise<any> => {
    const ubername = LibraryName.toUberName(libraryName);
    const result = await fetch(
      settings.moodleUrlFetch +
        "/pluginfile.php/1/mod_hvp/libraries/" +
        ubername +
        "/" +
        filename
    );
    return (await result.json()) as any;
  };
