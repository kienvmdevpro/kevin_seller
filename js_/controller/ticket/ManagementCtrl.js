'use strict';
var uploader;
//Ticket
angular.module('app').controller('ManagementCtrl', ['$scope','$rootScope', '$modal', '$http', '$stateParams', '$timeout', 'toaster', 'FileUploader', 'Config_Status', 'PhpJs','Api_Path', 'Ticket','$state', 'Analytics',
 	function($scope, $rootScope, $modal, $http, $stateParams, $timeout, toaster, FileUploader, Config_Status, PhpJs, Api_Path, Ticket, $state, Analytics) {
        Analytics.trackPage('/ticket');

        $scope.privilege         = '';
        $scope.list_question     = {};
        $scope.list_request      = [{id:3, content:'Hài lòng'},{id:2, content:'Tạm được'},{id:1, content:'Không tốt'}];
        
        $scope.list_status       = Config_Status.Ticket;
        $scope.data_status       = Config_Status.ticket_btn;
        $scope.type_refer        = Config_Status.ReferTicket;
        $scope.list_data_request = {};
        $scope.detail            = {};
        $scope.total             = 0;
        $scope.total_group       = {};
        $scope.rating            = {};
        $scope.rating.question   = {};
        $scope.data_respond      = {content:'',source:'web'};
        $scope.frm_submit        = false;
        $scope.currentPage       = 1;
        $scope.item_page         = 10;
        $scope.status            = 'ALL';
        $scope.search            = '';
        $scope.show_respond      = true;
        $scope.show_wating       = true;
        $scope.time_start        = $stateParams.time_start;
        $scope.log_view          = {};
        $scope.User              = {};
        $scope.list_feedback     = {};
        $scope.tourInstance      = {};
        
        $rootScope.$watch('_tour', function (){
            $scope.tourInstance = $rootScope._tour;
        })
        
        $scope.runTour = function (){
            setTimeout(function (){
                $scope.tourInstance.restart(true);
            }, 0)
            
            
        }

        var minDate = new Date();
            minDate.setDate(date.getDate() - 90);

        $scope.minDate = minDate;        
        

                
        // File Upload        
        uploader = $scope.uploader = new FileUploader({
            url                 : Api_Path.Upload+'ticket/',
            alias               : 'TicketFile',
            queueLimit          : 5,
            headers             : {Authorization : $rootScope.userInfo.token},
            removeAfterUpload   : true,
            formData: [
                {
                    key: 'feedback'
                }
            ]
        });
        

        $scope.gotoTicket = function (id){
            $state.go('ticket.request.management.detail', {code: id});    
        }

        uploader.filters.push({
            name: 'FileFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|jpeg|pdf|png|'.indexOf(type) !== -1 && item.size < 3000000;
            }
        });

        uploader.onSuccessItem = function(item, result, status, headers){
            if(!result.error){

                return;
            }          
            else{
                toaster.pop('warning', 'Thông báo', 'Upload Thất bại!');
            }
        };
        
        uploader.onErrorItem  = function(item, result, status, headers){
            toaster.pop('error', 'Error!', "Upload file lỗi, hãy thử lại.");
        };
        
        /**
         * get data
         **/
        
       
        
        // get list request
        $scope.change_tab   = function(frmstatus,search,page){
            $scope.currentPage          = page;
            $scope.show_wating          = true;
            $scope.list_data_request    = {};
            $scope.log_view             = {};
            $scope.detail               = {};
            var time_start = '';
            
            if(frmstatus != ''){
                if($stateParams.id != undefined && $stateParams.id != ''){
                    search = $stateParams.id;

                }

                if($scope.time_start == '7day'){
                    time_start = '7';
                }else if($scope.time_start == '14day'){
                    time_start = '14';
                }else if($scope.time_start == 'month'){
                    time_start = '30';
                }else if($scope.time_start == '3months'){
                    time_start = '90';
                }
                
                $http({
                    url: ApiPath+'ticket-request/listbyuser?status='+frmstatus+'&page='+page+'&limit='+$scope.item_page+'&search='+search+'&time_start='+time_start,
                    method: "GET",
                    dataType: 'json',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (result, status, headers, config) {
                    if(!result.error){
                        
                        $scope.list_data_request        = result.data;
                        $scope.total                    = result.total;
                        $scope.total_group              = result.total_group;
                        
                        $scope.status       = frmstatus;
                        $scope.totalItems   = result.total_group[frmstatus];
                        $scope.maxSize      = 5;
                        $scope.item_stt     = $scope.item_page * ($scope.currentPage - 1);

                        if(result.log_view){
                            angular.forEach(result.log_view, function(value, key) {
                                $scope.log_view[value.ticket_id]    = value.view;
                            });
                        }
                        
                        if($state.current.name == 'ticket.request.management.detail' || $state.current.name == 'ticket.request.management'){
                            if($scope.list_data_request.length > 0){
                                
                                if(!$stateParams.code){
                                    $state.go('ticket.request.management.detail', {code: $scope.list_data_request[0]['id']})    
                                }                            
                            }else {

                                $state.go('ticket.request.management.detail', {code: ""})    
                            }
                        }
                    }  
                    else{
                        toaster.pop('warning', 'Thông báo', 'Tải danh sách yêu cầu lỗi !');
                    }
                    
                    $scope.show_wating = false;
                }).error(function (data, status, headers, config) {
                    toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại !');
                });
            }
            $scope.detail   = {};
            return;
        }
        $scope.change_tab($scope.status, '', 1);
        
        
}]);

angular.module('app').controller('TicketDetailCtrl', ['$scope', '$modal', '$http', '$stateParams', '$timeout', 'toaster', 'FileUploader', 'Config_Status', 'PhpJs','Api_Path', 'Ticket', 'Analytics',
    function($scope, $modal, $http, $stateParams, $timeout, toaster, FileUploader, Config_Status, PhpJs, Api_Path, Ticket, Analytics) {

        /**
         *  Action
         **/
        
        
        $scope.detail = {};
        $scope.pipe_status = {};
        $timeout(function (){


            var TicketId = $stateParams.code;

             // get list question rating
            $http({
                url: ApiPath+'ticket-question/index?limit=all',
                method: "GET",
                dataType: 'json',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    $scope.list_question        = result.data;
                }  
                else{
                    toaster.pop('warning', 'Thông báo', 'Tải câu hỏi đánh giá dịch vụ lỗi !');
                }
            }).error(function (data, status, headers, config) {
                toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
            });
            
            $scope.getReferOrder = function (id){
                
                var url = ApiPath + 'ticket-request/order-refer/' + id;
                $http.get(url).success(function(resp){
                    $scope.listOrderRef = resp.data;
                    $scope.listAddress = resp.address;
                    $scope.listDistrict = resp.district;
                }).error(function (){
                    
                });
            }

            $scope.getGroupPipe = function (){
                return $http({
                    url: ApiPath + 'pipe-status/pipebygroup',
                    method: "GET",
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if(result.error){
                        toaster.pop('warning', 'Thông báo', 'Tải dữ liệu lỗi !');
                    }
                    
                    $scope.list_pipe_status      = result.data;
                    angular.forEach(result.data, function(value) {
                        
                        $scope.pipe_status[value.status]    = value.name;
                    });
                    
                }).error(function (data, status, headers, config) {
                    toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                })
            }

             
             $scope.show_detail = function (id) {
                if(id){
                    $scope.getReferOrder(id);
                }
                
                 $scope.show_reply               = false;
                 $scope.detail                   = {};
                 $scope.list_feedback           = {};
                 $scope.data_respond.content    = '';
                 $timeout.cancel(timeout);
                 retime_feedback();
                if(id > 0){
                    $scope.show_wating          = true;
                    $http({
                        url: ApiPath+'ticket-request/show/'+id,
                        method: "GET",
                        dataType: 'json',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (result, status, headers, config) {
                        if(!result.error){
                            $scope.detail           = result.data;
                            $scope.list_feedback    = result.feedback;

                            if($scope.detail.status == 'PROCESSED'){
                                $scope.runTour();
                            }

                            if($scope.log_view[id] == undefined){
                                $scope.log_view[id]    = {};
                            }
                            $scope.log_view[id]       = 1;

                            if(result.data.rating){
                                angular.forEach(result.data.rating, function(value) {
                                    $scope.detail.rate[value.question_id]   = value.rate;
                                });
                            }

                            if(result.user){
                                angular.forEach(result.user, function(value) {
                                    $scope.User[value.id]   = {};
                                    $scope.User[value.id]['md5_email']   = PhpJs.md5(value.email);
                                    $scope.User[value.id]['fullname']    = value.fullname;
                                    $scope.User[value.id]['phone']       = value.phone;
                                    $scope.User[value.id]['email']       = value.email;
                                });
                            }

                            if($scope.detail.status != 'CLOSED'){
                                $timeout.cancel(timeout);
                            }
                        }  
                        else{
                            $timeout.cancel(timeout);
                            toaster.pop('warning', 'Thông báo', 'Tải yêu cầu lỗi !');
                            $scope.detail       = {};
                        }
                        $scope.show_wating          = false;
                    }).error(function (data, status, headers, config) {
                        $timeout.cancel(timeout);
                        if(status == 440){
                            Storage.remove();
                        }else{
                            toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                            $scope.detail       = {};
                        }
                    });
                    $scope.show_respond     = true;
                }
                return;
            };

            $scope.get_feedback = function(id){
                Ticket.ListFeedback(id).then(function (result) {
                    if(result.data.data){
                        $scope.list_feedback    = result.data.data;
                    }
                });
            }

            // Send Respond
            var save = function (status){
                if($scope.detail.id > 0 && $scope.data_respond != undefined && $scope.data_respond != '' ){
                    var data = angular.copy($scope.data_respond);
                    var url  = ApiPath+'ticket-feedback/create/';

                    if(status != undefined && status != ''){
                        data['status']  = status;

                        if(status == 'PENDING_FOR_CUSTOMER'){
                            data['time_over']   = 10081;
                            url = ApiPath+'ticket-request/edit/';
                        }
                    }else{
                        data['status']  = $scope.detail.status;
                    }
                    data['contact']     = '';
                    $http({
                        url: url+$scope.detail.id,
                        method: "POST",
                        data:data,
                        dataType: 'json',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (result, status, headers, config) {
                        if(!result.error){
                            toaster.pop('success', 'Thông báo', 'Thành công !');
                            $scope.data_respond.content = '';

                            if($scope.data_respond.content != undefined && $scope.data_respond.content != ''){
                                $scope.list_feedback.unshift({user_id:result.user_id, content:data.content});
                            }
                            
                            if(result.id > 0){ // Upload file
                                uploader.onBeforeUploadItem = function(item) {
                                    item.url = Api_Path.Upload+'ticket/'+result.id;
                                };
                                uploader.uploadAll();
                            }
                            
                            if(data['status']){
                                $scope.detail.status    = data['status'];
                            }
                            
                        }  
                        else{
                            toaster.pop('warning', 'Thông báo', 'Gửi yêu cầu lỗi !');
                        }
                    }).error(function (data, status, headers, config) {
                        toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
                    });
                }
                return;
            }
            $scope.save = function (status) {
                if(status == 'CLOSED'){
                    if(confirm('Bạn có chắc chắn yêu cầu này đã được xử lý?')){
                        save(status);
                    }
                }else {
                    save(status);
                }
                
            };
            
            // Send rating
            $scope.saveRatingProcess = false;

            $scope.openPrompt = function (callback){
                bootbox.prompt({
                    message: "",
                    placeholder: "Gửi ý kiến đánh giá của quý khách của yêu cầu này",
                    title: "Gửi ý kiến đánh giá ",
                    inputType:"textarea",
                    callback: function (result) {
                        if(result !== null && result !== ""){
                            callback(result);
                        }else {
                            $scope.saveRatingProcess = false;
                            toaster.pop('warning', 'Thông báo', 'Quý khách vui lòng nhập nội dung đánh giá !');
                        }

                        
                     }
                });
            }
            $scope.sended = false;
            $scope.save_rating = function (data) {

                $scope.saveRatingProcess = true;
                if($scope.detail.id > 0){

                    angular.extend($scope.rating.question, data);

                    if(data['1'] == 3){
                        
                        $scope.openPrompt(function (result){
                            if(result){
                                $scope.rating['comment'] = result;
                            }

                            $http({
                                url: ApiPath + 'ticket-rating/create/' + $scope.detail.id,
                                method: "POST",
                                data:$scope.rating,
                                dataType: 'json',
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (result, status, headers, config) {
                                $timeout(function (){
                                    $scope.sended = true; 
                                    $scope.saveRatingProcess = false;
                                })
                                
                                if(!result.error){
                                    toaster.pop('success', 'Cảm ơn ', 'Cảm ơn bạn đã đóng góp đánh giá cho chúng tôi, Xin cảm ơn !');
                                    $scope.detail['status'] = 'CLOSED';
                                }  
                                else{
                                    toaster.pop('warning', 'Thông báo', 'Gửi đánh giá lỗi,hãy thử lại sau !');
                                }
                            }).error(function (data, status, headers, config) {
                                toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
                            });
                        })
                        return false;

                    }
                    


                    $http({
                        url: ApiPath + 'ticket-rating/create/' + $scope.detail.id,
                        method: "POST",
                        data:$scope.rating,
                        dataType: 'json',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (result, status, headers, config) {
                        $timeout(function (){
                            $scope.sended = true; 
                            $scope.saveRatingProcess = false;
                        })
                        if(!result.error){
                            toaster.pop('success', 'Cảm ơn ', 'Cảm ơn bạn đã đóng góp đánh giá cho chúng tôi, Xin cảm ơn !');
                            $scope.detail['status'] = 'CLOSED';
                        }  
                        else{
                            toaster.pop('warning', 'Thông báo', 'Gửi đánh giá lỗi,hãy thử lại sau !');
                        }
                    }).error(function (data, status, headers, config) {
                        toaster.pop('error', 'Thông báo', 'Lỗi hệ thống!');
                    });
                }
                return;
            };
            
            // toogle show  markdown
            $scope.toogle_show = function(type){
                if(type == 'show_respond'){
                    $scope.show_respond = !$scope.show_respond;
                }
            }

            var retime_feedback = function(){
                timeout = $timeout(function(){
                    $scope.get_feedback($scope.detail.id);
                    retime_feedback();
                },180000);
            }

            $scope.show_detail(TicketId);
            $scope.getGroupPipe()
        })
    }]);
