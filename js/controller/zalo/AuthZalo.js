'use strict';

//Api Key
angular.module('app').controller('AuthZalo', ['$rootScope', '$scope', '$http', '$state', '$window', 'toaster', 'User', '$modal', '$location', '$localStorage', '$filter', '$timeout', 'Inventory', 'OrderStatus', 'Config_Status',
    function ($rootScope, $scope, $http, $state, $window, toaster, User, $modal, $location, $localStorage, $filter, $timeout, Inventory, OrderStatus, Config_Status) {

        var tran = $filter('translate');
        $scope.accept = function () {
            var redirect_uri = $location.absUrl().match(/(redirect_uri=([^&]*))/g)[0].replace("redirect_uri=", "");
            console.log($location.absUrl().match(/(redirect_uri=([^&]*))/g));
            if (!$location.absUrl().match(/(redirect_uri=([^&]*))/g)) {
                return toaster.pop('warning', tran('toaster_ss_nitifi'), 'redirect_uri not found');
            }

            if (!$location.absUrl().match(/(page_login=([^&]*))/g)) {
                return toaster.pop('warning', tran('toaster_ss_nitifi'), 'page_login not found');
            }

            var page_login = $location.absUrl().match(/(page_login=([^&]*))/g)[0].replace("page_login=", "");

            var url = "";
            var data = {};
            data.redirect_uri = redirect_uri;
            if (page_login == 9) {
                url = ApiPath + 'store/zalo-auth';
            }

            $http({
                url: url,
                data: data,
                method: "POST",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                $scope.waiting = false;
                if (result.error) {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), error_message);
                } else {
                    if (!result.error) {
                        $window.location.href = decodeURIComponent(result.redirect_uri + '?access_token=' + result.data);
                    }
                }
            }).error(function (data, status, headers, config) {
                if (status == 440) {
                    Storage.remove();
                } else {
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }

        $scope.cancel = function () {
            if (!$location.absUrl().match(/(redirect_uri=([^&]*))/g) !== null) {
                return toaster.pop('warning', tran('toaster_ss_nitifi'), 'redirect_uri not found');
            }
            var redirect_uri = $location.absUrl().match(/(redirect_uri=([^&]*))/g)[0].replace("redirect_uri=", "");
            $window.location.href = redirect_uri;
        }


    }])