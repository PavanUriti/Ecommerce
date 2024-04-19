class ClientError extends Error {    
    /**
   * 
   * @param {*} status 
   * @param {*} message 
   * @param {*} description 
   */
    constructor(status, message, description ='') {
        super(message);
        this.message = message;
        this.status = status;
        this.description = description;
    }
}

module.exports = ClientError;