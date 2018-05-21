'use strict';

//Config shipping
angular.module('app').controller('ConfigChildCtrl',
		   ['$scope', '$modal', '$http', '$state','$filter', '$window', 'toaster', 'Config_Child','$timeout', '$rootScope',
 	function($scope,  $modal,    $http,   $state,  $filter,  $window,   toaster,   Config_Child,   $timeout,  $rootScope) {
		   var tran = $filter('translate');
        /**
         *   config
         **/
        
        $scope.childs           = [];
        $scope.roles            = Config_Child.Roles;
        $scope.infoUser         = $rootScope.userInfo;
    /**
     * get data
     **/
     
     // get data child
    $http({
        url: ApiPath+'child-config/show',
        method: "GET",
        dataType: 'json',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.childs        = result.data;
            if($scope.childs.length > 0){
                angular.forEach($scope.childs, function(value, key) {
                    $scope.childs[key].added = false;
                    $scope.childs[key].updated = false;
                    $scope.childs[key].view = true;
                });
            }
        }
        
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }else{
           // toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
        }
    });
    
    /**
     * Action
     **/
     
      // add child
    $scope.addUser = function (id) {
        var modalInstance = $modal.open({
            templateUrl: 'tpl/config/modal.add_child_user.html',
            controller: function($scope, $modalInstance, id, $http) {

                $scope.id         = id;
                $scope.submit_loading = false;
                
                $scope.accept = function (frm){
                    $scope.submit_loading = true;
                    $scope.frm.id   = id;

                    $http.post(ApiPath + 'child-config/multicreate', frm).success(function (resp){
                        $scope.submit_loading = false;
                        if (!resp.error) {
                        	// Intercom   
                            try {
                            	var metadata = {
                              		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                              		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                              		   time			: 	$filter('date')(new Date(),'yyyy-MM-dd HH:mm')
                         		};
                    			Intercom('trackEvent', 'Config employee', metadata);
                            }catch(err) {
                			    console.log(err)
                			}
                            // Intercom
                        	toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThemNhanVienThanhCong'));
                           // toaster.pop('success', 'Thông báo', 'Thêm nhân viên thành công , quý khách vui lòng báo nhân viên kiểm tra hòm thư để xác thực');
                        }else {
                           // toaster.pop('warning', 'Thông báo', 'Thêm tài khoản nhân viên thất bại, vui lòng thử lại sau hoặc liên hệ tổng đài CSKH của Shipchung để được hỗ trợ');
                            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ThemNhanVienThatBai'));
                        }
                        
                        $scope.cancel();
                    })
                }

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };

            },
            size: 'md',
            resolve: {
                id: function () {
                    return id; 
                }
            }
        });
    };

    //set quyen
    $scope.addPrivilegeUser = function(id){
        var modalInstance = $modal.open({
            templateUrl: 'tpl/config/modal.add_child_privilege.html',
            controller: function($scope, $modalInstance, id, $http) {
                $scope.id         = id;
                $scope.submit_loading = false;
                
                $scope.accept = function (frm){
                    $scope.submit_loading = true;
                    $scope.frm.id   = id;
                    $http.post(ApiPath + 'child-config/set-privilege', frm).success(function (resp){
                        $scope.submit_loading = false;
                        if (!resp.error) {
                            toaster.pop('success',tran('toaster_ss_nitifi'), 'Success!');
                        }else {
                            toaster.pop('warning',tran('toaster_ss_nitifi'), 'Fail!!');
                        }
                        $scope.cancel();
                    })
                }

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };
            },
            size: 'md',
            resolve: {
                id: function () {
                    return id; 
                }
            }
        });
    };
    
    // convert label => input
    $scope.convertLabelToInput = function (child) {
        if(child.email){
            child.user.email = child.email;
        }
        child.added     = false;
        child.view      = !child.view;
        child.updated   = !child.updated;
    };
    
    // delete child
    $scope.delete = function (id,index) {
        $http({
            url: ApiPath + 'child-config/deletechild',
            method: "POST",
            data:id,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            if(!result.error){
               // toaster.pop('success', 'Thông báo', 'Bạn đã xoá thành công!');
                toaster.pop('success',tran('toaster_ss_nitifi'), tran('Btt_BanDaXoaThanhCong'));
                $scope.childs.splice( index, 1);
            }          
            else{
                toaster.pop('error', 'Thông báo', result.message);
            }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                //toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            }
        });
    };
    
    // save
    $scope.save = function(data){
        
        var post = [];
        for(var i= 0,length = data.length; i<length;i++){
            if(data[i].email !=undefined && data[i].email!="" && data[i].role!= undefined && data[i].role!="" && data[i]['add']) {
                post.push(data[i]);
            }
        }
        data = post;
        
        $http({
            url: ApiPath + 'child-config/multicreate',
            method: "POST",
            data:data,
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            if(!result.error){
                //toaster.pop('success', 'Thông báo', 'Thành công , vui lòng kiểm tra email và xác nhận !');
                toaster.pop('success',tran('toaster_ss_nitifi'), tran('Btt_VuiLongKiemTraEmail'));
            }          
            else{
                if(result.message == 'DATA_EMPTY'){
                   // return toaster.pop('error', 'Thông báo', 'Không có thay đổi naò !');
                    return toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_KhongCoThayDoi'));
                }

               //toaster.pop('error', 'Thông báo', 'Có lỗi , hãy thử lại');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_CapNhatLoi'));
            }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                //toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            }
        });
    }

    
}]);
