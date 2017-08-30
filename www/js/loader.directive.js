(function(){

    'use strict';

    angular.module('starter')

        .directive("loader", function ($rootScope) {
                return function ($scope, element, attrs) {
                    $scope.$on("loader_show", function () {
                        console.log("element",element);
                        //return element.show();
                        return document.getElementById('loaderDiv').style.display = 'block';
                    });
                    return $scope.$on("loader_hide", function () {
                        //return element.hide();
                        return document.getElementById('loaderDiv').style.display = 'none';
                    });
                };
            }
        );
})();

