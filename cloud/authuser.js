var authUser = function() { 
  return function(req, res, next) {
    // If the user is already logged in, there's nothing to do.
    if (Parse.User.current()) {
      return next();
    } else {
        var sessToken = req.cookies.POPRULER_COOKIE
        if(typeof sessToken == "undefined") {
            res.redirect("/?pleaselogin=1&path="+req.path);
        } else {
            Parse.User.become(sessToken);
            return next();
        }
    }
  };
};
module.exports = authUser;