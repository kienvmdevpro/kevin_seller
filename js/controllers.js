'use strict';
var date = new Date();
var timeout;
var time_call;
/* Controllers */

angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies'])
    .controller('AppCtrl', ['$scope','User', 'Datetime','$rootScope','Site_Config','$location', '$translate', '$localStorage', '$window', '$stateParams', '$state', '$filter','$http', '$modal', '$timeout', 'loginService', 'Notify', 'Base', 'Order', 'toaster','AppStorage', 'Analytics',
                   function ($scope,  User,   Datetime,  $rootScope,  Site_Config,  $location,   $translate,   $localStorage,   $window,    $stateParams,   $state,   $filter, $http,   $modal,   $timeout,   loginService,   Notify,   Base,   Order,   toaster,   AppStorage, Analytics) {
            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
            var tran = $filter('translate');
            // config
            ///console.log("abc",Date.parse(new Date(2018, 0, 16))/1000 )
            ///new Date(date.getFullYear(), date.getMonth() - 1, 18)
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



            $timeout(function (){
                $('.intercom-launcher').click(function (){
                    var hasClass = $(this).hasClass('intercom-launcher-active');
                    if(!hasClass){
                        Analytics.trackEvent('Chat', 'Account Chat', 'Account  Reply');
                    }
                })
            }, 500)
            
            // check role
            if(!$rootScope.userRole){
                $rootScope.userRole = ($localStorage['role'] || $localStorage['role'] == 0) ? $localStorage['role'] : 3;
            }
            //end check role
            //change lang
            $scope.changeLanguage = function(key) {
                $translate.use(key);
                $rootScope.keyLang = key.toString();
                 $http.defaults.headers.common['LANGUAGE']  = $rootScope.keyLang ? $rootScope.keyLang : "vi";
            };
            if(!$rootScope.keyLang){
                if ($window.localStorage.NG_TRANSLATE_LANG_KEY){
                    $rootScope.keyLang = ""+$window.localStorage.NG_TRANSLATE_LANG_KEY.toString()+"";
                }
            }
            //end change lang
            //check user boxme de show menu product shipment
            $rootScope.fulfillment  = $localStorage['fulfillment']  ? $localStorage['fulfillment'] : 0;
            $scope.hideShipment     = ($localStorage['fulfillment'] ? true : false);
            $scope.showShipment     = function(){
                $scope.hideShipment = !$scope.hideShipment;
            }
            $scope.hideProduct      = $localStorage['fulfillment']  ? true : false;
            $scope.showProduct      = function(){
                $scope.hideProduct  = !$scope.hideProduct;
            } 
            
            //intercom 
            if($localStorage['login']){
                if ($localStorage['sentIntercom']==undefined){
                    ///get thong tin comapny
                    var job_title = "";
                    if ($localStorage['login'].role     == 0){
                        job_title = "Owner(Chủ tài khoản)";
                    }else if($localStorage['login'].role == 1){
                        job_title = "Manager(Quản lý)";
                    }else if($localStorage['login'].role == 2){
                        job_title = "Lead (Trưởng nhóm)";
                    }else{
                        job_title = "Member  (Nhân viên)";
                    }
                    var is_vip =0;  
                    if($localStorage['login'].loy_level){
                        if ($localStorage['login'].loy_level || $localStorage['login'].loy_level != 0){
                            is_vip = 1;
                        }
                    }   
                    
                    var time_now    = Datetime.DateToTimestempt(new Date())
                    var time_create = null
                    
                    $rootScope.timeLogined = 0; //thoi gian su dung ke tu ngay dang ki
                    if($localStorage['login'].time_create){
                        if($localStorage['login'].time_create >=1){
                            var newTimeCreate = new Date($localStorage['login'].time_create * 1000);
                            time_create = $filter('date')(newTimeCreate,'yyyy-MM-dd HH:mm');
                        }
                        var time_str =  Date.parse(new Date()) / 1000 - $localStorage['login'].time_create
                        var hours   = Math.floor(time_str/60);
                        if(hours > 518400){
                            $rootScope.timeLogined   = Math.floor(hours/60);
                        }
                        else if(hours > 43200){ // 30 ngày
                            $rootScope.timeLogined   = Math.floor(hours/60);
                        }else if(hours > 1440){ // 1 ngày
                            $rootScope.timeLogined   = Math.floor(hours/60);
                        }else if(hours > 60){// 1 hours
                            $rootScope.timeLogined   = Math.floor(hours/60);
                        }else if(hours > 0){
                            $rootScope.timeLogined   = Math.floor(hours/60);
                        }else{
                            $rootScope.timeLogined = 0;
                        }
                    }
                    $localStorage['login'].first_order_time = 0
                    var not_create_order = 0
                    if((!$localStorage['login'].first_order_time || $localStorage['login'].first_order_time == 0) && parseInt($localStorage['login'].first_order_time) ==0 ){
                        if($rootScope.timeLogined >= 720){
                            not_create_order = 30
                        }else if($rootScope.timeLogined >= 360){
                            not_create_order = 15
                        }else if($rootScope.timeLogined >= 168){
                            not_create_order = 7
                        }else if($rootScope.timeLogined >= 72){
                            not_create_order = 3
                        }else if($rootScope.timeLogined >= 24){
                            not_create_order = 1
                        }else{
                            not_create_order = 0
                        }
                    }
                    
                    $http.defaults.headers.common['Authorization']  = $localStorage['login'].token;
                    try {
                        User.load().then(function (result) {
                            if(!result.data.error && $localStorage['login']) {
                                var facebook_connected = false;
                                if(result.data.data.integration && result.data.data.integration.length>=1){
                                    facebook_connected = true;
                                }
                                window.Intercom('boot', {
                                       app_id       : intercomConfig.appId,
                                       email        : $localStorage['login'].email          ? $localStorage['login'].email          : "",
                                       user_id      : $localStorage['login'].id             ? $localStorage['login'].id             : "0",
                                       time         : $filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                                       created_at   : $localStorage['login'].time_create    ? $localStorage['login'].time_create    : null,
                                });
                                window.intercomSettings = {
                                         first_order_approved   : undefined,
                                         first_order_created    : undefined,
                                          email                 : $localStorage['login'].email          ? $localStorage['login'].email          : "",
                                          user_id               : $localStorage['login'].id             ? $localStorage['login'].id             : "0",
                                          phone                 : $localStorage['login'].phone          ? $localStorage['login'].phone          : "",
                                          app_id                : intercomConfig.appId,
                                          name                  : $localStorage['login'].fullname       ? $localStorage['login'].fullname       : "",
                                          location              : $localStorage['login'].location_id    ? $localStorage['login'].location_id    : "",
                                          role                  : $localStorage['login'].role           ? $localStorage['login'].role           : "3",
                                          using_fulfillment     : $localStorage['login'].fulfillment    ? $localStorage['login'].fulfillment    : "0",
                                          not_create_order      : not_create_order,//time tu luc dang ki den luc don dau tien la bao lau
                                          is_vip                : is_vip,       // segment vip
                                          not_enough_credit     : (!$localStorage['login'].balance || $localStorage['login'].balance == 0)  ? 1 : 0,//1 het tien,0 con tien
                                          facebook_connected    : facebook_connected, // co lien ket fb khong
                                          verification_status   : $localStorage['login'].active         ? $localStorage['login'].active         : "2",
                                          vertune               : {
                                                currency        :($localStorage['login'].home_currency_detail && $localStorage['login'].home_currency_detail.code)  ? $localStorage['login'].home_currency_detail.code      : "VND"
                                          },
                                          created_at            : $localStorage['login'].time_create    ? $localStorage['login'].time_create : null,
                                          //"Signed up"         : time_create,
                                          job_title             : job_title,
                                          company               : {
                                                  id            : ($localStorage['login'].parent_id == 0)     ? $localStorage['login'].id :$localStorage['login'].parent_id,
                                                  name          : (result.data && result.data.data.fullname ) ? result.data.data.fullname: "",
                                                  monthly_spend : 0,
                                             
                                          },
                                          //user_hash           : null
                                }
                            }
                        });
                    }catch(err) {
                        console.log(err)
                    }
                }
            }
            //check user boxme de show menu product shipment
            //tien te 
            if($localStorage['currency']){
                $rootScope.viewCurrency = $localStorage['currency'];
            }
            if($localStorage['home_currency']){
                $rootScope.ViewHomeCurrency = $localStorage['home_currency'];
            }
            if($localStorage['exchange_rate']){
                $rootScope.exchangeRate = $localStorage['exchange_rate'];
            }
            $rootScope.convert_currency = function(home_currency){
                
                var currency = undefined;
                if (!$localStorage['currency'] || !$localStorage['home_currency'])
                    return currency;
                if($localStorage['home_currency'].toString() == $localStorage['currency'].toString())
                    return currency;
                if(home_currency){
                    currency = parseInt(home_currency)/parseFloat($rootScope.exchangeRate);
                    return currency
                }
                return currency
            }
            $rootScope.convert_currency_to_home_currency = function(currency){
                var home_currency = undefined;
                if (!$localStorage['currency'] || !$localStorage['home_currency'])
                    return home_currency;
                if($localStorage['home_currency'].toString() == $localStorage['currency'].toString())
                    return home_currency;
                if(currency){
                    home_currency = parseFloat(currency) * parseFloat($rootScope.exchangeRate);
                    return home_currency
                }
                return home_currency
            }
            
            //end tien te
            // set config site theo domain
            //$scope.isShipchung = ($location.host() == Site_Config.domain) ? 1: 1;
                var Site_SC =  {
                    ///title        : tran('APP_Title'),
                    login :{
                        title   : 'Hệ thống quản lý đơn hàng Shipchung.vn dành cho người bán',
                        title_en   : 'National wide Shipping Delivery Gateway & CoD Shipchung.vn - Simply delivered ',
                        logo        :'img/logo_to.png',
                        logo_en     :'img/logo_to_en.png'
                    },
                    logo_heard      : 'img/logo-SC-final1.png',
                    titleFooter     :'2016 Cổng vận chuyển và giao hàng thu tiền (CoD) toàn quốc Shipchung.',
                    titleFooter_en  :'2016 National wide Shipping Delivery Gateway & CoD Shipchung.vn - Simply delivered',
                    icon            : 'img/logo_small.png'
                }
                var Site_BM =  {
                    //title         : tran('APP_Title_BM'),
                    login :{
                        title       : 'Cổng hậu cần kho vận cho TMDT',
                        title_en    : 'Your warehouses,everywhere',
                        logo        :'img/BM/logo_01.png',
                        logo_en     :'img/BM/logo_01.png'
                    },
                    logo_heard      : 'img/BM/logo.png',
                    titleFooter     :'2016 BOXME - Kho hàng toàn quốc của bạn',
                    titleFooter_en  :'Your warehouses, everywhere',
                    name            : 'ShipChung',
                    icon            : 'img/BM/icon.png'
                }
                var Site_BM_Asia =  {
                        //title         : tran('APP_Title_BM'),
                        login :{
                            title       : 'Cổng hậu cần kho vận cho TMDT',
                            title_en    : 'Your warehouses,everywhere',
                            logo        : 'img/BM/logo-BM-Asia.png',
                            logo_en     :' img/BM/logo-BM-Asia.png'
                        },
                        logo_heard      : 'img/BM/logo-BM-Asia.png',
                        titleFooter     :'2016 BOXME - Kho hàng toàn quốc của bạn',
                        titleFooter_en  :'2016 BOXME - Your warehouses,everywhere',
                        name            : 'BOXME',
                        icon            : 'img/BM/icon.png'
                    }
            //set config site)
            if($location.host() == BOXME_DOMAIN){
                $scope.site = Site_BM;
            }else if (BOXMEASIA_DOMAIN.indexOf($location.host()) >= 0){
                $scope.site = Site_BM_Asia;
                $rootScope.BMasia  = 1;
            }else{
                $scope.site = Site_SC;
            }
           // $scope.site = ($location.host() != Site_Config.domain) ? Site_SC : Site_BM;
           // end set config site theo domain
            $scope.time_start = 'month';
            $scope.link_storage = ApiStorage;
            $scope.link_excel = ApiPath;
            $scope.list_notify = {};
            $scope.waiting_notify = true;
            $rootScope.windowWith = 0;
            $rootScope._tempUserInfo = {};
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
            $scope.list_time_en = {
                    '7day': ' last 7 days',
                    '14day': ' last 14 days',
                    'month': ' last 1 month',
                    '3months': ' last 3 month'
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

            /*$rootScope.pos = {};
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
*/


            $scope.ResendVerifyEmailProcessing = false;

            $scope.ResendVerifyEmail = function (){
                if($scope.ResendVerifyEmailProcessing){
                    return;
                }
                $scope.ResendVerifyEmailProcessing = true; 
                $http.post(ApiPath + 'app/resend-confirm').success(function (resp){
                    $scope.ResendVerifyEmailProcessing = false; 

                    if(resp.error){
                        toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
                        return;
                    }
                    toaster.pop('success', tran('toaster_ss_nitifi'), resp.error_message);

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

            $scope.list_type                        = {};
            $scope.list_courier                     = {};
            $rootScope.list_district_by_location    = [];
            $scope.courier                          = {};
            $scope.loyalty_level                    = {};
            $scope.list_group                       = {};
            $scope.list_status                      = {};
            $scope.list_status_new                  = {};

            $scope.__get_list_type_case = function(){
                if($localStorage['seller_list_type'] != undefined){
                    $scope.list_type    = $localStorage['seller_list_type'];
                    AppStorage.loadCity();
                    AppStorage.loadDistrict();
                    AppStorage.loadWard();
                }else{
                    Base.list_type_case().then(function (result) {
                        if (result.data.data) {
                            $scope.list_type                    = result.data.data;
                            $localStorage['seller_list_type']   = $scope.list_type;
                        }
                    }).finally(function() {
                        AppStorage.loadCity();
                        AppStorage.loadDistrict();
                        AppStorage.loadWard();
                    });
                }

            }


            $scope.__get_district_by_location = function(){
                if($localStorage['seller_list_district_by_location'] != undefined){
                    $rootScope.list_district_by_location    = $localStorage['seller_list_district_by_location'];
                    $scope.__get_list_type_case();
                }else{
                    Base.district_by_location().then(function (result) {
                        if (result.data.list_location) {
                            $rootScope.list_district_by_location = result.data.list_location;
                            $localStorage['seller_list_district_by_location']   = $rootScope.list_district_by_location;
                        }
                    }).finally(function() {
                        $scope.__get_list_type_case();
                    });
                }

            }

            $scope.__get_courier = function(){
                if($localStorage['seller_list_courier'] != undefined){
                    $scope.list_courier = $localStorage['seller_list_courier'];
                    $scope.courier      = $localStorage['seller_courier'];
                    $scope.__get_district_by_location();
                }else{
                    Base.courier().then(function (result) {
                        if(!result.data.error){
                            $scope.list_courier        = result.data.data;
                            angular.forEach(result.data.data, function(value, key) {
                                $scope.courier[value.id]    = value.name;
                            });

                            $localStorage['seller_list_courier']    = $scope.list_courier;
                            $localStorage['seller_courier']         = $scope.courier;
                        }
                    }).finally(function() {
                        $scope.__get_district_by_location();
                    });
                }
            }

            if($localStorage['loyalty_level'] != undefined){
                $scope.loyalty_level = $localStorage['loyalty_level'];
                $scope.__get_courier();
            }else{
                Base.list_level_loyalty().then(function (result) {
                    if(!result.data.error){
                        $localStorage['loyalty_level']      = result.data.data;
                        $scope.loyalty_level                = result.data.data;
                    }
                }).finally(function() {
                    $scope.__get_courier();
                });
            }
            var get_list_status_order = function(){
                 Order.ListStatus().then(function (result) {
                     var tab_status = []
                     if (result.data.list_group) {
                         angular.forEach(result.data.list_group, function (value) {
                             if($rootScope.keyLang == 'en'){
                                $scope.list_group[+value.id] = value.name_en; 
                             }else{
                                 $scope.list_group[+value.id] = value.name; 
                             }
                             tab_status.push({id: +value.id, name: value.name});
                             if (value.group_order_status) {
                                 angular.forEach(value.group_order_status, function (v) {
                                     $scope.list_status[+v.order_status_code] = v;
                                 });
                             }
                         });
                         $scope.tab_status = tab_status;
                         angular.forEach(result.data.list_status, function (value) {
                             if($rootScope.keyLang == 'en'){
                                $scope.list_status_new[+value.code] = value.name_en; 
                             }else{
                                 $scope.list_status_new[+value.code] = value.name; 
                             }
                         });
                     }
                 });
            }
            $scope.data_popup = {};
            $scope.hide_popover_districtfromgoogleplace = function() {
                var tooltipScope = this;
               // $scope.data_popup.isOpen = true;
               $scope.data_popup.css  ="";
                $timeout(function() {
                    if($scope.data_popup.css  ==""){
                        $scope.data_popup.css = "data_service_popup_close";
                    }
                }, 5000);
            };
            get_list_status_order();
            $scope.$watch('keyLang', function (Value, OldValue) {
                get_list_status_order();
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

        }])
    // signin controller
    .controller('SigninFormController', 
                ['$rootScope','$scope', '$http', 'socialLoginService','$state', 'loginService', '$localStorage','$filter', '$location', '$facebook', 'sessionService', 'Analytics',
        function ($rootScope,  $scope,  $http,  socialLoginService,    $state,     loginService,   $localStorage,  $filter,   $location,   $facebook,   sessionService,   Analytics) {
            var tran = $filter('translate');
            $scope.user             = {};
            $scope.authError        = null;
            $scope.loginFBProcesing = false;
            socialLoginService.logout();
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
            $rootScope.$on('event:social-sign-in-success', function(event, userDetails){
                $scope.data =   {
                    'accessToken'       : userDetails.idToken,
                    'id'                : userDetails.uid,
                    'email'             : userDetails.email,
                    'displayName'       : userDetails.name
                }
                loginService.checkinGoogle($scope, $scope.data, $state);
            })

            Analytics.trackPage('/signin');
            
            
        }])

        .controller('SignupGgController', ['$scope','$rootScope','loginService', '$q', '$state', 'sessionService', '$facebook', '$http', 'PhpJs', 'Analytics','$filter', 
        function ($scope,  $rootScope,  loginService,   $q,   $state,   sessionService,  $facebook,   $http,    PhpJs,   Analytics,  $filter) {
            var tran = $filter('translate');
            var defer = $q.defer();
            //$scope.user = {};
            if($rootScope.userGoogle == undefined){
                $state.go('access.signin');
            }
            $scope.check_disable=false;
            //console.log($rootScope.userGoogle)

            $scope.user = {
                'identifier'    : 'Anh',
                'agree'         : true,
                'email'          :  $rootScope.userGoogle ?  $rootScope.userGoogle.email        : "",
                'fullname'       :  $rootScope.userGoogle ? $rootScope.userGoogle.fullname      : "",
                'profile_gg_id'  :  $rootScope.userGoogle ? $rootScope.userGoogle.profile_id    : ""
                }
            $scope.check_disable=true;
            


            $scope.signup = function (data) {
                $scope.authError = null;
                // Try to create
                $scope.onProgress = true;
                loginService.register(data, $scope, $state);
            };
    }])    

    .controller('ConfirmEmailCtrl', ['$scope', '$rootScope','$filter', '$http', '$state', 'loginService', 'sessionService', 'toaster', 
                              function ($scope, $rootScope,  $filter,   $http,  $state,   loginService,    sessionService,  toaster) {
        var tran = $filter('translate');
        var user = loginService.islogged();
        var code = $state.params.code;

        $scope.loadingProcess = false;
        $scope.result         = true;
        $scope.error_code     = "";

        $http.get(ApiPath + 'app/confirm-user/' + code).success(function (resp){
            $scope.loadingProcess = true;
            if (user) {
                user.verified         = 1;
                $rootScope.userInfo.verified = 1;
                sessionService.set($rootScope.userInfo);
            };
            
            if(resp.error){
                $scope.result           = true;
                $scope.error_code       = resp.error_code;
                toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
            }
        })
    }])

    // signup controller
    .controller('SignupFormController', ['$scope', '$state', 'toaster', 'loginService', 'Analytics', 
                              function ( $scope,  $state,   toaster,    loginService,   Analytics) {
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
    .controller('SignupFbController', ['$scope','loginService', '$q', '$state', 'sessionService', '$facebook', '$http', 'PhpJs', 'Analytics','$filter', 
                              function ($scope,  loginService,   $q,   $state,   sessionService,  $facebook,   $http,    PhpJs,   Analytics,  $filter) {
        var tran = $filter('translate');
        var defer = $q.defer();
        $scope.user = {identifier : 'Anh',agree : true};
       
        var check = function (resp){
            $http({
                url: ApiPath+'app/profile-fb',
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
                    alert(PhpJs.convertString(result.error_message)); 
                    $state.go('access.signin');
                }else {

                    

                    if(result.data.profile_id != undefined){ // Đăng ký fb
                        $scope.user             = result.data;
                        $scope.user.identifier  = 'Anh';
                        $scope.user.agree       = true;

                        
                        try {
                            if (fbq) {
                                fbq('track', 'Lead');
                            };
                        }catch(err) {
                            
                        }
                        Analytics.trackEvent('Signup', 'Register', 'Account Signup');

                    }else{ // Đăng nhập
                        sessionService.set(result['data']);
                        var ref = getParameterByName('fb_ref');
                        switch (ref){
                            case 'process':
                                 $state.go('order.problem');
                                break;

                            default:
                                if(result.data.active < 2){
                                    $state.go('app.config.account');
                                }else if(result.data.first_order_time == 0 ) {
                                    $state.go('order.create_once');
                                }else{
                                    $state.go('order.problem');
                                }
                                break;
                        }
                    }
                }

            }).error(function (data, status, headers, config) {
                alert('Kết nối thất bại, vui lòng thử lại');
                $state.go('access.signin');
            });
        }

        $scope.signup = function (data) {
            $scope.authError = null;
            // Try to create
            $scope.onProgress = true;
            loginService.register(data, $scope, $state);
        };

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
    }])
//Modal
    .controller('ModalCashInCtrl', ['$scope', '$modalInstance', '$http', '$filter', '$window', 'toaster', 'Cash', 'Analytics',
                           function ($scope,   $modalInstance,  $http,    $filter,   $window,   toaster,   Cash,   Analytics) {
         var tran = $filter('translate');
            Analytics.trackPage('/order/listing');

            // Config
            $scope.data = {type: 1};
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
    .controller('LoyaltyCtrl', ['$scope', '$localStorage', '$modal', 'Loyalty',
                       function ($scope,  $localStorage,  $modal,  Loyalty) {
            $scope.frm_submit   = false;
            $scope.data         = {};
            $scope.list_gift    = {};
            $scope.tab_loyalty  = 1;

            Loyalty.detail().then(function (result) {
                if(!result.data.error){
                    $scope.data = result.data.data;
                }
            },function(reason){
                $modalInstance.dismiss('cancel');
            }).finally(function() {
                Loyalty.list_gift().then(function (result) {
                    if(!result.data.error){
                        $scope.list_gift = result.data.data;
                    }
                },function(reason){
                })
            })

            $scope.get_gift = function(){
                $modal.open({
                    templateUrl: 'ModalGiftLoyaltyCtrl.html',
                    controller: 'ModalGetGiftCtrl',
                    size: '',
                    resolve: {
                    }
                });
            }
        }])
    .controller('ModalGetGiftCtrl',
                ['$scope', '$localStorage', '$modalInstance', 'Loyalty',
        function ($scope,  $localStorage,  $modalInstance,     Loyalty) {
            $scope.frm_submit = false;
            $scope.list_gift        = {};
            $scope.data             = {gift_id : 0};

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            Loyalty.list_gift().then(function (result) {
                if(!result.data.error){
                    $scope.list_gift = result.data.data;
                }else{
                    $modalInstance.dismiss('cancel');
                }
            },function(reason){
                $modalInstance.dismiss('cancel');
            })

            $scope.save = function (item) {
                item.disabled = true;
                var data = {id : item.id};

                if(item.category_id == 2){
                    data.phone_type = item.phone_type;
                    data.phone      = item.phone;
                }

                Loyalty.Create(data).then(function (result) {
                    if(result.data.error){
                        item.disabled = false;
                        item.error = result.data.error_message;
                        item.result = '';
                    }else{
                        item.error = '';
                        item.result = result.data.error_message;
                    }


                });
            }
        }])
//Modal
    .controller('ModalCreateCtrl', 
                ['Config_Status', '$scope', '$modalInstance', '$http', '$filter', 'toaster', 'FileUploader', 'Api_Path', 'list_type', 'sc_code', 'Ticket', '$rootScope', 'bootbox', 'Analytics',
        function (Config_Status,  $scope,   $modalInstance,    $http,   $filter,   toaster,   FileUploader,   Api_Path,   list_type,   sc_code,   Ticket,    $rootScope,   bootbox,  Analytics) {
            // Config
                    var tran = $filter('translate');    
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
                                    //toaster.pop('warning', 'Thông báo', 'Lỗi không thể giao lại đơn hàng này vui lòng liên hệ bộ phận CSKH ');
                                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_LoiKhongTheGiaoLai'));
                                } else {
                                    $scope.confirm_delivered = true;
                                   // toaster.pop('success', 'Thông báo', 'Thành công');
                                    toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                                }
                            })


                        } else {
                            if (result == "") {
                                $timeout(function () {
                                    //toaster.pop('warning', 'Thông báo', 'Vui lòng nhập nội dung yêu cầu !');
                                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_VuiLongNhapNoiDung'));
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
                    //toaster.pop('warning', 'Thông báo', 'Upload Thất bại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoi'));
                }
            };

            uploaderPopup.onErrorItem = function (item, result, status, headers) {
               // toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
                 toaster.pop('error',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadLoiHayThuLai'));
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
                      //  toaster.pop('success', 'Thông báo', 'Thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
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
                        //toaster.pop('error', 'Thông báo', 'Có lỗi , hãy thử lại');
                        toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
                        $scope.frm_submit = false;
                    }

                }).error(function (data, status, headers, config) {
                    //toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    $scope.frm_submit = false;
                });
                $scope.show_respond = true;
            }

            // toogle show  markdown
            $scope.toogle_show = function () {
                $scope.show_respond = !$scope.show_respond;
            }
        }])

   .controller('ModalSecurity', ['$scope', '$modalInstance', '$http', '$rootScope', 'toaster', 'bootbox', 'UserInfo', 'data', 'type', 'phone','$filter',
                         function($scope,  $modalInstance,  $http,   $rootScope,    toaster,    bootbox,   UserInfo,   data,   type, phone, $filter) {
       var tran = $filter('translate');
       $scope.phone     = phone;
        $scope.code     = "";
        $scope.waiting  = false;

        $scope.run = function (code) {
            $scope.waiting  = true;
            var datas = data;
            var url   = '';
            datas['code'] = code;

            if(type == 1){
                url = ApiPath+'user-info/change-info';
            }else if(type == 2){
                url = ApiPath+'user/edit'
            }else if(type == 3){
                url = ApiPath+'user-info/create'
            }else if (type == 4){
                url = ApiPath+'vimo-config/create'
            }else if (type == 5){
                url = ApiPath+'user-info/create'
            }else if (type == 6){
                url = ApiPath+'user-info/create'
            }else if (type == 7){
                url = ApiPath+'banking-config/create'
            }else if (type == 8){
                url = ApiPath+'user/edit-info'
            }else if (type == 9){
                url = ApiPath+'user-info/alepay-linked'
            }else if (type == 10){
                url = ApiPath+'user-info/create'
            }

            $http({
                url: url,
                method: "POST",
                data:datas,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    toaster.pop('success', tran('toaster_ss_nitifi'), result.message);
                    //toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    $modalInstance.close(result);
                }else{
                    $scope.waiting  = false;
                    code     = "";
                    toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
                }
            }).error(function (data, status, headers, config) {
                $scope.waiting  = false;
                $modalInstance.close({'error' : true, 'message' : 'Lỗi kết nối dữ liệu, hãy thử lại'});
            });

        };

        $scope.re_send_opt  = function(){
            UserInfo.resend_otp({type : type}).then(function (result) {

            });
        }

        $modalInstance.close({'error' : true, 'message' : ''});

    }]);
app.controller('thongBaoUser', [
                                '$scope','$modalInstance', function($scope,$modalInstance ) {
                                    $scope.cancel = function(){
                                        $modalInstance.dismiss('cancel');
                                    }
                        }])