'use strict';

angular.module('app').controller('ResultCashCtrl', ['$scope', '$stateParams', 'Cash',
 	function($scope, $stateParams, Cash) {
        $scope.amount   = 0;
        $scope.process  = true;
        
        if($stateParams.code != undefined && $stateParams.payment_id != undefined && $stateParams.token_nl){
            Cash.ResultNL($stateParams).then(function (result) {
                if(!result.data.error){
                    $scope.amount   = result.data.amount;
                    $scope.type     = result.data.amount;
                }
                $scope.process  = false;
            });
        }
}]);
