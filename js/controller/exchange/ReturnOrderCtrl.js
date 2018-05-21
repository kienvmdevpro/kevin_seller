'use strict';

angular.module('app').controller('ReturnOrderCtrl', 
		   ['$scope', '$http', '$state','$filter', '$window', '$timeout', '$stateParams', 'toaster', 'bootbox', 'Exchange',
 	function($scope,   $http,   $state,  $filter,   $window,  $timeout,   $stateParams,    toaster,   bootbox,   Exchange) {
        var timeout_receiver;
        var tran = $filter('translate');
        $scope.item             = {};
        $scope.exchange         = {};
        $scope.receiver         = {type : 1 ,service_id : 2, protected : 2, description : '', exchange_id : $stateParams.id};
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
                    if($scope.exchange.receiver_order_code == ''){
                        $scope.params.Config    = {CoD : 2, Payment : 2, Protected : 2, Service : 2};
                        $scope.params.From      = {City : $scope.item.to_order_address.city_id, Province : $scope.item.to_order_address.province_id, Ward : $scope.item.to_order_address.ward_id, Address : $scope.item.to_order_address.address};
                        $scope.params.To        = {City : $scope.item.from_city_id, Province : $scope.item.from_district_id, Ward : $scope.item.from_ward_id, Address : $scope.item.from_address};
                        $scope.params.Order     = {Amount : $scope.item.total_amount, Weight : $scope.item.total_weight};

                        $scope.listener($scope.item);
                    }
                }
            }
        });

        /*
        Receiver
         */

        //listener calculator receiver
        $scope.listener     = function(item){
            $scope.waiting      = true;
            $scope.calculate    = {};

            if(item.protected != undefined){
                $scope.params.Config.Protected      = item.protected;
            }else{
                $scope.params.Config.Protected      = 2;
            }

            $scope.params.Config.Service        = item.service_id;

            $scope.calculate    = $scope.__calculate($scope.waiting);
            $scope.waiting      = $scope.calculate.waiting;
        }

        // caculate
        $scope.$watch('receiver', function(Value, OldValue){
            if($scope.item.id  == undefined || !$scope.item.id || $scope.waiting_create){
                return;
            }

            if(Value.service_id == OldValue.service_id && Value.protected == OldValue.protected){
                return;
            }

            if(timeout_receiver){
                $timeout.cancel(timeout_receiver);
            }

            timeout_receiver = $timeout(function(){
                $scope.listener(Value);
            },1000);
        },true);

        //create
        $scope.Create   = function(){
            if($scope.exchange.receiver_order_code != ''){
                //toaster.pop('warning', 'Thông báo', 'Bạn đã tạo đơn hàng hoàn về thành công!');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanTaoDonHoanKhongThanhCong'));
                return;
            }

            $scope.waiting_create       = true;
            $scope.receiver.courier_id  = $scope.calculate.courier.courier_id;
            Exchange.CreateReturn($scope.receiver).then(function (result) {
                if(result.data.error){
                    $scope.waiting_create       = false;
                }else{
                    $scope.tracking_code        = result.data.tracking_code;
                }
            });
        }
    }
]);
