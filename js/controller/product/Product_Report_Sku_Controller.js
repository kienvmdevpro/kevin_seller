'use strict';

//shipment
angular.module('app').controller('ReportSkuController',
				['$scope','SKU','ExportService','Datetime','toaster','WarehouseRepository','$filter' ,'Analytics',
		function ($scope, SKU,   ExportService, Datetime,   toaster,  WarehouseRepository,  $filter,   Analytics){
			Analytics.trackPage('Report/Daily inventory');
			// init datepicker
			$scope.format = 'dd/MM/yyyy';
			var DatePicker = function (value) {
				var context = {
					value : value,
					opened: false,
					open  : function ($event) {
						$event.stopPropagation();
						$event.preventDefault();
						context.opened = true;
					},
					close  : function () {
						context.opened = false;
					}
				};
				return context;
			};
			// set start date
			var myDate = new Date();
			var dayOfMonth = myDate.getDate();
			myDate.setDate(dayOfMonth - 2);
			var myDate1 = new Date();
			myDate1.setDate(dayOfMonth);
			var dateShow = new Date();
			dateShow.setDate(dayOfMonth - 1);
			var dateShow1 = new Date();
			$scope.dt3=dateShow1;
			$scope.loaddingExport = false;
			$scope.dt1 = DatePicker(myDate);
			$scope.dt2 = DatePicker(dateShow);
			//var accessToken = $tokenManager.accessToken();
			$scope.keys = [
				{key: 1, text: $filter('translate')('report.inventory.keys.update')},
				{key: 2, text: $filter('translate')('report.inventory.keys.notUpdate')},
			];
			$scope.exportUrl = ExportService.report_sku()+'?access_token=3170052097217319936426820933672852420619ffd2612accf88cd226cc9d9c8ba54a9dd5925ba52125c36631583bf00d71601';
			$scope.filterdata = function(p){
				 return (p.Date[1].Inventory === 'on');
			}
			$scope.filter = function(){
				if($scope.dt1.value && $scope.dt2.value){
					$scope.search.condition.page = 1;
					$scope.search.proceed();
				}
			};
			$scope.Export = function(){
				ExportService.report_sku($scope.search.condition)
			}
			var myDate2 = new Date();
			var cal = function(x, ele) {
				var data = $scope.products.listOf('data');
				if(data[0].Date[x] == undefined){
					return ''
				}
				var arr = data.map(function(obj){ return obj.Date[x][ele] });
				return eval(arr.join('+'))
			};
			var warehoure_codes = [];
			$scope.search = {
				// Default search condition
				condition: {
					page 	: 1,
					page_size: 100,
					from	: Datetime.DateToTimestempt($scope.dt1.value),
					to		: Datetime.DateToTimestempt($scope.dt2.value),
					wms 	: "all"
				},
				getWarehoure: function(){
					$scope.warehouses = [];
					WarehouseRepository.getListInventory().then(function(result) {
						$scope.listWarehouseENTERPRISE =  [] //result.data._embedded.inventory ? result.data._embedded.inventory:[];
						if(result.data._embedded.inventory){
							angular.forEach(result.data._embedded.inventory, function(item) {
								if(item.Code){
									$scope.warehouses.push(item);
								}
							});
						}
					})
					
				},
				// Default search status
				searching: false,

				// Quering for data
				proceed: function () {
					$scope.search.searching = true;
					$scope.search.condition.from= Datetime.DateToTimestempt($scope.dt1.value);
					$scope.search.condition.to  = Datetime.DateToTimestempt($scope.dt2.value);
					if(Datetime.DateToTimestempt($scope.dt2.value) < Datetime.DateToTimestempt($scope.dt1.value)){
						toaster.pop('warning', 'Thông báo', 'Ngày kết thúc duyệt khong thể lớn hơn ngày bắt đầu');
						$scope.dt2  = DatePicker(dateShow);
					}
					 
					if(Datetime.DateToTimestempt($scope.dt2.value) > Datetime.DateToTimestempt(dateShow)){
						toaster.pop('warning', 'Thông báo', 'Ngày kết thúc duyệt khong thể lớn hơn '+dateShow.getDate()+'/'+ dateShow.getMonth()+'/'+dateShow.getFullYear()+'');
						$scope.dt2  = DatePicker(dateShow);
					}
					SKU.report($scope.search.condition).then(function (result) {
						$scope.search.searching = false;
						$scope.products = result;
						
					}, function (response) {
						if (422 == response.status && response.data && response.data.validation_messages) {
							$scope.products = [];
							$scope.search.searching = false;
						//} else {
						}
					})
				}
			};
			
		}
	])
	
	app.service('SKU', ['$http', 'HAL', function ($http,HAL) {
        return {
            report: function (condition) {
                return $http({
                    url   : BOXME_API+'report_sku',
                    method: 'GET',
                    params: condition
                }).then(function (response) {
                    return HAL.Collection(response.data);
                });
            },
        }
    }])
    app.service('ExportService',['$http', 'HAL', function($http,HAL) {
		return {
			report_sku	: function(condition) {
				return BOXME_API+'export_report_sku';/*$http({
                    url: BOXME_API+'export_report_sku',
                    method: "POST",
                    "data": condition
                }).then(function (response) {
                    return HAL.Collection(response.data);
                });*/
                
			}
		}
	}])
	app.service('ListWarehouses', ['$http', 'HAL', function ($http,HAL) {
        return {
            data: function (condition) {
                return $http({
                    url   : BOXME_API+'get_warehouse_code',
                    method: 'GET',
                    params: condition
                }).then(function (response) {
                    return HAL.Collection(response.data);
                });
            },
        }
    }])