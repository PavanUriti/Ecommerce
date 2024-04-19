
const ClientError = require('../client-error');
const {StatusCodes} = require('http-status-codes');
const {unescape} = require('html-escaper');

const CONDITION_CONSTRAINTS =  'No records found. condition should be either equal | not equal |contains | startswith |endswith'

module.exports = {
    getRegExQuery,
    escapeRegExp,
    escapeSplChars,
}

/**
 * @param {*} filterObject
 * @return {object} query object with regex
*/
function getRegExQuery(filterObject) {
    const key = filterObject.key;
    const condition = filterObject.condition.toLowerCase();
    let values;

    if (typeof filterObject.value == 'string') {
        values = [filterObject.value];
    } else {
        values = filterObject.value.slice();
    }
    
    const query = {};
    let regexArray = [];

    values = values.map((value)=> escapeRegExp(value.replace(/\\,/g, ',')));
    values = values.map((value)=> unescape(value)); 

    switch (condition) {
    case 'startswith':
        regexArray = values.map((value) => new RegExp(`^${value}.*`, 'i'));
        break;

    case 'contains':
        regexArray = values.map((value) => new RegExp(`.*${value}.*`, 'i'));
        break;

    case 'endswith':
        regexArray = values.map((value) => new RegExp(`.*${value}$`, 'i'));
        break;

    case 'equal':
    case 'not equal':
        regexArray = values.map((value) => {
            if (value === '-') return null;
            return new RegExp(`^${value}$`, 'i');
        });
        break;

    default:
        throw new ClientError(StatusCodes.BAD_REQUEST, CONDITION_CONSTRAINTS);
    }

    if (condition == 'not equal') {
        query[key] = {'$nin': regexArray};
    } else {
        query[key] = {'$in': regexArray};
    }

    return query;
}


/**
 * 
 * @param {*} text 
 * @return {*} escape special characters for regex
 */
function escapeRegExp(text) {
    return text.replace(/[[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * 
 * @param {*} string 
 * @return {*} modified string
 */
function escapeSplChars(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}