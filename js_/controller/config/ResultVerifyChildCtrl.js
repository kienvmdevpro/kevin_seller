'use strict';

angular.module('app').controller('ResultVerifyChildCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', 'ChildInfo',
 	function($scope, $modal, $http, $state, $stateParams, toaster, ChildInfo) {
        $scope.status = "";
        $scope.process  = true;

        if($stateParams.token){

            ChildInfo.verify($stateParams.token).then(function (result) {
                $scope.process  = false;

                if(!result.error){
                    $scope.status = result.data.message;

                }
                
            });
        }
        
}]);
