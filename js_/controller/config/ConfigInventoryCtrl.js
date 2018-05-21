'use strict';

//Config Stock
angular.module('app').controller('ConfigInventoryCtrl', ['$scope', '$state', '$http', '$window','toaster', 'bootbox', 'Inventory', 'Location',
 	function($scope, $state, $http, $window,toaster, bootbox, Inventory, Location) {
        
        /**
         *   config
         **/
        
        $scope.fsubmit          = false;
        $scope.list_warehouse   = [];
        $scope.list_city        = {};
        $scope.list_district    = {};
        $scope.list_ward        = {};
        
        /**
         *   get data
         **/
         
         // get list Inventory
         $scope.getInventory = function(){
            Inventory.load().then(function (result) {
                if(!result.data.error && result.data.data.length > 0){

                    $scope.list_warehouse   = result.data.data;
                    angular.forEach($scope.list_warehouse, function (value, key){

                        var phone = value.phone.split(',');
                        $scope.list_warehouse[key].phone = [];
                        angular.forEach(phone, function (v, k){
                            
                            $scope.list_warehouse[key].phone.push(v);
                        })
                    })

                }else{
                    $scope.list_warehouse   = [{active:1}];
                }
            });
            return;
        }
        
        // get list city
        
        Location.province('all').then(function (result) {
            if(!result.data.error){
                $scope.list_city        = result.data.data;
                $scope.getInventory();
            }
        });

        // save inventory
        $scope.saveInventory    = function(data,index){
            var data_frm = {},
                phone    = [];



            angular.forEach(data.phone, function(value, key) {
                phone.push(value.text);
            });

            if(data.id > 0){
                data_frm = {
                    name        : data.name,
                    user_name   : data.user_name,
                    phone       : phone.join(','),
                    active      : data.active,
                    delete      : data.delete,
                    id          : data.id
                }
            }else{
                data_frm = angular.copy(data);
                data_frm.phone  = phone.join(',');
            }

            Inventory.create(data_frm).then(function (result) {
                if(!result.data.error){
                    $scope.list_warehouse[0]['id']  = +result.data.data;
                    if(data.delete  == 1){
                        $scope.list_warehouse[index]['delete']  == 1;
                    }
                }else{
                    if(data.delete  == 1){
                        $scope.list_warehouse[index]['delete']  == 0;
                    }


                }
                $scope.fsubmit  = false;
            });
        }

        // save inventory
        $scope.removeInventory    = function(data,index){
            data.delete  = 1;
            $scope.saveInventory(data,index);
        }
        
        // Add 
        $scope.addInventory = function () {
            $scope.list_warehouse.unshift ({active:1,check:1});
        };

        $scope.onTourEnd = function(){
            $state.go('app.config.accounting');
        }
}]);
