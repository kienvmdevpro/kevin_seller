'use strict';

//Config Account
angular.module('app').controller('ConfigAccountCtrl', ['$scope',  '$rootScope', '$modal', '$http', '$state', '$window', 'bootbox', 'User', 'Location', 'UserInfo', '$facebook', 'toaster', 
 	function($scope, $rootScope, $modal, $http, $state, $window, bootbox, User, Location, UserInfo, $facebook, toaster) {
 	  // user info
      // config
      $scope.user       = {city_id: 0};
      $scope.user.notice_type = {};
      var root_user     = {};
      $scope.list_city  = {};
      $scope.city       = {};
      $scope.fsubmit    = false;
      var city          = [];
      $scope.tour       = {};
      $scope.integrationLoading = false;

      $scope.product_trading_type = {};
      $scope.product_trading = {};

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



    // get list user
    User.load().then(function (result) {
        if(!result.data.error){
            angular.extend($scope.user, result.data.data);
            root_user       = angular.copy($scope.user);
        }
    });
    
    UserInfo.load().then(function (result) {
        if(!result.data.error){
            $scope.user_info = result.data.data;

            /*var _type_notice = $scope.user_info.type_notice.split(',');
            angular.forEach(_type_notice, function (value, key){
                $scope.user.notice_type[value] = true;
            })
            $scope.user['email_notice'] = $scope.user_info['email_notice'];
            $scope.user['phone_notice'] = $scope.user_info['phone_notice'];*/

            if($scope.user_info.active == 0){
                //$scope.test();
            }
        }
    });
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

                if(value.transport_id == 1 ){// sms
                    $scope.user.notice_type['sms']  = !!value.active;
                    $scope.user['phone_notice']     = value.received;
                }
            })
        }
    })

    
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
    
    // get list city
    Location.province('all').then(function (result) {
        if(!result.data.error){
            $scope.list_city     = result.data.data;
        }
    });
    
    $scope.isUnchanged = function() {
      return angular.equals($scope.user, root_user);
    };
    
    // Save
    
    
    $scope.save = function(){
        $scope.fsubmit  = true;

        User.edit($scope.user).then(function (result) {
            $scope.fsubmit  = false;
        });
        return;
    }
    
    $scope.onTourEnd = function(){
        $state.go('app.config.business');
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
                toaster.pop('warning', 'Thông báo', result.error_message);
            }else {
                $scope.user['integration']  = {};
                $scope.user.notice_type['facebook'] = false;
                $scope.user['profile_id']   = 0;
                $facebook.logout();
                toaster.pop('success', 'Thông báo', result.error_message);
            }
        }).error(function (data, status, headers, config) {
            toaster.pop('warning', 'Thông báo', 'Kết nối thất bại, vui lòng thử lại');
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
                        toaster.pop('warning', 'Thông báo', result.error_message);
                      }else {
                        $scope.user['integration']  = result.data;
                        $scope.user['profile_id']   = result.data['profile_id'];
                        toaster.pop('success', 'Thông báo', result.error_message);
                      }
                    }).error(function (data, status, headers, config) {
                         $scope.integrationLoading = false;
                        toaster.pop('warning', 'Thông báo', 'Kết nối thất bại, vui lòng thử lại');
                    });
              }else {
                    // Nếu chưa có session thì tiến hành login;
                  $facebook.login().then(function (resp){
                        $scope.fbIntergation();
                  }, function (errr){
                        toaster.pop('warning', 'Thông báo', 'Liên kết facebook không thành công');
                  })
              }
        },
        function (err){
            toaster.pop('warning', 'Thông báo', 'Liên kết facebook không thành công');
        })
    }
    


    
}]);

angular.module('app').controller('ModalBonusCtrl', ['$scope', '$modalInstance', '$http', 'toaster', 'bootbox', 'items',
function($scope, $modalInstance, $http, toaster, bootbox, items) {
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