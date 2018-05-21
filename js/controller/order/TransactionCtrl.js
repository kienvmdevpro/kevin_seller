'use strict';

//Bill
angular.module('app').controller('TransactionCtrl', ['$scope', '$http', '$state', '$window', 'toaster', 'Transaction', 'Analytics',
 	function($scope, $http, $state, $window, toaster, Transaction, Analytics) {
    // config

    Analytics.trackPage('/transaction_history');
    
    $scope.currentPage      = 1;
    $scope.item_page        = 20;
    $scope.maxSize          = 5;
    $scope.list_data        = [];
    //$scope.user             = [];
    $scope.time_start       = new Date(date.getFullYear(), date.getMonth(), 1);
    $scope.time_end         = '';
    $scope.time             = {};
    $scope.search           = '';
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

        $scope.refresh_data = function(cmd){
            if($scope.time_start != undefined && $scope.time_start != ''){
                $scope.time.time_start  = Date.parse($scope.time_start)/1000;
            }else{
                $scope.time.time_start  = 0;
            }

            if($scope.time_end != undefined && $scope.time_end != ''){
                $scope.time.time_end  = +Date.parse($scope.time_end)/1000  + 86399;
            }else{
                $scope.time.time_end    = 0;
            }

            if(cmd != 'export'){
                $scope.list_data        = [];
                $scope.waiting          = true;
            }
        }

        // List order
        $scope.setPage = function(){
            $scope.refresh_data('');


            Transaction.load($scope.search, $scope.time.time_start,$scope.time.time_end,$scope.currentPage,'', '').then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    //$scope.user             = result.data.user;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                    $scope.totalItems       = result.data.total;
                    $scope.item_page        = result.data.item_page;
                }
                $scope.waiting          = false;
            });
            return;
        };
    
    // action
    $scope.setPage();

    $scope.exportExcel = function(){
        $scope.refresh_data('export');
        return Transaction.load($scope.search, $scope.time.time_start,$scope.time.time_end,$scope.currentPage,'', 'export')
    }
    }
]);
