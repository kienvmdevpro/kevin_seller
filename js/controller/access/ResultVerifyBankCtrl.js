'use strict';

angular.module('app').controller('ResultVerifyBankCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', 'ChildInfo','Config_Accounting', 
 	function($scope, $modal, $http, $state, $stateParams, toaster, ChildInfo, Config_Accounting) {
        $scope.data = {};
        $scope.process  = true;
        $scope.list_bank       = Config_Accounting.list_bank;

        $scope.bankName = function(code){
            for (var i = $scope.list_bank.length - 1; i >= 0; i--) {
                if($scope.list_bank[i].code == code){
                    return $scope.list_bank[i].name;
                }
            };
        }

        if($stateParams.token){
            $http.get(ApiPath + 'access/verify-bank/'+ $stateParams.token).success(function (resp){
                $scope.process  = false;
                $scope.data = resp;
            });
        }
        
}]);
