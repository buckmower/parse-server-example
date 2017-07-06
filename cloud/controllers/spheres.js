var _ = require('underscore');
exports.index = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var name = user.get('name');
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
            Parse.Cloud.run("memberisadminofspheres", {"pUserID": pUserID}), //r2
          ]).then(function(r1, r2){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
            var memberisadminofspheres = r2 || [];
              Parse.Promise.when([ 
                Parse.Cloud.run("userprofileimageurl",{"fUserID": fUserID, "accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("hello",{}), //r4
                Parse.Cloud.run("userspheresinfo",{"spheresofmember": memberbelongstospheres, "pUserID": pUserID}), //r5
                Parse.Cloud.run("numberofadminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("somerandomspheres", {}), // r7
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r8
                Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r9
                Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r10
              ]).then(function(r2, r3, r4, r5, r6, r7, r8, r9, r10) {
                   var userprofileimage = r2 || r10[0]['thumbnailurl'] || null;
                   var numuservotes = r3 || 0;
                   var numadminactionitemsforspherejoiners = r6 || 0;
                   var numadminactionitemsforspheremergers = r9 || 0;
                   var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
                   var sphereItems = r5 || "";
                   var poprulerApp = r4;
                   var somerandomspheres = r7 || "";
                   var numdecisions = r8 || 0;
                   var appID = poprulerApp["appID"];
                   var appURL = poprulerApp["appURL"];
                   var appAT = poprulerApp["appAT"];
                   var chunksofspheres = new Array();
                   var numberofchunks = Math.ceil(numuserspheres / 9);
                   var page = parseInt(req.query.pg) || 0;
                   for(var i=0; i < numberofchunks; i++) {
                        var firstitemofchunk = (i * 9);
                        chunksofspheres.push(sphereItems.slice(firstitemofchunk, (firstitemofchunk + 9)));
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
                   var displayspheres = chunksofspheres[page];
                   res.render('spheres/index', {
                       appID: appID,
                       appURL: appURL,
                       username: name,
                       userprofileimageurl: userprofileimage,
                       numberofuserspheres: numuserspheres,
                       numberofuservotescast: numuservotes,
                       numberofdecisions: numdecisions,
                       numberofadminactionitems: numadminactionitems,
                       numberofchunksofuserspheres: numberofchunks,
                       userspheres: displayspheres,
                       randomspheres: somerandomspheres,
                       currentpage: page,
                       nextdisabled: nextdisabled,
                       previousdisabled: previousdisabled,
                       previouspage: previousPage,
                       nextpage: nextpage
                    });
                });
            });
    });
  } else {
    res.redirect("/?er=incorrectlogin");
  }
}; 
/*
exports.showeditmodal = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var sphereObjectID = req.params.gid;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
          ]).then(function(r1){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
              Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("aboutsphere",{"sphereID": req.params.gid}), //r4
                Parse.Cloud.run("hello",{}), //r5
                Parse.Cloud.run("numberofadminactionitems", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
              ]).then(function(r2, r3, r4, r5, r6, r7){
                  var userprofileimage = r2 || "undefined";
                  var numuservotes = r3 || 0;
                  var numadminactionitems = r6 || 0;
                  var numdecisions = r7 || 0;
                  var sphereData = r4 || [];
                  var sphereID = sphereData['sphereID'];
                  var sphereName = sphereData['sphereName'];
                  var sphereDescription = sphereData['sphereDescription'];
                  var spherePrivacy = sphereData['spherePrivacy'];
                  if(spherePrivacy == "open"){
                      var joinselectedpublic = "checked";
                      var joinselectedprivate = "";
                  } else {
                      var joinselectedpublic = "";
                      var joinselectedprivate = "checked";
                  }
                  var sphereElectionCreationOptions = sphereData['sphereElectionCreationOptions'];
                  if(sphereElectionCreationOptions == "open"){
                      var electioncreationoptionsselectedpublic = "checked";
                      var electioncreationoptionsselectedprivate = "";
                  } else {
                      var electioncreationoptionsselectedpublic = "";
                      var electioncreationoptionsselectedprivate = "checked";
                  }
                  var sphereadmins = sphereData['sphereAdmins'];
                  var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                  if(typeof isAdminCheck !== "undefined") {
                      var isAdmin = true;
                  } else {
                      var isAdmin = false;
                  }
                  var appID = r5['appID'];
                  var appURL = r5['appURL'];
                  var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.gid; });
                  if(typeof ismember !== "undefined") {
                      Parse.Promise.when([
                        Parse.Cloud.run("spheremembersinsphere", {"sphereObjectID": sphereObjectID}), //r6
                        Parse.Cloud.run("sphereadminsinsphere", {"sphereObjectID": sphereObjectID}), //r7
                        Parse.Cloud.run("sphereadminsinsphereinfo", {"sphereObjectID": sphereObjectID}), //r8
                      ]).then(function(r6, r7, r8) {
                               var spheremembersinsphere = r6 || "";
                               var sphereadminsinsphere = r7 || "";
                               var sphereadminsinsphereinfo = r8 || "";
                                      res.render('spheres/editsphere', {
                                       appid: appID,
                                       appurl: appURL,
                                       fuserid: fUserID,
                                       username: name,
                                       userprofileimageurl: userprofileimage,
                                       numberofuservotescast: numuservotes,
                                       numberofdecisions: numdecisions,
                                       numberofadminactionitems: numadminactionitems,
                                       joinselectedpublic: joinselectedpublic,
                                       joinselectedprivate: joinselectedprivate,
                                       electioncreationoptionsselectedpublic: electioncreationoptionsselectedpublic,
                                       electioncreationoptionsselectedprivate: electioncreationoptionsselectedprivate,
                                       numberofuserspheres: numuserspheres,
                                       sphereobjectid: sphereObjectID,
                                       spherename: sphereName,
                                       spheredescription: sphereDescription,
                                       sphereelectioncreationoptions: sphereElectionCreationOptions,
                                       spheremembersinsphere: spheremembersinsphere,
                                       sphereadminsinsphere: sphereadminsinsphere,
                                       sphereadminsinsphereinfo: sphereadminsinsphereinfo,
                                       isadmin: isAdmin
                                      });
                                 
                            });
                    } else {
                       res.redirect("/sphere/"+sphereObjectID);
                    }
                });
            });
        });
    }
};
exports.editadmins = function(req, res) {

  // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get("fUserID");
          var pUserID = user.id;
          var name = user.get('name');
          var sphereObjectID = req.params.gid;
          var accesstoken = user.get('fAccessToken');
          Parse.Promise.when([
            Parse.Cloud.run("memberbelongstospheres",{"pUserID": pUserID}), //r1
          ]).then(function(r1){
            var memberbelongstospheres = r1 || 0;
            var numuserspheres = memberbelongstospheres.length || 0;
              Parse.Promise.when([
                Parse.Cloud.run("userprofileimageurl",{"accesstoken": accesstoken},{}), //r2
                Parse.Cloud.run("numberofuservotescast",{"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), //r3
                Parse.Cloud.run("aboutsphere",{"sphereID": req.params.gid}), //r4
                Parse.Cloud.run("hello",{}), //r5
                Parse.Cloud.run("numberofadminactionitems", {"pUserID": pUserID}), // r6
                Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r7
              ]).then(function(r2, r3, r4, r5, r6, r7){
                  var userprofileimage = r2 || "undefined";
                  var numuservotes = r3 || 0;
                  var numadminactionitems = r6 || 0;
                  var numdecisions = r7 || 0;
                  var sphereData = r4 || [];
                  var sphereID = sphereData['sphereID'];
                  var sphereName = sphereData['sphereName'];
                  var sphereDescription = sphereData['sphereDescription'];
                  var spherePrivacy = sphereData['spherePrivacy'];
                  if(spherePrivacy == "open"){
                      var joinselectedpublic = "checked";
                      var joinselectedprivate = "";
                  } else {
                      var joinselectedpublic = "";
                      var joinselectedprivate = "checked";
                  }
                  var sphereElectionCreationOptions = sphereData['sphereElectionCreationOptions'];
                  if(sphereElectionCreationOptions == "open"){
                      var electioncreationoptionsselectedpublic = "checked";
                      var electioncreationoptionsselectedprivate = "";
                  } else {
                      var electioncreationoptionsselectedpublic = "";
                      var electioncreationoptionsselectedprivate = "checked";
                  }
                  var sphereadmins = sphereData['sphereAdmins'];
                  var isAdminCheck = _.find(sphereadmins, function(num){ return num == pUserID; });
                  if(typeof isAdminCheck !== "undefined") {
                      var isAdmin = true;
                  } else {
                      var isAdmin = false;
                  }
                  var appID = r5['appID'];
                  var appURL = r5['appURL'];
                  var ismember = _.find(memberbelongstospheres, function(num){ return num == req.params.gid; });
                  if(typeof ismember !== "undefined") {
                      Parse.Promise.when([
                        Parse.Cloud.run("spheremembersinsphere", {"sphereObjectID": sphereObjectID}), //r6
                        Parse.Cloud.run("sphereadminsinsphere", {"sphereObjectID": sphereObjectID}), //r7
                        Parse.Cloud.run("sphereadminsinsphereinfo", {"sphereObjectID": sphereObjectID}), //r8
                      ]).then(function(r6, r7, r8) {
                               var spheremembersinsphere = r6 || "";
                               var sphereadminsinsphere = r7 || "";
                               var sphereadminsinsphereinfo = r8 || "";
                                      res.render('spheres/addadmins', {
                                       appid: appID,
                                       appurl: appURL,
                                       fuserid: fUserID,
                                       username: name,
                                       userprofileimageurl: userprofileimage,
                                       numberofuservotescast: numuservotes,
                                       numberofdecisions: numdecisions,
                                       numberofadminactionitems: numadminactionitems,
                                       joinselectedpublic: joinselectedpublic,
                                       joinselectedprivate: joinselectedprivate,
                                       electioncreationoptionsselectedpublic: electioncreationoptionsselectedpublic,
                                       electioncreationoptionsselectedprivate: electioncreationoptionsselectedprivate,
                                       numberofuserspheres: numuserspheres,
                                       sphereobjectid: sphereObjectID,
                                       spherename: sphereName,
                                       spheredescription: sphereDescription,
                                       sphereelectioncreationoptions: sphereElectionCreationOptions,
                                       spheremembersinsphere: spheremembersinsphere,
                                       sphereadminsinsphere: sphereadminsinsphere,
                                       sphereadminsinsphereinfo: sphereadminsinsphereinfo,
                                       isadmin: isAdmin
                                      });
                                 
                            });
                    } else {
                       res.redirect("/sphere/"+sphereObjectID);
                    }
                });
            });
        });
    }
}; */
exports.create = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var fUserName = user.get('name');
          var newsphereName = req.body.newsphereName;
          var newsphereDescription = req.body.newsphereDescription;
          var newspherePrivacySelection = req.body.newspherePrivacy;
          var newsphereElectionCreationOptions = req.body.newsphereElectionCreationOptions;
          if(newsphereElectionCreationOptions == "on"){
            var electionCreation = "closed";
          } else {
            var electionCreation = "open";
          }
          if(newspherePrivacySelection == "on"){
            var spherePrivacy = "closed";
          } else {
            var spherePrivacy = "open";
          }
          var appID = req.body.appID;
          var spheresObject = Parse.Object.extend('Spheres');
          var sphere = new spheresObject();
          sphere.set("sphereName", newsphereName);
          sphere.set("sphereDescription", newsphereDescription);
          sphere.set("spherePrivacy", spherePrivacy);
          sphere.set("sphereElectionCreation", electionCreation);
          sphere.addUnique("sphereAdmins", pUserID);
          sphere.save().then(function(sphere){
                var SphereMembersObject = Parse.Object.extend('SphereMembers');
                var SphereMembers = new SphereMembersObject();
                SphereMembers.set("fMemberID", fUserID);
                SphereMembers.set("pUserID", pUserID);
                SphereMembers.set("name", fUserName);
                SphereMembers.set("sphereObjectID", sphere.id);
                SphereMembers.set("administrator", true);
                SphereMembers.save().then(function(spherememberobject){
                  var subscriptionobject = Parse.Object.extend("SphereSubsciptions");
                  var subscriptionobjectquery = new Parse.Query(subscriptionobject);
                  subscriptionobjectquery.equalTo("pUserID", pUserID);
                  subscriptionobjectquery.equalTo("sphereObjectID", req.params.id);
                  subscriptionobjectquery.first().then(function(subscriptionobject){
                   if((typeof subscriptionobject !== "undefined") && (subscriptionobject !== null) && (subscriptionobject !== "")){
                    res.redirect("/sphere/"+sphere.id+"?success=2");
                    return false;
                   } else {
                    var nowdatetimeofjoinedsphere = new Date();
                    var subscriptionObjects = new Parse.Object("SphereSubscriptions");
                    subscriptionObjects.set("pUserID", pUserID);
                    subscriptionObjects.set("sphereObjectID", sphere.id);
                    subscriptionObjects.set("joinedSphere", nowdatetimeofjoinedsphere);
                    subscriptionObjects.save(null, {
                      success: function(spheremember) {
                        res.redirect("/sphere/"+sphere.id+"?success=1");
                      }, 
                      error: function(spheremember, error){
                        res.redirect("/sphere/"+sphere.id+"?error=1");  
                      }
                    });
                   }
                  });
                });
            });
      });
    } else {
      res.redirect('/spheres?error=spherecreationerror3');
    }
};
/*
exports.editsphere = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.body.sphereObjectID;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamember");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", req.body.sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/spheres?error=notadmin");
                     } else {
                         var sphereName = req.body.sphereName;
                         var sphereDescription = req.body.sphereDescription;
                         var spherePrivacy = req.body.spherePrivacy;
                         var sphereElectionCreationOptions = req.body.sphereElectionCreationOptions;
                         sphere.set("sphereName", sphereName);
                         sphere.set("sphereDescription", sphereDescription);
                         sphere.set("spherePrivacy", spherePrivacy);
                         sphere.set("sphereElectionCreation", sphereElectionCreationOptions);
                         sphere.save().then(function(){
                            res.redirect("/spheres?success=sphereedited"); 
                         });
                     }
                 });
             }
          });
      });
    }
};
*/
exports.leavesphereparent = function(req, res) {

    if(Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        var sphereObjectID = req.body.sphereObjectID;
        var OptOutOfSphereParent= Parse.Object.extend("OptOutOfSphereParent");
        var optoutofsphereparentquery = new Parse.Query(OptOutOfSphereParent);
        optoutofsphereparentquery.equalTo("pUserID", pUserID);
        optoutofsphereparentquery.equalTo("sphereObjectID", sphereObjectID);
        optoutofsphereparentquery.first().then(function(optout){
           if((typeof optout == "undefined") || (optout == "") || (optout == null)) {
                var OptOut = new OptOutOfSphereParent();
                OptOut.set("sphereObjectID", sphereObjectID);
                OptOut.set("pUserID", pUserID);
                OptOut.save().then(function(){
                   res.redirect("/spheres"); 
                });
           }
        });
      });
    }
};
exports.optbackin = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        var sphereObjectID = req.body.sphereObjectID;
        var OptOutOfSphereParent= Parse.Object.extend("OptOutOfSphereParent");
        var optoutofsphereparentquery = new Parse.Query(OptOutOfSphereParent);
        optoutofsphereparentquery.equalTo("pUserID", pUserID);
        optoutofsphereparentquery.equalTo("sphereObjectID", sphereObjectID);
        optoutofsphereparentquery.first().then(function(optout){
           if((typeof optout == "undefined") || (optout == "") || (optout == null)) {
               res.redirect("/sphere/"+sphereObjectID+"?error=1");
           } else {
               optout.destroy().then(function(){
                  res.redirect("/sphere/"+sphereObjectID); 
               });
           }
        });
      });
    }
};
exports.leavesphere = function(req, res) {

    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var pUserID = user.id;
          var sphereObjectID = req.body.sphereObjectID;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamember");
             } else {
                 var spheres = Parse.Object.extend("Spheres");
                 var spheresquery = new Parse.Query(spheres);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                    var sphereadminsarray = sphere.get("sphereAdmins");
                    var isAdminCheck = _.find(sphereadminsarray, function(num){ return num == pUserID; });
                    if(isAdminCheck !== "undefined") {
                        if(sphereadminsarray.length == 1) {
                          sphere.set("spherePrivacy", "open");
                          sphere.set("sphereElectionCreation", "open");
                          sphere.save();
                          return true;
                        } else {
                          sphere.remove("sphereAdmins", pUserID);
                          sphere.save();
                          return true;
                        }
                    } else {
                        return true;
                    }
                 }).then(function(){
                    var SphereJoiners = Parse.Object.extend("SphereJoiners");
                    var spherejoinersquery = new Parse.Query(SphereJoiners);
                    spherejoinersquery.equalTo("requesterpUserID", pUserID);
                    spherejoinersquery.equalTo("sphereObjectID", sphereObjectID);
                    spherejoinersquery.first().then(function(spherejoiner){
                       if((typeof spherejoiner !== "undefined") && (spherejoiner !== "")) {
                            spherejoiner.destroy(); 
                       }
                    });
                 }).then(function(){
                     return spheremember.destroy();
                 }).then(function(){
                      var SphereMembers = Parse.Object.extend("SphereMembers");
                      var spheremembersquery = new Parse.Query(SphereMembers);
                      spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
                      spheremembersquery.first().then(function(memberexists){
                          if((typeof memberexists == "undefined") || (memberexists == "") || (memberexists == null)){
                              var MergeSpheres = Parse.Object.extend("MergeSpheres");
                              var mergedspherequery1 = new Parse.Query(MergeSpheres);
                              mergedspherequery1.equalTo("childSphere", sphereObjectID);
                              var mergedspheresquery2 = new Parse.Query(MergeSpheres);
                              mergedspheresquery2.equalTo("motherSphere", sphereObjectID);
                              var mergedspherequery = Parse.Query.or(mergedspherequery1, mergedspheresquery2);
                              mergedspherequery.find().then(function(mergedspheres){
                                  _.each(mergedspheres, function(mergedsphere){
                                    mergedsphere.destroy();
                                  });
                                  return true;
                              }).then(function(){
                                var MergeRequests = Parse.Object.extend("MergeRequests");
                                var mergerequestsquery1 = new Parse.Query(MergeRequests);
                                mergerequestsquery1.equalTo("childSphere", sphereObjectID);
                                var mergerequestsquery2 = new Parse.Query(MergeRequests);
                                mergerequestsquery2.equalTo("motherSphere", sphereObjectID);
                                var mergerequestsquery = Parse.Query.or(mergerequestsquery1, mergerequestsquery2);
                                mergerequestsquery.find().then(function(mergerequests){
                                    _.each(mergerequests, function(mergerequest){
                                        mergerequest.destroy();
                                    });
                                    return true;
                                }).then(function(){
                                  var Spheres = Parse.Object.extend("Spheres");
                                  var spheresquery = new Parse.Query(Spheres);
                                  spheresquery.equalTo("objectId", sphereObjectID);
                                  spheresquery.first().then(function(sphere){
                                      sphere.destroy().then(function(){
                                         res.redirect("/spheres?success=leftanddeletedsphere"); 
                                      });
                                  });
                                });
                              });
                          } else {
                             res.redirect("/spheres?success=leftsphere");
                             return true;
                          }
                      });
                 });
             }
          });
      });
    }
};
exports.search = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        var page_name = req.body.sphere_name;
        Parse.Promise.when([ 
            Parse.Cloud.run("sphereobjects",{"pagename": page_name}) //r2
        ]).then(function(r2){
            var sphereObjects = r2 || [];
            if((typeof sphereObjects !== undefined) && (sphereObjects !== "") && (sphereObjects !== null)) {
              var suggestions = new Array();
              _.each(sphereObjects, function(sphereObject){
                var sphereID = sphereObject['sphereID'] || "";
                var sphereName = sphereObject['sphereName'] || "";
                var sphereDescription = sphereObject['sphereDescription'] || "";
                suggestions.push("<h4>"+sphereName+"</h4><a class='btn btn-default' data-toggle='collapse' href='#collapseDescription"+sphereID+"' aria-expanded='false' aria-controls='collapseDescription"+sphereID+"'>Show Description</a><div class='collapse' id='collapseDescription"+sphereID+"'><div class='well'>"+sphereDescription+"</div></div><a class='btn btn-md btn-primary' href='/sphere/"+sphereID+"'>Go to sphere</a>");
              });
              res.send(suggestions);
            }
        });
    });
};
/*
exports.searchmembers = function(req, res) {
    Parse.User.current().fetch().then(function(user) {
        Parse.Promise.when([
          Parse.Cloud.run("hello",{}), //r1
          ]).then(function(r1){
            var appAT = r1["appAT"];
            var page_name = req.body.sphere_member_name;
            var sphereObjectID = req.body.sphere_object_id;
            var accesstoken = user.get("fAccessToken");
            Parse.Promise.when([ 
                Parse.Cloud.run("spherememberslookup",{"pagename": page_name, "sphereObjectID": sphereObjectID}) //r2
            ]).then(function(r2){
                var SphereMembers = r2 || [];
                if((typeof SphereMembers !== undefined) && (SphereMembers !== "") && (SphereMembers !== null)) {
                  var suggestions = new Array();
                  _.each(SphereMembers, function(sphereMember){
                    var fMemberID = sphereMember['fMember'] || "";
                    var pUserID = sphereMember['pUserID'] || "";
                    var name = sphereMember['name'] || "";
                    var pictureURL = sphereMember['pictureURL'] || "";
                    suggestions.push("<img src='"+pictureURL+"'><br><h4><a href='https://www.facebook.com/"+fMemberID+"' target='_blank'>"+name+"</a></h4><br><form action='/spheres/addadmin/"+sphereObjectID+"/"+pUserID+"' method='POST'><input type='submit' class='btn btn-sm btn-primary' value='Add As Admin'></form>");
                  });
                  res.send(suggestions);
                }
            });
        });
    });
};
exports.addadmin = function(req, res) {
    if(Parse.User.current()) {
        Parse.User.current().fetch().then(function(user) {
            var SphereMembers = Parse.Object.extend("SphereMembers");
            var spheremembersquery1 = new Parse.Query(SphereMembers);
            spheremembersquery1.equalTo("sphereObjectID", req.params.gid);
            spheremembersquery1.equalTo("pUserID", user.id);
            spheremembersquery1.first().then(function(spheremember){
               if(spheremember.get("administrator") == true) {
                   var spheremembersquery2 = new Parse.Query(SphereMembers);
                   spheremembersquery2.equalTo("sphereObjectID", req.params.gid);
                   spheremembersquery2.equalTo("pUserID", req.params.pid);
                   spheremembersquery2.first().then(function(spheremember2){
                      if((typeof spheremember2 !== "undefined") && (spheremember2 !== "")) {
                          var sphereObjectID = spheremember2.get("sphereObjectID");
                          spheremember2.set("administrator", true);
                          spheremember2.save().then(function(){
                              var spheres = Parse.Object.extend("Spheres");
                              var spheresquery = new Parse.Query(spheres);
                              spheresquery.equalTo("objectId", sphereObjectID);
                              spheresquery.first().then(function(sphere){
                                 sphere.addUnique("sphereAdmins", req.params.pid);
                                 sphere.save().then(function(){
                                    res.redirect("/spheres?success=adminadded");
                                 });
                              });
                          });
                      } else {
                          res.redirect("/spheres?error=notaspheremember");
                      }
                   });
               } else {
                   res.redirect("/spheres?error=noadminprivilege");
               } 
            });
        });
    }
}; */