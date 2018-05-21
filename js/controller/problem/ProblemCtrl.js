'use strict';

//List Order
angular.module('app').controller('ProblemCtrl', 
			['$scope','$modal','$http','$rootScope','toaster','$filter','Api_Path','Order','PhpJs','Config_Status',
    function ($scope, $modal,   $http,  $rootScope,  toaster,  $filter,  Api_Path,  Order,  PhpJs,  Config_Status) {
		 var tran = $filter('translate');
        // config
        $scope.total            = 0;
        $scope.item_page        = 10;
        $scope.currentPage      = 1;
        $scope.maxSize          = 5;
        $scope.waiting          = true;
        $scope.search           = '';
        $scope.status           = null;
        $scope.frm              = {option : 0};
        $scope.check_box        = [0,1];
        $scope.option           = 0;

        $scope.frm_confirm      = {send_zalo : true, note : ''};

        $scope.list_data        = {};
        $scope.total            = 0;
        $scope.detail           = null;
        $scope.list_unactive    = [];
        $scope.total_group      = [];
        $scope.list_color       = Config_Status.order_color;

        $scope.list_status_process_vi      = {
            0   : 'Chưa phản hồi',
            1   : 'Đã phản hồi & chờ xử lý',
            2   : 'Xử lý thành công',
            3   : 'Xử lý thất bại'
        };
        
        $scope.list_status_process_en  = {
            0   : 'Assigned',
            1   : 'On process',
            2   : 'Closed',
            3   : 'Failed'
        };
        $scope.list_option_en      = {
                1   : 'Failed delivery',
                2   : 'Waiting return',
                3   : 'Failed pickup',
                4   : 'Over weight'
            };
        $scope.list_option_vi   = {
            1   : 'Giao thất bại',
            2   : 'Chờ xác nhận chuyển hoàn',
            3   : 'Lấy không thành công',
            4   : 'Đơn hàng vượt cân'
        };
        $scope.status_detail_vi = {
                1 : {
                    1 : 'Đã gửi yêu cầu phát lại',
                    2 : 'Đã duyệt hoàn'
                },
                2 : {
                    1 : 'Đã gửi yêu cầu phát lại',
                    2 : 'Đã duyệt hoàn'
                },
                3 : {
                    1 : 'Đã gửi yêu cầu thu lại',
                    2 : 'Đã báo hủy'
                },
                4 : {
                    1 : 'Đã xác nhận vượt cân'
                }
            };
        $scope.status_detail_en = {
            1 : {
                1 : 'Re-delivery requested',
                2 : 'Return approved'
            },
            2 : {
                1 : 'Re-delivery requested',
                2 : 'Return approved'
            },
            3 : {
                1 : 'Re-pickup requested',
                2 : 'Cancelled'
            },
            4 : {
                1 : 'Overweight confirmed'
            }
        };
        $scope.$watch('keyLang', function (Value, OldValue) {
            if (Value != undefined && Value =="en" ) {
            	$scope.list_status_process = $scope.list_status_process_en;
            }else{
            	$scope.list_status_process = $scope.list_status_process_vi;
            }
            	$scope.list_option 		= (Value =="en") ? $scope.list_option_en 	: $scope.list_option_vi;
            	$scope.status_detail	= (Value =="en") ? $scope.status_detail_en 	: $scope.status_detail_vi;
        });
       

        
        $scope.sum_total    = function(data){
            if(data == undefined) return 0;
            var total = 0;
            angular.forEach(data, function(value) {
                total += 1*value;
            });
            return total;
        }

        $scope.processTimer = function(time){
            var currentDate = new Date();
            var expireDate  = moment(time.time_create * 1000).add(24, 'hours');
            var isExpired = expireDate.isBefore(currentDate);
            return {
                isExpired   : isExpired,
                diff        : expireDate.diff(currentDate, 'hours')
            }
        }

        $scope.toggleSelection = function(id) {
            id  = 1*id;
            var data = angular.copy($scope.check_box);
            var idx = +data.indexOf(id);

            if (idx > -1) {
                $scope.check_box.splice(idx, 1);
            }
            else {
                $scope.check_box.push(id);
            }
        };

        $scope.setPage = function (tab, search, page) {
            if($scope.check_box != undefined && $scope.check_box != []){
                $scope.status       = $scope.check_box.toString();;
            }else{
                $scope.status       = '';
            }

            $scope.option           = tab;

            $scope.list_data        = {};
            $scope.total_group      = [];
            $scope.list_unactive    = [];
            $scope.total            = 0;
            $scope.detail           = null;

            $scope.currentPage = page;
            $scope.waiting = true;
            Order.ProcessProblem(page, {option : tab, status: $scope.status, search: search}, '').then(function (result) {
                if(!result.data.error){
                    $scope.list_data    = result.data.data;
                    $scope.total        = result.data.total;
                    $scope.total_group  = result.data.total_group;
                    $scope.get_detail(0);
                }
                $scope.waiting = false;

            },function(reason){
                $scope.waiting = false;
            });
            return;
        }

        $scope.setPage($scope.option, '', 1);
        $scope.$watch('frm_confirm.note', function (Value, OldValue) {
            if(Value && Value.length >=149){
            	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Problem_NhapNoiDungDuoi150'));
            }
        }); 
        $scope.get_detail   = function(id){
            $scope.detail           = null;
            $scope.frm_confirm      = {send_zalo : true, note : '', note_pickup : ''};

            angular.forEach($scope.list_data, function(value, key) {
                if(id > 0){
                    if(value.order_id == id){
                        $scope.detail           = value;
                    }
                }else{
                    if(key == 0){
                        $scope.detail           = value;
                    }
                }
            });

            // Set
            if($scope.detail != null){
                var group_process   = 29;
                var status_process  = 711;

                if($scope.detail.type == 1){
                    var reason = $scope.detail.reason.split(' - ');
                    //vi
                    var note_vi = 'Gửi quý khách <strong>'+ $scope.detail.order.to_name + '</strong>, Shipchung xin lỗi quý khách về đơn hàng '
                    + '<a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code +  '</a> - <strong>'
                    + $scope.detail.order.product_name + "</strong> đã giao không thành công do \"<i>" + (reason[2] != undefined ? reason[2] : '') + "</i>\"."
                    + "<br />Quý khách có thể liên hệ bưu tá <strong>" + $scope.detail.postman_name + "</strong>, <strong>SDT: " + $scope.detail.postman_phone
                    + "</strong> để nhận hàng.";
                    //en
                    var note_en = 'Dear <strong>'+ $scope.detail.order.to_name + '</strong>  are sorry for failed delivery order'
                    +' <a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code +  '</a> - <strong>'
                    + $scope.detail.order.product_name + '</strong> You can contact to delivery man <strong>: ' + $scope.detail.postman_phone + ''
                    + "</strong>. to receive order." 
                    
                    $scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    $scope.$watch('keyLang', function (Value, OldValue) {
                    	$scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    });
                    //Lấy nội dung từ hành trình xử lý
                    Order.PipeDetail({tracking_code : $scope.detail.order_id, group: group_process, status : status_process}).then(function (result) {
                        if(!result.data.error){
                            $scope.detail.report_process    = result.data.data;
                            $scope.detail.report_process.time_before = PhpJs.ScenarioTime(Date.parse(new Date)/1000 - $scope.detail.report_process.time_create);
                        }
                    });
                }else if($scope.detail.type == 2){
                    group_process   = 31;
                    status_process  = 908;

                    // Chờ xác nhận chuyển hoàn
                    var note_en = 'Order <a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a> change to return status because cannot deliver to receiver(buyer), please contact to them and give us a solution.'
                    var note_vi  = 'Đơn <a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a> đã chuyển qua trạng thái chờ xác nhận chuyển hoàn'
                    + ' do chưa thể giao hàng cho người nhận, rất mong quý khách ' + $rootScope.userInfo.fullname +' trao đổi gấp với người nhận và phàn hồi cách xử lý cho bên em.';
                    $scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    $scope.$watch('keyLang', function (Value, OldValue) {
                    	$scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    });
                    Order.PipeDetail({tracking_code : $scope.detail.tracking_code, group: group_process, status : status_process}).then(function (result) {
                        if(!result.data.error){
                            $scope.detail.report_process    = result.data.data;
                        }
                    });
                }else if($scope.detail.type == 3){
                    // Lấy thất bại
                    var reason = $scope.detail.reason.split(' - ');
                    var note_en =  'Dear <strong>' + $rootScope.userInfo.fullname + '</strong>, We are sorry for failed picking-up order <a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a>'
                    +' because "'+ (reason[2] != undefined ? reason[2] : '') + (reason[3] != undefined ? (". "+reason[3]) : '') +'", please give us a solution.';
                    var note_vi = 'Gửi <strong>' + $rootScope.userInfo.fullname + '</strong>, ShipChung xin lỗi quý khách về đơn hàng '
                        + '<a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a> - ' + $scope.detail.order.product_name + ' chưa thu được do "'
                        + (reason[2] != undefined ? reason[2] : '') + (reason[3] != undefined ? (". "+reason[3]) : '') + '".Rất mong quý khách phàn hồi lại bên em xử lý.';
                    
                    $scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    $scope.$watch('keyLang', function (Value, OldValue) {
                    	$scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    })
                }else if($scope.detail.type == 4){
                    // Vượt cân
                	
                	//vi
                	var note_vi = 'Gửi <strong>' + $rootScope.userInfo.fullname + '</strong>, ShipChung xin thông báo quý khách về đơn hàng '
                        + '<a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a> - ' + $scope.detail.order.product_name
                        + ' đang bị vượt cân  so với cân nặng chị ghi trên hệ thống Shipchung là <strong>' + $scope.detail.order.over_weight  + ' gram</strong>.'
                        + 'Chị vui lòng kiểm tra  thông tin đơn hàng, nếu trong vòng 24h. Chị không phản hồi , đơn hàng sẽ được vận chuyển đi theo quy định.';
                    //en
                    var note_en = 'Dear  <strong>' + $rootScope.userInfo.fullname + '</strong>, We inform about order <a class="text-info" target="_blank" href="https://seller.shipchung.vn/#/detail/' + $scope.detail.tracking_code + '">' + $scope.detail.tracking_code + '</a> overweight by <strong>' + $scope.detail.order.over_weight  + ' gram</strong>. gram. Please check & confirm within 24h!'
                    $scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    $scope.$watch('keyLang', function (Value, OldValue) {
                    	$scope.detail.note = ($rootScope.keyLang == 'en') ? note_en : note_vi;
                    });
                }


            }
        }

        //Thao tác
        $scope.change_process  = function(option, action, group, status, note, send_zalo, callback){
            var dataupdate = {};

            if(note != undefined && note != ''&& $scope.detail.order_id > 0 ){
                $http.post(Api_Path.OrderProcess + 'create-journey', {
                    'tracking_code' : $scope.detail.order_id,
                    'option'        : option,
                    'pipe_status'   : status,
                    'note'          : note,
                    'send_zalo'     : send_zalo,
                    'group'         : group,
                    'action'        : action,
                }).success(function (resp){
                    if(resp.error){
                        callback(true, resp);
                    }else {
                        callback(null, resp);
                    }
                })
            }

            return;
        };

        $scope.change  = function(option, action, status, note, callback){
            if($scope.detail.order_id > 0 ){
                $http.post(Api_Path.OrderProcess + 'change-order', {
                    'tracking_code' : $scope.detail.tracking_code,
                    'courier'       : $scope.detail.order.courier_id,
                    'option'        : option,
                    'status'        : status,
                    'action'        : action,
                    'note'          : note
                }).success(function (resp){
                    if(resp.error){
                        callback(true, resp);
                    }else {
                        callback(null, resp);
                    }
                })
            }

            return;
        };

        $scope.action_confirm = function(send_zalo, note, type){
            if(note == '' || note == undefined){
                //toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập nội dung yêu cầu phát lại!');
            	
            	toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Problem_BanChuaNhapNDYCPL'));
                return;
            }
            /*$scope.$watch('keyLang', function (Value, OldValue) {
            });*/
            
            var msg = tran('Problem_BanMunChacChanYCGiaoLai');//"Bạn chắc chắn muốn yêu cầu giao lại đơn hàng này ?";
            bootbox.confirm( msg , function (result) {
                                if(result){
                                    if($scope.busy == true){
                                        return false;
                                    }

                                    if(note == ''){
                                        return false;
                                    }

                                    $scope.busy = true;
                                    $scope.change_process(type, 1, 29, 707, note , send_zalo,  function (err, resp ){
                                        $scope.busy = false;
                                        if(!err){
                                            $scope.list_unactive.push($scope.detail.order_id);
                                            $scope.detail.status = 1;
                                            toaster.pop('success',tran('toaster_ss_nitifi'), resp.error_message);
                                        }else {
                                            toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
                                        }
                                    });

                                }else{

                                }

                            });
        }

        $scope.action_confirm_pickup = function(note){
            if(note == '' || note == undefined){
            	toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Problem_BanChuaNhapNDYCThuLai'));
                //toaster.pop('warning',tran('toaster_ss_nitifi'), 'Bạn chưa nhập nội dung yêu cầu thu lại hàng!');
                return;
            }

            var msg = tran('Problem_BanChacChanMuonYCThuLaiDH');//"Bạn chắc chắn muốn yêu cầu thu lại đơn hàng này ?";
            bootbox.confirm( msg , function (result) {
                if(result){
                    if($scope.busy == true){
                        return false;
                    }

                    if(note == ''){
                        return false;
                    }

                    $scope.busy = true;
                    if(note != undefined && note != ''&& $scope.detail.order_id > 0 ){
                        $http.post(Api_Path.OrderProcess + 'confirm-pickup', {
                            'tracking_code' : $scope.detail.order_id,
                            'option'        : 3,
                            'pipe_status'   : 1,
                            'note'          : note,
                            'send_zalo'     : 0,
                            'group'         : 109,
                            'action'        : 1
                        }).success(function (resp){
                            if(!resp.error){
                                $scope.list_unactive.push($scope.detail.order_id);
                                $scope.detail.status = 1;
                                toaster.pop('success', tran('toaster_ss_nitifi'), resp.error_message);
                            }else {
                                toaster.pop('warning',tran('toaster_ss_nitifi'), resp.error_message);
                            }
                        })
                    }

                }else{

                }

            });
        }

        $scope.action = function(option, action, status ){
           //var msg = "Bạn chắc chắn muốn xác nhận chuyển hoàn đơn hàng này ?";
        	var msg = tran('Problem_BanMunChacChanXNChuyenHoan');
            //var note = 'Người bán xác nhận chuyển hoàn';
        	var note = tran('Problem_NguoiBanXNChueynHoan');
            if(status == 28){
                //msg = "Bạn chắc chắn muốn hủy đơn hàng này ?";
                msg = tran('Problem_BanCoMuonHuyDonNay');
                note = tran('Problem_NguoiBanBaoHuy');//'Người bán báo hủy';
            }else if(status == 38){
                msg = tran('Problem_BanCoChanChanYCLayLai');//"Bạn chắc chắn muốn yêu cầu lấy lại đơn hàng này ?";
               // note = 'Người bán yêu cầu lấy lại';
                note = tran('Problem_NguoiBanYCLayLai');
            }



            bootbox.confirm( msg , function (result) {
                if(result){
                    if($scope.busy == true){
                        return false;
                    }

                    $scope.busy = true;
                    $scope.change(option, action, status,  note,  function (err, resp ){
                        $scope.busy = false;
                        if(!err){
                            $scope.list_unactive.push($scope.detail.order_id);
                            $scope.detail.status = status;
                            toaster.pop('success', tran('toaster_ss_nitifi'), resp.error_message);
                        }else {
                            toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
                        }
                    });
                }
            });
            return;
        }

        // Duyệt vượt cân
        $scope.accept_overweight  = function(){
            if($scope.detail.order_id > 0 ){
                if($scope.busy == true){
                    return false;
                }

                $scope.busy = true;
                //bootbox.confirm( "Bạn đồng ý xác nhận vượt cân cho đơn hàng này ?" , function (result) {
                bootbox.confirm( tran('Problem_BanCoDongYXNVuotCan') , function (result) {
                if (result) {
                        $http.post(Api_Path.OrderProcess + 'accept-over-weight', {
                            'tracking_code' : $scope.detail.tracking_code
                        }).success(function (resp){
                            $scope.busy = false;
                            if(!resp.error){
                                $scope.list_unactive.push($scope.detail.order_id);
                                $scope.detail.status = 2;
                                toaster.pop('success', tran('toaster_ss_nitifi'), resp.error_message);
                            }else {
                                toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
                            }
                        })
                    }
                });

            }

            return;
        };
        //bao luu kho
        $scope.storeStock = function(){
            if($scope.detail.order_id < 0 ){
                return;
            }
            var orderId = $scope.detail.order_id;
            var modalInstance = $modal.open({
                templateUrl: 'tpl/problem/modal.stock.html',
                controller: function($scope, $modalInstance, $http) {
                    $scope.submit_loading = false;
                    $scope.list_unactive    = [];
                    $scope.detail         = [];
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1
                    };
                    //
                    $scope.change_processs  = function(option, action, group, status, note, send_zalo, time_store, callback){
                        var dataupdate = {};

                        if(note != undefined && note != ''&& orderId > 0 ){
                            $http.post(Api_Path.OrderProcess + 'create-journey', {
                                'tracking_code' : orderId,
                                'option'        : option,
                                'pipe_status'   : status,
                                'note'          : note,
                                'send_zalo'     : send_zalo,
                                'group'         : group,
                                'action'        : action,
                                'time_store'    : time_store
                            }).success(function (resp){
                                if(resp.error){
                                    callback(true, resp);
                                }else {
                                    callback(null, resp);
                                }
                            })
                        }

                        return;
                    };

                    $scope.open = function($event,type) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        if(type == "time_store"){
                            $scope.time_store = true;
                        }
                    };
                    $scope.save = function(time,note) {
                        var timeStore = Date.parse(time)/1000;
                        $scope.change_processs(1, 1, 29, 707, note , '', timeStore,  function (err, resp ){
                            if(!err){
                                toaster.pop('success', tran('toaster_ss_nitifi'), resp.error_message);
                                $modalInstance.close(orderId);
                            }else {
                                toaster.pop('warning', tran('toaster_ss_nitifi'), resp.error_message);
                            }
                        });
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                }
            });

            modalInstance.result.then(function (orderId) {
                    $scope.list_unactive.push(orderId);
                    $scope.detail.status = 1;
                }, function () {
                  console.log('Modal dismissed at: ' + new Date());
            });
        }
}]);