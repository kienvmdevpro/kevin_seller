'use strict';
//report
angular.module('app').controller('ReportSettingController',
		['$scope', 'toaster', 'Datetime', 'SettingService', 'Analytics',
		function ($scope, toaster, Datetime, SettingService, Analytics) {
			Analytics.trackPage('Report/Order by employee');
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
            $scope.format = 'dd/MM/yyyy';
			var condition = {};
			var myDate1 = new Date();
			var myDate =  new Date(myDate1.getFullYear(), myDate1.getMonth() -1, myDate1.getDate())
			
			//myDate1.setDate(dayOfMonth);
			$scope.dt1  = DatePicker(myDate);
			$scope.dt2 = DatePicker(myDate1);
			$scope.set_date = function() {
				condition.from	= $scope.dt1.value ? Datetime.DateToTimestempt($scope.dt1.value) : 0;
				condition.to  	= $scope.dt2.value ? Datetime.DateToTimestempt($scope.dt2.value) : Math.round(new Date().getTime()/1000);
				if (condition.from == condition.to){
					var date_temp = $scope.dt2.value;
					date_temp.setDate(date_temp.getDate() + 1)
					condition.to = Datetime.DateToTimestempt(date_temp)
				}
				proceed();
			};
			var proceed = function(){
				SettingService.report(condition).then(function(resp) {
					$scope.heading = resp.listOf('heading');
					$scope.users = resp.listOf('data');
				});
			};
			proceed();
			$scope.sum = function(data){
				var resp = 0;
				data.map(function(item){ resp += item.item; });
				return resp;
			}
		}
	])
app.service('SettingService',
		[            		  '$timeout', '$http','HAL',
		     		function ($timeout,   $http,   HAL  ) {
		     		return {
		     			report: function (condition) {
		     				return $http({
		     					method  : 'GET',
		     					url     : BOXME_API+'report_employee',
		     					params  : condition
		     				}).then(function (response) {
		     					return HAL.Collection(response.data);
		     				});
		     			}
		     		}
		     	}])	