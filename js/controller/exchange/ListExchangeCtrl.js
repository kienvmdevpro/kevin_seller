'use strict';

//Management
angular.module('app').controller('ListExchangeCtrl', ['$scope', '$http', '$state', '$window', 'bootbox', 'Exchange',
 	function($scope, $http, $state, $window, bootbox, Exchange) {
        // config
        $scope.currentPage      = 1;
        $scope.item_page        = 20;
        $scope.maxSize          = 5;
        $scope.list_data        = [];

        $scope.frm              = {keyword : '', active : 0,create_start : '', accept_start : '', create_end : '', accept_end: '', tab : 'ALL'};
        $scope.time             = {create_start : new Date(date.getFullYear(), date.getMonth(), 1)};
        $scope.waiting          = true;


        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.open = function($event,type) {
            $event.preventDefault();
            $event.stopPropagation();
            if(type == "create_start"){
                $scope.create_start = true;
            }else if(type == "create_end"){
                $scope.create_end = true;
            }
            else if(type == "accept_start"){
                $scope.accept_start = true;
            }
            else if(type == "accept_end"){
                $scope.accept_end = true;
            }
        };

        $scope.refresh_data = function(cmd){
            if($scope.time.create_start != undefined && $scope.time.create_start != ''){
                $scope.frm.create_start  = +Date.parse($scope.time.create_start)/1000;
            }else{
                $scope.frm.create_start  = 0;
            }

            if($scope.time.create_end != undefined && $scope.time.create_end != ''){
                $scope.frm.create_end  = +Date.parse($scope.time.create_end)/1000 + 86399;
            }else{
                $scope.frm.create_end    = 0;
            }

            if($scope.time.accept_start != undefined && $scope.time.accept_start != ''){
                $scope.frm.accept_start  = +Date.parse($scope.time.accept_start)/1000;
            }else{
                $scope.frm.accept_start   = 0;
            }

            if($scope.time.accept_end != undefined && $scope.time.accept_end != ''){
                $scope.frm.accept_end  = +Date.parse($scope.time.accept_end)/1000 + 86399;
            }else{
                $scope.frm.accept_end  = 0;
            }

            if(cmd != 'export'){
                $scope.waiting      = true;
                $scope.list_data    = {};
            }
        }

        $scope.setPage = function(page){
            $scope.currentPage  = page;
            $scope.refresh_data('');
            Exchange.ListExchange($scope.currentPage, $scope.frm, '').then(function (result) {
                if(!result.data.error){
                    $scope.list_data    = result.data.data;
                    $scope.totalItems   = result.data.total;
                    $scope.item_stt     = $scope.item_page * ($scope.currentPage - 1);
                }

                $scope.waiting = false;
            });
            return;
        };

        // action
        $scope.setPage(1);

        $scope.ChangeTab    = function(tab){
            $scope.frm.tab  = tab;
            $scope.setPage(1);
        }

        //Action cancel request
        $scope.Cancel   = function(item){
            bootbox.confirm( "Bạn chắc chắn muốn hủy yêu cầu đổi trả này ?" , function (result) {
                if(result){
                    item.waiting   = true;
                    Exchange.Change({'active' : 2, 'exchange_id' : item.id}).then(function (result) {
                        if(!result.data.error){
                            item.active = 2;
                        }
                        item.waiting   = false;
                    });
                }
            });

        }
    }
]);
