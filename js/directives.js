'use strict';

/* Directives */
// All the directives rely on jQuery.

angular.module('app.directives', ['ui.load'])
  .directive('uiModule', ['MODULE_CONFIG','uiLoad', '$compile', function(MODULE_CONFIG, uiLoad, $compile) {
    return {
      restrict: 'A',
      compile: function (el, attrs) {
        var contents = el.contents().clone();
        return function(scope, el, attrs){
          el.contents().remove();
          uiLoad.load(MODULE_CONFIG[attrs.uiModule])
          .then(function(){
            $compile(contents)(scope, function(clonedElement, scope) {
              el.append(clonedElement);
            });
          });
        }
      }
    };
  }])
  .directive('uiShift', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        // get the $prev or $parent of this el
        var _el = $(el),
            _window = $(window),
            prev = _el.prev(),
            parent,
            width = _window.width()
            ;

        !prev.length && (parent = _el.parent());
        
        function sm(){
          $timeout(function () {
            var method = attr.uiShift;
            var target = attr.target;
            _el.hasClass('in') || _el[method](target).addClass('in');
          });
        }
        
        function md(){
          parent && parent['prepend'](el);
          !parent && _el['insertAfter'](prev);
          _el.removeClass('in');
        }

        (width < 768 && sm()) || md();

        _window.resize(function() {
          if(width !== _window.width()){
            $timeout(function(){
              (_window.width() < 768 && sm()) || md();
              width = _window.width();
            });
          }
        });
      }
    };
  }])
  .directive('uiToggleClass', ['$timeout', '$document', function($timeout, $document) {
    return {
      restrict: 'AC',
      link: function(scope, el, attr) {
        el.on('click', function(e) {
          e.preventDefault();
          var classes = attr.uiToggleClass.split(','),
              targets = (attr.target && attr.target.split(',')) || Array(el),
              key = 0;
          angular.forEach(classes, function( _class ) {
            var target = targets[(targets.length && key)];            
            ( _class.indexOf( '*' ) !== -1 ) && magic(_class, target);
            $( target ).toggleClass(_class);
            key ++;
          });
          $(el).toggleClass('active');

          function magic(_class, target){
            var patt = new RegExp( '\\s' + 
                _class.
                  replace( /\*/g, '[A-Za-z0-9-_]+' ).
                  split( ' ' ).
                  join( '\\s|\\s' ) + 
                '\\s', 'g' );
            var cn = ' ' + $(target)[0].className + ' ';
            while ( patt.test( cn ) ) {
              cn = cn.replace( patt, ' ' );
            }
            $(target)[0].className = $.trim( cn );
          }
        });
      }
    };
  }])
  .directive('uiNav', ['$timeout', function($timeout) {
    return {
      restrict: 'AC',
      link: function(scope, el, attr) {
        var _window = $(window), 
        _mb = 768, 
        wrap = $('.app-aside'), 
        next, 
        backdrop = '.dropdown-backdrop';
        // unfolded
        el.on('click', 'a', function(e) {
          next && next.trigger('mouseleave.nav');
          var _this = $(this);
          _this.parent().siblings( ".active" ).toggleClass('active');
          _this.next().is('ul') &&  _this.parent().toggleClass('active') &&  e.preventDefault();
          // mobile
          _this.next().is('ul') || ( ( _window.width() < _mb ) && $('.app-aside').removeClass('show off-screen') );
        });

        // folded & fixed
        el.on('mouseenter', 'a', function(e){
          next && next.trigger('mouseleave.nav');
          $('> .nav', wrap).remove();
          if ( !$('.app-aside-fixed.app-aside-folded').length || ( _window.width() < _mb ) || $('.app-aside-dock').length) return;
          var _this = $(e.target)
          , top
          , w_h = $(window).height()
          , offset = 50
          , min = 150;

          !_this.is('a') && (_this = _this.closest('a'));
          if( _this.next().is('ul') ){
             next = _this.next();
          }else{
            return;
          }
         
          _this.parent().addClass('active');
          top = _this.parent().position().top + offset;
          next.css('top', top);
          if( top + next.height() > w_h ){
            next.css('bottom', 0);
          }
          if(top + min > w_h){
            next.css('bottom', w_h - top - offset).css('top', 'auto');
          }
          next.appendTo(wrap);

          next.on('mouseleave.nav', function(e){
            $(backdrop).remove();
            next.appendTo(_this.parent());
            next.off('mouseleave.nav').css('top', 'auto').css('bottom', 'auto');
            _this.parent().removeClass('active');
          });

          $('.smart').length && $('<div class="dropdown-backdrop"/>').insertAfter('.app-aside').on('click', function(next){
            next && next.trigger('mouseleave.nav');
          });

        });

        wrap.on('mouseleave', function(e){
          next && next.trigger('mouseleave.nav');
          $('> .nav', wrap).remove();
        });
      }
    };
  }])
  .directive('uiScroll', ['$location', '$anchorScroll', function($location, $anchorScroll) {
    return {
      restrict: 'AC',
      link: function(scope, el, attr) {
        el.on('click', function(e) {
          $location.hash(attr.uiScroll);
          $anchorScroll();
        });
      }
    };
  }])
  .directive('uiFullscreen', ['uiLoad', function(uiLoad) {
    return {
      restrict: 'AC',
      template:'<i class="fa fa-expand fa-fw text"></i><i class="fa fa-compress fa-fw text-active"></i>',
      link: function(scope, el, attr) {
        el.addClass('hide');
        uiLoad.load('js/libs/screenfull.min.js').then(function(){
          if (screenfull.enabled) {
            el.removeClass('hide');
          }
          el.on('click', function(){
            var target;
            attr.target && ( target = $(attr.target)[0] );            
            el.toggleClass('active');
            screenfull.toggle(target);
          });
        });
      }
    };
  }])
  .directive('uiButterbar', ['$rootScope', '$anchorScroll', function($rootScope, $anchorScroll) {
     return {
      restrict: 'AC',
      template:'<span class="bar"></span>',
      link: function(scope, el, attrs) {        
        el.addClass('butterbar hide');
        scope.$on('$stateChangeStart', function(event) {
          $anchorScroll();
          el.removeClass('hide').addClass('active');
        });
        scope.$on('$stateChangeSuccess', function( event, toState, toParams, fromState ) {
          event.targetScope.$watch('$viewContentLoaded', function(){
            el.addClass('hide').removeClass('active');
          })
        });
      }
     };
  }])
  .directive('setNgAnimate', ['$animate', function ($animate) {
    return {
        link: function ($scope, $element, $attrs) {
            $scope.$watch( function() {
                return $scope.$eval($attrs.setNgAnimate, $scope);
            }, function(valnew, valold){
                $animate.enabled(!!valnew, $element);
            });
        }
    };
  }])
  //
  .directive('checkList', function() {
  return {
    scope: {
      list: '=checkList',
      value: '@'
    },
    link: function(scope, elem, attrs) {
      var handler = function(setup) {
        var checked = elem.prop('checked');
        var index = scope.list.indexOf(scope.value);

        if (checked && index == -1) {
          if (setup) elem.prop('checked', false);
          else scope.list.push(scope.value);
        } else if (!checked && index != -1) {
          if (setup) elem.prop('checked', true);
          else scope.list.splice(index, 1);
        }
      };
      
      var setupHandler = handler.bind(null, true);
      var changeHandler = handler.bind(null, false);
            
      elem.on('change', function() {
        scope.$apply(changeHandler);
      });
      scope.$watch('list', setupHandler, true);
    }
  };
})
.directive('formatnumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(data) {
        if(data != '' && data != undefined){
            //convert data from view format to model format
            var string  = data.toString().replace(/^(0*)/,"");
            string      = string.replace(/(\D)/g,"");
            string      = string.replace(/^$/,"0");
            string      = string.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            
             if (string!=data) {
               modelCtrl.$setViewValue(string);
               modelCtrl.$render();
             }   
                      
            return string; //converted
        }
        return;
      });
     
      modelCtrl.$formatters.push(function(data) {
        //convert data from model format to view format
        if(data != '' && data != undefined){
            var string  = data.toString().replace(/','/,"");
                string      = string.replace(/(\D)/g,"");
                string      = string.replace(/^$/,"0");
                string      = string.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            if (string!=data) {
               modelCtrl.$setViewValue(string);
               modelCtrl.$render();
             }
             return string;
        }
        return;
      });
    }
  }
})
.directive('formatsize', function() {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
          modelCtrl.$parsers.push(function(data) {
            if(data != '' && data != undefined){
                //convert data from view format to model format
                var string  = data.toString().replace(/^(0*)/,"");
                string      = string.replace(/(\D)/g,"");
                string      = string.replace(/^$/,"0");
                string      = string.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1,");
                
                 if (string!=data) {
                   modelCtrl.$setViewValue(string);
                   modelCtrl.$render();
                 }   
                          
                return string; //converted
            }
            return;
          });
        }
      }
})
.directive('boxmeDistrictByProvince', function (Location) {
    return {
        restrict: 'A',
        scope: {
            provinceId: '=',
            districtId: '=',
            defaultLabel: '@'
        },
        link: function ($scope,$element,$attrs) {
            $scope.$watch('provinceId', function (newProvinceId, oldProvinceId) {
                if(newProvinceId != undefined && newProvinceId > 0){
                    
                    if (newProvinceId !== oldProvinceId && oldProvinceId != 0) {
                        $scope.districtId = "";
                    }
                    Location.district(newProvinceId,'all', $scope.remote ).then(function (districts) {
                        $scope.districts = districts.data.data;
                    });
                }else{
                    $scope.districtId   = "";
                    $scope.remote       = "";
                    $scope.districts    = {};
                }
            });
        },
        template: '<option value="">{{defaultLabel}}</option><option value="{{district.id}}" ng-click="changeRemote(district)" ng-repeat="district in districts" ng-selected="{{districtId == district.id}}">{{district.district_name}}</option>'

    }
})

.directive('boxmeDistrictByProvinceRemote', function (Location) {
    return {
        restrict: 'A',
        scope: {
            provinceId: '=',
            districtId: '=',
            defaultLabel: '@'
        },
        link: function ($scope,$element,$attrs) {
            $scope.$watch('provinceId', function (newProvinceId, oldProvinceId) {
                if(newProvinceId != undefined && newProvinceId > 0){
                    
                    if (newProvinceId !== oldProvinceId && oldProvinceId != 0) {
                        $scope.districtId = "";
                    }
                    Location.district(newProvinceId,'all', true ).then(function (districts) {
                        $scope.districts = districts.data.data;
                    });
                }else{
                    $scope.districtId   = "";
                    $scope.remote       = "";
                    $scope.districts    = {};
                }
            });
        },
        template: '<option value="">{{defaultLabel}}</option>'+
                  '<option value="{{district.id}}" ng-repeat="district in districts" ng-selected="{{districtId == district.id}}" ng-if="district.wards.length == 0">'+
                  '{{district.district_name}}</option>'+
                  '<optgroup ng-repeat="district in districts" label="{{district.district_name}}" ng-if="district.wards.length > 0">'+
                  '<option ng-repeat="ward in district.wards" value="{{ward.ward_name}}">{{ward.ward_name}}</option>'+
                  '</optgroup>'

    }
})




.directive('boxmeWardByDistrict', function (Location) {
    return {
        restrict: 'A',
        scope: {
            districtId: '=',
            wardId:     '=',
            defaultLabel: '@'
        },
        link: function ($scope,$element,$attrs) {
            $scope.$watch('districtId', function (new_value, old_value) {
                if(new_value != undefined && new_value != ''){
                    if (new_value !== old_value && old_value != 0) {
                        $scope.wardId = "";
                    }
                    Location.ward(new_value,'all').then(function (wards) {
                        $scope.wards = wards.data.data;
                    });
                }else{
                    $scope.wardId = "";
                    $scope.wards = {};
                }
            });
        },
        template: '<option value="">{{defaultLabel}}</option><option value="{{ward.id}}" ng-repeat="ward in wards" ng-selected="{{wardId == ward.id}}">{{ward.ward_name}}</option>'

    }
})
.directive('caseTypeTicket', function (Ticket) {
    return {
        restrict: 'A',
        scope: {
            caseId: '=',
            typeId: '=',
            defaultLabel: '@'
        },
        link: function ($scope,$element,$attrs) {
            $scope.list_type    = {};

            Ticket.ListCaseType().then(function (result) {
                if(result.data.data){
                    $scope.list_type = result.data.data;
                }
            });

            $scope.$watch('caseId', function (new_value, old_value) {
                if(new_value != undefined && new_value > 0){
                    $scope.ltype = $scope.list_type;
                    if (new_value !== old_value && old_value != 0) {
                        $scope.typeId = "";
                    }
                }else{
                    $scope.typeId = "";
                    $scope.ltype   = {};
                }
            });
        },
        template: '<option value="">{{defaultLabel}}</option><option value="{{type.id}}" ng-repeat="type in ltype | filter:{case_id: caseId }">{{type.type_name}}</option>'
    }
})
.directive('dropdownToggleNotify', ['$document', '$location', '$sce', 'Notify', 'PhpJs', function ($document, $location, $sce, Notify, PhpJs) {
    var openElement = null,
        closeMenu   = angular.noop;
    return {
        restrict: 'CA',
        scope: {
            countNotify     : '=',
            listNotify      : '=',
            waitingNotify   : '='
        },
        link: function(scope, element, attrs) {
            scope.count_notify = 0;
            scope.$watch('$location.path', function() { closeMenu(); });
            element.parent().bind('click', function() { closeMenu(); });
            element.bind('click', function (event) {

                var elementWasOpen = (element === openElement);

                event.preventDefault();
                event.stopPropagation();

                if (!!openElement) {
                    closeMenu();
                }

                if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
                    element.parent().addClass('open');
                    var time_now            = Date.parse(new Date())/1000;
                    scope.waitingNotify     = true;

                    Notify.get().then(function (result) {
                        if(!result.data.error){
                            scope.listNotify   = result.data.data;
                            angular.forEach(scope.listNotify, function(value, key) {
                                scope.listNotify[key].html     = $sce.trustAsHtml(value.html);
                                scope.listNotify[key].time_str = PhpJs.ScenarioTime(+time_now - value.time_create);

                                switch(value.type) {
                                    case 1:
                                        scope.listNotify[key].href = "ticket.request.management({time_start: '3months', id: '"+value.refer+"'})";
                                        break;
                                    default:
                                        scope.listNotify[key].href= "order.detail({code: '"+value.refer+"'})";
                                        break;
                                }

                            });
                            scope.countNotify       = 0;
                        }
                        scope.waitingNotify     = false;
                    });

                    openElement = element;
                    closeMenu = function (event) {
                        scope.listNotify  = {};
                        scope.countNotify = 0;
                        if (event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        $document.unbind('click', closeMenu);
                        element.parent().removeClass('open');
                        closeMenu = angular.noop;
                        openElement = null;
                    };
                    $document.bind('click', closeMenu);
                }
            });
        }
    };
}])
    .directive('googleAutocomplete', ['$location', '$anchorScroll', function($location, $anchorScroll) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                details: '=?'
            },
            link: function(scope, el, attr, model) {
                $(document).ready(function (){
                    var options = {
                        componentRestrictions: {country: "vn"}
                    };
                    var autocomplete = new google.maps.places.Autocomplete(el[0],options);
                    ///var autocomplete = new google.maps.places.Autocomplete(el[0]);

                    autocomplete.addListener('place_changed', function() {
                        scope.$apply(function() {
                            model.$setViewValue(el.val());
                            scope.details = autocomplete.getPlace();
                        });
                        
                    });
                });

            }
        };
    }])
    .directive('googleAutocompleteCountry', ['$location', '$anchorScroll', function($location, $anchorScroll) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            scope: {
                ngModel: '=',
                details: '=?',
                country : '=?'
            },
            link: function(scope, el, attr, model) {
                $(document).ready(function (){
                    var options = {
                            //types: ['establishment'],
                            componentRestrictions: {country:scope.country}
                        };
                        scope.$watch('country', function (newVal,oldVal){
                            if(newVal && oldVal){
                                options         = undefined;
                                google.maps.event.removeListener(listent);
                                if(autocomplete){
                                    autocomplete.removeListener();
                                    autocomplete.removeListener(listent);
                                }
                                // google.maps.event.clearInstanceListeners(autocomplete);
                                //autocomplete    = undefined;
                            var  options     = {
                                    componentRestrictions: {country: newVal}
                                };
                                if(oldVal && autocomplete){
                                    autocomplete.clear();
                                }
                                var autocomplete    = new google.maps.places.Autocomplete(el[0],options);
                                if(oldVal){
                                        var listent = autocomplete.addListener('place_changed', function(val) {
                                            scope.$apply(function() {
                                                model.$setViewValue(el.val());
                                                scope.details = autocomplete.getPlace();
                                            });
                                        
                                    });
                                }
                                
                            }
                        })
                    
                   
                   
                });

            }
        };
    }])

    .directive('districtFromGooglePlace', 
    		['$location','$anchorScroll','$http','$timeout','$filter','toaster', 
    function($location,   $anchorScroll,  $http,  $timeout,  $filter,  toaster) {
		var tran = $filter('translate');
		
        return {
            restrict: 'ACE',
            require: 'ngModel',
            scope: {
                details         : '=?',
                defaultDistrict : '=?',
                defaultDisabled : '=?'
            },
            link: function(scope, el, attr, model) {
                var defaultDistrict = scope.defaultDistrict ? scope.defaultDistrict : 0;
                window.bodauTiengViet = function(str) {  
                    if(!str){
                        return str;
                    }
                    str= str.toLowerCase();  
                    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
                    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
                    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
                    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
                    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
                    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
                    str= str.replace(/đ/g,"d");  
                    return str;  
                }
                scope.TinhHuyen = tran('ACC_TinhHuyen');
                scope.list_address = [];
                scope.selected_location = undefined;

                var url = ApiUrl + 'api/base/list-address-new';

                if (attr.full == "true") {
                    url =  'api/base/list-address?full=true';
                }
                $http.get(url)
                    .success(function (result){
                        if (!result.error) {
                            var list_address = result.data;
                            angular.forEach(list_address, function (value){
                                value.tv_khong_dau = window.bodauTiengViet(value.full_address);
                                value.symnoyms_kd  = window.bodauTiengViet(value.symnoyms);
                                value.district_kd  = window.bodauTiengViet(value.district_name);
                                value.city_kd      = window.bodauTiengViet(value.city_name);
                                if(value.city_id <=9){
                                    value.sort     = parseInt(""+value.priority+"1"+value.city_id+"") 
                                }else{
                                    value.sort     = parseInt(""+value.priority+""+value.city_id+"") 
                                }
                                // Edit address create order excel --khanht--
                                    if (value.hasOwnProperty('district_name') && value.hasOwnProperty('city_name')) {
                                        
                                        if (value.district_id == defaultDistrict) {
                                            model.$setViewValue(value);
                                        };
                                    };
                                // ------------------------------------------
                            })

                            scope.list_address = list_address;
                           // scope.list_address = $filter('orderBy')(scope.list_address, 'sort', false);
                        };
                    })
                    .error(function (error){
                        toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_TaiDSThanhPhOloi'));
                    });


                scope.limitcitysearch = 5000; //Init with no limite : to see a previous selected valued in database (edit mode)

                scope.search_str = "";
                scope.show_search = false;
                scope.CheckCity = function (CityTyped) {
                    scope.search_str = CityTyped;

                    if (CityTyped.length >= 1) {
                        scope.limitcitysearch = 35;
                    }
                    else {
                      scope.limitcitysearch = 35;
                    }
                }

                
                scope.$watch('details', function (newVal){
                    if (newVal) {
                        var level_1 = "";
                        var level_2 = "";
                        for (var i = 0; i < newVal.address_components.length; i++) {
                            var addressType = newVal.address_components[i].types[0];
                            if (addressType == 'administrative_area_level_1')
                                level_1 = newVal.address_components[i]['short_name'];
                            if (addressType == 'administrative_area_level_2')
                                level_2 = newVal.address_components[i]['short_name'];
                        }
                        var val = false;
                        level_1 = window.bodauTiengViet(level_1);
                        level_2 = window.bodauTiengViet(level_2);
                        angular.forEach(scope.list_address, function (value){
                            if (value.hasOwnProperty('district_name') && value.hasOwnProperty('city_name')) {
                                if (value.district_kd.indexOf(level_2) != -1 && value.city_kd.indexOf(level_1) != -1) {
                                    val = value;
                                };
                            };
                        });

                        if (val) {
                            $timeout(function (){
                                scope.selected_location = val;
                            }, 0);
                        }else {
                            scope.selected_location = {};
                        };
                    };
                })  
                scope.setDefaultDisabled = false;
                scope.$watch('defaultDisabled', function (newVal){
                    if(newVal){
                        scope.setDefaultDisabled = newVal
                    }else{
                        scope.setDefaultDisabled = false;
                    }
                })
                scope.$watch('defaultDistrict', function (newVal){
                    if (newVal > 0) {
                        var val = false;
                        angular.forEach(scope.list_address, function (value){
                            if (value.hasOwnProperty('district_name') && value.hasOwnProperty('city_name')) {
                                if (value.district_id == newVal ) {
                                    val = value;
                                };
                            };
                        });

                        if (val) {
                            $timeout(function (){
                                scope.selected_location = val;
                            }, 0);
                        }else {
                            scope.selected_location = {};
                        };  
                    }
                })
                scope.check_open_search = function(check){
                    scope.show_search = check ? true : false;
                }
                scope.$watch('selected_location', function (value){
                    if (angular.isObject(value)) {
                        scope.search_str = value.city_name;
                    };
                    model.$setViewValue(value);
                })
            },
            template:   ' <div ng-show="show_search" tooltip="{{'+"'NhapTuKhoa'"+' | translate}}" style="text-align: center;position: absolute;z-index: 1000;right: 36px;top: 6px;"><i style="font-size: 20px !important;" class="glyphicon glyphicon-search"></i></div>' +
                        '<ui-select  class="districtFromGooglePlaceStyle" ng-model="$parent.selected_location" ng-disabled="setDefaultDisabled" ng-click="check_open_search($select.open)">'+
                            '<ui-select-match placeholder="{{'+"'ACC_TinhHuyen'"+' | translate}}">{{$select.selected.full_address}}</ui-select-match>'+
                            '<ui-select-choices group-by="'+"'city_name'"+'"  refresh="CheckCity($select.search)" refresh-delay="400" repeat="value in list_address | orderBy: '+"'sort'"+' | filter: search_str | limitTo: limitcitysearch track by $index ">'+
                              '<span>{{value.full_address}}</span>'+
                            '</ui-select-choices>'+
                        '</ui-select>'
        };
    }])
    
    .directive('boxmeClickSelect', function () {
		return {
			compile: function (element) {
				element.on('click', function () {
					element.select();
				})
			}
		}
	})
	 .directive('convertCurrency', ['$localStorage', function($localStorage) {
        return {
            restrict: 'ACE',
            scope: {
                strong: '=?',
                homeCurrency: '=?'
            },
            link: function(scope, el, attr, model) {
            	scope.dam ="currencyBoild";
            	scope.dam1 ="";
            	if($localStorage['currency']){
    				scope.tCurrency = $localStorage['currency'];
    			}
    			if($localStorage['home_currency']){
    				scope.tHomeCurrency = $localStorage['home_currency'];
    			}
    			scope.currency = 0
            	scope.convert_currency = function(home_currency){
    				var currency = undefined;
    				if (!$localStorage['currency'] || !$localStorage['home_currency'])
    					return currency;
    				if($localStorage['home_currency'].toString() == $localStorage['currency'].toString()){
    					return currency
    				}
    				if(home_currency){
    					currency = parseInt(home_currency)/parseFloat($localStorage['exchange_rate']);
    					//scope.homeCurrency = undefined
    					return currency
    				}
    				return currency
    			}
    			scope.$watch('homeCurrency', function (value){
                    if(value){
                        scope.currency = scope.convert_currency(value)
                    }else{
                        scope.currency =0;
                    }
    				
                })
            	//scope.currency = undefined;
            	if (scope.homeCurrency){
            		scope.currency = scope.convert_currency(scope.homeCurrency)
            	}
            	if (scope.homeCurrency == 0 ){
            		scope.currency = 0
            	}
            },
            template:  '<span class="{{strong ? dam:dam1}}" ng-if="currency!=undefined || currency== 0"> {{currency || "" | usdNumber  | number:2 }}{{tCurrency}}</span>'+
            			'<span class="{{strong ? dam:dam1}}" ng-if="homeCurrency && !currency && currency!=0">{{homeCurrency || "" | vnNumber}}{{tHomeCurrency}}</span>'
        };
    }])
    
    .directive('boxmeNumberFormat', function () {
		return {
			require : 'ngModel',
			restrict: 'A',
			link    : function (scope, element, attrs, ngModel) {
				element.autoNumeric('init', {aSep: ',', mDec: 0});
				ngModel.$parsers.unshift(function (val) {
					return parseInt(val.replace(/,/g, ''));
				})
			}
		}
	})
	
	.directive('boxmeDropzone3', function() {
		return {
			restrict: 'AE',
			scope: {
				ngModel: '=',
				preload: '='
			},

			link: function(scope, element) {
				var dropzone = new Dropzone(element[0],{
					"url": BOXME_API + 'photo',
					"paramName": "photo",
					"addRemoveLinks": true,
					"dictRemoveFile": "Xóa",
					"dictCancelUpload": "Hủy",
					"dictDefaultMessage": "My Message"
				});

				if(scope.preload) {
					scope.preload.then(function(imagePaths) {
						if(!imagePaths) {
							return;
						}
						for(var i = 0, n = imagePaths.length; i < n; i++) {
							var mockFile = {name: 'Img', size: 500, serverImageUrl: imagePaths[i]};
							dropzone.files.push(mockFile);
							dropzone.emit('addedfile', mockFile);
							dropzone.emit('thumbnail', mockFile, mockFile.serverImageUrl);
						}
					});
				}

				dropzone.on('success', function(file, resp) {
					scope.$apply(function() {
						scope.ngModel = scope.ngModel || [];
						scope.ngModel.push(resp.url);
						file.serverImageUrl = resp.url;
					});
				});

				dropzone.on('removedfile', function(file) {
					if(!file.serverImageUrl) {
						return;
					}
					var removeIndex = scope.ngModel.indexOf(file.serverImageUrl);
					if(-1 == removeIndex) {
						return;
					}

					scope.$apply(function() {
						scope.ngModel.splice(removeIndex, 1);
					})
				});
			}
		}
	})
	.directive('boxmeSubmitTrigger', function () {
		return {
			link: function (scope, formElement, attr) {
				/** @namespace attr.boxmeSubmitTrigger */
				$(document).on('click', attr.boxmeSubmitTrigger, function () {
					formElement.submit();
				})
			}
		}
	})
	.directive('boxmeAction', function () {
		return {
			link: function (scope, formElement, attr) {
				/** @namespace attr.boxmeAction */
				formElement.attr('action', attr.boxmeAction);
			}
		}
	}).directive('numbersOnly', [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }            
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }])
    .directive('itemAutocomplete', ['$location', '$anchorScroll', '$http', function($location, $anchorScroll, $http) {
        return {
            restrict: 'EAC',
            scope: {
                weightModel     : '=?',
                nameModel       : '=?',
                priceModel      : '=?',
                code            : '=?',
                nameProduct     : '=?'
            },
            link: function(scope, el, attr, ctr) {
                scope.list_items        = [];
                scope.productSelected   = "";

                $http.get(ApiPath  + '_search/items').success(function (data){
                    scope.list_items = data.data;
                });
                scope.onsuggestProductSelected = function ($item, $model, $label){
                    if($item){
                        scope.code        = $item.id;
                        scope.weightModel = $item.weight;
                        scope.nameModel   = $item.product_name;
                        scope.priceModel  = $item.price;
                    }else {
                        scope.weightModel = 0;
                        scope.nameModel   = $label;
                        scope.priceModel  = 0;
                    }
                }

                scope.$watch('productSelected', function (newVal){
                    if (angular.isObject(newVal)) {
                        scope.nameModel   = newVal.product_name ? newVal.product_name : "";
                    }else {
                        scope.nameModel   = newVal;
                    }
                })
                
                

            },
            template: '<script type="text/ng-template" id="customTemplate.html">' +
                                      '<a>' + 
                                          '<span>{{match.model.product_name | limitTo: 30}} <em ng-if="match.model.product_name.length > 30">...</em></span> <br/>' +
                                           '<span>{{match.model.weight | number}}g - <span style="color:red;">{{match.model.price | number}}đ<span></span>' +
                                      '</a>' +
                        '</script>' +
                        '<input  id="order_productname" type="text" ng-model="productSelected" name="product_suggestion" placeholder="{{'+"'OBG_Ex_product_name'"+' | translate}}" typeahead-on-select="onsuggestProductSelected($item, $model, $label)" typeahead="item as item.product_name for item in list_items | filter:$viewValue" typeahead-template-url="customTemplate.html" class="form-control">'
        };
    }])

    .directive('buyerAutocompleteaa', ['$location', '$anchorScroll', '$http', 'Order', function($location, $anchorScroll, $http, Order) {
        return {
            restrict: 'EAC',
            require:'ngModel',
            scope: {
                fullname    : '=?',
                code        : '=?',
                address     : '=?',
                area        : '=?',
                phonetwo    : '=?',
                phoneFalse  : '=?',
            },
            link: function(scope, el, attr, model) {
                scope.buyerSelected   = "";

                scope.suggestBuyer = function (val){
                    return Order.suggestBuyerInfo(val).then(function (result) {
                        if(result){
                            return result.data.data;
                        }
                        return;
                    });
                }
                scope.onsuggestBuyerSelected = function ($item, $model, $label){
                    scope.code     = $item.id;
                    scope.fullname = $item.fullname;
                    scope.address  = $item.address;
                    
                    scope.area     = {
                        city_id     : $item.city_id,
                        district_id : $item.province_id,
                        ward_id     : $item.ward_id
                    };
                }

                var isTelephoneNumber = function (phone){
                    var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
                        var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
                        if(phone.length !== _temp.length){
                            return true;
                        }
                        return false;
                }

                scope.phoneFalse = false;
                scope.$watch('buyerSelected', function (newVal){
                    
                    scope.phoneFalse = false;
                    if (angular.isObject(newVal)) {
                        scope.phone   = newVal.phone_primary;
                        if (newVal.phone_arr.length >=2 ) {
                            scope.$parent.show_phone2 = true;
                            scope.phonetwo = newVal.phone_arr[1];
                        };
                    }else {
                        scope.phone   = newVal;
                    }
                    model.$setViewValue(scope.phone);
                    
                    if (scope.phone && scope.phone.length > 5) {
                        scope.phoneFalse = false;
                        if(!isTelephoneNumber(scope.phone)){
                            var result = chotot.validators.phone(scope.phone, true);
                            if(result !== scope.phone){
                                 scope.phoneFalse = true;
                                 return false;
                            }
                        }
                    };
                    
                })

            },
            template: '<input type="text"' + 
                            'name="buyer_suggestion_"' + 
                            'ng-model="buyerSelected" class="form-control "' + 
                            'typeahead="item as item.phone_primary for item in suggestBuyer($viewValue)"' + 
                            'typeahead-focus-first   = "false"' + 
                            'typeahead-min-length    = "2"' + 
                            'typeahead-wait-ms       = "300"' + 
                            'typeahead-loading       = "loadingBuyer"' + 
                            'typeahead-on-select     = "onsuggestBuyerSelected($item, $model, $label)"' + 
                            'typeahead-template-url  = "SuggestBuyerTemplate.html"' + 
                            'placeholder="Số điện thoại người nhận"' + 
                            'required' + 
                            '/>' + 
                            '<script type="text/ng-template" id="SuggestBuyerTemplate.html">' + 
                              '<a>' + 
                                  '<span class="text-info">{{match.model.fullname +" - "+ match.model.phone}}</span> <br/>' + 
                                  '<span>{{match.model.address}}, {{match.model.district_name}}, {{match.model.city_name}}</span>' + 
                              '</a>' + 
                            '</script>' 
        };
    }])



    .directive('buyerSuggestion', ['$location', '$anchorScroll', '$http', 'Order','$timeout',  function($location, $anchorScroll, $http, Order, $timeout) {
        return {
            restrict: 'EAC',
            require:'ngModel',
            scope: {
                input       : '=',
                fullname    : '=?',
                code        : '=?',
                address     : '=?',
                area        : '=?',
                phonetwo    : '=?',
                phone       : '=?',
                phoneFalse  : '=?',
            },
            link: function(scope, el, attr, model) {
                scope.buyerSelected   = "";

                scope.suggestBuyer = function (val){
                    if(!val){
                        return;
                    }
                    return Order.suggestBuyerInfo(val).then(function (result) {
                        if(result){
                            return result.data.data;
                        }
                        return;
                    });
                }

                scope.isOpenSuggestion = false;
                scope.onsuggestBuyerSelected = function ($item){
                    scope.isOpenSuggestion = !scope.isOpenSuggestion;
                    scope.code     = $item.id;
                    scope.fullname = $item.fullname;
                    scope.address  = $item.address;
                    
                    scope.area     = {
                        city_id     : $item.city_id,
                        district_id : $item.province_id,
                        ward_id     : $item.ward_id
                    };


                    scope.phoneFalse = false;
                    if (angular.isObject($item)) {
                        scope.phone   = $item.phone_primary;
                        if ($item.phone_arr.length >=2 ) {
                            scope.$parent.show_phone2 = true;
                            scope.phonetwo = $item.phone_arr[1];
                        };
                    }else {
                        scope.phone   = $item;
                    }
                    model.$setViewValue('+84' + scope.phone);
                    
                }

                var isTelephoneNumber = function (phone){
                    var list_telephone_prefix = ['076','025','075','020','064','072','0281','030','0240','068','0781','0350','0241','038','056','0210','0650','057','0651','052','062','0510','0780','055','0710','033','026','053','067','079','0511','022','061','066','0500','036','0501','0280','0230','054','059','037','0219','073','0351','074','039','027','0711','070','0218','0211','0321','029','08','04','0320','031','058','077','060','0231','063'];
                        var _temp = phone.replace(new RegExp("^("+list_telephone_prefix.join("|")+")"), '');
                        if(phone.length !== _temp.length){
                            return true;
                        }
                        return false;
                }

                scope.phoneFalse = false;
                scope.list_data = [];
                var timeout = 0;
                scope.$watch('input', function (newVal){
                    if(newVal){
                        var phone = newVal.replace(/\D/g,"");

                        if(timeout !== 0){
                            $timeout.cancel(timeout);
                        }

                        timeout = $timeout(function (){
                        if(phone) {
                            scope.suggestBuyer(phone).then(function (data){
                                timeout         = 0;
                                scope.list_data = data;
                                if(data.length > 0){
                                    scope.isOpenSuggestion = true;
                                }
                            });
                        }
                        }, 400);
                    }
                    
                })

                // scope.$watch('buyerSelected', function (newVal){
                    
                    
                    
                //     if (scope.phone && scope.phone.length > 5) {
                //         scope.phoneFalse = false;
                //         if(! (scope.phone)){
                //             var result = chotot.validators.phone(scope.phone, true);
                //             if(result !== scope.phone){
                //                  scope.phoneFalse = true;
                //                  return false;
                //             }
                //         }
                //     };
                    
                // })

                $(document).click(function(event) {
                    if($(event.target).closest('.wrapper_buyer_suggestion').length == 0){
                        scope.isOpenSuggestion = false;
                    }
                    
                });

            },
            template: '<div class="wrapper_buyer_suggestion " ng-class="{\'\open\'\ : isOpenSuggestion }">' + 
                            '<ul class="dropdown-menu " >' +
                                '<li ng-repeat="item in list_data | limitTo:5 " ng-click="onsuggestBuyerSelected(item)">' +
                                    '<a href="javascript:;">' +
                                        '<strong>{{item.fullname}} - {{item.phone}}</strong>' +
                                        '<p>{{item.address}}</p>' +
                                    '</a>' +
                                '</li>' +
                            '</ul>'+ 
                        '</div>'
        };
    }])
    .directive('ngDelay', ['$timeout', function ($timeout) {
	    return {
	        restrict: 'A',
	        scope: true,
	        compile: function (element, attributes) {
	            var expression = attributes['ngChange'];
	            if (!expression)
	                return;
	            
	            var ngModel = attributes['ngModel'];
	            if (ngModel) attributes['ngModel'] = '$parent.' + ngModel;
	            attributes['ngChange'] = '$$delay.execute()';
	            
	            return {
	                post: function (scope, element, attributes) {
	                    scope.$$delay = {
	                        expression: expression,
	                        delay: scope.$eval(attributes['ngDelay']),
	                        execute: function () {
	                            var state = scope.$$delay;
	                            state.then = Date.now();
	                            $timeout(function () {
	                                if (Date.now() - state.then >= state.delay)
	                                    scope.$parent.$eval(expression);
	                            }, state.delay);
	                        }
	                    };
	                }
	            }
	        }
	    };
	}])
    .directive('buyerAutocomplete', ['$location', '$anchorScroll', '$http' ,'Order', function ($location, $anchorScroll, $http,Order) {
        return {
            restrict: 'EAC',
            require: 'ngModel',
            scope: {
                fullname: '=?',
                code: '=?',
                address: '=?',
                area: '=?',
                phonetwo: '=?',
                phoneFalse: '=?',
                country     : '=?',
                defaultphone: '=?'
            },
            link: function (scope, el, attr, model) {
            	scope.list_items = [];
                scope.buyerSelected = scope.defaultphone ? scope.defaultphone : ""; 
                scope.suggestBuyer = function (val){
                    if(val){
                        return Order.suggestBuyerInfo(val).then(function (result) {
                            if(result){
                                return result.data.data;
                            }
                            return;
                        });
                    }
                    
                }
               
                
                scope.onsuggestBuyerSelected = function ($item, $model, $label) {
                    scope.code = $item.id;
                    scope.fullname = $item.fullname;
                    scope.address = $item.address;

                    scope.area = {
                        city_id: $item.city_id,
                        district_id: $item.province_id,
                        ward_id: $item.ward_id
                    };
                }

                var isTelephoneNumber = function (phone) {
                    var list_telephone_prefix = ['076', '025', '075', '020', '064', '072', '0281', '030', '0240', '068', '0781', '0350', '0241', '038', '056', '0210', '0650', '057', '0651', '052', '062', '0510', '0780', '055', '0710', '033', '026', '053', '067', '079', '0511', '022', '061', '066', '0500', '036', '0501', '0280', '0230', '054', '059', '037', '0219', '073', '0351', '074', '039', '027', '0711', '070', '0218', '0211', '0321', '029', '08', '04', '0320', '031', '058', '077', '060', '0231', '063'];
                    var _temp = phone.replace(new RegExp("^(" + list_telephone_prefix.join("|") + ")"), '');
                    if (phone.length !== _temp.length) {
                        return true;
                    }
                    return false;
                }

                scope.phoneFalse = false;
                
                scope.$watch('buyerSelected', function (newVal) {

                    scope.phoneFalse = false;
                    if (angular.isObject(newVal)) {
                        scope.phone = newVal.phone_primary;
                        if (newVal.phone_arr.length >= 2) {
                            scope.$parent.show_phone2 = true;
                            scope.phonetwo = newVal.phone_arr[1];
                        };
                    } else {
                        scope.phone = newVal;
                    }
                    
                    model.$setViewValue(scope.phone);

                    scope.suggestBuyer(scope.phone);
                    if (scope.phone && scope.phone.length > 5 && scope.country && scope.country.id == 237) {
                        scope.phoneFalse = false;
                        if(scope.phone.indexOf("+84") >=0){
                            var phone_temp = scope.phone.replace("+84", "");
                            if(phone_temp[0] && phone_temp[0]!= "0"){
                                phone_temp = "0" + phone_temp
                            }
                            if (!isTelephoneNumber(phone_temp)) {
                                var result = chotot.validators.phone(phone_temp, true);
                                if (result !== phone_temp) {
                                    scope.phoneFalse = true;
                                    return false;
                                }
                            }
                        }else{
                            if (!isTelephoneNumber(scope.phone)) {
                                var result = chotot.validators.phone(scope.phone, true);
                                if (result !== scope.phone) {
                                    scope.phoneFalse = true;
                                    return false;
                                }
                            }
                        }
                        
                    };

                })

            },
            template: '<input id="order_phone" type="text"  ' +
            'name="buyer_suggestion_"' +
            'ng-model="buyerSelected" class="form-control sdt"' +
            'typeahead="item as item.phone_primary for item in suggestBuyer($viewValue)"' +
            'typeahead-focus-first   = "false"' +
            'typeahead-min-length    = "2"' +
            'typeahead-wait-ms       = "300"' +
            'typeahead-loading       = "loadingBuyer"' +
            'typeahead-on-select     = "onsuggestBuyerSelected($item, $model, $label)"' +
            'typeahead-template-url  = "SuggestBuyerTemplate.html"' +
            'placeholder="+ {{country.phone_code}}"' +
            'required' +
            '/>' +
            '<script type="text/ng-template" id="SuggestBuyerTemplate.html">' +
            '<a>' +
            '<span><strong>{{match.model.fullname +" - "+ match.model.phone}}</strong></span> <br/>' +
            '<span>{{match.model.address}}, {{match.model.district_name}}, {{match.model.city_name}}</span>' +
            '</a>' +
            '</script>'
        };
    }])
	;
   
