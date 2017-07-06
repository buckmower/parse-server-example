var _ = require('underscore');
var moment = require('moment');
exports.index = function(req, res) {
    res.render('picture/index', {});
};
exports.removespherebackgroundpicture = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
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
                           var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
                           var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
                           backgroundpicturesquery.equalTo("pageObjectID", req.body.pageObjectID);
                           backgroundpicturesquery.equalTo("pageType", req.body.pageType);
                           backgroundpicturesquery.first().then(function(picture){
                              picture.destroy();
                              res.redirect("/sphere/"+req.params.id);
                              return true;
                           });
                       }
                   });
               }
            });
      });
    }
};
exports.removeelectionbackgroundpicture = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
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
                    Parse.Cloud.run("aboutelection",{"electionObjectID": req.params.eid}), //r3
                   ]).then(function(r2, r3){
                       var sphereData = r2[0] || [];
                       var sphereadmins = sphereData['sphereAdmins'];
                       var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                       if(typeof isAdminCheck !== "undefined") {
                          var isAdmin = true;
                       } else {
                          var isAdmin = false;
                       }
                       if(r3['electionAdmin'] == pUserID){
                           var isElectionAdmin = true;
                       } else {
                           var isElectionAdmin = false;
                       }
                       return [{"sphereAdmin":isAdmin, "electionAdmin": isElectionAdmin}];
                   }).then(function(isAdmin){
                       if((isAdmin["sphereAdmin"] == false) && (isAdmin["electionAdmin"] == false)){
                           res.redirect('sphere/'+req.params.id+'?error=notadmin');
                           return false;
                       } else {
                           var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
                           var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
                           backgroundpicturesquery.equalTo("pageObjectID", req.body.pageObjectID);
                           backgroundpicturesquery.equalTo("pageType", req.body.pageType);
                           backgroundpicturesquery.first().then(function(picture){
                              picture.destroy();
                              res.redirect("/sphere/"+req.params.id+"/election/"+req.params.eid);
                              return true;
                           });
                       }
                   });
               }
            });
      });
    }
};
exports.removenominationbackgroundpicture = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
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
                    Parse.Cloud.run("aboutelection",{"electionObjectID": req.params.eid}), //r3
                    Parse.Cloud.run("aboutnomination",{"nominationObjectID": req.params.nid}), //r3
                   ]).then(function(r2, r3, r4){
                       var sphereData = r2[0] || [];
                       var sphereadmins = sphereData['sphereAdmins'];
                       var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                       if(typeof isAdminCheck !== "undefined") {
                          var isAdmin = true;
                       } else {
                          var isAdmin = false;
                       }
                       if(r3['electionAdmin'] == pUserID){
                           var isElectionAdmin = true;
                       } else {
                           var isElectionAdmin = false;
                       }
                       if(r4['pUserID'] == pUserID){
                           var isNominationAdmin = true;
                       } else {
                           var isNominationAdmin = false;
                       }
                       return [{"sphereAdmin":isAdmin, "electionAdmin": isElectionAdmin, "nominationAdmin": isNominationAdmin}];
                   }).then(function(isAdmin){
                       if((isAdmin["sphereAdmin"] == false) && (isAdmin["electionAdmin"] == false) && (isAdmin["nominationAdmin"] == false)){
                           res.redirect('sphere/'+req.params.id+'?error=notadmin');
                           return false;
                       } else {
                           var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
                           var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
                           backgroundpicturesquery.equalTo("pageObjectID", req.body.pageObjectID);
                           backgroundpicturesquery.equalTo("pageType", req.body.pageType);
                           backgroundpicturesquery.first().then(function(picture){
                              picture.destroy();
                              res.redirect("/sphere/"+req.params.id+"/election/"+req.params.eid+"/nomination/"+req.params.nid);
                              return true;
                           });
                       }
                   });
               }
            });
      });
    }
};
exports.removeuserbackgroundpicture = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
       var pUserID = user.id;
       var BackgroundPictures = Parse.Object.extend("BackgroundPictures");
       var backgroundpicturesquery = new Parse.Query(BackgroundPictures);
       backgroundpicturesquery.equalTo("pageObjectID", pUserID);
       backgroundpicturesquery.equalTo("pageType", "user");
       backgroundpicturesquery.first().then(function(picture){
          picture.destroy();
          res.redirect("/profile");
          return true;
       });
      });
    }
};