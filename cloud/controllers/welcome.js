var _ = require('underscore');
var moment = require('moment');
// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
exports.index = function(req, res) {
  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
         
          var timejoinedobject = user.createdAt;
          var timejoined = moment(timejoinedobject).unix();
          var name = user.get('name');
          var accesstoken = user.get('fAccessToken');
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
            Parse.Promise.when([   //r# stands for result# (inputs into .then)
              Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken}), //r3
              Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r4
              Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r5
              Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r6
              Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
              Parse.Cloud.run("numberoftotaluservotestodecision", {"pUserID": pUserID}), //r8
              Parse.Cloud.run("userprofileinfo", {"pUserID": pUserID}), //r9
              Parse.Cloud.run("userphotos", {"pUserID": pUserID}), //r10
              Parse.Cloud.run("profilePicture", {"pageObjectID": pUserID, "pictureClass": "UserPictures", "pageType": "user"}), //r11
              Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID,  "pageType": "user"}), //r12
              Parse.Cloud.run("backgroundPicture", {"pageObjectID": pUserID, "pageType": "user"}) //r13
            ]).then(function(r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13) {
              var userprofileimage = r3 || r12[0]['thumbnailurl'] || null;
              var userpictureurls = r10 || [{"pictureid": "undefined", "pictureurl":"assets/representUserDefaultProfilePicture.png", "thumbnailurl":"assets/representUserDefaultProfilePicture.png"}];
              var userprofilepicture = r12[0]['thumbnailurl'] || "assets/representUserDefaultProfilePicture.png";
              var numuservotes = r4 || 0;
              var numadminactionitemsforspherejoiners = r5 || 0;
              var numadminactionitemsforspheremergers = r6 || 0;
              var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
              var numdecisions = r7 || 0;
              var userprofile = r9 || false;
              var totaluservotes = r8 || 0;
              if(userprofile !== false) {
              var userprofiledescription = userprofile.about || "";
              } else {
                userprofiledescription = "";
              }
              var userbackgroundpicture = r13[0]['backgroundpictureurl'] || "/assets/bg3.jpg";
              if(r13[0]['backgroundpictureurl'] == null){
                var userbackgroundpictureexists = false;
              } else {
                var userbackgroundpictureexists = true;
              }                             
              res.render('me/index', {
                puserid: pUserID,
                username: name,
                timeuserjoined: timejoined,
                userprofileimageurl: userprofileimage,
                numberofuserspheres: numuserspheres,
                numberofuservotescast: numuservotes,
                numberofdecisions: numdecisions,
                numberofadminactionitems: numadminactionitems,
                totaluservotes: totaluservotes,
                totaluserspherememberships: numuserspheres,
                userprofiledescription: userprofiledescription,
                userpictureurls: userpictureurls,
                userprofilepicture: userprofilepicture,
                userbackgroundpicture: userbackgroundpicture,
                userbackgroundpictureexists: userbackgroundpictureexists
              });
            });
          });
      },
      function(error) {
          res.redirect('/');
      });
    } else {
      // User not logged in, redirect to login form.
          res.redirect('/');
    }
};
exports.editprofile = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
           var fUserID = user.get("fUserID");
           var accesstoken = user.get("fAccessToken");
           var pUserID = user.id;
           var usersquery = new Parse.Query(Parse.User);
           usersquery.equalTo('objectId', pUserID);
           usersquery.first(function(userobject){
              userobject.set("name", req.body.newusername);
              userobject.save();
              res.redirect('/profile?success=changedname');
           });
       });
    }
};