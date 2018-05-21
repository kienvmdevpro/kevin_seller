'use strict';

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

angular.module('app').config(
    ['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {

            // lazy controller, directive and service
            app.controller = $controllerProvider.register;
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.factory = $provide.factory;
            app.service = $provide.service;
            app.constant = $provide.constant;
            app.value = $provide.value;

            $urlRouterProvider
                .otherwise('/order/list/7day');


            function load(srcs, callback) {
                return {
                    deps: ['$ocLazyLoad', '$q',
                        function ($ocLazyLoad, $q) {
                            var deferred = $q.defer();
                            var promise = false;
                            srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                            if (!promise) {
                                promise = deferred.promise;
                            }
                            angular.forEach(srcs, function (src) {
                                promise = promise.then(function () {
                                    name = src;
                                    return $ocLazyLoad.load(name, { cache: false });
                                });
                            });
                            deferred.resolve();
                            return callback ? promise.then(function () {
                                return callback();
                            }) : promise;
                        }
                    ]
                }
            }


        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'tpl/app_order.html?v=1.0'
            })
            .state('app.cash', {
                url: '/cash/{code}?transaction_info&price&payment_id&payment_type&error_text&secure_code&token_nl',
                templateUrl: 'tpl/result_cash.html',
                resolve: load('js/controller/config/ResultCashCtrl.js')

            }).state('app.change_email', {
                url: '/change_email?refer_code',
                templateUrl: 'tpl/result_change_email.html',
                resolve: load('js/controller/config/ChangeEmailCtrl.js')
            })

            .state('app.verify_child', {
                url: '/verify_child/:token',
                templateUrl: 'tpl/result_verify_child.html',
                resolve: load('js/controller/config/ResultVerifyChildCtrl.js')
            })

            .state('app.verify_bank', {
                url: '/verify_bank/:token',
                templateUrl: 'tpl/result_verify_bank.html',
                resolve: load('js/controller/config/ResultVerifyBankCtrl.js')
            })

            .state('app.confirm_email', {
                url: '/confirm_email/{code}',
                templateUrl: 'tpl/result_confirm_email.html',
            })

            .state('app.dashbroad', {
                url: '/tong-quan',
                templateUrl: 'tpl/dashbroad/main.html',
                resolve: load('js/controller/dashbroad/DashbroadCtrl.js')
            })


            /** 
             *  config acount
            **/

            .state('cashin', {
                abstract: true,
                url: '/cashin',
                templateUrl: 'tpl/cashin/index.html'
            })

            .state('cashin.payment_type', {
                url: '',
                templateUrl: 'tpl/cashin/select-payment-type.html',
                resolve: load('js/controller/cashin/CashinController.js')
            })
            
            
            .state('app.config', {
                url: '/config',
                templateUrl: 'tpl/config/setting_layout.html',
                resolve: load(['bm.bsTour','angular-bootbox'])
            })

            // auth zalo
            // Print hvc new
            .state('app.auth_zalo', {  // print
                url: '/auth_zalo',
                templateUrl: 'tpl/zalo/auth.html?v=' + Math.random() + '',
                resolve: load('js/controller/zalo/AuthZalo.js?v=' + Math.random() + '')
            })

            .state('app.config.account', {
                url: '/account',
                templateUrl: 'tpl/config/account.html',
                resolve: load('js/controller/config/ConfigAccountCtrl.js')
            })
            .state('app.config.sync_order', {
                url: '/sync_order',
                templateUrl: 'tpl/config/sync_order.html',
                resolve: load('js/controller/config/ConfigSyncOrder.js')
            })
            .state('app.config.business', {
                url: '/business',
                templateUrl: 'tpl/config/business.html',
                resolve: load('js/controller/config/ConfigBusinessCtrl.js')
            })
            .state('app.config.inventory', {
                url: '/inventory',
                templateUrl: 'tpl/config/inventory.html',
                resolve: load('js/controller/config/ConfigInventoryCtrl.js')
            })
            .state('app.config.accounting', {
                url: '/accounting',
                templateUrl: 'tpl/config/accounting.html' ,
                resolve: load('js/controller/config/ConfigAccountingCtrl.js')
            })
            .state('app.config.linked', {
                url: '/payment-linked',
                templateUrl: 'tpl/config/linked.html' ,
                resolve: load('js/controller/config/ConfigLinkedCtrl.js')
            })
            .state('app.config.verify_alepay', {
                url: '/verify_alepay?data&checksum',
                templateUrl: 'tpl/result_alepay_linked.html',
                resolve: load('js/controller/config/ResultAlepayLinkedCtrl.js')
            })
            /*.state('app.config.shipping', {
                url: '/shipping',
                templateUrl: 'tpl/config/shipping.html',
                resolve: load('js/controller/config/ConfigShippingCtrl.js')
            })
            .state('app.config.courier', {
                url: '/courier',
                templateUrl: 'tpl/config/courier.html',
                resolve: load(['xeditable', 'js/controller/config/ConfigCourierCtrl.js'])
            })*/
            .state('app.config.user', {
                url: '/user',
                templateUrl: 'tpl/config/user.html',
                resolve: load('js/controller/config/ConfigChildCtrl.js')
            })
            .state('app.config.key', {
                url: '/key',
                templateUrl: 'tpl/config/api_key.html',
                resolve: load(['xeditable','js/controller/config/ApiKeyCtrl.js'])
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
                resolve: load(['bm.bsTour', 'angular-bootbox', 'js/controller/ticket/ManagementCtrl.js'])
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
                resolve: load('js/controller/order/DetailCtrl.js')
            })
            .state('order', {
                abstract: true,
                url: '/order',
                templateUrl: 'tpl/app_order.html?v=1.0'
            })
            .state('print_store', {
                url: '/print_store?code&type&platform',
                templateUrl: 'tpl/orders/print_store.html',
                resolve: load('js/controller/print/PrintStoreCtrl.js')
            })

            .state('order.sync_order', {
                url: '/sync-order',
                templateUrl: 'tpl/orders/sync_order.html',
                resolve: load(['xeditable','angular-bootbox','js/controller/order/SyncOrderCtrl.js'])
            })
            
            .state('order.post_office', {
                url: '/dropoff',
                templateUrl: 'tpl/orders/post_office.html',
                resolve: load('js/controller/order/PostOfficeCtrl.js')
            })

            .state('order.list', {
                url: '/list/{time_start}',
                templateUrl: 'tpl/orders/orders.html?v=1.0',
                resolve: load(['xeditable','angular-bootbox','js/controller/order/OrderCtrl.js'])
            })
            .state('order.list.detail', {
                url: '/{code}',
                templateUrl: 'tpl/orders/list_detail.html'
            })
            .state('order.management', {
                url: '/management/?verify?status',
                templateUrl: 'tpl/orders/management.html',
                resolve: load(['angular-bootbox','js/controller/order/ManagementCtrl.js'])
            })
            /*
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
            })*/
             // verify
            .state('order.verify', {
                url: '/verify?id',
                templateUrl: 'tpl/orders/verify.html',
                resolve: load('js/controller/order/VerifyCtrl.js?v='+Math.random()+'')
            })// invoice

            .state('order.warehouse_fee', {
                url: '/warehouse_fee',
                templateUrl: 'tpl/orders/warehouse_fee.html',
                resolve: load('js/controller/order/WarehouseFeeCtrl.js')
            })

            .state('order.warehouse_fee_details', {
                url: '/warehouse_details/:id',
                templateUrl: 'tpl/orders/warehouse_fee_details.html',
                resolve: load('js/controller/order/WarehouseFeeDetailsCtrl.js')
            })

             // verify
            .state('order.warehouse_verify', {
                url: '/warehouse_verify?id',
                templateUrl: 'tpl/orders/warehouse_verify.html',
                resolve: load('js/controller/order/WarehouseVerifyCtrl.js')
            })// invoice
            .state('order.invoice', {
                url: '/invoice',
                templateUrl: 'tpl/orders/invoice.html',
                resolve: load('js/controller/order/InvoiceCtrl.js')
            })
            .state('order.transaction', {
                url: '/transaction',
                templateUrl: 'tpl/orders/transaction.html',
                resolve: load('js/controller/order/TransactionCtrl.js')
            })
            // Upload Excel
            // .state('order.upload1', {
            //     url: '/upload/step1?bc',
            //     templateUrl: 'tpl/orders/upload-step1.html',
            //     controller: function ($scope, Analytics){
            //         Analytics.trackPage('/create_order/file/step1');
            //     }
            // })
            .state('order.upload1', {
                url: '/upload/step1?bc',
                templateUrl: 'tpl/orders/upload-step2.html',
                resolve: load('js/controller/order/UploadCtrl.js')
            })
            .state('order.upload3', {
                url: '/upload/step3/{id}?bc',
                templateUrl: 'tpl/orders/upload-step3.html?v=1.012',
                resolve: load(['xeditable','angular-bootbox', 'js/controller/order/CreateExcelCtrl.js?v='+Math.random()+''])
            })
            .state('order.upload', {
                url: '/upload?id',
                templateUrl: 'tpl/upload/index.html',
                resolve: load(['xeditable','js/controller/upload/UploadExcelCtrl.js?v='+Math.random()+''])
            })
            .state('order.create_multi', {
                url: '/tao-nhieu-van-don?bc',
                templateUrl: 'tpl/create/multi.html',
                resolve: load(['xeditable,','js/controller/create/CreateMultiCtrl.js?v='+Math.random()+''])
            })
            
            // .state('order.create_once', {
            //     url: '/create-v2?bc',
            //     templateUrl: 'tpl/create/one.html',
            //     resolve: load(['angular-bootbox','js/controller/create/CreateOrder.js?v='+Math.random()+''])
            // })

            .state('order.create_once_global', {
                url: '/create-global?bc',
                templateUrl: 'tpl/create/one_global.html?v='+Math.random()+'',
                resolve: load(['angular-bootbox', 'js/controller/create/CreateOrderGlobal.js?v='+Math.random()+''])
            })
            //check link new
            .state('order.create_once_global_new', {
                url: '/create-global-new?bc',
                templateUrl: 'tpl/create/one_global.html?v='+Math.random()+'',
                resolve: load(['angular-bootbox', 'js/controller/create/CreateOrderGlobal.js?v='+Math.random()+''])
            })

            .state('order.create_once_global_bm', {
                url: '/create-global-bm?bc',
                templateUrl: 'tpl/create/one_global_bm.html?v='+Math.random()+'',
                resolve: load(['angular-bootbox','js/controller/create/CreateOrderGlobal.js?v='+Math.random()+''])
            }) 

            .state('order.loyalty', {  // print
                url: '/khach-hang-than-thiet',
                templateUrl: 'tpl/loyalty/loyalty.html'
            })
            /**
             * Đổi trả
             */
            .state('order.exchange', {  // đổi trả
                url: '/yeu-cau-doi-tra',
                templateUrl: 'tpl/exchange/list.html',
                resolve: load(['angular-bootbox','js/controller/exchange/ListExchangeCtrl.js'])
            })
            .state('order.estimate', {  // print
                url: '/estimate',
                templateUrl: 'tpl/loyalty/upload.html',
                resolve: load('js/controller/loyalty/UploadCtrl.js')
            })
            //Problem
            .state('order.problem', {
                url: '/can-xu-ly',
                templateUrl: 'tpl/problem/index.html',
                resolve: load(['xeditable','angular-bootbox', 'js/controller/problem/ProblemCtrl.js'])
            })
            .state('exchange', {
                abstract: true,
                url: '/doi-tra',
                templateUrl: 'tpl/app_order.html',
                resolve: load('js/controller/exchange/ExchangeCtrl.js')
            })
            .state('exchange.exchange_return', {  // đơn hàng trả về
                url: '/don-hang-hoan-ve/{id}',
                templateUrl: 'tpl/exchange/return.html',
                resolve: load(['angular-bootbox', 'js/controller/exchange/ReturnOrderCtrl.js'])
            })
            .state('exchange.exchange_change', {  // đơn hàng đổi
                url: '/don-hang-moi/{id}',
                templateUrl: 'tpl/exchange/exchange.html',
                resolve: load(['angular-bootbox','js/controller/exchange/ExchangeOrderCtrl.js'])
            })

            .state('print', {  // print
                url: '/print?code',
                templateUrl: 'tpl/print/print.html',
                resolve: load('js/controller/print/PrintCtrl.js')
            })
            .state('print_invoice', {
                url: '/print_invoice?id',
                templateUrl: 'tpl/invoice.html',
                resolve: load('js/controller/order/PrintCtrl.js')
            })
            .state('print_hvc', {  // print
                url: '/print_hvc?code',
                templateUrl: 'tpl/print/print_new.html',
                resolve: load('js/controller/print/PrintNewCtrl.js')
            })
            // Print hvc new
            .state('print_new', {  // print
                url: '/print_new?code',
                templateUrl: 'tpl/print/print_new.html?v='+Math.random()+'',
                resolve: load('js/controller/print/PrintNewCtrl.js?v='+Math.random()+'')
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
                templateUrl: 'tpl/page_signin.html?v=1.0'
            })
            .state('checkin', {
                url: '/checkin',
                templateUrl: 'tpl/page_signupfb.html',
            })
            .state('checkingg', {
                url: '/checkingg',
                templateUrl: 'tpl/page_signupgg.html',
            })
            .state('access.signup', {
                url: '/signup',
                templateUrl: 'tpl/page_signup.html'
            })
            .state('access.signupfb', {
                url: '/signupfb',
                templateUrl: 'tpl/page_signupfb.html'
            })
            .state('access.forgotpwd', {
                url: '/forgotpwd',
                templateUrl: 'tpl/page_forgotpwd.html',
                resolve: load('js/controller/config/ForgotPasswordCtrl.js')
            })
            


            .state('access.getpwd', {
                url: '/getpwd?token',
                templateUrl: 'tpl/page_getpwd.html',
                resolve: load('js/controller/config/GetPasswordCtrl.js')
            })
            .state('access.404', {
                url: '/404',
                templateUrl: 'tpl/page_404.html'
            })
            .state('access.change_email', {
                url: '/change_email?refer_code',
                templateUrl: 'tpl/result_change_email.html',
                resolve: load('js/controller/access/ChangeEmailCtrl.js')
            })

            .state('access.verify_child', {
                url: '/verify_child/:token',
                templateUrl: 'tpl/result_verify_child.html',
                resolve: load('js/controller/access/ResultVerifyChildCtrl.js')
            })

            .state('access.verify_bank', {
                url: '/verify_bank/:token',
                templateUrl: 'tpl/result_verify_bank.html',
                resolve: load('js/controller/access/ResultVerifyBankCtrl.js')
            })

            .state('access.confirm_email', {
                url: '/confirm_email/{code}',
                templateUrl: 'tpl/result_confirm_email.html',
            })

            .state('access.zurmo', {
                url: '/zurmo/:email',
                templateUrl: 'tpl/result_zurmo.html',
                resolve: load('js/controller/access/ResultSyncZurmoCtrl.js')
            })
            
             //  SAN PHAM
             .state('product', {
                abstract: true,
                url: '/product',
                templateUrl: 'tpl/product/app_product.html'
            })
            // DANH SACH SAN PHAM
            .state('product.list', {
                url: '/list/:type',
                templateUrl: 'tpl/product/list.html',
                /*resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                            return $ocLazyLoad.load('js/controller/product/Product_List_ControllerV2.js',
                            		'js/controller/product/Service_Product.js'
                            );
                        }]
                }*/
	            resolve: load(['xeditable','angular-bootbox','js/controller/product/Service_Product.js', 'js/controller/product/Product_List_ControllerV2.js'])
            })
            //thong bao
			.state('product.thongbao', {
				url: '/thongbao',
				templateUrl: 'tpl/product/thongbao.html',
				resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/Product_List_ControllerV2.js'])
			})
            //add    
            .state('product.addnew', {
                url: '/product/addnew',
                templateUrl: 'tpl/product/add_product.html',
                resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/AddProductController.js'])
            })
            .state('product.editnew', {
                url: '/product/editnew/:code',
                templateUrl: 'tpl/product/add_product.html',
                resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/AddProductController.js'])
            })    
			//EDIT SAN PHAM
            .state('product.print', {
                url: '/product/print',
                templateUrl: 'tpl/product/print.html',
                resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/PrintBsinController.js'])
            })
				// TAO SAN PHAM EXCEL
			.state('product.upload', {
					url: '/product/upload',
					templateUrl: 'tpl/product/upload-product/upload.html',
					resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/Product_Add_Excel_Controller.js'])
				})
			.state('product.upload-preview', {
				url: '/product/upload/preview?product_id',
				templateUrl: 'tpl/product/upload-product/preview.html',
				resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/Product_Add_Excel_Controller.js'])
			})
			// BAO CAO TON KHO
            .state('product.report', {
				url: '/report/product',
				templateUrl: 'tpl/product/report/product.html',
				resolve: load('js/controller/product/Product_Report_Sku_Controller.js')
			})
            /*--------------------SHIPMENT-----------------------*/
			// List Shipment
			.state('product.shipment', {
				url: '/product/shipment',
				templateUrl: 'tpl/product/shipment.html',
				resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/List_Shipment_Controller.js'])
			})
			
			//CREATE SHIPMENT
			.state('product.shipment-create', {
					url: '/product/shipment/create-v2',
					template: '' +
						'<div ng-controller="CreateShipmentController">' +
						'<div ng-include="\'tpl/shipment/edit.html\'"></div>' +
						'</div>',
					
					resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/Create_Shipment_Controller.js'])
				})
				//SHIPMENT DETAIL
				.state('product.detail-shipment', {
                    url: '/product/detail-shipment/:id',
                    templateUrl: 'tpl/shipment/shipment_detail.html',
                    resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/List_Shipment_Controller.js'])
                })
                //print shipment
                .state('print-shipment', {
                    url: '/print-shipment/:id',
                    templateUrl: 'tpl/shipment/print_shipment.html',
                    resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/List_Shipment_Controller.js'])
                })
                // EDIT SHIPMENT
                .state('product.shipment-edit-v2', {
                    url: '/product/shipment/edit-v2/:id',
                    template: '' +
                    '<div ng-controller="EditShipmentControllerV2">' +
                    '<div ng-include="\'tpl/shipment/edit.html\'"></div>' +
                    '</div>',
                    resolve: load(['js/controller/product/Service_Product.js', 'js/controller/product/Edit_Shipment_Controller.js'])
                })
                // CAU HINH PHIEU IN
                .state('app.config.print', {
                    url: '/print',
                    templateUrl: 'tpl/config/print_order_config.html',
                    resolve: load('js/controller/config/ConfigPrintController.js')
                })
                // CAU HINH TINH PHI LUU LKHO
                .state('app.config.stock', {
                    url: '/stock-charge',
                    templateUrl: 'tpl/config/stock_charge.html',
                    resolve: load('js/controller/config/ConfigStockController.js')
                })
                // BAO CAO NHAN VIEN
                .state('app.report_employer_list', {
                    url: '/employer',
                    templateUrl: 'tpl/report/report.html',
                    resolve: load('js/controller/report/ReportSettingController.js')
                })
                // CAU HINH HOA DON 
                .state('invoice', {
                    url: '/print-invoice/:order/:type',
                    template: '' +
                    '<div ng-controller="GetInventController">' +
                    '<div ng-include="htmlInvoice"></div>' +
                    '</div>',
                    resolve: load(['xeditable', 'js/controller/order/InvoiceController.js'])
                })
                //TRANG INVOICE MAU
                .state('invoice-mau', {
                    url: '/invoice',
                    //templateUrl: 'tpl/orders/invoice/invoice_mau.html',
                    //resolve: load(['xeditable', 'js/controller/order/InvoiceController.js'])
                    templateUrl: 'tpl/orders/invoice/mau_ems.html', 
                    resolve: load(['xeditable', 'js/controller/order/invoice_mau/InvoiceEMSController.js'])
                    
                })
                //TRANG PRINT KERRY
                .state('print_kerry', {
                    url: '/print_kerry/:code',
                    templateUrl: 'tpl/print/kerry/print_kerry.html?v=' + Math.random() + '',
                    resolve: load('js/controller/print/PrintKerry.js?v=' + Math.random() + '')
                })
                //Invoice Tờ khai quốc tế mau
                .state('invoice_global', {  // print
                    url: '/invoice_global',
                    templateUrl: 'tpl/invoice/invoice_global.html',
                    resolve: load('xeditable', 'js/controller/order/InvoiceController.js')
                })
                //Invoice Tờ khai quốc tế mau
                .state('print_dhl', {  // print
                    url: '/print_dhl/:code',
                    templateUrl: 'tpl/print/dhl/dhl.html',
                    resolve: load('js/controller/print/PrintOrderDHLController.js')
                })
                //Invoice DHL mau 2
                .state('print_dhl_2', {  // print
                    url: '/print_dhl_2/:code',
                    templateUrl: 'tpl/print/dhl/dhl_2.html',
                    resolve: load('js/controller/print/PrintOrderDHLController.js')

                })
                //Invoice DHL mau 3
                .state('print_dhl_3', {  // print
                    url: '/print_dhl_3/:code',
                    templateUrl: 'tpl/print/dhl/dhl_3.html',
                    resolve: load('js/controller/print/PrintOrderDHLController.js')
                })
                //in nhan 
                .state('print_lable', {  // print
                    url: '/print_lable/:code',
                    templateUrl: 'tpl/print/labels/labels.html',
                    resolve: load('js/controller/print/PrintLabelsController.js')
                })

                
        }
    ]
);
