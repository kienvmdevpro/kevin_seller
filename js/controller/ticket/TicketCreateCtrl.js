'use strict';

// Button create ticket
angular.module('app').controller('TicketCreateCtrl', 
			['$scope','$modal','Ticket','$rootScope',
 	function($scope,   $modal,  Ticket,  $rootScope) {
        /**
         *  Action
         **/
        $scope.list_type        = {};

        Ticket.ListCaseType().then(function (result) {
            if(result.data.data){
                $scope.list_type = result.data.data;
             // Intercom
            	try {
            		var metadata = {
                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                 		   time			:new Date()
            		};
            		Intercom('trackEvent', 'Create ticket', metadata);
	            }catch(err) {
				    console.log(err)
				}
	            // Intercom
            }
        });

         $scope.open_popup = function (size) {
            $modal.open({
                templateUrl: 'PopupCreate.html',
                controller: 'ModalCreateCtrl',
                size:size,
                resolve: {
                    list_type: function () {
                        return $scope.list_type;
                    }
                }
            });
        };
}]);
