var _ = require('underscore');
var moment = require('moment');

// Display all posts.
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        if((typeof user.id == "undefined") || (user.id == "")) {
          res.redirect("/?er=incorrectlogin");
        } else {
          var timejoinedobject = user.createdAt;
          var timejoined = moment(timejoinedobject).unix();
          var name = user.get('name');
          var accesstoken = user.get('fAccessToken') || "";
          var fUserID = user.get('fUserID') || "";
          var pUserID = user.id;
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}) //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
            Parse.Promise.when([   //r# stands for result# (inputs into .then)
              Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken}), //r3
              Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r4
              Parse.Cloud.run("returnElectionNotifications",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r5
              Parse.Cloud.run("returnNominationNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r6
              Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r7
              Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r8
              Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r9
              Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}) //r10
            ]).then(function(r3, r4, r5, r6, r7, r8, r9, r10) {
              function compare(a, b) {
                if(a.unixDate < b.unixDate){
                   return 1;
                 }
                else if(a.unixDate > b.unixDate) {
                  return -1;
                } else {
                  return 0;
                }
              }
              var userprofileimage = r3 || r10[0]['thumbnailurl'] || null;
              var numuservotes = r4 || 0;
              var electionnotifications = r5 || false;
              var nominationnotifications = r6 || false;
              var numdecisions = r9 || 0;
              var numadminactionitemsforspherejoiners = r7 || 0;
              var numadminactionitemsforspheremergers = r8 || 0;
              var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
              Parse.Promise.as().then(function(){
                var promise = Parse.Promise.as();
                var notificationsunsorted = new Array();
                promise = promise.then(function(){
                  if(electionnotifications !== false){
                    var promises1 = new Array();
                    _.each(electionnotifications, function(electionnotification){
                      var spheres = Parse.Object.extend("Spheres");
                      var spheresquery = new Parse.Query(spheres);
                      spheresquery.equalTo("objectId", electionnotification.sphereObjectID);
                      promises1.push(spheresquery.first().then(function(sphere){
                        var sphereName = sphere.get("sphereName");
                        notificationsunsorted.push({
                          "unixDate": electionnotification.unixDate,
                          "notificationType": "election",
                          "sphereName": sphereName,
                          "sphereObjectID": electionnotification.sphereObjectID,
                          "electionID": electionnotification.electionID,
                          "electionName": electionnotification.electionName,
                          "electionEndDateUnix": electionnotification.electionEndDateUnix
                        });
                      }));
                    });
                    return Parse.Promise.when(promises1);
                  } else {
                    return false;
                  }
                }).then(function(){
                  if(nominationnotifications !== false){
                    var promises2 = new Array();
                    _.each(nominationnotifications, function(nominationnotification){
                        var spheres = Parse.Object.extend("Spheres");
                        var spheresquery = new Parse.Query(spheres);
                        spheresquery.equalTo("objectId", nominationnotification.election.sphereObjectID);
                        promises2.push(spheresquery.first().then(function(sphere){
                          var promises3 = new Array();
                          var sphereName = sphere.get("sphereName");
                          var Elections = Parse.Object.extend("Elections");
                          var electionsquery = new Parse.Query(Elections);
                          electionsquery.equalTo("objectId", nominationnotification.election.electionObjectID);
                          promises3.push(electionsquery.first().then(function(election){
                            var electionEndDate = election.get("endDate");
                            var electionEndDateUnix = moment(electionEndDate).unix();
                            var electionName = election.get("electionName");
                            var nominations = nominationnotification.election.nominations;
                            if(nominations.length > 0){
                              _.each(nominations, function(nomination){
                                var nominationName = nomination.get("pageName");
                                var nominationObjectID = nomination.id;
                                var nominationCreatedAt = nomination.createdAt;
                                var nominationCreatedAtUnix = moment.unix(nominationCreatedAt);
                                var nominationObject = {"nominationName": nominationName, "id": nominationObjectID};
                                notificationsunsorted.push({
                                  "unixDate": nominationCreatedAtUnix,
                                  "notificationType": "nomination",
                                  "sphereObjectID": nominationnotification.election.sphereObjectID,
                                  "sphereName": sphereName,
                                  "electionID": nominationnotification.election.electionObjectID,
                                  "electionName": electionName,
                                  "electionEndDate": electionEndDate,
                                  "electionEndDateUnix": electionEndDateUnix,
                                  "nominationObject": nominationObject
                                });
                              });
                            } else {
                              return false;
                            }
                          }));
                        return Parse.Promise.when(promises3);
                        }));
                    });
                    return Parse.Promise.when(promises2);
                  } else {
                    return false;
                  }
              });
              return Parse.Promise.when(promise).then(function(){
                var notifications = notificationsunsorted.sort(compare);
                return notifications;
              });
              }).then(function(notifications){
                  res.render('notifications/index', {
                    username: name,
                    timeuserjoined: timejoined,
                    userprofileimageurl: userprofileimage,
                    numberofuserspheres: numuserspheres,
                    numberofuservotescast: numuservotes,
                    numberofdecisions: numdecisions,
                    notifications: notifications,
                    numberofadminactionitems: numadminactionitems
                  });
                });
              });
            });
          }
        }, function(error){
           res.redirect('/?er=incorrectlogin');
        });
  } else {
    // User not logged in, redirect to login form.
    res.redirect('/?er=incorrectlogin');
  }
};