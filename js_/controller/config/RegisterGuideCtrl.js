'use strict';

angular.module('app').controller('RegisterGuideCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo', 'Location', 'Analytics',
    function($scope, $modal, $http, $state, $stateParams, $location, toaster, UserInfo, Location, Analytics) {
        $scope.buoc = $stateParams.buoc;
        if ($scope.buoc == 5) {
            Analytics.trackPage('/signup/step5_done');
        };
    }]);



angular.module('app').controller('RegisterGuideConfigAccountCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo', 'Location', 'User', 'Analytics', '$timeout',
    function($scope, $modal, $http, $state, $stateParams,$location, toaster, UserInfo, Location, User, Analytics, $timeout) {

        $scope.list_city       = {};
        $scope.districts       = {};

        $scope.user            = {city_id: 0, district_id: 0};
        $scope.user_info       = {};

        $scope.product_trading_type = {};
        $scope.product_trading = {};
        $scope.fsubmit         = false;

        // get list city
        Location.province('all').then(function (result) {
            if(!result.data.error){
                $scope.list_city     = result.data.data;
            }
        });

        $scope.getDistrict = function (City, callback){
            $("#district-select2").select2({
                theme: "bootstrap"
            });
            
            $scope.districts        = [];
            Location.district(City,'all', true ).then(function (districts) {
                $timeout(function (){
                    if(callback && typeof callback == 'function'){
                        callback();
                    }
                    $scope.districts = districts.data.data;
                });
                
            });
        }

        $http.get(ApiPath + 'product-trading/show-config').success(function (resp){
            /*$scope.product_trading = resp.data;*/
            angular.forEach(resp.data, function (value, key){
                $scope.product_trading[value.product_id] = true;
            });

            $scope.product_trading_type = resp.product_type;
        })



        $scope.change_product_trading = function (id, value){
            
            $http.post(ApiPath + 'product-trading/update', {
                id: id,
                value: value
            }).success(function (resp){
                
            })
        }


        User.load().then(function (result) {
            if(!result.data.error){
                angular.extend($scope.user, result.data.data);
            }

        });

        $scope.$watch('user.city_id', function (Value, OldValue){
            if(Value && Value > 0){
                if(OldValue > 0){
                    $scope.user.district_id = 0;
                }

                $scope.getDistrict(Value, function (){
                    //$scope.$broadcast('districtLoaded');
                });   
            }
        });
        

        $scope.save = function (){
            
            if(!$scope.user.city_id || !$scope.user.district_id){
                alert('Vui lòng chọn tỉnh thành và quận huyện');
                return ;
            }
            $scope.fsubmit  = true;
            User.edit($scope.user).then(function (result) {
                $scope.fsubmit  = false;
                if(result.error){
                    return false;
                }
                
                $state.go('app_register_guide', {buoc:2});
            });
            return;
        }

        Analytics.trackPage('/signup/step1_profile');
    }]);


angular.module('app').controller('RegisterGuideConfigCourierCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo', 'Location', 'User','Config', 'Analytics',
    function($scope, $modal, $http, $state, $stateParams,$location, toaster, UserInfo, Location, User, Config, Analytics) {
       $scope.type_config      = {};
        $scope.config_courier   = {};

        $scope.priority         = {};
        $scope.courier_ranger   = {};

        $scope.type_select      = [
            {id : 4, val : 'Luôn luôn ưu tiên'},
            {id : 3, val : 'Ưu tiên'},
            {id : 2, val : 'Bình thường'},
            {id : 0, val : 'Không sử dụng'}
        ];


        Config.type_config_courier().then(function (result) {
            if(!result.data.error){
                $scope.type_config  = result.data.data;
                angular.forEach($scope.list_courier, function(value, key) {
                    $scope.priority[value.id]           = "";
                    angular.forEach($scope.type_config, function(val, k) {
                        if($scope.config_courier[value.id]  == undefined){
                            $scope.config_courier[value.id] = [];
                        }
                        $scope.config_courier[value.id][val.id] = 0;

                        if($scope.courier_ranger[value.id] == undefined){
                            $scope.courier_ranger[value.id] = {};
                        }

                        if($scope.courier_ranger[value.id][val.id] == undefined){
                            $scope.courier_ranger[value.id][val.id] = {};
                        }

                        $scope.courier_ranger[value.id][val.id]['min']    = 0;
                        $scope.courier_ranger[value.id][val.id]['max']    = 100000000;
                    });
                });
                $scope.load();
            }
        });

        $scope.load     = function(){
            Config.load().then(function (result) {
                if(!result.data.error){
                    angular.forEach(result.data.data, function(value, key) {
                        if(value.priority == 1) value.priority = 2;
                        if(value.priority == 5) value.priority = 4;

                        $scope.priority[value.courier_id]   = 1*value.priority;
                        $scope.config_courier[value.courier_id][value.config_type]          = 1*value.active;
                        $scope.courier_ranger[value.courier_id][value.config_type]['min']   = 1*value.amount_start;
                        $scope.courier_ranger[value.courier_id][value.config_type]['max']   = 1*value.amount_end;
                    });
                }
            });
        }

         $scope.save    = function(courier, type, active){
             var priority   = 0;

             if($scope.priority[courier] != undefined && $scope.priority[courier] > 0){
                 priority   = $scope.priority[courier];
             }

             Config.active({'courier_id' : courier,'config_type' : type,'priority' : priority,'active' : active});
         }

        $scope.change_priority = function(courier, priority){
            Config.priority({'courier_id' : courier, 'priority' : priority}).then(function (result) {
                if(result.data.error){
                    priority = 0;
                }
            });
        }

        $scope.change   = function (courier, type_config, value, type){
            if($scope.courier_ranger[courier][type_config][type] != value){
                if((type == 'min' &&  $scope.courier_ranger[courier][type_config]['min'] >= value) || (type == 'max' && $scope.courier_ranger[courier][type_config]['max'] <= value)){
                    return 'Giá trị không hợp lệ';
                }

                var data = {'courier_id' : courier,'config_type' : type_config};
                if(type == 'max')       data['amount_end']      = value;
                if(type == 'min')       data['amount_start']    = value;

                return Config.active(data).then(function (result) {
                    if(result.data.error){
                        return result.data.error_message;
                    }
                });
            }
            return;
        }
        Analytics.trackPage('/signup/step4_couriers');
    }]);




angular.module('app').controller('RegisterGuideConfigInventoryCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo', 'Location', 'User', 'Inventory', 'Analytics',
    function($scope, $modal, $http, $state, $stateParams, $location, toaster, UserInfo, Location, User, Inventory, Analytics) {

        $scope.list_city  = {};
        $scope.inventory  = {};
        $scope.fsubmit    = false;

        // get list city
        Location.province('all').then(function (result) {
            if(!result.data.error){
                $scope.list_city     = result.data.data;
            }
        });

        Inventory.load().then(function (result) {
            if(!result.data.error && result.data.data.length > 0){

                $scope.inventory   = result.data.data[0];

                var phone       = $scope.inventory.phone.split(',');
                $scope.inventory.phone = [];

                angular.forEach(phone, function (v, k){
                    $scope.inventory.phone.push(v);
                })
                

            }else{
                $scope.inventory   = {active:1};
            }
        });

        $scope.save = function (){
            
            var data_frm    = {},
                phone       = [];



            angular.forEach($scope.inventory.phone, function(value, key) {
                phone.push(value.text);
            });

            
            data_frm        = angular.copy($scope.inventory);
            data_frm.phone  = phone.join(',');
            $scope.fsubmit  = true;

            Inventory.create(data_frm).then(function (result) {
                if(!result.data.error){
                    $state.go('app_register_guide', {buoc:3});
                }
                $scope.fsubmit  = false;
            });
        }

        Analytics.trackPage('/signup/step2_pickup_address');


    }]);


angular.module('app').controller('RegisterGuideConfigAccountingCtrl', ['$scope', '$modal', '$http', '$state', '$rootScope',  '$window', 'toaster', 'Config_Accounting', 'Storage','FileUploader','$localStorage', 'Analytics',
    function($scope, $modal, $http, $state, $rootScope, $window, toaster, Config_Accounting, Storage, FileUploader, $localStorage, Analytics) {

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
        $state.go('app_register_guide', {buoc:4});
        
        $http({
            url: ApiPath + 'user-info/create',
            method: "POST",
            data: {
                'active': 2
            },
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            $rootScope.userInfo.active = 2;
            $localStorage['login']['active'] = 2;
            return;
        }).error(function (data, status, headers, config) {
            return;
        });
    }
    Analytics.trackPage('/signup/step3_payment');


    }]);