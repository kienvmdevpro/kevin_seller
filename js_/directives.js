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
                        //console.log('getDist', districts);
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
                        //console.log('getDist', districts);
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
}]);

