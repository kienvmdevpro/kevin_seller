'use strict';

//Config Accounting
angular.module('app').controller('ConfigLinkedCtrl',
		   ['$scope', '$window', '$modal', '$http', '$filter','$state', '$rootScope', 'toaster', 'UserInfo', 'Config_Accounting', 'Storage',
 	function($scope, $window,  $modal,  $http,    $filter,  $state,   $rootScope,   toaster,   UserInfo,   Config_Accounting,   Storage) {
	var tran = $filter('translate');

	/**
     * config
     **/
     $scope.user_info       = {};
     $scope.alepay_email    = '';
     $scope.list_linked     = {};

     $scope.fsubmit = false;
     $scope.user_info_ = {};
     /**
      * get data
      **/

    // get user info

    $scope.__get_user_info = function(){
    $scope.user_info    = {};
    $scope.user_info_   = {};
     $http({
         url: ApiPath+'user-info/show',
         method: "GET",
         dataType: 'json',
         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
     }).success(function (result, status, headers, config) {
         if(!result.error){
             $scope.user_info        = result.data;
             $scope.user_info_       = result.data;
             if($scope.user_info.freeze_money == 0){
                 $scope.user_info.check_all = 1;
             }
         }
         else{
             //toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình liên kết tài khoản ngân lượng !');
             toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaCauHinhLKNganLuong'));
         }
     }).error(function (data, status, headers, config) {
         if(status == 440){
             Storage.remove();
         }
     });
    }
    $scope.__get_user_info();

    // get linked payment
    $scope.__get_linked = function(){
        $scope.list_linked  = {};
        $http({
            url: ApiPath+'user-info/linked-info',
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
            if(!result.error){
                $scope.list_linked  = result.data;
            }
        });
    }
    $scope.__get_linked();

    /**
     *  Action
     **/

    $scope.open_popup_security = function(type, data){
        var modalInstance;
        return UserInfo.send_otp({type : type}).then(function (result) {
            if(!result.data.error){
                modalInstance = $modal.open({
                    templateUrl: 'ModalSecurity.html',
                    controller: 'ModalSecurity',
                    resolve: {
                        data: function () {
                            return data;
                        },
                        type : function(){
                            return type;
                        },
                        phone : function(){
                            return $rootScope.userInfo.phone;
                        }
                    }
                });

                return modalInstance.result.then(function (result) {
                    if(result.error){
                        return result.message;
                    }else{
                        if(type == 9){
                            $window.location.href = result.url;
                            // var modalInstance = $modal.open({
                            //     templateUrl: 'IFrameAlepay.html',
                            //     controller: 'IFrameAlepayCtrl',
                            //     size: 'lg',
                            //     resolve: {
                            //         item: function (){
                            //             return result;
                            //         }
                            //     }
                            // });
                            //
                            // modalInstance.result.then(function (result) {
                            //     return;
                            // });
                        }else{
                            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                            $scope.__get_user_info();
                        }
                        return
                    }
                    $scope.fsubmit  = false;

                });
            }else{
                return result.data.message;
            }
        }).finally(function() {
            $scope.fsubmit  = false;
        });
    }

    $scope.remove   = function(item){
        if(confirm('Bạn có chắc chắn muốn hủy liên kết thẻ này ?')){
            $http({
                url: ApiPath+'user-info/remove-linked?id=' + item.id,
                method: "GET",
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    item.delete = 1;
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                }else{
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                }
            });
        }

    }

    $scope.active_alepay = function(item, old_value){
        var data_post       = {};
        var url                     = 'user-info/create';
        data_post['alepay_active']  = item.active;
        data_post['id']             = item.id;
        item.active                 = old_value;

        $http({
            url: ApiPath+url,
            method: "POST",
            data: data_post,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            if(!result.error){
                $scope.__get_linked();
                toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
            }
            else{
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

    // save accounting
    $scope.save    = function(item,type, old_value){
        $scope.fsubmit  = true;
        var url;
        var data_post = {};
        if($rootScope.userInfo.layers_security == 1){
            var type_security   = 0;
            switch (type){
                case "alepay_email":
                    type_security   = 9;
                    break;

                case "alepay_config":
                    var url                     = 'user-info/create';
                    type_security       = 10;
                    data_post['config_alepay']          = item.alepay_active;
                    data_post['alepay_payment_start']   = item.alepay_payment_start;
                    data_post['alepay_amount']          = item.alepay_amount;

                    item.alepay_active          = $scope.user_info_.alepay_active;
                    item.alepay_payment_start   = $scope.user_info_.alepay_payment_start;
                    item.alepay_amount          = $scope.user_info_.alepay_amount;
                    break;


                default :
                    break;
            }


            return $scope.open_popup_security(type_security, data_post);
        }

        switch (type){
            case "alepay_config":
                var url                     = 'user-info/create';

                type_security       = 10;
                data_post['config_alepay']          = item.alepay_active;
                data_post['alepay_payment_start']   = item.alepay_payment_start;
                data_post['alepay_amount']          = item.alepay_amount;

                item.alepay_active          = $scope.user_info_.alepay_active;
                item.alepay_payment_start   = $scope.user_info_.alepay_payment_start;
                item.alepay_amount          = $scope.user_info_.alepay_amount;
                break;

            case "alepay_email":
                url                 = 'user-info/alepay-linked';
                break;

            default :
                break;
        }



        $http({
            url: ApiPath+url,
            method: "POST",
            data: data_post,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            if(!result.error){
                if(type == 'alepay_email'){
                    $window.location.href = result.url;
                    // var modalInstance = $modal.open({
                    //     templateUrl: 'IFrameAlepay.html',
                    //     controller: 'IFrameAlepayCtrl',
                    //     size: 'lg',
                    //     resolve: {
                    //         item: function (){
                    //             return result;
                    //         }
                    //     }
                    // });
                    //
                    // modalInstance.result.then(function (result) {
                    //     return;
                    // });
                }else{
                    $scope.__get_user_info();
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));

                }
            }          
            else{
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
            }
            $scope.fsubmit  = false;
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                //toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            }
            $scope.fsubmit  = false;
        });
    }
}])
angular.module('app').controller('IFrameAlepayCtrl',['$scope', '$sce', '$timeout','item',
    function ($scope, $sce, $timeout, item){
        $scope.url = $sce.trustAsResourceUrl(item.url);
    }])
;
