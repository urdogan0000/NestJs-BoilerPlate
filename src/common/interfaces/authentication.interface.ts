/**
 * Interface for authentication-related methods.
 * Defines methods required for implementing authentication mechanisms.
 */
export interface AuthenticationInterface {
  /**
   * Method to perform basic authentication using a username and password.
   *
   * @param username The username to authenticate.
   * @param password The password associated with the username.
   * @returns A promise that resolves to a boolean indicating whether authentication was successful or not.
   */
  basicAuth(username: string, password: string): Promise<boolean>;
}
