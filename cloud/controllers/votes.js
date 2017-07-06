var _ = require('underscore');
var moment = require('moment');

// Display all posts.
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
  
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var accesstoken = user.get('fAccessToken');
          var name = user.get('name');
          Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
                Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
            ]).then(function(r1, r2){
              var memberbelongstospheres = r1 || 0;
              var memberisadminofspheres = r2 || [];
              Parse.Promise.when([                                  //r# stands for result# (inputs into .then)
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres,"fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("activeuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r4
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r5
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r6
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r7
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r8
              ]).then(function(r2, r3, r4, r5, r6, r7, r8) {
                var userprofileimage = r2 || r8[0]['thumbnailurl'] || null;
                var numuserspheres = memberbelongstospheres.length || 0;
                var numuservotes = r3 || 0;
                var numadminactionitemsforspherejoiners = r5 || 0;
                var numadminactionitemsforspheremergers = r7 || 0;
                var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                var numdecisions = r6 || 0;
                var activeuservotescast = r4 || [];
                res.render('votes/index', {
                  username: name,
                  userprofileimageurl: userprofileimage,
                  numberofuserspheres: numuserspheres,
                  numberofuservotescast: numuservotes,
                  numberofdecisions: numdecisions,
                  numberofadminactionitems: numadminactionitems,
                  activeuservotescast: activeuservotescast
                  });
                });
            });
          });
        } else {
          // User not logged in, redirect to login form.
          res.redirect('/');
        }
};
exports.takevoteback = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        var fUserID = user.get("fUserID");
        var VoteCast = Parse.Object.extend("Votes");
        var votecastquery = new Parse.Query(VoteCast);
        votecastquery.equalTo("objectId", req.body.voteObjectID);
        votecastquery.equalTo("pUserID", pUserID);
        votecastquery.first().then(function(votecastalready){
            if((typeof votecastalready == "undefined") || (votecastalready == "") || (votecastalready === null)) {
                res.redirect('/votes?votecast=0');
                return false;
            } else {
                 var electionObjectID = votecastalready.get("electionObjectID");
                 var numberOfVotesToDecrement = votecastalready.get("votes");
                 var Elections = Parse.Object.extend("Elections");
                 var electionsquery = new Parse.Query(Elections);
                 electionsquery.equalTo("objectId", electionObjectID);
                 electionsquery.first().then(function(election){
                     var electionenddate = election.get("endDate");
                     var electionenddateunix = moment(electionenddate).unix();
                     var now = new Date();
                     var nowunix = moment(now).unix();
                     if(nowunix >= electionenddateunix) {
                       res.redirect('/votes?error=electionended');
                       return false;
                     } else {
                         var decrementvotes = -(Math.abs(numberOfVotesToDecrement));
                         election.increment("votes", decrementvotes);
                         election.save(null, {
                           success: function(savedelection) {
                               var electionenddate = savedelection.get("endDate");
                               var electionenddateunix = moment(electionenddate).unix();
                               var now = new Date();
                               var nowunix = moment(now).unix();
                               if(nowunix < electionenddateunix) {
                                    var VoteCast = Parse.Object.extend("Votes");
                                    var votecastquery = new Parse.Query(VoteCast);
                                    votecastquery.equalTo("objectId", req.body.voteObjectID);
                                    votecastquery.equalTo("pUserID", pUserID);
                                    votecastquery.first().then(function(votecastobject){
                                        if((typeof votecastobject == 'undefined') || (votecastobject === null) || (votecastobject == '')) {
                                            res.redirect('/votes?error=novotecast');
                                            return false;
                                        } else {
                                            var nominationObjectID = votecastobject.get("nominationObjectID");
                                            var votesToRemoveFromNomination = votecastobject.get("votes");
                                            var Nominations = Parse.Object.extend("Nominations");
                                            var nominationsquery = new Parse.Query(Nominations);
                                            nominationsquery.equalTo('objectId', nominationObjectID);
                                            nominationsquery.first().then(function(nomobject){
                                                if((typeof nomobject == 'undefined') || (nomobject === null) || (nomobject == '')) {
                                                    res.redirect('/votes?error=nonomination');
                                                    return false;
                                                } else {
                                                    var decrementvotes = -(Math.abs(votesToRemoveFromNomination));
                                                    var decrementvoters = -(1);
                                                    nomobject.increment("votes", decrementvotes);
                                                    nomobject.increment("voters", decrementvoters);
                                                    nomobject.save(null, {
                                                      success: function(newnomobject) {
                                                        var renewedvotes = newnomobject.get("votes");
                                                        var renewedvoters = newnomobject.get("voters");
                                                        var renewedvotersdivided = (renewedvotes/renewedvoters);
                                                        var renewedavgeval = Math.floor(renewedvotersdivided) || null;
                                                        newnomobject.set("avgEvaluation", renewedavgeval);
                                                        newnomobject.save(null, {
                                                          success: function(renewedobject) {
                                                              var VoteCast = Parse.Object.extend("Votes");
                                                              var votecastquery = new Parse.Query(VoteCast);
                                                              votecastquery.equalTo("objectId", req.body.voteObjectID);
                                                              votecastquery.equalTo("pUserID", pUserID);
                                                              votecastquery.first().then(function(votecastobject){
                                                              votecastobject.destroy().then(function(){
                                                                    res.redirect('/votes?success=1');
                                                                    return true;
                                                                });
                                                              });
                                                          },
                                                          error: function(renewobjectsaved, error) {
                                                            console.log(error);
                                                            res.redirect('/votes?error=2');
                                                            return false;
                                                          }
                                                        });
                                                      }, 
                                                      error: function(renewobject, error){
                                                        console.log(error);
                                                        res.redirect('/votes?error=3');
                                                        return false;
                                                      }
                                                    });
                                                }
                                            }, function(error){
                                              console.log(error);
                                              return false;
                                            });
                                        }
                                    }, function(error){
                                      console.log(error);
                                      return false;
                                    });
                                }
                            }, 
                            error: function(savedelection, error){
                              console.log(error);
                              res.redirect('/votes?error=4');
                              return false;
                            }
                         });
                     }
                 });
            }
         }, function(error){
           console.log(error);
         });
      });
    }
};