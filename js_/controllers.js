'use strict';
var date = new Date();
var timeout;
var time_call;
/* Controllers */

angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies'])
    .controller('AppCtrl', ['$scope', '$rootScope', '$translate', '$localStorage', '$window', '$stateParams', '$state', '$http', '$modal', '$timeout', 'loginService', 'Notify', 'Base', 'toaster','AppStorage',
        function ($scope, $rootScope, $translate, $localStorage, $window, $stateParams, $state, $http, $modal, $timeout, loginService, Notify, Base, toaster, AppStorage) {
            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

            // config
            $scope.app = {
                name: 'ShipChung',
                version: '1.2.0',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info: '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger: '#f05050',
                    light: '#e8eff0',
                    dark: '#3a3f51',
                    black: '#1c2b36'
                },
                settings: {
                    themeID: 1,
                    navbarHeaderColor: 'bg-info',
                    navbarCollapseColor: 'bg-info dk',
                    asideColor: 'bg-black',
                    headerFixed: false,
                    asideFixed: false,
                    asideFolded: false,
                    asideDock: false,
                    container: false
                }
            }

            $scope.time_start = '14day';
            $scope.link_storage = ApiStorage;
            $scope.link_excel = ApiPath;
            $scope.list_notify = {};
            $scope.waiting_notify = true;
            $rootScope.windowWith = 0;

            $(document).ready(function (evt) {
                var updateDevice = function () {
                    var deviceWidth = $(window).width();
                    $rootScope.windowWith = deviceWidth;
                    if (deviceWidth >= 768 && deviceWidth <= 1024) {
                        $scope.app.settings.asideFolded = true;
                    } else if (deviceWidth > 1024) {
                        $scope.app.settings.asideFolded = false;
                    }
                }


                $(window).resize(function (event) {
                    updateDevice();
                });
                updateDevice();
            });


            $scope.change_time = function (time) {
                $scope.time_start = time;
            };


            $scope.list_time = {
                '7day': ' 7 ngày qua',
                '14day': ' 14 ngày qua',
                'month': ' 1 tháng trước',
                '3months': ' 3 tháng trước'
            };

            $rootScope.checkTimeDoiSoat = function (time_success){
                var HienTai = moment().startOf('days'),
                    NgayDoiSoatTiep = 0;

                if(HienTai.day() <= 2){
                    NgayDoiSoatTiep = moment().day(2);
                }else { //
                    if(HienTai.day() > 5 ){
                        NgayDoiSoatTiep = moment().day(2 + 7);
                    }else {
                        NgayDoiSoatTiep = moment().day(5);
                    }
                }
                var _NgayDoiSoatTiep = moment(NgayDoiSoatTiep);

                var MaxTime = NgayDoiSoatTiep.subtract(2, 'days').endOf('day').unix();
                var ret = 0;

                if(time_success <= MaxTime){
                    ret = _NgayDoiSoatTiep.unix();
                }else {
                    if(_NgayDoiSoatTiep.day() >= 5){
                        ret = _NgayDoiSoatTiep.day(2+7).unix();
                    }else {
                        ret = _NgayDoiSoatTiep.day(5).unix();
                    }
                }
                return ret;
            };

            $rootScope.pos = {};
            function success(pos) {
                var crd = pos.coords;
                $rootScope.pos = {
                    lat: crd.latitude,
                    lng: crd.longitude
                };
            };

            function error(err) {
              
            };

            navigator.geolocation.getCurrentPosition(success, error, {});



            $scope.ResendVerifyEmailProcessing = false;

            $scope.ResendVerifyEmail = function (){
                if($scope.ResendVerifyEmailProcessing){
                    return;
                }
                $scope.ResendVerifyEmailProcessing = true; 
                $http.post(ApiPath + 'app/resend-confirm').success(function (resp){
                    $scope.ResendVerifyEmailProcessing = false; 

                    if(resp.error){
                        toaster.pop('warning', 'Thông báo', resp.error_message);
                        return;
                    }
                    toaster.pop('success', 'Thông báo', resp.error_message);

                })
            }

            $scope.onTourEnd = function () {
                var data = {'active': 2};
                $http({
                    url: ApiPath + 'user-info/create',
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    return;
                }).error(function (data, status, headers, config) {
                    return;
                });
                return;
            }

            $rootScope.$on('ChangeActive', function (event, data) {
                $rootScope.userInfo.active = data;
            });

            function isSmartDevice($window) {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }

            $scope.logout = function () {
                loginService.logout();
            }

            /*var retime_notify = function(){
             time_call = $timeout(function(){
             $scope.count_notify();
             retime_notify();
             },180000);
             }*/

            $scope.$watch('userInfo', function (Value, OldValue) {
                if (Value != undefined && Value.id) {
                    //retime_notify();
                    //$scope.count_notify();
                } else {
                    $timeout.cancel(time_call);
                    $timeout.cancel(timeout);
                }
            });

            $scope.count_notify = function () {
                Notify.count().then(function (result) {
                    if (!result.data.error) {
                        $scope.notify = result.data.data;
                    }
                });
            };

            $scope.cash_in = function (size) {
                if (!$scope.list_case) {
                    $scope.list_case
                }

                $modal.open({
                    templateUrl: 'ModalCashInCtrl.html',
                    controller: 'ModalCashInCtrl',
                    size: size,
                    resolve: {
                        list_case: function () {
                            return $scope.list_case;
                        }
                    }
                });
            };

            $scope.list_type    = {};
            $scope.list_courier = {};
            $scope.courier      = {};

            Base.list_type_case().then(function (result) {
                if (result.data.data) {
                    $scope.list_type = result.data.data;
                }
            });

            Base.courier().then(function (result) {
                if(!result.data.error){
                    $scope.list_courier        = result.data.data;
                    angular.forEach(result.data.data, function(value, key) {
                        $scope.courier[value.id]    = value.name;
                    });
                }
            });

            $scope.open_popup = function (size, sc_code) {
                $modal.open({
                    templateUrl: 'PopupCreate.html',
                    controller: 'ModalCreateCtrl',
                    size: size,
                    resolve: {
                        list_type: function () {
                            return $scope.list_type;
                        },
                        sc_code: function () {
                            return sc_code;
                        }
                    }
                });
            };



            $scope.changeChecking = function (checking){
                if($localStorage['remember_checking_tick'] == true){
                    return false;
                }

                if(checking != 1){
                    
                    $modal.open({
                        templateUrl: 'tpl/modal.checking_confirm.html',
                        controller: function ($scope, $interval, $modalInstance, $localStorage){  
                            $scope.time_count = 6;
                            var count_down = $interval(function (){
                                $scope.time_count --;
                                if($scope.time_count == 0){
                                    $interval.cancel(count_down);
                                }
                            }, 1000);

                            $scope.toggleCheckbox = function (check){
                                $localStorage['remember_checking_tick'] = check;
                            }
                            $scope.run = function (type){
                                if(type){
                                    $modalInstance.close(type);
                                    return;
                                }
                                $modalInstance.dismiss(type);
                            }
                            
                        },
                        size: 'md',
                        backdrop :'static',
                        keyboard : false
                    }).result.then(function (selectedItem) {
                      
                      
                    }, function () {
                      
                    });

                }


            }


            AppStorage.loadCity();
            AppStorage.loadDistrict();
            AppStorage.loadWard();


        }])
    // signin controller
    .controller('SigninFormController', ['$scope', '$http', '$state', 'loginService', '$localStorage', '$location', '$facebook', 'sessionService', 'Analytics',
        function ($scope, $http, $state, loginService, $localStorage, $location, $facebook, sessionService, Analytics) {
            $scope.user             = {};
            $scope.authError        = null;
            $scope.loginFBProcesing = false;

            if ($localStorage['last_login_email']) {
                $scope.user.email = $localStorage['last_login_email'];
            }


            var error = $location.search().error;
            if (error && error == 'email') {
                $scope.authError = 'Không thể liên kết tài khoản facebook , do tài khoản facebook của bạn chưa kích hoạt email .'
            }

            $scope.login_fb = function () {
                $scope.authError = null;
                loginService.loginfb($scope, $state);
            }


            $scope.loginFbJs = function () {
                loginService.checkinfb($scope, $state);
            }


            $scope.login = function (data) {
                $scope.authError    = null;
                $scope.onProgress   = true;
                loginService.login(data, $scope, $state); //call login service
            };

            Analytics.trackPage('/signin');
            
            
        }])

    .controller('ConfirmEmailCtrl', ['$scope', '$rootScope', '$http', '$state', 'loginService', 'sessionService', 'toaster', function ($scope, $rootScope, $http, $state, loginService, sessionService, toaster) {
        var user = loginService.islogged();
        var code = $state.params.code;

        $scope.loadingProcess = false;
        $scope.result         = true;
        $scope.error_code     = "";

        $http.get(ApiPath + 'app/confirm-user/' + code).success(function (resp){
            $scope.loadingProcess = true;
            user.verified         = 1;
            $rootScope.userInfo.verified = 1;
            sessionService.set($rootScope.userInfo);

            if(resp.error){
                $scope.result           = true;
                $scope.error_code       = resp.error_code;
                toaster.pop('warning', 'Thông báo', resp.error_message);
            }
        })
    }])

    // signup controller
    .controller('SignupFormController', ['$scope', '$http', '$state', 'loginService', 'Analytics', function ($scope, $http, $state, loginService, Analytics) {
        $scope.user = {};
        $scope.authError = null;

        $scope.loginFbJs = function () {
            loginService.checkinfb($scope, $state);
        }

        $scope.signup = function (data) {
            $scope.authError = null;
            // Try to create
            $scope.onProgress = true;
            loginService.register(data, $scope, $state);
        };

        Analytics.trackPage('/signup/welcome');
    }])
//Modal
    .controller('ModalCashInCtrl', ['$scope', '$modalInstance', '$http', '$filter', '$window', 'toaster', 'Cash', 'Analytics',
        function ($scope, $modalInstance, $http, $filter, $window, toaster, Cash, Analytics) {

            Analytics.trackPage('/order/listing');

            // Config
            $scope.data = {type: 2};
            $scope.frm_submit = false;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            // Action

            // Create
            $scope.save = function (data) {
                if (data.type > 0 && +data.money > 9999) {
                    $scope.frm_submit = true;
                    Cash.create(data).then(function (result) {
                        if (data.type == 1 && result.data.url) {
                            $window.location.href = result.data.url;
                            $scope.cancel();
                        }
                        $scope.frm_submit = false;
                    });
                }
                return;
            }
        }])

//Modal
    .controller('ModalCreateCtrl', ['Config_Status', '$scope', '$modalInstance', '$http', '$filter', 'toaster', 'FileUploader', 'Api_Path', 'list_type', 'sc_code', 'Ticket', '$rootScope', 'bootbox', 'Analytics',
        function (Config_Status, $scope, $modalInstance, $http, $filter, toaster, FileUploader, Api_Path, list_type, sc_code, Ticket, $rootScope, bootbox, Analytics) {
            // Config
            Analytics.trackPage('/ticket/create');
            if (!list_type.length) {
                Ticket.ListCaseType().then(function (result) {
                    if (result.data.data) {
                        $scope.list_type = result.data.data;
                    }
                });
            }

            $scope.type_to_english = {
                '1': 'payment',
                '2': 'pickup',
                '3': 'delivery',
                '4': 'return',
                '5': 'account',
                '6': 'fee',
            }

            var list_suggest_type = [];

            $scope.list_type = list_type;
            $scope.data = {};
            $scope.datacase = {
                content: ''
            };

            $scope.id = 0;
            $scope.refer = [];

            $scope.ids              = [];
            $scope.listTicketRefer  = [];

            $scope.listOrderDelivery = [];
            $scope.listOrderDeliveryRequested = [];
            $scope.show_confirm_delivery = false;
            $scope.confirm_delivered = false;

            $scope.switchShowConfirm = function () {
                $scope.show_confirm_delivery = !$scope.show_confirm_delivery;
            }


            $scope.referLoading = false;
            $scope.data_status = Config_Status.ticket_btn;
            $scope.toggleCountinue = false;
            $scope.toggle = function () {
                $scope.toggleCountinue = !$scope.toggleCountinue;
            }

            if (sc_code != undefined && sc_code != '') {
                $scope.refer.push({'text': sc_code});
            }

            $scope.data = {};
            $scope.frm_submit = false;
            $scope.show_respond = true;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };


            $scope.onAddedTags = function (newTag) {
                $scope.ids = [];

                angular.forEach($scope.refer, function (value, key) {
                    $scope.ids.push(value.text);
                })

                if (!$scope.toggleCountinue) {
                    $scope.referLoading = !$scope.referLoading;
                    Ticket.ListReferTicket($scope.ids.join(','), function (err, resp) {
                        if (!err) {
                            $scope.listTicketRefer = resp.data;
                            $scope.listOrderDelivery = resp.order;
                            if (resp.order) {
                                $scope.show_confirm_delivery = true;
                            } else {
                                $scope.show_confirm_delivery = false;
                            }
                        }
                        $scope.referLoading = !$scope.referLoading;
                    });
                }
            }

            if (sc_code) {
                $scope.onAddedTags();
            }

            $scope.confirm_delivery_loading = false;


            $scope.confirm_delivery = function (item) {
                bootbox.prompt({
                    message: "<p>Nhập ghi chú cho yêu cầu này để Shipchung hỗ trợ bạn một cách tốt nhất !</p>",
                    placeholder: "Thông tin địa chỉ, số điện thoại người nhận trong trường hợp có thay đổi",
                    title: "Bạn chắc chắn muốn yêu cầu giao lại đơn hàng này ?",
                    inputType: "textarea",
                    callback: function (result) {
                        if (result !== null && result !== "") {
                            var statusCompare = 707;
                            statusCompare = item.group_status.group_status == 18 ? 707 : 903;
                            $scope.confirm_delivery_loading = true;
                            $http.post(ApiPath + 'pipe-journey/create', {
                                'tracking_code': item.id,
                                'type': 1,
                                'pipe_status': statusCompare,
                                'note': result,
                                'group': statusCompare == 707 ? 29 : 31
                            }).success(function (resp) {
                                $scope.confirm_delivery_loading = false;
                                if (resp.error) {
                                    toaster.pop('warning', 'Thông báo', 'Lỗi không thể giao lại đơn hàng này vui lòng liên hệ bộ phận CSKH ');
                                } else {
                                    $scope.confirm_delivered = true;
                                    toaster.pop('success', 'Thông báo', 'Thành công');
                                }
                            })


                        } else {
                            if (result == "") {
                                $timeout(function () {
                                    toaster.pop('warning', 'Thông báo', 'Vui lòng nhập nội dung yêu cầu !');
                                })

                            }
                            ;
                        }
                    }
                });
            }
            // File Upload
            var uploaderPopup = $scope.uploaderPopup = new FileUploader({
                url         : Api_Path.Upload + 'ticket/',
                alias       : 'TicketFile',
                queueLimit  : 5,
                headers     : {Authorization : $rootScope.userInfo.token},
                formData: [
                    {
                        key: 'request'
                    }
                ]
            });

            uploaderPopup.filters.push({
                name: 'FileFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|jpeg|pdf|png|'.indexOf(type) !== -1 && item.size < 3000000;
                }
            });

            uploaderPopup.onSuccessItem = function (item, result, status, headers) {
                if (!result.error) {
                    return;
                }
                else {
                    toaster.pop('warning', 'Thông báo', 'Upload Thất bại!');
                }
            };

            uploaderPopup.onErrorItem = function (item, result, status, headers) {
                toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
            };

            // Action
            $scope.getCase = function (val) {
                var data = [];
                var check = 0;
                var list_type = angular.copy($scope.list_type);
                var re = new RegExp(val, 'gi');

                angular.forEach(list_type, function (value, key) {
                    if (value.type_name.match(re)) {
                        check = 1;
                        data.unshift(value);
                    } else {
                        data.push(value);
                    }
                });

                if (check == 1) {
                    list_suggest_type = data;
                } else if (list_suggest_type.length > 0) {
                    data = list_suggest_type;
                }

                return data.map(function (item) {
                    return item;
                });
            }

            var check_in_array = function (val, data) {
                var check = true;
                if (data) {
                    angular.forEach(data, function (value) {
                        if (angular.uppercase(val) == angular.uppercase(value.text)) {
                            check = false;
                            return;
                        }
                    });
                }
                return check;
            }

            /*$scope.openTick = function (tickId){
             $rootScope.$broadcast('open:ticket', tickId);
             }*/

            $scope.$watch('datacase.content', function (newVal){
                if(newVal.id >0 && (newVal.id == 60)){
                    $scope.case_msg = "Xin lỗi quý khách, Shipchung hiện tại không hỗ trợ các trường hợp thay đổi tiền thu hộ cho vận đơn. Trân trọng !";
                    return false;
                }
                $scope.case_msg = "";
            });

            // Create
            $scope.save = function (datacase, data, data_refer) {


                $scope.frm_submit = true;

                var refer = [];
                if (data_refer) {
                    refer = angular.copy(data_refer);
                }

                var data_code = data.content.match(/SC(\d+){6,10}/gi);
                if (data_code) {
                    angular.forEach(data_code, function (value) {
                        if (check_in_array(value, refer)) {
                            refer.push({'text': value});
                        }
                    });
                }

                var datafrm = {'refer': refer};

                if (datacase.content.id > 0) {


                    datafrm.data = {'title': datacase.content.type_name, 'content': $scope.data.content};
                    datafrm.type_id = datacase.content.id;
                } else {
                    datafrm.data = {'title': datacase.content, 'content': $scope.data.content};
                }


                $http({
                    url: ApiPath + 'ticket-request/create',
                    method: "POST",
                    data: datafrm,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {

                    if (!result.error) {
                        toaster.pop('success', 'Thông báo', 'Thành công!');

                        if (result.id > 0) { // Upload file
                            $scope.id = result.id;
                            uploaderPopup.onBeforeUploadItem = function (item) {
                                item.url = Api_Path.Upload + 'ticket/' + result.id;
                            };
                            uploaderPopup.uploadAll();
                        }
                        $scope.savedData = datafrm;
                    }
                    else {
                        toaster.pop('error', 'Thông báo', 'Có lỗi , hãy thử lại');
                        $scope.frm_submit = false;
                    }

                }).error(function (data, status, headers, config) {
                    toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
                    $scope.frm_submit = false;
                });
                $scope.show_respond = true;
            }

            // toogle show  markdown
            $scope.toogle_show = function () {
                $scope.show_respond = !$scope.show_respond;
            }

        }]);