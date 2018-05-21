'use strict';

// Button create ticket
angular.module('app').controller('TicketCreateCtrl', ['$scope', '$modal', 'Ticket',
 	function($scope, $modal, Ticket) {
        /**
         *  Action
         **/
        $scope.list_type        = {};

        Ticket.ListCaseType().then(function (result) {
            if(result.data.data){
                $scope.list_type = result.data.data;
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
