'use strict';

//Order detail
angular.module('app').controller('PrintCtrl', ['$scope', '$http', '$state', '$stateParams', '$window', 'toaster', 'Invoice',
 	function($scope, $http, $state, $stateParams, $window, toaster, Invoice) {
 	  // Config
        if(!$stateParams.id.length){
            $state.go('app.invoice');
        }

        $scope.date         = date;
        $scope.data         = [];
        $scope.user         = [];
        $scope.wating       = true;
        
        // load order
        Invoice.OrderInvoice('', '', $stateParams.id, 1, '').then(function (result) {
            if(!result.data.error){
                $scope.data         = result.data.data[0];
            }
            $scope.wating   = false;
        });

        $scope.sum_fee = function(item){
            return (
            item.total_sc_pvc + item.total_sc_cod + item.total_sc_pbh + item.total_sc_pvk + item.total_sc_pch
            - item.total_sc_discount_pvc - item.total_sc_discount_cod
            + item.total_lsc_pvc + item.total_lsc_cod + item.total_lsc_pbh + item.total_lsc_pvk + item.total_lsc_pch
            - item.total_lsc_discount_pvc - item.total_lsc_discount_cod);
        }
        
 	  // Action
}]);
