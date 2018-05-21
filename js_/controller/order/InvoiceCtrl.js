'use strict';

//Bill
angular.module('app').controller('BillCtrl', ['$scope', '$http', '$state', '$window', 'toaster', 'Invoice',
 	function($scope, $http, $state, $window, toaster, Invoice) {
    // config
    $scope.currentPage      = 1;
    $scope.item_page        = 20;
    $scope.maxSize          = 5;
    $scope.list_data        = [];
    $scope.time_start       = new Date(date.getFullYear(), date.getMonth(), 1);
    $scope.time_end         = '';
    $scope.waiting          = true;
    
    
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    $scope.open = function($event,type) {
        $event.preventDefault();
        $event.stopPropagation();
        if(type == "time_start"){
            $scope.time_start_open = true;
        }else if(type == "time_end"){
            $scope.time_end_open = true;
        }
    };
    
    // get data
        // List order
        $scope.setPage = function(){
            var time_start = '';
            var time_end   = '';
            
            if($scope.time_start != undefined && $scope.time_start != ''){
                time_start  = Date.parse($scope.time_start)/1000;
            }
            if($scope.time_end != undefined && $scope.time_end != ''){
                time_end  = +Date.parse($scope.time_end)/1000  + 86399;
            }
            
            $scope.list_data        = [];
            $scope.waiting          = true;
        	Invoice.OrderInvoice(time_start,time_end, $scope.search,$scope.currentPage,'').then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    $scope.totalItems       = result.data.total;
                    $scope.item_page        = result.data.item_page;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                }
                $scope.waiting          = false;
            });
            return;
        };

        $scope.show_detail = function(item){
            item.show = !item.show;
        }

        $scope.sum_fee = function(item){
            return (
            item.total_sc_pvc + item.total_sc_cod + item.total_sc_pbh + item.total_sc_pvk + item.total_sc_pch
            - item.total_sc_discount_pvc - item.total_sc_discount_cod
            + item.total_lsc_pvc + item.total_lsc_cod + item.total_lsc_pbh + item.total_lsc_pvk + item.total_lsc_pch
            - item.total_lsc_discount_pvc - item.total_lsc_discount_cod);
        }

    // action
    $scope.setPage();
    }
]);
