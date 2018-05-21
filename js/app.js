'use strict';

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
    'angular-google-analytics',
    'betsol.intlTelInput',
    'socialLogin'
  ])
.factory('sessionService', ['$http', '$localStorage', function($http, $localStorage){
    return{
        set:function(data){
            var newDate = new Date();// 22765;// "$";//
            $localStorage['last_login_email']   = data.email;
            $localStorage['login']              = data;
            $localStorage['time_login']         = Date.parse(new Date());
            $localStorage['home_currency'] 		= (data.home_currency_detail && data.home_currency_detail.symbol) ?  data.home_currency_detail.symbol : "đ"//vnd
            $localStorage['currency']			= (data.currency_detail && data.currency_detail.symbol) ? data.currency_detail.symbol : "đ";//"đ"; //usd
            $localStorage['exchange_rate'] 		= data.exchange_rate ? data.exchange_rate: 1; //0.00004545454;
            $localStorage['fulfillment'] 		= data.fulfillment ? data.fulfillment : 0;
            $localStorage['role'] 				= (data.role || data.role == 0) ? data.role :  3;
            $localStorage['store_connect']      = data.store_connect ? data.store_connect : [];  
                //post message login to shipchung.vn   
            var d = new Date();
            d = new Date(d.getTime() + 1000 * 21600);
            var time = d.toUTCString();
            parent.postMessage({measse:"login_success",time_login:Date.parse(new Date())}, "https://www.shipchung.vn");
            document.cookie = "login_seller=true ;expires="+time+"; path=/; domain=shipchung.vn";
            document.cookie = "user_name="+data.fullname+" ;expires="+time+"; path=/; domain=shipchung.vn";
            document.cookie = "time_login_seller="+Date.parse(new Date())+" ;expires="+time+"; path=/; domain=shipchung.vn";
            document.cookie = "logout_seller=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=shipchung.vn;";
        },
        destroy:function(){
            $localStorage.$reset();
            var d = new Date();
            d = new Date(d.getTime() + 1000 * 21600);
            var time = d.toUTCString();
            document.cookie = "logout_seller=true ;expires="+time+"; path=/; domain=shipchung.vn";
            document.cookie = "login_seller=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=shipchung.vn;";
            document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=shipchung.vn;";
            document.cookie = "time_login_seller=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=shipchung.vn;";
          //intercom
            try {
            	Intercom('shutdown');
            }catch(err) {
			    console.log(err)
			}
            //intercom
            return $http.get(ApiPath+'app/checkout');
        }
    };
}])
.factory('loginService',function($http,$filter, $location, sessionService,socialLoginService, $localStorage, $window, $rootScope, Order, $state, $facebook, PhpJs, Analytics){
	var tran = $filter('translate');
	var ret = {
        login:function(data,scope,state){
            $http({
                url: ApiPath+'app/checkin',
                method: "POST",
                data: data,
                dataType: 'json',                
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                if (result.code == 'success') {
                    sessionService.set(result['data']);
                    // with a property "Account Login" 

                  //intercom
                    try {
                    	//var timeLog = $filter('date')(new Date(),'yyyy-MM-dd HH:mm');
                    	/*window.Intercom('boot', {
							   app_id	: intercomConfig.appId,
							   email	: result['data'].email 	? result['data'].email 	: "",
							   user_id	: result['data'].id  		? result['data'].id 	: "",
							   time		:$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
							});*/
                    	//window.Intercom('update', {verification_status :3});
                    	var metadata = {
  	                	   email	: 	result['data'].email 	? result['data'].email 	: "",
      	                   user_id	: 	result['data'].id  		? result['data'].id 	: "",
      	                   phone	: 	result['data'].phone 	? result['data'].phone 	: "",
      	                   name		:   result['data'].fullname ? result['data'].fullname : "",
      	                   time		:	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
      	                   type		:	1,
      	                   link		:"access/signin"
            			};

                        ga('set', 'userId', result['data'].id); 
                    	Intercom('trackEvent', 'Login', metadata);
                    }catch(err) {
					    console.log(err)
					}
                    //intercom
                    if($state.params.return_url){
                        window.location.href = $state.params.return_url;
                        return false;
                    }
                    
                    if(result.data.first_order_time == 0 ) {
                    	if($localStorage['fulfillment'] && $localStorage['fulfillment'] == 1){
                    		state.go('order.create_once_global_bm');
                    	}else{
                    		state.go('order.create_once_global');
                    	}
                        
                    }else{
                        state.go('order.problem');//,{time_start:'14day'}
                    }
                    try {
                    	var metadata = {
  	                	   email	: 	result['data'].email 	? result['data'].email : "",
      	                   user_id	: 	result['data'].id  		?  result['data'].id : "",
      	                   time		:	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
      	                   type		:	1,
            			};
            			Intercom('trackEvent', 'Login', metadata);
                    }catch(err) {
					    console.log(err)
					}
                }          
                else{
                    //scope.authError = 'Email hoặc mật khẩu không dúng !';
                    scope.authError = tran('BS_EmailMatKhauSai');
                }
                scope.onProgress = false;
            }).error(function (data, status, headers, config) {
                //scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.authError = tran('Toaster_LoiServer');
                scope.onProgress = false;
            });
        },
        register:function(data,scope,state){
            try {
                if (fbq) {
                    fbq('track', 'Lead');
                };
            }catch(err) {
                
            }
            Analytics.trackEvent('Signup', 'Register', 'Account Signup');


            $http({
                url: ApiPath+'app/register',
                method: "POST",
                data: data,
                dataType: 'jsonp'
            }).success(function (result, status, headers, config) {
                if(result.code == 'success'){
                    sessionService.set(result['data']);
                    $localStorage['role'] 	= 0;
                    //intercom
                    try {
	                	window.Intercom('boot', {
							   app_id		: intercomConfig.appId,
							   email		: result['data'].email 					? result['data'].email 	: "",
							   user_id		: result['data'].id  					? result['data'].id 	: "",
							   time			: $filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
							   created_at	: Date.parse(new Date())/1000,
						});
	             	var metadata = {
	               	   email	: 	result['data'].email 	? result['data'].email 	: "",
		                   user_id	: 	result['data'].id  		? result['data'].id 	: "",
		                   phone	: 	result['data'].phone 	? result['data'].phone 	: "",
		                   name		:   result['data'].fullname ? result['data'].fullname : "",
		                   time		:	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
		                   link		:	"access/signup",
		                   type		: 1,
	     			};
	     			Intercom('trackEvent', 'Register', metadata);
	     			Intercom('trackEvent', 'Login', metadata);
	             }catch(err) {
					    console.log(err)
				 }
	             //intercom
                    $state.go('order.problem');
                    
                }
                else{
                    scope.onProgress = false;
                    scope.authError = PhpJs.convertString(result.message);
                }

            }).error(function (data, status, headers, config) {
                //scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.authError = tran('Toaster_LoiServer');
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
                    // Intercom   
                    try {
                    	/*window.Intercom('boot', {
							   app_id	: intercomConfig.appId,
							   email	: result['data'].email 	? result['data'].email 	: "",
	      	                   user_id	: result['data'].id  		? result['data'].id 	: "",
							   time		: $filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
						});*/
                    	var metadata = {
  	                	   email	: 	result['data'].email 	? result['data'].email 	: "",
      	                   user_id	: 	result['data'].id  		? result['data'].id 	: "",
      	                   time		:	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
      	                   type		: 2,
      	                   link		:"access/signup"
            			};
            			Intercom('trackEvent', 'Login', metadata);
                    }catch(err) {
					    console.log(err)
					}
                    // Intercom 
                    if(result.data.first_order_time == 0 ) {
                    	if($localStorage['fulfillment'] && $localStorage['fulfillment'] == 1){
                    		state.go('order.create_once_global_bm');
                    	}else{
                    		state.go('order.create_once_global_new');
                    	}
                    }else{
                        state.go('order.list',{time_start:'14day'});
                    }
                }else{
                    window.location.href = result.url;
                }
                
            }).error(function (data, status, headers, config) {
                //scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.authError = tran('Toaster_LoiServer');
            });
            return;
        },

        //login gg
        checkinGoogle   :   function($scope,data,$state){
            $scope.authError = null;
            $scope.loginGgProcesing = true;
            $http({
                url         : ApiPath + 'app/profile-gg',
                method      : "POST",
                data        : {
                    'access_token'      : data.accessToken,
                    'gg_profile_id'     : data.id,
                    'email'             : data.email,
                    'name'              : data.displayName
                },
                dataType    : 'json',
                headers     : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (result, status, headers, config) {
                $scope.loginGgProcesing = false;
                if (result.error) {
                    $scope.authError = result.error_message;
                } else {
                    if(!result['data']['token']){
                        $rootScope.userGoogle = result['data'];
                        $state.go('checkingg');
                    }else{
                        if (Object.keys(result.data).length > 0) {
                            sessionService.set(result['data']);
                            // Intercom   
                            try {
                                var metadata = {
                                    email: result['data'].email ? result['data'].email : "",
                                    user_id: result['data'].id ? result['data'].id : "",
                                    time: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm'),
                                    type: 2,
                                    link: "access/signin"
                                };
                                Intercom('trackEvent', 'Login', metadata);
                            } catch (err) {
                                console.log(err)
                            }
                            // Intercom
                            $state.go('order.create_once_global_new');                             
                        } else {
                            $state.go('access.signin');
                        }
                    }
                    
                    
                }
            }).error(function (data, status, headers, config) {
                $scope.authError = tran('Toaster_LoiServer');
            })
        },
        //end login gg


        checkinfb: function ($scope, $state){
            $scope.authError    = null;
            $scope.loginFBProcesing = true;
            var redirect_uri = location.protocol + '//' + location.host;
            window.location = "http://www.facebook.com/dialog/oauth/?scope=" + fbdk.permisstions + "&client_id="+ fbdk.appId +"&redirect_uri="+redirect_uri+"&response_type=code";
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

                             // Intercom   
                                try {
                                	/*window.Intercom('boot', {
	         							   app_id	: intercomConfig.appId,
	         							   email	: result['data'].email 	? result['data'].email 	: "",
	         	      	                   user_id	: result['data'].id  		? result['data'].id 	: "",
	         							   time		: $filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
	         						});*/
                                	var metadata = {
                                		   email	: 	result['data'].email 	? result['data'].email 	: "",
                    	                   user_id	: 	result['data'].id  		? result['data'].id 	: "",
                    	                   time		:	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                    	                   type		: 	2,
                    	                   link		:	"access/signin"
                        			};
                        			Intercom('trackEvent', 'Login', metadata);
                                }catch(err) {
                    			    console.log(err)
                    			}
                                // Intercom
                               if(result.data.first_order_time == 0 ) {
                            	   if($localStorage['fulfillment'] && $localStorage['fulfillment'] == 1){
                               		state.go('order.create_once_global_bm');
	                               	}else{
	                               		state.go('order.create_once_global_new');
	                               	}
                               }else{
                                    $state.go('order.problem');
                               }                                
                            }else {
                                $state.go('access.signin');
                            }
                        }

                        $scope.loginFBProcesing = false;
                    }).error(function (data, status, headers, config) {
                        //$scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                        $scope.authError = tran('Toaster_LoiServer');
                    });
                }else {
                    //$scope.authError = "Đăng nhập facebook không thành công";
                    $scope.authError = tran('BS_DangNhapFBFail');
                }
            }, function (errr){
                   // $scope.authError = "Đăng nhập facebook không thành công";
                    $scope.authError = tran('BS_DangNhapFBFail');
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
                //scope.authError = 'Kết nối thất bại, vui lòng thử lại';
                scope.authError = tran('Toaster_LoiServer');
                callback(true, null);
            });
            //console.log(scope, $state);
            return;
        },
        
        logout:function(state){
            sessionService.destroy();
            $facebook.clearCache();
            socialLoginService.logout();
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
//.config(function($httpProvider) {
        //Enable cross domain calls
       // $httpProvider.defaults.useXDomain = true;
        //Remove the header used to identify ajax call  that would prevent CORS from working
        
        //$httpProvider.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE';
        
//})
/*.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
   res.header('Access-Control-Allow-Headers', 'Content-Type');
   next();
 })*/
.run(
		[ '$rootScope', '$state', '$http', '$stateParams', 'LogoutRoleNow','$location','$window', '$templateCache', 'loginService','Site_Config', 'sessionService', '$localStorage','$modal', 'Analytics','Base',
  function ($rootScope,  $state,   $http,   $stateParams,   LogoutRoleNow,  $location, $window, $templateCache,   loginService,  Site_Config,   sessionService,  $localStorage,  $modal,   Analytics,  Base) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

      $rootScope.$on('unauthorize', function (){
            sessionService.destroy();
            $state.go('access.signin', {'return_url': window.location.href});
      });        

      $rootScope.$on('error_http', function (event, args){
            Base.send_errors(args.url, args.status, args.response);
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
           //$rootScope.isShipchung = ($location.host() != Site_Config.domain) ? 1: 0;
            if($location.host() == BOXME_DOMAIN){
            	$rootScope.BMasia  = 0;
            	$rootScope.isShipchung = 0;
            }else if (BOXMEASIA_DOMAIN.indexOf($location.host()) >= 0){
            	$rootScope.BMasia  = 1;
            	$rootScope.isShipchung = 0;
            }else{
            	$rootScope.BMasia  = 0;
            	$rootScope.isShipchung =1;
            }
            if($rootScope.userInfo != undefined){
                $http.defaults.headers.common['Authorization']  = $rootScope.userInfo.token;
                $http.defaults.headers.common['LANGUAGE']  = $rootScope.keyLang ? $rootScope.keyLang : "vi";
                $http.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type';
                $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                if($localStorage['currency']){
    				$rootScope.viewCurrency = $localStorage['currency'];
    			}
    			if($localStorage['home_currency']){
    				$rootScope.ViewHomeCurrency = $localStorage['home_currency'];
    			}
    			if($localStorage['exchange_rate']){
    				$rootScope.exchangeRate = $localStorage['exchange_rate'];
    			}
    			
    			if($rootScope.userInfo.email && $rootScope.userInfo.email == LogoutRoleNow.email){
    				if($location.host()){
    					evt.preventDefault();
                        sessionService.destroy();
                        $state.go('access.signin', {'return_url': window.location.href});
    				}
    			}
    			
    			//$state.go('product.list');
    			$rootScope.userFulfillment = $localStorage['fulfillment'] ? true : false;
				
    			
    			Analytics.set('&uid', $rootScope.userInfo.id);
				
				var MemberNoRole = 	['cashin.payment_type',
									'order.warehouse_verify',
									'order.verify',
									'order.transaction',
									'order.invoice',
									'app.dashbroad',
									'product.report',
									'app.config.business',
									'app.config.user',
									'app.config.inventory',
									'app.config.print',
									'app.config.stock',
									'app.config.courier',
									'app.config.shipping',
									'app.config.key',
									'app.config.accounting',
									
									]
				var LeadNoRole = 	['cashin.payment_type',
									'order.warehouse_verify',
									'order.verify',
									'order.transaction',
									'order.invoice',
									'app.config.business',
									'app.config.user',
									'app.config.inventory',
									'app.config.print',
									'app.config.stock',
									'app.config.courier',
									'app.config.shipping',
									'app.config.key',
									'app.config.accounting'
									]
				var AdminNoRole = 	['app.config.accounting']
				$rootScope.userRole = ($localStorage['role'] || $localStorage['role'] == 0) ? $localStorage['role'] : 3;				
                if($rootScope.userRole){
					//console.log(toState.name)
					if ($rootScope.userRole == 3 && MemberNoRole.indexOf(toState.name) >=0){
						 evt.preventDefault();
						$state.go('order.list',{time_start:'7day'});
					}else if($rootScope.userRole == 2 && LeadNoRole.indexOf(toState.name) >=0){
						 evt.preventDefault();
						$state.go('order.list',{time_start:'7day'});
					}else if($rootScope.userRole == 1 && AdminNoRole.indexOf(toState.name) >=0){
						 evt.preventDefault();
						$state.go('order.list',{time_start:'7day'});
					}
				}
			}
               
                
                //console.log(Base64.encode($rootScope.userInfo.token))
                
            var pageNoLogin = 	['access','detail','checkin','access.change_email','access.verify_bank',
                                'access.confirm_email','access.verify_child','invoice']

            if (!toState.name.match(/^access/g) && !toState.name.match(/^detail/g) 
                && !toState.name.match(/^checkin/g) && !toState.name.match(/^invoice/g) && !toState.name.match(/^print_store/g)){
                    if(!loginService.gettimelogged() || (+Date.parse(new Date()) - loginService.gettimelogged() > 21600000)  ){
                        evt.preventDefault();
                        Analytics.set('&uid', 0);
                        sessionService.destroy();
                        $state.go('access.signin', {'return_url': window.location.href});
                    }else{
                        loginService.check_balance();
                    }
                }else 
                    if(!toState.name.match(/^detail/g) && !toState.name.match(/^checkin/g) 
                    && toState.name !== 'access.change_email' && toState.name !== 'access.verify_bank' 
                    && toState.name !== 'invoice'
                    && toState.name !== 'access.confirm_email' && toState.name !== 'access.verify_child'){
                    if(loginService.gettimelogged() && (+Date.parse(new Date()) - loginService.gettimelogged() < 21600000)){
                        evt.preventDefault();
                        $state.go('order.list',{time_start:'7day'});
                        loginService.check_balance();
                    }
                }
        });
    }]
)
// translate config
.config(['$translateProvider', '$locationProvider', function($translateProvider, $locationProvider){
    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('vi');
    $translateProvider.useLocalStorage();
}])

/*.config( function( $analyticsProvider ) {
    $analyticsProvider.virtualPageviews(false);
})*/

.config( function( $facebookProvider, AnalyticsProvider ) {
  $facebookProvider.setAppId(fbdk.appId);
  $facebookProvider.setPermissions(fbdk.permisstions);

    AnalyticsProvider.setAccount([
        { tracker: 'UA-31776960-5', name: "tracker1" , trackEvent: true, trackEcommerce: true},
        { tracker: 'UA-31776960-1', name: "tracker2" , trackEvent: true, trackEcommerce: true},
    ]);

  /*AnalyticsProvider
    .setAccount({
        'UA-31776960-5':  {
            trackEvent: true,
            trackEcommerce: true
        }});*/

    AnalyticsProvider.trackPages(false)
    AnalyticsProvider.logAllCalls(false);
    /*AnalyticsProvider.startOffline(true);*/
    AnalyticsProvider.useAnalytics(true);
    AnalyticsProvider.useECommerce(true, true);
    //AnalyticsProvider.enterDebugMode(false);
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
.config(['$httpProvider', function ($httpProvider){
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
                        localStorage.clear();
                        window.location = "/#/access/signin"
                    }
                }

                return $q.reject(response);
            };
            return function (promise) {
                return promise.then(success, error);
            };
        }];
        $httpProvider.responseInterceptors.push(interceptor);

}])



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
//login gg set client ID
.config(function(socialProvider){
    socialProvider.setGoogleKey("592197925968-okcmgk6h4d0ufdiijj8gu76hsqck3umu.apps.googleusercontent.com");
    //socialProvider.setGoogleKey("457410327335-dnvcn8nclmtp9sbof0kn81d9dkvb1bq3.apps.googleusercontent.com");
})
//end login gg

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
})
.config(function (intlTelInputOptions) {

    angular.extend(intlTelInputOptions, {
      nationalMode: false,
      defaultCountry: 'vn',
      initialCountry: 'vn',
      preferredCountries: ['vn', 'us', 'gb'],
      autoFormat: true,
      autoPlaceholder: true
    });

});