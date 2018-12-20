/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'IBE | 企业信息平台';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'IBE | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            //  Call the metsiMenu plugin and plug it to sidebar navigation
            // login
        	scope.$root.$on("manageMenus:ready",function(){
            	 $timeout(function(){
                     element.metisMenu();
                 });
            });
            // refresh
            if(scope.$root.manageMenus){
            	$timeout(function(){
                    element.metisMenu();
                });
            }
            
            // Colapse menu in mobile mode after click on element
            var menuElement = $('#side-menu a:not([href$="\\#"])');
            menuElement.click(function(){
                if ($(window).width() < 769) {
                    $("body").toggleClass("mini-navbar");
                }
            });

            // Enable initial fixed sidebar
            if ($("body").hasClass('fixed-sidebar')) {
                var sidebar = element.parent();
                sidebar.slimScroll({
                    height: '100%',
                    railOpacity: 0.9,
                });
            }
        }
    };
};

/**
 * responsibleVideo - Directive for responsive video
 */
function responsiveVideo() {
    return {
        restrict: 'A',
        link:  function(scope, element) {
            var figure = element;
            var video = element.children();
            video
                .attr('data-aspectRatio', video.height() / video.width())
                .removeAttr('height')
                .removeAttr('width')

            //We can use $watch on $window.innerWidth also.
            $(window).resize(function() {
                var newWidth = figure.width();
                video
                    .width(newWidth)
                    .height(newWidth * video.attr('data-aspectRatio'));
            }).resize();
        }
    }
}

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools.html',
        controller: function ($scope, $element, $attrs) {
        	$scope.closeable = true;
        	$scope.isopen = true;
        	if($attrs.closeable&&$attrs.closeable=='false'){
        		$scope.closeable = false;
        	}
        	if($attrs.isopen&&$attrs.isopen=='false'){
        		 $timeout(function () {
        			 $scope.showhide();
                 }, 50);
        	}
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.children('.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
                
            };
                // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
}

/**
 * ibox-column-tools - Directive for iBox tools elements in right corner of ibox
 */
function iboxColumnTools($timeout) {
    return {
        restrict : 'A',
		require :'?ngModel',
        templateUrl: 'views/common/ibox_column_tools.html',
        link : function($scope, $element, attrs) {
        	var params = parseToJson(attrs.iboxColumnTools);
        	$element.find("div[alias='columnIbox']").attr("index-alias",params.alias).attr("index-morePath",params.morePath);
            // Function for collapse ibox
            $scope.iboxShowhide = function ($event) {
            	var el = $($event.target);
                var ibox = el.closest('div.ibox');
                var icon = el[0].tagName=='I'?$(el[0]):el.find('i:first');
                var content = ibox.children('.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function ($event) {
            	var el = $($event.target);
                var ibox = el.closest('div.ibox');
                ibox.remove();
            }
            
            $scope.iboxToMore = function ($event) {
            	var el = $($event.target);
            	window.location.href = el.parents("div[alias='columnIbox']").attr("index-morePath");
            }
            $scope.iboxRefresh = function ($event) {
            	var el = $($event.target);
            	$scope.columnReload(el.parents("div[alias='columnIbox']").attr("index-alias"));
            }
        }
    };
}

/**
 * iboxTools with full screen - Directive for iBox tools elements in right corner of ibox with full screen option
 */
function iboxToolsFullScreen($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/template/ibox_tools_full_screen.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.children('.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function () {
                var ibox = $element.closest('div.ibox');
                ibox.remove();
            };
            // Function for full screen
            $scope.fullscreen = function () {
                var ibox = $element.closest('div.ibox');
                var button = $element.find('i.fa-expand');
                $('body').toggleClass('fullscreen-ibox-mode');
                button.toggleClass('fa-expand').toggleClass('fa-compress');
                ibox.toggleClass('fullscreen');
                setTimeout(function() {
                    $(window).trigger('resize');
                }, 100);
            }
        }
    };
}

/**
 * tableTools - Directive for table tools to show/hide search panel
 */
function tableTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/template/table_tools.html',
        controller: function ($scope, $element) {
        	var ibox = $element.closest('div.ibox');
        	var icon = $element.find('i:first');
        	var content = ibox.children('.ibox-content');
        	if(!content.is(":visible")){
        		icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        	}
            // Function for collapse ibox
            $scope.showhide = function () {
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $scope.$emit("body:show:hide", icon.hasClass('fa-chevron-up'));
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 201);
            };
        }
    };
}

/**
 * minimalizaSidebar - Directive for minimalize sidebar
*/
function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                        }, 200);
                } else if ($('body').hasClass('fixed-sidebar')){
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                        }, 100);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                } 
                
                setTimeout(function () {
                	//调整表格
                	var grids = $('#grid');
                	if(grids && grids.length > 0 && grids.bootstrapTable && grids.bootstrapTable.constructor==Function){
                		grids.bootstrapTable('resetView');
                	}
                }, 500);
            }
        }
    };
};


function closeOffCanvas() {
    return {
        restrict: 'A',
        template: '<a class="close-canvas-menu" ng-click="closeOffCanvas()"><i class="fa fa-times"></i></a>',
        controller: function ($scope, $element) {
            $scope.closeOffCanvas = function () {
                $("body").toggleClass("mini-navbar");
            }
        }
    };
}

/**
 * vectorMap - Directive for Vector map plugin
 */
function vectorMap() {
    return {
        restrict: 'A',
        scope: {
            myMapData: '=',
        },
        link: function (scope, element, attrs) {
            var map = element.vectorMap({
                map: 'world_mill_en',
                backgroundColor: "transparent",
                regionStyle: {
                    initial: {
                        fill: '#e4e4e4',
                        "fill-opacity": 0.9,
                        stroke: 'none',
                        "stroke-width": 0,
                        "stroke-opacity": 0
                    }
                },
                series: {
                    regions: [
                        {
                            values: scope.myMapData,
                            scale: ["#1ab394", "#22d6b1"],
                            normalizeFunction: 'polynomial'
                        }
                    ]
                },
            });
            var destroyMap = function(){
                element.remove();
            };
            scope.$on('$destroy', function() {
                destroyMap();
            });
        }
    }
}


/**
 * sparkline - Directive for Sparkline chart
 */
function sparkline() {
    return {
        restrict: 'A',
        scope: {
            sparkData: '=',
            sparkOptions: '=',
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.sparkData, function () {
                render();
            });
            scope.$watch(scope.sparkOptions, function(){
                render();
            });
            var render = function () {
                $(element).sparkline(scope.sparkData, scope.sparkOptions);
            };
        }
    }
};

/**
 * icheck - Directive for custom checkbox icheck
 */
function icheck($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function($scope, element, $attrs, ngModel) {
            return $timeout(function() {
                var value;
                value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function(newValue){
                    $(element).iCheck('update');
                })

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'

                }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
            });
        }
    };
}

/**
 * ionRangeSlider - Directive for Ion Range Slider
 */
function ionRangeSlider() {
    return {
        restrict: 'A',
        scope: {
            rangeOptions: '='
        },
        link: function (scope, elem, attrs) {
            elem.ionRangeSlider(scope.rangeOptions);
        }
    }
}

/**
 * dropZone - Directive for Drag and drop zone file upload plugin
 */
function dropZone() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {

            var config = {
                url: 'http://localhost:8080/upload',
                maxFilesize: 100,
                paramName: "uploadfile",
                maxThumbnailFilesize: 10,
                parallelUploads: 1,
                autoProcessQueue: false
            };

            var eventHandlers = {
                'addedfile': function(file) {
                    scope.file = file;
                    if (this.files[1]!=null) {
                        this.removeFile(this.files[0]);
                    }
                    scope.$apply(function() {
                        scope.fileAdded = true;
                    });
                },

                'success': function (file, response) {
                }

            };

            dropzone = new Dropzone(element[0], config);

            angular.forEach(eventHandlers, function(handler, event) {
                dropzone.on(event, handler);
            });

            scope.processDropzone = function() {
                dropzone.processQueue();
            };

            scope.resetDropzone = function() {
                dropzone.removeAllFiles();
            }
        }
    }
}

/**
 * chatSlimScroll - Directive for slim scroll for small chat
 */
function chatSlimScroll($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(function(){
                element.slimscroll({
                    height: '234px',
                    railOpacity: 0.4
                });

            });
        }
    };
}

/**
 * customValid - Directive for custom validation example
 */
function customValid(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, c) {
            scope.$watch(attrs.ngModel, function() {

                // You can call a $http method here
                // Or create custom validation

                var validText = "eip";

                if(scope.extras == validText) {
                    c.$setValidity('cvalid', true);
                } else {
                    c.$setValidity('cvalid', false);
                }

            });
        }
    }
}


/**
 * fullScroll - Directive for slimScroll with 100%
 */
function fullScroll($timeout){
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: true,
        link: function(scope, element, attr, ngModelCtrl) {
        	scope.init = function(height){
        		var parent = element.parent("div.slimScrollDiv");
        		if(parent && parent.length > 0){
        			parent.css('height', height);
        			element.css('height', height);
        		}
        		else{
        			element.slimscroll({
                        height: height,
                        railOpacity: 0.9
                    });
        		}
        	}
        	
        	if(ngModelCtrl){
        		ngModelCtrl.$formatters.push(function(v){
        			v && scope.init(v);
        		});
        	}
        	else{
        		$timeout(function(){
                	var height = '100%';
                	if(attr.fullScroll){
                		height = attr.fullScroll;
                	}
                	scope.init(height);
                }, 100);
        	}
        }
    };
}

/**
 * slimScroll - Directive for slimScroll with custom height
 */
function slimScroll($timeout){
    return {
        restrict: 'A',
        scope: {
            boxHeight: '@'
        },
        link: function(scope, element) {
            $timeout(function(){
                element.slimscroll({
                    height: scope.boxHeight,
                    railOpacity: 0.9
                });

            });
        }
    };
}

/**
 * clockPicker - Directive for clock picker plugin
 */
function clockPicker() {
    return {
        restrict: 'A',
        link: function(scope, element) {
                element.clockpicker();
        }
    };
};


/**
 * landingScrollspy - Directive for scrollspy in landing page
 */
function landingScrollspy(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.scrollspy({
                target: '.navbar-fixed-top',
                offset: 80
            });
        }
    }
}

/**
 * fitHeight - Directive for set height fit to window height
 */
function fitHeight(){
    return {
        restrict: 'A',
        link: function(scope, element) {
        	element.css("overflow", "hidden");
            element.css("height", $(window).height() + "px");
            element.css("min-height", $(window).height() + "px");
            
            $(window).bind("resize", function(){
            	element.css("height", $(window).height() + "px");
            });
        }
    };
}

/**
 * truncate - Directive for truncate string
 */
function truncate($timeout){
    return {
        restrict: 'A',
        scope: {
            truncateOptions: '='
        },
        link: function(scope, element) {
            $timeout(function(){
                element.dotdotdot(scope.truncateOptions);

            });
        }
    };
}


/**
 * touchSpin - Directive for Bootstrap TouchSpin
 */
function touchSpin() {
    return {
        restrict: 'A',
        scope: {
            spinOptions: '='
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.spinOptions, function(){
                render();
            });
            var render = function () {
                $(element).TouchSpin(scope.spinOptions);
            };
        }
    }
};

/**
 * markdownEditor - Directive for Bootstrap Markdown
 */
function markdownEditor() {
    return {
        restrict: "A",
        require:  'ngModel',
        link:     function (scope, element, attrs, ngModel) {
            $(element).markdown({
                savable:false,
                onChange: function(e){
                    ngModel.$setViewValue(e.getContent());
                }
            });
        }
    }
};


/**
 * passwordMeter - Directive for jQuery Password Strength Meter
 */
function passwordMeter() {
    return {
        restrict: 'A',
        scope: {
            pwOptions: '='
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.pwOptions, function(){
                render();
            });
            var render = function () {
                $(element).pwstrength(scope.pwOptions);
            };
        }
    }
};


function iboxSearchs($timeout) {
    return {
        restrict: 'AE',
        scope: {
        	htConditions:'='
    	},
        templateUrl: 'views/common/toolbar-search.html',
        replace:true,
        controller: function ($scope, $element, $attrs) {
        	$scope.conditions = $attrs.htConditions?JSON.parse($attrs.htConditions):[];
        	$scope.showhide = function () {
                var ibox = $element.closest('div.toolbar-search');
                var icon = $element.find('i:first');
                var content = ibox.children('.toolbar-head').children('.toolbar-body');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            $scope.search = function () {
            	this.$parent.search();
            }
            $scope.clearSearch = function () {
            	// $('#searchForm').form('clear');
        		var inputs = $("#searchForm").find("input");
        		$(inputs).each(function(i, k) {
        			k.value = "";
        		});
        		inputs = $("#searchForm").find("select");
        		$(inputs).each(function(i, k) {
        			k.value = "";
        			if($.isFunction($.fn.select2)){ // select2的清空
        				var defaultvalue = null;
        				if($(this)[0].multiple){
        					defaultvalue = "";
        				}
        				$(this).val(defaultvalue).trigger("change");
        			}
        		})
        		
        		//根据指令解析出来的数据字典查询条件，虽然相应的input值已经置空，但是页面上显示的字典项没有还原到最初的状态
        		var spans = $("#searchForm").find("span[placeholder='点击选择']");
        		$(spans).each(function(i, k) {
        			$(this).text("点击选择");
        		});
            };
        }
    };
}



function miniTreeSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-chevron-left"></i></a>',
        controller: function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                        }, 200);
                } else if ($('body').hasClass('fixed-sidebar')){
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(400);
                        }, 100);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                }
            }
        }
    };
};

function htInitParam($rootScope) {
    return {
    	restrict: 'AE',
        scope:true,
    	link: function ($scope, $element, $attrs, ctrl) {
    		$rootScope.param = $rootScope.param?$rootScope.param:{};
        	$rootScope.param[$attrs.name]={'value':$element.val(),'property':$attrs.property,'operation':$attrs.operation,'relation':$attrs.relation?$attrs.relation:'AND'};
        }
    };
}

function listCollapse($timeout) {
    return {
    	restrict: 'A',
        template: '<div><a href="javascript:void(0)" ><i class="fa fa-bars" ng-click="listCollapse()" style="float: right;"></i></a></div>',
        controller: function ($scope, $element) {
        	var collapseTitle = $("div.sidebar div.panel-title h4").html();
            $scope.listCollapse = function () {
	            $("body").toggleClass("sidebar-collapse");
	                if($("body").hasClass("sidebar-collapse")){
	                   $(".panel-title h4").html('');
	                   $("div.sidebar div.content").hide(300);
	                }else{
	                    $(".panel-title h4").html(collapseTitle);
	                    $("div.sidebar div.content").show(300);
	                }
	                setTimeout(function(){
		               	 $('#grid').bootstrapTable('resetView');	
		           	 },500);
	                return false;
            }
        }
    };
};

/**
 * ht-data-table directive
 */
function htDataTable(DataTable, $rootScope){
	return {
		restrict: 'EA',
		scope: false,
		controller: function($scope, $element, $attrs){
			var scopeOnCtrl = $element.closest("[ng-controller]").scope() || $scope;
			
			if(!$attrs.url){
				throw new Error("The url property can not be empty.");
			}
			if(!$attrs.htDataTable){
				$attrs.htDataTable = "dataTable";
			}
			this.getDataTable = function(){
				if(scopeOnCtrl[$attrs.htDataTable]){
					return scopeOnCtrl[$attrs.htDataTable];
				}
				scopeOnCtrl[$attrs.htDataTable] = new DataTable({
					name: $attrs.htDataTable,
					url: $attrs.url,
					requestType: $attrs.requestType,
					dialog : $attrs.dialog?parseToJson($attrs.dialog):null
				});
				return scopeOnCtrl[$attrs.htDataTable];
			}
			
			this.getName = function(){
				return $attrs.htDataTable;
			}
			
			$element.ready(function(){
				$rootScope.$broadcast("dataTable:ready", $attrs.htDataTable);
            });
		}
	};
}

function htTable($timeout) {
    return {
        restrict: 'AE',
        require: '^htDataTable',
        replace: true,
        transclude: true,
        scope: true,
        link: function(scope, element, attrs, dataTableCtrl, tansclude) {
        	var table = element.find(".table-body > table"),
        		dataTable = dataTableCtrl.getDataTable(),
        		initialize = scope.$eval(attrs.initialize);
        	initialize = (initialize===angular.noop()) ? true : initialize;
        	element.removeClass().find("table").addClass(attrs.class);
        	tansclude(scope, function(clone){
        		table.append(clone);
        	});
        	
        	scope.selectAll = function(evt){
        		var s = false;
                if (evt.target.checked) {
                    s = true;
                }
                var rows = dataTable.rows;
                for (var i = 0; i < rows.length; i++) {
                    rows[i].isSelected = s;
                }
        	}
        	
        	scope.$on("dataTable:query:begin", function(t, d){
        		if(d.name!==dataTableCtrl.getName()){
        			return;
        		}
        		var colspan = 1;
        		if(scope.columns && scope.columns.length > 0){
        			colspan = scope.columns.length;
        		}
        		table.find("tbody").prepend('<tr class="inquiring"><td colspan="'+colspan+'"><i class="fa fa-refresh fa-spin fa-fw"></i> 正在查询...</td></tr>');
        		var selectAllBox = table.parents("[ht-data-table]").find("input.selectAllBox")[0];
        		// 查询时去掉全选的勾
        		selectAllBox && (selectAllBox.checked = false);
        	});
        	//查询出错时
        	scope.$on("dataTable:query:error", function(t, d){
        		if(d.name!==dataTableCtrl.getName()){
        			return;
        		}
        		table.find("tbody").find("tr.inquiring").remove();
        	});
        	//在tr的ng-repeat命令没有提供数据渲染时获取不到td对象，所以在表格查询到数据后再处理表头渲染
        	scope.$on("dataTable:query:complete", function(t, d){
        		if(d.name!==dataTableCtrl.getName()){
        			return;
        		}
        		table.find("tbody").find("tr.inquiring").remove();
        		$timeout(function(){
        			var columns = table.find("tr[ng-repeat]:first > td");
        			if(table.data("hasLinkCompleted")){
        				return;
        			}
        			
	            	if(columns && columns.length > 0){
	            		table.data("hasLinkCompleted", true);
	            		scope.columns = [];
		            	angular.forEach(columns, function(item){
		            		var column = {},
		            			attribute;
		            		
		            		Object.keys(item.attributes).forEach(function(key){
		            			attribute = item.attributes[key];
		            			if(attribute&&attribute.name){
		            				column[attribute.name] = attribute.value;
		            			}
		            		});
		            		if(item.width){
		            			column.style = {"width": item.width+"px"};
		            		}
		            		column.selectable = scope.$eval(column.selectable);
		            		column.single = scope.$eval(column.single);
		            		column.sortable = scope.$eval(column.sortable);
		            		if(column.sortable){
	            				column.field = column["ht-field"] || column["ng-switch"];
		            			if(column.field){
		            				var match = /.*\.(\w+)/.exec(column.field);
			            			if (match != null) {
			            				column.field = match[1];
			            			} else {
			            				throw new Error("the field property:" + column.field + " is a invalid value.");
			            			}
		            			}
		            			else{
		            				column.sortable = false;
		            			}
		            		}
		            		scope.columns.push(column);
		            	});
	            	}
        		});
        	});
        	element.ready(function(){
        		// 初始化查询
        		initialize && (dataTable.query());
        		scope.$emit("table:ready", dataTable);
            });
        },
        templateUrl: 'views/template/table.html'
    };
}

/**
 * ht-field directive 
 */
function htField(){
	return {
        scope: {
        	htField: '=',
        },
        controller: function($scope, $sce) {
            $scope.renderHtml = function(html) {
            	if(typeof html=='number'){
            		html = html.toString();
            	}
                return $sce.trustAsHtml(html);
            };
        },
        template: '<td ng-bind-html="renderHtml(htField)"></td>',
        replace: true
    };
}

/**
 * ht-pagination directive
 */
function htPagination($rootScope){
	return {
        restrict: 'EA',
        require: '^htDataTable',
        scope: {
            htPageSize: '=?',
            htDisplayedPages: '=?',
            htShowTotal: '=?',
            pageChanged: '&',
            pageSizeChanged: '&'
        },
        templateUrl: 'views/template/paginate.html',
        link: function(scope, element, attrs, dataTableCtrl) {
        	var dataTable = dataTableCtrl.getDataTable();

        	var pageSize = scope.htPageSize;
            var displayedPages = scope.htDisplayedPages | '';
            var currentPage = 1;
            
            var paginationConfig = {currentPage:currentPage};
            scope.pageSizeOptions = [10, 20, 30, 50, 100];
            
        	scope.htPageSize && (paginationConfig.pageSize = scope.htPageSize);
        	scope.htDisplayedPages && (paginationConfig.displayedPages = scope.htDisplayedPages);
            scope.hasOwnProperty("htShowTotal") && (paginationConfig.showTotal = !!scope.htShowTotal);
        	
            scope.pagination = dataTable.initPagination(paginationConfig);
            function redraw() {
            	var pageResult = scope.pagination.pageResult;
            	if(!pageResult){
            		return;
            	}
            	scope.pageResult = pageResult;
            	if(!scope.pageResult.show){
            		return;
            	}
            	if(!scope.pageResult.noTotal){
            		var start = 1,end,i;
                    start = Math.max(start, scope.pageResult.page - Math.abs(Math.floor(scope.pagination.displayedPages / 2)));
                    end = start + scope.pagination.displayedPages;
                    if (end > scope.pageResult.totalPages) {
                        end = scope.pageResult.totalPages + 1;
                        start = Math.max(1, end - scope.pagination.displayedPages);
                    }
                    scope.pages = [];
                    for (i = start; i < end; i++) {
                        scope.pages.push(i);
                    }
            	}
                if (scope.pageResult.page) {
                    if (scope.pageChanged) {
                        scope.pageChanged({
                            $pagination: scope.pagination
                        });
                    }
                }
            }

            scope.$watch(function() {
                return scope.pagination;
            }, redraw, true);
            scope.$watch('pagination.pageSize', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    scope.selectPage(1, true);
                    if (scope.pageSizeChanged) {
                        scope.pageSizeChanged({
                            $pagination: scope.pagination
                        });
                    }
                }
            });
            scope.$watch('pagination.displayedPages', redraw);
            scope.selectPage = function(page, force) {
                if (!force && scope.pagination.currentPage == page) return;
                if (page > 0 && scope.pageResult.show && !(!scope.pageResult.noTotal) ^ (page <= scope.pageResult.totalPages)) {
                	scope.pagination.currentPage = page;
                	dataTable.query();
                }
            };
            scope.setPageSize = function(size){
            	scope.pagination.pageSize = size;
            }
            scope.refresh = function(){
            	dataTable.query();
            }
        }
    };
}

/**
 * ht-sort directive 
 */
function htSort($timeout){
	return {
        restrict: 'EA',
        require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var htSort = scope.$eval(attr.htSort);
        	if(!htSort.sortable){
        		return;
        	}
        	var field = htSort.field;
        	if(!field){
        		throw new Error("the property 'field' in ht-property-sort can not be empty.");
        	}
        	$timeout(function(){
        		element.addClass("sorting");
        	});
        	var dataTable = dataTableCtrl.getDataTable();
        	dataTable.addSort({field:field});
            
        	var count = 0;
            element.bind('click', function sortClick() {
            	count++;
            	element.removeClass("sorting");
            	element.removeClass("sorting_asc");
            	element.removeClass("sorting_desc");
            	if(count%3){
            		element.addClass(count%3==1?"sorting_asc":"sorting_desc");
            		dataTable.sorting({field:field, direction:count%3==1?"ASC":"DESC"});
            	}
            	else{
            		element.addClass("sorting");
            		dataTable.sorting({field:field});
            	}
            });
        }
    };
}

/**
 * ht-select directive 
 */
function htSelect(){
	return {
        require: '^htDataTable',
        scope: {
        	htSelect: '=',
        	htSelectEvent: '&'
        },
        replace: true,
        template: '<input type="checkbox" ng-checked="htSelect.isSelected" />',
        link: function(scope, element, attr, dataTableCtrl) {
        	var dataTable = dataTableCtrl.getDataTable();
            
        	element.closest("tr").find("td:not(:last)").on("click",function(evt){
        		scope.$apply(function(){
            		scope.htSelect.isSelected = !scope.htSelect.isSelected;
            	});
        	});
            
            scope.$watch('htSelect.isSelected', function(newValue, oldValue){
            	if(oldValue!==newValue){
            		// update checkAll button's status
            		if(!dataTable.hasSelectedRow()){
            			var selectAllBox = element.parents("[ht-data-table]").find("input.selectAllBox")[0];
            			selectAllBox && (selectAllBox.checked = false);
            		}
            		scope.htSelectEvent && scope.htSelectEvent(scope.htSelect);
            	}
            });
        }
    };
}

/**
 * ht-remove-array directive
 */
function htRemoveArray(dialogService){
	return {
    	require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	if(!attr.url){
        		throw new Error("The property url in ht-remove-array can not be empty.");
        	}
        	var dataTable = dataTableCtrl.getDataTable(),
        		options = {url: attr.url},
            	removeKey = attr.removekey,
            	paramKey = attr.paramkey;
        	if(removeKey){
        		options['removeKey'] = removeKey;
        	}
        	if(paramKey){
        		options['paramKey'] = paramKey;
        	}
            element.on("click", function() {
                if (!dataTable.hasSelectedRow()) {
                    dialogService.fail("请选择要删除的数据!");
                    return;
                }
                dialogService.confirm("确定删除?").then(function(){
                	dataTable.removeArray(options).then(function(data) {
                		if(data.state){
                			dialogService.success("删除成功");
                		}else{
                			dialogService.fail( (data && data.message) ? data.message : '未知原因，请联系管理员.');
                		}
                    }, function(errorMsg){
                    	dialogService.fail(errorMsg);
                    });
                });
            });
        }
    };
}

/**
 * the directive of ht-query
 * @returns
 */
function htQuery(){
	return {
    	require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var dateRangeExp = /(\d{4}-\d{1,2}-\d{1,2})\s{1}-\s{1}(\d{4}-\d{1,2}-\d{1,2})/;
        	var property = attr.htQuery;
        	if(!property){
        		throw new Error("the ht-query directive can not be empty, should give the field you want to query.");
        	}
        	
        	var dataTable = dataTableCtrl.getDataTable();
        	
        	element.bind("focus blur", function(e){
        		var me = angular.element(e.currentTarget);
        		if(e.type=='focus'){
        			me.bind("keydown", function(event) {
        		        if(event.keyCode == "13") {// 回车键
        		        	// 查询前触发change事件，将查询条件同步过去
        		        	me.trigger("change");
        		        	dataTable.query();
        		        }
        		    });
        		}
        		else if(e.type=='blur'){
        			me.unbind("keydown");
        		}
        	});
        	
        	element.bind("change", function(e){
        		var me = angular.element(e.currentTarget),
        			isDateRangePicker = (me.attr("date-range-picker")===''),	/*是否日期范围选择器*/
        			value = me.val();
        		
        		// 日期选择器初始化时会多次触发change事件，与正常的值变化触发时唯一的区别是 没有 active样式
        		if(isDateRangePicker && !me.hasClass("active") && !me.hasClass("ng-empty")){
        			return;
        		}
        		if(!value){
        			dataTable.clearQuery(property);
        			return;
        		}
        		
        		if(isDateRangePicker){
        			var match = dateRangeExp.exec(value);
                	if (match != null) {
                		value = [match[1], match[2]];
                		// 当开始时间与结束时间为同一天时，设定开始时间为00:00:00点，结束时间为23:59:59，从而查询当天的数据
                		if(value[0]===value[1]){
                			value[0] += ' 00:00:00';
                			value[1] += ' 23:59:59';
                		}else{
                			value[1] += ' 23:59:59';
                		}
                	} else {
                		throw new Error("The value: "+value+" from date-range-picker can not be parser to an array.");
                	}
        		}
        		
        		var query = {
            			property: property,
            			value: value
            		};
        		if(attr.operation){
        			query.operation = attr.operation;
        		}
        		if(attr.relation){
        			query.relation = attr.relation;
        		}
        		dataTable.addQuery(query);
        	});
        }
    };
}

/**
 * the directive of ht-search
 * @returns
 */
function htSearch($compile){
	return {
    	require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var dataTable = dataTableCtrl.getDataTable();
        	
        	if(element.attr("ng-disabled")!=undefined){
        		return;
        	}
        	
        	element.attr("ng-disabled", dataTableCtrl.getName() + ".inquiring");
        	$compile(element)(scope);
        	
        	element.bind("click", function(){
        		dataTable.queryIndex();
        	});
        }
    };
}

/**
 * the directive of ht-reset
 * @param $compile
 * @returns
 */
function htReset($compile){
	return {
    	require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var dataTable = dataTableCtrl.getDataTable(),
        		dataTableName = dataTableCtrl.getName();
        	
        	if(element.attr("ng-disabled")!=undefined){
        		return;
        	}
        	
        	element.attr("ng-disabled", dataTableName + ".inquiring");
        	$compile(element)(scope);
        	
        	scope.$on("dataTable:query:reset", function(t, d){
        		if(d.name!==dataTableCtrl.getName()){
        			return;
        		}
        		//重置时，清空查询条件中的值
        		angular.element("[ht-data-table='"+dataTableName+"']").find("[ht-query],[ht-quick-search]").val('');
        	});
        	
        	element.bind("click", function(){
        		dataTable.reset();
        	});
        }
    };
}

/**
 * ht-quick-search directive
 * @returns
 */
function htQuickSearch($sce, $interval){
	return {
    	require: '^htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var quickSearchParams = attr.htQuickSearch.split(",");
        	
        	if(!quickSearchParams || quickSearchParams.length==0) return;
        	
        	var dataTable = dataTableCtrl.getDataTable();
        	var requestType = dataTable.requestType?dataTable.requestType:'POST';
            scope.intervalPromise = null;
            scope.wordChanged = false;
            scope.tag = false;
            scope.$on("body:show:hide", function(t, m){
            	// 展开高级搜索面板时禁用快速搜索并清空搜索内容
            	if(m){
            		element.val('');
            		element.attr("disabled", "disabled");
            	}
            	else{
            		element.parents("[ht-data-table]").find("[ht-query]").val('');
            		element.attr("disabled", false);
            	}
            	if(dataTable.getQuerySize() > 0){
            		dataTable.clearQuery();
            		dataTable.queryIndex();
            	}
            });
            
            scope.doSearch = function(value) {
            	if(!value){
            		value = element.val();
            	}
                dataTable.clearQuery();
                if(requestType=='GET'){
                	buildGetQuery(value);
                }else{
                	for (var i = 0; i < quickSearchParams.length; i++) {
                		if(!value) continue;
                		var f = quickSearchParams[i],
                		query = {property: f, value: value, operation: 'like', relation: 'or'};
                		
                		dataTable.addQuery(query);
                	}
                }
                dataTable.queryIndex();
            };
            
            var buildGetQuery = function(value){
            	var query = {};
            	for (var i = 0; i < quickSearchParams.length; i++) {
            		if(!value) value="";
            		var f = quickSearchParams[i];
            		query[f] = value;
            	}
            	dataTable.addQuery(query);
            }
            if(requestType=='GET'){
            	buildGetQuery();
            }
            
            var buildInterval = function(delay, time){
            	scope.intervalPromise = $interval(function(c) {
            		if(c==time){
            			element.trigger("blur");
            		}
                    if (scope.wordChanged && scope.tag) {
                        scope.wordChanged = false;
                        scope.tag = false;
                        scope.doSearch();
                    }
                    scope.tag = true;
                }, delay, time);
            }
            
            var moveEnd = function(obj){
        		setTimeout(function(){
        			obj.focus();
        		    var len = obj.value.length;
        		    if (document.selection) {
        		        var sel = obj.createTextRange();
        		        sel.moveStart('character',len);
        		        sel.collapse();
        		        sel.select();
        		    } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
        		        obj.selectionStart = obj.selectionEnd = len;
        		    }
        		},1);
        	}
            
            element.bind('focus', function(evt) {
                moveEnd(evt.target);
                buildInterval(500, 500);
            });
            element.bind('blur', function(evt) {
                $interval.cancel(scope.intervalPromise);
            });
            element.bind('keyup', function(evt) {
                // reset timer every input
                scope.tag = false;
                if (evt.keyCode == 13) {
                    scope.doSearch(evt.target.value);
                } else {
                    scope.wordChanged = true;
                }
            });
        }
    };
}

/**
 * htAction directive 请求配置的url地址。提示成功或者失败。并刷新列表页面
 * ht-action="{'url':'${bpmModel}/flow/def/v1/removeByDefIds?id={{row.id}}','actType':'del'}"
 * @returns
 */
function htAction(dialogService, baseService){
	return {
		require: '^?htDataTable',
        link: function(scope, element, attr, dataTableCtrl) {
        	var htAction = scope.$eval(attr.htAction);
        	var url = htAction.url,
        		actType = htAction.actType,
        		method = htAction.method || 'get';
        	element.bind('click', function(evt) {
        		if(actType=='del'){
        			dialogService.confirm("是否确认删除？").then(function(){
        				baseService.remove(url).then(function(rep){
        					handleResult(rep);
                		},function(rep){
                			handleResult(rep);
                		});
        			});
        		}else{
        			if(method=='post'){
        				baseService.post(url).then(function(rep){
            				handleResult(rep);
                		},function(rep){
                			handleResult(rep);
                		});
        			}
        			else if(method=='get'){
        				baseService.get(url).then(function(rep){
            				handleResult(rep);
                		},function(rep){
                			handleResult(rep);
                		});
        			}
        			else{
        				throw new Error("The method : '"+method+ "' does not support, just support 'get' and 'post' in htAction.");
        			}
        		}
            });

        	var handleResult = function(rep){
    			if(rep.state){
    				if(rep.message)dialogService.success(rep.message).then(function(){
    					if(dataTableCtrl){
        					var dataTable = dataTableCtrl.getDataTable();
        					if(dataTable && dataTable.query)dataTable.query();
        				}
    				});
    			}else{
    				if(rep.message){
    					dialogService.fail(rep.message);
    				}else{
    					dialogService.fail("请求出错了");
    				}
    				
    			}
        	}
        }
    };
}


/**
 * 表单的常用初始化数据指令，例如：
 * <form name="form"  ht-load="bOEnt/getObject?id=${param.id}" ng-model="data"></form>
 * ps:当初始化对象为空时不作任何操作的 参数介绍： ht-load ：能返回一个对象的请求后台地址
 * ng-model :把获取的对象赋值到该对象
 *
 * 后台controller： 可以参照 BOEntController.getObject方法
 *
 * 页面controller(ngjs的控制层): 我们可以捕获初始化数据后抛出的事件进行个性化操作（也可以不捕获）eg:
 * $scope.$on("afterLoadEvent",function(event,data){
 */
function htLoad(baseService,dialogService) {
	return {
		require : "ngModel",
		link : function(scope, element, attr, ctrl) {
			if (!attr.htLoad || attr.htLoad == "") {
				return;
			}
			var rtn = baseService.get(attr.htLoad);
			rtn.then(function(data) {
				if (!data){return;}
				if(scope[attr.ngModel] && scope[attr.ngModel].constructor.name=="Object"){
					scope[attr.ngModel] = angular.extend(scope[attr.ngModel],data);
				}else{
					scope[attr.ngModel]=data;
				}
				scope.$root.$broadcast('afterLoadEvent', scope[attr.ngModel]);// 发布加载事件用于给用户自定义操作
			}, function(status) {
				dialogService.fail("请求失败");
			});
		}
	};
}

/**
 *  计算日期间隔（班次管理）
 */
function htDatecalcs () {
    return {
        require: "ngModel",
        scope:{
            htDatecalcs:"="
        },
        link: function ($scope, element, attr, ctrl) {
            if(!$scope.htDatecalcs || !ctrl){return;}
            var ngModel =attr.ngModel;
            var dateCalc = $scope.htDatecalcs;
            var startSrc =dateCalc.start;
            var endSrc = dateCalc.end;
            var diffType =dateCalc.diffType;
            $scope.$parent.$watch(startSrc,function(newValue, oldValue) {
                if(newValue!==oldValue || !ctrl.$viewValue){
                    var endDate =eval("$scope.$parent."+endSrc);
                    if(!endDate){return;}
                    var int =HtUtil.doDateCalc(newValue,endDate,diffType);
                    ctrl.$setViewValue(int);
                    ctrl.$render();
                }
            });
            $scope.$parent.$watch(endSrc,function(newValue, oldValue) {
                if(newValue!==oldValue || !ctrl.$viewValue){
                    var start =eval("$scope.$parent."+startSrc);
                    if(!start){return;}
                    var int = HtUtil.doDateCalc(start,newValue,diffType);
                    ctrl.$setViewValue(int);
                    ctrl.$render();
                }
            });

        }
    };
}

/**
 *  计算日期间隔
 */
function htDatecalc () {
      return {
          require: "ngModel",
          link: function ($scope, element, attr, ctrl) {
			  if(!attr.htDatecalc || !ctrl){return;}
        	  var ngModel =attr.ngModel;
        	  var dateCalc = eval('(' + attr.htDatecalc + ')');
    		  var startSrc =dateCalc.start;
    		  var endSrc = dateCalc.end;
    		  var diffType =dateCalc.diffType;
    		  if(startSrc.split(".").length>2){ //子表的
    			  startSrc ="item."+startSrc.split(".")[2];
    			  endSrc ="item."+endSrc.split(".")[2];
    		  }else{
    			  endSrc = "data."+endSrc;
    			  startSrc ="data."+startSrc;
    		  }
			  $scope.$watch(startSrc,function(newValue, oldValue) {
	        	   if(newValue!=oldValue){
	        		   var endDate =eval("$scope."+endSrc);//scope.data.main.field , item.field
	        		   var int =HtUtil.doDateCalc(newValue,endDate,diffType);
	        			   ctrl.$setViewValue(int);
	        			   ctrl.$render();
	        	   }
    		   });
			  $scope.$watch(endSrc,function(newValue, oldValue) {
	        	   if(newValue!=oldValue){
	        		   var start =eval("$scope."+startSrc);//scope.data.main.field , item.field
	        		   var int = HtUtil.doDateCalc(start,newValue,diffType);
	        			   ctrl.$setViewValue(int);
	        			   ctrl.$render();
	        	   }
    		   });
          }
      };
  }

function htCheckbox() {
	return {
		restrict : 'A',
		require : "ngModel",
		link : function(scope, element, attrs, ctrl) {
			var checkValue = attrs.value;
			
			//modelValue转viewValue的过程
			ctrl.$formatters.push(function(value) {
				if (!value){return false;}
				var valueArr = value.split(",");
				if (valueArr.indexOf(checkValue) == -1){return false;}
				return true;
			});
			
			//viewValue转modelValue的过程
			ctrl.$parsers.push(function(value){
				var valueArr = [];
				if(ctrl.$modelValue){
					valueArr = ctrl.$modelValue.split(",");
				}
				var index = valueArr.indexOf(checkValue);
				if (value) {
					// 如果checked modelValue 不含当前value
					if (index == -1){valueArr.push(checkValue);}
				} else {
					if (index != -1){valueArr.splice(index, 1);}
				}
				
				return valueArr.join(",");
			});
		}
	}
}

function htBoolean() {
	return {
		restrict : 'A',
		require:'ngModel',
		scope : true,
		link : function(scope, element, attrs,ctrl) {
			var booleanConf =attrs.htBoolean;
			var textArr = attrs.text.split("/");
			scope.trueText = textArr[0];
			scope.falseText =textArr.length==2?textArr[1]:textArr[0];
			if(booleanConf)	{
				booleanConf=booleanConf.split("/");
			}
			else {
				booleanConf = [true,false];
			}
			
			var trueValue = booleanConf[0],falseValue = booleanConf[1];
			
			ctrl.$formatters.push(function(value){
				if(typeof(value)== 'number'){value =""+value;}
				return value === trueValue;
			});
			
            ctrl.$parsers.push(function(value){
            	return value ? trueValue : falseValue; 
            });
            
            ctrl.$render = function(){
                scope.checked = ctrl.$viewValue;
            };
            
            element.on('click', function(){
            	if($(this).attr("disabled")){return;} 
                scope.$apply(function() {
                  scope.checked = !scope.checked;
                  ctrl.$setViewValue(scope.checked);
                });
            });
		},
		template:'<lable class="btn label-sm {{checked ? \'active\':\'inactive\'}}" >{{checked ?trueText:falseText}}</lable>'  
	};
}

/**
 * 富文本框指令：
 * <ht-editor config="editorConfig" ng-model="content" height="100"></ht-editor>
 * ng-model：scope 数据表达式
 * config:编辑器配置
 * height:文本框高度
 * 
 * 使用方法：
 * 
 * <body ng-controller="ctrl">
 *	<div config="editorConfig" ht-editor ng-model="content1" style="width: 80%">测试</div>
 *	<script>
 *		angular.module('example',['formDirective']).controller('ctrl', function ($scope,$sce) {
 *    		$scope.content1="hello world";
 * 		});
 *  </script>
 * </body>
 */
function htEditor() {
	return {
		restrict : 'AE',
		transclude : true,
		template : '',
		require : '?ngModel',
		scope : {
			config : '='
		},
		link : function(scope, element, attrs, ngModel) {
			var defaultConf = { focus : true,
					toolbars : [ [ 'source', 'undo', 'redo', 'bold', 'italic', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist' ] ],
					initialFrameHeight : attrs.height || 150
				};
			try {
	        	var htEditor=eval("("+ attrs.htEditor+")");
	        	defaultConf.initialFrameHeight = htEditor.initialFrameHeight;
	        	defaultConf.initialFrameWidth = htEditor.initialFrameWidth;
				var editor = new UE.ui.Editor(scope.config||defaultConf);
			} catch (e) {
				var editor = new UE.ui.Editor(scope.config||defaultConf);
			}
			editor.render(element[0]);
			//去掉form-control样式
			$($(editor.textarea).prev()).removeClass("form-control");
			if (ngModel) {
				// Model数据更新时，更新百度UEditor
				ngModel.$render = function() {
					try {
						editor.setContent(ngModel.$viewValue);
					} catch (e) {
					}
				};
				// 设置内容。
				editor.ready(function() {
					if(ngModel.$viewValue){
						editor.setContent(ngModel.$viewValue);
					}
				});
				// 百度UEditor数据更新时，更新Model
				editor.addListener('contentChange', function() {
					setTimeout(function() {
						scope.$apply(function() {
							var content = editor.getContent();
							if(attrs.htEditor=="getContentTxt"){
								// 获取文本， 不带html格式的
								content = editor.getContentTxt();
							}
							ngModel.$setViewValue(content);
						})
					}, 0);
				});
			}

		}
	}
}


/**
 * 列表全选指令，这个指令用于 ng-repeat 列表全选，反选。 指令的用法： 在列表项checkbox控件上增加指令
 * ht-checked="selectAll",属性值为全选checkbox的 ng-model属性。 
 * eg: <input type="checkbox"  ng-model="selectAll"/>
 * 
 * <tr  ng-repeat="item in data.defNameJson  track by $index">
 * <td> <input ng-model="item.selected" type="checkbox" ht-checked="selectAll">
 * </td>
 * </tr>
 * 
 */
function htChecked () {
	return {
		restrict : 'A',
		require : "ngModel",
		scope : {
			ngModel : "="
		},
		link : function(scope, elm, attrs, ctrl) {
			scope.$parent.$watch(attrs.htChecked, function(newValue, oldValue) {
				if (newValue == undefined)
					return;
				ctrl.$setViewValue(newValue);
				ctrl.$render();
			});
		}
	};
}

/**
 * 计算时间（分钟）
 */
function htTimes () {
		return {
			restrict : 'A',
			scope:{
				ngModel:"="
			},
			require : "ngModel",
			link : function(scope,element,attrs,ctrl){
				
				scope.hourArr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
				scope.minuteArr = [0,1,2,3,4,5,10,15,20,30,40,50];
				scope.permission = angular.isUndefined(attrs.permission)? "w":attrs.permission;
				scope.day=0;
				scope.hour=0;
				scope.minute =0;
				ctrl.$formatters.push(function(time) {
					if(typeof time =='undefined' || Number.isNaN(time))return;
					
					 scope.day =Math.floor(time / (60 * 24));
					 scope.hour =Math.floor((time -scope.day * (60 * 24)) / 60) ;
					 scope.minute =time - scope.day * (60 * 24) - scope.hour * 60;
				});
				
				scope.changeMin = function(){
					var modelValue = 0;
					modelValue += parseInt(60 * 24 * scope.day);
					modelValue += parseInt(60 * scope.hour);
					modelValue += parseInt(scope.minute);
					ctrl.$setViewValue(modelValue);
					ctrl.$render();
				}
				
				scope.reset = function(){
					scope.day=0;
					scope.hour=0;
					scope.minute =0;
					//ctrl.$setViewValue(0);
					//ctrl.$render();
				}
				scope.reset();
				
			},
			template:'<div ng-show="permission!=\'r\'"><input type="text" ng-model="day" ng-change="changeMin()" class="inputText" style="width: 60px;" placeholder="天数" ht-validate="{number:true}"/><label>天</label>\
						<select  ng-model="hour" ng-change="changeMin()" class="inputText" style="width: 60px;height: 23px;" ng-options="hour as (hour) for hour in hourArr">\
						</select><label>小时</label>\
						<select ng-model="minute" ng-change="changeMin()" class="inputText" style="width: 60px;height: 23px;" ng-options="minute as (minute) for minute in minuteArr">\
						</select><label>分</label></div>\
				<div ng-show="permission==\'r\'"><span ng-bind="day"></span><label>天</label><span ng-bind="hour"></span><label>小时</label><span ng-bind="minute"></span><label>分</label></div></div>'   
		};
}

/**
 * ht-select-ajax
 * @param baseService
 * @returns {___anonymous58927_59464}
 */
function htSelectAjax(baseService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var option=attrs["htSelectAjax"];
			option=eval("("+option+")");
			if(scope.$root.$$childHead[option.field]) scope.$root.$$childHead[option.field]='';
			var query = option.url.indexOf('?')>-1?baseService.get(option.url):baseService.post(option.url);
			query.then(function(data){
				if(option.dataRoot){
					data = data[option.dataRoot];
				}
				scope[option.field] = data;
				scope.$root.$$childHead[option.field] = scope[option.field];
			});
		}
	};
}

/**
 * ht-dic 数据字典指令。
 * dictype：数据字典别名。
 */
function htDic($rootScope, baseService, dialogService){
	return {
		restrict: 'A',
		scope:{
			htDic:'='
    	},
    	template:'<div >\
		    		<div ng-show="permission==\'w\' || permission==\'b\'" class="dropdown">\
					<span ng-bind="dicData.value" readonly="readonly" type="text" class="form-control ht-input" style="width: 75%; float: left;margin-right:2px;padding: 6px;" placeholder="点击选择" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></span>\
							<a href="javaScript:void(0)" ng-click="dicClean()" class="btn btn-sm btn-primary fa fa-rotate-left" style="padding: 9px 10px;"></a>\
							<div class="dropdown-menu" style=" width: 80%; margin-left: 11px;">\
								<ul style="height:200px;overflow-y:auto;" id="{{treeId}}" class="ztree"></ul>\
							</div>\
					</div>\
					<div ng-show="permission==\'r\'" style="line-height:30px;">{{dicData.value}}</div>\
			   </div>',
		link: function(scope, element, attrs) { 
			element.removeClass();
			scope.permission =getPermission(attrs.permission,scope);
			var dicKey =attrs.dickey; //数据字典的类型
			var bind = attrs.bind;
			var resultfield = attrs.resultfield;
			
			var url=attrs.url|| "${portal}/sys/dataDict/v1/getByTypeKeyForComBo?typeKey="+dicKey;
			var keyName =attrs.keyName||"key";
			var valName=attrs.valName||"text";
			
			scope.treeId = parseInt(Math.random()*1000)
			scope.dicData={};
			scope.dicClean = function(){
				scope.dicData.value="点击选择";
				scope.htDic = "";
				if(bind){
        			var tmp='scope.$parent.$parent.'+bind+'="'+scope.htDic+'"';
        			eval(tmp);
        		}
				var treeObj = $.fn.zTree.getZTreeObj(scope.treeId);
				treeObj.cancelSelectedNode();
			}
        	scope.treeClick = function(event,treeId,treeNode){
        		scope.dicData.key =treeNode[keyName];
        		scope.dicData.value =treeNode[valName];
        		scope.htDic =scope.dicData.key;
        		if(bind){
        			try {
        				var tmp='scope.$parent.$parent.'+bind+'="'+scope.dicData.value+'"';
            			eval(tmp);
					} catch (e) {
						var tmp='scope.$parent.'+bind+'="'+scope.dicData.value+'"';
	        			eval(tmp);
					}
        		}
        		
        		!$rootScope.$$phase && $rootScope.$digest();
        		if(window.FORM_TYPE_=='mobile'){
        			$(element).find('a').css('margin-left',$(element).width()-40);
        			$(element).find('a').css('margin-top',-$(element).height());
        		}	
        		// 树隐藏
        		if(window.FORM_TYPE_!='mobile'){
        			$('#dropBody'+treeId).dropdown('close');
        		}else{
        			$.closeModal($('#popover'+treeId));
        		}
        	}
        	
        	scope.loadTree = function(){
        		var zTree = new ZtreeCreator(scope.treeId,url)
        		.setDataKey({idKey:keyName,name:valName})
 				.setCallback({onClick:scope.treeClick})
 				.setChildKey()
 				.setShowIcon(true);
        		if(window.FORM_TYPE_=='mobile'){
            		zTree.setOutLookStyle();
        		}
        		zTree.initZtree({},0,function(treeObj,treeId){
 					//树列表的dropBody初始化
 					if(window.FORM_TYPE_!='mobile'){
 						
 					}else{
 						$(".page").after($('#popover'+treeId));
 						$('#popover'+treeId).find('a').each(function(){
 							if($(this).find('span').length>1){
 								$($(this).find('span')[1]).css('text-overflow','ellipsis').css('overflow','hidden').css('max-width',$(document).width()-120).css('display','inline-block');
 							}
 						});
 					}
 					// 通过key 回显Value
 					if(scope.htDic){
 						//获取key 的那个Value
 						var node = treeObj.getNodesByFilter( function(node){ if(node[keyName]==scope.htDic) return true; else return false; },true);
 						if(node){
 							scope.dicData.key =node[keyName];
 			        		scope.dicData.value =node[valName];
 			        		if(bind){
 			        			var tmp='scope.$parent.$parent.'+bind+'="'+scope.dicData.value+'"';
 			        			eval(tmp);
 			        		}
 			        		!$rootScope.$$phase && $rootScope.$digest();
						}
 					}else{
 						scope.$apply(function(){
 			          		scope.dicData.value="点击选择";
 			        		});
 					}
				});
        	}
        	scope.loadTree();
		}
	};
}

/**
 * ht-bpm-image directive
 * @returns
 */
function htBpmImage(baseService, dialogService, $timeout){
	return {
		restrict : 'A',
		scope : {
			htBpmImage : "=",
		},
		controller : function($scope, $element, $timeout, $compile) {
			$scope.nodeOpinion = {
				opinionTemplate : '<ul class="opinion-container-ul no-padding">'
								 +'	<li ng-repeat="opinion in nodeOpinion.result.data">'
								 +'		<div class="m-sm">'
								 +'			<table class="table table-bordered">' 
								 +'				<tr><th width="90">任务名称</th>'
								 +'					<td width="150">{{opinion.taskName}}</td>'
								 +'				</tr>'
								 +'				<tr ng-show="opinion.auditor"><th>执行人</th>'
								 +'					<td><span class="owner-span">'
								 +'							<a href="javascript:void(0)" ng-click="showUserInfo(opinion.auditor)">{{opinion.auditorName}}</a>'
								 +'						</span>'
								 +'					</td>'
								 +'				</tr>' 
								 +'				<tr ng-show="!opinion.auditor">'
								 +'					<th>'
								 +'						<label class="fa fa-question-circle-o" tooltip-placement="right" uib-tooltip="有资格审批的用户及用户组"> 候选人</label>'
								 +'					</th>'
								 +'					<td><div class="owner-div">' 
								 +'							<span ng-repeat="qualfied in opinion.qualfieds" class="owner-span">'
								 +'								<a href="javascript:void(0)" ng-click="showDetail(qualfied)">{{qualfied.name}}</a>'
								 +'							</span>'
								 +'						</div>'
								 +'					</td>'
								 +'				</tr>'
								 +'				<tr><th>开始时间</th>'
								 +'					<td style="font-size:11px;">{{opinion.createTime | date:"yyyy-MM-dd HH:mm:ss"}}</td>'
								 +'				</tr>' 
								 +'				<tr><th>结束时间</th>'
								 +'					<td style="font-size:11px;">{{opinion.completeTime | date:"yyyy-MM-dd HH:mm:ss"}}</td>'
								 +'				</tr>' 
								 +'				<tr><th>审批用时</th>'
								 +'					<td>{{opinion.durMs | htDuration}}</td>'
								 +'				</tr>' 
								 +'				<tr><th>状态</th>'
								 +'					<td>{{opinion.statusVal}}</td>'
								 +'				</tr>' 
								 +'				<tr><th>意见</th>'
								 +'					<td>{{opinion.opinion}}</td>'
								 +'				</tr>' 
								 +'			</table>'
								 +'		</div>'
								 +'	</li></ul>',
				executorTemplate : '<div class="m-sm">'
								  +'	<table class="table table-bordered">'
								  +'		<tr><th width="120">状态</th>'
								  +'			<td width="150">未产生过任务</td>'
								  +'		</tr>' 
								  +'		<tr><th>'
								  +'				<label class="fa fa-question-circle-o" tooltip-placement="right" uib-tooltip="暂定的有审批资格的用户及用户组，实际候选人要在产生任务以后才能确定"> 暂定候选人</label>'
								  +'			</th>'
								  +'			<td><div class="owner-div">' 
								  +'					<span ng-repeat="qualfied in nodeOpinion.result.data" class="owner-span">'
								  +'						<a href="javascript:void(0)" ng-click="showDetail(qualfied)">{{qualfied.name}}</a>'
								  +'					</span>' 
								  +'				</div>'
								  +'			</td>'
								  +'		</tr>'
								  +'	</table>'
								  +'</div>'
			};

			// 显示用户及用户组信息
			$scope.showDetail = function(info) {
				if (!info)
					return;
				switch (info.type) {
					case "user":
						break;
					case "org":
						break;
					case "role":
						break;
					case "pos":
						break;
				}
			}

			// 编译模板
			$scope.compileContent = function(api) {
				if (!$scope.nodeOpinion.result)
					return;
				// 审批意见的模板
				if ($scope.nodeOpinion.result.hasOpinion) {
					// 将候选人的信息从字符串转换为json
					angular.forEach($scope.nodeOpinion.result.data, function(item) {
						if (item.qualfieds) {
							item.qualfieds = parseToJson(item.qualfieds);
						}
					});
					$scope.nodeOpinion.content = $compile($scope.nodeOpinion.opinionTemplate)($scope);
				}
				// 未审批任务也未产生任务的节点，显示节点执行人信息
				else {
					api.set('content.title', '节点设置详情');
					$scope.nodeOpinion.content = $compile($scope.nodeOpinion.executorTemplate)($scope);
				}
			}

			// 获取节点的审批详情
			$scope.getContent = function(event, api) {
				$timeout(function() {
					// 判断缓存里是否已经存在该节点的审批详情
					if (!$scope.nodeOpinion.content) {
						var url = "${bpmRunTime}/runtime/task/v1/nodeOpinion?instId="+$scope.htBpmImage.instId+"&nodeId="+$scope.htBpmImage.nodeId;
						baseService.get(url).then(function(result){
							$scope.nodeOpinion.result = result;
							// 获取到审批详情的json数据后与模板编译成html代码
							$scope.compileContent(api);
							api.set('content.text', $scope.nodeOpinion.content);
						});
					} else {
						api.set('content.text', $scope.nodeOpinion.content);
					}
					api.reposition();
				}, 100, false);
				return "正在获取内容";
			}
		},
		link : function(scope, element, attrs) {
			// 只有用户任务和会签任务才显示审批详情
			if (("USERTASK,SIGNTASK").indexOf(scope.htBpmImage.nodeType) == -1)
				return;
			var setting = {
				content : {
					text : scope.getContent,
					title : '任务审批详情'
				},
				hide : {
					event : 'mouseleave',
					leave : false,
					fixed : true,
					delay : 200
				},
				position : {
					viewport: $('#divContainer'),
					my : 'left top',
					at : 'bottom right'
				},
				style : {
					classes : 'qtip-default qtip qtip-bootstrap qtip-shadow'
				}
			};
			$timeout(function(){
				// 添加tooltip显示审批详情
				element.qtip(setting);
			}, 1);
		}
	};
}

/**
 * ht-bind-html directive
 * @returns
 */
function htBindHtml($compile){
	return {
		restrict : 'A',
		link : function(scope, elm, attrs) {
			scope.unbindWatch = scope.$watch(attrs.htBindHtml, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if(newVal){
                        elm.data('unbindWatchTag',true);
                        elm.html(newVal);
                        scope.htmlFn&&scope.htmlFn.call();
                        $compile(elm)(scope);

        				if(window.ngReady){
        					window.setTimeout(function(){window.ngReady(scope);},10);
        				}
        				
                    }
                    else{
                        elm.html('');
                        //避免重复添加监视
                        elm.data('unbindWatchTag')&&scope.unbindWatch();
                    }
                }
            });
		}
	};
}

/**
 * ht-frame-form 指令，实现加载url表单的功能
 * @returns
 */
function htFrameForm(bpm, baseService, $state, $rootScope, $templateFactory, $q, $ocLazyLoad, $compile){
	return {
		restrict:"A",
		require : '?ngModel', 
		link:function(scope, element, attrs, ngModel){
			if(!ngModel) return;
			
			ngModel.$render = function () {
				if(!ngModel.$modelValue) return ;
				if(ngModel.$modelValue.type!="FRAME") return;
				var stateReg = /^(\w+\.?\w*)(\(\{.*\}\))?$/;
				
				var url = ngModel.$modelValue.formValue,
					match = stateReg.exec(url);
				// 符合ui-router中state的命名规范，说明使用的是本平台生成的页面
				if (match != null) {
					var state = match[1],
						params = match[2],
						s = $state.get(state);
					if(!s){
						throw new Error("There is no state '"+state+"' exist in ui-router.");
					}
					var deferred = $q.defer();
					$templateFactory.fromConfig(s).then(function(r){
						element.html("<div>" + r + "</div>");
						var p = angular.noop();
						if(s.resolve && s.resolve.loadPlugin){
							p = s.resolve.loadPlugin($ocLazyLoad); 
						}
						else{
							p = true;
						}
						$q.when(p).then(function(){
							var $new = $rootScope.$new();
							if(params){
								if(typeof params=='string'){
									params = $new.$eval(params);
								}
								$new['pageParam'] = params;
							}
							$compile(element.contents())($new);
						});
					});
					return;
				}
				else if(!url.startWith("http") && !url.startWith("https")){
					var ctx = getContext().web;
					url = ctx + url;
				}
				var frameObj=$("<iframe id='frmFrame' name='frmFrame' frameborder='0' scrolling='no' src="+url +"></iframe>")
				//将表单加载到系统中
				element.append(frameObj);
			}
		}
	};
}

function templateAlias($compile,baseService){
	return {
		restrict : 'A',
		link : function($scope, elm, attrs) {
			$scope.data = {};
			$scope.alias = attrs.templateAlias;
			$scope.columnReload  = function(curAlias){
				var url= "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getData?alias="+curAlias+"&params=";
				baseService.post(url,{}).then(function(rep){
					$scope.data[curAlias] = {};
					$scope.html = rep.html;
					$scope.requestType = rep.requestType ? rep.requestType : 'POST';
					//post请求参数
					var dataParams = {};
					//get请求参数
					var urlParam = '';
					var dataParam = rep.dataParam;
					if(dataParam){
						dataParam =  parseToJson(dataParam);
						var isMany = dataParam.length > 1;
						for (var i = 0; i < dataParam.length; i++) {
							var value = dataParam[i]['value'];
							var name = dataParam[i]['name'];
							if($scope.requestType=='POST'){
								try { value = parseToJson(value);} catch (e) {}
								if(isMany){
									dataParams[name] = value;
								}else{
									dataParams = value;
								}
							}else{
								urlParam = i>0? urlParam + '&'+name+'='+value : '?'+name+'='+value;
							}
						}
					}
					$scope.dataFrom = rep.dataFrom;
					if($scope.requestType&&$scope.requestType=='POST'){
						baseService.post($scope.dataFrom,dataParams).then(function(result){
							$scope.data[curAlias] = result;
						});
					}else{
						baseService.get($scope.dataFrom+urlParam).then(function(response){
							$scope.data[curAlias].data = result;
						});
					}
				});
			}
			
			$scope.columnReload($scope.alias);
		}
	};
}


/**
 * 布局设计面板
 */
function layoutDesignPanel($compile){
	return {
		restrict : 'A',
		require: 'ngModel',
		link : function(scope, elm, attrs, ngModelCtrl) {
			ngModelCtrl.$formatters.push(function(value){
				var ary = scope.$eval(attrs.bind);
				if(ary && ary.length > 0){
					elm.empty();
					angular.forEach(ary, function(item){
						var div = $(item.templateHtml);
						div.attr("layout-id", item.id);
						elm.append(div);
					});
				}
				return true;
			});
		}
	};
}

/**
 * 
 *  需要在路由配置资源 'css/plugins/zTree/metroStyle.css',
 *		         'js/plugins/zTree/jquery.ztree.min.js'
 *		         
 *	 ht-tree-select='dicConfig
 *   scope.dicConfig={
 *      key：用于保存的key   默认id   选填
 *      name:显示的名称   默认name  选填
	    url:"${portal}/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE", 必填
	    treeConf: ztree相关配置 。默认treeConf:{enable: true,idKey: "id",pIdKey: "parentId"} 选填
	    showChildVal:'1' //传入后，只会显示该key值下的分类, 和hideRoot 2选一  选填
	    hideRoot: true/false 选择父节点key值为-1的隐藏。默认key为parentId。自定义需要配置treeConf.pIdKey  选填
	    readOnly:是否只读 默认false. true的时候 treeConf、showChildVal，hideRoot不用配置。配了也没用 选填
	}
 * @param $rootScope
 * @param baseService
 * @returns {___anonymous66203_70202}
 */
function htTreeSelect($rootScope,baseService) {
	return {
		restrict: 'A',
		scope:{
			htTreeSelect:'='
    	},
    	require: '?ngModel',
    	template:'<div ng-if="!htTreeSelect.readOnly" class="dropdown">\
					 <span  ng-click="showTree($event)" ng-bind="dicData.value" readonly="readonly" type="text" class="form-control" style="width: 75%; float: left;margin-right:2px;" placeholder="点击选择"></span>\
    		          <button type="button" class="btn btn-primary btn-sm" ng-click="dicClean()"><i class="fa fa-rotate-left"></i> 清除</button>\
					  <ul ng-show="isShowTree" style="max-height:200px;overflow-y:auto;width: 80%;display: inline-block;margin-top: 5px;" id="{{treeId}}" class="dropdown-menu ztree" ></ul>\
				  </div>\
    		      <span ng-if="htTreeSelect.readOnly" ng-bind="dicData.value"></span>',
		link: function(scope, element, attrs,ctrl) { 
			
			element.removeClass();
			if(!scope.htTreeSelect) return;
			var bind=attrs.ngModel;
			var url=scope.htTreeSelect.url;
			scope.htTreeSelect.readOnly=scope.htTreeSelect.readOnly ?true : false;
			var keyName =scope.htTreeSelect.key||"id";
			var valName=scope.htTreeSelect.name||"name";
			var isSpecial=false;//对于展开按钮特殊标记。标记为true时，点击页面属性选择不消失
			var isInitName=false;//是否初始化成功name.以防值变动时频繁递归
			scope.treeId = parseInt(Math.random()*1000)
			scope.isShowTree=false;
			scope.dicData={};
			
			scope.dicClean = function(){
				scope.dicData.value="点击选择";
				scope.htDic = "";
				if(bind){
					var tmp='scope.$parent.'+bind+'="'+scope.dicData.value+'"';
        			eval(tmp);
        		}
			}
        	
			//点击span框。显示树型选择
			scope.showTree = function(e){
				e.stopPropagation();
				scope.isShowTree=true;
			}
			
			//全局添加点击监听。只要不是特殊标记的，一律隐藏树形框
			$('#wrapper').on('click',function(){
				if(isSpecial){
					isSpecial=false;
				}else{
					if(scope.isShowTree){
						scope.isShowTree=false;
						!scope.$$phase && scope.$digest();
					}
				}
			})

        	scope.loadTree = function(){
				var conf={
    					enable: true,
    					idKey: "id",
    					pIdKey: "parentId"
    				};
				if(scope.htTreeSelect.treeConf) simpleData= angular.extend(conf,scope.htTreeSelect.treeConf)
        		scope.config={data: {
    				simpleData:conf
    			}}
        	   scope.config["callback"] = manageEvents(scope, element, attrs);
        	   var initData='';
        	   baseService.get(url).then(function(data){
        			if(data){
        				 if(bind){
        	   					var initValue=eval('scope.$parent.'+bind);
        	           			if(initValue ==''){
        	           				scope.dicData.value="点击选择";
        	           			}else{
        	           				getInitName(initValue,data);
        	           			}
        	           			//此处为了防止初始值在ztree创建完成之后才获取到，所以直接从data中取
        	           			scope.$parent.$watch(bind,function(newVal,oldVal){
        	           				if(newVal && newVal !=oldVal) getInitName(newVal,data); 
        	           			});
        	   				 }
        				if(!scope.htTreeSelect.readOnly){
        					if(scope.htTreeSelect.showChildVal){
            					data=getChild(scope.htTreeSelect.showChildVal,data);
            				}else if(scope.htTreeSelect.hideRoot){
            					data=getRootChild(data);
            				}
            				var zTree = $.fn.zTree.init($("#" + scope.treeId), scope.config, data)
        				}
        				 
        			}
        			
				});
        	}
			
			//递归。根据值找Child
			function getChild(childVal,data){
				if(!childVal || !data) return;
				for(var i=0,d;d=data[i++];){
					if(d){
						if(d[keyName]==childVal)return d.children;
					}
				}
			}
			//寻找父key值为-1的，
			function getRootChild(data){
				var parentKey=scope.htTreeSelect.treeConf && scope.htTreeSelect.treeConf.pIdKey ?scope.htTreeSelect.treeConf.pIdKey :'parentId';
				if(!data) return;
				for(var i=0,d;d=data[i++];){
					if(d){
						if(d[parentKey]=='-1')return d.children;
					}
				}
			}
            
			//递归。根据key找name
			function getInitName(val,data){
				if(!val || !data || isInitName) return;
				for(var i=0,d;d=data[i++];){
					if(d){
						if(d[keyName]==val){
							scope.dicData.key =val;
	    	        		scope.dicData.value =d[valName];
	    		        	!$rootScope.$$phase && $rootScope.$digest();
	    		        	isInitName=true;
	    		        	return;
						}
						if(d.children) getInitName(val,d.children);
					}
				}
			}
            function manageEvents(s, e, a) {
            	var events = {};
                events['onClick'] = function(event,treeId, treeNode){ 
                	scope.isShowTree=false;
                	scope.dicData.key =treeNode[keyName];
            		scope.dicData.value =treeNode[valName];
            		if(bind){
						var tmp='scope.$parent.'+bind+'="'+scope.dicData.key+'"';
	        			eval(tmp);
            		}
            		!$rootScope.$$phase && $rootScope.$digest();
            	};
            	
            	//对于节点展开特殊处理。此处阻止事件冒泡没用，用一个变量标记不关闭。
            	events['beforeExpand'] = function(){ 
            		isSpecial=true;
            	};
            	//对于节点闭合特殊处理。标记不关闭
            	events['beforeCollapse'] = function(){ 
            		isSpecial=true;
            	};
            	
                return events;
            }
        	scope.loadTree();
		}
	};
};

/**
 * 分类选择器 
 * <div class="col-sm-4" ht-sys-type type-id="data.typeId" type-name="data.type" group-key="FORM_TYPE" ></div>
 */
function htSysType($rootScope,dialogService){
	return {
		restrict: 'A',
		replace: true,
		scope:{
			typeId: '=',
			typeName: '='
    	},
    	template:'<div class="input-group">\
					<input aria-required="true" readonly class="form-control input-sm" type="text" ng-model="typeName" ht-validate="{required:true,maxlength:60}"/>\
					<div class="input-group-btn">\
						<button class="btn btn-sm" ng-click="selectType();"><i class="fa fa-search"></i></button>\
					</div>\
    			</div>',
		link: function(scope, element, attrs) {
			var groupKey = attrs.groupKey;
			var pageParam = {groupKey: groupKey};
			
			scope.selectType = function(){
				dialogService.page("systype-selector", {area:['300px', '600px'],pageParam: pageParam})
				 .then(function(result){
					 scope.typeId = result[0].id;
					 scope.typeName = result[0].name;
				 });
			}
			
		}
	};
}

/**
 * 下拉选择框。
 * 属性说明：
 * 	ht-select：指令 属性值为scope的数据路径。
 *  permission：权限，值为r,w
 *  options:可选值
 * <select ht-form-select="data.main.hobbys" permission="w" ng-model=""></select>
 */
function htFormSelect() {
	 return {
		restrict : 'AE',
		require: "ngModel",
		scope:{
			htFormSelect:"="
		},
		link: function(scope, element, attrs,ctrl){
			var permission = getPermission(attrs.permission,scope);
			var aryOptions=eval(attrs.options);
			var isMultiple =attrs.multiple!=undefined;
			var filedname = attrs.filedname;
			
			if(permission == 'n'){
				element.hide();
			}else if(permission=='r'){
				var value = scope.htFormSelect;
				if(!value){
					element.hide();
					return;
				}
				
    			if(isMultiple) {
    				value=value.split(",");
    			}else{
    				value=new Array(value+""); 
    			}
    			
    			var text=[];
				for (var int = 0,val;val=value[int++];) {
					text.push( $("option[value='"+val+"']",element).text());
				}
				if(isMultiple && window.FORM_TYPE_ =='mobile') {
					element.parent().after(text.join(",")).hide();
					$("#"+filedname).hide();
    			}else{
    				element.after(text.join(",")).hide();
    			}
    		}else{
    			
    			if(window.FORM_TYPE_!='mobile'){//pc端
        			$.isFunction($.fn.select2) && $(element).select2({
    				language: "zh-CN", 
    				placeholder: isMultiple?"请选择...":null,
    				initSelection: function(element, callback) {
    	                    var data = [];
    	                    var value = scope.htSelects;
    	                    if(value){
    	                    	//防止当value只有一个值且为数字时 split函数报错
    	                    	if(!isNaN(value)) value = value.toString();
    	                    	var arr = value.split(",");
    	                    	for(var idx=0;idx<arr.length;idx++){
    	                    		var text = $(element).find("[value="+arr[idx]+"]").text();
    	                    		data.push({id:arr[idx],text:text});
    	                    	}
    	                    	callback(data);
    	                    }else{
    	                    	callback([{id:'',text:'请选择'}]);
    	                    }
    	            }});
        		}else{//手机端
        			var selectedStr = ""
            			var selectedVal = scope.htFormSelect;
            			if(selectedVal){
            				var arr = selectedVal.split(",");
            				var len = 0;
                        	for(var idx=0;idx<arr.length;idx++){
                        		len++;
                        		var text = $(element).find("[value="+arr[idx]+"]").text();
                        		$(element).find("[value="+arr[idx]+"]").attr("selected","selected");
                        		if(len == arr.length){
                        			selectedStr += text;
                        		}else{
                        			selectedStr += text +",";
                        		}
                        	}
                        	$("#"+filedname).val(selectedStr);
            			}
            			
            			$(element).mobiscroll().select({
            		        theme: 'ios',
            		        lang: 'zh',
            		        display: 'bottom',
            		        minWidth: 200,
            		        group: true,
            		      //点击确定是把获取的值赋值给自己书写的input标签
            		        onSet:function(obj,inst){
            		            $('#'+filedname).val(obj.valueText);
            		        }
            		    });
            			 //点击input 触发select组件
            			 $("#"+filedname).click(function() {
            			     $(element).mobiscroll('show');
            			     return false;
            			 });
        		}
    			
    		}
			
			if(!isMultiple) return;
			ctrl.$formatters.push(function(value){
				 if(value){
					 return value.split(",");
				 }
				 return []
			});
	        ctrl.$parsers.push(function(value){
	        	 if(value&&value.length>0){ 
	        		 return value.join(",");
	        	 }
	        	 return "";
	        });
		}
	 }	
}


/**
 *  日期控件 ht-date
 * <input ht-date permission="w"  mobiscroll-date />
 * 
 * mobiscroll-time: 时间选择
 * mobiscroll-datetime: 日期时间
 * mobiscroll-date: 日期
 * **/
function htDate() {
	return {
		restrict : 'A',
		require : "ngModel",
		scope:{
			ngModel:"="
		},
		link : function(scope, element, attrs, inputCtrl) {
			var format = attrs.htDate || "yyyy-MM-dd";
			format = format.replace("HH","hh");
			var showCurrentDate = attrs.showCurrentDate || false;
			var mobiscrollDate = attrs.mobiscrolldate;
			attrs.$observe("htDate",function(newVal,oldVal){
				if(newVal){
					format = newVal;
					format = format.replace("HH","hh");
					if(showCurrentDate && !inputCtrl.$modelValue.length ){
						element.val( new Date().format(format));
						scope.ngModel = element.val();
					}
				}
			});
			
			
			inputCtrl.$render = function(){
				var v =	inputCtrl.$modelValue; 
            	if(v){
            		if(/^\d{13}$/.test(v)){
            			try{
            				var newDate = new Date();
            				newDate.setTime(v);
            				element.val(newDate.format(format));
            			}catch(e){}
            		}
            		else{
            			element.val(v);
            		}
            	}
            	else{
            		element.val("");
            	}
            };
			var permission=getPermission(attrs.permission,scope);
			if(permission=="w" || permission=="b"){
				//pc情况
				if(window.FORM_TYPE_!='mobile'){
					element.addClass("dateformat");
					return;
				}else{
					var now = new Date();
					// opt基本参数信息
					var opt = {
							theme:"ios",
							lang:"zh",
							buttons: ['set', { 
						        text: '清空',
						        cssClass: 'clearBtn', 
						        handler: 'clear'
						    },'cancel'],
							cancelText:"取消",
							endYear: new Date(now.getFullYear()+100)
				        };
					
					if(mobiscrollDate == "date"){
						now = now.Format("yyyy-MM-dd");
						$(element).mobiscroll().date(opt);
					}else if(mobiscrollDate == "datetime"){
						now = now.Format("yyyy-MM-dd hh:mm:ss");
						$(element).mobiscroll().datetime(opt);
					}else{
						now = now.Format("hh:mm:ss");
						$(element).mobiscroll().time(opt);
					}
					
					if(showCurrentDate){
						$(element).val(now);
						$(element).attr("value",now);
						scope.ngModel = now;
					}
				}
				//view to model
				inputCtrl.$parsers.push(function(value){
					//数据为时间时进行处理。
					if(value && value instanceof Date){
						if(attrs.mobiscrollDatetime){//不知道为什么最初设计要将秒置为00，这样导致日期计算时不能拿到秒进行计算
							value= value.Format("yyyy-MM-dd hh:mm:ss");
		        			 return value;
						}
						else if(attrs.mobiscrollDate){
							value= value.Format("yyyy-MM-dd") ;
		        			 return value;
						}
						else if(attrs.mobiscrollTime){
							value= value.Format("hh:mm:ss") ;
		        			 return value;
						}
					}
					return value;
	             }); 
				 return;
			}
			if(permission=="r"){
				element.after(formatDate());
			}
			element.hide();
			
			function formatDate(){
				if(/^\d{13}$/.test(scope.ngModel)){
    				var newDate = new Date();
    				newDate.setTime(scope.ngModel);
    				scope.ngModel = newDate.format(format);
        		}
				if(showCurrentDate && !scope.ngModel ){
					element.val( new Date().format(format));
					scope.ngModel = element.val();
					inputCtrl.$modelValue = scope.ngModel;
				}
        		return scope.ngModel;
			}
		}
	};
}

/**
 * 功能说明：
 *  单选按钮指令
 * 	ht-radios：指令名称，值为数据路径
 *  permission：权限 w,可写,r只读。
 *  values：单选框对应的值
 * <div ht-radios="data.color" permission="w">
 * 		<label class="radio-inline">
 * 			<input type="radio" value="1" ng-model="">啊
 * 		</label>
 * </div>
 * <div 
 */
function htRadios() {
    return {
    	restrict : 'A',
    	scope:{
    		htRadios:'='
    	},
    	link: function(scope,element,attrs){
    		var permission=getPermission(attrs.permission,scope);
    		
    		if(permission =='n'){
    			element.remove();
    		}
    		else if(permission =='r'){
    			var val=scope.htRadios;
    			if(val){
    				var radio = $("input[value='"+val+"']",element);
    				radio&&element.html(radio.parent().text());
    			}
    			else element.hide(); 
    		}
        }
    }
}

/**
 * 汉字转拼音，例如 A 填写了 你好，当A失去焦点时，B自动填充为nh fullpinyin:1 全拼，不填0默认首字母 
 * eg: 
 * <input  type="text" ng-model="chinese" value=汉字/> 
 * <input type="text" ng-model="pingyin"  ht-pinyin="chinese" type="0" fullpinyin="1"/>
 */
function htPinyin(baseService){
	return {
		restrict : 'A',
		require : "ngModel",
		scope : {
			ngModel : "="
		},
		link : function(scope, elm, attrs) {
			var type = attrs.fullpinyin || 0;

			// 利用jq方法绑定失去焦点事件
			$("[ng-model='" + attrs.htPinyin + "']", elm.parent().closest(".ng-scope")).blur(function() {
				if (elm.val()){return;}
				
				var obj = $(this);

				var value = obj.val();
				if (!value){return;}

				var rtn = baseService.get("${uc}/base/tools/v1/getPinyin?chinese="+value+"&type="+type);
				rtn.then(function(data) {
					scope.ngModel = data.value;
					//延迟触发blur,ngModel 还未将值设置进input
					window.setTimeout(function(){
						elm.trigger("blur");
					},100);
				}, function(errorCode) {
				});
			});
		}
	};
}

/**
 * 表单使用 htCheckboxs：
 * 
 * 属性说明：
 * ht-checkboxs:对应scope中的数据。
 * permission：权限 r,w
 * values:选项数据为一个json
 * 使用示例:
 * <div ht-checkboxs="data.users" permission="w" defualtvalue="">
 *   <lable><input type="checkbox" value="1"/>红</lable>
 * </div>
 */
function htCheckboxs($rootScope,commonService) {
	/*checkBox 选中事件**/
	handChange__=function(event){
		var scope=event.data.scope;
		var aryChecked=event.data.aryChecked;
		var isArray=event.data.isArray;
		commonService.operatorAry(this.value,this.checked,aryChecked);
		scope.htCheckboxs=isArray?aryChecked:aryChecked.join(",");
		$rootScope.$digest();
	}

    return {
    	restrict : 'A',
    	scope:{
    		htCheckboxs:"="
    	},
    	
    	link: function (scope, element, attrs){

    		/*权限 begin */
    		var permission=getPermission(attrs.permission,scope);
    		if(permission == 'n') {
    			element.remove();
    			return;
    		}
    		if(permission == 'r'){
    			if(scope.htCheckboxs){
    				var values = scope.htCheckboxs.split(",");
    				var text = "";
    				for(var i=0,val;val=values[i++];){
    					if(!val) continue;
    					var checkBox = $("input[value='"+val+"']",element);
    					if(checkBox.length>0){
    						text =text+ checkBox.parent().text();
    						if(i != values.length)text=text+",";
    					}
    				} 
    				element.after(text);
    			}
    			element.hide();
    			return;
    		}/*权限 end */
    		
    		var name=attrs.htCheckboxs;
        	//选中的值
        	var aryChecked=[];
        	var isArray=true;
        	
    		var val=scope.htCheckboxs||"";
    		if(typeof val == "string"){
    			//初始化
    			if(val!=""){ aryChecked=val.split(","); }
    			isArray=false;
    		}
    		var chkObjs=$("input",element);
    		//遍历相同名称的checkbox，初始化选中和绑定change事件。
    		for(var i=0;i<chkObjs.length;i++){
    			var obj=$(chkObjs[i]);
    			commonService.isChecked(obj.val(),aryChecked) && obj.attr("checked",true);
    			obj.bind("change",{scope:scope,isArray:isArray,aryChecked:aryChecked} ,handChange__)
    		}
        }
    }
}

/**
 * 选择器指令 ht-selector
 */
function htSelector($rootScope, baseService, dialogService){
	return {
    	restrict : 'AE',
    	template: '<div ng-if="permission==\'w\' || permission==\'b\'" class="selector-container">\
			    		<ul class="tag-list">\
			    			<li ng-repeat="item in names track by $index">\
		    					<a href>\
		    						<i class="fa fa-user"></i> {{item}}</a>\
			    			</li>\
			    		 </ul>\
    					<a class="btn btn-primary fa fa-user" ng-click="showDialog()">选择</a>\
				    </div>\
				    <div ng-if="permission==\'r\'" class="selector-container" >\
				    	<ul class="tag-list">\
				    		<li ng-repeat="item in names track by $index">\
					    		<a href>\
								<i class="fa fa-user"></i> {{item}}</a>\
				    		</li>\
				    	 </ul>\
				    </div>',
    	scope: {
    		htSelector:'='
    	},
        link: function($scope, element, attrs) {
        	element.removeClass();
        	$scope.permission=getPermission(attrs.permission,$scope);
        	//绑定配置
        	var selector = $scope.$eval(attrs.selectorconfig);
        	//绑定配置
        	var bind=selector.bind;
        	//显示字段。
        	var display=selector.display;
        	// 除去掉无效的bind 
        	for(var key in bind){
        		if(!bind[key].split(".")[1]) delete bind[key] //如果当前bind 不是 data.table.xx /item.field 则移除
        		if(bind[key] == attrs.htSelector){
        			display = key; //display 展示字段等于当前控件的填充值
        		}else if((bind[key] && bind[key].indexOf('.sub_')>-1)){
        			var subs = bind[key].split('.');
        			var selrs = attrs.htSelector.split('.');
        			if(subs[subs.length-1]==selrs[selrs.length-1]){
        				display = key; //display 展示字段等于当前控件的填充值
        			}
        		}
        	}
        	
        	//是否单选
        	$scope.data={};
        	$scope.firstInit = true;//是否第一次执行initData函数
        	
        	//将控件数据初始化到指定本地域中。
        	$scope.initData=function(){
        		var userinfo = null;
        		var deptinfo = null;
        		var postinfo = null;
    			if("UserDialog" == selector.type && selector.showCurrentUserName){
    				if( $(element).data("userinfo"))  return ;
    				baseService.get(__ctx+"/org/user/getCurrentUser").then(function(data){
    					if(data.message!=''){
    						var message = JSON.stringify(data.message);  
        					message = JSON.parse(message); 
        					userinfo = eval("("+message+")");
        					userinfo.name = userinfo.fullname;
        					$(element).data("userinfo",userinfo);
    					}
    				});
    			}
    			if("OrgDialog" == selector.type && selector.showCurrentUserDeptName){
    				if( $(element).data("deptinfo"))  return ;
    				baseService.get(__ctx+"/org/org/getCurrentUserDept").then(function(data){
    					if(data.message!=''){
	    					var message = JSON.stringify(data.message);  
	    					message = JSON.parse(message); 
	    					deptinfo = eval("("+message+")");
	    					$(element).data("deptinfo",deptinfo);
    					}
    				});
    			}
    			if("PostDialog" == selector.type && selector.showCurrentUserPostName){
    				if( $(element).data("postinfo"))  return ;
    				baseService.get(__ctx+"/org/org/getCurrentUserPost").then(function(data){
    					if(data.message!=''){
	    					var message = JSON.stringify(data.message);  
	    					message = JSON.parse(message); 
	    					postinfo = eval("("+message+")");
	    					$(element).data("postinfo",postinfo);
    					}
    				});
    			}
    			setTimeout(function(){//初始化编辑进来的boAttr
    				for(var key in bind){
                		var val = $scope.$parent.$eval(bind[key]);
                		if((bind[key] && bind[key].indexOf('.sub_')>-1)){
                			var subs = bind[key].split('.');
                			val = $scope.$parent.$eval(subs[0]+'.'+subs[subs.length-1]);
                		}
                		var aryVal=[];
                		$scope.data[key] = [];
                		if(val){
                			aryVal=val.split(","); 
                			//数据存放local变量data中。
                    		$scope.data[key]=aryVal;
                		}else{
                			if(userinfo){
	                			aryVal[0] = userinfo[key];
	                			$scope.data[key] = aryVal;
                			}
                			if(deptinfo){
                				aryVal[0] = deptinfo[key];
	                			$scope.data[key] = aryVal;
                			}
                			if(postinfo){
                				aryVal[0] = postinfo[key];
	                			$scope.data[key] = aryVal;
                			}
                		}
    				}

            		$scope.render();
            		$scope.updScope();
    			}, 500);
        	}
        	
        	//对值进行双向绑定
        	$scope.$watch('htSelector',  function(newValue, oldValue) {
        		if(newValue!=oldValue){
        			$scope.initData();
        			$scope.render();
        		}
        	});
        	
        	//数据展示
        	$scope.render=function(){
        		$scope.names=$scope.data[display];
        	}
        	
        	//展示对话框
        	$scope.showDialog = function(){
        		var initData=[];
        		if(!$scope.data[display]){
        			dialogService.fail("该字段所对应bo属性未绑定到返回值");
        		}
        		for(var i=0;i<$scope.data[display].length;i++){
        			var obj={};
        			for(var key in bind){
        				obj[key]=$scope.data[key][i];
        			}
        			initData.push(obj);
        		}
        		
        		dialogService.page(selector.type, {area:['1120px', '650px'], pageParam: {single: selector.isSingle, data: initData}})
							 .then(function(result){
								 $scope.dialogOk(result);
							 });
        	}
        	
        	//更新值到父容器
        	$scope.updScope =function(){
        		for(var key in bind){
    				var dataStr = $scope.data[key]?$scope.data[key].join(","):"";//以逗号分隔数据
        			var tmp='$scope.$parent.'+bind[key]+'="'+dataStr +'"';
        			if((bind[key] && bind[key].indexOf('.sub_')>-1)){
            			var subs = bind[key].split('.');
            			tmp='$scope.$parent.'+subs[0]+'.'+subs[subs.length-1]+'="'+dataStr +'"';
            		}
        			eval(tmp);
        		}
        		$scope.render();
        		!$rootScope.$$phase && $rootScope.$digest();
        	}
        	
        	//选择完成
        	$scope.dialogOk = function(returnData){
        		var maxWidth=$(element).width()-40;
        		//将选择的值更新到data{[],[],}中
        		//先初始化防止报空
        		if(!returnData)returnData=[];
        		$scope.data = {};
        		for(var key in bind) $scope.data[key]=[];
        		
        		for(var i=0,object;object=returnData[i++];){
        			for(var key in bind){
            			$scope.data[key].push(object[key])
            		}
        		}
        		$scope.updScope();
        		$(element).find('span.textSpan').css('max-width',maxWidth);
        	};
        	
        	//初始化数据
        	$scope.initData();
        	//显示数据。
        	$scope.render();	
        }
    };
}

/**
 * 自定义查询 联动下拉框。
 * {'alias':'searchUser','valueBind':'userId','labelBind':'account','bind':{'account_':'data.spxsxxb.spmc'}}
 * <ht-ganged-select-query="{上面的json}" options={}>
 */
function htGangedSelectQuery(baseService, dialogService){
	 return {
		restrict : 'AE',
		require: "ngModel",
		scope:{
			ngModel:"="
		},
		link: function(scope, element, attrs,ctrl){
			var permission = getPermission(attrs.permission,scope);
			var isMultiple =attrs.multiple!=undefined;
			if(permission == 'n'){
				element.hide();
			}
			
			var htSelectQuery=eval("(" + attrs.htGangedSelectQuery +")");
			var gangedBind = htSelectQuery.gangedBind;
        	if(gangedBind){
        		scope.gangedBind = parseToJson(gangedBind);
        	}
			scope.labelKey = htSelectQuery.labelBind;
			scope.valueKey =htSelectQuery.valueBind;
			scope.option =[];
			scope.queryData = {};
			
			// 初始化param
			var param ={};
			for(key in htSelectQuery.bind){
				param[key] =eval("scope.$parent."+htSelectQuery.bind[key]);
			}
			
			//联动查询参数绑定
			function watchParam(){
				if(!htSelectQuery.bind)return;
				for(bindKey in htSelectQuery.bind){
					scope.$parent.$watch(htSelectQuery.bind[bindKey],
						function(newValue,oldValue,scope){
							if(newValue!=oldValue){
								loadOptions(htSelectQuery.bind[bindKey],newValue); 
							}
						}
					)
				}
			}
			function loadOptions(exp,value){
				if(exp)
				for(key in htSelectQuery.bind){
					if(htSelectQuery.bind[key]==exp){
						param[key] =value;
					}
				}
				var queryParam = {alias:htSelectQuery.alias};
				queryParam.querydata = param;
				
				scope.options=[];
				//级联设置初始化加载，如果设置了传参但未传参时不加载选项
				try {
					for ( var pa in param) {
						if(!param[pa]&&htSelectQuery.bind[pa]!=attrs.ngModel){
							return ;
						}
					}
				} catch (e) {}
				
				var labelKey = scope.labelKey;
				
				baseService.post('${form}/form/customQuery/v1/getByAlias',htSelectQuery.alias).then(function(customQuery){
					//初始化为select2
					var queryUrl = customQuery.dsType=='dataSource'?'${form}/form/customQuery/v1/doQueryBase64?alias='+queryParam.alias:customQuery.url;
					var requestType = customQuery.requestType?customQuery.requestType:'GET';
					$.fn.select2.defaults.set('width', '100%');
					$.isFunction($.fn.select2) && $(element).select2({
	    				language: "zh-CN", 
	    				placeholder: null,
	    				ajax : {
					     url : queryUrl,
						 type : requestType,
						 contentType: "application/json",
					     dataType: 'json',
					     delay : 250,// 延迟显示
					     data : function(params) {
							var pa = [];
							if(customQuery.dsType=='dataSource'){
								  if(typeof(params.term)!='undefined'){
									  pa.push({'key':labelKey,'value':params.term});
								  }
								  if(queryParam.querydata){
									  for(key in queryParam.querydata){
										  pa.push({'key':key,'value':queryParam.querydata[key]})
									  }
								  }
							      return {
							       queryData : pa.length>0?$.base64.encode(JSON.stringify(pa),"utf-8"):"", // 搜索框内输入的内容，传递到Java后端的parameter为username
							       page : params.page?params.page:1,// 第几页，分页哦
							       rows : 10// 每页显示多少行
							      };
							}else if(customQuery.dsType=='restful'){
								var queryParams = getQueryParams(customQuery, queryParam.querydata, requestType, params.term?jQuery.trim(params.term):"",labelKey);
								return customQuery.dsType=='restful'&&requestType=='GET'?queryParams.param:JSON.stringify(queryParams.pa);
							}
					     },
					     // 分页
					     processResults : function(data, params) {
							var tableOrViewList = {};
							var total = data.total;
							if(data.constructor==Array){
				        		tableOrViewList.rows = data;
				        	}else if(data.constructor==Object){
				        		if(!data.rows){
				        			scope.customQueryData = data;
				        			tableOrViewList.rows = eval("(scope.customQueryData." + scope.prop.listKey +")");
				        		}else{
				        			tableOrViewList = data;
				        		}
				        		if(typeof total == "undefined"){
				        			total = eval("(scope.customQueryData." + scope.prop.totalKey +")");
				        		}
				        	}
					      params.page = params.page || 1;
						  var options = [];
						  $.each(tableOrViewList.rows,function(i,item){
							   var option ={}; option.id=item[scope.valueKey]; option.text =item[scope.labelKey];
							   options.push(option);
							   scope.queryData[item[scope.valueKey]] = item;
						  })
					      return {
					       results : options,// 后台返回的数据集
					       pagination : {
					        more : params.page < total// 总页数为10，那么1-9页的时候都可以下拉刷新
					       }
					      };
					     },
					     cache : false
					    },
	    				initSelection: function(element, callback) {
	    	                    var data = [];
	    	                    var value = scope.ngModel;
	    	                    if(value){
	    	                    	//防止当value只有一个值且为数字时 split函数报错
	    	                    	if(!isNaN(value)) value = value.toString();
//	    	                    	var arr = value.split(",");
//	    	                    	for(var idx=0;idx<arr.length;idx++){
//	    	                    		if(customQuery.dsType=='dataSource'){
//	    	                    			var pa1 = [];
//		    	                    		pa1.push({'key':scope.labelKey,'value':arr[idx]});
//			  	      						var param = {queryData:$.base64.encode(JSON.stringify(pa1),"utf-8"),page:1,rows:100};
//			  	      						$.ajax({
//				  	      						url:queryUrl,
//					  	      			        method:'GET',
//					  	      			        async:false,
//					  	      			        data:param,
//					  	      			        success:function(pageData){
//					  	      			        	if(pageData&&pageData.rows&&pageData.rows.length>0){
//					  	      			        		var rows = pageData.rows;
//					  	      			        		var val = eval('(scope.$parent.data.'+scope.gangedBind[scope.valueKey]+')');
//					  	      			        		for(var k=0;k<rows.length;k++){
//					  	      			        			if(rows[k][scope.valueKey]==val){
//					  	      			        				data.push({id:arr[idx],text:rows[k][scope.labelKey]});
//					  	      			        			}
//					  	      			        		}
//					  	      			        	}
//					  	      			        }
//			  	      						})
//	    	                    		}else{
//	    	                    			var pvalue = arr[idx];
//	    	                    			var queryParams = getQueryParams(customQuery, queryParam.querydata, requestType, pvalue, labelKey);
//	    									$.ajax({
//				  	      						url:queryUrl,
//					  	      					type : requestType,
//					  							contentType: "application/json",
//					  						    dataType: 'json',
//					  	      			        async:false,
//					  	      			        data:requestType=='GET'?queryParams.param:JSON.stringify(queryParams.pa),
//					  	      			        success:function(pageData){
//					  	      			        	var rows = [];
//						  	      			        if(pageData.constructor==Array){
//						  	      			        	rows = pageData;
//										        	}else if(pageData.constructor==Object){
//										        		if(!pageData.rows){
//										        			scope.customQueryData = pageData;
//										        			rows = eval("(scope.customQueryData." + scope.prop.listKey +")");
//										        		}else{
//										        			rows = pageData.rows;
//										        		}
//										        		
//										        	}
//							  	      			    for (var k = 0; k < rows.length; k++) {
//									        			if(rows[k][scope.valueKey]==pvalue){
//									        				data.push({id:arr[idx],text:rows[k][scope.labelKey]});
//									        				break;
//									        			}
//													}
//					  	      			        }
//			  	      						})
//	    	                    		}
//	    	                    		
//	    	                    	}
	    	                    	setTimeout(function(){
	    	                    		data.push({id:value,text:value});
	    	                    		callback(data);
	    	                    	},0);
	    	                    }else{
	    	                    	callback([{id:'',text:'请选择'}]);
	    	                    }
	    	            }}).on("change",function(e){
	    	            	if(scope.gangedBind){
	    	            		var gangedBind = scope.gangedBind;
	    	            		var selValue = eval('(scope.$parent.'+attrs.ngModel+')');
		    	            	if(scope.queryData){
		    	            		scope.$apply(function(){
		    	            			var bindVal = scope.queryData[selValue];
										if(bindVal){
											var itemDiv = $(element).parents().filter('[item-index]');
											var index = itemDiv.attr('item-index')?parseInt(itemDiv.attr('item-index')):0;
											$.each(gangedBind,function(key, val){
												try {
													var scopeData = eval('(scope.$parent.data)');
													if(typeof(bindVal)!='undefined'){
														var gdBindArray = gangedBind[key].split(".");
														if(gdBindArray.length>2){//子表
															var subData = eval('(scope.$parent.data.'+gdBindArray[0]+'.'+gdBindArray[1]+')');
															if(typeof(bindVal[key])=='number'){
																eval('(scope.$parent.data.'+gdBindArray[0]+'.'+gdBindArray[1]+'['+index+']'+'.'+gdBindArray[2]+'='+bindVal[key]+')');
															}else{
																eval('(scope.$parent.data.'+gdBindArray[0]+'.'+gdBindArray[1]+'['+index+']'+'.'+gdBindArray[2]+'="'+bindVal[key]+'")');
															}
														}else{//主表
															if(typeof(bindVal[key])=='number'){
																eval('(scope.$parent.data.'+gangedBind[key]+'='+bindVal[key]+')');
															}else{
																eval('(scope.$parent.data.'+gangedBind[key]+'="'+bindVal[key]+'")');
															}
														}
													}
												} catch (e) {console.info(e)}
											});
										}
		    	            		});
		    	            	}
	    	            	}
	    	            });
					
				});
				
			}
			
			function getQueryParams(customQuery, querydata, requestType, pvalue, labelKey){
				var pa = [];
				var param = {};
				var templatePa = customQuery.dataParam;
				if(requestType=='POST'&&templatePa){
					templatePa = templatePa.replace(new RegExp("\\{"+labelKey+"\\}","g"), pvalue);
				}else{
					if(requestType=='POST'){
						var param = {};
	                    param.key=labelKey;
	                    param.value=pvalue;
	                    pa.push(param);
					}else{
						param[labelKey] = pvalue;
					}
				}
				if(querydata){
					  for(key in querydata){
						  if(key!=labelKey){
							  if(requestType=='POST'&&templatePa){
									templatePa = templatePa.replace(new RegExp("\\{"+key+"\\}","g"), column.condition=='BETWEEN'&&column.endDate!=null?querydata[key]+"|"+column.endDate:querydata[key]);
								}else{
									if(requestType=='POST'){
										  pa.push({'key':key,'value':querydata[key]})
									  }else{
										  param[key] = querydata[key];
									  }
								}
						  }
						  
					  }
				}
				if(requestType=='POST'&&templatePa){
					pa = parseToJson(templatePa); 
		        }
				return {param:param,pa:pa};
			}
			
			loadOptions();
			watchParam();
			
			scope.isSelect = function(value){
				if(!ctrl.$modelValue) return false;
				if(!isMultiple)return ctrl.$modelValue==value;
				else return ctrl.$modelValue.indexOf(value)!=-1;
				
			}
			scope.handleReadPermission = function(){
				//只读处理
				if(permission=='r'){
					var value = scope.ngModel;
					try {
	     				element.after(value);
	 				} catch (e) {}
	 				element.siblings('span.select2').remove();
	     			element.remove();
					return;
	    		}
				if(permission=='n')	{ 
					element.siblings('span.select2').remove();
					$(element).remove(); 
				}
			}
			
			setTimeout(function(){
				scope.handleReadPermission();
        	},0); 
			//多选处理
			if(!isMultiple) return;
			ctrl.$formatters.push(function(value){
				 if(value) return value.split(",")
				 return []
			});
	        ctrl.$parsers.push(function(value){
	        	 if(value&&value.length>0) return value.join(",")
	        	 return "";
	        });
		},
		template:"<option value=''>请选择</option><option ng-repeat='option in options' value='{{option.val}}' ng-selected='isSelect(option.val)'>{{option.text}}</option>"
			       
}}
 
 

/**
 * 自定义查询 下拉框级联。
 * <input ht-query="status"  operation="in" multiple  ng-model='status' ht-cascade-select-query="{'name':'testprovince','binding':{'key':'ID_','value':'NAME_'},'query':{'condition':'PID_','trigger':'-1','initValue':'-1'}}" />
 */
 function htCascadeSelectQuery(baseService, dialogService){
	 return {
		restrict : 'AE',
		require: "ngModel",
		scope:{},
		link: function(scope, element, attrs,ctrl){
			var permission = getPermission(attrs.permission,scope);
			var isMultiple =attrs.multiple!=undefined;
			if(attrs.operation=='in') isMultiple=true;
			if(permission == 'n'){
				element.hide();
			}
			if(!attrs.htCascadeSelectQuery) return;
			
			scope.isSelect = function(value){
				if(!ctrl.$modelValue) return false;
				if(!isMultiple)return ctrl.$modelValue==value;
				else return ctrl.$modelValue.indexOf(value)!=-1;
				
			}
			
		  scope.getValue = function(value){
			  var selectDom=$(element).find('select');
			//如果对应的绑定字段有值则使用该值，没有值则判断设计时有没有输入预设值，有预设值则使用，没有则不做输入条件
			$(selectDom).html('');
			eval('(scope.$parent.'+scope.modelName+'="")');
			$.isFunction($.fn.select2) &&  $(selectDom).select2({
				language: "zh-CN", 
				placeholder: '请选择',
				multiple:true,
				data:[]
			});
			if(!value) return;
			var condition = query.condition;
			var querydataArr=[];
			querydataArr.push({
				key:query.condition,
				value:value
			})
			queryParam = {
				alias : queryJson.name,
				querydata : querydataArr,
				page : 0,
				pagesize : 0
			};
			
			//初始化为select2
			var queryUrl = '${form}/form/customQuery/v1/doQueryBase64?alias='+queryParam.alias;

			$.fn.select2.defaults.set('width', '100%');
			$.isFunction($.fn.select2) && $(selectDom).select2({
				language: "zh-CN", 
				placeholder: '请选择',
				multiple: isMultiple,
				minimumResultsForSearch: -1,
				ajax : {
					     url : queryUrl,
					     dataType: 'json',
					     delay : 250,// 延迟显示
					     data : function(params) {
						      return {
						       queryData : querydataArr.length>0?$.base64.encode(JSON.stringify(querydataArr),"utf-8"):"", 
						       page : params.page?params.page:1,// 第几页，分页哦
						       rows : 10// 每页显示多少行
						      };
					     },
					     // 分页
					     processResults : function(data, params) {
					      params.page = params.page || 1;
						  var options = [];
						  $.each(data.rows,function(i,item){
						       var queryValue = queryJson.binding.value;
			  			 	   var queryKey = queryJson.binding.key;
			  			 	   var option ={}; option.id=item[queryKey]; option.text =item[queryValue];
							   options.push(option);
						  })
					      return {
					       results : options,// 后台返回的数据集
					       pagination : {
					        more :false // 总页数为10，那么1-9页的时候都可以下拉刷新 params.page < data.total
					       }
					      };
					     },
					     cache : false
					    }
			       }).on("change",function(e){
	   	               var val= $(selectDom).val();
	   	               if(val&& val.length>0 ){
	   	            	   if(isMultiple) val=val.join(',');
	   	            	   scope.$parent[scope.modelName]=val;
	   	               }else{
	   	            	   scope.$parent[scope.modelName]='';
	   	               }
	   	               !scope.$parent.$$phase &&  scope.$parent.$digest();
	            });
				
			}
			scope.handleReadPermission = function(){
				//只读处理
				if(permission=='r'){
					var value = scope.ngModel;
					if(!value){
						element.hide(); return;
					}
					
	    			if(isMultiple) value=value.split(",");
	    			else value=new Array(value+""); 
	    			
	    			var text=[];
					for (var int = 0,val;val=value[int++];) {
						text .push( $("option[value='"+val+"']",element).text());
					}
					element.after(text.join("，")).hide();
					return;
	    		}
			}
			
			scope.modelName=attrs.ngModel;
			var queryJson=eval("(" + attrs.htCascadeSelectQuery +")");
			var query = queryJson.query;
			
			if(query.trigger!='-1'){
				scope.$parent.$watch(query.trigger,function(n,o){
				  scope.getValue(n);
				})
			}else{
				scope.getValue(query.initValue,'-1');
			}
			scope.handleReadPermission(); 
		},
		template:'<div><input ng-model="modelName" ng-show="false" /><select class="form-control input-sm"></select></div>',
		replace:true
			       
}}

/**
 * 右键事件
 * @returns
 */
function ngRightClick($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
}

/**
 * 自定义对话框 ht-custdialog
 */
function htCustdialog($rootScope,baseService , dialogService){
    return {
    	restrict : 'AE',
    	scope:true,
        link: function($scope, element, attrs) {
        	if(typeof(designType)!='undefined'){
        		if(!designType){
    	        	$(element).css('height',40).css('line-height','26px').css('padding-left',10).css('padding-right',10);
    	        	$(element).prev().css('width',$(element).prev().width()-$(element).width()-2);
            	}else{
            		$(element).css('line-height','20px');
            		 $(element).prev().css('width',$(element).prev().width()-$(element).width()-7);
            	 }
        	}
        	var permission=getPermission(attrs.permission,$scope);
        	// 没有权限
        	if(permission && permission !='w' && permission != 'b'){
        		element.hide();return;
        	}
        	var htCustDialog = attrs.htCustdialog;
        	if(!htCustDialog) return;
        	htCustDialog = htCustDialog.replace("{'name","{\"name");
        	$scope.confJson=eval("("+ htCustDialog +")");
        	if($scope.confJson.constructor.name=='String') $scope.confJson=eval("("+ $scope.confJson +")");
        	//是否位于子表。位于子表的填充方式为当前行覆盖
        	var isInSub = $scope.confJson.isInSub;//(element.parents("[type='subtable']").length >0);
        	
        	//绑定配置
        	var dialogMappingConf=$scope.confJson.custDialog.mappingConf;
        	var isCombine = $scope.confJson.custDialog.type =='combiDialog';
        	//对话框初始化监听
        	$(element).click(function(){
        		$scope.showDialog();
        	});
        	
        	/**展示对话框*/
        	$scope.showDialog = function(){
        		var param =$scope.getQueryParam($scope.confJson.custDialog.conditions);
        		var initData = $scope.initData();   
        		var conf = {param:param,initData: initData};//initData
        		if(isCombine){
        			var conf = {alias:$scope.confJson.custDialog.alias, callBack:$scope.dialogOk};
        			CombinateDialog.open(conf);
        			return;
        		}
        		if(window.FORM_TYPE_!='mobile'){//PC
        			var alias = $scope.confJson.custDialog.alias;
        			//CustomDialog.openCustomDialog($scope.confJson.custDialog.alias,$scope.dialogOk,conf);
        			var url = '${form}/form/customDialog/v1/getByAlias?alias=' + alias;
        	        baseService.get(url).then(function (customDialog) {
        	        	if(!customDialog||!customDialog.alias){
        	        		dialogService.fail("对话框别名【"+alias+"】不存在！");
        	        		return ;
        	        	}
        	            var list = JSON.parse(customDialog.conditionfield);
        	            var param = {};
        	            $(list).each(function () {
        	                if (this.defaultType == "4") {
        	                    param[this.field] = this.comment;
        	                }
        	            });
        	            if ($.isEmptyObject(param)) {//没有动态传入的字段
        	                if (customDialog.style == 0) {
        	                    dialogService.page('customDialogShow', {
        	                        alwaysClose: false,
        	                        pageParam: {alias: alias, customDialog: customDialog}
        	                    }).then(function (r) {
        	                    	$scope.dialogOk(r);
        	                    });
        	                } else {
        	                    dialogService.page('customDialogShowTree', {
        	                        alwaysClose: false,
        	                        pageParam: {alias: alias, customDialog: customDialog}
        	                    }).then(function (r) {
        	                    	$scope.dialogOk(r);
        	                    });
        	                }
        	            } else {
        	                dialogService.page('paramDialog', {alwaysClose: false, pageParam: {param: param}}).then(function (rs) {
        	                    dialogService.close(rs.index);
        	                    if (customDialog.style == 0) {
        	                        dialogService.page('customDialogShow', {
        	                            alwaysClose: false,
        	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
        	                        }).then(function (r) {
        	                        	$scope.dialogOk(r);
        	                        });
        	                    } else {
        	                        dialogService.page('customDialogShowTree', {
        	                            alwaysClose: false,
        	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
        	                        }).then(function (r) {
        	                        	$scope.dialogOk(r);
        	                        });
        	                    }
        	                });
        	            }
        	        });
        		}else{//手机端
        			conf.isCombine = isCombine;
        			conf.alias = $scope.confJson.custDialog.alias;
        			conf.callBack = $scope.dialogOk;
        			CustomDialog.openCustomDialog(conf);
        		}
        	}
        	
        	$scope.dialogOk = function(data){
        		if(data)layer.close(data.index);
        		if(this.confJson['forSearch']){
        			var result = data.result[0];
        			var mapping = dialogMappingConf[0];
        			var value = result[mapping.from];
        			$scope.$parent[mapping.target[0]] = value;
        			$("input[ng-model='"+mapping.target[0]+"']").val(value);
        			$("input[ng-model='"+mapping.target[0]+"']").change();
        		}else{
        			$scope.pushDataToForm(data.result,dialogMappingConf);
        		}
        		$rootScope.$broadcast("customdialog:ok", {alias:$scope.confJson.custDialog.alias,data:data.result});
        	}
        	
        	$scope.custQueryOk = function(returnData,mappingConf){
        		$scope.pushDataToForm(returnData,mappingConf);
        	}
        	//自定义查询，自定义对话框
        	$scope.initCustQuery = function(){
        		if( ! $scope.confJson.custQueryList || $scope.confJson.custQueryList.length==0) return ;
        		
        		for(var i = 0,custQuery;custQuery=$scope.confJson.custQueryList[i++];){
        			if(custQuery.type != 'aliasScript' && custQuery.type != 'custQuery') continue;
        			//通过触发字段进行初始化
        			var gangedTarget =custQuery.gangedTarget;
        			//不联动
        			if(!custQuery.ganged) continue;
        			// 回车联动
        			if(custQuery.ganged == 'inter'){
        				if(!isInSub){
                			var target =$("[ng-model='data."+gangedTarget+"']");
            			}else{
            				var gangedArray = gangedTarget.split(".");
            				var target = $("[ng-model='"+gangedArray[gangedArray.length-1]+"']",$(element).closest("tr"));
            			}
        				
        				var autoQueryData = $(target).data("autoQueryData");
        				if(!autoQueryData){
        					autoQueryData=[];
        					if(!$scope.autoQueryData)$scope.autoQueryData ={};
        					var gangedTargetStr = "data."+gangedTarget; //需要watch 的字符串
        					if(!$scope.autoQueryData[gangedTargetStr]){
            					$scope.autoQueryData[gangedTargetStr]=[];
            					$scope.$watch(gangedTargetStr,function(newValue, oldValue) {
                	        		if(newValue!=oldValue){//如果不为空则进行查询
                	        			var bindCustQuerys = $(target).data("autoQueryData");
                	        			$scope.removeBindQueryData(bindCustQuerys);
                	        		}
                	        	});
            				}
        					
        					$(target).bind("keydown", function(event){ 
            					if(event.keyCode != 13) return;
            					var bindCustQuerys =$(this).data("autoQueryData");
            					for(var j = 0,q;q=bindCustQuerys[j++];){
            						$scope.executeQuery(q);
            					}
            				});
        				}
        				autoQueryData.push(custQuery);
        				$(target).data("autoQueryData",autoQueryData);
        			}else{
        				
        			//值改变联动
        				if(!$scope.autoQueryData)$scope.autoQueryData ={};
        				//多个自定义查询绑定到同一个字段上，仅仅执行一次
        				var gangedTargetStr = "data."+gangedTarget; //需要watch 的字符串
        				if(!$scope.autoQueryData[gangedTargetStr]){
        					$scope.autoQueryData[gangedTargetStr]=[];
        					
        					$scope.$watch(gangedTargetStr,function(newValue, oldValue) {
            	        		if(newValue!=oldValue && newValue){ //如果不为空则进行查询
            	        			var queryList = $scope.autoQueryData[this.exp];
            	        			for(var k=0,q;q=queryList[k++];){
            	        				$scope.executeQuery(q);
            	        			}
            	        		}else if(newValue!=oldValue && !newValue){//如果为空则清空上次查询的值
            	        			var bindCustQuerys = $scope.autoQueryData[this.exp];
            	        			$scope.removeBindQueryData(bindCustQuerys);
            	        		}
            	        	});
        				}
        				$scope.autoQueryData[gangedTargetStr].push(custQuery)
        				
        			}
    				
        		}
        	}
        	
        	/** 删除绑定选择的值后，清空该选择的值的查询结果 */
        	$scope.removeBindQueryData = function(queryList){
        		for(var k=0,q;q=queryList[k++];){
        			var hasSub = false,subDatas={};
        			// 循环所有mapping，将返回值，插入指定字段
        			var mappingConf = q.mappingConf;
					for (var int = 0,mapping;mapping= mappingConf[int++];){ 
						if(!mapping.from) continue; 
						var  value = "";
						var targets =mapping.target;
						// 返回值单个字段可以映射表单多个字段
						for (var j = 0,target;target= targets[j++];){
							/**target格式 主表 【表明.字段名】子表 【主表明.子表名.字段名】 **/
							//target =target.toLowerCase();
							var targetArray =target.split(".");
							//如果是主表【表明.字段名】
							if(targetArray.length==2){
								if(typeof(mainDatas) != 'undefined'){
									if(!mainDatas[target]){
										mainDatas[target] = value;
									}else{
										mainDatas[target] += ","+value;
									}
								}else{
									//清空主表联动字段的关联值
									$scope.data[targetArray[0]][targetArray[1]] = "";
								}
							}
							//如果是位于子表
							else if(isInSub){
								$scope.item[targetArray[2]]=value;
							}
							//位于主表填充子表，添加行的形式
							else{
								hasSub = true;
								if(!subDatas[targetArray[1]])subDatas[targetArray[1]]={};
								subDatas[targetArray[1]][targetArray[2]] = value;
								subDatas[targetArray[1]].mian_table_name_ =targetArray[0];
							}
						}
					}
					// 如果有子表
					if(hasSub){
						for(tableName in subDatas){
							var data = $.extend({},subDatas[tableName]);  
							var mainTableName =data.mian_table_name_;
							delete data.mian_table_name_;
							//清空上一次选择的数据
							if($scope.data[mainTableName]["sub_"+tableName].temp){
								var temp = $scope.data[mainTableName]["sub_"+tableName].temp;
								try {
									$scope.data[mainTableName]["sub_"+tableName].remove(temp);
								} catch (e) {
									$scope.data[mainTableName]["sub_"+tableName].splice(temp);
								}
								
								$scope.data[mainTableName]["sub_"+tableName].temp = {};
							}
						}
					}
					!$rootScope.$$phase&&$rootScope.$digest();
    			}
        	}
        	
        	
        	/** 执行别名脚本查询，自定义查询*/
        	$scope.executeQuery = function(custQuery){
        		var param={alias:custQuery.alias};
				param.querydata = $scope.getQueryParam(custQuery.conditions);
				//为空时不查询
				if(JSON.stringify(param.querydata) == "{}"){
					return;
				}
				
				if(custQuery.type == 'custQuery'){
					DoQuery(param,function(data){
						if(data && data.length>0){
							$scope.pushDataToForm(data,custQuery.mappingConf);
						}else{
							var list = [];
							list.push(custQuery);
							$scope.removeBindQueryData(list);
						}
					})
				}
				else if(custQuery.type == 'aliasScript'){
					var data = RunAliasScript(param)
					$scope.pushDataToForm(data,custQuery.mappingConf);
				}
        	}
        
    		//通过参数条件配置获取参数 条件
        	$scope.getQueryParam = function(conditions){
        		var param ={};
        		for (var i = 0,condition;condition=conditions[i++];) {
        			var value = condition.defaultValue
					if(condition.isScript){
						value = eval(value+"()");
					} 
					if(condition.bind && !condition.isScript && !condition.defaultValue ){
						value =eval("$scope.data."+condition.bind)||value;
					}
        			if(value)param[condition.field] = value;
				}
        		return param;
        	}
        	//window.setTimeout($scope.initCustQuery,10);//有时候trigger目标字段还没出现。
        	
        	//填充数据到数据库
        	$scope.pushDataToForm=function(returnData,mappingConf){
        		//将选择的值更新到data{[],[],}中
        		//先初始化防止报空
        		if(!returnData)returnData=[];
        		if(!$.isArray(returnData)){
        			returnData=new Array(returnData);
        		}
        		var mainDatas={},fag=true;
        		var isNew = true;
        		// 循环所有的返回值
        		for (var i = 0; i < returnData.length||fag; i++) {
        			fag=false;
        			var hasSub = false,subDatas={};
        			// 循环所有mapping，将返回值，插入指定字段
					for (var int = 0,mapping;mapping= mappingConf[int++];){ 
						if(!mapping.from) continue; 
						var  value = "";
						if(returnData.length!=0){
							value = returnData[i][mapping.from] || returnData[i][mapping.from.toLowerCase()]|| returnData[i][mapping.from.toUpperCase()];;
						}
						var targets =mapping.target;
						// 返回值单个字段可以映射表单多个字段
						for (var j = 0,target;target= targets[j++];){
							/**target格式 主表 【表明.字段名】子表 【主表明.子表名.字段名】 **/
							//target =target.toLowerCase();
							var targetArray =target.split(".");
							//如果是主表【表明.字段名】
							if(targetArray.length==2){
								if(!mainDatas[target]){
									mainDatas[target] = value;
								}else{
									mainDatas[target] += ","+value;
								}
//								$scope.data[targetArray[0]][targetArray[1]]=value; 
							}
							//如果是位于子表
							else if(isInSub){
								$scope.item[targetArray[2]]=value;
							}
							//位于主表填充子表，添加行的形式
							else{
								hasSub = true;
								if(!subDatas[targetArray[1]])subDatas[targetArray[1]]={};
								subDatas[targetArray[1]][targetArray[2]] = value;
								subDatas[targetArray[1]].mian_table_name_ =targetArray[0];
							}
							
						}
					}
					// 如果有子表
					if(hasSub){
						for(tableName in subDatas){
							//var tempData =$.extend({},$scope.dataInit[mianTableName][tableName].row);
							var data = $.extend({},subDatas[tableName]);  
							var mainTableName =data.mian_table_name_;
							delete data.mian_table_name_;
							
							//清空上一次选择的数据
							var temp = $scope.data[mainTableName][tableName].temp;
							if(temp&&isNew){
								try {
									$scope.data[mainTableName][tableName].remove(temp);
								} catch (e) {
									$scope.data[mainTableName][tableName].splice(temp);
								}
							}
							isNew = false;
							var itemDiv = $(element).parents().filter('[item-index]');
							var index = itemDiv.attr('item-index')?parseInt(itemDiv.attr('item-index')):0;
							$scope.data[mainTableName][tableName][index] = angular.merge({},$scope.data[mainTableName][tableName][index],data);
							//$scope.data[mainTableName][tableName].push(data);
							
							//记录本次选择的数据方便下次改变时清除原来的
							$scope.data[mainTableName][tableName].temp = data;
						}
					}
				}
        		angular.forEach(mainDatas,function(value,key){
        			var keyArr =key.split(".");
        			$scope.data[keyArr[0]][keyArr[1]] = value;
				});
        		!$rootScope.$$phase&&$rootScope.$digest(); 
        	}
        	
        	$scope.initData = function(){
        		var initData = [],tmp={},bind=[];
        		angular.forEach(dialogMappingConf, function(obj, idx){
        			var target = obj.target[0],keyArr =target.split("."),selectStr="",selectArr=[];
        			if(keyArr.length==2){
        				selectStr =  $scope.data[keyArr[0]][keyArr[1]];
        			}else{
        				// 子表数据回显暂时不处理
        				return initData;
        			}
        			try {
        				selectArr = selectStr.split(",");
        				for(var i=0; i< selectArr.length && selectStr.length; i++ ){
    						if(idx==0){
    							initData.push(parseToJson("{"+obj.from+":\""+selectArr[i]+"\"}"));
    						}else{
    							initData[i][obj.from] = selectArr[i];
    						}
    					}
					} catch (e) {}
        			
        		});
        		return initData;
        	}
        	
        	
        	
        }
    }
}



/**
 * 自定义对话框 ht-auth-set-event
 */
function htAuthSetEvent($rootScope,baseService , dialogService){
    return {
    	restrict : 'AE',
    	scope:true,
        link: function($scope, element, attrs) {
        	window.setTimeout(function(){
        		if(!designType){
    	        	$(element).css('height',40).css('line-height','26px').css('padding-left',10).css('padding-right',10);
    	        	$(element).prev().css('width',$(element).prev().width()-$(element).width()-2);
            	}else{
            		$(element).css('line-height','20px');
            		$(element).prev().css('width',$(element).prev().width()-$(element).width()-7);
            	 }
        	},100);
        	
        	var permission=getPermission(attrs.permission,$scope);
        	// 没有权限
        	if(permission && permission !='w' && permission != 'b'){
        		element.hide();return;
        	}
        	var htAuthSetEvent = attrs.htAuthSetEvent;
        	if(!htAuthSetEvent) return;
        	$scope.defaultPermissionList = [];
        	baseService.get("${bpmModel}/flow/defAuthorize/v1/getPermissionList").then(function(result){
        		$scope.defaultPermissionList=result;
        	});
        	
//        	//是否位于子表。位于子表的填充方式为当前行覆盖
//        	var isInSub = $scope.confJson.isInSub;//(element.parents("[type='subtable']").length >0);
//        	
//        	//绑定配置
//        	var dialogMappingConf=$scope.confJson.custDialog.mappingConf;
//        	var isCombine = $scope.confJson.custDialog.type =='combiDialog';
        	//对话框初始化监听
        	$(element).click(function(){
        		$scope.setAuth();
        	});
        	
        	/**
        	 * 设置设置权限。
        	 * ownerNameJson 格式。
        	 * [{type:"everyone",title:"所有人"},{type:"user",title:"用户",id:"1,2",name:"ray,tom"}]
        	 */
        	$scope.setAuth=function(){ 
        		var conf={
        			  right:$scope.ownerNameJson,
        			  permissionList:$scope.defaultPermissionList
        		   }
        		dialogService.page("flow-filedAuthSetting", {
        		    title:'授权选择器',
        		    pageParam:{data:conf},
        		 }).then(function(data){
        			 var tmpAry=[];
        				for(var i=0;i<data.length;i++){
        					var obj=data[i];
        					if(obj.id){
        						var tmp={"type":obj.type,"title":obj.title, "id":obj.id,"name":obj.name};
        						tmpAry.push(tmp);
        					}
        					else{
        						var tmp={"type":obj.type,"title":obj.title};
        						tmpAry.push(tmp);
        					}
        				}
        				var valueStr = JSON.stringify(tmpAry);
        				eval("($scope."+ htAuthSetEvent +"='"+valueStr+"')");
        				$scope.ownerNameJson=tmpAry;
        				$scope.showLable(tmpAry);
        		 });
        	}
        	
        	$scope.showLable = function(tmpAry){
        		var $obj = $(element).parent().find("input[bindEventLable='"+htAuthSetEvent+"']");
        		if($obj.length>0){
        			var str = '';
            		for (var i = 0; i < tmpAry.length; i++) {
            			var val = tmpAry[i]['type']=='everyone'?tmpAry[i]['title']+"；":tmpAry[i]['title']+"："+tmpAry[i]['name']+"；";
            			str += val;
    				}
            		$($obj).val(str);
        		}
        	}
        	
        	$scope.ownerNameJson = [];
        	var initData = eval("($scope."+ htAuthSetEvent +")");
        	if(initData){
        		$scope.ownerNameJson = parseToJson(initData);
        		$scope.showLable($scope.ownerNameJson);
        	}
        }
    }
}



/**
 * 子表回填自定义对话框 ht-sub-custdialog
 */
function htSubCustdialog($rootScope,baseService , dialogService){
    return {
    	restrict : 'AE',
    	scope:true,
        link: function($scope, element, attrs) {
        	
        	var permission=getPermission(attrs.permission,$scope);
        	// 没有权限
        	if(permission && permission !='w' && permission != 'b'){
        		element.hide();return;
        	}
        	var htSubCustdialog = attrs.htSubCustdialog;
        	if(!htSubCustdialog) return;
        	htSubCustdialog = htSubCustdialog.replace("{'name","{\"name");
        	$scope.confJson=eval("("+ htSubCustdialog +")");
        	if($scope.confJson.constructor.name=='String') $scope.confJson=eval("("+ $scope.confJson +")");
        	//是否位于子表。位于子表的填充方式为当前行覆盖
        	var isInSub = $scope.confJson.isInSub;//(element.parents("[type='subtable']").length >0);
        	
        	//绑定配置
        	var dialogMappingConf=$scope.confJson.custDialog.mappingConf;
        	var isCombine = $scope.confJson.custDialog.type =='combiDialog';
        	//对话框初始化监听
        	$(element).click(function(){
        		$scope.showDialog();
        	});
        	
        	/**展示对话框*/
        	$scope.showDialog = function(){
        		var param =$scope.getQueryParam($scope.confJson.custDialog.conditions);
        		var initData = $scope.initData();   
        		var conf = {param:param,initData: initData};//initData
        		if(isCombine){
        			var conf = {alias:$scope.confJson.custDialog.alias, callBack:$scope.dialogOk};
        			CombinateDialog.open(conf);
        			return;
        		}
        		if(window.FORM_TYPE_!='mobile'){//PC
        			var alias = $scope.confJson.custDialog.alias;
        			//CustomDialog.openCustomDialog($scope.confJson.custDialog.alias,$scope.dialogOk,conf);
        			var url = '${form}/form/customDialog/v1/getByAlias?alias=' + alias;
        	        baseService.get(url).then(function (customDialog) {
        	        	if(!customDialog||!customDialog.alias){
        	        		dialogService.fail("对话框别名【"+alias+"】不存在！");
        	        		return ;
        	        	}
        	            var list = JSON.parse(customDialog.conditionfield);
        	            var param = {};
        	            $(list).each(function () {
        	                if (this.defaultType == "4") {
        	                    param[this.field] = this.comment;
        	                }
        	            });
        	            if ($.isEmptyObject(param)) {//没有动态传入的字段
        	                if (customDialog.style == 0) {
        	                    dialogService.page('customDialogShow', {
        	                        alwaysClose: false,
        	                        pageParam: {alias: alias, customDialog: customDialog}
        	                    }).then(function (r) {
        	                    	$scope.dialogOk(r);
        	                    });
        	                } else {
        	                    dialogService.page('customDialogShowTree', {
        	                        alwaysClose: false,
        	                        pageParam: {alias: alias, customDialog: customDialog}
        	                    }).then(function (r) {
        	                    	$scope.dialogOk(r);
        	                    });
        	                }
        	            } else {
        	                dialogService.page('paramDialog', {alwaysClose: false, pageParam: {param: param}}).then(function (rs) {
        	                    dialogService.close(rs.index);
        	                    if (customDialog.style == 0) {
        	                        dialogService.page('customDialogShow', {
        	                            alwaysClose: false,
        	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
        	                        }).then(function (r) {
        	                        	$scope.dialogOk(r);
        	                        });
        	                    } else {
        	                        dialogService.page('customDialogShowTree', {
        	                            alwaysClose: false,
        	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
        	                        }).then(function (r) {
        	                        	$scope.dialogOk(r);
        	                        });
        	                    }
        	                });
        	            }
        	        });
        		}else{//手机端
        			conf.isCombine = isCombine;
        			conf.alias = $scope.confJson.custDialog.alias;
        			conf.callBack = $scope.dialogOk;
        			CustomDialog.openCustomDialog(conf);
        		}
        	}
        	
        	$scope.dialogOk = function(data){
        		if(data)layer.close(data.index);
        		$scope.pushDataToForm(data.result,dialogMappingConf);
        		$rootScope.$broadcast("customdialog:ok", {alias:$scope.confJson.custDialog.alias,data:data.result});
        	}
        	
        	$scope.custQueryOk = function(returnData,mappingConf){
        		$scope.pushDataToForm(returnData,mappingConf);
        	}

        	
        	
        	/** 执行别名脚本查询，自定义查询*/
        	$scope.executeQuery = function(custQuery){
        		var param={alias:custQuery.alias};
				param.querydata = $scope.getQueryParam(custQuery.conditions);
				//为空时不查询
				if(JSON.stringify(param.querydata) == "{}"){
					return;
				}
				
				if(custQuery.type == 'custQuery'){
					DoQuery(param,function(data){
						if(data && data.length>0){
							$scope.pushDataToForm(data,custQuery.mappingConf);
						}else{
							var list = [];
							list.push(custQuery);
							$scope.removeBindQueryData(list);
						}
					})
				}
				else if(custQuery.type == 'aliasScript'){
					var data = RunAliasScript(param)
					$scope.pushDataToForm(data,custQuery.mappingConf);
				}
        	}
        
    		//通过参数条件配置获取参数 条件
        	$scope.getQueryParam = function(conditions){
        		var param ={};
        		for (var i = 0,condition;condition=conditions[i++];) {
        			var value = condition.defaultValue
					if(condition.isScript){
						value = eval(value+"()");
					} 
					if(condition.bind && !condition.isScript && !condition.defaultValue ){
						value =eval("$scope.data."+condition.bind)||value;
					}
        			if(value)param[condition.field] = value;
				}
        		return param;
        	}
        	window.setTimeout($scope.initCustQuery,10);//有时候trigger目标字段还没出现。
        	
        	//填充数据到数据库
        	$scope.pushDataToForm=function(returnData,mappingConf){
        		//将选择的值更新到data{[],[],}中
        		//先初始化防止报空
        		if(!returnData)returnData=[];
        		if(!$.isArray(returnData)){
        			returnData=new Array(returnData);
        		}
        		var mainDatas={},fag=true;
        		var isNew = true;
        		// 循环所有的返回值
        		for (var i = 0; i < returnData.length||fag; i++) {
        			fag=false;
        			var hasSub = false,subDatas={};
        			// 循环所有mapping，将返回值，插入指定字段
					for (var int = 0,mapping;mapping= mappingConf[int++];){ 
						if(!mapping.from) continue; 
						var  value = "";
						if(returnData.length!=0){
							value = returnData[i][mapping.from] || returnData[i][mapping.from.toLowerCase()]|| returnData[i][mapping.from.toUpperCase()];;
						}
						var targets =mapping.target;
						// 返回值单个字段可以映射表单多个字段
						for (var j = 0,target;target= targets[j++];){
							/**target格式 主表 【表明.字段名】子表 【主表明.子表名.字段名】 **/
							//target =target.toLowerCase();
							var targetArray =target.split(".");
							//如果是主表【表明.字段名】
							if(targetArray.length==2){
								if(!mainDatas[target]){
									mainDatas[target] = value;
								}else{
									mainDatas[target] += ","+value;
								}
//								$scope.data[targetArray[0]][targetArray[1]]=value; 
							}
							//如果是位于子表
							else if(isInSub){
								$scope.item[targetArray[2]]=value;
							}
							//位于主表填充子表，添加行的形式
							else{
								hasSub = true;
								if(!subDatas[targetArray[1]])subDatas[targetArray[1]]={};
								subDatas[targetArray[1]][targetArray[2]] = value;
								subDatas[targetArray[1]].mian_table_name_ =targetArray[0];
							}
							
						}
					}
					// 如果有子表
					if(hasSub){
						for(tableName in subDatas){
							var itemDiv = $(element).parents().filter('[sub-relation]');
							var relation = itemDiv.attr('sub-relation')?itemDiv.attr('sub-relation'):'onetoone';
							var data = $.extend({},subDatas[tableName]);  
							var mainTableName =data.mian_table_name_;
							delete data.mian_table_name_;
							if('onetoone'==relation){
								$scope.data[mainTableName][tableName] = [];
								$scope.data[mainTableName][tableName].push(data);
							}else{
								$scope.data[mainTableName][tableName].push(data);
							}
						}
					}
				}
        		angular.forEach(mainDatas,function(value,key){
        			var keyArr =key.split(".");
        			$scope.data[keyArr[0]][keyArr[1]] = value;
				});
        		!$rootScope.$$phase&&$rootScope.$digest(); 
        	}
        	
        	$scope.initData = function(){
        		var initData = [],tmp={},bind=[];
        		angular.forEach(dialogMappingConf, function(obj, idx){
        			var target = obj.target[0],keyArr =target.split("."),selectStr="",selectArr=[];
        			if(keyArr.length==2){
        				selectStr =  $scope.data[keyArr[0]][keyArr[1]];
        			}else{
        				// 子表数据回显暂时不处理
        				return initData;
        			}
        			try {
        				selectArr = selectStr.split(",");
        				for(var i=0; i< selectArr.length && selectStr.length; i++ ){
    						if(idx==0){
    							initData.push(parseToJson("{"+obj.from+":\""+selectArr[i]+"\"}"));
    						}else{
    							initData[i][obj.from] = selectArr[i];
    						}
    					}
					} catch (e) {}
        			
        		});
        		return initData;
        	}
        	
        }
    }
}



/**
 * 自定义脚本 ht-custom-script
 */
function htCustomScript($rootScope, $filter, baseService , dialogService, bpm, $compile, $state, $q, $templateFactory, 
		$ocLazyLoad, $timeout, $sessionStorage, $sce){
    return {
    	restrict : 'AE',
    	scope:true,
        link: function($scope, element, attrs) {
        	window.setTimeout(function(){
        		if(!designType){
    	        	$(element).css('height',40).css('line-height','26px').css('padding-left',10).css('padding-right',10);
    	        	$(element).prev().css('width',$(element).prev().width()-$(element).width()-2);
            	}else{
            		$(element).css('line-height','20px');
            		$(element).prev().css('width',$(element).prev().width()-$(element).width()-7);
            	 }
        	},100);
        	
        	var permission=getPermission(attrs.permission,$scope);
        	// 没有权限
        	if(permission && permission !='w' && permission != 'b'){
        		element.hide();return;
        	}
        	//对话框初始化监听
        	$(element).click(function(){
        		$scope.excuteScript();
        	});
        	
        	$scope.excuteScript = function(){
        		var ngModelPath = attrs.bindeventlable;
        		var $labelObj = $(element).parent().find("input[bindEventLable='"+ngModelPath+"']");
        		var customScript = $.base64.decode(attrs.htCustomScript,"utf-8");
        		var script = "var tempFunction = function($scope,$rootScope, $filter, baseService , dialogService, bpm, $compile, $state, $q,$ocLazyLoad, $timeout, $sessionStorage, $sce, ngModelPath, $labelObj){ "+customScript+"};"
    			var result =  eval(script+"tempFunction($scope.$parent,$rootScope, $filter, baseService , dialogService, bpm, $compile, $state, $q,$ocLazyLoad, $timeout, $sessionStorage, $sce, ngModelPath, $labelObj);");
        		var aa = $scope;
        		if(typeof(result) != 'undefined'){
        			eval("($scope."+ ngModelPath +"='"+result+"')");
        			$($obj).val(result);
        		}
        	}
        	
        }
    }
}

/**
 * 自定义脚本 ht-identity
 */
function htIdentity($rootScope, baseService , dialogService, bpm, $timeout){
    return {
    	restrict : 'AE',
    	scope:true,
        link: function($scope, element, attrs) {
        	var htIdentityJson = parseToJson(attrs.htIdentity);
        	//判断是否启动流程页面
        	if(bpm.getDefId() && bpm.isCreateInstance() && !bpm.isDraft()){
        		baseService.get('${portal}/sys/identity/v1/getNextIdByAlias?alias='+htIdentityJson.alias).then(function(rep){
					if(rep && rep.state){
						var tmp='$scope.'+attrs.ngModel+'="'+rep.value+'"';
						eval(tmp);
					}
        		});
        	}
        }
    }
}

/**
 * 表单意见 ht-bpm-opinion
 */
function htBpmOpinion(){
	return {
		restrict:"A",
		scope:{
			htBpmOpinion:"=",
			opinionHistory:"="
		},
		link:function(scope, element, attrs){
			scope.style = attrs.style;
			element.removeClass(); 
			element.removeAttr("style");
			scope.permission = 'w';
			try{
				scope.permission = eval("scope.$parent."+attrs.permission);
			}
			catch(e){}
			if(scope.permission=='n')element.remove();
		},
		template:'<div>\
					<textarea taskopinion  ng-model="htBpmOpinion" ht-validate="{required:{{permission==\'b\'}} }" style="{{style}}" ng-show="permission==\'w\'|| permission==\'b\'"></textarea>\
					<blockquote ng-repeat="opinion in opinionHistory" ng-if="opinionHistory.length>0">\
		                <div>\
							<span >{{opinion.auditorName}}</span>&nbsp;<span class="label label-default"> {{opinion.status | taskstatus}} </span>&nbsp;{{opinion.createTime |date:"yyyy-MM-dd HH:mm:ss"}} &nbsp; \
			            </div>\
						<div style="padding-top:10px">{{opinion.opinion}}</div> \
			        </blockquote>\
				  </div>',
		replace:true
	};
}



/**
 * ht-link自动添加资源路径的上下文
 */
function htLink(){
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			if( "A" == $(element).prop("tagName")){
				$(element).attr("href",__ctx+attrs.htLink)
			}else{
				$(element).attr("src",__ctx+attrs.htLink)
			}
		}
	
	};
}


function getPermission(permissionPath,scope){
	var permission = scope.permission||scope.$parent.permission||scope.$parent.$parent.permission;
	if(!permission||!permissionPath) return "w";
	try {
		var p = eval(permissionPath); 
	} catch (e) {
		console.info("获取权限出现了异常 permissionPath:"+permissionPath)
		console.info(permission);
		console.info(e);
	}
	return p ||'w'; 
}

/*
 * 上传指令。
 * 使用方法:
 * 	<input ht-upload="data.main.name" permission='w' />
 * 	ht-input对应的属性值为scope对应的数据值路径。
 * 	permission:
 * 		取值有两种：
 * 			r:只读
 *  		w:可输入
 */
function htUpload($rootScope, baseService, dialogService){
return {
	restrict : 'A',
	template : '<span ng-if="permission==\'w\' || permission==\'b\'">\
					<div class="ht-input">\
					<span class="span-user owner-span" ng-repeat="item in files track by $index">\
						<a class="download-btn" title="下载该文件"  ng-click="onClick(item.id)">{{item.name}}</a>\
						<a class="btn btn-xs fa fa-remove" title="移除该项" ng-click="remove($index)"></a>\
					</span>\
				</div>\
				<a class="btn btn-sm btn-primary fa fa-upload" ng-click="showDialog()"><span>上传</span></a>\
			</span>\
			<div ng-if="permission==\'r\'">\
				<span ng-repeat="item in files track by $index">\
					<a class="btn fa fa-cloud-download" title="下载该文件" ng-click="onClick(item.id)">{{item.name}}</a>\
				</span>\
			</div>',
	scope: {
		htUpload:"="
	},
	link: function (scope,element,attrs,ctrl){
		element.removeClass();
		scope.permission = getPermission(attrs.permission,scope);
		var max = (attrs.issingle&&eval(attrs.issingle)) ? 1:20;
		var size = (attrs.issizelimit=='true'&&attrs.size&&eval(attrs.size)) ? attrs.size:0;
		var formatLimit = (attrs.isformatlimit=='true'&&attrs.formatlimit) ? attrs.formatlimit:false;
		
    	var jsonStr = scope.htUpload?scope.htUpload.replace(/￥@@￥/g,"\""):"[]";
    	scope.files = eval("(" +jsonStr +")"); 
    	
    	scope.dialogOk = function(data){
    		scope.files = data;
    		var maxWidth=$(element).width()-20;
    		if(max>1){
    			scope.htUpload = scope.concat(scope.htUpload,data);
    		}else{
    			scope.htUpload = JSON.stringify(data);
    		}
    		!$rootScope.$$phase&&$rootScope.$digest();
    		$(element).find('a.button.btn-sm').css('max-width',maxWidth);
    	}
    	
    	scope.concat = function(a,b){
    		try {
    			if(!a){
    				a = [];
    			}
    			a =  eval(a);
        		var alen = a.length;
        		var blen = b.length;
        		for(var i=0;i<blen;i++){
    				a[alen+i] = b[i];
    			}
			} catch (e) {
				a = b;
			}
    		return JSON.stringify(a);
    	}
    	
		scope.showDialog = function(){
			if(formatLimit){
				formatLimit = formatLimit.replace(/\|/g, ',');
			}
			var conf ={max:max,size:size,type:formatLimit}; 
			dialogService.page("file-upload", {area:['800px', '480px'],pageParam: conf})
			 .then(function(data){
				 scope.dialogOk(data);
			 });
		}
		scope.onClick = function(id){
			var url = window.getContext().portal+"/system/file/v1/downloadFile?fileId="+id;
			document.location.href=url;
		}
		
		scope.$watch('htUpload',  function(newValue, oldValue) {
			if(newValue==oldValue) return ;
			
			if(!newValue) scope.files=[];
			else scope.files = eval("(" +newValue +")");
			
			!$rootScope.$$phase&&$rootScope.$digest();
    	});
		scope.remove = function(index,event){
			scope.files.splice(index,1);
			//更新字段值
			if(!scope.files ||scope.files.length==0) scope.htUpload="";
			else scope.htUpload=JSON.stringify(scope.files);
			event.stopPropagation();
		};
		
	}
}}

/**
 * 校验入口.  {require:true,dateRangeEnd:{targetVal:scope.data.sss}}  //不能大于结束日期
 * 校验指令，指定必须有ngModel属性。
 */
function htValidate($compile, baseService, dialogService){
  return {
      require: "ngModel",
      priority : 1001,
      link: function (scope, element, attr, ctrl) {
    	  var validate = attr.htValidate;
    	  if(!validate) return;
    	  //修正验证的bug。
    	  validate=validate.replace(/'/g,"\"");
    	  
    	  var permission=getPermission(attr.permission,scope);
    	  //如果不必填且没有其他校验返回 或者只读的权限不校验
    	  if( permission =="r"   ||  ( permission!=="b" && validate=="{}" ) )return;
		  var validateJson = eval('(' + validate + ')');
    	  
    	  if(permission=="b")validateJson.required = true;
    	  
          var customValidator = function (value) {
        	  
        	  if(!validate) return true;
        	  
        	  if(permission=="b" && !value ){
        		  ctrl.$setValidity("customValidate", false);
        		  return value;
        	  }
        	  
        	  if(scope.custForm && scope.custForm.$error && scope.custForm.$error.customValidate){
            	  var len= scope.custForm.$error.customValidate.length;
            	  for(var i=len;i>0;){
            		  var temp=scope.custForm.$error.customValidate[--i];
            		  if(temp.modelKey==attr.ngModel){
            			  scope.custForm.$error.customValidate.splice(i,1);
            		  }
            	  }
              }
        	  
        	  handlTargetValue(validateJson);
              var validity =  $.fn.validRules(value,validateJson,element,ctrl.$dirty);
              ctrl.modelKey=attr.ngModel;
              //ctrl.$error=validity.errMsg;
              ctrl.$setValidity("customValidate", validity._valid);
              return validity._valid ? value : undefined;
          };
          
          ctrl.$formatters.push(customValidator);
          ctrl.$parsers.push(customValidator);
          

          //获取比较目标字段的值。   所有比较的都包含target对象eg:{rule:{target:data.mian.name}}
          var handlTargetValue = function(validateJson){
        	  for(key in validateJson){
        		  if(validateJson[key].target){
        			  validateJson[key].targetVal =eval("scope."+validateJson[key].target);
        			  //如果target有值。添加监听器，在其变化的时候，重新编译指令
            			  scope.$watch(validateJson[key].target,function(newValue,oldValue,scope) {
            	        		if(newValue !=oldValue){
            	        			$compile(element)(scope);
            	        		}
            	          });
            		  }
            	  }
              }
              
          }
      };
}

/**
 * 格式化数字 ht-number
 * {'coinValue':'￥','isShowComdify':1,'decimalValue':2}
 * 
 */
function htNumber(formService){
    return {
        require: "ngModel",
        priority : 1002,
        link: function (scope, element, attr, inputCtrl) {
      	  var permission=getPermission(attr.permission,scope);
      	  var formater = attr.htNumber;
      	  if(!formater) return;
      	  
  		  var formaterJson = eval('(' + formater + ')');
      	  var input = element;
      	  if(permission=="n"){
      		  element.remove();
      		  return;
      	  } else if(permission=="r"){
      		  var val = eval("scope."+attr.ngModel)
      		  if(!val){
      			  element.hide();return;
      		  }
      		  element.before(formService.numberFormat(val,formaterJson)+" ");
      		  setCapital(val);
      		  element.remove();
      	  }else{
      		  setTimeout(function(){
      			  var val = eval("scope."+attr.ngModel);
      			  if(val){
      				  $(element).val(formService.numberFormat(val,formaterJson));
              		  setCapital(val); 
      			  }
                },0);
      		  $(element).on("blur",function(){
      			  var val = eval("scope."+attr.ngModel);
      			  if(val){
      				  $(this).val(formService.numberFormat(val,formaterJson));
              		  setCapital(val);
      			  }
                });
      	  }
      	  
      	 function setCapital(val){
      		 if (!formaterJson.capital) return;
      		 var capital =element.next("capital");
  			 if(capital.length==0)capital=$("<capital></capital>");
  			 var val=val?val:inputCtrl.$modelValue;
  			 
  			 if(!val) return;
  			 
  			 var text=formService.convertCurrency(val);
  			 
  			 capital.text("("+text+")");
   			element.after(capital); 
      	 }
        }
    };
}


/**
 * ht-funcexp 字段函数计算
 */

function htFuncexp(formService){
	var link = function($scope, element, attrs, $ctrl) {
		var modelName = attrs.ngModel;
		var watchArr = [];
		var funcexp=attrs.htFuncexp,
			watchField=getWatchField(funcexp);
		
		function toWatch(f,subMsg){
			//子表字段的监控
			var fieldName = subMsg[3];
			var subTableSrc =f.replace("."+fieldName,"");
			try{
				formService.doMath($scope,modelName,funcexp);
			}catch(e){
				
			}
			// 监控已存在的
			var length = eval("$scope."+subTableSrc+".length || 0");
			for (var int = 0; int < length; int++) {
				watch(subTableSrc+"["+(int)+"]."+fieldName);
			}
			//监控新添加的
			var watched = $scope.$watch(subTableSrc+".length",function(newValue,oldValue,scope) {
      		if(newValue>oldValue){
      			watch(subTableSrc+"["+(newValue-1)+"]."+fieldName);
      		}else if(newValue<oldValue){
      			watchArr.pop()(); 
      			formService.doMath($scope,modelName,funcexp);
      		}
      	});
		}
		
		if(watchField.length>0){
			for(var i=0,f;f=watchField[i++];){
				//子表字段的监控
				var subMsg = f.split(".");
				if(subMsg.length>3){
					toWatch(f,subMsg);
				}else{
					//主表和子表单条运算
					watch(f);
				} 
			}
			
		}
		// 监控
		function watch(path){
			var watch = $scope.$watch(path,function(newValue,oldValue,scope) {
      		if(newValue!=oldValue){
      			formService.doMath(scope,modelName,funcexp);
      		}
      	});
			watchArr.push(watch);
		}
		function getWatchField(statFun){
			var myregexp = /\(([data.main|data.sub|item].*?)\)/g;
			var match = myregexp.exec(statFun);
			var arrs=[];
			while (match != null) {
				var str =match[1];
				var has=false;
				for(var i=0,v;v=arrs[i++];){
					if(v == str)has =true;
				}
				if(!has)arrs.push(str);
				match = myregexp.exec(statFun);
			}
			return arrs;
		}
	};
	return {
		restrict : 'A',
		require : "ngModel",
		compile : function() {
			return link;
		}
	};
}

/**
 * 下拉选择框。
 * 属性说明：
 * 	ht-selects：指令 属性值为scope的数据路径。
 *  permission：权限，值为r,w
 *  options:可选值
 * <select ht-selects="data.main.hobbys" permission="w" ng-model=""></select>
 */
function htSelects(baseService, dialogService, commonService,$compile){
	 return {
		restrict : 'AE',
		require: "ngModel",
		scope:{
			htSelects:"="
		},
		link: function(scope, element, attrs,ctrl){
			var permission = getPermission(attrs.permission,scope);
			var aryOptions=eval(attrs.options);
			var isMultiple =attrs.multiple!=undefined;
			var filedname = attrs.filedname;
			
			if(permission == 'n'){
				element.hide();
			}else if(permission=='r'){
				var value = scope.htSelects;
				if(!value){
					element.hide();
					return;
				}
				
    			if(isMultiple) {
    				value=value.split(",");
    			}else{
    				value=new Array(value+""); 
    			}
    			
    			var text=[];
				for (var int = 0,val;val=value[int++];) {
					text.push( $("option[value='"+val+"']",element).text());
				}
				if(isMultiple && window.FORM_TYPE_ =='mobile') {
					element.parent().after(text.join(",")).hide();
					$("#"+filedname).hide();
    			}else{
    				element.after(text.join(",")).hide();
    			}
    		}else{
    			
    			if(window.FORM_TYPE_!='mobile'){//pc端
    				
        			$.isFunction($.fn.select2) && $(element).select2({
    				language: "zh-CN", 
    				placeholder: isMultiple?"请选择...":null,
    				initSelection: function(element, callback) {
	                    var data = [];
	                    var value = scope.htSelects;
	                    if(value){
	                    	//防止当value只有一个值且为数字时 split函数报错
	                    	if(!isNaN(value)) value = value.toString();
	                    	var arr = value.split(",");
	                    	for(var idx=0;idx<arr.length;idx++){
	                    		var text = $(element).find("[value="+arr[idx]+"]").text();
	                    		data.push({id:arr[idx],text:text});
	                    	}
	                    	callback(data);
	                    }else{
	                    	callback([{id:'',text:'请选择'}]);
	                    }
    	            }});
        		}else{//手机端
        			var selectedStr = ""
            			var selectedVal = scope.htSelect;
            			if(selectedVal){
            				var arr = selectedVal.split(",");
            				var len = 0;
                        	for(var idx=0;idx<arr.length;idx++){
                        		len++;
                        		var text = $(element).find("[value="+arr[idx]+"]").text();
                        		$(element).find("[value="+arr[idx]+"]").attr("selected","selected");
                        		if(len == arr.length){
                        			selectedStr += text;
                        		}else{
                        			selectedStr += text +",";
                        		}
                        	}
                        	$("#"+filedname).val(selectedStr);
            			}
            			
            			$(element).mobiscroll().select({
            		        theme: 'ios',
            		        lang: 'zh',
            		        display: 'bottom',
            		        minWidth: 200,
            		        group: true,
            		      //点击确定是把获取的值赋值给自己书写的input标签
            		        onSet:function(obj,inst){
            		            $('#'+filedname).val(obj.valueText);
            		        }
            		    });
            			 //点击input 触发select组件
            			 $("#"+filedname).click(function() {
            			     $(element).mobiscroll('show');
            			     return false;
            			 });
        		}
    			
    		}
			
			if(!isMultiple) return;
			ctrl.$formatters.push(function(value){
				 if(value){
					 return value.split(",");
				 }
				 return []
			});
	        ctrl.$parsers.push(function(value){
	        	 if(value&&value.length>0){ 
	        		 return value.join(",");
	        	 }
	        	 return "";
	        });
		}
			       
}}

/**
 * ht-bpm-agree directive
 * @returns
 */
function htBpmAgree(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开任务办理界面
			element.bind('click',function(){
				
				// 表单校验
				if(scope.custForm.$invalid){
					dialogService.warn("表单校验不通过，请正确填写表单信息");
					return;
				}
				
				if(window.validForm){
					var rtn= window.validForm(scope);
					if(!rtn) return;
				}
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				flowService.handleTask("agree", "同意", scope);
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-success fa fa-check-square-o">同意</a> ',
		replace:true
	};
}

/**
 * ht-bpm-save-draft directive
 * @returns
 */
function htBpmSaveDraft(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			
			element.bind('click',function(){
				//如果执行后置脚本出现异常 则返回
				if(bpm.excBeforScript(scope,this)===false) return;
				//保存启动时的数据。
				if(bpm.isCreateInstance()) {
					//启动时的保存
					flowService.submitForm(scope,"saveDraft");
				}
				else{
					flowService.saveTaskForm(scope, bpm);
				}
			});
		},
		template:'<a class="btn btn-primary fa fa-clipboard">保存</a>',
		replace:true
	};
}


/**
 * ht-bpm-instance-trans
 * @returns
 */
function htBpmInstanceTrans(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			var alias=element.attr("alias");
			var btn=scope.buttons[alias];
			scope.clsName='fa-detail';
			scope.btnText=btn.name;
			
			//打开抄送界面
			element.bind('click',function(){
				var title="流程抄送";
				dialogService.page("flow-toCopyTo", {area: ['600px', '330px'],btn:[],pageParam:{taskId:bpm.getTaskId(),copyToType:0,from:'receivedProcess.pending'}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-success fa {{clsName}}">{{btnText}}</a>',
		replace:true
	};
}


/**
 * ht-bpm-oppose directive
 * @returns
 */
function htBpmOppose(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开任务办理界面
			element.bind('click',function(){
				if(window.validForm){
					var rtn= window.validForm(scope);
					if(!rtn) return;
				}
				//前置脚本 
				if(bpm.excBeforScript(scope,this)===false) return;
				flowService.handleTask("oppose", "反对", scope);
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-close">反对</a> ',
		replace:true
	};
}

/**
 * ht-bpm-abandon directive
 * @returns
 */
function htBpmAbandon(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开任务办理界面
			element.bind('click',function(){
				if(window.validForm){
					var rtn= window.validForm(scope);
					if(!rtn) return;
				}
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				flowService.handleTask("abandon", "弃权", scope);
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-danger fa fa-hand-o-up">弃权</a> ',
		replace:true
	};
}

/**
 * ht-bpm-commu directive
 * @returns
 */
function htBpmCommu(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开沟通界面
			element.bind('click',function(){
				
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("flow-feedBack", {area: ['600px', '350px'],btn:[],pageParam:{taskId:bpm.getTaskId()}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-comment-o">沟通反馈</a> ',
		replace:true
	};
}


/**
 * ht-bpm-start-commu directive
 * @returns
 */
function htBpmStartCommu(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开发起沟通界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("flow-startCommu", {area: ['600px', '320px'],btn:[],pageParam:{taskId:bpm.getTaskId()}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-comment-o">发起沟通</a> ',
		replace:true
	};
}

/**
 * ht-bpm-reject directive
 * @returns
 */
function htBpmReject(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开驳回界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("task-toReject", {area: ['600px', '275px'],btn:[],pageParam:{taskId:bpm.getTaskId(),actionName:'reject'}}); 
			});  
		},
		template:'<a href="javascript:void(0)" class="btn btn-danger fa fa-lastfm">驳回</a> ',
		replace:true
	};
}

/**
 * ht-bpm-flow-image directive
 * @returns
 */
function htBpmFlowImage(bpm, baseService, dialogService, $rootScope, $compile, $state, $q, $templateFactory,$ocLazyLoad){
    return {
        restrict:"EA",
		// template: '<div ng-include="imageUrl"></div>',
        link:function(scope, element, attrs){
            //如果在页面中
            if(attrs.htBpmFlowImage=="inHtml") {
                var state = '';
                if(bpm.isDraft()){
                    state = 'flow-image';
                }else{
                    state = 'task-image';
                }
                // if(!bpm.isInstance){
                //     state = 'task-image';
                //     if(bpm.isCreateInstance()){
                //         state = 'flow-image';
                //     }
                // }else{
                //     state = 'flow-image';
                // }
                var pageParam = {taskId:bpm.getTaskId(),instId:bpm.getProInstId(),defId:bpm.getDefId(),nodeId:'',nodeType:'',type:''};
                var s = $state.get(state);
                $templateFactory.fromConfig(s).then(function(r){
                    element.removeClass();
                    element.html(r);
                    var p = angular.noop();
                    if(s.resolve && s.resolve.loadPlugin){
                        p = s.resolve.loadPlugin($ocLazyLoad);
                    }
                    else{
                        p = true;
                    }
                    $q.when(p).then(function(){
                        var $new = $rootScope.$new();
                        if(pageParam){
                            $new['pageParam'] = pageParam;
                        }
                        ele = $compile(element.contents())($new);
                    });
                });
                return ;
            }
            element.bind('click',function(){
                if(bpm.getTaskId()){
                    dialogService.page("task-image", {area: ['950px', '600px'],btn:[],pageParam:{taskId:bpm.getTaskId()}});
                }else{
                    dialogService.page("flow-image", {area: ['950px', '600px'],btn:[],pageParam:{instId:bpm.getProInstId(),defId:bpm.getDefId(),nodeId:'',nodeType:'',type:''}});
                }
            });
        }
    };
}

/**
 * ht-bpm-approval-history directive
 * @returns
 */
function htBpmApprovalHistory(bpm, baseService, dialogService, $rootScope, $compile, $state, $q, $templateFactory,$ocLazyLoad){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			if(attrs.htBpmApprovalHistory=="inHtml"){
				// if(bpm.isCreateInstance()){
				// 	element.hide();
				// 	return ;
				// }
				var pageParam = {taskId:bpm.getTaskId(),instId:bpm.getProInstId()};
				var s = $state.get('flow-opinions');
				$templateFactory.fromConfig(s).then(function(r){
					element.removeClass();
					element.html(r);
					var p = angular.noop();
					if(s.resolve && s.resolve.loadPlugin){
						p = s.resolve.loadPlugin($ocLazyLoad); 
					}
					else{
						p = true;
					}
					$q.when(p).then(function(){
						var $new = $rootScope.$new();
						if(pageParam){
							$new['pageParam'] = pageParam;
						}
						ele = $compile(element.contents())($new);
					});
				});
				return;
			}
			
			element.bind('click',function(){
    			//启动流程
				if(bpm.isCreateInstance()){
					dialogService.alert("流程未启动");
				}
				//完成任务
				else{
					dialogService.page("flow-opinions", {area: ['950px', '600px'],btn:[],pageParam:{taskId:bpm.getTaskId()}});
				}
			});
		}
	};
}

/**
 * ht-bpm-start-trans directive
 * @returns
 */
function htBpmStartTrans(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开流转界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("task-toTrans", {area: ['650px', '440px'],btn:[],pageParam:{taskId:bpm.getTaskId()}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-ioxhost">流转</a> ',
		replace:true
	};
}

/**
 * ht-bpm-agree-trans directive
 * @returns
 */
function htBpmAgreeTrans(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 流转任务的同意界面
		    element.bind('click',function(){
		    	//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				flowService.handleTask("agreeTrans", "流转同意", scope);
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-success fa fa-ioxhost">同意</a> ',
		replace:true
	};
}

/**
 * ht-bpm-oppose-trans directive
 * @returns
 */
function htBpmOpposeTrans(bpm, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
		   //打开 流转任务的反对界面
		  //打开任务办理界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				flowService.handleTask("opposeTrans", "流转反对", scope);
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-ioxhost">反对</a> ',
		replace:true
	};
}

/**
 * ht-bpm-print directive
 * @returns
 */
function htBpmPrint(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 打印界面
		    element.bind('click',function(){
		     $(".buttons").parent().hide();
		     $(".ibox-tools").hide();
		     $(this).closest('body').printArea();
		     $(".buttons").parent().show();
		     $(".ibox-tools").show();
		    });
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-print">打印</a> ',
		replace:true
	};
}


/**
 * ht-bpm-end-process directive
 * @returns
 */
function htBpmEndProcess(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 终止流程的界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				
				dialogService.page("task-toEndProcess", {area: ['600px', '265px'],btn:[],pageParam:{taskId:bpm.getTaskId()}});
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-danger fa fa-ioxhost">终止流程</a> ',
		replace:true
	};
}

/**
 * ht-bpm-delegate directive
 * @returns
 */
function htBpmDelegate(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 转交的界面
			element.bind('click',function(){
				dialogService.page("task-toDelegate", {area: ['600px', '350px'],btn:[],pageParam:{taskId:bpm.getTaskId()}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-share">转办</a> ',
		replace:true
	};
}

/**
 * ht-bpm-add-sign directive
 * @returns
 */
function htBpmAddSign(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 加签的界面
			element.bind('click',function(){
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("task-toAddSign", {area: ['600px', '350px'],btn:[],pageParam:{taskId:bpm.getTaskId()}}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-group">加签</a> ',
		replace:true
	};
}

/**
 * ht-bpm-suspend-process directive
 * @returns
 */
function htBpmSuspendProcess(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 打印界面
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-print">禁用流程</a> ',
		replace:true
	};
}


/**
 * ht-bpm-recover-process directive
 * @returns
 */
function htBpmRecoverProcess(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开 打印界面
		},
		template:'<a href="javascript:void(0)" class="btn btn-primary fa fa-print">恢复流程</a> ',
		replace:true
	};
}

/**
 * 解锁与释放指令。
 */

/**
 * ht-bpm-lock-unlock directive 解锁与释放指令。
 * @returns
 */
function htBpmLockUnlock(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			var alias=element.attr("alias");
			var btn=scope.buttons[alias];
			scope.clsLockName='fa-print';
			scope.btnLockText=btn.name;
			scope.clsLockName='fa-unlock';
			if(btn.name=='锁定'){
				scope.clsLockName='fa-lock';
			}
			//打开任务办理界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				
				var url='${bpmRunTime}/runtime/task/v1/lockUnlock?taskId=' + bpm.getTaskId();
				$.get(url,function(rtn){
					
					//0:任务已经处理,1:可以锁定,2:不需要解锁 ,3:可以解锁，4,被其他人锁定,5 管理员
					var msg="";
					switch(rtn){
						case 0:
							msg="该任务可能由其他人进行了处理!";
							break;
						case 1:
							msg="任务已经被锁定!";
							break;
						case 3:
							msg="任务已经被释放!";
							break;
						case 4:
							msg="任务已经其他人锁定了!";
							break;
					}
					
					dialogService.alert(msg).then(function(){
						//if(window.opener){
		            	//	window.opener.refreshTargetGrid("grid");
		            	//}
						window.location.reload();
					});
				})
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-success fa {{clsLockName}}">{{btnLockText}}</a>',
		replace:true
	};
}


/**
 * ht-bpm-task-delay 任务延期操作
 * @returns
 */
function htBpmTaskDelay(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			var alias=element.attr("alias");
			var btn=scope.buttons[alias];
			scope.clsName='fa-detail';
			scope.btnText=btn.name;
			//打开任务延期界面
			element.bind('click',function(){
				dialogService.page("task-toDueTime", {area: ['650px', '460px'],pageParam:{taskId:bpm.getTaskId()}}).then(function(result){
					if(result.state){
						dialogService.success(result.message);
					}else{
						dialogService.fail(result.message);
						return ;
					}
				}); 
			});
		},
		template:'<a href="javascript:void(0)" class="btn btn-success fa {{clsName}}">{{btnText}}</a>',
		replace:true
	};
}

/**
 * ht-bpm-buttons directive
 * @returns
 */
function htBpmButtons($timeout){
	return {
		restrict:"EA",
		controller:function($scope, $element){
			$scope.buttons = [];
			
			$scope.$on("html:update",function(event,data){
				$scope.buttonList = data.buttons; 
				$scope.buttons = {};
				// 转换下格式
				for(var i=0,button;button=$scope.buttonList[i++];){
					$scope.buttons[button.alias]=button;
				} 
				//按钮排序
				window.setTimeout(function(){
					for(var i=0,button;button=$scope.buttonList[i++];){
						var key = button.alias;
						
						var directiveStr =key.replace(/[A-Z]/g, function(word){
							return "-" + word.substring(0,1).toLowerCase()+word.substring(1);} 
						); 
						directiveStr = directiveStr.replace("back-to-start","back-tostart");
						var btn = $("[ht-bpm-"+directiveStr+"]",$element);
						
						//自定义按钮处理
						if(btn.length==0 && "rejectToAnyNode,backTostart".indexOf(key)== -1){
							btn = $('<a href="javascript:void(0)" class="btn btn-primary fa fa-'+key+'" >'+button.name+'</a>');
							btn.bind('click',function(){
								//自定义按钮执行前置脚本 
								var btnScript = $(this).data("btn_script_");
								var scope = AngularUtil.getScope(scope);
								scope.bpm=bpm;
								scope.basePath = __basePath||"";
								var script = "var tempFunction = function(scope){ "+ btnScript +"};"
								var result =  eval(script+"tempFunction(scope);"); 
							});
						}
						btn.text(button.name);
						btn.attr("alias",key);
						btn.data("btn_script_",button.beforeScript);
						$element.append(btn);
					}
				},5)
			});
			
        	$scope.decideButton = function(taskAction){
        		if($scope.buttons &&$scope.buttons[taskAction]) return true;
        		
        		return false
        	};
        },
		template:'<span class="ht-bpm-buttons">'+
					'<div ng-if="decideButton(\'startFlow\')" ht-bpm-start-flow></div>'+//启动流程
					'<div ng-if="decideButton(\'agree\')" ht-bpm-agree></div>'+//同意
					'<div ng-if="decideButton(\'oppose\')" ht-bpm-oppose></div>'+//反对
					'<div ng-if="decideButton(\'abandon\')" ht-bpm-abandon></div>'+
					'<div ng-if="decideButton(\'saveDraft\')" ht-bpm-save-draft></div>'+
					'<div ng-if="decideButton(\'reject\')" ht-bpm-reject></div>'+
					'<div ng-if="decideButton(\'backToStart\')" ht-bpm-back-tostart></div>'+
					'<div ng-if="decideButton(\'endProcess\')" ht-bpm-end-process></div>'+
					'<div ng-if="decideButton(\'delegate\')" ht-bpm-delegate></div>'+
					'<div ng-if="decideButton(\'addSign\')" ht-bpm-add-sign></div>'+
					'<div ng-if="decideButton(\'startCommu\')" ht-bpm-start-commu></div>'+
					'<div ng-if="decideButton(\'commu\')" ht-bpm-commu></div>'+
					'<div ng-if="decideButton(\'startTrans\')" ht-bpm-start-trans></div>'+
					'<a   ng-if="decideButton(\'flowImage\')" ht-bpm-flow-image class="btn btn-primary fa fa-newspaper-o">流程图</a>'+
					'<a   ng-if="decideButton(\'approvalHistory\')" ht-bpm-approval-history class="btn btn-primary fa  fa-bars"> 审批历史</a>'+
					'<div ng-if="decideButton(\'opposeTrans\')" ht-bpm-oppose-trans></div>'+
					'<div ng-if="decideButton(\'agreeTrans\')" ht-bpm-agree-trans></div>'+
					'<div ng-if="decideButton(\'suspendProcess\')" ht-bpm-suspend-process></div>'+//挂起流程
					'<div ng-if="decideButton(\'recoverProcess\')" ht-bpm-recover-process></div>'+//恢复流程
					'<div ng-if="decideButton(\'lockUnlock\')" ht-bpm-lock-unlock alias="lockUnlock"></div>'+//锁定或恢复锁定
					'<div ng-if="decideButton(\'print\')" ht-bpm-print></div>'+//打印
					'<div ng-if="decideButton(\'instanceTrans\')" ht-bpm-instance-trans alias="instanceTrans" ></div>'+//抄送
					'<div ng-if="decideButton(\'taskDelay\')" ht-bpm-task-delay alias="taskDelay" ></div>'+//任务延期
				 '</span>',
		replace:true
	};
}

/**
 * ht-bpm-manager directive
 * @returns
 */
function htBpmManager($filter, bpm, baseService, dialogService, flowService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			bpm.init(attrs.htBpmManager);
			//添加子表记录
			scope.add = function(path){
				var arr = path.split(".");
				if(arr.length<2){
					dialogService.alert("subtable path is error!")
				}
				var subTableName = arr[1].replace("sub_","");
				var tempData = scope.data[arr[0]].initData[subTableName];
				
				if(!tempData)tempData={};
				var ary = eval("(scope.data." + path + ")"); 
				var newItem = angular.copy(tempData);
				if(ary){
					ary.push(newItem);
				}
				else{
					var rows=[];
					rows.push(newItem);
					eval("(scope.data." + path + "=rows)")
				}
			};
			
			var flag=0;
			//删除子表记录
			scope.remove = function(path,index){
				if(flag>0) return ;
				var ary = eval("(scope.data." + path + ")");
				if(ary&&ary.length>0){
					ary.splice(index,1);
				}
				flag=1;
				window.setTimeout(function(){flag=0;},50);
			};
			
			scope.$on("html:update",function(event,data){
				scope.form = data.form;
				//如果是内部表单的情况才处理数据。
				if(data.form.type=="INNER"){
					scope.data =data.data;
					scope.permission = parseToJson(data.permission);
					scope.opinionList = data.opinionList;
					// 初始化表单
					window.setTimeout(scope.initSubTableData,1000);
				}
				// 启动流程时， 既没有选择跳过第一个节点， 并且跳转类型设置了 jumpType： free/select  选择路径跳转或自由跳转
				if( !scope.isFirstNodeUserAssign && data.jumpType ){
					// 启动流程时，可以选择路径跳转
					scope.canSelectNode = true;
				}
			});
			
			/*响应office控件事件。
			 data : 格式
			 {action:"",scope:scope,params:{}}
			 action: 动作处理类型
			 scope : 当前scope对象
			 params :其他上下文数据
			*/
			scope.$on("office:saved",function(event,data){
				var action=data.action;
				var scope=data.scope;
				//流程启动 和保存草稿
				if(bpm.isCreateInstance()) {
					flowService.toSubmitForm(scope,action);
				}
				//任务处理
				else{
					switch(action){
						//保存草稿
						case "saveDraft":
							flowService.toSaveTaskForm(scope, bpm);
							break;
						//处理任务完成
						default:
							var json=data.params;
							var opinion=json.opinion;
							flowService.taskComplete(action,opinion,scope);
							break;
					}
				}
			});
			
			//初始化子表数据
			scope.initSubTableData = function(data,permission){
				var permission = scope.permission;
				
				var initSubTable = [];
				for(var subTable in permission.table){
					if(permission.table[subTable].required){
						initSubTable.push(subTable);
					}
				}
				
				$("[type='subGroup'][initdata]").each(function(i,item){
					initSubTable.push($(item).attr("tablename"));
				});
				var data = scope.data;
				for(var i=0,subTable;subTable=initSubTable[i++];){
					for(var boCode in data){ 
						var initData =data[boCode].initData[subTable];
						if(initData &&(!data[boCode]["sub_"+subTable]||data[boCode]["sub_"+subTable].length==0)){
							data[boCode]["sub_"+subTable] = [];
							data[boCode]["sub_"+subTable].push($.extend({},initData));
						}
					}
				}
				!scope.$$phase&&scope.$digest(); 
			}
		},
		template: '<div>\
					<div class="innerForm" ng-show="form.type==\'INNER\'" ht-bind-html="form.formHtml"></div>\
					<div ng-show="form.type==\'FRAME\'" ht-frame-form ng-model="form"></div>\
				   </div>'
	};
}

/**
 * ht-bpm-back-tostart directive
 * @returns
 */
function htBpmBackTostart(bpm, baseService, dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			//打开驳回界面
			element.bind('click',function(){
				//前置脚本
				if(bpm.excBeforScript(scope,this)===false) return;
				dialogService.page("task-backToStart", {area: ['600px', '230px'],btn:[],pageParam:{taskId:bpm.getTaskId(),actionName:'backToStart'}}); 
			});  
		},
		template:'<a href="javascript:void(0)" class="btn btn-danger fa fa-lastfm">驳回到发起人</a>',
		replace:true
	};
}

/**
 * bpm-form directive
 * @returns
 */
function bpmForm(baseService, dialogService) {
	return {
		restrict: 'AE',
		scope: {
			bpmForm: "=",
			mobileForm: "=",
			updateMethod: "&"
		},
		link: function(scope, element, attrs, ctrl) {
			scope.title = attrs.title;
			scope.prefix = {};
			var type = attrs.type;
			var nodeTyped = '';
			if (attrs.nodeid) scope.nodeMsg = eval('(' + attrs.nodeid + ')');

			scope.$on('nodeSetUpdate', function() { //监听节点保存时间，更新按钮状态
				if (!scope.nodeMsg) return; //不是节点表单不做判断
				scope.bpmForm.formValue = scope.bpmForm.formValue || '';
				if (scope.bpmForm.formValue != '') hasForm = true;
				if ((scope.nodeMsg.type == 'userTask' || scope.nodeMsg.type == 'signTask') && scope.bpmForm.formValue != '') {
					scope.showAuthorizeSubData = true;
				} else {
					scope.showAuthorizeSubData = false;
				}
			});

			if (type == "node" && scope.bpmForm.formValue && (scope.nodeMsg.type == 'userTask' || scope.nodeMsg.type == 'signTask')) {
				scope.showAuthorizeSubData = true;
			}
			if (scope.bpmForm && scope.bpmForm.formValue) hasForm = true;

			//选择表单
			scope.selectForm = function(isPc) {
				var topDefKey = scope.$parent.topDefKey;
				var formType = isPc ? "pc" : "mobile";
				dialogService.page("flow-bpmFormSelector", {
					pageParam: {
						formType: formType,
						single: true
					},
					title: '表单选择器'
				}).then(function(data) {
					var formStr = isPc ? "bpmForm" : "mobileForm";
					if (!scope[formStr]) scope[formStr] = {};

					// 更新父作用域的值
					var prefix = attrs[formStr];
					if(scope.nodeMsg){
						if(!isPc){
							prefix = attrs['mobilePath'] + '.' + scope.nodeMsg.nodeId;
						}else{
							prefix = attrs['path'] + '.' + scope.nodeMsg.nodeId;
						}
					}
					
					scope.updateMethod({
						path: prefix + '.type',
						value: 'INNER'
					});
					scope.updateMethod({
						path: prefix + '.name',
						value: data.name
					});
					scope.updateMethod({
						path: prefix + '.formValue',
						value: data.formKey
					});
				});
			}
			//授权
			scope.authorize = function() {
				if (!scope.bpmForm.formValue) {
					dialogService.alert('请先设置表单!');
					return;
				}
				var param = {
					flowKey: scope.$parent.initData.bpmDefinition.defKey,
					formKey: scope.bpmForm.formValue
				};
				if (type == 'node') param['nodeId'] = scope.bpmForm.nodeId;
				if (type == 'instance') param['instId'] = true;

				dialogService.page("flow-formRigthSetting", {
					btn: ['保存', '取消'],
					pageParam: param,
					title: '表单授权',
					alwaysClose: false
				}).then(function(r) {
					if (r.result) {
						if (r.result.state) {
							dialogService.success(r.result.message).then(function() {
								dialogService.close(r.index);
							})
						} else {
							dialogService.fail(r.result.message);
						}
					} else {
						dialogService.fail("请求失败");
					}
				});
			}

			// 子表数据授权
			scope.authorizeSubData = function() {
				var url = '/form/rights/subRightsDialog?flowKey=' + scope.$parent.initData.bpmDefinition.flowKey 
						+ '&nodeId=' + scope.bpmForm.nodeId + '&defId=' + scope.$parent.initData.bpmDefinition.defId 
						+ '&parentDefKey=' + scope.$parent.initData.bpmDefinition.topDefKey;

				var width = width || 800;
				var height = height || 600;
				var dialog;
				var def = {
					title: "子表数据授权页面",
					width: width,
					height: height,
					modal: true,
					resizable: true,
				};
				dialogService.page("flow-formRigthSetting", {
					pageParam: {
						formType: scope.bpmForm.formType,
						single: true
					},
					title: '表单授权'
				});
			}

			//清除表单和已设置该节点的表单权限
			scope.clearForm = function(form) {
				var nodeId = form.nodeId || "";
				var flowkey = scope.$parent.initData.bpmDefinition.defKey;
				baseService.get("${form}/form/rights/v1/remove?flowKey=" + flowkey + "&nodeId=" + nodeId + "&parentFlowKey=").then(function(data) {
					if (data.state) {
						dialogService.success(data.message);
						form.name = "";
						form.formValue = "";
						scope.showAuthorizeSubData = false;
					} else {
						dialogService.fail(data.message);
					}
				});

			}

			//点击所选手机表单，打开手机表单的预览界面
			scope.openMobile = function(formKey) {
				var url = '/form/form/preview?formKey=' + formKey;
				window.open(url);
			}
		},
		template: '<div class="well">\
    			  <div class="form-group form-inline">\
				    <label class="control-label left-label">{{title}}</label>\
				    <select class="form-control" ng-model="bpmForm.type" ht-validate="{required:true}">\
						<option value="INNER">在线表单</option>\
						<option value="FRAME">URL表单</option> \
					</select>\
				  </div>\
				  <div class="form-group form-inline" ng-if="bpmForm.type==\'INNER\'">\
				    <label class="control-label left-label ">PC端:</label>\
    					<div class="right-operation">\
						<a  target="_blank">{{bpmForm.name}}</a>\
						<span ng-if="!bpmForm.name" class="operation_text">请选择</span>\
						<a href="javascript:void(0);" class="btn btn-sm btn-info fa fa-search-plus" ng-click="selectForm(true)"></a>\
						<a href="javascript:void(0);" ng-if="bpmForm.name" class="btn btn-sm btn-info fa fa-undo" ng-click="clearForm(bpmForm)"></a>\
						<a href="javascript:void(0);" ng-if="bpmForm.name"  class="btn btn-sm btn-info fa fa-tachometer" ng-click="authorize()">授权</a>\
						<a href="javascript:void(0);" class="btn btn-sm btn-info fa fa-tachometer" ng-click="authorizeSubData()" ng-if="showAuthorizeSubData" >子表数据授权</a>\
						</div>\
				  </div>\
				  <div ng-if="bpmForm.type==\'FRAME\'" class="form-inline">\
						<label class="control-label left-label">PC端URL:</label><input ng-model="bpmForm.formValue" class="form-control">\
				  </div>\
				  <div>\
					  <div class="form-group form-inline" ng-if="bpmForm.type==\'INNER\'">\
					    <label class="control-label left-label">手机端:</label>\
					    <span ng-if="!mobileForm.name" class="operation_text">请选择</span>\
					    <div class="right-operation">\
						<a>{{mobileForm.name}}</a>\
						<a href="javascript:void(0);" class="btn btn-sm btn-info fa fa-search-plus" ng-click="selectForm(false)"></a>\
						<a href="javascript:void(0);" ng-if="mobileForm.name" class="btn btn-sm btn-info fa fa-undo" ng-click="clearForm(mobileForm)"></a>\
						<div>\
					  </div>\
				  </div></div>'
	}
}

/**
 * dynamic-directive directive
 * @returns
 */
function dynamicDirective($compile) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			var directives = attrs.dynamicDirective;
			if(!directives)return;
			var directiveArr = directives.split(",");
			
			var str = "<div ";
			for(var i=0,d;d=directiveArr[i++];){
				str=str+d.split(":")[0]+"="+d.split(":")[1]+" ";
			}
			str +="></div>";
			element.removeAttr("dynamic-directive")
			element.removeClass("ng-binding");
			element.html(str);
            $compile(element)(scope);
		}
	};
}

/**
 * bpm-msgtype-select directive
 * @returns
 */
function bpmMsgtypeSelect($compile) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			scope.$on('afterLoadEvent',  function(event, data) {
				scope.messageTypelist=scope.initData.messageTypelist;
				var html="";
				for(var key in data){
					html+='<label> <input type="checkbox"  ng-model="notifyType_'+key+'" value="'+key+'" />'+data[key]+'</label>';
				}
				element.html(html);
	            $compile(element.contents())(scope);
    	    });
		}
	};
}

/**
 * ht-bpm-start-flow directive
 * @returns
 */
function htBpmStartFlow(bpm, baseService, flowService,dialogService){
	return {
		restrict:"EA",
		link:function(scope, element, attrs){
			element.bind("click",function(){
				if(!scope.hasOwnProperty("data")){
					scope = $('div[ng-controller="flowStartCtrl"]').scope();
				}
				if(scope.custForm.$invalid){
					dialogService.warn("表单校验不通过，请正确填写表单信息");
					return;
				}
				
				//固定的检验脚本。
				if(window.validForm){
					var rtn= window.validForm(scope);
					if(!rtn) return;
				}
				//前置脚本执行结果为false 则不继续
				var scriptResult = bpm.excBeforScript(scope,this);
				if(scriptResult===false) return;
				
				if(scriptResult.hasOwnProperty("done")){
					scriptResult.done(function(){
						flowService.submitForm(scope,"startFlow");
					}).fail(function(){
						return;
					});
				}else{
					flowService.submitForm(scope,"startFlow");
				}
			});
		},
		template:'<a class="btn btn-success fa fa-send">启动</a>',
		replace:true
	};
}


/**
 * 节点规则指令
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmNodeRules(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			var ruleData = {};
			var currentNodeId = "";
			
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal){
					currentNodeId = scope.edittingNodeId;
					if(ruleData[currentNodeId]){
						scope.ruleList =ruleData[currentNodeId];
					}else {
						loadData();
					}
				}
			})
			var loadData = function(){
				baseService.post("${bpmModel}/flow/node/v1/ruleListJson?definitionId="+scope.id+"&nodeId="+currentNodeId).then(function(data){
					scope.ruleList =data.rows;
					ruleData[currentNodeId] = data.rows;
				});
			}
			scope.editNodeRules = function(){
				 dialogService.sidebar("flow-nodeJumpRule", {bodyClose: false, width: '900px', 
					 pageParam:{defId:scope.id,nodeId:currentNodeId,title:"跳转规则设置"+currentNodeId}});
				 scope.$on('sidebar:close', function(e,data){//添加监听事件,监听子页面是否关闭
					 loadData();//子页面关闭,父页面数据刷新
			      });
			}
		},
		template:'<div>\
					<div class="table-nest">\
						<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editNodeRules()">设置跳转规则</div>\
					</div>\
					<div class="alert alert-info show-grid" role="alert" ng-if="!ruleList||ruleList.length==0">尚未配置节点规则</div>\
					<div class="alert-info  show-grid" ng-repeat="rule in ruleList">\
			      		<span class="control-label">【{{rule.ruleName}}】<div class="btn btn-sm">跳转至:{{rule.targetNode}}</div></span>\
					</div>\
				<div>',
		replace:true
	};
}

/**
 * 节点事件脚本
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmEventScript(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			var ruleData = {};
			
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal) loadData();
			})
			var loadData = function(){
				scope.scriptMap =scope.nodeScriptMap[scope.edittingNodeId];
				var newMap={};
				for(var key in scope.scriptMap){
					newMap[key.toLowerCase()]=scope.scriptMap[key];
				}
				scope.scriptMap=newMap;
			}
			var setData = function(data){
				var scriptMap = {};
				for(var i=0,d;d=data[i++];){
					scriptMap[d.scriptType] = d.content;
				}
				scope.nodeScriptMap[scope.edittingNodeId] =scriptMap;
				scope.scriptMap = scriptMap;
			}
			scope.editEventScript = function(){
				 dialogService.sidebar("flow-nodeScript", {bodyClose: false, width: '700px', 
					 pageParam:{defId:scope.id,nodeId:scope.edittingNodeId,title:"事件脚本设置"+scope.edittingNodeId}});
				 scope.$on('nodeScriptSave', function(e,data){//添加监听事件,监听子页面是否关闭
					 setData(data);//子页面关闭,父页面数据刷新
			      });
			}
		},
		template:'<div>\
					<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editEventScript()">设置节点脚本</div><br>\
				<div ng-if="edittingNodeType==\'start\'">\
					<label class="control-label left-label">开始事件:</label>\
					<div class="alert alert-info show-grid" role="alert" ng-if="!scriptMap.start">尚未配置开始脚本</div>\
					<div class="well row show-grid" ng-if="scriptMap.start">\
						<code>{{scriptMap.start}}</code>\
					</div>\
				</div>\
				<div ng-if="edittingNodeType==\'end\'">\
					<label class="control-label left-label">结束事件:</label>\
					<div class="alert alert-info show-grid" role="alert" ng-if="!scriptMap.end">尚未配置结束脚本</div>\
					<div class="well row show-grid" ng-if="scriptMap.end">\
						<code>{{scriptMap.end}}</code>\
					</div>\
				</div>\
				<div ng-if="edittingNodeType==\'usertask\'||edittingNodeType==\'signtask\'" style="width:100%">\
					<label class="control-label">前置事件:</label>\
					<div class="alert alert-info show-grid" role="alert" ng-if="!scriptMap.create">尚未配置前置脚本</div>\
					<div class="well show-grid" ng-if="scriptMap.create">\
						<code>{{scriptMap.create}}</code>\
					</div>\
				</div>\
				<div ng-if="edittingNodeType==\'usertask\'||edittingNodetype==\'signTask\'">\
					<label class="control-label">后置事件:</label>\
					<div class="alert alert-info show-grid" role="alert" ng-if="!scriptMap.complete">尚未配置后置脚本</div>\
					<div class="well show-grid" ng-if="scriptMap.complete">\
						<code>{{scriptMap.complete}}</code>\
					</div>\
				</div>\
				<div>',
		replace:true
	};
}

/**
 * 同步网关
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmExclusiveGateway(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			scope.data = {};
			
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal){
					if(scope.data[newVal]){
						scope.scirptMap = scope.data[newVal].scriptMap;
						scope.outComeNodes = scope.data[newVal].outComes;
					}
					else loadData();
				}
			})
			var loadData = function(){
				baseService.get('${bpmModel}/flow/node/v1/getNodeOutcomes?defId='+scope.id+'&nodeId='+scope.edittingNodeId,{}).then(function(data){
					scope.scirptMap = data.scriptMap;
					scope.outComeNodes = data.outComes;
					scope.data[scope.edittingNodeId] = data;
				})
			}
			scope.editNodeRules = function(){
			    dialogService.sidebar("flow-branchCondition", {bodyClose: false, width: '600px', 
					 pageParam:{defId:scope.id,nodeId:scope.edittingNodeId,title:"分支条件设置"+scope.edittingNodeId}});
				 scope.$on('sidebar:close', function(e,data){//添加监听事件,监听子页面是否关闭
					 loadData();//子页面关闭,父页面数据刷新
			      });
			}
		},
		template:'<div>\
				<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editNodeRules()">设置分支条件</div>\
				<div class="alert-info row show-grid" ng-repeat="node in outComeNodes">\
			      	<span class="control-label">目标节点：{{node.nodeId}}({{node.nodeName}})</span><br><br>\
		  			<code style="word-wrap: break-word;word-break: break-all;white-space: initial;">{{scirptMap[node.nodeId]||\'【尚未设置分支条件】\'}}</code>\
				</div>\
				<div>',
		replace:true
	};
}

/**
 * 自动任务
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmAutoService(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			var currentNodeId =""; 
			var dataMap ={};
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal){
					currentNodeId = scope.edittingNodeId;
					if(dataMap[newVal]){
						scope.scirptMap = dataMap[newVal].data;
					}
					else loadData();
				}
			})
			
			var loadData = function(){
				baseService.get('${bpmModel}/flow/node/v1/getNodeAutoTask?defId='+scope.id+'&nodeId='+currentNodeId,{}).then(function(data){
					scope.autoTask = data
					dataMap[currentNodeId] = data;
				})
			}
			
			scope.editAutoService = function(){
				 dialogService.sidebar("flow-autoTask", {bodyClose: false, width: '800px', 
					 pageParam:{defId:scope.id,nodeId:scope.edittingNodeId,title:"自动任务节点"+scope.edittingNodeId}});
				 scope.$on('sidebar:close', function(e,data){//添加监听事件,监听子页面是否关闭
					 loadData();//子页面关闭,父页面数据刷新
			      });
					
			}
		},
		template:'<div>\
				<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editAutoService()">设置自动任务</div>\
				<div class="alert alert-info row show-grid" role="alert" ng-if="!autoTask">尚未配置自动任务</div>\
				<div class="alert-info row show-grid" ng-if="autoTask.title==\'webService\'">\
			      	<h3 class="control-label">WebService 节点</h3>\
		  			<div>webService方法：{{autoTask.name}}</div>\
				</div>\
				<div class="alert-info row show-grid" ng-if="autoTask.title==\'消息节点\'">\
		      		<h3 class="control-label">自动消息节点</h3>\
				</div>\
				<div class="alert-info row show-grid" ng-if="autoTask.title==\'脚本\'">\
			  		<h3 class="control-label">脚本节点</h3><br><br>\
					<code>{{autoTask.script}}</code>\
				</div>\
				<div>',
		replace:true
	};
}

/**
 * 会签
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmSignConfig(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			var currentNodeId = "";
			var dataMap = {};
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal){
					currentNodeId = scope.edittingNodeId;
					if(dataMap[newVal]){
						scope.privilegeMap = dataMap[currentNodeId].privilegeList;
						scope.signRule = dataMap[currentNodeId].signRule;
					}
					else loadData();
				}
			})
			
			var loadData = function(){
				baseService.get('${bpmModel}/flow/node/v1/getSignConfig?defId='+scope.id+'&nodeId='+currentNodeId).then(function(data){
					scope.privilegeMap = data.privilegeList;
					scope.signRule = data.signRule;
					dataMap[currentNodeId] = data;
				})
			}
			
			scope.editSignConfig = function(){
				dialogService.sidebar("flow-signConfig", {bodyClose: false, width: '700px', 
					 pageParam:{defId:scope.id,nodeId:scope.edittingNodeId,title:"会签节点规则定义"+scope.edittingNodeId}});
				 scope.$on('sidebar:close', function(e,data){//添加监听事件,监听子页面是否关闭
					 loadData();//子页面关闭,父页面数据刷新
			      });
			
			}
		},
		template:'<div>\
				<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editSignConfig()">设置会签规则</div>\
				<div class="alert alert-info show-grid" role="alert" ng-if="!signRule">尚未配置会签规则</div>\
				<div class="alert-info row show-grid form-inline" ng-if="signRule">\
			      	<label class="control-label">{{signRule.decideType==\'agree\'?\'同意\':\'反对\'}}票\
					达到 {{signRule.voteAmount}}{{signRule.voteType==\'amount\'?\'张\':\'%\'}}则{{signRule.decideType==\'agree\'?\'同意\':\'反对\'}} \
					({{signRule.followMode==\'wait\'?\'等待所有人完成投票\':\'达到设定直接处理\'}})</label><br><br>\
					<div ng-repeat="(key,privilege) in privilegeMap">\
			      		<label class="control-label left-label" ng-if="key==\'all\'">所有特权:</label>\
						<label class="control-label left-label" ng-if="key==\'direct\'">直接处理:</label>\
						<label class="control-label left-label" ng-if="key==\'oneticket\'">一票特权:</label>\
						<label class="control-label left-label" ng-if="key==\'allowAddSign\'">允许增加会签:</label>\
		  				<span ng-repeat="nodeCondition in privilege">{{$index+1}}、{{nodeCondition.description}};</span><br><br>\
					</div>\
				</div>\
				<div>', 
		replace:true
	};
}

/**
 * 催办设置
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmTaskReminder(baseService,dialogService){
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			var currentNodeId =""; 
			var dataMap ={};
			scope.$parent.$watch("edittingNodeId",function(newVal,oldVal){
				if(newVal){
					currentNodeId = scope.edittingNodeId;
					if(dataMap[newVal]){
						scope.taskReminderList = dataMap[newVal].data;
					}
					else loadData();
				}
			})
			
			var loadData = function(){
				baseService.get('${bpmModel}/flow/plugins/v1/remindersJson?defId='+scope.id+'&nodeId='+currentNodeId,{}).then(function(data){
					scope.taskReminderList = data.reminders.reminderList;
					dataMap[currentNodeId] = data.reminders.reminderList;
				})
			}
			scope.editTaskReminder = function(){
				 dialogService.sidebar("flow-taskRemind", {
					  bodyClose: false, 
					  width: '900px',
					  pageParam:{defId:scope.id,nodeId:scope.edittingNodeId,title:"催办设置"+scope.edittingNodeId}
				 });
				 scope.$on('nodeScriptSave', function(e,data){//添加监听事件,监听子页面是否关闭
					 setData(data);//子页面关闭,父页面数据刷新
			      });
			}
		},
		template:'<div>\
				<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editTaskReminder()">设置催办</div>\
				<div class="alert alert-info show-grid" role="alert" ng-if="!taskReminderList||taskReminderList.length==0">尚未配置催办任务</div>\
				<div class="alert-info show-grid" ng-repeat="taskReminder in taskReminderList">\
			      	<span class="control-label">{{taskReminder.name}}<div>查看更多信息请编辑</div>\
		  			</span>\
				</div>\
			<div>',
		replace:true
	};
}

/**
 * 子流程设置
 * <pre>
 * 动态指令，不会直接出现在html代码中，是通过dynamicDirective动态编译出来的。
 * </pre>
 * @returns
 */
function bpmCallActivity(baseService,dialogService) {
	return {
		restrict : 'A',
		scope:true,
		link : function(scope, element, attrs) {
			scope.editCallActivity = function(){
				var url='${bpmModel}/flow/def/v1/subFlowDetail?defId='+scope.id+'&nodeId='+scope.edittingNodeId ;
				baseService.get(url).then(function(data){
					if(data){
						scope.$root.$broadcast('showSubFlowSetting',data);
					}
				})
			}
		},
		template:'<div>\
					<div class="btn btn-danger btn-sm fa fa-edit pull-right" ng-click="editCallActivity()">设置子流程设置</div>\
				<div>',
		replace:true
	};
}

/**
 * fieldTemplate - Directive for 
 */
function fieldTemplate($compile){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var templates = scope[attrs.templates],
                field = scope[attrs.fieldTemplate];
            if(!templates || templates.length==0){
                throw new Error("templates can not be empty.");
            }
            if(!field){
                throw new Error("field-template can not be empty.");
            }

            var html = templates[field.ctrlType];
            if(!html){
                throw new Error("no match template for field type:" + field.ctrlType);
            }
            var newEle = angular.element(html);
            if(newEle.length != 1){
            	throw new Error("the template must be one element.");
            }
            var tagName = newEle[0].tagName;
            if(tagName=='DIV'){
            	$("input,select,textarea", newEle).each(function(){
                	var me = $(this);
                	me.attr("readonly", "readonly");
                    me.attr("disabled", "disabled");
                });
            }
            else if(tagName=='INPUT' || tagName=='SELECT' || tagName=='TEXTAREA'){
            	newEle.attr("readonly", "readonly");
            	newEle.attr("disabled", "disabled");
            }
            angular.element(element).html(newEle[0].outerHTML);
            $compile(element.contents())(scope);
        }
    }
}

/**
 * svg data - translate path into url  
 */
function svgData($compile, context){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var $ele = angular.element(element),
            	ctx = context();
            
            $ele.attr("data", ctx['web'] + "/manage" + attrs.svgData);
        }
    }
}

/**
 * fieldTemplate - Directive for 
 */
function subTemplate($compile){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var templates = scope[attrs.templates],
                field = scope[attrs.subTemplate];
            if(!templates || templates.length==0){
                throw new Error("templates can not be empty.");
            }
            if(!field){
                throw new Error("field-template can not be empty.");
            }

            var html = templates[field.ctrlType];
            if(!html){
                throw new Error("no match template for field type:" + field.ctrlType);
            }
            var newEle = angular.element(html);
            angular.element(element).html(newEle[0].outerHTML);
            $compile(element.contents())(scope);
            scope.initDroptoArea("div.sub-container div.dropto");
        }
    }
}

/**
 * 数据字典指令
 * dictype：数据字典别名
 */
 function htDiccheckbox(baseService){
	return {
		restrict: 'A',
		link: function(scope, element, attrs) { 
			element.removeClass();
			scope.permission = "b";
			if(attrs.permission){
				scope.permission = attrs.permission;
			}
			var isOnlyShow=attrs.isonlyshow||false;
			var dicKey =attrs.dickey; //数据字典的类型
			var url=attrs.url||"${portal}/sys/dataDict/v1/getByTypeKeyForComBo?typeKey="+dicKey;
			var keyName =attrs.keyName||"key";
			var valName=attrs.valName||"text";
			var rtn = baseService.post(url,{});
			var fileName=attrs.ngModel.split('.')[1];
			rtn.then(function(data) {
				var htmlStr='';
				setTimeout(function() {
					for(var i=0;i<data.length;i++){
						var isHas=false;
						var hasOpArr=[];
						if(JSON.stringify(scope.data) !='{}' && scope.data[fileName]){
							hasOpArr=scope.data[fileName].split('|');
						}
						for(var j=0;j<hasOpArr.length;j++){
							if(data[i][valName]==hasOpArr[j]){
								isHas=true;
							}
						}
						if(isOnlyShow){
							if(isHas){
								htmlStr+=data[i][valName]+"&nbsp;&nbsp;";
							}
						}else{
							if(isHas){
								htmlStr+="<label><input type='checkbox' checked='checked'  name="+fileName+"  value="+data[i][keyName]+">"+data[i][valName]+"</label>&nbsp;&nbsp;";
							}else if(!isOnlyShow){
								htmlStr+="<label><input type='checkbox' name="+fileName+"   value="+data[i][keyName]+">"+data[i][valName]+"</label>&nbsp;&nbsp;";
							}
						}
					}
				  $(element).after(htmlStr);
					$(":checkbox",$(element).parent()).click(function(){
						scope.data[fileName]='';
						$(":checkbox:checked",$(element).parent()).each(function(){ 
							scope.data[fileName]+=$(this).parent().text()+'|';
						});
                        scope.data[fileName]=scope.data[fileName].substring(0, scope.data[fileName].length - 1);
                    });
				}, 100);
			}, function(errorCode) {
			});
		}
	};
}

	/*
  * 功能输入框指令。
  * 使用方法:
  * <div >
  * 	<input ht-input="data.main.name" permission='w' />
  * </div>
  * 	ht-input对应的属性值为scope对应的数据值路径。
  * 	permission:
  * 		取值有两种：
  * 			r:只读
  *  		w:可输入
  */
 function htInput(){
 	return {
     	restrict : 'AE',
     	priority : 1003,
     	link: function(scope, element, attrs,ctrl){
     		var permission = getPermission(attrs.permission,scope);
     		
     		if(permission=='r')	{
     			try {
     				element.after(eval("scope."+attrs.ngModel));
 				} catch (e) {}
     			element.remove();
     		}
     		if(permission=='n')	{ $(element).remove(); }
     		
     	}
 }}
 /*
  * 多行文本框指令。
  * 使用方法:
  * 	<textarea ht-textarea="data.main.name" permission='w' />
  * 	ht-textarea 对应的属性值为scope对应的数据值路径。
  * 	permission:
  * 		取值有两种：
  * 			r:只读
  *  		w:可输入
  */
  function htTextarea(){
 	return {
     	restrict : 'AE',
     	scope: {
     		htTextarea:"=",
     		placeholder:'@'
     	},
     	link: function(scope, element, attrs,ctrl){
     		var permission = getPermission(attrs.permission,scope);
     		
     		if(permission=='r')	{
     			element.hide();
     			element.after(scope.htTextarea);
     		}
     		else if(permission=='n') { $(element).remove(); }
     	}
 }}
 
 /**
  * 按钮权限指令 控制是否显示
  */
function htMethodAuth($sessionStorage){
 	return {
        restrict:"AE",
        scope:{
        	htMethodAuth:"@"
        },
        compile:function(tELe ,tAttrs,transcludeFn){
                //进行编译后的dom操作
                return{
                        pre:function(scope, iElement, iAttrs, controller){
                            // 在子元素被链接之前执行
                            // 在这里进行Dom转换不安全
                        },
                        post:function(scope, iElement, iAttrs, controller){
                            // 在子元素被链接之后执行
                        	var methodAuth = $sessionStorage.methodAuth;
                        	var allMethod = methodAuth.allMethod  || [] ;
                        	var curUserMethod =  methodAuth.curUserMethod  || [] ;
                        	// 无权限则隐藏按钮
                        	if( !curUserMethod.contains(scope.htMethodAuth) && allMethod.contains(scope.htMethodAuth) ){
                        		$(iElement).hide();
                        	}
                        	
                        }
                  }
        }
 	};
} 

 

//业务数据模板相关指令 开始
/**
 * right-select
 */
function rightSelect(){
	return {
		restrict : 'E',
		replace : true,
		scope:{
			list:"="
		},
		template : '<select  ng-model="r" ng-change="setPermision(list)">'+
						 '<option value="">请选择</option>'+
						 '<option value="none">无</option>'+
						 '<option value="everyone">所有人</option>'+
				   '</select>',
		link : function(scope, elm, attrs) {
			scope.setPermision = function(list) {
					if(scope.r=="") return;
					for(var i = 0 ; i < list.length ; i++){
						if(list[i].fields&&list[i].fields.length>0){
							scope.setPermision(list[i].fields);
						}else{
							if(list[i].right){
								list[i].right = parseToJson(list[i].right);
							}
							if(list[i].right[0].hasOwnProperty("v"))
								list[i].right[0] = {"v":scope.r};
							else
								list[i].right[0] = {"type":scope.r};
						}
						
					}
			}
		}
	};
}

/**
 * tool-buttons
 */
function toolButtons(dataRightsService, ArrayToolService){
	return {
		restrict : 'E',
		replace : true,
		scope:{type:"@",list:"=",field:"=",index:"@",ctrl:"@"},
		template :  '<div>'+
						'<a ng-if="type==4&&ctrl&&service.isInCtrl(ctrl)" class="btn btn-sm"><button type="button" class="btn" ng-class="{true:\'btn-warning\',false:\'inactive\'}[(field.controlContent&&field.controlContent.length>0)||(field.controlContent&&field.controlContent.alias.length>0)||(field.controlContent&&field.controlContent.alias)||(field.dateFormat&&field.dateFormat!=\'\')]" ng-click="service.fieldCtrlDialog(field)">控</button></a>'+
						/*'<a ng-if="field&&type==4" class="btn btn-sm"><button type="button" class="btn" ng-class="{true:\'btn-warning\',false:\'inactive\'}[(field.alarmSetting!=null&&field.alarmSetting.length>0)||(field.formater!=null&&field.formater!=\'\')]" ng-click="service.fieldMetaDialog(field)">报</button></a>'+*/
						'<a class="btn btn-sm btn-default fa fa-chevron-up" href="javascript:;" ng-click="ArrayTool.up(index,list)"></a>'+
						'<a class="btn btn-sm btn-default fa fa-chevron-down" href="javascript:;" ng-click="ArrayTool.down(index,list)"></a>'+
						'<a class="btn btn-sm btn-default fa fa-edit" ng-if="type==3" href="javascript:;" title="编辑" ng-click="service.addFilter(list,index)"></a>'+
						'<a class="btn btn-sm btn-default fa fa-trash-o" ng-if="type==4||type==3"  href="javascript:;" ng-click="ArrayTool.del(index,list)"></a>'+
					'</div>',
		link : function(scope, elm, attrs) {
			scope.service = dataRightsService;
			scope.ArrayTool = ArrayToolService;
		}
	};
}
/**
 * display-setting
 */
//显示字段，显示列字段
function displaySetting(dataRightsService){
	return {
		restrict : 'E',
		replace : true,
		template :  '<div>'+
						'<div  class="condition-cols">'+
							'<div >'+
								'<div class="condition-cols-div">'+
									'<table id="condition-columnsTbl"  cellpadding="0" cellspacing="0" border="0" class="table-form list-table">'+
										'<thead>'+
											'<tr class="leftHeader">'+
												'<th>选择</th>'+
												'<th>列名</th>'+
												'<th>注释</th>'+
												'<th>类型</th>'+
											'</tr>'+
										'</thead>'+
										'<tbody>'+
											'<tr ng-repeat="field in displaySettingFields track by $index" ng-if="field.isVirtual!=1" ng-class="{odd:$index%2==0,even:$index%2!=0,\'tr-select\':field.checked}" ng-click="field.checked=!field.checked">'+
												'<td><input class="pk" type="checkbox" ng-model="field.checked"></td>'+
												'<td>{{field.fieldName||field.name}}</td>'+
												'<td>{{field.fieldDesc||field.desc}}</td>'+
												'<td>{{field.fieldType||field.type||field.dataType}}</td>'+
											'</tr>'+
										'</tbody>'+
									'</table>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="condition-conds">'+
							'<div class="condition-conds-div condition-conds-build" id="condition-build-div">'+
								'<div class="condition-conds-div-left">'+
									'<div class="condition-conds-div-left-div" style="padding-top: 180px;">'+
										'<a  href="javascript:service.selectDisplayField(false);" class="button" ht-tip title="添加">'+
											'<span><i class="fa fa-arrow-circle-right"></i></span>'+
										'</a>'+
										// '<a  href="javascript:;" class="button" ht-tip title="添加全部" ng-click="service.selectDisplayField(true)">'+
										// '<span><i class="fa fa-arrow-circle-right"></i>></span>'+
									//'</a>'+
									'</div>'+
								'</div>'+
								'<div class="condition-conds-div-right">'+
									'<div class="condition-conds-div-right-div">'+
										'<table id="displayFieldTbl"  class="table-form list-table">'+
											'<thead>'+
												'<tr>'+
													'<th style="width:5%">序号</th>'+
													'<th style="width:15%">列名</th>'+
													'<th style="width:20%">注释</th>'+
													'<th style="width:20%" ng-if="!service.noRights">'+
														'显示权限'+
														'<right-select list="displayFields"></right-select>'+
													'</th>'+
													'<th style="width:25%">管理</th>'+
												'</tr>'+
											'</thead>'+
											'<tbody>'+
												'<tr var="displayFieldTr" ng-repeat="f in displayFields track by $index">'+
													'<td var="index">{{$index+1}}</td>'+
													'<td var="name">{{f.name}}</td>'+
													'<td >'+
														'<input type="text"  var="desc"  ng-model="f.desc" />'+
													'</td>'+
													'<td ng-if="!service.noRights">{{service.rightToDesc(f.right)}}'+
														'<a style="float: right;" ng-click="service.fieldDialog(f)" class="btn btn-sm btn-default btn-mini fa fa-edit"></a>'+
													'</td>'+
													'<td>'+
														'<tool-buttons list="displayFields" index="{{$index}}" field="f" type="4"></tool-buttons>'+
													'</td>'+
												'</tr>'+
											'</tbody>'+
										'</table>'+
									'</div>'+
								'</div>'+
							'</div>'+
					'</div>',
					link:function(scope,el,attrs){
						scope.service = dataRightsService;
					 	scope.service.initSelected(scope.displaySettingFields,scope.displayFields,"name");
					}
	};
}
//
/**
 * field-setting 显示字段,显示列字段 <field-setting ></field-setting> for  SYS_QUERY_FIELDSETTING
 */
function fieldSetting() {
	return {
		restrict : 'E',
		replace : true,
		template :  '<div>'+
						'<a class="link reset" ng-click="resetDiaplayFields()">重置列表</a>'+
							'&nbsp;&nbsp;&nbsp;&nbsp;'+
						'<a class="link reset" ng-click="resetAllDiaplayFields()">重置所有列表</a>'+
						'<table class="table-grid">'+
							'<thead>'+
								'<tr>'+
									'<th width="5%">序号</th>'+
									'<th width="5%">顺序</th>'+
									'<th width="5%">列名</th>'+
									'<th width="5%">注释</th>'+
									'<th width="5%">支持排序</th>'+
									'<th width="5%">排序方向</th>'+
									'<th width="5%">默认排序</th>'+
									'<th width="5%">是否冻结</th>'+
									'<th width="5%">是否隐藏</th>'+
									'<th width="5%">对齐方式</th>'+
									'<th width="5%">统计类型</th>'+
									'<th width="5%">宽度(%)</th>'+
									'<th width="20%">统计模板'+
										'<div class="tipbox">'+
											'<a href="javascript:;" class="tipinfo"><span>这里显示分组统计使用的模版，{0}中的内容为统计结果，示例:小计:&lt;span style="color:red;">{0}&lt;/span>,如果使用需要最此字段定义分组。</span></a>'+
										'</div>'+
									'</th>'+
									'<th width="20%" ng-if="!service.noRights">'+
										'显示权限'+
										'<right-select list="displayFields"></right-select>'+
									'</th>'+
									/*'<th width="10%">排序</th>'+*/
								'</tr>'+
							'</thead>'+
							'<tbody class="fieldSetting">'+
								'<tr ng-repeat="f in displayFields track by $index">'+
									'<td >{{$index+1}}</td>'+
									'<td >'+
										'<input type="text" ng-model="f.sn" class="ht-input inputText" style="width: 40px;"/>'+
									'</td>'+
									'<td >{{f.name}}</td>'+
									'<td >{{f.fieldDesc}} </td>'+
									'<td >'+
										'<input ng-model="f.sortAble" ng-if="f.isVirtual==0" type="checkbox" ng-true-value=1 ng-false-value=0 ng-checked="f.sortAble==1"/>'+
									'</td>'+
									'<td >'+
										'<select ng-model="f.sortSeq" ng-if="f.isVirtual==0" class="ht-input inputText" style="width:60px;">'+
											'<option value="asc">asc</option>'+
											'<option value="desc">desc</option>'+
										'</select>'+
									'</td>'+
									'<td >'+
										'<input ng-model="f.defaultSort" ng-if="f.isVirtual==0" ng-checked="f.defaultSort==1"  type="checkbox" ng-true-value=1 ng-false-value=0 ng-change="changeDefaultSort($index)"/>'+
									'</td>'+
									'<td >'+
										'<input ng-model="f.frozen" ng-checked="f.frozen==1" type="checkbox" ng-true-value=1 ng-false-value=0 />'+
									'</td>'+
									'<td >'+
										'<input ng-model="f.hidden"  ng-checked="f.hidden==1"  type="checkbox" ng-true-value=1 ng-false-value=0 />'+
									'</td>'+
									'<td >'+
										'<select ng-model="f.align" class="ht-input" style="width:60px;">'+
											'<option value="left">居左</option>'+
											'<option value="right">居右</option>'+
											'<option value="center">居中</option>'+
										'</select>'+
									'</td>'+
									'<td >'+
										'<select ng-model="f.summaryType" class="ht-input" style="width:60px;">'+
											'<option value="">请选择</option>'+
											'<option value="count">计数</option>'+
											'<option value="sum">求和</option>'+
											'<option value="max">最大</option>'+
											'<option value="min">最小</option>'+
										'</select>'+
									'</td>'+
									'<td >'+
										'<input type="text" ng-model="f.width" class="ht-input" style="width: 50px;"/>'+
									'</td>'+
									'<td >'+
										'<textarea rows="2" ng-model="f.summaryTemplate" style="padding: 0px 0 0 0px;resize: none" class="w100  border-none margin-none "></textarea>'+
									'</td>'+
									'<td ng-if="!service.noRights">'+
										'<div right="f.right[0]" choose-target></div>'+
									'</td>'+
									/*'<td>'+
										'<tool-buttons list="displayFields" index="{{$index}}" type="4"></tool-buttons>'+
									'</td>'+*/
								'</tr>'+
							'</tbody>'+
						'</table>'+
					'</div>',
					link:function(scope,element,attrs){
						scope.changeDefaultSort = function(idx){
							for ( var i = 0; i < scope.displayFields.length; i++) {
								if(i!=idx)
									scope.displayFields[i].defaultSort = 0;
							}
						}
					
						for(var i = 0 ;i<scope.displayFields.length ; i++){
							var df = scope.displayFields[i];
							if(scope.service.isCheckboxNull(df.sortAble))
								df.sortAble = 0;
							if(scope.service.isCheckboxNull(df.defaultSort))
								df.defaultSort = 0;
							if(!df.sortSeq)
								df.sortSeq = 'asc';
							if(!df.align)
								df.align = 'left';
							if(scope.service.isCheckboxNull(df.frozen))
								df.frozen = 0;
							if(scope.service.isCheckboxNull(df.hidden))
								df.hidden = 0;
						}
						scope.oldDisplayFields = $.extend(true,[],scope.displayFields);
						scope.resetDiaplayFields = function(){
							scope.displayFields = $.extend(true,[],scope.oldDisplayFields);
						}
						scope.resetAllDiaplayFields = function(){
							scope.displayFields = $.extend(true,[],scope.allDisplayFields);
						}
					}
						
	};
}


/**
 * manage-setting 功能按钮<manage-setting ></manage-setting>
 */

function manageSetting(dataRightsService) {
	return {
		restrict : 'E',
		replace : true,
		template :  '<div>'+
						'<table id="manageTbl" class="table-form list-table">'+
							'<thead>'+
								'<tr ng-if="!service.noRights">'+
									'<td colspan="6" style="text-align:left;">'+
										'<a class="btn btn-sm btn-primary fa-add" ng-click="service.addManage()">'+
											'<span>添加</span>'+
										'</a>'+
									'</td>'+
								'</tr>'+
								'<tr>'+
									'<th width="10%">类型</th>'+
									'<th width="15%">名称</th>'+
									'<th ng-if="!service.noRights">'+
										'权限'+
										'<right-select list="manageFields"></right-select>'+
									'</th>'+
									'<th width="10%">管理</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>'+
								'<tr var="manageTr" ng-repeat="f in manageFields">'+
									'<td >'+
									'<select ng-model="f.name" ng-change="service.onFunctionChange(f)" ng-options="m.k as m.v for m in managerButtons" class="ht-input" ht-validate="{required:true}" name="manageSelect" >'+
										'<option value="">请选择</option>'+
									'</select>'+
									'<td>'+
										'<input type="text" ng-model="f.desc" class="ht-input inputText"></td>'+
									'</td>'+
									'<td ng-if="!service.noRights">{{service.rightToDesc(f.right)}}'+
										'<a style="float: right;" ng-click="service.fieldDialog(f)" class="btn btn-sm btn-default btn-mini fa fa-edit"></a>'+
									'</td>'+
									'<td>'+
										'<tool-buttons list="manageFields" index="{{$index}}" type="4"></tool-buttons>'+
									'</td>'+
								'</tr>'+
							'</tbody>'+
						'</table>'+
					'</div>',
			link:function(scope,el,attrs){
				scope.service = dataRightsService;
			}
	};
}
/**
 * manage-setting-view 功能按钮<manage-setting-view ></manage-setting-view>
 */
function manageSettingView(dataRightsService) {
	return {
		restrict : 'E',
		replace : true,
		template :  '<div>'+
						'<a class="link reset" id="btnSearch" ng-click="resetFields()">重置按钮</a>'+
						'<table id="manageTbl"  class="table-grid">'+
							'<thead>'+
								'<tr>'+
									'<th width="15%">名称</th>'+
									'<th width="10%">类型</th>'+
									'<th width="10%">URL路径</th>'+
									'<th width="10%">管理</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>'+
								'<tr var="manageTr" ng-repeat="f in manageFields">'+
									'<td >'+
										'{{f.name}}'+
									'</td>'+
									'<td >'+
										'{{f.inRow==1?"行内":"页头"}}'+
									'</td>'+
									'<td >'+
										'{{f.urlPath}}'+
									'</td>'+
									'<td>'+
										'<tool-buttons list="manageFields" index="{{$index}}" type="4"></tool-buttons>'+
									'</td>'+
								'</tr>'+
							'</tbody>'+
						'</table>'+
					'</div>',
					link:function(scope,el,attrs){
						scope.service = dataRightsService;
						scope.oldManageFields = $.extend(true,[],scope.manageFields);
						scope.resetFields = function(){
							scope.manageFields = $.extend(true,[],scope.oldManageFields);
						}
							
					}
	};
}
/**
 * exportSetting 导出字段
 */
function exportSetting(dataRightsService) {
	
	return {
		restrict : 'E',
		replace : true,
		template :  '<div>'+
						'<table id="exportFieldTbl"  class="table-grid">'+
							'<thead>'+
								'<tr>'+
									'<th width="5%">序号</th>'+
									'<th width="15%">列名</th>'+
									'<th width="20%">注释</th>'+
									'<th width="20%" ng-if="!service.noRights">'+
										'导出权限'+
										'<right-select list="exportFileds"></right-select>'+
									'</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody ng-repeat="table in exportFileds" ng-if="table.fields">'+
								'<tr var="exportTableTr">'+
									'<td var="table" colspan="6">{{table.tableDesc}}({{table.tableName}})</td>'+
								'</tr>'+
								'<tr var="exportFieldTr" ng-repeat="f in table.fields">'+
									'<td var="index">var="index">{{$index+1}}}}</td>'+
									'<td var="name">{{f.name}}</td>'+
									'<td>'+
										'<input type="text" ng-model="f.desc" ></td>'+
									'<td ng-if="!service.noRights">'+
										'<div right="f.right[0]" choose-target></div>'+
									'</td>'+
								'</tr>'+
							'</tbody>'+
							'<tr var="exportFieldTr" ng-repeat="f in exportFileds" ng-if="!f.fields">'+
									'<td var="index">{{$index+1}}</td>'+
									'<td var="name">{{f.name}}</td>'+
									'<td>'+
										'<input type="text" ng-model="f.desc" ></td>'+
									'<td  ng-if="!service.noRights">'+
										'<div right="f.right[0]" choose-target></div>'+
									'</td>'+
							'</tr>'+
						'</table>'+
					'</div>',
		link:function(scope,el,attrs){
			scope.service = dataRightsService;
			console.info("scope.table.fields");
		}
	};
}
/**
 * condition-setting 查询条件字段 <condition-setting ></condition-setting>
 */
function conditionSetting(dataRightsService) {
	return {
		restrict : 'E',
		replace : true,
		scope:true,
		template :  '<div>'+
						'<div  class="condition-cols">'+
							'<div >'+
								'<div class="condition-cols-div">'+
									'<table id="condition-columnsTbl" cellpadding="0" cellspacing="0" border="0" class="table-form list-table">'+
										'<thead>'+
											'<tr class="leftHeader">'+
												'<th>选择</th>'+
												'<th>列名</th>'+
												'<th>注释</th>'+
												'<th>类型</th>'+
											'</tr>'+
										'</thead>'+
										'<tbody>'+
											'<tr ng-repeat="field in conditionSettingFields" ng-if="field.isVirtual!=1" ng-class="{odd:$index%2==0,even:$index%2!=0,\'tr-select\':field.checked}" ng-click="field.checked=!field.checked">'+
												'<td><input class="pk" type="checkbox" ng-model="field.checked"></td>'+	
												'<td>{{field.name}}</td>'+
												'<td>{{field.desc}}</td>'+
												'<td>{{field.type}}</td>'+
											'</tr>'+
										'</tbody>'+
									'</table>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="condition-conds" ng-if="type!=\'sysQueryView\'">'+
							'<div class="condition-conds-div condition-conds-build" id="condition-build-div">'+
								'<div class="condition-conds-div-left">'+
									'<div class="condition-conds-div-left-div" style="padding-top: 180px;">'+
										'<a  href="javascript:service.selectCondition();" class="button">'+
											'<i class="fa fa-arrow-circle-right"></i>'+
										'</a>'+
									'</div>'+
								'</div>'+
								'<div class="condition-conds-div-right">'+
									'<div class="condition-conds-div-right-div">'+
										'<table id="conditionTbl" cellpadding="0" cellspacing="0" border="0" class="table-form list-table">'+
											'<thead>'+
												'<tr class="leftHeader">'+
													'<th style="width:10%">列名</th>'+
													'<th style="width:15%">显示名</th>'+
													'<th style="width:15%">控件类型</th>'+
													'<th style="width:10%">条件</th>'+
													'<th style="width:15%">值来源</th>'+
													'<th style="width:25%">管理</th>'+
												'</tr>'+
											'</thead>'+
											'<tbody>'+
												'<tr ng-repeat="cd in conditionFields">'+
													'<td var="name">{{cd.na}}</td>'+
													'<td>'+
														'<input ng-model="cd.cm"  type="text" class="ht-input w100 h100 border-none margin-none "/>'+
													'</td>'+
													'<td>'+
														'<select ng-model="cd.ct" style="width:70px;" class="ht-input w100   margin-none " ng-options="c.k as c.v for c in ctlOptions">'+
															'<option value="">请选择</option>'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<select ng-model="cd.op" style="width:70px;" class="ht-input w100 margin-none" ng-options="c.k as c.v for c in options[cd.ty]||otherOption" ng-change="cd.qt=service.getQueryType(cd.ty,cd.op)">'+
															'<option value="">请选择</option>'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<select ng-model="cd.vf" style="width:70px;" class="ht-input w100   margin-none " >'+
															'<option value="" >请选择</option>'+
															'<option value="static" >表单输入</option>'+
//															'<option value="dynamic" >动态传入</option>'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<tool-buttons list="conditionFields" index="{{$index}}" ctrl="{{cd.ct}}" field="cd" type="4"></tool-buttons>'+
													'</td>'+
												'</tr>'+
											'</tbody>'+
										'</table>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
						'<div class="condition-conds"  ng-if="type==\'sysQueryView\'">'+
							'<div class="condition-conds-div condition-conds-build" id="condition-build-div">'+
								'<div class="condition-conds-div-left">'+
									'<div class="condition-conds-div-left-div" style="padding-top: 180px;">'+
										'<a  href="javascript:service.selectCondition(type);" class="button">'+
											'<span><i class="fa fa-arrow-circle-right"></i></span>'+
										'</a>'+
									'</div>'+
								'</div>'+
								'<div class="condition-conds-div-right">'+
									'<div class="condition-conds-div-right-div">'+
										'<table id="conditionTbl" cellpadding="0" cellspacing="0" border="0" class="table-detail fieldSetting">'+
											'<thead>'+
												'<tr class="leftHeader">'+
													'<th  width="2%">列名</th>'+
													'<th  width="2%">数据类型</th>'+
													'<th  width="2%">操作符</th>'+
													'<th  width="2%">值来源</th>'+
													'<th  width="5%">格式化</th>'+
													'<th  width="5%">管理</th>'+
												'</tr>'+
											'</thead>'+
											'<tbody>'+
												'<tr ng-repeat="cd in conditionFields">'+
													'<td >{{cd.name}}</td>'+
													'<td >{{cd.type}}</td>'+
													'<td>'+
														'<select ng-model="cd.operate" class="ht-input w100   margin-none " style="width:70px;" ng-options="c.k as c.v for c in service.getOperateOptions(cd.type)">'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<select ng-model="cd.valueFrom" class="ht-input w100  margin-none ">'+
															'<option value="1" >表单输入</option>'+
															'<option value="5" >动态传入</option>'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<select ng-model="cd.format"  class="ht-input w100  margin-none " ng-if="cd.type==\'date\'">'+
															'<option value="yyyy-MM-dd">yyyy-MM-dd</option>'+
															'<option value="yyyy-MM-dd HH:mm:ss">yyyy-MM-dd HH:mm:ss</option>'+
															'<option value="yyyy-MM-dd HH:mm:00">yyyy-MM-dd HH:mm:00</option>'+
															'<option value="HH:mm:ss">HH:mm:ss</option>'+
														'</select>'+
													'</td>'+
													'<td>'+
														'<tool-buttons list="conditionFields" index="{{$index}}" type="4"></tool-buttons>'+
														'<a class="btn btn-sm">aa</a>'+
														'<a class="btn btn-sm"><button type="button" class="btn" ng-class="{true:\'btn-warning\',false:\'inactive\'}[(field.ctrlSetting!=null&&field.ctrlSetting.length>0)||(field.formater!=null&&field.formater!=\'\')]" ng-click="service.fieldCtrlDialog(field)">控</button></a>'+
													'</td>'+
												'</tr>'+
											'</tbody>'+
										'</table>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>',
		link:function(scope,el,attrs){
			scope.service = dataRightsService;
			scope.options = {
							"varchar":[{k : "1",v : "="},{k : "2",v : "!="},{k : "3",v : "like"},{k : "4",v : "left_like"},{k : "5",v : "right_like"},{k : "6",v : "in"}],
							"number":[{k : "1",v : "="},{k : "2",v : ">"},{k : "3",v : "<"},{k : "4",v : ">="},{k : "5",v : "<="}],
							"int":[{k : "1",v : "="},{k : "2",v : ">"},{k : "3",v : "<"},{k : "4",v : ">="},{k : "5",v : "<="}],
							"date":[{k : "1",v : "="},{k : "2",v : ">"},{k : "3",v : "<"},{k : "4",v : ">="},{k : "5",v : "<="},{k : "6",v : "日期范围"}]
							};
			scope.otherOption = [{k : "1",v : "="},{k : "2",v : ">"},{k : "3",v : "<"},{k : "4",v : ">="},{k : "5",v : "<="}];
	     	//scope.service.initSelected(scope.conditionSettingFields,scope.conditionFields,"name");
		}
	};
}
/**
 * filter-setting 过滤条件<filter-setting ></filter-setting>
 */
function filterSetting(dataRightsService) {
	return {
		restrict : 'E',
		replace : true,
		template :  
			'<div>'+
				
				'<table id="filterTbl" class="table-form list-table">'+
					'<thead>'+
						'<tr ng-if="!service.noRights">'+
							'<td colspan="6" style="text-align:left;">'+
								'<a class="btn btn-sm btn-primary fa fa-add" href="javascript:service.addFilter();">'+
									'<span>添加</span>'+
								'</a>'+
							'</td>'+
						'</tr>'+
						'<tr>'+
							'<th  style="width:5%">序号</th>'+
							'<th  style="width:15%">名称</th>'+
							'<th  style="width:15%">Key</th>'+
							'<th  style="width:12%">类型</th>'+
							'<th ng-if="!service.noRights">'+
								'权限'+
								'<right-select list="filterFields"></right-select>'+
							'</th>'+
							'<th  style="width:25%">管理</th>'+
						'</tr>'+
					'</thead>'+
					'<tbody>'+
						'<tr var="filterTr" ng-repeat="f in filterFields">'+
							'<td var="index">{{$index+1}}</td>'+
							'<td>{{f.name}}</td>'+
							'<td>{{f.key}}</td>'+
							'<td>{{service.getFilterType(f.type)}}</td>'+
							'<td ng-if="!service.noRights">{{service.rightToDesc(f.right)}}'+
								'<a style="float: right;" ng-click="service.fieldDialog(f)" class="btn btn-sm btn-default btn-mini fa fa-edit"></a>'+
							'</td>'+
							'<td>'+
								'<tool-buttons list="filterFields" index="{{$index}}" type="3"></tool-buttons>'+
							'</td>'+
						'</tr>'+
					'</tbody>'+
				'</table>'+
			'</div>',
			link:function(scope,el,attrs){
				scope.service = dataRightsService;
			}
	};
}
/**
 * sort-setting 排序字段
 */
function sortSetting() {
	return {
		restrict : 'E',
		replace : true,
		scope:true,
		template :  '<div>'+
						'<div class="sort-cols">'+
							'<div class="sort-cols-div">'+
								'<table id="condition-columnsTbl" cellpadding="0" cellspacing="0" border="0" class="table-form">'+
									'<thead>'+
										'<tr class="leftHeader">'+
											'<th>选择</th>'+
											'<th>列名</th>'+
											'<th>注释</th>'+
										'</tr>'+
									'</thead>'+
									'<tbody>'+
										'<tr ng-repeat="field in sortSettingFields" ng-if="field.isVirtual!=1" ng-class="{odd:$index%2==0,even:$index%2!=0,\'tr-select\':field.checked}" ng-click="field.checked=!field.checked">'+
												'<td><input class="pk" type="checkbox" ng-model="field.checked"></td>'+
												'<td>{{field.name}}</td>'+
												'<td>{{field.desc}}</td>'+
											'</tr>'+
										'</tbody>'+
									'</table>'+
								'</div>'+
							'</div>'+
							'<div class="sort-conds">'+
							'<div class="condition-conds-div condition-conds-build" id="condition-build-div">'+
								'<div class="sort-conds-div-left">'+
									'<div class="sort-conds-div-left-div" style="padding-top: 180px;">'+
									'<a style="margin-top: 180px;" href="javascript:service.selectSort();" class="button">'+
											'<span><i class="fa fa-arrow-circle-right"></i></span>'+
										'</a>'+
									'</div>'+
								'</div>'+
									'<div class="sort-conds-div-right">'+
										'<div class="sort-conds-div-right-div">'+
											'<table id="sortTbl" cellpadding="0" cellspacing="0" border="0" class="table-form list-table">'+
												'<thead>'+
													'<tr class="leftHeader">'+
														'<th width="10%">列名</th>'+
														'<th width="15%">注释</th>'+
														'<th width="10%">排序</th>'+
														'<th width="20%">管理</th>'+
													'</tr>'+
												'</thead>'+
												'<tbody>'+
													'<tr var="sortTr" ng-repeat="sd in sortFields">'+
														'<td >{{sd.name}}</td>'+
														'<td >{{sd.desc}}</td>'+
														'<td>'+
															'<select ng-model="sd.sort">'+
																'<option value="ASC">升序</option>'+
																'<option value="DESC">降序</option>'+
															'</select>'+
														'</td>'+
														'<td>'+
															'<tool-buttons list="sortFields" index="{{$index}}" type="4"></tool-buttons>'+
														'</td>'+
													'</tr>'+
												'</tbody>'+
											'</table>'+
										'</div>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>',
					link:function(scope,element,attrs){
						scope['listkey'] = attrs['listkey'];
						scope['namekey'] = attrs['namekey'];
						scope['desckey'] = attrs['desckey'];
					//	scope.service.initSelected(scope.sortSettingFields,scope.sortFields,"name");
					}
	};
}
//业务数据模板相关指令 结束



 
/**
 *
 * Pass all functions into module
 */
angular
    .module('eip')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('iboxColumnTools', iboxColumnTools)
    .directive('minimalizaSidebar', minimalizaSidebar)
    .directive('vectorMap', vectorMap)
    .directive('sparkline', sparkline)
    .directive('icheck', icheck)
    .directive('ionRangeSlider', ionRangeSlider)
    .directive('dropZone', dropZone)
    .directive('responsiveVideo', responsiveVideo)
    .directive('chatSlimScroll', chatSlimScroll)
    .directive('customValid', customValid)
    .directive('fullScroll', fullScroll)
    .directive('closeOffCanvas', closeOffCanvas)
    .directive('clockPicker', clockPicker)
    .directive('landingScrollspy', landingScrollspy)
    .directive('fitHeight', fitHeight)
    .directive('iboxToolsFullScreen', iboxToolsFullScreen)
    .directive('slimScroll', slimScroll)
    .directive('truncate', truncate)
    .directive('touchSpin', touchSpin)
    .directive('markdownEditor', markdownEditor)
    .directive('passwordMeter', passwordMeter)
	.directive('iboxSearchs', iboxSearchs)
	.directive('htTable', htTable)
	.directive('listCollapse', listCollapse)
	.directive('miniTreeSidebar', miniTreeSidebar)
	.directive('htDataTable', htDataTable)
	.directive('htField', htField)
	.directive('htPagination', htPagination)
	.directive('htQuery', htQuery)
	.directive('htSearch', htSearch)
	.directive('htReset', htReset)
	.directive('htSort', htSort)
	.directive('htSelect', htSelect)
	.directive('htRemoveArray', htRemoveArray)
	.directive('htQuickSearch', htQuickSearch)
	.directive('htTreeSelect', htTreeSelect)
	.directive('tableTools', tableTools)
	.directive('htAction', htAction)
	.directive('htDatecalc', htDatecalc)
    .directive('htDatecalcs', htDatecalcs)
	.directive('htLoad', htLoad)
	.directive('htCheckbox', htCheckbox)
	.directive('htBoolean', htBoolean)
	.directive('htEditor', htEditor)
	.directive('htTimes', htTimes)
	.directive('htSelectAjax', htSelectAjax)
	.directive('htChecked', htChecked)
	.directive('htBpmImage', htBpmImage)
	.directive('templateAlias', templateAlias)
	.directive('htBindHtml', htBindHtml)
	.directive('htFrameForm', htFrameForm)
	.directive('layoutDesignPanel', layoutDesignPanel)
	.directive('htSysType', htSysType)
	.directive('htFormSelect', htFormSelect)
	.directive('htDate', htDate)
	.directive('htRadios', htRadios)
	.directive('htPinyin', htPinyin)
	.directive('htCheckboxs', htCheckboxs)
	.directive('htSelector', htSelector)
	.directive('htGangedSelectQuery', htGangedSelectQuery)
	.directive('htCascadeSelectQuery', htCascadeSelectQuery)
	.directive('htCustdialog', htCustdialog)
	.directive('htSubCustdialog', htSubCustdialog)
	.directive('htBpmOpinion', htBpmOpinion)
	.directive('htLink', htLink)
	.directive('htUpload', htUpload)
	.directive('htDic', htDic)
	.directive('htValidate', htValidate)
	.directive('htNumber', htNumber)
	.directive('htFuncexp', htFuncexp)
	.directive('htSelects', htSelects)
	.directive('ngRightClick', ngRightClick)
	.directive('htBpmAgree', htBpmAgree)
	.directive('htBpmSaveDraft', htBpmSaveDraft)
	.directive('htBpmInstanceTrans', htBpmInstanceTrans)
	.directive('htBpmOppose', htBpmOppose)
	.directive('htBpmAbandon', htBpmAbandon)
	.directive('htBpmCommu', htBpmCommu)
	.directive('htBpmStartCommu', htBpmStartCommu)
	.directive('htBpmReject', htBpmReject)
	.directive('htBpmFlowImage', htBpmFlowImage)
	.directive('htBpmApprovalHistory', htBpmApprovalHistory)
	.directive('htBpmStartTrans', htBpmStartTrans)
	.directive('htBpmAgreeTrans', htBpmAgreeTrans)
	.directive('htBpmOpposeTrans', htBpmOpposeTrans)
	.directive('htBpmPrint', htBpmPrint)
	.directive('htBpmEndProcess', htBpmEndProcess)
	.directive('htBpmDelegate', htBpmDelegate)
	.directive('htBpmAddSign', htBpmAddSign)
	.directive('htBpmSuspendProcess', htBpmSuspendProcess)
	.directive('htBpmRecoverProcess', htBpmRecoverProcess)
	.directive('htBpmLockUnlock', htBpmLockUnlock)
	.directive('htBpmTaskDelay', htBpmTaskDelay)
	.directive('htBpmButtons', htBpmButtons)
	.directive('htBpmManager', htBpmManager)
	.directive('htBpmBackTostart', htBpmBackTostart)
	.directive('bpmForm', bpmForm)
	.directive('dynamicDirective', dynamicDirective)
	.directive('bpmMsgtypeSelect', bpmMsgtypeSelect)
	.directive('htBpmStartFlow', htBpmStartFlow)
	.directive('bpmNodeRules', bpmNodeRules)
	.directive('bpmEventScript', bpmEventScript)
	.directive('bpmExclusiveGateway', bpmExclusiveGateway)
	.directive('bpmAutoService', bpmAutoService)
	.directive('bpmSignConfig', bpmSignConfig)
	.directive('bpmTaskReminder', bpmTaskReminder)
	.directive('bpmCallActivity', bpmCallActivity)
	.directive('fieldTemplate', fieldTemplate)
    .directive('svgData', svgData)
    .directive('subTemplate', subTemplate)
    .directive('htDiccheckbox',htDiccheckbox)
    .directive('htAuthSetEvent',htAuthSetEvent)
    .directive('htMethodAuth',htMethodAuth)
    .directive('htCustomScript',htCustomScript)
    .directive('htIdentity',htIdentity)
    .directive('htInput',htInput)
    .directive('htTextarea',htTextarea)
    .directive('rightSelect',rightSelect)
    .directive('toolButtons',toolButtons)
    .directive('displaySetting',displaySetting)
    .directive('fieldSetting',fieldSetting)
    .directive('manageSetting',manageSetting)
    .directive('manageSettingView',manageSettingView)
    .directive('exportSetting',exportSetting)
    .directive('conditionSetting',conditionSetting)
    .directive('filterSetting',filterSetting)
    .directive('sortSetting',sortSetting);

