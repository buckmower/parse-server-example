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