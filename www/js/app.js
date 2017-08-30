angular.module('starter', [
    'ionic',
    'starter.controllers',
    'ngDialog',
    'lbServices',
    'nvd3'
])

.run(function($ionicPlatform, $rootScope, $state, LoopBackAuth, AuthService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

      $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
          // redirect to login page if not logged in
          if (toState.authenticate && !LoopBackAuth.accessTokenId) {
              event.preventDefault(); //prevent current page from loading
              // Maintain returnTo state in $rootScope that is used
              // by authService.login to redirect to after successful login.
              // http://www.jonahnisenson.com/angular-js-ui-router-redirect-after-login-to-requested-url/
              $rootScope.returnTo = {
                  state: toState,
                  params: toParams
              };
              $state.go('tabs.home');
          }
      });

      // Get data from localstorage after pagerefresh
      // and load user data into rootscope.
      if (LoopBackAuth.accessTokenId && !$rootScope.currentUser) {
          console.log("page refresh");
          AuthService.refresh(LoopBackAuth.accessTokenId);
      }

  });
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        return {
            request: function(req) {


                // Transform **all** $http calls so that requests that go to `/`
                // instead go to a different origin, in this case localhost:3000
                if (req.url.charAt(0) === '/') {
                    req.url = 'http://localhost:3000' + req.url;
                    //req.url = 'https://bonsai-manager.mybluemix.net' + req.url;

                    console.log("interceptor req url: ", req.url);

                    // and make sure to send cookies too
                    req.withCredentials = true;
                }

                return req;
            }
        };
    });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabsCtrl as tabs'
  })

  // Each tab has its own nav history stack:
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl as home'
      }
    }
  })

  .state('tab.list', {
    url: '/list',
    views: {
      'tab-list': {
        templateUrl: 'templates/tab-list.html',
        controller: 'ListCtrl as list'
      }
    }
  })

  .state('tab.newedit', {
      url: '/newedit',
      views: {
          'tab-newedit': {
              templateUrl: 'templates/tab-newedit.html',
              controller: 'NewEditCtrl as newedit'
          }
      }
  })

  .state('tab.detail', {
      url: '/detail/:id',
      views: {
          'tab-detail': {
              templateUrl: 'templates/bonsai-detail.html',
              controller: 'BonsaiDetailCtrl as detail'
          }
      }
  })



  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
