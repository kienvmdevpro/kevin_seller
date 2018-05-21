'use strict';

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(window.location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

angular.module('app').config(
  [          '$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($stateProvider,   $urlRouterProvider,   $controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;

        $urlRouterProvider
            .otherwise('/order/list/7day');

        $stateProvider
            .state('app_register_guide', {
                url: '/hoan-tat-dang-ky?buoc',
                templateUrl: 'tpl/app_register_guide.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/config/RegisterGuideCtrl.js');
                        }]
                }
            })
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'tpl/app_order.html'
            })
            .state('app.cash', {
                url: '/cash/{code}?transaction_info&price&payment_id&payment_type&error_text&secure_code&token_nl',
                templateUrl: 'tpl/result_cash.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/config/ResultCashCtrl.js');
                        }]
                }
            }).state('app.change_email', {
                url: '/change_email?refer_code',
                templateUrl: 'tpl/result_change_email.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/config/ChangeEmailCtrl.js');
                        }]
                }
            })

            .state('app.verify_child', {
                url: '/verify_child/:token',
                templateUrl: 'tpl/result_verify_child.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/config/ResultVerifyChildCtrl.js');
                        }]
                }
            })

            .state('app.verify_bank', {
                url: '/verify_bank/:token',
                templateUrl: 'tpl/result_verify_bank.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/config/ResultVerifyBankCtrl.js');
                        }]
                }
            })

            .state('app.confirm_email', {
                url: '/confirm_email/{code}',
                templateUrl: 'tpl/result_confirm_email.html',
            })

            .state('app.dashbroad', {
                url: '/tong-quan',
                templateUrl: 'tpl/dashbroad/main.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/dashbroad/DashbroadCtrl.js');
                        }]
                }
            })


            /** 
             *  config acount
            **/
            
            .state('app.config', {
                url: '/config',
                templateUrl: 'tpl/config/setting_layout.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load(['bm.bsTour','angular-bootbox']);
                    }]
                }
            })
            .state('app.config.account', {
                url: '/account',
                templateUrl: 'tpl/config/account.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigAccountCtrl.js');
                    }]
                }
            })
            .state('app.config.business', {
                url: '/business',
                templateUrl: 'tpl/config/business.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigBusinessCtrl.js');
                    }]
                }
            })
            .state('app.config.inventory', {
                url: '/inventory',
                templateUrl: 'tpl/config/inventory.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigInventoryCtrl.js');
                    }]
                }
            })
            .state('app.config.accounting', {
                url: '/accounting',
                templateUrl: 'tpl/config/accounting.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigAccountingCtrl.js');
                    }]
                }
            })
            .state('app.config.shipping', {
                url: '/shipping',
                templateUrl: 'tpl/config/shipping.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigShippingCtrl.js');
                    }]
                }
            })
            .state('app.config.courier', {
                url: '/courier',
                templateUrl: 'tpl/config/courier.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('xeditable').then(
                                function(){
                                    return $ocLazyLoad.load('js/controller/config/ConfigCourierCtrl.js');
                                }
                            );
                        }]
                }
            })
            .state('app.config.user', {
                url: '/user',
                templateUrl: 'tpl/config/user.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ConfigChildCtrl.js');
                    }]
                }
            })
            .state('app.config.key', {
                url: '/key',
                templateUrl: 'tpl/config/api_key.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ApiKeyCtrl.js');
                    }]
                }
            })
            /**
             * Ticket
             **/
            .state('ticket', {
                abstract: true,
                url: '/ticket',
                templateUrl: 'tpl/app_ticket.html'
            })
            .state('ticket.request', {
                abstract: true,
                url: '/request',
                templateUrl: 'tpl/ticket/setting_layout.html'

            })
            .state('ticket.request.management', {
                url: '/management/{time_start}?id',
                templateUrl: 'tpl/ticket/management.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load(['bm.bsTour', 'angular-bootbox', 'js/controller/ticket/ManagementCtrl.js']);
                    }]
                }
            })
            .state('ticket.request.management.detail', {
                url: '/{code}',
                templateUrl: 'tpl/ticket/detail.html'
            })



            
            
            /**
             * Order
             **/
            .state('detail', {
                url: '/detail/{code}',
                templateUrl: 'tpl/orders/detail.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/order/DetailCtrl.js');
                        }]
                }
            })
            .state('order', {
                abstract: true,
                url: '/order',
                templateUrl: 'tpl/app_order.html'
            })
            .state('order.list', {
                url: '/list/{time_start}',
                templateUrl: 'tpl/orders/orders.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load(['xeditable','angular-bootbox']).then(
                            function(){
                                return $ocLazyLoad.load('js/controller/order/OrderCtrl.js');
                            }
                        );
                    }]
                }
            })
            .state('order.list.detail', {
                url: '/{code}',
                templateUrl: 'tpl/orders/list_detail.html'
            })
            .state('order.management', {
                url: '/management',
                templateUrl: 'tpl/orders/management.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('angular-bootbox').then(
                                function(){
                                    return $ocLazyLoad.load('js/controller/order/ManagementCtrl.js');
                                }
                            );
                        }]
                }
            })

            .state('order.process', {
                url: '/process/',
                templateUrl: 'tpl/orders/process.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('angular-bootbox').then(
                                function(){
                                    return $ocLazyLoad.load('js/controller/order/ProcessCtrl.js');
                                }
                            );
                        }]
                }
            })
             // verify
            .state('order.verify', {
                url: '/verify?id',
                templateUrl: 'tpl/orders/verify.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/order/VerifyCtrl.js');
                    }]
                }
            })// invoice
            .state('order.invoice', {
                url: '/invoice',
                templateUrl: 'tpl/orders/invoice.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/order/InvoiceCtrl.js');
                    }]
                }
            })
            .state('order.transaction', {
                url: '/transaction',
                templateUrl: 'tpl/orders/transaction.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/order/TransactionCtrl.js');
                        }]
                }
            })
            .state('order.create', {
                url: '/create',
                templateUrl: 'tpl/orders/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('angular-bootbox').then(
                            function(){
                                return $ocLazyLoad.load('js/controller/order/OrderCreateCtrl.js');
                            }
                        );
                    }]
                }
            })
            // Upload Excel
            .state('order.upload1', {
                url: '/upload/step1',
                templateUrl: 'tpl/orders/upload-step1.html',
                controller: function ($scope, Analytics){
                    Analytics.trackPage('/create_order/file/step1');
                }
            })
            .state('order.upload2', {
                url: '/upload/step2',
                templateUrl: 'tpl/orders/upload-step2.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                         return $ocLazyLoad.load('js/controller/order/UploadCtrl.js');
                    }]
                }
            })
            .state('order.upload3', {
                url: '/upload/step3/{id}',
                templateUrl: 'tpl/orders/upload-step3.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('xeditable').then(
                            function(){
                                return $ocLazyLoad.load('js/controller/order/CreateExcelCtrl.js');
                            }
                        );
                    }]
                }
            })
            .state('order.lamido', {
                url: '/lamido?id',
                templateUrl: 'tpl/lamido/upload.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('xeditable').then(
                                function(){
                                    return $ocLazyLoad.load('js/controller/lamido/UploadLamidoCtrl.js');
                                }
                            );
                        }]
                }
            })
            .state('order.create_multi', {
                url: '/tao-nhieu-van-don',
                templateUrl: 'tpl/create/multi.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('xeditable').then(
                                function(){
                                    return $ocLazyLoad.load('js/controller/create/CreateMultiCtrl.js');
                                }
                            );
                        }]
                }
            })
            /**
             * Đổi trả
             */
            .state('order.exchange', {  // đổi trả
                url: '/yeu-cau-doi-tra',
                templateUrl: 'tpl/exchange/list.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('angular-bootbox').then(
                                function() {
                                    return $ocLazyLoad.load('js/controller/exchange/ListExchangeCtrl.js');
                                }
                            )
                        }]
                }
            })
            .state('exchange', {
                abstract: true,
                url: '/doi-tra',
                templateUrl: 'tpl/app_order.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/exchange/ExchangeCtrl.js');
                        }]
                }
            })
            .state('exchange.exchange_return', {  // đơn hàng trả về
                url: '/don-hang-hoan-ve/{id}',
                templateUrl: 'tpl/exchange/return.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('angular-bootbox').then(
                                function() {
                                    return $ocLazyLoad.load('js/controller/exchange/ReturnOrderCtrl.js');
                                }
                            )
                        }]
                }
            })
            .state('exchange.exchange_change', {  // đơn hàng đổi
                url: '/don-hang-moi/{id}',
                templateUrl: 'tpl/exchange/exchange.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('angular-bootbox').then(
                                function() {
                                    return $ocLazyLoad.load('js/controller/exchange/ExchangeOrderCtrl.js');
                                }
                            )
                        }]
                }
            })

            .state('print', {  // print
                url: '/print?code',
                templateUrl: 'tpl/print/print.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/print/PrintCtrl.js');
                    }]
                }
            })
            .state('print_invoice', {
                url: '/print_invoice?id',
                templateUrl: 'tpl/invoice.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/order/PrintCtrl.js');
                        }]
                }
            })
            .state('print_hvc', {  // print
                url: '/print_hvc?code',
                templateUrl: 'tpl/print/print_hvc.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/print/PrintHvcCtrl.js');
                        }]
                }
            })
            .state('lockme', {
                url: '/lockme',
                templateUrl: 'tpl/page_lockme.html'
            })
            .state('access', {
                url: '/access',
                template: '<div ui-view class="fade-in-right-big smooth"></div>'
            })
            .state('access.signin', {
                url: '/signin?return_url',
                templateUrl: 'tpl/page_signin.html'
            })
            .state('checkin', {
                url: '/checkin',
                templateUrl: 'tpl/page_checkin.html',
                resolve: {
                    checkin: function (loginService, $q, $state, sessionService, $facebook, $http){
                        var defer = $q.defer();

                        var check = function (resp){

                            $http({
                                url: ApiPath+'app/checkin-fb',
                                method: "POST",
                                data: {
                                    'access_token'  : resp.authResponse.accessToken, 
                                    'profile_id'    : resp.authResponse.userID,
                                    'expires'       : resp.authResponse.expiresIn
                                },
                                dataType: 'json',                
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (result, status, headers, config) {
                                if(result.error){
                                    alert('Kết nối thất bại, vui lòng thử lại');
                                    //window.location.reload();
                                }else {
                                    sessionService.set(result['data']);
                                    var ref = getParameterByName('fb_ref');
                                    switch (ref){
                                        case 'process':
                                            $state.go('order.process');
                                        break; 
                                        
                                        default:
                                            if(result.data.active < 2){
                                                $state.go('app.config.account');
                                           }else if(result.data.first_order_time == 0 ) {
                                                $state.go('order.create');
                                           }else{
                                                $state.go('order.process');
                                           }
                                        break;
                                    }

                                    
                                }
                                
                            }).error(function (data, status, headers, config) {
                                alert('Kết nối thất bại, vui lòng thử lại');
                            });
                        }

                        $facebook.getLoginStatus().then(function (resp){
                            if(resp.status == 'connected'){
                                check(resp);
                            }else {
                                $facebook.login().then(function (resp){
                                    check(resp);    
                                }, function (errr){
                                        alert("Đăng nhập facebook không thành công");
                                });
                            }
                        })
                        
                        return defer.promise;
                    }
                }
            })

            .state('access.signup', {
                url: '/signup',
                templateUrl: 'tpl/page_signup.html'
            })
            .state('access.forgotpwd', {
                url: '/forgotpwd',
                templateUrl: 'tpl/page_forgotpwd.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/ForgotPasswordCtrl.js');
                    }]
                }
            })
            .state('access.getpwd', {
                url: '/getpwd?token',
                templateUrl: 'tpl/page_getpwd.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad){
                        return $ocLazyLoad.load('js/controller/config/GetPasswordCtrl.js');
                    }]
                }
            })
            .state('access.404', {
                url: '/404',
                templateUrl: 'tpl/page_404.html'
            })
    }
  ]
);
