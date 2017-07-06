var moment = require('moment');
var _ = require('underscore');
var querystring = require('querystring');
var Image = require("parse-image");
/**
 * @name parseFacebookUserSession
 * @class
 *
 * <p>A middleware module for logging in a Parse.User using Facebook in express.
 * For more information, see <a href="https://parse.com/docs/hosting_guide#webapp-facebook">our
 * hosting guide</a>.</p>
 *
 * <p>Params includes the following:<pre>
 *   clientId    (required): The client id of the Facebook App.
 *   appSecret   (required): The app secret of the Facebook App.
 *   verbose     (optional): If true, output debug messages to console.log.
 *   redirectUri (optional): The path on this server to use for handling the
 *       redirect callback from Facebook. If this is omitted, it defaults to
 *       /login.</pre></p>
 */
var parseFacebookUserSession = function(params) {
  params = params || {};

  if (!params.clientId || !params.appSecret) {
    throw "You must specify a Facebook clientId and appSecret.";
  }

  /**
   * Logs using console.log if verbose is passed in when configuring the
   * middleware.
   */
  var maybeLog = function() {
    if (params.verbose) {
      console.log.apply(console, arguments);
    }
  };

  var relativeRedirectUri = params.redirectUri || "/login";

  /**
   * Returns the absolute url of the redirect path for this request.
   */
  var getAbsoluteRedirectUri = function(req) {
    return 'https://' + req.host + relativeRedirectUri;
  };

  /**
   * Starts the Facebook login OAuth process.
   */
  var beginLogin = function(req, res) {
    maybeLog("Starting Facebook login...");

    Parse.Promise.as().then(function() {
      // Make a request object. Its objectId will be our XSRF token.
      maybeLog("Creating ParseFacebookTokenRequest...");
      var url = 'https://' + req.host + req.path;
      var request = new Parse.Object("ParseFacebookTokenRequest");
      return request.save({
        url: url,
        ACL: new Parse.ACL()
      });

    }).then(function(request) {
      maybeLog("Redirecting for Facebook OAuth.");

      // Put the XSRF token into a cookie so that we can match it later.
      res.cookie("requestId", request.id);

      // Redirect the user to start the Facebook OAuth flow.
      var url = 'https://www.facebook.com/dialog/oauth?';
      url = url + querystring.stringify({
        client_id: params.clientId,
        redirect_uri: getAbsoluteRedirectUri(req),
        scope: 'email',
        state: request.id
      });
      res.redirect(302, url);

    });
  };

  /**
   * Handles the last stage of the Facebook login OAuth redirect.
   */
  var endLogin = function(req, res) {
    maybeLog("Handling request callback for Facebook login...");

    if (req.query.state !== req.cookies.requestId) {
      maybeLog("Request failed XSRF validation.");
      res.send(500, "Bad Request");
      return;
    }

    var url = 'https://graph.facebook.com/oauth/access_token?';
    url = url + querystring.stringify({
      client_id: params.clientId,
      redirect_uri: getAbsoluteRedirectUri(req),
      client_secret: params.appSecret,
      code: req.query.code
    });

    var accessToken = null;
    var expires = null;
    var facebookData = null;

    Parse.Promise.as().then(function() {
      maybeLog("Fetching access token...");
      return Parse.Cloud.httpRequest({ url: url });

    }).then(function(response) {
      maybeLog("Fetching user data from Facebook...");

      var data = querystring.parse(response.text);
      accessToken = data.access_token;
      expires = data.expires;

      var url = 'https://graph.facebook.com/me?';
      url = url + querystring.stringify({
        access_token: accessToken
      });
      return Parse.Cloud.httpRequest({ url: url });

    }).then(function(response) {
      maybeLog("Logging into Parse with Facebook token...");

      facebookData = response.data;
      var expiration = moment().add('seconds', expires).format(
          "YYYY-MM-DDTHH:mm:ss.SSS\\Z");
      var userquery = new Parse.Query(Parse.User);
      userquery.equalTo("email", facebookData.email);
      userquery.find().then(function(users){
        var usersignedinwithpassword = [];
        _.each(users, function(user){
          if((typeof user.email !== "undefined") && (user.email !== "") && (user.email !== null)){
            if((typeof user.fUserID == "undefined") || (user.fUserID == "") || (user.fUserID == null)){
              usersignedinwithpassword.push(true);
            } else {
              usersignedinwithpassword.push(false);
            }
          }
        });
        return Parse.Promise.when(usersignedinwithpassword).then(function(){
          return usersignedinwithpassword;
        });
      }).then(function(emailsignupstatus){
        var didusersignupwithpassword = _.contains(emailsignupstatus, true);
        if(didusersignupwithpassword){
          res.redirect("/?er=facebookemailsignedupwithpassword");
          return false;
        } else {
          return Parse.FacebookUtils.logIn({
            id: response.data.id,
            access_token: accessToken,
            expiration_date: expiration
          });
        }
      }).then(function(response) {
        if(response !== false) {
          maybeLog("Becoming Parse user...");
          return Parse.User.become(response.getSessionToken());
        } else {
          return false;
        }
      }).then(function(user) {
        if(user !== false){
          maybeLog("Saving Facebook data for user...");
          user.set("name", facebookData.name);
          user.set("email", facebookData.email);
          user.set("fUserID", facebookData.id);
          user.set("fAccessToken", accessToken);
          return user.save();
        } else {
          return false;
        }
      }).then(function(userobject) {
        if(userobject !== false){
          maybeLog("Fetching ParseFacebookTokenRequest for " +
                   req.query.state + "...");
          var request = new Parse.Object("ParseFacebookTokenRequest");
          request.id = req.query.state;
          return request.fetch({ useMasterKey: true });
        } else {
          return false;
        }
      }).then(function(request) {
        if(request !== false){
          maybeLog("Deleting used ParseFacebookTokenRequest...");
          // Let's delete this request so that no one can reuse the token.
          var url = request.get("url");
          return request.destroy({ useMasterKey: true }).then(function() {
            return url;
          });
        } else {
          return false;
        }
      }).then(function(url) {
        if(url !== false){
          maybeLog("Success!");
          res.redirect(302, url+"?state=initiallogin");
        } else {
          return false;
        }
      }, function(error) {
        maybeLog("Failed! " + JSON.stringify(error));
        if(error.code == "203"){
          res.redirect("/?er=facebookemailsignedupwithpassword");
        } else {
          res.redirect("/?er=1&message="+error);
        }
      });
    });
  };

  /**
   * The actual middleware method.
   */
  return function(req, res, next) {
    // If the user is already logged in, there's nothing to do.
    if (Parse.User.current()) {
      return next();
    }

    // If this is the Facebook login redirect URL, then handle the code.
    var absoluteRedirectUri = 'https://' + req.host + relativeRedirectUri;
    if (req.path === relativeRedirectUri) {
      endLogin(req, res);
    } else {
      beginLogin(req, res);
    }
  };
};

module.exports = parseFacebookUserSession;