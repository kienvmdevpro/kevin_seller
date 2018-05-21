'use strict';

//Order detail
angular.module('app').controller('DetailCtrl', ['$scope', '$http', '$state', '$stateParams', '$window', 'toaster', 'Order',
 	function($scope, $http, $state, $stateParams, $window, toaster, Order) {
 	  // Config
        if(!$stateParams.code.length){
            $state.go('app.dashboard');
        }
        $scope.pipe_status       = {};
        $scope.pipe_priority     = {};
        $scope.list_group        = {};
        
        $scope.code              = $stateParams.code;
        $scope.list_status       = {};
        $scope.pipe_journey      = [];
        $scope.wating            = true;
        $scope.pipe_limit        = 0;
        $scope.pipe_group        = {};
        $scope.list_status_order = {};
        
        // load order
        Order.Detail($scope.code,'detail').then(function (result) {
            if(!result.error){
                
                if (result.data.data) {
                    $scope.data         = result.data.data;    
                    $scope.list_status  = result.data.status;
                    $scope.pipe_journey = $scope.data.pipe_journey;
                }else {
                    $scope.data = false;
                }
                
                

                /*for (var i = $scope.data.pipe_journey.length - 1; i >= 0; i--) {
                    console.log($scope.data.pipe_journey[i]);
                };*/

                

            }else{
                toaster.pop('warning', 'Thông báo', result.data.message);
            }
            $scope.wating   = false;
        });
      
        $scope.getGroupByPipe = function (pipe){
            for(var property in $scope.pipe_group){
                if($scope.pipe_group[property] && $scope.pipe_group[property].hasOwnProperty(pipe)){
                    return property;
                }
            }
        }

        $scope.displayGroup = function (status){
            var pipe_journeys = $scope.pipe_journey;
            for (var i = pipe_journeys.length - 1; i >= 0; i--) {
                if($scope.getGroupByPipe(pipe_journeys[i].pipe_status) == status){
                    return true;
                }
            };
            return false;
        }

        Order.PipeStatus(null, 1).then(function (result) {
            if(!result.data.error){
                $scope.list_pipe_status      = result.data.data;
                angular.forEach(result.data.data, function(value) {
                    if(value.priority > $scope.pipe_limit){
                        $scope.pipe_limit   = +value.priority;
                    }
                    $scope.pipe_status[value.status]    = value.name;
                    $scope.pipe_priority[value.status]  = value.priority;
                    if(!$scope.pipe_group[value.group_status]){
                        $scope.pipe_group[value.group_status] = {};
                    }
                    $scope.pipe_group[value.group_status][value.status] = value.name;

                });
            }
        });

        Order.ListStatus(4).then(function (result) {
            var tab_status = [];
            if(result.data.list_group){
                angular.forEach(result.data.list_group, function(value) {
                    $scope.list_group[+value.id] = value.name;
                    tab_status.push({id : +value.id, name : value.name});
                    if(value.group_order_status){
                        angular.forEach(value.group_order_status, function(v) {
                            $scope.list_status_order[+v.order_status_code]    = v.group_status;
                        });
                    }
                });
                $scope.tab_status   = tab_status;
            }
        });

        
 	  // Action
}]);
