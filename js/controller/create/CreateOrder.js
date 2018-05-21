'use strict';

//List Order
var OrderCreateCtrl;

angular.module('app').controller('OrderCreateParentCtrl',
		    ['$scope', '$rootScope', 'Analytics', '$localStorage','bootbox','$state','$filter',
    function ($scope,   $rootScope,   Analytics,   $localStorage, bootbox,  $state,   $filter){
	var tran = $filter('translate');	    	
    var i = 1;
    $scope.tabs = [i];

    $scope.addTabs = function (){
        i = i + 1;
        $scope.tabs.push(i);
    }

    $scope.notice = {};
    $rootScope.hasInventory = true;
    $scope.showNotice = function (){
    	if ($rootScope.userInfo.first_order_time == 0) {
            $scope.notice.content = 'Quý khách vừa được cấp tín dụng trước 200.000 vnđ, hãy tạo đơn giao hàng ngay bay giờ! - Xem giải thích mức tín dụng & số dư khả dụng là gì <a href="https://www.shipchung.vn/ho-tro/c/thanh-toan/" target="_blank"><span class="text-info">tại đây</span></a>';
            $scope.notice.content_en = 'You got 200.000đ credits (for cash-on-delivery order only), you can create order now and pay it later.';
    	}

        if ((+$rootScope.userInfo.balance + $rootScope.userInfo.provisional - $rootScope.userInfo.freeze) < 50000) {
            $scope.notice.content = 'Số dư khả dụng của bạn đang dưới 50.000vnđ, bạn nạp thêm tiền vào tài khoản để sử dụng dịch vụ - Xem hướng dẫn nạp tiền <a href="https://www.shipchung.vn/ho-tro/c/thanh-toan/" target="_blank"><span class="text-info">tại đây</span></a>.';
            $scope.notice.content_en = 'Your available balance account is under $25, please deposit money to your account first, - <a href="https://www.shipchung.vn/ho-tro/c/thanh-toan/" target="_blank"><span class="text-info">Click here to view how to deposit money</span></a>.';
        }

        if (!$scope.hasInventory) {
            $scope.notice.content = 'Bạn chưa nhập địa chỉ lấy hàng để tạo đơn hàng nhanh hơn - Cấu hình ngay tại đây.';
            $scope.notice.content_en = 'Bạn chưa nhập địa chỉ lấy hàng để tạo đơn hàng nhanh hơn - Cấu hình ngay tại đây.';
        }
    }
    $scope.showNotice();




    Analytics.trackPage('/order/create-v2');
}]);


angular.module('app').controller('OrderCreateV2Ctrl', 
		                   [ '$scope', '$rootScope','$filter','$http','$state', '$stateParams', '$timeout', '$modal', 'AppStorage', 'Location', 'Inventory', 'Order', 'ConfigShipping', 'PhpJs', 'toaster', '$localStorage',
    function OrderCreateV2Ctrl($scope, $rootScope,  $filter,   $http,   $state,   $stateParams,   $timeout,   $modal,    AppStorage,  Location,   Inventory,   Order,   ConfigShipping,   PhpJs,   toaster,   $localStorage ){
    var self = this;
    var tran = $filter('translate');
    $state.go('order.create_once_global');
    $scope.fee_detail            = {};
    $scope.list_courier_detail   = [];
    
    $scope.list_ward_by_district = [];

    $scope.list_services = [
        {
            id      : 2,
            name    : 'Dịch vụ giao hàng nhanh',
            name_en	:'Express delivery service'
        },
        {
            id      : 1,
            name    : 'Dịch vụ giao hàng tiết kiệm',
            name_en	:'Economy delivery service'
        }
    ];
    
    $scope.calculateInfo = {
        selected_courier: ""
    }
    
    $scope.clearData = function (){
        $scope.Config = {
            Service     : 2,
            Protected   : "2",
            Payment     : 2,
            Type        : parseInt($localStorage['last_config_type_select']) || 2,
            Checking    : "1",
            Fragile     : "2"
        };
        $scope.From           = {

        };
        $scope.From.Inventory = {};
        $scope.To             = {
            Buyer: {
            }
        };
        $scope.Product        = {
            Amount : 0,
            Quantity: 1
        };
    }
    

    $scope.list_inventory   = {};  // danh sách kho hàng

    $scope.show_phone2 = false;


    var busy = false;
    $scope.loadInventory = function (params, q){
        params = params || {};
        if($stateParams.bc){
            params = angular.extend(params, {bc: $stateParams.bc});
        }
        if (busy && !params.lat) {
            return false;
        };
        busy = true;
        Inventory.loadWithPostOffice(params).then(function (result) {
            busy = false;
            if(!result.data.error){
                $scope.list_inventory           = result.data.data;
                
                if ($stateParams.bc && $stateParams.bc !== "" && $stateParams.bc !== null && $stateParams.bc !== undefined) {
                    result.data.data.forEach(function (value){
                        if (value.id == $stateParams.bc) {
                            $scope.From.Inventory = value;
                        };
                    })  
                }else {
                    $scope.From.Inventory = $scope.list_inventory[0];
                }
            }else {
                $rootScope.hasInventory = false;
            }
            $scope.showNotice();
        });
    }


    // Config fee
    ConfigShipping.load().then(function (result) {
        if(!result.data.error){
            $scope.config_fee               = result.data.data;
        }
    });


    




    // ---------------------- Phone validation ---------------- //

    var isTelephoneNumber = function (phone){
        var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
        var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
        if(phone.length !== _temp.length){
            return true;
        }
        return false;
    }

    $scope.phoneIsWrong = false;
    $scope.addingPhone = function (model){
        $scope.phoneIsWrong = false;
        angular.forEach(model, function (value){
            if(!isTelephoneNumber(value.text)){
                var result = chotot.validators.phone(value.text, true);
                if(result !== value.text){
                     $scope.phoneIsWrong = true;
                     return false;
                }
            }
        }) 
    }


    //---------------------------------------------------------//


    // ----------------------Format data-----------------------//
    function get_boxsize(data){
        if(data.L != undefined && data.L != '' &&
            data.W != undefined && data.W!= '' &&
            data.H != undefined && data.H != ''){
            var long    = data.L.toString().replace(/,/gi,"");
            var width   = data.W.toString().replace(/,/gi,"");
            var height  = data.H.toString().replace(/,/gi,"");

            return long+'x'+width+'x'+height;
        }else{
            return '';
        }
    }

    function get_phone(data){
        var phone = '';
        angular.forEach(data, function(value, key) {
            if(key == 0){
                phone += value.text;
            }else if(key == 1){
                phone += ','+value.text;
            }
        });
        return phone;
    }

    function get_number(data){
        if(data != undefined && data != ''){
            if(typeof data == 'string'){
                return data.toString().replace(/,/gi,"");
            }else {
                return data.toString();
            }
        }
        return 0;
    }

    $scope.get_number = get_number;

    // ------------------------------------------------------ //
    var isFromStock = function (){
        return !$scope.From.Inventory.post_office || $scope.From.Inventory.post_office == false;
    }

    var BuildData = function (isCalculate){
        var weight  = $scope.Product.Weight  ? get_number($scope.Product.Weight)     : 0;

        var price   = $scope.Product.Price   ? get_number($scope.Product.Price)      : 0;
        var size    = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize)   : "";

        var data = {
            Domain: 'seller.shipchung.vn'
        }



        data['From'] = {
            City        : $scope.From.Inventory.city_id,
            Province    : $scope.From.Inventory.province_id
        }
        // FROM 
        if(isFromStock()){
                data['From']['Stock'] =  $scope.From.Inventory.id;
        }else {
            data['From'] = {};
            data['From']['PostCode'] = $scope.From.Inventory.id;
        }

        if($scope.From.Inventory.ward_id != undefined && $scope.From.Inventory.ward_id > 0){
            data['From']['Ward']    = $scope.From.Inventory.ward_id;
        }


        // TO 

        data['To'] = {
            City        : $scope.To.Buyer.Area.city_id,
            Province    : $scope.To.Buyer.Area.district_id,
            Address     : $scope.To.Buyer.Address,
        };

        if ($scope.To.Buyer.ward_id && $scope.To.Buyer.ward_id > 0) {
            data['To']['Ward'] = $scope.To.Buyer.ward_id
        }

        


        data['Order']   = {
            Weight: +weight, 
            Amount: +price,
            Quantity: $scope.Product.Quantity || 1
        };


        if(size != ''){
            data['Order']['BoxSize']    = size;
        }



        data['Config']  = {Service: +$scope.Config.Service, Protected: +$scope.Config.Protected, Checking: +$scope.Config.Checking, Fragile: 2};

        switch (parseInt($scope.Config.Type)){
            case 1: 
                data['Config']['CoD']        = 1;
                data['Config']['Payment']    = 1;
                data['Config']['PaymentCod'] = 2;
            break;

            case 2: 
                data['Config']['CoD']       = 1;
                data['Config']['Payment']   = 2;
                data['Config']['PaymentCod'] = 1;
                
            break;

            case 3: 
                data['Config']['CoD']        = 1;
                data['Config']['Payment']    = 1;
                data['Config']['PaymentCod'] = 2;
            break;

            case 4: 
                data['Config']['CoD']        = 2;
                data['Config']['PaymentCod'] = 1;
                data['Config']['Payment']    = 2;
            break;

            case 5: 
                data['Config']['CoD']           = 2;
                data['Config']['Payment']       = 1;
                data['Config']['PaymentCod']    = 2;
            break;
        }


        $scope.Config.CoD     = data['Config']['CoD'];
        $scope.Config.Payment = data['Config']['Payment'];




        if ($scope.Product.MoneyCollect !== undefined && $scope.Product.MoneyCollect !== "" && $scope.Config.Type == 1) {
            data['Order']['Collect'] = get_number($scope.Product.MoneyCollect);

            // Chan tien thu ho phai >= tien hang
            /*
                if (get_number($scope.Product.MoneyCollect) > +price) {
                    data['Config']['CoD'] = 1;
                }else {
                    data['Config']['CoD'] = 2;
                }
            */        
        }



        if (isCalculate) {
            return data;
        };

        if (!$scope.Product.Name || $scope.Product.Name == "") {
            return 'Quý khách chưa nhập tên sản phẩm';
        }

        if (!$scope.To.Buyer.Phone || $scope.To.Buyer.Phone == "") {
            return 'Quý khách chưa nhập số điện thoại người nhận';
        }

        if (!$scope.To.Buyer.Address || $scope.To.Buyer.Address == "") {
            return 'Quý khách chưa nhập địa chỉ người nhận';
        }

        data['From']['Address'] = $scope.From.Inventory.address;
        data['From']['Phone']   = $scope.From.Inventory.phone;
        data['From']['Name']    = $scope.From.Inventory.user_name;

        var phone               = [$scope.To.Buyer.Phone];

        if ($scope.To.Buyer.Phone2) {
            phone.push($scope.To.Buyer.Phone2);
        }

        data['To']['Address']   = $scope.To.Buyer.Address;
        data['To']['Phone']     = phone.join();
        data['To']['Name']      = $scope.To.Buyer.Name;

        if ($scope.To.Buyer.Id && $scope.To.Buyer.Id > 0) {
            data['To']['BuyerId'] = $scope.To.Buyer.Id;
        }



        data['Order']['ProductName'] = $scope.Product.Name;

        if ($scope.Product.Code !== undefined && $scope.Product.Code !== "") {
            data['Order']['Code'] = $scope.Product.Code;
        }

        if ($scope.Product.Id !== undefined && $scope.Product.Id !== "") {
            data['Order']['ItemId'] = $scope.Product.Id;
        }

        

        data['Courier'] = $scope.calculateInfo.selected_courier.courier_id;

        return data;
    }



    // Re-Caculator fee on change data

    var calculateTimeout = null;
    $scope.waiting       = false;

    var FeeChange = function (newVal, OldVal){
        if (newVal !== undefined && newVal !== undefined ) {
            
            var weight = $scope.Product.Weight  ? get_number($scope.Product.Weight) : 0;
            var price  = $scope.Product.Price   ? get_number($scope.Product.Price)   : 0;
            var size   = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize)   : "";

            if (
                $scope.To.Buyer.Area  && $scope.To.Buyer.Area.district_id && $scope.To.Buyer.Area.city_id &&
                $scope.From.Inventory && $scope.From.Inventory.id > 0 &&
                (weight > 0 || size != "") &&
                price > 0
            ) {

                $scope.waiting = true;

                if (calculateTimeout) {
                    $timeout.cancel(calculateTimeout);
                }

                var data = BuildData(true);
                
                calculateTimeout = $timeout(function() {
                    
                    if ($scope.Config.Type == 1 && (!data['Order']['Collect'] || data['Order']['Collect'] == "")) {
                        $timeout(function (){
                            $('#money_collect').focus().addClass('ng-invalid').addClass('ng-dirty');
                        }, 100);
                        //$timeout.cancel(calculateTimeout);
                        //return $scope.waiting = false; 
                    }
                    
                    if (!data) {
                        $timeout.cancel(calculateTimeout);
                        return $scope.waiting = false; 

                    };

                    

                    

                    var currentDate = new Date();
                    if (data['Config']['Service'] == 2 && (data['From']['City'] == data['To']['City']) && currentDate.getHours() > 10) {
                        if (isNoiThanh(data['To']['Province'])) {
                            openDialogOverPickupTime();
                        }
                    }





                    Order.Calculate(data).then(function (result) {
                        $scope.waiting = false; 
                        if(!result.data.error){
                            $scope.fee_detail       = result.data.data;

                            // Cấu hình  thu phí CoD

                            /*if($scope.config_fee && $scope.config_fee.cod_fee == 1){ // người mua trả phí
                                $scope.fee_detail.seller.discount -= +$scope.fee_detail.vas.cod;
                            }*/

                            if(!$scope.fee_detail.courier.me){
                                $scope.fee_detail.courier.me        = [];
                                $scope.calculateInfo.selected_courier = $scope.fee_detail.courier.system[0];
                            }else {
                                $scope.calculateInfo.selected_courier = $scope.fee_detail.courier.me[0];
                            }

                            if(!$scope.fee_detail.courier.system){
                                $scope.fee_detail.courier.system    = [];
                            }


                            $scope.list_courier_detail  = PhpJs.array_merge_recursive($scope.fee_detail.courier.me, $scope.fee_detail.courier.system);

                            if($scope.Config.Type == 2 || $scope.Config.Type == 4){
                                $scope.fee_detail.collect    += $scope.calculateInfo.selected_courier.money_pickup;
                            }


                        }else {
                            HandlerError(result.data);
                            //toaster.pop('warning', 'Thông báo', result.data.message);
                            $scope.fee_detail   = {};
                        }
                    })
                }, 2000);
                
                
            }else {
                $scope.waiting = false;
            }
        };
    };


    $scope.$watch('calculateInfo.selected_courier', function (Value, OldValue){
        if($scope.Config.Type == 2 || $scope.Config.Type == 4){
            if(Value != undefined && Value.courier_id != undefined){
                var oldv = 0;
                var newv    = 1 * Value.money_pickup.toString().replace(/,/gi,"");

                if(OldValue.money_pickup != undefined){
                    oldv    = 1 * OldValue.money_pickup.toString().replace(/,/gi,"");
                    if(oldv > 0){
                        $scope.fee_detail.collect    -= oldv;
                    }
                    $scope.fee_detail.collect    += newv;
                }
            }
        }
    });


    $scope.$watch('From.Inventory.Area.district_id', function (newVal, oldVal){
        if ( newVal !== null && newVal !== undefined && newVal !== "" && parseInt(newVal) > 0 ) {
            Location.ward(newVal,'all').then(function (wards) {
                $scope.list_ward = wards.data.data;
            });   
        }
    })




    $scope.$watch('To.Buyer.Area.district_id', function (newVal, OldVal){
        if ($scope.To.Buyer && parseInt($scope.To.Buyer.ward_id) > 0) {
            $scope.To.Buyer.ward_id    = 0;
        }
        if (newVal && newVal > 0 && newVal != OldVal) {
            $scope.list_ward_by_district = [];
            $scope.list_ward_by_district = AppStorage.getWardByDistrict(newVal);
        }
    });


    // Validate phone 2
    $scope.phone2IsWrong = false;
    $scope.$watch('To.Buyer.Phone2', function (newVal, OldVal){
        $scope.phone2IsWrong = false;
        if (newVal && newVal != OldVal && newVal.length > 5) {
            if(!isTelephoneNumber(newVal)){
                var result = chotot.validators.phone(newVal, true);
                if(result !== newVal){
                     $scope.phone2IsWrong = true;
                     return false;
                }
            }
        }
    });

    $scope.$watch('Config.Type', function (newVal, oldVal){
        if (newVal) {
            $scope.fee_detail = {};
            $scope.calculateInfo.selected_courier = "";
            $scope.money_collect = 0;
        }
    })





    var openDialog = function (title, message, callback){
        bootbox.dialog({
            message: message,
            title: title,
            buttons: {
                main: {
                    label: "Đóng",
                    className: "btn-default", 
                    callback: callback || function (){}
                },
            }
        });
    }

    var openDialogCreateSuccess = function (tracking_code, callback){
        bootbox.dialog({
            message: "Đơn hàng <strong>"+tracking_code+"</strong> đã tạo thành công, quý khách đừng quên duyệt đơn hàng này khi đã sẵn sàng để báo hãng vận chuyển tới lấy hàng. <br/><br/>Chúc quý khách một ngày tốt lành!",
            title: "Tạo đơn hàng thành công",
            buttons: {
                main: {
                    label: "Tạo đơn khác",
                    className: "btn-info", 
                    callback:  function (){
                        $scope.addTabs()
                    }
                },
            }
        });
    }

    var openDialogAcceptSuccess = function (tracking_code, courier_id, callback){ 
        var currentDate = new Date();
        var timePickup  = "hôm nay";
        var moment_time = moment().minute(0).second(0);
        if (currentDate.getTime() > moment().hour(14)) {
            timePickup  = "ngày mai";
        };

        bootbox.dialog({
            message: "Đơn hàng <strong>"+tracking_code+"</strong> đã duyệt thành công. Đơn hàng này sẽ được đối tác vận chuyển <strong>" + $scope.courier[courier_id]+"</strong> qua lấy hàng trong " + timePickup + ". Quý khách đừng quên thường xuyên theo dõi đơn hàng này trên hệ thống của chúng tôi để giao hàng tốt nhất.<br/><br/>Chúc quý khách một ngày tốt lành!",
            title: "Duyệt đơn hàng thành công!",
            buttons: {
                print: {
                    label: "In phiếu gửi vận đơn",
                    className: "bg-orange", 
                    callback: function (){
                        window.open('http://seller.shipchung.vn/#/print_hvc?code=' + tracking_code, '_blank')
                    }
                },
                main: {
                    label: "Tạo đơn khác",
                    className: "btn-info", 
                    callback: function (){
                        $scope.addTabs();
                    }
                },

            }
        });
    }


    var openDialogCollectNotEnought = function (tracking_code, callback){ 
        bootbox.dialog({
            message: "Số dư khả dụng của quý khách không đủ để duyệt đơn hàng này! Quý khách vui lòng nạp thêm tiền vào trong tài khoản để duyệt đơn hàng. <br/><br/>Xem hướng dẫn nạp tiền <a href='https://www.shipchung.vn/ho-tro/nap-tien-vao-tai-khoan/' target='_blank'><span class='text-info'>tại đây</span></a>.",
            title: "Số dư của bạn không đủ để duyệt đơn hàng",
            buttons: {
                print: {
                    label: "Lưu đơn duyệt sau",
                    className: "bg-orange", 
                    callback: function (){
                        $scope.CreateOrder(false);
                    }
                }
                // main: {
                //     label: "Nạp tiền ngay",
                //     className: "btn-info", 
                //     callback: function (){
                //         $scope.cash_in('');
                //     }
                // },

            }
        });
    }

    var openDialogOverPickupTimeRejected = false;

    var openDialogOverPickupTime = function (){

        if (openDialogOverPickupTimeRejected || parseInt($localStorage['reject_popup_pickup_time'] >= 3)) {
            return false;
        }
        openDialogOverPickupTimeRejected = true;

        bootbox.dialog({
            message: "Đã qua khung giờ lấy hàng (Trước 10:00 sáng) hỗ trợ giao hàng trong ngày, do đó bạn nên chuyển qua dịch vụ giao hàng tiết kiệm để giảm chi phí.<br/><br/>Nếu đơn hàng được duyệt trước 2h sẽ lấy hàng trong ngày, sau thời gian này đơn hàng sẽ được lấy vào ngày hôm sau.",
            title: "Bạn nên chuyển sang dịch vụ chuyển phát tiết kiệm",
            buttons: {
                print: {
                    label: "Giữ nguyên",
                    className: "bg-default", 
                    callback: function (){
                        
                        $localStorage['reject_popup_pickup_time'] = parseInt($localStorage['reject_popup_pickup_time']) + 1;
                    }
                },
                main: {
                    label: "Đổi qua dịch vụ tiết kiệm",
                    className: "btn-info", 
                    callback: function (){
                        $scope.Config.Service = "1";
                    }
                },

            }
        });
    }

    var isNoiThanh = function (district_id){
        var flag = false;
        angular.forEach($rootScope.list_district_by_location, function (value){
            if (value == district_id) {
                flag = true;
            };
        });
        return flag;
    }


    





    var HandlerError = function (data){
        switch(data.code){
            case "UNSUPPORT_DELIVERY": 
                return openDialog("Shipchung chưa hỗ trợ phát hàng khu vực này", "Rất xin lỗi quý khách, chúng tôi chưa hỗ trợ phát hàng tới khu vực này do chưa có đối tác giao hàng đảm bảo chất lượng dịch vụ tốt và ổn định hoặc khu vực này có tỷ lệ chuyển hoàn quá cao.");
            break;
            case "UNSUPPORT_PICKUP": 
                return openDialog("Shipchung chưa hỗ trợ lấy hàng khu vực này", "Rất xin lỗi quý khách, chúng tôi chưa hỗ trợ lấy hàng tại khu vực của bạn đang kinh doanh.");
            break;
            case "FAIL": 
                return openDialog("Tạo/duyệt đơn hàng không thành công", "Rất xin lỗi quý khách! Đơn hàng này tạo/duyệt chưa thành công vì vấn đề kỹ thuật. <br/><br/>Quý khách xin vui lòng quay lại trong ít phút tới hoặc liên hệ tổng đài CSKH của chúng tôi để được hỗ trợ (Hotline: 1900-636-060).");
            break;
            case 'NOT_ENOUGH_MONEY':
                return openDialogCollectNotEnought();
            break;
        }

        return toaster.pop('warning', tran('toaster_ss_nitifi'), data.error_message || data.message)
    }







    $scope.trustHtml = function (html){
        return $sce.trustAsHtml(html);
    }

    $scope.createWaiting = false;
   
    $scope.CreateOrder = function (isAutoAccept){
        var data = BuildData(false);
        if (typeof data == 'string') {
            return toaster.pop('warning', tran('toaster_ss_nitifi'), data);
        }
        isAutoAccept = isAutoAccept || false;

        data['Config']['AutoAccept'] = isAutoAccept ? 1 : 0;
        if($rootScope.ViewHomeCurrency != $rootScope.exchangeRate) {
        	data['Config']['exchangeRate'] = $rootScope.exchangeRate;
        }
        //console.log(data)
        
        $scope.createWaiting = true;
        Order.CreateV2(data).then(function (result) {
            $scope.createWaiting = false;
            if(!result.data.error){
                
                $scope.NewOrder    = {
                  'TrackingCode'    :   result.data.data.TrackingCode,
                  'CourierId'       :   result.data.data.CourierId,
                  'MoneyCollect'    :   result.data.data.MoneyCollect,
                  'status'          :   isAutoAccept ? 21 : 20
                };

                if($rootScope.userInfo.first_order_time == 0){
                    $rootScope.userInfo.first_order_time = 1;
                }
                
                if (isAutoAccept) {
                    openDialogAcceptSuccess($scope.NewOrder.TrackingCode, $scope.NewOrder.CourierId);
                 // Intercom   
                    try {
                    	if($rootScope.userInfo.first_order_time == 1){
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create and approve order",
             	                   links		:   "order/create-v2",
             	                  first_order_approved:1
                 			};
                    		window.Intercom('update', {first_order_approved :1});
                    	}else{
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create and approve order",
             	                   links		:   "order/create-v2",
                 			};
                    	}
            			Intercom('trackEvent', 'Accept Order', metadata);
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                }else {
                    openDialogCreateSuccess($scope.NewOrder.TrackingCode);
                    //console.log($rootScope.userInfo)
                    // Intercom   
                    try {
                    	if($rootScope.userInfo.first_order_time == 1){
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create order",
             	                   links		:   "order/create-global-bm",
             	                   first_order_created:1
                 			};
                    		window.Intercom('update', {first_order_created :1});
                    	}else{
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create order",
             	                   links		:   "order/create-global-bm",
                 			};
                    	}
                    	
            			Intercom('trackEvent', 'Create order', metadata);
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
                }
                
                $localStorage['last_config_type_select'] = $scope.Config.Type;
                
            }else {

                HandlerError(result.data);
            }
        })
    }




    $scope.addInventory = function (){
        $scope.From.Inventory = {};
        setTimeout(function (){
            $("#inventory_phone").focus();
        }, 200);
    }

    $scope.saveInventoryLoading = false;
    $scope.saveInventory = function (item){
        if (!item.Area.city_id) {
            //return toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn khu vực');
            return toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaChonKHuVuc'));
        }
        if (!get_phone(item.phone) && get_phone(item.phone) == "") {
            //return toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập số điện thoại liên hệ ');
            return toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaNhapSDT'));
        }

        if (!item.ward_id) {
            //return toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn phường/xã');
            return toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_BanChuaChonPhuongXa'));
        };

        var data = {
            name        : "Kho - " + item.Area.full_address,
            user_name   : item.user_name,
            phone       : get_phone(item.phone),
            address     : item.address,
            ward_id     : item.ward_id,
            province_id : item.Area.district_id,
            city_id     : item.Area.city_id,
            active      : 1,
        }
        $scope.saveInventoryLoading = true;
        Inventory.create(data).then(function (result) {
            $scope.saveInventoryLoading = false;
            if (result.data.error) {
                //return toaster.pop('warning', 'Thông báo', 'Tạo kho không thành công, quý khách vui lòng thử lại sau hoặc liên hệ bộ phân CSKH của Shipchung để được hỗ trợ !');
                return toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_TaoKhoKhongThanhCong'));
            }
            $scope.loadInventory($rootScope.pos, null);
        })

    }

    $scope.cancelAddInventory = function (){
        $scope.loadInventory($rootScope.pos, null);
    }


    var boxSizeChange = function (newVal, OldVal){
        if (newVal) {
            if (parseInt($scope.Product.BoxSize.L) > 0 && parseInt($scope.Product.BoxSize.H) > 0 && parseInt($scope.Product.BoxSize.W) > 0) {
                FeeChange(newVal, OldVal);
            }
        };
    }

    
    

    $scope.$watch('To.Buyer.Area', FeeChange);
    $scope.$watch('Product.Weight', FeeChange);
    $scope.$watch('Product.Price', FeeChange);
    $scope.$watch('Product.MoneyCollect', FeeChange);
    $scope.$watch('Product.BoxSize.W', boxSizeChange);
    $scope.$watch('Product.BoxSize.H', boxSizeChange);
    $scope.$watch('Product.BoxSize.L', boxSizeChange);
    $scope.$watch('From.Inventory', FeeChange);
    $scope.$watch('Config.Service', FeeChange);
    $scope.$watch('Config.Protected', FeeChange);
    $scope.$watch('Config.Type', FeeChange);

    $scope.$watch('box_size_check', function (newVal, Old){
        $scope.Product.BoxSize  = '';
        if (newVal !== undefined) {
            if (newVal == false && get_number($scope.Product.Weight) > 0) {
                FeeChange(newVal, Old);
            }
        }
    })


    // Get location ;

    navigator.geolocation.getCurrentPosition(function (pos){
        var crd = pos.coords;
        $rootScope.pos = {
            lat: crd.latitude,
            lng: crd.longitude
        };
        $scope.loadInventory($rootScope.pos, null);

    }, function (){
        $scope.loadInventory($rootScope.pos, null);
    }, {});


    $scope.clearData();
    $scope.loadInventory($rootScope.pos, null);


}]);







    




