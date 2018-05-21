'use strict';

//Provider report
angular.module('app').controller('WarehouseFeeCtrl', ['$scope', '$filter', 'Verify', '$state', '$stateParams' , 'Base',
    function($scope, $filter, Verify, $state, $stateParams,Base) {

        $scope.currentPage = 1;
        $scope.item_page = 20;
        $scope.maxSize = 5;
        $scope.item_stt = 0;


        $scope.time = { create_start: new Date(date.getFullYear(), date.getMonth(), 1) };
        $scope.frm = {};


        $scope.list_data = {};
        $scope.waiting = false;
        $scope.waiting_detail   = true;

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.list_config = {
            1: 'Theo pallet',
            2: 'Theo khoang'
        };

        $scope.list_status = {
            PROCESSING : 'Đang xử lý',
            SUCCESS : 'Thành công'
        };

        $scope.warehouse = {};
        Base.WareHouse().then(function(result) {
            if (!result.data.error) {
                $scope.warehouse_warehouse = result.data.data;
            }
        });

        $scope.open = function($event, type) {
            $event.preventDefault();
            $event.stopPropagation();
            if (type == "create_start") {
                $scope.create_start_open = true;
            } else if (type == "create_end") {
                $scope.create_end_open = true;
            }
        };

        // $scope.view_detail = function(id, date) {
        //     $state.go('app.warehouse.detail_warehouse', { 'id': id, 'date': date });
        // }

        $scope.show_detail = function(item){
            item.waiting_detail   = true;
            if(item.id > 0){
                if((!item.data || !item.data.length) && !item.show){
                    Verify.WarehouseFeeDetails(item.id).then(function (result) {
                        if(!result.data.error){
                            item.data         = result.data.data;
                            item.detail       = result.data.detail;
                            item.detail_sku   = result.data.detail_sku;
                            item.data_of_day_for_type = result.data.dataofdayfortype;
                            item.standar = result.data.standar;
                        }
                        item.waiting_detail       = false;
                    });
                }else{
                    item.waiting_detail       = false;
                }
                
                item.show           = !item.show;
                return;
            }
        }

      
        $scope.detail_of_day = function(item2,data_of_day_for_type,standar){
            item2.show_in_day           = !item2.show_in_day;
            item2.data_detail_of_day_for_type = data_of_day_for_type[item2.time_create];
            
        }




        $scope.refresh = function(cmd) {
            if ($scope.time.create_start != undefined && $scope.time.create_start != '') {
                $scope.frm.create_start = +Date.parse($scope.time.create_start) / 1000;
            } else {
                $scope.frm.create_start = '';
            }

            if ($scope.time.create_end != undefined && $scope.time.create_end != '') {
                $scope.frm.create_end = +Date.parse($scope.time.create_end) / 1000 + 86399;
            } else {
                $scope.frm.create_end = 0;
            }

            if (cmd != 'export') {
                $scope.list_data = [];
                $scope.waiting = true;
            }

        }

        $scope.setPage = function() {
            $scope.refresh('');
            Verify.WarehouseFee($scope.currentPage, $scope.frm, '').then(function(result) {
                if (result) {
                    $scope.list_data = result.data.data;
                    $scope.data_total = result.data.data_total;
                    $scope.totalItems = result.data.total;
                    $scope.item_stt = $scope.item_page * ($scope.currentPage - 1);
                }
                $scope.waiting = false;
            });
            return;
        }

        if ($stateParams.email) {
            $scope.frm.keyword = $stateParams.email;
            $scope.setPage();
        }


        $scope.__export_detail_sku = function(data, data2, distanceTime , id) {
            var string = '';
            if(id){
                string = "bảng kê "+id ;
            }else{
                string = "( " + distanceTime +" )";
            }
            var html =
                "<meta http-equiv='content-type' content='application/vnd.ms-excel; charset=UTF-8'><table width='100%' border='1'>" +
                "<thead><tr>" +
                "<td style='border-style:none'></td>" +
                "<td style='border-style:none'></td>" +
                "<td colspan='3' style='font-size: 18px; border-style:none '><strong>Chi tiết theo sku "+string+"</strong></td></tr>" +
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
                    "<td>" + value.log_id + "</td>" ;
                    if(id){
                        html +=
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.fullname : '') + "</td>" +
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.email : '') + "</td>" +
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.phone : '') + "</td>" ;
                    }else{
                        html +=
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.fullname : '') + "</td>" +
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.email : '') + "</td>" +
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.phone : '') + "</td>" ;
                    }
                    
                    html +=
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
            var fileName = "Danh_sach_chi_tiet_theo_sku";
            if(id){
                fileName += "_bang_ke_"+id;
            }
            saveAs(blob, fileName+".xls");
        }

        $scope.__export_detail = function(data, data2, distanceTime,id) {
            var string = '';
            if(id){
                string = "bảng kê "+id ;
            }else{
                string = "( " + distanceTime +" )";
            }
            var html =
                "<meta http-equiv='content-type' content='application/vnd.ms-excel; charset=UTF-8'><table width='100%' border='1'>" +
                "<thead><tr>" +
                "<td style='border-style:none'></td>" +
                "<td style='border-style:none'></td>" +
                "<td colspan='3' style='font-size: 18px; border-style:none '><strong>Chi tiết theo loại sản phẩm "+string+"</strong></td></tr>" +
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
                    "<td>" + value.log_id + "</td>" ;
                    if(id){
                        html +=
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.fullname : '') + "</td>" +
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.email : '') + "</td>" +
                        "<td>" + ((data2[Object.keys(data2)[0]].__get_user != undefined) ? data2[Object.keys(data2)[0]].__get_user.phone : '') + "</td>"+
                        "<td>" + data2[Object.keys(data2)[0]].date + "</td>"  ;
                    }else{
                        html +=
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.fullname : '') + "</td>" +
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.email : '') + "</td>" +
                        "<td>" + ((data2[value.log_id].__get_user != undefined) ? data2[value.log_id].__get_user.phone : '') + "</td>" +
                        "<td>" + data2[value.log_id].date + "</td>" ;
                    }
                    
                    html +=
                    
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
            var fileName = "Danh_sach_chi_tiet_theo_loai_san_pham";
            if(id){
                fileName += "_bang_ke_"+id;
            }
            saveAs(blob, fileName+".xls");
        }

        $scope.exportExcel = function() {
            $scope.refresh('export');
            $scope.waiting_export = true;
            var distanceTime = "";
            if ($filter('convertTimeISO')($scope.time.create_start)) {
                distanceTime += 'Từ ' + $filter('convertTimeISO')($scope.time.create_start) + ' ';
            }
            if ($filter('convertTimeISO')($scope.time.create_end)) {
                distanceTime += 'Đến ' + $filter('convertTimeISO')($scope.time.create_end) + ' ';;
            }

            var html =
                "<meta http-equiv='content-type' content='application/vnd.ms-excel; charset=UTF-8'><table width='100%' border='1'>" +
                "<thead><tr>" +
                "<td style='border-style:none'></td>" +
                "<td style='border-style:none'></td>" +
                "<td colspan='3' style='font-size: 18px; border-style:none '><strong>Danh sách bảng kê khoang kệ ( " + distanceTime +
                ")</strong></td></tr>" +
                "<tr></tr>" +
                "<tr style='font-size: 14px; background: #6b94b3'>" +
                "<th rowspan='2'>STT</th>" +
                "<th rowspan='2'>ID</th>" +
                "<th colspan='3'>Khách hàng</th>" +
                "<th rowspan='2'>Thời gian</th>" +
                "<th rowspan='2'>Hình thức lưu kho</th>" +
                "<th rowspan='2'>Kho</th>" +
                "<th colspan='3'>Chi tiết</th>" +
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

                "<td>Phí</td>" +
                "<td>Miễn phí</td>" +

                "<td>Phí</td>" +
                "<td>Miễn phí</td>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

            var i = 1;
            Verify.WarehouseFee(1, $scope.frm, 'export').then(function(result) {
                if (!result.data.error) {
                    angular.forEach(result.data.data, function(value) {
                        html += "<tr>" +
                            "<td>" + i++ + "</td>" +
                            //"<td>" + value.id.split(',').join(' - ') + "</td>" +
                            "<td>" + value.id + "</td>" +
                            "<td>" + ((value.__get_user != undefined) ? value.__get_user.fullname : '') + "</td>" +
                            "<td>" + ((value.__get_user != undefined) ? value.__get_user.email : '') + "</td>" +
                            "<td>" + ((value.__get_user != undefined) ? value.__get_user.phone : '') + "</td>" +
                            "<td>" + value.date + "</td>" +
                            "<td>" + (($scope.list_config[1 * value.payment_type] != undefined) ? $scope.list_config[1 * value.payment_type] : '') + "</td>" +
                            "<td>" + (($scope.warehouse_warehouse[value.warehouse] != undefined) ? $scope.warehouse_warehouse[value.warehouse]['name'] : '') + "</td>" +
                            "<td>" + $filter('number')(value.total_item, 0) + "</td>" +
                            "<td>" + $filter('number')(value.total_sku, 0) + "</td>" +
                            "<td>" + $filter('number')(value.floor, 0) + "</td>" +
                            "<td>" + $filter('number')(value.total_fee, 0) + "</td>" +
                            "<td>" + $filter('number')(value.total_discount, 0) + "</td>" +
                            "<td>" + $filter('number')(value.partner_total_fee, 0) + "</td>" +
                            "<td>" + $filter('number')(value.partner_total_discount, 0) + "</td></tr>";
                    });

                    html += "</tbody></table>";
                    var blob = new Blob([html], {
                        type: "application/vnd.ms-excel;charset=utf-8"
                    });
                    saveAs(blob, "Danh_sach_bang_ke_khoang_ke.xls");

                    $scope.__export_detail(result.data.data_detail, result.data.data, distanceTime ,'');
                    $scope.__export_detail_sku(result.data.data_sku, result.data.data, distanceTime,'');
                }
            }).finally(function() {
                $scope.waiting_export = false;
            });
        }

        $scope.exportExcelDetail = function(id) {
            $scope.refresh('export');
            $scope.waiting_export = true;
            var distanceTime = "";
            if ($filter('convertTimeISO')($scope.time.create_start)) {
                distanceTime += 'Từ ' + $filter('convertTimeISO')($scope.time.create_start) + ' ';
            }
            if ($filter('convertTimeISO')($scope.time.create_end)) {
                distanceTime += 'Đến ' + $filter('convertTimeISO')($scope.time.create_end) + ' ';;
            }

            
            Verify.WarehouseFee(1, {log_id : id}, 'export').then(function(result) {
                if (!result.data.error) {
                    $scope.__export_detail(result.data.data_detail, result.data.data, distanceTime , id);
                    $scope.__export_detail_sku(result.data.data_sku, result.data.data, distanceTime , id);
                }
            }).finally(function() {
                $scope.waiting_export = false;
            });
        }
    }
]);