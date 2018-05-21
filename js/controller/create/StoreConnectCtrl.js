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
    "page_size" : 10,
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
}])