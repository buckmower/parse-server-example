var _ = require('underscore');
var moment = require('moment');

// Display all posts.
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        if((typeof user.id == "undefined") || (user.id == "")) {
          res.redirect("/?loginerror");
        } else {
          var timejoinedobject = user.createdAt;
          var timejoined = moment(timejoinedobject).unix();
          var name = user.get('name');
          var accesstoken = user.get('fAccessToken') || "undefined";
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
              Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken}), //r2
              Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
              Parse.Cloud.run("returnNominationNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r5
              Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
              Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
              Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r8
              Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r9
            ]).then(function(r2, r3, r5, r6, r7, r8, r9) {
              function compare(a,b) {
                if (a.unixDate < b.unixDate)
                   return 1;
                if (a.unixDate > b.unixDate)
                  return -1;
                return 0;
              }
              function compareEndDate(a,b) {
                if (a.electionEndDateUnix < b.electionEndDateUnix)
                   return 1;
                if (a.electionEndDateUnix > b.electionEndDateUnix)
                  return -1;
                return 0;
              }
              var userprofileimage = r2 || r9[0]['thumbnailurl'] || null;
              var numuservotes = r3 || 0;
              var nominationnotifications = r5 || [];
              var numadminactionitemsforspherejoiners = r6 || 0;
              var numadminactionitemsforspheremergers = r8 || 0;
              var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
              var numdecisions = r7 || 0;
              var notifications = nominationnotifications.sort(compareEndDate);
              res.render('profile/index', {
                username: name,
                timeuserjoined: timejoined,
                userprofileimageurl: userprofileimage,
                numberofuserspheres: numuserspheres,
                numberofuservotescast: numuservotes,
                numberofdecisions: numdecisions,
                notifications: notifications,
                numberofadminactionitems: numadminactionitems,
              });
          });
        });
      }
   }, function(error){
     res.redirect('/?loginerror');
   });
  } else {
    // User not logged in, redirect to login form.
    res.redirect('/login');
  }
};