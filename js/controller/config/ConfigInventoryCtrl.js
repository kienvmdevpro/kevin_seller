'use strict';

//Config Stock
angular.module('app').controller('ConfigInventoryCtrl', 
		    ['$scope','$rootScope','$state','$http','$window','$filter','toaster','bootbox','Inventory','Location','WarehouseRepository',
 	function( $scope,  $rootScope,  $state,  $http,  $window,  $filter, toaster,  bootbox,  Inventory,  Location,  WarehouseRepository) {
		   var tran = $filter('translate');
        /**
         *   config
         **/
        
        $scope.fsubmit          = false;
        $scope.list_warehouse   = [];
        $scope.list_city        = {};
        $scope.list_district    = {};
        $scope.list_ward        = {};
        var warehouse = {Boxme:[]};
        /**
         *   get data
         **/
        WarehouseRepository.getListInventory().then( function(listInventory){
        	if(listInventory.data._embedded.boxme){
        		$scope.warehouses = listInventory.data._embedded.boxme;
        		//warehouse.Boxme      = $filter('filter')($scope.warehouses,{Checked:1});
        		angular.forEach($scope.warehouses, function (item) {
					if(item.Checked == 1){
						warehouse.Boxme.push(item)
					}
				});
        	}
        		
		});
     // SAVE INVENTORY
     // UPDATE WAREHOUSE BOXME
        
        $scope.toggleSelection = function toggleSelection(boxme) {

			var idx = warehouse.Boxme.indexOf(boxme);

			// is currently selected
			if (idx > -1 && boxme.Checked==0) {
				warehouse.Boxme.splice(idx, 1);
			}

			// is newly selected
			else if( boxme.Checked==0) {
				warehouse.Boxme.push(boxme);
			}
		};
		$scope.updatewarehouse = function () {
			WarehouseRepository.update(warehouse).then(function (boxme) {
				$scope.warehouses    = boxme.listOf('boxme');
				//toaster.pop('success','Thông báo','Cập nhật dữ liệu thành công!');
				toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
				// Intercom   
                try {
                	var metadata = {
	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
	                 		   type			:	"Kho Boxme",
	                 		   config_fufillment_warehouse:1
	            		};
        			Intercom('trackEvent', 'Create Inventory', metadata);
                }catch(err) {
    			    console.log(err)
    			}
                // Intercom
			});
		};
		/*$scope.saveInventoryBM = function (inventory) {
			if(!inventory.Phone){
				toaster.pop('error','Thông báo','Vui lòng nhập số điện thoại kho');
				return;
			}
			WarehouseRepository.save(inventory).then(function () {
				toaster.pop('success','Thông báo','Cập nhật dữ liệu thành công!');
			});
		};*/

         var isTelephoneNumber = function (phone){
            var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
            var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
            if(phone.length !== _temp.length){
                return true;
            }
            return false;
        }

        $scope.phoneIsWrong = {};
        $scope.addingPhone = function (inventory, index){
            $scope.phoneIsWrong[inventory.$$hashKey] = false;
            angular.forEach(inventory.phone, function (value){
                if(!isTelephoneNumber(value.text)){
                    var result = chotot.validators.phone(value.text, true);
                    if(result !== value.text){

                         $scope.phoneIsWrong[inventory.$$hashKey] = true;
                         
                         return false;
                    }
                }
            }) 
        }


         // get list Inventory
         $scope.getInventory = function(){
            Inventory.load().then(function (result) {
                if(!result.data.error && result.data.data.length > 0){

                    $scope.list_warehouse   = result.data.data;
                    angular.forEach($scope.list_warehouse, function (value, key){

                        var phone = value.phone.split(',');
                        $scope.list_warehouse[key].phone = [];
                        angular.forEach(phone, function (v, k){
                            
                            $scope.list_warehouse[key].phone.push(v);
                        })
                    })

                }else{
                    $scope.list_warehouse   = [{active:1}];
                }
            });
            return;
        }
        
        // get list city
        
        Location.province('all').then(function (result) {
            if(!result.data.error){
                $scope.list_city        = result.data.data;
                $scope.getInventory();
            }
        });

        // save inventory
        $scope.saveInventory    = function(data,index){
            var data_frm = {},
                phone    = [];

         

            angular.forEach(data.phone, function(value, key) {
                phone.push(value.text);
            });

            if(data.id > 0){
                data_frm = {
                    name        : data.name,
                    user_name   : data.user_name,
                    phone       : phone.join(','),
                    active      : data.active,
                    delete      : data.delete,
                    id          : data.id
                }
            }else{
                data_frm = angular.copy(data);
                data_frm.phone  = phone.join(',');
            }
            if(!data_frm.phone || data_frm.phone== ""){
                 toaster.pop('warning', tran('SETPRI_label_update_ererPhone'));
                 return;
            }
            Inventory.create(data_frm).then(function (result) {
                if(!result.data.error){
                	
                    $scope.list_warehouse[0]['id']  = +result.data.data;
                    if(data.delete  == 1){
                        $scope.list_warehouse[index]['delete']  == 1;
                     // Intercom   
                        try {
                        	var metadata = {
        	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
        	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
        	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
        	                 		   type			:	"Kho riêng",
        	                 		  config_pickup_adress:1
        	            		};
                			Intercom('trackEvent', 'Delete Inventory', metadata);
                        }catch(err) {
            			    console.log(err)
            			}
                        // Intercom
                    }else{
                    	 // Intercom   
                        try {
                        	var metadata = {
        	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
        	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
        	                 		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm'),
        	                 		   type			:	"Kho riêng",
        	                 		   config_pickup_adress:1
        	            		};
                			Intercom('trackEvent', 'Create Inventory', metadata);
                        }catch(err) {
            			    console.log(err)
            			}
                        // Intercom
                    }
                }else{
                    if(data.delete  == 1){
                        $scope.list_warehouse[index]['delete']  == 0;
                    }


                }
                $scope.fsubmit  = false;
            });
        }

        // save inventory
        $scope.removeInventory    = function(data,index){
            data.delete  = 1;
            $scope.saveInventory(data,index);
        }
        
        // Add 
        $scope.addInventory = function () {
            $scope.list_warehouse.unshift ({active:1,check:1});
        };

        $scope.onTourEnd = function(){
            $state.go('app.config.accounting');
        }
}]);
