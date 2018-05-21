'use strict';

//Management
angular.module('app').controller('AcceptExchangeCtrl', 
		   ['$scope','$http', '$state', '$window', '$timeout', '$stateParams', 'PhpJs', 'toaster', 'bootbox', 'Exchange', 'Order',
 	function($scope, $http,   $state,    $window,   $timeout,    $stateParams,  PhpJs,   toaster,   bootbox,   Exchange,   Order) {
        var timeout_receiver;
        var timeout_sender;

        $scope.item             = {};
        $scope.exchange         = {};
        $scope.receiver         = {service : 2, protected : 2, description : ''};
        $scope.sender           = {service : 2, protected : 2, description : '', boxsize: '', total_weight : 0, total_amount : 0};
        $scope.sender_create    = {description : '', quantity: 0, checking : 2};

        $scope.waiting_receiver = false;
        $scope.waiting_sender   = false;
        $scope.params           = {};
        $scope.calculate_receiver     = {};
        $scope.calculate_sender       = {};
        
        //get exchange info
        Exchange.Detail($stateParams.id).then(function (result) {
            if(!result.error){
                if (result.data.data) {
                    $scope.item         = result.data.data[0];
                    $scope.exchange     = result.data.item;
                    $scope.listener_receiver($scope.receiver);

                    if($scope.exchange.type == 2){
                        $scope.sender.total_weight              = $scope.item.total_weight;
                        $scope.sender.total_amount              = $scope.item.total_amount;
                        $scope.sender_create.product_name       = $scope.item.product_name;
                        $scope.sender_create.quantity           = $scope.item.total_quantity;
                    }
                }
            }
            $scope.waiting   = false;
        });

        function get_boxsize(data){
            if(data.longs != undefined && data.longs != '' &&
                data.width != undefined && data.width!= '' &&
                data.height != undefined && data.height != ''){
                var long    = data.longs.toString().replace(/,/gi,"");
                var width   = data.width.toString().replace(/,/gi,"");
                var height  = data.height.toString().replace(/,/gi,"");

                return long+'x'+width+'x'+height;
            }else{
                return '';
            }
        }

        function get_number(data){
            if(data != undefined && data != ''){
                if(typeof data == 'string'){
                    return data.toString().replace(/,/gi,"");
                }else {
                    return data.toString();
                }
            }
            return 0;
        }

        //function calculate fee
        var __calculate = function(){
            var item                = {};
            var fee_detail          = {};
            var list_courier        = {};
            var courier             = {};

            Order.Calculate($scope.params).then(function (result) {
                $scope.waiting_receiver     = false;
                $scope.waiting_sender       = false;

                if(!result.data.error){
                    item.fee_detail       = result.data.data;
                    fee_detail            = result.data.data;

                    if(fee_detail.courier.me){
                        courier        =   fee_detail.courier.me[0];
                    }else{
                        item.courier        =   fee_detail.courier.system[0];
                        item.leatime_total  =   fee_detail.courier.system[0].leatime_total;
                        fee_detail.courier.me        = [];
                    }

                    if(!fee_detail.courier.system){
                        fee_detail.courier.system    = [];
                    }

                    item.list_courier = PhpJs.array_merge_recursive(fee_detail.courier.me,fee_detail.courier.system);
                }else{
                    toaster.pop('warning', 'Thông báo', result.data.message);
                    item.fee_detail   = {};
                }
            });

            return item;
        }

        $scope.set_params   = function(data, type, action){
            $scope.params           = {};
            $scope.params.Domain    = 'shipchung.vn';

            var From                = {City : $scope.item.to_order_address.city_id, Province : $scope.item.to_order_address.province_id, Ward : $scope.item.to_order_address.ward_id, Address : $scope.item.to_order_address.address};
            var To                  = {City : $scope.item.from_city_id, Province : $scope.item.from_district_id, Ward : $scope.item.from_ward_id, Address : $scope.item.from_address};
            $scope.params.Order     = {Amount : data.total_amount, Weight : data.total_weight};
            $scope.params.Config    = {Checking : data.checking, CoD : data.cod, Fragile : data.fragile, Payment : data.payment, Protected : data.protected, Service : data.service};

            if(type == 'receiver'){
                $scope.params.From      = From;
                $scope.params.To        = To;
            }else{
                $scope.params.To        = From;
                $scope.params.From      = To;
            }
            return;
        }

        /*
        Receiver
         */

        //listener calculator receiver
        $scope.listener_receiver = function(item){
            var data        = {};
            $scope.waiting_receiver = true;
            data['cod']                 = 2;
            data['payment']             = 2;
            data['protected']           = item.protected;
            data['service']             = item.service;
            data['total_weight']        = $scope.item.total_weight;
            data['total_amount']        = $scope.item.total_amount;

            $scope.set_params(data, 'receiver', 'calculate');
            $scope.calculate_receiver   = __calculate();
        }

        // caculate
        $scope.$watch('receiver', function(Value, OldValue){
            if($scope.item.id  == undefined || !$scope.item.id){
                return;
            }

            if(timeout_receiver){
                $timeout.cancel(timeout_receiver);
            }

            timeout_receiver = $timeout(function(){
                $scope.listener_receiver(Value);
            },1000);
        },true);

        /**
         *
         * SENDER
         */
        //listener calculator sender
        $scope.listener_sender = function(item){
            $scope.waiting_sender   = true;

            var data            = {};
            var size = get_boxsize(item.boxsize);
            if(size != ''){
                data['size']    = size;
            }
            var weight          = get_number(item.total_weight);
            if(!weight && size == ''){
                $scope.waiting_sender   = false;
                return;
            }

            data['total_weight']        = weight;
            data['total_amount']        = get_number(item.total_amount);
            data['cod']                 = 2;
            data['payment']             = 1;
            data['protected']           = item.protected;
            data['checking']            = item.checking;
            data['service']             = item.service;

            $scope.set_params(data, 'sender', 'calculate');
            $scope.calculate_sender   = __calculate();
        }

        //calculate sender timeout_sender
        $scope.$watch('sender', function(Value, OldValue){
            if(($scope.item.id  == undefined || !$scope.item.id)
                || (Value.total_amount == undefined || Value.total_amount == '')
            ){
                return;
            }

            if(timeout_sender){
                $timeout.cancel(timeout_sender);
            }

            timeout_sender = $timeout(function(){
                $scope.listener_sender(Value);
            },1000);
        },true);
    }
]);
