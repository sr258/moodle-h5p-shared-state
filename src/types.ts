export interface ISharedStateJwt {
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
}
