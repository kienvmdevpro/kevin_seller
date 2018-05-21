app.controller('PrintBsinController',
['$q','$filter','$scope','$localStorage', '$rootScope',    'toaster',     'PrintBsin', 'ProductsRepository', 'toaster', '$stateParams', '$state', 'WarehouseRepository', '$random2', 'Analytics',
function ($q,  $filter,  $scope,  $localStorage,   $rootScope,toaster,   PrintBsin,   ProductsRepository,   toaster,   $stateParams,   $state,   WarehouseRepository,   $random2,   Analytics) {
        $scope.parram   = {};
        $scope.data     = {};
        var sku         = $stateParams.sku ? $stateParams.sku : null;
        var quantity    = $stateParams.quantity ? $stateParams.quantity : 60;
        $scope.parram = {
            sku         : sku,
            quantity    : quantity
        };
        $scope.listInfoBsin = function() {
            PrintBsin.get($scope.parram, false).then(function (resp) {
                    console.log(resp);
                    console.log(resp['DRItems']);
                    $scope.data = resp['DRItems'];
                },
                function () {
                    product.OnProccess = false;
                    toaster.pop('error', tran('PROA_trung_sku'));
                }).finally(function(){
                    product.OnProccess = false;
                });
        };
        $scope.listInfoBsin();
}])    

angular.module('app').service('PrintBsin',['$q', '$http','$filter','toaster',
    function ($q, $http,$filter,toaster ) {
        var tran = $filter('translate');
        return {
            get: function (condition) {
				return $http({
                    url     : BOXME_API+'print_sku_by_seller',
                    method  : "GET",
                    params  : condition
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
        }
    }
])

