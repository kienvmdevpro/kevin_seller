'use strict';

//shipment
angular.module('app').controller('importProduct', function($scope, $state, toaster, Product, $http,  Analytics) {
		Analytics.trackPage('Product/Create/File/Step1');
		$scope.linkDownloadTemp = 'tpl/product/upload-product/product.xlsx';
		$scope.urlImport = Product.import_product();
		$scope.submit = function() {
			if($scope.validateForm())
			{
				var data = new FormData();
				data.append('file', $scope.File);
				toaster.pop('wait', 'Thông báo', 'Đang xử lí');
				$http.post(
					$scope.urlImport,
					data,
					{
						headers: {
							'Content-Type': undefined,
						},
						transformRequest: angular.identity
					}
				).success(function(response, status) {
						if(status == 200)
						{
							toaster.pop('success', 'Thông báo', 'Upload file thành công');
							$state.go('product.upload-preview', {product_id: response.ProductID});
						}
						else
							toaster.pop('error', 'Thông báo', 'Có lỗi xảy ra trong quá trình upload file!');
					}).error(function() {
						toaster.pop('error', 'Thông báo', 'Không thể upload file!');
					});
			}
			else
				toaster.pop('error', 'Thông báo', 'Định dạng file Excel chưa đúng!');
		};

		$scope.validateForm = function() {
			return (($scope.File.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || $scope.File.type == 'application/vnd.ms-excel') && $scope.File.size > 1);
		};

		$scope.getFile = function(files) {
			$scope.File = files[0];
		};
	});

	app.controller('previewImportProduct', function($scope,	$filter, $rootScope, $state, $stateParams, Product, WarehouseRepository, Analytics,toaster,$window) {
		Analytics.trackPage('Product/Create/Simple');
		$scope.InventoryId = '';
		$scope.approve = function() {
			Product.approve_product({product_id: $stateParams.product_id}, {inventory: $scope.InventoryId}).then(
				function() {
					//$state.go('product.list');
					$window.location.reload();
					// Intercom   
                    try {
                    	var metadata = {
 	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
 	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
 	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
                    		   type			:	"Create product Excel",
                    		   links		:	"product/product/upload"
 	            		};
            			Intercom('trackEvent', 'Create product', metadata);
                    }catch(err) {
        			    console.log(err)
        			}
                    // Intercom
				},
				function(resp) {

					var data = resp.data;
					$window.location.reload();
					// if (resp.status = 442){
					// 	toaster.pop('error', 'Thông báo',data.Message );
					// }
				}
			);
		};

		$scope.search = {
			condition: {
				page : 1,
				page_size: 25
			},
			searching: false,
			proceed: function() {
				$scope.search.searching = true;
				Product.preview_product({product_id: $stateParams.product_id}).then(function(resp) {
					$scope.search.searching = false;
					$scope.categories = resp;
					$scope.listItems = $scope.categories.listOf('Products');//$scope.partition($scope.categories.listOf('Products'), 25);
					$scope.items = $scope.listItems;
					$scope.sum = $scope.categories.Sum;
				});

				$scope.listWareHouse = [];
				WarehouseRepository.getListInventory().then(function(data) {
					$scope.listWareHouse =[]
					angular.forEach(data.data._embedded.inventory, function(item) {
						if (item.Code == "" || item.Code == null){
							$scope.listWareHouse.push(item)
						}
					});
				});
			},
			calcPagging: function() {
				$scope.items = $scope.listItems[$scope.search.condition.page - 1]
			}
		};

		$scope.partition = function(items, size) {
			var result = $u.groupBy(items, function(item, i) {
				return Math.floor(i / size);
			});
			return $u.values(result);
		};
	});

	app.service('Product', function($http, HAL) {
		return {
			import_product: function() {
				return BOXME_API+'import_product';
			},

			preview_product: function(condition) {
				return $http({
	                    url: BOXME_API+'import_product',
	                    method: "GET",
	                    params: condition
	                }).then(function (response) {
						return HAL.Collection(response.data);
					})
			},

			approve_product: function(data, condition) {
				return $http({
                    url: BOXME_API+'import_product'+ '/' + data.product_id,
                    method: "POST",
                    params: condition
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
		}
	})	