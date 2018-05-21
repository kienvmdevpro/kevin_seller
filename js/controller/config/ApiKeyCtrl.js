'use strict';

//Api Key
angular.module('app').controller('ApiKeyCtrl', ['$rootScope','$scope', '$http', '$state', '$window', 'toaster', 'User', '$modal', '$location', '$localStorage', '$filter', '$timeout', 'Inventory', 'OrderStatus', 'Config_Status',
    function ($rootScope,$scope, $http, $state, $window, toaster, User, $modal, $location, $localStorage,$filter,$timeout,Inventory,OrderStatus,Config_Status) {
        // config
        $scope.list_store = {};
        $scope.list_data = {};
        $scope.list_api = {};
        $scope.list_store_lazada = {};
        $scope.wating = true;
        $scope.google_verify = {};
        $scope.list_inventory = {};
        $scope.list_inventory_temp = {};
        $scope.list_service = {};
        $scope.courier = [];
        $scope.service = [];

        


        // gen google verify file
        $scope.gen_google_verify_file = function(){
            var tran = $filter('translate');
            var url = ApiPath + 'api-key/gen-google-verify-file';
            $http({
                url: url,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (!result.error) {
                    $scope.google_verify.filename = result.filename; 
                    $scope.google_verify.content = result.content;
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
        $scope.gen_google_verify_file();
        $scope.$watch('keyLang', function (Value, OldValue) {
            if (Value == 'vi') {
                $scope.list_pay_pvc = OrderStatus.list_pay_pvc;
                $scope.pay_pvc = OrderStatus.pay_pvc;
                $scope.list_service = OrderStatus.list_service;
                $scope.list_status = Config_Status.ExcelOrder;
                
            } else {
                $scope.list_pay_pvc = OrderStatus.pay_pvc_en;
                $scope.pay_pvc = OrderStatus.pay_pvc_en;
                $scope.list_service = OrderStatus.list_service_en;
                $scope.list_status = Config_Status.ExcelOrder_en;
            }
        });
        
        //
        //Load Courier
        $scope.ChangeConfigInventory = function(item){
            $scope.config_inventory = item;
        }

        $scope.loadInventory = function (params, q) {
            params = params || {};
            Inventory.loadWithPostOffice(params).then(function (result) {
                if (!result.data.error) {
                    $scope.list_inventory = result.data.data;
                    angular.forEach(result.data.data,function(value,key){
                        if($rootScope.userInfo.config_inventory == value.id){
                            $scope.config_inventory = value;
                        }
                    });
                } else {
                    $rootScope.hasInventory = false;
                }
            });
        }

        $scope.ChangeConfig = function(){
            var tran = $filter('translate');
            var url = ApiPath + 'store/change-inventory-config';
            var data = {};
            data.config_inventory = $scope.config_inventory.id;
            $http({
                url: url,
                data: data,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                $scope.waitting_add_store = false;
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                } else {
                    toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    $rootScope.userInfo.config_inventory = data.config_inventory;
                    $localStorage['login'].config_inventory = data.config_inventory;
                }
            }).error(function (data, status, headers, config) {
                $scope.waitting_add_store = false;
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        };

        $scope.loadInventory();

        // get key
        User.load_key().then(function (result) {
            if (!result.error) {
                $scope.list_data = result.data.data;
            }
            $scope.wating = false;
        });

        //action

        $scope.add_key = function () {
            User.create_key().then(function (result) {
                if (!result.error) {
                    $scope.list_data.unshift(result.data.data);
                }
            });
            return;
        }

        $scope.edit_key = function (item) {
            var data = { 'active': item.active }
            User.edit_key(data, item.id);
            return;
        }
        $scope.edit_check = function (item) {
            var data = { 'checking': item.checking }
            User.edit_check(data, item.id);
            return;
        }

        $scope.edit_auto = function (item) {
            var data = { 'auto': item.auto }
            User.edit_auto(data, item.id);
            return;
        }

        $scope.change_store = function (item,type,value = {}) {
            var data = {};
            var tran = $filter('translate');
            
            if(type==1){
                data.sync_order = item.sync_order;
            }else if(type==2){
                data.sync_inventory = item.sync_inventory;
            }else if(type==3){
                data.auto_accept_order = item.auto_accept_order;
            }else if(type==4){
                data.courier_config = value.id;
            }else if(type==5){
                data.service_config = value;
            }else if(type==6){
                data.sync_product = item.sync_product;
            }else if(type==7){
                data.free_fee_vc_from = value;
            }

            data.store_id = item.id;
            $http({
                url: ApiPath + 'store/update-store',
                method: "POST",
                data: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                } else {
                    toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                }
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }

        $scope.onTourEnd = function () {
            $state.go('app.config.user');
        }
        //list webhook
        User.load_link_api().then(function (result) {
            if (!result.error) {
                $scope.list_api = {};
                angular.forEach(result.data.data, function (value,key){
                    $scope.list_api[value.link] = {};
                    $scope.list_api[value.link].link = value.link;
                    $scope.list_api[value.link].data = {};
                    angular.forEach(result.data.data, function (value2){
                        if(value2.link == value.link){
                            $scope.list_api[value.link].data[value2.id] = value2
                        }
                    })
                })
                $scope.list_api.length = Object.keys($scope.list_api).length;
            }
            $scope.wating = false;
        });
        //list status
        //add api
        $scope.add_api = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/config/modal.add_webhook.html',
                controller: function ($scope, $modalInstance, $http,google_verify) {
                    $scope.google_verify = google_verify;
                    $scope.accept = function (frm) {
                        $scope.submit_loading = true;
                        frm.google_verify = $scope.google_verify;
                        User.add_link_api(frm).then(function (result) {
                            if (!result.data.error) {
                                User.load_link_api().then(function (result) {
                                    $scope.submit_loading = false;
                                    if (!result.data.error) {
                                        $modalInstance.close(result.data.data);
                                    }
                                });
                            }else{
                                $scope.submit_loading = false;
                            }
                        });
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.download = function(){
                        var blob = new Blob([google_verify.content], {
                            type: "text/html"
                        });
                        saveAs(blob, google_verify.filename);
                    }
                },
                size: 'md',
                resolve : {
                    google_verify: function () {
                        return $scope.google_verify;
                    }
                }
            }).result.then(function(resp) {
                $scope.list_api = {};
                angular.forEach(resp, function (value,key){
                    $scope.list_api[value.link] = {};
                    $scope.list_api[value.link].link = value.link;
                    $scope.list_api[value.link].data = {};
                    angular.forEach(resp, function (value2){
                        if(value2.link == value.link){
                            $scope.list_api[value.link].data[value2.id] = value2
                        }
                    })
                })
                $scope.list_api.length = Object.keys($scope.list_api).length;
            });
        }
        // delete_api
        $scope.delete_api = function(link){
            $scope.delete_api_waiting = true;
            User.delete_link_api({'link' : link}).then(function (result) {
                User.load_link_api().then(function (result) {
                    if (!result.data.error) {
                        $scope.list_api = {};
                        angular.forEach(result.data.data, function (value,key){
                            $scope.list_api[value.link] = {};
                            $scope.list_api[value.link].link = value.link;
                            $scope.list_api[value.link].data = {};
                            angular.forEach(result.data.data, function (value2){
                                if(value2.link == value.link){
                                    $scope.list_api[value.link].data[value2.id] = value2
                                }
                            })
                        })
                        $scope.list_api.length = Object.keys($scope.list_api).length;
                    }
                    $scope.delete_api_waiting = false;
                });
            });
        }
        //
        // Modal add store shopify
        $scope.open_popup_add_store = function (size) {
            $modal.open({
                templateUrl: 'ModalAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.install_app = function () {
                        var tran = $filter('translate');
            
                        if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                            $scope.message_err = tran('SPF_Require_Store');
                        }
                        else if ($scope.frm.store_url === undefined || $scope.frm.store_url === '') {
                            $scope.message_err = tran('SPF_Require_Store_URL');
                        }
                        else if ($scope.frm.store_url.match(/^https:\/\/.+\.myshopify\.com(|\/)$/i) === null) {
                            $scope.message_err = tran('SPF_Require_URL_err');
                        }
                        else {
                            localStorage['store_name'] = $scope.frm.store_name;
                            $scope.message_err = '';
                            var data = {};
                            data.store_url = $scope.frm.store_url;
                            data.store_name = $scope.frm.store_name;
                            var url = ApiPath + 'store/install-app';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                        if (Object.keys(result.data).length > 0) {
                                            $window.location.href = result.data;
                                        }
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
            });
        };
        // Modal add store magento
        $scope.open_popup_magento_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalMagentoAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.add_store = function () {
                        var tran = $filter('translate');
            
                        if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                            $scope.message_err = tran('SPF_Require_Store');
                        }
                        else if ($scope.frm.store_url === undefined || $scope.frm.store_url === '') {
                            $scope.message_err = tran('SPF_Require_Store_URL');
                        }
                        else {
                            if($scope.frm.store_url[$scope.frm.store_url.length-1]=='/'){
                                $scope.frm.store_url = $scope.frm.store_url.slice(0,-1);
                            }
                            $scope.message_err = '';
                            var data = {};
                            data.store_url = $scope.frm.store_url;
                            data.store_name = $scope.frm.store_name;
                            data.user_name = $scope.frm.user_name;
                            data.api_token = $scope.frm.api_token;
                            var url = ApiPath + 'store/add-store-magento';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                        $scope.waitting_add_store = false;
                                        toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                                        if (Object.keys(result.data).length > 0) {
                                            $modalInstance.close({
                                             'action': 'close',
                                             'data'  : result.data
                                         })
                                        }
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
                resolve: {
                    items: function () {
                        return $scope.list_store;
                    }
                }
            });

            modalInstance.result.then(function(resp) {
                $localStorage['store_connect'].magento = $localStorage['store_connect'].magento ? $localStorage['store_connect'].magento : [];
                $rootScope.userInfo.store_connect.magento = $rootScope.userInfo.store_connect.magento ? $rootScope.userInfo.store_connect.magento : [];
                $scope.list_store['magento'] =  $scope.list_store['magento'] ?  $scope.list_store['magento'] : [];
                
                $scope.list_store['magento'].push(resp.data);
                $rootScope.userInfo.store_connect.magento.push(resp.data);
            }, function() {
                return;
            });
        };
        // Modal add store lazada
        $scope.open_popup_lazada_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalLazadaAddStore.html',
                controller: 'ModalLazadaAddStore',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.list_store_lazada;
                    }
                }
            });

            modalInstance.result.then(function(resp) {
                $localStorage['store_connect'].lazada = $localStorage['store_connect'].lazada ? $localStorage['store_connect'].lazada : [];
                $rootScope.userInfo.store_connect.lazada = $rootScope.userInfo.store_connect.lazada ? $rootScope.userInfo.store_connect.lazada : [];
                $scope.list_store['lazada'] =  $scope.list_store['lazada'] ?  $scope.list_store['lazada'] : [];

                $scope.list_store['lazada'].push(resp.data);
                $rootScope.userInfo.store_connect.lazada.push(resp.data);
            }, function() {
                return;
            });
        };
        // Modal add store woocommerce
        $scope.open_popup_woocommerce_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalWoocommerceAddStore.html',
                controller: 'ModalWoocommerceAddStore',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.list_store_woocommerce;
                    }
                }
            });

            modalInstance.result.then(function(resp) {
                $localStorage['store_connect'].woocommerce = $localStorage['store_connect'].woocommerce ? $localStorage['store_connect'].woocommerce : [];
                $rootScope.userInfo.store_connect.woocommerce = $rootScope.userInfo.store_connect.woocommerce ? $rootScope.userInfo.store_connect.woocommerce : [];
                $scope.list_store['woocommerce'] =  $scope.list_store['woocommerce'] ?  $scope.list_store['woocommerce'] : [];
                
                $scope.list_store['woocommerce'].push(resp.data);
                $rootScope.userInfo.store_connect.woocommerce.push(resp.data);
            }, function() {
                return;
            });
        };
        // Modal add store etsy
        $scope.open_popup_etsy_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalEtsyAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.install_app = function () {
                        var tran = $filter('translate');
        
                        if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                            $scope.message_err = tran('SPF_Require_Store');
                        }
                        else if ($scope.frm.store_url === undefined || $scope.frm.store_url === '') {
                            $scope.message_err = tran('SPF_Require_Store_URL');
                        }
                        else if ($scope.frm.store_url.match(/^https:\/\/.+\.etsy\.com(|\/)$/i) === null) {
                            $scope.message_err = tran('SPF_Require_URL_err');
                        }
                        else {
                            localStorage['store_name'] = $scope.frm.store_name;
                            localStorage['store_url'] = $scope.frm.store_url;
                            $scope.message_err = '';
                            var data = {};
                            data.store_url = $scope.frm.store_url;
                            data.store_name = $scope.frm.store_name;
                            var url = ApiPath + 'store/install-app-etsy';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                        if (Object.keys(result.data).length > 0) {
                                            localStorage['oauth_token_secret'] = result.data.oauth_token_secret;
                                            $window.location.href = result.data.login_url;
                                        }
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
            });
        };
        // Modal add store ebay
        $scope.open_popup_ebay_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalEbayAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.install_app = function () {
                        var tran = $filter('translate');
        
                        if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                            $scope.message_err = tran('SPF_Require_Store');
                        } else {
                            localStorage['store_name'] = $scope.frm.store_name;
                            $scope.message_err = '';
                            var data = {};
                            data.store_name = $scope.frm.store_name;
                            var url = ApiPath + 'store/install-app-ebay';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                            $window.location.href = result.data;
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
            });
        };
        // Modal add store haravan
        $scope.open_popup_haravan_add_store = function (size) {
            $modal.open({
                templateUrl: 'ModalHaravanAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.install_app = function () {
                        var tran = $filter('translate');
                        $window.location.href = $scope.frm.store_url+'/admin/api/auth/?api_key=ed84bb63a1400a6cf8eae5703a61784c';
                    }
                },
                size: size,
            });
        };
        // Modal add store robins
        $scope.open_popup_robins_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalRobinsAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.add_store = function () {
                        var tran = $filter('translate');
            
                        if ($scope.frm.user_name === undefined || $scope.frm.user_name === '') {
                            $scope.message_err = tran('Require_UserName');
                        }
                        else if ($scope.frm.api_key === undefined || $scope.frm.api_key === '') {
                            $scope.message_err = tran('SPF_Require_ApiKey');
                        }
                        else {
                            $scope.message_err = '';
                            var data = {};
                            data.user_name = $scope.frm.user_name;
                            data.api_key = $scope.frm.api_key;
                            var url = ApiPath + 'store/add-store-robins';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                        $scope.waitting_add_store = false;
                                        toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                                        if (Object.keys(result.data).length > 0) {
                                            $modalInstance.close({
                                             'action': 'close',
                                             'data'  : result.data
                                         })
                                        }
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
                resolve: {
                    items: function () {
                        return $scope.list_store;
                    }
                }
            });

            modalInstance.result.then(function(resp) {
                $localStorage['store_connect'].robins = $localStorage['store_connect'].robins ? $localStorage['store_connect'].robins : [];
                $rootScope.userInfo.store_connect.robins = $rootScope.userInfo.store_connect.robins ? $rootScope.userInfo.store_connect.robins : [];
                $scope.list_store['robins'] =  $scope.list_store['robins'] ?  $scope.list_store['robins'] : [];
                
                $scope.list_store['robins'].push(resp.data);
                $rootScope.userInfo.store_connect.robins.push(resp.data);
            }, function() {
                return;
            });
        };

        // Modal add store zalo
        $scope.open_popup_zalo_add_store = function (size) {
            var tran = $filter('translate');
            var url = ApiPath + 'zalo/install-app-zalo';
            $http({
                url: url,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                } else {
                    if (!result.error) {
                        $window.location.href = result.data;
                    }
                }
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        };

        // Modal add store shopee
        $scope.open_popup_shopee_add_store = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'ModalShopeeAddStore.html',
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
                    $scope.frm = {};
                    $scope.message_err = '';
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.add_store = function () {
                        var tran = $filter('translate');
            
                        if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                            $scope.message_err = tran('SPF_Require_Store');
                        }
                        else if ($scope.frm.partner_id === undefined || $scope.frm.partner_id === '') {
                            $scope.message_err = tran('SPF_Require_PartnerId');
                        }
                        else if ($scope.frm.shop_id === undefined || $scope.frm.shop_id === '') {
                            $scope.message_err = tran('SPF_Require_ShopId');
                        }
                        else if ($scope.frm.secret_key === undefined || $scope.frm.secret_key === '') {
                            $scope.message_err = tran('SPF_Require_SecretKey');
                        }
                        else {
                            $scope.message_err = '';
                            var data = {};
                            data.partner_id = $scope.frm.partner_id;
                            data.shop_id = $scope.frm.shop_id;
                            data.store_name = $scope.frm.store_name;
                            data.secret_key = $scope.frm.secret_key;
                            var url = ApiPath + 'store/add-store-shopee';
                            $scope.waitting_add_store = true;
                            $http({
                                url: url,
                                data: data,
                                method: "POST",
                                dataType: 'json'
                            }).success(function (result, status, headers, config) {
                                if (result.error) {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                                } else {
                                    if (!result.error) {
                                        $scope.waitting_add_store = false;
                                        toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                                        if (Object.keys(result.data).length > 0) {
                                            $modalInstance.close({
                                             'action': 'close',
                                             'data'  : result.data
                                         })
                                        }
                                    }
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.waitting_add_store = false;
                                if (status == 440) {
                                    Storage.remove();
                                } else {
                                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                                }
                            });
                        }
                    }
                },
                size: size,
                resolve: {
                    items: function () {
                        return $scope.list_store;
                    }
                }
            });

            modalInstance.result.then(function(resp) {
                $localStorage['store_connect'].shopee = $localStorage['store_connect'].shopee ? $localStorage['store_connect'].shopee : [];
                $rootScope.userInfo.store_connect.shopee = $rootScope.userInfo.store_connect.shopee ? $rootScope.userInfo.store_connect.shopee : [];
                $scope.list_store['shopee'] =  $scope.list_store['shopee'] ?  $scope.list_store['shopee'] : [];
                
                $scope.list_store['shopee'].push(resp.data);
                $rootScope.userInfo.store_connect.shopee.push(resp.data);
            }, function() {
                return;
            });
        };
        // Modal test data lazada
        $scope.open_popup_trial_store_woocommerce = function (size, store_id) {
            $modal.open({
                templateUrl: 'ModalTrialStoreWoocommerce.html',
                controller: 'ModalTrialStoreWoocommerce',
                size: size,
                resolve: {
                    items: function () {
                        return store_id;
                    }
                }
            });
        };
        // Modal test data
        $scope.open_popup_trial_store = function (size, store_id,type,template) {
            $modal.open({
                templateUrl: template,
                controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService, items) {
                    $scope.items = items;
                    $scope.list_data = {};
                    $scope.waiting_trial = true;
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    }
                    $scope.load_data = function () {
                        var tran = $filter('translate');
                        var url;
                        switch(type) {
                            case 1:
                                url = ApiPath + 'store/order-test'
                                break;
                            case 2:
                                url = ApiPath + 'store/order-test-magento'
                                break;
                            case 3:
                                url = ApiPath + 'store/order-test-lazada'
                                break;
                            case 4:
                                url = ApiPath + 'woocommerce/orders'
                                break;
                            case 5:
                                url = ApiPath + 'store/order-test-etsy'
                                break;
                            case 6:
                                url = ApiPath + 'store/order-test-ebay'
                                break;
                            case 7:
                                url = ApiPath + 'store/order-test-haravan'
                                break;
                            case 8:
                                url = ApiPath + 'store/order-test-robins'
                                break;
                            case 10:
                                url = ApiPath + 'store/order-test-shopee'
                        }
                        var data = {};
                        data.store_id = $scope.items;
                        $http({
                            url: url,
                            method: "POST",
                            data: data,
                            dataType: 'json'
                        }).success(function (result, status, headers, config) {
                            if (result.error) {
                                toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                            } else {
                                if (!result.error) {
                                    $scope.list_data = result.data;
                                }
                            }
                            $scope.waiting_trial = false;
                        }).error(function (data, status, headers, config) {
                            if (status == 440) {
                                Storage.remove();
                            } else {
                                toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                            }
                        });
                    }
                    $scope.load_data();
                },
                size: size,
                resolve: {
                    items: function () {
                        return store_id;
                    }
                }
            });
        };
        // Load data store
        $scope.load_data = function () {
            var tran = $filter('translate');
            var url = ApiPath + 'store';
            $http({
                url: url,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (!result.error) {
                    if (Object.keys(result.data).length > 0) {
                        $scope.list_store = result.data;
                        angular.forEach($scope.list_store['all'],function (value_store){
                            angular.forEach($scope.list_courier,function(value_courier){
                                if(value_store.courier_config == value_courier.id){
                                    $scope.courier[value_store.id] = value_courier;
                                }
                            });

                            angular.forEach($scope.list_service,function(value_service){
                                if(value_store.service_config == value_service.id){
                                    $scope.service[value_store.id] = value_service;
                                }
                            });

                        });
                    }
                }
                $scope.waiting_store = false;
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
                $scope.waiting_store = false;
            });
        }
        
        // Add store shopify
        $scope.add_store = function (code, shop, hmac, timestamp) {
            var tran = $filter('translate');
            var data = {};
            data.code = code;
            data.shop = shop;
            data.hmac = hmac;
            data.timestamp = timestamp;
            data.store_name = localStorage['store_name'] ? localStorage['store_name'] : '';
            var url = ApiPath + 'store/add-store';
            $http({
                url: url,
                data: data,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                    $scope.load_data();
                }
                else {
                    if (!result.error) {
                        toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
                        delete localStorage['store_name'];
                        $localStorage['store_connect'].shopify = $localStorage['store_connect'].shopify ? $localStorage['store_connect'].shopify : [];
                        $rootScope.userInfo.store_connect.shopify = $rootScope.userInfo.store_connect.shopify ? $rootScope.userInfo.store_connect.shopify : [];
                        $localStorage['store_connect'].shopify.push(result.data);
                        $rootScope.userInfo.store_connect.shopify.push(result.data);
                        $timeout(function () {
                            $window.location.href = '/#/app/config/key';
                        }, 2000);
                    }
                }

            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
        // Add store etsy
        $scope.add_store_etsy = function (oauth_token, oauth_verifier) {
            var tran = $filter('translate');
            var data = {};
            data.oauth_token = oauth_token;
            data.oauth_verifier = oauth_verifier;
            data.store_name = localStorage['store_name'] ? localStorage['store_name'] : '';
            data.store_url = localStorage['store_url'] ? localStorage['store_url'] : '';
            data.token_secret = localStorage['oauth_token_secret'] ? localStorage['oauth_token_secret'] : '';
            var url = ApiPath + 'store/add-store-etsy';
            $http({
                url: url,
                data: data,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                }
                else {
                    if (!result.error) {
                        toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
                        delete localStorage['store_name'];
                        delete localStorage['oauth_token_secret'];
                        $localStorage['store_connect'].etsy = $localStorage['store_connect'].etsy ? $localStorage['store_connect'].etsy : [];
                        $rootScope.userInfo.store_connect.etsy = $rootScope.userInfo.store_connect.etsy ? $rootScope.userInfo.store_connect.etsy : [];
                        $localStorage['store_connect'].etsy.push(result.data);
                        $rootScope.userInfo.store_connect.etsy.push(result.data);
                        $timeout(function () {
                            $window.location.href = '/#/app/config/key';
                            $window.location.reload();
                        }, 2000);
                    }
                }

            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
        // Add store ebay
        $scope.add_store_ebay = function (code) {
            var tran = $filter('translate');
            var data = {};
            data.code = code;
            data.store_name = localStorage['store_name'] ? localStorage['store_name'] : '';
            var url = ApiPath + 'store/add-store-ebay';
            $http({
                url: url,
                data: data,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                }
                else {
                    if (!result.error) {
                        toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
                        delete localStorage['store_name'];
                        $localStorage['store_connect'].ebay = $localStorage['store_connect'].ebay ? $localStorage['store_connect'].ebay : [];
                        $rootScope.userInfo.store_connect.ebay = $rootScope.userInfo.store_connect.ebay ? $rootScope.userInfo.store_connect.ebay : [];
                        $localStorage['store_connect'].ebay.push(result.data);
                        $rootScope.userInfo.store_connect.ebay.push(result.data);
                        $timeout(function () {
                            $window.location.href = '/#/app/config/key';
                            $window.location.reload();
                        }, 1000);
                    }
                }

            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
        // Delete store
        $scope.delete_store = function (store_id,index , type) {
            var tran = $filter('translate');
            var msg = tran('SPF_Delete_Store');
            bootbox.confirm(msg, function (result) {
                if (result) {
                    var url = ApiPath + 'store/delete-store';
                    var data = {};
                    data.store_id = store_id;
                    $http({
                        url: url,
                        method: "POST",
                        data: data,
                        dataType: 'json'
                    }).success(function (result, status, headers, config) {
                        if (result.error) {
                            toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                            
                        } else {
                            if (!result.error) {
                                toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
                                if(type==1){
                                    $scope.list_store['shopify'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.shopify, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.shopify.splice(key,1);
                                            $localStorage['store_connect'].shopify.splice(key,1);
                                        }
                                    })
                                }else if(type==2){
                                    $scope.list_store['magento'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.magento, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.magento.splice(key,1);
                                            $localStorage['store_connect'].magento.splice(key,1);
                                        }
                                    })
                                }else if(type==3){
                                    $scope.list_store['lazada'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.lazada, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.lazada.splice(key,1);
                                            $localStorage['store_connect'].lazada.splice(key,1);
                                        }
                                    })
                                }else if(type==4){
                                    $scope.list_store['woocommerce'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.woocommerce, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.woocommerce.splice(key,1);
                                            $localStorage['store_connect'].woocommerce.splice(key,1);
                                        }
                                    })
                                }else if(type==5){
                                    $scope.list_store['etsy'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.etsy, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.etsy.splice(key,1);
                                            $localStorage['store_connect'].etsy.splice(key,1);
                                        }
                                    })
                                }else if(type==6){
                                    $scope.list_store['ebay'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.ebay, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.ebay.splice(key,1);
                                            $localStorage['store_connect'].ebay.splice(key,1);
                                        }
                                    })
                                }else if(type==7){
                                    $scope.list_store['haravan'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.haravan, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.haravan.splice(key,1);
                                            $localStorage['store_connect'].haravan.splice(key,1);
                                        }
                                    })
                                }else if(type==8){
                                    $scope.list_store['robins'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.robins, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.robins.splice(key,1);
                                            $localStorage['store_connect'].robins.splice(key,1);
                                        }
                                    })
                                }else if(type==9){
                                    $scope.list_store['zalo'].splice(index,1);
                                    angular.forEach($rootScope.userInfo.store_connect.zalo, function (value,key){
                                        if(value.id == result.data){
                                            $rootScope.userInfo.store_connect.zalo.splice(key,1);
                                            $localStorage['store_connect'].zalo.splice(key,1);
                                        }
                                    })
                                }
                            }
                        }
                        $scope.waiting_store = false;

                    }).error(function (data, status, headers, config) {
                        if (status == 440) {
                            Storage.remove();
                        } else {
                            toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                        }
                    });
                }
            });
        }
        // get param shopify redirect
        if ($location.absUrl().match(/(code=([^&]*))/g) !== null && $location.absUrl().match(/(shop=([^&]*))/g) !== null && $location.absUrl().match(/(hmac=([^&]*))/g) !== null && $location.absUrl().match(/(timestamp=([^&]*#))/g) !== null) {
            let code = $location.absUrl().match(/(code=([^&]*))/g)[0].replace("code=", "");
            let shop = $location.absUrl().match(/(shop=([^&]*))/g)[0].replace("shop=", "");
            let hmac = $location.absUrl().match(/(hmac=([^&]*))/g)[0].replace("hmac=", "");
            let timestamp = $location.absUrl().match(/(timestamp=([^&]*#))/g)[0].replace("timestamp=", "").replace("#", "");
            $scope.add_store(code, shop, hmac, timestamp);
        }
        // get param etsy redirect
        else if($location.absUrl().match(/(oauth_token=([^&]*))/g) !== null && $location.absUrl().match(/(oauth_verifier=([^&]*))/g) !== null) {
            let oauth_token = $location.absUrl().match(/(oauth_token=([^&]*))/g)[0].replace("oauth_token=", "");
            let oauth_verifier = $location.absUrl().match(/(oauth_verifier=([^&]*))/g)[0].replace("oauth_verifier=", "").replace("#_=_","");
            $scope.add_store_etsy(oauth_token,oauth_verifier);
        }
        // get param ebay redirect
        else if($location.absUrl().match(/(state=([^&]*))/g) !== null && $location.absUrl().match(/(code=([^&]*))/g) !== null) {
            let code = $location.absUrl().match(/(code=([^&]*))/g)[0].replace("code=", "");
            $scope.add_store_ebay(code);
        }
        else {
            $scope.load_data();
            // $scope.load_data_lazada();
            // $scope.load_data_woocommerce();
        }


        //===================Showw Error Zalo=================
        if ($location.absUrl().match(/(error=([^&]*))/g) !== null && $location.absUrl().match(/(type=([^&]*))/g) !== null && $location.absUrl().match(/(errorCode=([^&]*))/g) !== null) {
            var error = $location.absUrl().match(/(error=([^&]*))/g)[0].replace("error=", "");
            var type = $location.absUrl().match(/(type=([^&]*))/g)[0].replace("type=", "");
            var errorCode = $location.absUrl().match(/(errorCode=([^&]*))/g)[0].replace("errorCode=", "");
            var message = "";
            var tran = $filter('translate');
            if(type==9){
                if (errorCode!=1) {
                    $modal.open({
                        templateUrl: 'ModalZaloError.html',
                        controller: function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService, errorCode) {
                            $scope.errorCode = errorCode;
                            console.log(errorCode);
                            if (errorCode == 1000) {
                                $scope.message = tran('Zalo_duplicate');
                            } else if (parseInt(errorCode) == (- 204)) {
                                $scope.message = tran('Zalo_shop_disable');
                            } else if (parseInt(errorCode) == (- 201)) {
                                $scope.message = tran('Zalo_shop_not_exits');
                            }else{
                                $scope.message = tran('Zalo_Error');
                            }
                            $scope.close = function () {
                                $modalInstance.dismiss('cancel');
                            }
                        },
                        size: 'lg',
                        resolve: {
                            errorCode: function () {
                                return errorCode;
                            }
                        }
                    });
                }else{
                    toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                }
            }
        }
    }
    ]);

angular.module('app').controller('ModalLazadaAddStore',
    ['$rootScope', '$scope', '$modalInstance', '$filter', 'toaster', '$modal', '$http', '$state', '$window', '$stateParams', 'Order', 'Inventory', 'Config_Status', 'PhpJs', '$anchorScroll', '$location', 'loginService',
    function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
        $scope.frm = {};
        $scope.message_err = '';
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        }
        $scope.add_store = function () {
            var tran = $filter('translate');

            if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                $scope.message_err = tran('SPF_Require_Store');
            }
            else if ($scope.frm.store_url === undefined || $scope.frm.store_url === '') {
                $scope.message_err = tran('SPF_Require_Store_URL');
            }
            else if ($scope.frm.user_name === undefined || $scope.frm.user_name === '') {
                $scope.message_err = tran('SPF_Require_UserName');
            }
            else if ($scope.frm.api_key === undefined || $scope.frm.api_key === '') {
                $scope.message_err = tran('SPF_Require_ApiKey');
            }
            else {
                $scope.message_err = '';
                var data = {};
                data.store_url = $scope.frm.store_url;
                data.store_name = $scope.frm.store_name;
                data.user_name = $scope.frm.user_name;
                data.api_key = $scope.frm.api_key;
                var url = ApiPath + 'lazada/add-store';
                $scope.waiting = true;
                $http({
                    url: url,
                    data: data,
                    method: "POST",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    $scope.waiting = false;
                    if (result.error) {
                        var error_message;
                        if(result.error_code == 'DUPLICATE'){
                            error_message = tran('Toaster_Lazada_duplicate');
                        }else if(result.error_code == 'ERROR_RESPONSE'){
                            error_message = tran('Toaster_Lazada_error_reponse');
                        }
                        toaster.pop('warning', tran('toaster_ss_nitifi'), error_message);
                    } else {
                        if (!result.error) {
                            toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                            
                        }
                    }
                }).error(function (data, status, headers, config) {
                    if (status == 440) {
                        Storage.remove();
                    } else {
                        toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                });
            }
        }
    }
    ]);
angular.module('app').controller('ModalWoocommerceAddStore',
    ['$rootScope', '$scope', '$modalInstance', '$filter', 'toaster', '$modal', '$http', '$state', '$window', '$stateParams', 'Order', 'Inventory', 'Config_Status', 'PhpJs', '$anchorScroll', '$location', 'loginService',
    function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
        $scope.frm = {};
        $scope.message_err = '';
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        }
        $scope.add_store = function () {
            var tran = $filter('translate');

            if ($scope.frm.store_name === undefined || $scope.frm.store_name === '') {
                $scope.message_err = tran('SPF_Require_Store');
            }
            else if ($scope.frm.store_url === undefined || $scope.frm.store_url === '') {
                $scope.message_err = tran('SPF_Require_Store_URL');
            }
            else if ($scope.frm.consumer_key === undefined || $scope.frm.consumer_key === '') {
                $scope.message_err = tran('SPF_Require_Key');
            }
            else if ($scope.frm.consumer_secret === undefined || $scope.frm.consumer_secret === '') {
                $scope.message_err = tran('SPF_Require_Secret');
            }
            else {
                $scope.message_err = '';
                var data = {};
                data.store_url = $scope.frm.store_url;
                data.store_name = $scope.frm.store_name;
                data.consumer_key = $scope.frm.consumer_key;
                data.consumer_secret = $scope.frm.consumer_secret;
                var url = ApiPath + 'woocommerce/add-store';
                $scope.waiting = true;
                $http({
                    url: url,
                    data: data,
                    method: "POST",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    $scope.waiting = false;
                    if (result.error) {
                        var error_message;
                        if(result.error_code == 'DUPLICATE'){
                            error_message = tran('Toaster_Lazada_duplicate');
                        }else if(result.error_code == 'ERROR_RESPONSE'){
                            error_message = tran('Toaster_Lazada_error_reponse');
                        }
                        toaster.pop('warning', tran('toaster_ss_nitifi'), error_message);
                    } else {
                        if (!result.error) {
                            toaster.pop('success', tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                            if (Object.keys(result.data).length > 0) {
                                $modalInstance.close({
                                     'action': 'close',
                                     'data'  : result.data
                                 })
                            }
                        }
                    }
                }).error(function (data, status, headers, config) {
                    $scope.waiting = false;
                    if (status == 440) {
                        Storage.remove();
                    } else {
                        toaster.pop('warning', tran('toaster_ss_nitifi'), data.error.message);
                    }
                });
            }
        }
    }
    ]);
angular.module('app').controller('ModalTrialStoreWoocommerce',
    ['$rootScope', '$scope', '$modalInstance', '$filter', 'toaster', '$modal', '$http', '$state', '$window', '$stateParams', 'Order', 'Inventory', 'Config_Status', 'PhpJs', '$anchorScroll', '$location', 'loginService', 'items',
    function ($rootScope, $scope, $modalInstance, $filter, toaster, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService, items) {
        $scope.items = items;
        $scope.list_data = {};
        $scope.waiting_trial = true;
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        }

        var tran = $filter('translate');

        $scope.load_data = function () {
            var url = ApiPath + 'woocommerce/orders';
            var data = {};
            data.store = $scope.items.store_url;
            $http({
                url: url,
                method: "GET",
                params: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                } else {
                    if (!result.error) {
                        $scope.list_data = result.data;
                    }
                }
                $scope.waiting_trial = false;
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
        $scope.load_data();

        $scope.get_orders_items = function(item){
            var url = ApiPath + 'woocommerce/orders-items';
            var data = {};
            data.store = $scope.items.user_name;
            data.orders_id = item.OrderId;
            $http({
                url: url,
                method: "GET",
                params: data,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.error_message);
                } else {
                    if (!result.error) {
                        
                    }
                }
                $scope.waiting_trial = false;
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
    }]);
