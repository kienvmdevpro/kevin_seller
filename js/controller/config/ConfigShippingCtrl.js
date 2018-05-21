'use strict';

//Config shipping
angular.module('app').controller('ConfigShippingCtrl', 
		   ['$scope', '$modal', '$http', '$state', '$window', 'toaster', 'Config_Status','$filter',
 	function($scope,  $modal,   $http,   $state,    $window,   toaster,    Config_Status, $filter) {
		var tran = $filter('translate');
        $scope.fee_config       = {};
        $scope.courier_config   = {};
        
        $scope.list_priority    = Config_Status.Priority;

        $http({
            url: ApiPath+'fee-config/show',
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
            if(!result.error){
                $scope.fee_config   = result.data;
            }
            else{
                $scope.fee_config   = {shipping_fee:2, shipping_cost_value:0, cod_fee:1};

            }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
               // toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            }
        });
    
        // get config courier
        $http({
            url: ApiPath+'courier-config/show?active=1',
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.courier_config = result.data;
        }
        else{
            //toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình hãng vận chuyển!');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaCauHinhVanChuyen'));
            
        }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }
        });

         $scope.save    = function(data,type){
             var url;
             switch (type){
                 case 'fee':
                     url = 'fee-config/create';
                     break;

                 case 'courier':
                     url = 'courier-config/multicreate';
                     var data_config = [];
                     angular.forEach(data, function(value, key) {
                         data_config.push(value.seller_courier_config);
                     });
                     data = data_config;
                     break;

                 default :
                     break;
             }

             $http({
                url: ApiPath+url,
                method: "POST",
                data:data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    //toaster.pop('success', 'Thông báo', 'Thành công!');
                	toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                }
                else{
                    //toaster.pop('error', 'Thông báo', 'Thất bại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                }
            }).error(function (data, status, headers, config) {
                 if(status == 440){
                     Storage.remove();
                 }else{
                     //toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                	 toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                 }
            });
        }
}]);
