'use strict';

angular.module('app').controller('ReturnCtrl', ['$scope', '$http', '$state', '$window', '$timeout', '$stateParams', 'PhpJs', 'toaster', 'bootbox', 'Exchange',
 	function($scope, $http, $state, $window, $timeout, $stateParams, PhpJs, toaster, bootbox, Exchange) {
        var timeout_receiver;

        $scope.item             = {};
        $scope.exchange         = {};
        $scope.receiver         = {service_id : 2, protected : 2, description : ''};
        $scope.waiting          = false;

        $scope.calculate        = {};

        //get exchange info
        Exchange.Detail($stateParams.id).then(function (result) {
            if(!result.error){
                if (result.data.data) {
                    $scope.item                         = result.data.data[0];
                    $scope.exchange                     = result.data.item;

                    // set param calculate
                    $scope.params.Config    = {CoD : 2, Payment : 2, Protected : 2, Service : 2};
                    $scope.params.From      = {City : $scope.item.to_order_address.city_id, Province : $scope.item.to_order_address.province_id, Ward : $scope.item.to_order_address.ward_id, Address : $scope.item.to_order_address.address};
                    $scope.params.To        = {City : $scope.item.from_city_id, Province : $scope.item.from_district_id, Ward : $scope.item.from_ward_id, Address : $scope.item.from_address};
                    $scope.params.Order     = {Amount : $scope.item.total_amount, Weight : $scope.item.total_weight};

                    $scope.listener($scope.item);
                }
                $scope.waiting          = true;
            }
        });

        /*
        Receiver
         */

        //listener calculator receiver
        $scope.listener     = function(item){
            $scope.waiting = true;

            if(item.protected != undefined){
                $scope.params.Config.Protected      = item.protected;
            }else{
                $scope.params.Config.Protected      = 2;
            }

            $scope.params.Config.Service        = item.service_id;
            $scope.calculate   = $scope.__calculate();
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
                $scope.listener(Value);
            },1000);
        },true);
    }
]);
