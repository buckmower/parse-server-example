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
                       var sphereData = r2 || [];
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
                          Parse.Promise.when([
                            Parse.Cloud.run("aboutelection",{"electionObjectID": req.params.eid}), //r3
                          ]).then(function(r3) {
                           var electionData = r3 || [];
                           var electionName = electionData['electionName'];
                           var electionAdmin = electionData['electionAdmin'];
                           if(electionAdmin == fUserID) {
                               var isElectionAdmin = true;
                               var canedit = true;
                               return true;
                           } else {
                               var isElectionAdmin = false;
                               var canedit = false;
                               return false;
                           }
                          });
                       } else {
                            var canedit = true;
                            return true;
                       }
                  }).then(function(canedit){
                      if(canedit == false){
                          return false;
                      } else {
                          return true;
                      }
                  }).then(function(canedit){
                      if(canedit == false){
                          Parse.Promise.when([
                             Parse.Cloud.run("aboutnomination",{"nominationObjectID": req.params.nid}), //r4
                          ]).then(function(r4){
                               var nominationItem = r4 || [];
                               var nominationAdmin = nominationItem.fMemberID || "";
                               if(nominationAdmin == fUserID) {
                                   var canedit = true;
                                   return true;
                               } else {
                                   canedit = false;
                                   return false;
                               }
                          });
                      } else {
                          return true;
                      }
                  }).then(function(canedit){
                      if(canedit == false){
                        res.redirect("/sphere/"+req.params.id+"/election/"+req.params.eid+"/nomination/"+req.params.nid+"?error=notadmin");
                      } else {
                        var Pictures = Parse.Object.extend("Pictures");
                        var picturesquery = new Parse.Query(Pictures);
                        picturesquery.equalTo("objectId", pictureID);
                        picturesquery.first().then(function(picture){
                          picture.destroy();
                        }).then(function(){
                            var ProfilePictures = Parse.Object.extend("ProfilePictures");
                            var profilepicturesquery = new Parse.Query(ProfilePictures);
                            profilepicturesquery.equalTo("pageObjectID", req.params.nid);
                            profilepicturesquery.equalTo("pictureObjectID", pictureID);
                            profilepicturesquery.equalTo("pageType", "nomination");
                            profilepicturesquery.first().then(function(profilepicture){
                               if((typeof profilepicture == "undefined") || (profilepicture == "")){
                                    res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=pictureremoved');
                               } else {
                                   profilepicture.destroy().then(function(){
                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=pictureremoved');
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
          var fUserID = user.get("fUserID");
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
                          Parse.Promise.when([
                            Parse.Cloud.run("aboutelection",{"electionObjectID": req.params.eid}), //r3
                          ]).then(function(r3) {
                           var electionData = r3 || [];
                           var electionName = electionData['electionName'];
                           var electionAdmin = electionData['electionAdmin'];
                           if(electionAdmin == fUserID) {
                               var isElectionAdmin = true;
                               var canedit = true;
                               return true;
                           } else {
                               var isElectionAdmin = false;
                               var canedit = false;
                               return false;
                           }
                          });
                       } else {
                            var canedit = true;
                            return true;
                       }
                   }).then(function(canedit){
                      if(canedit == false){
                          return false;
                      } else {
                          return true;
                      }
                  }).then(function(canedit){
                      if(canedit == false){
                          Parse.Promise.when([
                             Parse.Cloud.run("aboutnomination",{"nominationObjectID": req.params.nid}), //r4
                          ]).then(function(r4){
                               var nominationItem = r4 || [];
                               var nominationAdmin = nominationItem.fMemberID || "";
                               if(nominationAdmin == fUserID) {
                                   var canedit = true;
                                   return true;
                               } else {
                                   canedit = false;
                                   return false;
                               }
                          });
                      } else {
                          return true;
                      }
                  }).then(function(canedit){
                      if(canedit == false){
                        res.redirect("/sphere/"+req.params.id+"/election/"+req.params.eid+"/nomination/"+req.params.nid+"?error=notadmin");
                      } else {
                        var ProfilePictures = Parse.Object.extend("ProfilePictures");
                        var profilepicturesquery = new Parse.Query(ProfilePictures);
                        profilepicturesquery.equalTo("pageObjectID", req.params.nid);
                        profilepicturesquery.equalTo("pageType", "nomination");
                        profilepicturesquery.find().then(function(pictures){
                          _.each(pictures, function(picture){
                              picture.destroy();
                          });
                        }).then(function(){
                           var ProfilePicture = new ProfilePictures();
                           ProfilePicture.set("pageObjectID", req.params.nid);
                           ProfilePicture.set("pageType", "nomination");
                           ProfilePicture.set("pictureObjectID", req.params.pid);
                           ProfilePicture.save();
                           res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=profileset');
                        });
                      }
                  });
               }
            });
          }
      });
    }
};