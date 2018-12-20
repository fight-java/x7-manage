//布局管理
function layoutDesignCtrl($scope, $compile, baseService, dialogService, $stateParams, $timeout, $sce, indexColumnService, $rootScope) {
	$scope.layoutTempList = [];
	$scope.columnTempList = [];
	$scope.sysIndexLayout = {};
 	$scope.layouts = [];
 	$scope.editingField = {};
	$scope.currentInEle = null;
 	//保存打开页面时的布局；
 	var originalLayouts = [];
	$scope.designHtml = "";
	var params = {
		id: $stateParams.id,
		orgId: $stateParams.orgId,
		layoutType: $stateParams.type
	}

	baseService.get("${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/design",params)
	.then(function(response) {
		$scope.sysIndexLayout = response.sysIndexLayout;
		$scope.layoutTempList = response.indexLayoutList;
		$scope.columnMap = response.columnMap;
		$scope.parserHtml();
		$timeout(function(){
			$scope.initDrag();
			initItemTooltip();
		}, 100);
	});
	
	// 解析布局设置的html内容
	$scope.parserHtml = function(){
		if($scope.sysIndexLayout && $scope.sysIndexLayout.designHtml){
			var rows = $scope.getRowsByHtml($scope.sysIndexLayout.designHtml);
			angular.forEach(rows, function(row){
				var layout = $scope.getLayoutTempById($(row).attr("layout-id"));
				if(layout){
					layout.templateHtml =  $sce.trustAsHtml(row.innerHTML);
					$scope.layouts.push(layout);
				}
			});
			originalLayouts = [].concat($scope.layouts);
			!$scope.$$phase&&$scope.$digest();
			$scope.initDrop('.column');
		}
	}
	
	$scope.getRowsByHtml = function(html) {
		var elem = $(html),
			rows = [];
		for(var i=0,c;c=elem[i++];){
			if($(c).hasClass("row")){rows.push(c)}
		}
		return rows;
	}
	
	// 添加布局
	$scope.addLayout = function(item){
		var layoutId = item.attr("layout-id");
		$scope.layouts.push($scope.getLayoutTempById(layoutId));
		!$scope.$$phase&&$scope.$digest();
		$scope.initDrop('.column');
		item.remove();
	}
	
	// 通过id获取布局
	$scope.getLayoutTempById = function(id){
		var layout = null;
		angular.forEach($scope.layoutTempList, function(temp){
			if(temp.id==id){
				layout = angular.copy(temp);
			}
		});
		return layout;
	}
	
	// 初始化拖
	$scope.initDrag = function(){
		$(".dragfrom").each(function (i, el) {
            Sortable.create(el, {
                sort: false,
                group: {
                    name:'advanced',
                    pull: 'clone',
                    put: false
                },
                animation: 150
            });
        });
		$scope.initDrop('.dropto');
	}
	
	//给栏目添加删除按钮
	function initItemTooltip(){
		var $spans = $('#designPanel').find('span[column-alias]');
		$($spans).css('cursor','pointer');
		$($spans).css('paddingLeft','15px');
		$($spans).css('paddingRight','15px');
		$($spans).each(function(){
			initTooltip(this);
		});
		$scope.initDrop('.column');
		$('#designPanel').find('.column').mouseenter(function(e) {     
			$scope.currentInEle = e.srcElement || e.target;;
		})
	}
	
	// 初始化放
	$scope.initDrop = function(ele){
		$(ele).each(function (i, el) {
        	$scope.sort = Sortable.create(el, {
                sort: true,
                group: {
                    name:'advanced',
                    pull: false,
                    put: true
                },
                animation: 150,
                onAdd: function (evt){
                	var item = $(evt.item),
                		target = $(evt.target),
                		layoutId = item.attr("layout-id"),
                		columnAlias = item.attr("column-alias");
                	if(target.hasClass("dropto")){
                		if(layoutId){
                    		$scope.addLayout(item);
                    	}
                		else if(columnAlias){
                			item.remove();
                		}
                	}
                	else{
                		if(layoutId){
                			item.remove();
                		}
                		else if(columnAlias && target.children().length > 1){
                			item.remove();
                		}
                	}
                	initItemTooltip();
                },
                onSort: function(evt){
                },
                onEnd: function (evt) {
                	$timeout(function(){
                		if($scope.currentInEle && evt.from){
                			var $from = $(evt.from);
                			var $to = $($scope.currentInEle);
                			if($to.length==1 && $from.length==1 && !($to.position().top==$from.position().top&&$to.position().left==$from.position().left)){
                				$to = $to[0].tagName=='SPAN'? $($to).parent():$to;
                				$from = $from[0].tagName=='SPAN'? $($from).parent():$from;
                				if($from.hasClass("column")){
                					var $fromSpan = $from.find('span[column-alias]');
                            		var $toSpan = $to.find('span[column-alias]');
                            		$from.children().remove();
                            		if($toSpan.length>0){
                            			$from.append($toSpan);
                            			$to.children().remove();
                            		}
                            		$to.append($fromSpan);
                            		initItemTooltip();
                				}
                			}
                		}
                	},100);
                },
                onMove: function (evt, originalEvent) {
                	$('#fieldTooltip').remove();
                }
            });
        });
	}
	
	function initTooltip(item){
    	var $span = $(item);
    	$span.hover(function(){
    		var $item = $span.parent();
    		var rightWidth = $span.position().left-20;
			var obj = $item.find('#fieldTooltip');
			if(obj.length<1){
				var divHtml = $('<div id="fieldTooltip" style="position:absolute;top:0px;right:'+rightWidth+'px;z-index: 99;"></div>');
				var baseBtn = '<a  class="btn btn-danger fa fa-trash" title="移除" ng-click="removeColumnField($event)"></a>'; //创建删除按钮 
				divHtml.append(baseBtn);
				$span.append($compile(divHtml)($scope)); //添加到页面中 
                $("#fieldTooltip").show("fast"); //设置提示框的坐标，并显示 
			}
    	},function(){
    		$('#fieldTooltip').remove();
    	})
    }
	
	$scope.removeColumnField = function($event){
		$($event.target).parent().parent().remove();
		initItemTooltip();
	}
	
	// 清空内容
	$scope.clear = function(){
		$scope.layouts = [];
	}
	
	//重做
	$scope.redo = function(){
		$scope.layouts = [].concat(originalLayouts);
	}
	
	/*//撤销到上一步
	$scope.undo = function(){
		$scope.layouts.pop();
	}
	*/
	// 预览
    $scope.preview = function(){
    	removeSuperfluousDom();
    	var html = $("#designPanel").html();
    	initItemTooltip();
    	if(!html){
    		dialogService.warn("布局内容不能为空");
    		return;
    	}
    	html = $scope.getPureHtml(html);
    	dialogService.page('preview', {area:['1024px', '580px'], pageParam: {html:html}});
    }
    
    $scope.selectField = function(field){
    	$scope.editingField = field;
    }
    
    $scope.removeField = function(field){
    	$scope.layouts.remove(field);
    }
    
    function initLayout(){
    	removeSuperfluousDom();
    	var html = $("#designPanel").html();
    	initItemTooltip();
    	var rows = $scope.getRowsByHtml(html);
    	$scope.layouts = [];
		angular.forEach(rows, function(row){
			var layout = $scope.getLayoutTempById($(row).attr("layout-id"));
			if(layout){
				layout.templateHtml =  $sce.trustAsHtml(row.innerHTML);
				$scope.layouts.push(layout);
			}
		});
		originalLayouts = [].concat($scope.layouts);
		!$scope.$$phase&&$scope.$digest();
		$scope.initDrop('.column');
    }
    
    // 获取纯净的html内容
    $scope.getPureHtml = function(html){
    	var rows = $scope.getRowsByHtml(html),
			ary = [];
		
		angular.forEach(rows, function(row){
			var me = $(row),
				span = me.find("span.label"); 
			me.removeAttr("ng-repeat")
			  .removeAttr("ng-bind-html")
			  .removeClass("ng-scope")
			  .removeClass("ng-binding");
			span.removeAttr("ng-bind")
				.removeAttr("draggable")
				.removeAttr("style")
				.removeClass("ng-binding");
			ary.push(row.outerHTML);
		});
		return ary.join('');
    }
    
    $scope.save = function(){
    	removeSuperfluousDom();
    	$timeout(function(){
    		var html = $("#designPanel").html();
        	if(!html){
        		dialogService.warn("布局内容不能为空");
        		return;
        	}
        	html = $scope.getPureHtml(html);
        	$scope.sysIndexLayout.designHtml = $.base64.encode(html, "utf-8");
        	$scope.sysIndexLayout.templateHtml = '';
        	$scope.sysIndexLayout.orgId = params.orgId;
        	dialogService.sidebar("m_portal.designLayoutManageSave", {bodyClose: false, width: '50%', pageParam: {sysIndexLayout:$scope.sysIndexLayout}});
    	},100);
    }
    
    //删除多余dom元素
    function removeSuperfluousDom(){
    	$('#fieldTooltip').remove();
    	$('.tooltip-container').remove();
    	$scope.editingField = {};
    	$('.superfluous').each(function(){
            var _dom = $(this).html();
            $(this).after(_dom).remove();
        });
    }
}

//保存布局页面
function layoutManageSaveCtrl($scope, $state, baseService, dialogService) {
	$scope.data = $scope.pageParam.sysIndexLayout;
	if($scope.data && $scope.data.orgId){
		baseService.get('${uc}/api/org/v1/org/get?id='+$scope.data.orgId).then(function(rep){
			if(rep){
				$scope.orgName = rep.name;
			}
		});
	}
	//保存
	$scope.save = function() {
		if($scope.data.name==null || $scope.data.name==""){
			dialogService.fail("布局名称不能为空！");
			return false;
		}
		var url = "${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/saveLayout";
		baseService.post(url, $scope.data).then(function(rep){
			if(rep.state){
				dialogService.success("保存成功").then(function(){
					$scope.close();
				    $state.go("m_portal.layoutManageList");
				    $scope.dataTable.query();
				});
			}
			else{
				dialogService.error(rep.message);
			}
		});
	}
	
	//关闭页面
	$scope.close = function() {
		dialogService.closeSidebar();	
	}
	
	//选择组织
	$scope.selectOrg = function(selector){
		dialogService.page(selector, {pageParam:{single:true,id:1}})
		 .then(function(result){
			 if(result&&result.length>0){
				 $scope.data.orgId = result[0].id;
				 $scope.orgName = result[0].name;
			 }
		 });
	}
}

//布局页面预览
function previewCtrl($scope, baseService, dialogService, indexColumnService) {
	var html = "";
	//首页工作台布局
	if(!$scope.pageParam){
		var url="${portal}/portal/main/v1/myHome"
		baseService.get(url).then(function(rep){
    		if(rep.state){
    			html =  $.base64.decode(rep.value,"utf-8");
    			indexColumnService.showLayout($scope,html);
    		}
    	});
	}
	//布局预览
	else{
		html = $scope.pageParam.html;
		indexColumnService.showLayout($scope,html);
	}
}

//布局管理
function layoutManageTypeCtrl($scope, baseService, dialogService) {
	$scope.orgTreeData = [];
	$scope.orgId = "";
	$scope.id = "";
	$scope.layoutTypes = [];
	$scope.currentDem = [];
	
	//添加option
	baseService.get("${uc}/api/orgAuth/v1/orgAuths/getCurrentUserAuthOrgLayout").then(function(rep) {
		if(rep && rep.length > 0){
			$scope.layoutTypes = rep ; 
			$scope.currentAuthOrg = rep[0]
			$scope.currentAuthOrgId = $scope.currentAuthOrg.id
			$scope.currentDem = $scope.layoutTypes[rep.length - 1];
		}
	});
	
	//树配置
	$scope.treeConfig = {
			data: {
				simpleData:{
					enable: true,
					idKey: "id",
					pIdKey: "parentId"
				}
			}
	};
	
	// 监控维度变化
	$scope.$watch('currentAuthOrgId', function(n, o){
		if(n!==o){
			// 重置组织树的数据
			$scope.org = '';
			for(var i = 0 ; i < $scope.layoutTypes.length; i++ ){
				if($scope.layoutTypes[i].id === n){
					$scope.currentAuthOrg = $scope.layoutTypes[i];
					break;
				}
			}
			$scope.orgTreeData = [];
			$scope.loadOrgTreeData($scope.currentAuthOrg.orgId);
		}
	});
	
	// 加载组织树数据
	$scope.loadOrgTreeData = function(p){
		var params = {isOrgAuth:"true"};
		if(p){
			params["parentId"] = p;
		}
		baseService
		.post(getContext()['uc']+"/api/org/v1/orgs/getByParentAndDem", params)
	    .then(function(rep){
		   if(rep && rep.length > 0){
			   // 合并数据
			   var ary = $scope.orgTreeData.concat(rep);
			   ary.unique(function(x,y){
				   if(x.id==='0'){
					   x.open = true;
				   }
					return x.id==y.id;
				});
			   $scope.orgTreeData = ary;
		   }
	   });
	}
		
	//树点击事件
	$scope.tree_click = function (obj,id,val){
		$scope.orgId = val.id;
		if(val.id!='0'){
			//将当前选中项作为查询条件
			$scope.dataTable.addQuery({property: 'orgId', operation: 'equal', value: val.id});
		}
		else{
			$scope.dataTable.clearQuery();
		}
		$scope.dataTable.query();
	}
	
	$scope.orgTree_expand = function(e, i, n){
		if(!n.hasLoadChildren){
			n.hasLoadChildren = true;
			$scope.loadOrgTreeData(n.id);
		}
	}
	
	//操作
	$scope.operating = function(id, action,layoutType,orgId){
		var title = action == "add" ? "添加布局" : action == "edit" ? "编辑布局" : "布局详情";
		dialogService.sidebar("design", {bodyClose: false, width: '80%', pageParam: {id:id, title:title,orgId:$scope.orgId,layoutType:layoutType}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
	         $scope.dataTable.query();//子页面关闭,父页面数据刷新
	     });
	}
	
	$scope.remove = function(id){
    	baseService.remove(getContext()['portal']+"/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/remove?ids="+id)
    	.then(function(response) {
    		if(response.state){
    			$scope.dataTable.query();
    		}else{
    			dialogService.fail(response.message || "删除失败!");
    		}
    	});	
    }
	
	//更改默认
	$scope.changeDefaulte = function(row,action){
		var url = getContext()['portal']+"/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/changDefault?id="+row.id+"&action="+action+"&layoutType="+row.layoutType+"&orgId="+row.orgId;
		baseService.get(url).then(function(rep){
			if(rep.state){
				$scope.dataTable.query();
			}else{
				dialogService.fail(rep.message || "设置失败!");
			}
		});
	}
	
	//布局管理预览
	$scope.preview = function(id) {
		var url = "${portal}/portal/sysIndexLayoutManage/sysIndexLayoutManage/v1/getJson?id="+id;
		baseService.get(url).then(function(rep) {
			var html = $.base64.decode(rep.designHtml,"utf-8");
	    	dialogService.page('preview', {area:['1024px', '580px'], pageParam: {html:html}});
		});
	}
	
	//授权
	$scope.setAuth = function(id){
		var objType = 'indexManage';
		var conf={
			id:id,
			objType:objType
		 }
		dialogService.page("index-auth", {
		    title:'授权页面',
		    pageParam:{data:conf},
		}).then(function(data){
			$scope.saveRights(id,objType,data)
		});
	}
	
	//保存权限人员
	$scope.saveRights = function(id,objType,ownerNameJson){
		var params = {
			id : id,
			objType:objType,
			ownerNameJson : JSON.stringify(ownerNameJson)
		};
		var url = "${portal}/sys/authUser/v1/saveRights";
		baseService.post(url,params).then(function(rep){
			if(rep || rep.state){
				dialogService.success(rep.message);
			}else{
				dialogService.fail(rep.message || "保存失败!");
			}
		})
	}
}

//首页栏目预览
function sysIndexColumnPreview($scope, dialogService, baseService, $compile, $timeout,indexColumnService) {
	var alias = $scope.pageParam.alias;
	indexColumnService.singlePreview($scope,alias);
}

//首页栏目
function sysIndexColumnTypeCtrl($scope, dialogService, baseService) {
	$scope.operating = function(id, action){
		var title = action == "add" ? "添加首页栏目" : action == "edit" ? "编辑首页栏目" : "查看首页栏目";
		if(action=="add"||action=="edit"){
			dialogService.sidebar("m_portal.sysIndexColumnListEdit", {bodyClose: false, width: '60%', pageParam: {id:id, title:title}});
			 $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}else{
			dialogService.sidebar("sysIndexColumn-detail", {bodyClose: false, width: '30%', pageParam: {id:id, title:title}});
		}
	}
	
	//预览
	$scope.previewTemplate = function(id,columnName,isPublic,alias) {
		dialogService.page('getTempPC', {alwaysClose: false,width: '40%',pageParam: {alias:alias}});
	}
	
	//授权
	$scope.setAuth = function(id){
		var objType = 'indexColumn';
		var conf={
			id:id,
			objType:objType
		 }
		dialogService.page("index-auth", {
		    title:'授权页面',
		    pageParam:{data:conf},
		}).then(function(data){
			$scope.saveRights(id,objType,data)
		});
	}
	
	//保存权限人员
	$scope.saveRights = function(id,objType,ownerNameJson){
		var params = {
			id : id,
			objType:objType,
			ownerNameJson : JSON.stringify(ownerNameJson)
		};
		var url = "${portal}/sys/authUser/v1/saveRights";
		baseService.post(url,params).then(function(rep){
			if(rep || rep.state){
				dialogService.success(rep.message);
			}else{
				dialogService.fail(rep.message || "保存失败!");
			}
		})
	}
}

//首页栏目编辑
function sysIndexColumnEditCtrl($scope, dialogService, baseService) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.html = $scope.pageParam.html;
	//自定义选择
	$scope.selectQuery = function() {
		dialogService.page("customDialog",{area:['1120px', '650px'], pageParam:{initData:$scope.data.dataFrom}}).then(function(rep){
			$scope.data.dataFrom = rep[0].alias;
		});
	}
	
	var mixedMode = {
			name: "htmlmixed",
			scriptTypes: [{
				matches: /\/x-handlebars-template|\/x-mustache/i,
				mode: null
			}, {
				matches: /(text|application)\/(x-)?vb(a|script)/i,
				mode: "vbscript"
			}]
		};
	
	$scope.editorOptions = {
		lineWrapping : true,
		lineNumbers: true,
		mode: mixedMode
	};
	
	//查看
	$scope.detail = function(id){
		if(!id) return;
		var url = "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getJson?id="+id;
		baseService.get(url).then(function(rep){
			//解码
			rep.templateHtml = $.base64.decode(rep.templateHtml,"utf-8");
			$scope.data = rep;
		});
	}
	
	$scope.detail($scope.id);
	
	//保存
	$scope.save = function(){
		//编码
		$scope.data.templateHtml = $.base64.encode($scope.data.templateHtml,"utf-8");
		var url = "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/save";
		baseService.post(url, $scope.data).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.close();
				});
			}else{
				dialogService.fail(rep.message || "保存失败!");
			}
		})
	}
	//新增或修改时不能为空
	$scope.isExist = function(){
		if($scope.data.name == undefined || $scope.data.alias == undefined){
			return;
		}else if($scope.data.templateHtml == undefined) {
			dialogService.fail("请填写栏目模板");
			return;
		}else{
			$scope.save();
		}
	}
	
	//参数设置
	$scope.showSetParamDialog = function(){
		dialogService.page('addParams', {alwaysClose: false,width: '40%',pageParam:{initData:$scope.data.dataParam}}).then(function(result){
			$scope.data.dataParam = JSON.stringify(result.result);
			dialogService.close(result.index);
		});
	}
	
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

//首页布局
function sysIndexLayoutTypeCtrl($scope, dialogService, baseService) {
	$scope.operating = function(id, action){
		var title = action == "add" ? "添加首页布局" : action == "edit" ? "编辑首页布局" : "查看首页布局";
		if(action=="add"||action=="edit"){
			dialogService.sidebar("m_portal.sysIndexLayoutListEdit", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
			 $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}else{
			dialogService.sidebar("m_portal.sysIndexLayoutListDetail", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
		}
	}
}

//首页布局编辑
function sysIndexLayoutEditCtrl($scope, dialogService, baseService) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	
	//查看
	$scope.detail = function(id){
		if(!id) return;
		var url = "${portal}/portal/sysIndexLayout/sysIndexLayout/v1/getJson?id="+id;
		baseService.get(url).then(function(rep){
			if(rep.templateHtml!=null){
				rep.templateHtml = $.base64.decode(rep.templateHtml,"utf-8");
			}
			$scope.data = rep;
		});
	}
	
	$scope.detail($scope.id);
	
	//保存
	$scope.save = function(){
		$scope.data.templateHtml = $.base64.encode($scope.data.templateHtml,"utf-8");
		var url = "${portal}/portal/sysIndexLayout/sysIndexLayout/v1/save";
		baseService.post(url, $scope.data).then(function(rep){
			if(rep || rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.close();
				});
			}else{
				dialogService.fail(rep.message || "保存失败!");
			}
		})
	}
	//新增或修改时不能为空
	$scope.isExist = function(){
		if($scope.data.name == undefined || $scope.data.sn == undefined){
			return;
		}else if($scope.data.templateHtml == undefined) {
			dialogService.fail("请填写模板信息");
			return;
		}else{
			$scope.save();
		}
	}
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

//首页工具
function sysIndexToolsTypeCtrl($scope, dialogService,baseService) {
	$scope.operating = function(id, action){
		var title = action == "edit" ? "编辑首页工具" : action == "add" ? "添加首页工具" : "查看首页工具";
		if(action=="edit"||action=="add"){
			dialogService.sidebar("m_portal.sysIndexToolsListEdit", {bodyClose: false, width: '55%', pageParam: {id:id, title:title}});
			 $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}else{
			dialogService.sidebar("m_portal.sysIndexToolsListDetail", {bodyClose: false, width: '30%', pageParam: {id:id, title:title}});	
		}
	}
	//授权
	$scope.setAuth = function(id){
		var objType = 'indexTools';
		var conf={
			id:id,
			objType:objType
		 }
		dialogService.page("index-auth", {
		    title:'授权页面',
		    pageParam:{data:conf},
		}).then(function(data){
			$scope.saveRights(id,objType,data)
		});
	}
	
	//保存权限人员
	$scope.saveRights = function(id,objType,ownerNameJson){
		var params = {
			id : id,
			objType:objType,
			ownerNameJson : JSON.stringify(ownerNameJson)
		};
		var url = "${portal}/sys/authUser/v1/saveRights";
		baseService.post(url,params).then(function(rep){
			if(rep || rep.state){
				dialogService.success(rep.message);
			}else{
				dialogService.fail(rep.message || "保存失败!");
			}
		})
	}
}

function indexAuthDialogCtrl($scope, baseService, dialogService,ArrayToolService) {
	
	$scope.ArrayTool = ArrayToolService;
	var defaulType = [
	    {
	    	type:"everyone",
	    	title:"所有人",
	    	currentProfile:"",
	    	checked:false
	    },
	    {
	    	type:"user",
	    	title:"用户",
	    	id:"",
	    	name:false
	    },
	    {
	    	type:"org",
	    	title:"组织",
	    	id:"",
	    	name:false
	    },
	    {
	    	type:"pos",
	    	title:"岗位",
	    	id:"",
	    	name:false
	    },
	    {
	    	type:"role",
	    	title:"角色",
	    	id:"",
	    	name:false
	    }
	]

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.formSelectArr;
	}
	
	if($scope.pageParam.data.id && $scope.pageParam.data.objType){
		//是否显示需要配置项目。
		$scope.showNeedRight=true;
		var url = "${portal}/sys/authUser/v1/getRights?id="+$scope.pageParam.data.id+"&objType="+$scope.pageParam.data.objType;
		baseService.get(url).then(function(rep){
			//初始化。
			$scope.right = rep;
			$scope.init();
		})
	}
	
	
	$scope.init=function(){
	
		var needSetting=[];
		//不需要配置
		var noNeedSetting=[];
		for(var i=0;i<defaulType.length;i++){
			var obj=defaulType[i];
			var type=obj.type;
			var objRight=getRight($scope.right,type);
			if(objRight){
				objRight.title=obj.title;
				if(objRight.type=="everyone" || objRight.type=="none"){
					objRight.checked=true;
					$scope.showNeedRight=false;
					noNeedSetting.push(objRight);
				}
				else{
					needSetting.push(objRight);
				}
			}
			else{
				if(obj.type=="everyone" || obj.type=="none"){
					obj.checked=false;
					noNeedSetting.push(obj);
				}
				else{
					obj.id="";
					obj.name="";
					needSetting.push(obj);
				}
			}
		}
		$scope.needSetting=needSetting;
		$scope.noNeedSetting=noNeedSetting;
	}
	
	function getRight(aryRights,type){
		if(!$scope.right || $scope.right.size==0) return null;
		
		for(var i=0;i<aryRights.length;i++){
			var obj=aryRights[i];
			if(obj.type==type){
				return obj;
			}
		}
		return null;
	}
	
	
	/**
	 * 在点击不需要配置的选项，确定是否显示配置块。
	 */
	$scope.checkNoSetting=function(event,item){
		var target=event.currentTarget;
		var checked=target.checked;
		item.checked=checked;
		
		var noNeedChecked=true;
		
		for(var i=0;i<$scope.noNeedSetting.length;i++){
			var obj=$scope.noNeedSetting[i];
			if(checked){
				if(obj!=item){
					obj.checked=false;
				}
				noNeedChecked=false;
			}
		}
		$scope.showNeedRight=noNeedChecked;
	}
	
	/**
	 * 返回数据。
	 * 返回格式如：
	 * [{"type":"everyone"},{type:"user",id:"1,2",name:"ray,tom"]
	 */
	$scope.pageSure=function(){
		var rtn=[];
		//everyone,none
		for(var i=0;i<$scope.noNeedSetting.length;i++){
			var obj=$scope.noNeedSetting[i];
			if(obj.checked){
				rtn.push(obj);
				return rtn;
			}
		}
		var setting=$scope.needSetting;
		for(var i=0;i<setting.length;i++){
			var obj=setting[i];
			//设置了值。
			if(obj.id){
				rtn.push(obj);
			}
		}
		return rtn;
	}
	
	
	

	/**
	 * 组选择器的对话框事件。
	 * 这个可以扩展对话框。
	 * item 结构如下：
	 * {type:"user",id:"1,2,3",name:"ray,tom,green"}
	 */
	$scope.dialog = function(item) {
			var type=item.type;
			eval(type + "Dialog(item);");
	};
	
	/**
	 * 重置。
	 */
	$scope.reset=function(item){
		item.id="";
		item.name="";
	}

	
	/**
	 * 用户选择器
	 */
	function userDialog(item) {
			var initData=[];
			if(item.id) {
				var aryId=item.id.split(",");
				var aryName=item.name.split(",");
				for(var i=0;i<aryId.length;i++){
					var obj={"id":aryId[i],"fullname":aryName[i]};
					initData.push(obj);
				}
			}
		   var pageParam = {
				 single:false, /*是否单选*/ 
				 data:initData
			};
              dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(data){
				    var name = "";
					var id = "";
					$(data).each(function() {
						if (id) {
							name += ",";
							id += ",";
						}
						name += this.fullname;
						id += this.id;
					});
					item.name = name;
					item.id = id;
			 });
	}
	/**
	 * 角色选择器
	 */
	function roleDialog(item) {
		
		var initData=getInitData(item);
		   var pageParam = {
				 single:false, /*是否单选*/ 
				 data:initData
			};
	         dialogService.page('role-selector', {area:['1000px', '650px'], pageParam: pageParam})
			 .then(function(data){
				  applyByType(data,item);
			 });
	}
	/**
	 * 岗位选择器
	 */
	function posDialog(item) {
		var initData=getInitData(item);
		   var pageParam = {
				 single:false, /*是否单选*/ 
				 data:initData
			};
	         dialogService.page('pos-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(data){
				  applyByType(data,item);
			 });
	}
	/**
	 * 参数 ： item 
	 * 结构为：
	 * {type:"user",id:"1,2,3",name:"ray,tom,mary"}
	 * 返回格式：
	 * [{"id":"1",name:"ray"},{"id":"2","name":"tom"},{"id":"3",name:"mary"}]
	 * 
	 */
	function getInitData(item){
		var rtn=[];
		if(!item.id) return rtn;
		var aryId=item.id.split(",");
		var aryName=item.name.split(",");
		for(var i=0;i<aryId.length;i++){
			var obj={"id":aryId[i],"name":aryName[i]};
			rtn.push(obj);
		}
		return rtn;
	}

	/**
	 * 组织选择器
	 */
	function orgDialog(item) {
		var initData=getInitData(item);
	   var pageParam = {
			 single:false, /*是否单选*/ 
			 data:initData
		};
         dialogService.page('org-selector', {area:['1120px', '650px'], pageParam: pageParam})
		 .then(function(data){
			  applyByType(data,item);
		 });
	}
	
	function applyByType(data,item){
		var name = "";
		var id = "";
		$(data).each(function() {
			if (id) {
				name += ",";
				id += ",";
			}
			name += this.name;
			id += this.id;
		});
		item.name = name;
		item.id = id;
	}
}

function filedDialogCtrl($scope, baseService, dialogService) {
	$scope.setParams = [];
	if($scope.pageParam.initData == undefined){
		$scope.pageParam.initData=[];
	}else{
		try {
			$scope.setParams = eval('(' + $scope.pageParam.initData + ')');;
		} catch (e) {}
	}
	
	//添加参数
	$scope.addParam = function (){
		$scope.setParams.push({name:"",type:"string",mode:"0",value:""});
	}
	
	//删除参数
	$scope.remove = function(param) {
		$scope.setParams.remove(param);
	}
	
	$scope.pageSure = function(){
		return $scope.setParams;
	}
}

//首页工具编辑新增查看
function sysIndexToolsEditCtrl($scope, baseService, dialogService) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;

	//获取详情
	$scope.detail = function(id){
		if(!id) return;
		var url = "${portal}/portal/sysIndexTools/sysIndexTools/v1/getJson?id="+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	
	$scope.detail($scope.id);
	
	//保存事件
	$scope.save = function(){
		if($scope.data.name==null || $scope.data.name==''){
			dialogService.fail("名称不能为空!");
		}else{
		var url = "${portal}/portal/sysIndexTools/sysIndexTools/v1/save";
		baseService.post(url, $scope.data).then(function(rep){
			if(rep || rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.close();
				})
			}else{
				dialogService.fail(rep.message || "保存失败");
			}
		});
		}	
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	//参数设置
	$scope.showSetParamDialog = function(){
		dialogService.page('addParams', {alwaysClose: false,width: '40%',pageParam:{initData:$scope.data.countParam}}).then(function(result){
			$scope.data.countParam = JSON.stringify(result.result);
			dialogService.close(result.index);
		});
	}
	
	//自定义选择
	$scope.selectQuery = function() {
		dialogService.page("customDialog",{area:['1120px', '650px'], pageParam:{initData:$scope.data.counting}}).then(function(rep){
			$scope.data.counting = rep[0].alias;
	});
	}
}	

function customDialogListCtrl($scope, baseService, dialogService) {
	$scope.customDialogSelectArr = [];
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.customDialogSelectArr.push(data);
				angular.forEach($scope.customDialogSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('customDialogSelectArr', item);
				}
			});
		}
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.dataTable.unSelectRow(obj);
	}
	 
	$scope.pageSure = function(){
		 return $scope.dataTable.selectRow();
	}
}

/**
 *
 * Pass all functions into module
 */
angular.module('portal', [])
	.controller('layoutManageSaveCtrl', layoutManageSaveCtrl)
	.controller('layoutManageTypeCtrl', layoutManageTypeCtrl)
	.controller('filedDialogCtrl', filedDialogCtrl)
	.controller('customDialogListCtrl', customDialogListCtrl)
	.controller('sysIndexColumnPreview', sysIndexColumnPreview)
	.controller('sysIndexColumnEditCtrl', sysIndexColumnEditCtrl)
	.controller('sysIndexColumnTypeCtrl', sysIndexColumnTypeCtrl)
	.controller('sysIndexLayoutEditCtrl', sysIndexLayoutEditCtrl)
	.controller('sysIndexLayoutTypeCtrl', sysIndexLayoutTypeCtrl)
	.controller('sysIndexToolsTypeCtrl', sysIndexToolsTypeCtrl)
	.controller('layoutDesignCtrl', layoutDesignCtrl)
	.controller('indexAuthDialogCtrl', indexAuthDialogCtrl)
	.controller('previewCtrl', previewCtrl)
	.controller('sysIndexToolsEditCtrl', sysIndexToolsEditCtrl);