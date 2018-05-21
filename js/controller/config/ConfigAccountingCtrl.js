'use strict';

//Config Accounting
angular.module('app').controller('ConfigAccountingCtrl', 
		   ['$scope', '$modal', '$http', '$filter','$state', '$rootScope', 'toaster', 'UserInfo', 'Config_Accounting', 'Storage','FileUploader',
 	function($scope,   $modal,  $http,    $filter,  $state,   $rootScope,   toaster,   UserInfo,   Config_Accounting,   Storage,  FileUploader) {
	var tran = $filter('translate');

	/**
     * config
     **/
     $scope.accounting      = {};
     $scope.banking         = {};
     $scope.user_info       = {};

     $scope.email_nl        = '';
     $scope.alepay_email    = '';
     
     $scope.list_bank       = Config_Accounting.vimo_bank;
     $scope.code_email_nl   = '';
     $scope.ApiStorage = ApiStorage;
     $scope.savedVimo = false;
     
     $scope.loading = {
        cmnd_before: false,   
        cmnd_after: false,
        atm: false,
     }

     $scope.fsubmit = false;
     /**
      * get data
      **/
    $scope.hover_check = function(){
        if(!$scope.vimo.bank_code){
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_NotBankCode'));
        }else if(!$scope.vimo.account_name){
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_NotAccountName'));
        }else if(!$scope.vimo.account_number){
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_NotAccountNumber'));
        }else if(!$scope.vimo.cmnd_before_image){
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_NotBeforeCMND'));
        }else if(!$scope.vimo.cmnd_after_image){
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_NotAfterCMND'));
        }
    }

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
           // toaster.pop('success', 'Thông báo', 'Tải lên thành công');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadThanhCong'));
        }
        else{
           // toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
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
       // toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
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
            //toaster.pop('success', 'Thông báo', 'Tải lên thành công');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadThanhCong'));
        }
        else{
           // toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
        }
    };

    uploaderCMNDBefore.onAfterAddingFile = function (item){
        console.log(item);
        $scope.loading.cmnd_before = true;
        uploaderCMNDBefore.uploadAll();
    }
    uploaderCMNDBefore.onErrorItem  = function(item, result, status, headers){
       // toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
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
            //toaster.pop('success', 'Thông báo', 'Tải lên thành công');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadThanhCong'));
        }
        else{
        	 toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
             //toaster.pop('warning', 'Thông báo', 'Upload thất bại !');
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
        //toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
    };


    $scope.__get_item_status    = function(){
        BMBase.ItemStatus().then(function (result) {
            if(!result.data.error){
                $localStorage['bm_status']  = result.data.data;
                $scope.status               = result.data.data;
            }
        }).finally(function() {
            $scope.__get_warehouse();
        });
    }

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
            //toaster.pop('warning', 'Thông báo', 'Bạn chưa cấu hình liên kết tài khoản ngân lượng !');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaCauHinhLKNganLuong'));
        }
        $scope.__get_banking_config();
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }else{
            $scope.__get_banking_config();
        }
    });

    $scope.__get_banking_config = function(){
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
            $scope.__get_vimo_config();
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                $scope.__get_vimo_config();
            }
        });
    }

    // get banking config
    $scope.__get_vimo_config    = function(){
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
    }

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
                        if(type == 4){
                            return toaster.pop('error',tran('toaster_ss_nitifi'), result.message);
                        }
                        return result.message;
                    }else{
                        if(type == 3){
                            // Intercom
                            try {
                                var metadata = {
                                    user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                                    name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                                    time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                                    type			:	"NganLuong",
                                    config_payment_nganluong :1
                                };
                                Intercom('trackEvent', 'Config paymnet', metadata);
                                window.Intercom('update', {config_payment_nganluong :1});
                            }catch(err) {
                                console.log(err)
                            }
                            // Intercom
                        }else if(data['layers_security'] != undefined){
                            $rootScope.userInfo.layers_security = data['layers_security'];
                            $scope.user.layers_security         = data['layers_security'];
                        }else if(type == 9){
                            var modalInstance = $modal.open({
                                templateUrl: 'IFrameAlepay.html',
                                controller: 'IFrameAlepayCtrl',
                                size: 'lg',
                                resolve: {
                                    item: function (){
                                        return result;
                                    }
                                }
                            });

                            modalInstance.result.then(function (result) {
                                return;
                            });
                        }else if(type == 4){
                            $scope.savedVimo = true;
                            // Intercom
                            try {
                                var metadata = {
                                    user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                                    name 		    :   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                                    time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                                    type			:	"vimo",
                                    config_payment_vimo:1
                                };
                                Intercom('trackEvent', 'Config paymnet', metadata);
                                window.Intercom('update', {config_payment_vimo :1});
                            }catch(err) {
                                console.log(err)
                            }
                            // Intercom
                        }else if(type == 10){
                            $rootScope.userInfo.alepay_active = ($rootScope.userInfo.alepay_active == 0 ? 1 : 0);
                        }
                        return
                    }


                });
            }else{
                return result.data.message;
            }
        }).finally(function() {
            $scope.fsubmit  = false;
        });
    }

    // save accounting
    $scope.save    = function(data,type, old_value){
        $scope.fsubmit  = true;
        var url;
        var data_post = {};
        if($rootScope.userInfo.layers_security == 1){
            var type_security   = 0;
            switch (type){
                case "freeze_money":
                    data_post[type] = data;
                    type_security   = 6;
                    break;

                case "priority_payment":
                    data_post[type] = data;
                    type_security   = 5;
                    break;

                case "email_nl":
                    data_post[type] = data;
                    type_security   = 3;
                    break;

                case "alepay_email":
                    type_security   = 9;
                    break;

                case "alepay_active":
                    type_security                       = 10;
                    data_post[type]                     = data;
                    $rootScope.userInfo.alepay_active   = old_value;
                    break;

                case "bank":
                    data_post[type] = data;
                    type_security   = 7;
                    break;

                case "vimo":
                    data_post       = data;
                    type_security   = 4;
                    break;

                default :
                    break;
            }


            return $scope.open_popup_security(type_security, data_post);
        }

        switch (type){
            case "freeze_money":
            case "priority_payment":
            case "email_nl":
            case "alepay_active":
                url                                 = 'user-info/create';
                data_post[type]                     = data;
                $rootScope.userInfo.alepay_active   = old_value;
                break;

            case "alepay_email":
                url                 = 'user-info/alepay-linked';
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
                 // Intercom   
                    try {
                    	var metadata = {
 	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
 	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
 	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                    		   type			:	"NganLuong",
                    		   config_payment_nganluong :1
 	            		};
            			Intercom('trackEvent', 'Config paymnet', metadata);
            			window.Intercom('update', {config_payment_nganluong :1});
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                }else if(type == 'alepay_email'){
                    var modalInstance = $modal.open({
                        templateUrl: 'IFrameAlepay.html',
                        controller: 'IFrameAlepayCtrl',
                        size: 'lg',
                        resolve: {
                            item: function (){
                                return result;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        return;
                    });
                }else if(type == 'alepay_active'){
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));

                    $rootScope.userInfo.alepay_active = data;
                }else{
                    //toaster.pop('success', 'Thông báo', 'Thành công!');
                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                }
                if(type == 'vimo'){
                    $scope.savedVimo = true;
                 // Intercom   
                    try {
                    	var metadata = {
 	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
 	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
 	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                    		   type			:	"vimo",
                    		   config_payment_vimo:1
 	            		};
            			Intercom('trackEvent', 'Config paymnet', metadata);
            			window.Intercom('update', {config_payment_vimo :1});
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                }
            }          
            else{
                if(type == 'vimo'){
                    $scope.fsubmit  = false;        
                    return toaster.pop('error',tran('toaster_ss_nitifi'), result.message);
                }

                //toaster.pop('error', 'Thông báo', 'Thất bại!');
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
