function formDesignListCtrl($scope,baseService,dialogService,$state){
	
    $scope.treeConfig = {
            data: {
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "parentId",
                    rootPId: 0
                }
            }
        };
	
	$scope.treeData = [];
	baseService
	.get("${portal}/sys/sysType/v1/getByParentId?catId=7")
	.then(function(response){
		$scope.treeData = response;
	});

	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});

	$scope.tree_click = function(e, i, n){
		var typeId = n.id;
		$scope.dataTable.addQuery({property: 'typeId', operation: 'equal', value: typeId});
		if("FORM_TYPE"  == n.typeKey ){
			$scope.dataTable.clearQuery("typeId");
		}
		$scope.dataTable.query();
	}

	//编辑或查看 calc(100% - 225px)
	$scope.edit = function(data,action){
		dialogService.sidebar("form.formDesignListAddFormStepOne", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:data.id,action:action,title:"添加表单定义"}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
			// $scope.dataTable.query();//子页面关闭,父页面数据刷新
		});
	}

	//查看数据结构
	$scope.preview = function(formId,formType){
		var param = {};
		param.id = formId;
		if("mobile" == formType){
			dialogService.page('form.formDesignListPreviewMobileDesign', {
                alwaysClose: false,
                area:['350px', '650px'],
                pageParam: param
            }).then(function (r) {
                dialogService.close(r.index);
            });
		}else{
			dialogService.sidebar("form.formDesignListPreviewDesign", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: param});
		}
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		});
	}
	//发布
	$scope.deploy=function(id){
		if(!id) return;
		var url = "${form}/form/form/v1/publish?formId="+id;
		baseService.post(url).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.dataTable.query();
				});
			}
			else{
				dialogService.fail(rep.message || '发布失败');
			}
		},function(rep){
			dialogService.fail('发布失败');
		});
	}
	//修改状态
	$scope.setStatus=function(id,status){
		if(!id) return;
		var url = "${form}/bo/def/v1/setStatus?id="+id+"&status="+status;
		baseService.get(url, $scope.data).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.dataTable.query();
				});
			}
			else{
				dialogService.fail(rep.message || '发布失败');
			}
		});
	}
	
	$scope.editFormDesign = function(formId,formType){
		var obj = {"formId":formId,"formType":formType};
		var result = $.base64.encode(JSON.stringify(obj),"utf-8");
        $state.go("form.formDesignListDesign",{params:result});
	}
	
	$scope.dataTemplate = function(formKey){
		$state.go("form.bpmDataTemplateEdit",{formKey:formKey});
	}
}

/**
 * 添加表单的第一步
 */
function addFormStepOneCtrl($scope,dialogService,$state,baseService){
	
	if($scope.pageParam){
		$scope.id = $scope.pageParam.id;
		$scope.title =  $scope.pageParam.title;
	}
	
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.data = {bos:[],type:"",formType:"pc"};
	
	$scope.selectBO = function(){
		dialogService.page("bo-selector", {pageParam:{single:true}})
        .then(function(result){
            var obj = {id:result[0].id,desc:result[0].description,supportDB:result[0].supportDb}
            $scope.data.bos = [];
            $scope.data.bos.push(obj);
        });
	}
	
	$scope.toFromDesign = function(){
        if($scope.data.type==""||$scope.data.type==undefined){
            dialogService.warn("请选择表单分类").then(function(){
            });
            return;
        }
        if($scope.data.name==""||$scope.data.name==undefined){
            dialogService.warn("请输入表单名称").then(function(){
            });
            return;
        }
        if($scope.data.key==""||$scope.data.key==undefined){
            dialogService.warn("请输入表单别名").then(function(){
            });
            return;
        }
		if($scope.data.bos.length<=0){
			dialogService.warn("请选择一个业务对象").then(function(){
			});
			return;
		}
        var url = "${form}/form/form/v1/checkKey?key="+$scope.data.key;
        baseService.get(url).then(function(rep){
            if(rep){
                 dialogService.fail("KEY【"+$scope.data.key+"】对应的表单已存在");
                 return;
            }else{
                $scope.close();
                $scope.data.bos = JSON.stringify($scope.data.bos);
                var result = $.base64.encode(JSON.stringify($scope.data),"utf-8");
                $state.go("form.formDesignListDesign",{params:result});
			}
        });
	}
}

/**
 * 表单手机预览
 */
function previewMobileDesignCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	if($scope.pageParam){
		//用于预览手机表单的iframe获取数据
		window.__previewPageParam = $scope.pageParam;
		$scope.previewSrc = "../mobile/view/form/preview.html";
	}
}

/**
 * 表单预览
 */
function previewDesignCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	if($scope.pageParam){
		var defer = baseService.post("${form}/form/form/v1/previewDesign",$scope.pageParam);
		defer.then(function(data){
			$scope.formHtml= data.bpmForm.formHtml;
			$scope.data = data.data;
			$scope.permission = data.permission;
		});
	}
	
	$timeout(function(){
		$scope.formHeight = $(window).height() - 190;
	}, 100);
	
	
	$scope.add = function(path){
		var arr = path.split(".");
		if(arr.length<2)alert("subtable path is error!")
		var subTableName = arr[1].replace("sub_","")
		var tempData = $scope.data[arr[0]].initData[subTableName];
		
		if(!tempData)tempData={};
		var ary = eval("$scope.data." + path); 
		if(!angular.isArray(ary)) ary = [];
		
		ary.push(angular.copy(tempData));
		eval("$scope.data." + path+"=ary");
		!$rootScope.$$phase && $rootScope.$digest();
	};
	
	$scope.remove = function(path,index){
		var ary = eval("($scope.data." + path + ")");
		if(ary&&ary.length>0){
			ary.splice(index,1);
		}
	};
	$scope.initSubTableData = function(){
		var initSubTable = [];
		var data = $scope.data;
		$("[type='subGroup'][initdata]").each(function(i,item){
			initSubTable.push($(item).attr("tablename"));
		});
		
		for(var i=0,subTable;subTable=initSubTable[i++];){
			for(var boCode in $scope.data){
				var initData =data[boCode].initData[subTable];
				if(initData &&(!data[boCode]["sub_"+subTable]||data[boCode]["sub_"+subTable].length==0)){
					data[boCode]["sub_"+subTable] = [];
					data[boCode]["sub_"+subTable].push($.extend({},initData));
				}
			}
		}
		!$scope.$$phase&&$scope.$digest();
	}
	
	$scope.showJson = function(){
		var popupDialog =$.popup($("#json"))
	}
	
	$scope.showOrHide = function(id){
		if(id == "pageHtml"){
			$("#"+id).css({"display":"block"});
			$("#dataStr").css({"display":"none"});
		}else{
			$("#"+id).css({"display":"block"});
			$("#pageHtml").css({"display":"none"});
		}
	}
	
	window.setTimeout($scope.initSubTableData,1000);
	
	
	if(window.ngReady){
		window.setTimeout(ngReady,10,$scope);
	}
}

function mathExpEditorCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.scriptTree = {},
	$scope.scriptTypes = [],
	$scope.varTree = {},
	$scope.isSingleRecord = false,
	$scope.curElement = {},
	$scope.parentScope = $scope.pageParam.scope;
	$scope.curElement =   $scope.parentScope.editingField.option?$scope.parentScope.editingField.option.statFun:'';
	
	$(".calTool").bind("mouseenter mouseleave", function() {
		$(this).toggleClass("tool-hover");
	});
	$(".toolbar_btn").bind("mouseenter mouseleave", function() {
		$(this).toggleClass("toolbar_btn_hover");
	});
	
	InitMirror.init(300);
	
	//初始化运算符工具窗口
	function initTools(calTools,t) {
		var tool;
		while (tool = calTools.shift()) {
			var div = document.createElement("div");
			div.title = tool.msg;
			div.innerHTML = tool.title;
			div.className = "calTool";
			div.setAttribute("exp", tool.exp);
			if(tool.step){
				div.setAttribute("step", tool.step);
			}
			div.onclick = tool.clickHandler || clickHandler;
			t.append(div);
		}
	}
	
	function initFieldTree(scope){
		var ztreeCreator = new ZtreeCreator('colstree',"${form}/bo/def/v1/getBOTree")
		.setChildKey("children").setDataKey({idKey:"id",name:"desc",title:"desc"})
		.setCallback({beforeClick:nodeBeforeClick,onClick:zTreeOnClick})
		.initZtree(scope.boIds.join(","),function(treeObj){
				boTreeObject =treeObj 
		 }); 
	}
	
	function nodeBeforeClick(treeId, treeNode, clickFlag){
		if(treeNode.dataType!="number"){
			dialogService.msg('请选择数字类型的字段！');
			return false;
		}
	}
	
	//双击树添加内容到规则表达式
	function zTreeOnClick(event, treeId, treeNode) {
		var isMain = treeNode.getParentNode().nodeType=='main';
		var path="data."+treeNode.path+"."+treeNode.name;
		if(!isMain && $scope.isSingleRecord){
			path = "item."+treeNode.name;
		}
		
		if($scope.isSingleRecord && isMain){
			dialogService.fail("子表中单条记录运算模式下,不能选择主表字段!");
			return;
		}
		
		if($scope.isSingleRecord||isMain){
			var desc ='{'+treeNode.desc+"("+path+")"+'}'
		}
		else{
			var desc ='[{'+treeNode.desc+"("+path+")"+'}]'
		}
		InitMirror.editor.insertCode(desc);
	};
	
	function clickHandler() {
		var exp = $(this).attr("exp");
		InitMirror.editor.insertCode(exp);
		//某些运算符 添加到脚本中以后  需要修改光标所在的位置
		InitMirror.editor.moveCursorPos($(this).attr("step"));
	}

	initTools(MathCaltools.commonTools,$("#tools_comment"));
	initTools(MathCaltools.subTableTools,$("#sub_tools_comment"));
	initFieldTree($scope.parentScope);
	
	$scope.pageSure = function(){
		return InitMirror.editor.getCode();
	}
	
}


/**
 * 自定义脚本
 */
function customScriptDiyCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.diyScript = $scope.pageParam.script? $.base64.decode($scope.pageParam.script,"utf-8"):"";
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	 };
	
	$scope.pageSure = function(){
		return $scope.diyScript;
	}
}

/**
 * 引入脚本和样式
 */
function includdingFileCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.data = $scope.pageParam.includeFiles? $.base64.decode($scope.pageParam.includeFiles,"utf-8"):"{'diyFile':' ','diyCss':' ','diyJs':' '}";
	$scope.data = parseToJson($scope.data);
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	};
	//重新调整高度
	$timeout(function(){
		$("ui-codemirror[ng-model='data.diyFile']").find('.CodeMirror').css('height',"65px");
		$("ui-codemirror[ng-model='data.diyCss']").find('.CodeMirror').css('height',"150px");
		$("ui-codemirror[ng-model='data.diyJs']").find('.CodeMirror').css('height',"150px");
	});
	
	
	$scope.pageSure = function(){
		return $scope.data;
	}
}

/**
 * 业务数据模板
 */
function bpmDataTemplateEditCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $stateParams, $state, dataRightsService){
	service = dataRightsService;
	$scope.btnDisable = {};
	$scope.data = {};
	$scope.data.formKey = $stateParams.formKey;
	$scope.jsonObject = {};
	$scope.defAlias = '';
	baseService.get('${form}/form/dataTemplate/v1/getBpmDataTemplate?formKey='+$scope.data.formKey).then(function(rep){
		$scope.jsonObject = rep;
		if(rep.formId){
			baseService.get('${form}/form/form/v1/getBOCodes?formId='+rep.formId, $scope.data).then(function(boDefCodes){
				if(Array.isArray(boDefCodes)){
					$scope.defAlias = boDefCodes[0];
				}
			});
		}
		service.init($scope);
	});
	
	$timeout(function(){
		if(typeof($scope.data.resetTemp)=='undefined'){
			$scope.data.resetTemp = "0";
		}
	},500);
	$scope.tabs = [
   		{ title: '基本信息', url: 'views/form/bpmDataTemplate/baseSetting.html',active:false },
   		{ title: '显示列字段', url: 'views/form/bpmDataTemplate/displaySetting.html',active:false },
   		{ title: '查询字段', url: 'views/form/bpmDataTemplate/conditionSetting.html',active:false },
   		{ title: '排序字段', url: 'views/form/bpmDataTemplate/sortSetting.html',active:false },
   		{ title: '过滤字段', url: 'views/form/bpmDataTemplate/filterSetting.html',active:false },
   		{ title: '功能按钮', url: 'views/form/bpmDataTemplate/manageSetting.html',active:false }
    ]
	
	$scope._validForm = function (){
		if($scope.dataRightsForm.$invalid) {
			dialogService.fail("表单校验不通过，请检查！");
			return false;
		}
		//判断排序字段太多报错问题
		if($scope.sortFields&&$scope.sortFields.length>3){
			dialogService.fail("排序字段不能设置超过3个，请检查！");
			return false;
		}
		//判断管理字段
		if(service.manageFieldValid($scope.manageFields)){
			dialogService.fail("功能按钮出现重复的类型，请检查！");
			return false;
		}
		return true;
	}
	
	//添加菜单
	$scope.addToMenu = function() {
		var table = $scope.dataTable;
		var params = {alwaysClose: false, area:['650px', '350px'], pageParam: {alias:$scope.data.alias}};
		dialogService.page("templateAddToMenu",params).then(function(rep){
			baseService.post('${portal}/sys/sysMenu/v1/addDataTemplateToMenu', rep.result).then(function(result){
				if(result.state){
					dialogService.success(result.message);
					layer.close(rep.index);
				}else{
					dialogService.fail(result.message);
				}
			});
    	});
	};
	
	var showResponse = function(response){
		if (response.state) {
			dialogService.confirm(response.message+",是否继续操作？").then(function(rtn){
				$state.reload();
			});
		} else {
			dialogService.fail(response.message);
		}
	}
	
	$scope.save = function(){
		if ($scope._validForm()) {
			if(!$scope.data.id){
				$scope.btnDisable.save = true;
			}
			service.customFormSubmit(showResponse);
		}
	}
	
	
	$scope.close = function(){
		$rootScope.back('form.formDesignList');
	}
	
	$scope.selectFlow = function(){
		var initData=[];
		if($scope.data.defId){
			initData.push({'defId':$scope.data.defId,'name':$scope.data.subject})
		}
		dialogService.page("form-bpmDefSelector", {
		    title:'流程选择器',
		    pageParam: {single:true,data:initData,isDataTemplate:true,boCode:$scope.defAlias}
		 }).then(function(def){
			 if(def){
				 $scope.data.defId = def.defId;
				 $scope.data.subject = def.name;
			 }
		 });
	}
	
	//清除绑定流程
	$scope.flowClean = function(){
		$scope.data.defId = '';
		 $scope.data.subject = '';
	}
	
	$scope.preview = function(){
		dialogService.page("form.bpmDataTemplatePreview", {area:['100%', '100%'],pageParam:{'alias':$scope.data.alias,'formKey':$scope.data.formKey}});
	}
	
	$scope.editTemplate = function(){
		dialogService.page("form.templateHtmlEdit", {alwaysClose: false, width: 'calc(100% - 225px)', pageParam:{'id':$scope.data.id}}).then(function(data){
			baseService.post('${form}/form/dataTemplate/v1/saveTemplate?id='+$scope.data.id, data.result.templateHtml).then(function(result){
				if(result.state){
					dialogService.success(result.message);
					layer.close(data.index);
				}else{
					dialogService.fail(result.message);
				}
			});
		});
	}
}


function templateHtmlEditCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.data = {};
	baseService.get('${form}/form/dataTemplate/v1/editTemplate?id='+$scope.pageParam.id).then(function(template){
		if(template){
			$scope.data = template;
		}
	});
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	};
	//重新调整高度
	$timeout(function(){
		$("ui-codemirror[ng-model='data.templateHtml']").find('.CodeMirror').css('height',"460px");
		$("ui-codemirror[ng-model='data.templateHtml']").find('.CodeMirror-gutters').css('height',"460px");
	});
	
	$scope.pageSure = function(){
		return $scope.data;
	}
}

/**
 * 业务数据模板预览
 */
function bpmDataTemplatePreviewCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state){
	$scope.isPreview = true;
	
	var alias = '';
	if(!$scope.pageParam){
		$scope.isPreview = false;
		var hashArray = $state.current.url.split('/');
		alias = hashArray[hashArray.length-1];
	}else{
		alias = $scope.pageParam.alias;
	}
	baseService.post('${form}/form/dataTemplate/v1/dataList_'+alias, {}).then(function(data){
		if(data.state){
			$scope.html = data.value;
		}else{
			$scope.html = data.message;
		}
	});
	
	 //操作按钮
	$scope.operating = function(templateId,id,action){
		var title = action == "edit" ? "编辑" : action=="get"? "查看":"添加";
        //跳转操作页面
		baseService.get('${form}/form/dataTemplate/v1/editTemplate?id='+templateId).then(function(template){
			var params = {title:title,alwaysClose: true,alias:template.alias, width: '75%', pageParam: {alias:template.alias,id:id,formKey:template.formKey,boAlias:template.boDefAlias,action:action}};
			if(action=='get'){
				params = {btn: ['关闭'], title:title, alwaysClose: true,alias:template.alias, width: '75%', pageParam: {alias:template.alias,id:id,formKey:template.formKey,boAlias:template.boDefAlias,action:action}};
			}
			dialogService.page("bpmDataTemplateAdd",params).then(function(){
        		if(action!='get'){
        			$scope.dataTable.query();
        		}
        	});
    	});
    }
	
	$scope.toStartFlow = function(id){
		$state.go("flow.flowListStart",{
			id:id
		});
	}
	
	
	$scope.startFlow = function(defId, boAlias, businessKey){
		var index = layer.load(0, {shade: false});
		baseService.post("${bpmRunTime}/runtime/instance/v1/startForm?defId="+defId+"&businessKey="+businessKey+"&boAlias="+boAlias).then(function(data){
			layer.close(index);
			if(data.state){
				dialogService.success(data.message);
				$scope.dataTable.query();
			}else{
				dialogService.fail(data.message);
			}
		});
	}
	
	$scope.exports = function() {
		var table = $scope.dataTable;
		var params = {btn: ['导出','取消'], alwaysClose: true, width: 'calc(100% - 225px)', pageParam: {formKey:alias,page:table.pageOption,query:table.build()}};
		dialogService.page("bpmDataTemplateExport",params);
	};
	//显示子表记录
	$scope.showSubList = function(alias, refId){
		var params = {btn: ['取消'], alwaysClose: true, width: 'calc(100% - 225px)', pageParam: {alias:alias,refId:refId}};
		dialogService.page("form.bpmDataTemplateSubList",params);
	}
}

function bpmDataTemplateSubListCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $stateParams, $state){
	$scope.tabs = [];
	$scope.alias = $scope.pageParam.alias;
	$scope.refId = $scope.pageParam.refId;
	$scope.data = {};
	$scope.init = function(){
		if($scope.alias &&$scope.refId){
			baseService.get('${form}/form/form/v1/getSubEntsByFormKey?formKey='+$scope.alias).then(function(ents){
				if(ents){
					$scope.AddTabs(ents);
				}
			});
		}
	}
	$scope.AddTabs = function(ents){
		for(var i=0;i<ents.length;i++){
			var attributeList = ents[i].attributeList;
			/*for(var k=0;k<attributeList.length;k++){
				attributeList[k].fieldName = attributeList[k].fieldName.toUpperCase();
			}*/
			var tab = {title: ents[i].comment,active:false,attributeList:attributeList,comment:ents[i].comment};
			getTableData(ents[i]);
			$scope.tabs.push(tab);
		}
	}
	
	function getTableData(ent){
		$scope.data[ent.comment] = [];
		baseService.get('${form}/form/dataTemplate/v1/getSubData?alias='+ent.name+'&refId='+$scope.refId).then(function(list){
			if(list){
				$scope.data[ent.comment] = list;
			}
		});
	}
	
}
		


function editDataPreviewCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $state, editDataService, ArrayToolService){
	$scope.service = editDataService;
	$scope.ArrayTool = ArrayToolService;
	$scope.alias = $scope.pageParam.alias;
	$scope.formKey = $scope.pageParam.formKey;
	$scope.boAlias = $scope.pageParam.boAlias;
	$scope.id = $scope.pageParam.id;
	$scope.action = $scope.pageParam.action;
	editDataService.init($scope);
	$scope.add = function(path){
		var arr = path.split(".");
		if(arr.length<2)alert("subtable path is error!")
		var subTableName = arr[1].replace("sub_","")
		var tempData = $scope.data[arr[0]].initData[subTableName];
		
		if(!tempData)tempData={};
		var ary = eval("$scope.data." + path); 
		if(!angular.isArray(ary)) ary = [];
		
		ary.push(angular.copy(tempData));
		eval("$scope.data." + path+"=ary");
		!$rootScope.$$phase && $rootScope.$digest();
	};
	
	$scope.remove = function(path,index){
		var ary = eval("($scope.data." + path + ")");
		if(ary&&ary.length>0){
			ary.splice(index,1);
		}
	};
	
	$scope.initSubTableData = function(){
			var initSubTable = [];
			var data = $scope.data;
			$("[type='subGroup'][initdata]").each(function(i,item){
				initSubTable.push($(item).attr("tablename"));
			});
			
			for(var i=0,subTable;subTable=initSubTable[i++];){
				for(var boCode in $scope.data){
					var initData =data[boCode].initData[subTable];
					if(initData &&(!data[boCode]["sub_"+subTable]||data[boCode]["sub_"+subTable].length==0)){
						data[boCode]["sub_"+subTable] = [];
						data[boCode]["sub_"+subTable].push($.extend({},initData));
					}
				}
			}
			!$scope.$$phase&&$scope.$digest();
			
	}
	
	$scope.pageSure = function(){
		return $scope.action!='get'?{state:$scope.boSave()}:true;
	}
	
	$scope.boSave = function(){
		return editDataService.boSave($scope);
	} 
	
	window.setTimeout($scope.initSubTableData,100);
	
	if(window.ngReady){
		window.setTimeout(ngReady,10,$scope);
	}
	
	showResponse = function(responseText){
		var obj = new com.hotent.form.ResultMessage(responseText);
		if (obj.isSuccess()) {
			$.topCall.confirm("提示信息", obj.getMessage()+",是否继续操作", function(rtn) {
				if(rtn){
					var url=location.href.getNewUrl();
					window.location.href =  location.href.getNewUrl();
				}else{
					$.closeWindow();
				}
			});
		} else {
			$.ligerDialog.error(obj.getMessage(),"提示信息");
		}
	}
}

function bpmDataTemplateExportCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state, ArrayToolService, $http){
	$scope.formKey = $scope.pageParam.formKey;
	$scope.filterKey = $scope.pageParam.filterKey?$scope.pageParam.filterKey:"";
	$scope.query = $scope.pageParam.query;
	$scope.page = $scope.pageParam.page;
	$scope.param = {};
	$scope.bpmDataTemplate = {};
	$scope.ArrayTool = ArrayToolService;
	
	
	baseService.get('${form}/form/dataTemplate/v1/getJson?formKey='+$scope.formKey).then(function(data){
		$scope.bpmDataTemplate = data;
		$scope.bpmDataTemplate.displayField = parseToJson(data.displayField);
	});
	
	$scope.init = function() {
		$scope.selAllExp=true;
		$scope.param.getType = "page";
	};
	
	$scope.pageSure = function(){
		return $scope.exportData();
	}

	$scope.exportData = function() {
		if(!$scope.param.expField){
			alert("请选择至少一个字段");
			return;
		}
		var expField = $.base64.encode($scope.param.expField,"utf-8");
		var url = getContext().form+'/form/dataTemplate/v1/export?formKey=' + $scope.formKey+'&getType='+$scope.param.getType+'&filterKey='+$scope.filterKey+'&expField='+expField;
		var index = layer.load(0, {shade: false});
		$http({            
			method:'POST',            
			url:url,            
			responseType: "arraybuffer",
			data:$scope.query
		}).success(function ( data )      
			{
				layer.close(index);
				// 这里会弹出一个下载框，增强用户体验            
				var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
				var objectUrl = URL.createObjectURL(blob);//  创建a标签模拟下载            
				var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href",objectUrl);
				$("body").append(aForExcel);
				$(".forExcel").click();
				aForExcel.remove();
		}).error(function(data){
			layer.close(index);
			dialogService.fail(data.message);
		});
	};

	$scope.$on("afterLoadEvent", function(event, data) {
		$scope.bpmDataTemplate.displayField = JSON.parse(data.displayField);
	});
}

function templateAddToMenuCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state, ArrayToolService, $http){
	$scope.data = {templateAlias:$scope.pageParam.alias};
	$scope.menuList = [];
	
	baseService.get('${portal}/sys/sysMenu/v1/getTree').then(function(data){
		varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${portal}/sys/sysMenu/v1/getTree",data).setDataKey({
			name : 'name'
		}).setCallback({
			onClick : $scope.setVariable
		}).makeCombTree("tempTree",455).initZtree({}, -1);
	});
	
	$scope.setVariable = function(event,treeId, node){
		varTree.hideMenu();
		$scope.$apply(function(){
			$scope.parentMenuName = node.name;
			$scope.data.alias = node.alias+'.';
			$scope.data.parentAlias = node.alias;
		});
		
	}
	
	$scope.onChangeAlias = function(){
		var alias = $scope.data.alias;
		if(!isMenuExist(alias)){
			var arr = alias.split(".");
			if(arr.length > 1 && arr[arr.length-1]){
				$scope.data.path = '/'+arr[arr.length-1];
			}else{
				$scope.data.path = '/';
			}
		}
	}
	
	function isMenuExist(alias){
		var isTrue = true;
		$.ajax({
			url:'${portal}/sys/sysMenu/v1/isMenuExistByAlias?alias='+alias,
			type:'GET',
			dataType:'json',
			async:false,
			success:function(data){
				if(data.state){
					isTrue = data.value;
					if(data.value){
						dialogService.fail("该别名已存在，请输入其他别名！");
					}
				}
			}
		})
		return isTrue;
	}
	
	$scope.setActiveParam = function(param,$event){
		var btnOffset =  $($event.target);
		$scope.currentEditParam = param;
		varTree.showMenu($($event.target),btnOffset.position().left+165,btnOffset.position().top+60);
	}
	
	$scope.pageSure = function(){
		if(!$scope.data.parentAlias){
			dialogService.fail("请选择父菜单！");
			return false;
		}
		if(!$scope.data.alias){
			dialogService.fail("请输入别名！");
			return false;
		}
		if(!$scope.data.name){
			dialogService.fail("请输入名称！");
			return false;
		}
		if(!$scope.data.path || $scope.data.path=='/'){
			dialogService.fail("请输入路径！");
			return false;
		}
		if(isMenuExist($scope.data.alias)){
			dialogService.fail("该别名已存在，请输入其他别名！");
			return false;
		}
		return $scope.data;
	}
	
}

function bpmDataTemplateFilterCtrl($scope, $timeout, baseService, dialogService, baseService, ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	var filterInitPoint = false;//过滤条件的中的组件是否初始化的标记
	var filterInitType = null;
	var filterInitSql = null;
	$(function() {
		filterInitPoint=true;
		//得到焦点间接修复codeMirror的在tab切换中的初始化问题
		$scope.$broadcast('CodeMirror', function(CodeMirror) {
			CodeMirror.replaceSelection(" ");
		});
		//要切换到条件脚本才初始化，不然会导致元素的坐标读取错误的问题
		if (!$scope.isEditabled && $scope.data.filterType == 1) {
			$scope.data.filter = $scope.data.filter?$scope.data.filter:JSON.parse("{}");
			$("#ruleDiv").linkdiv({
				data : $scope.data.filter,
				updateContent : updateContent,
				rule2json : rule2json
			});
		} else {
			$("#ruleDiv").linkdiv({
				data : {},
				updateContent : updateContent,
				rule2json : rule2json
			});
		}
	});

	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	};
	
	function getRuleDiv(t) {
		return $("#ruleDiv");
	};
	
	function saveFilterForm(){
		var scope = AngularUtil.getScope();
		if(scope.saveFormValid()){
			if(scope.data.filter.length<1){
				dialogService.warn('您还未添加任何过滤条件！');
				return false;
			}else if(scope.data.filterType != 1&&!scope.data.filter.trim()){//验证过滤条件为SQL或追加SQL时，脚本为必填
				dialogService.fail("请正确填写过滤条件中的SQL语句");
				return false;
			}
			return scope.data;
		}
		return false;
	}
	
	
	$scope.init = function() {
		$scope.data = {};
		$scope.data.filterType = 1;
		$scope.parentScope = $scope.pageParam.scope;
		$scope.metafields = $scope.parentScope.jsonObject.fields;
		$scope.colPrefix = $scope.parentScope.jsonObject.colPrefix;
		$scope.data.filterInitSql = '';//初始化时的脚本
		$scope.isEditabled = true;
		if($scope.parentScope.editFilter){
			$scope.isEditabled = false;
			$scope.data.filter = $scope.parentScope.editFilter.condition;
			$scope.data.filterType = $scope.parentScope.editFilter.type;
			$scope.data.name = $scope.parentScope.editFilter.name;
			$scope.data.key = $scope.parentScope.editFilter.key;
		}
		
		// 获取对应的常量
		baseService.get('${form}/form/dataTemplate/v1/getVarList').then(function(data) {
			$scope.comVarList = data;
		});

	};

	$scope.clickVar = function() {
		$scope.$broadcast('CodeMirror', function(CodeMirror) {
			CodeMirror.replaceSelection($scope.selectVar);
		});
	};
	
	//当改变的脚本类型是初始化的脚本类型时，将过滤脚本设置为初始化时的脚本，否则置空
	$scope.changeFilterType = function(){
		if($scope.data.filterType == $scope.data.filterInitType){
			$scope.data.filter = $scope.data.filterInitSql;
		}else{
			if($scope.data.filterType > 1){
				$scope.data.filter = " ";
			}
		}
	}

	//保存表单时，校验表单是否通过，未通过弹出提示信息。主要是处理当未通过验证的表单不在当前显示的tab时，用户点保存按钮保存不了，也无任何提示。
	$scope.saveFormValid = function(){
		if (!$scope.form.$valid){
			dialogService.fail("表单验证未通过，请检查修改，确认后再提交！");
			return false;
		};
		//key不能重复
		if($scope.isEditabled){
			for(var i=0;i<$scope.parentScope.filterFields.length;i++){
				if($scope.parentScope.filterFields[i].key == $scope.data.key){
					dialogService.fail("Key已被使用，请重新填写！");
					$scope.data.key = "";
					return false;
				}
			}
		}
		// 处理过滤条件
		if ($scope.data.filterType == 1 && filterInitPoint) {
			$scope.data.filter = getData();
		}
		return true;
	}
	
	$timeout(function(){
		if($scope.data.filterType==1){
			$scope.data.filterType = "1";
		}
	})
	
	$scope.pageSure = function(){
		$scope.saveFormValid();
		return $scope.data;
	}
}


function templateCtrlfieldCtrl($scope, $timeout, baseService, dialogService, baseService, ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.field = $scope.pageParam.field;
	$scope.controlTypes = $scope.pageParam.controlTypes;
	
	$scope.changeCustDialog = function(){
		var alias = $scope.field.controlContent.alias;
		if(alias){
			var url = '${form}/form/customDialog/v1/getByAlias?alias=' + alias;
	        baseService.get(url).then(function (customDialog) {
	        	if(customDialog){
	        		$scope.custDialogFields = parseToJson(customDialog.resultfield);
	        	}
	        });
		}
	}
	
	if(!$scope.field.controlContent && ($scope.field.ct == "select" || $scope.field.ct == "radio" || $scope.field.ct == "checkbox")){
		$scope.field.controlContent = [];
	}else if(!$scope.field.controlContent && $scope.field.ct == "dic"){
		$scope.field.controlContent = {};
	}else if($scope.field.controlContent.alias && $scope.field.ct == "customDialog"){
		$scope.changeCustDialog();
	}
	
	$scope.dicConfig={
		key:'typeKey',
		url:"${portal}/sys/sysType/v1/getByGroupKey?groupKey=DIC",
		treeConf:{pIdKey: "parentId"},
	    hideRoot: false
	}
	
	$scope.pageSure = function(){
		return $scope.field;
	}
	
}

/**
 *
 * Pass all functions into module
 */
angular
.module('formDesign', ['eip'])
.controller('formDesignListCtrl', formDesignListCtrl)
.controller('addFormStepOneCtrl', addFormStepOneCtrl)
.controller('previewDesignCtrl', previewDesignCtrl)
.controller('mathExpEditorCtrl', mathExpEditorCtrl)
.controller('customScriptDiyCtrl', customScriptDiyCtrl)
.controller('includdingFileCtrl', includdingFileCtrl)
.controller('bpmDataTemplateEditCtrl', bpmDataTemplateEditCtrl)
.controller('bpmDataTemplatePreviewCtrl', bpmDataTemplatePreviewCtrl)
.controller('templateHtmlEditCtrl', templateHtmlEditCtrl)
.controller('editDataPreviewCtrl', editDataPreviewCtrl)
.controller('bpmDataTemplateExportCtrl', bpmDataTemplateExportCtrl)
.controller('templateAddToMenuCtrl', templateAddToMenuCtrl)
.controller('bpmDataTemplateFilterCtrl', bpmDataTemplateFilterCtrl)
.controller('previewMobileDesignCtrl', previewMobileDesignCtrl)
.controller('templateCtrlfieldCtrl', templateCtrlfieldCtrl)
.controller('bpmDataTemplateSubListCtrl', bpmDataTemplateSubListCtrl);
