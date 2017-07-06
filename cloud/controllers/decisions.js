var _ = require('underscore');
var moment = require('moment');

// Display all posts.
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        if((typeof user.id == "undefined") || (user.id == "")) {
          res.redirect("/home?loginerror");
        } else {
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
              Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken}), //r2
              Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
              Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r4
              Parse.Cloud.run("returnDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r5
              Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r6
              Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r7
            ]).then(function(r2, r3, r4, r5, r6, r7) {
              function compare(a,b) {
                if (a.electiondetails.electionEndDate < b.electiondetails.electionEndDate)
                   return 1;
                if (a.electiondetails.electionEndDate > b.electiondetails.electionEndDate)
                  return -1;
                return 0;
              }
              var userprofileimage = r2 || r7[0]['thumbnailurl'] || null;
              var numuservotes = r3 || 0;
              var numadminactionitemsforspherejoiners = r4 || 0;
              var numadminactionitemsforspheremergers = r6 || 0;
              var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
              var num
              var decisions = r5 || "";
              var decisionsarray = new Array();
              var promise = Parse.Promise.as();
              promise.then(function(){
                var promises = new Array();
              _.each(decisions, function(decision){
                var spheres = Parse.Object.extend("Spheres");
                var spheresquery = new Parse.Query(spheres);
                spheresquery.equalTo("objectId", decision.electiondetails.sphereObjectID);
                promises.push(spheresquery.first().then(function(sphere){
                  var sphereName = sphere.get("sphereName");
                  decisionsarray.push({
                    "spheredetails": {"sphereName": sphereName},
                    "electiondetails": decision.electiondetails,
                    "decisiondetails": decision.nominationdetails
                  });
                  return 1;
                }));
              });
              return Parse.Promise.when(promises).then(function(){
                return decisionsarray;
              });
              }).then(function(decisionsarray){
                var decisionnotifications = decisionsarray.sort(compare) || [];
                var numdecisions = decisionnotifications.length;
                res.render('decisions/index', {
                  username: name,
                  timeuserjoined: timejoined,
                  userprofileimageurl: userprofileimage,
                  numberofuserspheres: numuserspheres,
                  numberofuservotescast: numuservotes,
                  numberofdecisions: numdecisions,
                  decisions: decisionnotifications,
                  numberofadminactionitems: numadminactionitems,
                });
              });
            });
          });
        }
       }, function(error){
         res.redirect('/home?loginerror');
       });
  } else {
    // User not logged in, redirect to login form.
    res.redirect('/login');
  }
};