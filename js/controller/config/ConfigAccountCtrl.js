'use strict';

//Config Account
angular.module('app').controller('ConfigAccountCtrl', 
		  ['$scope','$rootScope','$modal', '$http', '$filter', 'bootbox', 'User', 'UserInfo', 'AppStorage', '$facebook', 'toaster', 'Location', '$timeout',
    function($scope, $rootScope,  $modal,   $http,   $filter,   bootbox,   User,   UserInfo,   AppStorage,   $facebook,   toaster, Location, $timeout ) {
	   var tran = $filter('translate');
		$scope.user                   = {country_id:0, city_id: 0, notice_type : {}, layers_security : String($rootScope.userInfo.layers_security)};
        $scope.fsubmit                = false;
        $scope.integrationLoading     = false;
        $scope.product_trading_type   = {};
        $scope.product_trading        = {};
        $scope.userInfo               = $rootScope.userInfo;

        $http.get(ApiPath + 'product-trading/show-config').success(function (resp){
            angular.forEach(resp.data, function (value){
                $scope.product_trading[value.product_id] = true;
            });

            $scope.product_trading_type = resp.product_type;
        })

        // AppStorage.loadCity(function (cities){
        //     $scope.list_city  = cities;
        //     if(cities.length == 0){
        //         //toaster.pop('warning', 'Thông báo', 'Tải danh sách Tỉnh/Thành Phố lỗi !');
        //     	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaiDSThanhPhOloi'));
        //     }
        // })

        //load country 

        $scope.list_country = [];

        Location.country().then(function (resp){
            $scope.list_country = resp.data.data;
            // $scope.list_country.forEach(function (value){
            //     if(value.id == 237){
            //         $scope.To.Buyer.Country = value;
            //     }
            // })

            
            User.load().then(function (result) {
                if(!result.data.error){
                    $timeout(function (){
                        angular.extend($scope.user, result.data.data);
                    }, 0)
                    //console.log('$scope.user', $scope.user);
                }
             });
        })
        
        $scope.list_city_global = [];

        //list currency
        $http.get(ApiUrl + 'api/base/' + 'currency').success(function (resp){
            $scope.list_currency = resp.data;
        })
        $scope.list_city_vn = []
        $scope.list_city_global = [];
        $scope.loadCityGlobal = function (country_id, q){
            $scope.list_city_global = [];
            if(country_id && country_id == 237){
                return Location.province("all").then(function (resp){
                    $scope.list_city_vn = resp.data.data;
                })
            }else{
                if(country_id && country_id >= 0){
                    return Location.city_global(country_id, q).then(function (resp){
                        $scope.list_city_global = resp.data.data;
                    })
                }else{
                    return $scope.list_city_global = []
                }
                
            }
        }

        $scope.$watch('user.country_id', function (newVal){
            if(newVal ) {
                $scope.loadCityGlobal(newVal, "");
            }
        })

        // get list user
        $scope.changedInfo = false;

        $scope.changeField  = function (){
            $scope.changedInfo = true;
        }

        
        $http.get(ApiPath + 'user-config-transport/showbyuser').success(function (resp){
            if(!resp.error){
                angular.forEach(resp.data, function (value, key){
                    if(value.transport_id == 3 ){// facebook
                        $scope.user.notice_type['facebook'] = !!value.active;
                    }

                    if(value.transport_id == 2 ){// email
                        $scope.user.notice_type['email'] = !!value.active;
                        $scope.user['email_notice']      = value.received;
                    }
                })
            }
        })

        /**
         * Change
        */
        $scope.change_product_trading = function (id, value){
            $http.post(ApiPath + 'product-trading/update', {
                id: id,
                value: value
            }).success(function (resp){
            })
        }

        $scope.test = function(){
            var modalInstance = $modal.open({
                templateUrl: 'ModalBonus.html',
                controller: 'ModalBonusCtrl',
                resolve: {
                    items: function () {
                        return $scope.user;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.user_info.active = selectedItem;
                $rootScope.$broadcast('ChangeActive', selectedItem);
            });
        }
        $scope.change_info = function(data){
            $scope.fsubmit  = true;
            if($rootScope.userInfo.layers_security == 1){
                return $scope.open_popup_security_phone(8, data);
            }else{
                User.edit_info(data).then(function (result) {
                    $scope.fsubmit  = false;
                    
                 // Intercom   
                    try {
                    	var metadata = {
 	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
 	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
 	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
 	            		};
            			Intercom('trackEvent', 'Account Config', metadata);
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                    if(!result.error){
                    	angular.forEach($scope.list_currency, function(item) {
                    		if(item.id == $scope.user.currency){
                    		}
                        });
                    }
                },function(reason){
                    $scope.fsubmit  = false;
                });
            }
            return;
        }

        $scope.save = function(data){
            $scope.fsubmit  = true;
            
            if($rootScope.userInfo.layers_security == 1 && ($scope.user.password_new != '')){
                return $scope.open_popup_security(2, data);
            }else{
                User.edit(data).then(function (result) {
                    $scope.fsubmit  = false;
                    // Intercom   
                    try {
                    	var metadata = {
 	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
 	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
 	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
 	            		};
            			Intercom('trackEvent', 'Account Config', metadata);
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                });
            }
            return;
        }

        $scope.destroyIntegration = function (){
            $http({
                url: ApiPath + 'facebook/integration-destroy',
                method: "POST",
                data: {},
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .success(function (result, status, headers, config) {
                if(result.error){
                    toaster.pop('warning',tran('toaster_ss_nitifi'), result.error_message);
                }else {
                    $scope.user['integration']  = {};
                    $scope.user.notice_type['facebook'] = false;
                    $scope.user['profile_id']   = 0;
                    $facebook.logout();
                toaster.pop('success', tran('toaster_ss_nitifi'), result.error_message);
                
                }
            }).error(function (data, status, headers, config) {
                //toaster.pop('warning', 'Thông báo', 'Kết nối thất bại, vui lòng thử lại');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            });
        }

        $scope.fbIntergation = function (){
            $scope.integrationLoading = true;
            $facebook.getLoginStatus().then(function (resp){
            // Kiểm tra session login
            //console.log(resp);
                if(resp.status == 'connected'){
                // Gủi request lên server lấy thông tin user
                    $http({
                        url: ApiPath+'facebook/integration',
                        method: "POST",
                        data: {
                        'access_token'  : resp.authResponse.accessToken,
                        'profile_id'    : resp.authResponse.userID,
                        'expires'       : resp.authResponse.expiresIn
                        },
                        dataType: 'json',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (result, status, headers, config) {
                        $scope.integrationLoading = false;
                        if(result.error){
                            toaster.pop('warning', tran('toaster_ss_nitifi'), result.error_message);
                        }else {
                            $scope.user['integration']  = result.data;
                            $scope.user['profile_id']   = result.data['profile_id'];
                            toaster.pop('success', tran('toaster_ss_nitifi'), result.error_message);
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.integrationLoading = false;
                        //toaster.pop('warning', 'Thông báo', 'Kết nối thất bại, vui lòng thử lại');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    });
                }else {
                // Nếu chưa có session thì tiến hành login;
                    $facebook.login().then(function (resp){
                        $scope.fbIntergation();
                    }, function (errr){
                        //toaster.pop('warning', 'Thông báo', 'Liên kết facebook không thành công');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_LienKetFBLoi'));
                    })
                }
            },
            function (err){
               // toaster.pop('warning', 'Thông báo', 'Liên kết facebook không thành công');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_LienKetFBLoi'));
            })
        }

        $scope.open_popup_security_phone = function(type, data){
            var modalInstance;
            return UserInfo.send_otp({type : type,phone:data.phone}).then(function (result) {
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
                            if(data.phone != undefined){
                                $rootScope.userInfo.phone = data.phone;
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
                            if(data['layers_security'] != undefined){
                                $rootScope.userInfo.layers_security = data['layers_security'];
                                $scope.user.layers_security         = data['layers_security'];
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

    $scope.change = function(user,value, field){
        if(value == 1) user.layers_security = "0";
        if(value == 0) user.layers_security = "1";

        var dataupdate = {};
        if(value != undefined){
            dataupdate[field]  = value;
            return $scope.open_popup_security(1, dataupdate);
        }
        return;
    };

    $scope.showSecurity = function() {
        var selected = $filter('filter')($scope.list_security_layers, {value: $scope.user.layers_security});
        return (selected.length) ? selected[0].text : 'Not set';
    };
    //luu sdt khi KH chua cap nhat 
    $scope.saveData = function(name,phone,city,district,address,currency,country){
        var data = {'fullname':name,'phone':phone,'city_id':city,'district_id':district,'address':address,'currency':currency,'country_id':country};
        $http({
            url: ApiPath+'user/edit-info',
            method: "POST",
            data:data,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            if(result.error){
                toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                
            }else {
                toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
            }
        });
    }
}]);

angular.module('app').controller('ModalBonusCtrl', 
	 ['$scope', '$modalInstance', '$http', 'toaster', 'bootbox', 'items','$filter',
function($scope, $modalInstance,   $http,   toaster,   bootbox,   items,  $filter) {
	var tran = $filter('translate');
    $scope.user = items;
    $scope.run = function (active) {
        var data = {'active':active};
        $http({
            url: ApiPath+'user-info/create',
            method: "POST",
            data:data,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            return;
        }).error(function (data, status, headers, config) {
            return;
        });
        $modalInstance.close(active);
    };
    
}]);