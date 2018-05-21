'use strict';

angular.module('app').controller('ExchangeCtrl', 
		    ['$scope', '$http', '$state', '$window', 'bootbox', 'toaster', 'PhpJs', 'Order','$filter',
 	function($scope,    $http,   $state, $window,    bootbox,   toaster,   PhpJs,    Order,  $filter) {
        $scope.params           = {Domain : 'shipchung.vn'};
        $scope.waiting          = false;
        var tran = $filter('translate');
        $scope.get_boxsize = function(data){
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

        $scope.get_number   = function(data){
            if(data != undefined && data != ''){
                if(typeof data == 'string'){
                    return data.toString().replace(/,/gi,"");
                }else {
                    return data.toString();
                }
            }
            return 0;
        }

        $scope.__calculate    = function(waiting){
            var item                = {waiting : false};
            var fee_detail          = {};
            var list_courier        = {};
            var courier             = {};

            Order.Calculate($scope.params).then(function (result) {
                waiting          = false;
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
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.data.message);
                    item.fee_detail   = {};
                }
            });

            return item;
        }
    }
]);
