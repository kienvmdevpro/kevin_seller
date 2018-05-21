'use strict';

//List Order
var app = angular.module('app');
app.controller('PostOfficeCtrl', ['$rootScope', '$scope', '$modal', '$http', '$state', '$window', '$stateParams', 'Order', 'Inventory', 'Config_Status', 'PhpJs', '$anchorScroll', '$location', 'loginService',
    function ($rootScope, $scope, $modal, $http, $state, $window, $stateParams, Order, Inventory, Config_Status, PhpJs, $anchorScroll, $location, loginService) {
        // config

        var map, input, autocomplete, markers = [];
                    $scope.list_postoffice = [];
                    $scope.loading = false;

                    $scope.close = function(){
                        $modalInstance.close($scope.frm_submit);
                    }

                    var icons = {
                        '1': '/img/marker/location-viettel1.png',
                        '2': '/img/marker/location-vietnampost.png',
                        '11': '/img/marker/location-kerry1.png',
                        '8': '/img/marker/location-ems-1.png',
                    };

                    var infowindow = new google.maps.InfoWindow();

                    $scope.goCenter = function (value){
                        map.setCenter(new google.maps.LatLng(value.lat, value.lng));
                    };

                    $scope.getNearPostoffice = function (lat, lng){
                        $scope.list_postoffice = [];
                        $scope.loading         = true;
                        $http.get(ApiPath + 'post-office/find-around', {params: {
                            lat     : lat,
                            lng     : lng,
                            radius  : 5,
                            limit   : 20
                        }}).success(function (resp){
                            $scope.loading         = false;
                            $scope.list_postoffice = resp.data;
                            $scope.clearMarker();
                            angular.forEach($scope.list_postoffice, function (value){
                                var _marker = new google.maps.Marker({
                                    map: map
                                });

                                _marker.setIcon(({
                                    url: icons[value.courier_id] ? icons[value.courier_id] : '/img/marker/location-ems-1.png',
                                }));
                                _marker.setPosition(new google.maps.LatLng(value.lat, value.lng));
                                _marker.setVisible(true);

                                google.maps.event.addListener(_marker,'click', (function(marker,value,infowindow){
                                    return function() {
                                        map.setCenter(new google.maps.LatLng(value.lat, value.lng));
                                        infowindow.setContent("<h5>Bưu cục: " + value.name + "</h5><p>Địa chỉ : "+value.address+"</p><p>SĐT: " + value.phone + "</p><p><a href='#/order/create-v2?bc="+value.id+"' style='color:#23b7e5'>Tạo đơn hàng</a> | <a href='#/order/upload/step1?bc="+value.id+"' style='color:#23b7e5'>Tạo nhiều đơn hàng(Excel)</a></p>");
                                        infowindow.open(map, marker);
                                    };
                                })(_marker, value, infowindow));

                                value.marker = _marker;
                                markers.push(_marker);
                            })

                            
                            
                            
                            
                        })
                    }

                    $scope.clearMarker = function (){
                        for (var i = markers.length - 1; i >= 0; i--) {
                            if(markers[i]){
                                markers[i].setMap(null);
                            }

                        };
                        markers = [];
                    }
                    function initMap(lat, lng) {
                        lat = lat || 21.0031180;
                        lng = lng || 105.8201410;

                        map = new google.maps.Map(document.getElementById('map'), {
                            center  : {lat: lat, lng: lng},
                            zoom    : 15
                        });
                        
                        input = (document.getElementById('address-input'));

                        var marker = new google.maps.Marker({
                            map: map
                        }); 

                        $scope.getNearPostoffice(lat, lng);

                        autocomplete = new google.maps.places.Autocomplete(input);

                        autocomplete.bindTo('bounds', map);
                        autocomplete.addListener('place_changed', function() {

                            marker.setVisible(false);

                            var place = autocomplete.getPlace();
                            if(place.geometry){

                                map.panTo(place.geometry.location);
                                map.setCenter(place.geometry.location);
                                //console.log(place.geometry.location);

                                $scope.getNearPostoffice(place.geometry.location.lat(), place.geometry.location.lng());

                                marker.setIcon(({
                                    url: '/img/marker_.png'

                                }));

                                marker.setPosition(place.geometry.location);
                                marker.setVisible(true);

                            }

                        });


                    }
                    setTimeout(function (){
                        
                        function success(pos) {
                            var crd = pos.coords;
                            initMap(crd.latitude, crd.longitude);
                        };

                        function error(err) {
                            initMap();
                        };
                        navigator.geolocation.getCurrentPosition(success, error, {});

                        setTimeout(function (){
                            if (!map) {
                                initMap();
                            };
                        }, 2000)


                    }, 200)

    }
])
app.directive('equalParentHeight',function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        // get the $prev or $parent of this el
        var _el = $(el),
            _window = $(window),
            prev = _el.prev(),
            parent,
            width = _window.width()
            

        
        
        setTimeout(function (){
            _el.height(function (){
                $(this).css('line-height', $(this).siblings().height() + 'px');
                return $(this).siblings().height();
            });
        }, 10)
        
        
      }
    };
  })
