'use strict';

//Management
angular.module('app').controller('SyncOrderCtrl',
    ['$scope', '$http', '$state', '$stateParams', '$window', 'bootbox', 'Order', 'Location', 'Config_Status', 'Inventory', 'Analytics', 'User', '$filter', 'toaster', 'StoreConnect', 'AppStorage', '$rootScope', '$timeout', 'OrderStatus', 'StoreOrderConnect', 'WarehouseRepository', '$modal',
        function ($scope, $http, $state, $stateParams, $window, bootbox, Order, Location, Config_Status, Inventory, Analytics, User, $filter, toaster, StoreConnect, AppStorage, $rootScope, $timeout, OrderStatus, StoreOrderConnect, WarehouseRepository, $modal) {
            Analytics.trackPage('/order/listing');
            'use strict';
            // config
            $scope.currentPage = 1;
            $scope.item_page = 10;
            $scope.maxSize = 5;

            $scope.list_store = {};
            $scope.list_data = {};
            $scope.list_city = {};
            $scope.list_inventory = {};  // kho hàng
            $scope.list_inventory_ = [];
            $scope.Inventory = {};
            $scope.list_district = {};
            $scope.check_box = [];
            $scope.list_tracking_code = [];
            $scope.waiting = false;
            $scope.check_load_product = false;


            $scope.create_all = false;
            $scope.total = '';
            $scope.max = 0;
            $scope.dynamic = 0;

            $scope.checkingALL = 1;
            $scope.total_disabled = 0;

            $scope.all_data = [];

            $scope.filter_inventory = false;

            $scope.item_names = {};

            var tran = $filter('translate');

            $scope.$watch('keyLang', function (Value, OldValue) {
                if (Value == 'vi') {
                    $scope.list_pay_pvc = OrderStatus.list_pay_pvc;
                    $scope.service = OrderStatus.service;
                    $scope.pay_pvc = OrderStatus.pay_pvc;
                    $scope.list_service = OrderStatus.list_service;
                    $scope.list_status = Config_Status.ExcelOrder;
                } else {
                    $scope.list_pay_pvc = OrderStatus.pay_pvc_en;
                    $scope.service = OrderStatus.service_en;
                    $scope.pay_pvc = OrderStatus.pay_pvc_en;
                    $scope.list_service = OrderStatus.list_service_en;
                    $scope.list_status = Config_Status.ExcelOrder_en;
                }
            });

            $scope.ChangeShop = function (id) {
                var tran = $filter('translate');
                var url = ApiPath + 'store/change-store';
                var data = {};
                data.type = id;
                $http({
                    url: url,
                    method: "POST",
                    data: data,
                    dataType: 'json'
                }).success(function (result, status, headers, config) {
                    if (!result.error) {
                        if (Object.keys(result.data).length > 0) {
                            $scope.list_store = result.data;
                        }
                    }
                }).error(function (data, status, headers, config) {
                    if (status == 440) {
                        Storage.remove();
                    } else {
                        toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                    }
                    $scope.waiting_store = false;
                });
            }

            var date = new Date();
            $scope.frm = {};
            $scope.time = {
                time_create_start: new Date(date.getFullYear(), date.getMonth(), 1),
                time_create_end: new Date(date.getFullYear(), date.getMonth(), date.getDate())
            };

            $scope.waiting = true;
            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            var minDate = new Date();
            minDate.setDate(date.getDate() - 90);

            $scope.minDate = minDate;
            $scope.maxDate = new Date();


            // List all district
            AppStorage.loadDistrict();
            $scope.list_district_all = {};
            if (AppStorage.districts && AppStorage.districts.length >= 1) {
                angular.forEach(AppStorage.districts, function (value) {
                    $scope.list_district_all[value.id] = value;
                });
            }

            $scope.loadInventory = function (callback, params, q) {



            }
            $scope.change_inventory = function (item, key) {
                $scope.frm = {};
                $scope.frm.inventory = item.inventory;
                StoreOrderConnect.ChangeExcel($scope.frm, item.partner).then(function (result) {
                    $scope.list_data[key].inventory = result.data.data_update.inventory;
                    if ($scope.list_inventory_[result.data.data_update.inventory].warehouse_code) {
                        $scope.processProducts($scope.list_inventory_[result.data.data_update.inventory].warehouse_code, key);
                        $scope.list_data[key].boxme_inventory = 1;
                    } else {
                        $scope.list_data[key].boxme_inventory = 0;
                    }

                    if (!result.data.error) {
                        $scope.list_data[key].active = 0;
                        $scope.list_data[key].status = 'NOT ACTIVE';
                    }
                });
            }

            function arr_diff(a1, a2) {
                var a = [], diff = [];
                for (var i = 0; i < a1.length; i++) {
                    a[a1[i]] = true;
                }
                for (var i = 0; i < a2.length; i++) {
                    if (a[a2[i]]) {
                        delete a[a2[i]];
                    } else {
                        a[a2[i]] = true;
                    }
                }
                for (var k in a) {
                    diff.push(k);
                }
                return diff;
            }


            var checkOrderAvaliable = function (products, item) {

                if (item.order_items && item.order_items.length > 0) {
                    item.unavaliable_sku = [];
                    item.avaliable_sku = [];

                    item.items_sku = [];
                    var _temp = [];
                    item.sku_not_found = [];

                    for (var i = 0; i < products.length; i++) {
                        var productItem = products[i];
                        $scope.item_names[productItem.SellerBSIN] = productItem.ProductName;
                        for (var j = 0; j < item.order_items.length; j++) {
                            if (item.items_sku.indexOf(item.order_items[j].sku) == -1) {
                                item.items_sku.push(item.order_items[j].sku);
                            }
                            if (productItem.SellerBSIN == item.order_items[j].sku) {
                                if (productItem.AvailableItem >= item.order_items[j].quantity) {
                                    item.avaliable_sku.push(productItem.SellerBSIN);
                                } else {
                                    item.unavaliable_sku.push(productItem.SellerBSIN);
                                }
                                _temp.push(productItem.SellerBSIN);
                            }
                        }
                    }
                    item.sku_not_found = arr_diff(item.items_sku, _temp);
                }
            }


            $scope.generation_item_name = function (item) {
                var name_arr = [];
                item.has_sku_not_found = false;
                angular.forEach(item.order_items, function (value) {
                    if ($scope.item_names.hasOwnProperty(value.sku)) {
                        var thieuhang = ""
                        if (item.unavaliable_sku.indexOf(value.sku) != -1) {
                            thieuhang = " <label class='label label-warning'>Thiếu hàng</label>"
                        }
                        name_arr.push("<p>" + value.sku + " - " + $scope.item_names[value.sku] + " (x" + value.quantity + ")" + thieuhang + "</p>");
                    } else {
                        item.has_sku_not_found = true;
                        name_arr.push("<p class='text-danger'>" + value.sku + " <label class='label label-danger'>SKU không tồn tại</label></p>");
                    }
                })
                return name_arr.join('');
            }

            $scope.processProducts = function (warehouse_code, key = "") {
                WarehouseRepository.GetProducts(warehouse_code, true).then(function (resp) {
                    $scope.item_names = {};
                    $scope.check_load_product = true;
                    $scope.list_products = resp.embedded().product || [];

                    checkOrderAvaliable(resp.embedded().product || [], $scope.list_data[key]);
                    $scope.list_data[key].name_str = $scope.generation_item_name($scope.list_data[key]);

                });
            }

            // Get Data
            var busy = false;
            // Action

            $scope.refresh_data = function (cmd) {
                var time_create_start = '';
                var time_create_end = '';
                var time_accept_start = '';
                var time_accept_end = '';

                if ($scope.time.time_create_start != undefined && $scope.time.time_create_start != '') {
                    $scope.frm.time_create_start = +Date.parse($scope.time.time_create_start) / 1000;
                } else {
                    $scope.frm.time_create_start = 0;
                }

                if ($scope.time.time_create_end != undefined && $scope.time.time_create_end != '') {
                    $scope.frm.time_create_end = +Date.parse($scope.time.time_create_end) / 1000;
                } else {
                    $scope.frm.time_create_end = 0;
                }

                if (cmd != 'export') {
                    $scope.waiting = true;
                    $scope.check_action = true;
                    $scope.list_data = {};
                    $scope.status_group = {};
                    $scope.total = 0;
                }
            }

            $scope.setPage = function () {
                $scope.refresh_data('');
                StoreOrderConnect.getSyncOrder($scope.frm, $scope.currentPage).then(function (result) {
                    $scope.waiting = false;
                    if (!result.data.error) {
                        $scope.list_data = result.data.data;
                        $scope.totalItems = result.data.total;
                        $scope.item_stt = $scope.item_page * ($scope.currentPage - 1);
                        $scope.total = result.data.total;

                        angular.forEach($scope.list_data, function (value, key) {
                            if (value.currency && value.currency != 'VND') {
                                $scope.list_data[key].item_price = 0;
                                $scope.list_data[key].collect = 0;
                            }

                            if (value.to_city == 0 || value.to_district == 0) {
                                $scope.total_disabled += 1;
                            }

                        });

                        Inventory.loadWithPostOffice().then(function (result) {
                            if (!result.data.error) {
                                $scope.list_inventory = result.data.data;
                            } else {
                                $rootScope.hasInventory = false;
                            }
                            angular.forEach($scope.list_inventory, function (value, key) {
                                $scope.list_inventory_[value.id] = value;
                            });

                            angular.forEach($scope.list_data, function (value, key) {
                                if (value.boxme_inventory) {
                                    $scope.processProducts($scope.list_inventory_[value.inventory].warehouse_code, key);
                                }
                            })
                        });
                        $scope.toggleSelectionAll(1);
                    }
                });
                return;
            }

            $scope.setPage();

            $scope.exportExcel = function () {
                $scope.refresh_data('export');
                return Order.ListOrder($scope.currentPage, '', $scope.frm, 'export');
            }

            // Checkbox
            $scope.toggleSelection = function (id) {
                var data = angular.copy($scope.check_box);
                var idx = +data.indexOf(id);

                if (idx > -1) {
                    $scope.check_box.splice(idx, 1);
                }
                else {
                    $scope.check_box.push(id);
                }
            };

            $scope.check_list = function (id, action) {
                var data = angular.copy($scope.check_box);
                var idx = +data.indexOf(id);

                if (idx > -1) {
                    if (action == 'delete') {
                        delete $scope.check_box[idx];
                    }
                    return true;
                }
                else {
                    return false;
                }

            }

            $scope.toggleSelectionAll = function (check) {
                var check_box = $scope.check_box;
                if (check == 0) {
                    $scope.check_box = [];
                } else {
                    $scope.check_box = [];
                    angular.forEach($scope.list_data, function (value, key) {
                        if (value.active == 0 && (value.to_city > 0) && (value.to_district > 0)) {
                            $scope.check_box.push(key);
                        }
                    });
                }


            }

            $scope.$watchCollection('check_box', function (newdata, olddata) {
                $scope.max = newdata.length;
            });


            // get list city
            Location.province('all').then(function (result) {
                $scope.list_city = result.data.data;
                angular.forEach($scope.list_city, function (value) {
                    $scope.list_district[value.id] = {};
                });
            });

            // Action
            $scope.remove = function (key,partner) {
                StoreOrderConnect.RemoveExcel(partner).then(function (result) {
                    if (!result.data.error) {
                        $scope.list_data.splice(key,1);
                    }
                });
            }

            $scope.toggleChecking = function (status) {
                $scope.checkingALL = status;
                angular.forEach($scope.list_data, function (value, key) {
                    value.checking = parseInt(status);
                })
            }

            $scope.create = function (key, item, accept) {
                if (!item.is_global) {
                    if (item.district_id) {
                        return toaster.pop('warning', 'Bạn chưa chọn quận huyện !');
                    }
                } else {
                    if (item.district_id) {
                        return toaster.pop('warning', 'Bạn chưa chọn quận huyện !');
                    }

                    if (item.zipcode) {
                        return toaster.pop('warning', 'Bạn chưa nhập zipcode !');
                    }
                }



                var stock_id = item.inventory;
                var is_postoffice = false;
                if (stock_id > 0) {

                    item.waiting_create = true;

                    StoreOrderConnect.CreateExcel(item.partner, stock_id, null, "", accept, item.is_global).then(function (result) {
                        item.waiting_create = false;
                        if (!result.data.error) {
                            $scope.list_data[key]['trackingcode'] = result.data.data;
                            $scope.list_data[key]['active'] = 1;
                            $scope.list_data[key]['status'] = 'SUCCESS';
                            $scope.list_tracking_code.push(result.data.data);
                            // Intercom   
                            try {
                                var metadata = {
                                    create_by: $rootScope.userInfo.email ? $rootScope.userInfo.email : "",
                                    order_number: result.data.data ? result.data.data : "",
                                    active: "Create order excel",
                                    links: "order/upload/step3",
                                };
                                Intercom('trackEvent', 'Create Order Excel', metadata);
                            } catch (err) {
                                console.log(err)
                            }

                        } else {
                            if (result.data.code == 1) {
                                $scope.list_data[key]['active'] = 2;
                                $scope.list_data[key]['status'] = 'FAIL';
                                toaster.pop('warning', tran('toaster_ss_nitifi'), result.data.message);
                            }
                        }

                        if (result.data.total) {
                            $scope.total = result.data.total;
                        }

                        $scope.check_list(key, 'delete');
                    });
                } else {
                    //toaster.pop('danger', 'Thông báo', 'Hãy chọn kho hàng !');
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_BanChuaChonKhoHang'));

                }
                return;
            }

            // create multi
            $scope.action_create = function (data, accept) {
                if (data.length > 0) {
                    $scope.create_all = true;
                    $scope.create_multi(data, 0, accept);
                }
                return;
            }

            $scope.create_multi = function (data, num, accept) {
                $scope.dynamic = num;
                var is_postoffice = false;
                var stock_id = $scope.list_data[data[num]].inventory
                if (data[num] && data[num].length > 0) {
                    StoreOrderConnect.CreateExcel(data[num], stock_id, $scope.checkingALL, is_postoffice, accept).then(function (result) {
                        if (!result.data.error) {
                            $scope.list_data[data[num]]['trackingcode'] = result.data.data;
                            $scope.list_data[data[num]]['active'] = 1;
                            $scope.list_data[data[num]]['status'] = 'SUCCESS';
                            $scope.list_tracking_code.push(result.data.data);
                        } else {
                            $scope.list_data[data[num]]['active'] = 2;
                            $scope.list_data[data[num]]['status'] = 'FAIL';
                            toaster.pop('warning', tran('toaster_ss_nitifi'), result.data.message);
                        }

                        if (result.data.total || result.data.total == 0) {
                            $scope.total = result.data.total;
                        }

                        $scope.create_multi(data, +num + 1, accept);
                    });
                } else {
                    $scope.create_all = false;
                    $scope.check_box = [];
                    // toaster.pop('success', 'Thông báo', 'Kết thúc !'); 
                    toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_KetThuc'));
                }
            }

            $scope.edit_address = function (item, key) {
                var modalInstance = $modal.open({
                    templateUrl: 'EditAddressExcel.html',
                    controller: function ($scope, $filter, $rootScope, loginService, $http, $state, CurencyExchange, $stateParams, $timeout, $modal, AppStorage, Location, Inventory, Order, ConfigShipping, PhpJs, toaster, $localStorage, WarehouseRepository) {
                        $scope.list_country = [];
                        $scope.item = angular.copy(item);
                        $scope.defaultphone = item.to_phone;
                        $scope.To = {
                            Buyer: {
                                Name: item.to_name ? item.to_name : "",
                                Address: item.to_address ? item.to_address : "",
                                Province: item.to_district ? item.to_district : "",
                                City: item.to_city ? item.to_city : "",
                                Area: {
                                },
                                Zipcode: item.zipcode ? item.zipcode : ""
                            }
                        };

                        $scope.open_sdt = function () {
                            $scope.hideopenphone = false;
                            $scope.classphone = "open";
                            $scope.openphone = $scope.openphone == true ? false : true;
                        }
                        $scope.setcontry = function (value) {
                            $scope.openphone = false;
                            $scope.hideopenphone = true;
                            $scope.To.Buyer.Country = value;
                        }
                        $scope.show_phone2 = false;
                        $scope.show_phone_2 = function () {
                            $scope.show_phone2 = !$scope.show_phone2
                        }

                        $scope.$watch('To.Buyer.Phone', function (newVal, oldVal) {
                            if (newVal && newVal.length <= 5) {
                                if (newVal[0] == '+') {
                                    newVal = newVal.replace("+", "");
                                    angular.forEach($scope.list_country, function (value) {
                                        if (newVal.toString() == value.phone_code.toString()) {
                                            $scope.To.Buyer.Country = value;
                                        }
                                    });
                                }

                            }
                        })

                        if (item.country_id == 237) {
                            $scope.To.Buyer.Area.district_id = item.to_district ? item.to_district : "";
                        }

                        $scope.arrChina = {
                            country: [],
                            china_1: []
                        }

                        Location.country().then(function (resp) {
                            //$scope.list_country = resp.data.data;
                            $scope.list_country = [{ "id": -1 }, { "id": -2 }, { "id": -3 }];
                            var china = {}
                            angular.forEach(resp.data.data, function (value) {
                                value.country_code_img = value.country_code.toLowerCase()
                                if ([237, 230, 229].indexOf(value.id) >= 0) {
                                    if (value && value.id == 237) {
                                        $scope.list_country[0] = value
                                    }
                                    if (value && value.id == 230) {
                                        $scope.list_country[1] = value
                                    }
                                    if (value && value.id == 229) {
                                        $scope.list_country[2] = value
                                    }
                                }
                                if (value && parseInt(value.id) == 44) {
                                    china = value;
                                    $scope.arrChina.country.push(value)
                                }
                                if (value && parseInt(value.id) == 246) {
                                    $scope.arrChina.country.push(value)
                                }
                                if (value && [44, 246, 237, 230, 229].indexOf(value.id) <= -1) {
                                    $scope.list_country.push(value)
                                }
                                if (value.id == item.country_id) {
                                    $scope.To.Buyer.Country = value;
                                }
                            });
                            china.country_name = "China"
                            china.id = -1;
                            $scope.list_country.push(china)

                        })

                        $scope.$watch('To.Buyer.Country', function (newVal) {
                            if (newVal && (newVal.id > 0 || newVal.id == -1)) {
                                if (newVal.id !== 237) {
                                    // if($scope.To.Buyer.PhoneCtrl){
                                    //     $scope.To.Buyer.PhoneCtrl.setCountry(newVal.country_code)
                                    // }
                                    $scope.To.Buyer.CityGlobal = undefined;

                                    $scope.disabled_payment_type = true;
                                    $scope.disabled_service = true;

                                } else {
                                    $scope.disabled_payment_type = false;
                                    $scope.disabled_service = false;
                                }
                                $scope.loadCityGlobal(newVal.id, item.city_name);
                            }
                        })

                        $scope.loadCityGlobal = function (country_id, q) {
                            if (q || q.toString() == "getdata") {
                                if (q.toString() == "getdata") {
                                    q = "";
                                }
                                $scope.list_city_global = [];
                                if (country_id == -1) {
                                    if ($scope.To.Buyer.CityGlobal && $scope.To.Buyer.CityGlobal.city_name && !q) {
                                        q = $scope.To.Buyer.CityGlobal.city_name;
                                    }
                                    Location.city_global(44, q).then(function (resp) {
                                        $scope.arrChina.china_1 = resp.data.data;
                                        $scope.list_city_global = resp.data.data;
                                    })
                                    Location.city_global(246, q).then(function (resp) {
                                        if (resp.data && resp.data.data) {
                                            ;
                                            angular.forEach(resp.data.data, function (value) {
                                                $scope.list_city_global.push(value);
                                            })
                                        }
                                    })
                                    return $scope.list_city_global;
                                } else {
                                    return Location.city_global(country_id, q).then(function (resp) {
                                        $scope.list_city_global = resp.data.data;
                                        angular.forEach($scope.list_city_global, function (value, key) {
                                            if (value._id == item.to_city) {
                                                $scope.To.Buyer.CityGlobal = value;
                                            }
                                        })
                                    })
                                }


                            }
                        }

                        $scope.save = function () {
                            $scope.frm = {};
                            if (!$scope.To.Buyer.Phone) {
                                return toaster.pop('warning', 'Bạn chưa nhập số điện thoại !');
                            }
                            if (!$scope.To.Buyer.Name) {
                                return toaster.pop('warning', tran('OBG_ChuaNhapTenNguoiNhan'));
                            }
                            if (!$scope.To.Buyer.Address) {
                                return toaster.pop('warning', tran('OBG_ChuaNhapDiaChiNguoiNhan'));
                            }

                            if ($scope.To.Buyer.Country.id != 237) {
                                if (!$scope.To.Buyer.Zipcode) {
                                    return toaster.pop('warning', 'Bạn chưa nhập zipcode');
                                }
                                if (!$scope.To.Buyer.CityGlobal._id) {
                                    return toaster.pop('warning', 'Bạn chưa chọn thành phố');
                                }
                            } else {
                                if (!$scope.To.Buyer.Area.city_id) {
                                    return toaster.pop('warning', 'Bạn chưa chọn thành phố');
                                }
                            }



                            var phone = [$scope.To.Buyer.Phone.replace(/\D/g, "")];
                            if ($scope.To.Buyer.Phone2) {
                                phone.push($scope.To.Buyer.Phone2);
                            }
                            $scope.frm.to_phone = $scope.To.Buyer.Phone ? phone.toString() : null;
                            $scope.frm.to_name = $scope.To.Buyer.Name ? $scope.To.Buyer.Name : null;
                            $scope.frm.to_address = $scope.To.Buyer.Address ? $scope.To.Buyer.Address : null;
                            $scope.frm.country_id = $scope.To.Buyer.Country ? $scope.To.Buyer.Country.id : null;

                            if ($scope.To.Buyer.Country.id == 237) {
                                $scope.frm.to_city = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.city_id : null;
                                $scope.frm.to_district = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.district_id : null;
                                $scope.frm.city_name = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.city_name : null;
                                $scope.frm.district_name = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.district_name : null;
                                $scope.frm.is_global = false;
                            } else {
                                $scope.frm.to_city = $scope.To.Buyer.CityGlobal ? $scope.To.Buyer.CityGlobal._id : null;
                                $scope.frm.city_name = $scope.To.Buyer.CityGlobal ? $scope.To.Buyer.CityGlobal.city_name : null;
                                $scope.frm.is_global = true;
                            }
                            $scope.frm.zipcode = $scope.To.Buyer.Zipcode ? $scope.To.Buyer.Zipcode : null;
                            $scope.frm.country_code = $scope.To.Buyer.Country ? $scope.To.Buyer.Country.country_code : null;
                            $scope.frm.type_store = item.type_store;



                            StoreOrderConnect.ChangeExcel($scope.frm, item.partner).then(function (result) {
                                $scope.item.to_phone = result.data.data_update.to_phone;
                                $scope.item.to_name = result.data.data_update.to_name;
                                $scope.item.to_address = result.data.data_update.to_address;
                                $scope.item.to_city = result.data.data_update.to_city;
                                $scope.item.to_district = result.data.data_update.to_district;
                                $scope.item.city_name = result.data.data_update.city_name;
                                $scope.item.district_name = result.data.data_update.district_name;
                                $scope.item.zipcode = result.data.data_update.zipcode;
                                $scope.item.country_id = result.data.data_update.country_id;
                                $scope.item.country_code = result.data.data_update.country_code;
                                $scope.item.is_global = result.data.data_update.is_global;



                                if (!result.data.error) {
                                    $scope.item.active = 0;
                                    $scope.item.status = 'NOT ACTIVE';
                                    modalInstance.close({
                                        'action': 'close',
                                        'data': $scope.item
                                    })
                                    // if (result.data.city_name && result.data.district_name) {
                                    //     $scope.check_box.push(result.data.data);
                                    //     $scope.total_disabled -= 1;
                                    // }
                                }
                            });
                            return true;
                        }

                        $scope.close = function () {
                            modalInstance.dismiss('cancel');
                        }

                    },
                    size: 'md',
                    resolve: {
                        item: function () {
                            return item;
                        }
                    }
                })

                modalInstance.result.then(function (res) {
                    $scope.list_data[key] = res.data;
                }, function () {

                });
            }

            $scope.edit_product_info = function (item, key, list_products) {
                var modalInstance = $modal.open({
                    templateUrl: 'EditProductInfo.html',
                    controller: function ($scope, $filter, $rootScope, loginService, $http, $state, CurencyExchange, $stateParams, $timeout, $modal, AppStorage, Location, Inventory, Order, ConfigShipping, PhpJs, toaster, $localStorage, WarehouseRepository) {
                        $scope.item = angular.copy(item);
                        $scope.list_products = angular.copy(list_products);
                        $scope.defaultphone = item.to_phone;
                        $scope._boxme = {
                            selected_item: null,
                            Items: []
                        }
                        $scope.Product = {
                            Name: $scope.item.item_name ? $scope.item.item_name : "",
                            Quantity: $scope.item.item_qty ? $scope.item.item_qty : "",
                            Price: $scope.item.item_price ? $scope.item.item_price : "",
                            Weight: $scope.item.item_weight ? $scope.item.item_weight : "",
                            Code: $scope.item.order_code ? $scope.item.order_code : "",
                            Description: $scope.item.item_desc ? $scope.item.item_desc : "",
                            BoxSize: {

                            }
                        };

                        if ($scope.item.size) {
                            var size = $scope.item.size.split('x');
                            $scope.Product.BoxSize.L = size[0];
                            $scope.Product.BoxSize.W = size[1];
                            $scope.Product.BoxSize.H = size[2];
                        }

                        function get_boxsize(data) {
                            if (data.L != undefined && data.L != '' &&
                                data.W != undefined && data.W != '' &&
                                data.H != undefined && data.H != '') {
                                var long = data.L.toString().replace(/,/gi, "");
                                var width = data.W.toString().replace(/,/gi, "");
                                var height = data.H.toString().replace(/,/gi, "");

                                return long + 'x' + width + 'x' + height;
                            } else {
                                return '';
                            }
                        }


                        $scope.AddItem = function (item, all = false) {
                            item.Quantity = item.Quantity ? item.Quantity : 1;
                            item = angular.copy(item);
                            if (check_item_box(item) == false) {
                                $scope._boxme.Items.push(item);
                                if (all) {
                                    angular.forEach($scope._boxme.Items, function (value) {
                                        if (value.SellerBSIN.toString() == item.SellerBSIN.toString()) {
                                            value.Quantity = value.AvailableItem ? value.AvailableItem : 1;
                                        }
                                    });
                                }
                            } else {
                                angular.forEach($scope._boxme.Items, function (value) {
                                    if (value.SellerBSIN.toString() == item.SellerBSIN.toString()) {
                                        value.Quantity = value.Quantity + 1;
                                    }
                                });
                            }

                            $scope._boxme.ItemChange()
                        }

                        $scope._boxme.ItemChange = function () {
                            if ($scope._boxme.Items && $scope._boxme.Items.length > 0) {

                                $scope._boxme.TotalItemAmount = 0;
                                $scope._boxme.TotalItemQuantity = 0;
                                $scope._boxme.TotalItemWeight = 0;
                                $scope._boxme.ItemsName = "";

                                var names = [];
                                var skus = [];
                                var qtys = [];
                                var order_items = [];
                                angular.forEach($scope._boxme.Items, function (value) {
                                    var order_item = {};
                                    order_item.sku = value.SellerBSIN;
                                    order_item.quantity = value.Quantity;
                                    names.push(value.ProductName);
                                    order_items.push(order_item);
                                    skus.push(value.SellerBSIN);
                                    qtys.push(value.Quantity);
                                    $scope._boxme.TotalItemAmount += value.PriceItem * (value.Quantity * 1)
                                    $scope._boxme.TotalItemQuantity += parseInt(value.Quantity);
                                    if (value.WeightPacked >= value.WeightItem) {
                                        $scope._boxme.TotalItemWeight += parseInt(value.WeightPacked) * parseInt(value.Quantity);
                                    } else {
                                        $scope._boxme.TotalItemWeight += parseInt(value.WeightItem) * parseInt(value.Quantity);
                                    }
                                })

                                $scope._boxme.ItemsName = names.join(',');
                                $scope._boxme.ItemsSKU = skus.join(',');
                                $scope._boxme.ItemQty = qtys.join(',');
                                $scope._boxme.OrderItems = order_items;

                            } else {
                                $scope._boxme.TotalItemAmount = 0;
                                $scope._boxme.TotalItemQuantity = 0;
                                $scope._boxme.TotalItemWeight = 0;
                                $scope._boxme.ItemsName = "";
                                $scope._boxme.OrderItems = [];
                            }
                        }

                        $scope._boxme.remoteProductItem = function (item) {
                            if (item) {
                                $scope._boxme.Items.splice($scope._boxme.Items.indexOf(item), 1)
                                $scope._boxme.ItemChange();
                            }
                        }

                        var check_item_box = function (item) {
                            var check_item = false
                            if (item && item.SellerBSIN) {
                                angular.forEach($scope._boxme.Items, function (value) {
                                    if (value.SellerBSIN.toString() == item.SellerBSIN.toString()) {
                                        check_item = true;
                                    }
                                });
                            }
                            return check_item;
                        }

                        $scope.close = function () {
                            modalInstance.dismiss('cancel');
                        }

                        angular.forEach($scope.item.order_items, function (value) {
                            if (value.sku) {
                                angular.forEach($scope.list_products, function (item) {
                                    if (value.sku.toString() == item.SellerBSIN.toString()) {
                                        item.Quantity = value.quantity;
                                        $scope.AddItem(item)
                                    }
                                })
                            }

                        })



                        $scope.save = function (check_inventory_boxme) {
                            $scope.frm = {};
                            var size = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize) : "";
                            if (size) {
                                $scope.frm.size = size;
                            }
                            if (!check_inventory_boxme) {
                                $scope.frm.item_name = $scope.Product.Name ? $scope.Product.Name : null;
                                $scope.frm.item_qty = $scope.Product.Quantity ? $scope.Product.Quantity : null;
                                $scope.frm.item_price = $scope.Product.Price ? $scope.Product.Price : null;
                                $scope.frm.item_weight = $scope.Product.Weight ? $scope.Product.Weight : null;
                                $scope.frm.order_code = $scope.Product.Code ? $scope.Product.Code : null;
                                $scope.frm.item_desc = $scope.Product.Description ? $scope.Product.Description : null;

                                if (!$scope.frm.item_name) {
                                    return toaster.pop('warning', 'Bạn chưa nhập tên sản phẩm !');
                                }
                                if (!$scope.frm.item_qty) {
                                    return toaster.pop('warning', 'Bạn chưa nhập số lượng');
                                }
                                if (!$scope.frm.item_price) {
                                    return toaster.pop('warning', 'Bạn chưa nhập giá sản phẩm');
                                }
                                if (!$scope.frm.item_weight) {
                                    return toaster.pop('warning', 'Bạn chưa nhập khối lượng');
                                }

                            } else {

                                $scope.frm.item_name = $scope._boxme.ItemsName ? $scope._boxme.ItemsName : null;
                                $scope.frm.item_qty = $scope._boxme.ItemQty ? $scope._boxme.ItemQty : null;
                                $scope.frm.item_sku = $scope._boxme.ItemsSKU ? $scope._boxme.ItemsSKU : null;
                                $scope.frm.item_price = $scope._boxme.TotalItemAmount ? $scope._boxme.TotalItemAmount : null;
                                $scope.frm.item_weight = $scope._boxme.TotalItemWeight ? $scope._boxme.TotalItemWeight : null;
                                $scope.frm.order_code = $scope.Product.Code ? $scope.Product.Code : null;
                                $scope.frm.item_desc = $scope.Product.Description ? $scope.Product.Description : null;
                                $scope.frm.order_items = $scope._boxme.OrderItems ? $scope._boxme.OrderItems : [];

                            }
                            $scope.frm.type_store = item.type_store;

                            StoreOrderConnect.ChangeExcel($scope.frm, item.partner).then(function (result) {
                                $scope.item.item_name = result.data.data_update.item_name ? result.data.data_update.item_name : "";
                                $scope.item.item_qty = result.data.data_update.item_qty ? result.data.data_update.item_qty : "";
                                $scope.item.item_price = result.data.data_update.item_price ? result.data.data_update.item_price : "";
                                $scope.item.item_weight = result.data.data_update.item_weight ? result.data.data_update.item_weight : "";
                                $scope.item.order_code = result.data.data_update.order_code ? result.data.data_update.order_code : "";
                                $scope.item.item_desc = result.data.data_update.item_desc ? result.data.data_update.item_desc : "";
                                $scope.item.order_items = result.data.data_update.order_items ? result.data.data_update.order_items : "";
                                $scope.item.item_sku = result.data.data_update.item_sku ? result.data.data_update.item_sku : "";
                                $scope.item.item_qty = result.data.data_update.item_qty ? result.data.data_update.item_qty : "";
                                $scope.item.size = result.data.data_update.size ? result.data.data_update.size : "";
                                $scope.item.name_str = "";
                                if (!result.data.error) {
                                    $scope.item.active = 0;
                                    $scope.item.status = 'NOT ACTIVE';
                                    modalInstance.close({
                                        'action': 'close',
                                        'data': $scope.item
                                    })
                                    // if (result.data.city_name && result.data.district_name) {
                                    //     $scope.check_box.push(result.data.data);
                                    //     $scope.total_disabled -= 1;
                                    // }
                                }
                            });

                            return true;
                        }
                    },
                    size: 'lg',
                    resolve: {
                        item: function () {
                            return item;
                        }
                    }
                })

                modalInstance.result.then(function (res) {
                    $scope.list_data[key] = res.data;
                }, function () {
                });
            }

            $scope.edit_service = function (item, key, list_courier, list_inventory) {
                var modalInstance = $modal.open({
                    templateUrl: 'EditService.html',
                    controller: function ($scope, $filter, $rootScope, loginService, $http, $state, CurencyExchange, $stateParams, $timeout, $modal, AppStorage, Location, Inventory, Order, ConfigShipping, PhpJs, toaster, $localStorage, WarehouseRepository) {
                        $scope.show_inputCouponCode = false;
                        $scope.list_courier = angular.copy(list_courier);
                        $scope.item = angular.copy(item);

                        $scope.Config = {
                            Type: $scope.item.vas ? $scope.item.vas : null,
                            Service: 0,
                            Checking: $scope.item.checking ? $scope.item.checking : 2,
                            Fragile: $scope.item.fragile ? $scope.item.fragile : 2,
                            Protected: $scope.item.protected ? $scope.item.protected : 2,
                            Coupon_code: $scope.item.coupon_code ? $scope.item.coupon_code : null

                        }
                        $scope.Product = {
                            MoneyCollect: $scope.item.collect ? $scope.item.collect : 0
                        }

                        $scope.show_CouponCode = function (check) {
                            $scope.show_inputCouponCode = check;
                        }

                        var list_services_en = [
                            {
                                id: 7,
                                name: 'Giao trong ngày (SD)',
                                name_en: 'Sameday sevice (SD)',
                                group: 'Nội tỉnh',
                                group_en: 'Urban',
                                icons: 'fa-motorcycle',
                                note: 'Lấy sáng giao chiều  - Lấy chiều giao sáng hôm sau',
                                note_en: 'Same day delivery if pickup on morning, delivery next day if pickup on afternoon'
                            },
                            {
                                id: 4,
                                name: 'Giao qua ngày (ND)',
                                name_en: 'Next day service (ND)',
                                group: 'Nội tỉnh',
                                group_en: 'Urban',
                                icons: 'fa-motorcycle',
                                note: 'Lấy trong ngày - giao ngày hôm sau',
                                note_en: 'Same day pickup, delivery on next day'
                            }, {
                                id: 2,
                                name: 'Chuyển phát nhanh (CN)',
                                name_en: 'Express delivery service (CN)',
                                group: 'Liên tỉnh',
                                group_en: 'Interprovincial',
                                icons: 'fa-plane',
                                note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en: 'Same day pickup and delivery by SLA'
                            },
                            {
                                id: 1,
                                name: 'Chuyển phát tiết kiệm (TK)',
                                name_en: 'Economy delivery service (TK)',
                                group: 'Liên tỉnh',
                                group_en: 'Interprovincial',
                                icons: 'fa-truck',
                                note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en: 'Same day pickup and delivery by SLA'
                            },
                            {
                                id: 11,
                                name: 'Chuyển phát tiết kiệm EMS',
                                name_en: 'Chuyển phát tiết kiệm EMS',
                                group: 'Liên tỉnh',
                                group_en: 'Interprovincial',
                                icons: ' fa-car',
                                note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en: 'Same day pickup and delivery by SLA'
                            }
                        ];
                        var service_bm = [
                            {
                                id: 12,
                                name: 'Marketplace Fulfillment',
                                name_en: 'Marketplace Fulfillment',
                                group: 'Boxme Fulfillment',
                                group_en: 'Boxme Fulfillment',
                                icons: 'fa-car',
                                note: 'Đóng gói & giao tới trung tâm xử lý đơn hàng của sàn TMDT (Lazada, Robins...)',
                                note_en: 'Pack & delivery to marketplace distributor (Lazada, Robins...)'
                            },
                            {
                                id: 6,
                                name: 'Xuất hàng tại kho (XK)',
                                name_en: 'Export at Warehouse (XK)',
                                group: 'Boxme Fulfillment',
                                group_en: 'Boxme Fulfillment',
                                icons: 'fa-home',
                                note: 'Đóng gói và giao khi khách đến',
                                note_en: 'Package and delivery when customer arrive'
                            }]

                        var service_zalo = [{
                            id: 14,
                            name: 'Zalo Flash Sale',
                            name_en: 'Zalo Flash Sale',
                            group: 'Boxme Fulfillment',
                            group_en: 'Boxme Fulfillment',
                            icons: 'fa-plane',
                            note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                            note_en: 'Same day pickup and delivery by SLA'
                        }]


                        var _arrNoiTinh = [3, 4, 7]
                        var _arrLienTinh = [1, 2]

                        var item_inventory = {};

                        $scope.$watch('keyLang', function (newVal, OldVal) {
                            angular.forEach(list_inventory, function (value, key) {
                                if (value.id == item.inventory) {
                                    item_inventory = value;
                                }
                            });
                            $scope.list_services = list_services_en;
                            if ($scope.item.to_city) {
                                if (parseInt($scope.item.to_city) == parseInt(item_inventory.city_id)) {
                                    _getService(true) //noi tinh 
                                } else {
                                    _getService(false) //lien tinh
                                }
                            } else {
                                if ($scope.item.boxme_inventory) {
                                    //$scope.list_services.push(service_bm)
                                    angular.forEach(service_bm, function (value) {
                                        if ($scope.list_services.indexOf(value) < 0) {
                                            $scope.list_services.push(value)
                                        }
                                    })
                                    if ($rootScope.userInfo.id && ([217203, 87834].indexOf($rootScope.userInfo.id) >= 0)) {
                                        angular.forEach(service_zalo, function (value) {
                                            //if(value.group_en.toString() == "Interprovincial"){
                                            if ($scope.list_services.indexOf(value) < 0) {
                                                $scope.list_services.push(value)
                                            }
                                            //}
                                        })
                                    };
                                }

                            }

                            if ($scope.item.country_id !== 237) {
                                $scope.disabled_service = true;
                                angular.forEach($scope.list_services_global, function (value, key) {
                                    if (value.id == $scope.item.service) {
                                        $scope.Config.Service = value.id;
                                    }
                                });
                            } else {
                                $scope.disabled_service = false;
                                angular.forEach($scope.list_services, function (value, key) {
                                    if (value.id == $scope.item.service) {
                                        $scope.Config.Service = value.id;
                                    }
                                });
                            }
                        });

                        var _getService = function (isNoiTinh) {
                            //$scope.list_services =  list_services_en;//$rootScope.keyLang =='en' ? list_services_en : list_services_vi;
                            if (isNoiTinh) {
                                if ($scope.Config.Service && _arrNoiTinh.length >= 1 && _arrNoiTinh.indexOf($scope.Config.Service) < 0) {
                                    $scope.Config.Service = $scope.list_services[0].id
                                }

                            } else {
                                var list_services_temp = [];
                                angular.forEach($scope.list_services, function (value) {
                                    if (value.group_en.toString() == "Interprovincial") {
                                        list_services_temp.push(value)
                                    }
                                })
                                $scope.list_services = list_services_temp;
                                list_services_temp = [];
                                if ($scope.Config.Service && _arrLienTinh.length >= 1 && _arrLienTinh.indexOf($scope.Config.Service) < 0) {
                                    $scope.Config.Service = $scope.list_services[0].id
                                }
                            }
                            if ($scope.item.boxme_inventory && $scope.list_services.indexOf(service_bm) < 0) {
                                angular.forEach(service_bm, function (value) {
                                    if ($scope.list_services.indexOf(value) < 0) {
                                        $scope.list_services.push(value)
                                    }
                                })
                            }
                            if ($rootScope.userInfo.id && ([217203, 87834].indexOf($rootScope.userInfo.id) >= 0)) {
                                angular.forEach(service_zalo, function (value) {
                                    //if(value.group_en.toString() == "Interprovincial"){
                                    if ($scope.list_services.indexOf(value) < 0) {
                                        $scope.list_services.push(value)
                                    }
                                    //}
                                })
                            }
                            // xuat hang khoi kho
                            if ($rootScope.orderProductSelected && $rootScope.orderProductSelected.list_sku && $rootScope.orderProductSelected.list_sku.length >= 1) {
                                var list_services_temp = []
                                angular.forEach($scope.list_services, function (value) {
                                    if (value.group_en.toString() == "Interprovincial" && value.id != 11) {
                                        list_services_temp.push(value)
                                    }
                                })
                                var service_bm_vt = {
                                    id: 5,
                                    name: 'Dịch vụ vận tải (VT)',
                                    name_en: 'Cargo Service (VT)',
                                    group: 'Liên tỉnh',
                                    group_en: 'Interprovincial',
                                    icons: 'fa-truck',
                                    note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en: 'Same day pickup and delivery by SLA'
                                }
                                list_services_temp.push(service_bm_vt)
                                $scope.list_services = list_services_temp;
                                $scope.Config.Service = 1; // mac dinh chuyen phat tiet kiem
                                list_services_temp = [];
                            }
                            // end list service xuat hang khoi kho
                        }

                        $scope.list_services_global = [
                            {
                                id: 8,
                                name: 'Chuyển phát nhanh quốc tế',
                                name_en: 'International Express',
                                icons: 'fa-plane',
                                note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en: 'Same day pickup and delivery by SLA'

                            },
                            {
                                id: 9,
                                name: 'Chuyển phát tiết kiệm quốc tế',
                                name_en: 'International Economy',
                                icons: 'fa-truck',
                                note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en: 'Same day pickup and delivery by SLA'

                            }
                        ];

                        if ($rootScope.userInfo.id && ([2, 87834, 87695].indexOf($rootScope.userInfo.id) >= 0)) {
                            $scope.list_services_global = [
                                {
                                    id: 8,
                                    name: 'Chuyển phát nhanh quốc tế',
                                    name_en: 'International Express',
                                    icons: 'fa-plane',
                                    note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en: 'Same day pickup and delivery by SLA'

                                },
                                {
                                    id: 9,
                                    name: 'Chuyển phát tiết kiệm quốc tế',
                                    name_en: 'International Economy',
                                    icons: 'fa-truck',
                                    note: 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en: 'Same day pickup and delivery by SLA'

                                }, {
                                    id: 15,
                                    name: 'Small Package Saver',
                                    name_en: 'Small Package Saver',
                                    icons: ' fa-car',
                                    note: 'Boxme sẽ đóng gói và gom hàng tại Việt Nam và giao qua USPS. ',
                                    note_en: 'Boxme will pack and consolidate in VietNam and delivery by USPS'
                                }
                            ];

                        };

                        $scope.disabled_service = false;




                        angular.forEach($scope.list_courier, function (value, key) {
                            if (value.id == $scope.item.courier) {
                                $scope.Config.Courier = value;
                            }
                        });

                        $scope.close = function () {
                            modalInstance.dismiss('cancel');
                        }

                        $scope.save = function (check_inventory_boxme) {
                            $scope.frm = {};
                            $scope.frm.vas = $scope.Config.Type ? $scope.Config.Type : null;
                            $scope.frm.service = $scope.Config.Service ? $scope.Config.Service : null;
                            $scope.frm.courier = $scope.Config.Courier ? $scope.Config.Courier.id : null;
                            $scope.frm.checking = $scope.Config.Checking ? $scope.Config.Checking : null;
                            $scope.frm.fragile = $scope.Config.Fragile ? $scope.Config.Fragile : null;
                            $scope.frm.protected = $scope.Config.Protected ? $scope.Config.Protected : null;
                            $scope.frm.coupon_code = $scope.Config.Coupon_code ? $scope.Config.Coupon_code : null;
                            $scope.frm.type_store = item.type_store;
                            if ($scope.Config.Type == 1) {
                                if (!$scope.Product.MoneyCollect) {
                                    return toaster.pop('warning', 'Bạn chưa nhập tiền thu hộ !');
                                } else {
                                    $scope.frm.collect = $scope.Product.MoneyCollect ? $scope.Product.MoneyCollect : null;
                                }
                            }

                            if (!$scope.frm.vas) {
                                return toaster.pop('warning', 'Bạn chưa chọn vụ vas !');
                            }
                            if (!$scope.frm.service) {
                                return toaster.pop('warning', 'Bạn chưa chọn dịch vụ');
                            }
                            if (!$scope.frm.courier) {
                                return toaster.pop('warning', 'Bạn chưa chọn hãng vận chuyển');
                            }
                            StoreOrderConnect.ChangeExcel($scope.frm, item.partner).then(function (result) {
                                $scope.item.vas = result.data.data_update.vas ? result.data.data_update.vas : "";
                                $scope.item.service = result.data.data_update.service ? result.data.data_update.service : "";
                                $scope.item.courier = result.data.data_update.courier ? result.data.data_update.courier : "";
                                $scope.item.collect = result.data.data_update.collect ? result.data.data_update.collect : "";
                                $scope.item.checking = result.data.data_update.checking ? result.data.data_update.checking : "";
                                $scope.item.fragile = result.data.data_update.fragile ? result.data.data_update.fragile : "";
                                $scope.item.protected = result.data.data_update.protected ? result.data.data_update.protected : "";
                                $scope.item.coupon_code = result.data.data_update.coupon_code ? result.data.data_update.coupon_code : "";

                                if (!result.data.error) {
                                    $scope.item.active = 0;
                                    $scope.item.status = 'NOT ACTIVE';
                                    modalInstance.close({
                                        'action': 'close',
                                        'data': $scope.item
                                    })
                                    // if (result.data.city_name && result.data.district_name) {
                                    //     $scope.check_box.push(result.data.data);
                                    //     $scope.total_disabled -= 1;
                                    // }
                                }
                            });

                            return true;
                        }
                    },
                    size: 'md',
                    resolve: {
                        item: function () {
                            return item;
                        }
                    }
                })

                modalInstance.result.then(function (res) {
                    $scope.list_data[key] = res.data;
                }, function () {
                });
            }

        }]);