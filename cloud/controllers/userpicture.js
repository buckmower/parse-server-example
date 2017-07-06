var _ = require('underscore');
var moment = require('moment');
exports.index = function(req, res) {
    res.render('picture/index', {});
};
exports.remove = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
           var pUserID = user.id;
           var pictureID = req.params.pid;
           var UserPictures = Parse.Object.extend("UserPictures");
           var userpicturesquery = new Parse.Query(UserPictures);
           userpicturesquery.equalTo("objectId", pictureID);
           userpicturesquery.first().then(function(picture){
              return  picture.destroy();
           }).then(function(){
                var ProfilePictures = Parse.Object.extend("ProfilePictures");
                var profilepicturesquery = new Parse.Query(ProfilePictures);
                profilepicturesquery.equalTo("pageObjectID", pUserID);
                profilepicturesquery.equalTo("pictureObjectID", req.params.pid);
                profilepicturesquery.equalTo("pageType", "user");
                profilepicturesquery.first().then(function(profilepicture){
                   if((typeof profilepicture == "undefined") || (profilepicture == "")){
                        res.redirect('me?success=pictureremoved');
                   } else {
                       profilepicture.destroy().then(function(){
                            res.redirect('me?success=pictureremoved');
                       });
                   }
                });
           });
      });
    }
};
exports.makeprofile = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
           var pUserID = user.id;
           var pictureID = req.params.pid;
           var ProfilePictures = Parse.Object.extend("ProfilePictures");
           var profilepicturesquery = new Parse.Query(ProfilePictures);
           profilepicturesquery.equalTo("pageObjectID", pUserID);
           profilepicturesquery.equalTo("pageType", "user");
           profilepicturesquery.find().then(function(pictures){
              _.each(pictures, function(picture){
                  picture.destroy();
              });
           }).then(function(){
               var ProfilePicture = new ProfilePictures();
               ProfilePicture.set("pageObjectID", pUserID);
               ProfilePicture.set("pageType", "user");
               ProfilePicture.set("pictureObjectID", req.params.pid);
               ProfilePicture.save();
               res.redirect("/me");
           });
      });
    }
};