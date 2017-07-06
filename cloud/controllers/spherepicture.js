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
           if(pictureID == 0) {
                res.redirect('sphere/'+req.params.id+'?error=cantdeletethisone');
           } else {
               Parse.Promise.when([
                    Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
               ]).then(function(r1){
                   var memberbelongstospheres = r1 || 0;
                   var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                   if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                       return 1;
                   } else {
                       res.redirect('/spheres/');
                       return 0;
                   }
               }).then(function(complete){
               if(complete !== 1) {
                   return 0;
               } else {
                   Parse.Promise.when([
                    Parse.Cloud.run("aboutsphere",{"sphereID": req.params.id}), //r2
                   ]).then(function(r2){
                       var sphereData = r2[0] || [];
                       var sphereadmins = sphereData['sphereAdmins'];
                       var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                       if(typeof isAdminCheck !== "undefined") {
                          var isAdmin = true;
                       } else {
                          var isAdmin = false;
                       }
                       return isAdmin;
                   }).then(function(isAdmin){
                       if(isAdmin == false){
                           res.redirect('sphere/'+req.params.id+'?error=notadmin');
                           return false;
                       } else {
                           var SpherePictures = Parse.Object.extend("SpherePictures");
                           var spherepicturesquery = new Parse.Query(SpherePictures);
                           spherepicturesquery.equalTo("objectId", pictureID);
                           spherepicturesquery.first().then(function(picture){
                              return  picture.destroy();
                           }).then(function(){
                                var ProfilePictures = Parse.Object.extend("ProfilePictures");
                                var profilepicturesquery = new Parse.Query(ProfilePictures);
                                profilepicturesquery.equalTo("pageObjectID", req.params.id);
                                profilepicturesquery.equalTo("pictureObjectID", req.params.pid);
                                profilepicturesquery.equalTo("pageType", "sphere");
                                profilepicturesquery.first().then(function(profilepicture){
                                   if((typeof profilepicture == "undefined") || (profilepicture == "")){
                                        res.redirect('sphere/'+req.params.id+'?success=pictureremoved');
                                   } else {
                                       profilepicture.destroy().then(function(){
                                            res.redirect('sphere/'+req.params.id+'?success=pictureremoved');
                                       });
                                   }
                                });
                           });
                       }
                   });
               }
            });
          }
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
           if(pictureID == 0) {
                res.redirect('sphere/'+req.params.id+'?error=cantdeletethisone');
           } else {
               Parse.Promise.when([
                    Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
               ]).then(function(r1){
                   var memberbelongstospheres = r1 || 0;
                   var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                   if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                       return 1;
                   } else {
                       res.redirect('/spheres/');
                       return 0;
                   }
               }).then(function(complete){
               if(complete !== 1) {
                   return 0;
               } else {
                   Parse.Promise.when([
                    Parse.Cloud.run("aboutsphere",{"sphereID": req.params.id}), //r2
                   ]).then(function(r2){
                       var sphereData = r2[0] || [];
                       var sphereadmins = sphereData['sphereAdmins'];
                       var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                       if((typeof isAdminCheck == "undefined") || (isAdminCheck == "") || (isAdminCheck == null)) {
                          var isAdmin = false;
                       } else {
                          var isAdmin = true;
                       }
                       return isAdmin;
                   }).then(function(isAdmin){
                       if(!isAdmin){
                           res.redirect('sphere/'+req.params.id+'?error=notadmin');
                           return false;
                       } else {
                           var ProfilePictures = Parse.Object.extend("ProfilePictures");
                           var profilepicturesquery = new Parse.Query(ProfilePictures);
                           profilepicturesquery.equalTo("pageObjectID", req.params.id);
                           profilepicturesquery.equalTo("pageType", "sphere");
                           profilepicturesquery.find().then(function(pictures){
                              _.each(pictures, function(picture){
                                  picture.destroy();
                              });
                           }).then(function(){
                               var ProfilePicture = new ProfilePictures();
                               ProfilePicture.set("pageObjectID", req.params.id);
                               ProfilePicture.set("pageType", "sphere");
                               ProfilePicture.set("pictureObjectID", req.params.pid);
                               ProfilePicture.save();
                               res.redirect("/sphere/"+req.params.id);
                           });
                       }
                   });
               }
            });
          }
      });
    }
};