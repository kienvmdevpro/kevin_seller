'use strict';

//List Order
angular.module('app').controller('CreateExcelCtrl',
    ['$scope', '$rootScope', '$filter', 'AppStorage', '$http', '$state', '$window', '$stateParams', 'toaster', 'Order', 'Location', 'OrderStatus', 'Inventory', 'Config_Status', '$timeout', 'Analytics', 'WarehouseRepository', '$modal',
        function ($scope, $rootScope, $filter, AppStorage, $http, $state, $window, $stateParams, toaster, Order, Location, OrderStatus, Inventory, Config_Status, $timeout, Analytics, WarehouseRepository, $modal) {
            // Config
            var tran = $filter('translate');
            if (!$stateParams.id.length) {
                $state.go('app.dashboard');
            }
            AppStorage.loadDistrict();
            $scope.list_district_all = {};
            if (AppStorage.districts && AppStorage.districts.length >= 1) {
                angular.forEach(AppStorage.districts, function (value) {
                    $scope.list_district_all[value.id] = value;
                });
            }
            Analytics.trackPage('/create_order/file/step3');

            $scope.list_data = {};
            $scope.list_city = {};
            $scope.list_inventory = {};  // kho hàng
            $scope.Inventory = {};
            $scope.list_district = {};
            $scope.check_box = [];
            $scope.list_tracking_code = [];
            $scope.list_products = [];
            $scope.check_load_product = false;

            //$scope.list_status = Config_Status.ExcelOrder;
            //            $scope.service = $rootScope.keyLang=="en" ? OrderStatus.service_en: OrderStatus.service;
            //            
            //            $scope.list_service =  $rootScope.keyLang=="en" ? OrderStatus.list_service_en :OrderStatus.list_service;
            //            $scope.pay_pvc = $rootScope.keyLang=="en" ? OrderStatus.pay_pvc_en :OrderStatus.pay_pvc;
            //            $scope.list_pay_pvc = $rootScope.keyLang=="en" ? OrderStatus.list_pay_pvc_en :OrderStatus.list_pay_pvc;
            //            $scope.$watch('keyLang', function (Value, OldValue) {
            //              $scope.service      = (Value =="en") ? OrderStatus.service_en   : OrderStatus.service;
            //              $scope.list_service =(Value =="en") ? OrderStatus.list_service_en   : OrderStatus.list_service;
            //              $scope.pay_pvc =(Value =="en") ? OrderStatus.pay_pvc_en     : OrderStatus.pay_pvc;
            //              $scope.list_pay_pvc =(Value =="en") ? OrderStatus.list_pay_pvc_en   : OrderStatus.list_pay_pvc;
            //            });
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

            $scope.create_all = false;
            $scope.total = '';
            $scope.max = 0;
            $scope.dynamic = 0;

            $scope.checkingALL = 1;
            $scope.total_disabled = 0;

            $scope.fee = {
                Inventory: {}
            };
            $scope.all_data = [];

            $scope.counter = {
                'own_inventory': 0,
                'boxme_inventory': 0
            };
            $scope.filter_inventory = false;




            $scope.change_tab = function (inventory_boxme) {
                $scope.list_data = {};
                $scope.filter_inventory = inventory_boxme;
                $scope.loadInventory($rootScope.pos, null, function (currentInventory) {
                    if (inventory_boxme && currentInventory) {
                        $scope.processProducts(currentInventory.warehouse_code)
                    }

                });
                angular.forEach($scope.all_data, function (value, key) {

                    if (value.boxme_inventory == inventory_boxme) {
                        value.id = key;
                        $scope.list_data[key] = value;
                    }
                })
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


            $scope.item_names = {};
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

            $scope.processProducts = function (warehouse_code) {
                WarehouseRepository.GetProducts(warehouse_code, true).then(function (resp) {
                    $scope.item_names = {};
                    $scope.check_load_product = true;
                    $scope.list_products = resp.embedded().product || [];
                    angular.forEach($scope.list_data, function (value, key) {
                        checkOrderAvaliable(resp.embedded().product || [], value);
                        value.name_str = $scope.generation_item_name(value);

                    })
                });
            }

            // Get Data
            // List order
            $scope.get_location = function (item, time) {
                setTimeout(function () {
                    Order.Synonyms(item._id.$id).then(function (result) {
                        if (!result.data.error) {
                            item.to_city = result.data.city_id;
                            item.to_district = result.data.district_id;

                            if (item.to_district > 0) {
                                $scope.check_box.push(item._id.$id);
                                $scope.total_disabled -= 1;
                            }
                        }
                    });
                }, (time - 1) * 2000);
            };
            var busy = false;
            // Action
            $scope.loadInventory = function (params, q, callback) {
                if ($stateParams.bc) {
                    params = angular.extend(params, { bc: $stateParams.bc });
                }
                if (busy && !params.lat) {
                    return false;
                };

                busy = true;

                if ($scope.filter_inventory) {
                    params.source = 'boxme';
                } else {
                    params.source = 'shipchung';
                }

                Inventory.loadWithPostOffice(params).then(function (result) {
                    busy = false;
                    if (result) {
                        $scope.list_inventory = result.data.data;

                        if ($stateParams.bc && $stateParams.bc !== "" && $stateParams.bc !== null && $stateParams.bc !== undefined) {
                            result.data.data.forEach(function (value) {
                                if (value.id == $stateParams.bc) {
                                    $scope.fee.Inventory = value;
                                };
                            })

                        } else {
                            $scope.fee.Inventory = $scope.list_inventory[0];
                        }

                        if (callback && typeof callback == 'function') {
                            callback($scope.fee.Inventory);
                        }

                    }
                });
            }
            var _get_service_item = function (data) {
                if (busy) {
                    $timeout(function () {
                        _get_service_item(data);
                    }, 500);
                } else {
                    angular.forEach(data, function (value, key) {
                        value.list_service = []
                        if (value.to_city > 0) {
                            if (parseInt($scope.fee.Inventory.city_id) == parseInt(value.to_city)) {
                                value.list_service = $scope.list_service
                            } else {
                                var list_service_temp = [];
                                angular.forEach($scope.list_service, function (item) {
                                    if ([1, 2].indexOf(item.id) >= 0) {
                                        list_service_temp.push(item)
                                    }
                                })
                                if ([217203, 87834,69406,2].indexOf($rootScope.userInfo.id) >= 0) {
                                    angular.forEach($scope.list_service, function (item) {
                                        if ([14].indexOf(item.id) >= 0) {
                                            list_service_temp.push(item)
                                        }
                                    })
                                }
                                value.list_service = list_service_temp;
                            }
                        }
                    });
                }
            }
            Order.ListExcel($stateParams.id, 1, 'ALL').then(function (result) {
                $scope.counter = {
                    'own_inventory': 0,
                    'boxme_inventory': 0
                };
                //$scope.list_data = result.data.data;
                $scope.total = result.data.total;
                $scope.all_data = result.data.data;

                $scope.change_tab($scope.filter_inventory);
                angular.forEach($scope.all_data, function (value, key) {

                    if (value.boxme_inventory) {
                        $scope.counter.boxme_inventory += 1;
                    } else {
                        $scope.counter.own_inventory += 1;
                    }
                    // Tinh khoi luong lazada
                    if (value['products']) {
                        var weight = 0;
                        angular.forEach(value['order_items'], function (value2, key2) {
                            angular.forEach(value['products']['Products'], function (value3, key3) {
                                angular.forEach(value3['Skus'], function (value4, key4) {
                                    if (value4['SellerSku'] == value2['sku']) {
                                        weight += value4['package_weight'] * 1;
                                    }
                                });
                            });
                            $scope.all_data[key].item_weight = weight; // gam
                        });

                    }

                    //

                    if (value.currency && value.currency != 'VND') {
                        $scope.all_data[key].item_price = 0;
                        $scope.all_data[key].collect = 0;
                    }

                    if (value.to_city == 0 || value.to_district == 0) {
                        $scope.total_disabled += 1;
                        if (!value.zipcode || value.zipcode == '') {
                            $scope.get_location(value, $scope.total_disabled);
                        } else {
                            $scope.total_disabled -= 1;
                            $scope.check_box.push(value._id.$id);
                        }

                    }

                });
                _get_service_item($scope.all_data);

                $scope.toggleSelectionAll(1);
            });

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
                        if (value.active == 0 && (value.to_city > 0)) {
                            $scope.check_box.push(key);
                        }
                    });
                }


            }

            $scope.$watchCollection('check_box', function (newdata, olddata) {
                $scope.max = newdata.length;
            });




            $scope.$watch('fee.Inventory', function (inventory) {
                if ($scope.filter_inventory && inventory) {
                    $scope.processProducts(inventory.warehouse_code)
                }
            })

            $rootScope.pos = {};

            function success(pos) {
                var crd = pos.coords;
                $rootScope.pos = {
                    lat: crd.latitude,
                    lng: crd.longitude
                };

                $scope.loadInventory($rootScope.pos, null);
            };

            function error(err) {
                $scope.loadInventory($rootScope.pos, null);
            };

            navigator.geolocation.getCurrentPosition(success, error, {});

            // get list city
            Location.province('all').then(function (result) {
                $scope.list_city = result.data.data;
                angular.forEach($scope.list_city, function (value) {
                    $scope.list_district[value.id] = {};
                });
            });

            // Action
            $scope.edit_item = function (item) {
                if (!item.courier) {
                    $scope.list_courier[0] = { id: 0, name: tran('OBG_ChuachonHVC') };
                    item.courier = 0;
                }
                var check = false;
                if (item.boxme_inventory) {
                    check = true;
                }
                if (item.to_city > 0) {
                    if (parseInt($scope.fee.Inventory.city_id) == parseInt(item.to_city)) {
                        item.list_service = $scope.list_service
                    } else {
                        var list_service_temp = [];
                        angular.forEach($scope.list_service, function (item_service) {
                            if ([1, 2].indexOf(item_service.id) >= 0) {
                                list_service_temp.push(item_service)
                            }
                            // if(check && [6,12,15].indexOf(item_service.id)){
                            //     list_service_temp.push(item_service)
                            // }
                        })

                        item.list_service = $scope.list_service
                    }
                }
            }

            $scope.loadDistrict = function (city_id) {
                if (city_id > 0 && !$scope.list_district[city_id][0]) {
                    Location.district(city_id, 'all').then(function (result) {
                        if (result) {
                            if (!result.data.error) {
                                $scope.list_district[city_id] = result.data.data;
                            }
                        }
                        return;
                    });
                }
                return;
            }

            $scope.change_city = function (id, item) {
                if (id > 0) {
                    if (parseInt($scope.fee.Inventory.city_id) == parseInt(id)) {
                        item.list_service = $scope.list_service
                    } else {
                        var list_service_temp = [];
                        angular.forEach($scope.list_service, function (item) {
                            if ([1, 2].indexOf(item.id) >= 0) {
                                list_service_temp.push(item)
                            }
                        })
                        item.list_service = list_service_temp;
                    }
                }
                item.to_city = id;
                $scope.loadDistrict(id);
            }

            $scope.save = function (data, item, key) {
                data.checking = item.checking;
                if (item.service) {
                    data.service = item.service;
                }
                Order.ChangeExcel(data, key).then(function (result) {
                    $scope.list_data[key].city_name = result.data.city_name;
                    $scope.list_data[key].district_name = result.data.district_name;
                    if (!result.data.error) {
                        $scope.list_data[key].active = 0;
                        $scope.list_data[key].status = 'NOT ACTIVE';
                        if (result.data.city_name && result.data.district_name) {
                            $scope.check_box.push(result.data.data);
                            $scope.total_disabled -= 1;
                        }
                    }
                });
                return true;
            }

            $scope.checkdata = function (data) {
                if (data == '' || data == undefined) {
                    if ($rootScope.keyLang == "en") {
                        return "Data null";
                    } else {
                        return "Dữ liệu trống";
                    }

                }
            };

            $scope.check_district = function (data, city_id) {
                if (data == '' || data == undefined || data == 0) {
                    return "Bạn chưa chọn quận huyện !";
                }

                if (!checkDistrictInCity(data, city_id)) {
                    return "Bạn chưa chọn quận huyện !";
                }
                return;
            }

            var checkDistrictInCity = function (district_id, city_id) {
                if ($scope.list_district[city_id]) {
                    var check = false;
                    angular.forEach($scope.list_district[city_id], function (value) {
                        if (value.id == district_id) {
                            check = true;
                            return;
                        }
                    });
                    return check;
                } else {
                    return true;
                }

            }

            $scope.remove = function (key) {
                Order.RemoveExcel(key).then(function (result) {
                    if (!result.data.error) {
                        delete $scope.list_data[key];
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
                console.log($scope.fee.Inventory.id);
                if(!$scope.fee.Inventory.id){
                    return toaster.pop('warning', 'Bạn chưa chọn kho hàng !');
                }
                var stock_id = $scope.fee.Inventory.id;
                var is_postoffice = false;
                if ($scope.fee.Inventory.hasOwnProperty('post_office') && $scope.fee.Inventory.post_office == true) {
                    is_postoffice = true;
                }

                if (stock_id > 0) {

                    item.waiting_create = true;

                    Order.CreateExcel(key, stock_id, null, is_postoffice, accept, item.is_global).then(function (result) {
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
                if ($scope.fee.Inventory.hasOwnProperty('post_office') && $scope.fee.Inventory.post_office == true) {
                    is_postoffice = true;
                }

                var stock_id = $scope.fee.Inventory.id;
                if (data[num] && data[num].length > 0) {
                    Order.CreateExcel(data[num], stock_id, $scope.checkingALL, is_postoffice, accept, $scope.list_data[data[num]].is_global).then(function (result) {
                        if (!result.data.error) {
                            $scope.list_data[data[num]]['trackingcode'] = result.data.data;
                            $scope.list_data[data[num]]['active'] = 1;
                            $scope.list_data[data[num]]['status'] = 'SUCCESS';
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
                            $scope.list_data[data[num]]['active'] = 2;
                            $scope.list_data[data[num]]['status'] = 'FAIL';
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

            $scope.edit_address = function (item,key) {
                var modalInstance = $modal.open({
                    templateUrl: 'EditAddressExcel.html',
                    controller: function ($scope, $filter, $rootScope, loginService, $http, $state, CurencyExchange, $stateParams, $timeout, $modal, AppStorage, Location, Inventory, Order, ConfigShipping, PhpJs, toaster, $localStorage, WarehouseRepository) {
                        $scope.list_country = [];
                        $scope.item = angular.copy(item);
                        $scope.defaultphone = item.to_phone;
                        $scope.To = {
                            Buyer: {
                                Name        : item.to_name      ? item.to_name      : "",
                                Address     : item.to_address   ? item.to_address   : "",
                                Province    : item.to_district  ? item.to_district  : "",
                                City        : item.to_city      ? item.to_city      : "",
                                Area: {
                                },
                                Zipcode: item.zipcode ? item.zipcode : ""
                            }
                        };

                        $scope.open_sdt = function(){
                            $scope.hideopenphone = false;
                            $scope.classphone = "open";
                            $scope.openphone = $scope.openphone  == true ? false:true;
                        }
                        $scope.setcontry = function(value){
                             $scope.openphone     = false;
                             $scope.hideopenphone = true;
                             $scope.To.Buyer.Country = value;
                        }
                        $scope.show_phone2 = false;
                        $scope.show_phone_2 = function(){
                            $scope.show_phone2 = !$scope.show_phone2
                        }

                        $scope.$watch('To.Buyer.Phone', function (newVal, oldVal){
                            if(newVal && newVal.length<=5){
                                if(newVal[0] == '+'){
                                    newVal = newVal.replace("+", "");
                                    angular.forEach($scope.list_country, function (value){
                                     if(newVal.toString() == value.phone_code.toString()){
                                         $scope.To.Buyer.Country = value; 
                                     }
                                 });
                                }
                                
                            }
                         })

                        if(item.country_id==237){
                                $scope.To.Buyer.Area.district_id = item.to_district  ? item.to_district  : "";
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
                                if(value.id==item.country_id){
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
                                $scope.loadCityGlobal(newVal.id,item.city_name);
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
                                        angular.forEach($scope.list_city_global,function(value,key){
                                            if(value._id==item.to_city){
                                                $scope.To.Buyer.CityGlobal = value;
                                            }
                                        })
                                    })
                                }

                               
                            }
                        }

                        $scope.save = function () {
                            $scope.frm = {};
                            if(!$scope.To.Buyer.Phone){
                                return toaster.pop('warning', 'Bạn chưa nhập số điện thoại !');
                            }
                            if(!$scope.To.Buyer.Name){
                                return toaster.pop('warning', tran('OBG_ChuaNhapTenNguoiNhan'));
                            }
                            if(!$scope.To.Buyer.Address){
                                return toaster.pop('warning', tran('OBG_ChuaNhapDiaChiNguoiNhan'));
                            }
                            
                            if($scope.To.Buyer.Country.id != 237){
                                if(!$scope.To.Buyer.Zipcode){
                                    return toaster.pop('warning', 'Bạn chưa nhập zipcode');
                                }
                                if(!$scope.To.Buyer.CityGlobal._id){
                                    return toaster.pop('warning', 'Bạn chưa chọn thành phố');
                                }
                            }else{
                                if(!$scope.To.Buyer.Area.city_id){
                                    return toaster.pop('warning', 'Bạn chưa chọn thành phố');
                                }
                            }

                            

                            var phone = [$scope.To.Buyer.Phone.replace(/\D/g,"")];
                            if ($scope.To.Buyer.Phone2) {
                                phone.push($scope.To.Buyer.Phone2);
                            }
                            $scope.frm.to_phone        = $scope.To.Buyer.Phone                 ? phone.toString()                       : null;
                            $scope.frm.to_name         = $scope.To.Buyer.Name                  ? $scope.To.Buyer.Name                   : null;
                            $scope.frm.to_address      = $scope.To.Buyer.Address               ? $scope.To.Buyer.Address                : null;
                            $scope.frm.country_id      = $scope.To.Buyer.Country               ? $scope.To.Buyer.Country.id             : null;

                            if ($scope.To.Buyer.Country.id == 237) {
                                $scope.frm.to_city      = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.city_id : null;
                                $scope.frm.to_district  = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.district_id : null;
                                $scope.frm.city_name    = $scope.To.Buyer.Area ? $scope.To.Buyer.Area.city_name         : null;
                                $scope.frm.district_name   = $scope.To.Buyer.Area                  ? $scope.To.Buyer.Area.district_name     : null;
                                $scope.frm.is_global    =  false;
                            }else{
                                $scope.frm.to_city      = $scope.To.Buyer.CityGlobal ? $scope.To.Buyer.CityGlobal._id           : null;
                                $scope.frm.city_name    = $scope.To.Buyer.CityGlobal ? $scope.To.Buyer.CityGlobal.city_name         : null;
                                $scope.frm.is_global    =  true;
                            }
                            $scope.frm.zipcode         = $scope.To.Buyer.Zipcode               ? $scope.To.Buyer.Zipcode                : null;
                            $scope.frm.country_code    = $scope.To.Buyer.Country               ? $scope.To.Buyer.Country.country_code   : null;
                            
                            
                            

                            Order.ChangeExcel($scope.frm, key).then(function (result) {
                                $scope.item.to_phone        = result.data.data_update.to_phone;
                                $scope.item.to_name         = result.data.data_update.to_name;
                                $scope.item.to_address      = result.data.data_update.to_address;
                                $scope.item.to_city         = result.data.data_update.to_city;
                                $scope.item.to_district     = result.data.data_update.to_district;
                                $scope.item.city_name       = result.data.data_update.city_name;
                                $scope.item.district_name   = result.data.data_update.district_name;
                                $scope.item.zipcode         = result.data.data_update.zipcode;
                                $scope.item.country_id      = result.data.data_update.country_id;
                                $scope.item.country_code    = result.data.data_update.country_code;
                                $scope.item.is_global       = result.data.data_update.is_global;
                                
                                
                                
                                if (!result.data.error) {
                                    $scope.item.active = 0;
                                    $scope.item.status = 'NOT ACTIVE';
                                    modalInstance.close({
                                        'action': 'close',
                                        'data'  : $scope.item
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
                            selected_item   : null,
                            Items           : []
                        }
                        $scope.Product = {
                            Name:       $scope.item.item_name ? $scope.item.item_name : "",
                            Quantity:   $scope.item.item_qty ? $scope.item.item_qty : "",
                            Price:      $scope.item.item_price ? $scope.item.item_price : "",
                            Weight:     $scope.item.item_weight ? $scope.item.item_weight: "",
                            Code:  $scope.item.order_code ? $scope.item.order_code : "",
                            Description: $scope.item.item_desc ? $scope.item.item_desc : "",
                            BoxSize: {

                            }  
                        };

                        if($scope.item.size){
                            var size = $scope.item.size.split('x');
                            $scope.Product.BoxSize.L = size[0];
                            $scope.Product.BoxSize.W = size[1];
                            $scope.Product.BoxSize.H = size[2];
                        }

                        function get_boxsize(data){
                            if(data.L != undefined && data.L != '' &&
                                data.W != undefined && data.W!= '' &&
                                data.H != undefined && data.H != ''){
                                var long    = data.L.toString().replace(/,/gi,"");
                                var width   = data.W.toString().replace(/,/gi,"");
                                var height  = data.H.toString().replace(/,/gi,"");
                    
                                return long+'x'+width+'x'+height;
                            }else{
                                return '';
                            }
                        }


                        $scope.AddItem = function (item,all=false){
                            item.Quantity = item.Quantity ? item.Quantity : 1;
                            item            = angular.copy(item);
                            if(check_item_box(item) == false){
                                $scope._boxme.Items.push(item);
                                if(all){
                                    angular.forEach($scope._boxme.Items, function (value){
                                        if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                                            value.Quantity = value.AvailableItem ? value.AvailableItem: 1;
                                        }
                                    });
                                }
                            }else{
                                angular.forEach($scope._boxme.Items, function (value){
                                    if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                                        value.Quantity = value.Quantity + 1;
                                    }
                                });
                            }
                            
                            $scope._boxme.ItemChange()
                        }

                        $scope._boxme.ItemChange = function (){
                            if($scope._boxme.Items && $scope._boxme.Items.length >0){
                    
                                $scope._boxme.TotalItemAmount   = 0;
                                $scope._boxme.TotalItemQuantity = 0;
                                $scope._boxme.TotalItemWeight   = 0;
                                $scope._boxme.ItemsName         = "";
                                
                                var names = [];
                                var skus = [];
                                var qtys = [];
                                var order_items = [];
                                angular.forEach($scope._boxme.Items, function (value){
                                    var order_item = {};
                                    order_item.sku = value.SellerBSIN;
                                    order_item.quantity = value.Quantity;
                                    names.push(value.ProductName);
                                    order_items.push(order_item);
                                    skus.push(value.SellerBSIN);
                                    qtys.push(value.Quantity);
                                    $scope._boxme.TotalItemAmount   += value.PriceItem * (value.Quantity * 1)
                                    $scope._boxme.TotalItemQuantity += parseInt(value.Quantity);
                                    if(value.WeightPacked >= value.WeightItem){
                                        $scope._boxme.TotalItemWeight   += parseInt(value.WeightPacked) * parseInt(value.Quantity);
                                    }else{
                                        $scope._boxme.TotalItemWeight   += parseInt(value.WeightItem) * parseInt(value.Quantity);
                                    }
                                })
                    
                                $scope._boxme.ItemsName        = names.join(',');
                                $scope._boxme.ItemsSKU         = skus.join(',');
                                $scope._boxme.ItemQty          = qtys.join(',');
                                $scope._boxme.OrderItems       = order_items;
                                
                            }else {
                                $scope._boxme.TotalItemAmount   = 0;
                                $scope._boxme.TotalItemQuantity = 0;
                                $scope._boxme.TotalItemWeight   = 0;
                                $scope._boxme.ItemsName         = "";
                                $scope._boxme.OrderItems        = [];
                            }
                        }

                        $scope._boxme.remoteProductItem = function (item){
                            if(item){
                                $scope._boxme.Items.splice($scope._boxme.Items.indexOf(item), 1)
                                $scope._boxme.ItemChange();
                            }
                        }

                        var check_item_box = function(item){
                            var check_item = false
                            if (item && item.SellerBSIN){
                                 angular.forEach($scope._boxme.Items, function (value){
                                    if(value.SellerBSIN.toString() == item.SellerBSIN.toString()){
                                    check_item = true;
                                    }
                                });
                            }
                            return check_item;
                        }

                        $scope.close = function () {
                            modalInstance.dismiss('cancel');
                        }

                        angular.forEach($scope.item.order_items, function (value){
                            if(value.sku){
                                angular.forEach($scope.list_products, function (item){
                                    if(value.sku.toString() == item.SellerBSIN.toString()){
                                        item.Quantity = value.quantity;
                                        $scope.AddItem(item)
                                    }
                                })
                            }
                           
                        }) 

                       

                        $scope.save = function (check_inventory_boxme) {
                            $scope.frm = {};
                            var size   = $scope.Product.BoxSize ? get_boxsize($scope.Product.BoxSize)   : "";
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

                            Order.ChangeExcel($scope.frm, key).then(function (result) {
                                $scope.item.item_name = result.data.data_update.item_name ? result.data.data_update.item_name : "";
                                $scope.item.item_qty = result.data.data_update.item_qty ? result.data.data_update.item_qty : "";
                                $scope.item.item_price = result.data.data_update.item_price ? result.data.data_update.item_price : "";
                                $scope.item.item_weight = result.data.data_update.item_weight ? result.data.data_update.item_weight : "";
                                $scope.item.order_code = result.data.data_update.order_code ? result.data.data_update.order_code : "";
                                $scope.item.item_desc = result.data.data_update.item_desc ? result.data.data_update.item_desc : "";
                                $scope.item.order_items = result.data.data_update.order_items ? result.data.data_update.order_items : "";
                                $scope.item.item_sku = result.data.data_update.item_sku ? result.data.data_update.item_sku : "";
                                $scope.item.item_qty = result.data.data_update.item_qty ? result.data.data_update.item_qty : "";
                                $scope.item.size    = result.data.data_update.size ? result.data.data_update.size : "";
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

            $scope.edit_service = function (item, key, list_courier, fee) {
                var modalInstance = $modal.open({
                    templateUrl: 'EditService.html',
                    controller: function ($scope, $filter, $rootScope, loginService, $http, $state, CurencyExchange, $stateParams, $timeout, $modal, AppStorage, Location, Inventory, Order, ConfigShipping, PhpJs, toaster, $localStorage, WarehouseRepository) {
                        $scope.show_inputCouponCode = false;
                        $scope.list_courier = angular.copy(list_courier);
                        $scope.fee = angular.copy(fee);
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
                                id          : 7,
                                name        : 'Giao trong ngày (SD)',
                                name_en     : 'Sameday sevice (SD)',
                                group       : 'Nội tỉnh',
                                group_en    : 'Urban',
                                icons       : 'fa-motorcycle',
                                note        : 'Lấy sáng giao chiều  - Lấy chiều giao sáng hôm sau',
                                note_en     : 'Same day delivery if pickup on morning, delivery next day if pickup on afternoon'
                            },
                            {
                                id          : 4,
                                name        : 'Giao qua ngày (ND)',
                                name_en     : 'Next day service (ND)',
                                group       : 'Nội tỉnh',
                                group_en    : 'Urban',
                                icons       : 'fa-motorcycle',
                                note        : 'Lấy trong ngày - giao ngày hôm sau',
                                note_en     : 'Same day pickup, delivery on next day'
                            },{
                                id          : 2,
                                name        : 'Chuyển phát nhanh (CN)',
                                name_en	    : 'Express delivery service (CN)',
                                group       : 'Liên tỉnh',
                                group_en    : 'Interprovincial',
                                icons       : 'fa-plane',
                                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en     : 'Same day pickup and delivery by SLA'
                            },
                            {
                                id          : 1,
                                name        : 'Chuyển phát tiết kiệm (TK)',
                                name_en	    : 'Economy delivery service (TK)',
                                group       : 'Liên tỉnh',
                                group_en    : 'Interprovincial',
                                icons       : 'fa-truck',
                                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en     : 'Same day pickup and delivery by SLA'
                            },
                            {
                                id          : 11,
                                name        : 'Chuyển phát tiết kiệm EMS',
                                name_en	    : 'Chuyển phát tiết kiệm EMS',
                                group       : 'Liên tỉnh',
                                group_en    : 'Interprovincial',
                                icons       : ' fa-car',
                                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en     : 'Same day pickup and delivery by SLA'
                            }
                        ];
                        var service_bm = [
                            {
                                id          : 12,
                                name        : 'Marketplace Fulfillment',
                                name_en	    : 'Marketplace Fulfillment',
                                group       : 'Boxme Fulfillment',
                                group_en    : 'Boxme Fulfillment',
                                icons       : 'fa-car',
                                note        : 'Đóng gói & giao tới trung tâm xử lý đơn hàng của sàn TMDT (Lazada, Robins...)',
                                note_en     : 'Pack & delivery to marketplace distributor (Lazada, Robins...)'
                            },
                            {
                                id          : 6,
                                name        : 'Xuất hàng tại kho (XK)',
                                name_en	    : 'Export at Warehouse (XK)',
                                group       : 'Boxme Fulfillment',
                                group_en    : 'Boxme Fulfillment',
                                icons       : 'fa-home',
                                note        : 'Đóng gói và giao khi khách đến',
                                note_en     : 'Package and delivery when customer arrive'
                            }]
                                            
                        var service_zalo = [{
                                            id          : 14,
                                            name        : 'Zalo Flash Sale',
                                            name_en	    : 'Zalo Flash Sale',
                                            group       : 'Boxme Fulfillment',
                                            group_en    : 'Boxme Fulfillment',
                                            icons       : 'fa-plane',
                                            note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                            note_en     : 'Same day pickup and delivery by SLA'
                                        }] 
                              
                                       
                        var _arrNoiTinh     = [3,4,7]
                        var _arrLienTinh    = [1,2]

                        $scope.$watch('keyLang', function (newVal, OldVal){
                            $scope.list_services =  list_services_en; 
                            if($scope.item.to_city){
                                if(parseInt($scope.item.to_city) ==  parseInt($scope.fee.Inventory.city_id)){
                                    _getService(true) //noi tinh 
                                }else{
                                    _getService(false) //lien tinh
                                }
                            }else{
                                if($scope.item.boxme_inventory){
                                    //$scope.list_services.push(service_bm)
                                    angular.forEach(service_bm, function (value){
                                        if($scope.list_services.indexOf(value)<0){
                                            $scope.list_services.push(value)
                                        }
                                    })
                                    if($rootScope.userInfo.id && ([217203,87834,69406,2].indexOf($rootScope.userInfo.id)>=0)){
                                        angular.forEach(service_zalo, function (value){
                                            //if(value.group_en.toString() == "Interprovincial"){
                                                if($scope.list_services.indexOf(value)<0){
                                                    $scope.list_services.push(value)
                                                }
                                            //}
                                        })
                                    };
                                }
                                
                            }

                            if($scope.item.country_id!==237){
                                $scope.disabled_service = true;
                                angular.forEach($scope.list_services_global,function(value,key){
                                    if(value.id==$scope.item.service){
                                        $scope.Config.Service = value.id;
                                    }
                                });
                            }else{
                                $scope.disabled_service = false;
                                angular.forEach($scope.list_services,function(value,key){
                                    if(value.id==$scope.item.service){
                                        $scope.Config.Service = value.id;
                                    }
                                });
                            }
                        });

                        var _getService = function(isNoiTinh){
                            //$scope.list_services =  list_services_en;//$rootScope.keyLang =='en' ? list_services_en : list_services_vi;
                            if(isNoiTinh){
                                if($scope.Config.Service && _arrNoiTinh.length >=1 && _arrNoiTinh.indexOf($scope.Config.Service) <0){
                                    $scope.Config.Service   = $scope.list_services[0].id
                                }
                               
                            }else{
                                 var list_services_temp = [];
                                angular.forEach($scope.list_services, function (value){
                                    if(value.group_en.toString() == "Interprovincial"){
                                        list_services_temp.push(value)
                                    }
                                })
                                $scope.list_services    = list_services_temp;
                                list_services_temp      = [];
                                 if($scope.Config.Service && _arrLienTinh.length >=1 && _arrLienTinh.indexOf($scope.Config.Service) <0){
                                    $scope.Config.Service   = $scope.list_services[0].id
                                }
                            }
                            if($scope.item.boxme_inventory && $scope.list_services.indexOf(service_bm)<0 ){
                                angular.forEach(service_bm, function (value){
                                    if($scope.list_services.indexOf(value)<0){
                                        $scope.list_services.push(value)
                                    }
                                })
                            }
                            if($rootScope.userInfo.id && ([217203,87834,69406,2].indexOf($rootScope.userInfo.id)>=0)){
                                angular.forEach(service_zalo, function (value){
                                    //if(value.group_en.toString() == "Interprovincial"){
                                        if($scope.list_services.indexOf(value)<0){
                                            $scope.list_services.push(value)
                                        }
                                    //}
                                })
                            }
                            // xuat hang khoi kho
                            if($rootScope.orderProductSelected  && $rootScope.orderProductSelected.list_sku && $rootScope.orderProductSelected.list_sku.length >=1 ){
                                var list_services_temp = []
                                angular.forEach($scope.list_services, function (value){
                                    if(value.group_en.toString() == "Interprovincial" && value.id != 11){
                                        list_services_temp.push(value)
                                    }
                                })
                                var service_bm_vt = {
                                    id          : 5,
                                    name        : 'Dịch vụ vận tải (VT)',
                                    name_en     : 'Cargo Service (VT)',
                                    group       : 'Liên tỉnh',
                                    group_en    : 'Interprovincial',
                                    icons       : 'fa-truck',
                                    note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en     : 'Same day pickup and delivery by SLA'
                                }
                                list_services_temp.push(service_bm_vt)
                                $scope.list_services    = list_services_temp;
                                $scope.Config.Service   = 1; // mac dinh chuyen phat tiet kiem
                                list_services_temp      = [];
                            }
                            // end list service xuat hang khoi kho
                        }

                        $scope.list_services_global = [
                            {
                                id          : 8,
                                name        : 'Chuyển phát nhanh quốc tế',
                                name_en     : 'International Express',
                                icons       : 'fa-plane',
                                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en     : 'Same day pickup and delivery by SLA'
                                
                            },
                            {
                                id          : 9,
                                name        : 'Chuyển phát tiết kiệm quốc tế',
                                name_en     : 'International Economy',
                                icons       : 'fa-truck',
                                note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                note_en     : 'Same day pickup and delivery by SLA'
                                
                            }
                        ];

                        if($rootScope.userInfo.id && ([2,87834,87695,69406].indexOf($rootScope.userInfo.id)>=0)){
                            $scope.list_services_global = [
                                {
                                    id          : 8,
                                    name        : 'Chuyển phát nhanh quốc tế',
                                    name_en     : 'International Express',
                                    icons       : 'fa-plane',
                                    note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en     : 'Same day pickup and delivery by SLA'
                                    
                                },
                                {
                                    id          : 9,
                                    name        : 'Chuyển phát tiết kiệm quốc tế',
                                    name_en     : 'International Economy',
                                    icons       : 'fa-truck',
                                    note        : 'Lấy hàng tận nơi trong ngày và giao theo thời gian cam kết.',
                                    note_en     : 'Same day pickup and delivery by SLA'
                                    
                                },{
                                    id          : 15,
                                    name        : 'Small Package Saver',
                                    name_en     : 'Small Package Saver',
                                    icons       : ' fa-car',
                                    note        : 'Boxme sẽ đóng gói và gom hàng tại Việt Nam và giao qua USPS. ',
                                    note_en     : 'Boxme will pack and consolidate in VietNam and delivery by USPS'
                                }
                            ];

                        };

                        $scope.disabled_service = false;

                        


                        angular.forEach($scope.list_courier,function(value, key){
                            if(value.id == $scope.item.courier){
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
                            if($scope.Config.Type==1){
                                if(!$scope.Product.MoneyCollect){
                                    return toaster.pop('warning', 'Bạn chưa nhập tiền thu hộ !');
                                }else{
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
                            Order.ChangeExcel($scope.frm, key).then(function (result) {
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