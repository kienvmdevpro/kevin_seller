'use strict';

//Management
angular.module('app').controller('ExchangeOrderCtrl', ['$scope', '$http', '$state', '$window', '$timeout', '$stateParams', 'PhpJs', 'toaster', 'bootbox', 'Exchange', 'Order',
 	function($scope, $http, $state, $window, $timeout, $stateParams, PhpJs, toaster, bootbox, Exchange, Order) {
        var timeout_sender;

        $scope.item             = {};
        $scope.exchange         = {};
        $scope.sender           = {type : 2 ,exchange_id : $stateParams.id, checking : 1, service_id : 2, protected : 2, CoD : 2, description : '', total_weight : 0, total_amount : 0, product_name : ''};
        $scope.calculate        = {};
        $scope.waiting_create   = false;
        $scope.tracking_code    = '';

        //get exchange info
        Exchange.Detail($stateParams.id).then(function (result) {
            if(!result.error){
                if (result.data.data) {
                    $scope.item                         = result.data.data[0];
                    $scope.exchange                     = result.data.item;

                    // set param calculate
                    if($scope.exchange.sender_order_code == ''){
                        $scope.params.Config    = {CoD : 2, Payment : 2, Protected : 2, Service : 2};
                        $scope.params.To        = {City : $scope.item.to_order_address.city_id, Province : $scope.item.to_order_address.province_id, Ward : $scope.item.to_order_address.ward_id, Address : $scope.item.to_order_address.address};
                        $scope.params.From      = {City : $scope.item.from_city_id, Province : $scope.item.from_district_id, Ward : $scope.item.from_ward_id, Address : $scope.item.from_address};
                        $scope.params.Order     = {Amount : $scope.item.total_amount, Weight : $scope.item.total_weight};

                        $scope.sender.product_name  = $scope.item.product_name;
                        $scope.sender.total_weight  = $scope.item.total_weight;
                        $scope.sender.quantity      = $scope.item.total_quantity;
                        $scope.sender.total_amount  = $scope.item.total_amount;
                    }
                }
            }
        });

        //listener calculator sender
        $scope.listener     = function(item){
            $scope.waiting      = true;
            $scope.calculate    = {};

            if(item.protected != undefined){
                $scope.params.Config.Protected      = item.protected;
            }else{
                $scope.params.Config.Protected      = 2;
            }

            $scope.params.Config.Service        = item.service_id;
            $scope.params.Config.CoD            = item.CoD;
            $scope.params.Config.Checking       = item.checking;

            $scope.params.Order.Weight          = $scope.get_number(item.total_weight);
            $scope.params.Order.Amount          = $scope.get_number(item.total_amount);

            $scope.calculate    = $scope.__calculate($scope.waiting);
            $scope.waiting      = $scope.calculate.waiting;
        }

        // caculate
        $scope.$watch('sender', function(Value, OldValue){
            if($scope.item.id  == undefined || !$scope.item.id){
                return;
            }

            if(Value.service_id == OldValue.service_id && Value.protected == OldValue.protected && Value.total_amount == OldValue.total_amount
                && Value.total_weight == OldValue.total_weight
            && Value.CoD == OldValue.CoD){
                return;
            }

            if(timeout_sender){
                $timeout.cancel(timeout_sender);
            }

            timeout_sender = $timeout(function(){
                $scope.listener(Value);
            },1000);
        },true);

        //create
        $scope.Create   = function(){
            if($scope.exchange.sender_order_code != ''){
                toaster.pop('warning', 'Thông báo', 'Bạn đã tạo đơn hàng hoàn về thành công!');
                return;
            }

            var data = angular.copy($scope.sender);

            $scope.waiting_create  = true;
            data.collect           = $scope.get_number($scope.calculate.fee_detail.collect);
            data.total_weight      = $scope.get_number($scope.sender.total_weight);
            data.total_amount      = $scope.get_number($scope.sender.total_amount);
            data.quantity          = $scope.get_number($scope.sender.quantity);
            data.courier_id        = $scope.calculate.courier.courier_id;
            Exchange.CreateReturn(data).then(function (result) {
                if(result.data.error){
                    $scope.waiting_create     = false;
                }else{
                    $scope.tracking_code        = result.data.tracking_code;
                }
            });
        }
    }
]);
