'use strict';

//List Order
angular.module('app').controller('DashbroadCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Api_Path', 'Analytics',
 	function($scope, $http, $state, $window, $stateParams, toaster, Print, Api_Path, Analytics) {
 		$scope.statitics 		= {};
 		$scope.orderGraphConfig = {};
 		$scope.round 			= Math.round;


 		$scope.dateRange    = {
            startDate: moment().subtract('days', 7).startOf('day'),
            endDate : moment().endOf('day')
        };

        $scope.moment       = moment;
        $scope.ranges       = {
            'Hôm nay': [moment().startOf('day'), moment().endOf('day')],
            'Hôm qua': [moment().subtract('days', 1).startOf('day'), moment().subtract('days', 1).endOf('day')],
            '7 ngày trước': [moment().subtract('days', 7).startOf('day'), moment().endOf('day')],
            '30 ngày trước': [moment().subtract('days', 30).startOf('day'), moment().endOf('day')],
            'Tháng này': [moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day')]
        };

        Analytics.trackPage('/dashboard');

        $scope.gotoTicket = function (id){
            $state.go('ticket.request.management.detail', {code: id});    
        }


        $scope.ticket_btn =    {
            'NEW_ISSUE'     : {
                'name'      : 'Yêu cầu mới',
                'bg'        : 'bg-info'
            },
            'ASSIGNED'      : {
                'name'      : 'Đã tiếp nhận',
                'bg'        : 'bg-primary'    
            },
            'PENDING_FOR_CUSTOMER'  : {
                'name'      : 'Chờ phản hồi',
                'bg'        : 'bg-warning'    
            },

            'CUSTOMER_REPLY'  : {
                'name'      : 'Chờ trả lời',
                'bg'        : 'bg-primary'    
            },
            'PROCESSED'     : {
                'name'      : 'Đã xử lý',
                'bg'        : 'bg-success'
            },
            'CLOSED'        : {
                'name'      : 'Đã đóng',
                'bg'        : 'bg-light dker'
            }
        },



 		Highcharts.setOptions({
	        global: {
	            useUTC: false
	        }
    	});

    	$scope.loading = {};

		$scope.orderGraphConfig = {
	        title: {
	            text: ''
	        },
	        
	        xAxis: {
	            type: 'datetime',
	            dateTimeLabelFormats: { // don't display the dummy year
	                month: '%e. %b',
	                year: '%b'
	            },
	            title: {
	                text: 'Ngày'
	            }
	        },
	        yAxis: {
	        	title: {
	                text: 'Vận đơn'
	            }	
	        },
	        series: [],
            loading: true,
    	};

    	$scope.orderGraphConfig2= {
	        title: {
	            text: ''
	        },
	        
	        xAxis: {
	            type: 'datetime',
	            dateTimeLabelFormats: { // don't display the dummy year
	                month: '%e. %b',
	                year: '%b'
	            },
	            title: {
	                text: 'Ngày'
	            }
	        },
	        yAxis: {
	        	title: {
	                text: 'Vận đơn'
	            }	
	        },

	        series: [],
            loading: true,
    	};
        

        $scope.orderByCity = {
              "options": {
                "chart": {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    "type": "pie"
                },
                "plotOptions": {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            },
                            connectorColor: 'silver'
                        }
                    }
                }
              },
              "series":  [{
                    name: "Tỷ lệ",
                    colorByPoint: true,
                    data: []
                }],
              "title": {
                "text": ""
              },
              "credits": {
                "enabled": false
              },
              "loading": true,
              "size": {}
        };



    	$scope.getDateParams = function (){
    		var params = {
	            "from_time": ($scope.dateRange.startDate) ? moment($scope.dateRange.startDate).unix() : moment().subtract('days', 7).startOf("day").unix(),
	            "to_time": ($scope.dateRange.endDate) ? moment($scope.dateRange.endDate).unix() : moment().endOf("day").unix()
        	};
        	return params;
    	}
    	


        $scope.loadStatiticsByCity = function (){
            $scope.orderByCity.loading = true;
            $http.get(ApiPath + 'dashbroad/statitics-by-city', {params: $scope.getDateParams()}).success(function (resp){
                $scope.orderByCity.loading = false;
                if(!resp.error){
                    $scope.orderByCity.series[0].data = resp.data;
                }
            });
        }


        $scope.loadStatitics = function (){

        	$http.get(ApiPath + 'dashbroad/statitics', {params: $scope.getDateParams()}).success(function (resp){
	        	if(!resp.error){
	    			$scope.statitics = resp.data;
	        	}
        	});
        }

        $scope.loadOrderGraph = function (){
            $scope.orderGraphConfig.loading = true;
        	$http.get(ApiPath + 'dashbroad/order-graph', {params: $scope.getDateParams()}).success(function (resp){
	        	if(!resp.error){
	    			$scope.orderGraphConfig.series = resp.data
                    $scope.orderGraphConfig.loading = false;
	        	}
        	});
        }

        $scope.loadGraphStatitics = function (){
            $scope.orderGraphConfig2.loading = true;
        	$http.get(ApiPath + 'dashbroad/graph-statitics', {params: $scope.getDateParams()}).success(function (resp){
                $scope.orderGraphConfig2.loading = false;
	        	if(!resp.error){
	    			$scope.orderGraphConfig2.series = resp.data
	        	}
        	});
        }
        


        $scope.getNewestVerify = function (){
        	$scope.loading.newest_verify = true;
            $http.get(ApiPath + 'dashbroad/newsest-verify?item_page=10').success(function (resp){
                $scope.loading.newest_verify = false;
                if(!resp.error){
                    $scope.newest_verify = resp.data;
                }
            })
        }

        $scope.getNewestTicket = function (){
        	$scope.loading.newest_ticket = true;
            $http.get(ApiPath + 'dashbroad/newest-ticket?item_page=5').success(function (resp){
                $scope.loading.newest_ticket = false;
                if(!resp.error){
                    $scope.newest_ticket = resp.data;
                }
            })
        }

        $scope.onDatepickedChange = function (){
            $scope.loadStatitics();
    		//$scope.loadOrderGraph();
        	$scope.loadGraphStatitics();
            $scope.loadStatiticsByCity();
    	}

        $scope.getNewestVerify();
        $scope.getNewestTicket();
        $scope.onDatepickedChange();
        
}]);
