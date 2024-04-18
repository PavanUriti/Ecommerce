const userService = require('../services/user.service');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const userValidator = require('../validators/user.validator');
const bcrypt = require('bcryptjs');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

module.exports = {
    registration,
    login,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function registration(req, res, next) {
    try {
        const { userName, firstName, lastName, email, password, phone, role } = req.body;

        const { error } = userValidator.validateRegistration(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        // Check if the email is already registered
        if(email){
            const existingEmailUser = await userService.isEmailRegistered(email);
            if (existingEmailUser) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Email already registered.', '');
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            userName,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role,
        };

        const userId = await userService.updateRegistrationDetailsInDB(userData);

        const token = await userService.generateUserTokens(userId, role, email);

        return handleResponse(req, res, next, StatusCodes.OK, {'token': token}, `${role} registered successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during registration.', error.message));
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const { error } = userValidator.validateLoginUser(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const user = await userService.getUserByEmail(email);

        if (!user) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'User not found.', '');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid credentials.', '');
        }
        const token = await userService.generateUserTokens(user._id, user.role, email);

        return handleResponse(req, res, next, StatusCodes.OK, { token: token}, '', '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during login.', error.message));
    }
};
