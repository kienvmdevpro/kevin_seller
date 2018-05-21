'use strict';
/**
 * 
 * 
 * version:02
 **/
//#################### CONTROLLER ####################
angular.module('app').service('ProductsRepository',[
				  '$http','toaster','HAL',
		function ($http,toaster,HAL) {
		var PRODUCT_ACTIVE = 1;
		var PRODUCT_INACTIVE = 0;
		

		var productDecorator = function(product) {
			if(!product.ModelId) {
				product.ModelId = 0;
				product.ModelName = '';
			}
			if(!product.SupplierId) {
				product.SupplierId = 0;
				product.SupplierName = '';
			}
		};

		var productFilter = function(product) {
			if (product.SupplierId && product.SupplierId.toString()=="0" || product.SupplierName == '') {
				delete product.SupplierName;
			}
			if (product.BasePrice) {
				product.BasePrice = parseInt(product.BasePrice);
			}
			if (product.SalePrice) {
				product.SalePrice = parseInt(product.SalePrice);
			}
		};

		var sanityFilterProductCondition = function(condition) {
			if (""===condition.active) {
				delete condition.active;
			}
			if (""===condition.key) {
				delete condition.key;
			}
			if (""===condition.page_size) {
				delete condition.page_size;
			}
			if (""===condition.page) {
				delete condition.page;
			}
			if (""===condition.type) {
				delete condition.type;
			}
			if (""===condition.inventory_id) {
				delete condition.inventory_id;
			}
		};

		return {
			save : function (product) {
				productDecorator(product);
				/** @namespace product.ProductId */
				return product.ProductId ?
						$http({
		                    url: BOXME_API+'product_V2' + '/' + product.ProductId,
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
		                    url: BOXME_API+'product_v2',
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
			
			update_prices_product : function (condition) {
				return $http({
					url: BOXME_API+'update_price_products',
					method: "POST",//'PUT',
					data: condition
				}).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
			find : function (condition) {
				sanityFilterProductCondition(condition);
				return $http({
                    url: BOXME_API+'product_list',
                    method: "GET",
                    params: condition
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
			find_sku : function (sku) {
				///sanityFilterProductCondition(condition);
				return $http({
                    url: BOXME_API+'get_order_waitting_by_sku'+'/'+ sku,
                    method: "GET"
                }).then(function (response) {
					return HAL.Collection(response.data);
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
		};
	}])
	app.service('ShipLanding', ['$http', function($http) {
		return {
			post: function(id) {
				return  $http({
                    url: BOXME_API+'ship_lading' + '/' + id,
                    method: "POST"
                }).then(function (resp) {
					return resp.data;
				})
			}
		};
	}])
	app.service('ShipmentsV2',
	[
				  '$http','HAL',
		function ( $http,  HAL) {
		// Build data template
		return {
			statuses: {
				'READY_TO_SHIP': 'ReadyToShip'

			},

			add : function (shipment) {
				return $http({
                    url: BOXME_API+'create_shipment_v2',
                    method: "POST",
                    data: shipment
	                }).then(function (response) {
						return HAL.Collection(response.data);
					})
			},
			get_blance_shipment : function (shipment) {
				return $http({
                    url: BOXME_API+'get_blance_shipment_V2',
                    method: "POST",
                    data: shipment
	                }).then(function (response) {
						return HAL.Collection(response.data);
					})
			},
			get_data_courier: function (id) {
				return $http({
                    url: BOXME_API+'get_data_courier',
                    method: "GET"
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
			get_data_courier_images: function (code) {
				return $http({
                    url: BOXME_API+'get_image_courier' + '/' + code,
                    method: "GET"
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
			update_status_shipment: function (shipment) {
				/** @namespace shipment.ShipmentId */
				return $http({
                    url: BOXME_API+'update_shipment_shipped' + '/' + shipment.ShipmentId,
                    method: "POST",
                    data: shipment
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			},
			update_shippment_by_edit: function (shipment) {
				/** @namespace shipment.ShipmentId */
				return $http({
                    url: BOXME_API+'update_shipment_v2' + '/' + shipment.RequestCode,
                    method: "POST",
                    data: shipment
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
				
			},

			findById: function (id) {
				return $http({
                    url: BOXME_API+'shipment' + '/' + id,
                    method: "GET"
                }).then(function (response) {
					return HAL.Collection(response.data);
				})
			}
		}
	}])
	app.service('ShipmentLading',
	[            '$http', '$json', '$q',
		function ($http,   $json,   $q)
	{
		var buildRequestData = function (shipment) {

			var items = shipment.ShipmentItems.map(function (item) {
				/** @namespace item.ProductName */
				/** @namespace item.QuantityShipped */
				return {
					"Name": item.ProductName,
					"Price": 0,
					"Quantity": item.QuantityShipped,
					"Weight": 0
				}
			});

			/** @namespace shipment.ShipFromAddress.District */
			/** @namespace shipment.Volumes */
			return $json.toParams({
				"Courier"   : 1,
				"Items"     : items,
				"From"      : {
					"Province"  : shipment.ShipFromAddress.District,
					"City"      : shipment.ShipFromAddress.City
				},
				"To"        : {
					"Province"  : shipment.ShipToAddress.District,
					"City"      : shipment.ShipToAddress.City
				},
				"Order"     : {
					"Amount"    : shipment.TotalPrice,
					"Weight"    : shipment.Weight,
					"BoxSize"   : shipment.Volumes
				},
				"Config"    : {
					"Service"   : 4,
					"CoD"       : 1,
					"Protect"   : 1,
					"Payment"   : 2
				}
			})
		};
		return function (shipment) {
			// Dirty hack for using the lading service when
			// the server does not allow the json payload body.
			// Using the form request instead
			return $http({
				method  : 'POST',
				url     : BOXME_API.ladingCalculate,
				headers : {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				data : buildRequestData(shipment)
			}).then(function (response) {
				/** @namespace response.data.data.fee.total_fee */
				return response.data.data ?
					response.data.data.fee.total_fee :
					$q.reject('');
			})
		}
	}])