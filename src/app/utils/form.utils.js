export function validatePassword(password) {
  /** Must contain at least one number and one uppercase and
    * lowercase letter, and at least 8 or more characters.
    * /(?=.*\d)(?=.*[A-Z]).{8,}/i 
    */
  return /(?=.{8,})/.test(password); // Returns true or false.
}
