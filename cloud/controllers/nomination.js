var _ = require('underscore');
var moment = require('moment');
exports.index = function(req, res) {
    res.render('nomination/index', {});
};
exports.idofnomination = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var sphereObjectID = req.params.id;
          var electionObjectID = req.params.eid;
          var nominationObjectID = req.params.nid;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
                Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}) //r2
            ]).then(function(r1, r2){
              var memberbelongstospheres = r1 || 0;
              var memberisadminofspheres = r2 || [];
              var numuserspheres = memberbelongstospheres.length || 0;
                  Parse.Promise.when([ 
                    Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken}), //r1
                    Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r2
                    Parse.Cloud.run("aboutsphere",{"sphereID": sphereObjectID}), //r3
                    Parse.Cloud.run("aboutelection",{"electionObjectID": electionObjectID}), //r4
                    Parse.Cloud.run("aboutnomination",{"nominationObjectID": nominationObjectID, "accesstoken": accesstoken}), //r5
                    Parse.Cloud.run("usercastvotefornomination",{"sphereObjectID": sphereObjectID, "electionObjectID": electionObjectID, "pUserID": pUserID, "nominationObjectID": nominationObjectID}), //r6
                    Parse.Cloud.run("nominationPhotos",{"nominationObjectID": nominationObjectID}), //r7
                    Parse.Cloud.run("hello",{}), //r8
                    Parse.Cloud.run("totaluservotescastinelection", {"sphereObjectID": sphereObjectID, "electionObjectID": electionObjectID, "pUserID": pUserID}), //r9
                    Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r10
                    Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r11
                    Parse.Cloud.run("numberofindividualswhoevaluatednomination", {"nominationObjectID": nominationObjectID }), //r12
                    Parse.Cloud.run("uservotescastinelection", {"sphereObjectID": sphereObjectID, "electionObjectID": electionObjectID, "pUserID": pUserID}), //r13
                    Parse.Cloud.run("profilePicture", {"pageObjectID": req.params.nid, "pictureClass": "Pictures", "pageType": "nomination"}), //r14
                    Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r15
                    Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r16
                    Parse.Cloud.run("nominationvoterecord", {"nominationObjectID": nominationObjectID, "electionObjectID": electionObjectID, "sphereObjectID": sphereObjectID}), //r17
                    Parse.Cloud.run("backgroundPicture",{"pageObjectID": req.params.nid, "pageType": "nomination"}), //r18
                    Parse.Cloud.run("ismembercurrentwithsubscription", {"pUserID": pUserID, "sphereObjectID": sphereObjectID}) //r19
                  ]).then(function(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19) {
                       var userprofileimage = r1 || r16[0]['thumbnailurl'] || null;
                       var numuservotes = r2 || 0;
                       var numadminactionitemsforspherejoiners = r10 || 0;
                       var numadminactionitemsforspheremergers = r15 || 0;
                       var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                       var numdecisions = r11 || 0;
                       var numofindividualevaluators = r12 || 0;
                       var sphereData = r3[0] || 0;
                       var sphereID = sphereData['sphereID'];
                       var sphereName = sphereData['sphereName'];
                       var sphereDescription = sphereData['sphereDescription'];
                       var sphereAdmins = sphereData['sphereAdmins'];
                       var sphereAdmin = _.find(sphereAdmins, function(num){ return num == pUserID; }); //returns true if is found in array
                       if(typeof sphereAdmin == "undefined"){
                           var isSphereAdmin = false;
                       } else {
                           var isSphereAdmin = true;
                       }
                       var electionData = r4 || [];
                       var electionName = electionData['electionName'];
                       var electionDescription = electionData['electionDescription'];
                       var electionEndDateTimeArray = electionData['endDate'];
                       var electionType = electionData['electionType'];
                       var voteOrEval = electionData['voteOrEval'];
                       var rangeDefinition = electionData['rangeDefinition'];
                       if(rangeDefinition == "zerototen") {
                           var evalmaximum = 10;
                       } else if(rangeDefinition == "zerotohundred") {
                           var evalmaximum = 100;
                       }
                       var electionVotesAllowed = electionData['electionVotesAllowed'] || electionData['totalBudget'];
                       var electionAdmin = electionData['electionAdmin'];
                       var electionEndDateTime = electionData['endDate'];
                       var nominationItem = r5 || [];
                       var nominationPageObjectID = nominationItem.pageObjectID || "";
                       var nominationName = nominationItem.pageName || "";
                       var nominationDescription = nominationItem.nominationDescription || "";
                       var allowCommentsOnNomination = nominationItem.commentsOnNominationAllowed || false;
                       if(allowCommentsOnNomination){
                           var switchCommentsOnNominationAllowedChecked = "checked";
                       } else {
                           var switchCommentsOnNominationAllowedChecked = "";
                       }
                       var nominationAdmin = nominationItem.pUserID || "";
                       var votesfornomination = nominationItem.votes || 0;
                       var voteAlreadyCast = r6['status'];
                       var currentNominationVotedForName = r6['pageName'];
                       var currentNominationVotedForID = r6['nominationObjectID'];
                       var votesAlreadyCast = r6['votesAlreadyCast'];
                       var voteObjectID = r6['voteObjectID'] || 0;
                       var nominationPhotos = r7 || [];
                       if(nominationPhotos.length > 0) {
                           if(nominationPhotos.length == 1) {
                              var nominationProfilePicture = nominationPhotos[0]['thumbnailurl'];
                           } else {
                              var nominationProfilePicture = r14[0]['thumbnailurl'] || nominationPhotos[0]['thumbnailurl'];
                           }
                       } else {
                            var nominationProfilePicture = "";   
                       }
                       var poprulerApp = r8;
                       var totalUserVotesCastInElection = r9 || 0;
                       var recordofuservotescastinelection = r13 || [];
                       var nominationvoterecord = r17 || [];
                       var nominationbackgroundpicture = r18[0]['backgroundpictureurl'] || "../../../../../assets/bg3.jpg";
                       var ismembercurrentwithsubscription = r19;
                       if(r18[0]['backgroundpictureurl'] == null){
                           var nominationbackgroundpictureexists = false;
                       } else {
                           var nominationbackgroundpictureexists = true;
                       }
                       var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                       if((typeof ismember == "undefined") && (ismember == "undefined")) {
                            res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                            return false;
                        } else {
                               res.render('nomination/idofnomination', {
                                 appid: poprulerApp.appID,
                                 appurl: poprulerApp.appURL,
                                 puserid: pUserID,
                                 fuserid: fUserID,
                                 username: name,
                                 userprofileimageurl: userprofileimage,
                                 numberofuserspheres: numuserspheres,
                                 numberofuservotescast: numuservotes,
                                 numberofdecisions: numdecisions,
                                 numberofadminactionitems: numadminactionitems,
                                 numofindividualevaluators: numofindividualevaluators,
                                 nominationsinelection: nominationItem,
                                 sphereobjectid: sphereObjectID,
                                 sphereadmin: isSphereAdmin,
                                 sphereid: sphereID,
                                 spherename: sphereName,
                                 spheredescription: sphereDescription,
                                 electionobjectid: electionObjectID,
                                 electiontype: electionType,
                                 voteoreval: voteOrEval,
                                 rangedefinition: rangeDefinition,
                                 evalmaximum: evalmaximum,
                                 electionvotesallowed: electionVotesAllowed,
                                 electionadmin: electionAdmin,
                                 electiondescription: electionDescription,
                                 electionname: electionName,
                                 electionenddatetime: electionEndDateTime,
                                 nominationobjectid: nominationObjectID,
                                 nominationpageobjectid: nominationPageObjectID,
                                 nominationname: nominationName,
                                 nominationdescription: nominationDescription,
                                 commentsonnominationallowed: allowCommentsOnNomination,
                                 switchcommentsonnominationallowedchecked: switchCommentsOnNominationAllowedChecked,
                                 nominationbackgroundpicture: nominationbackgroundpicture,
                                 nominationpictures: nominationPhotos,
                                 nominationprofilepicture: nominationProfilePicture,
                                 nominationbackgroundpictureexists: nominationbackgroundpictureexists,
                                 nominationadmin: nominationAdmin,
                                 nominationvoterecord: nominationvoterecord,
                                 votes: votesfornomination,
                                 votealreadycast: voteAlreadyCast,
                                 voteobjectid: voteObjectID,
                                 currentnominationvotedforname: currentNominationVotedForName,
                                 currentnominationvotedforid: currentNominationVotedForID,
                                 votesalreadycast: votesAlreadyCast,
                                 totaluservotescastinelection: totalUserVotesCastInElection,
                                 recordofuservotescastinelection: recordofuservotescastinelection,
                                 ismembercurrentwithsubscription: ismembercurrentwithsubscription
                           });
                        }
                    });
            });
        });
    }
};
exports.editnomination = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
           var fUserID = user.get("fUserID");
           var accesstoken = user.get("fAccessToken");
           var pUserID = user.id;
           Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
            ]).then(function(r1){
                var memberbelongstospheres = r1 || 0;
            	var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                    return memberbelongstospheres;
                } else {
                    res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                    return undefined;
                }
           }).then(function(memberbelongstospheres){
               if(memberbelongstospheres !== undefined) {
                   var Elections = Parse.Object.extend("Elections");
                   var electionsquery = new Parse.Query(Elections);
                   electionsquery.equalTo("objectId", req.params.eid);
                   electionsquery.first().then(function(election){
                       var electionenddate = election.get("endDate");
                       var now = new Date();
                       if(now > electionenddate) {
                           res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=electionisover');
                           return 0;
                       } else {
                           return election;
                       }
                   }).then(function(election){
                        var electionType = election.get("electionType");
                        var electionAdmin = election.get("fMemberID");
                        if(electionType == "closed") {
                            if(electionAdmin !== fUserID) {
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=not-election-admin-in-closed-election');
                                return 0;
                            } else {
                                var Nominations = Parse.Object.extend('Nominations');
                                var nominationquery = new Parse.Query(Nominations);
                                nominationquery.equalTo('objectId', req.params.nid);
                                nominationquery.first(function(nominationobject){
                                    var votesfornominationobject = nominationobject.get("votes");
                                    if(req.body.nominationName !== nominationobject.get("pageName")) {
                                        nominationobject.set("pageName", req.body.nominationName);
                                    }
                                    nominationobject.set("nominationDescription", req.body.nominationDescription);
                                    nominationobject.save();
                                    res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=1');
                                });
                            }
                        } else {
                            var Nominations = Parse.Object.extend('Nominations');
                            var nominationquery = new Parse.Query(Nominations);
                            nominationquery.equalTo('objectId', req.params.nid);
                            nominationquery.first(function(nominationobject){
                                var votesfornominationobject = nominationobject.get("votes");
                                if(req.body.nominationName !== nominationobject.get("pageName")) {
                                    nominationobject.set("pageName", req.body.nominationName);
                                }
                                if((req.body.switchcommentsonnominationallowedinput == "on") || (req.body.switchcommentsonnominationallowedinput == "true") || (req.body.switchcommentsonnominationallowedinput == true)){
                                    var allowComments = true;   
                                } else {
                                    var allowComments = false;
                                }
                                nominationobject.set("nominationDescription", req.body.nominationDescription);
                                nominationobject.set("allowComments", allowComments);
                                nominationobject.save();
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=1');
                            });
                        }
                   });
                }
           });
       });
    }
};
exports.deletenomination = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
           var fUserID = user.get("fUserID");
           var accesstoken = user.get("fAccessToken");
           var pUserID = user.id;
           Parse.Promise.when([
                Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}),
            ]).then(function(r1){
                var memberbelongstospheres = r1 || 0;
            	var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.id; });
                if((typeof ismember !== "undefined") && (ismember !== "undefined")) {
                    return memberbelongstospheres;
                } else {
                    res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                    return undefined;
                }
           }).then(function(memberbelongstospheres){
               if(memberbelongstospheres !== undefined) {
                   var Elections = Parse.Object.extend("Elections");
                   var electionsquery = new Parse.Query(Elections);
                   electionsquery.equalTo("objectId", req.params.eid);
                   electionsquery.first().then(function(election){
                       var electionenddate = election.get("endDate");
                       var now = new Date();
                       if(now > electionenddate) {
                           res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=electionisover');
                           return 0;
                       } else {
                           return election;
                       }
                   }).then(function(election){
                        var electionType = election.get("electionType");
                        var electionAdmin = election.get("fMemberID");
                        if(electionType == "closed") {
                            if(electionAdmin !== fUserID) {
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=not-election-admin-in-closed-election');
                                return 0;
                            } else {
                                var Nominations = Parse.Object.extend('Nominations');
                                var nominationquery = new Parse.Query(Nominations);
                                nominationquery.equalTo('objectId', req.params.nid);
                                nominationquery.first(function(nominationobject){
                                    var votesfornominationobject = nominationobject.get("votes");
                                    if(votesfornominationobject > 0) {
                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=votesalreadycast');
                                        return 0;
                                    } else {
                                        nominationobject.destroy().then(function(){
                                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?success=1');
                                        });
                                    }
                                });
                            }
                        } else {
                            var Nominations = Parse.Object.extend('Nominations');
                            var nominationquery = new Parse.Query(Nominations);
                            nominationquery.equalTo('objectId', req.params.nid);
                            nominationquery.first(function(nominationobject){
                                var votesfornominationobject = nominationobject.get("votes");
                                if(votesfornominationobject > 0) {
                                    res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=votesalreadycast');
                                    return 0;
                                } else {
                                    nominationobject.destroy().then(function(){
                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'?success=1');
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
exports.castvote = function(req, res) {

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
                    return memberbelongstospheres;
                } else {
                    res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                    return false;
                }
           }).then(function(memberbelongstospheres){
               if(memberbelongstospheres === false){
                   return false;
               } else {
                    var Elections = Parse.Object.extend("Elections");
                    var electionsquery = new Parse.Query(Elections);
                    electionsquery.equalTo("sphereObjectID", req.params.id);
                    electionsquery.equalTo("objectId", req.params.eid);
                    electionsquery.first().then(function(election){
                        var electiontype = election.get("voteOrEval");
                        var electionVotesAllowed = election.get("electionVotesAllowed") || election.get("totalBudget") || null;
                        if((typeof electionVotesAllowed == "undefined") && (electiontype == "vote")) {
                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=novotelimit');
                            return false;
                        } else {
                                var VotesCast = Parse.Object.extend("Votes");
                                var votescastquery = new Parse.Query(VotesCast);
                                votescastquery.equalTo("sphereObjectID", req.params.id);
                                votescastquery.equalTo("electionObjectID", req.params.eid);
                                votescastquery.equalTo("nominationObjectID", req.params.nid);
                                votescastquery.equalTo("pUserID", pUserID);
                                votescastquery.find().then(function(uservotescast){
                                    var arrayofvotesspent = [];
                                    var promise = Parse.Promise.as();
                                    promise.then(function(){
                                        _.each(uservotescast, function(uservotecast){
                                            var votescastforvote = uservotecast.get("votes");
                                            arrayofvotesspent.push(votescastforvote);
                                        });
                                    });
                                    return Parse.Promise.when(arrayofvotesspent).then(function(){
                                        return arrayofvotesspent;
                                    });
                                }).then(function(arrayofvotesspent){
                                    if(arrayofvotesspent.length > 0) {
                                        var totalvotesspent = _.reduce(arrayofvotesspent, function(memo, num){ return memo + num; }, 0);
                                    } else {
                                        var totalvotesspent = 0;
                                    }
                                    var votesAllowed = (electionVotesAllowed - totalvotesspent) || false;
                                    return votesAllowed;
                                }).then(function(votesAllowed){
                                     if((votesAllowed !== false) && (votesAllowed <= 0)) {
                                         res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=novotesleft');
                                         return false;
                                     } else if((electiontype == "vote") && (req.body.votesCast > votesAllowed)){
                                         res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=toomanyvotes');
                                         return false;
                                     } else { 
                                           var Elections = Parse.Object.extend("Elections");
                                           var electionsquery = new Parse.Query(Elections);
                                           electionsquery.equalTo("objectId", req.params.eid);
                                           return electionsquery.first().then(function(election){
                                               var electionenddate = election.get("endDate");
                                               var electionenddateunix = moment.unix(electionenddate);
                                               var now = moment.unix();
                                               if(now > electionenddateunix) {
                                                   return false;
                                               } else {
                                                   var votestocast = parseInt(req.body.votesCast, 10);
                                                   console.log(votestocast);
                                                   var votestoincrement = Math.abs(votestocast);
                                                   console.log(votestoincrement);
                                                   election.increment("votes", votestoincrement);
                                                   election.save(null, {
                                                       success: function(savedelection){
                                                           var sphereObjectID = req.params.id;
                                                           var electionObjectID = req.params.eid;
                                                           var nominationObjectID = req.params.nid;
                                                           var accesstoken = user.get('fAccessToken');
                                                           var votestocast = parseInt(req.body.votesCast, 10);
                                                           var votesCast = Math.abs(votestocast);
                                                            Parse.Promise.when([ 
                                                                Parse.Cloud.run("aboutsphere",{"sphereID": sphereObjectID}), //r1
                                                                Parse.Cloud.run("aboutelection",{"electionObjectID": electionObjectID}), //r2
                                                                Parse.Cloud.run("aboutnomination",{"nominationObjectID": nominationObjectID, "accesstoken": accesstoken}), //r3
                                                            ]).then(function(r1, r2, r3) {
                                                                   var Votes = Parse.Object.extend('Votes');
                                                                   var Vote = new Votes();
                                                                   var voteForNominationID = req.params.nid;
                                                                   Vote.set("nominationObjectID", voteForNominationID);
                                                                   Vote.set("nominationDescription", r3['nominationDescription']);
                                                                   var voteForNominationIDInElection = req.params.eid;
                                                                   Vote.set("electionObjectID", voteForNominationIDInElection);
                                                                   Vote.set("electionName", r2['electionName']);
                                                                   Vote.set("electionDescription", r2['electionDescription']);
                                                                   Vote.set("electionType", r2['electionType']);
                                                                   Vote.set("electionVotesAllowed", r2['electionVotesAllowed']);
                                                                   Vote.set("voteOrEval", r2['voteOrEval']);
                                                                   Vote.set("rangeDefinition", r2['rangeDefinition']);
                                                                   Vote.set("electionEndDate", savedelection.get('endDate'));
                                                                   var voteForNominationIDInsphere = req.params.id;
                                                                   Vote.set("sphereObjectID", voteForNominationIDInsphere);
                                                                   Vote.set("sphereID", r1[0]['sphereID']);
                                                                   Vote.set("sphereName", r1[0]['sphereName']);
                                                                   Vote.set("sphereDescription", r1[0]['sphereDescription']);
                                                                   var votePageName = r3['pageName'];
                                                                   if((typeof votePageName !== "undefined") && (votePageName !== "") && (votePageName !== null)) {
                                                                       Vote.set("pageName", votePageName);
                                                                   } else {
                                                                       res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=nonameofpage');
                                                                       return false;
                                                                   }
                                                                   if((typeof pUserID !== "undefined") && (pUserID !== "") && (pUserID !== null)) {
                                                                       Vote.set("onBehalfOf", pUserID);
                                                                   } else {
                                                                       res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=noidofmember');
                                                                       return false;
                                                                   }
                                                                   if((typeof pUserID !== "undefined") && (pUserID !== "") && (pUserID !== null)) {
                                                                       Vote.set("pUserID", pUserID);
                                                                   } else {
                                                                       res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=nopidofmember');
                                                                       return false;
                                                                   }
                                                                   if((typeof votesCast !== "undefined") && (votesCast !== "") && (votesCast !== null) && (votesCast > 0)) {
                                                                       Vote.set("votes", votesCast);
                                                                   } else {
                                                                       res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=novotecast');
                                                                       return false;
                                                                   }
                                                                   Vote.save(null, {
                                                                    success: function(vote){
                                                                      var Nominations = Parse.Object.extend('Nominations');
                                                                      var nominationquery = new Parse.Query(Nominations);
                                                                      nominationquery.equalTo('objectId', req.params.nid);
                                                                      nominationquery.first(function(nominationobject){
                                                                         var votestocast = parseInt(req.body.votesCast, 10);
                                                                         var incrementvotes = Math.abs(votestocast);
                                                                         var incrementvoters =  Math.abs(1);
                                                                         nominationobject.increment('votes', incrementvotes);
                                                                         nominationobject.increment('voters', incrementvoters);
                                                                         nominationobject.save(null, {
                                                                             success: function(nominationobject) {
                                                                                 var nominationvotes = nominationobject.get("votes") || null;
                                                                                 var nominationvoters = nominationobject.get("voters") || null;
                                                                                 var nominationvotersdivided = (nominationvotes/nominationvoters);
                                                                                 var avgevaluation = Math.floor(nominationvotersdivided) || null;
                                                                                 nominationobject.set("avgEvaluation", avgevaluation);
                                                                                 return nominationobject.save(null, {
                                                                                    success: function(nominationobject2){
                                                                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=1');
                                                                                    }, 
                                                                                    error: function(nominationobject2, error){
                                                                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=1');
                                                                                    }
                                                                                 });
                                                                             }, 
                                                                             error: function(nominationobject, error){
                                                                                 res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=2');
                                                                             }
                                                                         });
                                                                      });
                                                                    },
                                                                    error: function(vote, error) {
                                                                        var errormessage = encodeURI(error);
                                                                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=3&message='+errormessage);
                                                                    }
                                                                 });
                                                             });
                                                       },
                                                       error: function(savedelection, error){
                                                            var errormessage = encodeURI(error);
                                                            console.log(error);
                                                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=4&message='+errormessage);
                                                       }
                                                });
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
exports.takevoteback = function(req, res) {

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
                    return true;
                } else {
                    res.redirect('sphere/'+req.params.id+'?error=notamemberofsphere');
                    return false;
                }
           }).then(function(memberbelongstospheres){
               if(memberbelongstospheres == false){
                   return false;
               } else {
                    var VoteCast = Parse.Object.extend("Votes");
                    var votecastquery = new Parse.Query(VoteCast);
                    votecastquery.equalTo("nominationObjectID", req.params.nid);
                    votecastquery.equalTo("pUserID", pUserID);
                    return votecastquery.first().then(function(votecastalready){
                        if((typeof votecastalready == "undefined") || (votecastalready == "") || (votecastalready === null)) {
                            res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?votecast=0');
                            return false;
                        } else {
                            return votecastalready;
                        }
                    });
               }
            }).then(function(votecastalready){
                   if(votecastalready === false){
                       return false;
                   } else {
                       var electionObjectID = votecastalready.get("electionObjectID");
                       var numberOfVotesToDecrement = votecastalready.get("votes");
                       var Elections = Parse.Object.extend("Elections");
                       var electionsquery = new Parse.Query(Elections);
                       electionsquery.equalTo("objectId", electionObjectID);
                       return electionsquery.first().then(function(election){
                           var electionenddate = election.get("endDate");
                           var electionenddateunix = moment(electionenddate).unix();
                           var now = new Date();
                           var nowunix = moment(now).unix();
                           if(nowunix < electionenddateunix) {
                               var decrementvotes = -Math.abs(numberOfVotesToDecrement);
                               election.increment("votes", decrementvotes);
                               return election.save();
                           } else {
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=electionended');
                                return false;
                           }
                       });
                   }
            }).then(function(election){
               if(election === false){
                   return false;
               } else {
                   var electionenddate = election.get("endDate");
                   var electionenddateunix = moment(electionenddate).unix();
                   var now = new Date();
                   var nowunix = moment(now).unix();
                   if(nowunix < electionenddateunix) {
                       var VoteCast = Parse.Object.extend("Votes");
                       var votecastquery = new Parse.Query(VoteCast);
                        votecastquery.equalTo("nominationObjectID", req.params.nid);
                        votecastquery.equalTo("pUserID", pUserID);
                        return votecastquery.first().then(function(object){
                            if((typeof object == 'undefined') || (object === null) || (object == '')) {
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=novotecast');
                                return false;
                            } else {
                                return object;
                            }
                         
                        });
                   }
               }
            }).then(function(votecastobject){
                var nominationObjectID = votecastobject.get("nominationObjectID");
                var votesToRemoveFromNomination = votecastobject.get("votes");
                var Nominations = Parse.Object.extend("Nominations");
                var nominationsquery = new Parse.Query(Nominations);
                nominationsquery.equalTo('objectId', nominationObjectID);
                return nominationsquery.first().then(function(object){
                    // Successfully retrieved the object.
                    if((typeof object == 'undefined') || (object === null) || (object == '')) {
                        res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?error=nonomination');
                        return false;
                    } else {
                        var decrementvotes = -Math.abs(votesToRemoveFromNomination);
                        var decrementvoters = -Math.abs(1);
                        object.increment("votes", decrementvotes);
                        object.increment("voters", decrementvoters);
                        return object.save().then(function(renewobject){
                            var renewedvotes = renewobject.get("votes");
                            var renewedvoters = renewobject.get("voters");
                            var renewedavgeval = Math.floor(renewedvotes/renewedvoters) || null;
                            renewobject.set("avgEvaluation", renewedavgeval);
                            return renewobject.save().then(function(){
                                res.redirect('sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid+'?success=1');
                            });
                        });
                    }
                }).then(function(){
                    votecastobject.destroy();
                });
            });
      });
    }
};