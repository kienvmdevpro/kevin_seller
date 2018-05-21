'use strict';

//Config Accounting
angular.module('app').controller('ConfigAccountingCtrl', ['$scope', '$modal', '$http', '$state', '$rootScope',  '$window', 'toaster', 'Config_Accounting', 'Storage','FileUploader',
 	function($scope, $modal, $http, $state, $rootScope, $window, toaster, Config_Accounting, Storage, FileUploader) {
    /**
     * config
     **/
     $scope.accounting      = {};
     $scope.banking         = {};
     $scope.user_info       = {};

     $scope.email_nl        = '';
     
     $scope.list_bank       = Config_Accounting.vimo_bank;
     $scope.code_email_nl   = '';
     $scope.ApiStorage = ApiStorage;
     $scope.savedVimo = false;
     
     $scope.loading = {
        cmnd_before: false,   
        cmnd_after: false,
        atm: false,
     }
     /**
      * get data
      **/
    

    // File ATM 
    var uploaderPopup = $scope.uploaderPopup = new FileUploader({
        url                 : ApiPath+'vimo-config/upload-scan-img',
        headers             : {Authorization : $rootScope.userInfo.token},
        queueLimit          : 5
    });


    uploaderPopup.filters.push({
        name: 'FileFilter',
        fn: function(item, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpeg|pdf|png|'.indexOf(type) !== -1 && item.size < 3000000;
        }
    });

    uploaderPopup.onSuccessItem = function(item, result, status, headers){
        if(!result.error){
            $scope.loading.atm = false;
            $scope.vimo.atm_image =  result.data;
            toaster.pop('success', 'Thông báo', 'Tải lên thành công');
        }
        else{
            toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
        }
    };

    uploaderPopup.onAfterAddingFile = function (item){
        $scope.loading.atm = true;
        uploaderPopup.uploadAll();
    }

    uploaderPopup.onWhenAddingFileFailed = function (item, filter, options){
        if(item.size > 2000000){
            alert('Dung lượng file vượt quá giới hạn 2MB');
        }
    }

    uploaderPopup.onErrorItem  = function(item, result, status, headers){
        toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
    };


    // Upload CMND Before

    var uploaderCMNDBefore = $scope.uploaderCMNDBefore = new FileUploader({
        url                 : ApiPath+'vimo-config/upload-scan-img',
        headers             : {Authorization : $rootScope.userInfo.token},
        queueLimit          : 5
    });


    uploaderCMNDBefore.filters.push({
        name: 'FileFilter',
        fn: function(item, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpeg|pdf|png|jpg'.indexOf(type) !== -1 && item.size < 2000000;
        }
    });

    uploaderCMNDBefore.onWhenAddingFileFailed = function (item, filter, options){
        if(item.size > 2000000){
            alert('Dung lượng file vượt quá giới hạn 2MB');
        }
    }
    uploaderCMNDBefore.onSuccessItem = function(item, result, status, headers){
        if(!result.error){
            $scope.loading.cmnd_before = false;
            $scope.vimo.cmnd_before_image =  result.data;
            toaster.pop('success', 'Thông báo', 'Tải lên thành công');
        }
        else{
            toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
        }
    };

    uploaderCMNDBefore.onAfterAddingFile = function (item){
        console.log(item);
        $scope.loading.cmnd_before = true;
        uploaderCMNDBefore.uploadAll();
    }
    uploaderCMNDBefore.onErrorItem  = function(item, result, status, headers){
        toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
    };


    // Upload CMND After

    var uploaderCMNDAfter = $scope.uploaderCMNDAfter = new FileUploader({
        url                 : ApiPath+'vimo-config/upload-scan-img',
        headers             : {Authorization : $rootScope.userInfo.token},
        queueLimit          : 5
    });


    uploaderCMNDAfter.filters.push({
        name: 'FileFilter',
        fn: function(item, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpeg|pdf|png|'.indexOf(type) !== -1 && item.size < 2000000;
        }
    });

    uploaderCMNDAfter.onSuccessItem = function(item, result, status, headers){
        if(!result.error){
            $scope.loading.cmnd_after = false;
            $scope.vimo.cmnd_after_image =  result.data;
            toaster.pop('success', 'Thông báo', 'Tải lên thành công');
        }
        else{
            toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
        }
    };

    uploaderCMNDAfter.onAfterAddingFile = function (item){
        $scope.loading.cmnd_after = true;
        uploaderCMNDAfter.uploadAll();
    }

    uploaderCMNDAfter.onWhenAddingFileFailed = function (item, filter, options){
        if(item.size > 2000000){
            alert('Dung lượng file vượt quá giới hạn 2MB');
        }
    }
    
    uploaderCMNDAfter.onErrorItem  = function(item, result, status, headers){
        toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
    };




    

    // get banking config
    $http({
        url: ApiPath+'banking-config/show',
        method: "GET",
        dataType: 'json',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.banking        = result.data;
        }  
        else{
            $scope.banking   = {};
            //toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình tài khoản ngân hàng !');
        }
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }
    });


    // get banking config
    $http({
        url: ApiPath+'vimo-config/show',
        method: "GET",
        dataType: 'json',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.vimo        = result.data;
        }  
        else{
            $scope.vimo   = {};
            //toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình tài khoản Vimo !');
        }
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }
    });




    
    // get user info
    $http({
        url: ApiPath+'user-info/show',
        method: "GET",
        dataType: 'json',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.user_info        = result.data;
            if($scope.user_info.freeze_money == 0){
                $scope.user_info.check_all = 1;
            }
        }  
        else{
            toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình liên kết tài khoản ngân lượng !');
        }
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }
    });
    
    /**
     *  Action
     **/

    // save accounting
    $scope.save    = function(data,type){
        var url;
        var data_post = {};
        switch (type){
            case "freeze_money":
            case "priority_payment":
            case "email_nl":
                url                 = 'user-info/create';
                data_post[type]     = data;
                break;
                
            case "bank":
                url         = 'banking-config/create';
                data_post   = data;
                break;

            case "vimo":
                url         = 'vimo-config/create';
                data_post   = data;
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

                if(type == 'priority_payment' && !$scope.user_info.email_nl){
                    return ;
                }
                if(type == 'email_nl'){
                    $scope.email_nl = result.data;
                }else{
                    toaster.pop('success', 'Thông báo', 'Thành công!');
                }
                if(type == 'vimo'){
                    $scope.savedVimo = true;
                }
            }          
            else{
                if(type == 'vimo'){
                    return toaster.pop('error', 'Thông báo', result.message);
                }

                toaster.pop('error', 'Thông báo', 'Thất bại!');
            }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
            }
        });
    }

    $scope.change_check_all = function(check){
        if(check == 1){
            $scope.user_info.freeze_money   = 0;
        }else{
            $scope.user_info.freeze_money   = 200000;
        }
    }

     $scope.onTourEnd = function(){
        $state.go('app.config.shipping');
    }
}]);
