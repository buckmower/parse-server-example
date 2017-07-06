var popJoinX = function() {
  return function(req, res, next) {
      // If the user is already logged in, there's nothing to do.
      if(Parse.User.current()) {
        return next();
      } else {
        res.redirect("/public"+req.path);
      }
  };
};
module.exports = popJoinX;