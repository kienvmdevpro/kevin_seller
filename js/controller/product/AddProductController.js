app.controller('AddProductV2Controller',
['$q','$filter','$scope','$localStorage', '$rootScope',    'toaster',     'Pro', 'ProductsRepository', 'toaster', '$stateParams', '$state', 'WarehouseRepository', '$random2', 'Analytics',
function ($q,  $filter,  $scope,  $localStorage,   $rootScope,toaster,   Pro,   ProductsRepository,   toaster,   $stateParams,   $state,   WarehouseRepository,   $random2,   Analytics) {
    if($stateParams.code)
        Analytics.trackPage('Product/Edit/'+$stateParams.code);
    else
        Analytics.trackPage('Product/Create/Simple');
        // build ui for category
        var tran = $filter('translate');
    if(!$rootScope.userFulfillment){
        $state.go('product.thongbao');
    }

    $scope.stock_type =[{
        id      :   1,
        name    : 'Lưu kho thường',
        name_en : 'Normal Condition',
        icon    : 'fa-sun-o',
        style   : ''
    },{
        id      :   2,
        name    : 'Lưu kho mát',
        name_en : 'Air condition',
        icon    : 'fa-tint',
        style   : {"padding-right" : "5px"}
    }]
    //
    $scope.product = {
        warehouse_condition : 1,
        alert               : 10,
        Volume              : {},
        Serial              : 0, // quan ly bang serial, mac dinh bang 0 la khong dung

    }
    //set sku 
    $scope.convertTextToStringStandard = function (text){
        text = text.toLowerCase();
        text = text.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
        text = text.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g,"e");
        text = text.replace(/ì|í|ị|ỉ|ĩ/g,"i");
        text = text.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g,"o");
        text = text.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
        text = text.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
        text = text.replace(/đ/g,"d");
        text = text.replace(/đ/g,"d");
        text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}@!=_^|;`]/g,'');
        text = text.replace("]",'');
        text = text.replace("[",'');
        text = text.toUpperCase();
        return text
    }
    $scope.setSkuByName = function (value){
        if (value){
            var res = value.split(" ", 3);
            var text = "";
            for(var i = 0; i < res.length;i++){
                text = text+(res[i].substr(0, 1).toLowerCase());
            }	
            text = $scope.convertTextToStringStandard(text);
            return text
        }else return "BM"
    }
    
    $scope.$watch('product.Name', function(newV,oldV){
        if(newV && newV != oldV){ 
            if(!$stateParams.code){
                $scope.product.SellerSKU = ($scope.setSkuByName($scope.product.Name)+'-'+$random2());
            }
        }
    });
    $scope.$watch('product.upc', function(newV,oldV){
        if(newV && newV != oldV){ 
            if(!$stateParams.code){
                $scope.product.SellerSKU = newV;
            } 
        }else{
            if(!$stateParams.code){
                $scope.product.SellerSKU = ($scope.setSkuByName($scope.product.Name)+'-'+$random2());
            }
        }
    });
    //en set sku
    //check new product
        var imageDeferred   = $q.defer();
        $scope.imagePromise = imageDeferred.promise;
        if ($stateParams.code) {
            Pro.get($stateParams.code).then(function(product){
                $scope.min = product.Quantity;
                $scope.product = product.data;
                if ($scope.product.Volume && $scope.product.Volume != ''){
                    var volume_temp = $scope.product.Volume.split('x');
                    $scope.product.Serial = $scope.product.Serial ? $scope.product.Serial.toString() : 0;
                    $scope.product.Volume = {
                        'dai'   :volume_temp[0] ? parseInt(volume_temp[0])    : 0,
                        'rong'  :volume_temp[1] ? parseInt(volume_temp[1])   : 0,
                        'cao'   :volume_temp[2] ? parseInt(volume_temp[2])    : 0
                    }
                }
                if ($stateParams.copy) {
                    delete $scope.product.ProductId;
                    delete $scope.product.SellerSKU;
                }
                if($localStorage['home_currency'].toString() != $localStorage['currency'].toString()){
                    $scope.product.SalePrice_currency_2 = $scope.product.SalePrice ? $rootScope.convert_currency($scope.product.SalePrice).toFixed(2) :0;
                    //$scope.product.WholeSalePrice_currency_2  = $scope.product.WholeSalePrice ? $rootScope.convert_currency($scope.product.WholeSalePrice).toFixed(2) :0;
                    //$scope.product.BasePrice_currency_2  = $scope.product.BasePrice ? $rootScope.convert_currency($scope.product.BasePrice).toFixed(2) :0;
                }
               //initProductFormDisplay($scope.product);
                imageDeferred.resolve(product.ProductImages);
            });
    }
    //end check new product
    //add
    $scope.add_new = function(product){
        product.OnProccess      = true;

        if(!product.SalePrice || product.SalePrice <=0){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROAN_KiemTraLaiGiaBan'));
            product.OnProccess = false;
            return;
        }
        if(product.SellerSKU && product.SellerSKU.length >=20){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROA_MaSKUCuaBanQuaDai'));
            product.OnProccess = false;
            return;
        }
        if(!product.Volume.dai && product.Volume.dai <=0){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROAN_KiemTraLaiCDai'));
            product.OnProccess = false;
            return;
        }
        if(!product.Volume.rong && product.Volume.rong <=0){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROAN_KiemTraLaiCRong'));
            product.OnProccess = false;
            return;
        }
        if(!product.Volume.cao && product.Volume.cao <=0){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROAN_KiemTraLaiCCao'));
            product.OnProccess = false;
            return;
        }
        if(!product.Weight && product.Weight <=0){
            toaster.pop('warning', tran('toaster_ss_nitifi'),tran('PROAN_KiemTraLaiKLuong'));
            product.OnProccess = false;
            return;
        }
        $scope.product.Serial = parseInt($scope.product.Serial);
        /// check 
        if(!$scope.product.id){ // toa moi
            Pro.save($scope.product, true).then(function (resp) {
                
                        product.OnProccess = false;
                        if(resp.data.error){
                            toaster.pop('warning', resp.data.message);
                        }else{
                                // Intercom   
                        try {
                            var metadata = {
                                    user		: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                                    name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                                    time		: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                                type			:"Create one product",
                                links		:"product/product/add"
                            };
                            Intercom('trackEvent', 'Create product', metadata);
                        }catch(err) {
                            console.log(err)
                        }
                        // Intercom
                        ///toaster.pop('success', 'Tạo mới sản phẩm thành công');
                        toaster.pop('success', tran('PROA_Taosanphamthanhcong'));
                        $state.go('product.list',{type:"ENTERPRISE"});
                        }
                    
                },
                function () {
                    product.OnProccess = false;
                    //toaster.pop('error', 'Có lỗi xảy ra');
                    toaster.pop('error', tran('PROA_trung_sku'));
                }).finally(function(){
                    product.OnProccess = false;
                });
                ///
        }else{
            //cap nhat san pham
            Pro.save($scope.product, false).then(function (resp) {
                
                        product.OnProccess = false;
                        if(resp.data.error){
                            toaster.pop('warning', resp.data.message);
                        }else{
                                // Intercom   
                        try {
                            var metadata = {
                                    user		: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                                    name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                                    time		: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                                type			:"Create one product",
                                links		:"product/product/add"
                            };
                            Intercom('trackEvent', 'Create product', metadata);
                        }catch(err) {
                            console.log(err)
                        }
                        // Intercom
                        ///toaster.pop('success', 'Tạo mới sản phẩm thành công');
                        toaster.pop('success', tran('PROA_Taosanphamthanhcong'));
                        $state.go('product.list',{type:"ENTERPRISE"});
                        }
                    
                },
                function () {
                    product.OnProccess = false;
                    //toaster.pop('error', 'Có lỗi xảy ra');
                    toaster.pop('error', tran('PROA_trung_sku'));
                }).finally(function(){
                    product.OnProccess = false;
                });
                ///
        }
        
    }
}])    

angular.module('app').service('Pro',['$q', '$http','$filter','toaster',
    function ($q, $http,$filter,toaster ) {
        var tran = $filter('translate');
        var getModels = function (keyword) {
            if (!keyword) return $q.reject('');
                return $http.get(BOXME_API+'matching-full-model', {params: {key: keyword}}).then(function (response) {
                return response.data;
            });
        };
        return {
            //start
            getModels : getModels,
            save : function (product) {
				//productDecorator(product);
				/** @namespace product.ProductId */
				return product.ProductId ?
						$http({
		                    url: BOXME_API+'product_v3' + '/' + product.ProductId,
		                    method: "POST",
		                    "data": product
		                }).success(function (result) {
		                	return result
		                }).error(function (data) {
		                    if(status == 422){
		                        //Storage.remove();
		                    }else{
		                        toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
		                    }
		                })
					:
						$http({
		                    url: BOXME_API+'product_v3',
		                    method: "POST",
		                    "data": product
		                }).success(function (result) {
		                	return result
		                }).error(function (data) {
		                    if(status == 422){
		                        //Storage.remove();
		                    }else{
		                        toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
		                    }
		                })
            },
            get: function (id) {
				return $http({
                    url: BOXME_API+'product_V2' + '/' + id,
                    method: "GET",
                }).success(function (result) {
                	return result
                }).error(function (data) {
                    if(status == 422){
                        //Storage.remove();
                    }else{
                        toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại!');
                    }
                })
				
            }
            //end
        }
    }
])

angular.module('app').service('$random2', function () {
    return function () {
        return Math.round(Math.random() * 9999 + 10000).toString().split('').splice(1, 3).join('');
    }
})

angular.module('app').directive('productItemAutocomplete', ['$location', '$anchorScroll', '$http' ,'Pro', function ($location, $anchorScroll, $http,Pro) {
    return {
        restrict: 'EAC',
        require: 'ngModel',
        scope: {
            fullname: '=?',
            code: '=?',
            address: '=?',
            area: '=?',
            phonetwo: '=?',
            phoneFalse: '=?',
            country     : '=?',
        },
        link: function (scope, el, attr, model) {
            scope.list_items = [];
            scope.buyerSelected = "";
            

            scope.suggestBuyer = function (val){
                if(val){
                    return Pro.getModels(val).then(function (result) {
                        if(result){
                            return result
                        }
                        return;
                    });
                }
                
            }
           
            
            scope.onsuggestBuyerSelected = function ($item, $model, $label) {
                scope.code = $item.id;
                scope.fullname = $item.fullname;
                scope.address = $item.address;

                scope.area = {
                    city_id: $item.city_id,
                    district_id: $item.province_id,
                    ward_id: $item.ward_id
                };
            }

            var isTelephoneNumber = function (phone) {
                var list_telephone_prefix = ['076', '025', '075', '020', '064', '072', '0281', '030', '0240', '068', '0781', '0350', '0241', '038', '056', '0210', '0650', '057', '0651', '052', '062', '0510', '0780', '055', '0710', '033', '026', '053', '067', '079', '0511', '022', '061', '066', '0500', '036', '0501', '0280', '0230', '054', '059', '037', '0219', '073', '0351', '074', '039', '027', '0711', '070', '0218', '0211', '0321', '029', '08', '04', '0320', '031', '058', '077', '060', '0231', '063'];
                var _temp = phone.replace(new RegExp("^(" + list_telephone_prefix.join("|") + ")"), '');
                if (phone.length !== _temp.length) {
                    return true;
                }
                return false;
            }

            scope.phoneFalse = false;
            
            scope.$watch('buyerSelected', function (newVal) {

                scope.phoneFalse = false;
                if (angular.isObject(newVal)) {
                    scope.phone = newVal.phone_primary;
                    if (newVal.phone_arr.length >= 2) {
                        scope.$parent.show_phone2 = true;
                        scope.phonetwo = newVal.phone_arr[1];
                    };
                } else {
                    scope.phone = newVal;
                }
                
                model.$setViewValue(scope.phone);

                scope.suggestBuyer(scope.phone);
                if (scope.phone && scope.phone.length > 5 && scope.country && scope.country.id == 237) {
                    scope.phoneFalse = false;
                    if(scope.phone.indexOf("+84") >=0){
                        var phone_temp = scope.phone.replace("+84", "");
                        if(phone_temp[0] && phone_temp[0]!= "0"){
                            phone_temp = "0" + phone_temp
                        }
                        if (!isTelephoneNumber(phone_temp)) {
                            var result = chotot.validators.phone(phone_temp, true);
                            if (result !== phone_temp) {
                                scope.phoneFalse = true;
                                return false;
                            }
                        }
                    }else{
                        if (!isTelephoneNumber(scope.phone)) {
                            var result = chotot.validators.phone(scope.phone, true);
                            if (result !== scope.phone) {
                                scope.phoneFalse = true;
                                return false;
                            }
                        }
                    }
                    
                };

            })

        },
        template: '<input id="order_phone" type="text"  ' +
        'name="buyer_suggestion_"' +
        'ng-model="buyerSelected" class="form-control sdt"' +
        'typeahead="item as item.phone_primary for item in suggestBuyer($viewValue)"' +
        'typeahead-focus-first   = "false"' +
        'typeahead-min-length    = "2"' +
        'typeahead-wait-ms       = "300"' +
        'typeahead-loading       = "loadingBuyer"' +
        'typeahead-on-select     = "onsuggestBuyerSelected($item, $model, $label)"' +
        'typeahead-template-url  = "SuggestBuyerTemplate.html"' +
        'placeholder="+ {{country.phone_code}}"' +
        'required' +
        '/>' +
        '<script type="text/ng-template" id="SuggestBuyerTemplate.html">' +
        '<a>' +
        '<span><strong>{{match.model.fullname +" - "+ match.model.phone}}</strong></span> <br/>' +
        '<span>{{match.model.address}}, {{match.model.district_name}}, {{match.model.city_name}}</span>' +
        '</a>' +
        '</script>'
    };
}])