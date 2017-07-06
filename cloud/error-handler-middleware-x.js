var errorHandlerMiddlewareX = function() {
	return function(err, req, res, next) {
	  if((req.query.er !== null) && (req.query.er !== "")){
	  	res.redirect(req.path+"?message="+req.query.er);
	  	return false;
	  } else {
	  	return next();
	  }
	};
};
module.exports = errorHandlerMiddlewareX;