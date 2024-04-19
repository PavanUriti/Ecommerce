const jwtService = require('../shared/jwt/token');
const ClientError = require('../shared/client-error');
const ServerError = require('../shared/server-error');
const CONSTANTS = require('../shared/constants');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function validateToken(req, res, next) {
  try {
      let authenticateRoute = false;
      let authToken = req.header(CONSTANTS.X_AUTH_TOKEN);

      const routePath = req.url;

      if (routePath === '/') {
        authenticateRoute = false;
      } else if (routePath.includes('/favicon.ico') || routePath.includes('/login') || routePath.includes('/register')) {
          authenticateRoute = false;
      } else {
          if (!authToken) {
              throw new ClientError(400, 'Token is Missing');
          }
          authenticateRoute = true;
      }

      if (authenticateRoute) {
          // Validate Token & Authenticate token
          const token = await jwtService.verifyToken(authToken);

          req.user = {
              userId: token.userId,
              role: token.role,
              token: token.jti,
              email: token.email
          };
      }
      next();
  } catch (ex) {
      if (ex instanceof ClientError) {
        return next(ex);
      }
      next(new ServerError(401, 'UnAuthorized', ex.message));
  }
};


module.exports = validateToken;