const escaper= require('html-escaper');
/**
 * 
 * @param {*} data 
 */
function sanitize(data) {
    const iterate = (obj) => {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] !== 'object' && typeof obj[key] !== 'number' && typeof obj[key] !== 'boolean' && obj[key] !== null) {
                obj[key]=escaper.escape(obj[key]);
            }
            
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                iterate(obj[key]);
            }
        });
    };
    iterate(data);
}
exports.sanitize = sanitize;

