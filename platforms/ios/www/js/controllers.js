angular.module('starter.controllers', [])

.controller('TabsCtrl', function($scope, $ionicModal, $ionicPopup, $rootScope, $state, $filter, $localStorage,
                                 $log, ngDialog, User, AuthService){

    var vm = this;

    vm.openMyModal = openMyModal;
    vm.closeModal = closeModal;
    vm.doLogin = doLogin;
    vm.doLogout = doLogout;
    vm.openRegister = openRegister;

    $rootScope.$on('login:Successful', function () {
        vm.loggedIn = AuthService.isAuthenticated();
        vm.username = AuthService.getUsername();
    });

    $rootScope.$on('logout', function () {
        vm.loggedIn = false;
        vm.username = '';
    });

    $scope.$watch('currentUser.id', function(value) {
        if (!value) {
            return;
        }

        console.log("value", value);

        vm.loggedIn = true;
    });


    $ionicModal.fromTemplateUrl('../templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        vm.modal = modal;
    });



    init();

    ///////////////////////////


    function init() {

        console.log("tabs");

        vm.loggedIn = false;
        vm.modal = null;


    }

    function openMyModal() {
        vm.modal.show();
    }

    function closeModal() {
        vm.modal.hide();
    }

    function doLogin() {
        console.log("login");

        if(vm.rememberMe)
            $localStorage.storeObject('userinfo',vm.loginData);

        AuthService.login(vm.loginData);

        vm.modal.hide();

    }

    function doLogout() {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout',
            template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
            if(res) {
                AuthService.logout()
                    .then(function() {
                        $state.go('tab.home');
                    });
            } else {

            }
        });


    }

    function openRegister() {

        console.log("register");
        ngDialog.open(
            {
                template: 'views/register.html',
                scope: $scope,
                className: 'ngdialog-theme-default',
                controller:"RegisterCtrl"
            }
        );
    }


})

.controller('HomeCtrl', function($scope, $rootScope, $state, $filter, $log, ngDialog, User, AuthService) {


    var vm = this;

    vm.openLogin = openLogin;
    vm.bonsaiDetail = bonsaiDetail;
    vm.getSecondIndex = getSecondIndex;

    $scope.$watch('currentUser.id', function(value) {
        if (!value) {
            return;
        }


        console.log("value", value);

        vm.loggedIn = true;

        User.bonsais({ id: 'me' })
            .$promise.then(
            function (response) {
                vm.bonsais = response;

                console.log("bonsais", vm.bonsais);

                vm.data = [];

                if(vm.bonsais && vm.bonsais.length > 0) {

                    // compute species occurrences
                    var speciesOccurences = vm.bonsais.reduce(function(sums,entry){
                        sums[entry.species] = (sums[entry.species] || 0) + 1;
                        return sums;
                    },{});

                    angular.forEach(speciesOccurences, function(value, key) {
                        console.log(key + ': ' + value.species);

                        vm.data.push({
                            key: $filter('limitTo')(key, 10),
                            y: value
                        })
                    });

                    $log.info("result", speciesOccurences);

                    var totalAges = 0;

                    // compute mean age
                    angular.forEach(vm.bonsais, function(value, key) {
                        totalAges += value.age;
                    });

                    vm.meanAge = totalAges / vm.bonsais.length;

                    $log.info("mean age", vm.meanAge);
                }

            },
            function (response) {
                vm.message = "Error: " + response.status + " " + response.statusText;
            });

    });

    init();

    ///////////////////////////


    function init() {

        console.log("home");


        /* Chart options */
        vm.options = {
            chart: {
                type: 'pieChart',
                height: 300,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };




    }

    function getSecondIndex(index) {
        console.log("index", index);
        if(vm.bonsais.length>=0)
            return vm.bonsais.length;
        else
            return index;
    }

    function openLogin() {
        ngDialog.open({ template: 'views/login.html', scope: $scope,
            className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    }

    function bonsaiDetail(bonsaiId) {
        console.log("bonsai id", bonsaiId);

        if(bonsaiId) {
            $state.go('app.bonsaidetail', { id: bonsaiId});
        }
    }

})

.controller('NewEditCtrl', function($scope) {

})

.controller('ListCtrl', function($rootScope, $scope, User, AuthService) {

    var vm = this;

    vm.bonsaiDetail = bonsaiDetail;

    $rootScope.$on('login:Successful', function () {
        vm.loggedIn = AuthService.isAuthenticated();
        vm.username = AuthService.getUsername();
    });

    $rootScope.$on('logout', function () {
        vm.loggedIn = false;
        vm.username = '';
    });

    $scope.$watch('currentUser.id', function(value) {
        if (!value) {
            return;
        }

        vm.loggedIn = true;

        console.log("value",  $rootScope.currentUser);

        User.bonsais({ id: 'me' })
            .$promise.then(
            function (response) {
                vm.bonsais = response;

                console.log("bonsais", vm.bonsais);

            },
            function (response) {
                vm.message = "Error: " + response.status + " " + response.statusText;
            });

    });

    init();

    ///////////////////////////


    function init() {

        vm.loggedIn = false;
        vm.username = '';

        if(AuthService.isAuthenticated()) {

            vm.loggedIn = true;
            vm.username = AuthService.getUsername();

            console.log("currentUser", vm.username);



        }

    }

    function bonsaiDetail(bonsaiId) {
        console.log("bonsai id", bonsaiId);

        if(bonsaiId) {
            $state.go('app.bonsaidetail', { id: bonsaiId});
        }
    }

});
