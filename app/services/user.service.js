const User = require('../models/user.model');
const {generateRandomUUID} = require('../../shared/utils/uuid');
const tokenService = require('../../shared/jwt/token');
const moment = require('moment');

module.exports = {
    isEmailRegistered,
    updateRegistrationDetailsInDB,
    generateUserTokens,
    getUserByEmail,
  };

async function isEmailRegistered(email) {
  const existingEmailUser = await User.findOne({ email });
  return !!existingEmailUser; 
}

async function updateRegistrationDetailsInDB(userData) {
    try {
      const newUser = await User.create(userData);
      return newUser._id;
    } catch (error) {
      throw new Error(`Error updating registration details in the database: ${error.message}`);
    }
}

/**
 * 
 * @param {*} userId 
 * @param {*} role 
 * @param {*} email 
 */
async function generateUserTokens(userId, role, email) {
    const accessToken = await getAccessToken(`${userId}`, role, email);

    return {
        'accessToken': accessToken.token,
        'accessTokenExpiryTime': accessToken.expiry,
        'role': role,
    };
}

/**
 * 
 * @param {*} userId 
 * @param {*} role 
 * @param {*} email 
 */
async function getAccessToken(userId, role, email) {
    const accessTokenJTI = generateRandomUUID();
    const payload = getJWTPayload(userId, role, accessTokenJTI, email);
    const accessToken = await tokenService.getAccessToken(payload);
    return {'token': accessToken, 'expiry': moment().unix() + parseInt(process.env['JWT_EXPIRY'])};
}

/**
 * 
 * @param {*} userId 
 * @param {*} role 
 * @param {*} jti 
 * @returns 
 */
function getJWTPayload(userId, role, jti, email) {
    return {
        'userId': userId,
        'role': role,
        'jti': jti,
        'email': email
    };
}

/**
 * 
 * @param {*} email 
 * @returns 
 */
async function getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error fetching user by email from the database: ${error.message}`);
    }
}