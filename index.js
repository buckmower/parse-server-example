// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var _ = require('underscore');
var parseExpressRawBody = require('parse-express-raw-body');
// Controller code in separate files.
var subscriptionsController = require('cloud/controllers/subscriptions.js');
var profileController = require('cloud/controllers/userfeed.js');
var votesController = require('cloud/controllers/votes.js');
var adminController = require('cloud/controllers/adminactionitems.js');
var decisionsController = require('cloud/controllers/decisions.js');
var meController = require('cloud/controllers/welcome.js');
var userPictureController = require('cloud/controllers/userpicture.js');
var backgroundPictureController = require('cloud/controllers/backgroundpictures.js');
var homeController = require('cloud/controllers/homepage.js');
var spheresController = require('cloud/controllers/spheres.js');
var sphereController = require('cloud/controllers/sphere.js');
var sphereFundingController = require('cloud/controllers/spherefunding.js');
var spherePictureController = require('cloud/controllers/spherepicture.js');
var electionController = require('cloud/controllers/election.js');
var nominationController = require('cloud/controllers/nomination.js');
var deactivateController = require('cloud/controllers/deactivate.js');
var pictureController = require('cloud/controllers/picture.js');
var electionPictureController = require('cloud/controllers/electionpicture.js');
var notificationsController = require('cloud/controllers/notifications.js');
 
 
//Facebook Login
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var parseFacebookUserSession = require('cloud/parse-facebook-user-session');

//PopRuler Middleware
var popJoinX = require('cloud/pop-join-x');
var popAddToSphereX = require('cloud/pop-add-to-sphere-x');
var errorHandlerMiddlewareX = require('cloud/error-handler-middleware-x');

var app = express();
 
 
var appURL = 'www.represent.xyz'; var appSecret = ''; var appID = ''; //Production

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.bodyParser());
app.use(parseExpressRawBody());
app.use(express.cookieParser('POPRULER_COOKIE'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 6600000 } }));
app.use(errorHandlerMiddlewareX());

// Setup underscore to be available in all templates
app.locals._ = require('underscore');
/*
app.locals.formatTime = function(time) {
  return moment(time).format('MMMM Do YYYY, h:mm a');
};
*/

var fbLogin = parseFacebookUserSession({
  clientId: appID,
  appSecret: appSecret,
  verbose: true,
  redirectUri: '/login',
});

var popJoin = popJoinX();
var popAddToSphere = popAddToSphereX();

// To handle the login redirect.
app.get('/login', fbLogin, function(req, res) {
  if(req.query.data.code == "203"){
    res.redirect("/home?er=signedupwithpassword");
  }
});
app.get('/install', fbLogin, function(req, res){
  if (Parse.User.current()) {
    Parse.User.current().fetch().then(function(user) {
        var installid = req.query.nvzxvedrveraiurbphasdlckndvasdlk20934ur09q3efaslknf09eu40r923rdfajksdnbvadbfkakjfbfkdjbvldfskjbgiurh34039u40r;
        var installationquery = new Parse.Query(Parse.Installation);
        installationquery.equalTo("installationId", installid);
        installationquery.first().then(function(installationobject){
          if((typeof installationobject == "undefined") || (installationobject == "") || (installationobject == null)){
            res.redirect("/spheres?state=notinstalled");
          } else {    
                var membersphereids = new Array();
                var promises3 = new Array();
                var SphereMembers = Parse.Object.extend("SphereMembers");
                var spheremembersquery = new Parse.Query(SphereMembers);
                spheremembersquery.equalTo("pUserID", user.id);
                spheremembersquery.find().then(function(spheresofmember){
                  if((typeof spheresofmember == "undefined") || (spheresofmember == "") || (spheresofmember == null)){
                      installationobject.set("user", user.id);
                      installationobject.save().then(function(){
                        res.redirect("/spheres?state=installed");
                      });
                      return false;
                  } else {
                    _.each(spheresofmember, function(sphereofmember){
                      var membersphereobjectid = sphereofmember.get("sphereObjectID");
                      membersphereids.push(membersphereobjectid);
                    });
                    return Parse.Promise.when(membersphereids).then(function(){
                      return membersphereids;
                    });
                  }
                }).then(function(membersphereids){
                  if(membersphereids !== false){
                    if(membersphereids.length > 0) {
                        installationobject.set("sphereObjectIDs", membersphereids);
                        installationobject.set("user", user.id);
                        installationobject.save().then(function(){
                          res.redirect("/spheres?state=installed");
                        });
                    } else {
                        installationobject.set("user", user.id);
                        installationobject.save().then(function(){
                          res.redirect("/spheres?state=installed");
                        });
                    }
                }
            });
          }
        });
    });
  }
});
app.get('/logout', function(req, res) {
  Parse.User.logOut();
  res.redirect('/');
});
// Show homepage
app.get('/', homeController.index);
app.get('/home', homeController.index);
app.get('/privacy', function(req, res) {
    res.render('privacy/index', {});
});
app.get('/terms', function(req, res) {
    res.render('terms/index', {});
});
app.get('/requestedpasswordreset', function(req, res) {
    res.render('requestedpasswordreset/index', {});
});
// RESTful routes for the page views
app.get('/me', fbLogin, meController.index);
app.get('/notifications', fbLogin, notificationsController.index);
app.get('/profile', fbLogin, meController.index);
app.get('/votes', fbLogin, profileController.index);
app.get('/admin', fbLogin, adminController.index);
app.get('/subscriptions', fbLogin, subscriptionsController.index);
app.get('/decisions', fbLogin, decisionsController.index);
app.get('/spheres', fbLogin, spheresController.index);
app.get('/spheres/create', fbLogin, function(req, res){
  res.redirect('/spheres');
});
app.get('/spheres/search', fbLogin, function(req, res){
  res.redirect('/spheres');
});
//app.get('/spheres/edit/:gid', fbLogin, spheresController.showeditmodal);
//app.get('/spheres/editadmins/:gid', fbLogin, spheresController.editadmins);
app.get('/sphere', fbLogin, function(req, res){
  res.redirect("/spheres");
});
app.get('/election', fbLogin, electionController.index);
app.get('/nomination', fbLogin, nominationController.index);
app.get('/deactivate', fbLogin, deactivateController.index);
app.get('/sphere/:id', popJoin, fbLogin, sphereController.idofsphere);
app.get('/join/sphere/:id', fbLogin, popAddToSphere, function(req, res){
  res.redirect("/sphere/"+req.params.id);
});
app.get('/public/sphere/:id', sphereController.publicsphere);
app.get('/sphere/:id/members', fbLogin, sphereController.spheremembers);
app.get('/sphere/:id/funding', fbLogin, sphereFundingController.index);
app.get('/sphere/:id/members/sendemails', fbLogin, sphereController.spheresendemails);
app.get('/sphere/:id/create', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id);
});
app.get('/sphere/:id/edit', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id);
});
app.get('/sphere/:id/delete', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id);
});
app.get('/sphere/:id/election/:eid/editelectiondescription', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.nid);
});
app.get('/sphere/:id/election/:eid/createFromFacebook', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid);
});
app.get('/sphere/:id/election/:eid/createCustom', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid);
});
app.get('/sphere/:id/election/:eid/search', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid);
});
app.get('/sphere/:id/election/:eid', popJoin, fbLogin, electionController.idofelection);
app.get('/public/sphere/:id/election/:eid', function(req, res){
  res.redirect("public/sphere/"+req.params.id);
});
app.get('/sphere/:id/election/:eid/nomination/:nid', popJoin, fbLogin, nominationController.idofnomination);
app.get('/public/sphere/:id/election/:eid/nomination/:nid', function(req, res){
  res.redirect("public/sphere/"+req.params.id);
});
app.get('/sphere/:id/election/:eid/nomination/:nid/editnomination', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid+'nomination/'+req.params.nid);
});
app.get('/sphere/:id/election/:eid/nomination/:nid/castvote', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid+'/nomination/'+req.params.nid);
});
app.get('/sphere/:id/election/:eid/nomination/:nid/takevoteback', fbLogin, function(req, res){
  res.redirect('/sphere/'+req.params.id+'/election/'+req.params.eid+'nomination/'+req.params.nid);
});
app.get('/votes/takevoteback', fbLogin, function(req, res){
  res.redirect('/votes');
});
app.post('/search', homeController.search);
app.post('/signup', homeController.signup);
app.post('/emaillogin', homeController.login);
app.post('/requestpasswordreset', function(req, res) { 
    var userquery = new Parse.Query(Parse.User);
    userquery.equalTo("email", req.body.resetemail);
    userquery.first().then(function(user){
      if((typeof user == "undefined") || (user == "") || (user == null)){
         res.redirect("/requestedpasswordreset?error=notregistered&email="+req.body.resetemail);
      } else {
        Parse.User.requestPasswordReset(req.body.resetemail, {
          success: function(){
            res.redirect("/requestedpasswordreset?success=1&email="+req.body.resetemail);
          }, error: function(){
            res.redirect("/?error=1");
          }
        });
      }
    });
});
app.post('/me/:id/picture/:pid/makeprofile', fbLogin, userPictureController.makeprofile);
app.post('/me/:id/picture/:pid/remove', fbLogin, userPictureController.remove);
app.post('/me/editdescription', fbLogin, meController.editprofile);
app.post('/spheres', fbLogin, spheresController.create)
app.post('/striperequest', fbLogin, subscriptionsController.striperequest);
app.post('/spheres/create', fbLogin, spheresController.create);
app.post('/spheres/search', fbLogin, spheresController.search);
app.post('/spheres/leavesphere', fbLogin, spheresController.leavesphere);
app.post('/spheres/leavesphereparent', fbLogin, spheresController.leavesphereparent);
app.post('/spheres/optbackin', fbLogin, spheresController.optbackin);
app.post('/sphere/:id/create', fbLogin, sphereController.create);
app.post('/sphere/:id/delete', fbLogin, sphereController.delete);
app.post('/sphere/:id/search', fbLogin, sphereController.search);
app.post('/sphere/:id/addadmin/:pid', fbLogin, sphereController.addadmin);
app.post('/sphere/:id/searchmembers', fbLogin, sphereController.searchmembers);
app.post('/sphere/:id/editsphere', fbLogin, sphereController.editsphere);
app.post('/sphere/:id/invitespheremembers', fbLogin, sphereController.invitespheremembers);
app.post('/sphere/:id/deleteinvite', fbLogin, sphereController.deleteinvite);
app.post('/sphere/:id/deleteallinvites', fbLogin, sphereController.deleteallinvites);
app.post('/sphere/:id/joinsphere', fbLogin, sphereController.joinsphere);
app.post('/sphere/:id/removemember/:mpid', fbLogin, sphereController.removememberfromsphere);
app.post('/sphere/:id/mergerequest/:mid', fbLogin, sphereController.mergerequest);
app.post('/sphere/:id/removemergerequest/:mid', fbLogin, sphereController.removemergerequest);
app.post('/sphere/:id/requestspherejoin', fbLogin, sphereController.requestspherejoin);
app.post('/sphere/:id/removeparent', fbLogin, sphereController.removeparent);
app.post('/sphere/:id/removechild/:cid', fbLogin, sphereController.removechild);
app.post('/me/:id/backgroundpicture/remove', fbLogin, backgroundPictureController.removeuserbackgroundpicture);
app.post('/sphere/:id/election/:eid/backgroundpicture/remove', fbLogin, backgroundPictureController.removeelectionbackgroundpicture);
app.post('/sphere/:id/election/:eid/nomination/:nid/backgroundpicture/remove', fbLogin, backgroundPictureController.removenominationbackgroundpicture);
app.post('/sphere/:id/backgroundpicture/remove', fbLogin, backgroundPictureController.removespherebackgroundpicture);
app.post('/sphere/:id/picture/:pid/makeprofile', fbLogin, spherePictureController.makeprofile);
app.post('/sphere/:id/picture/:pid/remove', fbLogin, spherePictureController.remove);
app.post('/sphere/:id/members/searchmembersbyemail', fbLogin, sphereController.searchmembersbyemail);
app.post('/sphere/:id/members/searchinvitesbyemail', fbLogin, sphereController.searchinvitesbyemail);
app.post('/sphere/:id/members/searchmembersbyname', fbLogin, sphereController.searchmembersbyname);
app.post('/sphere/:id/sendemailtomembers', fbLogin, sphereController.sendemailtomembers);
app.post('/sphere/:id/election/:eid/edit', fbLogin, electionController.edit);
app.post('/sphere/:id/election/:eid/createCustom', fbLogin, electionController.createCustom);
app.post('/sphere/:id/election/:eid/searchmemberstonominate', fbLogin, electionController.searchmemberstonominate);
app.post('/sphere/:id/election/:eid/nominatemember/:puserid', fbLogin, electionController.nominatemember);
app.post('/sphere/:id/election/:eid/search', fbLogin, electionController.search);
app.post('/sphere/:id/election/:eid/picture/:pid/makeprofile', fbLogin, electionPictureController.makeprofile);
app.post('/sphere/:id/election/:eid/picture/:pid/remove', fbLogin, electionPictureController.remove);
app.post('/sphere/:id/election/:eid/nomination/:nid/editnomination', fbLogin, nominationController.editnomination);
app.post('/sphere/:id/election/:eid/nomination/:nid/deletenomination', fbLogin, nominationController.deletenomination);
app.post('/sphere/:id/election/:eid/nomination/:nid/castvote', fbLogin, nominationController.castvote);
app.post('/sphere/:id/election/:eid/nomination/:nid/takevoteback', fbLogin, nominationController.takevoteback);
app.post('/sphere/:id/election/:eid/nomination/:nid/picture/:pid/makeprofile', fbLogin, pictureController.makeprofile);
app.post('/sphere/:id/election/:eid/nomination/:nid/picture/:pid/remove', fbLogin, pictureController.remove);
app.post('/votes/takevoteback', fbLogin, votesController.takevoteback);
app.post('/admin/spherejoiner/:id/:rpid/approve', fbLogin, adminController.approve);
app.post('/admin/spherejoiner/:id/:rpid/decline', fbLogin, adminController.decline);
app.post('/admin/spherejoiner/:id/:rpid/remove', fbLogin, adminController.remove);
app.post('/admin/spheremerger/:id/:mid/approve', fbLogin, adminController.approvespheremerger);
app.post('/admin/spheremerger/:id/:mid/decline', fbLogin, adminController.declinespheremerger);
app.post('/admin/spheremerger/:id/:mid/remove', fbLogin, adminController.removemergerequest);

 
// Attach the Express app to Cloud Code.
app.listen();
