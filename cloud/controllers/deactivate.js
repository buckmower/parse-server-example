var _ = require('underscore');
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
          // We need to fetch because we need to show fields on the user object.
        Parse.User.current().fetch().then(function(user) {
            res.redirect("/logout");
        });
    }
};