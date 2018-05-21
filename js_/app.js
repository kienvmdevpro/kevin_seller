'use strict';

/*var ApiPath     = '/boxme/api/public/api/v1/';
var ApiRest     = '/boxme/api/public/api/rest/';
var ApiJourney     = '/boxme/api/public/trigger/journey/';
var ApiUrl      = '/boxme/api/public/';*/
var ApiStorage  = 'http://cloud.shipchung.vn/';




var ApiPath     = '/api/public/api/v1/';
var ApiSeller   = '/api/public/api/seller/';
var ApiCron     = '/api/public/cronjob/';
var ApiRest     = '/api/public/api/rest/';
var ApiJourney  = '/api/public/trigger/journey/';
var ApiUrl      = '/api/public/';

var ApiStorage  = 'http://cloud.shipchung.vn/';
var fbdk        = {
    'appId'         : "451866784967740", //451866784967740 //377802115738753
    "permisstions"  : "email, manage_notifications"
}

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.load',
    'ui.jq',
    'ui.validate',
    'ui.select',
    'ngSanitize',
    //'ui.codemirror',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers',
    'markdown',
    'ngTagsInput',
    'toaster',
    'fcsa-number',
    'angularFileUpload',
    'ngFacebook',
    'highcharts-ng',
    'ngBootstrap',
    /*'angulartics',
    'angulartics.google.analytics',*/
    'angular-google-analytics'
    //'angularPayments',
    //'angulartics'
  ])
.factory('sessionService', ['$http', '$localStorage', function($http, $localStorage){
	return{
        set:function(data){
            var newDate = new Date();
            $localStorage['last_login_email']   = data.email;
            $localStorage['login']              = data;
            $localStorage['time_login']         = Date.parse(new Date());
        },
		destroy:function(){
            delete $localStorage['login'];
            delete $localStorage['time_login'];
			return $http.get(ApiPath+'app/checkout');
		}
	};
}])
.factory('loginService',function($http, $location, sessionService, $localStorage, $window, $rootScope, Order, $state, $facebook){
	var ret = {
		login:function(data,scope,state){
			$http({
                url: ApiPath+'app/checkin',
                method: "POST",
                data: data,
                dataType: 'json',                
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
				if(result.code == 'success'){
                    sessionService.set(result['data']);

                    if($state.params.return_url){
                        window.location.href = $state.params.return_url;
                        return false;
                    }
                    if(result.data.active < 2 && !result.data.parent_id){
                        state.go('app_register_guide', {buoc:1});
                    }else if(result.data.first_order_time == 0 ) {
                        state.go('order.create');
                    }else{
                        state.go('order.process');//,{time_start:'14day'}
                    }
				}	       
				else{
					scope.authError = 'Email hoặc mật khẩu không dúng !';
				}
                scope.onProgress = false;
            }).error(function (data, status, headers, config) {
                scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.onProgress = false;
            });
		},
        register:function(data,scope,state){
            data['confirm_password'] = data['password'];
            $http({
                url: ApiPath+'app/register',
                method: "POST",
                data: data,
                dataType: 'json',                
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
				if(result.code == 'success'){
                    sessionService.set(result['data']);
                    state.go('app_register_guide', {buoc:1});
				}	       
				else{
                    scope.onProgress = false;
                    if(typeof result.message == 'string') {
                        scope.authError = result.message;
                        return;
                    }
				    if('email' in  result.message){
                        if(result.message.email == 'The email must be a valid email address.'){
                            scope.authError = 'Email không đúng định dạng !';
                        }else {
                            scope.authError = 'Email đã tồn tại';
                        }

				    }else if('fullname' in result.message){
				        scope.authError = 'Hãy nhập họ tên đầy đủ !';
				    }else if('password' in result.message){
				        scope.authError = 'Hãy nhập mật khẩu !';
				    }else if('confirm_password' in result.message){
				        scope.authError = 'Hãy nhập mật khẩu xác nhận !';
				    }else if('insert' in result.message){
				        scope.authError = 'Lỗi , vui lòng thử lại !';
				    }
				}
                
            }).error(function (data, status, headers, config) {
                scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.onProgress = false;
            });
        },
        loginfb : function(scope,state){
            $http({
                url: ApiPath+'app/loginfb',
                method: "GET",
                dataType: 'json',                
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                if(result.data){
                    sessionService.set(result['data']);
                    if(result.data.active < 2 && !result.data.parent_id){
                        state.go('app_register_guide', {buoc:1});
                    }else if(result.data.first_order_time == 0 ) {
                        state.go('order.create');
                    }else{
                        state.go('order.list',{time_start:'14day'});
                    }
                }else{
                    window.location.href = result.url;
                }
                
            }).error(function (data, status, headers, config) {
                scope.authError = 'Kết nối thất bại, vui lòng thử lại';
            });
            return;
        },


        checkinfb: function ($scope, $state){
            $scope.authError    = null;
            $scope.loginFBProcesing = true;
            window.location = "http://www.facebook.com/dialog/oauth/?scope=" + fbdk.permisstions + "&client_id="+ fbdk.appId +"&redirect_uri=http://seller.shipchung.vn&response_type=code";
            return false;
            $facebook.login().then(function (resp){

                if(resp.status == 'connected'){
                    // Gủi request lên server lấy thông tin user 
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
                            $scope.authError = result.error_message;
                        }else {
                            if(Object.keys(result.data).length > 0 ){
                               sessionService.set(result['data']);
                               
                               if(result.data.active < 2){
                                    state.go('app_register_guide', {buoc:1});
                               }else if(result.data.first_order_time == 0 ) {
                                    $state.go('order.create');
                               }else{
                                    $state.go('order.process');
                               }                                
                            }else {
                                $state.go('access.signin');
                            }
                        }

                        $scope.loginFBProcesing = false;
                    }).error(function (data, status, headers, config) {
                        $scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                    });
                }else {
                    $scope.authError = "Đăng nhập facebook không thành công";
                }
            }, function (errr){
                    $scope.authError = "Đăng nhập facebook không thành công";
            })
            
            

        },
        checkin : function(callback){
            $http({
                url: ApiPath + 'app/loginfb',
                method: "GET",
                dataType: 'json',                
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                if(result.data){
                    callback(null, result);
                }else {
                    callback(true, null);
                }
            }).error(function (data, status, headers, config) {
                scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                callback(true, null);
            });
            //console.log(scope, $state);
            return;
        },
        
		logout:function(state){
            sessionService.destroy();
            $facebook.clearCache();
            
            $location.path('/access/signin');
		},
		islogged:function(){
            return $localStorage['login'];
		},
        gettimelogged:function(scope){
            return $localStorage['time_login'];
        },
        check_balance:function(){
            $http({
                url: ApiPath+'merchant/show',
                method: "GET",
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                $rootScope.userInfo.balance         = result.data.balance;
                $rootScope.userInfo.freeze          = result.data.freeze;
                $rootScope.userInfo.provisional     = result.data.provisional;
            }).error(function (data, status, headers, config) {
                $rootScope.userInfo.balance         = 0;
                $rootScope.userInfo.freeze          = 0;
                $rootScope.userInfo.provisional     = 0;
            });
            return;
        },
        check_nl: function (callback){
            $http({
                url: ApiPath+'user-info/check-nl',
                method: "GET",
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                callback(result.data);
            }).error(function (data, status, headers, config) {
                callback(true);
            });
            return;
        },
        checkOrderProcess: function (){
            Order.CountOrderProcess(function (err, data){
                $rootScope._OrderProcess = data
            })  
        },
        checkInventory: function (callback){
            $http({
                url: ApiPath+'inventory-config/check-ward',
                method: "GET",
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                callback(result.data);
            }).error(function (data, status, headers, config) {
                callback(false);
            });
        }
	};
    return ret;

})
.run(
  [ '$rootScope', '$state', '$http', '$stateParams', '$location', '$templateCache', 'loginService', 'sessionService', '$localStorage','$modal', 'Analytics',
  function ($rootScope, $state, $http, $stateParams, $location, $templateCache, loginService, sessionService, $localStorage,  $modal, Analytics) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

      $rootScope.$on('unauthorize', function (){
            sessionService.destroy();
            $state.go('access.signin', {'return_url': window.location.href});
      });        

      $rootScope.$on('$routeChangeStart', function (event, next, current) {
          if (typeof (current) !== 'undefined') {
              $templateCache.remove(current.templateUrl);
          }
      });

      //alert(routespermission.indexOf($location.path()));
        var routespermission = ['/access/signup','/access/signin'];  //route that require login
    	$rootScope.$on('$stateChangeStart', function(evt, toState, toParams){
            $rootScope.userInfo = loginService.islogged();
            if($rootScope.userInfo != undefined){
                $http.defaults.headers.common['Authorization']  = $rootScope.userInfo.token;
                Analytics.set('&uid', $rootScope.userInfo.id);
            }
            
            if (!toState.name.match(/^access/g) && !toState.name.match(/^print/g) && !toState.name.match(/^print_hvc/g) && !toState.name.match(/^detail/g) && !toState.name.match(/^checkin/g) && !toState.name.match(/^app_register_guide/g)){
                if($rootScope.userInfo && $rootScope.userInfo.active < 2){
                    evt.preventDefault();
                    $state.go('app_register_guide', {buoc:1});    
                    return;
                }
            }
            
            if (!toState.name.match(/^access/g) && !toState.name.match(/^print/g) && !toState.name.match(/^print_hvc/g) && !toState.name.match(/^detail/g) && !toState.name.match(/^checkin/g))
    		{
                
                
                if(!loginService.gettimelogged() || (+Date.parse(new Date()) - loginService.gettimelogged() > 21600000)  ){
                    evt.preventDefault();
                    Analytics.set('&uid', 0);
                    sessionService.destroy();
                    $state.go('access.signin', {'return_url': window.location.href});
                }else{
                    /*loginService.checkInventory(function (data){
                        if(data && data.length > 0){
                            $modal.open({
                                templateUrl: 'tpl/modal.check_inventory.html',
                                controller: function ($scope, $modalInstance, data, Location, Inventory, toaster){
                                    $scope.data = data;
                                    $scope._data = {};
                                    $scope.wards = {};
                                    $scope.selectedWard = {};


                                    $scope.loadWard = function (inventory, province){
                                        Location.ward(province, 'all').then(function (respon){
                                            $scope.wards[inventory] = respon.data.data;

                                        })
                                    };

                                    angular.forEach(data, function (value, key){
                                        $scope._data[value.id] = value;
                                        $scope.loadWard(value.id, value.province_id);
                                    });



                                    $scope.update = function (id, ward_id){
                                        Inventory.create({
                                            id: id,
                                            ward_id: ward_id
                                        }).then(function (result) {
                                            if(!result.data.error){
                                                //toaster.pop('success', 'Thông báo', 'Cập nhật thành công')
                                            }else{
                                                //toaster.pop('success', 'Thông báo', 'Cập nhật thất bại');
                                            }
                                        });

                                    };

                                    $scope.run = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                },
                                resolve: {
                                    'data': function (){
                                        return data;
                                    }
                                }
                            });
                        }
                    });*/
                    /*
                        if(!$rootScope.userInfo.has_nl && $rootScope.userInfo.provisional > 0){
                            loginService.check_nl(function (has){
                                if(!has){
                                    $modal.open({
                                        templateUrl: 'PopupRequestNL.html',
                                        controller: function ($scope, $modalInstance){
                                            $scope.run = function () {
                                                $modalInstance.dismiss('cancel');
                                            };
                                        }
                                    });
                                }
                            })
                        }
                    */


                    loginService.check_balance();
                    loginService.checkOrderProcess();
                }
            }else if(!toState.name.match(/^print/g) && !toState.name.match(/^print_hvc/g) && !toState.name.match(/^detail/g) && !toState.name.match(/^checkin/g)){
                
                if(loginService.gettimelogged() && (+Date.parse(new Date()) - loginService.gettimelogged() < 21600000)){
                    evt.preventDefault();
                    $state.go('order.list',{time_start:'7day'});
                    loginService.check_balance();
                    loginService.checkOrderProcess();
                }
            }else {

            }
    	});
    }]
)
// translate config
.config(['$translateProvider', '$locationProvider', function($translateProvider, $locationProvider){

    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
    });

    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');

    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();

    /*
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
    */

}])

/*.config( function( $analyticsProvider ) {
    $analyticsProvider.virtualPageviews(false);
})*/

.config( function( $facebookProvider, AnalyticsProvider ) {
  $facebookProvider.setAppId(fbdk.appId);
  $facebookProvider.setPermissions(fbdk.permisstions);

  AnalyticsProvider
    .setAccount('UA-31776960-5', {
        trackEvent: true,
        trackEcommerce: true
    });

    AnalyticsProvider.trackPages(false)
    AnalyticsProvider.logAllCalls(true);
    /*AnalyticsProvider.startOffline(true);*/
    AnalyticsProvider.useAnalytics(true);
    AnalyticsProvider.useECommerce(true, true);
    AnalyticsProvider.enterDebugMode(false);
    AnalyticsProvider.useDisplayFeatures(true);
    //AnalyticsProvider.useEcommerce(true, true);

})

/*.config(function (AnalyticsProvider) {
  // Add configuration code as desired - see below
    AnalyticsProvider
    .setAccount('UA-31776960-5', {
        trackEvent: true,
        trackEcommerce: true
    })
    .logAllCalls(true)
    .startOffline(true)
    .useAnalytics(false)
    .useEcommerce(true, true);

})
*/
.run( function( $rootScope ) {

  // Load the facebook SDK asynchronously
  (function(){
     // If we've already installed the SDK, we're done
     if (document.getElementById('facebook-jssdk')) {return;}

     // Get the first script element, which we'll use to find the parent node
     var firstScriptElement = document.getElementsByTagName('script')[0];

     // Create a new script element and set its id
     var facebookJS = document.createElement('script'); 
     facebookJS.id = 'facebook-jssdk';

     // Set the new script's source to the source of the Facebook JS SDK
     facebookJS.src = '//connect.facebook.net/en_US/all.js';

     // Insert the Facebook JS SDK into the DOM
     firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
   }());
})



// HTTP response interceptors
/*.config(['$httpProvider', function ($httpProvider){
    var interceptor = ['$rootScope', '$q', '$location', function ($rootScope, $q, $location) {


            var success = function (response) {
                return response;
            };

            var error = function (response) {
                var status = response.status;
                var config = response.config;
                var method = config.method;
                var url = config.url;

                if (400 <= status && status <= 499) {
                    if (status === 403 || status === 401) {
                        $rootScope.$broadcast('unauthorize');
                    }
                }

                return $q.reject(response);
            };

            return function (promise) {
                return promise.then(success, error);
            };
        }];

        $httpProvider.responseInterceptors.push(interceptor);

}])*/


/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
.constant('JQ_CONFIG', {
    easyPieChart:   ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
    sparkline:      ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
    plot:           ['js/jquery/charts/flot/jquery.flot.min.js', 
                        'js/jquery/charts/flot/jquery.flot.resize.js',
                        'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
                        'js/jquery/charts/flot/jquery.flot.spline.js',
                        'js/jquery/charts/flot/jquery.flot.orderBars.js',
                        'js/jquery/charts/flot/jquery.flot.pie.min.js'],
    slimScroll:     ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
    sortable:       ['js/jquery/sortable/jquery.sortable.js'],
    nestable:       ['js/jquery/nestable/jquery.nestable.js',
                        'js/jquery/nestable/nestable.css'],
    filestyle:      ['js/jquery/file/bootstrap-filestyle.min.js'],
    slider:         ['js/jquery/slider/bootstrap-slider.js',
                        'js/jquery/slider/slider.css'],
    chosen:         ['js/jquery/chosen/chosen.jquery.min.js',
                        'js/jquery/chosen/chosen.css'],
    TouchSpin:      ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
                        'js/jquery/spinner/jquery.bootstrap-touchspin.css'],
    wysiwyg:        ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
                        'js/jquery/wysiwyg/jquery.hotkeys.js'],
    dataTable:      ['js/jquery/datatables/jquery.dataTables.min.js',
                        'js/jquery/datatables/dataTables.bootstrap.js',
                        'js/jquery/datatables/dataTables.bootstrap.css'],
    vectorMap:      ['js/jquery/jvectormap/jquery-jvectormap.min.js', 
                        'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
                        'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
                        'js/jquery/jvectormap/jquery-jvectormap.css'],
    footable:       ['js/jquery/footable/footable.all.min.js',
                        'js/jquery/footable/footable.core.css']
    }
)

// modules config
.constant('MODULE_CONFIG', {
    select2:        ['js/jquery/select2/select2.css',
                        'js/jquery/select2/select2-bootstrap.css',
                        'js/jquery/select2/select2.min.js',
                        'js/modules/ui-select2.js']
    }
)

// oclazyload config
.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    // We configure ocLazyLoad to use the lib script.js as the async loader
    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        cache   : true,
        timeout : 1440000,
        modules: [
            {
                name: 'ngGrid',
                files: [
                    'js/modules/ng-grid/ng-grid.min.js',
                    'js/modules/ng-grid/ng-grid.css',
                    'js/modules/ng-grid/theme.css'
                ]
            },
            {
                name: 'xeditable',
                files: [                    
                    'js/jquery/editable/xeditable.min.js',
                    'js/jquery/editable/xeditable.css'
                ]
            },
            {
                name: 'angular-bootbox',
                files: [
                    'js/modules/bootstrap.js',
                    'js/modules/bootbox.js',
                    'js/modules/angular-bootbox.js'
                ]
            }
            ,
            {
                name: 'bm.bsTour',
                files: [
                    'js/modules/bootstrap.js',
                    'js/tour/bootstrap-tour.js',
                    'js/tour/angular-bootstrap-tour.js',
                    'js/tour/angular-tour.css'
                ]
            }
        ]
    });
}]).config(function(markdownConfig){
  markdownConfig.sanitize = false;
});