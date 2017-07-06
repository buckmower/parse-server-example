var popAddToSphereX = function() {
  return function(req, res, next) {
      // If the user is already logged in, there's nothing to do.
      if(Parse.User.current()) {
        Parse.User.current().fetch().then(function(user) {
          var useremail = user.get("email");
          var pUserID = user.id;
          var name = user.get("name");
          var fUserID = user.get("fUserID");
          var InvitedSphereMembers = Parse.Object.extend("InvitedSphereMembers");
          var invitedspheremembersquery = new Parse.Query(InvitedSphereMembers);
          invitedspheremembersquery.equalTo("email", useremail);
          invitedspheremembersquery.first().then(function(invitedspheremember){
            if((typeof invitedspheremember == "undefined") || (invitedspheremember == "")){
              return next();
            } else {
              var SphereMembers = Parse.Object.extend("SphereMembers");
              var spheremembersquery = new Parse.Query(SphereMembers);
              spheremembersquery.equalTo("pUserID", pUserID);
              spheremembersquery.first().then(function(spheremember){
                if((typeof spheremember == "undefined") || (spheremember == "") || (spheremember === null)){
                  var SphereMembers = Parse.Object.extend("SphereMembers");
                  var SphereMember = new SphereMembers();
                  SphereMember.set("pUserID", pUserID);
                  SphereMember.set("fMemberID", fUserID);
                  SphereMember.set("name", name);
                  SphereMember.set("sphereObjectID", req.params.id);
                  SphereMember.set("administrator", false);
                  SphereMember.set("fMemberID", fUserID);
                  SphereMember.save(null, {
                    success: function(spheremember){
                      invitedspheremember.destroy().then(function(){
                        return next();
                      });
                    },
                    error: function(spheremember, error){
                      return next();
                    }
                  });
                } else {
                  return next();
                }
              });
            }
          });
        });
      }
  };
};
module.exports = popAddToSphereX;