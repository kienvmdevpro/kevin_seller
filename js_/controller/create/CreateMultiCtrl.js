'use strict';

angular.module('app').controller('CreateMultiCtrl', ['$scope', '$http', '$timeout', 'PhpJs', 'toaster','Inventory', 'Location', 'OrderStatus', 'Order', 'ConfigShipping', 'Analytics',
 	function($scope, $http, $timeout, PhpJs, toaster, Inventory, Location, OrderStatus, Order, ConfigShipping, Analytics) {
        var timeout;

        $scope.list_data        = {};
        $scope.list_city        = {};
        $scope.list_inventory   = {};  // kho hàng
        $scope.Inventory        = {};
        $scope.list_district    = {};
        $scope.check_box        = [];
        $scope.list_order       = {};

        $scope.total_collect    = 0;
        $scope.total_fee        = 0;

        $scope.list_pay_pvc     = OrderStatus.list_pay_pvc;
        $scope.service          = OrderStatus.service;
        $scope.config_fee       = {};
        $scope.list_order       = [{waiting: false, loadingLocations : false, service : '2', total_quantity: 1, checked: true, check: true }];


        Analytics.trackPage('/create_order/multi');

        Inventory.load().then(function (result) { // inventory
            if(result.data.data){
                $scope.list_inventory           = result.data.data;
                $scope.Inventory                = $scope.list_inventory[0];
            }
        });

        $scope.getLocation  = function(val, order){
            order.loadingLocations  = true;
            return Location.SuggestAll(val).then(function (result) {
                if(result){
                    order.loadingLocations  = false;
                    return result.data.data.hits.hits.map(function(item){
                        return item._source;
                    });
                }
                return;
            });
        }

        // Config fee
        ConfigShipping.load().then(function (result) {
            if(!result.data.error){
                $scope.config_fee               = result.data.data;
            }
        });

        $scope.add = function(){
            $scope.list_order.push({waiting: false, loadingLocations : false, service : '2', total_quantity: 1, checked: true, check: true });
        }

        $scope.delete   = function(){
            angular.forEach($scope.list_order, function(value, key) {
                if(value.check){
                    value.delete = 1;
                }
            });

            $scope.calculate();
        }

        $scope.calculate    = function(){
            $scope.total_collect    = 0;
            $scope.total_fee        = 0;
            angular.forEach($scope.list_order, function(value, key) {
                if(value.delete != 1){
                    $scope.total_collect    = 1*$scope.total_collect + 1*get_number(value.money_collect);
                    $scope.total_fee        = 1*$scope.total_fee + 1*get_number(value.vas);
                }
            });
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

        $scope.change_courier   = function(item){
            if(item.tracking_code) return;
            item.vas    = item.fee_detail.pvc + item.fee_detail.vas.cod + item.fee_detail.vas.protected - item.fee_detail.discount.pvc - item.fee_detail.discount.pcod + item.courier.money_pickup;

            item.money_collect  = item.fee_detail.collect;
            if($scope.config_fee && $scope.config_fee.cod_fee == 1){ // người mua trả phí
                item.fee_detail.seller.discount -= +item.fee_detail.vas.cod;
                item.money_collect += 1*item.fee_detail.vas.cod;
            }

            if(item.config == 1 || item.config == 4){
                item.money_collect += item.courier.money_pickup;
            }

            $scope.calculate();
        }

        $scope.create_multi = function(key){
            if($scope.list_order[key] != undefined){
                if($scope.list_order[key]['check'] == 1){
                        return $scope.create($scope.list_order[key], key);
                }else{
                    return $scope.create_multi(key + 1);
                }
            }

            toaster.pop('success', 'Thông báo', 'Kết thúc');
        }

        var get_data = function(item){
            var data        = {'Domain'    : 'shipchung.vn'};

            data['From']    = {Stock: $scope.Inventory.id};

            data['To']      = {City: item.to_location.city_id, Province: item.to_location.district_id};
            if(item.to_location.ward_id != undefined && item.to_location.ward_id > 0){
                data['To']['Ward']    = item.to_location.ward_id;
            }

            data['To']['Address']   =  item.to_address;

            data['Order']   = {Weight: +get_number(item.weight), Amount: +get_number(item.amount)};
            data['Config']  = {Service: +item.service};

            if(item.protected){
                data['Config']['Protected'] = 1;
            }else{
                data['Config']['Protected'] = 2;
            }

            if(item.checked){
                data['Config']['Checking'] = 1;
            }else{
                data['Config']['Checking'] = 2;
            }

            if(item.fragile){
                data['Config']['Fragile'] = 1;
            }else{
                data['Config']['Fragile'] = 2;
            }

            if(item.config == 1){
                data['Config']['CoD']       = 1;
                data['Config']['Payment']   = 2;
            }else if(item.config == 2){
                data['Config']['CoD']       = 1;
                data['Config']['Payment']   = 1;
            }else if(item.config == 3){
                data['Config']['CoD']       = 2;
                data['Config']['Payment']   = 2;
            }else{
                data['Config']['CoD']       = 2;
                data['Config']['Payment']   = 1;
            }

            return data;
        }

        $scope.change_inventory = function(){
            $scope.list_order       = [{checked: 1, waiting: false, loadingLocations : false, service: '2'}];
            $scope.calculate();
        }

        $scope.change   = function(item){

            if(
                item.tracking_code ||
                item.loadingLocations == true ||
                $scope.Inventory.id == undefined || $scope.Inventory.id == 0 ||
                (item.to_location == undefined || item.to_location == '' || item.to_location.city_id == undefined
                || item.to_location.city_id == '' || item.to_location.city_id == 0
                || item.to_location.district_id == '' || item.to_location.district_id == 0
                )
                || item.service == undefined || item.service == ''
                || item.weight == undefined || item.weight < 1 || item.amount == undefined || item.amount < 1
                || item.config == undefined || item.config < 1){
                return;
            }

            if(timeout){
                $timeout.cancel(timeout);
            }

            timeout = $timeout(function(){
                item.waiting    = true;

                var data        = get_data(item);
                item.fee_detail = {};

                item.list_courier     = [];
                item.courier          = {};

                Order.Calculate(data).then(function (result) {
                    if(!result.data.error){
                        item.fee_detail       = result.data.data;

                        // Thu hộ bao gồm vas
                        item.money_collect    = item.fee_detail.collect + item.fee_detail.vas.protected ;
                        // Cấu hình  thu phí CoD
                        if($scope.config_fee && $scope.config_fee.cod_fee == 1){ // người mua trả phí
                            item.fee_detail.seller.discount -= +item.fee_detail.vas.cod;
                            item.money_collect += 1*item.fee_detail.vas.cod;
                        }

                        if(item.fee_detail.courier.me){
                            item.courier        =   item.fee_detail.courier.me[0];
                        }else{
                            item.courier        =   item.fee_detail.courier.system[0];
                            item.leatime_total  =   item.fee_detail.courier.system[0].leatime_total;
                            item.fee_detail.courier.me        = [];
                        }

                        if(!item.fee_detail.courier.system){
                            item.fee_detail.courier.system    = [];
                        }

                        item.list_courier = PhpJs.array_merge_recursive(item.fee_detail.courier.me,item.fee_detail.courier.system);

                        item.vas    = item.fee_detail.pvc + item.fee_detail.vas.cod + item.fee_detail.vas.protected - item.fee_detail.discount.pvc - item.fee_detail.discount.pcod + item.courier.money_pickup;

                    }else{
                        toaster.pop('warning', 'Thông báo', result.data.message);
                        item.list_courier   = {};
                        item.courier        = {};
                        item.money_collect  = 0;
                        item.vas            = 0;
                        item.leatime_total  = 0;
                    }

                    $scope.calculate();
                    item.waiting  = false;
                });

            },1000);

            item.waiting  = false;
        }

        $scope.create   = function(item, key){
            if(item.waiting || item.tracking_code || item.delete == 1)
                return key != undefined ? $scope.create_multi(key + 1) : true;

            if($scope.Inventory.id == undefined || $scope.Inventory.id == 0){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn kho hàng !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.to_location == undefined || item.to_location == ''
                || item.to_location.city_id == undefined
                || item.to_location.city_id == '' || item.to_location.city_id == 0
                || item.to_location.district_id == '' || item.to_location.district_id == 0){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn Quận/Huyện - Tỉnh/Thành phố nhận hàng !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if($scope.Inventory.id == undefined || $scope.Inventory.id == 0){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn kho hàng !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.weight == undefined || item.weight == ''){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập khối lượng !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.amount == undefined || item.amount == ''){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập giá sản phẩm !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.config == undefined || item.config == ''){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn hình thức vận chuyển !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.service == undefined || item.service == ''){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn dịch vụ vận chuyển !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.to_name == undefined || item.to_name == '' || item.to_phone == undefined || item.to_phone == ''
                || item.to_address == undefined || item.to_address == ''
            ){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập thông tin người nhận !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.name == undefined || item.name == ''){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập tên sản phẩm !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.courier == undefined || item.courier.courier_id == undefined || item.courier.courier_id < 1){
                toaster.pop('warning', 'Thông báo', 'Bạn chưa chọn hãng vận chuyển !');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            if(item.money_collect == undefined){
                toaster.pop('warning', 'Thông báo', 'Hãy thử lại!');
                return key != undefined ? $scope.create_multi(key + 1) : true;
            }

            item.waiting    = true;

            var data        = get_data(item);
            data['Order']['Quantity']           = item.total_quantity;
            data['Order']['ProductName']        = item.name;
            data['Order']['Description']        = item.description;

            data['To']['Name']                  = item.to_name;
            data['To']['Phone']                 = item.to_phone;
            data['Order']['Collect']            = get_number(item.money_collect);
            data['Courier']                     = item.courier.courier_id;

            item.tracking_code  = 'shipchung';

            Order.Create(data).then(function (result) {
                item.waiting    = false;
                if(!result.data.error){
                    item.tracking_code  = result.data.data.TrackingCode;
                }else{
                    item.tracking_code  = '';
                }

                return key != undefined ? $scope.create_multi(key + 1) : true;
            });

        }

    }
]);
