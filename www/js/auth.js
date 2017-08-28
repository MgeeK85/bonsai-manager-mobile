'use strict';

angular.module('starter')
    .factory('AuthService', ['User', '$q', '$rootScope', 'ngDialog', function(User, $q, $rootScope, ngDialog) {

        function login(loginData) {
            return User
                .login(loginData)
                .$promise
                .then(function(response) {
                        $rootScope.currentUser = {
                            id: response.user.id,
                            tokenId: response.id,
                            username: loginData.username
                        };
                        $rootScope.$broadcast('login:Successful');
                    },
                    function(response){

                        var message = '\
                            <div class="ngdialog-message">\
                            <div><h3>Login Unsuccessful</h3></div>' +
                            '<div><p>' +  response.data.error.message + '</p><p>' +
                            response.data.error.name + '</p></div>' +
                            '<div class="ngdialog-buttons">\
                                <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                            </div>'

                        ngDialog.openConfirm({ template: message, plain: 'true'});
                    });
        }

        function isAuthenticated() {
            return $rootScope.currentUser;
        }

        function getUsername() {
            return $rootScope.currentUser.username;
        }

        function logout() {
            return User
                .logout()
                .$promise
                .then(function() {
                    $rootScope.currentUser = null;
                    $rootScope.$broadcast('logout');
                });
        }

        function register(registerData) {
            return User
                .create({
                    username: registerData.username,
                    email: registerData.email,
                    password: registerData.password
                })
                .$promise
                .then (function(response) {

                    },
                    function(response){

                        var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                            '<div><p>' +  response.data.error.message +
                            '</p><p>' + response.data.error.name + '</p></div>';

                        ngDialog.openConfirm({ template: message, plain: 'true'});

                    });
        }

        function refresh(accessTokenId) {
            return User
                .getCurrent(function(userResource) {
                    $rootScope.currentUser = {
                        id: userResource.id,
                        tokenId: accessTokenId,
                        email: userResource.email
                    };
                });
        }

        return {
            login: login,
            logout: logout,
            register: register,
            refresh: refresh,
            isAuthenticated: isAuthenticated,
            getUsername: getUsername
        };
    }])

    .factory('$localStorage', ['$window', function ($window) {
        return {
            store: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            storeObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            }
        }
    }])

    .factory('$user', function(User) {
        var ret = {};

        // This function reloads the currently logged in user
        ret.load = function() {
            User.findById({ id: 'me' }, function(v) {
                ret.data = v;
            });
        };

        ret.load();

        return ret;
    })

    .factory('$facebookLogin', function($user) {
        return function() {
            var url = 'http://localhost:3000/auth/facebook';
            //var url = 'https://bonsai-manager.mybluemix.net/auth/facebook';

            var ref = window.open(url, '_self', 'location=no');

            // For Cordova
            if (window.cordova) {
                ref.addEventListener('loadstop', function(ev) {
                    if (ev.url.indexOf('/auth/facebook/callback') !== -1) {
                        ref.close();
                        $user.load();
                    }
                });
            } else {
                // For `ionic serve --lab`. Wait for the user to close the window
                // and, when they do, check the server to see if they're now logged in.
                var interval = setInterval(function() {
                    if (ref.closed) {
                        $user.load();
                        clearInterval(interval);
                    }
                }, 100);
            }
        };
    })

    .factory('$googleLogin', function($user) {
        return function() {
            //var url = 'http://localhost:3000/auth/google';
            var url = 'https://bonsai-manager.mybluemix.net/auth/google';

            var ref = window.open(url, '_self', 'location=no');

            // For Cordova
            if (window.cordova) {
                ref.addEventListener('loadstop', function(ev) {
                    if (ev.url.indexOf('/auth/google/callback') !== -1) {
                        ref.close();
                        $user.load();
                    }
                });
            } else {
                // For `ionic serve --lab`. Wait for the user to close the window
                // and, when they do, check the server to see if they're now logged in.
                var interval = setInterval(function() {
                    if (ref.closed) {
                        $user.load();
                        clearInterval(interval);
                    }
                }, 100);
            }
        };
    })

    .factory('$twitterLogin', function($user) {
        return function() {
            //var url = 'http://localhost:3000/auth/twitter';
            var url = 'https://bonsai-manager.mybluemix.net/auth/twitter';

            var ref = window.open(url, '_self', 'location=no');

            // For Cordova
            if (window.cordova) {
                ref.addEventListener('loadstop', function(ev) {
                    if (ev.url.indexOf('/auth/twitter/callback') !== -1) {
                        ref.close();
                        $user.load();
                    }
                });
            } else {
                // For `ionic serve --lab`. Wait for the user to close the window
                // and, when they do, check the server to see if they're now logged in.
                var interval = setInterval(function() {
                    if (ref.closed) {
                        $user.load();
                        clearInterval(interval);
                    }
                }, 100);
            }
        };
    });
