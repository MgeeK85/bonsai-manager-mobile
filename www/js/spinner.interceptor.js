(function(){

    'use strict';

    angular.module('starter')

        .factory('httpInterceptor', function ($q, $rootScope, $log) {

            var numLoadings = 0;

            return {
                request: function (config) {

                    numLoadings++;

                    console.log("num loading", numLoadings);

                    // Show loader
                    $rootScope.$broadcast("loader_show");
                    return config || $q.when(config)

                },
                response: function (response) {

                    console.log("num loading", numLoadings);

                    if ((--numLoadings) === 0) {
                        // Hide loader
                        $rootScope.$broadcast("loader_hide");
                    }

                    return response || $q.when(response);

                },
                responseError: function (response) {

                    if (!(--numLoadings)) {
                        // Hide loader
                        $rootScope.$broadcast("loader_hide");
                    }

                    return $q.reject(response);
                }
            };
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
        });
})();

