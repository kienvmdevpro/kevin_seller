'use strict';
var app = angular.module('app');
// ProcessCtrl

    app.controller('ProcessCtrl', 
    ['$scope', '$rootScope',  '$http', '$state', '$window', 'bootbox', 'Order', 'Location', 'Config_Status','$modal', '$filter', 'toaster', '$timeout', 'Analytics',
    function($scope, $rootScope, $http, $state, $window, bootbox, Order, Location, Config_Status, $modal, $filter, toaster, $timeout, Analytics) {
        Analytics.trackPage('/order_process');
        
        // config
        $scope.currentPage      = 1;
        $scope.item_page        = 20;
        $scope.maxSize          = 5;
        $scope.list_data        = [];
        $scope.list_city        = [];
        $scope.list_courier     = [];
        $scope.city             = [];
        $scope.district         = {};
        $scope.courier          = {};
        $scope.address          = {};
        $scope.list_color       = Config_Status.order_color;
        $scope.CourierPrefix    = Config_Status.CourierPrefix;
        $scope.tab_status       = {};
        $scope.list_status      = {};
        $scope.list_group       = {};
        $scope.isTabOverweight  = false;
        $scope.pipe_status      = {};
        $scope.pipe_priority    = {};
        var _count_req_delivery = 0;

        var date                = new Date();
        $scope.time             = {};
        $scope.waiting          = true;

        $scope.popoverTemplate  = 'myPopoverTemplate.html';
        $scope.popoverData      = {};

        $scope.moment = moment;
        $scope.frm = {
            keyword : '',
            to_district: 0,
            time_create_start : new Date(date.getFullYear(), date.getMonth() - 1 , date.getDate()),
            time_accept_start : '', 
            time_create_end : new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            time_accept_end : '', 
            courier: ''
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.statusLoading = false;
        $scope.busy          = false;



        var order_status_temp = {};

        $scope.onMouseOverPop = function (item){
            $scope.popoverData = [];
            $scope.statusLoading = true;
            if(order_status_temp[item.tracking_code]){
                $scope.popoverData = order_status_temp[item.tracking_code];
                return ;
            }
            $http.get(ApiPath + 'order-status/order-status?TrackingCode='+item.tracking_code+'&limit=3').success(function (resp){
                $scope.statusLoading = false;
                if(!resp.error){
                    order_status_temp[item.tracking_code] = resp.data;
                    $scope.popoverData = resp.data;
                }
            })
        }

        $scope.loadPipeStatus = function (group){
            Order.PipeStatus(null, 1).then(function (result) {
                if(!result.data.error){
                    $scope.list_pipe_status      = result.data.data;
                    angular.forEach(result.data.data, function(value) {
                        if(value.priority > $scope.pipe_limit){
                            $scope.pipe_limit   = +value.priority;
                        }
                        $scope.pipe_status[value.status]    = value.name;
                        $scope.pipe_priority[value.status]  = value.priority;
                    });
                }
            });
        }
        
        
        $scope.processTimer = function(time){
            var currentDate = new Date();
            var expireDate  = moment(time.time_update * 1000).add(24, 'hours');
            var isExpired = expireDate.isBefore(currentDate);
            return {
                isExpired   : isExpired,
                diff        : expireDate.diff(currentDate, 'hours')
            }
        }

        
        // list city
        Location.province('all').then(function (result) {
            if(!result.data.error){
                $scope.list_city  = result.data.data;
                angular.forEach(result.data.data, function(value) {
                    $scope.city[value.id]   = value.city_name;
                });
            }
        });

        // list courier
        Order.ListCourier().then(function (result) {
            if(!result.data.error){
                $scope.list_courier  = result.data.data;
                angular.forEach(result.data.data, function(value) {
                    $scope.courier[value.id]   = value.name;
                });
            }
        });


        Order.ListStatusOrderProcess().then(function (result) {
            var tab_status = [];
            if(result.data.list_group){
                angular.forEach(result.data.list_group, function(value) {
                    $scope.list_group[+value.id] = value.name;
                    tab_status.push({id : +value.id, name : value.name});
                    if(value.group_order_status){

                        angular.forEach(value.group_order_status, function(v) {
                            $scope.list_status[+v.order_status_code]    = v.group_status;
                        });
                    }
                });
                $scope.tab_status   = tab_status;
            }

        });



        // list courier
        $scope.refresh_data = function(cmd){
            var time_create_start = '';
            var time_create_end   = '';
            var time_accept_start = '';
            var time_accept_end   = '';

            if($scope.frm.time_create_start != undefined && $scope.frm.time_create_start != ''){
                $scope.time.time_create_start  = +Date.parse($scope.frm.time_create_start)/1000;
            }else{
                $scope.time.time_create_start  = 0;
            }

            if($scope.frm.time_create_end != undefined && $scope.frm.time_create_end != ''){
                $scope.time.time_create_end  = +Date.parse($scope.frm.time_create_end) / 1000 + 86399;
            }else{
                $scope.time.time_create_end    = 0;
            }

            if($scope.frm.time_accept_start != undefined && $scope.frm.time_accept_start != ''){
                $scope.time.time_accept_start  = +Date.parse($scope.frm.time_accept_start) / 1000;
            }else{
                $scope.time.time_accept_start   = 0;
            }

            if($scope.frm.time_accept_end != undefined && $scope.frm.time_accept_end != ''){
                $scope.time.time_accept_end  = +Date.parse($scope.frm.time_accept_end)/1000 + 86399;
            }else{
                $scope.time.time_accept_end  = 0;
            }

            if($scope.check_box != undefined && $scope.check_box != []){
                $scope.frm.list_status      = $scope.check_box;
            }else{
                $scope.frm.list_status  = [];
            }

            if(cmd != 'export'){
                $scope.waiting      = true;
                $scope.check_action = true;
                $scope.list_data    = {};
                $scope.status_group = {};
                $scope.total        = 0;
            }
        }

        $scope.genTooltip = function (item){
            var content = "";
            item = item.order_process;
            if(item.length > 0){
                for(var i = 0; i < item.length; i++){
                    if(i < 5){
                        var status = (item[i].status) == 1 ? "Chưa xử lý" : "Đã xử lý";
                        content += "<p><span>" + $filter('date')(item[i].time_create*1000, "dd-MM-yyyy HH:mm")  + "</span> <br/>" + item[i].action + "</p>";
                    }
                }
            }
            return content;
        }

        $scope.genTooltipProductInfo = function (item){
            return '<i class="fa fa-shopping-cart"></i> ' + item.product_name + '<br />' +
                                                '<i class="fa fa-tags"></i> ' + $filter('vnNumber')(item.total_amount) + ' đ<br />' +
                                                '<i class="fa fa-shopping-cart"></i> ' + $filter('vnNumber')(item.total_weight) + ' gram';
        }


        $scope.listGroupStatus = [41];
        $scope.tab_options = "";
        $scope.current_tab = "";
        $scope.change_tab = function (tab_id, options){
            
            
            $scope.current_tab = tab_id;
            if(tab_id == 'OVERWEIGHT'){
                $scope.listGroupStatus = [];
                $scope.setPage(true, options);
            }else {
                $scope.listGroupStatus = [tab_id];
                if(tab_id == 41){
                    $scope.loadPipeStatus(29);
                }else {
                    $scope.loadPipeStatus(tab_id);
                }
                $scope.setPage(false, options);
            }
        }


        $scope.setPage = function(overweight, tab_options){
            $scope.processTooltip = "";
            
            $scope.tab_options = tab_options;
            if(tab_options == 'export'){
                $scope.refresh_data('export');
            }else {
                $scope.refresh_data('');
            }

            return Order.ListOrderProcess($scope.currentPage, '', $scope.frm.keyword, $scope.listGroupStatus, $scope.time.time_create_start, $scope.time.time_create_end, $scope.time.time_accept_start, $scope.time.time_accept_end, $scope.frm.courier, $scope.frm.to_city, $scope.frm.to_district, '', overweight, tab_options).then(function (result) {

                $scope.isTabOverweight  = overweight;
                
                if(!result.data.error){
                    var data = [];
                    $scope.total_group                      = result.data.total_group;
                    

                    if($scope.listGroupStatus[0] == 41){
                        angular.forEach(result.data.data, function (value, key){
                            if(tab_options == ''){
                                if($scope.checkPipe(value) !== true){
                                    data.push(value)
                                }
                            }else {
                                data.push(value)
                            }
                        })  

                        $scope.list_data            = data;
                    }else {
                        $scope.list_data            = result.data.data;
                    }
                    

                    
                    $scope.totalItems           = result.data.total;
                    $scope.item_stt             = $scope.item_page * ($scope.currentPage - 1);
                    $scope.district             = result.data.district;
                    $scope.address              = result.data.address;
                    $scope.status               = result.data.status;
                    $scope.status_group         = result.data.status_group;
                    
                    $scope.total_over_weight    = result.data.total_over_weight;
                    $scope.toggleSelectionAll(1);
                }

                $scope.waiting = false;
            });
            return;
        };

        

        
        //Mở popup tạo yêu cầu / khiếu lại cho vận đơn

        var ModalCreateTicket = null;
        $scope.openPopupCreateTicket = function (item, size, isTabOverweight) {
            /*console.log(item.order_process[0].time_create ,  item.time_update);*/
            /*if(item.order_process.length > 0 && !item.time_update || item.order_process[0].time_create > item.time_update){
                bootbox.alert('Vận đơn này đang có một yêu cầu đăng xử lý , bạn không thể gửi thêm !');
            }else {*/
                ModalCreateTicket = $modal.open({
                    templateUrl : 'PopupCreateTicket.html',
                    controller  : 'ProcessOrderCreateTicketCtrl',
                    size : size,
                    resolve: {
                        Item: function () {
                            return item;
                        },
                        modalIns: function (){
                            return ModalCreateTicket;
                        },
                        processType: function (){

                            return (isTabOverweight) ? 3 : ($scope.listGroupStatus[0] == 41) ? 1 : 2;
                        }
                    }
                });
            /*}*/
            
        };


        var sendProcessAction = function (order_id, action, note){
            Order.CreateProcess({
                'order_id'  : order_id,
                'action'    : action,
                'note'      : note
            }, function (err, resp){

            })
        }

        $scope.confirm_archive = function (){
            msg = "Bạn muốn lưu kho đơn hàng này ?";
            bootbox.confirm( msg , function (result) {
                if(result){
                    $scope.change(item.status, 61, 'status', item, "Người bán lưu kho chờ phát lại",  function (err, resp ){
                        if(!err){
                            $scope.list_data.splice($scope.list_data.indexOf(item),1);
                            sendProcessAction(item.id, processType);
                        }
                    });
                }
            });
        }

        $scope.confirm_pickup = function (item, callback){
            bootbox.prompt({
                message: "<p>Nhập ghi chú cho yêu cầu này để Shipchung hỗ trợ bạn một cách tốt nhất !</p>",
                placeholder: "Thông tin địa chỉ, số điện thoại trường hợp có thay đổi ",
                title: "Bạn chắc chắn muốn yêu cầu lấy lại đơn hàng này ?",
                inputType:"textarea",
                callback: function (result) {
                    if(result !== null && result !== ""){
                        if($scope.busy == true){
                            return false;
                        }

                        $scope.busy = true;
                        $scope.change(item.status, 38, 'status', item, result,  function (err, resp ){
                            $scope.busy = false;
                            if(!err){
                                $scope.list_data.splice($scope.list_data.indexOf(item), 1);
                                sendProcessAction(item.id, 4, result);
                            }
                        });
                    }
                 }
            });
        }
        $scope.confirm_order_cancel = function (item){
            bootbox.confirm( "Bạn chắc chắn muốn hủy đơn hàng này ?" , function (result) {
                console.log('result', result);
                if(result){
                    $scope.change(item.status, 28, 'status', item, "Khách hàng yêu cầu hủy đơn hàng",  function (err, resp ){
                        if(!err){
                            $scope.list_data.splice($scope.list_data.indexOf(item),1);
                            //sendProcessAction(item.id, processType);
                        }
                    });
                }
            });
        }

        
        $scope.confirm_report_cancel  = function(item, processType){

            /**
            * @param processType
            * 1 : Yêu cầu giao lại
            * 2 : Xác nhận chuyển hoàn
            * 3 : 
            * 4 : 
            */

            var msg = "";

            if(processType == 1){
                /*_count_req_delivery = 0;
                $http.get(ApiPath + 'order-status/order-status?TrackingCode='+item.tracking_code).success(function (resp){
                    if(!resp.error){
                        angular.forEach(resp.data, function (value, key){
                            
                            if(value.status == 67){
                                _count_req_delivery++;
                            }
                        })

                        if(_count_req_delivery >= 2){
                            bootbox.alert("Đơn hàng của bạn đã gửi yêu câu giao lại quá hai lần, vui lòng liên hệ với bộ phận chăm sóc khách hàng của Shipchung để được hỗ trợ, xin cám ơn ! ", function() {
                            });
                            return;
                        }else {*/
                            if($scope.checkPipe(item)){
                               bootbox.alert('<p class="text-center"><img src="img/sc_logo.jpg"></p>Bạn đã gửi yêu cầu phát lại thành công, chúng tôi <strong>đang xử lý</strong> giao lại đơn hàng này, vui lòng đợi phản hồi từ hệ thống. <br/> Trân trọng cảm ơn !');
                               return ; 
                            }
                            msg = "Bạn chắc chắn muốn yêu cầu giao lại đơn hàng này ?";
                            bootbox.prompt({
                                message: "<p>Nhập ghi chú cho yêu cầu này để Shipchung hỗ trợ bạn một cách tốt nhất !</p>",
                                placeholder: "Thông tin địa chỉ, số điện thoại người nhận trong trường hợp có thay đổi",
                                title: msg,
                                inputType:"textarea",
                                callback: function (result) {
                                    if(result !== null && result !== ""){
                                        if($scope.busy == true){
                                            return false;
                                        }

                                        $scope.busy = true;
                                        $scope.change(item.status, 67, 'status', item, result,  function (err, resp ){
                                            $scope.busy = false;
                                            if(!err){
                                                $scope.list_data.splice($scope.list_data.indexOf(item),1);
                                                sendProcessAction(item.id, processType, result);
                                            }else {
                                                toaster.pop('warning', 'Thông báo', 'Lỗi không thể giao lại đơn hàng này vui lòng liên hệ bộ phận CSKH ');
                                            }
                                        });
                                    }else {
                                        if (result == "") {
                                            $timeout(function (){
                                                toaster.pop('warning', 'Thông báo', 'Vui lòng nhập nội dung yêu cầu !');
                                            })
                                            
                                        };
                                    }
                                 }
                            });


                       /* }*/


                  /*  }else {
                        bootbox.alert("Lỗi kết nối máy chủ, vui lòng thử lại sau !", function() {});
                    }*/
                /*});*/
                

                return;
            }

            msg = "Bạn chắc chắn muốn xác nhận chuyển hoàn đơn hàng này ?";
            bootbox.confirm( msg , function (result) {
                if(result){
                    if($scope.busy == true){
                        return false;
                    }

                    $scope.busy = true;
                    $scope.change(item.status, 61, 'status', item, "Người bán xác nhận chuyển hoàn",  function (err, resp ){
                        $scope.busy = false;
                        if(!err){
                            $scope.list_data.splice($scope.list_data.indexOf(item),1);
                            sendProcessAction(item.id, processType);
                        }else {
                            toaster.pop('warning', 'Thông báo', 'Lỗi không thể gửi yêu cầu chuyển hoàn đơn hàng này vui lòng liên hệ bộ phận CSKH !');
                        }
                    });
                }
            });
            return;
        }




        $scope.check_list = function(id){
            var data = angular.copy($scope.check_box_order);
            var idx = +data.indexOf(id);
            if (idx > -1) {
                return true;
            }
            else {
                return false;
            }
        }

        $scope.toggleSelectionOrder = function(code) {
            var data = angular.copy($scope.check_box_order);
            var idx = +data.indexOf(code);

            if (idx > -1) {
                $scope.check_box_order.splice(idx, 1);
            }
            else {
                $scope.check_box_order.push(code);
            }
        };

        $scope.toggleSelectionAll = function (check){
            var check_box = $scope.check_box_order;
            if(check == 0){
                $scope.check_box_order        = [];
            }else{
                $scope.check_box_order        = [];
                angular.forEach($scope.list_data, function(value, key) {
                    $scope.check_box_order.push(value.tracking_code);
                });
            }
        }


        $scope.mutil_accept_process = false;
        $scope.mutil_accept_over_weight = function (){
            $scope.mutil_accept_process = true;
            if($scope.check_box_order.length > 0){

                Order.AcceptOverWeight($scope.check_box_order[0], function (err, resp){
                    if(err){
                        if($scope.check_box_order.length == 0){
                            toaster.pop('success', 'Thông báo', 'Kết thúc');
                        }else {
                            toaster.pop('warning', 'Thông báo', 'Lỗi kết nối');
                        }
                        $scope.change_tab('OVERWEIGHT');
                    }else {

                        $rootScope._OrderProcess.data['total_over_weight'] --;
                        $rootScope._OrderProcess.total --;
                        $scope.check_box_order.splice(0, 1);
                        $scope.mutil_accept_over_weight();
                    }
                });

            }else {
                toaster.pop('success', 'Thông báo', 'Hoàn thành');
                $scope.mutil_accept_process = false;
                $scope.change_tab('OVERWEIGHT');
            }
        }



        $scope.AcceptOverWeight = function (item){
            Order.AcceptOverWeight(item.tracking_code, function (err, resp){
                if(err){
                    toaster.pop('warning', 'Thông báo', 'Cập nhật thất bại !');
                }else {
                    toaster.pop('success', 'Thông báo', 'Cập nhật thành công !');
                    $scope.change_tab('OVERWEIGHT');
                    $rootScope._OrderProcess.data['total_over_weight'] --;
                    $rootScope._OrderProcess.total --;

                }
            })
        }

        $scope.checkPipe = function (item){
            if(!item.pipe_journey){
                return false;
            }
            for (var i = item.pipe_journey.length - 1; i >= 0; i--) {
                if(item.pipe_journey[i].pipe_status == 707 || item.pipe_journey[i].pipe_status == 903){
                    return true;
                }
            };
            
        }

        $scope.acceptStatus = function (status, sc_code, city, note, courier, callback){
            var data = {};
            if(status && sc_code && courier && city && note){
                data['status']  = status;
                data['sc_code'] = sc_code;
                data['courier'] = courier;
                data['city']    = city;
                data['note']    = note;

                Order.AcceptStatus(data, function (err, resp){
                    if(!err){
                        //$scope.data.status = status;
                        (callback && typeof callback == 'function') ? callback(null, true) : null;
                    }else {
                        (callback && typeof callback == 'function') ? callback(true, null) : null;
                    }
                })
            }
            
        }


        /**
         *   Edit order
         */
        $scope.change   = function(old_value, new_value, field, item, note, callback){
            var dataupdate = {};

            if(new_value != undefined && new_value != ''&& old_value != new_value && item.id > 0 ){
                // Update status
                if(field == 'status'){
                    if(new_value == 61){
                        $scope.acceptStatus(new_value, item.tracking_code, 'SC', "Khách hàng báo chuyển hoàn", $scope.CourierPrefix[item.courier_id], function (err, result){
                            if(err){
                                callback(true, true);
                            }else {
                                callback(null, true);
                            }
                        });    
                    }else if(new_value == 67) {
                        var statusCompare = 707;
                        statusCompare  = $scope.listGroupStatus[0] == 41 ? 707: 903; 

                        $http.post(ApiPath + 'pipe-journey/create', {
                            'tracking_code' : item.id,
                            'type'          : 1,
                            'pipe_status'   : statusCompare,
                            'note'          : note,
                            'group'         : statusCompare == 707 ? 29 : 31
                        }).success(function (resp){
                            if(resp.error){
                                callback(true, true);
                            }else {
                                callback(null, true);
                            }
                        })

                        
                    }else {
                        $scope.acceptStatus(new_value, item.tracking_code, 'SC', note, $scope.CourierPrefix[item.courier_id], function (err, result){
                            if(err){
                                callback(true, true);
                            }else {
                                callback(null, true);
                            }
                            
                        });
                    }
                    
                    return false;
                    $scope.waiting_status   = true;
                }
            }
            return;
        };

        // action
        $scope.loadPipeStatus(29);
        $scope.setPage('', 'CONFIRM_DELIVERED');
    }
])
