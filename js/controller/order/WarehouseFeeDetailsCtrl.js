'use strict';

//Provider report
angular.module('app').controller('WarehouseFeeDetailsCtrl', ['$scope', '$filter', 'Verify', '$stateParams',
    function($scope, $filter, Verify, $stateParams) {
        $scope.id = $stateParams.id;
        $scope.detail = {};
        $scope.detail_sku = {};
        $scope.waiting = true;
        $scope.check_detail_of_day = 0;

        Verify.WarehouseFeeDetails($scope.id).then(function(result) {
            if (!result.data.error) {
                $scope.waiting = false;
                $scope.data = result.data.data;
                $scope.detail = result.data.detail;
                $scope.detail_sku = result.data.detail_sku;
                $scope.data_of_day_for_type = result.data.dataofdayfortype;
                $scope.standar = result.data.standar;
            }
        });


        $scope.detail_of_day = function(time_create,data_of_day_for_type,standar){
            $scope.time_create = time_create;
            $scope.check_detail_of_day = 1;
            $scope.data_detail_of_day_for_type = data_of_day_for_type[time_create];
            var array = $.map($scope.data_detail_of_day_for_type, function(value, index) {
                return [value];
            });
            $scope.total_floor = 0;
            $scope.total_item = 0;
            $scope.total_sku = 0;
            array.forEach(function(item){
                $scope.total_sku += parseInt(item.total_sku);
                $scope.total_item += parseInt(item.total_item);
                $scope.total_floor += parseInt($filter('comparefloor')($filter('roundup')(item.total_item / $scope.standar[item.type_sku].standard_item)+'-'+$filter('roundup')(item.total_sku / $scope.standar[item.type_sku].standard_sku)));
            });

        }

        $scope.return_detail = function(){
            $scope.check_detail_of_day = 0;
        }


        $scope.__export_detail_sku = function(data, data2) {
            
            var html =
                "<meta http-equiv='content-type' content='application/vnd.ms-excel; charset=UTF-8'><table width='100%' border='1'>" +
                "<thead><tr>" +
                "<td style='border-style:none'></td>" +
                "<td style='border-style:none'></td>" +
                "<td colspan='3' style='font-size: 18px; border-style:none '><strong>Chi tiết theo sku bảng kê "+$scope.id +" </strong></td></tr>" +
                "<tr></tr>" +
                "<tr style='font-size: 14px; background: #6b94b3'>" +
                "<th rowspan='2'>STT</th>" +
                "<th rowspan='2'>Mã BK</th>" +
                "<th colspan='3'>Khách hàng</th>" +
                "<th rowspan='2'>Thời gian</th>" +
                "<th rowspan='2'>Kho</th>" +
                "<th rowspan='2'>Loại sản phẩm</th>" +
                "<th rowspan='2'>Sku</th>" +
                "<th rowspan='2'>Item</th>" +
                "</tr>" +
                "<tr style='font-size: 14px; background: #6b94b3'>" +
                "<td>Họ tên</td>" +
                "<td>Email</td>" +
                "<td>SĐT</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

            var i = 1;

            angular.forEach(data, function(value) {
                var create_start ;
                date = new Date(value.time_create * 1000);
                create_start = (date.getMonth() + 1) + '/' +  date.getDate() + '/'  +  date.getFullYear();
                html += "<tr>" +
                    "<td>" + i++ + "</td>" +
                    "<td>" + value.log_id + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.fullname : '') + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.email : '') + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.phone : '') + "</td>" +
                    
                    "<td>" + create_start + "</td>" +
                    "<td>" + (($scope.warehouse_warehouse[value.warehouse] != undefined) ? $scope.warehouse_warehouse[value.warehouse]['name'] : '') + "</td>" +
                    "<td>" + $filter('uppercase')(value.type_sku) + "</td>" +
                    "<td>" + value.sku + "</td>" +
                    "<td>" + $filter('number')(value.total_item, 0) + "</td></tr>";
            });

            html += "</tbody></table>";
            var blob = new Blob([html], {
                type: "application/vnd.ms-excel;charset=utf-8"
            });
            saveAs(blob, "Danh_sach_chi_tiet_theo_sku.xls");
        }

        $scope.__export_detail = function(data, data2) {
            var html =
                "<meta http-equiv='content-type' content='application/vnd.ms-excel; charset=UTF-8'><table width='100%' border='1'>" +
                "<thead><tr>" +
                "<td style='border-style:none'></td>" +
                "<td style='border-style:none'></td>" +
                "<td colspan='3' style='font-size: 18px; border-style:none '><strong>Chi tiết theo loại sản phẩm "+$scope.id +" </strong></td></tr>" +
                "<tr></tr>" +
                "<tr style='font-size: 14px; background: #6b94b3'>" +
                "<th rowspan='2'>STT</th>" +
                "<th rowspan='2'>Mã BK</th>" +
                "<th colspan='3'>Khách hàng</th>" +
                "<th rowspan='2'>Thời gian</th>" +
                "<th rowspan='2'>Mã kho</th>" +
                "<th rowspan='2'>Loại sản phẩm</th>" +
                "<th colspan='3'>Chi tiết</th>" +
                "<th colspan='2'>Tiêu chuẩn</th>" +
                "<th colspan='2'>Chi phí - Khách hàng</th>" +
                "<th colspan='2'>Chi phí - Đối tác</th>" +
                "</tr>" +
                "<tr style='font-size: 14px; background: #6b94b3'>" +
                "<td>Họ tên</td>" +
                "<td>Email</td>" +
                "<td>SĐT</td>" +
                "<td>Item</td>" +
                "<td>Sku</td>" +
                "<td>Floor</td>" +

                "<td>Item</td>" +
                "<td>Sku</td>" +

                "<td>Phí</td>" +
                "<td>Miễn phí</td>" +

                "<td>Phí</td>" +
                "<td>Miễn phí</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

            var i = 1;

            angular.forEach(data, function(value) {
                html += "<tr>" +
                    "<td>" + i++ + "</td>" +
                    "<td>" + value.log_id + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.fullname : '') + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.email : '') + "</td>" +
                    "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.phone : '') + "</td>" +
                    "<td>" + data2[Object.keys(data2)[0]].date + "</td>" +
                    "<td>" + value.warehouse + "</td>" +

                    "<td>" + $filter('uppercase')(value.type_sku) + "</td>" +

                    "<td>" + $filter('number')(value.total_item, 0) + "</td>" +
                    "<td>" + $filter('number')(value.total_sku, 0) + "</td>" +
                    "<td>" + $filter('number')(value.floor, 0) + "</td>" +

                    "<td>" + $filter('number')(value.standard_item, 0) + "</td>" +
                    "<td>" + $filter('number')(value.standard_sku, 0) + "</td>" +

                    "<td>" + $filter('number')(value.fee, 0) + "</td>" +
                    "<td>" + $filter('number')(value.discount_fee, 0) + "</td>" +

                    "<td>" + $filter('number')(value.partner_fee, 0) + "</td>" +
                    "<td>" + $filter('number')(value.partner_discount_fee, 0) + "</td></tr>";
            });

            html += "</tbody></table>";
            var blob = new Blob([html], {
                type: "application/vnd.ms-excel;charset=utf-8"
            });
            saveAs(blob, "Danh_sach_chi_tiet_theo_loai_san_pham.xls");
        }

        $scope.exportExcelDetail = function() {
            $scope.waiting_export = true;
            
            Verify.WarehouseFeeDetails(1, {log_id : $scope.id}, 'export').then(function(result) {
                if (!result.data.error) {
                   
                    $scope.__export_detail(result.data.data_detail, result.data.data);
                    $scope.__export_detail_sku(result.data.data_sku, result.data.data);
                }
            }).finally(function() {
                $scope.waiting_export = false;
            });
        }
    }
]);