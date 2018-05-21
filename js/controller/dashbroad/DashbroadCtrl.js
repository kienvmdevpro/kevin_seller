'use strict';

//List Order
angular.module('app').controller('DashbroadCtrl', 
		   ['$scope','$rootScope', '$http','$filter', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Api_Path', 'Analytics',
 	function($scope,  $rootScope,   $http,  $filter,   $state,   $window,   $stateParams,   toaster,   Print,   Api_Path,   Analytics) {
		var tran = $filter('translate');
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

		/*$scope.orderGraphConfig*/var orderGraphConfig_en  = {
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
	                text: tran('DASH_VanDon')// 'Vận đơn'
	            }	
	        },
	        series: [],
            loading: true,
    	};
        
    	/*$scope.orderGraphConfig2*/ var orderGraphConfig2_en= {
	        title: { 	text: ''},
	        xAxis: {	type: 'datetime',
	        			dateTimeLabelFormats: { // don't display the dummy year
	        				month: '%e. %b',
	        				year: '%b'
	        			},
	        			title: {	text: 'Date'}
	        		},
	        yAxis: {	title: {	text: 'Order'}},
	        series: [],
            loading: true,
    	};
    	var orderGraphConfig2_vi = {
    	        title: {text: ''},
    	        xAxis: {type: 'datetime',
    	            	dateTimeLabelFormats: { // don't display the dummy year
    	                month: '%e. %b',
    	                year: '%b'},
    	                title: {text: 'Ngày'}
    	        	},
    	        yAxis: {
    	        	title: {text: 'Vận đơn' }	
    	        	},
    	        series: [],
                loading: true,
        	};
    	//$scope.orderGraphConfig2		= orderGraphConfig2_vi ;
    	$scope.orderGraphConfig2 = $rootScope.keyLang == 'vi' ? orderGraphConfig2_vi : orderGraphConfig2_en;
    	
    	$scope.$watch('keyLang', function (Value, OldValue) {
            if (Value != undefined && Value =="en" ) {
            	$scope.list_status_process = $scope.list_status_process_en;
            	$scope.orderGraphConfig2	= orderGraphConfig2_en;
            }else{
            	$scope.list_status_process = $scope.list_status_process_vi;
            	$scope.orderGraphConfig2	= orderGraphConfig2_vi;
            }
            	$scope.list_option 		= (Value =="en") ? $scope.list_option_en 	: $scope.list_option_vi;
            	$scope.status_detail	= (Value =="en") ? $scope.status_detail_en 	: $scope.list_option_vi;
        });

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
        $scope.orderByOrderReturn = {
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

        $scope.loadStatiticsOrderReturn = function (){
            $scope.orderByOrderReturn.loading = true;
            $scope.waiting_return = true;
            $http.get(ApiPath + 'dashbroad/statitics-order-return', {params: $scope.getDateParams()}).success(function (resp){
                $scope.orderByOrderReturn.loading = false;
                if(!resp.error){
                    $scope.orderByOrderReturn.series[0].data = resp.data;
                    $scope.orderreturn = resp.data;
                    $scope.$watch('keyLang', function (Value, OldValue) {
                        if(Value == 'vi'){
                            angular.forEach($scope.orderreturn,function(value,key){
                                $scope.orderreturn[key]['name'] = value['name'];
                            });
                        }else{
                            angular.forEach($scope.orderreturn,function(value,key){
                                $scope.orderreturn[key]['name'] = value['name_en'];
                            });
                        }
                    });
                }
                $scope.waiting_return = false;
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

        $scope.DownloadExcel = function (value) {
            var params = $scope.getDateParams();

            var url = ApiPath + 'dashbroad/download-excel?access_token=' + $rootScope.userInfo.token + '&lang='+$scope.keyLang + '&from_time=' +params.from_time;
            $window.open(url, '_blank');
            return '';
        }

        

        $scope.onDatepickedChange = function (){
            $scope.loadStatitics();
    		//$scope.loadOrderGraph();
        	$scope.loadGraphStatitics();
            $scope.loadStatiticsByCity();
            $scope.loadStatiticsOrderReturn();
    	}

        $scope.getNewestVerify();
        $scope.getNewestTicket();
        $scope.onDatepickedChange();
        
}]);
