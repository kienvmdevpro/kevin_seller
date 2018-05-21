'use strict';

angular.module('app').controller('UploadExcelCtrl', ['$scope', '$state', '$stateParams', 'editableThemes', 'FileUploader', 'toaster', 'Api_Path', 'Config_Status', 'Order', 'Location',
 	function($scope, $state, $stateParams, editableThemes, FileUploader, toaster, Api_Path, Config_Status, Order, Location) {
    /*
        Config
    */
        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';

        $scope.currentPage          = 1;
        $scope.item_page            = 50;
        $scope.maxSize              = 5;
        $scope.dynamic              = 0;
        $scope.totalItems           = 0;
        $scope.waiting              = true;
        $scope.list_district        = {};
        $scope.tab                  = 'ALL';
        $scope.total_not_active     = 0;
        $scope.waiting              = false;
        $scope.list_status          = Config_Status.ExcelOrder;

        // upload  excel
        var uploader = $scope.uploader = new FileUploader({
            url                 : Api_Path.Order+'/upload?domain=lamido',
            removeAfterUpload   : true
        });

        uploader.onProgressAll  = function(progress){
            $scope.waiting  = true;
        }

        // FILTERS
        /*uploader.filters.push({
            name: 'excelFilter',
            fn: function(item , options) {
                $scope.waiting              = false;
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1;
            }
        });*/

        uploader.onSuccessItem = function(item, result, status, headers){
            $scope.waiting              = false;
            if(!result.error){
                toaster.pop('success', 'Thông báo', 'Upload Thành công!');
                $state.go('order.upload',{id:result.id});
            }
            else{
                toaster.pop('warning', 'Thông báo', 'Upload Thất bại!');
            }
        };

        uploader.onErrorItem  = function(item, result, status, headers){
            $scope.waiting              = false;
            toaster.pop('warning', 'Thông báo', "Kết nối dữ liệu thất bại !");
        };
    /*
        End Config
     */

    /*
        Action
     */
        $scope.$watch($stateParams,function(){
            if($stateParams.id != '' && $stateParams.id != undefined){
                $scope.refresh_data();
                $scope.load(1,'ALL');
            }

        });

        if($stateParams.id != '' && $stateParams.id != undefined){
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
        }

        $scope.load = function(page, status){
            $scope.tab              = status;
            $scope.currentPage      = page;
            $scope.waiting          = true;
            $scope.refresh_data();

            Order.ListExcel($stateParams.id, $scope.currentPage, status).then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    $scope.totalItems       = result.data.total;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                    $scope.total_not_active = result.data.total_not_active;
                }
                $scope.waiting              = false;
            });
        }


        $scope.refresh_data    = function(){
            $scope.list_data    = {};
        }

        /**
         * Change
         */
        $scope.change   = function(key, oldval, val, field){
            if(val == undefined || val == ''){
                return 'Dữ liệu trống';
            }

            if(oldval != val){
                var data = {};
                data[field] = val;
                return Order.ChangeExcel(data,key).then(function (result) {
                    if(result.data.error){
                        return 'Cập nhật lỗi';
                    }else{
                        if(field == 'to_city'){
                            $scope.list_data[key].city_name = result.data.city_name;
                            $scope.list_data[key].to_district   = 0;
                            $scope.list_data[key].district_name = '';
                        }else if(field == 'to_district'){
                            $scope.list_data[key].district_name = result.data.district_name;
                        }else if(field == 'active'){
                            $scope.list_data[key].active = val;
                            $scope.list_data[key].status = 'CANCEL';
                        }

                        return true;
                    }
                });
            }
            return true;
        }

        $scope.create = function(key){
            Order.CreateExcelLamido(key).then(function(result){
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
            });
        }

        $scope.create_multi = function(){
            $scope.create_all    = true;
            Order.CreateExcelMulti($stateParams.id).then(function(result){
                if(result.data.count > 0){
                    $scope.dynamic  = (($scope.totalItems - result.data.count)*100/$scope.totalItems).toFixed(2);
                    $scope.create_multi();
                }else{
                    $scope.create_all    = false;
                    $scope.dynamic       = 100;
                    toaster.pop('success', 'Thông báo', 'Kết thúc !');
                    $scope.load(1,'ALL');
                }
            });
        }

    }
]);
