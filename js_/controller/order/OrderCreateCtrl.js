'use strict';

//List Order
angular.module('app').controller('OrderCreateCtrl', ['$scope', '$http', '$state', '$window', '$timeout', '$rootScope', '$modal', 'bootbox', 'toaster', 'Location', 'Inventory', 'Order', 'ConfigShipping', 'PhpJs', '$sce', '$localStorage', 'Analytics', 'AppStorage',
 	function($scope, $http, $state, $window, $timeout, $rootScope, $modal, bootbox, toaster, Location, Inventory, Order, ConfigShipping, PhpJs, $sce, $localStorage, Analytics, AppStorage) {
    var timeout;

    //config
    $scope.OrderFee         = {Service:2, Inventory:'', ToLocation: {city_id : '', district_id: ''}, Weight: '', Amount: '', BoxSize: '', Protected: 2, Payment: 2, CoD: 1};
    $scope.OrderDetail      = {Fragile: 2, Checking: 1};
    $scope.OrderDetail.Item = {};
    $scope.Order            = {};
    $scope.list_inventory   = {};  // kho hàng
    $scope.fee_detail       = {};
    $scope.frm_submit       = false;
    $scope.show_size        = false;
    $scope.show_address     = false;
    $scope.list_city        = {};
    $scope.money_collect    = 0;
    $scope.waiting          = false;
    $scope.waiting_status   = false;
    $scope._SuggestBuyerModel    = "";
    $scope._SuggestProductModel  = "";
    
    var dist_select2 = {};

    Analytics.trackPage('/create_order/single');


    $scope.select2Options = {
        allowClear  :   true
    };
      
    // Action



    $scope.loadInventory = function (params, q){
        if(q){
            params = angular.extend(params, {q: q});
        }
        Inventory.loadWithPostOffice(params).then(function (result) {
            if(result){
                $scope.list_inventory           = result.data.data;
                $scope.OrderFee.Inventory       = $scope.list_inventory[0];
            }
        });
    }

    

    
    $scope.loadInventory($rootScope.pos, null);
    


    // Config fee
    ConfigShipping.load().then(function (result) {
        if(!result.data.error){
            $scope.config_fee               = result.data.data;
            if($scope.config_fee.shipping_fee == 3 || $scope.config_fee.shipping_fee == 1){
                $scope.OrderFee.Payment  = 1;
            }
        }
    });


    $scope.trustHtml = function (html){
        return $sce.trustAsHtml(html);
    }



    $scope.getDistrict = function (City, callback){
        dist_select2 =  $("#district-select2").select2({
            theme: "bootstrap"
        });
        $scope.OrderFee.ToLocation.district_id = "";

        $scope.districts = [];
        $timeout(function (){
            if(callback && typeof callback == 'function'){
                callback();
            }


            dist_select2.val(null).trigger("change"); 

            $scope.districts  =  AppStorage.getDistrictByCity(City);
        });
            
        
    }
    
    $scope.getLocation  = function(val){
        return Location.SuggestAll(val).then(function (result) {
            if(result){
                return result.data.hits.hits.map(function(item){
                    return item._source;
                });
            }
            return;
        });
    }
    $scope.onsuggestProductSelected = function ($item, $model, $label){
        if($item){
            
            $scope.OrderDetail.Item = ($scope.OrderDetail.Item) ? $scope.OrderDetail.Item : {};
            $scope.OrderDetail.Item.Name = $item.name;
            $scope.OrderDetail.Quantity = 1;      
            $scope.OrderFee.Amount = $item.price;
            $scope.OrderFee.Weight = $item.weight;
            
        }else {
            $scope.OrderDetail.Item = ($scope.OrderDetail.Item) ? $scope.OrderDetail.Item : {};
            $scope.OrderDetail.Item.Name = $label;
            $scope.OrderDetail.Quantity = 1;
            $scope.OrderFee.Amount = 0;
            $scope.OrderFee.Weight = 0;
        }
        
        
    }



    $scope.suggestProduct = function (val){
        return Order.suggestProductInfo(val).then(function (result) {
            if(result){
                return result.data.data.hits.hits.map(function(item){
                    return item._source;
                });
            }
            return;
        });
    }


    $scope.onsuggestBuyerSelected = function ($item, $model, $label){
        if($item){
            $scope.OrderDetail.Name = $item.fullname;
            $scope.OrderDetail.Phone = [];
            $scope.OrderDetail.Phone.push($item.phone);
            $scope.OrderDetail.Email = $item.email;
            $scope.OrderDetail.Address = $item.address;
            $scope.OrderFee.ToLocation.city_id = $item.city_id;

            $scope.$on('districtLoaded', function (){
                if($rootScope.$$listeners['districtLoaded']){
                    $rootScope.$$listeners['districtLoaded'] = [];
                }
                $timeout(function (){
                    if($item.ward_id && $item.ward_id > 0){
                        $scope.OrderFee.ToLocation.district_id = $item.province_id + '-' + $item.ward_id;    
                    }else {
                        $scope.OrderFee.ToLocation.district_id = $item.province_id + '-';         
                    }
                })
            })
            
            return;
        }
        
        $scope.OrderDetail.Name = $label;
        $scope.OrderDetail.Phone = [];
        $scope.OrderDetail.Email = "";
        $scope.OrderDetail.Address = "";
        $scope.OrderFee.ToLocation.city_id = 0;
        $scope.OrderFee.ToLocation.district_id = 0;

        

        //$scope.OrderDetail.Quantity = 0;
    }

    $scope.suggestBuyer = function (val){
        return Order.suggestBuyerInfo(val).then(function (result) {
            if(result){
                return result.data.data.hits.hits.map(function(item){
                    return item._source;
                });
            }
            return;
        });
    }

    AppStorage.loadCity(function (cities){
        $scope.list_city  = cities;
        if(cities.length == 0){
            toaster.pop('warning', 'Thông báo', 'Tải danh sách Tỉnh/Thành Phố lỗi !');
        }
    })
    /*Location.province('all').then(function (result) {
        if(result){
            if(!result.data.error){
                $scope.list_city        = result.data.data;

            }else{
                toaster.pop('warning', 'Thông báo', 'Tải danh sách Tỉnh/Thành Phố lỗi !');
            }
        }else{
            toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại !');
        }
    });*/

    function get_boxsize(data){
        if(data.longs != undefined && data.longs != '' &&
            data.width != undefined && data.width!= '' &&
            data.height != undefined && data.height != ''){
            var long    = data.longs.toString().replace(/,/gi,"");
            var width   = data.width.toString().replace(/,/gi,"");
            var height  = data.height.toString().replace(/,/gi,"");

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
    
    // create lading
    $scope.CreateOrder  = function(order_detail,order_fee){

        
        if($scope.waiting){
            return;
        }

        if(order_detail.Quantity == undefined || order_detail.Quantity <= 0){
            toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập số lượng đơn hàng !');
            return;
        }

        if(order_detail.Phone == undefined || order_detail.Phone == ''){
            toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập số điện thoại người nhận !');
            return;
        }

        var _productName;
        if(angular.isObject($scope._SuggestProductModel)){
            _productName        = (order_detail.Item.Name && order_detail.Item.Name == $scope._SuggestProductModel.name) ? order_detail.Item.Name : $scope._SuggestProductModel.name;
        }else {
            _productName = $scope._SuggestProductModel;
        }

        if(_productName == ''){
            toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập tên sản phẩm !');
            return;
        }

        $scope.frm_submit   = true;
        $scope.Order        = {};
        var data            = {'Domain'    : 'shipchung.vn'};

        var phone           = get_phone(order_detail.Phone);
        var weight          = get_number(order_fee.Weight);
        var amount          = get_number(order_fee.Amount);

        data['From']    = {
            City: order_fee.Inventory.city_id, 
            Province: order_fee.Inventory.province_id,
            Address: order_fee.Inventory.address, 
            Phone: order_fee.Inventory.phone, 
            Name: order_fee.Inventory.user_name
            
        };

        if(!order_fee.Inventory.post_office || order_fee.Inventory.post_office == false){
            data['From']['Stock'] =  order_fee.Inventory.id;
        }else {
            data['From'] = {};
            data['From']['PostCode'] = order_fee.Inventory.id;


            

            //data['Type'] = 'excel';
        }
        

        if(order_fee.Inventory.ward_id != undefined && order_fee.Inventory.ward_id > 0){
            data['From']['Ward']    = order_fee.Inventory.ward_id;
        }

        var customerName;
        if(angular.isObject($scope._SuggestBuyerModel)){
            customerName    = (order_detail.Name && order_detail.Name == $scope._SuggestBuyerModel.fullname) ? order_detail.Name : $scope._SuggestBuyerModel.fullname;
        }else {
            customerName    = $scope._SuggestBuyerModel;
        }

        if(order_fee.ToLocationSuggest && order_fee.ToLocationSuggest.city_id > 0){

            data['To']      = {City: order_fee.ToLocationSuggest.city_id, Province: order_fee.ToLocationSuggest.district_id, Name: customerName, Phone: phone, Address: order_detail.Address, Email: order_detail.Email};
            if(order_fee.ToLocationSuggest.ward_id != undefined && order_fee.ToLocationSuggest.ward_id > 0){
                data['To']['Ward']    = order_fee.ToLocationSuggest.ward_id;
            }

        }else{

            data['To']       = {City: order_fee.ToLocation.city_id, Province: order_fee.ToLocation.district_id.split('-')[0], Name: customerName , Phone: phone, Address: order_detail.Address, Email: order_detail.Email};
            if(order_fee.ToLocation.district_id.split('-')[1]){
                data['To']['Ward'] = order_fee.ToLocation.district_id.split('-')[1];
            }

        }

        data['Order']           = {Weight: +weight, Amount: +amount, Quantity: order_detail.Quantity, ProductName: _productName, Description: order_detail.Description, Note: order_detail.Note};
        data['Config']          = {Service: +order_fee.Service, Protected: +order_fee.Protected, CoD: +order_fee.CoD, Payment: +order_fee.Payment, Fragile : +order_detail.Fragile, Checking: + order_detail.Checking};

        //get boxsize
        var size = get_boxsize(order_fee.BoxSize);
        if(size != ''){
            data['Order']['BoxSize']    = size;
        }

        if($scope.fee_detail.seller.discount != undefined && $scope.fee_detail.seller.discount != 0){
            var discount   = $scope.fee_detail.seller.discount.toString().replace(/,/,"");
            data['Order']['Discount']    = +discount;
        }

        if($scope.fee_detail.collect != undefined){
            data['Order']['Collect']     = $scope.fee_detail.collect;
        }

        data['Courier'] = order_detail.courier.courier_id;

//        console.log('create data', data);
        Order.Create(data).then(function (result) {
            if(!result.data.error){
                // newbie
                $scope.Order    = {
                  'TrackingCode'    :   result.data.data.TrackingCode,
                  'CourierId'       :   result.data.data.CourierId,
                  'MoneyCollect'    :   result.data.data.MoneyCollect,
                  'status'          :   20
                };

                $scope.districts = [];
                $scope._SuggestBuyerModel   = "";
                $scope.OrderDetail.Name     = "";
                $scope.OrderDetail.Phone    = [];
                $scope.OrderDetail.Email    = "";
                $scope.OrderDetail.Address  = "";
                $scope.OrderFee.ToLocation.city_id      = "";
                $scope.OrderFee.ToLocation.district_id  = "";

                if($scope.OrderFee.ToLocationSuggest){
                    $scope.OrderFee.ToLocationSuggest.district_id = "";
                }
                

                if(dist_select2){
                    dist_select2.val(null).trigger("change"); 
                }
                

                if($rootScope.userInfo.first_order_time == 0){
                    var modalInstance = $modal.open({
                        templateUrl: 'ModalBonus.html',
                        controller: 'ModalBonusCtrl'
                    });

                    modalInstance.result.then(function () {
                        $rootScope.userInfo.first_order_time = 1;
                    });
                }else {
                    $scope.popupCreateLadingSuccess($scope.Order);
                }
            }
            $scope.frm_submit   = false;
            return;
        });

    }


    var isTelephoneNumber = function (phone){
        var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
        var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
        if(phone.length !== _temp.length){
            return true;
        }
        return false;
    }

    $scope.phoneIsWrong = false;
    $scope.addingPhone = function (){
        $scope.phoneIsWrong = false;
        angular.forEach($scope.OrderDetail.Phone, function (value){
            if(!isTelephoneNumber(value.text)){
                var result = chotot.validators.phone(value.text, true);
                if(result !== value.text){
                     $scope.phoneIsWrong = true;
                     return false;
                }
            }
        }) 
    }
    

    $scope.$watch('_SuggestProductModel', function (NewVal, OldVal){
        $scope._SuggestProductModel = NewVal;
    })

    $scope.$watch('_SuggestBuyerModel', function (NewVal, OldVal){
        $scope._SuggestBuyerModel = NewVal;
    })
    // Watch change city and load district by city
    $scope.$watch('OrderFee.ToLocation.city_id', function (Value, OldValue){
        if(Value && Value > 0){
            $scope.getDistrict(Value, function (){
                $scope.$broadcast('districtLoaded');
            });   
        }
    });


    $scope.$watch('OrderFee.Inventory', function (Value, OldValue){
        if(Value.post_office == true){
            if($localStorage['confirm_inventory'] == true){
                return false;

            }
            bootbox.confirm( "Bạn có chắc chắn lựa chọn hình thức mang hàng ra bưu cục '" + Value.name +"' để gửi hàng?" , function (result) {
                if(result){
                    $scope.$apply(function (){
                        $localStorage['confirm_inventory'] = true;
                        $scope.OrderFee.Inventory = Value;
                    })
                }else {
                    $scope.$apply(function (){
                        /*$scope.money_collect = {};
                        $scope.fee_detail = {};*/
                        if(OldValue.post_office !== true){
                            $scope.OrderFee.Inventory = OldValue;
                        }else {
                            $scope.money_collect        = {};
                            $scope.fee_detail          = {};
                            $scope.OrderFee.Inventory = $scope.list_inventory[0];
                        }
                        
                    })
                    
                }
            });
        }
    })
    // caculate
    $scope.$watch('OrderFee', function(Value, OldValue){
        var weight                  = get_number(Value.Weight);
        var amount                  = get_number(Value.Amount);
        var size                    = get_boxsize(Value.BoxSize);
        $scope.waiting              = true;

        if(Value && Value.Service > 0
          && Value.Inventory && Value.Inventory.city_id > 0
          && ((weight > 0) || (size != ''))
          && amount > 0
          && ((Value.ToLocationSuggest && Value.ToLocationSuggest.city_id > 0) || (Value.ToLocation && Value.ToLocation.city_id > 0 && Value.ToLocation.district_id))
          && ((!Value.ToLocation) || (!OldValue.ToLocation.city_id ) || (Value.ToLocation.city_id == OldValue.ToLocation.city_id))
        ){
            if(timeout){
                $timeout.cancel(timeout);
            }
            
            timeout = $timeout(function(){

            var data = {'Domain'    : 'shipchung.vn'};

            data['From']    = {City: Value.Inventory.city_id, Province: Value.Inventory.province_id};
            
            if(!Value.Inventory.post_office || Value.Inventory.post_office == false){
                data['From']['Stock'] =  Value.Inventory.id;
            }else {
                data['From'] = {};
                data['From']['PostCode'] = Value.Inventory.id;

                
                //data['Type'] = 'excel';
            }

            if(Value.Inventory.ward_id != undefined && Value.Inventory.ward_id > 0){
                data['From']['Ward']    = Value.Inventory.ward_id;
            }

            if(Value.ToLocationSuggest && Value.ToLocationSuggest.city_id > 0){
                data['To']      = {City: Value.ToLocationSuggest.city_id, Province: Value.ToLocationSuggest.district_id};
                if(Value.ToLocationSuggest.ward_id != undefined && Value.ToLocationSuggest.ward_id > 0){
                    data['To']['Ward']    = Value.ToLocationSuggest.ward_id;
                }

            }else{
                data['To']      = {City: Value.ToLocation.city_id, Province: Value.ToLocation.district_id.split('-')[0]};
                if(Value.ToLocation.district_id.split('-')[1]){
                    data['To']['Ward']  = Value.ToLocation.district_id.split('-')[1];
                }
            }
            data['To']['Address']   =  $scope.OrderDetail.Address;

            data['Order']   = {Weight: +weight, Amount: +amount};
            data['Config']  = {Service: +Value.Service, Protected: +Value.Protected, CoD: +Value.CoD, Payment: +Value.Payment, Fragile : +$scope.OrderDetail.Fragile, Checking: +$scope.OrderDetail.Checking};

            if(size != ''){
                data['Order']['BoxSize']    = size;
            }

            $scope.OrderDetail.list_courier     = [];
            $scope.OrderDetail.courier          = {};
                Order.Calculate(data).then(function (result) {
                if(!result.data.error){
                    $scope.fee_detail       = result.data.data;

                    // Cấu hình  thu phí CoD
                    if($scope.config_fee && $scope.config_fee.cod_fee == 1){ // người mua trả phí
                        $scope.fee_detail.seller.discount -= +$scope.fee_detail.vas.cod;
                    }

                    if($scope.fee_detail.courier.me){
                        $scope.OrderDetail.courier        =   $scope.fee_detail.courier.me[0];
                    }else{
                        $scope.OrderDetail.courier        =   $scope.fee_detail.courier.system[0];
                        $scope.OrderDetail.leatime_total  =   $scope.fee_detail.courier.system[0].leatime_total;
                        $scope.fee_detail.courier.me        = [];
                    }

                    if(!$scope.fee_detail.courier.system){
                        $scope.fee_detail.courier.system    = [];
                    }

                    $scope.OrderDetail.list_courier = PhpJs.array_merge_recursive($scope.fee_detail.courier.me,$scope.fee_detail.courier.system);


                    //Cấu hình thu phí vận chuyển
                    /*if($scope.OrderFee.Payment == 1){
                        if($scope.config_fee && $scope.config_fee.shipping_fee == 1){
                            if($scope.config_fee.shipping_cost_value > (1*$scope.fee_detail.pvc + 1*$scope.OrderDetail.courier.money_pickup)){
                                $scope.fee_detail.seller.discount += 1*$scope.OrderDetail.courier.money_pickup;
                            }else{
                                $scope.fee_detail.seller.discount = 1*$scope.config_fee.shipping_cost_value;
                            }
                        }else{
                            //$scope.fee_detail.seller.discount += 1*$scope.OrderDetail.courier.money_pickup;
                        }
                    }*/

                    // Thu hộ bao gồm vas
                    $scope.money_collect    = $scope.fee_detail.collect + $scope.fee_detail.vas.cod + $scope.fee_detail.vas.protected ;
                    if(Value.Payment == 1){
                        $scope.money_collect    += $scope.fee_detail.pvc;
                    }

                }else{
                    toaster.pop('warning', 'Thông báo', result.data.message);
                    $scope.fee_detail   = {};
                }
                $scope.waiting  = false;
            });
                
            },1000);
        }else{
            $scope.waiting  = false;
        }

        return;
    },true);


    $scope.$watch('fee_detail.seller.discount',function(Value,OldValue){
        if($scope.fee_detail){
            if(Value != undefined){
                var val   = Value.toString().replace(/,/gi,"");
                $scope.fee_detail.collect =  $scope.money_collect - val;
            }else{
                $scope.fee_detail.collect = $scope.money_collect;
            }
        }
    });


    $scope.$watch('OrderDetail.courier',function(Value,OldValue){
        if(Value != undefined && Value.courier_id != undefined){
            var val     = 1*$scope.fee_detail.seller.discount.toString().replace(/,/gi,"");
            var newv    = 1*Value.money_pickup.toString().replace(/,/gi,"");

            if(OldValue.money_pickup != undefined){
                var old   = OldValue.money_pickup.toString().replace(/,/gi,"");
                $scope.money_collect -= 1*old;
                if($scope.OrderFee.Payment == 1) {
                    val = 1*val - 1*old;
                }
            }

            $scope.money_collect    += 1*newv;

            $scope.fee_detail.collect = $scope.money_collect;

            if($scope.OrderFee.Payment == 1){
                val += 1*newv;
                $scope.fee_detail.seller.discount   = val;
            }

            $scope.fee_detail.collect  = 1*$scope.money_collect  - val;

        }
    });

        /**
         *   Edit order
         */
        $scope.accept_order   = function(tracking_code){
            if(tracking_code != undefined && tracking_code != ''){
                var dataupdate = {};
                $scope.waiting_status               = true;
                dataupdate['tracking_code']         = tracking_code;
                dataupdate['status']                = 21;

                Order.Edit(dataupdate).then(function (result) {
                    if(result.data.error){
                        $scope.waiting_status   = false;

                        if (result.data.message == 'NOT_ENOUGH_MONEY') {
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

                    }else{
                        $scope.Order.status     = 21;
                    }
                });
            }

            return;
        };

        $scope.popupCreateLadingSuccess = function (lading){
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.create_lading_success.html',
                controller: function ($scope, lading, $modal, Order, $modalInstance){
                    $scope.Lading = lading;
                    $scope.run = function () {
                        $modalInstance.close();

                    };
                    $scope.accept_Lading   = function(tracking_code){
                        if(tracking_code != undefined && tracking_code != ''){
                            var dataupdate = {};
                            $scope.waiting_status               = true;
                            dataupdate['tracking_code']         = tracking_code;
                            dataupdate['status']                = 21;

                            Order.Edit(dataupdate).then(function (result) {
                                if(result.data.error){
                                    $scope.waiting_status   = false;

                                    if (result.data.message == 'NOT_ENOUGH_MONEY') {
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

                                }else{
                                    $scope.Order.status     = 21;
                                }
                            });
                        }

                        return;
                    };


                },
                resolve: {
                    lading: function () {
                        return lading;
                    }
                }
            });

            modalInstance.result.then(function () {
                
            });
        }

}]);

angular.module('app').controller('ModalBonusCtrl', ['$scope', '$modalInstance', '$http', 'toaster', 'bootbox',
    function($scope, $modalInstance, $http, toaster, bootbox) {
        $scope.run = function () {
            $modalInstance.close();

        };
    }
]);

angular.module('app').controller('ModalErrorCtrl', ['$scope', '$modalInstance', '$http', 'toaster', 'bootbox', 'items',
    function($scope, $modalInstance, $http, toaster, bootbox, items) {
        $scope.data = items;

        $scope.cash_in = function (size) {
            $modalInstance.close();
        };
    }
]);