import type { IUser } from "@lumieducation/h5p-server";

/**
 * User object as expected by H5P.
 */
export default class User implements IUser {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    accessLevel: "anonymous" | "teacher"
  ) {
    this.canInstallRecommended = accessLevel === "teacher";
    this.canUpdateAndInstallLibraries = accessLevel === "teacher";
    this.canCreateRestricted = accessLevel === "teacher";
    this.type = "local";
  }

  public canCreateRestricted: boolean;
  public canInstallRecommended: boolean;
  public canUpdateAndInstallLibraries: boolean;
  public type: "local";
}
