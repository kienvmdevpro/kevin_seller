'use strict';

angular.module('app').controller('ConfigCourierCtrl', ['$scope', '$modal', '$http', '$state', 'Config',
    function($scope, $modal, $http, $state, Config) {
        $scope.type_config      = {};
        $scope.config_courier   = {};

        $scope.priority         = {};
        $scope.courier_ranger   = {};

        $scope.type_select      = [
            {value : 4, text : 'Luôn luôn ưu tiên'},
            {value : 3, text : 'Ưu tiên'},
            {value : 2, text : 'Bình thường'},
            {value : 0, text : 'Không sử dụng'}
        ];

        Config.type_config_courier().then(function (result) {
            if(!result.data.error){
                $scope.type_config  = result.data.data;
                angular.forEach($scope.list_courier, function(value, key) {
                    $scope.priority[value.id]           = "";
                    angular.forEach($scope.type_config, function(val, k) {
                        if($scope.config_courier[value.id]  == undefined){
                            $scope.config_courier[value.id] = [];
                        }
                        $scope.config_courier[value.id][val.id] = 0;

                        if($scope.courier_ranger[value.id] == undefined){
                            $scope.courier_ranger[value.id] = {};
                        }

                        if($scope.courier_ranger[value.id][val.id] == undefined){
                            $scope.courier_ranger[value.id][val.id] = {};
                        }

                        $scope.courier_ranger[value.id][val.id]['min']    = 0;
                        $scope.courier_ranger[value.id][val.id]['max']    = 100000000;
                    });
                });
                $scope.load();
            }
        });

        $scope.load     = function(){
            Config.load().then(function (result) {
                if(!result.data.error){
                    angular.forEach(result.data.data, function(value, key) {
                        if(value.priority == 1) value.priority = 2;
                        if(value.priority == 5) value.priority = 4;

                        $scope.priority[value.courier_id]   = 1*value.priority;
                        $scope.config_courier[value.courier_id][value.config_type]          = 1*value.active;
                        $scope.courier_ranger[value.courier_id][value.config_type]['min']   = 1*value.amount_start;
                        $scope.courier_ranger[value.courier_id][value.config_type]['max']   = 1*value.amount_end;
                    });
                }
            });
        }

         $scope.save    = function(courier, type, active){
             var priority   = 0;

             if($scope.priority[courier] != undefined && $scope.priority[courier] > 0){
                 priority   = $scope.priority[courier];
             }

             Config.active({'courier_id' : courier,'config_type' : type,'priority' : priority,'active' : active});
         }

        $scope.change_priority = function(courier, priority){
            Config.priority({'courier_id' : courier, 'priority' : priority}).then(function (result) {
                if(result.data.error){
                    priority = 0;
                }
            });
        }

        $scope.change   = function (courier, type_config, value, type){
            if($scope.courier_ranger[courier][type_config][type] != value){
                if((type == 'min' &&  $scope.courier_ranger[courier][type_config]['min'] >= value) || (type == 'max' && $scope.courier_ranger[courier][type_config]['max'] <= value)){
                    return 'Giá trị không hợp lệ';
                }

                var data = {'courier_id' : courier,'config_type' : type_config};
                if(type == 'max')       data['amount_end']      = value;
                if(type == 'min')       data['amount_start']    = value;

                return Config.active(data).then(function (result) {
                    if(result.data.error){
                        return result.data.error_message;
                    }
                });
            }
            return;
        }
}]);
