'use strict';

//List Order
angular.module('app').controller('UploadCtrl', ['$scope', '$http', '$state', '$stateParams', '$window', '$rootScope', 'toaster', 'FileUploader', 'Api_Path', 'Analytics',
 	function($scope, $http, $state, $stateParams, $window, $rootScope, toaster, FileUploader, Api_Path, Analytics) {
    // upload  excel
        Analytics.trackPage('/create_order/file/step2');

        var uploader = $scope.uploader = new FileUploader({
            url                 : Api_Path.Order+'/upload',
            removeAfterUpload   : true,
            headers             : {Authorization : $rootScope.userInfo.token}
            });
            $scope.waiting  = false;
        // FILTERS

        /*
        uploader.filters.push({
            name: 'excelFilter',
            fn: function(item, options) {
                $scope.waiting  = false;
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1;
            }
        });
        */

        uploader.onProgressAll  = function(progress){
            $scope.waiting  = true;
        }

        uploader.onSuccessItem = function(item, result, status, headers){
            $scope.waiting  = false;
            if(!result.error){
                toaster.pop('success', 'Thông báo', 'Upload Thành công!');
                
                $state.go('order.upload3',{id:result.id, bc: $stateParams.bc});
            }          
            else{
                toaster.pop('warning', 'Thông báo', result.message);
            }
        };
        
        uploader.onErrorItem  = function(item, result, status, headers){
            $scope.waiting  = false;
            toaster.pop('error', 'Error!', "Kết nối dữ liệu thất bại. Hãy thử lại!");
        };
      
    
}]);