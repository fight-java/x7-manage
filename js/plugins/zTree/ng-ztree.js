;(function (angular) {
    'use strict';
    function zTreeDirective($timeout) {
        return {
            restrict: 'A',
            scope: {
            	beforeRightClick: '&',
            	menuClick: '&'
            },
            require: '?ngModel',
            link: function link(scope, elm, attrs, ngModelCtrl) {
            	var scopeOnCtrl = elm.closest("[ng-controller]").scope() || scope;
                scope.config = null;
                scope.treeId = elm.attr("id");
                scope.menuId = 'cMenu_' + scope.$id; 
                scope.dropdownMenu = angular.noop();
                scope.currentNode = angular.noop();
                scope.previous = angular.noop();
                
                elm.addClass("ztree");
                
                if(!scope.treeId){
                	scope.treeId = "ztree_" + scope.$id;
                	elm.attr("id", scope.treeId);
                }
                
                attrs.$observe('treeContextMenu', function(n, o){
                	if(n !== o){
                		// 构建一个右键菜单元素
                		scope.dropdownMenu = angular.element('<ul class="dropdown-menu" style="display:none;"></ul>');
                		scope.dropdownMenu.attr("id", scope.menuId);
                		angular.element('#' + scope.menuId).remove();
                		// 将右键菜单追加到body中
                		angular.element('body').append(scope.dropdownMenu);
       	            	
       	            	var ary = n ? scope.$parent.$eval(n) : [];
                		initialMenuItems(ary);
                	}
                });
                
                attrs.$observe("htTree", function(n, o){
                	if(n !== o){
                		var zTreeSettings = attrs.htTree ? scope.$parent.$eval(attrs.htTree) : {};
                		scope.config = {};
                        angular.copy(zTreeSettings, scope.config);
                        scope.config["callback"] = manageEvents(scope, elm, attrs);
                        scope.init(scope.previous);
                	}
                });
                
                // 有数据时再初始化树
                ngModelCtrl.$formatters.push(function(d){
                	if(d && d.length > 0){
            			scope.refresh(d, scope.previous);
                	}
                	scope.previous = d;
                });
                
                // 事件的统一处理器
                function treeEventHandler(s, cb) {
                    return function () {
                        var args = arguments;
                        var fn = s.$parent.$eval(cb);
                        if(!fn || !angular.isFunction(fn)){
                        	return;
                        }
                        if (!s.$root.$$phase) {
                            s.$parent.$apply(function () {
                                fn.apply(s.$parent, args);
                            });
                        } else {
                            fn.apply(s.$parent, args);
                        }
                    };
                }
                
                // 解析事件配置
                function manageEvents(s, e, a) {
                	var events = {};
                    if (a.treeEvents) {
                        var evMap = a.treeEvents.split(';');
                        for (var i = 0; i < evMap.length; i++) {
                            if (evMap[i].length > 0) {
                                var name = evMap[i].split(':')[0];
                                var cb = evMap[i].split(':')[1];
                                events[name] = treeEventHandler(s, cb);
                            }
                        }
                    }
                    // 配置了右键菜单时，添加默认的右键事件监听
                    if(scope.dropdownMenu){
                    	events['onRightClick'] = function(event, treeId, treeNode){
                			if (treeNode && !treeNode.noR) {
                				scopeOnCtrl[attrs.tree].selectNode(treeNode);
                				scope.currentNode = treeNode;
                				showRMenu("node", event.clientX, event.clientY);
                			}
                		};
                        events['beforeRightClick'] = function(treeId, treeNode){
                        	var result = true;
                        	if(scope.beforeRightClick && angular.isFunction(scope.beforeRightClick)){
                        		var r = scope.beforeRightClick({treeNode:treeNode});
                        		r===false && (result = false);
                        		var ary = scope.$parent.$eval(attrs.treeContextMenu);
                        		initialMenuItems(ary);
                        	}
                    		return result;
                    	};
                    }
                    return events;
                }
                
                // 加载右键菜单的选项
                function initialMenuItems(ary){
            		scope.dropdownMenu.empty();
            		angular.forEach(ary, function(item){
            			var li = angular.element('<li></li>');
            			if(item=='-'){
            				li.addClass('divider');
            			}
            			else{
            				var a = angular.element('<a href="javascript:;">'+item+'</a>');
            				// 绑定右键菜单的点击事件
            				if(scope.menuClick && angular.isFunction(scope.menuClick)){
            					a.bind('click', function(){
            						var me = angular.element(this);
            						var r = scope.menuClick({menu: me.text(), treeNode: scope.currentNode});
            						r!==false && hideRMenu();
            					});
            				}
            				li.attr('role','menuitem');
            				li.append(a);
            			}
            			scope.dropdownMenu.append(li);
            		});
            	}
            	
                // 显示右键菜单
            	function showRMenu(type, x, y) {
            		scope.dropdownMenu.show();
            		scope.dropdownMenu.css({"top":y+"px", "left":x+"px", "visibility":"visible"});
            		angular.element("body").bind("mousedown", onBodyMouseDown);
            	}
            	
            	// 隐藏右键菜单
            	function hideRMenu() {
            		scope.currentNode && (scope.currentNode = angular.noop());
            		scope.dropdownMenu && (scope.dropdownMenu.css({"visibility": "hidden"}));
            		$("body").unbind("mousedown", onBodyMouseDown);
            	}
            	
            	// 点击除右键菜单以外的地方时关闭菜单
            	function onBodyMouseDown(event){
            		if (!(event.target.id == scope.menuId || $(event.target).parents("#"+scope.menuId).length>0)) {
            			hideRMenu();
            		}
            	}
                // 销毁树
                scope.destroy = function(){
                	var treeObj = scopeOnCtrl[attrs.tree];
                	if(treeObj && treeObj.destroy && angular.isFunction(treeObj.destroy)){
                		treeObj.destroy();
                	}
                }
                
                // 树组件的初始化
                scope.init = function(data){
                	scopeOnCtrl[attrs.tree] = $.fn.zTree.init($("#" + scope.treeId), scope.config, data);
                };
                
                // 刷新树(将树数据的增删改查同步到树节点上)
                scope.refresh = function(n, o){
                	if(!o || o.length == 0){
                		scope.destroy();
                		scope.init(n);
                		return;
                	}
                	// 分析新增数据
                	var inc = [], tag = true;
                	for(var i=0,c;c=n[i++];){
                		tag = true;
                	    for(var j=0,m;m=o[j++];){
                	        if(c===m){
                	        	tag = false;
                	            break;
                	        }
                	    }
                	    if(tag){
                	    	inc.push(c);	
                	    }
                	}
                	if(inc.length == 0) return;
                	var pIdKey = (scope.config && scope.config.data && scope.config.data.simpleData && scope.config.data.simpleData.pIdKey) ?  scope.config.data.simpleData.pIdKey:'pId',
                		idKey =	(scope.config && scope.config.data && scope.config.data.simpleData && scope.config.data.simpleData.idKey) ?  scope.config.data.simpleData.idKey:'id';
                	// 将增加的数据按照pId归类
                	var objs = {} , cur = null;
                	for(var i=0,c;c=inc[i++];){
                		cur = objs[c[pIdKey]];
                		if(!cur){
                			cur = [];
                			objs[c[pIdKey]] = cur;
                		}
                		cur.push(c);
                		cur = null;
                	}
                	
                	for(var k in objs){
                		// 找到对应的父节点
                		var pNode = scopeOnCtrl[attrs.tree].getNodeByParam(idKey, k);
                		// 添加上去
                		scopeOnCtrl[attrs.tree].addNodes(pNode, 0, objs[k]);
                	}
                	
                	scopeOnCtrl[attrs.tree].refresh();
                }
                
                // 当树组件销毁时，清理右键菜单
                scope.$on('$destroy', function(){
                	scope.dropdownMenu && (scope.dropdownMenu.remove());
            	});
            }
        };
    }

    var mi = angular.module('ngZtree', []);
    mi.directive('htTree', ['$timeout', zTreeDirective]);
})(angular);