var _ = require('underscore');
var moment = require('moment');
var Buffer = require('buffer').Buffer;

exports.index = function(req, res) {
    res.render('election/index', {});
};
exports.idofelection = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var sphereObjectID = req.params.id;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
            Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("aboutsphere",{"sphereID": req.params.id}), //r4
                Parse.Cloud.run("hello",{}), //r5
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r8
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r9
              ]).then(function(r2, r3, r4, r5, r6, r7, r8, r9){
                  var userprofileimage = r2 || r9[0]['thumbnailurl'] || null;
                  var numuservotes = r3 || 0;
                  var sphereData = r4[0] || [];
                  var poprulerApp = r5;
                  var numadminactionitemsforspherejoiners = r6 || 0;
                  var numadminactionitemsforspheremergers = r8 || 0;
                  var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                  var numdecisions = r7 || 0;
                  var appID = poprulerApp['appID'];
                  var appURL = poprulerApp['appURL'];
                  var sphereID = sphereData['sphereID'];
                  var sphereName = sphereData['sphereName'];
                  var sphereDescription = sphereData['sphereDescription'];
                  var sphereAdmins = sphereData['sphereAdmins'];
                  var sphereAdmin = _.find(sphereAdmins, function(num){ return num == pUserID; }); //returns true if is found in array
                  if(typeof sphereAdmin == "undefined") {
                      var isSphereAdmin = false;
                  } else {
                      var isSphereAdmin = true;
                  }
                  var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                  if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                      Parse.Promise.when([
                        Parse.Cloud.run("aboutelection",{"electionObjectID": req.params.eid}), //r8
                        Parse.Cloud.run("electionPhotos",{"electionObjectID": req.params.eid}), //r9
                        Parse.Cloud.run("profilePicture", {"pageObjectID": req.params.eid, "pictureClass": "ElectionPictures", "pageType": "election"}), //r10
                        Parse.Cloud.run("nominationsinelection",{"electionObjectID": req.params.eid}), //r11
                        Parse.Cloud.run("numberofnominationsallowedperuserinelection",{"electionObjectID": req.params.eid}), //r12
                        Parse.Cloud.run("usernominations",{"electionObjectID": req.params.eid, "pUserID": pUserID}), //r13
                        Parse.Cloud.run("backgroundPicture",{"pageObjectID": req.params.eid, "pageType": "election"}), //r14
                        Parse.Cloud.run("ismembercurrentwithsubscription", {"pUserID": pUserID, "sphereObjectID": sphereObjectID})
                      ]).then(function(r8, r9, r10, r11, r12, r13, r14, r15) {
                       var electionData = r8 || [];
                       var electionName = electionData['electionName'];
                       var electionAdmin = electionData['electionAdmin'];
                       if(electionAdmin == pUserID) {
                           var isElectionAdmin = true;
                       } else {
                           var isElectionAdmin = false;
                       }
                       var electionType = electionData['electionType'];
                       var voteOrEval = electionData['voteOrEval'];
                       var rangeDefinition = electionData['rangeDefinition'];
                       var electionDescription = electionData['electionDescription'];
                       var allowCommentsOnElection = electionData['commentsOnElectionAllowed'] || false;
                       if(allowCommentsOnElection){
                           var switchCommentsOnElectionAllowedChecked = "checked";
                       } else {
                           var switchCommentsOnElectionAllowedChecked = "";
                       }
                       var electionNomineeLimited = electionData['nomineeLimitedToMembers'] || false;
                       if(electionNomineeLimited){
                           var nomineelimtedchecked = "checked";
                       } else {
                           var nomineelimtedchecked = "";
                       }
                       var electionVotesAllowed = electionData['electionVotesAllowed'] || electionData['totalBudget'];
                       var votesCast = electionData['votesCast'];
                       var electionEndDateTime = electionData['endDate'];
                       var electionPhotos = r9 || [];
                       if(electionPhotos.length > 0) {
                           if(electionPhotos.length == 1) {
                              var electionProfilePicture = electionPhotos[0]['thumbnailurl'];
                           } else {
                              var electionProfilePicture = r10[0]['thumbnailurl'] || electionPhotos[0]['thumbnailurl'];
                           }
                       } else {
                            var electionProfilePicture = "";   
                       }
                       var nominationItems = r11 || [];
                       var numnominations = nominationItems.length;
                       var chunksofnominations = new Array();
                       var numberofchunks = Math.ceil(numnominations / 7);
                       var page = parseInt(req.query.pg) || 0;
                       for(var i=0; i < numberofchunks; i++) {
                            var firstitemofchunk = (i * 7);
                            chunksofnominations.push(nominationItems.slice(firstitemofchunk, (firstitemofchunk + 7)));
                       }
                       if(page < numberofchunks) {
                         var nextpage = page + 1;
                       } else {
                         var nextpage = page;
                       }
                       if(page > 0) {
                         var previousPage = page - 1;
                       } else {
                         var previouspage = 0;
                       }
                       if(page <= 0) {
                          var previousdisabled = "disabled";
                       } else {
                          var previousdisabled = "";
                       }
                       if((page + 1) >= numberofchunks) {
                         var nextdisabled = "disabled";
                       } else {
                         var nextdisabled = "";
                       }
                       var displayNominations = chunksofnominations[page];
                       var numberofnominationsallowedperuserinelection = r12;
                       var usernominations = r13 || [];
                       if(usernominations !== false) {
                           var userCastNomination = true;
                       } else {
                           userCastNomination = false;
                       }
                       var numberofusernominationsmade = r13.length || 0;
                       var numberofusernominationsleft = (numberofnominationsallowedperuserinelection - numberofusernominationsmade) || 0;
                       var electionbackgroundpicture = r14[0]['backgroundpictureurl'] || "../../../assets/bg3.jpg";
                       if(r14[0]['backgroundpictureurl'] == null){
                           var electionbackgroundpictureexists = false;
                       } else {
                           var electionbackgroundpictureexists = true;
                       }
                       var ismembercurrentwithsubscription = r15;
                               res.render('election/idofelection', {
                                   appid: appID,
                                   appurl: appURL,
                                   fuserid: fUserID,
                                   username: name,
                                   userprofileimageurl: userprofileimage,
                                   numberofuserspheres: numuserspheres,
                                   numberofuservotescast: numuservotes,
                                   numberofdecisions: numdecisions,
                                   numberofnominations: numnominations,
                                   numberofadminactionitems: numadminactionitems,
                                   numberofchunksofnominations: numberofchunks,
                                   nominationsinelection: displayNominations,
                                   currentpage: page,
                                   nextdisabled: nextdisabled,
                                   previousdisabled: previousdisabled,
                                   previouspage: previousPage,
                                   nextpage: nextpage,
                                   pagenumber: nextpage,
                                   sphereobjectid: sphereObjectID,
                                   sphereid: sphereID,
                                   spherename: sphereName,
                                   spheredescription: sphereDescription,
                                   sphereadmin: isSphereAdmin,
                                   electionobjectid: req.params.eid,
                                   electiondescription: electionDescription,
                                   commentsonelectionallowed: allowCommentsOnElection,
                                   switchcommentsonelectionallowedchecked: switchCommentsOnElectionAllowedChecked,
                                   electionname: electionName,
                                   nomineelimited: electionNomineeLimited,
                                   switchnomineelimitedchecked: nomineelimtedchecked,
                                   iselectionadmin: isElectionAdmin,
                                   electiontype: electionType,
                                   numberofnominationsallowedperuserinelection: numberofnominationsallowedperuserinelection,
                                   usernominations: usernominations,
                                   numberofusernominationsmade: numberofusernominationsmade,
                                   numberofusernominationsleft: numberofusernominationsleft,
                                   voteoreval: voteOrEval,
                                   votescast: votesCast,
                                   electionvotesallowed: electionVotesAllowed,
                                   rangedefinition: rangeDefinition,
                                   usercastnomination: userCastNomination,
                                   electionenddatetime: electionEndDateTime,
                                   electionpictures: electionPhotos,
                                   electionprofilepicture: electionProfilePicture,
                                   electionbackgroundpicture: electionbackgroundpicture,
                                   electionbackgroundpictureexists: electionbackgroundpictureexists,
                                   ismembercurrentwithsubscription: ismembercurrentwithsubscription
                               });
                      });
                    } else {
                        res.redirect("/sphere/"+sphereObjectID);
                    }
                });
            });
        });
    } else {
        res.redirect("/login");
    }
};
exports.edit = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
            var pUserID = user.id;
            Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
            ]).then(function(r1){
               var memberbelongstospheres = r1;
               var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
               if((typeof ismember == "undefined") || (ismember == "undefined")) {
                    res.redirect('sphere/'+req.params.id+'?error=notinsphere');
                    return false;
               } else {
               var Elections = Parse.Object.extend('Elections');
               var electionsquery = new Parse.Query(Elections);
               electionsquery.equalTo("objectId", req.params.eid);
               electionsquery.first().then(function(election){
                   if(election.get("pUserID") !== pUserID) {
                       res.redirect('sphere/'+req.params.id+'?error=notelectionadmin');
                   } else {
                       if((req.body.updatedElectionName == "") || (typeof req.body.updatedElectionName == "undefined") || (req.body.updatedElectionEndDateTime == "") || (typeof req.body.updatedElectionEndDateTime == "undefined")) {
                          res.redirect('sphere/'+req.params.id+'?error=missinginfo');
                       } else {
                            var votesallowed = parseInt(req.body.updatedElectionVotesAllowed, 10) || null;
                            var totalbudget = parseInt(req.body.updatedTotalBudget, 10) || null;
                            var rangedef = req.body.updatedRangeDefinition || null;
                            var voteoreval = req.body.updatedVoteOrEval || "vote";
                            var endDate = new Date(req.body.updatedElectionEndDateTime);
                            var electionType = req.body.updatedElectionType;
                            var nominationsallowed = parseInt(req.body.nominationsAllowed, 10);
                            var electionName = req.body.updatedElectionName;
                            if((req.body.nomineeLimitedToMembers == "true") || (req.body.nomineeLimitedToMembers == true)){
                              var nomineelimited = true;   
                            } else {
                              var nomineelimited = false;
                            }
                            if((req.body.allowCommentsOnElection == "true") || (req.body.allowCommentsOnElection == true)){
                                var allowElectionComments = true;   
                            } else {
                                var allowElectionComments = false;
                            }
                            var electionDescription = req.body.updatedElectionDescription;
                            election.set("electionVotesAllowed", votesallowed);
                            election.set("rangeDefinition", rangedef);
                            election.set("totalBudget", totalbudget);
                            election.set("voteOrEval", voteoreval);
                            election.set("electionType", electionType);
                            election.set("nominationsAllowed", nominationsallowed);
                            election.set("nomineeLimitedToMembers", nomineelimited);
                            election.set("electionName", electionName);
                            election.set("electionDescription", electionDescription);
                            election.set("commentsAllowed", allowElectionComments);
                            election.set("endDate", endDate);
                            election.save().then(function(){
                               res.redirect("/sphere/"+req.params.id+"/election/"+req.params.eid); 
                            });
                        }
                    }
                });
            }
         });
      });
    }
};
exports.nominatemember = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var fUserID = user.get("fUserID");
        var pUserID = user.id;
        var membernominated = req.params.puserid;
        var accesstoken = user.get("fAccessToken");
        Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
        ]).then(function(r1){
            var memberbelongstospheres = r1 || 0;
        	var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
            if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                return 1;
            } else {
                res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                return 0;
            }
        }).then(function(complete){
            if(complete !== 0) {
            var electionID = req.params.eid;
            var Elections = Parse.Object.extend('Elections');
            var electionsquery = new Parse.Query(Elections);
            electionsquery.equalTo("objectId", electionID);
            electionsquery.first().then(function(election){
                var electionType = election.get("electionType");
                if(electionType == "1per") {
                     var Nominations = Parse.Object.extend('Nominations');
                     var nominationsquery = new Parse.Query(Nominations);
                     nominationsquery.equalTo("electionID", req.params.eid);
                     nominationsquery.equalTo("pUserID", pUserID);
                     nominationsquery.first().then(function(usercastnomination){
                        if((typeof usercastnomination == "undefined") || (usercastnomination == "") || (usercastnomination === null)) {
                            return election;
                        } else {
                            return false;
                        }
                     });
                }
                if(electionType == "closed") {
                     var electionAdmin = election.get("pUserID");
                     if(electionAdmin == pUserID) {
                         return election;
                     } else {
                         return false;
                     }
                } else {
                    return election;
                }
                if(electionType == "custom"){
                    Parse.Promise.when([
                        Parse.Cloud.run("numberofnominationsallowedperuserinelection",{"electionObjectID": req.params.eid}), //r1
                        Parse.Cloud.run("usernominations",{"electionObjectID": req.params.eid, "pUserID": pUserID}), //r2
                    ]).then(function(r1, r2){
                        if((r1 - r2.length) <= 0){
                            return false;
                        } else {
                            return election;
                        }
                    });
                }
            }).then(function(election){
                if(election == false) {
                    res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?error=nominationsclosed');
                    return false;
                } else {
                    var SphereMembers = Parse.Object.extend("SphereMembers");
                    var spheremembersquery = new Parse.Query(SphereMembers);
                    spheremembersquery.equalTo("sphereObjectID", req.params.id);
                    spheremembersquery.equalTo("pUserID", membernominated);
                    spheremembersquery.first().then(function(spheremember){
                        if((typeof spheremember == "undefined") || (spheremember == "") || (spheremember == null)){
                                res.redirect("/sphere/"+req.params.id+"?error=pleasenominateamember");
                                return false;
                        } else {
                            var Nominations = Parse.Object.extend('Nominations');
                            var nominationsquery = new Parse.Query(Nominations);
                            nominationsquery.equalTo("sphereObjectID", req.params.id);
                            nominationsquery.equalTo("electionID", req.params.eid);
                            nominationsquery.equalTo("memberNominated", membernominated);
                            nominationsquery.first().then(function(memberwasnominated){
                                if((typeof memberwasnominated == "undefined") || (memberwasnominated == "") || (memberwasnominated == null)) {
                                        var Nominations = Parse.Object.extend('Nominations');
                                        var NominationObject = new Nominations();
                                        NominationObject.set("sphereObjectID", req.params.id);
                                        NominationObject.set("electionID", electionID);
                                        NominationObject.set("pageName", req.body.pageName);
                                        NominationObject.set("memberNominated", membernominated);
                                        NominationObject.set("nominationDescription", req.body.pageDescription);
                                        NominationObject.set("allowComments", false);
                                        NominationObject.set("fMemberID", fUserID);
                                        NominationObject.set("pUserID", pUserID);
                                        NominationObject.set("votes", 0);
                                        return NominationObject.save(null, {
                                          success: function(nomination) {
                                            // Execute any logic that should take place after the object is saved.
                                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?success=1');
                                          },
                                          error: function(nomination, error) {
                                            // Execute any logic that should take place if the save fails.
                                            // error is a Parse.Error with an error code and message.
                                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?error='+error.message);
                                          }
                                        });
                                    } else {
                                        res.redirect("sphere/"+req.params.id+'/election/'+req.params.eid+'?error=memberalreadynominated');
                                    }
                                });
                            }
                        });
                    }
                });
            }
         });
      });
    }
};
exports.createCustom = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var fUserID = user.get("fUserID");
        var pUserID = user.id;
        var accesstoken = user.get("fAccessToken");
        Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
        ]).then(function(r1){
            var memberbelongstospheres = r1 || 0;
        	var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
            if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                return 1;
            } else {
                res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                return 0;
            }
        }).then(function(complete){
            if(complete !== 0) {
            var electionID = req.params.eid;
            var Elections = Parse.Object.extend('Elections');
            var electionsquery = new Parse.Query(Elections);
            electionsquery.equalTo("objectId", electionID);
            electionsquery.first().then(function(election){
                var electionType = election.get("electionType");
                if(electionType == "1per") {
                     var Nominations = Parse.Object.extend('Nominations');
                     var nominationsquery = new Parse.Query(Nominations);
                     nominationsquery.equalTo("electionID", req.params.eid);
                     nominationsquery.equalTo("pUserID", pUserID);
                     nominationsquery.first().then(function(usercastnomination){
                        if((typeof usercastnomination == "undefined") || (usercastnomination == "") || (usercastnomination === null)) {
                            return election;
                        } else {
                            return false;
                        }
                     });
                }
                if(electionType == "closed") {
                     var electionAdmin = election.get("pUserID");
                     if(electionAdmin == pUserID) {
                         return election;
                     } else {
                         return false;
                     }
                } 
                if(electionType == "open"){
                    return election;
                }
                if(electionType == "custom"){
                    Parse.Promise.when([
                        Parse.Cloud.run("numberofnominationsallowedperuserinelection",{"electionObjectID": req.params.eid}), //r1
                        Parse.Cloud.run("usernominations",{"electionObjectID": req.params.eid, "pUserID": pUserID}), //r2
                    ]).then(function(r1, r2){
                        if((r1 - r2.length) <= 0){
                            return false;
                        } else {
                            return election;
                        }
                    });
                }
            }).then(function(election){
                if(election == false) {
                    res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?error=nominationsclosed');
                    return false;
                } else {
                    var Nominations = Parse.Object.extend('Nominations');
                    var NominationObject = new Nominations();
                    NominationObject.set("sphereObjectID", req.params.id);
                    NominationObject.set("electionID", electionID);
                    NominationObject.set("pageName", req.body.pageNameInput);
                    NominationObject.set("nominationDescription", req.body.pageDescriptionInput);
                    NominationObject.set("allowComments", false);
                    NominationObject.set("fMemberID", fUserID);
                    NominationObject.set("pUserID", pUserID);
                    NominationObject.set("votes", 0);
                    return NominationObject.save(null, {
                      success: function(nomination) {
                        // Execute any logic that should take place after the object is saved.
                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?success=1');
                      },
                      error: function(nomination, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?error='+error.message);
                      }
                    });
                    }
                });
            }
         });
      });
    }
};
exports.searchmemberstonominate = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var appAT = r1["appAT"];
            var page_name = req.body.sphere_member_name;
            var sphereObjectID = req.body.sphere_object_id;
            var electionObjectID = req.body.election_object_id;
            var accesstoken = user.get("fAccessToken");
            Parse.Promise.when([ 
                Parse.Cloud.run("spherememberslookup",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var fMemberID = sphereMember['fMember'] || "";
                    var memberpUserID = sphereMember['pUserID'] || "";
                    var name = sphereMember['name'] || "";
                    var description = sphereMember['description'] || "";
                    var pictureURL = sphereMember['pictureURL'] || "";
                    suggestions.push("<img src='"+pictureURL+"'><br><h4><a href='https://www.facebook.com/"+fMemberID+"' target='_blank'>"+name+"</a></h4><br><form method='POST' action='/sphere/"+sphereObjectID+"/election/"+electionObjectID+"/nominatemember/"+memberpUserID+"'><input type='hidden' name='pageName' value='"+name+"'><input type='hidden' name='pageDescription' value='"+description+"'><input type='submit' class='btn btn-sm btn-primary' value='Add As Nominee'></form>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.search = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        var accesstoken = user.get("fAccessToken");
        var page_name = req.body.like_name;
        Parse.Promise.when([ 
            Parse.Cloud.run("nominationobjects",{"accesstoken": accesstoken, "pagename": page_name},{}) //r1
        ]).then(function(r1){
            var nominationObject = r1 || [];
            if((typeof nominationObject !== undefined) && (nominationObject !== "") && (nominationObject !== null)) {
            var objectID = nominationObject['fPageID'];
            var pageObjectID = nominationObject['pageObjectID'];
            var fPagePicture = nominationObject['pictureURL'];
            var objectName = nominationObject['pageName'];
            var pageDescription = nominationObject['pageDescription'];
            res.send("<input type='hidden' name='pageID' value='"+objectID+"'"+"><input type='hidden' name='pageObjectID' value='"+pageObjectID+"'"+"><input type='hidden' name='pageDescription' value='"+pageDescription+"'"+"><div class='media' style='padding: 10px 10px; display: inline-block; text-align: center;'><img src='"+fPagePicture+"' alt='"+objectName+"'"+">"+"<div class='media-body'><h4 class='media-heading'>"+objectName+"</h4></div></div><input type='hidden' name='pageName' value='"+objectName+"'"+">");
            }
        });
    });
};