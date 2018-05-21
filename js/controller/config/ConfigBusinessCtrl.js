'use strict';

//Config Bussiness
angular.module('app').controller('ConfigBusinessCtrl', 
		   ['$scope','$rootScope', '$modal', '$http','$filter', '$state', '$window', 'toaster', 'Bussiness', 'Location',
 	function($scope,  $rootScope,   $modal,   $http,  $filter,   $state,   $window,   toaster,   Bussiness,   Location) {
        
        /**
         *   config
         **/
        
        $scope.business     = {city_id: 0};
        $scope.list_city    = {};
        $scope.list_district= {};    
        $scope.fsubmit      = false;
        
        /**
         *   get data
         **/
        
        // get business info
        Bussiness.load().then(function (result) {
            if(result.data.data){
                $scope.business        = result.data.data;
            }
            
            $scope.get_list_city();  
        });
        
        // get list city
        $scope.get_list_city = function(){
            Location.province('all').then(function (result) {
                if(!result.data.error){
                    $scope.list_city     = result.data.data;
                }
            });
            
            return;
        }
        
        /**
         *  Action
         **/
        
        $scope.save = function(){
            var data                    = angular.copy($scope.business);
            $scope.fsubmit  = true;
            
            Bussiness.create(data).then(function (result) {
                $scope.fsubmit  = false;
            });
            // Intercom   
            try {
            	var metadata = {
              		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
              		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
              		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm')
         		};
    			Intercom('trackEvent', 'Config Bussiness', metadata);
            }catch(err) {
			    console.log(err)
			}
            // Intercom
            return;
        }
        
        $scope.onTourEnd = function(){
            $state.go('app.config.inventory');
        }
}]);
