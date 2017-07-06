var _ = require('underscore');
var querystring = require('querystring');

exports.index = function(req, res) {
    function fpages(after) {
        if (Parse.User.current()) {
            Parse.User.current().fetch().then(function(user) {
                var accesstoken = user.get('fAccessToken');
                Parse.Cloud.httpRequest({
                  url: 'https://graph.facebook.com/me/likes',
                  params: {
                    after : after,
                    access_token : accesstoken,
                  },
                  success: function(httpResponse) {
                    var facebookpagedata = httpResponse.data;
                    
                    var pagedata = facebookpagedata.data;
                    _.each(pagedata, function(value, key) {
                        var PagesObject = Parse.Object.extend('Pages');
                        var query = new Parse.Query(PagesObject);
                        query.equalTo("pageID", value.id);
                        query.first({
                          success: function(results) {
                                if(typeof results !== "undefined") {
                                    
                                } else {
                                    var Pages = new PagesObject();
                                    Pages.set("pageID", value.id);
                                    Pages.set("pageName", value.name);
                                    Pages.save(null, {
                                      success: function(Pages) {
                                      },
                                      error: function(Pages, error) {
                                        console.log('Failed to create new object, with error code: ' + error.message);
                                      }
                                    });
                                }
                          },
                          error: function(error) {
                          }
                        });
                        
                    });
        
                    var facebookdatapaging = facebookpagedata.paging.next;
                    if((facebookdatapaging === "") || (typeof facebookdatapaging === "undefined") || (facebookdatapaging === null)) {
                         return 1;
                    } else {
                         var facebookdataafter = facebookpagedata.paging.cursors.after;
                         return fpages(facebookdataafter);
                    }
                  },
                  error: function(httpResponse) {
                    console.error('Request failed with response code ' + httpResponse.status);
                  }
                });
            });
        } 
        else {
              // User not logged in, redirect to login form.
             res.redirect('/login');
        }
    }
    function fmemberpage() {
        if (Parse.User.current()) {
            Parse.User.current().fetch().then(function(user) {
                var PagesObject = Parse.Object.extend('Pages');
                var query = new Parse.Query(PagesObject);
                query.equalTo("pageID", user.get('fUserID'));
                query.first({
                  success: function(results) {
                        if(typeof results !== "undefined") {
                            
                        } else {
                            var Pages = new PagesObject();
                            Pages.set("pageID", user.get('fUserID'));
                            Pages.set("pageName", user.get('name'));
                            Pages.save(null, {
                              success: function(Pages) {
                              },
                              error: function(Pages, error) {
                                console.log('Failed to create new object, with error code: ' + error.message);
                              }
                            });
                        }
                  },
                  error: function(error) {
                  }
                });
            });
        }
    }
    function fspheres(next) {
        if (Parse.User.current()) {
            Parse.User.current().fetch().then(function(user) {
                var accesstoken = user.get('fAccessToken');
                if((typeof next === "undefined") || (next === "") || (next === null)) {
                    var url = 'https://graph.facebook.com/me/spheres?';
                    var furl = url + querystring.stringify({
                        access_token: accesstoken
                      });
                } else {
                    var furl = next;
                }
                Parse.Cloud.httpRequest({
                  url: furl,
                  success: function(httpResponse) {
                    var facebookpagedata = httpResponse.data;
                    
                    var pagedata = facebookpagedata.data;
                    _.each(pagedata, function(value, key) {
                        var spheresObject = Parse.Object.extend('spheres');
                        var query = new Parse.Query(spheresObject);
                        query.equalTo("sphereID", value.id);
                        query.first({
                          success: function(results) {
                                if(typeof results !== "undefined") {
                                    
                                } else {
                                    var spheres = new spheresObject();
                                    spheres.set("sphereID", value.id);
                                    spheres.set("sphereName", value.name);
                                    spheres.save(null, {
                                      success: function(spheres) {
                                      },
                                      error: function(spheres, error) {
                                        console.log('Failed to create new object, with error code: ' + error.message);
                                      }
                                    });
                                }
                          },
                          error: function(error) {
                          }
                        });
                        
                        var SphereMembersObject = Parse.Object.extend('SphereMembers');
                        var SphereMembers = new SphereMembersObject();
                        if(value.administrator === true) {
                            var admin = 1;
                        } else {
                            var admin = 0;
                        }
                        SphereMembers.set("sphereID", value.id);
                        SphereMembers.set("sphereName", value.name);
                        SphereMembers.set("fMemberID", user.get('fUserID'));
                        SphereMembers.set("fMemberName", user.get('name'));
                        SphereMembers.set("administrator", admin);
                        SphereMembers.save(null, {
                          success: function(SphereMembers) {
                          },
                          error: function(SphereMembers, error) {
                            console.log('Failed to create new object, with error code: ' + error.message);
                          }
                        }); 
              
                    });
                    var facebookdatapaging = facebookpagedata.paging.next;
                    if((facebookdatapaging === "") || (typeof facebookdatapaging === "undefined") || (facebookdatapaging === null)) {
                         return 1;
                    } else {
                         return fspheres(facebookdatapaging);
                    }
                  },
                  error: function(httpResponse) {
                    console.error('Request failed with response code ' + httpResponse.status);
                  }
                });
            });
        } 
        else {
              // User not logged in, redirect to login form.
             res.redirect('/login');
        }
    }
    var after = "";
    fpages(after);
    fmemberpage();
    //Delete Old spheres Of Member
    if (Parse.User.current()) {
      Parse.User.current().fetch().then(function(user) {
        var SphereMembersObject = Parse.Object.extend('SphereMembers');
        var membersquery = new Parse.Query(SphereMembersObject);
        membersquery.equalTo("fMemberID", user.get('fUserID'));
        membersquery.find({
              success: function(results) {
                  for(var i=0; i < results.length; i++) {
                      var object = results[i];
                      object.destroy({
                          success: function(object) {
                            // The object was deleted from the Parse Cloud.
                          },
                          error: function(object, error) {
                            // The delete failed.
                            // error is a Parse.Error with an error code and message.
                          }
                    });
                  }
              },
              error: function(error) {
                  
              }
        });
      });
    }
    var next = "";
    fspheres(next);
};