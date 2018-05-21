'use strict';

//Api Key
angular.module('app').controller('ApiKeyCtrl', ['$scope', '$http', '$state', '$window', 'toaster', 'User',
 	function($scope, $http, $state, $window, toaster, User) {
    // config
    $scope.list_data    = {};
    $scope.wating       = true;

    // get key
        User.load_key().then(function (result) {
            if(!result.error){
                $scope.list_data     = result.data.data;
            }
            $scope.wating       = false;
        });
        
    //action
    
        $scope.add_key  = function(){
            User.create_key().then(function (result) {
                if(!result.error){
                    $scope.list_data.unshift(result.data.data);
                }
            });
            return;
        }
    
        $scope.edit_key    = function(item){
            var data = {'active': item.active}
            User.edit_key(data,item.id);
            return;
        }
        
        $scope.onTourEnd = function(){
            $state.go('app.config.user');
        }
    }
    
    
]);
