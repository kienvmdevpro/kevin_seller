'use strict';

//Config Bussiness
angular.module('app').controller('ConfigBusinessCtrl', ['$scope', '$modal', '$http', '$state', '$window', 'toaster', 'Bussiness', 'Location',
 	function($scope, $modal, $http, $state, $window, toaster, Bussiness, Location) {
        
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
            return;
        }
        
        $scope.onTourEnd = function(){
            $state.go('app.config.inventory');
        }
}]);
