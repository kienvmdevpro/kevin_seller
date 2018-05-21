'use strict';

angular.module('app').controller('ResultSyncZurmoCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', '$window',
 	function($scope, $modal, $http, $state, $stateParams, toaster,$window) {
        $scope.data = {};
        $scope.process  = true;

        if($stateParams.email){
            $http.get(ApiPath + 'access/zurmo/'+ $stateParams.email).success(function (resp){
                $scope.process  = false;
                if(resp.message != 'SUCCESS'){
                    $window.location.href = 'http://seller.shipchung.vn';
                }
                $scope.data = resp;
            });
        }
        
}]);
