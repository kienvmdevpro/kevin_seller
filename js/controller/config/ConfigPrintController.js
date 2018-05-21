'use strict';

//shipment
app.controller('PrintSettingController',
					['$scope', 'toaster','Analytics','$modal','Location', 'Setting_Print_Order','$filter',
			function ( $scope,  toaster, Analytics,   $modal,  Location,   Setting_Print_Order,  $filter) {
			Analytics.trackPage('Config/PrintOrder');
			/*$modal.open({
				templateUrl	: 'thong_bao_setting_print.html',
				controller	: 'thongBaoSettingPrintCtr',
				size: 'md'
			});*/
			var tran = $filter('translate');
			 var isTelephoneNumber = function (phone){
			        var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
			        var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
			        if(phone.length !== _temp.length){
			            return true;
			        }
			        return false;
			    }
			    $scope.check_phone_print = false;
				$scope.checkphonevalidate = function(){
					$scope.check_phone_print = false;
			        if ($scope.search.user.Phone && $scope.search.user.Phone.length >= 5) {
			            if(!isTelephoneNumber($scope.search.user.Phone)){
			                var result = chotot.validators.phone($scope.search.user.Phone, true);
			                if(result != $scope.search.user.Phone){
			                     $scope.check_phone_print = true;
			                     return false;
			                }
			            }
			        }
		        }
			
			var check_post = undefined;
			$scope.search = {
				user: {},
				proceed: function(){
					Setting_Print_Order.get().then(function (data) {
						
						if(data.status == 1){
							check_post = false;
						}else{
							check_post = true;
						}
						if(data.data){
							$scope.search.user = data.data;
							if($scope.search.user.Active == true){
								$scope.search.user.Active = 1
							}else{
								if($scope.search.user.Active == false){
									$scope.search.user.Active = 0
								}else{
									$scope.search.user.Active= undefined
								}
							}
						}
					},function(res) {
						if(res.status == 422) {
							$scope.search.user ={};
						} else {
							//toaster.pop('error', 'Lỗi', 'Vui lòng thử lại sau')
							toaster.pop('error', tran('SETPRI_label_update_er'));						
						}
					});
				},
				post: function(){
					/*$scope.search.user.City_name =  $scope.province.Name;
					$scope.search.user.District_name =  $scope.district.Name;*/
					if(!$scope.search.user.City_name){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết tỉnh, thành phố');
						toaster.pop('error', tran('SETPRI_label_update_erCity'));
						return;
					}
					if(!$scope.search.user.FullName){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết tên người gửi');
						toaster.pop('error', tran('SETPRI_label_update_ererName'));
						return;
					}
					if(!$scope.search.user.Phone){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết số điện thoại')
						toaster.pop('error', tran('SETPRI_label_update_ererPhone'));
						return;
					}
					if(!$scope.search.user.District_name){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết quận, huyện gửi')
						toaster.pop('error', tran('SETPRI_label_update_ererDistrict'));
						return;
					}
					if(!$scope.search.user.Address){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết địa chỉ chi tiết')
						toaster.pop('error', tran('SETPRI_label_update_erAddress'));
						return;
					}
					if(!$scope.search.user.Active){
						//toaster.pop('error', 'Lỗi', 'Vui lòng chọn cho biết trạng thái');
						toaster.pop('error', tran('SETPRI_label_update_ererSTT'));
						return;
					}else{
						$scope.search.user.Active = parseInt($scope.search.user.Active)
					}
					var check_phone_create = $scope.checkphonevalidate();
					if(check_phone_create == false){
						//toaster.pop('error', 'Lổi', 'Hình như bạn nhập sai số điện thoại, vui lòng kiểm tra lại ?');
						toaster.pop('error', tran('SETPRI_label_phoneERR'));
						return;
					}
					Setting_Print_Order.post($scope.search.user).then(function (data) {
						//$scope.search.user = data;
						toaster.pop('success', 'Thành công',data.validation_messages);
						$scope.search.proceed();
					},function(res) {
						if(res.status == 422) {
							$scope.search.user ={};
							toaster.pop('error', 'Lỗi',res.data.validation_messages);
						} else {
							toaster.pop('error', tran('SETPRI_label_update_er'))
						}
					});
				},
				put: function(){
					/*$scope.search.user.City_name =  $scope.province.Name;
					$scope.search.user.District_name =  $scope.district.Name;*/
					if(!$scope.search.user.City_name){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết tỉnh, thành phố');
						toaster.pop('error', tran('SETPRI_label_update_erCity'));
						return;
					}
					if(!$scope.search.user.FullName){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết tên người gửi');
						toaster.pop('error', tran('SETPRI_label_update_ererName'));
						return;
					}
					if(!$scope.search.user.Phone){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết số điện thoại')
						toaster.pop('error', tran('SETPRI_label_update_ererPhone'));
						return;
					}
					if(!$scope.search.user.District_name){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết quận, huyện gửi')
						toaster.pop('error', tran('SETPRI_label_update_ererDistrict'));
						return;
					}
					if(!$scope.search.user.Address){
						//toaster.pop('error', 'Lỗi', 'Vui lòng cho biết địa chỉ chi tiết')
						toaster.pop('error', tran('SETPRI_label_update_erAddress'));
						return;
					}
					if($scope.search.user.Active == undefined){
						//toaster.pop('error', 'Lỗi', 'Vui lòng chọn cho biết trạng thái')
						toaster.pop('error', tran('SETPRI_label_update_ererSTT'));
						return;
					}else{
						$scope.search.user.Active = parseInt($scope.search.user.Active)
					}
					var check_phone_create = $scope.checkphonevalidate();
					if(check_phone_create == false){
						//toaster.pop('error', 'Lổi', 'Hình như bạn nhập sai số điện thoại, vui lòng kiểm tra lại ?');
						toaster.pop('error', tran('SETPRI_label_phoneERR'));
						return;
					}
					Setting_Print_Order.put($scope.search.user).then(function (data) {
						//$scope.search.user = data;
						toaster.pop('success', 'Thành công',data.validation_messages)
						$scope.search.proceed();
					},function(res) {
						if(res.status == 422) {
							$scope.search.user ={};
							toaster.pop('error', 'Lỗi',res.data.validation_messages);
						} else {
							toaster.pop('error', 'Lỗi', 'Vui lòng thử lại sau')
						}
					});
				}
			}
			$scope.save = function(){
				if(check_post == true){
					$scope.search.post();
				}
				if(check_post == false){
					$scope.search.put();
				}
				
			}
	}])
	
	app.service('Setting_Print_Order',
	[            '$timeout',  '$http', 'HAL',
		function ($timeout,    $http ,  HAL  ) {
		return {
			get: function (condition) {
				return $http({
							"url" : BOXME_API+'config_seller_label',
							"method" : "GET",
							'params': condition
						}).then(function (res){
							return HAL.Collection(res.data);
						}); 
				/*OAuth.createAuthRequest({
					method: 'GET',
					url   : BOXME_API.config_seller_label,
					params: condition
				}).then(function (response) {
					return response.data;
				})*/
			},
			post: function (condition) {
				return $http({
					method  : 'POST',
					url     : BOXME_API+'config_seller_label',
					data  : condition
				}).then(function (response) {
					return HAL.Collection(response.data);
				});
			},
			put: function(condition,id) {
				return $http({
					'method': 'POST',
					'url'   : BOXME_API+'update_config_seller_label',
					'data'  : condition
				}).then(function (response) {
					return HAL.Resource(response.data);
				});
			}
		}
	}])