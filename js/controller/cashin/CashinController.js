'use strict';

//Api Key
angular.module('app').controller('CashinController', ['$scope', '$http', '$filter', '$state', '$window', 'toaster', 'User', 'Cash', '$timeout', '$rootScope',
    function($scope, $http, $filter, $state, $window, toaster, User, Cash, $timeout, $rootScope) {
        // console.log('hello world', 'CashinController');
        var tran = $filter('translate');

        $scope.frm = {
            total_amount: 200000
        }

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.list_linked = {};

        var minDate = new Date();
        minDate.setDate(date.getDate() - 90);

        $scope.minDate = minDate;
        $scope.maxDate = new Date();


        $scope.data = {
            amount: 200000,
            transfer_bank: 'TCB',
            transfer_time: new Date().toISOString().substring(0, 10)
        }
        $scope.data.type = 1;
        $http({
            url: ApiPath + 'user-info/linked-info2',
            method: "GET",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(result, status, headers, config) {
            if (!result.error) {
                $scope.list_linked = result.data;
                $scope.list_linked.forEach(function(value, key) {
                    if (value.active == 1) {
                        $scope.list_linked[key].cardNumber += ' ( ' + tran('default_linked') + ' )';
                        $scope.selected_linked = result.data[key];
                    }
                });

            }
        });

        $scope.saveSuccess = false;
        $scope.frm_submit = false;
        $scope.save = function(data, canSave) {
            if (!canSave) { return false; }
            if (data.type > 0 && +$scope.get_number(data.amount) > 9999) {

                $scope.frm_submit = true;

                data.amount = +$scope.get_number(data.amount);
                data.money = +$scope.get_number(data.amount);

                data.transfer_time = new Date(data.transfer_time).getTime() / 1000;

                Cash.create(data).then(function(result) {

                    if (data.type == 1 && result.data.url) {
                        $window.location.href = result.data.url;
                        //$scope.cancel();
                    }




                    if (!result.data.error) {
                        $timeout(function() {
                            $scope.saveSuccess = true;
                        }, 0)
                            // Intercom   
                            try {

                                var metadata = {
                                    user: $rootScope.userInfo.email ? $rootScope.userInfo.email : "",
                                    name: $rootScope.userInfo.fullname ? $rootScope.userInfo.fullname : "",
                                    money: data.money ? data.money : 0,
                                    type: "Bank"
                                };
                                Intercom('trackEvent', 'Deposit money', metadata);
                            } catch (err) {
                                console.log(err)
                            }
                        // Intercom
                    }

                    if (data.type == 3) {
                        // sleep(2000);
                        $timeout(function() {
                            $scope.naptiendisabled = false;
                        }, 2000)
                    }
                    $scope.frm_submit = false;

                });
            }
            return;
        }


        $scope.$watch('frm.total_amount', function(newVal, oldVal) {
            $scope.data.amount = $scope.get_number(newVal);
        })

        $scope.nextStep = function(data) {
            if(data.amount && data.amount < 9999){
                toaster.pop('warning', tran('toaster_ss_nitifi'),tran('cash_min10'));
                return;
            }
            if (data.type == 1 || data.type == 3) {
                // Intercom
                if (data.type == 1) {
                    try {
                        var metadata = {
                            user: $rootScope.userInfo.email ? $rootScope.userInfo.email : "",
                            name: $rootScope.userInfo.fullname ? $rootScope.userInfo.fullname : "",
                            money: data.amount ? data.amount : 0,
                            type: "NganLuong"
                        };
                        Intercom('trackEvent', 'Deposit money', metadata);
                    } catch (err) {
                        console.log(err)
                    }
                }
                if (data.type == 3) {
                    $scope.naptiendisabled = true;
                }

                return $scope.save(data, true);
            }
            $timeout(function() {
                $scope.saveStep = true;
            }, 0)

        }

        $scope.click_type = function(type) {
            if (type == 3 || type == 1) {
                $scope.saveStep = false;
                $scope.saveSuccess = false;
            }
            $scope.naptiendisabled = false;
        }


        $scope.goBack = function() {
            $timeout(function() {
                $scope.saveStep = false;
            }, 0)
        }


        $scope.get_number = function(data) {
            if (data != undefined && data != '') {
                if (typeof data == 'string') {
                    return data.toString().replace(/,/gi, "");
                } else {
                    return data.toString();
                }
            }
            return 0;
        }

        $scope.list_plan_price = [{
            'price': 200000,
            'text': '200 ngàn',
            'text_en': '200.000đ'
        },
        {
            'price': 500000,
            'text': '500 ngàn',
            'text_en': '500.000đ'
        },
        {
            'price': 1000000,
            'text': '1 triệu',
            'text_en': '1.000.000đ'
        },
        {
            'price': 2000000,
            'text': '2 triệu',
            'text_en': '2.000.000đ'
        },
        {
            'price': 3000000,
            'text': '3 triệu',
            'text_en': '3.000.000đ'
        },
        {
            'price': 5000000,
            'text': '5 triệu',
            'text_en': '5.000.000đ'
        },
        {
            'price': 0,
            'text': 'Tự nhập',
            'text_en': 'Other'
        }
        ];
        $scope.change_currency_cashin = function(currency, homeCurrency) {
            $scope.frm.total_amount = $scope.convert_currency_to_home_currency(currency)
        }
        $scope.set_currency_cashin = function(homeCurrency) {
            if ($scope.convert_currency(homeCurrency))
                $scope.frm.total_amount_curent_2 = $scope.convert_currency(homeCurrency).toFixed(2);
        }
        $scope.set_amount_curent_2 = function(homeCurrency) {
            if ($scope.convert_currency(homeCurrency))
                $scope.data.amount_curent_2 = $scope.convert_currency(homeCurrency).toFixed(2);
        }
        $scope.setTotalAmount = function(price) {
            $scope.frm.total_amount = parseInt(price);
            if ($rootScope.viewCurrency && $rootScope.ViewHomeCurrency && $rootScope.viewCurrency.toString() != $rootScope.ViewHomeCurrency.toString()) {
                if ($scope.convert_currency($scope.frm.total_amount))
                    $scope.frm.total_amount_curent_2 = $scope.convert_currency($scope.frm.total_amount).toFixed(2);
                if ($scope.convert_currency($scope.frm.total_amount))
                    $scope.data.amount_curent_2 = $scope.convert_currency($scope.frm.total_amount).toFixed(2);
            }
        }
    }
    ]);