var _ = require('underscore');
var moment = require('moment');

// Display all posts.
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
              Parse.Cloud.run("adminactionitemsforspherejoiners", {"pUserID": pUserID}), // r6
              Parse.Cloud.run("numberofadminactionitemsforspheremergers", {"sphereObjectIDs": memberisadminofspheres}), // r7
              Parse.Cloud.run("adminactionitemsforspheremergerstoparent", {"sphereObjectIDs": memberisadminofspheres}), // r8
              Parse.Cloud.run("adminactionitemsforspheremergerstochild", {"sphereObjectIDs": memberisadminofspheres}), // r9
              Parse.Cloud.run("numDecisionNotifications", {"sphereObjectIDs": memberbelongstospheres, "fUserID": fUserID, "pUserID": pUserID}), // r10
              Parse.Cloud.run("userprofilepicture", {"pageObjectID": pUserID}), //r11
            ]).then(function(r3, r4, r5, r6, r7, r8, r9, r10, r11) {
              function compare(a,b) {
                if (a.unixDate < b.unixDate)
                   return 1;
                if (a.unixDate > b.unixDate)
                  return -1;
                return 0;
              }
              var userprofileimage = r3 || r11[0]['thumbnailurl'] || null;
              var numuservotes = r4 || 0;
              var numadminactionitemsforspherejoiners = r5 || 0;
              var adminactionitemsforspherejoinersarray = r6 || [];
              var numadminactionitemsforspheremergers = r7 || 0;
              var adminactionitemsforspheremergerstoparentarray = r8 || [];
              var adminactionitemsforspheremergerstochildarray = r9 || [];
              var adminactionitemsforspheremergersarray = adminactionitemsforspheremergerstoparentarray.concat(adminactionitemsforspheremergerstochildarray);
              var numadminactionitems = (parseInt(numadminactionitemsforspherejoiners, 10) + parseInt(numadminactionitemsforspheremergers, 10)) || 0;
              var adminactionitemsarray = adminactionitemsforspherejoinersarray.concat(adminactionitemsforspheremergersarray);
              var adminactionitemsunsorted = Array();
              var numdecisions = r10 || 0;
              _.each(adminactionitemsarray, function(adminactionitem){
                adminactionitemsunsorted.push(adminactionitem);
              });
              var adminactionitems = adminactionitemsunsorted.sort(compare);
              res.render('admin/index', {
                username: name,
                timeuserjoined: timejoined,
                userprofileimageurl: userprofileimage,
                numberofuserspheres: numuserspheres,
                numberofuservotescast: numuservotes,
                numberofdecisions: numdecisions,
                numberofadminactionitems: numadminactionitems,
                adminactionitems: adminactionitems
              });
            });
          });
       });
  } else {
    // User not logged in, redirect to login form.
    res.redirect('/login');
  }
};
exports.approve = function(req, res) {

  // Display the user profile if user is logged in.
    if(Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        var SphereMembers = Parse.Object.extend("SphereMembers");
        var spheremembersquery = new Parse.Query(SphereMembers);
        spheremembersquery.equalTo("pUserID", pUserID);
        spheremembersquery.equalTo("sphereObjectID", req.params.id);
        spheremembersquery.first().then(function(spherememberobject){
          if((typeof spherememberobject == "undefined") || (spherememberobject == "")) {
              res.redirect('sphere/'+req.params.id+'?error=notinsphere');
              return 0;
          } else {
            var isadmin = spherememberobject.get("administrator");
            if((typeof isadmin == false) || (isadmin == "") || (typeof isadmin == "undefined")) {
              res.redirect('sphere/'+req.params.id+'?error=notadmin');
              return 0;
            } else {
              var SphereJoiners = Parse.Object.extend("SphereJoiners");
              var spherejoinersquery = new Parse.Query(SphereJoiners);
              spherejoinersquery.equalTo("requesterpUserID", req.params.rpid);
              spherejoinersquery.equalTo("sphereObjectID", req.params.id);
              spherejoinersquery.first().then(function(spherejoiner){
                var sphereName = spherejoiner.get("sphereName");
                var requesterfMemberID = spherejoiner.get("requesterfMemberID");
                var requesterName = spherejoiner.get("requesterName");
                spherejoiner.set("approved", true);
                spherejoiner.set("actiontaken", true);
                spherejoiner.save().then(function(){
                  var SphereMembers = Parse.Object.extend("SphereMembers");
                  var spheremembersquery = new Parse.Query(SphereMembers);
                  spheremembersquery.equalTo("pUserID", req.params.rpid);
                  spheremembersquery.equalTo("sphereObjectID", req.params.id);
                  spheremembersquery.first().then(function(spheremember){
                    if((typeof spheremember == "undefined") || (spheremember == "")) {
                      var addspheremember = new SphereMembers();
                      addspheremember.set("sphereName", sphereName);
                      addspheremember.set("fMemberID", requesterfMemberID);
                      addspheremember.set("sphereObjectID", req.params.id);
                      addspheremember.set("pUserID", req.params.rpid);
                      addspheremember.set("name", requesterName);
                      addspheremember.set("administrator", false);
                      addspheremember.save().then(function(){
                        res.redirect("/admin?success=joinapproved");
                      });
                    }
                  });
                });
              });
            }
          }
        });
    });
  }
};
exports.decline = function(req, res) {

  // Display the user profile if user is logged in.
    if(Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        var SphereMembers = Parse.Object.extend("SphereMembers");
        var spheremembersquery = new Parse.Query(SphereMembers);
        spheremembersquery.equalTo("pUserID", pUserID);
        spheremembersquery.equalTo("sphereObjectID", req.params.id);
        spheremembersquery.first().then(function(spherememberobject){
          if((typeof spherememberobject == "undefined") || (spherememberobject == "")) {
              res.redirect('sphere/'+req.params.id+'?error=notinsphere');
              return 0;
          } else {
            var isadmin = spherememberobject.get("administrator");
            if((typeof isadmin == false) || (isadmin == "") || (typeof isadmin == "undefined")) {
              res.redirect('sphere/'+req.params.id+'?error=notadmin');
              return 0;
            } else {
              var SphereJoiners = Parse.Object.extend("SphereJoiners");
              var spherejoinersquery = new Parse.Query(SphereJoiners);
              spherejoinersquery.equalTo("requesterpUserID", req.params.rpid);
              spherejoinersquery.equalTo("sphereObjectID", req.params.id);
              spherejoinersquery.first().then(function(spherejoiner){
                spherejoiner.set("approved", false);
                spherejoiner.set("actiontaken", true);
                spherejoiner.save().then(function(){
                  res.redirect("/admin?success=joindeclined");
                });
              });
            }
          }
        });
    });
  }
};
exports.approvespheremerger = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.mid;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         if(req.params.id == req.params.mid) {
                           res.redirect("/sphere/"+req.params.id+"?error=selfasparent");
                         } else {
                           var MergeSpheres = Parse.Object.extend("MergeSpheres");
                           var mergespheresquery = new Parse.Query(MergeSpheres);
                           mergespheresquery.equalTo("childSphere", req.params.id);
                           mergespheresquery.equalTo("motherSphere", req.params.mid);
                           mergespheresquery.first().then(function(mergedspheres){
                              if((typeof mergedspheres == "undefined") || (mergedspheres == "") || (mergedspheres == null)){
                                  var MergeSpheres = Parse.Object.extend("MergeSpheres");
                                  var MergedPheres = new MergeSpheres();
                                  MergedPheres.set("childSphere", req.params.id);
                                  MergedPheres.set("motherSphere", req.params.mid);
                                  MergedPheres.save().then(function(){
                                      return true;
                                  }).then(function(){
                                    var MergeRequests = Parse.Object.extend("MergeRequests");
                                    var mergerequestsquery = new Parse.Query(MergeRequests);
                                    mergerequestsquery.equalTo("childSphere", req.params.id);
                                    mergerequestsquery.equalTo("motherSphere", req.params.mid);
                                    mergerequestsquery.first().then(function(mergerequest){
                                      mergerequest.destroy();
                                      res.redirect("/admin?success=spheresmerged");
                                    });
                                  });
                              }
                           });
                         }
                     }
                 });
             }
          });
      });
    }
};
exports.declinespheremerger = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.mid;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         var MergeRequests = Parse.Object.extend("MergeRequests");
                         var mergerequestsquery = new Parse.Query(MergeRequests);
                         mergerequestsquery.equalTo("childSphere", req.params.id);
                         mergerequestsquery.equalTo("motherSphere", req.params.mid);
                         mergerequestsquery.first().then(function(mergedspheresrequested){
                            if((typeof mergedspheresrequested == "undefined") || (mergedspheresrequested == "") || (mergedspheresrequested == null)){
                                 res.redirect("/admin?error=nomergerequestfound");
                            } else {
                                mergedspheresrequested.destroy().then(function(){
                                  res.redirect("/admin?success=mergerequestdenied");
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
exports.remove = function(req, res) {

  // Display the user profile if user is logged in.
    if(Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
        var pUserID = user.id;
        if(pUserID !== req.params.rpid) {
            res.redirect('admin?error=notyours');
            return 0;
        } else {
            var SphereJoiners = Parse.Object.extend("SphereJoiners");
            var spherejoinersquery = new Parse.Query(SphereJoiners);
            spherejoinersquery.equalTo("requesterpUserID", req.params.rpid);
            spherejoinersquery.equalTo("sphereObjectID", req.params.id);
            spherejoinersquery.first().then(function(spherejoiner){
              spherejoiner.destroy().then(function(){
                res.redirect("/admin?success=joinrequestremoved");
              });
            });
        }
    });
  }
};
exports.removemergerequest = function(req, res) {
    // Display the user profile if user is logged in.
    if (Parse.User.current()) {
      // We need to fetch because we need to show fields on the user object.
      Parse.User.current().fetch().then(function(user) {
          var fUserID = user.get('fUserID');
          var pUserID = user.id;
          var sphereObjectID = req.params.id;
          var SphereMembers = Parse.Object.extend("SphereMembers");
          var spheremembersquery = new Parse.Query(SphereMembers);
          spheremembersquery.equalTo("pUserID", pUserID);
          spheremembersquery.equalTo("sphereObjectID", sphereObjectID);
          spheremembersquery.first().then(function(spheremember){
             if((typeof spheremember == "undefined") || (spheremember == "")) {
                 res.redirect("/spheres?error=notamemberofsphere");
             } else{
                 var spheresObject = Parse.Object.extend('Spheres');
                 var spheresquery = new Parse.Query(spheresObject);
                 spheresquery.equalTo("objectId", sphereObjectID);
                 spheresquery.first().then(function(sphere){
                     var sphereAdmins = sphere.get("sphereAdmins");
                     var isAdminCheck = _.find(sphereAdmins, function(num){ return num == pUserID; });
                     if(isAdminCheck == "undefined") {
                         res.redirect("/sphere/"+sphereObjectID+"?error=notadmin");
                         return false;
                     } else {
                         return true;
                     }
                 }).then(function(checkedadmin){
                     if(checkedadmin == true) {
                         if(req.params.id == req.params.mid) {
                           res.redirect("/sphere/"+req.params.id+"?error=selfasparent");
                         } else {
                             var MergeRequests = Parse.Object.extend("MergeRequests");
                             var mergerequests = new Parse.Query(MergeRequests);
                             mergerequests.equalTo("childSphere", req.params.id);
                             mergerequests.equalTo("motherSphere", req.params.mid);
                             mergerequests.first().then(function(mergedspheres){
                                if((typeof mergedspheres == "undefined") || (mergedspheres == "") || (mergedspheres == null)){
                                      res.redirect("/admin?error=norequestfound");
                                    return false;
                                } else {
                                    mergedspheres.destroy().then(function(){
                                      res.redirect("/admin?success=mergerequestremoved");  
                                    });
                                }
                             });
                         }
                     }
                 });
             }
          });
      });
    }
};