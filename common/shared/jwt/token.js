
const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env["JWT_PRIVATE_KEY"];
const jwtPublicKey= process.env['JWT_PUBLIC_KEY'];
const jwtExpiry = parseInt(process.env["JWT_EXPIRY"]);


module.exports={
    getAccessToken,
    verifyToken
}

/**
 * 
 * @param {*} payload 
 * @param {*} secretKey 
 * @param {*} expiresIn 
 * @returns 
 */
async function signAccessToken(payload,secretKey,expiresIn) {

    return new Promise((resolve, reject)=> {
        const options = {
          expiresIn: expiresIn,
          audience: payload.userId,
          algorithm: 'RS256',
        };
    
        jwt.sign(payload, secretKey.replace(/\\n/g, '\n'), options, (err, token) => {
          if (err) {
            reject({isError: true, message: err});
          } else {
            resolve(token);
          }
        });
      });
}

/**
 * 
 * @param {*} payload 
 * @param {*} expiresIn 
 * @returns 
 */
async function getAccessToken(payload){
    return signAccessToken(payload,jwtSecretKey,jwtExpiry);
}

/**
 * 
 * @param {*} token 
 * @returns 
 */
async function verifyToken(token) {
    try {
      const payload = await jwt.verify(token, jwtPublicKey.replace(/\\n/g, '\n'));
      return payload;
    } catch (ex) {
      throw ex;
    }
}
