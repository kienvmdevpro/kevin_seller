'use strict';

//Verify Upload Money Collect
angular.module('app').controller('UploadCtrl', 
		   ['$scope', '$state', '$filter','$stateParams', '$rootScope', '$filter', 'FileUploader', 'toaster', 'Api_Path',
 	function($scope, $state,     $filter,  $stateParams,   $rootScope,    $filter,  FileUploader,  toaster,    Api_Path) {
    /*
        Config
    */
	  var tran = $filter('translate');
        $scope.courier_id           = '';

        // upload  excel
        var uploader = $scope.uploader = new FileUploader({
            url                 : '/api/public/accounting/courier-verify/upload/estimate',
            alias               : 'AccFile',
            headers             : {Authorization : $rootScope.userInfo.token},
            removeAfterUpload   : true
        });

        // FILTERS
        uploader.filters.push({
            name: 'excelFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1;
            }
        });

        uploader.onBeforeUploadItem = function(item) {
            item.url = '/api/public/accounting/courier-verify/upload/estimate?courier_id='+$scope.courier_id
        };

        uploader.onSuccessItem = function(item, result, status, headers){
            if(!result.error){
                //toaster.pop('success', 'Thông báo', 'Upload Thành công!');
                toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_UpLoadThanhCong'));
            }
            else{
                toaster.pop('warning', tran('toaster_ss_nitifi'), result.data.message_error);
            }
        };

        uploader.onErrorItem  = function(item, result, status, headers){
            //toaster.pop('error', 'Thông báo!', "Lỗi kết nối dữ liệu, hãy thử lại !");
            toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
        };
    }
]);
