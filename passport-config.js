import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
export function initializer(connection, passport) {
  passport.use(
    new LocalStrategy({ usernameField: "username", passwordField: "password" },async (username, password, cb) => {
      try {
        const response = await connection.query(
          "SELECT * FROM accounts WHERE username = $1",
          [username]
        );
        if (response.rows.length === 0) {
          return cb(null, false, {
            message: "User not found, Try sign up instead",
          });
        }
        const { password: hashedPassword } = response.rows[0];
        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) {
          return cb(null, false, { message: "Incorrect username or password" });
        }
        return cb(null, response.rows[0]);
      } catch (error) {
        console.log("Database Error", error);
        return cb(error)
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await connection.query("SELECT * FROM accounts WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return done(null, false, { message: 'User not found, please log in again.' });
      } else {
        return done(null, result.rows[0]);
      }
    } catch (err) {
      return done(err);
    }
  });
  
}
