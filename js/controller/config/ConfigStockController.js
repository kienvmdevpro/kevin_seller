'use strict';

angular.module('app').controller('PaymentChargeSettingController',
    			['$scope','$rootScope','$localStorage','toaster','SettingPaymentCharge','Analytics','$confirmModal','GetBalanceTempSellers','$filter',
        function ($scope,  $rootScope,  $localStorage,  toaster,  SettingPaymentCharge,  Analytics,   $confirmModal,  GetBalanceTempSellers,  $filter) {
    		var tran = $filter('translate');
    		Analytics.trackPage('Config/Fee default');
            $scope.hightChart = [];
            $scope.productPrice = 0;
            $scope.money_temp_new = 0;
            $scope.type_default = 0;
            $scope.m2Price = 0;
            $scope.m3Price = 0;
            $scope.showCase = 0;
			$scope.showCase1 = 0;
			$scope.showCase2 = 0;
           
            SettingPaymentCharge.getChargeChart().then(function(resp){
        		$scope.productPrice = resp.product;
        		$scope.m2Price = resp.m2;
        		$scope.m3Price = resp.m3;                		
        		$scope.d1_1 = resp.product;
                $scope.d1_2 = resp.m2;
                $scope.d1_3 = resp.m3;      
		              
            });
            if($rootScope.balace){
            	if($rootScope.balace.Price){
            		$scope.money_temp = $rootScope.balace.Price;
					$scope.money_temp_new = $scope.money_temp ;
            	}
			}else{
	            GetBalanceTempSellers.data().then(function (result) {
					$scope.money_temp = result.validation_messages.Price;
					$scope.money_temp_new = $scope.money_temp ;
				}, function (response) {
					$scope.money_temp = 0;
				});
			};
            $scope.search = {
                condition : {},
                procced: function(){
                	SettingPaymentCharge.getPaymentChargeSetting().then(function(resp){
                        $scope.search.condition = resp;
                        $scope.type_default = resp.payment_type;
                        
                    });
                },
                update: function() {
                	SettingPaymentCharge.updatePaymentChargeSetting($scope.search.condition).then(function(){
                        //toaster.pop('success','Thông báo','Cập nhật cấu hình thành công!');
                        toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
                    },function(resp) {
						toaster.pop('warning',tran('toaster_ss_nitifi'),resp.data['validation_messages']);
					});
                }
            };
            
            $scope.checkPaymentNew = function(value){
            	if (value == $scope.type_default){
            		$scope.showCase = 0;
        			$scope.showCase1 = 0;
        			$scope.showCase2 = 0;
            	}
            	else{
	            	SettingPaymentCharge.getBalanceSeller(value).then(function(repsp){
	            		$scope.money_temp_new = repsp.validation_messages.Price;
	            		if (($scope.money_temp - $scope.money_temp_new) >=0){
	            			$scope.showCase = 1;
	            			$scope.showCase1 = 0;
	            			$scope.showCase2 = 1;
	            		}
	            		else {
	            			$scope.showCase = 0;
	            			$scope.showCase1 = 1;
	            			$scope.showCase2 = 1;
	            		};
	                });
            	}
            };
        	
            $scope.update = function () {
    			$confirmModal.ask(tran('SETCHAR_Modal_warning'), tran('SETCHAR_Modal_Confim')).then(function() {
    				// with a property "Billing Config" 
    				$scope.search.update();
    			});
    		};
        }])
        
app.service('SettingPaymentCharge',['$http', function ($http) {
	return {
		// payment setting
		getPaymentChargeSetting : function () {
			return $http({
				url   : BOXME_API+'user_config_charge',
				method: 'GET'
			}).then(function (response) {
				return response.data;
			})
		},
		updatePaymentChargeSetting : function (conf) {
			return  $http({
				url : BOXME_API+'user_config_charge',
				method: 'POST',
				data: conf
			})
		},
		getChargeChart : function () {
			return $http({
				url   : BOXME_API+'charge_chart',
				method: 'GET'
			}).then(function (response) {
				return response.data;
			})
		},
		getBalanceSeller : function (type_payment) {
			return $http({
				url   : BOXME_API+'get_balance_seller' +'/'+type_payment,
				method: 'GET',
			}).then(function (response) {
				return response.data;
			})
		}
	}
}])
app.service('GetBalanceTempSellers', ['HAL','$http',function (HAL,$http) {
    return {
        data: function (condition) {
            return $http({
                url   : BOXME_API+'balance_temp_seller',
                method: 'GET',
                params: condition
            }).then(function (response) {
                return HAL.Collection(response.data);
            });
        },
    }
}])