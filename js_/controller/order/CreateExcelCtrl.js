'use strict';

//List Order
angular.module('app').controller('CreateExcelCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Order', 'Location', 'OrderStatus', 'Inventory', 'Config_Status','$timeout', 'Analytics',
 	function($scope, $http, $state, $window, $stateParams, toaster, Order, Location, OrderStatus, Inventory, Config_Status, $timeout, Analytics) {
        // Config
        if(!$stateParams.id.length){
            $state.go('app.dashboard');
        }

        Analytics.trackPage('/create_order/file/step3');

        $scope.list_data        = {};
        $scope.list_city        = {};
        $scope.list_inventory   = {};  // kho hàng
        $scope.Inventory        = {};
        $scope.list_district    = {};
        $scope.check_box        = [];

        $scope.list_status      = Config_Status.ExcelOrder;
        $scope.service          = OrderStatus.service;
        $scope.list_service     = OrderStatus.list_service;
        $scope.pay_pvc          = OrderStatus.pay_pvc;
        $scope.list_pay_pvc     = OrderStatus.list_pay_pvc;

        $scope.create_all       = false;
        $scope.total            = '';
        $scope.max              = 0;
        $scope.dynamic          = 0;
        
        $scope.checkingALL = 1;
        // Get Data
            // List order
            Order.ListExcel($stateParams.id,1,'ALL').then(function (result) {
                $scope.list_data     = result.data.data;
                $scope.total         = result.data.total;
                $scope.toggleSelectionAll(1);
            });
            
            // Checkbox
            $scope.toggleSelection = function(id) {
            var data = angular.copy($scope.check_box);
            var idx = +data.indexOf(id);
             
                if (idx > -1) {
                    $scope.check_box.splice(idx, 1);
                }
                else {
                    $scope.check_box.push(id);
                }
            };
            
            $scope.check_list = function(id,action){
                var data = angular.copy($scope.check_box);
                var idx = +data.indexOf(id);
                
                if (idx > -1) {
                    if(action == 'delete'){
                        delete  $scope.check_box[idx];
                    }
                    return true;
                }
                else {
                    return false;
                }
                
            }
            
            $scope.toggleSelectionAll = function (check){
                var check_box = $scope.check_box;
                if(check == 0){
                    $scope.check_box        = [];
                }else{
                    $scope.check_box        = [];
                    angular.forEach($scope.list_data, function(value, key) {
                        if(value.active == 0){
                            $scope.check_box.push(key);
                        }
                    });
                }


            }
            
            $scope.$watchCollection('check_box', function(newdata, olddata) {
                $scope.max  = newdata.length;
            });
            
            Inventory.load().then(function (result) { // inventory
                if(result.data.data){
                    $scope.list_inventory           = result.data.data;
                    $scope.Inventory                = $scope.list_inventory[0];
                }
            });
        
            // get list city
            Location.province('all').then(function (result) {
                $scope.list_city        = result.data.data;
                angular.forEach($scope.list_city, function(value) {
                  $scope.list_district[value.id]    = {};
                });
            });
            
        // Action
        
        $scope.loadDistrict = function (city_id){
            if(city_id > 0 && !$scope.list_district[city_id][0]){
                Location.district(city_id,'all').then(function (result) {
                    if(result){
                        if(!result.data.error){
                            $scope.list_district[city_id]   = result.data.data;
                        }
                    }
                    return; 
                });
            }
            return;
        }
        
        $scope.change_city  = function(id,item){
            item.to_city                            = id;
            $scope.loadDistrict(id);
        }
        
        $scope.save = function(data,item,key){
             data.checking = item.checking;
             
             Order.ChangeExcel(data ,key).then(function (result) {
                $scope.list_data[key].city_name      = result.data.city_name;
                $scope.list_data[key].district_name  = result.data.district_name;
            });
        }
        
        $scope.checkdata = function(data) {
            if (data == '' || data == undefined) {
              return "Dữ liệu trống";
            }
        };

        $scope.check_district   = function(data,city_id){
            if (data == '' || data == undefined || data == 0) {
                return "Bạn chưa chọn quận huyện !";
            }

            if(!checkDistrictInCity(data,city_id)){
                return "Bạn chưa chọn quận huyện !";
            }
            return ;
        }

        var checkDistrictInCity = function(district_id,city_id){
            if($scope.list_district[city_id]){
                var check = false;
                angular.forEach($scope.list_district[city_id], function(value) {
                    if(value.id == district_id){
                        check = true;
                        return;
                    }
                });
                return check;
            }else{
                return true;
            }

        }
        
        $scope.remove  = function(key){
             Order.RemoveExcel(key).then(function (result) {
                if (!result.data.error) {
                    delete $scope.list_data[key];
                }
            });
        }

        $scope.toggleChecking = function (status){
            $scope.checkingALL = status;
            angular.forEach($scope.list_data, function (value, key){
                value.checking = parseInt(status);
            })
        }
        
        $scope.create = function(key){
            var stock_id = $scope.Inventory.id; 
            
            if(stock_id > 0){
                Order.CreateExcel(key, stock_id, null).then(function(result){
                        if(!result.data.error){
                            $scope.list_data[key]['trackingcode']  = result.data.data;
                            $scope.list_data[key]['active']        = 1;
                            $scope.list_data[key]['status']        = 'SUCCESS';
                        }else{
                            if(result.data.code == 1){
                                $scope.list_data[key]['active']        = 2;
                                $scope.list_data[key]['status']        = 'FAIL';
                            }
                        }
                        
                        if(result.data.total){
                            $scope.total    = result.data.total;
                        }
                        
                        $scope.check_list(key,'delete');
                });
            }else{
                toaster.pop('danger', 'Thông báo', 'Hãy chọn kho hàng !');
            }
            return;
        }
        
        // create multi
       $scope.action_create = function(data){
        if(data.length > 0){
            $scope.create_all   = true;
            $scope.create_multi(data,0);
        }   
        return;
       }
       
       $scope.create_multi = function (data,num){
        $scope.dynamic  = num;
        var stock_id = $scope.Inventory.id; 
            if(data[num] && data[num].length > 0){
                Order.CreateExcel(data[num], stock_id, $scope.checkingALL).then(function(result){
                    if(!result.data.error){
                        $scope.list_data[data[num]]['trackingcode']  = result.data.data;
                        $scope.list_data[data[num]]['active']        = 1;
                        $scope.list_data[data[num]]['status']        = 'SUCCESS';
                    }else{
                        $scope.list_data[data[num]]['active']        = 2;
                        $scope.list_data[data[num]]['status']        = 'FAIL';
                    }

                    if(result.data.total || result.data.total == 0){
                       $scope.total =  result.data.total;
                    }

                    $scope.create_multi(data,+num+1);
                });
            }else{
               $scope.create_all    = false;
               $scope.check_box     = [];
               toaster.pop('success', 'Thông báo', 'Kết thúc !'); 
            }
        }
        
}]);