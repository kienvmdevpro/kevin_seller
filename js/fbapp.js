var app = angular.module('fbapp', ['ngFacebook', 'ngStorage']);
    //var ApiPath   = '/boxme/api/public/api/v1/';
    app.config( function( $facebookProvider ) {
      $facebookProvider.setAppId(fbdk.appId);
      $facebookProvider.setPermissions(fbdk.permisstions);

    });
    app.factory('sessionService', ['$http', '$localStorage', function($http, $localStorage){
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
    app.run( function( $rootScope ) {
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
    });

    app.controller('MainCtrl', ['$rootScope', '$scope', '$location', '$facebook', 'sessionService', '$http', '$window', '$timeout',
      function ($rootScope, $scope, $location, $facebook, sessionService, $http, $window, $timeout){
        
        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec($window.location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        function Routing(){
            var ref = getParameterByName('fb_ref');
            switch (ref){
                case 'overweight':
                    window.location = '/boxme/sellercentral/#/order/process/';
                break;
                default: 
                    window.location = '/boxme/sellercentral/';
                break;
            }
        }

        
        
        $scope.checklogin = function (resp){
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
                    
                    sessionService.set(result['data']);
                    $timeout(function (){
                        Routing();
                    }, 101);
                }

                $scope.loginFBProcesing = false;
            }).error(function (data, status, headers, config) {
                $scope.authError = 'Kết nối thất bại, vui lòng thử lại';
            });
        }

        $rootScope.$on('fb.auth.authResponseChange', function (evt, resp){
        // Kiểm tra session login 
            if(resp.status == 'connected'){
                // Gủi request lên server lấy thông tin user 
                $scope.checklogin(resp);
            }else {
                // Nếu chưa có session thì tiến hành login;
              $facebook.login().then(function (resp){
                    $scope.checklogin(resp);
              }, function (errr){
                    $scope.authError = "Đăng nhập facebook không thành công";
              })
            }
      })
        
    }])