'use strict';

//List Order
var OrderCreateCtrl;

app.controller('PopupSuscessCtrl', [
			'$scope','items','$modalInstance', 
    function($scope , items,    $modalInstance ) {
          // $scope.tracking_code = items;
           $scope.tracking_code= items.tracking;
          $scope.auto_accept = items.AutoAccept
            var currentDate = new Date();
            $scope.timePickup  = "hôm nay";
           $scope.moment_time = moment().minute(0).second(0);
            if (currentDate.getTime() > moment().hour(14)) {
                $scope.timePickup  = "ngày mai";
            };
            $scope.cancel = function(){
                //$modalInstance.close(true);
                $modalInstance.dismiss('cancel');
            }
             $scope.function_addtab = function(){
                $modalInstance.close(true);
                ///$modalInstance.dismiss('cancel');
            }
}])


angular.module('app').controller('OrderCreateParentCtrl',
		    ['$scope', '$rootScope', 'Analytics', '$localStorage','bootbox','$state','$filter',
    function ($scope,   $rootScope,   Analytics,  $localStorage,   bootbox,  $state,  $filter){
	var tran = $filter('translate');
	var i = 1;
    $scope.tabs = [i];

    $scope.addTabs = function (){
        i = i + 1;
        $scope.tabs.push(i);
    }
    $scope.notice = {};
    $rootScope.hasInventory = true;
    Analytics.trackPage('/order/create-v2');
}]);


angular.module('app').controller('OrderCreateV2GlobalCtrl', 
							[ '$scope','$filter', '$rootScope','loginService', '$http', '$state', 'CurencyExchange',   '$stateParams', '$timeout', '$modal', 'AppStorage', 'Location', 'Inventory', 'Order', 'ConfigShipping', 'PhpJs', 'toaster', '$localStorage', 'WarehouseRepository',
    function OrderCreateV2Ctrl($scope,  $filter,   $rootScope,  loginService,   $http,   $state,   CurencyExchange,      $stateParams,    $timeout,   $modal,   AppStorage,   Location,   Inventory,   Order,   ConfigShipping,   PhpJs,   toaster,    $localStorage,  WarehouseRepository){
	var tran = $filter('translate');
    var self = this;
    // cap nhat so du moi lan tao don
    loginService.check_balance();
    
	//checkchina
	$scope.arrChina = {
			country : [],
			china_1	: []
	}
	//
    $scope.fee_detail            = {};
    $scope.list_courier_detail   = [];
    
    $scope.list_ward_by_district = [];
    var list_services_en = [
        {
            id          : 7,
            name        : 'Giao trong ngày (SD)',
            name_en     : 'Sameday sevice (SD)',
            group       : 'Nội tỉnh',
            group_en    : 'Urban',
            icons       : 'fa-motorcycle',
            note        : 'Lấy sáng giao chiều  - Lấy chiều giao sáng hôm sau',
            note_en     : 'Same day delivery if pickup on morning, delivery next day if pickup on afternoon'
        },
        {
            id          : 4,
            name        : 'Giao qua ngày (ND)',
            name_en     : 'Next day service (ND)',
            group       : 'Nội tỉnh',
            group_en    : 'Urban',
            icons       : 'fa-motorcycle',
            note        : 'Lấy trong ngày - giao ngày hôm sau',
            note_en     : 'Same day pickup, delivery on next day'
        },{
            id          : 2,
            name        : 'Chuyển phát nhanh (CN)',
            name_en	    : 'Express delivery service (CN)',
            group       : 'Liên tỉnh',
            group_en    : 'Interprovincial',
            icons       : 'fa-plane',
            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
            note_en     : 'Same day pickup and delivery by SLA'
        },
        {
            id          : 1,
            name        : 'Chuyển phát tiết kiệm (TK)',
            name_en	    : 'Economy delivery service (TK)',
            group       : 'Liên tỉnh',
            group_en    : 'Interprovincial',
            icons       : 'fa-truck',
            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
            note_en     : 'Same day pickup and delivery by SLA'
        },
        {
            id          : 11,
            name        : 'Chuyển phát tiết kiệm EMS',
            name_en	    : 'Chuyển phát tiết kiệm EMS',
            group       : 'Liên tỉnh',
            group_en    : 'Interprovincial',
            icons       : ' fa-car',
            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
            note_en     : 'Same day pickup and delivery by SLA'
        }
    ];
    var service_bm = [
        {
            id          : 12,
            name        : 'Marketplace Fulfillment',
            name_en	    : 'Marketplace Fulfillment',
            group       : 'Boxme Fulfillment',
            group_en    : 'Boxme Fulfillment',
            icons       : 'fa-car',
            note        : 'Đóng gói & giao tới trung tâm xử lý đơn hàng của sàn TMDT (Lazada, Robins...)',
            note_en     : 'Pack & delivery to marketplace distributor (Lazada, Robins...)'
        },
        {
            id          : 6,
            name        : 'Xuất hàng tại kho (XK)',
            name_en	    : 'Export at Warehouse (XK)',
            group       : 'Boxme Fulfillment',
            group_en    : 'Boxme Fulfillment',
            icons       : 'fa-home',
            note        : 'Đóng gói và giao khi khách đến',
            note_en     : 'Package and delivery when customer arrive'
        }]
                        
    var service_zalo = [{
                        id          : 14,
                        name        : 'Zalo Flash Sale',
                        name_en	    : 'Zalo Flash Sale',
                        group       : 'Boxme Fulfillment',
                        group_en    : 'Boxme Fulfillment',
                        icons       : 'fa-plane',
                        note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                        note_en     : 'Same day pickup and delivery by SLA'
                    }] 
          
                   
    var _arrNoiTinh     = [3,4,7]
    var _arrLienTinh    = [1,2]
    $scope.$watch('keyLang', function (newVal, OldVal){
        $scope.list_services =  list_services_en; 
        if($scope.To.Buyer.Area && $scope.To.Buyer.Area.city_id && $scope.From.Inventory){
            if(parseInt($scope.To.Buyer.Area.city_id) ==  parseInt($scope.From.Inventory.city_id)){
                _getService(true) //noi tinh 
            }else{
                _getService(false) //lien tinh
            }
        }else{
            if($rootScope.userFulfillment && $rootScope.userFulfillment == 1 && $scope.list_services.indexOf(service_bm)<0){
                //$scope.list_services.push(service_bm)
                angular.forEach(service_bm, function (value){
                    if($scope.list_services.indexOf(value)<0){
                        $scope.list_services.push(value)
                    }
                })
                if($rootScope.userInfo.id && ([217203,87834].indexOf($rootScope.userInfo.id)>=0)){
                    angular.forEach(service_zalo, function (value){
                        //if(value.group_en.toString() == "Interprovincial"){
                            if($scope.list_services.indexOf(value)<0){
                                $scope.list_services.push(value)
                            }
                            
                        //}
                    })
                };

            }
            
        }
    });
    var _getService = function(isNoiTinh){
        //$scope.list_services =  list_services_en;//$rootScope.keyLang =='en' ? list_services_en : list_services_vi;
        if(isNoiTinh){
            if($scope.Config.Service && _arrNoiTinh.length >=1 && _arrNoiTinh.indexOf($scope.Config.Service) <0){
                $scope.Config.Service   = $scope.list_services[0].id
            }
           
        }else{
             var list_services_temp = [];
            angular.forEach($scope.list_services, function (value){
                if(value.group_en.toString() == "Interprovincial"){
                    list_services_temp.push(value)
                }
            })
            $scope.list_services    = list_services_temp;
            list_services_temp      = [];
             if($scope.Config.Service && _arrLienTinh.length >=1 && _arrLienTinh.indexOf($scope.Config.Service) <0){
                $scope.Config.Service   = $scope.list_services[0].id
            }
        }
        if($rootScope.userFulfillment && $rootScope.userFulfillment == 1 && $scope.list_services.indexOf(service_bm)<0 ){
            angular.forEach(service_bm, function (value){
                if($scope.list_services.indexOf(value)<0){
                    $scope.list_services.push(value)
                }
            })
        }
        if($rootScope.userInfo.id && ([217203,87834,69406,2].indexOf($rootScope.userInfo.id)>=0)){
            angular.forEach(service_zalo, function (value){
                //if(value.group_en.toString() == "Interprovincial"){
                    if($scope.list_services.indexOf(value)<0){
                        $scope.list_services.push(value)
                    }
                //}
            })
        }
        // xuat hang khoi kho
        if($rootScope.orderProductSelected  && $rootScope.orderProductSelected.list_sku && $rootScope.orderProductSelected.list_sku.length >=1 ){
            var list_services_temp = []
            angular.forEach($scope.list_services, function (value){
                if(value.group_en.toString() == "Interprovincial" && value.id != 11){
                    list_services_temp.push(value)
                }
            })
            var service_bm_vt = {
                id          : 5,
                name        : 'Dịch vụ vận tải (VT)',
                name_en     : 'Cargo Service (VT)',
                group       : 'Liên tỉnh',
                group_en    : 'Interprovincial',
                icons       : 'fa-truck',
                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                note_en     : 'Same day pickup and delivery by SLA'
            }
            list_services_temp.push(service_bm_vt)
            $scope.list_services    = list_services_temp;
            $scope.Config.Service   = 1; // mac dinh chuyen phat tiet kiem
            list_services_temp      = [];
        }
        // end list service xuat hang khoi kho
    }
    $scope.list_services_global = [
        {
            id          : 8,
            name        : 'Chuyển phát nhanh quốc tế',
            name_en     : 'International Express',
            icons       : 'fa-plane',
            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
            note_en     : 'Same day pickup and delivery by SLA'
            
        },
        {
            id          : 9,
            name        : 'Chuyển phát tiết kiệm quốc tế',
            name_en     : 'International Economy',
            icons       : 'fa-truck',
            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
            note_en     : 'Same day pickup and delivery by SLA'
            
        }
    ];
    if($rootScope.userInfo.id && ([2,87834,87695].indexOf($rootScope.userInfo.id)>=0)){
        $scope.list_services_global = [
            {
                id          : 8,
                name        : 'Chuyển phát nhanh quốc tế',
                name_en     : 'International Express',
                icons       : 'fa-plane',
                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                note_en     : 'Same day pickup and delivery by SLA'
                
            },
            {
                id          : 9,
                name        : 'Chuyển phát tiết kiệm quốc tế',
                name_en     : 'International Economy',
                icons       : 'fa-truck',
                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                note_en     : 'Same day pickup and delivery by SLA'
                
            },{
                id          : 15,
                name        : 'Small Package Saver',
                name_en     : 'Small Package Saver',
                icons       : ' fa-car',
                note        : 'Boxme sẽ đóng gói và gom hàng tại Việt Nam và giao qua USPS. ',
                note_en     : 'Boxme will pack and consolidate in VietNam and delivery by USPS'
            }
        ];
    };
   
    $scope.calculateInfo = {
        selected_courier: ""
    }
    $scope._boxme = {
        selected_item   : null,
        Items           : []
    }

    //show CouponCode
    $scope.show_inputCouponCode		 = false;
    $scope.show_CouponCode = function(check){
    	$scope.show_inputCouponCode = check;
    }
    //end show CouponCode
    //add add-shopify-order
    var  bodauTiengViet = function(str) {  
        if(!str){
            return str;
        }
        str= str.toLowerCase();  
        str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
        str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
        str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
        str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
        str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
        str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str.replace("(", "");
        str.replace(")", "");
        str= str.replace(/đ/g,"d");  
        return str;  
    }
    var get_exchangecurency = function(callback){
        $scope.data_exchange = [];
        CurencyExchange.getExchange().then(function (result) {
            $scope.waiting = false;

            if(!result.error){
                $scope.data_exchange = result.data.data;
                callback(result.data.data);
            }else{
                $scope.data_order = [] 
            }
        })

        // $scope.data_exchange =  [{
        //     "id"            : 1,
        //     "curency_id"    : 2,
        //     "curency_code"  : "USD",
        //     "curency_name"  : "Dollars",
        //     "to_curency_id" :  1,
        //     "to_curency_code"   : "VND",
        //     "to_curency_name"   : "Dong",
        //     "exchange_rate"     : 22765
        // }]
    }

    $scope.check_order_store_connect = false;
    $scope.add_store_connect_order = function(type){
        $modal.open({
            templateUrl : 'add_store_connect_template.html',
            controller  : 'StoreConnectController',
            size: 'lg',
            resolve: {
                data_transfer: function() {return {type:type};}
            }
        }).result.then(function(result) {
            BuildDataStore(result,type);
        });
    }
    var BuildDataStore = function(result,type){
        if(result){
            $scope.Product        = {
                    Amount  : 0,
                    Quantity: 0,
                    Note    : "",
                    Name    : "",
                    Price   : 0,
                    Code    : "",
                    Sku     : ""
            };
            var platform;
            if(type == 1){
                platform = 'Shopify';
            }else if(type == 2){
                platform = 'Magento';
            }else if(type == 3){
                platform = 'Lazada';
            }else if(type == 4){
                platform = 'Woocommerce';
            }else if(type == 5){
                platform = 'Etsy';
            }else if(type == 6){
                platform = 'Ebay';
            }else if(type == 7){
                platform = 'Haravan';
            }else if(type == 8){
                platform = 'Robins';
            }
            if(result.Order){
                $scope.check_order_etsy = true;
                //get product
                if($scope.From.Inventory.warehouse_code && $scope.From.Inventory.warehouse_code!= "" &&  $localStorage['login'].fulfillment && $localStorage['login'].fulfillment == 1){
                    // KHACH FULLFILMENT
                    $scope._boxme.Items = [];
                    if(result.Order.Items){
                        if(result.Order.Items.length >= 1 && $scope.list_products.length >= 1){
                            angular.forEach(result.Order.Items, function (value){
                                if(value.sku){
                                    angular.forEach($scope.list_products, function (item){
                                        if(value.sku.toString() == item.SellerBSIN.toString()){
                                            item.Quantity = value.quantity;
                                            $scope.AddItem(item)
                                        }
                                    })
                                }
                               
                            }) 
                        }
                        toaster.pop('success', tran('toaster_ss_nitifi'), tran('shopify_Importthanhcong',{x:$scope._boxme.Items.length,y:result.Order.Items.length}));
                    }
                }else{
                    //  KHACH SC
                    if(result.Order.Items){
                        if(result.Order.Items.length >= 1){
                            angular.forEach(result.Order.Items, function (value){
                                $scope.Product.Name  = $scope.Product.Name +  value.name;
                                $scope.Product.Sku  = $scope.Product.Sku +  value.sku;
                                $scope.Product.Quantity += value.quantity;
                                if(result.Order.Items[result.Order.Items.length-1].name != value.name){
                                    $scope.Product.Name  = $scope.Product.Name +  ", " ;
                                }
                                if(result.Order.Items[result.Order.Items.length-1].sku != value.sku){
                                    $scope.Product.Sku  = $scope.Product.Sku +  ", " ;
                                }
                            }) 
                        }
                        $scope.productSelected    = $scope.Product.Name;
                        document.getElementById("order_productname").value = $scope.Product.Name;
                        document.getElementById("product_note").value = $scope.Product.Sku;

                    }
                    
                    if($localStorage['login'].currency_detail && $localStorage['login'].currency_detail.code){
                        // DON VI TIEN SHIPIFY  =DON VI TIEN  TE SHIPCHUNG  (VD:VND = VND,USD = USD)
                        if(result.Order.Order && result.Order.Order.Currency.toString() == $localStorage['login'].currency_detail.code.toString()){    
                            //SHOPIFY = VND VA SHIPCHUNG VND
                            if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                if(result.Order.Order.Amount){
                                    $scope.Product.Price = Math.ceil(result.Order.Order.Amount);
                                }
                            }else{
                                $scope.Product.Price_curernt_2 = result.Order.Order.Amount;
                                $scope.Product.Price =  Math.ceil($rootScope.convert_currency_to_home_currency($scope.Product.Price_curernt_2))
                                
                            }
                        }else{
                            // DON VI TIEN SHIPIFY  != DON VI TIEN  TE SHIPCHUNG  (VD:VND = USD)
                            $scope.Product.Price = 0;
                            //TIEN SHIPCHUNG LA VND, KHAC VND KHONG HO TRO
                            if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                get_exchangecurency(function (data_exchange){
                                    angular.forEach(data_exchange, function (value){
                                        if(value.curency_code.toString() == result.Order.Order.Currency.toString()){
                                            $scope.Product.Price = Math.ceil(result.Order.Order.Amount * value.exchange_rate);
                                        }
                                    })
                                });
                            }
                            
                        }
                    }
                    //end get product
                    
                    if(result.Order.Order && result.Order.Order.Weight){
                        $scope.Product.Weight   = Math.ceil(result.Order.Order.Weight);
                    }

                }
                //


                if(result.Order.Order && result.Order.Order.Order_code && result.Store && result.Store.id){
                    $scope.Product.Code     = platform +"-" + result.Store.id + "-" +result.Order.Order.Order_code;
                    if(result.Order.Order.Order_number){
                        $scope.Product.Code += "-" +result.Order.Order.Order_number;
                    }
                    $('#product_code').prop('disabled', true);
                }

                if(result.Order.To){
                        $scope.To.Buyer.Name        = result.Order.To.Name      ?   result.Order.To.Name        : "";
                       // $scope.To.Buyer._Phone      = result.Order.To.Phone     ?   $scope.To.Buyer._Phone+result.Order.To.Phone       : "";
                        $scope.To.Buyer.Address     = result.Order.To.Address   ?   result.Order.To.Address     : "";
                        if(result.Order.To.Province && result.Order.To.Province != ""){
                            $scope.To.Buyer.Address = $scope.To.Buyer.Address + ", " + result.Order.To.Province
                        }
                        if(result.Order.To.City && result.Order.To.City != ""){
                            $scope.To.Buyer.Address = $scope.To.Buyer.Address + ", " + result.Order.To.City
                        }
                        
                        if(result.Order.To.Phone){
                            $scope.To.Buyer.Phone       = "";
                            $scope.To.Buyer.Phone       = bodauTiengViet(result.Order.To.Phone);
                            document.getElementById("order_phone").value = result.Order.To.Phone;
                    }
                }
                //get dia chi
                if(result.Order.To.Country_code && result.Order.To.Country_code == "VN"){
                    angular.forEach($scope.list_country, function (value) {
                        if (value.country_code.toString().toLowerCase() == result.Order.To.Country_code.toString().toLowerCase()) {
                            $scope.To.Buyer.Country = value;
                        }
                    })
                        if(result.Order.To.City){
                            var city_temp = bodauTiengViet(result.Order.To.City);
                        }
                        
                        if(result.Order.To.District && result.Order.To.District != "" && result.Order.To.District.length >=5){
                            var district_temp = bodauTiengViet(result.Order.To.District);
                            district_temp = result.Order.To.Province ? district_temp + bodauTiengViet(result.Order.To.Province) : district_temp + bodauTiengViet(result.Order.To.City);
                            $http.get(ApiUrl + 'api/base/list-address-new')
                            .success(function (result){
                                if(result.data){
                                    var list_address = result.data;
                                    district_temp = district_temp.toString().replace(/\s/g, "")
                                    angular.forEach(list_address, function (value){
                                        var temp = value.district_name.toString().replace(/\s/g, "")
                                        if(district_temp.indexOf(bodauTiengViet(temp)) >=0 || bodauTiengViet(temp).indexOf(district_temp) >=0){
                                            $scope.To.Buyer.Area = value;
                                        // $scope.To.Buyer.Area.district_id = value.district_id
                                        }
                                    })
                                }
                            })
                        }    
                }else{
                    // DON QUOC TE
                        angular.forEach($scope.list_country, function (value){
                            if(value.country_code.toString().toLowerCase()== result.Order.To.Country_code.toString().toLowerCase()){
                               $scope.To.Buyer.Country = value;
                            } 
                        })
                        if(result.Order.To.Zipcode){
                            $scope.To.Buyer.Zipcode = result.Order.To.Zipcode;
                        }
                        if(result.Order.To.City){
                            //$scope.loadCityGlobal($scope.To.Buyer.Country.id,)
                            $scope.To.Buyer.CityGlobal = "";
                            $scope.To.Buyer.CityGlobal = [];
                            Location.city_global($scope.To.Buyer.Country.id, result.Order.To.City).then(function (resp){
                                $scope.list_city_global = resp.data.data;
                                if($scope.list_city_global.length >= 1){
                                    angular.forEach($scope.list_city_global, function (value){
                                        var city_name_temp = value.city_name.replace(" ","");
                                        city_name_temp = city_name_temp.replace("\r\n","")
                                         var city_name_temp_shopify = result.Order.To.City.replace(" ","");
                                        if(city_name_temp.toLowerCase()== city_name_temp_shopify.toLowerCase()){
                                            $scope.To.Buyer.CityGlobal = value;
                                        } 
                                    })
                                    if($scope.To.Buyer.CityGlobal == ""){
                                        $scope.To.Buyer.CityGlobal = $scope.list_city_global[0]
                                    }
                                }
                            })
                            
                        }
                    // DON QUOC TE    
                }
                // END GET DIA CHI
            }
            
             

        }
    }
    //end add-etsy-order
    $scope.clearData = function (){
        $scope._boxme.Items = [];
        $scope.Config = {
            Service     : 2,
            Protected   : "2",
            Payment     : 2,
            Type        : parseInt($localStorage['last_config_type_select']) || 2,
            Checking    : "1",
            Fragile     : "2",
            ToPostOffice :2,
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
            Quantity: 1,
            Note: ""
        };
    }

    $scope.clearData();
    
    $scope.list_inventory   = null;  // danh sách kho hàng
    $scope.list_inventory_temp = null;
    $scope.show_phone2 = false;
    
    // $scope.dataSellers = [{'NameSeller':"a"},{'NameSeller':"b"}]
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
                $scope.list_inventory  = result.data.data;
                $scope.list_inventory_temp = result.data.data;
                
                if ($stateParams.bc && $stateParams.bc !== "" && $stateParams.bc !== null && $stateParams.bc !== undefined) {
                    result.data.data.forEach(function (value){
                        if (value.id == $stateParams.bc) {
                            $scope.From.Inventory = value;
                        };
                    })  
                }else {
                    $scope.From.Inventory = $scope.list_inventory[0];
                    if($rootScope.orderProductSelected && $rootScope.orderProductSelected.stock){
                        result.data.data.forEach(function (value){
                            if (value.id == $rootScope.orderProductSelected.stock) {
                                $scope.From.Inventory = value;
                            };
                        })
                    }
                }
            }else {
                $rootScope.hasInventory = false;
            }
            //$scope.showNotice();
        });
    }
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

    var isBoxmeInventory = function (){
        return $scope.From.Inventory && 
               $scope.From.Inventory.warehouse_code &&
               $scope.From.Inventory.warehouse_code.length >0;
    }

    var canCalculateShiphung = function (){
        var weight = $scope.Product.Weight  ? get_number($scope.Product.Weight)     : 0;
        var price  = $scope.Product.Price   ? get_number($scope.Product.Price)      : 0;
        var size   = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize)   : "";
        return $scope.From.Inventory && (!$scope.From.Inventory.warehouse_code || $scope.post_office)&& $scope.From.Inventory.id > 0 && (weight > 0 || size != "") && price > 0;
    }

    var canCalculateBoxme = function (){
        var price  = $scope._boxme.TotalItemAmount;
        var weight = $scope._boxme.TotalItemWeight;

        return isBoxmeInventory() && 
               weight > 0 && 
               price > 0;
    }

    var getProductName = function (){
        if(isBoxmeInventory()){
            return $scope._boxme.ItemsName;
        }
        return $scope.Product.Name;
    }


    var BuildData = function (isCalculate){

        var weight  = $scope.Product.Weight  ? get_number($scope.Product.Weight)     : 0;

        var price   = $scope.Product.Price   ? get_number($scope.Product.Price)      : 0;
        var size    = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize)   : "";

        var data = {
            Domain: !isBoxmeInventory() ? 'seller.shipchung.vn' : 'boxme.vn'
        }
        


        data['From'] = {
            City        : $scope.From.Inventory.city_id,
            Province    : $scope.From.Inventory.province_id
        }
        // FROM 
        if(isFromStock()){
                data['From']['Stock'] =  $scope.From.Inventory.id;
        }else {
            //data['From'] = {};
            data['From']['PostCode'] = $scope.From.Inventory.id;
        }
        if($scope.post_office &&  !$scope.From.Inventory.warehouse_code){
            data['From']['PostCode'] = $scope.post_office.id;
        }

        if($scope.From.Inventory.ward_id != undefined && $scope.From.Inventory.ward_id > 0){
            data['From']['Ward']    = $scope.From.Inventory.ward_id;
        }
        
        // TO 


        if($scope.To.Buyer.Country && $scope.To.Buyer.Country.id !== 237 && $scope.To.Buyer.CityGlobal){
            data['To'] = {
                'Country'   : $scope.To.Buyer.Country.id,
                'City'      : $scope.To.Buyer.CityGlobal.id,
                'Address'   : $scope.To.Buyer.Address,
            }
             // check truong hop trung quoc 2 quoc gia (china 1, china 2)
            if($scope.To.Buyer.Country.id == -1){
            	var check_china_1 = false;
            	angular.forEach($scope.arrChina.china_1, function (value){
            		if($scope.To.Buyer.CityGlobal.id.toString() == value.id.toString()){
            			check_china_1 = true
            		}
                })
                if(check_china_1 == true){
                	data['To']['Country'] = 44;
                }else{
                	data['To']['Country'] = 246
                }
            }
         // check truong hop trung quoc 2 quoc gia (china 1, china 2)	
            if($scope.To.Buyer.Zipcode && $scope.To.Buyer.Zipcode !== ""){
                data['To']['Zipcode'] = $scope.To.Buyer.Zipcode;
            }
            var checkZipCode = false
            angular.forEach($scope.list_country, function (value){
                if(data['To']['Country'] == value.id){
                    checkZipCode = value.required_zipcode;
                }
            })
            if(checkZipCode == 1 && !data['To']['Zipcode'] && !isCalculate) {
            	return tran('ORDERC_ChuaNhapZipCode');//'Quý khách chưa chọn tỉnh thành giao hàng đến';
            }
            if (data['To']['City'] == null){
            	return tran('ORDERC_ChuaNhapTinhThanh');//'Quý khách chưa chọn tỉnh thành giao hàng đến';
            }
            if (data['To']['Address'] == null){
            	return tran('ORDERC_ChuaNhapDiaChi');//'Quý khách chưa nhập địa chỉ giao hàng đến';
            }

        }else {
            data['To'] = {
                City        : $scope.To.Buyer.Area ? $scope.To.Buyer.Area.city_id 		: null,
                Province    : $scope.To.Buyer.Area ? $scope.To.Buyer.Area.district_id	: null,
                Address     : $scope.To.Buyer.Area ? $scope.To.Buyer.Address			: null,
                Country     : $scope.To.Buyer.Area ? $scope.To.Buyer.Country.id			: null
            };
            if ($scope.To.Buyer.ward_id && $scope.To.Buyer.ward_id > 0) {
                data['To']['Ward'] = $scope.To.Buyer.ward_id
            }
            if($scope.list_ward_by_district && $scope.list_ward_by_district.length >= 1  && !isCalculate){
            	if(data['To']['Ward'] == null){
            		return tran('ORDERC_ChuaNhapPhuongXa');
            	}
            }
            if (data['To']['City'] == null ){
            	return tran('ORDERC_ChuaNhapTinhThanh');//'Quý khách chưa chọn tỉnh thành giao hàng đến';
            }
            if (data['To']['Province'] == null){
            	return tran('ORDERC_ChuaNhapQuanHuyen');//'Quý khách chưa chọn chỉ quận huyện giao hàng đến';
            }
            if (data['To']['Address'] == null && !isCalculate){
            	return tran('ORDERC_ChuaNhapDiaChi');//'Quý khách chưa nhập địa chỉ giao hàng đến';
            }
            
        }
        
        
        if(isBoxmeInventory()){
            weight = $scope._boxme.TotalItemWeight;
            price  = $scope._boxme.TotalItemAmount;
            $scope.Product.Quantity = $scope._boxme.TotalItemQuantity;

            data['Items'] = []

            angular.forEach($scope._boxme.Items, function (value){
                data['Items'].push({
                    'Name'      : value.ProductName,
                    'Price'     : value.PriceItem * value.Quantity,
                    'Quantity'  : value.Quantity,
                    'Weight'    : (value.WeightPacked && value.WeightPacked >= value.WeightItem) ? value.WeightPacked * value.Quantity : value.WeightItem * value.Quantity,
                    'BSIN'      : value.SellerBSIN
                });
            });

        }

        data['Order']   = {
            Weight: +weight, 
            Amount: +price,
            Quantity: $scope.Product.Quantity || 1
        };
        
        if(data['Order'] && !data['Order']['Quantity']){
        	return tran('ORDERC_ChuaNhapSoLuong');
        }


        if(size != ''){
            data['Order']['BoxSize']    = size;
        }


        data['Config']  = { Service         : +$scope.Config.Service, 
                            Protected       : +$scope.Config.Protected, 
                            Checking        : +$scope.Config.Checking, 
                            Fragile         : +$scope.Config.Fragile,
                            ToPostOffice    : +$scope.Config.ToPostOffice,
                            CouponCode	    : $scope.Config.Coupon_code,
                        };  
                

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

        // if(data['Config']['Service'] == 6 && data['Order']['Weight'] >=15000){
        //     return 'Dịch vụ chưa hổ trợ với khối lượng này, vui lòng chọn khối lượng duới 15kg';
        // }
        
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
        if($scope.calculateInfo && $scope.calculateInfo.selected_courier && $scope.calculateInfo.selected_courier.courier_id){
            data['Courier'] = $scope.calculateInfo.selected_courier.courier_id;
        }
        

        if (isCalculate) {
            return data;
        };
        var ProductName = getProductName();
        if (!ProductName) {
            return tran('ORDERC_ChuaNhapTenSanPham');//'Quý khách chưa nhập tên sản phẩm';
        }
        if (!$scope.To.Buyer.Phone || $scope.To.Buyer.Phone == "" || $scope.To.Buyer.Phone.length <=5 ) {
            return tran('ORDERC_ChuaNhapSDTNguoiNhan');//'Quý khách chưa nhập số điện thoại người nhận';
        }

        if (!$scope.To.Buyer.Address || $scope.To.Buyer.Address == "") {
            return tran('ORDERC_ChuaNhapDiaChi');//'Quý khách chưa nhập địa chỉ người nhận';
        }
        if (!isBoxmeInventory() && (!$scope.Product.Weight ||  $scope.Product.Weight ==0)){
            return tran('ORDERC_ChuaNhapKhoiLuong');
        }

        data['From']['Address'] = $scope.From.Inventory.address;
        data['From']['Phone']   = $scope.From.Inventory.phone;
        data['From']['Name']    = $scope.From.Inventory.user_name;


        
        if($scope.To.Buyer.Country && $scope.To.Buyer.Country.phone_code){
            if($scope.To.Buyer.Phone.indexOf("+"+$scope.To.Buyer.Country.phone_code+"") >=0){
                $scope.To.Buyer.Phone = $scope.To.Buyer.Phone.replace("+"+$scope.To.Buyer.Country.phone_code+"", "")
                if($scope.To.Buyer.Country.id ==237 &&  $scope.To.Buyer.Phone[0] && $scope.To.Buyer.Phone[0] != "0"){
                   $scope.To.Buyer.Phone = "0" + $scope.To.Buyer.Phone; 
                }
            }
        }
        var phone               = [$scope.To.Buyer.Phone.replace(/\D/g,"")];
        if($scope.To.Buyer.Country && $scope.To.Buyer.Country.id ==237 && $scope.To.Buyer.Phone && $scope.To.Buyer.Phone.length <=8){
            return tran('OBG_HinhNhuBanNhapSaoSDT');
        }
        if ($scope.To.Buyer.Phone2) {
            phone.push($scope.To.Buyer.Phone2);
        }

        data['To']['Address']   = $scope.To.Buyer.Address;
        data['To']['Phone']     = phone.join();
        data['To']['PhoneCode'] = ($scope.To.Buyer.Country && $scope.To.Buyer.Country.phone_code) ?  $scope.To.Buyer.Country.phone_code : "84";

        data['To']['Name']      = $scope.To.Buyer.Name;
        if (!data['To']['Name']) {
            return tran('ORDERC_ChuaNhapTenNguoiNhan');
        }
        
        if ($scope.To.Buyer.Id && $scope.To.Buyer.Id > 0) {
            data['To']['BuyerId'] = $scope.To.Buyer.Id;
        }

        if ($scope.To.Buyer.POBox) {
            data['To']['POBox'] = $scope.To.Buyer.POBox;
        }



        data['Order']['ProductName'] = ProductName;

        if ($scope.Product.Code !== undefined && $scope.Product.Code !== "") {
            data['Order']['Code'] = $scope.Product.Code;
        }

        if ($scope.Product.Note !== undefined && $scope.Product.Note !== "") {
            data['Order']['Note'] = $scope.Product.Note;
        }

        if ($scope.Product.Id !== undefined && $scope.Product.Id !== "") {
            data['Order']['ItemId'] = $scope.Product.Id;
        }
        if ($scope.Product.Id !== undefined && $scope.Product.Id !== "") {
            data['Order']['ItemId'] = $scope.Product.Id;
        }
        if ($scope.Product.Description !== undefined && $scope.Product.Description !== "") {
            data['Order']['Description'] = $scope.Product.Description;
        }
        

        

        return data;
    }



    // Re-Caculator fee on change data

    var calculateTimeout = null;
    $scope.waiting       = false;

    

    

    var FeeChange = function (newVal, OldVal){
        if (newVal !== undefined && newVal !== undefined ) {
            
            if (canCalculateShiphung() || canCalculateBoxme()) {
                if($scope.To.Buyer.Country && $scope.To.Buyer.Country.id !== 237 && $scope.To.Buyer.CityGlobal){

                }else if(!$scope.To.Buyer.Area  || !$scope.To.Buyer.Area.district_id || !$scope.To.Buyer.Area.city_id){
                    return false;
                }

                


                $scope.waiting = true;

                if (calculateTimeout) {
                    $timeout.cancel(calculateTimeout);
                }

                var data = BuildData(true);
                $scope.list_courier_detail = [];
                $scope.calculateInfo.selected_courier = "";
    			if (typeof data == 'string') {
                        $scope.waiting = false;
    		            return toaster.pop('warning', tran('toaster_ss_nitifi'), data);
    	        }

                
                calculateTimeout = $timeout(function() {
                    
                    if ($scope.Config.Type == 1 && (!data['Order']['Collect'] || data['Order']['Collect'] == "")) {
                        
                        $timeout(function (){
                            $('#money_collect').focus().addClass('ng-invalid').addClass('ng-dirty');
                        }, 100);
                        
                    }
                    
                    if (!data) {
                        $timeout.cancel(calculateTimeout);
                        return $scope.waiting = false; 

                    };

                    

                    

                    var currentDate = new Date();
                    

                    
                    if(data['Config']['Service'] == 8 || data['Config']['Service'] == 9 || (data['Config']['Service'] == 15 && data['To']['Country'] != 237)){
                        data['Courier'] = undefined;
                        Order.CalculateGlobal(data).then(function (result) {
                            $scope.waiting = false; 
                            if(!result.data.error){
                                if(result.data.data.courier && result.data.data.courier.system[0]){
                                    $scope.calculateInfo.selected_courier = result.data.data.courier.system[0];
                                    if ([6,12].indexOf($scope.Config.Service)>=0 && !result.data.data.courier.system[0].fee){
                                        result.data.data.courier.system[0].fee = {pvc :0}
                                    }
                                    $scope.fee_detail = result.data.data.courier.system[0].fee;
                                    
                                    if(result.data.data.courier.system.length >=2){
                                        angular.forEach(result.data.data.courier.system, function (value){
                                            if($scope.calculateInfo.selected_courier.fee.pvc > value.fee.pvc){
                                                $scope.calculateInfo.selected_courier = value;
                                                $scope.fee_detail = value.fee;
                                            }
                                        });
                                    }
                                    
                                }else{
                                    toaster.pop('warning', tran('toaster_ss_nitifi'),tran('ORDERC_ShipChungChuaHoTroKhuVucQuocteNay') );
                                }
                                
                                
                                $scope.list_courier_detail = result.data.data.courier.system;
                                //$scope.list_courier_detail  = PhpJs.array_merge_recursive($scope.fee_detail.courier.me, $scope.fee_detail.courier.system);

                                if((parseInt($scope.Config.Type) == 2 || parseInt($scope.Config.Type) == 4) && !$scope.From.Inventory.warehouse_code){
                                    $scope.fee_detail.collect    += $scope.calculateInfo.selected_courier.money_pickup;
                                    $scope.money_pickup_teamp = $scope.calculateInfo.selected_courier.money_pickup;
                                }
                            }else {
                                HandlerError(result.data);
                                //toaster.pop('warning', 'Thông báo', result.data.message);
                                $scope.fee_detail   = {};
                            }
                        })
                    }else{
                        Order.CalculateVN(data).then(function (result) {
                            $scope.waiting = false; 
                            if(!result.data.error){
                                $scope.fee_detail       = result.data.data;
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

                                if((parseInt($scope.Config.Type) == 2 || parseInt($scope.Config.Type) == 4) && !$scope.From.Inventory.warehouse_code){
                                    $scope.fee_detail.collect    += $scope.calculateInfo.selected_courier.money_pickup;
                                    $scope.money_pickup_teamp = $scope.calculateInfo.selected_courier.money_pickup;
                                }


                            }else {
                                HandlerError(result.data);
                                $scope.fee_detail   = {};
                            }
                        })
                    }
                }, 2000);
                
                
            }else {
                $scope.waiting = false;
            }
        };
    };


    $scope.$watch('calculateInfo.selected_courier', function (Value, OldValue){
        if( (parseInt($scope.Config.Type) == 2 || parseInt($scope.Config.Type) == 4) && !$scope.From.Inventory.warehouse_code){

            if(Value != undefined && Value.courier_id != undefined){
                var oldv    = 0;
                var newv    = 1 * Value.money_pickup.toString().replace(/,/gi,"");

                if(OldValue.money_pickup != undefined){
                    oldv    = 1 * OldValue.money_pickup.toString().replace(/,/gi,"");
                    if(oldv > 0){
                        $scope.fee_detail.collect    -= oldv;
                    }
                    if($scope.Config.ToPostOffice != 1){
                        $scope.fee_detail.collect    += newv;
                        $scope.money_pickup_teamp =  newv;
                    }
                    
                }
                if($scope.Config.ToPostOffice == 1){
                    openDialogCreateSuccessDropOf();
                }
            }
        }
        if($scope.Config.Service == 8 || $scope.Config.Service == 9){
                if(Value != undefined && Value.courier_id != undefined){
                    $scope.fee_detail = Value.fee;
                    if(Value.money_pickup){
                        $scope.fee_detail.collect = $scope.fee_detail.collect + Value.money_pickup;
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

    
    $scope.list_country = [];
   Location.country().then(function (resp){
        //$scope.list_country = resp.data.data;
        $scope.list_country = [{"id":-1},{"id":-2},{"id":-3}];
    	var china 		= {}
        angular.forEach(resp.data.data, function (value){
            value.country_code_img = value.country_code.toLowerCase()
            if([237,230,229].indexOf(value.id) >=0){
            	if(value && value.id == 237){
                    $scope.list_country[0] = value
                    $scope.To.Buyer.Country = value;
                }
                if(value && value.id == 230){
                    $scope.list_country[1] = value
                }
                if(value && value.id == 229){
                    $scope.list_country[2] = value
                }
            }
            if(value && parseInt(value.id) == 44){
                china = value;
                $scope.arrChina.country.push(value)
            }
            if(value && parseInt(value.id) == 246){
                $scope.arrChina.country.push(value)
            }
            if(value && [44,246,237,230,229].indexOf(value.id) <= -1){
                $scope.list_country.push(value)
            }	
        });
    	china.country_name 	= "China"
    	china.id 			= -1;
        $scope.list_country.push(china)
   })

    $scope.open_sdt = function(){
        $scope.hideopenphone = false;
        $scope.classphone = "open";
        $scope.openphone = $scope.openphone  == true ? false:true;
    }
    $scope.setcontry = function(value){
         $scope.openphone     = false;
         $scope.hideopenphone = true;
         $scope.To.Buyer.Country = value;
    }
    $scope.show_phone2 = false;
    $scope.show_phone_2 = function(){
        $scope.show_phone2 = !$scope.show_phone2
    }
    $scope.$watch('To.Buyer.Area.district_id', function (newVal, OldVal){
        if ($scope.To.Buyer && parseInt($scope.To.Buyer.ward_id) > 0) {
            $scope.To.Buyer.ward_id    = 0;
        }
        if (newVal && newVal > 0 && newVal != OldVal && $scope.Config.Service != 6 && $scope.Config.Service != 12) {
            $scope.list_ward_by_district = [];
            $scope.list_ward_by_district = AppStorage.getWardByDistrict(newVal);
        }
    });


    // Validate phone 2
    $scope.phone2IsWrong = false;



    

    $scope.$watch('To.Buyer.Phone', function (newVal, oldVal){
       if(newVal && newVal.length<=5){
           if(newVal[0] == '+'){
               newVal = newVal.replace("+", "");
               angular.forEach($scope.list_country, function (value){
                if(newVal.toString() == value.phone_code.toString()){
                    $scope.To.Buyer.Country = value; 
                }
            });
           }
           
       }
    })

    $scope.$watch('Config.Type', function (newVal, oldVal){
        if (newVal) {
            $scope.fee_detail = {};
            $scope.calculateInfo.selected_courier = "";
            $scope.money_collect = 0;
        }
    })


    var openDialogCreateSuccessDropOf = function(){
        $rootScope.openDropOf = $modal.open({
            templateUrl : 'show_dropoff.html',
            controller  : 'openDialogCreateSuccessDropoffCtrl',
            size: 'lg',
            resolve: {
                selected_courier: function() {return $scope.calculateInfo.selected_courier ;}
            },
            
        }).result.then(function(result) {
            if(result){
                $scope.list_inventory = $scope.list_inventory_temp;
                $scope.post_office = result
                FeeChange();
            }
        });
        
    }
    

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
   $scope._funcAdd    = function(){
        $scope.addTabs()
    }
    $scope.open = function (tracking_code,AutoAccept) {
                $modal.open({
                    templateUrl	: 'create_suscess.html',
                    controller	: 'PopupSuscessCtrl',
                    size: 'md',
                    resolve: {
                        items: function() {return {tracking:tracking_code,AutoAccept:AutoAccept};}
                    }
                }).result.then(function(result) {
                    if(result){
                         $scope.addTabs()
                    }
                });
    };
    var openDialogCreateSuccess = function (tracking_code){
            $scope.open(tracking_code,false);
    }
   
   //openDialogCreateSuccess("SC12311")
    var openDialogAcceptSuccess = function (tracking_code, courier_id, callback){ 
        $scope.open(tracking_code,true);
    }
    

    var openDialogCollectNotEnought = function (tracking_code, callback){ 
    	bootbox.dialog({
             message: tran('ORDERC_SoDuCuaQuyKhachKhongDu'),
        	title: tran('ORDERC_SoDuCuaBanKhongDu'),//"Số dư của bạn không đủ để duyệt đơn hàng",
            buttons: {
                print: {
                    label: tran('OBG_LuuLaiVaDuyetSau'),//"Lưu đơn duyệt sau",
                    className: "bg-orange", 
                    callback: function (){
                        $scope.CreateOrder(false);
                    }
                },
                main: {
                    label: tran('Cashin_Naptien'),//"Nạp tiền ngay",
                    className: "btn-info", 
                    callback: function (){
                        $state.go('cashin.payment_type');
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
            	openDialog(tran('ORDERC_ShipChungChuaHoTroKhuVucNay'), tran('ORDERC_RatXinLoiQuyKhachC'));
            break;
            case "UNSUPPORT_PICKUP": 
            	openDialog(tran('ORDERC_ShipChungChuaHoTroKhuVucNay'), tran('ORDERC_ChuaHoTroLayHang'));
            break;
            case "FAIL": 
            	openDialog(tran('ORDERC_TaoDuyetDonChuaThanhCong'), tran('ORDERC_TaoDuyetDonChuaThanhCongDoKyThuat'));
            break;
            case 'NOT_ENOUGH_MONEY':
                 openDialogCollectNotEnought();
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
        
        $scope.createWaiting = true;
        Order.CreateV2Global(data).then(function (result) {
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
                    // Intercom   
                    try {
                    	if($rootScope.userInfo.first_order_time == 1){
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create and approve order",
             	                   links		:   $rootScope.userInfo.fulfillment ? "order/create-global-bm" :"order/create-global",
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
                     openDialogAcceptSuccess($scope.NewOrder.TrackingCode, $scope.NewOrder.CourierId);
                }else {
                 // Intercom   
                    try {
                    	if($rootScope.userInfo.first_order_time == 1){
                    		var metadata = {
                         		   create_by	: 	$rootScope.userInfo.email 	? $rootScope.userInfo.email 	: "",
                         		   order_number : 	$scope.NewOrder.TrackingCode ? $scope.NewOrder.TrackingCode : "",   
             	                   active		:	"Create order",
             	                   links		:    $rootScope.userInfo.fulfillment ? "order/create-global-bm" :"order/create-global",
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
                    openDialogCreateSuccess($scope.NewOrder.TrackingCode);
                }
                
                if(result.data.code == 'OUT_OF_STOCK'){
                    return toaster.pop('warning', tran('toaster_ss_nitifi'), "Sản phẩm đã hết hàng trong kho !");
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
           // return toaster.pop('warning', 'Thông báo', 'Bạn chưa nhập số điện thoại liên hệ ');
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

    $scope.list_city_global = [];


    $scope.loadCityGlobal = function(country_id, q){
        if(q || q.toString()=="getdata"){
            if(q.toString()=="getdata"){
                q = "";
            }
            $scope.list_city_global = [];
                if (country_id == -1){
                    if($scope.To.Buyer.CityGlobal && $scope.To.Buyer.CityGlobal.city_name && !q){
                        q = $scope.To.Buyer.CityGlobal.city_name;
                    }
                    Location.city_global(44, q).then(function (resp){
                        $scope.arrChina.china_1 = resp.data.data;
                        $scope.list_city_global = resp.data.data;
                    })
                    Location.city_global(246, q).then(function (resp){
                        if(resp.data && resp.data.data){;
                            angular.forEach(resp.data.data, function (value){
                                $scope.list_city_global.push(value);
                            })
                        }
                    })
                    return $scope.list_city_global;
                }else{
                    return Location.city_global(country_id, q).then(function (resp){
                        $scope.list_city_global = resp.data.data;
                    })
                }
        }
    }
    

    $scope.last_payment_type     = $scope.Config.Type;
    $scope.disabled_payment_type = false;
    $scope.disabled_service      = false;

    $scope.$watch('To.Buyer.Country', function (newVal){
        if(newVal && (newVal.id > 0 || newVal.id == -1)){
            if(newVal.id !== 237){
                // if($scope.To.Buyer.PhoneCtrl){
                //     $scope.To.Buyer.PhoneCtrl.setCountry(newVal.country_code)
                // }
                $scope.To.Buyer.CityGlobal   = undefined;
                
                $scope.disabled_payment_type = true;
                $scope.disabled_service      = true;
                $scope.Config.Type           = 5;
                $scope.Config.Service        = 8;

            }else {
                $scope.disabled_payment_type = false;
                $scope.disabled_service      = false;
                $scope.Config.Service        = 2;
                $scope.Config.Type           = $scope.last_payment_type;
            }
            if(!$scope.check_order_shopify){
                $scope.loadCityGlobal(newVal.id, "getdata");
            }
        }
    })

    
    $scope.$watch('To.Buyer.CityGlobal', FeeChange);
    //$scope.$watch('To.Buyer.Area', FeeChange);
    $scope.$watch('To.Buyer.Zipcode', FeeChange);
    $scope.$watch('Product.Weight', FeeChange);
    $scope.$watch('Product.Price', FeeChange);
    $scope.$watch('Product.MoneyCollect', FeeChange);
    $scope.$watch('Product.BoxSize.W', boxSizeChange);
    $scope.$watch('Product.BoxSize.H', boxSizeChange);
    $scope.$watch('Product.BoxSize.L', boxSizeChange);
    $scope.$watch('From.Inventory', FeeChange);
    // $scope.$watch('Config.Service', FeeChange);
    $scope.$watch('Config.Protected', FeeChange);
    $scope.$watch('Config.Type', FeeChange);
    //popup service
    $scope.close_popup_check_service = function(){
        $scope.data_service_popup.css = "data_service_popup_close";
        //$scope.data_service_popup = { isOpen:false,  Title      : "",Description : ""};
    }
    $scope.data_service_popup = { isOpen:false,  Title      : "",Description : "",css:""};

    
    $scope.$watch('Config.Service', function(){
       $scope.data_service_popup = { isOpen:false,  Title      : "",Description : "",css:""};
        if($scope.Config.Service == 3){ //phat hoa toc
            $scope.data_service_popup.isOpen = true;
            $scope.data_service_popup.Title         = tran('toaster_ss_nitifi');
            $scope.data_service_popup.Description   = tran('OBG_DichVuHoaTocChiAPDungNoiThanh');
            $timeout(function (){
                  $scope.data_service_popup.css = "data_service_popup_close";
             }, 10000);
        }else if($scope.Config.Service == 7){ //phat trong ngay
            $scope.data_service_popup.isOpen = true;
            $scope.data_service_popup.Title         = tran('toaster_ss_nitifi');
            $scope.data_service_popup.Description   = tran('OBG_DichVuTrongNgayCHiApDungNT');
            $timeout(function (){
                  $scope.data_service_popup.css = "data_service_popup_close";
             }, 10000);
        }else if([6,12].indexOf($scope.Config.Service) >=0){ //Xuat hang tai kho
            $scope.Config.Type = 5;
            $scope.To.Buyer.Area = {}
            $scope.To.Buyer.Area.district_id    = $scope.From.Inventory.province_id;
            $scope.To.Buyer.Address             = $scope.From.Inventory.address;
            $scope.To.Buyer.Name                = $scope.From.Inventory.name;
            $scope.To.Buyer.Phone               = $scope.From.Inventory.phone;
            document.getElementById("order_phone").value = $scope.From.Inventory.phone;
        }
        //xuat hang khoi kho mac dinh se khong thu ho
        if($rootScope.orderProductSelected && $rootScope.orderProductSelected.list_sku && $rootScope.orderProductSelected.list_sku.length >=1){
            $scope.Config.Type = 5;
        }
        FeeChange($scope.Config.Service)
        
    });
    
    $scope.$watch('Config.Fragile', function(newV,oldV){
         if(newV && newV == 1){
             if($scope.Config.Service == 2){
                 $scope.Config.Service = 1;
             }
         }
         
     });
   // $scope.$watch('Config.Coupon_code', FeeChange);
    $scope.add_coupon_code = function(){
        FeeChange($scope.Config.Coupon_code)
    }
     $scope.$watch('To.Buyer.Area', function(newV,oldV){
         if(newV){
            if(newV.city_id && $scope.From.Inventory && $scope.From.Inventory && $scope.Config.Service != 6 && $scope.Config.Service != 12){
                if(parseInt(newV.city_id) ==  parseInt($scope.From.Inventory.city_id)){
                    _getService(true)
                }else{
                    _getService(false)
                }
            }
            FeeChange(newV)
         }
         
     });
    $scope.$watch('Config.ToPostOffice', function(){
       
        if($scope.Config.ToPostOffice == 1){
            if($scope.fee_detail && $scope.fee_detail.collect &&  $scope.money_pickup_teamp ) {
                $scope.fee_detail.collect  =  $scope.fee_detail.collect - $scope.money_pickup_teamp
            }
            openDialogCreateSuccessDropOf();
        }else{
            if($scope.fee_detail && $scope.fee_detail.collect &&  $scope.money_pickup_teamp) {
                $scope.fee_detail.collect  =  $scope.fee_detail.collect + $scope.money_pickup_teamp
            }
            $scope.post_office = null;                
            FeeChange();
        }
    });


    $scope.list_products = [];
    $scope.$watch('From.Inventory', function (){
        $scope._boxme.Items             = [];
        $scope._boxme.TotalItemAmount   = 0;
        $scope._boxme.TotalItemQuantity = 0;
        $scope._boxme.TotalItemWeight   = 0;
        $scope._boxme.ItemsName         = "";

        if($scope.From.Inventory && $scope.From.Inventory.warehouse_code && $scope.From.Inventory.warehouse_code.length > 0){
            $scope.list_products            = [];
            
            WarehouseRepository.GetProducts($scope.From.Inventory.warehouse_code, true).then(function (data){
                if(data.total_items && data.total_items > 0){
                    $scope.list_products = data._embedded.product;
                    /// chon nhung san pham tu danh sach product wa
                    if($rootScope.orderProductSelected && $rootScope.orderProductSelected.list_sku && $rootScope.orderProductSelected.list_sku.length >=1){
                        angular.forEach($scope.list_products, function (item){
                            angular.forEach($rootScope.orderProductSelected.list_sku, function (jtem){
                                if(jtem.toString() == item.SellerBSIN.toString()){
                                    $scope.AddItem(item,true)
                                }
                            })    
                        })
                    }
                    //end
                }
                
            })
            if([6,12].indexOf($scope.Config.Service) >=0){ //Xuat hang tai kho
                $scope.Config.Type = 5;
                $scope.To.Buyer.Area = {}
                $scope.To.Buyer.Area.district_id    = $scope.From.Inventory.province_id;
                $scope.To.Buyer.Address             = $scope.From.Inventory.address;
                $scope.To.Buyer.Name                = $scope.From.Inventory.name;
                $scope.To.Buyer.Phone               = $scope.From.Inventory.phone;
                document.getElementById("order_phone").value = $scope.From.Inventory.phone;
            }
        }else{
            if($scope.To.Buyer.Country && $scope.To.Buyer.Country.id == 237) {
                if(!$scope.To.Buyer.Area || Object.keys($scope.To.Buyer.Area).length ==0){
                    _getService(true)
                }else{
                    if($scope.From.Inventory.city_id == $scope.To.Buyer.Area.city_id){
                        _getService(true)
                    }else{
                        _getService(false)
                    }
                }
            }
            
            
        }
    });

    $scope._boxme.TotalItemAmount   = 0;
    $scope._boxme.TotalItemQuantity = 0;
    $scope._boxme.TotalItemWeight   = 0;
    $scope._boxme.ItemsName         = "";
    
    


    $scope._boxme.ItemChange = function (){
        if($scope._boxme.Items && $scope._boxme.Items.length >0){

            $scope._boxme.TotalItemAmount   = 0;
            $scope._boxme.TotalItemQuantity = 0;
            $scope._boxme.TotalItemWeight   = 0;
            $scope._boxme.ItemsName         = "";
            
            var names = [];
            angular.forEach($scope._boxme.Items, function (value){
                names.push(value.ProductName);
                $scope._boxme.TotalItemAmount   += value.PriceItem * (value.Quantity * 1)
                $scope._boxme.TotalItemQuantity += parseInt(value.Quantity);
                if(value.WeightPacked >= value.WeightItem){
                    $scope._boxme.TotalItemWeight   += parseInt(value.WeightPacked) * parseInt(value.Quantity);
                }else{
                    $scope._boxme.TotalItemWeight   += parseInt(value.WeightItem) * parseInt(value.Quantity);
                }
            })

            $scope._boxme.ItemsName         = names.join(',');
            
            FeeChange({'a':1}, {'b':1});
        }else {
            $scope._boxme.TotalItemAmount   = 0;
            $scope._boxme.TotalItemQuantity = 0;
            $scope._boxme.TotalItemWeight   = 0;
            $scope._boxme.ItemsName         = "";
        }
    }

    $scope._boxme.remoteProductItem = function (item){
        if(item){
            $scope._boxme.Items.splice($scope._boxme.Items.indexOf(item), 1)
            $scope._boxme.ItemChange();
        }
    }
    var check_item_box = function(item){
        var check_item = false
        if (item && item.SellerBSIN){
             angular.forEach($scope._boxme.Items, function (value){
                if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                check_item = true;
                }
            });
        }
        return check_item;
    }
    $scope.AddItem = function (item,all=false){
        item.Quantity = item.Quantity ? item.Quantity : 1;
        item            = angular.copy(item);
        if(check_item_box(item) == false){
            $scope._boxme.Items.push(item);
            if(all){
                angular.forEach($scope._boxme.Items, function (value){
                    if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                        value.Quantity = value.AvailableItem ? value.AvailableItem: 1;
                    }
                });
            }
        }else{
            angular.forEach($scope._boxme.Items, function (value){
                if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                    value.Quantity = value.Quantity + 1;
                }
            });
        }
        
        $scope._boxme.ItemChange()
    }
    

    
    
    $scope.$watch('box_size_check', function (newVal, Old){
        $scope.Product.BoxSize  = '';
        if (newVal !== undefined) {
            if (newVal == false && get_number($scope.Product.Weight) > 0) {
                FeeChange(newVal, Old);
            }
        }
    })


    // Get location ;

    // navigator.geolocation.getCurrentPosition(function (pos){
    //     var crd = pos.coords;
    //     $rootScope.pos = {
    //         lat: crd.latitude,
    //         lng: crd.longitude
    //     };
    //     $scope.loadInventory($rootScope.pos, null);

    // }, function (){
    //     $scope.loadInventory($rootScope.pos, null);
    // }, {});
    $scope.loadInventory($rootScope.pos, null);
    
}]);

angular.module('app').controller('openDialogCreateSuccessDropoffCtrl', 
                ['$rootScope','$scope','$filter', '$modalInstance', 'selected_courier', '$http', '$anchorScroll',
        function( $rootScope, $scope , $filter  ,   $modalInstance,  selected_courier,   $http,   $anchorScroll ) {
                    
                    $scope.courier_id = undefined;
                    $scope.selected_courier_id = selected_courier.courier_id
                    var tran = $filter('translate');
                    var map, input, autocomplete, markers = [];
                    $scope.list_postoffice = [];
                    $scope.loading = false;
                    $scope.postoffice_select = {};
                    $scope.get_postoffice = function(){
                        $modalInstance.close($scope.postoffice_select);
                    }
                    $scope.seller_postoffice = function(item){
                        $modalInstance.close(item);
                    }
                    $scope.cancel = function(){
                        $modalInstance.close($scope.postoffice_select);
                    }
                    var icons = {
                        '1': '/img/marker/location-viettel1.png',
                        '2': '/img/marker/50x67/skootar.png',
                        '3': '/img/marker/50x67/thailandpost.png',
                        '4': '/img/marker/50x67/aramex.png',
                        '9': '/img/marker/50x67/DHL.png',
                        '10': '/img/marker/50x67/dpex.png',
                        '11': '/img/marker/50x67/sfe.png',
                        '12': '/img/marker/50x67/ups.png'
                    };
                    var infowindow = new google.maps.InfoWindow();
                    
                    $scope.goCenter = function (value){
                        $scope.postoffice_select = value;
                        map.setCenter(new google.maps.LatLng(value.lat, value.lng));
                        map.setZoom(16);
                    }; 

                    $scope.getNearPostoffice = function (lat, lng,courier_id){
                        $scope.list_postoffice = [];
                        $scope.loading         = true;
                        $http.get(ApiPath + 'post-office/find-around', {params: {
                            lat     : lat,
                            lng     : lng,
                            radius  : 5,
                            limit   : 20,
                            courier_id  : courier_id ? courier_id :null,
                        }}).success(function (resp){
                            $scope.loading         = false;

                            angular.forEach(resp.data, function (value){
                                if(value.courier_id.toString() == $scope.selected_courier_id.toString()){
                                    $scope.list_postoffice .push(value)
                                }
                            });
                            //$scope.list_postoffice = resp.data;
                            $scope.postoffice_select = $scope.list_postoffice[0] ? $scope.list_postoffice[0]:null
                            $scope.postoffice_select_check = $scope.postoffice_select ? $scope.postoffice_select.id :null
                            $scope.clearMarker();
                            angular.forEach($scope.list_postoffice, function (value){
                                var _marker = new google.maps.Marker({
                                    map: map
                                });

                                _marker.setIcon(({
                                    url: icons[value.courier_id] ? icons[value.courier_id] : '/img/marker/location-ems-1.png',
                                }));
                                _marker.setPosition(new google.maps.LatLng(value.lat, value.lng));
                                _marker.setVisible(true);

                                google.maps.event.addListener(_marker,'click', (function(marker,value,infowindow){
                                    return function() {
                                        map.setCenter(new google.maps.LatLng(value.lat, value.lng));
                                        infowindow.setContent("<h5>"+tran('PO_buucuc')+" " + value.name + "</h5><p>"+tran('PO_diachi')+" : "+value.address+"</p><p>"+tran('PO_SDT')+" " + value.phone + "</p><p><a href='#/order/create-global?bc="+value.id+"' style='color:#23b7e5'>"+tran('PO_taodonhang')+"</a> | <a href='#/order/upload/step1?bc="+value.id+"' style='color:#23b7e5'>"+tran('PO_taodonhangexcel')+"</a></p>");
                                        infowindow.open(map, marker);
                                    };
                                })(_marker, value, infowindow));

                                value.marker = _marker;
                                markers.push(_marker);
                            })

                            
                            
                            
                            
                        })
                    }

                    $scope.clearMarker = function (){
                        for (var i = markers.length - 1; i >= 0; i--) {
                            if(markers[i]){
                                markers[i].setMap(null);
                            }

                        };
                        
                        markers = [];
                    }
                    function initMap(lat, lng) {
                        lat = lat || 21.0031180;
                        lng = lng || 105.8201410;

                        map = new google.maps.Map(document.getElementById('map'), {
                            center  : {lat: lat, lng: lng},
                            zoom    : 15
                        });
                        
                        input = (document.getElementById('address-input'));

                        var marker = new google.maps.Marker({
                            map: map
                        }); 

                        $scope.getNearPostoffice(lat, lng,$scope.courier_id);

                        autocomplete = new google.maps.places.Autocomplete(input);
                        window.setTimeout(function () {
                            google.maps.event.trigger(map, 'resize')
                        }, 0);
                        autocomplete.bindTo('bounds', map);
                        autocomplete.addListener('place_changed', function() {

                            marker.setVisible(false);

                            var place = autocomplete.getPlace();
                            if(place.geometry){

                                map.panTo(place.geometry.location);
                                map.setCenter(place.geometry.location);

                                $scope.getNearPostoffice(place.geometry.location.lat(), place.geometry.location.lng(),$scope.courier_id);

                                marker.setIcon(({
                                    url: '/img/marker_.png'

                                }));

                                marker.setPosition(place.geometry.location);
                                marker.setVisible(true);

                            }

                        });


                    }
                    
                    $scope.load_map_from_courierid = function(courier_id){
                        initMap(null,null,courier_id)
                    }
                    setTimeout(function (){
                        
                        function success(pos) {
                            var crd = pos.coords;
                            initMap(crd.latitude, crd.longitude);
                        };

                        function error(err) {
                            initMap();
                        };
                        navigator.geolocation.getCurrentPosition(success, error, {});

                        setTimeout(function (){
                            if (!map) {
                                initMap();
                            };
                        }, 2000)


                    }, 200)         
                    
                //$socpe.   
                    
        }]);

 app.controller('StoreConnectController', [
            '$scope','$modalInstance', '$rootScope',  '$state', '$stateParams',    'StoreConnect',  '$localStorage', 'CurencyExchange','data_transfer', 'PhpJs' ,
    function($scope ,  $modalInstance,  $rootScope,  $state, $stateParams,     StoreConnect ,$localStorage, CurencyExchange ,data_transfer , PhpJs) {
        $scope.type = data_transfer.type;
        $scope.store_list = {
            1 : 'Shopify',
            2 : 'Magento',
            3 : 'Lazada',
            4 : 'Woocommerce',
            5 : 'Etsy',
            6 : 'Ebay',
            7 : 'Haravan',
            8 : 'Robins'
        }
        $scope.StoreConnect = {}
        $scope.waiting = false;
        $scope.params  ={
            "page_size" : 20,
            "page"      : 1,
            "order_id"  : undefined
        }
        $scope.params_search = {}
        $scope.search_order = function(order){
            $scope.params_search = {
                "store": $scope.StoreConnect.Store.id,
                "order": order ? order : $scope.params_search.order
            }
            if(!$scope.params_search.order || $scope.params_search.order == ""){
                $scope.get_order();
            }else{
                $scope.waiting = true;
                StoreConnect.getOrder($scope.params_search).then(function (result) {
                    $scope.waiting = false;
                    
                    if(!result.error){
                        
                        $scope.data_order   = result.data.data;
                        $scope.total        = 1 ;
                        //
                        if($scope.data_order.length>=1){
                            angular.forEach($scope.data_order, function (value){
                                if(value.Order.Currency.toString() == "VND"){
                                    value.Order.Amount = parseInt(value.Order.Amount)
                                    angular.forEach(value.Items, function (item){
                                        item.price = parseInt(item.price)
                                    })
                                }
                            })
                        }
                        //
                    }else{
                        $scope.data_order = [] 
                    }
                },function(rep){
                    $scope.waiting = false;
                    $scope.data_order = [] 
                })
            }
            
        }
        $scope.get_order = function(id){
            $scope.params.store = id ? id : $scope.StoreConnect.Store.id;
            $scope.waiting = true;
            StoreConnect.getOrder($scope.params).then(function (result) {
                $scope.waiting = false;

                if(!result.error){
                    $scope.data_order   = result.data.data;
                    $scope.total        = result.data.total;
                    //
                    if($scope.data_order.length>=1){
                        angular.forEach($scope.data_order, function (value){
                            if(value.Order.Currency.toString() == "VND"){
                                value.Order.Amount = parseInt(value.Order.Amount)
                                angular.forEach(value.Items, function (item){
                                    item.price = parseInt(item.price)
                                })
                            }
                        })
                    }
                    //
                }else{
                    $scope.data_order = [] 
                }
            },function(rep){
                $scope.waiting = false;
                $scope.data_order = [] 
            })
        } 

        $scope.check_box = [];
        // Checkbox
        $scope.toggleSelection = function (id) {
            var data = angular.copy($scope.check_box);
            var idx = +data.indexOf(id);

            if (idx > -1) {
                $scope.check_box.splice(idx, 1);
            }
            else {
                $scope.check_box.push(id);
            }
        };

        $scope.check_list = function (id, action) {
            if($scope.check_box){
                var data = angular.copy($scope.check_box);
                var idx = +data.indexOf(id);

                if (idx > -1) {
                    if (action == 'delete') {
                        delete $scope.check_box[idx];
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            
        }

        $scope.toggleSelectionAll = function (check) {
            var check_box = $scope.check_box;
            if (check == 0) {
                $scope.check_box = [];
            } else {
                $scope.check_box = [];
                angular.forEach($scope.data_order, function (value, key) {
                    $scope.check_box.push(key);
                });
            }


        }

        $scope.ImportAll = function(){
            $scope.waiting_import_all = true;
            CurencyExchange.getExchange().then(function (result) {
                if(!result.error){
                    var data = [];
                    angular.forEach($scope.check_box, function (value, key) {
                        var Order = $scope.data_order[value];
                        if($localStorage['login'].currency_detail && $localStorage['login'].currency_detail.code){
                            // DON VI TIEN SHIPIFY  =DON VI TIEN  TE SHIPCHUNG  (VD:VND = VND,USD = USD)
                            if(Order.Order && Order.Order.Currency.toString() == $localStorage['login'].currency_detail.code.toString()){    
                                //SHOPIFY = VND VA SHIPCHUNG VND
                                if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                    if(Order.Order.Amount){
                                        Order.Order.Amount = Math.ceil(Order.Order.Amount);
                                    }
                                }else{
                                    Order.Order.Amount =  $rootScope.convert_currency_to_home_currency(Order.Order.Amount)
                                    Order.Order.exchange_rate = $rootScope.exchangeRate;
                                    Order.Order.Currency = 'VND';
                                }
                            }else{
                                // DON VI TIEN SHIPIFY  != DON VI TIEN  TE SHIPCHUNG  (VD:VND = USD)
                                //TIEN SHIPCHUNG LA VND, KHAC VND KHONG HO TRO
                                if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                    angular.forEach(result.data.data, function (value){
                                        if(value.curency_code.toString() == Order.Order.Currency.toString()){
                                            Order.Order.Amount = Math.ceil(Order.Order.Amount * value.exchange_rate);
                                            Order.Order.exchange_rate = value.exchange_rate;
                                            Order.Order.Currency = 'VND';
                                        }
                                    })
                                }
                                
                            }
                        }
                        data.push(Order);
                    });
                    
                    StoreConnect.postImportAll({'data' : data}).then(function (result) {
                        if(!result.data.error){
                            $state.go('order.upload3',{id:result.data.id});
                            $modalInstance.close();
                        }
                        $scope.waiting_import_all = false;
                    })
                }
            })
            
        }

        $scope.DownloadExcel = function(){
            CurencyExchange.getExchange().then(function (result) {
                if(!result.error){
                    var data = [];
                    angular.forEach($scope.check_box, function (value, key) {
                        var Order = $scope.data_order[value];
                        if($localStorage['login'].currency_detail && $localStorage['login'].currency_detail.code){
                            // DON VI TIEN SHIPIFY  =DON VI TIEN  TE SHIPCHUNG  (VD:VND = VND,USD = USD)
                            if(Order.Order && Order.Order.Currency.toString() == $localStorage['login'].currency_detail.code.toString()){    
                                //SHOPIFY = VND VA SHIPCHUNG VND
                                if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                    if(Order.Order.Amount){
                                        Order.Order.Amount = Math.ceil(Order.Order.Amount);
                                    }
                                }else{
                                    $scope.Product.Price_curernt_2 = Order.Order.Amount;
                                    Order.Order.Amount =  $rootScope.convert_currency_to_home_currency($scope.Product.Price_curernt_2);
                                    Order.Order.exchange_rate = $rootScope.exchangeRate;
                                    Order.Order.Currency = 'VND';
                                }
                            }else{
                                // DON VI TIEN SHIPIFY  != DON VI TIEN  TE SHIPCHUNG  (VD:VND = USD)
                                //TIEN SHIPCHUNG LA VND, KHAC VND KHONG HO TRO
                                if($localStorage['login'].currency_detail.code.toString() == "VND"){
                                    angular.forEach(result.data.data, function (value){
                                        if(value.curency_code.toString() == Order.Order.Currency.toString()){
                                            Order.Order.Amount = Math.ceil(Order.Order.Amount * value.exchange_rate);
                                            Order.Order.exchange_rate = value.exchange_rate;
                                            Order.Order.Currency = 'VND';
                                        }
                                    })
                                }
                                
                            }
                        }
                        data.push(Order.order_code);
                    });
                    
                    StoreConnect.DownloadExcel({'data' : JSON.stringify(data) });
                }
            })

            
        }

        $scope.SyncOrder = function(){
            $scope.waiting_sync_order = true;
            StoreConnect.SyncOrder($scope.StoreConnect.Store.id).then(function(result){
                if(!result.data.error){
                    $scope.get_order($scope.StoreConnect.Store.id);
                }else{
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
                $scope.waiting_sync_order = false;
            })
        }

        if($rootScope.userInfo && $rootScope.userInfo.store_connect){
            switch($scope.type) {
                case 1:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.shopify ? $rootScope.userInfo.store_connect.shopify : [];
                    break;
                case 2:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.magento ? $rootScope.userInfo.store_connect.magento : [];
                    break;
                case 3:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.lazada ? $rootScope.userInfo.store_connect.lazada : [];
                    break;
                case 4:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.woocommerce ? $rootScope.userInfo.store_connect.woocommerce : [];
                    break;
                case 5:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.etsy ? $rootScope.userInfo.store_connect.etsy : [];
                    break;
                case 6:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.ebay ? $rootScope.userInfo.store_connect.ebay : [];
                    break;
                case 7:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.haravan ? $rootScope.userInfo.store_connect.haravan : [];
                    break;
                case 8:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.robins ? $rootScope.userInfo.store_connect.robins : [];
                break;
                default:
                    $scope.list_store_connect = $rootScope.userInfo.store_connect.shopify ? $rootScope.userInfo.store_connect.shopify : [];
                    break;
            } 

            angular.forEach($scope.list_store_connect,function(value,key){
                if($rootScope.keyLang == "vi"){
                    $scope.list_store_connect[key]['last_time_sync_before'] = PhpJs.ScenarioTime(Date.parse(new Date()) / 1000 - value.last_time_sync);
                }else{
                    $scope.list_store_connect[key]['last_time_sync_before'] = PhpJs.ScenarioTime_en(Date.parse(new Date()) / 1000 - value.last_time_sync);
                }
            })
            
            if($scope.list_store_connect[0]){
               $scope.StoreConnect.Store =   $scope.list_store_connect[0] 
            }  
        }else{
            $scope.list_store_connect = []
        }
        
        
        $scope.$watch('StoreConnect.Store', function (newVal, oldVal){
            if (newVal) {
                $scope.get_order(newVal.id);
            }
        })
        $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
        }
        $scope.add_order = function(item){
            $scope.StoreConnect.Order = item
            $modalInstance.close($scope.StoreConnect);
        }
}]);

     app.filter('shipchungcut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    })
       

