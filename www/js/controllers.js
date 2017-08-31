angular.module('starter.controllers', [])

.controller('TabsCtrl', function($scope, $ionicModal, $ionicPopup, $rootScope, $state, $filter, $localStorage,
                                 $log, ngDialog, User, AuthService){

    var vm = this;

    vm.openLoginModal = openLoginModal;
    vm.openRegisterModal = openRegisterModal;
    vm.closeModal = closeModal;
    vm.doLogin = doLogin;
    vm.cancelLogin = cancelLogin;
    vm.doLogout = doLogout;
    vm.doRegister = doRegister;
    vm.cancelRegister = cancelRegister;

    $rootScope.$on('login:Successful', function () {
        vm.loggedIn = AuthService.isAuthenticated();
        vm.username = AuthService.getUsername();
    });

    $rootScope.$on('logout', function () {
        vm.loggedIn = false;
        vm.username = '';
    });

    $scope.$watch('currentUser.id', function(value) {
        console.log("value", value);

        if (!value) {
            return;
        }

        vm.loggedIn = true;
    });


    // Login
    $ionicModal.fromTemplateUrl('../templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        vm.modal = modal;
    });


    //Register
    $ionicModal.fromTemplateUrl('../templates/register.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        vm.modalRegister = modal;
    });



    init();

    ///////////////////////////


    function init() {

        console.log("tabs");

        vm.loggedIn = false;
        vm.modal = null;
        vm.modalRegister = null;
    }

    function openLoginModal() {
        vm.modal.show();

        console.log("rememberMe", vm.rememberMe);

        if(vm.rememberMe) {
            vm.loginData = $localStorage.getObject('userinfo','{}');

            console.log("user", vm.loginData);
        }
    }

    function closeModal() {
        vm.modal.hide();
    }

    function doLogin() {
        console.log("login");

        if(vm.rememberMe)
            $localStorage.storeObject('userinfo',vm.loginData);

        console.log("login", vm.loginData);

        AuthService.login(vm.loginData);

        vm.modal.hide();

    }

    function cancelLogin() {
        vm.loginData = {};
        vm.modal.hide();
    }

    function cancelRegister() {
        vm.registration = {};
        vm.modalRegister.hide();
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
                        $state.go('tab.home', {}, {reload: true});
                    });
            } else {

            }
        });


    }

    function openRegisterModal() {

        vm.modalRegister.show();

        console.log("register");
    }

    function doRegister() {
        console.log("register", vm.registration);

        if(vm.rememberMe) {
            vm.loginData = $localStorage.getObject('userinfo', '{}');
        }

        AuthService.register(vm.registration);


        vm.loginData = {
            username: vm.registration.username,
            password: vm.registration.password
        };

        vm.modalRegister.hide();

    }


})

.controller('HomeCtrl', function($scope, $rootScope, $state, $filter, $log, ngDialog, User, AuthService) {


    var vm = this;

    vm.openLogin = openLogin;
    vm.bonsaiDetail = bonsaiDetail;
    vm.getSecondIndex = getSecondIndex;


    $scope.$watch('currentUser.id', function(value) {
    console.log("value", value);

        if (!value) {
            return;
        }

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

        vm.loggedIn = false;


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

.controller('NewEditCtrl', function($scope, $rootScope, $log, $state, $stateParams, Bonsai, AuthService) {
    var vm = this;

    vm.createUpdateBonsai = createUpdateBonsai;
    vm.cancel = cancel;


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

    });


    init();

    ///////////////////////////


    function init() {

        vm.loggedIn = false;
        vm.editMode = false;

        if(AuthService.isAuthenticated()) {
            // TODO cancel

            /*
            vm.bonsai = {
                "name": "Test1",
                "species": "Pinus",
                "age": 10,
                "height": 20,
                "diameter": 30,
                "style": "Chokkkan",
                "pot": "Rectangular"
            };

            */


            console.log("id:", $stateParams.id);

            if($stateParams.id) {


                Bonsai.findById({id: $stateParams.id})
                    .$promise.then(
                    function (response) {
                        vm.bonsai = response;
                        vm.editMode = true;

                        //$scope.showDish = true;
                    },
                    function (response) {
                        vm.message = "Error: " + response.status + " " + response.statusText;
                    }
                );

            }

        }

    }


    function createUpdateBonsai() {


        if(vm.editMode) {

            $log.info("update", vm.bonsai);

            Bonsai.upsert( vm.bonsai).$promise.then(
                function(data) {

                    $log.info("bonsai saved", data);
                    $state.go('tab.list');
                }
            );
        } else {

            $log.info("create", vm.bonsai);

            Bonsai.create(vm.bonsai).$promise.then(
                function(data) {

                    $log.info("bonsai saved", data);
                    $state.go('tab.list');
                }
            );
        }




    }

    function cancel() {
        $state.go('app.list');
    }
})

.controller('BonsaiDetailCtrl', function($scope, $state, $stateParams, Bonsai, ngDialog) {
    var vm = this;

    vm.deleteBonsai = deleteBonsai;

    $scope.$watch('currentUser.id', function(value) {

        console.log("detail value");

        if (!value) {
            return;
        }

        vm.loggedIn = true;

        Bonsai.findById({id: $stateParams.id})
            .$promise.then(
            function (response) {
                vm.bonsai = response;

                console.log("bonsai", vm.bonsai);
                //$scope.showDish = true;
            },
            function (response) {
                vm.message = "Error: " + response.status + " " + response.statusText;
            }
        );


    });

    init();

    ///////////////////////////


    function init() {

    }


    function deleteBonsai() {

        ngDialog.openConfirm({
            template:
            '<p>Are you sure you want to delete selected Bonsai?</p>' +
            '<div>' +
            '<button type="button" class="btn btn-default" ng-click="closeThisDialog(0)">No&nbsp;' +
            '<button type="button" class="btn btn-primary pull-right" ng-click="confirm(1)">Yes' +
            '</button></div>',
            plain: true,
            className: 'ngdialog-theme-default'
        }).then(function (value) {
            // perform delete operation

            console.log("create", vm.bonsai);

            Bonsai.delete(vm.bonsai).$promise.then(
                function(data) {

                    console.log("bonsai deleted", data);

                    $state.go('app.list');
                }
            );

        }, function (value) {
            //Do something
        });

    }
})

.controller('ListCtrl', function($rootScope, $scope, $timeout, User, AuthService) {

    var vm = this;

    vm.bonsaiDetail = bonsaiDetail;

    vm.doRefresh = function() {

        console.log('Refreshing!');

        User.bonsais({ id: 'me' })
            .$promise.then(
            function (response) {
                vm.bonsais = response;

                console.log("bonsais", vm.bonsais);

                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');

            },
            function (response) {
                vm.message = "Error: " + response.status + " " + response.statusText;
        });

    };

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


    }

    function bonsaiDetail(bonsaiId) {
        console.log("bonsai id", bonsaiId);

        if(bonsaiId) {
            $state.go('app.bonsaidetail', { id: bonsaiId});
        }
    }

});
