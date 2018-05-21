'use strict';

//Management
angular.module('app').controller('ManagementCtrl', 
			['$scope', '$http', '$state','$stateParams', '$window', 'bootbox', 'Order', 'Location', 'Config_Status', 'Inventory', 'Analytics', 'User', 
 	function($scope, 	$http,   $state,  $stateParams,   $window,   bootbox,   Order,   Location,   Config_Status,   Inventory,   Analytics,   User) {
        Analytics.trackPage('/order/listing');
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
        $scope.tab_status       = {};
        $scope.list_status      = {};
        $scope.list_group       = {};
        $scope.check_box        = [];
        $scope.check_box_order  = [];
        $scope.check_action     = false;
        $scope.list_inventory   = {};

        var date                    = new Date();

        $scope.frm              = {createby: '', keyword : '', to_district: 0,time_create_start : '', 
        						  time_accept_start : '', time_create_end : '', time_accept_end: '', 
        						 courier: '', inventory: 0, check_verify:0,status:'' };
        $scope.time             = {	time_create_start : new Date(date.getFullYear(), date.getMonth(), 1),
									time_create_end : new Date(date.getFullYear(), date.getMonth(), date.getDate())};
        // $scope.check_verify_false = 0;
       //check check_verify : 0 lấy hêt, 1 những đơn đã đối soát, 2 đơn thành công chưa đối soát
        // check tu trang tien thu ho (order.verify)
        if($stateParams.verify && $stateParams.verify != ''){
        	//$scope.time.time_create_start = undefined;
        	//$scope.time.time_create_end = undefined
        	$scope.time.time_pickup_start = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
     	    $scope.time.time_pickup_end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     	   if($stateParams.verify.toString() == "1"){
        	   $scope.check_verify_true 	= 1; // check box  đơn đã đối soát
        	   $scope.check_verify_false 	= 0 // uncheck box  đơn chưa đối soát
   			   $scope.frm.check_verify 		= 1; // biến check_verify
           }else if($stateParams.verify.toString() == "0"){
        	   $scope.frm.check_verify 		= 0; ; // biến check_verify
        	   $scope.check_verify_true 	= 0; // uncheck box  đơn đã đối soát
        	   $scope.check_verify_false 	= 0  // uncheck box  đơn chưa đối soát
           }else if($stateParams.verify.toString() == "2"){
        	   $scope.check_verify_false 	= 1;  //check box  đơn chưa đối soát
        	   $scope.check_verify_true 	= 0; // uncheck box  đơn đã đối soát
        	   $scope.frm.check_verify 	= 2 ; // biến check_verify
           }
        }
       if($stateParams.status && $stateParams.status != '' && $stateParams.status != 'null'){
    	   $scope.frm.status = $stateParams.status;
    	   
   		}
       //end check tu trang tien thu ho (order.verify)
        $scope.check_check_verify = function(item){
        	if(item == 1){
        		if($scope.check_verify_true == 1){
        			$scope.check_verify_false = 0
        			$scope.frm.check_verify = 1;
        		}else{
        			$scope.frm.check_verify = 0;
        		}
        	}else{
        		if($scope.check_verify_false == 1){
        			$scope.check_verify_true = 0
        			$scope.frm.check_verify = 2
        			
        		}else{
        			$scope.frm.check_verify = 0;
        		}
    		}
        	
        } 
        
        $scope.waiting          = true;
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        var minDate = new Date();
        minDate.setDate(date.getDate() - 90);

        $scope.minDate = minDate;
        $scope.maxDate = new Date();
        

        $scope.$watchCollection('check_box', function(newNames, oldNames) {
            $scope.check_action = false;
        });

        // get data
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

        $scope.action   = function(status){
            if($scope.check_box_order.length > 0) {
                var dataupdate = {};
                // Update status

                dataupdate['tracking_code'] = $scope.check_box_order[0];
                dataupdate['status'] = status;

                Order.Edit(dataupdate).then(function (result) {
                    if (result.data.error) {
                        $scope.wating_status = false;
                        $scope.currentPage   = 1;
                        $scope.setPage();

                        if (status == 21 && result.data.message == 'NOT_ENOUGH_MONEY') {
                            var modalInstance = $modal.open({
                                templateUrl: 'ModalError.html',
                                controller: 'ModalErrorCtrl',
                                resolve: {
                                    items: function () {
                                        return result.data;
                                    }
                                }
                            });

                            modalInstance.result.then(function () {
                                $scope.cash_in('');
                            });
                        }
                    } else {
                        $scope.check_box_order.splice(0, 1);
                        $scope.action(status);
                    }
                });
            }else{
                $scope.wating_status = false;
                $scope.currentPage   = 1;
                $scope.setPage();
            }
            return;
        };

        $scope.action_multi = function(status){
            if($scope.check_box.toString() == 12 && $scope.check_box_order.length > 0 && !$scope.wating_status){
                var msg = '';
                if(status == 21){
                    msg = 'Bạn chắc chắn muốn duyệt những đơn hàng này ?';
                }else{
                    msg = 'Bạn chắc chắn muốn hủy những đơn hàng này ?';
                }

                bootbox.confirm(msg, function (result) {
                    if(result){
                        $scope.wating_status = true;
                        $scope.action(status);
                        return;
                    }
                    return;
                });
            }
            return;
        }

        Inventory.load().then(function (result) {
            if(!result.data.error){
                $scope.list_inventory           = result.data.data;
            }
        });

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
                $scope.list_courier  = [] //result.data.data;
                angular.forEach(result.data.data , function(value) {
                    if($scope.list_courier.indexOf(value)<0){
                        if([17,18,15,19,20,21,22].indexOf(value.id)>=0){
                            value.group_en  = 'International';
                            value.group     = 'Quốc tế';
                           
                            $scope.list_courier .push(value)
                        }else{
                            value.group_en  = 'Domestic';
                            value.group     = 'Trong nước';
                            $scope.list_courier .push(value)
                        }
                    }
                });
                angular.forEach(result.data.data, function(value) {
                    $scope.courier[value.id]   = value.name;
                });
            }
        });

        User.child_users().then(function (result){
            if(!result.data.error){
                $scope.child_users  = result.data.data;
            }
        })

       
        var getOrder_Status = function(){
        	 Order.ListStatus().then(function (result) {
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
                     angular.forEach($scope.tab_status, function(value) {
                    	 value.checked = false;
                         
                     });
                     
                 }
             });
        }
        getOrder_Status();
        $scope.$watch('keyLang', function (Value, OldValue) {
        	getOrder_Status();
        });
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

        // list courier

        $scope.refresh_data = function(cmd){
            var time_create_start = '';
            var time_create_end   = '';
            var time_accept_start = '';
            var time_accept_end   = '';

            if($scope.time.time_create_start != undefined && $scope.time.time_create_start != ''){
                $scope.frm.time_create_start  = +Date.parse($scope.time.time_create_start)/1000;
            }else{
                $scope.frm.time_create_start  = 0;
            }

            if($scope.time.time_create_end != undefined && $scope.time.time_create_end != ''){
                $scope.frm.time_create_end  = +Date.parse($scope.time.time_create_end)/1000 + 86399;
            }else{
                $scope.frm.time_create_end    = 0;
            }
            /*
            if($scope.time.time_accept_start != undefined && $scope.time.time_accept_start != ''){
                $scope.frm.time_accept_start  = +Date.parse($scope.time.time_accept_start)/1000;
            }else{
                $scope.frm.time_accept_start   = 0;
            }

            if($scope.time.time_accept_end != undefined && $scope.time.time_accept_end != ''){
                $scope.frm.time_accept_end  = +Date.parse($scope.time.time_accept_end)/1000 + 86399;
            }else{
                $scope.frm.time_accept_end  = 0;
            }*/
            if($scope.time.time_pickup_start != undefined && $scope.time.time_pickup_start != ''){
                $scope.frm.time_pickup_start  = +Date.parse($scope.time.time_pickup_start)/1000;
            }else{
                $scope.frm.time_pickup_start   = 0;
            }

            if($scope.time.time_pickup_end != undefined && $scope.time.time_pickup_end != ''){
                $scope.frm.time_pickup_end  = +Date.parse($scope.time.time_pickup_end)/1000;
            }else{
                $scope.frm.time_pickup_end   = 0;
            }
            
            if($scope.time.time_success_start != undefined && $scope.time.time_success_start != ''){
                $scope.frm.time_success_start  = +Date.parse($scope.time.time_success_start)/1000;
            }else{
                $scope.frm.time_success_start  = 0;
            }
            if($scope.time.time_success_end != undefined && $scope.time.time_success_end != ''){
                $scope.frm.time_success_end  = +Date.parse($scope.time.time_success_end)/1000 + 86399;
            }else{
                $scope.frm.time_success_end  = 0;
            }
            
            if($stateParams.status != undefined && $stateParams.status != ''){
                $scope.frm.status  =$stateParams.status;
            }else{
                $scope.frm.status  = 0;
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

        $scope.setPage = function(){
            $scope.refresh_data('');
            Order.ListOrder($scope.currentPage, '', $scope.frm, '').then(function (result) {
                if(!result.data.error){
                    $scope.list_data    = result.data.data;
                    $scope.totalItems   = result.data.total;
                    $scope.item_stt     = $scope.item_page * ($scope.currentPage - 1);
                    $scope.district     = result.data.district;
                    $scope.address      = result.data.address;

                    $scope.toggleSelectionAll(1);
                }

                $scope.waiting = false;
            });
            return;
        };

        $scope.exportExcel = function(){
            $scope.refresh_data('export');
            return Order.ListOrder($scope.currentPage, '', $scope.frm, 'export');
        }

        // action
        $scope.setPage('');
    }
])

;
