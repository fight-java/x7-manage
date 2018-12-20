;(function() {
	'use strict';

	var eipModule = angular.module("eip");
	
	function AuthService($http, $sessionStorage, context, baseService, $rootScope, $state) {
        var service = {},
        	ctx = context();

        service.Login = Login;
        service.Logout = Logout;
        service.ssoRedirect = ssoRedirect;
        service.ssoLogin = ssoLogin;
        service.loadDefaultPage = loadDefaultPage;
        service.genCurrentUserMenu = genCurrentUserMenu;
        service.genCurrentOnLine = genCurrentOnLine;
        
        return service;

        function Login(username, password, callback) {
        	$http.post(ctx['uc'] + '/auth', { username: username, password: password })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $sessionStorage.currentUser = response;
                        if($sessionStorage.currentUser){
                        	$rootScope.currentUserName = response.username;
                        }
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        window.sessionStorage.setItem("token",response.token);
                        // execute callback with true to indicate successful login
                        callback({result: true});
                    } else {
                        // execute callback with false to indicate failed login
                        callback({result: false, message: "登录失败"});
                    }
                })
                .error(function(rep){
                	if(rep && rep.code==499){
                		$sessionStorage.welcome = rep.message;
                		$state.go('welcome');
                	}
                	callback({result: false, message: rep.message});
                });
        }
        
        // 重定向到单点登录界面
        function ssoRedirect(){
        	ssoInfo().then(function(data){
        		if(data && data.enable){
        			// 跳转到单点登录界面
                	window.location.href = data.ssoUrl + ctx['web'];
        		}
        		else{
        			$state.go('login');
        		}
        	}, function(){
        		$state.go('login');
        	});
        }
        // 获取单点登录信息
        function ssoInfo(){
        	return baseService.get("${uc}/sso/info");
        }
        // 完成单点登录，并从后端获取jwt
        function ssoLogin(params, callback){
        	var url = ctx['uc'] + "/sso/auth?service=" + ctx['web'];
        	if(params.ticket){
    			url += "&ticket=" + params.ticket;
    		}
    		if(params.code){
    			url += "&code=" + params.code;
    		}
        	$http.get(url)
                .success(function (response) {
                    if (response.token) {
                        $sessionStorage.currentUser = response;
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        callback({result: true});
                    } else {
                        callback({result: false, message: "登录失败"});
                    }
                })
                .error(function(rep){
                	callback({result: false, message: "认证失败"});
                });
        }
        // 退出系统
        function Logout() {
        	$http.defaults.headers.common.Authorization = '';
        	$sessionStorage.$reset();
        	ssoInfo().then(function(data){
        		if(data && data.enable){
        			// 单点退出
        			window.location.href = data.ssoLogoutUrl + ctx['web'];
        		}
        		else{
        			$state.go('login');
        		}
        	}, function(){
        		$state.go('login');
        	});
        }
        // 加载默认页面
        function loadDefaultPage(){
    		// 跳转到默认页面
    		$state.go("home");
    		genCurrentUserMenu();
    		genCurrentOnLine();
        }
        // 获取当前用户的菜单资源
        function genCurrentUserMenu(){
        	getCurrentUserMethodAuth();
        	if($sessionStorage.manageMenus){
            	$rootScope.manageMenus = $sessionStorage.manageMenus;
            	evalState($rootScope.manageMenus,$state)
            	$rootScope.$broadcast("manageMenus:ready", $rootScope.manageMenus);
            	return;
        	}
            if(!$sessionStorage.currentUser) return;
        	baseService.get("${portal}/sys/sysMenu/v1/getCurrentUserMenu?menuType=0").then(function(data){
        		$rootScope.manageMenus = data.value;
        		$sessionStorage.manageMenus = data.value;
        		evalState(data.value,$state);
        		$rootScope.$broadcast("manageMenus:ready", $rootScope.manageMenus);
        	});
        }
        // 获取当前用户拥有的功能资源
        function getCurrentUserMethodAuth(){
        	if($sessionStorage.methodAuth){
            	return;
        	}
        	if(!$sessionStorage.currentUser) return;
        	baseService.get("${portal}/sys/sysMenu/v1/getCurrentUserMethodAuth").then(function(data){
        		$rootScope.methodAuth = data;
        		$sessionStorage.methodAuth = data;
        	});
        }
        // 获取当前在线用户数
        function genCurrentOnLine(){
        	baseService.get("${portal}/portal/main/v1/getOnLineCount").then(function(data){
        		$rootScope.onLineCount = data;
        	});
        }
    }
	
	/**
	 * bpm factory
	 * @returns
	 */
	function bpmFactory($rootScope, baseService, dialogService){ 
		var defId = null,
			taskId = null,
			proInstId = null,
		    params = null,
		    hideOpinion = null,
		    isFirstNodeUserAssign = false,
		    isSkipFirstNode = false;
		
		return {
			init : function(optionStr){
				var option = parseToJson(optionStr);
				defId = option.defId;
				taskId = option.taskId;
				proInstId = option.proInstId;
				params = option.params || "";
				if(taskId){
					var index = layer.load(0, {shade: false});
					var url="${bpmRunTime}/runtime/task/v1/taskDetail?taskId=" + taskId+"&reqParams=";
					var defer=baseService.get(url);
					defer.then(function(data,status){
						   layer.closeAll();
							if(!data) return;
							
							if(data.result=="formEmpty"){
								dialogService.fail("还没有设置表单,请先设置表单!");
								return;
							}
							data.result&&($rootScope.$broadcast('html:update',data));
							!data.result&&(dialogService.fail(data.message));
						}
						,function(status){
							layer.closeAll();
							dialogService.fail("加载失败");
						}
					);
				}
				else if(defId){
					baseService.post("${bpmRunTime}/runtime/instance/v1/getFormAndBO",{defId:defId}).then(function(data) {
						layer.closeAll();
						if(data.resultMsg=="formEmpty"){
							dialogService.fail("还没有设置表单,请先设置表单!");
							return;
						}
						baseService.get("${bpmRunTime}/runtime/instance/v1/instanceToStart?defId="+defId).then(function(res) {
							if(res){
								data.propDef=res;
								 isFirstNodeUserAssign = res.firstNodeUserAssign;
								 isSkipFirstNode=res.skipFirstNode;
								$rootScope.$broadcast('html:update', data);
							}
						})
						
					});
				}
			},
			isFirstNodeUserAssign: function(){
				return isFirstNodeUserAssign;
			},
			isHideOpinion:function(){
				if(hideOpinion== null){
					hideOpinion = $("[ng-model='htBpmOpinion']:not(:hidden)").length>0 ;
				}
				return hideOpinion;
			},	
			isCreateInstance : function(){
				return $.isEmpty(taskId);
			},
			isDraft:function(){
				return !$.isEmpty(proInstId);
			},
			getDefId:function(){
				return defId;
			},
			getTaskId:function(){
				return taskId;
			},
			getProInstId:function(){
				return proInstId;
			},
			getOpinionFLag:function(){
				return "__form_opinion";
			},
			getParams:function() {
				return params;
			},
			excBeforScript:function(scope,el_){
				//执行前置js
				var btn__ =scope.buttons[$(el_).attr("alias")];
				
				var beforeScript = btn__.beforeScript||"return true";
				var script = "var tempFunction = function(scope){ "+beforeScript+"};"
				var result =  eval(script+"tempFunction(scope);");
				
				window.curent_btn_after_script_ = btn__.afterScript||"";
				if(result.hasOwnProperty("done")){
					return result;
				}
				
				if(result===false) return false;
				return true;
			},
			handlerSuccess :function(data){
				layer.closeAll();
				//执行后置js
				var script = "var tempFunction = function(data){ "+window.curent_btn_after_script_+"};"
				var afterScriptPassed =  eval(script+"tempFunction(data);");
				
				if(data.state){
			        dialogService.success(data.message).then(function(){
			        	$rootScope.$broadcast('flowStartSuccess');
			        });
			    }else {
			    	dialogService.fail(data.message,data.cause); 
			    }
			},
			handFail:function(code){
				layer.closeAll();
				dialogService.fail("错误消息:"+code.message);
			}
		};
	}

	eipModule.config(["$httpProvider", function($httpProvider) {
		$httpProvider.interceptors.push("httpInterceptor");
	}]).constant('context', function(){
		var ctx = getContext();
		
        return angular.extend(ctx, {
			defaultMessageType: "mail,inner"
        });
    })
    .provider('context', ['context', function(context){
    	this.context = context();
    	
    	this.$get = function(){
    		return this.context;
    	}
    }])
    .factory("AuthenticationService", AuthService)
    .factory("bpm", bpmFactory)
    .factory("$jsonToFormData",function() {
		function transformRequest( data, getHeaders ){
			var headers = getHeaders();
			headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
			if(typeof( data )=="string"){
				return data;
			}
			return $.param(data);
		}
		return( transformRequest );
	})
    .factory("httpInterceptor", ["$q", "$rootScope", "$injector", "$timeout", "$window","toaster", function($q, $rootScope, $injector, $timeout, $window,toaster) {
		return {
			request: function(config) {
				return config || $q.when(config);
			},
			requestError: function(rejection) {
				return $q.reject(rejection);
			},
			response: function(response) {
				if(typeof response.data=='string' && response.data.indexOf('form-login')>-1){
					//redirect to login page
					$window.location.href = "/";
		            return $q.reject(response);
				}
				return response || $q.when(response);
			},
			responseError: function(rejection) {
				if(rejection && rejection.status==401){
					$injector.get('$state').go('login');
				}
				switch(rejection.status){
					case 404:
						$injector.get('$state').go('404');
						$rootScope.$broadcast("error:404");
						break;
					case 500:
						toaster.pop({
				            type: 'error',
				            title: '错误提示',
				            body: rejection.data.message,
				            showCloseButton: true,
				            timeout: 3000
				        });
						$rootScope.$broadcast("error:500");
						break;
				}
				return $q.reject(rejection);
			}
		};
	}])
	.value('dataTableOptions', {
		name: '',
        url: '',
        pageOption: {
        	show: false,
        	pageSize: 20,
        	currentPage: 1,
        	showTotal: true,
        	displayedPages: 5
        },
        inquiring: false,
        queryOption: {
        	operation: "like",
            relation: "and"
        },
        queryOperationOptions: ["equal", "equal_ignore_case", "less", "great", 
        						"less_equal", "great_equal", "not_equal", "like", 
        						"left_like", "right_like", "is_null", "notnull",
        						"in", "between"],
        queryRelationOptions: ["and", "or", "exclusion"],
        onComplete:null
    })
	.factory('DataTable', ['$rootScope', 'baseService', '$q', 'dataTableOptions', function($rootScope, baseService, $q, dataTableOptions){
		/**
		 * create an instance of DataTable
		 * @param {Object} [options] 
		 */
		function DataTable(options) {
            var settings = angular.copy(dataTableOptions);
            angular.extend(this, settings, {
            	_pagination:{},
            	_sort:[],
            	_querys:[],
            	params:{},
            	rows:[]
            }, options);
        }
		
		/**
		 * creates an instance of Pagination
		 * @param {DataTable} dataTable
		 * @param {Object} options
		 */
		function Pagination(dataTable, options){
			angular.extend(this, dataTable.pageOption, options);
		}
		
		/**
		 * creates an instance of Query
		 */
		function Query(dataTable, options){
			angular.extend(this, dataTable.queryOption, options);
			// assert the operation is a valid value.
			if(dataTableOptions.queryOperationOptions.indexOf(this.operation) == -1){
				throw new Error("The operation '"+this.operation+"' is not a valid value, the allowable values:" + dataTableOptions.queryOperationOptions);
			}
			// assert the relation is a valid value.
			if(dataTableOptions.queryRelationOptions.indexOf(this.relation) == -1){
				throw new Error("The relation '"+this.relation+"' is not a valid value, the allowable values:" + dataTableOptions.queryRelationOptions);
			}
		}
		
		/**
		 * initialize a instance of Pagination
		 * @param {Object} options
		 * @returns
		 */
		DataTable.prototype.initPagination = function(options){
			options.show = true;
			this._pagination = new Pagination(this, options);
			return this._pagination;
		}
		
		/**
		 * build Page Result with response
		 */
		DataTable.prototype.buildPageResult = function(response){
			if(!response){
				this._pagination.pageResult = {
						show:false
					};
			}else{
				var page = response.page?response.page:this.dialog?eval("($rootScope.queryResponse." + this.dialog.pageKey +")"):'',
					pageSize = response.pageSize?response.pageSize:this.dialog?eval("($rootScope.queryResponse." + this.dialog.pageSizeKey +")"):'',
					total = response.total?response.total:this.dialog?eval("($rootScope.queryResponse." + this.dialog.totalKey +")"):'';
				// total为负数时表示做分页查询，但是不统计记录总数
				if(total < 0){
					if(pageSize == 0){
						this._pagination.pageResult = {show:false};
						return;
					}
					page = page > 0 ? page : this._pagination.currentPage;
					pageSize = pageSize > 0 ? pageSize : this._pagination.pageSize;
				}
				if(typeof pageSize!='number' || pageSize <= 0){
					throw new Error("The pageSize in response must be a number and can not less than or equal zero.");
				}
				if(typeof page!='number' || page <= 0){
					throw new Error("The page in response must be a number and can not less than or equal zero.");
				}
				
				// 显示总记录数时构建完整的分页信息
				if(total > 0){
					var totalPages = (total/pageSize).toCeil(),
						startRow = (page - 1) * pageSize + 1;
					this._pagination.pageResult = {
							show: true,
							totalCount: total,
							page: page,
							pageSize: pageSize,
							totalPages: totalPages,
							startRow: startRow,
							endRow: startRow -1 + (page==totalPages && response.total != pageSize?total%pageSize : pageSize)
					};
				}
				// 不显示总记录数时只能提供当前显示第*条到第*条数据，以及提供上一页、下一页按钮
				else{
					var count = response.rows.length,
						startRow = (count > 0) ? ((page - 1) * pageSize + 1) : 0,
						endRow = startRow + ((count > 0) ? (count-1) : 0);
					this._pagination.pageResult = {
							show: true,
							noTotal: true,
							page: page,
							pageSize: pageSize,
							startRow: startRow,
							endRow: endRow
					};
				}
			}
		}
		
		/**
		 * creates an instance of Sort
		 * @param {DataTable} dataTable
		 * @param {Object} params
		 */
		function Sort(params){
			angular.extend(this, {sorting:false}, params);
		}
		
		/**
		 * add a Sort Object in DataObject
		 * @param {Object} params
		 */
		DataTable.prototype.addSort = function(params){
			this._sort.push(new Sort(params));
		}
		
		/**
		 * sorting
		 * @param {Object} params
		 */
		DataTable.prototype.sorting = function(params){
			angular.forEach(this._sort, function(item){
				if(item.field==params.field){
					if(params.direction){
						item.sorting = true;
						item.direction = params.direction;
					}
					else{
						item.sorting = false;
						delete item.direction; 
					}
				}
			});
			this.queryIndex();
		}
		
		/**
		 * build query entity for dataTable
		 * @returns {Object} queryEntity
		 */
		DataTable.prototype.build = function(){
			var reqType = this.requestType?this.requestType:'POST';
			var queryEntity = {};
			var templatePa = this.dialog?this.dialog.dataParam:'';
			if(reqType=='POST' && !templatePa){
				if(this._pagination && this._pagination.show){
					queryEntity.pageBean = {
							page: this._pagination.currentPage,
							pageSize: this._pagination.pageSize,
							showTotal: this._pagination.showTotal
					};
				}
				if(this._sort && this._sort.length > 0){
					var tempSortList = [];
					angular.forEach(this._sort, function(item){
						if(item.sorting){
							tempSortList.push({
								property: item.field,
								direction: item.direction
							});
						}
					});
					if(tempSortList.length > 0){
						queryEntity.sorter = tempSortList;
					}
				}
			}
			if(this.params){
				angular.extend(queryEntity, this.params);
			}
			if(reqType=='POST' && !templatePa){
				if(this._querys && this._querys.length > 0){
					queryEntity.querys = [];
					angular.forEach(this._querys, function(q){
						queryEntity.querys.push({
							property: q.property,
							value: q.value,
							operation: q.operation.toUpperCase(),
							relation: q.relation.toUpperCase()
						});
					});
				}
			}else{
				if(this._querys&&this._querys.length>0){
					queryEntity = this._querys[0];
				}
				if(this.dialog&&this.dialog.needPage){
					queryEntity['page'] = this.pageOption?this._pagination.currentPage:1;
					queryEntity['pageSize'] = this.dialog?this.dialog.pageSize:this._pagination.pageSize;
				}
			}
			
			if(reqType=='POST' && templatePa && this.dialog.conditionfield){
				var conditions = parseToJson(this.dialog.conditionfield);
				if(this._querys && this._querys.length > 0){
					angular.forEach(this._querys, function(q){
						for (var i = 0; i < conditions.length; i++) {
							if(conditions[i].field==q.property){
								conditions[i].defaultValue = q.value;
							}
						}
					});
					for (var i = 0; i < conditions.length; i++) {
						templatePa = templatePa.replace(new RegExp("\\{"+conditions[i].field+"\\}","g"), conditions[i].defaultValue);
					}
					queryEntity = parseToJson(templatePa);
				}
			}
			return queryEntity;
		}
		
		/**
		 * query
		 */
		DataTable.prototype.query = function(){
			if(this.inquiring){
				$rootScope.$broadcast("dataTable:query:error", this, "The Data Table is inquiring now, please wait a moment.");
				return;
			}
			var that = this,
				deferred = $q.defer();
			// the default url of list
			if(!this.url){
				throw new Error("The property url of DataTable can not be empty.");
			}
			that.rows = [];
			that.inquiring = true;
			$rootScope.$broadcast("dataTable:query:begin", that);
			var dialog = this.dialog;
			var isGet = this.requestType&&this.requestType=='GET'?true:false;
			var query = isGet?baseService.get(this.url, this.build()):baseService.post(this.url, this.build());
			query.then(function(response) {
				if(!response){
					throw new Error("The response of request can not be null.");
				}
				if(response.constructor==Array){
					that.rows = response;
					that.buildPageResult();
				}
				else if(response.constructor==Object){
					var rowsKey = dialog?dialog.listKey:null;
					if(!rowsKey && (!response.hasOwnProperty("rows") || response.rows.constructor!=Array)){
						throw new Error("The response should contain Array type property 'rows'.");
					}
					$rootScope.queryResponse = response;
					that.rows = response.rows?response.rows:eval("($rootScope.queryResponse." + rowsKey +")");
					// build Page Result
					that.buildPageResult(response);
				}
				else{
					throw new Error("The response of request only could be Array or Object.");
				}
				deferred.resolve();
				// 发布请求完成的事件
				if(that.onComplete && that.onComplete.constructor==Function){
					that.onComplete.call(that);
				}
				that.inquiring = false;
				$rootScope.$broadcast("dataTable:query:complete", that);
			},
			function(result) {
            	deferred.reject(result);
            	that.inquiring = false;
            	$rootScope.$broadcast("dataTable:query:error", that, result);
            });
			
            
			return deferred.promise;
		}
		
		/**
		 * add param
		 * @param {Object} param
		 */
		DataTable.prototype.addParam = function(param){
			angular.extend(this.params, param);
			return this;
		}
		
		/**
		 * clear all params and reset pagination to page one
		 */
		DataTable.prototype.clearParam = function(){
			this.params = {};
			this._pagination.currentPage = 1;
		}
		
		/**
		 * add query
		 */
		DataTable.prototype.addQuery = function(query){
			if(this.requestType&&this.requestType=='GET'){
				this._querys.push(query);
			}else{
				var q = new Query(this, query);
				this.clearQuery(q.property);
				this._querys.push(q);
			}
		}
		
		/**
		 * get the size of query array
		 */
		DataTable.prototype.getQuerySize = function(){
			return this._querys.length;
		}
		
		/**
		 * clear query by property(clear all when no property)
		 */
		DataTable.prototype.clearQuery = function(property){
			if(!property){
				this._querys = [];
				return;
			}
			var that = this;
			angular.forEach(that._querys, function(item, i){
				if(item.property==property){
					that._querys.splice(i, 1);
				}
			});
		}
		
		/**
		 * at least one row being selected
		 */
		DataTable.prototype.hasSelectedRow = function(){
			var selectedRow = false;
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					selectedRow = true;
					return false;
				}
			});
			return selectedRow;
		}
		
		/**
		 * reset query condition and do query to refresh data.
		 */
		DataTable.prototype.reset = function(){
			this.clearQuery();
			this.query();
			$rootScope.$broadcast("dataTable:query:reset", this);
		}
		
		/**
		 * query currentPage is 1.
		 */
		DataTable.prototype.queryIndex = function(){
			this._pagination.currentPage = 1;
			this.query();
			$rootScope.$broadcast("dataTable:query:queryIndex", this);
		}
		
		/**
		 * get the select rows
		 */
		DataTable.prototype.selectRow = function(){
			var ary = [];
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					ary.push(item);
				}
			});
			return ary;
		}
		
		/**
		 * unselect row
		 */
		DataTable.prototype.unSelectRow = function(row){
			var keepGoing = true;
			angular.forEach(this.rows, function(item){
				if(!keepGoing) return;
				if(row){
					if(row===item){
						item.isSelected = false;
						keepGoing = false;
					}
				}
				else{
					item.isSelected = false;
				}
			});
		}
		
		/**
		 * get the select rows id array
		 */
		DataTable.prototype.selectRowIds = function(options){
			var ids = [];
			options = options || {};
			angular.extend(options, {"selectKey":"id"});
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					ids.push(item[options.selectKey]);
				}
			});
			return ids;
		}
		
		/**
		 * remove array
		 */
		DataTable.prototype.removeArray = function(options){
			if(!options.url){
				throw new Error("The url in options can not be empty.");
			}
			var ids = [],
				deferred = $q.defer(),
				opts = angular.extend({removeKey: 'id', paramKey: 'ids'}, options),
				that = this;
            for (var i = 0, c; c = this.rows[i++];) {
            	if(c.isSelected){
            		ids.push(c[opts.removeKey]);
            	}
            }
            baseService.remove(opts.url + "?"+opts.paramKey+"=" + ids.join(',')).then(function(response) {
            	deferred.resolve(response);
            	// refresh
            	that.query();
            }, function(response){
            	deferred.reject("删除失败：" + (response && response.message) ? response.message : '未知原因，请联系管理员.');
            });
            return deferred.promise;
		}
		return DataTable;
	}])
	.service('baseService', ['$http', '$q', 'context', function($http, $q, context) {
		var ctx = context(),
			reg = /^(\$\{(\w+)\})\/.*$/;
		
		var handleUrl = function(url){
			var match = reg.exec(url);
			if (match != null) {
				var name = match[2],
					mc = match[1],
					val = ctx[name];
				if(!val){
					throw new Error("The '"+name+"' in url:" + url + " does not defined in context provider." );
				}
				return url.replace(mc, val);
			}
			else {
				return url;
			}
		}
		var service = {
			get: function(url, params) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.get(url, {
					params: params
				}).success(function(data, status) {
					deferred.resolve(data);
				}).error(function(data, status) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			post: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.post(url, param).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			put: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.put(url, param).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data, status) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			remove: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http({
					method: 'delete',
					data: param,
					url: url
				}).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data, status) {
					deferred.reject(status);
				});
				return deferred.promise;
			}
		}
		return service;
	}]).service('dialogService', ['$http', '$q', '$timeout', '$state', '$templateFactory', '$compile', '$rootScope', '$ocLazyLoad', function($http, $q, $timeout, $state, $templateFactory, $compile, $rootScope, $ocLazyLoad) {
		layer.config({
			zIndex: 13500
		});
		var service = {
			open: function(config) {
				layer.ready(function(){
				  layer.open(config);
				});
			},
			alert: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.alert(content, angular.extend(config || {}, {end:function(){
					  deferred.resolve();
				  }}));
				});
				return deferred.promise;
			},
			msg: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.msg(content, angular.extend({end:function(){
					  deferred.resolve();
				  }}, config || {}));
				});
				return deferred.promise;
			},
			confirm: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.confirm(content, angular.extend({title:'请确认', icon:3}, config||{}), function(index){
					  deferred.resolve();
					  layer.close(index);
				  }, function(index){
					  deferred.reject();
					  layer.close(index);
				  });
				});
				return deferred.promise;
			},
			warn: function(content){
				return this.msg(content, {icon:0, time:2000});
			},
			success: function(content){
				return this.msg(content, {icon:1, offset:'t', time:1500});
			},
			fail: function(content){
				return this.alert(content, {icon:2, title:'出错了', btn:'确定'});
			},
			page: function(state, config){
				var me = this,
					s = $state.get(state);
				if(!s){
					throw new Error("There is no state '"+state+"' exist in ui-router.");
				}
				var newScope, deferred = $q.defer(), element = angular.element('<div id="tong" class="full-height" style="display:none;"></div>');
				angular.element('body').append(element);
				var	option = angular.extend({
						  type: 1,
						  title: s.data.pageTitle || '详细信息',
						  content: element,
						  btn: ['确定','取消'],
						  area: ['900px', '650px'],
						  yes: function(index){
							  var me = this,
							  	  l = angular.noop();
							  
							  if(newScope && newScope.pageSure && angular.isFunction(newScope.pageSure)){
								  l = newScope.pageSure.call();
							  }
							  else{
								  l = true;
							  }
							  
							  $q.when(l).then(function(r){
								  if(r){
									  if(me.alwaysClose===false){
										  deferred.resolve({result: r, index: index});
									  }
									  else{
										  deferred.resolve(r);
									  } 
								  }
								  if(me.alwaysClose!==false){
									  layer.close(index);
								  }
							  }, function(){
								  deferred.resolve({index:index});
							  });
						  },
						  btn2: function(index){
							  deferred.reject();
						  },
						  end: function(){
							  if(element){
								  element.remove();
								  element = null;
							  }
							  if(newScope){
								  newScope.$destroy();
								  newScope = null;
							  }
						  },
						  resizing: function(layero){
							  $rootScope.$broadcast("layer:resizing", layero);
						  }
						}, config);
				$templateFactory.fromConfig(s).then(function(r){
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
						if(option.pageParam){
							$new['pageParam'] = option.pageParam;
						}
						var ele = $compile(element.contents())($new);
						if(ele && ele.scope && angular.isFunction(ele.scope)){
							newScope = ele.scope();
						}
					});
					me.open(option);
				});
				return deferred.promise;
			},
			sidebar: function(state, config){
				var me = this,
					s = $state.get(state);
				if(!s){
					throw new Error("There is no state '"+state+"' exist in ui-router.");
				}
				this.closeSidebar(true);
				var deferred = $q.defer(), element = angular.element('#right-sidebar');
				var	option = angular.extend({}, config);
				if(option.width){
					element.css("width", option.width);
				}
				$templateFactory.fromConfig(s).then(function(r){
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
						if(option.pageParam){
							$new['pageParam'] = option.pageParam;
						}
						$compile(element.contents())($new);
					});
					element.addClass("sidebar-open");
					if(option.bodyClose !== false){
						angular.element("body").bind("mousedown", function(event){
							if (!(event.target.id == 'right-sidebar' || $(event.target).parents("#right-sidebar").length>0)) {
								me.closeSidebar();
							}
						});
					}
				});
			},
			closeSidebar: function(makeSureTag){
				angular.element("body").unbind("mousedown");
				var element = angular.element('#right-sidebar'),
					content = element.contents();
				element.removeClass("sidebar-open");
				element.css("width", "360px");
				if(content && content.length > 0){
					var subScope = content.find("[ng-controller]").scope();
					if(subScope && subScope.$id!=element.scope().$id){
						subScope.$destroy();
					}
					element.empty();
				}
				if(!makeSureTag){
					$rootScope.$broadcast("sidebar:close");//发布sidebar子页面关闭广播
				}
			},
			close: function(index, delay){
				layer.ready(function(){
					$timeout(function(){
						layer.close(index);
					}, delay?delay:0);
				});
			}
		}
		return service;
	}]).service('ArrayToolService', [function() {
	    var service = {
	    		//上移按钮
		    	up:function(idx,list){
		    		idx = parseInt(idx);
		    		if(idx<1){
		    			return;
		    		}
		    		var t=list[idx-1];
		    		list[idx-1]=list[idx];
		    		list[idx]=t;
		    	},
		    	//下移按钮
		    	down:function(idx,list){
		    		idx = parseInt(idx);
		    		if(idx>=list.length-1){
		    			return;
		    		}
		    		var t=list[idx+1];
		    		list[idx+1]=list[idx];
		    		list[idx]=t;
		    	},
		    	resumeSn:function(list){
		    		for(var k = 0 ; k < list.length ; k++){
		    			list[k].sn = k;
					}
		    		return list;
		    	},
		    	/**
		    	 * idx 原位置
		    	 * num 目标位置
		    	 * list 数组
		    	 */
		    	moveToNum:function(idx,target,list){
		    		if(target==-1){
		    			target = 0;
		    		}else if(idx >= target){
		    			target = target+1;
		    		}
		    		var t= list.splice(idx,1);
		    		list.insert(target,t[0]);
		    		this.resumeSn(list);
		    	},
		    	//默认ngModel turnToIndex
		    	turnTo:function(rowScope,list){
		    		var toIndex =rowScope.turnToIndex - 1;
		    		if(!rowScope.turnToIndex || toIndex<0 || toIndex>=list.length) return; 
		    		
		    		var index = rowScope.$index;
		    		if(toIndex == index) return;
		    		
		    		var row= list.splice(index,1);
		    		list.insert(toIndex,row[0]);
		    		
		    		rowScope.turnToIndex= "";
		    	},
		    	//删除按钮
		    	del:function(idx,list){
		    		list.splice(idx,1);
		    	},
		    	//找到指定元素的未知
		    	idxOf:function(val,list){
		    		for (var i = 0; i < list.length; i++) {  
		    	        if (list[i] == val) return i;  
		    	    }  
		    	    return -1; 
		    	},
		    	//删除指定元素
		    	remove:function(val,list){
		    		var idx = this.idxOf(val,list);  
		    	    if (idx > -1) {  
		    	    	list.splice(idx, 1);  
		    	    }  
		    	},
		    	//置顶
		    	top:function(idx,list){
		    		if(idx>=list.length || idx<1){
		    	           return;
		    		}
		    		//逐个交换
		            for(var i=0;i<idx;i++){
			            var temp=list[i];
			            list[i]=list[idx];
			            list[idx]=temp;
		            }
		    	},
		    	//置底
		    	bottom:function(idx,list){
		    		if(idx>=list.length-1 || idx<0){
		                return;
		            }
		            //逐个交换
	                for(var i=list.length-1;i>idx;i--){
		                var temp=list[i];
		                list[i]=list[idx];
		                list[idx]=temp;
	                }
		    	}
	    };
	    return service;
	}])
	.service('indexColumnService', [ '$state', '$compile', '$rootScope','baseService', function($state, $compile, $rootScope, baseService) {
	    var service = {
	    		//根据栏目别名获取html和数据
	    		singlePreview:function($scope,alias){
	    			if(!$scope.data){
	    				$scope.data = {};
	    			}
	    			$scope.columnReload = function(curAlias){
	    				var url= "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getData?alias="+curAlias+"&params=";
	    				baseService.post(url,{}).then(function(rep){
	    					$scope.data[curAlias] = {};
	    					$scope.html = rep.html;
	    					var requestType = rep.requestType ? rep.requestType : 'POST';
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
	    							if(requestType=='POST'){
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
	    					if(rep.dataFrom){
	    						if(requestType=='POST'){
	    							baseService.post(rep.dataFrom,dataParams).then(function(result){
	    								$scope.data[curAlias] = result;
	    							});
	    						}else{
	    							baseService.get(rep.dataFrom+urlParam).then(function(result){
	    								$scope.data[curAlias] = result;
	    							});
	    						}
	    					}
	    				});
	    			}
	    			
	    			$scope.columnReload(alias);
		    	},
		    	//解析布局
		    	showLayout:function($scope,layout){
		    		$scope.data = {};
		    		$scope.dataFrom = {};
		    		$scope.dataParams = {};
		    		$scope.requestType = {};
		    		var layoutObj = $(layout);
		    		var aliass = "";
		    		var spanEls = layoutObj.children().find("span[column-alias]");
		    		if(spanEls.length<1){
		    			return ;
		    		}
		    		$(spanEls).each(function(){
		    			aliass = !aliass? $(this).attr('column-alias'):aliass+','+$(this).attr('column-alias');
		    		});
		    		var url= "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getDatasByAlias";
    				baseService.post(url,aliass).then(function(rep){
    					rep.forEach(function(curData){  
    						if(curData){
    							var curData = parseToJson(curData);
    							var curAlias = curData.model.alias;
    							//处理html
    							var html = curData.html;
    							layoutObj.children().find("span[column-alias='"+curAlias+"']").replaceWith($(html));
    							var requestType = curData.requestType ? curData.requestType : 'POST';
    							$scope.dataFrom[curAlias] = curData.dataFrom;
    							$scope.requestType[curAlias] = requestType;
    							$scope.data[curAlias] = {};
    	    					
    	    					//post请求参数
    	    					var dataParams = {};
    	    					//get请求参数
    	    					var urlParam = '';
    	    					var dataParam = curData.dataParam;
    	    					if(dataParam){
    	    						dataParam =  parseToJson(dataParam);
    	    						var isMany = dataParam.length > 1;
    	    						for (var i = 0; i < dataParam.length; i++) {
    	    							var value = dataParam[i]['value'];
    	    							var name = dataParam[i]['name'];
    	    							if(requestType=='POST'){
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
    	    					if(curData.dataFrom){
    	    						$scope.dataParams[curAlias] = requestType=='POST'?dataParams:urlParam;
    	    						$scope.columnReload(curAlias);
    	    					}
    						}
						});
    					$scope.html = "";
    					for (var i = 0; i < layoutObj.length; i++) {
    						$scope.html += $(layoutObj[i]).html();
						}
    				});
		    		
    				$scope.columnReload = function(curAlias){
    					if($scope.requestType[curAlias]=='POST'){
    						baseService.post($scope.dataFrom[curAlias],$scope.dataParams[curAlias]).then(function(result){
    							$scope.data[curAlias] = result;
    						});
    					}else{
    						baseService.get($scope.dataFrom[curAlias]+$scope.dataParams[curAlias]).then(function(result){
    							$scope.data[curAlias] = result;
    						});
    					}
    				}
		    		
		    	}
	    };
	    return service;
	}]).service('formService', [ '$state', '$compile', '$rootScope','baseService', function($state, $compile, $rootScope, baseService) {
	    var service = {
	    		/**
	    		 * 格式化数据 
	    		 * @param scope    
	    		 * @param modelName 目標modelName
	    		 * @param exp	 函数表达式
	    		 * subFormDiv 子表div
	    		 */
	    		doMath:function(scope,modelName,funcexp){
	    			var value = FormMath.replaceName2Value(funcexp,scope);
	    			try{
	    				value = eval("("+value+")");
	    			}
	    			catch(e){
	    				return true;
	    			}
	    			if(/^(Infinity|NaN)$/i.test(value))return true;
	    			
	    			eval("scope."+modelName+"=value");
	    		},
	    		/**
	    		 * 數字格式化
	    		 * 		货币				千分位								
	    		 * {"isShowCoin":true,"isShowComdify":true,"coinValue":"￥","capital":false,"intValue":"2","decimalValue":"2"}
	    		 * @returns {String} 返回的数据
	    		 */
	    		numberFormat : function(value,formatorJson,nocomdify) {
	    			var coinvalue = formatorJson.coinValue, 
	    				iscomdify = formatorJson.isShowComdify, 
	    				decimallen=$.fn.toNumber(formatorJson.decimalValue),
	    				intLen = $.fn.toNumber(formatorJson.intValue);
	    			
	    			if(value=="undefined") return;
	    			value =$.fn.toNumber(value)+""; 
	    			
	    			if(intLen>0){
	    				var ary = value.split('.'); 
	    				var intStr = ary[0];
	    				var intNumberLen = intStr.length;
	    				if(intNumberLen > intLen){
	    					intStr = intStr.substring(intNumberLen-intLen,intNumberLen);
	    				}
	    				value =ary.length==2? intStr +"."+ary[1] : intStr;
	    			}
	    			
	    			// 小数处理
	    			if (decimallen > 0) {
	    				if (value.indexOf('.') != -1) {
	    					var ary = value.split('.');
	    					var temp = ary[ary.length - 1];
	    					if (temp.length > 0 && temp.length < decimallen) {
	    						var zeroLen = '';
	    						for ( var i = 0; i < decimallen
	    								- temp.length; i++) {
	    							zeroLen = zeroLen + '0';
	    						}
	    						value = value + zeroLen;
	    					}else if(temp.length > 0 && temp.length > decimallen ){
	    						temp = temp.substring(0,decimallen);
	    						ary[ary.length - 1] =temp;
	    						value =ary.join(".");
	    					}
	    				} else {
	    					var zeroLen = '';
	    					for ( var i = 0; i < decimallen; i++) {
	    						zeroLen = zeroLen + '0';
	    					}
	    					value = value + '.' + zeroLen;
	    				}
	    			}
	    			//处理千分位。
	    			if(iscomdify){
	    				value=this.formatComdify(value);
	    			}
	    			
	    			// 添加货币标签
	    			if (coinvalue != null && coinvalue != '') {
	    				value = coinvalue + value;
	    			}
	    			
	    			return value;
	    		},
	    		//千分位处理。
	    		formatComdify:function (num) {
	    		    return (num+ '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
	    		},
	    		
	    		/**
	    		 * 数字转金额大写
	    		 */
	    		convertCurrency : function(currencyDigits) {
	    			return FormMath.convertCurrency(currencyDigits);
	    		},
	    		/**
	    		 * 日期计算
	    		 * 日期开始，日期结束，计算类型 day,yeay,month
	    		 */
	    		doDateCalc:function(startTime,endTime,diffType){
	    			if(typeof startTime == "undefined" || startTime == "" 
	    				|| typeof endTime == "undefined" || endTime == ""){
	    				return "";
	    			}
	    			var result;
	    			var temptype = diffType;
	    			if (diffType == "hour"){
	    				diffType = "minute";
	    			}
	    			if(startTime.indexOf("-") == -1 && endTime.indexOf("-") == -1){
	    				result=FormMath.timeVal(startTime,endTime,diffType);//日期格式为 hh:mm:ss
	    			}else{
	    				result=FormMath.dateVal(startTime,endTime,diffType);//日期格式YYYY-MM-DD
	    			}
	    			if (isNaN(result)){
	    				result = "";
	    			} else if (temptype == "hour") {
	    				//精确到半小时
	    				var temp = parseInt(result / 60);
	    				if (result % 60 >= 30){
	    					temp = temp + 0.5;
	    				}
	    				result = temp;
	    			}
	    			return result;
	    		}
	    };
	    return service;
	}]).service('commonService', [function() {
		var service = {
			/**
			 * 判断数组中是否包含指定的值。
			 * 判定aryChecked数组中是否val。
			 */
	 		isChecked:function(val,aryChecked){
	 			for(var i=0;i<aryChecked.length;i++){
	 				if(val==aryChecked[i])	return true;
	 			}
	    		return false;
	    	},
	    	/**
	    	 * 判断数组中是否包含数据。
	    	 * name : 属性名
	    	 * val : 值
	    	 * aryChecked : 列表数据。
	    	 */
	    	isExist:function(name,val,aryChecked){
	 			for(var i=0;i<aryChecked.length;i++){
	 				var obj=aryChecked[i];
	 				if(obj[name]==val) return true;
	 			}
	    		return false;
	    	},
	    	
	    	/**
	    	 * 数组操作。
	    	 * val:当前的值。
	    	 * checked:当前的值是否选中。
	    	 * aryChecked:选中的数据。
	    	 */
	    	operatorAry:function(val,checked,aryChecked){
	    		//判断指定的值在数组中存在。
	    		var isExist=this.isChecked(val,aryChecked);
	    		//如果当前数据选中，并且不存在，那么在数组中添加这个值。
	    		if(checked && !isExist){
	    			aryChecked.push(val);
	    		}
	    		//如果当前值没有选中，并且这个值在数组中存在，那么删除此值。
	    		else if(!checked && isExist){
					for(var i=0;i<aryChecked.length;i++){
						val==aryChecked[i] && aryChecked.splice(i,1);
		 			}
	    		}
	    	},
	    	/**
	    	 * 根据指定的值在json数组中查找对应的json对象。
	    	 * val ：指定的值。
	    	 * aryJson ：数据如下 
	    	 * [{val:1,name:""},{val:2,name:""}]
	    	 */
	    	getJson:function (val,aryJson){
	    		for(var i=0;i<aryJson.length;i++){
	    			var obj=aryJson[i];
	    			if(obj.val==val){
	    				return obj;
	    			}
	    		}
	    		return null;
	    	},
	    	/**
	    	 * 添加页面正在加载的动画效果
	    	 */
	    	spinner: function(element){
	    		if(!element || element.length==0){return;}
	    		var $ele = angular.element(element);
	    		$ele.addClass("sk-loading");
	    		$ele.addClass("ibox-content");
	    		var spinner = $ele.find(".sk-spinner");
	    		if(!spinner || spinner.length==0){
	    			$ele.prepend('<div class="sk-spinner sk-spinner-wave">'
			                +'  <div class="sk-rect1"></div>'
			                +'  <div class="sk-rect2"></div>'
			                +'  <div class="sk-rect3"></div>'
			                +'  <div class="sk-rect4"></div>'
			                +'  <div class="sk-rect5"></div>'
			                +'</div>');
	    		}
	    	},
	    	closeSpinner: function(element){
	    		if(!element || element.length==0){return;}
	    		var $ele = angular.element(element);
	    		$ele.removeClass("sk-loading");
	    		$ele.removeClass("ibox-content");
	    		var spinner = $ele.find(".sk-spinner");
	    		spinner.remove();
	    	}
		}
		return service;
	}])
	.service('ArrayChangeService', [function(){
        var service = {
            //上移按钮
            up: function (idx, list) {
                if (idx < 1) {
                    return;
                }
                var t = list[idx - 1];
                list[idx - 1] = list[idx];
                list[idx] = t;
                //给所有ng-model='attr.name'元素增加排序标记，以便在对实体字段进行排序时，不用验证字段别名是否重复
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            //下移按钮
            down: function (idx, list) {
                if (idx >= list.length - 1) {
                    return;
                }
                var t = list[idx + 1];
                list[idx + 1] = list[idx];
                list[idx] = t;
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            resumeSn: function (list) {
                for (var k = 0; k < list.length; k++) {
                    list[k].sn = k;
                }
                return list;
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            /**
             * idx 原位置
             * num 目标位置
             * list 数组
             */
            moveToNum: function (idx, target, list) {
                if (target == -1) {
                    target = 0;
                } else if (idx >= target) {
                    target = target + 1;
                }
                var t = list.splice(idx, 1);
                list.insert(target, t[0]);
                this.resumeSn(list);
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            //默认ngModel turnToIndex
            turnTo: function (rowScope, list) {
                var toIndex = rowScope.turnToIndex - 1;
                if (!rowScope.turnToIndex || toIndex < 0 || toIndex >= list.length) return;

                var index = rowScope.$index;
                if (toIndex == index) return;

                var row = list.splice(index, 1);
                list.insert(toIndex, row[0]);

                rowScope.turnToIndex = "";
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            //删除按钮
            del: function (idx, list) {

                list.splice(idx, 1);
            },
            //找到指定元素的位置
            idxOf: function (val, list) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == val) return i;
                }
                return -1;
            },
            //删除指定元素
            remove: function (val, list) {
                var idx = this.idxOf(val, list);
                if (idx > -1) {
                    list.splice(idx, 1);
                }
            },
            //置顶
            top: function (idx, list) {
                if (idx >= list.length || idx < 1) {
                    return;
                }
                //逐个交换
                for (var i = 0; i < idx; i++) {
                    var temp = list[i];
                    list[i] = list[idx];
                    list[idx] = temp;
                }
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            },
            //置底
            bottom: function (idx, list) {
                if (idx >= list.length - 1 || idx < 0) {
                    return;
                }
                //逐个交换
                for (var i = list.length - 1; i > idx; i--) {
                    var temp = list[i];
                    list[i] = list[idx];
                    list[idx] = temp;
                }
                //给所有ng-model='attr.name'元素增加排序标记，以便在对实体字段进行排序时，不用验证字段别名是否重复
                $($("[ng-model='attr.name']")).each(function () {
                    $(this).attr("sort", "true");
                });
            }
        };
        return service;
    }])
    .service('flowService', ['dialogService', 'baseService', '$q', '$timeout', function(dialogService, baseService, $q, $timeout){
    	//input 为必填项时判断
    	function RequiRed(){
			 var obj;
			$(".ibox-content input[type='text']").each(function(){
			  obj=$(this).attr("ht-validate");
			  if(obj !='' && obj!=undefined){
				  if(parseToJson(obj).required==true && $(this).val()==""){
					  dialogService.warn($(this).attr("desc")+"为必填项");
							$(this).focus();
							throw 'stop';
    			 }
			  }
			});
    	}
    	var service = {
    			/**
    			 * 准备启动流程
    			 */
    			submitForm: function(scope, action){
    				//不是在线表单
    				if(scope.form.type!="INNER"){
    					this.toSubmitForm(scope,action);
    				}
    				else{
    					//保存office 控件
    					OfficePlugin.submit(scope,action);
    				}
    			},
    			/**
    			 * 提交启动流程的请求到后台
    			 */
    			toSubmitForm: function(scope, type){
    				RequiRed();
    				var bpm = CustForm.getService("bpm");
	    			var formType=scope.form.type;
	    			var form = this.getFormData(scope,bpm);
	    			var startFlow = (type=="startFlow");
	    			//启动流程时才校验表单。  因某些实体有字段在数据库是必填。保存草稿如果不校验，会导致数据库异常，故保存草稿也修改为校验表单
	    			if(!form.isValid){
	    				var errorMsg = ""
	    				if(form.error){
	    					var errors = form.error.customValidate;
	    					if(errors && errors.length > 0){
	    						for(var i = 0; i<errors.length; i++){
	    							errorMsg += errors[i].$error;
	    							if(errors.length > 1 && i < errors.length-1){
	    								errorMsg += ",";
	    							}
	    						}
	    					}
	    				}
	    				dialogService.fail("表单校验失败:" + errorMsg);
	    				return; 
	    			}
	
	    			var jsonData = {defId:bpm.getDefId()};
	    			if(form.data){
	    				jsonData.data = $.base64.encode(form.data,"utf-8");
	    			}
	    			
	    			//通过草稿启动流程时，传入草稿的对应的实例ID
	    			if(bpm.isDraft()){
	    				jsonData.proInstId = bpm.getProInstId();
	    			}
	    			var action=(type=="startFlow")?  "start" : "saveDraft";
	    			var url="${bpmRunTime}/runtime/instance/v1/" + action;
	    			var dialogService= CustForm.getService("dialogService");
	    			//发起时是否弹出窗口选择人员
	    			if(startFlow && bpm.isFirstNodeUserAssign()){
	    				//弹出节点人员设置窗口sendNodeUsers
	    				dialogService.page('flow-instanceSendNodeUsers',{pageParam:{defId:bpm.getDefId()}}).then(function(data){
	    					if(data.length>0){
	    						jsonData.nodeUsers=JSON.stringify(data);
	    						jsonData.isSendNodeUsers=1;
	    						var index = layer.load(0, {shade: false});
	    						baseService.post(url,jsonData).then(bpm.handlerSuccess,bpm.handFail);
	    					}
	    				})
	    				
	    			}else if(scope.canSelectNode){
	    				//弹出节点人员设置窗口	debugger;
	    				dialogService.page('flow-instanceSelectDestination',{pageParam:{defId:bpm.getDefId()}}).then(function(data){
	    					if(data.length>0 && data[0].nodeId ){
	    						jsonData.nodeUsers= JSON.stringify(data);
	    						jsonData.destination = data[0].nodeId;
	    						jsonData.isSendNodeUsers=1;
	    					}
	    					var index = layer.load(0, {shade: false});
	    					baseService.post(url,jsonData).then(bpm.handlerSuccess,bpm.handFail);
	    				})
	    				
	    			}else{
	    				//启动流程
	    				var index = layer.load(0, {shade: false});
	    				baseService.post(url,jsonData).then(bpm.handlerSuccess,bpm.handFail);
	    			}
	    		},
	    		/**
	    		 * 获取表单数据
	    		 */
	    		getFormData: function(scope, bpm){
	    			var rtnObj = { isValid:true };
	    			var frmType = scope.form.type;
	    			// 在线表单
	    			// URL表单无需获取数据，直接通过 saveUrlFormData 保存数据
	    			if(frmType=='INNER'){
	    				//清除表单中没有使用的bo数据。
	    				this.tidyData(scope.data);
	    				//处理表单意见没有填写时加上意见数据。
	    				this.handleOpionion(scope,bpm);
	    				
	    				rtnObj.data=angular.toJson(scope.data);
	    				rtnObj.frmType="inner";
	    			}
	    			else{
	    				rtnObj.frmType = "frame";
	    			}
	    			return rtnObj;
	    		},
	    		/**
	    		 * 保存URL表单的数据
	    		 */
	    		saveUrlFormData: function(){
	    			var htFrameForm = angular.element("div[ht-frame-form]"),
						children = htFrameForm.children(),
						deferred = $q.defer();
					
					if(children && children.length == 1){
						var child = children[0];
						
						// 通过iframe加载外部表单时
						if(child.tagName=='IFRAME'){
							var frameObj = child.contentWindow;
							var handler = function(e){
								if(child.src.startsWith(e.origin)){
									var result = e.data;
									if(result){
										if(result.state){
											deferred.resolve(result.data);
										}
										else{
											deferred.reject(result.message);
										}
									}
									else{
										deferred.reject("URL表单未返回正确的数据");
									}
								}
								window.removeEventListener("message", handler);
							}
							window.addEventListener("message", handler);
							// 通过iframe之间message通讯的机制来交互
							frameObj.postMessage("save", child.src);
							// 最多等待1.5秒，如果iframe子页面未返回表单数据，则开始处理流程数据
							$timeout(function(){
								deferred.resolve();
							}, 1500);
						}
						// 使用EIP系统内的表单时
						else{
							child = angular.element(child);
							var form = child.find("form");
							// 表单中有form元素且该元素上有ng-submit事件监听
							if(form && form.length > 0 && form.attr('ng-submit')){
								var formName = form.attr('name'),
									formScope = form.scope();
								if(formName && formScope && formScope[formName].$invalid){
									deferred.reject("表单校验错误，保存失败");
								}
								else{
									// 启动另外一个线程来提交表单，避免因为AngularJs正在消化时提交表单导致  inProgress 的异常
									setTimeout(function(){
										form.submit();
										deferred.resolve(formScope?formScope.data:null);
									}, 0);
								}
							}
							// 表单中有scope作用域，且域上面有save方法
							else if(child.hasClass('ng-scope')){
								var scope = child.scope();
								if(scope){
									scope = scope.$$childHead;
								}
								if(scope && scope.save && scope.save.constructor==Function){
									scope.save();
								}
								deferred.resolve(scope.data);
							}
							else{
								// 既没有form又没有获取到scope时不发送任何表单数据
								deferred.resolve();
							}
						}
					}
					else{
						deferred.resolve();
					}
					return deferred.promise;
	    		},
	    		/**
	    		 * 清理无效的BO数据
	    		 */
	    		tidyData: function(data){
	    			var json={};
	    			$("[ng-model^='data.']").each(function(){
	    				var temp=$(this).attr("ng-model");
	    				var bocode=temp.split(".")[1];
	    				json[bocode]=true;
	    			});
	    			
	    			for(var key in data){
	    				var rtn = this.isBoCodeExist(key,json);
	    				if(!rtn){
	    					delete data[key];
	    				}
	    			}
	    		},
	    		/**
	    		 * 点击任务处理界面的某个按钮时开始对任务进行处理
	    		 */
	    		handleTask: function(actionName, opinion, scope){
	    			if(scope.form.type!="INNER"){
	    				this.taskComplete(actionName,opinion,scope);
	    			}
	    			else{
	    				var params={opinion:opinion};
	    				//保存office 控件,真正保存通过事件处理器。
	    				OfficePlugin.submit(scope,actionName,params);
	    			}
	    		},
	    		/**
	    		 * 准备完成任务的界面
	    		 */
	    		taskComplete: function(actionName,opinion,scope,baseService,dialogService){
	    			var bpm=CustForm.getService("bpm");	
	    			var form = this.getFormData(scope,bpm);
	    			//启动流程时才校验表单。
	    			if(actionName=="agree"){
	    				if(!form.isValid){
	    					selectErrorTab();
	    					var error = form.error.customValidate;
	    					var errorMsg = ""
	    					if(errorMsg != null){
	    						for(var i = 0; i<error.length; i++){
	    							errorMsg += error[i].$error;
	    							if(error.length > 1 && i < error.length-1){
	    								errorMsg += ",";
	    							}
	    						}
	    					}
	    					dialogService.fail("表单校验失败",errorMsg);
	    					return ; 
	    				}
	    			}
	    			
	    			if(bpm.isHideOpinion()){
	    				opinion=$("[ng-model='htBpmOpinion']:not(:hidden)").val();
	    			}
	    			
	    			// 是否弹窗
	    			if(scope.isPopWin){
	    				this.completeTaskDialog(opinion, actionName, scope, bpm);
	    			}else{
	    				this.completeTask(bpm, actionName, opinion, scope);
	    			}
	    		},
	    		/**
	    		 * 发送完成任务的请求到后台
	    		 */
	    		completeTask: function(bpm,actionName,opinion,scope){
	    			var form = this.getFormData(scope,bpm);
	    			if(!form.isValid){
	    				selectErrorTab();
	    				dialogService.fail("表单校验失败","");
	    				return ; 
	    			}
	    			
	    			var taskId = bpm.getTaskId();
	    			 var jsonData ={data:form.data,actionName:actionName,opinion:opinion,taskId:taskId,formType:form.frmType};
	    			 var index = layer.load(0, {shade: false});
	    			 if(jsonData.data){
	    				 jsonData.data = $.base64.encode(jsonData.data,"utf-8");
	    			 }
	    			 baseService.post("${bpmRunTime}/runtime/task/v1/complete", jsonData).then(function(data){
	    			 	layer.close(index);
	    			 	//执行节点后置脚本
	    			 	var script = "var tempFunction = function(data){ "+window.parent.curent_btn_after_script_+"};"
	    				var afterScriptPassed =  eval(script+"tempFunction(data);");
	    			 
	    				if(data.state) {
	    					//TODO 事务一致问题
	    		    		this.saveUrlFormData();
	    					dialogService.success(data.message).then(function(){
	    						CustForm.getService('$state').go('flow.taskList');
	    					});
	    		         }else {
	    		        	 dialogService.fail(data.message); 
	    		         }
	    			});
	    			
	    		},
	    		/**
	    		 * 处理审批意见
	    		 */
	    		handleOpionion: function(scope, bpm){
	    			//表单上不存在意见框
	    			if(!bpm.isHideOpinion()) return;
	    			
	    			if(scope.data.__form_opinion) return false;
	    			
	    			$("[ng-model='htBpmOpinion']:not(:hidden)").each(function(i){
	    				var path=$(this).parent().attr("ht-bpm-opinion");
	    				var aryPath= path.split("\.");
	    				var opinionName=aryPath[2];
	    				var obj={};
	    				obj[opinionName]="";
	    				scope.data.__form_opinion=obj;
	    				return false;
	    			});
	    		},
	    		/**
	    		 * 判断指定key在json中是否存在
	    		 */
	    		isBoCodeExist: function(key,json){
	    			if("__form_opinion"==key)return true;
	    			var rtn=false;
	    			for(var temp in json){
	    				if(key==temp){
	    					rtn=true;
	    				}
	    			}
	    			return rtn;
	    		},
	    		/**
	    		 * 打开完成任务的对话框
	    		 */
	    		completeTaskDialog: function(opinion, actionName, scope, bpm){
	    			var hasFormOpinion = bpm.isHideOpinion();
	    			var form = this.getFormData(scope,bpm);
	    			if(!form.isValid){
	    				selectErrorTab();
	    				dialogService.fail("表单校验失败","");
	    				return ; 
	    			}
	    			
	    			var passConf = {
	    				data : form.data,
	    				formType: form.frmType,
	    				hasFormOpinion : hasFormOpinion,
	    				bpmFormId : scope.form.formKey,
	    				opinion :opinion 
	    			};
	    			var p = {area: ['600px', '300px'],
	    					 btn:[],
	    					 pageParam:{
	    						 passConf: passConf,
	    						 actionName: actionName,
	    						 taskId: bpm.getTaskId(),
	    						 urlForm: (scope.buttons[actionName].urlForm||"")
	    						 }
	    					};
	    			dialogService.page("task-toAgree", p);
	    		},
	    		/**
	    		 * 保存表单数据
	    		 */
	    		saveTaskForm: function(scope, bpm, baseService, dialogService){
	    			//保存IFRAME。
	    			if(scope.form.type!="INNER"){
	    				this.toSaveTaskForm(scope, bpm);
	    			}
	    			else{
	    				//保存office 控件,真正保存通过事件处理器。
	    				OfficePlugin.submit(scope, "saveDraft");
	    			}
	    		},
	    		/**
	    		 * 发送保存表单数据的请求到后台
	    		 */
	    		toSaveTaskForm: function(scope, bpm){
	    			var index = layer.load(0, {shade: false});
	    			// 在线表单  获取表单数据，调用后台保存
	    			if(scope.form.type=="INNER"){
	    				var form = this.getFormData(scope,bpm);
		    			var taskId = bpm.getTaskId();
		    			var jsonData ={taskId:taskId,formType:form.frmType};
		    			if(form.data){
		    				jsonData['data'] = $.base64.encode(form.data);
		    			}
		    			var url= "${bpmRunTime}/runtime/task/v1/saveDraft" ;
		    			baseService.post(url, jsonData)
		    					   .then(bpm.handlerSuccess, bpm.handFail)
		    					   .then(function(){
					    				layer.close(index);
					    			});
	    			}
	    			// URL表单直接保存
	    			else{
	    				this.saveUrlFormData().then(bpm.handlerSuccess, bpm.handFail)
						 					  .then(function(){
						 						  layer.close(index);
								    		   });
	    			}
	    		}
    	};
    	return service;
    }])
    
    .service('dataRightsService', ['$q','$jsonToFormData','baseService','$timeout', 'dialogService', function($q,$jsonToFormData,baseService,$timeout,dialogService) {
		var service = {
			init:function($scope){
				/**
				 * 控件类型。 16是隐藏域 4 用户单选,8,用户多选, 17,角色单选,5,角色多选, 18,组织单选,6,组织多选 19,岗位单选,7,岗位多选
				 */
				this.scope = $scope;
				$scope.controlList = [ {k : "onetext",v : "单行文本框"},{k : "date",v : "日期控件"} ,{k : "select",v : "下拉选项"},{k : "radio",v : "单选按钮"} ,{k : "checkbox",v : "复选框"} ,{k : "customDialog",v : "自定义对话框"} ];
				$scope.bpmFormTable = [];
				$scope.displayFields = [];
				$scope.conditionFields =  [];
				$scope.sortFields =  [];
				$scope.filterFields =  [];
				$scope.manageFields =  [];
				$scope.exportFileds =  [];
				$scope.data = $scope.jsonObject.data;
				$scope.displaySettingFields = CloneUtil.list(parseToJson($scope.jsonObject.displaySettingFields));
				$scope.conditionSettingFields = CloneUtil.list($scope.jsonObject.fields);
				$scope.sortSettingFields = CloneUtil.list($scope.jsonObject.fields);
				
				this.initDataRightsJson($scope.data);
					 
				 switch($scope.type){
					case "sysQueryView":
						// this.initSysQueryViewData(bpmFormTableJSON);
					break;
					default :
						// $scope.bpmFormTable = bpmFormTableJSON;
					break;
				}
				if($scope.data.displayField)
					$scope.displayFields = parseToJson($scope.data.displayField);
				
				if($scope.data.manageField)
					$scope.manageFields = parseToJson($scope.data.manageField);
				else if($scope.data.buttons)
					$scope.manageFields = parseToJson($scope.data.buttons);
				if($scope.data.conditionField)
					$scope.conditionFields = parseToJson($scope.data.conditionField);
				else if($scope.data.conditions)
					$scope.conditionFields = parseToJson($scope.data.conditions);
				if($scope.data.sortField){
					$scope.sortFields = parseToJson($scope.data.sortField);
				}
				if($scope.data.filterField){
					$scope.filterFields = parseToJson($scope.data.filterField);
				}
				
				//$scope.ctlOptions = [ {k : "1",v : "单行文本框"},{k : "15",v : "日期控件"} ,{k : "3",v : "数据字典"} ,{k : "11",v : "下拉选项"},{k : "6",v : "单选按钮"} ,{k : "7",v : "复选框"} ,{k : "4",v : "人员选择器(单选)"},{k : "17",v : "角色选择器(单选)"},{k : "18",v : "组织选择器(单选)"},{k : "19",v : "岗位选择器(单选)"} ];
				$scope.ctlOptions = [ {k : "onetext",v : "单行文本框"},{k : "date",v : "日期控件"} ,{k : "select",v : "下拉选项"},{k : "radio",v : "单选按钮"} ,{k : "checkbox",v : "复选框"} ,{k : "customDialog",v : "自定义对话框"}];
				$scope.managerButtons = [{k:"add",v:"新增"},{k:"edit",v:"编辑"},{k:"del",v:"删除"},{k:"detail",v:"明细"},{k:"sub",v:"子表数据"},{k:"export",v:"导出"},{k:"startFlow",v:"启动流程"}]
				$scope.defaultPermissionList = [];
	        	baseService.get("${bpmModel}/flow/defAuthorize/v1/getPermissionList").then(function(result){
	        		$scope.defaultPermissionList=result;
	        	});
			},
			getOperateOptions : function(type){
				var ops = [];
				switch (type) {
					case 'varchar' :
						ops = [{k : "1",v : "等于"},{k : "2",v : "不等于"},{k : "4",v : "like"},{k : "5",v : "like_l"},{k : "6",v : "like_r"},{k:"7",v:"in"}];
						break;
					case 'number' :
					case 'int' :
						ops = [{k : "1",v : "等于"},{k : "2",v : "不等于"},{k : "3",v : "大于"},{k : "4",v : "大于等于"},{k : "5",v : "小于"},{k : "6",v : "小于等于"},{k:"7",v:"in"},{k : "8",v : "between"},{k:"9",v:"not in"}];
						break;
					case 'date' :
						ops = [{k : "1",v : "等于"},{k : "2",v : "不等于"},{k : "3",v : "大于"},{k : "4",v : "大于等于"},{k : "5",v : "小于"},{k : "6",v : "小于等于"},{k : "7",v : "between"}];
						break;
					default :
						ops = [{k : "1",v : "等于"},{k : "2",v : "不等于"},{k : "3",v : "大于"},{k : "4",v : "大于等于"},{k : "5",v : "小于"},{k : "6",v : "小于等于"}];
						break;
				}
				return ops;
			},
			getSelectorOptions : function(type){
				var selector = 'userSelector';
				switch (type) {
					case 'RoleDialog' :selector = 'roleSelector'; break;
					case 'PostDialog' :selector = 'postSelector'; break;
					case 'OrgDialog' :selector = 'orgSelector'; break;
					default : selector = 'userSelector';break;
				}
				return selector;
			},
			initSysQueryViewData:function(bpmFormTableJSON){
				var scope = this.scope,
					fieldList = [],
					displayList = [];
				
				
				for(var i = 0 ; i < bpmFormTableJSON.length ; i++){
					if(bpmFormTableJSON[i].isSearch)
						fieldList.push(bpmFormTableJSON[i]);
					if(bpmFormTableJSON[i].isShow){
						delete bpmFormTableJSON[i].alarmSetting;
						delete bpmFormTableJSON[i].controlContent;
						delete bpmFormTableJSON[i].resultFrom;
						bpmFormTableJSON[i].sortAble = 0;
						bpmFormTableJSON[i].defaultSort = 0;
						bpmFormTableJSON[i].frozen = 0;
						bpmFormTableJSON[i].sortSeq = "asc";
						bpmFormTableJSON[i].align = "left";
						displayList.push(bpmFormTableJSON[i]);
					}
				}
				
				scope.bpmFormTable = {
						fieldList : fieldList
				}
				
				var tempDiaplayFields = "";
				if(displayFields&&displayFields.length>0){
				
					for(var i = 0 ; i < displayFields.length ; i++){
						var df = displayFields[i];
						if(!df) continue;
						var hasShowRights = false;
						for(var j = 0 ; j < displayList.length ; j++) {
							if(df.fieldName == displayList[j].name) {
								df.name = displayList[j].name;
								df.fieldDesc = displayList[j].fieldDesc;
								df.isVirtual = displayList[j].isVirtual;
								hasShowRights = true;
								break;
							}
						}
						if(hasShowRights){
							tempDiaplayFields = tempDiaplayFields ||[];
							tempDiaplayFields.push(df);
						}
					}
				}
			
				scope.filterFields = {
						type:DataRightsJson.filterType||0,
						sql:(DataRightsJson.filterType==2||DataRightsJson.filterType==3)?DataRightsJson.filter:"",
						conditions:DataRightsJson.filterType==1?parseToJson(DataRightsJson.filter):""
				}
				if(DataRightsJson.supportGroup == 1){
					var groupingView = parseToJson(DataRightsJson.groupSetting),
						groupSummary = groupingView.groupSummary,
						groupField = groupingView.groupField,
						groupColumnShow = groupingView.groupColumnShow,
						groupText = groupingView.groupText,
						groupOrder = groupingView.groupOrder;
					
					scope.groupingView = [];
					for(var i = 0 ; i < groupField.length ; i++){
						var isInDisplayFields = false;
						for(var j = 0 ; j < displayFields.length ; j++){
							if(displayFields[j].fieldName == groupField[i]){
								displayFields[j].gchecked = true;
								isInDisplayFields = true;
								break;
							}
						}
						if(isInDisplayFields)
							scope.groupingView.push({
								groupField:groupField[i],
								groupColumnShow:groupColumnShow[i]?1:0,
								groupSummary:groupSummary[i]?1:0,
								groupText:groupText[i],
								groupOrder:groupOrder[i]
							})
					}
				}
				
				scope.displayFields = tempDiaplayFields||displayList;
				scope.allDisplayFields = displayList;
				scope.sysQueryMetaFields = bpmFormTableJSON;
			},
			isCheckboxNull : function(data){
				return data!= 0 && data!= 1;
			},
			initDataRightsJson : function(dataRightsJson){
				if(!dataRightsJson.id){
					dataRightsJson.needPage = 1;
				}
				if(!dataRightsJson.pageSize)
					dataRightsJson.pageSize = 20;
				if(this.isCheckboxNull(dataRightsJson.isQuery))
					dataRightsJson.isQuery = 0;
				if(this.isCheckboxNull(dataRightsJson.initQuery))
					dataRightsJson.initQuery = 0;
				if(this.isCheckboxNull(dataRightsJson.showRowsNum))
					dataRightsJson.showRowsNum = 0;
			},
			
			
			manageFieldValid : function(list){
				if(!list) return false;
				var name =new Array();
				for(var i = 0 ; i < list.length ; i++){
					name.push(list[i].name);
				}
				return this.isRepeat(name);
			},
			isRepeat : function (arr) {
			    var hash = {};
			    for(var i in arr) {
			        if(hash[arr[i]]) {
			            return true;
			        }
			        hash[arr[i]] = true;
			    }
			    return false;
			},
			/**
			 * 初始化已经选中的
			 */
			initSelected : function(list,selectList,name){
				for(var idx in list){
					if(isInArrayByKey(selectList,list[idx],name)){
						list[idx].checked = true;
					}
				}
			},
			/**
			 * type false ： 添加选中的   true ： 添加全部
			 * 
			 */
			selectDisplayField : function(type){
				var _self = this.scope,
					list = _self.displaySettingFields;
				for(var f in list){
					if((list[f].checked || type) &&!this.hasInList(list[f].name,_self.displayFields,'name')){
						_self.$apply(function() {
							_self.displayFields.push(list[f]);
						})
					}
				}
				
			},
			selectCondition : function(type) {
				var _self = this.scope,
					list = _self.conditionSettingFields,
					service = _self.service;
				if(!_self.conditionFields) _self.conditionFields=[];
				switch(type){
					case 'sysQueryView':
						for(var f in list){
							if(list[f].checked&&!this.hasInList(list[f].fieldName||list[f].name,_self.conditionFields,'name')){
								var condition = {
										name : list[f].fieldName|| list[f].name,
										type : list[f].fieldType|| list[f].type||list[f].dataType,
										operate : "1",
										valueFrom : "1"
								};
								if(condition.type == "date"){
									condition.format = list[f].dateFormat||"yyyy-MM-dd"
								}
								_self.$apply(function() {
									_self.conditionFields.push(condition);
								})
							}
						}
						break;
						default:
							for(var f in list){
								if(list[f].checked&&!this.hasInList(list[f].fieldName||list[f].name,_self.conditionFields,'na')){
									var option = parseToJson(list[f].option);
									var ctrlType = list[f].ctrlType;
									var resultField;
									ctrlType = ctrlType =="multiselect"?"select":ctrlType;//下拉框多选也为下拉框
									if(ctrlType == 'selector' && option){
										ctrlType = this.getSelectorOptions(option.selector.type.alias);
										for(var bind in option.bind){
											if(option.bind[bind].json && option.bind[bind].json.name==list[f].name){
												resultField = option.bind[bind].key;break;
											}
										}
										if(!resultField){
											resultField = option.bind[0].key;
										}
									}
									var condition = {
										name : list[f].name,	
										na : list[f].name,
										ty : list[f].type,
										op : "1",
										cm : list[f].desc,
										va : "",
										vf : option&&option.choiceType || 'static',
										ct : ctrlType || "onetext",
										qt : this.getQueryType(list[f].fieldType|| list[f].type,1),
										option : option,
										controlContent : resultField || option&&option.choice || option&&option[ctrlType]|| "",
									};
									_self.$apply(function() {
										_self.conditionFields.push(condition);
									})
								}
							}
						break;
				}
				
			},
			hasInList:function(na,list,tag){
				for(var i in list){
					if(list[i][tag]==na)
						return true;
				}
				return false;
			},
	
			/**
			 * 选择排序的字段
			 */
			selectSort : function() {
				var _self = this.scope,
				list = _self.sortSettingFields,
					service = _self.service;
				if(_self.listKey)
					list = _self.bpmFormTable[listKey];
				var nameKey = _self.nameKey||"name";
				var descKey = _self.descKey||"desc";
				if(!_self.sortFields) _self.sortFields = [];
				for(var f in list){
					if(list[f].checked&&!this.hasInList(list[f]["name"]||list[f][nameKey],_self.sortFields,'name')){
						var condition = {
								name : list[f]["name"]||list[f][nameKey],
								desc : list[f]["desc"]||list[f][descKey],
								sort : "ASC"
							};
						this.scope.$apply(function() {
							_self.sortFields.push(condition);
						})
					}
				}
			},
			addManage : function() {
				this.scope.manageFields = this.scope.manageFields||[];
				var list = this.scope.manageFields;
				var mf = {desc:"新增",name:"add"};
				if(!this.noRights)
					mf.right = [{type:"everyone"}];
				list.push(mf);
			},
			onFunctionChange : function(obj){
				var manageFields = this.scope.manageFields;
				var managerButtons = this.scope.managerButtons;
				$timeout(function(){
					angular.forEach(managerButtons,function(item){
						if(item.k==obj.name){
							angular.forEach(manageFields,function(f){
								if(item.k==f.name){
									f.desc = item.v;
								}
							});
						}
					});
				})
			},
			/**
			 * 增加、修改过滤条件
			 */
			addFilter : function(list,idx) {
				var title = "添加过滤条件";
				var _self = this.scope;
				_self.editFilter = null;
				if(list){
					_self.editFilter = list[idx];
					title = "编辑过滤条件";
				}
				dialogService.page("templateFilter", {
					alwaysClose: false,title:title, area:['800px', '480px'],pageParam:{scope:_self},
        		 }).then(function(rep){
        			 layer.close(rep.index)
        			 if (rep.result) {
        				var rtn = rep.result;
						if(!list){
							var filter = new Object();
							filter.condition = rtn.filterType==1?$.parseJSON(JSON.stringify(rtn.filter)) : rtn.filter;
							filter.name = rtn.name;
							filter.key = rtn.key;
							filter.type = rtn.filterType;
							if(!_self.noRights){
								filter.right = [{type:"everyone"}];
							}
							_self.filterFields.push(filter);
						}else{
							list[idx].condition = rtn.filterType==1?$.parseJSON(JSON.stringify(rtn.filter)) : rtn.filter;
							list[idx].name = rtn.name;
							list[idx].key = rtn.key;
							list[idx].type = rtn.filterType;
						}
					}
        		 });
			},
			getFilterType : function(type){
				type = parseInt(type);
				var ft = "条件脚本";
				switch (type) {
					case 2 :
						ft = 'SQL';
						break
					case 3 :
						ft = '追加SQL';
						break
				}
				return ft;
			},
			delTr : function(list,idx) {
				list.splice(idx,1);
			},
			moveTr : function(list,idx,isUp) {
				idx = parseInt(idx);
				if((isUp&&idx==0)||(!isUp&&idx==list.length-1)) return;
				if (isUp) {
		    		var t=list[idx-1];
		    		list[idx-1]=list[idx];
		    		list[idx]=t;
				} else {
					var t=list[idx+1];
		    		list[idx+1]=list[idx];
		    		list[idx]=t;
				}
			},
			fieldDialog : function(f){
				var _this = this;
				var permissionList = _this.scope.defaultPermissionList;
				var conf={
	        			  right:f.right?parseToJson(f.right):[],
	        			  permissionList:permissionList
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
	        				f.right = tmpAry.length>0?JSON.stringify(tmpAry):[{'title':'无','type':'none'}];
	        		 });
			},
			rightToDesc : function(right) {
				if(right){
					right = parseToJson(right);
				}
				var desc = "";
				var permissionList = this.scope.jsonObject.permissionList;
				$(right).each(function() {
					if (desc) {
						desc += " 和 ";
					}
					var str = permissionList[this.type];
					if (this.name) {
						str += ":" + this.name;
					} else if (this.id) {
						str += ":" + this.id;
					}
					desc += str;
				});
				return desc;
			},
			getQueryType : function(type, op) {
				var qt = "equal";
				op = parseInt(op);
				switch (type) {
					case 'varchar' :
						if (op) {
							switch (op) {
								case 1 :
									qt = 'equal';
									break
								case 2 :
									qt = 'not_equal';
									break
								case 3 :
									qt = 'like';
									break
								case 4 :
									qt = 'right_like';
									break
								case 5 :
									qt = 'left_like';
									break
								case 6 :
									qt = 'in';
									break
								default :
									qt = 'like';
									break
							}
						}
						break;
					case 'int' :
					case 'number' :
						if (op) {
							switch (op) {
								case 1 :
									qt = 'equal';
									break
								case 2 :
									qt = 'great';
									break
								case 3 :
									qt = 'less';
									break
								case 4 :
									qt = 'great_equal';
									break
								case 5 :
									qt = 'less_equal';
									break
								default :
									qt = 'equal';
									break
							}
						}
						break;
					case 'date' :
						if (op) {
							switch (op) {
								case 1 :
									qt = 'equal';
									break
								case 2 :
									qt = 'great';
									break
								case 3 :
									qt = 'less';
									break
								case 4 :
									qt = 'great_equal';
									break
								case 5 :
									qt = 'less_equal';
									break
								case 6 :
									qt = 'between';
									break
								default :
									qt = 'equal';
									break
							}
						}
						break;
					default :
						qt = 'equal';
						break;
				}
				return qt;
			},
			setSysQueryViewJson:function(json){
				if(this.scope.type == 'sysQueryView'){
					var obj = this.scope.dataRightsJson;
					json.conditions = json.conditionField;
					json.buttons = json.manageField;
					json.initQuery = obj.initQuery;
					json.showRowsNum = obj.showRowsNum;
					json.filterType = this.scope.filterFields.type;
					//过滤条件
					if(json.filterType == 2|| json.filterType == 3){
						editor.save();
						json.filter = $('#sql').val();
					}else
						json.filter = JSON.stringify($("#ruleDiv").linkdiv("getData"));
					
					//分组数据
					json.supportGroup = obj.supportGroup;
					if(obj.supportGroup == 1){
						var scope = this.scope,
							list = scope.groupingView;
						var groupField = [];
						var groupColumnShow = [];
						var groupText = [];
						var groupOrder = [];
						var groupSummary=[];
						
						for(var i = 0 ; i < list.length ; i++) {
							groupField.push(list[i].groupField);
							groupColumnShow.push(list[i].groupColumnShow==1);
							groupSummary.push(list[i].groupSummary==1);
							groupText.push(list[i].groupText);
							groupOrder.push(list[i].groupOrder);
						}
						json.groupSetting = {
								groupField:groupField,
								groupColumnShow:groupColumnShow,
								groupText:groupText,
								groupOrder:groupOrder,
								groupSummary:groupSummary
						}
						
						json.groupSetting = JSON.stringify(json.groupSetting);
					}
					json.filterField = this.scope.dataRightsJson.showRowsNum;
				}
			},
			customFormSubmit : function (datashowResponse){
				var dr = this.scope.data;
				
				var json={
					id:dr.id,
					boDefId:dr.boDefId,
					boDefAlias:dr.boDefAlias,
					sqlId:dr.sqlId,
					name:dr.name,
					formKey:dr.formKey,
					source:dr.source,
					defId:dr.defId,
					subject:dr.subject,
					alias:dr.alias,
					templateAlias:dr.templateAlias,
					sqlAlias:dr.sqlAlias,
					isQuery:dr.isQuery,
					isFilter:dr.isFilter,
					needPage:dr.needPage,
					pageSize:dr.pageSize,
					displayField:this.listToString(this.scope.displayFields),
					conditionField:this.listToString(this.scope.conditionFields),
					sortField:this.listToString(this.scope.sortFields),
					filterField:this.listToString(this.scope.filterFields),
					manageField:this.listToString(this.scope.manageFields),
					exportField:this.listToString(this.scope.exportFileds),
					templateAlias:dr.templateAlias
				};
				
				//业务数据模板上的是否初始化模板
				if(dr.resetTemp){
					json.resetTemp=dr.resetTemp;
				}
				
				this.setSysQueryViewJson(json);
				baseService.post('${form}/form/dataTemplate/v1/save', JSON.stringify(json)).then(function(rep){
					datashowResponse(rep);
				});
			},
			listToString: function(list){
				for(var i = 0 ; i < list.length ; i++){
					if(list[i].hasOwnProperty("$$hashKey"))
						delete list[i].$$hashKey;
				}
				return JSON.stringify(list);
			},
			setPingyin : function(sco,from,target){
				var input = getValByScope("",from,sco);
				Share.getPingyin({
					input:input,
					postCallback:function(data){
						setValToScope(null,data.output,null,target,sco);
					}
				});
			},
			fieldMetaDialog : function(field) {
				var url = __ctx+"/system/query/queryMetafieldBDialog";
				var title = "";
				field.fieldDesc = field.desc;
				field.fieldName = field.name;
				field.dataType = field.type;
				title = "报警设置";
				callBack = function(data, dialog) {// 虚拟列不同于其他的回调
					delete field.fieldDesc;
					delete field.fieldName;
					delete field.dataType;
					field.formater = data.formater;
					field.alarmSetting = data.alarmSetting;
				};
				DialogUtil.openDialog(url, title, CloneUtil.deep(field), function(data, dialog) {
					if (!data)// 空说明没通过验证返回了空对象，所以不需要关页面
						return;
					dialog.dialog('close');
					callBack(data, dialog);
				}, 800, 600);
			},
			isInCtrl : function(ctrl){
				if(ctrl=="dic"||ctrl=="select"||ctrl=="radio"||ctrl=="checkbox"||ctrl=="customDialog"){
					return true;
				}
				return false;
			},
			fieldCtrlDialog : function(field) {
				var title = "";
				field.fieldDesc = field.desc;
				field.fieldName = field.name;
				field.dataType = field.type;
				title = "控件设置";
				var callBack = function(data) {// 虚拟列不同于其他的回调
					jQuery.extend(field, data)
				};
				
				dialogService.page('templateCtrlfield',{alwaysClose: true,title:title, area:['800px', '380px'],pageParam:{field:CloneUtil.deep(field),controlTypes:this.scope.controlList}}).then(function(data){
					callBack(data);
				});
//				DialogUtil.openDialog(url, title, CloneUtil.deep(field), function(data, dialog) {
//					if (!data)// 空说明没通过验证返回了空对象，所以不需要关页面
//						return;
//					dialog.dialog('close');
//					callBack(data, dialog);
//				}, 800, 600);
			},
		};
		return service;
	}])
	.service('editDataService', ['$rootScope','baseService','dialogService','$q', function($rootScope, baseService, dialogService, $q) {
	    var service = {
	    		//获取表单详情
	    		init : function(scope){
	    			//获取BpmForm的详情
	    			baseService.get('${form}/form/dataTemplate/v1/getForm/'+scope.formKey+'/'+scope.boAlias+'?id='+scope.id+'&action='+scope.action).then(
	    				function(data){
	    					if(data.result){
	    						scope.data = data.data; 
	    						scope.permission = data.permission;
	    						scope.html  =data.form.formHtml;
	    						window.setTimeout(scope.initSubTableData,100);
	    					}else{
	    						dialogService.fail("表单内容为空");
	    					}
	    				},function(){}
	    			);
	    		},
	    		boSave : function(scope){
	    			var defer = $q.defer();
	    			if(scope.form.$invalid){
	    				dialogService.warn("表单校验不通过");
	    				defer.resolve();
	    			}
	    			var index = layer.load(0, {shade: false});
	    			baseService.post('${form}/form/dataTemplate/v1/boSave/'+scope.boAlias+'',scope.data).then(
	    				function(data){
	    					layer.close(index);
	    					if(data.state){
	    						dialogService.success(data.message);
	    					}else{
	    						dialogService.fail(data.message);
	    						defer.reject();
	    					}
	    				},function(){}
	    			);
	    		}
	        }
	    return service;
	}])
	.filter('chineseDate', function(){
	    var filter = function(input){
	    	var myregexp = /^(\d{4})(\d{1,2})(\d{1,2})$/g;
	    	if(!input || !myregexp.test(input)){
	    		return input;
	    	}
	        return input.replace(myregexp, "$1年$2月$3日");
	    };
	    return filter;
    })
    .filter('clearValue', function() {
		return function(obj) {
			for(var k in obj){
				obj[k] =  "";
			}
			return obj;
		};
	})
    .filter('htDuration', function(){
    	var filter = function(input){
    		if(!input || input <1) {
    			return '';
    		}
	        return $.timeLag(input);
	    };
	    return filter;
    })
    .filter('oddeven', function() {
	    return function(input, odd) {
	    	var output = [];
	    	angular.forEach(input, function(item, index){
	    		if(index%2!=odd){
	    			output.push(item);
	    		}
	    	});
	    	return output;
	    }
	})
	.filter('shield', function() {
		var reg = /^1(3|4|5|7|8)\d{9}$/,
			repExp = /(\d{3})\d{4}(\d{4})/g;
	    return function(input) {
	    	if(reg.test(input)){
	    		return input.replace(repExp, "$1****$2");
	    	}
	    	return input;
	    }
	})
    .filter('toArray', function () {
	  return function (obj, addKey) {
		    if (!angular.isObject(obj)) return obj;
		    if ( addKey === false ) {
		      return Object.keys(obj).map(function(key) {
		        return obj[key];
		      });
		    } else {
		      return Object.keys(obj).map(function (key) {
		        var value = obj[key];
		        return angular.isObject(value) ?
		          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
		          { $key: key, $value: value };
		      });
		    }
		  };
		});
})();