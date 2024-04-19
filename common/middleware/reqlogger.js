function requestLoggerMiddleware(req, res, next) {
    const startTime = new Date();
  
    res.on('finish', () => {
      const endTime = new Date();
      const elapsedTime = endTime - startTime;
  
      console.log(
        `${req.method} ${req.url} | Status: ${res.statusCode} | Time: ${elapsedTime}ms`
      );
    });
  
    next();
  }
  
module.exports = requestLoggerMiddleware;
  