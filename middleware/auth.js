"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

// Mark Notes: By using the Authorization header, web applications can implement various authentication mechanisms and enforce access control based on the provided credentials. JWTs, in particular, are a popular choice for authentication and are often transmitted in the Authorization header using the "Bearer" type.

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log(res.locals.user);
      // { username: 'newtest', isAdmin: false, iat: 1687742634 }
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || res.locals.user.isAdmin === false) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureUserorAdmin(req, res, next) {
  try {
  if(!res.locals.user || (res.locals.user.isAdmin === false && res.locals.user.username !== req.params.username)) throw new UnauthorizedError(); 
  return next();
  } catch (err) {    
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserorAdmin
};
