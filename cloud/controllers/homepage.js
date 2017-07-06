var _ = require('underscore');
exports.index = function(req, res) {
    Parse.Promise.when([ 
        Parse.Cloud.run("somerandomspheres", {}), // r1
    ]).then(function(r1){
        var somerandomspheres = r1 || "";
        var errorquery = req.query.er || null;
        var messagequery = req.query.message || null;
        if(errorquery == "incorrectlogin"){
          res.redirect("/home?message=incorrectlogin");
        } 
        else if (errorquery == "facebookemailsignedupwithpassword"){
          res.redirect("/home?message=facebookemailsignedupwithpassword");
        } else {
          if(messagequery == "incorrectlogin"){
            var loginerrormessagehiddenorshown = "";
          } else {
            var loginerrormessagehiddenorshown = "hidden";
          }
          res.render('home/index', {
            randomspheres: somerandomspheres,
            loginerrormessagehiddenorshown: loginerrormessagehiddenorshown
          });
        }
    });
};
exports.signup = function(req, res) {
    var userquery = new Parse.Query(Parse.User);
    userquery.equalTo("email", req.body.email);
    userquery.first().then(function(signedup){
       if((typeof signedup == "undefined") || (signedup == "") || (signedup == null)) {
            var user = new Parse.User();
            user.set("username", req.body.email);
            user.set("password", req.body.password);
            user.set("name", req.body.name);
            user.set("email", req.body.email);

            user.signUp(null, {
              success: function(user) {
                res.redirect("/spheres?state=initiallogin");
              },
              error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
              }
            });
       } else {
           res.send("alreadysignedup");
       }
    });
};
exports.login = function(req, res) {
    Parse.User.logIn(req.body.email, req.body.password, {
      success: function(user) {
        // Do stuff after successful login.
        res.redirect("/spheres?state=initiallogin");
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        res.send(false);
      }
    });
};
exports.search = function(req, res) {
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
};
