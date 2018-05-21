'use strict';

//Config shipping
angular.module('app').controller('ConfigChildCtrl', ['$scope', '$modal', '$http', '$state', '$window', 'toaster', 'Config_Child','$timeout', 
 	function($scope, $modal, $http, $state, $window, toaster, Config_Child, $timeout) {
        
        /**
         *   config
         **/
        
        $scope.childs           = [];
        $scope.roles            = Config_Child.Roles;
        
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
        
        var newChild = {added:true,updated:false,view:false};
        $scope.childs.push(newChild);
        
    }).error(function (data, status, headers, config) {
        if(status == 440){
            Storage.remove();
        }else{
            toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
        }
    });
    
    /**
     * Action
     **/
     
      // add child
    $scope.addUser = function (child) {

        if(child.email !=undefined && child.email!="" && child.role!= undefined && child.role!="") {
            child.added       = false;
            child.updated     = false;
            child.view        = true;
            child.add = true;
            child.user = {};
            child.user.email = child.email;
            $timeout(function (){

                $scope.childs.push({added:true});

            })
            
        }
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
    $scope.deleteUser = function (index) {
        $scope.childs.splice( index, 1);
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
                toaster.pop('success', 'Thông báo', 'Thành công , vui lòng kiểm tra email và xác nhận !');
            }          
            else{
                if(result.message == 'DATA_EMPTY'){
                    return toaster.pop('error', 'Thông báo', 'Không có thay đổi naò !');
                }

                toaster.pop('error', 'Thông báo', 'Có lỗi , hãy thử lại');
            }
        }).error(function (data, status, headers, config) {
            if(status == 440){
                Storage.remove();
            }else{
                toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
            }
        });
    }
    
}]);
