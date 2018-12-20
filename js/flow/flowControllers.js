/**
 * 流程导入控制器
 * @returns
 */
function flowImportCtrl($scope,dialogService,baseService, FileUploader,$q){
	var type = $scope.pageParam.type;
	var	max = $scope.pageParam.max;
	var	size = Number($scope.pageParam.size);
	var showCountMessage=false;
	var sameOrigin = true;
	var url = window.getContext().bpmModel+"/flow/def/v1/importSave";
	var uploader = $scope.uploader = new FileUploader({
		url : url
	});
	
	if (max && typeof max == 'number') {
		//上传文件数目上限过滤器
		uploader.filters.push({
			name : 'countFilter',
			fn : function(item, options) {
				var result = this.queue.length < max;
				if(!result && !showCountMessage ){
					showCountMessage=true;
					 showMessage("最多只能上传" + max + "个文件");
				};
				return result;
			}
		});
	}
	if (type) {
		type = type.replace(/,/g, '\|');
		var reg = new RegExp("^.*.(" + type + ")$");
		//上传文件的文件类型过滤器
		uploader.filters.push({
			name : 'typeFilter',
			fn : function(item, options) {
				var result = reg.test(item.name);
				!result && (showMessage("文件类型只能是" + type));
				return result;
			}
		});
	}
	if (size && typeof size == 'number') {
		var realSize = size * 1024 * 1024;
		//上传文件的大小过滤器 
		uploader.filters.push({
			name : 'sizeFilter',
			fn : function(item, options) {
				var result = item.size <= realSize;
				!result && (showMessage("单个文件大小不能超过" + size + "M"));
				return result;
			}
		});
	}


	$scope.pageSure = function(){
		var deferred = $q.defer();
		if(uploader.getNotUploadedItems().length ==0) dialogService.warn("请先选择要导入的zip文件");
		 uploader.onSuccessItem = function(fileItem, response, status, headers) {
		    	deferred.resolve(response);
		    };
		    
		uploader.uploadAll();
		return deferred.promise;
	}
}

/**
 * 流程定義列表控制器
 * @returns
 */
function flowListCtrl($scope,baseService,dialogService,$state,context){
	$scope.treeData = [];
	
	$scope.remove = function(key){
    	var url="${bpmModel}/flow/var/v1/remove?defId="+$scope.id+"&varKey="+key;
    	dialogService.confirm("是否确认删除？").then(function(){
    		baseService.remove(url).then(function(rep){
        		if(rep.state){
        			baseService.get(listUrl).then(function(data) {
        				$scope.VarList=data;
                	});
    				if(rep.message)dialogService.success(rep.message);
    			}else{
    				dialogService.fail(rep.message);
    			}
    		});
    		});
     }
	
	$scope.treeConfig = {
			data: {
				simpleData:{
					enable: true,
					idKey: "id",
					pIdKey: "parentId"
				}
			}
	};
	
	$scope.flowTree_click = function(e, i, n){
		var typeId = n.id;
		$scope.dataTable.addQuery({property: 'typeId', operation: 'equal', value: typeId});
		if("FLOW_TYPE"  == n.typeKey ){
			$scope.dataTable.clearQuery("typeId");
		}
		//执行列表查询
		$scope.dataTable.query();
	}
	
	baseService.get("${portal}/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE").then(function(data) {
		$scope.treeData = data;
	})
	
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});
	
	$scope.tree_click = function(e, i, n){
		$scope.dataTable.addQuery({property: 'categoryId', operation: 'equal', value: n.id});
		$scope.dataTable.query();
	}
	$scope.edit = function(data,action){
		var title = action == "edit" ? "设置流程"  : "新增流程";
		$state.go("flow.flowListEdit",{
			id:data.id
		});
	}
	
	$scope.startFlow = function(id){
		$state.go("flow.flowListStart",{
			id:id
		});
	}
	
	//清除数据
	$scope.cleanData = function(defId){
		dialogService.confirm('此操作会清除该流程所有的实例任务等数据，是否确认清除？').then(function(){
			baseService.post("${bpmModel}/flow/def/v1/cleanData?defId="+defId,{}).then(function(data) {
				if(data.state){
					dialogService.success(data.message);
				}else{
					dialogService.fail(data.message);
				}
			})
		})
	
	}
	
	function getSelectKeys(key){
		   if (!$scope.dataTable.hasSelectedRow()) {
	             dialogService.fail("请选择的数据!");
	             return;
	        }
		   var ids=[];
	       for (var i = 0, c; c = $scope.dataTable.rows[i++];) {
		       	if(c.isSelected){
		       		ids.push(c[key]);
		       	}
	       }
	       return ids.join(',');
	}
	
	$scope.handExport= function() {
		var defIds= getSelectKeys("id");
		if (!defIds) {
			dialogService.warn( '请选择至少一项记录');
			return;
		}
		var contexts = context();
		var bpmModel=contexts.bpmModel;
		var url =bpmModel+ "/flow/def/v1/exportXml?bpmDefId="+defIds;
		document.location.href=url;
	}
	
	$scope.handImport= function() {
		var conf ={max:1,size:1,type:"zip"}; 
		dialogService.page("flow-import", {area:['800px', '480px'],btn: ['导入','取消'],alwaysClose:false,pageParam: conf})
		 .then(function(data){
			 if(data && data.result){
				 if(data.result.state){
					 dialogService.success("导入成功").then(function() {
							dialogService.close(data.index);
							$scope.dataTable.query();
						})
				 }else{
					 dialogService.fail(data.message); 
				 }
			 }else{
				 dialogService.fail("导入失败"); 
			 }
			 
		 });
	}
	
}

/**
 * 流程编辑控制器
 * @returns
 */
function flowEditCtrl($scope,$stateParams,$state, dialogService, baseService) {
	$scope.data = {};
	$scope.id = $stateParams.id;
	$scope.topDefKey='';
	$scope.subFlowDefId ='';
	$scope.title = "";
	$scope.active = 0;
	$scope.editorSrc = "bpm-editor/modeler.html";
	$scope.isShowSubSetting=false;
	$scope.bpmModelSrc = window.getContext().bpmModel;

	$scope.sources = {
			editorSrc: "",
			settingSrc: "",
			variableSrc: "",
			versionSrc: "",
			otherSrc: ""
	};
	
	// 流程编辑页签懒加载
	$scope.select = function(t){
		switch(t){
			case "editor":
				$scope.sources.editorSrc = $scope.editorSrc;
				break;
			case "setting":
				$scope.sources.settingSrc = "views/flow/flowConfig.html";
				break;
			case "variable":
				$scope.sources.variableSrc = "views/flow/flowVarList.html";
				break;
			case "version":
				$scope.sources.versionSrc = "views/flow/flowVersionList.html";
				break;
			case "other":
				$scope.sources.otherSrc = "views/flow/flowOtherSetting.html";
				break;
		}
	}
	
	
	$scope.$on('showSubFlowSetting', function(event, data){
		if($scope.subFlowDefId !=''){
	        dialogService.confirm("之前子流程设置页面未保存的内容会丢失，是否确认重新打开").then(function(){
	        	$scope.subFlowDefId=data.defId;
	    		$scope.topDefKey=data.topDefKey;
	    		$scope.sources.subSettingSrc='views/flow/flowConfig.html?'+Math.random();
	    		$scope.isShowSubSetting=true;
	    		$scope.active = 5;
            });
		}else{
			$scope.subFlowDefId=data.defId;
    		$scope.topDefKey=data.topDefKey;
    		$scope.sources.subSettingSrc='views/flow/flowConfig.html?'+Math.random();
    		$scope.isShowSubSetting=true;
    		$scope.active = 5;
		}
	  });
	
	$scope.$on('closeSubFlowSetting', function(event, data){
			$scope.subFlowDefId='';
    		$scope.topDefKey='';
    		$scope.sources.subSettingSrc='';
    		$scope.isShowSubSetting=false;
    		$scope.active = 1;
	  });
	
	//流程是否未发布
	$scope.notDeploy = false;
	var w = angular.element(window); 
	$scope.iboxHeight = w.height() - 215;
    w.on('resize', function() {
    	$scope.iboxHeight = w.height() - 215;
    	$scope.$apply();
    });
	
	if($scope.id){
		$scope.editorSrc += "?defId="+$scope.id;
		$scope.title="设置流程";
		var url="${bpmModel}/flow/def/v1/defGet?defId="+$scope.id;
		baseService.get(url).then(function(data) {
			if(data && data.status =="draft"){
				$scope.notDeploy = true;
			}else{
				// 编辑已发布流程时默认显示 配置页
				$scope.active = 1;
			}
		})
	}else{
		$scope.title="新增流程";
		$scope.notDeploy = true;
	}
	
	//关闭
	$scope.close = function(){
		$state.go("flow.flowList");
	}
	
	$scope.$on('flowDesignMsg', function(event, data){
		if(data.state =='suc'){
			if(!$scope.id && data.message.defId){
					$scope.editorSrc += "?defId="+data.message.defId;
					$scope.select('editor');
					$scope.id=data.message.defId;
				
			}
			if(data.message.dep)$scope.notDeploy=false;
			!$scope.$$phase && $scope.$apply();
			dialogService.success(data.message.message?data.message.message:data.message);
		}else if(data.state =='fail'){
			dialogService.fail(data.message);
		}else{
			dialogService.warn(data.message);
		}
	  });
	  
	$scope.isCanEdit = function(){
		if($scope.notDeploy) dialogService.warn("流程还未发布，无法进行设置");
	}
	
}


/**
 * 流程历史版本列表控制器
 * @returns
 */
function flowVersionListCtrl($scope,baseService,dialogService){
	$scope.hisVersionDefDetail = function(id){
		dialogService.page("flow-hisVersionDetail", {pageParam:{id:id}})
	}
}

/**
 * 流程版本详情控制器
 * @returns
 */
function flowHisVersionDetailCtrl($scope,baseService,dialogService){
	$scope.data={};
	$scope.defId = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
}
/**
 * 流程变量列表控制器
 * @returns
 */
function flowVarListCtrl($scope,baseService,dialogService){
	$scope.VarList=[];
	var listUrl="${bpmModel}/flow/var/v1/listJson?defId=" + $scope.id+"&nodeId=";

	baseService.get(listUrl).then(function(data) {
		$scope.VarList=data;
	});
	 //操作按钮
    $scope.operating = function(key,action){
        var title = action == "edit" ? "编辑流程变量" : "添加流程变量";
        //跳转操作页面
        dialogService.sidebar("flow.flowVarEdit", {bodyClose: false, width: '30%', pageParam: {id:$scope.id,varKey:key,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
        	baseService.get(listUrl).then(function(data) {
        		$scope.VarList=data;
        	});
        });
    }
    
    $scope.remove = function(key){
    	var url="${bpmModel}/flow/var/v1/remove?defId="+$scope.id+"&varKey="+key;
    	dialogService.confirm("是否确认删除？").then(function(){
    		baseService.remove(url).then(function(rep){
        		if(rep.state){
        			baseService.get(listUrl).then(function(data) {
        				$scope.VarList=data;
                	});
    				if(rep.message)dialogService.success(rep.message);
    			}else{
    				dialogService.fail(rep.message);
    			}
    		});
    		});
    }
}

/**
 * 流程变量编辑控制器
 * @returns
 */
function flowVarEditCtrl($scope,baseService,dialogService){
	$scope.data={bpmVariableDef:{isRequired:"false",dataType:"string"}};
	$scope.varKey = $scope.pageParam.varKey;
	$scope.defId = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	var isAdd=false;
	$scope.close = function(){
        dialogService.closeSidebar();
    }
	$scope.$on('afterLoadEvent', function(event, data){//添加监听事件,监听子页面是否关闭
		if(data && !data.bpmVariableDef) {
			$scope.data.bpmVariableDef={dataType:"string"};
			isAdd=true;
		}
		if($scope.data.bpmVariableDef.required){
			$scope.data.bpmVariableDef.required="true";
		}else{
			$scope.data.bpmVariableDef.required="false";
		}
		
    });
	
	$scope.save = function(){
		var param={
				variableDef:$scope.data.bpmVariableDef,
				isAdd:isAdd,
				defId:$scope.defId
		}
		baseService.post("${bpmModel}/flow/var/v1/save",param).then(function(data) {
			if(data.state){
				dialogService.success((isAdd?"添加":"编辑")+"变量成功")
				$scope.close();
			}else{
				dialogService.fail(data.message)
			}
		});
    }
   
}
/**
 * 流程其他设置控制器
 * @returns
 */
function flowOtherSettingCtrl($scope,baseService,dialogService,context,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.editorConfig = {
			toolbars : [['source']],
			initialFrameHeight:150,
			focus : true
		};
    var msgType=context().defaultMsgType;
	var url = '${bpmModel}/flow/def/v1/getOtherParam?defId='+$scope.id;
	$scope.prop = {
		notifyType : ''
	};
	
	baseService.get(url).then(function(data) {
		data.defId = $scope.id;
		//如果没有设置通知类型。取用默认的
		if(!data.prop.notifyType)data.prop.notifyType=msgType;
		$scope.prop = data.prop;
		$scope.handlerTypes=data.handlerTypes;
		$scope.skipConditionList=data.skipConditionList;
	});

	$scope.save = function() {
		var param={
				bpmProp:$scope.prop,
				description:$scope.prop.description,
				defId:$scope.id
		}
		baseService.post('${bpmModel}/flow/def/v1/saveProp', param).then(function(data) {
			if (data.state) {
				dialogService.success(data.message);
			} else {
				dialogService.fail(data.message);
			}
		});
	}
	
	$scope.setEndNotify = function(){
		dialogService.page('flow-endNotify',{area:['900px', '520px'], pageParam: {defId:$scope.id}}).then(function(result){
			if(result){
				var url = "${bpmModel}/flow/plugins/v1/procNotifySave?defId="+result.defId;
				baseService.post(url,result.procNotifyJson).then(function(data){
		        	if(data.state){
		        		dialogService.success("抄送配置成功!");
		        	}else{
		        		dialogService.fail(data.message); 
		        	}
				});
			}
		});
	}
	
}

function procNotifyController($scope, baseService, dialogService, $stateParams){
	$scope.defId = $scope.pageParam.defId;
	$scope.procNotifyList = [];
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerList = rep;
	});
	
	baseService.get('${bpmModel}/flow/plugins/v1/procNotifyEdit?defId='+$scope.defId).then(function(data) {
		if(data){
			$scope.procNotifyList = parseToJson(data);
		}
	});
	
	$scope.pageSure = function(){
		return {defId:$scope.defId,procNotifyJson:$scope.procNotifyList};
	}
	
	$scope.addLine=function(){
		var procNotify = {"userAssignRules":[],"msgTypes":""};
		$scope.procNotifyList.push(procNotify);
	}
	$scope.deleteLine=function(index){
		var list=$scope.procNotifyList;
		if(list.length <=1){
			$.topCall.toast("提示信息","请至少保留一个");
			return ;
		}
		removeObjFromArr(list,index);
	}
	
	
	//用户规则选择
	$scope.addUserCondition=function(index,userRulesIndex){
		if(userRulesIndex == undefined){
			var userRule = null;
		}else{
			var userRule = $scope.procNotifyList[index].userAssignRules[userRulesIndex];
		}
		var conf = {userRule:userRule,defId:$scope.defId};
		var dialog;
		var title ="人员条件配置";
		dialogService.page("flow-nodeUserCondition", {
			pageParam:{passConf:conf},
		    title:title,
		    alwaysClose:false
		}).then(function(r){
			 if(r.result.calcs){
				var userRuleList = $scope.procNotifyList[index].userAssignRules; 
				if(userRulesIndex != undefined){
					$scope.procNotifyList[index].userAssignRules[userRulesIndex] = r.result; 
				}else if(userRuleList && userRuleList.length > 0){
					userRuleList.push(r.result); 
				}else {
					var userRuleList = [];
					userRuleList.push(r.result);
					$scope.procNotifyList[index].userAssignRules = userRuleList;
				}  
				dialogService.close(r.index);
			 }
		 });
		
	}
	
	///删除行
	$scope.deleteAttr=function(index,userRuleIndex){
		 var aa = $scope.procNotifyList[index].userAssignRules;
		 removeObjFromArr(aa,index);
	}
}


/**
 * 流程配置控制器
 * @returns
 */
function flowConfigCtrl($scope,baseService,dialogService,context,ArrayToolService,$parse){
	$scope.ArrayTool = ArrayToolService;
	$scope.flowImageHeader = "流程图";
	if($scope.subFlowDefId !='')$scope.id=$scope.subFlowDefId;
    var msgType=context().defaultMsgType;
	var url = '${bpmModel}/flow/node/v1/getDefSetting?defId='+$scope.id+"&topDefKey="+$scope.topDefKey;
	var w = angular.element(window);
	// 动态计算高度 pageParam
	$scope.calcHeight = function(){
		var wh = w.height();
		
		$scope.dynamicHeight = {
				flowCanvas: wh - 265,
				basicSetting: wh - 488,
				moreSetting: wh - 532
		};
	}
	$scope.calcHeight();
    w.on('resize', function() {
    	$scope.calcHeight();
    	$scope.$apply();
    });
    
	/**
	 * 记录父流程定义KEY和节点ID。
	 */
	$scope.bpmModel=context().bpmModel;
	$scope.initData={};
	$scope.userSetActive=true;
	$scope.flowCanvasStyle = {};
	
	// 更新表单设置内容
	$scope.updateFormValue = function(path, value){
		var setter = $parse(path).assign;
		setter($scope, value);
	}
	
	var nodeDefService = {
    	pluginConf: [
    	              {name:'会签节点规则',key:"sign-config",supprotType:'signtask'},
			          {name:'设置跳转规则',key:"node-rules",supprotType:'usertask,signtask'},
			          {name:'事件脚本设置',key:"event-script",supprotType:'usertask,signtask,start,end'},
			          {name:'分支条件设置',key:"exclusive-gateway",supprotType:'inclusivegateway,exclusivegateway'},
			          {name:'自动任务设置',key:"auto-service",supprotType:'servicetask'},
			          {name:'催办设置',key:"task-reminder",supprotType:'usertask,signtask'},
			          {name:'子流程设置',key:"call-activity",supprotType:'callactivity'},
					],
    		
		//选择用户
		addNodeUserCondition:function(scope,nodeType, nodeId, i,name){
    			var nodeJsonArray = scope.nodeUserMap[nodeId];
    			var conf ={};
    			if (i != undefined) {
    				conf.userRule = angular.copy(nodeJsonArray[i]);
    				conf.userRule.nodeType = nodeType;
    			}
    			conf=angular.extend(conf,{nodeType:nodeType,nodeId:nodeId,defId:$scope.id})
    			var dialog;
    			var title ="【"+name+"】节点人员设置";
    			dialogService.page("flow-nodeUserCondition", {
    				pageParam:{passConf:conf},
    			    title:title,
    			    alwaysClose:false
    			}).then(function(r){
    				 if(r.result.calcs){
    						if (i != undefined) {
								nodeJsonArray[i] = r.result;
							} else if (nodeJsonArray) {
								nodeJsonArray.push(r.result);
							} else {
								var userRules = [];
								userRules.push(r.result);
								scope.nodeUserMap[nodeId] = userRules;
						  }
    					  dialogService.close(r.index);
    				 }
    			 });
    		},
    		//设置节点按钮
    		editBtns: function(nodeId,scope){
    			dialogService.page("flow-nodeBtnSetting", {
    				pageParam:{defId:scope.id,nodeId:nodeId},
    			    title:'设置按钮'+nodeId,
    			    btn: ['保存','取消'],
    			    alwaysClose:false
    			}).then(function(r){
    				 if(r){
    					var returnData= r.result;
    					if(returnData.state){
    						dialogService.success("保存成功");
    						dialogService.close(r.index)
    						scope.nodeBtnMap[nodeId] = returnData.value;
    					}else{
    						dialogService.fail(returnData.message);
    					}
    				 }
    			 });
    		},
    		setRestFul: function(scope,nodeId,nodeName){
    			var confData =  [];
    			confData.nodeId = nodeId;
    			try {
    				if(nodeId==null){
    					confData.restful = scope.bpmDefSetting.globalRestfuls;
    					confData.nodes = scope.nodes;
    				}else{
    					confData.restful = scope.nodeRestfulMap[nodeId];
    				}
				} catch (e) {}
				
    			var title = "全局事件设置";
    			if(nodeId){
    				title = "节点【"+nodeName+"】事件设置";
    			  }
				 dialogService.sidebar("flow-nodeEventSetting", {bodyClose: false, width: '800px', pageParam:{title:title ,passConf :confData }});
				 scope.$on('nodeEventSettingSave', function(e,data){//添加监听事件,监听子页面是否关闭
					  if (!data||data=='validateError') return;
					  if( data.nodeId){
						 if(nodeId ==data.nodeId)	scope.nodeRestfulMap[nodeId] = data.list;
						}else{
							scope.bpmDefSetting.globalRestfuls = data.list;
						}
			      });
    			
    		}
      }
	
	baseService.get(url).then(function(data){
		if(data){
			if($scope.subFlowDefId !='') $scope.flowImageHeader='子流程图('+data.initData.bpmDefinition.name+')';
			$scope.initData=data.initData;
			if(!data.nodeSetData.bpmDefSetting.globalForm)data.nodeSetData.bpmDefSetting.globalForm ={type:'INNER',formType:'pc'};
			if(!data.nodeSetData.bpmDefSetting.globalMobileForm)data.nodeSetData.bpmDefSetting.globalMobileForm ={type:'INNER',formType:'mobile'};
			if(!data.nodeSetData.bpmDefSetting.instForm)data.nodeSetData.bpmDefSetting.instForm ={type:'INNER',formType:'pc'};
			if(!data.nodeSetData.bpmDefSetting.instMobileForm)data.nodeSetData.bpmDefSetting.instMobileForm ={type:'INNER',formType:'mobile'};
			
			$scope.bpmDefSetting = data.nodeSetData.bpmDefSetting;
			$scope.nodes = data.nodeSetData.nodes;
			$scope.nodeUserMap = data.nodeSetData.nodeUserMap;
			$scope.nodeBtnMap = data.nodeSetData.nodeBtnMap;
			$scope.nodeScriptMap = data.nodeSetData.nodeScriptMap;
			$scope.nodeRestfulMap = data.nodeSetData.nodeRestfulMap;
			
			$scope.isEditAllNode_forms = false;
			$scope.isEditAllNode_btns = false;
			$scope.isEditAllNode_nodeUser = false;
			$scope.pluginList = nodeDefService.pluginConf;
			$scope.$root.$broadcast('afterLoadEvent',$scope.initData.messageTypelist);// 发布加载事件用于给用户自定义操作
			
			var bpmModelCtx = context().bpmModel;
			
			var backgroundUrl = "url('"+bpmModelCtx+"/flow/def/v1/image?defId="+$scope.id+"&bpmnInstId=&taskId=') no-repeat";
			$scope.flowCanvasStyle = {
		    		position:"relative",
		    		background: backgroundUrl,
		    		width: $scope.initData.bpmDefLayout.width,
		    		height: $scope.initData.bpmDefLayout.height
		    };
		}
	});
	baseService.get("${bpmModel}/flow/node/v1/getNodes?defId="+$scope.id).then(function(data){
		$scope.selectNodeList=[];
		if(!data) return;
		$(data).each(function(){
			if(this.type=='signTask'||this.type=='userTask'){
				$scope.selectNodeList.push(this);
			}
		});
	});
	
	/**
	 * 保存设定。
	 */
	$scope.save = function(){
		var tempJson = angular.copy($scope.bpmDefSetting);
		delete tempJson.nodeForms;
		
		tempJson.parentDefKey=$scope.topDefKey;
		
		var param ={defSettingJson: angular.toJson(tempJson),
				    userJson:angular.toJson($scope.nodeUserMap),
				    restfulJson:angular.toJson($scope.nodeRestfulMap),
					defId:$scope.id,
					topDefKey:$scope.topDefKey
		};
		baseService.post("${bpmModel}/flow/node/v1/saveDefConf",param).then(function(data){
			if(data.state){
				dialogService.success(data.message).then(function(){
					if($scope.subFlowDefId !='')$scope.$root.$broadcast('closeSubFlowSetting');
				});
				$scope.$root.$broadcast('nodeSetUpdate');
			}
			else{
				dialogService.fail(data.message);
			}
		},function(code){
			dialogService.fail("出现异常!code:"+code);
		});
	}
	
	/**
	 * 编辑所有的节点。
	 */
	$scope.editAllNodes = function(name){
		if($scope["isEditAllNode_"+name]){
			$scope["isEditAllNode_"+name] = false;
		}else {
			$scope["isEditAllNode_"+name] = true;
		}
	}
	
	$scope.toEditNode = function(nodeId,nodeName,nodeType){
		if(nodeType)nodeType=nodeType.toLowerCase();
		$scope.edittingNodeId = nodeId;
		$scope.edittingNodeName = nodeName;
		$scope.edittingTitle = '('+nodeName+'-'+nodeId+')';
		$scope.edittingNodeType = nodeType;
		$scope.isEditAllNode_forms = false;
		$scope.isEditAllNode_btns = false;
		$scope.isEditAllNode_nodeUser = false;
		$scope.isEditAllNode_properties = false;
		$scope.isEditAllNode_restful = false;
		
		if("signtask,usertask,start".indexOf(nodeType)== -1){
			$("#pluginstab").click();
		}
	}
	
	$scope.$watch("skipExecutorEmpty_all",function(newVal,oldVal){
		if(newVal!==oldVal){
			for(var i=0,n;n=$scope.nodes[i++];){
				if(n.nodeId == $scope.edittingNodeId || $scope.isEditAllNode_properties){
					$scope.bpmDefSetting.nodePropertieMap[n.nodeId].skipExecutorEmpty=newVal;
				}
			}
		}
	},true);
	
	$scope.checkHandler = function(handler){
		if(!handler) return;
		baseService.get(__ctx+"/flow/node/validHandler?handler="+handler).then(function(data){
			if(data.result!='0'){
				dialogService.fail("接口"+handler+"有误，原因："+data.msg);
			}
		})
	}
	//选择驳回节点
	$scope.selectBackNode = function(value,currentNodeId){
		//弹出节点选择窗口
		DialogUtil.openDialog(__ctx+"/flow/node/condition/sameNodeSelector?defId="+defId, "选择节点", {calc:{nodeId:value,description:""}}, function(data, dialog){
			    $scope.$apply(function(){
			    	  $scope.bpmDefSetting.nodePropertieMap[currentNodeId].backNode=data.nodeId;
			    });
				dialog.dialog('close');
		 
		}, 500, 350)
	
	}
	
	//修改某节点的按钮
	$scope.editBtns = function(nodeId){
		nodeDefService.editBtns(nodeId,$scope);
	}
	$scope.noStart = function(value){
		if(value.type!='start')return true;
		return false;
	}
	
	$scope.initBackMode=function(prop){
		if(!prop.backMode) prop.backMode='direct';
	}
	
	$scope.initBackUserMode=function(prop){
		if(!prop.backUserMode) prop.backUserMode='history';
	}
	
	/**
	 * 修改某节点的某批次的json
	 */ 
	$scope.addNodeUserCondition = function(nodeType, nodeId, i,name) {
		nodeDefService.addNodeUserCondition($scope,nodeType, nodeId, i,name)
	}
	
	/**
	 * 批量勾选:驳回后直接返回
	 */ 
	$scope.toBackModeall = function($event){
		var backMode = "normal";
		if($event.target.checked){
			backMode = "direct";
		}
		var nodes = $scope.nodes;
		if(nodes!=null){
			for(var i=0;i<nodes.length;i++){
				try {
					$scope.bpmDefSetting.nodePropertieMap[nodes[i].nodeId].backMode = backMode;
				} catch (e) {}
				
			}
		}
	}
	
	$scope.setRestFul = function(nodeId,nodeName){
		nodeDefService.setRestFul($scope,nodeId,nodeName);
	}
}

/**
 * 流程节点选择控制器
 * @returns
 */
function flowNodeSelector($scope,baseService,dialogService,ArrayToolService){
	$scope.buttonList = [];
	$scope.buttonNoInitList = [];
	$scope.varKey = $scope.pageParam.varKey;
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	//按钮状态 1.存在的，2，直接新增的，3，添加预定义的按钮。
	$scope.setStatus=function(data,status){
		for(var i=0;i<data.length;i++){
			var obj=data[i];
			obj.status=status;
		}
	};
	
	//0:获取默认初始化的按钮,1:获取配置的按钮,2:获取默认不初始化的按钮
	$scope.getButtons = function(action){
		var get = baseService.post("${bpmModel}/flow/def/v1/getNodeSet?defId="+$scope.defId+"&nodeId="+$scope.nodeId+"&action="+action)
		get.then(function(data){
			if(action==2){
				$scope.setStatus(data,3);
				$scope.buttonNoInitList=data;
			}
			else{
				$scope.setStatus(data,1);
				$scope.buttonList=data;
			}
			if(action==0){
				dialogService.success("初始化成功"); 
			}
			
		},function(data){
			dialogService.fail("error!"+data.message);
		})
	};
	$scope.pageSure = function(){
		if(!$scope.myForm.$valid){
			dialogService.fail("当前编辑按钮表单不合法！");
			return;
		}
		
		var param = {
				nodeId:$scope.nodeId,
				defId:$scope.defId
		 };
		param.btns = $scope.buttonList;
		var btnArr=[]
		for(var i=0,b;b=param.btns[i++];){
			if(b.alias && b.name){
				 delete b.status;
				 btnArr.push(b);
			}
		}
		param.btns=btnArr;
		return baseService.post("${bpmModel}/flow/def/v1/saveNodeBtns",param);
	};
	
	$scope.addButton = function(){
		if(!$scope.myForm.$valid){
			dialogService.fail("请确认当前编辑按钮是否正确！");
			return;
		}
		
		var btn = {name:"",alias:"",status:2,supportScript:true};
		$scope.buttonList.push(btn);
		$scope.btn =btn;
		
		setTimeout(function(){
			$("#divContainer").scrollTop($("#divContainer").height());
		});
		
	};
	
	$scope.changeEditing = function(index){
		if(!$scope.myForm.$valid){
			dialogService.fail("当前编辑按钮表单不合法！");
			return;
		}
		$scope.btn = $scope.buttonList[index];
	};
	$scope.del = function(index){
		if($scope.buttonList[index]==$scope.btn)$scope.btn =false;
		$scope.buttonList.splice(index,1);
	};
	$scope.changeAlias = function(){
		for(var i=0,btn;btn=$scope.buttonList[i++];){
			if(btn.alias==$scope.btn.alias && $scope.btn !== btn){
				dialogService.fail("["+btn.alias+"]按钮alias 不可重复！");
				$scope.btn.alias = "";
				return;
			}					
		}
	};
	
	/**
	 * 判断按钮是否已经存在。
	 */
	$scope.isAliasExist=function(nBtn){
		for(var i=0,btn;btn=$scope.buttonList[i++];){
			if(btn.alias==nBtn.alias && $scope.btn !== btn){
				return true;
			}					
		}
		return false;
	};
	
	$scope.changeButtonType=function(obj){
		if(obj.alias){
			var rtn=$scope.isAliasExist(obj);
			if(rtn){
				obj.alias="";
				return;
			}
			obj.status=3;
			obj.name=$scope.getName(obj.alias);
		}
		else{
			obj.status=2;
		}
	};
	
	$scope.getName=function(alias){
		for(var i=0;i<$scope.buttonNoInitList.length;i++){
			var obj=$scope.buttonNoInitList[i];
			if(alias==obj.alias){
				return obj.name;
			}
		}
		return "";
	};
	//获取配置的按钮。
	$scope.getButtons(1);
	//获取为初始化按钮。
	$scope.getButtons(2);
	
}

/**
 * 流程节点跳转规则配置控制器
 * @returns
 */
function flowNodeJumpRoleCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	$scope.curRule={};
	baseService.get("${bpmModel}/flow/node/v1/ruleEdit?definitionId="+$scope.defId+"&nodeId="+$scope.nodeId).then(function(data){
		if(data){
			$scope.nodeDef =data.nodeDef; 
			$scope.ruleList =data.nodeDef.jumpRuleList;
			$scope.nodeDefList =data.nodeDefList;
			InitMirror.init(300);
		}
	});
	
	
	$scope.addRule=function (){
		if(!$scope.curRule.ruleName) return;
		$scope.curRule.condition=InitMirror.editor.getCode();
		for(var i =$scope.ruleList.length;i>0;){
			if($scope.ruleList[--i]['ruleName']==$scope.curRule['ruleName']){
				delete $scope.ruleList[i];
			}
		}
		$scope.ruleList.push(angular.copy($scope.curRule));
		$scope.curRule={};
		InitMirror.editor.setCode("return true;"); 
	}
	
	$scope.showCondition=function (index){
		$scope.curRule=$scope.ruleList[index];
		InitMirror.editor.setCode($scope.curRule.condition); 
	}
	
	$scope.close=function (){
		dialogService.closeSidebar();
	}
	
	$scope.pageSure=function (){
		if(!$scope.ruleList ||$scope.ruleList.length==0){
			dialogService.confirm('目前条件列表为空，是否确定清空条件').then(function(){
				save();
			});
		}
		else save();
	}
	function save(){
		baseService.post("${bpmModel}/flow/node/v1/ruleSave?nodeId="+$scope.nodeId+"&defId="+$scope.defId,$scope.ruleList).then(function(response){
			if(response.state){
				dialogService.confirm(response.message+',是否继续操作').then(function(){
				},function(){
					$scope.close();
				});
			}else{
				dialogService.fail(response.message);
			}
	   }); 
	}
}

/**
 * 流程事件脚本设置控制器
 * @returns
 */
function flowNodeScriptCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	baseService.get("${bpmModel}/flow/node/v1/eventScriptEdit?defId="+$scope.defId+"&nodeId="+$scope.nodeId).then(function(data){
		if(data){
			$scope.bpmNodeDef =data.bpmNodeDef; 
			if($scope.bpmNodeDef.type) $scope.bpmNodeDef.type=$scope.bpmNodeDef.type.toLowerCase();
			var temp={};
			for(var  key  in data.eventScriptMap){
				temp[key.toLowerCase()]=data.eventScriptMap[key];
			}
			$scope.eventScriptMap =temp;
		}
		InitMirror.init(300);
	});
	
	baseService.post("${bpmModel}/flow/node/v1/varTree",{defId : $scope.pageParam.defId,nodeId :$scope.pageParam.nodeId,includeBpmConstants : true}).then(function(data){
		if(data){
			varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${bpmModel}/flow/node/v1/varTree",data).setDataKey({
				name : 'desc'
			}).setCallback({
				onClick : $scope.setVariable
			}).makeCombTree("tempTree").initZtree({
				defId : '${defId}',
				nodeId : '${nodeId}',
				includeBpmConstants : true
			}, 1);
		}
	})
	
	$scope.setVariable = function(event,treeId, node){
		var keyStr = node.name;
		var parentNode = node.getParentNode();
		var typeMoth = node.dataType=='number'?'.asInt()':'.asText()';
		// 子表情况做提示
		if (node.nodeType == 'sub') {
			keyStr = "/* " + parentNode.name + ".getSubByKey('" + node.name + "')  获取子表,return List<BoData> */";
		}// 主表bo
		else if (parentNode && parentNode.nodeType == 'main') {
			keyStr = parentNode.path + '.get("' + node.name + '")'+typeMoth+' /*数据类型：' + node.dataType + '*/';
		} else if (parentNode && parentNode.nodeType == 'sub') {
			var mainTableName = parentNode.getParentNode().name;
			keyStr = "/* " + mainTableName + ".getSubByKey('" + parentNode.name + "')  获取子表数据 ，返回数据：return List<BoData> 子表字段：”" + node.name + "“ 请根据实际情况处理子表数据的获取*/";
		} else if (node.nodeType == 'var') {
			keyStr = node.name;
		} else
			return;
		varTree.hideMenu();
		InitMirror.editor.insertCode(keyStr);
	}
	
	$scope.showFlowMenu=function(tagId){
		varTree.showMenu($('#'+tagId),300,180);
	}
	$scope.selectConditionScript=function (){
		dialogService.page('flow-conditionBuild', {area:['1200px', '650px'], pageParam: {defId:$scope.pageParam.defId}})
		 .then(function(script){
			 InitMirror.editor.insertCode(script);
		 });
	}
	$scope.selectScript=function(){
		dialogService.page("flow-commonScriptSelector", {
			pageParam: {
				single: true
			},
			title: '常用脚本选择器'
		}).then(function(data) {
			if(data) InitMirror.editor.insertCode(data.script);
		});
	}
	
	$scope.close=function (){
		dialogService.closeSidebar();
	}
	$scope.setCurEditor=function (id){
		InitMirror.editor =  InitMirror.getById(id);
		angular.element("textarea[name='script']").each(function() {
			var scriptType = $(this).prev().val();
			if($(this).attr('id')==id && $scope.eventScriptMap[scriptType]) InitMirror.editor.setCode($scope.eventScriptMap[scriptType]);
		});
		InitMirror.editor.replaceSelection(""); 
	}
	
	$scope.saveScript=function () {
		InitMirror.save();
		var eventScriptArray = [];
		angular.element("textarea[name='script']").each(function() {
			var scriptType = $(this).prev().val();
			eventScriptArray.push({
				scriptType : scriptType,
				content : $(this).val()
			});
		});
		param = {
			defId : $scope.defId,
			nodeId : $scope.nodeId,
			eventScriptArray : JSON.stringify(eventScriptArray)
		};
		baseService.post("${bpmModel}/flow/node/v1/eventScriptSave", param).then(function(response){
			if(response.state){
				dialogService.confirm(response.message+',是否继续操作').then(function(){
				},function(){
					$scope.close();
					$scope.$root.$broadcast('nodeScriptSave',eventScriptArray);
				});
			}else{
				dialogService.fail(response.message);
			}
		})
	}
}

/**
 * 流程用户脚本设置控制器
 * @returns
 */
function flowUserScriptEditCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	
	// 初始化
	if ($scope.pageParam && $scope.pageParam.calc) {
		$scope.code = $scope.pageParam.calc.script;
		$scope.description = $scope.pageParam.calc.description;
	}
	
	baseService.post("${bpmModel}/flow/node/v1/varTree",{defId : $scope.pageParam.defId,nodeId :$scope.pageParam.nodeId,includeBpmConstants : true}).then(function(data){
		if(data){
			varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${bpmModel}/flow/node/v1/varTree",data).setDataKey({
				name : 'desc'
			}).setCallback({
				onClick : $scope.setVariable
			}).makeCombTree("tempTree").initZtree({
				defId : '${defId}',
				nodeId : '${nodeId}',
				includeBpmConstants : true
			}, 1);
		}
	})
	
	InitMirror.init(200);
	
	$scope.setVariable = function(event,treeId, node){
		var keyStr = node.name;
		var parentNode = node.getParentNode();
		var typeMoth = node.dataType=='number'?'.asInt()':'.asText()';
		// 子表情况做提示
		if (node.nodeType == 'sub') {
			keyStr = "/* " + parentNode.name + ".getSubByKey('" + node.name + "')  获取子表,return List<BoData> */";
		}// 主表bo
		else if (parentNode && parentNode.nodeType == 'main') {
			keyStr = parentNode.path + '.get("' + node.name + '")'+typeMoth+' /*数据类型：' + node.dataType + '*/';
		} else if (parentNode && parentNode.nodeType == 'sub') {
			var mainTableName = parentNode.getParentNode().name;
			keyStr = "/* " + mainTableName + ".getSubByKey('" + parentNode.name + "')  获取子表数据 ，返回数据：return List<BoData> 子表字段：”" + node.name + "“ 请根据实际情况处理子表数据的获取*/";
		} else if (node.nodeType == 'var') {
			keyStr = node.name;
		} else
			return;
		varTree.hideMenu();
		InitMirror.editor.insertCode(keyStr);
	}
	
	$scope.showFlowMenu=function(tagId){
		varTree.showMenu($('#'+tagId),200,30);
	}
	$scope.selectConditionScript=function (){
		dialogService.page('flow-conditionBuild', {area:['1200px', '650px'], pageParam: {defId:$scope.pageParam.defId}})
		 .then(function(script){
			 InitMirror.editor.insertCode(script);
		 });
	}
	$scope.selectScript=function(){
		dialogService.page("flow-commonScriptSelector", {
			pageParam: {
				single: true
			},
			title: '常用脚本选择器'
		}).then(function(data) {
			if(data) InitMirror.editor.insertCode(data.script);
		});
	}
	
	$scope.pageSure=function (){
		var data={};
		var obj=InitMirror.getAllVal();
		if(obj) data.script=obj.startScript;
		data.description=$scope.description||"[脚本]";
		return data;
	}
	$scope.setCurEditor=function (id){
		InitMirror.editor =  InitMirror.getById(id);
		angular.element("textarea[name='script']").each(function() {
			var scriptType = $(this).prev().val();
			if($(this).attr('id')==id && $scope.eventScriptMap[scriptType]) InitMirror.editor.setCode($scope.eventScriptMap[scriptType]);
		});
		InitMirror.editor.replaceSelection(""); 
	}
}

/**
 * 流程催办设置控制器
 * @returns
 */
function flowTaskRemindCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	//可以在系统属性中配置
	baseService.get("${bpmModel}/flow/plugins/v1/remindersJson?defId="+$scope.defId+"&nodeId="+$scope.nodeId).then(function(data){
		$scope.warnSetting =eval('('+data.warnSetting+')');
		$scope.reminders = data.reminders;
		$scope.handlerList= data.handlerList;
	})
	$scope.sendMsgTimeArr =[];
	for(var i=1;i<11;i++){
		$scope.sendMsgTimeArr.push(i);
	}
	baseService.get('${bpmModel}/flow/node/v1/getNodes?defId='+$scope.defId).then(function(data){
		$scope.nodeList=data;
		InitMirror.init(100);
	});

	$scope.close=function (){
		dialogService.closeSidebar();
	}
	
	$scope.show = function(r){
		$scope.reminder = r;
		var initObj={};
		if($scope.reminder.dueAction=='call-method') initObj['dueScript']=$scope.reminder.dueScript;
		initObj['condition']=$scope.reminder.condition;
		InitMirror.setVal(initObj);
	}
	$scope.addWarningSet = function(){
		if(!$scope.reminder.warningSetList)$scope.reminder.warningSetList=[{}];
		else $scope.reminder.warningSetList.push({});
	}
	$scope.tempReminder = {dateType:'caltime',relNodeEvent:'create',dueAction:'no-action',msgType:'inner',relNodeId:'',isAdd:true};
	$scope.reminder = angular.copy($scope.tempReminder);
	
	$scope.add = function(){
		//新增数据
		if($scope.reminder.isAdd){
			delete $scope.reminder.isAdd;
			if(!$scope.reminders.reminderList)$scope.reminders.reminderList =[];
			$scope.reminders.reminderList.push($scope.reminder);
		}
		var eventScriptArray = [];
        var  allCodes= InitMirror.getAllVal();
        if($scope.reminder.dueAction=='call-method') {
        	$scope.reminder.dueScript=allCodes.dueScript;
        }else{
        	$scope.reminder.dueScript='';
        }
        $scope.reminder.condition=allCodes.condition;
        InitMirror.resetVal();
		
		$scope.reminder = angular.copy($scope.tempReminder);
	}
	$scope.save = function(){
		var remindersJson = angular.toJson($scope.reminders);
		baseService.post("${bpmModel}/flow/plugins/v1/remindersSave?defId="+$scope.defId+"&nodeId="+$scope.nodeId,remindersJson).then(function(data){
			if(data.state){
				if($scope.reminders.reminderList.length==0){
					dialogService.warn("已经清空催办设置。");
				}else{
					dialogService.success($scope.reminders.reminderList.length+"条催办，已经保存成功！");
					$scope.reminder = angular.copy($scope.tempReminder);
					$scope.reminder.dueTime = 0;
				}
				dialogService.confirm(data.message+',是否继续操作').then(function(){
				},function(){
					$scope.close();
				});
			}else{
				dialogService.fail("催办保存出现异常："+data.message);
			}
		})
	}
	
	$scope.setVariable = function(event,treeId, node){
		var keyStr = node.name;
		var parentNode = node.getParentNode();
		var typeMoth = node.dataType=='number'?'.asInt()':'.asText()';

		// 子表情况做提示
		if (node.nodeType == 'sub') {
			keyStr = "/* " + parentNode.name + ".getSubByKey('" + node.name + "')  获取子表,return List<BoData> */";
		}// 主表bo
		else if (parentNode.nodeType == 'main') {
			keyStr = parentNode.path + '.get("' + node.name + '")'+typeMoth+' /*数据类型：' + node.dataType + '*/';
		} else if (parentNode.nodeType == 'sub') {
			var mainTableName = parentNode.getParentNode().name;
			keyStr = "/* " + mainTableName + ".getSubByKey('" + parentNode.name + "')  获取子表数据 ，返回数据：return List<BoData> 子表字段：”" + node.name + "“ 请根据实际情况处理子表数据的获取*/";
		} else if (node.nodeType == 'var') {
			keyStr = node.name;
		} else
			return;
		$scope.insetCode(keyStr)
		
	}
	
	$scope.selectScript = function(key){
		$scope.CodeMirrorBroadcast = key;
		new ScriptSelector(function(script){
			$scope.insetCode(script);
		 }).show();
	}
	
	//codeMirror 
	$(".varTree").bind("click", function(){
		var broadcast = $(this).attr("broadcast");
		$scope.CodeMirrorBroadcast = broadcast;
		$scope.varTree.showMenu($(this));
		$("#varTreeMenuContent").css("top",$("#varTreeMenuContent").css("top").split("p")[0]-32+"px")
	});
	$scope.insetCode = function(str) {
		if(!$scope.CodeMirrorBroadcast)$scope.CodeMirrorBroadcast= "CodeMirror";
		$scope.$broadcast($scope.CodeMirrorBroadcast, function(CodeMirror) {
			CodeMirror.replaceSelection(str);
		});
	};
	$scope.editorConfig = {
			toolbars : [['source']],
			initialFrameHeight:150,
			focus : true
		};
}

/**
 * 流程分支规则设置控制器
 * @returns
 */
function flowBranchConditionCtrl($scope,baseService,$timeout,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	
	baseService.get("${bpmModel}/flow/node/v1/branchConditionEdit?defId="+$scope.defId+"&nodeId="+$scope.nodeId).then(function(data){
		$scope.bpmNodeDef =data;
		InitMirror.init(100);
	})
	
	baseService.post("${bpmModel}/flow/node/v1/varTree",{defId : $scope.pageParam.defId,nodeId :$scope.pageParam.nodeId,includeBpmConstants : true}).then(function(data){
		if(data){
			varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${bpmModel}/flow/node/v1/varTree",data).setDataKey({
				name : 'desc'
			}).setCallback({
				onClick : $scope.setVariable
			}).makeCombTree("tempTree").initZtree({
				defId : '${defId}',
				nodeId : '${nodeId}',
				includeBpmConstants : true
			}, 1);
		}
	})
	
	$scope.setVariable = function(event,treeId, node){
		var keyStr = node.name;
		var parentNode = node.getParentNode();
		var typeMoth = node.dataType=='number'?'.asInt()':'.asText()';
		// 子表情况做提示
		if (node.nodeType == 'sub') {
			keyStr = "/* " + parentNode.name + ".getSubByKey('" + node.name + "')  获取子表,return List<BoData> */";
		}// 主表bo
		else if (parentNode && parentNode.nodeType == 'main') {
			keyStr = parentNode.path + '.get("' + node.name + '")'+typeMoth+' /*数据类型：' + node.dataType + '*/';
		} else if (parentNode && parentNode.nodeType == 'sub') {
			var mainTableName = parentNode.getParentNode().name;
			keyStr = "/* " + mainTableName + ".getSubByKey('" + parentNode.name + "')  获取子表数据 ，返回数据：return List<BoData> 子表字段：”" + node.name + "“ 请根据实际情况处理子表数据的获取*/";
		} else if (node.nodeType == 'var') {
			keyStr = node.name;
		} else
			return;
		varTree.hideMenu();
		InitMirror.editor.insertCode(keyStr);
	}
	
	$scope.showFlowMenu=function(){
		varTree.showMenu($('#selectVarBtn'),230,90);
	}
	
	$scope.close=function (){
		dialogService.closeSidebar();
	}
  
   $scope.setEditorVal=function (type,op){
	   var val='';
	   if(type==1){
		   val=op==1?'taskCmd.getActionName().equals("agree")':'taskCmd.getActionName().equals("oppose")';
	   }else{
		   val=op==1?'signResult_'+type+'.equals("agree")':'signResult_'+type+'.equals("oppose")'; 
	   }
	   InitMirror.editor.insertCode(val);
	}
   
	$scope.save = function(){
		var  condition=InitMirror.getAllVal();
		var params ={ defId : $scope.defId, nodeId :$scope.nodeId , condition : JSON.stringify(condition)};
		baseService.post("${bpmModel}/flow/node/v1/branchConditionSave",params).then(function(data){
			if(data.state){
				dialogService.success("分支条件设置成功！");
				dialogService.confirm("分支条件设置成功，是否继续?").then(function(){
				},function(){
					$scope.close();
				});
			}else{
				dialogService.fail("分支条件设置失败!"+data.message);
			}
		})
	}
	
	
	$scope.selectScript = function(){
		 dialogService.page('flow-conditionBuild', {area:['1200px', '650px'], pageParam: {defId:$scope.pageParam.defId}})
		 .then(function(script){
			 InitMirror.editor.insertCode(script);
		 });
	}
	
	$scope.editorConfig = {
			toolbars : [['source']],
			initialFrameHeight:150,
			focus : true
		};
}

/**
 * 流程自动任务配置控制器
 * @returns
 */
function flowAutoTaskCtrl($scope,baseService,$timeout,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	$scope.contextMap = {};
	$scope.clickedType = {};
	var ue = '';
	//查询当前节点是否选择了自动任务类型。有则选择设置的，没有则显示所有自动任务类型
	baseService.get("${bpmModel}/flow/node/v1/autoTaskManager?defId="+$scope.defId+"&nodeId="+$scope.nodeId).then(function(data){
		if(data.bpmPluginContext){
			$scope.contextMap[data.bpmPluginContext.type]=data.bpmPluginContext.title;
			$scope.chooseTaskType(data.bpmPluginContext.type);
		}else{
			$scope.contextMap={  message:true,scriptNode:true,webService:true,isFirst:true};
			//第一次进入，默认初始化消息自动任务
			$scope.chooseTaskType('message');
		}
	})
	
	//插件类型切换、如果没有初始化，。则初始化。并且将选择的插件设置为当前
	$scope.chooseTaskType=function (type){
		$scope.clickedType['curType']=type;
		if(!$scope.clickedType[type]){
			$scope.clickedType[type]=true;
			$scope.initData();
		}
		if($scope.contextMap.message){
			ue=UE.getEditor('content');
		}
	}
	
	$scope.initData=function (){
		if($scope.clickedType[$scope.clickedType.curType]){
			baseService.get("${bpmModel}/flow/node/v1/autoTaskPluginGet?defId="+$scope.defId+"&nodeId="+$scope.nodeId+"&pluginType="+$scope.clickedType['curType']).then(function(data){
		    if($scope.clickedType['curType']=='message'){
			   if(data.bpmPluginDefJson){
				   $scope.nodeMessage = eval('(' + data.bpmPluginDefJson.replace(/\\/g,'') + ')');
				}else{
					$scope.nodeMessage={"htmlSetting":{"msgType":"","content":""},"plainTextSetting":{"msgType":"","content":""}};
				} 
			   ue.setContent($scope.nodeMessage.htmlSetting.content);
		    		
		     }else if($scope.clickedType['curType']=='scriptNode'){
		    	 if(data.bpmPluginDefJson){
		    		     $scope.scriptJson = eval('(' + data.bpmPluginDefJson.replace(/\\/g,'') + ')');
					}else{
						 $scope.scriptJson={"script":"return ;"};
					} 
		    	 InitMirror.init(100,'scriptNode');
		     }else{
		    	 if(data.bpmPluginDefJson){
		    		$scope.nodeDefJson = eval('(' + data.bpmPluginDefJson.replace(/\\/g,'') + ')');
			 		$scope.alias = $scope.nodeDefJson.alias;
			 		$scope.nodeDefJson.params = eval('(' +$scope.nodeDefJson.params +')');
			 		ServiceSet.getByAlias($scope.alias,function(data){
			 			$scope.serviceSet = data.serviceSet;
			 		})
		    	 }
		    	InitMirror.init(100,'webService');
		     }
		  })
		}
	}
	
	
	$scope.saveWebService = function(){
		if(!$scope.myForm.$valid){
			dialogService.fail("表单校验不通过！");
			return;
		}
		$scope.nodeDefJson.pluginType = "webService";
		flowParam.jsonStr = JSON.stringify($scope.nodeDefJson);
		
		var url = __ctx + "/flow/node/autoTaskPluginSave";
		
		baseService.post(url,flowParam,function(data){
			var resultMessage=new com.hotent.form.ResultMessage(data);
        	if(resultMessage.isSuccess()){
        		dialogService.success("webService配置成功!");
        		window.parent.passConf();
        	}else{
        		dialogService.fail(resultMessage.getMessage(),resultMessage.getCause()); 
        	}
		}); 
	};
	
	$scope.chooseServiceSet = function(){
		var dialog = {};
		var def = {
			passConf : '',
			title : '选择webService',
			width : 600,
			height : 500,
			modal : true,
			resizable : false,
			iconCls : 'icon-collapse',
			buttons : [
					{
						text : '确定',
						handler : function(e) {
							var record = dialog.innerWin.$("#userGridList").datagrid('getChecked');
							if(record.length == 1){
								$scope.$apply(function(){
									$scope.serviceSet =record[0];
								});
								$scope.nodeDefJson ={alias:$scope.serviceSet.alias,name:$scope.serviceSet.name}
								$scope.initParams($scope.serviceSet.id);
								dialog.dialog('close');
							}
						}
					}, {
						text : '取消',
						handler : function() {
							dialog.dialog('close');
						}
					} ]
		};

		dialog = $.topCall.dialog({
					src : __ctx+ '/system/serviceSet/serviceSetDialog',
					base : def
				});
		return this;
	}
	
	
	$scope.close=function (){
		dialogService.closeSidebar();
		UE.delEditor('content');
	}

	
	// 保存数据
	$scope.save= function(){
		if($scope.contextMap.isFirst){
			dialogService.confirm("自动节点支持一种任务节点类型（脚本、消息等）， 保存所选择的任务类型后无法修改。").then(function(){
				if($scope.clickedType['curType']=='message'){
			    	 $scope.messageTask();
				  }else if($scope.clickedType['curType']=='scriptNode'){
					  $scope.saveScript();
			     }else{
			    	 $scope.saveWebService();
			     }
			})
		}else{
			if($scope.clickedType['curType']=='message'){
		    	$scope.messageTask();
			  }else if($scope.clickedType['curType']=='scriptNode'){
				  $scope.saveScript();
		     }else{
		    	 $scope.saveWebService();
		     }
		}
	}
	
	// 保存数据
	$scope.messageTask= function(){
		$scope.nodeMessage.pluginType = $scope.clickedType['curType'];
		if(!$scope.nodeMessage.htmlSetting)$scope.nodeMessage.htmlSetting={};
		$scope.nodeMessage.htmlSetting.content = ue.getContent(); 
		param = {
				 defId:$scope.defId,nodeId:$scope.nodeId,
				 jsonStr:JSON.stringify($scope.nodeMessage)
				};
		var url = "${bpmModel}/flow/node/v1/autoTaskPluginSave";
		
		baseService.post(url, param).then(function(data){
        	if(data.state){
        		dialogService.success("节点配置成功!");
        		$scope.close();
        	}else{
        		dialogService.fail(data.message); 
        	}
		});
	}
	
	
	$scope.saveScript =function () {
		InitMirror.save();
		$scope.scriptJson.pluginType = $scope.clickedType['curType'];
		$scope.scriptJson.script = InitMirror.getAllVal().scriptNode;
		param = {
				 defId:$scope.defId,nodeId:$scope.nodeId,
				 jsonStr:JSON.stringify($scope.scriptJson)
				};
		
        var url = "${bpmModel}/flow/node/v1/autoTaskPluginSave";
		baseService.post(url, param).then(function(data){
        	if(data.state){
        		dialogService.success("节点配置成功!");
        		$scope.close();
        	}else{
        		dialogService.fail(data.message); 
        	}
		}); 
	}
	//用户规则选择
	$scope.addUserCondition=function(setting,index){
		var ruleList = eval('$scope.nodeMessage.'+setting+'.ruleList'); 
		var userRule;
		if(index){
			userRule = ruleList[index];
		}
		
		var dialog;
		var def = {
		        passConf:userRule,title:'节点人员条件配置',width:870,height:580, modal:true,resizable:true,iconCls: 'icon-collapse',
		        buttonsAlign:'center',
		        buttons:[{
					text:'确定',iconCls:'fa fa-check-circle',
					handler:function(e){
							var win=dialog.innerWin;   				
							var data = win.getUserRuleData();
							if(!data) return;
							$scope.$apply(function(){
								if(index != undefined){
									ruleList[index] = data;
								}else if(ruleList && ruleList.length > 0){
									ruleList.push(data);
								}else {
									var userRules = [];
									userRules.push(data);
									eval('$scope.nodeMessage.'+setting+'.ruleList=userRules;');
								}
							});
							dialog.window('close');
						}
				},{
					text:'取消',iconCls:'fa fa-times-circle',
					handler:function(){dialog.dialog('close');}
				}]
		};
		dialog = $.topCall.dialog({
			src:'$${bpmModel}/flow/node/v1/condition/conditionEdit?defId=${defId}',
			base:def
		});
		}
	
	///删除行
	$scope.deleteAttr=function(setting,index){
		 var aa = eval('$scope.nodeMessage.'+setting+'.ruleList');
		 removeObjFromArr(aa,index);
		}
}

/**
 * 流程会签节点配置控制器
 * @returns
 */
function flowSignConfigCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.ArrayTool = ArrayToolService;
	
	baseService.get('${bpmModel}/flow/node/v1/getSignConfig?defId='+$scope.defId+'&nodeId='+$scope.nodeId).then(function(data){
		$scope.privilegeList = data.privilegeList;
		$scope.signRule = data.signRule;
		
		if (!$scope.privilegeList.all) $scope.privilegeList.all = [];
		if (!$scope.privilegeList.oneticket) $scope.privilegeList.oneticket = [];
		if (!$scope.privilegeList.direct) $scope.privilegeList.direct = [];
		if (!$scope.privilegeList.allowAddSign) $scope.privilegeList.allowAddSign = [];
	})
	
	// 保存数据
	$scope.save = function() {
		param = {
			defId :$scope.defId,
			nodeId : $scope.nodeId,
			privilegeList : JSON.stringify($scope.privilegeList),
			signRule : JSON.stringify($scope.signRule)
		};
		var url = "${bpmModel}/flow/node/v1/signConfigSave";
		baseService.post(url, param).then(function(data) {
			if (data.state) {
				dialogService.success("会签节点配置成功!").then(function(){
					dialogService.closeSidebar();
				})
			} else {
				dialogService.fail(data.message);
			}
		});
	}
    
	$scope.close=function (){
		dialogService.closeSidebar();
	}
	//用户规则选择
	$scope.addUserCondition = function(setting, index) {
		var ruleList = eval('$scope.privilegeList.' + setting);
		var userRule = null;
		var conf ={};
		if (index != undefined) {
			userRule = ruleList[index];
			conf.userRule = angular.copy(userRule);
		}
		conf=angular.extend(conf,{nodeType:"signTask",nodeId:$scope.nodeId,defId:$scope.defId})
		var dialog;
		var title ="节点人员条件配置";
		dialogService.page("flow-nodeUserCondition", {
			pageParam:{passConf:conf},
		    title:title,
		    alwaysClose:false
		}).then(function(r){
			if (!r.result)return;
			var data=r.result;
			if (index != undefined) {
				ruleList[index] = data;
			} else if (ruleList && ruleList.length > 0) {
				ruleList.push(data);
			} else {
				var userRules = [];
				userRules.push(data);
				eval('$scope.privilegeList.' + setting + '=userRules;');
			}
			dialogService.close(r.index);
		 });
	}

	///删除行
	$scope.deleteAttr = function(setting, index) {
		var aa = eval('$scope.privilegeList.' + setting);
		removeObjFromArr(aa, index);
	}
}

/**
 * 流程事件设置控制器
 * @returns
 */
function flowEventSettingCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.defId = $scope.pageParam.defId;
	$scope.nodeId = $scope.pageParam.nodeId;
	$scope.data = $scope.pageParam.passConf;
	$scope.ArrayTool = ArrayToolService;
    
	var restfulJson = $scope.data.restful;
	if(!restfulJson||restfulJson.length<1){
		restfulJson = '[{"url":"","desc":"","invokeMode":1,"callTime":"","header":"","inParam":"","outParam":""}]'; 
		restfulJson = eval('(' + restfulJson + ')');
	}else{
		var len = restfulJson.length;
		for(var i=0;i<len;i++){
			var headerJson = restfulJson[i]['header'];
			if(headerJson&& typeof(headerJson) == "object" ){
				restfulJson[i]['header'] = angular.toJson(headerJson);
			}
		}
	}
	$scope.restfulList = restfulJson;
	
	$scope.addLine=function(){
		var restful = {"url":"","desc":"","invokeMode":1,"callTime":"","header":"","inParam":"","outParam":""};
		$scope.restfulList.push(restful);
	}
	$scope.deleteLine=function(index){
		removeObjFromArr($scope.restfulList,index);
	}
	
	///删除行
	$scope.deleteAttr=function(index,userRuleIndex){
		 var aa = $scope.restfulList[index].userAssignRules;
		 removeObjFromArr(aa,index);
	}
	
	//全局事件中是否包含节点事件
	$scope.isGlobalNode=function(callTime){
		if(callTime){
			return callTime.indexOf('taskCreate')!=-1||callTime.indexOf('taskComplete')!=-1?true:false;
		}
		return false;
	}
	
	$scope.noStart = function(value){
		if(value.type!='start')return true;
		return false;
	}
	
	$scope.close=function (isSave){
		if(isSave){
			var data = angular.copy($scope.restfulList)
			if(data&&data.length>0){
				for(var i=0;i<data.length;i++){
					var headerJson = data[i]['header'];
					if(headerJson){
						data[i]['header'] = angular.fromJson(headerJson);
					}
				}
			}
			$scope.$root.$broadcast ('nodeEventSettingSave',{list:data,nodeId:$scope.data.nodeId});
		}
		dialogService.closeSidebar();
	}
}

/**
 * 流程节点用户条件配置控制器
 * @returns
 */
function flowNodeUserConditionCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.userRule = {};
	$scope.userRule.nodeType=$scope.pageParam.passConf.nodeType;
	$scope.userRule.calcs = [];
	$scope.conditionList=[];
	$scope.prop={};
	//要初始化
	if($scope.pageParam.passConf.userRule){
		$scope.userRule=$scope.pageParam.passConf.userRule;
	/*	if($scope.userRule && $scope.userRule.calcs){
			for(var j=0,z;z=$scope.userRule.calcs[j++];){
				if(z && z.pluginType=='hrScript') z.pluginType='script';
			}
		}*/
	}
	
	baseService.get("${bpmModel}/flow/node/usercalc/v1/getNodeUserPluginList").then(function(data) {
		$scope.nodeUserPluginList = data;
		var linkdivData='';
		if($scope.pageParam.passConf &&$scope.pageParam.passConf.condition){//初始化
			if(typeof(window.passConf.condition)=="string"){
				data = JSON.parse($scope.pageParam.passConf.condition);
			}else{
				data = CloneUtil.list($scope.pageParam.passConf.condition);
			}
		}
		$("#ruleDiv").linkdiv({
			data : linkdivData,
			updateContent : updateContent,
			rule2json : rule2json
		});
	});
	
	baseService.get("${bpmModel}/flow/node/v1/getNodes?defId="+$scope.pageParam.passConf.defId).then(function(data) {
		$scope.nodeList=[];
		$(data).each(function(){
			if((this.type=='signTask'||this.type=='userTask')&&this.nodeId!=$scope.pageParam.passConf.nodeId){
				$scope.nodeList.push(this);
			}
		});
	});
	
	$scope.changeSameNode = function(calc){
		$($scope.nodeList).each(function(){
			if(this.nodeId==calc.nodeId){
				calc.description = this.name;
			}
		});
	};
	
	$scope.addCalc = function() {
		$scope.userRule.calcs.push({
			pluginType : "cusers",
			extract : "no",
			logicCal : "or",
			source : "start",
			vars:"",
			description : "发起人",
			nodeType: $scope.userRule.nodeType
		});
	};
	
	/**
	 * 点击选择按钮处理，这里使用动态调用对话框。
	 * 选择器命名修改成：
	 * pluginType +Selector,参数为：calc 对象。
	 */
	$scope.selector = function(calc){
		eval(calc.pluginType+"Selector(calc);");
	};
	
	$scope.selectHrScript = function() {
		ConditionScript.showDialog({
			defId : defId,
			flowKey:flowKey,
			nodeId : nodeId,
			type:2
		}, function(data) {
			$scope.$apply(function(){
				$scope.code =data.script;
				$scope.description =data.desc||"[人员脚本]";
			});

		});
	};
	
	$scope.preview = function(){
		var passConf = getUserRuleData();
		var callback = function(data, dialog) {
			dialog.dialog('close');
		};
		DialogUtil.openDialog(__ctx+"/flow/node/condition/preview", "预览", passConf, callback);
	};
	
	$scope.calcTypeChange = function(calc){
		calc.description="";
		if(calc.pluginType== "approver"){//流程实例审批人，在此处设置description
			calc.description="流程实例审批人";
		}
	};
	
	/**
	 * 以下代码是可以扩展部分。
	 */
	function cusersSelector(calc){
		dialogService.page("flow-cusersSelector", {pageParam:{nodeId:$scope.pageParam.passConf.nodeId,defId:$scope.pageParam.passConf.defId,calc:calc},title:"用户选择器"}) .then(function(result){
			angular.extend(calc, result);
		 });
	}
	
	function scriptSelector(calc){
		dialogService.page("flow-userScriptEdit", {pageParam:{nodeId:$scope.pageParam.passConf.nodeId,defId:$scope.pageParam.passConf.defId,calc:angular.copy(calc)},title:"脚本对话框"}) .then(function(result){
			angular.extend(calc, result);
		 });
	}
			
	function hrScriptSelector(calc){
		var passConf = {};
		passConf.calc=CloneUtil.shallow(calc);
	
		dialogService.page("flow-hrScriptSelect", {area:['1120px', '650px'],pageParam:{nodeId:$scope.pageParam.passConf.nodeId,defId:$scope.pageParam.passConf.defId,calc:angular.copy(calc)},title:"人员脚本对话框"}) .then(function(data){
			calc.description = "[人员脚本]"+ data.desc;
			calc.scriptId = data.scriptId;
			calc.params = data.params;
			angular.extend(calc, data);
			!$scope.$root.$$phase && $scope.$root.$digest();
		});
	}
	
	function sameNodeSelector(calc){
		var passConf = {};
		passConf.calc=CloneUtil.shallow(calc);
		var callback = function(data, dialog) {
			dialog.dialog('close');
			jQuery.extend(calc, data);
			!$scope.$root.$$phase && $scope.$root.$digest();
		};
		DialogUtil.openDialog(__ctx+"/flow/node/condition/sameNodeSelector?defId="+defId+"&nodeId="+nodeId, "节点选择", passConf, callback);
	}
	
	$scope.pageSure = function () {
		var r={};
		if(!$scope.userRule.calcs||$scope.userRule.calcs.length==0){
			dialogService.warn("请设置人员！","温馨提示");
			return false;
		}
		if(!validateData($scope.userRule.calcs)){
			dialogService.warn("存在无效的人员设置！","温馨提示");
			return false;
		}
		//var conditionJson =JSON.stringify($("#ruleDiv").linkdiv("getData"))
		var conditionJson = '';
		r.condition=conditionJson;
		r.conditionMode="";
		r.name="";
		r.nodeType=$scope.userRule.nodeType;
		r.parentFlowKey='';
		r.calcs=angular.copy($scope.userRule.calcs);
		//拼装描述
		r.description="";
		$(r.calcs).each(function(){
			if(r.description){
				if(this.logicCal=="or"){
					r.description+="(或)";
				}else if(this.logicCal=="and"){
					r.description+="(与)";
				}else{
					r.description+="(非)";
				}
			}
			r.description+=this.description;
		});
		
		return r;
	};
	
	function validateData(calcs){
		var isTrue = true;
		for(var i=0;i<calcs.length;i++){
			switch(calcs[i].pluginType){
				case "script":
			 	case "hrScript": if(!calcs[i].script)isTrue=false; break;
	        	case "sameNode": if(!calcs[i].nodeId)isTrue=false; break;
	        	case "cusers": if(!calcs[i].description)isTrue=false; break;
			 }
		}
		return isTrue;
	}
}

/**
 * 流程用户选择器控制器
 * @returns
 */
function cusersSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.data = $scope.pageParam.calc;
	$scope.user = {};
	$scope.user.list = [];
	baseService.post("${bpmModel}/flow/node/v1/varTree",{defId : $scope.pageParam.defId,nodeId :$scope.pageParam.nodeId,includeBpmConstants : true}).then(function(data){
		if(data){
			varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${bpmModel}/flow/node/v1/varTree",data).setDataKey({
				name : 'desc'
			}).setCallback({
				onClick : setVariable
			}).makeCombTree("tempTree").initZtree({
				defId : '${defId}',
				nodeId : '${nodeId}',
				includeBpmConstants : true
			}, 1);
		}
	})
	
	$scope.showFlowMenu=function(){
		varTree.showMenu($('#selectVarBtn'));
	}
	
	
	function setVariable(event, treeId, node) {
		var keyStr = node.name;
		var source="BO";
		var parentNode = node.getParentNode();
		// 子表情况做提示
		 if (node.nodeType == 'sub'||(node.path&&node.path.indexOf('.sub_')!=-1)){
			keyStr = "";
			baseService.warn('提示信息','不支持子表');
		 }// 主表bo
		 else if(parentNode && parentNode.nodeType == 'main'){
			keyStr = node.path+'.'+node.name;
		}else if(node.nodeType == 'var'){
			keyStr =node.name;
			source="flowVar";
		}else return ;
		varTree.hideMenu();
		  var json= {source:source,name:keyStr,executorType:"user",userValType:"account"}
		  $scope.data.vars=JSON.stringify(json);
		  $scope.data["var"]=json;
		  !$scope.$$phase && $scope.$apply();
	}
	
	// 指定人员
	if ($scope.data.source == 'spec' && $scope.data.userName != "") {
		$scope.user.name = $scope.data.userName;
		$scope.user.account = $scope.data.account;

		if($scope.user.name){
			var arrName = $scope.user.name.split(',');
			var arrAccount = $scope.user.account.split(',')
			$.each(arrName,function(i,item){
				var item={fullname:arrName[i],account:arrAccount[i]};
				$scope.user.list.push(item);
			})
		}
	}
    
	$scope.pageSure =function() {
		//指定人员
		if ($scope.data.source == 'spec') {
			$scope.data.userName = $scope.user.name;
			$scope.data.account = $scope.user.account;
		}

		//处理描叙
		if ($scope.data.source == 'currentUser') {
			$scope.data.description="当前登录用户";
		} else if ($scope.data.source == 'start') {
			$scope.data.description="发起人";
		}else if ($scope.data.source == 'prev') {
			$scope.data.description="上一步执行人";
		}else if ($scope.data.source == 'var') {
			$scope.data.description=$scope.data['var']?"[变量]"+$scope.data['var'].name:"[变量]";
		}else if ($scope.data.source == 'spec') {
			if($scope.user.name){
				$scope.data.description="[指定用户]"+$scope.user.name;
			}else{
				$scope.data.description="";
			}
		}
		return $scope.data;
	}
	
	$scope.userDialog = function() {
		
		var pageParam = {
				/*single:true, 是否单选*/ 
				 data:$scope.user.list
				};
             dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
					$scope.user = {};
					$scope.user.list = result;
					$scope.user.id = "";
					$scope.user.name = "";
					$scope.user.account = "";
					$(result).each(function() {
						if ($scope.user.id !='') {
							$scope.user.id += ",";
							$scope.user.name += ",";
							$scope.user.account += ",";
						}
						$scope.user.id += this.id;
						$scope.user.name += this.fullname;
						$scope.user.account += this.account;
				   });
			 });
	};
	
}

/**
 * 流程表单选择器控制器
 * @returns
 */
function bpmFormSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
    
	$scope.$on("table:ready", function(t, m){
		  m.addQuery({property: 'formType', operation: 'equal', value:$scope.pageParam.formType });
		  m.addQuery({property: 'status', operation: 'equal', value:"deploy"});
		  m.query();
		});
	
	$scope.formSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.formSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.formSelectArr;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.formSelectArr.push(data);
			$scope.formSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam.single){
				angular.forEach($scope.formSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('formSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.formSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.bpmFormTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam.single) return $scope.formSelectArr[0];
		return $scope.formSelectArr;
	}
	
}

/**
 * 人员条件脚本选择控制器
 */
function userScriptSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.$on("table:ready", function(t, m){
		  m.addQuery({property: 'TYPE_', operation: 'equal', value:"2" });
		  m.query();
		});
	
	$scope.userScriptSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.userScriptSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.userScriptSelectArr;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			$scope.userScriptSelectArr.push(data);
			$scope.userScriptSelectArr.unique(function(x,y){
				return x.id==y.id;
			});

			angular.forEach($scope.userScriptSelectArr, function(item){
				if(item.id!=data.id){
					$scope.removeSelectedArr('userScriptSelectArr', item);
				}
			});
		}else{
			// remove
			data.isSelected = true;
			$scope.userScriptSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.dataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam.single) return $scope.userScriptSelectArr[0];
		return $scope.userScriptSelectArr;
	}
}


/**
 * 常用脚本选择控制器
 */
function commonScriptSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.userScriptSelectArr = [];
	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.userScriptSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.userScriptSelectArr;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			$scope.userScriptSelectArr.push(data);
			$scope.userScriptSelectArr.unique(function(x,y){
				return x.id==y.id;
			});

			angular.forEach($scope.userScriptSelectArr, function(item){
				if(item.id!=data.id){
					$scope.removeSelectedArr('userScriptSelectArr', item);
				}
			});
		}else{
			// remove
			data.isSelected = true;
			$scope.userScriptSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.dataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam.single) return $scope.userScriptSelectArr[0];
		return $scope.userScriptSelectArr;
	}
}

/**
 * 流程条件脚本编辑控制器
 */
function bpmConditionBuildCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	$scope.conditionName='';
	$scope.pathList=[];
	$scope.data={};
	$scope.branchList=[];
	$scope.tabList=[];
	$scope.varTree=[];
	var svgHeight='400px';
	var defaultCondition={'property':'','operator':'','dataType':'','value':''};
	var  conditionData={'condition':[{'property':'author','operator':'<>','dataType':'String','value':'benny.bao@bstek.com'},
	                           {'property':'author','operator':'<>','dataType':'String','value':'benny.bao@bstek.com'},
	                           {'junction':'or','condition':[{'property':'new','operator':'=','dataType':'boolean','value':true},
	                                                           {'property':'hot','operator':'=','dataType':'boolean','value':true}]}], 
	              junction:'and'};
	var Mleft=50;//初始左边距50
	var Mtop=50;//初始上边距40
	var XIncase=70;//x轴递增数值70
	var YIncase=50;//y轴递增数据50
	
	$scope.pageSure= function(){
		if(!$scope.data.conditionObj ) return ;
		var data =getConditionStr($scope.data.conditionObj);
		data.conditionObj=JSON.stringify($scope.data.conditionObj);
		return data.conditionString;
	}
	
	$scope.buildInit =function(dId,conditionId) {
	  if(conditionId) $scope.data.isAdd=false;
	  $scope.data.defId=dId;
	  var rtn = baseService.post("${bpmModel}/flow/node/v1/varTree", {defId:dId,removeSub:true});
		rtn.then(function(treeData) {
			if (treeData && treeData.constructor.name=='Array' && treeData.length >0 ){
				buildVarTree(treeData,conditionId);
			}else if(treeData && treeData.constructor.name=='Array'){
				dialogService.fail("请先绑定业表单");
			}else{
				dialogService.fail("请求错误");
			}
		});
	};
	
	//组装表单变量和url表单变量
	function buildVarTree(treeData,conditionId){
		var treeArr=[];
		for(var i=0,t;t=treeData[i++];){
			//处理表单变量
			if(t && t.name=='表单变量'){
				if(t.children){
					for(var j=0,tChild;tChild=t.children[j++];){
						if(tChild.children){
							for(var z=0,cAttr;cAttr=tChild.children[z++];){
								var typeMoth = tChild.dataType=='number'?'.asInt()':'.asText()';
								cAttr.pathStr=	tChild.path+'.get("' + tChild.name + '")'+typeMoth;						
							}
							treeArr.push(tChild)
						}
					}
				}
			}else if(t && t.name=='url表单变量'){
				if(t.children){
					for(var j=0,tChild;tChild=t.children[j++];){
						if(tChild.attrs){
							for(var z=0,cAttr;cAttr=tChild.attrs[z++];){
								cAttr.path=tChild.formKey;
								if(cAttr.dataType=='number'){
									cAttr.pathStr=cAttr.path +'.getIntValue("'+cAttr.name+'")';		
								}else{
									cAttr.pathStr=cAttr.path +'.getString("'+cAttr.name+'")';		
								}
							}
							tChild.children=tChild.attrs;
							tChild.desc=tChild.name;
							delete tChild.attrs;
							treeArr.push(tChild)
						}
					}
				}
				
			}
		}
		if(treeArr.length >0){
			$scope.varTree=treeArr;	
			initConditionSvg(conditionId);
		}else{
			dialogService.fail("请先绑定业表单");
		}
			
	}
	
	//初始化规则树
	function initConditionSvg(conditionId) {
		if(conditionId){
			  baseService.get("getJson?id="+conditionId).then(function(data){
				  if(data && data.conditionObj){
					  data.conditionObj=JSON.parse(data.conditionObj);
					  $scope.data=data;
					  buildConditionTree($scope.data.conditionObj);
				  }
				}); 
		  }else{
			  $scope.data.conditionObj={'junction':'and','condition':[]};
			  buildConditionTree($scope.data.conditionObj);
		  }
	}
	
	function getScopeElm(id) {
		 var elem;
		 $('.ng-scope').each(function(){
			 var s = angular.element(this).scope(),
			 sid = s.$id;
			 if(sid == id) {
				 elem = this;
				 return false;
			 }
		 });
		 return elem;
	}
	
	function getPathByElem(elem,property){

	}
	
	$scope.IsShowfiled =function(m,tab) {
		var typeMoth = tab.dataType=='number'?'.asInt()':'.asText()';
		var curValue= m.path+'.get("' + m.name + '")'+typeMoth;
		if(!tab ) return false;
		if(curValue==tab.property){
			return false;
		}else if(m.dataType != tab.dataType){
			return false;
		}
	    return true;
	};
		
	
	$scope.resetTabValue =function(tab) {
		tab.value='';
	};
				
	$scope.setFieldOtherInfo =function(ele,tab,type) {
		var cElem = getScopeElm(ele.$id);
		if(type==1){
			var chooseElems = $(cElem).find("[ng-model='tab.property']");
			var options =$(chooseElems).find('option');
			for (var m = 0; m < options.length; m++) {
				if(tab.property==options[m].value){
					tab.dataType='';
					tab.dataType=$(options[m]).attr('datatype')
					tab.format= $(options[m]).attr('format');
					tab.chooseDesc= options[m].text;
					tab.value='';
					return;
				}
			 }
		}else{
			var chooseElems = $(cElem).find("[ng-model='tab.value']");
			var options =$(chooseElems).find('option');
			for (var m = 0; m < options.length; m++) {
				if(tab.value==options[m].value){
					tab.changeDesc= options[m].text ;
					return;
				}
			 }
		}
	};
		
	//根据条件数组构建条件分支界面
	function buildConditionTree(data){
	      var pathArr=[];
	      var tableArr=[];
	      var branchArr=[];
	      buildData(data,pathArr,tableArr,branchArr);
	      $scope.pathList=pathArr;
	      $scope.branchList=branchArr;
	      $scope.tabList=tableArr;
	      //取路径最后一条数据，因为该条数据的高度距离顶部最大
	      var lastPath=pathArr[pathArr.length-1];
	      var lastIndexArr=[];
	      if(lastPath)lastIndexArr=lastPath.split(',');
	      //取最后一个坐标点。终点纵坐标为整个svg中最大的纵坐标
	      var lastYIndex=lastIndexArr[lastIndexArr.length-1];
	      //设置svg的高度为最大纵坐标+100，从而实现svg页面高度自适应
	      if(lastYIndex){
	    	  svgHeight=(parseInt(lastYIndex)+100)+"px";
	      }
	      createSvgHtml(pathArr);
	      !$scope.$$phase && $scope.$digest();
    }
	//构建svg图形页面
	function createSvgHtml(pathArr){
      var html='<svg height="'+svgHeight+'" version="1.1" width="692" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; position: relative;">';
         for(var i=0;i<pathArr.length;i++){
        	 html+='<path fill="none" stroke="#787878"'+'d="'+$scope.pathList[i]+'" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>' ;	 
         }
         html+='</svg>';
         $("#testsvgHtml").empty();
         $('#testsvgHtml').append(html);
    }
	//添加一个联合条件条件
	function addUnionCondition(indexStr){
	 var data=$scope.data.conditionObj.condition;
	  if(indexStr=='root'){
		  data.push({'junction':'or','condition':[]});
	  }else{
		  var indexArr=[];
		  if(indexStr) indexArr=indexStr.split(',');
		  for(var i=0;i<data.length;i++){
			  if(indexArr.length>0 && i==indexArr[0]){
				  if(indexArr.length>1){
					  for(var j=0;j<data[i].condition.length;j++){
						  if(j==indexArr[1]){
							  data[i].condition[j].condition.push(
									  {'junction':'or','condition':[]}
							  )
							  break;
						  }
					  }
				  }else{
					  data[i].condition.push(
							  {'junction':'or','condition':[]}
						  ) 
				  }
				  break;
			  }
		  }  
	  }
	  $scope.data.conditionObj.condition=data;
	  buildConditionTree($scope.data.conditionObj); 
    }
	
	//添加一个联合
	function addCondition(indexStr){
	 var data=$scope.data.conditionObj.condition;
	  if(indexStr=='root'){
		  data.push({'property':'','operator':'','dataType':'','value':''});
	  }else{
		  var indexArr=[];
		  if(indexStr) indexArr=indexStr.split(',');
		  for(var i=0;i<data.length;i++){
			  if(indexArr.length>0 && i==indexArr[0]){
				  if(indexArr.length>1){
					  for(var j=0;j<data[i].condition.length;j++){
						  if(j==indexArr[1]){
							  data[i].condition[j].condition.push(
									  {'property':'','operator':'','dataType':'','value':''}
							  )
							  break;
						  }
					  }
				  }else{
					  data[i].condition.push(
							  {'property':'','operator':'','dataType':'','value':''}
						  ) 
				  }
				  break;
			  }
		  }  
	  }
	  $scope.data.conditionObj.condition=data;
	  buildConditionTree($scope.data.conditionObj);
    }
	$scope.changecondition =function(index) {
		var oldVal=$scope.branchList[index].oldjunction;
		var newVal=$scope.branchList[index].newjunction;
		if(newVal=='3' || newVal=='4'  || newVal=='5'){
			$scope.branchList[index].newjunction=$scope.branchList[index].oldjunction;
			var indexStr=$scope.branchList[index].indexStr;
			if(newVal=='3'){
				addCondition(indexStr);
			}else if(newVal=='4'){
				addUnionCondition(indexStr);
			}else{
				dialogService.confirm("确定要删除此联合条件及其下属的所有子条件吗？").then(function(r) {
						$scope.removeCondition(indexStr);
				})
			}
		}else{
			$scope.branchList[index].oldjunction=$scope.branchList[index].newjunction;
			var indexStr=$scope.branchList[index].indexStr;
			var indexArr=indexStr.split(',');
			if(indexStr=='root'){
				$scope.data.conditionObj.junction=newVal;
			}else if(indexArr.length==1){
				$scope.data.conditionObj.condition[indexStr].junction=newVal;
			}else if(indexArr.length==2){
				$scope.data.conditionObj.condition[indexArr[0]].condition[indexArr[1]].junction=newVal;
			}
		}
	 };
	 
	$scope.removeCondition =function(indexStr) {
		var indexArr=[];
		 if(indexStr) indexArr=indexStr.split(',');
		 if(indexArr.length>0){
			 var data=$scope.data.conditionObj.condition;
			 for(var i=0;i<data.length;i++){
				 if(i==indexArr[0]){
					 if(indexArr.length>1){
						 for(var j=0;j<data[i].condition.length;j++){
							 if(j==indexArr[1]){
								 if(indexArr.length>2){
									 for(var z=0;z<data[i].condition[j].condition.length;z++){
										 if(z==indexArr[2]){
											 data[i].condition[j].condition.splice(z, 1);
											 break;
										 }
									 }
								 }else{
									 data[i].condition.splice(j, 1); 
								 }
								 break;
							 }
						 }
					 }else{
						 data.splice(i, 1);
					 } 
					 break;
				 }
				
			 }
			 $scope.data.conditionObj.condition=data;
			 buildConditionTree($scope.data.conditionObj); 
		 }
	 };
	//获取条件总数
	function getyIncaseNum(data){
	  var sum=0;
      for(var i=0;i<data.length;i++){
    	  if(data[i].condition && data[i].condition.length>0){
		    for(var j=0;j<data[i].condition.length;j++){
		    	  if(data[i].condition[j].condition && data[i].condition[j].condition.length>0){
		    		    for(var z=0;z<data[i].condition[j].condition.length;z++){
		  		    		  sum++;
		  		      } 
		    	  }else{
		    		  sum++;
		    	  }
		      } 
    	  }else{
    		  sum++;
    	  }
      }
      return sum;
    }
   function buildData(conditionData,pathArr,tableArr,branchArr){
	  var curYIndex=0;
	  var data=conditionData.condition;
	  //算三级节点总共分支个数
	  var yIncaseNum=getyIncaseNum(conditionData.condition) >1 ? getyIncaseNum(conditionData.condition):1;
	  //第一个节点 Mtop 最后一个节点Mtop+YIncase*（yIncaseNum-1）
	  var startY1=(Mtop*2+YIncase*(yIncaseNum-1))/2;
	  
	  branchArr.push({
		  newjunction:conditionData.junction,
		  oldjunction:conditionData.junction,
		  style:"left:"+(Mleft-35)+"px; top:"+(startY1-15)+"px",
		  indexStr:'root',
		  condition:'noDel'
	  })
      for(var i=0;i<data.length;i++){
    	  if(data[i].condition){
    		  var curchildNum=getyIncaseNum(data[i].condition);
    		  //如果该节点，没有分支条件，则保留节点
    		  var isEmpty0=false;
	    		  if(curchildNum <1){
	    			 curchildNum=1;
	    			 isEmpty0=true;
	    		  }
    		  //计算一级节点和该节点的连线
    		  var startY2=(Mtop*2+YIncase*(2*curYIndex+curchildNum-1))/2;
    		  var path='M'+(Mleft)+','+startY1+'C'+(Mleft)+','+startY2
		           +','+(Mleft)+','+startY2+','+(Mleft+XIncase)+','+startY2;
		    	 pathArr.push(path);
		   	  branchArr.push({
    			  newjunction:data[i].junction,
				  oldjunction:data[i].junction,
    			  style:"left:"+(Mleft+XIncase-35)+"px; top:"+(startY2-15)+"px",
    			  indexStr:''+i,
    		  })
    		  if(isEmpty0)  curYIndex++;

    		  for(var j=0;j<data[i].condition.length;j++){
				  //如果第三级节点有分支，则计算分支
  		    	  if(data[i].condition[j].condition){
  		    		  //计算改节点分支个数
  		    		  var curchildNum2=getyIncaseNum(data[i].condition[j].condition);
  		    		  //如果该节点，没有分支条件，则保留节点,默认其占一行
  		    		  var isEmpty=false;
  		    		  if(curchildNum2 <1){
  		    			 curchildNum2=1;
  		    			 isEmpty=true;
  		    		  }
  		    		  // 改分支第一个节点纵坐标= Mtop+YIncase*curYIndex  上一个节点纵坐标加上递增值 
  		    		  // 改分支最后节点纵坐标=改分支第一个节点纵坐标 +计算改节点分支个数*y递增值 Mtop+YIncase*curYIndex+YIncase*(curchildNum2-1)
  		    		  // 计算改节点的纵坐标。（改分支第一个节点纵坐标+该分支的最后一个纵坐标）/2
  		    		  // 该节点起始点纵坐标=  Mtop+YIncase*curYIndex+ Mtop+YIncase*curYIndex+YIncase*(curchildNum2-1)		    		  
  		    		  var startY3=(Mtop*2+YIncase*(2*curYIndex+curchildNum2-1))/2;
  		    		  //改分支指引线的终点的纵坐标等于startY2
  		    		  var path='M'+(Mleft+XIncase)+','+startY2+'C'+(Mleft+XIncase)+','+startY3
  				      +','+(Mleft+XIncase)+','+startY3+','+(Mleft+XIncase*2)+','+startY3;
  				      pathArr.push(path);
  					  branchArr.push({
  						  newjunction:data[i].condition[j].junction,
  						  oldjunction:data[i].condition[j].junction,
    	    			  style:"left:"+(Mleft+XIncase*2-35)+"px; top:"+(startY3-15)+"px",
    	    			  indexStr:i+','+j,
    	    			  condition:'noAdd'
    	    		  })
    	    		  if(isEmpty){
   		    			 curYIndex++;
   		    		  }
  		    		  for(var z=0;z<data[i].condition[j].condition.length;z++){
  		    		    	 var obj=data[i].condition[j].condition[z];
  		  		    		 obj.style="left:"+(Mleft+XIncase*3)+"px; top:"+(Mtop+YIncase*curYIndex-19)+"px";
  		  		    		 obj.indexStr=i+","+j+","+z;
  		  		    		 tableArr.push(obj);
  		  		    		 //改分支下所有节点的起始纵坐标为startY3，终点纵坐标根据该节点位置决定
  		  		    		 var path='M'+(Mleft+XIncase*2)+','+startY3+'C'+(Mleft+XIncase*2)+','+(Mtop+YIncase*curYIndex)
  		  		    		 +','+(Mleft+XIncase*2)+','+(Mtop+YIncase*curYIndex)+','+(Mleft+XIncase*3)+','+(Mtop+YIncase*curYIndex);
  		  		    		 pathArr.push(path);
  		  		    		 curYIndex++;
  		  		       } 
  		    	  }else {
  		    		 //第二级节点没有分支
  		    		 var obj=data[i].condition[j];
  		    		 obj.style="left:"+(Mleft+XIncase*2)+"px; top:"+(Mtop+YIncase*curYIndex-19)+"px";
  		    		 obj.indexStr=i+","+j;
  		    		 tableArr.push(obj);
  		    		 //计算改分支的路径。因为是第二节点。startY2
  		    		 var path='M'+(Mleft+XIncase)+','+startY2+'C'+(Mleft+XIncase)+','+(Mtop+YIncase*curYIndex)
  		    		 +','+(Mleft+XIncase)+','+(Mtop+YIncase*curYIndex)+','+(Mleft+XIncase*2)+','+(Mtop+YIncase*curYIndex);
  		    		 pathArr.push(path);
  		    		 curYIndex++;
  		    	  }
  		      }  		 
    	  }else {
    		 var obj=data[i];
    		 obj.style="left:"+(Mleft+XIncase)+"px; top:"+(Mtop+YIncase*curYIndex-19)+"px";
    		 obj.indexStr=''+i;
    		 tableArr.push(obj);
    		 var path='M'+Mleft+','+startY1+'C'+Mleft+','+(Mtop+YIncase*curYIndex)
    		 +','+Mleft+','+(Mtop+YIncase*curYIndex)+','+(Mleft+XIncase)+','+(Mtop+YIncase*curYIndex);
    		 pathArr.push(path);
    		 curYIndex++;
    	  }
      }
    }
   function getConditionStr(obj){
	   if(!obj || !obj.condition) return;
	      var returnData={};
		  var data=obj.condition;
          var res='';
          var desString='';
	      for(var i=0;i<data.length;i++){
	    	  //第一节点的表达式
	    	  var curcondStr1='';
	    	  var curcondDes1='';
	    	  //如果第一节点有分支则计算
	    	  if(data[i].condition && data[i].condition.length>0){
	    		  curcondStr1+='('
	    		  curcondDes1+='('
	    		  for(var j=0;j<data[i].condition.length;j++){
	    			//第二节点的表达式
	    	    	  var curcondStr2='';
	    	    	  var curcondDes2='';
					  //如果第三级节点有分支，则计算分支
	  		    	  if(data[i].condition[j].condition && data[i].condition[j].condition.length>0){
	  		    		curcondStr2+='(';
	  		    		curcondDes2+='(';
	  		    		var curcondStr3='';
	  		    		var curcondDes3='';
	  		    		  for(var z=0;z<data[i].condition[j].condition.length;z++){
	  		    			curcondStr3=  getConditionStrByObj(data[i].condition[j].condition[z]);
	  		    			curcondDes3=  getConditionStrByObj(data[i].condition[j].condition[z],'des');
	  		    			if(curcondStr3 !=''){
	  		    			  //循环拼接第三节点的条件
		  	  			    	  if(z==0){//第一个不拼接运算符
		  	  			    		curcondStr2+=curcondStr3;
		  	  			    	    curcondDes2+=curcondDes3;
		  	  			    	  }else{
		  	  			    		curcondStr2+=getjunction(data[i].condition[j].junction)+curcondStr3;
		  	  			    	    curcondDes2+=getjunction(data[i].condition[j].junction)+curcondDes3;
		  	  			    	  }
	  		    			}
	  		  		       } 
	  		    		curcondStr2+=')';
	  		    		curcondDes2+=')';
	  		    	  }else if(data[i].condition[j].property) {
	  		    		//第二节点没有分只
	  		    		curcondStr2=getConditionStrByObj(data[i].condition[j]);
	  		    		curcondDes2=getConditionStrByObj(data[i].condition[j],'des');

	  		    	  }
	  		    	  if(curcondStr2 !=''){
	  		    	  	  //循环拼接第二节点的条件
	  			    	  if(j==0){//第一个不拼接运算符
	  			    		curcondStr1+=curcondStr2;
	  			    		curcondDes1+=curcondDes2;
	  			    	  }else{
	  			    		curcondStr1+=getjunction(data[i].junction)+curcondStr2;
	  			    		curcondDes1+=getjunction(data[i].junction)+curcondDes2;
	  			    	  }
	  		    	  }
	  		      } 
	    		  curcondStr1+=')';
	    		  curcondDes1+=')';
	    	  }else  if(data[i].property){
	    		  //第一节点没有分只
	    		  curcondStr1=getConditionStrByObj(data[i]);
	    		  curcondDes1=getConditionStrByObj(data[i],'des');
	    	  }
	    	  if(curcondStr1 !=''){
	    	 	  //循环拼接第一节点的条件
		    	  if(i==0){//第一个不拼接运算符
		    		  res+=curcondStr1;
		    		  desString+=curcondDes1;
		    	  }else{
		    		  res+=getjunction(obj.junction)+curcondStr1;
		    		  desString+=getjunction(obj.junction)+curcondDes1;
		    	  }
	    	  }
	      }
	      returnData.conditionString= res;
	      returnData.conditionDes= desString;
	      return returnData;
   }
   
   function getjunction(str){
	   var res='';
	   switch(str){
	      case 'and' :
	    	  res=  ' && ';
	      break;
	      case 'or' :
	    	  res=  ' || ';
	      break;
	   }
	   return res;
    }
   
   function getConditionStrByObj(obj,type){
	   var res='';
	   switch(obj.dataType){
	      case 'varchar' :
	    	  res= buildStringCondition(obj,type);
	      break;
	      case 'date' :
	    	  res=  buildDateCondition(obj,type);
	      break;
	      case 'number' :
	    	  res=  buildIntCondition(obj,type);
	      break;
	   }
	   return res;
    }
   
   function buildDateCondition(obj,type){	
	   var value=obj.value;
	   var valueDes='';
	   var property=obj.property;
	   if(obj.compType==1){
		   value='"'+obj.value+'"';
		   valueDes=value;
	   }else{
		   valueDes=obj.changeDesc;
	   }
	   if(type=='des'){
		   property=obj.chooseDesc;
		   value=valueDes;
		   switch(obj.operator){
		      case '1' :
		    	  res= property+'=='+ value;
		      break;
		      case '2' :
		    	  res= property+'!='+ value;
		      break;
		      case '3' :
		    	  res= property+'>'+ value;
		      break;
		      case '4' :
		    	  res= property+'<'+ value;
		      break;
		   }
	   }else{
		   switch(obj.operator){
		      case '1' :
		    	  res= 'scriptImpl.isDateEquals('+property+','+ value+')';
		      break;
		      case '2' :
		    	  res= '!scriptImpl.isDateEquals('+property+','+ value+')';
		      break;
		      case '3' :
		    	  res='scriptImpl.isDateLarge('+property+','+ value+')';
		      break;
		      case '4' :
		    	  res='scriptImpl.isDateLittle('+property+','+ value+')';
		      break;
		   }
	   }

	   return res;   
   }
   
   function buildStringCondition(obj,type){	
	   var value=obj.value;
	   var valueDes='';
	   var property=obj.property;
	   if(obj.compType==1){
		   value='"'+obj.value+'"';
		   valueDes=value;
	   }else{
		   valueDes=obj.changeDesc;
	   }
	   if(type=='des'){
		   property=obj.chooseDesc;
		   value=valueDes;
		   switch(obj.operator){
		      case '1' :
		    	  res=property + '=='+value ;
		      break;
		      case '2' :
		    	  res=property + '!='+value ;
		      case '3' :
		    	  res=property + '>'+value ;
		      case '4' :
		    	  res=property + '<'+value ;
		      break;
		      case '5' :
		    	  res=property + 'contains'+value ;
		      break;
		      case '6' :
		    	  res=property + '! contains'+value ;
		      break;
		   }
	   }else{
		   switch(obj.operator){
		      case '1' :
		    	  res= 'scriptImpl.equals('+property+','+value+')' ;
		      break;
		      case '2' :
		    	  res= '!scriptImpl.equals('+property+','+value+')';
		      case '3' :
		    	  res= 'scriptImpl.LargeThen('+property+','+value+')';
		      case '4' :
		    	  res= 'scriptImpl.littleThen('+property+','+value+')';
		      break;
		      case '5' :
		    	  res='scriptImpl.contains('+property+','+value+')';
		      break;
		      case '6' :
		    	  res='!scriptImpl.contains('+property+','+value+')';
		      break;
		   }
	   }
	
	   return res;   
   }
   
   function buildIntCondition(obj,type){
	   var value=obj.value;
	   var valueDes='';
	   var property=obj.property;
	   if(obj.compType==1){
		   value=obj.value;
		   valueDes=value;
	   }else{
		   valueDes=obj.changeDesc;
	   }
	   if(type=='des'){
		   property=obj.chooseDesc;
		   value=valueDes;
	   }
	   var res='';
	   switch(obj.operator){
	      case '1' :
	    	  res= property+'=='+value ;
	      break;
	      case '2' :
	    	  res=  property+'!='+value;
	      break;
	      case '3' :
	    	  res=property+'>'+value;
	      break;
	      case '4' :
	    	  res=property+'<'+value;
	      break;
	   }
	   return res;
   }
	
	$scope.previewCondition = function(){
		if(!$scope.data.conditionObj ) return ;
		var data =getConditionStr($scope.data.conditionObj);
		data.conditionObj=JSON.stringify($scope.data.conditionObj);
	    $('#previewarea').val(data.conditionString);
	};
	$scope.save = function(){
		if (!$scope.form.$valid) return;
		if(!$scope.data.conditionObj ) return ;
		var data =getConditionStr($scope.data.conditionObj);
		data.conditionObj=JSON.stringify($scope.data.conditionObj);
		$scope.data.conditionString=data.conditionString;
		$scope.data.conditionDes=data.conditionDes;	
		var rtn = baseService.post("save", $scope.data);
		rtn.then(function(data) {
			if (data.result == 1){
				$.topCall.toast("提示信息",$scope.data.isAdd? "添加成功！":"保存成功！");
				window.parent.location.reload();
			}else{
				dialogService.fail("", data.cause);
			}
		})
	};
	$scope.buildInit($scope.pageParam.defId);
}

/**
 * 权限设置控制器
 * @returns
 */
function filedAuthSettingCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.formSelectArr;
	}
	
	$scope.right = $scope.pageParam.data && $scope.pageParam.data.right||"";

	$scope.permissionList = $scope.pageParam.data.permissionList || [];
	//是否显示需要配置项目。
	$scope.showNeedRight=true;
	
	$scope.init=function(){
		var needSetting=[];
		//不需要配置
		var noNeedSetting=[];
		for(var i=0;i<$scope.permissionList.length;i++){
			var obj=$scope.permissionList[i];
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
	
	//初始化。
	$scope.init();
	
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

/**
 * 流程定义选择控制器
 * @returns
 */
function bpmDefSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
    
	$scope.formSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.formSelectArr = $scope.pageParam.data;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.formSelectArr.push(data);
			$scope.formSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.formSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('formSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.formSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.bpmFormTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.formSelectArr[0];
		return $scope.formSelectArr;
	}
	
}

/**
 * 流程定义选择控制器
 * @returns
 */
function formBpmDefSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.boCode = $scope.pageParam.boCode;
	$scope.ArrayTool = ArrayToolService;
    
	$scope.formSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.formSelectArr = $scope.pageParam.data;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.formSelectArr.push(data);
			$scope.formSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.formSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('formSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.formSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.bpmFormTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.formSelectArr[0];
		return $scope.formSelectArr;
	}
	
}

/**
 * 流程定义中实例列表控制器
 * @returns
 */
function defInstanceDetailCtrl($scope,baseService,dialogService,$stateParams){
	$scope.defId=$stateParams.defId;
/*	$scope.$on("table:ready", function(t, m){
		if($stateParams.defId) m.addQuery({property: 'procDefId', operation: 'equal', value:$stateParams.defId });
		  m.query();
	});*/
}

/**
 * 流程分管授权列表控制器
 * @returns
 */
function flowAuthorizeListCtrl($scope,baseService,dialogService){
	$scope.edit = function(data,action){
	   var title = action == "edit" ? "编辑分管授权" : "添加分管授权";
	   var id=data?data.id:'';
        //跳转操作页面
        dialogService.sidebar("flow.authorizeListEdit", {bodyClose: false, width: '60%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
        	$scope.dataTable.query();
        });
	}
	
	$scope.getDetail = function(data){
		   var title = "查看分管授权";
		   var id=data?data.id:'';
	        //跳转操作页面
	        dialogService.sidebar("flow.authorizeListGet", {bodyClose: false, width: '60%', pageParam: {id:id,title:title}});
		}
}

/**
 * 流程分管授权配置控制器
 * @returns
 */
function flowAuthorizeEditCtrl($scope,baseService,dialogService){
	var defaultPermissionList
	$scope.load=function(){
		var url="${bpmModel}/flow/defAuthorize/v1/defAuthorizeGet?id="+$scope.pageParam.id
		baseService.get(url).then(function(result){
			handData(result);
			$scope.data=result;
		})
	}
	baseService.get("${bpmModel}/flow/defAuthorize/v1/getPermissionList").then(function(result){
		defaultPermissionList=result;
	});
	
	$scope.load();
	/**
	 * 选择流程定义。
	 */
	function checkExist(name,val,aryChecked){
		for(var i=0;i<aryChecked.length;i++){
			var obj=aryChecked[i];
			if(obj[name]==val) return true;
		}
		return false;
	}
	
	$scope.selectDef=function(){
		dialogService.page("flow-bpmDefSelector", {
		    title:'流程选择器'
		 }).then(function(aryDef){
			 for(var i=0;i<aryDef.length;i++){
					var json=aryDef[i];
					var rightObj={"m_edit":false,"m_del":false,"m_start":false,"m_set":false,"m_clean":false,"i_del":false};
					var obj={"defName":json.name,"defKey":json.defKey,"right":rightObj};
					var isExist=checkExist("defKey",json.defKey,$scope.data.defNameJson);
					if(!isExist){
						$scope.data.defNameJson.push(obj);
					}
			 }
		 });
	};
	
	/**
	 * 设置设置权限。
	 * ownerNameJson 格式。
	 * [{type:"everyone",title:"所有人"},{type:"user",title:"用户",id:"1,2",name:"ray,tom"}]
	 */
	$scope.setAuth=function(){ 
		var conf={
			  right:$scope.data.ownerNameJson,
			  permissionList:defaultPermissionList
		   }
		dialogService.page("flow-filedAuthSetting", {
		    title:'流程选择器',
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
				$scope.data.ownerNameJson=tmpAry;
		 });
	}
	
	/**
	 * 删除选中的流程。
	 */
	$scope.delDef=function(){
		var aryJson=$scope.data.defNameJson;
		
		for(var i=aryJson.length-1;i>=0;i--){
			var obj=aryJson[i];
			if(obj.selected){
				aryJson.splice(i,1); 
			}
		}
	}
	
	/**
	 * 保存授权规则。
	 */
	$scope.save=function(){
		if($scope.data.ownerNameJson.length==0){
			dialogService.warn("请选择授权人员名称!");
            return;
		}
		if ($scope.data.defNameJson.length==0){
			dialogService.warn("请选择要授权的流程!");
            return;
		}
		if($scope.bpmDefAuthorizeForm.$invalid) {
			dialogService.warn("表单验证不通过,请检查表单!");
			return;
		}
		var obj=handSave($scope.data);
		var url="${bpmModel}/flow/defAuthorize/v1/save";
		baseService.post(url,obj).then(function(data){
			if (data.state) {
				dialogService.success("保存授权成功!").then(function(){
					$scope.close();
				 });
			} else {
				dialogService.fail(data.message);
			}
		})
	};
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	};
	
	/**
	 * 权限全选。
	 */
	$scope.checkAll=function(event,str){
		var checked=event.currentTarget.checked;
		var ary= $scope.data.defNameJson;
		for(var i=0;i<ary.length;i++){
			var obj=ary[i];
			obj.right =obj.right==''?{}:obj.right;
			obj.right[str]=checked;
		}
	};
	
	/**
	 * 全选所有的流程定义。
	 */
	$scope.checkAllRow=function(event){
		var checked=event.currentTarget.checked;
		var ary= $scope.data.defNameJson;
		for(var i=0;i<ary.length;i++){
			ary[i].selected=checked;
		}
	}
	
	/**
	 * 保存时处理json。
	 */
	function handSave(data){
		var obj =angular.copy(data);
		obj.authorizeTypes=angular.toJson(data.authorizeTypes);
		obj.defNameJson=angular.toJson(data.defNameJson);
		obj.ownerNameJson=angular.toJson(data.ownerNameJson);
		for(var i=0;i<obj.defNameJson.length;i++){
			var tmp=obj.defNameJson[i];
			tmp.right=angular.toJson(tmp.right)
		}
		if(obj.bpmDefAuthorizeTypeList.length==0) delete obj.bpmDefAuthorizeTypeList;
		return obj;
	}
	
	/**
	 * 数据转成JSON对象。
	 */
	function handData(data){
		if(data.authorizeTypes==""){
			data.authorizeTypes={"start":false,"management":true,"task":false,"instance":false};
		}
		else{
			data.authorizeTypes=angular.fromJson(data.authorizeTypes);
		}
		data.defNameJson=angular.fromJson(data.defNameJson);
		for(var i=0;i<data.defNameJson.length;i++){
			var tmp=data.defNameJson[i];
			if(tmp.right !='')tmp.right=angular.fromJson(tmp.right)
		}
		data.ownerNameJson=angular.fromJson(data.ownerNameJson);
	}
}

/**
 * 流程消息模板列表控制器
 * @returns
 */
function flowMsgTemplateListCtrl($scope,baseService,dialogService){
	var statusArr=[{"key":'taskCreate',"value":'任务创建通知',"css":'black'},
				{"key":'bpmCommuSend',"value":'任务沟通',"css":'black'},
				{"key":'bpmCommuFeedBack',"value":'通知沟通人',"css":'black'},
				{"key":'bpmnTaskTrans',"value":'任务流转默认',"css":'black'},
				{"key":'bpmHandTo',"value":'任务转交通知',"css":'black'},
				{"key":'addSignTask',"value":'加签通知',"css":'black'},
				{"key":'taskComplete',"value":'任务完成通知',"css":'black'},
				{"key":'taskBack',"value":'任务驳回通知',"css":'black'},
				{"key":'processEnd',"value":'流程结束通知',"css":'black'},
				{"key":'bpmnApproval',"value":'审批提醒',"css":'black'},
				{"key":'bpmnBack',"value":'驳回提醒',"css":'black'},
				{"key":'bpmnRecover',"value":'撤销提醒',"css":'black'},
				{"key":'bpmTransCancel',"value":'撤销流转',"css":'black'},
				{"key":'bpmnAgent',"value":'代理任务审批',"css":'black'},
				{"key":'bpmnDelegate',"value":'通知被代理人',"css":'black'},
				{"key":'bpmEndProcess',"value":'流程终止',"css":'black'},
				{"key":'bpmTransCancel',"value":'撤销流转代办',"css":'black'},
				{"key":'copyTo',"value":'流程实例抄送',"css":'black'},
				{"key":'bpmTransFeedBack',"value":'流转反馈通知',"css":'black'},
				{"key":'taskCancel',"value":'任务取消通知',"css":'black'},
				{"key":'bpmTurnCancel',"value":'转办取消通知',"css":'black'}];
	
	$scope.statusObj={};
	for(var i=0,a;a=statusArr[i++];){
		$scope.statusObj[a.key]=a.value;
	}
	
	$scope.edit = function(data,action){
		   var title = action == "edit" ? "编辑消息模板" : "添加消息模板";
		   var id=data?data.id:'';
	        //跳转操作页面
	        dialogService.sidebar("flow.msgTemplateListEdit", {bodyClose: false, width: '60%', pageParam: {id:id,title:title}});
	        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
	        	$scope.dataTable.query();
	        });
		}
		
	$scope.getDetail = function(data){
		   var title = "查看消息模板";
		   var id=data?data.id:'';
	        //跳转操作页面
	        dialogService.sidebar("flow.msgTemplateListGET", {bodyClose: false, width: '60%', pageParam: {id:id,title:title}});
	}
}

/**
 * 流程消息模板编辑控制器
 * @returns
 */
function flowMsgTemplateEditCtrl($scope, baseService, dialogService){
	$scope.prop={};//初始化
	$scope.ueditorReady = false;
	  var service = {
	    		detail : function(Template,callback){
	    			if(!Template ||!Template.id ){
	    				if(callback){
	    					callback();
	    				}
	    				return;
	    			}
	    			baseService.get('${bpmModel}/flow/MsgTemplate/v1/getById',{id:Template.id}).then(function(data){
	    				if(callback){
		    				callback(data);
		    			 }
	    			})
	    		},
	    		
	    		saveData : function(params,callback){
	    			baseService.post('${bpmModel}/flow/MsgTemplate/v1/save',params).then(function(data){
	    				if(callback){
	    					callback(data);
	    				}
	    			});
	    		}
	    }   	

	  service.detail({id:$scope.pageParam.id},function(data){
			$scope.prop.template=data;
			//删除之前的重新初始化一个新的。
			UE.delEditor('htmlMsg');
			var ue=UE.getEditor('htmlMsg');
			//监听初始化完成时间，给其设置初始值
	    	ue.addListener("ready",function(editor){
	    		if($scope.prop.template) ue.setContent($scope.prop.template.html);
			});
	    	InitMirror.init(100);
		});

     $("a[name='signResult']").click(function(){
		    addToTextarea($(this).attr("result"));
		 });
     
   //将条件表达式追加到脚本输入框内
    function addToTextarea(str){
		InitMirror.editor.insertCode(str);
    };
	    
	$scope.changeType = function(){
		$scope.prop.template.key = $scope.prop.template.typeKey+"-";
	}
	
	$scope.save = function(){
		InitMirror.save();
		$scope.prop.template.plain=$("#plain").val();
		$scope.prop.template.subject=$("#subject").val();
		if (!$scope.myForm.$valid){ 
			dialogService.fail("表单校验失败！");
			return;
		}
		$scope.prop.template.html=ue.getContent();
		if(!$scope.prop.template.isDefault){
			$scope.prop.template.isDefault=0;
		}
		service.saveData($scope.prop.template,function(data){
			if (data.state) {
				dialogService.success(data.message).then(function(){
					$scope.close();
				 });
			} else {
				dialogService.fail(data.message);
			}
		})
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	//普通是否数组
	$scope.typeSelect=[
		{value:'taskCreate',key:'任务创建通知'},
		{value:'bpmCommuSend',key:'任务沟通'},
		{value:'bpmCommuFeedBack',key:'通知沟通人'},
		{value:'bpmnTaskTrans',key:'任务流转默认'},
		{value:'bpmHandTo',key:'任务转交通知'},
		{value:'addSignTask',key:'加签通知'},
		{value:'taskComplete',key:'任务完成通知'},
		{value:'taskBack',key:'任务驳回通知'},
		{value:'processEnd',key:'流程结束通知'},
		{value:'bpmnApproval',key:'审批提醒'},
		{value:'bpmnBack',key:'驳回提醒'},
		{value:'bpmnRecover',key:'撤销提醒'},
		{value:'bpmnAgent',key:'代理任务审批'},
		{value:'bpmnDelegate',key:'通知被代理人'},
		{value:'bpmEndProcess',key:'终止流程'},
		{value:'bpmTransCancel',key:'撤销流转'},
		{value:'copyTo',key:'流程实例抄送'}
	];
}

/**
 * 流程消息模板查看控制器
 * @returns
 */
function flowMsgTemplateGetCtrl($scope, baseService, dialogService){
	$scope.prop={};//初始化
	var service = {
		detail : function(Template,callback){
			if(!Template ||!Template.id ){
				if(callback){
					callback();
				}
				return;
			}
			baseService.get('${bpmModel}/flow/MsgTemplate/v1/getById',{id:Template.id}).then(function(data){
				if(callback){
					callback(data);
				}
			})
		}
	};

	service.detail({id:$scope.pageParam.id},function(data){
		$scope.sysMsgTemplate=data;
		//编辑器准备好了直接设置值。
	});
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	//普通是否数组
	$scope.typeSelect=[
		{value:'taskCreate',key:'任务创建通知'},
		{value:'bpmCommuSend',key:'任务沟通'},
		{value:'bpmCommuFeedBack',key:'通知沟通人'},
		{value:'bpmnTaskTrans',key:'任务流转默认'},
		{value:'bpmHandTo',key:'任务转交通知'},
		{value:'addSignTask',key:'加签通知'},
		{value:'taskComplete',key:'任务完成通知'},
		{value:'taskBack',key:'任务驳回通知'},
		{value:'processEnd',key:'流程结束通知'},
		{value:'bpmnApproval',key:'审批提醒'},
		{value:'bpmnBack',key:'驳回提醒'},
		{value:'bpmnRecover',key:'撤销提醒'},
		{value:'bpmnAgent',key:'代理任务审批'},
		{value:'bpmnDelegate',key:'通知被代理人'},
		{value:'bpmEndProcess',key:'终止流程'},
		{value:'bpmTransCancel',key:'撤销流转'},
		{value:'copyTo',key:'流程实例抄送'}
	];
	
	$scope.statusObj={};
	for(var i=0,a;a=$scope.typeSelect[i++];){
		$scope.statusObj[a.value]=a.key;
	}
}

/**
 * 流程实例明细控制器
 */
function instanceDetailCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		dialogService.fail("必须传入流程实例ID");
		return;
	}
	// 流程图懒加载
	$scope.selectImage = function(url){
		$scope.imageUrl = url;
	}
	// 审批历史懒加载
	$scope.selectHistory = function(url){
		$scope.historyUrl = url;
	}
	// 流程实例表单懒加载
	$scope.selectForm = function(url){
		$scope.formUrl = url;
	}
	$scope.instance = {};
	// 获取流程实例详情
	baseService.get('${bpmRunTime}/runtime/instance/v1/get?id=' + $stateParams.id)
			   .then(function(r){
				   $scope.instance = r;
			   });
}

/**
 * 启动流程选择人员控制器
 */
function instanceSendNodeUsersCtrl($scope, baseService, dialogService){
	if(!$scope.pageParam.defId){
		dialogService.fail("必须传入流程定义ID");
		return;
	}
	// 获取流程实例详情
	baseService.get('${bpmRunTime}/runtime/instance/v1/sendNodeUsers?defId=' + $scope.pageParam.defId+"&nodeId=")
			   .then(function(r){
				   $scope.data = r;
			   });
	
	// 选择人员
	$scope.selectUser = function(node){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {data:node['userList']}})
		 .then(function(result){
			 node['userList']=result;
			 $scope.selectUsers = result;
			 var accounts=[];
		     var name=[];
		     $(result).each(function(i,data){
				 accounts.push({id:data.id,type:"user", name:data.fullname});
				 name.push(data.fullname);
			});
			 node.executors =JSON.stringify(accounts);
			 node.userNames = name.toString();
		 });
	}
	
	$scope.pageSure = function (){
		var json=[];
		for(var i=0,d;d=$scope.data[i++];){
			json.push({nodeId:d.nodeId,executors:d.executors})
		}
	    return json;
	}
}


/**
 * 启动流程选择跳转节点控制器
 */
function instanceSelectDestinationCtrl($scope, baseService, dialogService){
	if(!$scope.pageParam.defId){
		dialogService.fail("必须传入流程定义ID");
		return;
	}

	$scope.jumpTypeStr = "";
	$scope.selectNode = '';
	$scope.selectUsers=[];
	
	baseService.get('${bpmRunTime}/runtime/instance/v1/selectDestination?defId=' + $scope.pageParam.defId)
	   .then(function(r){
		   $scope.jumpTypeStr=r.jumpType;
		   $scope.jumpType = angular.copy($scope.jumpTypeStr).split(",")[0];
		   $scope.data = r;
	   });
	
	$scope.chooseUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {data:$scope.selectUsers}})
		 .then(function(data){
			 $scope.selectUsers=data;
			 var html = "";
				for(var i = 0 ,user; user=data[i++];){
					html = html + '<label class="checkbox-inline" name="nodeUserLabel"><input type="checkbox" name="nodeUser"  checked="checked" value="'+user.id+","+user.fullname+',user" />'+user.fullname+'</label>'
				}
				$("span[name='nodeUserSpan']").html(html);
		 });
	};
	
	$scope.pageSure = function (){
		var destination = $("[name='destination']").val();
	 	var userArray = [];
	 	var nodeUsers =[];
	 	$("input[name='nodeUser']:checked").each(function (){
			var strVal = $(this).val().split(",");
			var user = {
				id:strVal[0],
				name:strVal[1],
				type:strVal[2]
			};
			userArray.push(user);
		});
	 	var nodeUser ={
				nodeId:destination,
				executors:userArray
		};
	 	nodeUsers.push(nodeUser);
	 	return nodeUsers;
	}
}

/**
 * 查看流程图控制器
 */
function flowImageCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		return;
	}
	var paramStr = $scope.pageParam?$scope.pageParam.instId?'proInstId':'defId':'proInstId';
	
	// 流程节点状态图例
	$scope.legends = [
		{"color": "#FF0000", "title": "待审批"},
		{"color": "#F89800", "title": "提交"},
		{"color": "#FFE76E", "title": "重新提交"},
		{"color": "#00FF00", "title": "同意"},
		{"color": "#C33A1F", "title": "挂起"},
		{"color": "#0000FF", "title": "反对"},
		{"color": "#8A0902", "title": "驳回"},
		{"color": "#FFA500", "title": "驳回到发起人"},
		{"color": "#023B62", "title": "撤销"},
		{"color": "#F23B62", "title": "撤销到发起人"},
		{"color": "#338848", "title": "会签通过"},
		{"color": "#82B7D7", "title": "会签不通过"},
		{"color": "#EEAF97", "title": "人工终止"},
		{"color": "#4A4A4A", "title": "完成"}
	];
	
	$scope.flow = {
		instanceId: $stateParams.id
	};
	$scope.imageBase64s = {};
	
	var url = "${bpmRunTime}/runtime/instance/v1/instanceFlowImage?"+paramStr+"="+$scope.flow.instanceId;
	baseService.get(url).then(function(rep){
		$scope.flow = rep;
	});
	
	$scope.getImageBase64 = function(proInstId){
		if(!proInstId)return '';
		if($scope.imageBase64s[proInstId]){
			return $scope.imageBase64s[proInstId];
		}
		var imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?"+paramStr+"=" + proInstId;
		var imageBase64 = '';
		$.ajax({
			url:imageUrl,
			type:'GET',
			dataType:'text',
			async:false,
			success:function(data){
				$scope.imageBase64s[proInstId] = data;
				imageBase64 = data;
			}
		})
		return imageBase64;
	}
}

/**
 * 流程表单权限设置控制器
 * @returns
 */
function flowFormRigthSettingCtrl($scope, baseService, dialogService){
	var _oldPermission = null;
	$scope.tableSn = [];
	
	$scope.init=function(params){
		$scope.param=params;
		baseService.post("${form}/form/rights/v1/getPermission",params).then(function(data) {
			// 使用克隆 
			data.permissionList.push({ type:'none',title:'无' });
			_oldPermission = $.cloneObject(data);
			handleBackData(data);
			var permissionObj={};
			for(var i=0,p;p=data.permissionList[i++];){
				permissionObj[p.type]=p.title;
			}
			$scope.permissionList = permissionObj;
		});
	}
	
	$scope.init($scope.pageParam);
	
	/**
	 * field:某个权限对象 rightType：权限类型 只读-"read" 编辑-"write" 必填-"required"
	 */
	$scope.fieldDialog = function(field, rightType) {
		var tmp = CloneUtil.list(field[rightType]);
		var conf={
				  right:tmp,
				  permissionList:_oldPermission.permissionList
			   }
		dialogService.page("flow-filedAuthSetting", {
		    title:'授权页面',
		    pageParam:{data:conf},
		 }).then(function(data){
			 field[rightType] =  $.cloneObject(data);
		 });
	};
	/**
	 * 
	 */
	$scope.hideColumn = function(field) {
		
		if($scope.checkIshide(field)=='否'){
			field.read =  [{type: "none"}];
			field.required =  [{type: "none"}];
			field.write =  [{type: "none"}];
		}else{
			field.read =  [{type: "everyone"}];
			field.required =  [{type: "none"}];
			field.write =  [{type: "everyone"}];
		}
	
		!$scope.$$phase	&&$scope.$apply();
	};

	/**
	 * 批量权限选择 rightType：权限类型 只读-"read" 编辑-"write" 必填-"required"
	 */
	$scope.clickAll = function(rightType, type) {
		$($scope.subTableList).each(function() {
			for ( var key in this.fields) {
				this.fields[key][rightType] = [ {type : type} ];
			}
		});

		for ( var key in $scope.opinion) {
			$scope.opinion[key][rightType] = [ {type : type} ];
		}
	};

	$scope.rightToDesc = function(right) {
		var desc = "";
		$(right).each(function() {
			if (desc) {
				desc += " 和 ";
			}
			var str = $scope.permissionList[this.type];
			if (this.name) {
				str += ":" + this.name;
			} else if (this.id) {
				str += ":" + this.id;
			}
			desc += str;
		});
		return desc;
	};
	$scope.checkIshide = function(file) {
		var desc = "是";
	    if(file && file.read && file.read.length>0){
	    	if(file.read[0].type!='none'){
	    		desc='否';
	    		return desc;
	    	}
	    }
	    if(file && file.required && file.required.length>0){
	    	if(file.required[0].type!='none'){
	    		desc='否';
	    		return desc;
	    	}
	    }
	    if(file && file.write && file.write.length>0){
	    	if(file.write[0].type!='none'){
	    		desc='否';
	    		return desc;
	    	}
	    }
		return desc;
	};
	
	$scope.checkIsAllhide = function(list) {
		if(list && list.constructor.name=='Array'){
		  for(var i=0;i<list.length;i++){
			  var fields=list[i].fields;
				if(fields && fields.constructor.name=='Array'){
					  for(var j=0;j<fields.length;j++){
						  var file=fields[j];
						  if($scope.checkIshide(file)=='否'){
							  return true;
						  }
					  }
					}
		  }
		}
		return false;     
	};
	$scope.hideOrShowAll = function(list) {
		if($scope.checkIsAllhide(list)){
			$scope.hidden();
		}else{
			$scope.edit();
		}  
	};
	$scope.hidden = function() {
		$scope.clickAll("read", "none");
		$scope.clickAll("write", "none");
		$scope.clickAll("required", "none");
	};

	$scope.readOnly = function() {
		$scope.clickAll("read", "everyone");
		$scope.clickAll("write", "none");
		$scope.clickAll("required", "none");
	};

	$scope.edit = function() {
		$scope.clickAll("read", "everyone");
		$scope.clickAll("write", "everyone");
		$scope.clickAll("required", "none");
	};

	$scope.mustFill = function() {
		$scope.clickAll("read", "everyone");
		$scope.clickAll("write", "everyone");
		$scope.clickAll("required", "everyone");
	};

	$scope.pageSure = function() {
		var param={};
		angular.extend(param, $scope.param);
	
		// 提交前拼装回json
		param.permission={};
		param.permission.table = {};
		var tmp = $.cloneObject($scope.subTableList);
		$(tmp).each(function() {
			var _fields = {};
			$(this.fields).each(function(){
				_fields[this.fieldName] = this;
			});
			this.fields = _fields;
			param.permission.table[this.tableName] = this;
		});
		
		//如果为实例情况，清除读写权限。
		if(param.type=="2"){
			handPermissionData(param.permission);
		}
		param.permission.opinion = $scope.opinion;
		param.permission = angular.toJson(param.permission);
		return baseService.post("${form}/form/rights/v1/save", param);
	};
	
	//去除读写权限。
	function handPermissionData(json){
		//param.permission
		var tableJson=json.table;
		//遍历表
		for(var key in tableJson){
			//获取字段
			var fields=tableJson[key].fields;
			//遍历字段
			for(var fieleName  in fields){
				//字段信息
				var field=fields[fieleName];
				delete field.write;
				delete field.required;
			}
		}
		
		var opinions=json.opinion;
		if(!opinions) return;
		
		for(var key in opinions){
			var opinion=opinions[key];
			delete opinion.write;
			delete opinion.required;
		}
	}
	
	/**
	 * 获取默认数据
	 */
	$scope.getDefaultByFormKey = function() {
		baseService.post("${form}/form/rights/v1/getDefaultByFormKey?formKey="+$scope.pageParam.formKey+"&type=1", $scope.pageParam).then(function(data) {
			handleBackData(data);
		});
	};
	
	function deepMerge(obj1, obj2) {
	    var key;
	    for(key in obj2) {
	        // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
	        if(!obj2.hasOwnProperty(key)) continue;
	    	obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ?
	        deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key];
	    }
	    return obj1;
	}
	
	$scope.addNewField = function() {
		baseService.postForm("getDefaultByFormKey", param).then(function(data) {
			if(_oldPermission){
				// 不存在的字段，添加进来
				deepMerge(data,_oldPermission);
			}
			handleBackData(data);
		});
	};
	
	/**
	 * 处理后台来的权限数据
	 */
	function handleBackData(data){
		$scope.tableSn = data.tableSn;
		data = data.json;
		$scope.subTableList = [];
		$scope.opinion = data.opinion;
		angular.forEach($scope.tableSn, function(obj,index,array){
			var temp = data.table[obj.name_];
			temp.tableName = obj.name_;

			var tempArr = [];
			for( var fieldName in  temp.fields ){
				var fieldTemp = temp.fields[fieldName];
				fieldTemp.fieldName = fieldName;
				tempArr.push(fieldTemp);
			}
			temp.fields = tempArr;
			
			$scope.subTableList.push(temp);
		});
	}
}

/**
 * 审批历史控制器
 */
function flowOpinionCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		return;
	}
	
	var url = "${bpmRunTime}/runtime/instance/v1/instanceFlowOpinions?instId=" + $stateParams.id;
	baseService.get(url).then(function(rep){
		$scope.opinionList = rep;
	});
	$scope.switch = function(event){
        var target = event.target;
        if (!$(target).parent().find("#tableData").is(":visible")){
            $(target).parent().find("#tableData").css("display","block");
            $(target).parent().find("#divData").css("display","none");
        }else {
            $(target).parent().find("#divData").css("display","block");
            $(target).parent().find("#tableData").css("display","none");
        }
    }
}

/**
 * 流程实例表单控制器
 */
function instanceFormCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		return;
	}
	$scope.proInstId = $stateParams.id;
	var url = "${bpmRunTime}/runtime/instance/v1/getInstFormAndBO?proInstId=" + $stateParams.id;
	baseService.get(url).then(function(rep){
		if(rep.result){
			dialogService.fail(rep.result);
		}
		else{
			$scope.form = rep.form;
			$scope.data = rep.data;
			$scope.opinionList = rep.opinionList;
			$scope.permission = $scope.$eval(rep.permission);
		}
	});
}

/**
 * 流程任务详情控制器
 * @returns
 */
function taskDetailCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.taskId){
		dialogService.fail("必须传入任务ID");
		return;
	}
	// 流程图懒加载
	$scope.selectImage = function(url){
		$scope.imageUrl = url;
	}
	// 审批历史懒加载
	$scope.selectHistory = function(url){
		$scope.historyUrl = url;
	}
	// 流程实例表单懒加载
	$scope.selectForm = function(url){
		$scope.formUrl = url;
	}
	$scope.instance = {};
	// 获取流程实例详情
	baseService.get('${bpmRunTime}/runtime/task/v1/get?id=' + $stateParams.taskId)
			   .then(function(r){
				   $scope.taskDetail = r.bpmTask;
				   $stateParams.id=r.bpmTask.procInstId;
			   });
}


/**
 * 常用语配置控制器
 * @returns
 */
function approvalItemCtrl($scope, dialogService){
	$scope.operating = function(row,action){
		var title = action == "edit" ? "编辑常用语" : action == "add" ? "添加常用语" : "查看常用语";
		if(action=="edit"||action=="add"){
			dialogService.sidebar("flow.approvalItemListEdit", {bodyClose: false, width: '40%', pageParam: {id:row.id, title:title}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();//子页面关闭,父页面数据刷新
			});
		}else{
			dialogService.sidebar("flow.approvalItemListGet", {bodyClose: false, width: '40%', pageParam: {row:row, title:title}});	
		}
  }
}

/**
 * 常用语编辑控制器
 * @returns
 */
function approvalItemEditCtrl($scope, dialogService, baseService){
	$scope.approval={};
	$scope.approval.type = 1;
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.dicConfig={
	    url:"${portal}/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE",
	    hideRoot:true
	}
	//获取详情
	$scope.detail=function(id){
		if(!id) return;
		var url='${bpmModel}/flow/approvalItem/v1/approvalItemGet?id='+id;
		baseService.get(url).then(function(rep){
			$scope.approval = rep;
			
			if(!$scope.flowArray){
				$scope.flowArray = [];
			}
			if($scope.approval){
				if($scope.approval.defKey){
					$scope.flowArray.push({"name":$scope.approval.defName,"defKey":$scope.approval.defKey});
				}
			}
			
		});
	}
	if($scope.pageParam.row){
		$scope.approval = $scope.pageParam.row;
	}else{
		$scope.detail($scope.id);
	}
	
	
	//保存事件
	$scope.save = function(){
		var type = $scope.approval.type;
		if(type == 2){
			//流程分类
			var typeId = [];
			if($scope.approval.typeId==''){
				dialogService.warn("请选择流程分类！");
				return ;
			}
			
		}else if(type == 3){
			var defKey = [];
			var defName = [];
			if(!$scope.flowArray||$scope.flowArray.length<1){
				dialogService.warn("请选择流程定义！");
				return ;
			}
			var flowObj = $scope.flowArray;
			for(var i = 0 ; i< flowObj.length; i++){
				defKey.push(flowObj[i].defKey);
				defName.push(flowObj[i].name);
			}
			$scope.approval.defKey = defKey.join(",");
			$scope.approval.defName = defName.join(",");
		};
		if(!$scope.approval.expression){
			dialogService.warn("请输入常用语！");
			return;
		}
		if(/(\<|\>)/.test($scope.approval.expression.trim())) {
			dialogService.warn("常用语不能包含尖括号 ");
			return;
		}
		//保存数据
		var url = "${bpmModel}/flow/approvalItem/v1/save";
		baseService.post(url, $scope.approval).then(function(rep){
		if(rep && rep.state){
			dialogService.success(rep.message).then(function(){
			$scope.close();
			});
		}else{
			dialogService.fail(rep.message || '保存失败');	
		}	
		});
	}

	
	$scope.referDefinition = function(){
		var flowArray = $scope.flowArray;

		dialogService.page("flow-bpmDefSelector", {
		    title:'流程选择器',
		    pageParam: {data:angular.copy(flowArray)}
		 }).then(function(aryDef){
				if( $scope.flowArray && $scope.flowArray.length>0){
	    			for(var i=0 ;  i< aryDef.length ; i++){
	    				var isSame = false; 
	    				for(var j =0 ;  j< flowArray.length ; j++){
	    					if(flowArray[j].defKey == aryDef[i].defKey){
	    						isSame = true;
	    						break;
	    					}
	    				}
	    				if(!isSame){
	    					flowArray.push(aryDef[i]);
	    				}
	    			}
	    		}else{
	    			$scope.flowArray = aryDef;
	    		}
	    		$scope.$digest();
		 });
	}
	
	$scope.removeDef = function(index){
		$scope.flowArray.splice(index , 1);
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

/**
 * 流程条件代理列表控制器
 * @param $scope
 * @param dialogService
 * @returns
 */
function agentCtrl($scope, dialogService){
	$scope.formatterAgent = function(value, row){
		if(row.type == "3"){
			 return "条件代理暂时无法计算出代理人";
		 }else{
			 return value;
		 }
	}
	
	$scope.operating=function(id, action){
		var title = action == "edit" ? "编辑代理" : action == "add" ? "添加代理" : "查看代理";
	if(action=="edit"||action=="add"){
		dialogService.sidebar("flow.agentListedit", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
	         $scope.dataTable.query();//子页面关闭,父页面数据刷新
	     });
	}else{
		dialogService.sidebar("flow.agentListget", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});	
	}
  }
}
	
/**
 * 流程代理配置控制器
 * @returns
 */
function agentEditCtrl($scope, dialogService, baseService){
	$scope.data = {};
	$scope.data.type = 2;
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.selectUsers = [];
	$scope.detail = function(id){
	if(!id) return;
		var url = "${bpmModel}/flow/agent/v1/agentGet?id="+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	
	//编辑
	$scope.detail($scope.id);
	//保存
	$scope.save = function(){
		var url = "${bpmModel}/flow/agent/v1/save";
		if(!$scope.validateData()){
			return ;
		}
		baseService.post(url, $scope.data).then(function(rep){
			if(rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.close();
				});
			}else{
				dialogService.fail(rep.message || '保存失败');		
			}
		});
	}
	
	$scope.validateData = function(){
		if($scope.data.startDate && $scope.data.startDate.constructor.name=='m')$scope.data.startDate=$scope.data.startDate.format('YYYY-MM-DD HH:mm:ss');
		if($scope.data.endDate && $scope.data.endDate.constructor.name=='m')$scope.data.endDate=$scope.data.endDate.format('YYYY-MM-DD HH:mm:ss');
		if(!daysBetween($scope.data.startDate,$scope.data.endDate)){
			dialogService.fail("开始日期不能大于结束日期!");
			return false;
		}
		if($scope.data.type == 1){
			if($.isEmpty($scope.data.agentId)){
				dialogService.fail("代理人不能为空!");
				return false;
			}
				
		}else if($scope.data.type == 2){
			if($.isEmpty($scope.data.agentId)){
				dialogService.fail("代理人不能为空!");
				return false;
			}
			if(!$scope.data.defList || $scope.data.defList.length<1){
				dialogService.fail("部分代理必须选择要代理的流程！");
				return false;
			}
		}else if($scope.data.type == 3){//条件代理
			if($.isEmpty($scope.data.flowKey)){
				dialogService.fail("请选择流程定义!");
				return false;
			}
			if($.isEmpty($scope.data.conditionList) || $scope.data.conditionList.length<1 ){
				dialogService.fail("请设置流程条件!");
				return false;
			}
		}
		return true;
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	$scope.removeAgentFlow = function($event,agentItem){
		$scope.data.defList.remove(agentItem);
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:true,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.agentId = userIds.join(",");
			 $scope.data.agent = fullnames.join(",");
		 });
	}
	
	$scope.selectFlows = function(){
		$scope.data.defList = $scope.data.defList || [] ;
		var initData=[];
		for (var i=0,f;f=$scope.data.defList[i++];){
			initData.push({
				defKey:f.flowKey,
				name:f.flowName
			})
		}
		dialogService.page("flow-bpmDefSelector", {
		    title:'流程选择器',
		    pageParam: {data:initData}
		 }).then(function(aryDef){
			 for(var i=0;i<aryDef.length;i++){
					var json=aryDef[i];
					var isExist=checkExist("flowKey",json.defKey,$scope.data.defList);
					if(!isExist){
						$scope.data.defList.push({
							flowKey:json.defKey,
							flowName:json.name
						});
					}
			 }
		 });
	}
}

/**
 * aryChecked数组中是否存在指定name的对象
 */
function checkExist(name,val,aryChecked){
	for(var i=0;i<aryChecked.length;i++){
		var obj=aryChecked[i];
		if(obj[name]==val) return true;
	}
	return false;
}

/**
 * 待办任务列表控制器
 * @returns
 */
function pendingCtrl($scope, baseService, dialogService, $location, $state){
	$scope.formatterDueTaskTime = function(value,row){
		if(!row.dueDateType || !value ) return "";
 		 var className = "progress-bar-success",dateType = "工作日", 
 		 detailHtml = "",detailHtml2="";
 		 var percent = row.dueUseTaskTime*100/value;
 		 percent = parseFloat(percent.toFixed(2));
 		 if(25<percent&&percent<=50){
 			 className = " progress-bar-info";
 		 }
 		 if(50<percent&&percent<=75){
 			 className = "progress-bar-warning";
 		 }
 		 if(75<percent){
 			 className = "progress-bar-danger";
 		 }
 		 if(percent>100){
 			 percent = 100;
 		 }
 		 if(row.dueDateType == "caltime"){
 			 detailHtml = "<img src='/front/img/caltime.png' title='日历日'></img>  ";
 		 }else{
 			 detailHtml = "<img src='/front/img/worktime.png' title='工作日'></img>  ";
 		 }
 		 
 		 if(row.dueStatus==0){
 			detailHtml2 += "<a class='fa fa-detail' ng-click='openTaskDueTimeDetail(\""+row.id +"\",\""+row.name+"\")' herf='#' title='明细'></a>";
 		 }
 		 
 		 
 		 var progressHtml=	'<div class="row">'+
 		 						'<div class="col-sm-2" style="margin-top:4px;">'+detailHtml+
 		 						'</div>'+
 		 						'<div class="col-sm-8" style="padding:0;">'+
         			 				'<div class="progress progress-striped" >'+
         		 			  			'<div class="progress-bar '+className+'" style="width:'+percent+'%">'+
         		 			  				'<span style="color:black"> ' +  percent+'% '+ '</span>'+
         		 			  			'</div>'+
         		 					'</div>'+
     		 					'</div>'+
     		 					'<div class="col-sm-2" style="margin-left:-8px;margin-top:4px;">'+detailHtml2+
         		 				'</div>'+
         		 			'</div>';
 		  return '<div class="col-sm-12">'+progressHtml+'</div>';
	}
	
	$scope.toTask = function(id){
		var url= '${bpmRunTime}/runtime/task/v1/canLock?taskId=' + id
		baseService.get(url).then(function(rtn){
			//0:任务已经处理,1:可以锁定,2:不需要解锁 ,3:可以解锁，4,被其他人锁定,5:这种情况一般是管理员操作，所以不用出锁定按钮。
			switch(rtn){
				case 0:
					dialogService.success("此任务已经被其他人处理完成!");
					break;
				case 1:
				case 2:
				case 3:
				case 5:
					$state.go('receivedProcess.task-toStart',{id:id});
					break;
				case 4:
					dialogService.success("此任务已经被其他人锁定!");
					break;
				case 6:
					dialogService.error("流程已经被禁止，请联系管理员！");
					break;
			}
		});
	}
	
	$scope.openTaskDueTimeDetail = function(id, name){
		dialogService.sidebar("pending-dueTimeList", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
	}
	
}

/**
 * 流程启动控制器
 * @returns
 */
function flowStartCtrl($scope, baseService, dialogService, $stateParams, $state){
	$scope.taskId = $stateParams.taskId;
	$scope.title = "任务处理";
	if($scope.taskId){
		var url = "${bpmRunTime}/runtime/task/v1/taskApprove?taskId="+$scope.taskId;
		baseService.get(url).then(function(rep){
			$scope.isPopWin = rep.popWin;
			$scope.nodeId = rep.nodeId;
		});
		
		//关闭
		$scope.close = function(){
			$state.go("flow.taskList");
		}
		
		$scope.$on('taskDealSuccess',function(){
			$scope.close();
			layer.closeAll();
		});
	}else{
		$scope.defId = $stateParams.id;
		var backUrl = $stateParams.url && $stateParams.url !='' ? $stateParams.url:"flow.flowList" ;
		//关闭
		$scope.close = function(){
			$state.go(backUrl,$stateParams);
		}
		
		$scope.$on('flowStartSuccess',function(){
			$scope.close();
		})
	}
	
}

/**
 * 流程待办同意控制器
 * @returns
 */
function taskToAgreeCtrl($scope, baseService, dialogService, $stateParams,$rootScope, flowService){
	$scope.params = $scope.pageParam;
	$scope.actionName = $scope.params.actionName;
	$scope.taskId = $scope.params.taskId;
	$scope.jumpType = '';
	$scope.nodeUser = [];
	$scope.destination = '';
	$scope.urlForm = $scope.params.urlForm;
	var url = "${bpmRunTime}/runtime/task/v1/taskToAgree?taskId="+$scope.taskId+"&actionName="+$scope.actionName;
	baseService.get(url).then(function(rep){
		$scope.directHandlerSign = rep.directHandlerSign;
		$scope.goNextJustEndEvent = rep.goNextJustEndEvent;
		$scope.allNodeDef = rep.allNodeDef;
		$scope.allNodeUserMap = rep.allNodeUserMap;
		$scope.approvalItem = rep.approvalItem;
		$scope.jumpType = rep.jumpType;
		$scope.outcomeNodes = rep.outcomeNodes;
		$scope.outcomeUserMap = rep.outcomeUserMap;
		
	});
	$scope.jumpType = $scope.jumpType.split(",")[0];
	$scope.selectNode = '';
	$scope.chooseUser = function(){
		// 不必多选设置执行人的时候
		
		var callBack =function(data,dialog){
			var html = "";
			for(var i = 0 ,user; user=data[i++];){
				html = html + '<label class="checkbox-inline" name="nodeUserLabel"><input type="checkbox" name="nodeUser"  checked="checked" value="'+user.id+","+user.name+',user" />'+user.name+'</label>'
			}
			$("span[name='nodeUserSpan']").html(html);
		    dialog.dialog('close');
		};
		CombinateDialog.open({alias:"userSelector",callBack:callBack});
	};
	
	$scope.isContains = function(base, value){
		return base.indexOf(value) != -1;
	}
	
	$scope.setOpinion = function(approval){
		var oldOpinion = $("#opinion").val();
		$("#opinion").val(oldOpinion+approval);
	}
	
	$scope.cancel = function(){
		layer.closeAll();
	}
	
	$scope.submit = function(){
		var frm = $('#agreeForm');
		if(frm.$invalid){
			dialogService.fail("表单校验不通过");
			return;
		}
		var paramsObj = handlerOpinionJson($scope.params.passConf);
		delete paramsObj['hasFormOpinion'];
		delete paramsObj['bpmFormId'];
		if(paramsObj.data){
			try {
				//这里有时候会出现多次base64编码，所以先进行试着转json，如果成功了则进行base64编码
				parseToJson(paramsObj.data);
				paramsObj.data = $.base64.encode(paramsObj.data,"utf-8");
			} catch (e) {}
		}
		paramsObj.actionName = $scope.actionName;
		paramsObj.taskId = $scope.taskId;
		paramsObj.jumpType = $scope.jumpType;
		paramsObj.destination = $scope.destination;
		paramsObj.nodeUsers = JSON.stringify($scope.nodeUser);
		var index = null;
		var url = "${bpmRunTime}/runtime/task/v1/complete";
		//index = layer.load(0, {shade: false});
		flowService.saveUrlFormData()
				   .then(function(data){
					   // 获取到了URL表单的数据，传递给后台用来更新流程变量，更新的机制是按照流程设置中配置的流程变量来更新，匹配到的变量才更新到流程变量中。
					   if(data && !paramsObj.data){
						   if(data.constructor==Object || data.constructor==Array){
							   data = JSON.stringify(data);
						   }
						   paramsObj.data = $.base64.encode(data,"utf-8");
					   }
					   baseService.post(url, paramsObj).then(function(rep){
						   showResponse(index,rep);
					   });
					}, function(err){
						showResponse(index, {state: false, message: err});
					});
	}
	
	function handlerOpinionJson(jsonObj){
		var opinion = $scope.opinion;
		var opinionObj=jsonObj.__form_opinion;
		if(!opinionObj) return jsonObj;
		for(var key in opinionObj){
			opinionObj[key]=opinion;
		}
		return angular.toJson(jsonObj);
	}
		
	function showResponse(index,response) {
		layer.close(index);
		//执行后置脚本
		var script = "var tempFunction = function(data){ "+window.parent.curent_btn_after_script_+"};"
		var afterScriptPassed =  eval(script+"tempFunction(response);");

		if (response.state) {
			dialogService.success(response.message).then(function(){
				$rootScope.$broadcast('taskDealSuccess');
			});
		} else {
			dialogService.fail(response.message);
		}
	}
}
	
/**
 * 任务流程图控制器
 * @returns
 */
function taskImageCtrl($scope, baseService, dialogService){
   var url="";
   if($scope.pageParam.taskId){
	   url = "${bpmRunTime}/runtime/task/v1/taskImage?taskId="+$scope.pageParam.taskId;
	   $scope.imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?defId=&bpmnInstId=&taskId="+$scope.pageParam.taskId+"&proInstId=";
   }else if($scope.pageParam.defId){
	   url = "${bpmRunTime}/runtime/task/v1/taskImage?taskId=&defId="+$scope.pageParam.defId;
	   $scope.imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?defId="+$scope.pageParam.defId+"&bpmnInstId=&taskId=&proInstId=";
   }
   
   $scope.getImageBase64 = function(){
	    if(!$scope.pageParam.taskId&&!$scope.pageParam.defId)return '';
		if($scope.imageBase64){
			return $scope.imageBase64;
		}
		var imageBase64 = '';
		$.ajax({
			url:$scope.imageUrl,
			type:'GET',
			dataType:'text',
			async:false,
			success:function(data){
				imageBase64 = data;
				$scope.imageBase64 = data;
			}
		})
		return imageBase64;
	}
	
	baseService.get(url).then(function(rep){
		$scope.bpmDefLayout = rep.bpmDefLayout;
		$scope.instId = rep.instId;
		$scope.parentInstId = rep.parentInstId;
	});
	
	//显示指定流程实例的轨迹图
	$scope.showFlowMap = function(instId,nodeId,nodeType,type) {
		var title=type=="subFlow"?"查看子流程":"查看主流程";
		dialogService.page("flow-image", {area: ['950px', '600px'],btn:[],pageParam:{instId:instId,nodeId:nodeId,nodeType:nodeType,type:type}});
	}
	
}

/**
 * 流程抄送控制器
 * @returns
 */
function toCopyToCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.selectUsers = [];
	var url = "${bpmRunTime}/runtime/instance/v1/instanceToCopyTo?taskId="+$scope.pageParam.taskId+"&proInstId=&copyToType=0";
	baseService.get(url).then(function(rep){
		$scope.handlerTypes = rep.handlerTypes;
		$scope.data.instanceId = rep.proInstId;
		$scope.data.copyToType = rep.copyToType;
	});
	
	$scope.saveCopyToType = function(){
		if(!$scope.data.userId) {
			dialogService.warn("请选择人员");
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		var msg = "确定抄送该流程？";
		if($scope.data.copyToType==1){
			 msg = "确定转发该流程？";
		}
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/transToMore',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.userId = userIds.join(",");
			 $scope.userName = fullnames.join(",");
		 });
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		var dataStrArr=$scope.data.userId.split(",").remove(obj.id);
		$scope.data.userId=dataStrArr.join(",");
	}

}

/**
 * 流程转交控制器
 * @returns
 */
function toDelegateCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveDelegate = function(){
		if(!$scope.data.userId) {
			dialogService.warn("请选择人员");
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		var msg = "确定转交该流程？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/delegate',$scope.data).then(function(rep){
				layer.close(index);
				var script = "var tempFunction = function(data){ " + window.parent.curent_btn_after_script_ + "};"
				var afterScriptPassed = eval(script + "tempFunction(data);");
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:true,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.userId = userIds.join(",");
			 $scope.userName = fullnames.join(",");
		 });
	}
}

/**
 * 流程加签控制器
 * @returns
 */
function toAddSignCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveAddSign = function(){
		if(!$scope.data.userId) {
			dialogService.warn("请选择加签人员");
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		var msg = "确定添加会签任务？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/taskSignUsers',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.userId = userIds.join(",");
			 $scope.userName = fullnames.join(",");
		 });
	}
}

/**
 * 流程流转控制器
 * @returns
 */
function toTransCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.transRecordList = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	baseService.get("${bpmRunTime}/runtime/task/v1/getTransRecordList?taskId="+$scope.data.taskId).then(function(rep){
		$scope.transRecordList = rep;
	});
	
	$scope.saveTrans = function(){
		if(!$scope.data.notifyType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		if(!$scope.data.userIds||!$scope.data.opinion) {
			dialogService.warn("请选择人员和填写通知内容");
			return;
		}
		var msg = "确定要流转当前任务吗？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/taskToTrans',$scope.data).then(function(rep){
				layer.close(index);
				var script = "var tempFunction = function(data){ "+window.parent.curent_btn_after_script_+"};"
				var afterScriptPassed =  eval(script+"tempFunction(data);");	
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	//投票类型
	function setVoteType(type){
		switch(type){
			case 1:
				$scope.data.voteType = "percent";
				break;
			case 2:
			case 3:
				$scope.data.voteType = "amount";
				break;
		}
	}
	
	function setAmount(type){
		var obj=$("#voteAmount");
		var objLabel=$("#voteAmountUnit");
		switch(type){
			case 1:
				$scope.data.voteAmount = 100;
				objLabel.show();
				break;
			case 2:
			case 3:
				$scope.data.voteAmount = 1;
				objLabel.hide();
				break;
		}
	}
	
	$scope.voteTypeChange = function(e){
		if($(e).val()=="amount"){
			$("#voteAmountUnit").hide();
		}
		else{
			$("#voteAmountUnit").show();
		}
	}
	
	//设定决策类型
	function setDecideType(type){
		
		switch(type){
			case 1:
			case 3:
				$scope.data.decideType = "agree";
				break;
			case 2:
				$scope.data.decideType = "refuse";
				break;
		}
	}
	
	/**
	* 1.全票通过
	*  2.一票否决
	*  3.一票通过
	*  4.自定义
	*/
	$scope.setVote = function(type){
		var hide=(type!=4);
		toHidden(hide);
		
		setDecideType(type);
		//
		setVoteType(type);
		//设置票数
		setAmount(type);
	    
	}
	
	function toHidden(hidden){
		$(".hight").each(function(i){
			hidden?$(this).hide():$(this).show();
		});
	}
	
	$scope.setVote(1);
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.userIds = userIds.join(",");
			 $scope.receiver = fullnames.join(",");
		 });
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		var dataStrArr=$scope.data.userId.split(",").remove(obj.id);
		$scope.data.userId=dataStrArr.join(",");
	}
	
}

/**
 * 任务驳回控制器
 * @returns
 */
function toRejectCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	$scope.data.actionName = $scope.pageParam.actionName;
	$scope.backNode = '';
	$scope.backMode = '';
	var url = "${bpmRunTime}/runtime/task/v1/taskToReject?taskId="+$scope.data.taskId+"&backModel="+$scope.data.actionName;
	baseService.get(url).then(function(rep){
		$scope.backNode = rep.backNode;
		$scope.backMode = rep.backMode;
		$scope.canRejectToStart = rep.canRejectToStart;//允许驳回到发起人
		$scope.canRejectToAnyNode = rep.canRejectToAnyNode;//允许驳回指定节点
		$scope.canRejectPreAct = rep.canRejectPreAct;//允许驳回到上一步
		$scope.canReject = rep.canReject;//允许驳回
		$scope.bpmExeStacksUserNode = rep.bpmExeStacksUserNode;//允许直来直往的节点
		$scope.bpmExeStacksGoMapUserNode = rep.bpmExeStacksGoMapUserNode;//允许按流程图执行的节点
	});
	
	$scope.rejectModeClick = function(){
		$scope.data.destination = "";
		$scope.data.actionName = "reject";
		//退回方式
		$scope.showNodeChoice();
	}
	
	$scope.showNodeChoice = function() {
		//退回方式
		var rejectRadio = $("input[name='rejectMode']:checked");
		var rejectMode = rejectRadio.val();
		var backHandMode = $("input[name='backHandMode']:checked").val()||$scope.backMode;
		if (rejectRadio.attr("showDestination")) {
			rejectMode = "rejectToDestination" //驳回指定节点与驳回使用同一handle ，区别有没有destination
		}
		$scope.data.destination = "";
		if (rejectMode == "backToStart"||rejectRadio.attr("id") == "rejectPreAct") {
			$(".nodeChoice").hide();
		} else {
			if (backHandMode == "direct") {
				$("#nodeChoice1").hide();
				$("#nodeChoice2").show();
			} else {
				//按流程图走
				$("#nodeChoice1").show();
				$("#nodeChoice2").hide();
			}
		}
	}
	
	$scope.saveReject = function(){
		if(!$scope.data.opinion){
			dialogService.warn("请填写驳回意见");
			return ;
		}
		var isRejectPreAct = $scope.rejectMode == "rejectPreAct";
		$scope.rejectMode = $scope.data.actionName;
		if ($scope.rejectMode == "reject") {
			if (isRejectPreAct == false) {
				$scope.data.destination = $scope.backHandMode == "direct" ? $("#userNodeSelect").val() : $("#goMapUserNodeSelect").val();
			} else {
				//取可退回的最近节点
				$scope.data.destination = $scope.backHandMode == "direct" ? $("#userNodeSelect").find("option:eq(1)").val() : $("#goMapUserNodeSelect").find("option:eq(1)").val();
			}
		}
		//如果流程定义中配置的仅只能驳回的节点
		if ($scope.backNode != "" && $scope.canRejectToStart != true) {
			$scope.data.destination = $scope.backNode;
			//检查可驳回合法性
			var isLegality = false;
			var select = $scope.backMode == "direct" ? "userNodeSelect" : "goMapUserNodeSelect";
			//直来直往
			$("#" + select + " option").each(function(index, item) {
				if ($(this).val() == $scope.backNode) {
					isLegality = true;
					return false;
				}
			});
			if (!isLegality) {
				dialogService.fail("流程配置中指定的仅能驳回到节点[" + $scope.backNode + "]，当前此驳回不被允许，如有疑问请联系系统管理员！");
				return false;
			}

		} else if ($scope.rejectMode == "reject" && $scope.data.destination == "" && $("input[showDestination='true']:checked").length == 1) {
			dialogService.fail("请选择驳回到的节点！");
			return false;
		}
		var msg = "确定要驳回吗？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/complete',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
					CustForm.getService('$state').go('flow.taskList');
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.isContains = function(base, value){
		return base.indexOf(value) != -1;
	}

}

/**
 * 任务沟通控制器
 * @returns
 */
function taskCommuCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	$scope.type = $scope.pageParam.type;
	$scope.selectUsers = [];
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	var url = "${bpmRunTime}/runtime/task/v1/getTaskCommu?taskId="+$scope.data.taskId;
	baseService.get(url).then(function(rep){
		$scope.commuReceivers = rep.commuReceivers;
	});
	
	$scope.saveCommu = function(){
		if(!$scope.data.userId) {
			dialogService.warn("请选择人员");
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		if(!$scope.data.opinion){
			dialogService.warn("沟通内容不能为空");
			return ;
		}
		var msg = "确定发起沟通吗？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/communicate',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var userIds = [];
			 var fullnames = [];
			 $(result).each(function(i){
				var userId=this['id'];
				var fullname=this['fullname'];
				userIds.push(userId);
				fullnames.push(fullname);
			});
			 $scope.data.userId = userIds.join(",");
			 $scope.userName = fullnames.join(",");
		 });
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		var dataStrArr=$scope.data.userId.split(",").remove(obj.id);
		$scope.data.userId=dataStrArr.join(",");
	}
	
}

/**
 * 任务反馈控制器
 * @returns
 */
function feedBackCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	var url = "${bpmRunTime}/runtime/task/v1/getTaskCommu?taskId="+$scope.data.taskId;
	baseService.get(url).then(function(rep){
		$scope.taskCommu = rep.taskCommu;
	});
	
	$scope.feedBack = function(){
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		var msg = "确定要反馈吗？";
		var params = {};
		var currentUserInfo = $.parseJSON(window.sessionStorage['ngStorage-currentUser']);
		params.account = currentUserInfo.account;
		params.taskId = $scope.data.taskId;
		params.opinion = $scope.data.opinion;
		params.notifyType = $scope.data.messageType;
		params.actionName = "commu";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/doNext',params).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
}

/**
 * 流程终止控制器
 * @returns
 */
function toEndProcessCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.toEndProcess = function(){
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		if(!$scope.data.endReason){
			dialogService.warn("请填写终止原因");
			return ;
		}
		var msg = "确定要终止流程吗？";
		var params = {};
		var currentUserInfo = $.parseJSON(window.sessionStorage['ngStorage-currentUser']);
		$scope.data.account = currentUserInfo.account;
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/doEndProcess',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
}

/**
 * 任务审批用时列表控制器
 * @returns
 */
function dueTimeListCtrl($scope, baseService, dialogService){
	$scope.formatterFileId = function(value,row){
		if(!value) return "";
		var jsonArr = jQuery.parseJSON(value);
		var fmtHtml = "";
		$(jsonArr).each(function(idx,obj){
			fmtHtml +=  '<a class="btn fa fa-cloud-download" style="margin-top:-7px" ng-onclick="downFile('+obj.id+')" title="下载该文件">'+obj.name+'</a>';
		});
		return fmtHtml;
	}
	
	$scope.downFile = function(id){
		window.location.href= "${system}/system/file/download?id="+id;
	}
	
	$scope.openDetail = function(id){
		dialogService.sidebar("pending-dueTimeGet", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
	}
}

/**
 * 流程节点用时控制器
 * @returns
 */
function dueTimeEditCtrl(){
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.detail = function(id){
	if(!id) return;
		var url = "${bpmRunTime}/runtime/bpmTaskDueTime/v1/get?id="+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	$scope.detail($scope.id);
}

/**
 * 已完成控制器
 * @returns
 */
function completedCtrl($scope, baseService){
	$scope.fomatterDuration = function(data){
		return $.timeLag(data);
	}
}

/**
 * 抄送转发列表控制器
 * @returns
 */
function receiverCopyToCtrl($scope, baseService){
	$scope.showDetail = function(isRead, bId, instId){
		dialogService.alert(isRead+"："+ bId+"："+ instId);
	}
}

/**
 * 任务延期申请控制器
 * @returns
 */
function taskDueTimeEditCtrl($scope, baseService, dialogService){
	$scope.taskId = $scope.pageParam.taskId;
	$scope.className = "progress-bar-success";
	$scope.percent = 0;
	$scope.progress = "";
	
	$scope.addRow=function(classVar){
		$scope.data[classVar +"List"].push(angular.copy(obj[classVar]))
	}
	
	$scope.$on("beforeSaveEvent",function(ev,data){
		if($scope.data.addDueTime==0){
			data.pass = false;
			$.topCall.warn("增加任务时间不能为0");
		}
	});
	
	$scope.$on("afterLoadEvent",function(ev,data){
		data.addDueTime = 0;
		// className progress
		 $scope.className = "progress-bar-success";
  		 var percent = (data.dueTime - data.remainingTime)*100/data.dueTime;
  		 $scope.percent = parseFloat(percent.toFixed(2));
  		 if(25<$scope.percent&&$scope.percent<=50){
  			 $scope.className = " progress-bar-info";
  		 }
  		 if(50<$scope.percent&&$scope.percent<=75){
  			 $scope.className = "progress-bar-warning";
  		 }
  		 if(75<$scope.percent){
  			 $scope.className = "progress-bar-danger";
  		 }
  		 if(percent>100){
  			 $scope.percent = 100;
  		 }
  		$scope.percent = $scope.percent + "%";
		
  		$scope.data.fileId = "";
  		$scope.data.remark = "";
	});
	
	$scope.$watch('data.addDueTime',function(newValue, oldVlaue){
		if(newValue){
			baseService.get("${bpmRunTime}/runtime/bpmTaskDueTime/v1/getExpirationDate?id="+$scope.data.id+"&addDueTime="+newValue).then(function(data){
				$scope.expirationDate2 = data;
			});
		}
	});
	
	$scope.pageSure = function(){
		return baseService.post("${bpmRunTime}/runtime/bpmTaskDueTime/v1/save",JSON.stringify($scope.data));
	}
}

/**
 * 已处理控制器
 * @returns
 */
function handledCtrl($scope){}

/**
 * 流程实例列表控制器
 * @returns
 */
function allInstanceCtrl($scope){}

/**
 * 流程任务列表控制器
 * @param $scope
 * @returns
 */
function taskListCtrl($scope){}


function bpmHrScriptListCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
    
	$scope.formSelectArr = [];
	$scope.prop={};
	// 获取父页面传递过来的值
	if($scope.pageParam.calc&& $scope.pageParam.calc.scriptId){
		baseService.get("${bpmRunTime}/runtime/conditionScript/v1/get?id="+$scope.pageParam.calc.scriptId).then(function(data){
			if(data){
				$scope.prop.id=data.id;
				$scope.prop.methodDesc=data.methodDesc;
				$scope.prop.methodName=data.methodName;
				if($scope.pageParam.calc.params && $scope.pageParam.calc.params.constructor.name=='String') $scope.pageParam.calc.params=JSON.parse( $scope.pageParam.calc.params);
				$scope.prop.params= $scope.pageParam.calc.params;
				$scope.conditionScript=data;
			}
		});
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.formSelectArr;
	}
	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			$scope.formSelectArr.push(data);
			$scope.formSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			angular.forEach($scope.formSelectArr, function(item){
				if(item.id!=data.id){
					$scope.removeSelectedArr('formSelectArr', item);
				}
			});
		}else{
			data.isSelected = true;
			$scope.formSelectArr.remove(data);
			data.isSelected = false;
		}
		$scope.callBack($scope.formSelectArr);
	}
	
	$scope.callBack = function(data){
			if(data.length>0){
				$scope.prop.id=data[0].id;
				$scope.prop.methodDesc=data[0].methodDesc;
				if(data[0].methodName){
					$scope.prop.methodName=data[0].methodName;
				}
				$scope.prop.params= data[0].argument?eval("("+data[0].argument+")"):{};
				$scope.conditionScript=data[0];
				$.each($scope.prop.params,function(){
					this.paraCt= this.paraCt || '';
					this.valueType="0";
				});
				 
			}else{
				$scope.prop.id="";
				$scope.prop.methodDesc="";
				$scope.prop.params=null;
			}
	};
	
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.dataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam.single) return $scope.formSelectArr[0];
		return $scope.formSelectArr;
	}
	
	$scope.pageSure = function(){
		if($scope.prop.id==null||$scope.prop.id==""){
			$.topCall.error("请选择脚本");
			return;
		}
		var script=""+$scope.conditionScript.classInsName+"."+$scope.conditionScript.methodName+"(";
		var desc="【"+$scope.prop.methodDesc+"】参数:(";
		for(var i=0;p=$scope.prop.params[i];i++){
			if(p.valueType=='1')p.description=p.value;
			var str=p.description || p.value;
			desc+=p.paraDesc+":"+str+" ";
			script+=dealValue(p)+" ";
			if(i<$scope.prop.params.length-1){
				script+=",";
				desc+=",";
			}
		}
		script+=")";
		desc+=")";
		var params = $scope.prop.params;
		var data={scriptId:$scope.prop.id,params:params,script:script,desc:desc}
		return data;
	}
	
	//处理固定值string类型参数的格式
	function dealValue(p){
		if(p.paraType=='java.lang.String'&&p.valueType=='1'){
			try {
				p.value ="\"" + eval(p.value) + "\"";
			} catch (e) {}
		}
		return p.value;
	}
	
	
	$scope.setActiveParam = function(param,$event){
		var btnOffset =  $($event.target);
		$scope.currentEditParam = param;
		varTree.showMenu($($event.target),350,btnOffset.offset().top-85);
	}
	
	$scope.setVariable = function (event, treeId, node) {
		var keyStr = node.name;
		var description=node.desc;
		var path = node.path;
		var parentNode = node.getParentNode();
		var parentNode2 = node.getParentNode();
		var boDefAlias = parentNode2.boDefAlias;
		var typeMoth = node.dataType=='number'?'.asInt()':'.asText()';
		while(parentNode2 && !parentNode2.boDefAlias){
			parentNode2 = parentNode2.getParentNode();
			if(!parentNode2){
				break;
			}
			boDefAlias = parentNode2.boDefAlias;
		}
		// 子表情况做提示
		 if (node.nodeType == 'sub'){
			keyStr = boDefAlias+".getSubByKey('"+node.name+"') /* 获取子表,return List<BoData> */";
		 }// 主表bo
		 else if(parentNode.nodeType == 'main'){
			keyStr = boDefAlias+'.get("' + node.name + '")'+typeMoth+' /*数据类型：'+node.dataType+'*/';
		}else if(parentNode.nodeType == 'sub'){
			var mainTableName = boDefAlias;
			keyStr = mainTableName+'.getSubByKey("'+parentNode.name+'") /*获取子表数据 ，返回数据：return List<BoData> 。子表字段：'+node.name+', 请根据实际情况处理子表数据的获取*/';
		}else if(node.nodeType == 'var'){
			keyStr =node.name;
		}else return ;
		 $scope.currentEditParam.value = keyStr;
		 $scope.currentEditParam.description = description;
		 !$scope.$$phase && $scope.$digest();
		varTree.hideMenu();
	}
	
	baseService.post("${bpmModel}/flow/node/v1/varTree",{defId : $scope.pageParam.defId,nodeId :$scope.pageParam.nodeId,includeBpmConstants : true}).then(function(data){
		if(data){
			varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${bpmModel}/flow/node/v1/varTree",data).setDataKey({
				name : 'desc'
			}).setCallback({
				onClick : $scope.setVariable
			}).makeCombTree("tempTree",150).initZtree({
				defId : '${defId}',
				nodeId : '${nodeId}',
				includeBpmConstants : true
			}, 1);
		}
	})

	//参数值类型数组
	$scope.valueTypeList=[
		{
			key:'变量',
			value:0
		},
		{
			key:"固定值",
			value:1
		}
	];
	
	
	$scope.showDialogSelector = function(params){
		var paraCt = params.paraCt;
		var paraCtBindKey = params.paraCtBindKey;
		var index = paraCt.indexOf(":");
		var alias = paraCt.substring(index + 1);
		var selectorType = paraCt.substring(0, index);
		

		if (selectorType == "cusdg") {
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
	                        pageParam: {alias: alias, customDialog: customDialog}
	                    }).then(function (r) {
	                    	setValue(params.paraName, params.paraCtBindKey, result);
	                    });
	                } else {
	                    dialogService.page('customDialogShowTree', {
	                        pageParam: {alias: alias, customDialog: customDialog}
	                    }).then(function (r) {
	                    	setValue(params.paraName, params.paraCtBindKey, result);
	                    });
	                }
	            } else {
	                dialogService.page('paramDialog', {pageParam: {param: param}}).then(function (rs) {
	                    dialogService.close(rs.index);
	                    if (customDialog.style == 0) {
	                        dialogService.page('customDialogShow', {
	                            alwaysClose: false,
	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
	                        }).then(function (r) {
	                        	setValue(params.paraName, params.paraCtBindKey, result);
	                        });
	                    } else {
	                        dialogService.page('customDialogShowTree', {
	                            pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
	                        }).then(function (r) {
	                        	setValue(params.paraName, params.paraCtBindKey, result);
	                        });
	                    }
	                });
	            }
	        });
		} else if (selectorType == "base") {
			dialogService.page(alias, {area:['1000px', '500px'], pageParam: {single:!params.multiSelect}})
			 .then(function(result){
				 if(result){
					 setValue(params.paraName, params.paraCtBindKey, result);
				 }
			 });
		}
	}
	
	function setValue(paraName,key,aryData) {
		var params = $scope.prop.params;
		for(var i=0;i<params.length;i++){
			var param=params[i];
			if (param.paraName != paraName ) continue;
			setParam(param,key,aryData)
		}
	}
	
	function setParam(param,key,aryData){
		var isString=param.paraType == "java.lang.String" ;
		var vals="";
		var descriptions="";
		if(typeof aryData === 'object' && !isNaN(aryData.length)){
			for(var i=0;i<aryData.length;i++){
				var obj=aryData[i];
				val=obj[key];
				tmp=obj["name"]?obj["name"]:obj[key] ;
				vals+=(i==0)?val:"," +val;
				descriptions+=(i==0)?tmp:"," +tmp  ;
			}
		}else{
			vals=aryData[key];
			descriptions=aryData["name"]?aryData["name"]:aryData[key] ;
		}
		param.value =isString ? "\""+ vals +"\"" :vals;
		param.description= descriptions;
	}
}


/**
 * 流程脚本
 * @returns
 */
function conditionScriptListCtrl($rootScope, $scope, baseService, dialogService, $state){
	
	$scope.openDetail = function(id,type){
		if('get'==type){
			dialogService.page("flow.conditionScriptGet", {area:['900px', '500px'],btn: ['取消'],pageParam: {id:id}});
		}else{
			dialogService.page("flow.conditionScriptEdit", {area:['900px', '500px'],btn: ['保存','取消'],alwaysClose:false,pageParam: {id:id}})
			 .then(function(data){
				 var param = data.result;
				 if(param.argument){
					 param.argument = JSON.stringify(param.argument);
				 }
				 baseService.post("${bpmRunTime}/runtime/conditionScript/v1/save",param).then(function(rep){
					 if(rep.state){
						 dialogService.success(rep.message);
						 dialogService.close(data.index);
						 $state.reload($rootScope.$state.$current.name);
					 }else{
						 dialogService.fail(rep.message);
					 }
				 });
			});
		}
		
	}
	
	$scope.selectHrScript = function() {
		dialogService.page("flow-hrScriptSelect", {area:['1120px', '650px'],pageParam:{title:"人员脚本对话框"}}) .then(function(data){
			dialogService.alert(JSON.stringify(data));
		});
	};
}

function conditionScriptEditCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.implClassesMap = {};
	$scope.methods = [];
	$scope.methodMaps = {};
	$scope.methodParas = [];
	$scope.optionJson = [];
	$scope.currentFields = [];
	
	baseService.get('${bpmRunTime}/runtime/conditionScript/v1/edit?id='+$scope.pageParam.id).then(function(data){
		$scope.bpmSelectorDefs = data.bpmSelectorDefs;
		$scope.controlBindSourceJson = parseToJson(data.controlBindSourceJson);
		addBaseSelectors(data.optionJson,true);
		$scope.data = data.conditionScript;
		if($scope.data.id){
			$scope.getImplClasses($scope.data.className);
		}
		if($scope.data.argument){
			$scope.data.argument = parseToJson($scope.data.argument);
			if($scope.data.argument){
				var argument = $scope.data.argument;
				for (var i = 0; i < argument.length; i++) {
					if(argument[i].paraCt){
						$scope.onChangeSelector(argument[i].paraCt);
					}
				}
			}
		}
	});
	
	//添加基本选择器
	function addBaseSelectors(optionJson){
		$scope.optionJson = [];
		var baseSelectors = [];
		var userSelect = {'value':'base:user-selector','name':'用户选择器'};
		var orgSelect = {'value':'base:org-selector','name':'组织选择器'};
		var roleSelect = {'value':'base:role-selector','name':'角色选择器'};
		var posSelect = {'value':'base:pos-selector','name':'岗位选择器'};
		var jobSelect = {'value':'base:dem-selector','name':'职务选择器'};
		var demSelect = {'value':'base:dem-selector','name':'维度选择器'};
		baseSelectors.push(userSelect);
		baseSelectors.push(orgSelect);
		baseSelectors.push(roleSelect);
		baseSelectors.push(posSelect);
		baseSelectors.push(jobSelect);
		baseSelectors.push(demSelect);
		var baseGroup = {'lable':'基本选择器','option':baseSelectors};
		$scope.optionJson.push(baseGroup);
		for (var i = 0; i < optionJson.length; i++) {
			$scope.optionJson.push(optionJson[i]);
		}
		var userOption = [{'field':'id','comment':'id'},{'field':'fullname','comment':'fullname'},{'field':'account','comment':'account'}];
		var commonOption = [{'field':'id','comment':'id'},{'field':'name','comment':'name'},{'field':'code','comment':'code'}];
		$scope.controlBindSourceJson.push({'id':'base:user-selector','option':userOption});
		$scope.controlBindSourceJson.push({'id':'base:org-selector','option':commonOption});
		$scope.controlBindSourceJson.push({'id':'base:role-selector','option':commonOption});
		$scope.controlBindSourceJson.push({'id':'base:pos-selector','option':commonOption});
		$scope.controlBindSourceJson.push({'id':'base:dem-selector','option':commonOption});
		$scope.controlBindSourceJson.push({'id':'base:job-selector','option':commonOption});
	}
	
	$scope.getImplClasses = function(className){
		if($scope.data.type){
			baseService.get('${bpmRunTime}/runtime/conditionScript/v1/getImplClasses?type='+$scope.data.type).then(function(data){
				$scope.implClasses = data;
				$scope.initImplClassesMap();
				if(className){
					$scope.onChangeClassName(className);
				}
			});
		}
	} 
	
	$scope.initImplClassesMap = function(){
		$scope.implClassesMap = {};
		if($scope.implClasses){
			var classes = $scope.implClasses;
			for (var i = 0; i < classes.length; i++) {
				var className = classes[i];
				var match = /^.*\.(\w*)$/.exec(className),name = '';
				if(match!=null){
					name = match[1];
				}
				if(!name)return;
				name = name.toLowerCase().split("",1) + name.slice(1);
				$scope.implClassesMap[className] = name;
			}
		}
	}
	
	if(!$scope.implClasses){
		$scope.getImplClasses();
	}
	
	$scope.changeType = function(type){
		$scope.data.className = '';
		$scope.data.methodName = '';
		$scope.getImplClasses();
	}
	
	$scope.onChangeClassName = function(newVal){
		$scope.data.classInsName = $scope.implClassesMap[$scope.data.className];
		if($scope.data.classInsName){
			var id = $scope.data.id?$scope.data.id:'';
			var type = $scope.data.type?$scope.data.type:'';
			var url = '${bpmRunTime}/runtime/conditionScript/v1/getMethodsByName?className='+$scope.data.className+"&id="+id+"&type="+type;
			$scope.getMethods(url);
		}
	}
	
	$scope.getMethods = function(url){
		baseService.get(url).then(function(data){
			if(data.state){
				$scope.methods = parseToJson(data.value);
				for (var i = 0; i < $scope.methods.length; i++) {
					$scope.methodMaps[$scope.methods[i]['methodName']] = $scope.methods[i];
				}
			}
		});
	}
	
	$scope.$watch("data.methodName",function(newVal,oldVal){
		if(newVal!==oldVal && newVal){
			var method = $scope.methodMaps[newVal];
			if(method){
				$scope.data.returnType = method.returnType;
				$scope.data.argument = method.para;
			}
		}else{
			$scope.data.returnType = '';
			$scope.data.argument = [];
		}
	},true);
	
	$scope.onChangeSelector = function(select){
		if($scope.controlBindSourceJson){
			var binds = $scope.controlBindSourceJson;
			for (var i = 0; i < binds.length; i++) {
				if(binds[i].id==select){
					$scope.currentFields[select] = parseToJson(parseToJson(binds[i].option));
					break;
				}
			}
		}
	}
	
	$scope.onChangeField = function(key,para){
		var fields = $scope.currentFields[para.paraCt];
		for (var i = 0; i < fields.length; i++) {
			if(key==fields[i].field){
				para.paraCtBindName = fields[i].comment;
				break;
			}
		}
		if(para.$$hashKey){
			delete para.$$hashKey;
		}
	}
	
	$scope.pageSure = function(){
		return $scope.data;
	}
}

function conditionScriptGetCtrl($scope, baseService, dialogService){
	$scope.data = {};
	if($scope.pageParam.id){
		baseService.get('${bpmRunTime}/runtime/conditionScript/v1/get?id='+$scope.pageParam.id).then(function(data){
			$scope.data = data;
		});
	}
}


/**
 * 常用脚本
 * @returns
 */
function scriptListCtrl($rootScope, $scope, baseService, dialogService, $state){
	$scope.ategoryList = [];
	baseService.get('${bpmRunTime}/runtime/script/v1/getCategoryList').then(function(data){
		$scope.ategoryList = data;
	});
	$scope.openDetail = function(id,type){
		if('get'==type){
			dialogService.page("flow.scriptGet", {area:['800px', '410px'],btn: ['取消'],pageParam: {id:id}});
		}else{
			dialogService.page("flow.scriptEdit", {area:['800px', '450px'],btn: ['保存','取消'],alwaysClose:false,pageParam: {id:id}})
			 .then(function(data){
				 var param = data.result;
				 if(param.argument){
					 param.argument = JSON.stringify(param.argument);
				 }
				 baseService.post("${bpmRunTime}/runtime/script/v1/save",param).then(function(rep){
					 if(rep.state){
						 dialogService.success(rep.message);
						 dialogService.close(data.index);
						 $state.reload($rootScope.$state.$current.name);
					 }else{
						 dialogService.fail(rep.message);
					 }
				 });
			});
		}
		
	}
}

function scriptEditCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.ategoryList = [];
	baseService.get('${bpmRunTime}/runtime/script/v1/getCategoryList').then(function(data){
		$scope.ategoryList = data;
	});
	if($scope.pageParam.id){
		baseService.get('${bpmRunTime}/runtime/script/v1/get?id='+$scope.pageParam.id).then(function(data){
			$scope.data = data;
		});
	}
	
	$scope.preViewScript = function(){
		if(!$scope.data.script){
			dialogService.fail("请编写脚本内容!");
			return false;
		}
		baseService.post("${bpmRunTime}/runtime/script/v1/executeScript",$scope.data.script).then(function(data){
			if(data.state){
				dialogService.alert('执行成功！执行结果：<br/> '+data.value);
			}else{
				dialogService.alert("执行失败！");
			}
			
		});
	}
	
	$scope.pageSure = function(){
		return $scope.data;
	}
}

function scriptGetCtrl($scope, baseService, dialogService){
	$scope.data = {};
	if($scope.pageParam.id){
		baseService.get('${bpmRunTime}/runtime/script/v1/get?id='+$scope.pageParam.id).then(function(data){
			$scope.data = data;
		});
	}
}



/**
 * 流程模块
 */
angular
    .module('flow', [])
    .controller('flowImportCtrl', flowImportCtrl)
    .controller('pendingCtrl', pendingCtrl)
    .controller('taskToAgreeCtrl', taskToAgreeCtrl)
    .controller('dueTimeListCtrl', dueTimeListCtrl)
    .controller('dueTimeEditCtrl', dueTimeEditCtrl)
    .controller('completedCtrl', completedCtrl)
    .controller('taskImageCtrl', taskImageCtrl)
    .controller('flowImageCtrl', flowImageCtrl)
    .controller('flowOpinionCtrl', flowOpinionCtrl)
    .controller('instanceSendNodeUsersCtrl', instanceSendNodeUsersCtrl)
    .controller('instanceSelectDestinationCtrl', instanceSelectDestinationCtrl)
    .controller('toCopyToCtrl', toCopyToCtrl)
    .controller('feedBackCtrl', feedBackCtrl)
    .controller('taskCommuCtrl', taskCommuCtrl)
    .controller('toEndProcessCtrl', toEndProcessCtrl)
    .controller('toDelegateCtrl', toDelegateCtrl)
    .controller('toAddSignCtrl', toAddSignCtrl)
    .controller('toTransCtrl', toTransCtrl)
    .controller('toRejectCtrl', toRejectCtrl)
    .controller('receiverCopyToCtrl', receiverCopyToCtrl)
    .controller('taskDueTimeEditCtrl', taskDueTimeEditCtrl)
    .controller('taskDetailCtrl', taskDetailCtrl)
    .controller('flowListCtrl', flowListCtrl)
    .controller('flowEditCtrl', flowEditCtrl)
    .controller('defInstanceDetailCtrl', defInstanceDetailCtrl)
    .controller('instanceDetailCtrl', instanceDetailCtrl)
    .controller('instanceFormCtrl', instanceFormCtrl)
    .controller('flowVersionListCtrl', flowVersionListCtrl)
    .controller('flowHisVersionDetailCtrl', flowHisVersionDetailCtrl)
    .controller('flowVarListCtrl', flowVarListCtrl)
    .controller('flowVarEditCtrl', flowVarEditCtrl)
    .controller('flowOtherSettingCtrl', flowOtherSettingCtrl)
    .controller('flowConfigCtrl', flowConfigCtrl)
    .controller('flowNodeSelector', flowNodeSelector)
    .controller('flowNodeScriptCtrl', flowNodeScriptCtrl)
    .controller('flowUserScriptEditCtrl', flowUserScriptEditCtrl)
    .controller('flowNodeJumpRoleCtrl', flowNodeJumpRoleCtrl)
    .controller('flowBranchConditionCtrl', flowBranchConditionCtrl)
    .controller('flowTaskRemindCtrl', flowTaskRemindCtrl)
    .controller('flowSignConfigCtrl', flowSignConfigCtrl)
    .controller('flowEventSettingCtrl', flowEventSettingCtrl)
    .controller('flowNodeUserConditionCtrl', flowNodeUserConditionCtrl)
    .controller('cusersSelectorCtrl', cusersSelectorCtrl)
    .controller('bpmFormSelectorCtrl', bpmFormSelectorCtrl)
    .controller('userScriptSelectorCtrl', userScriptSelectorCtrl)
    .controller('commonScriptSelectorCtrl', commonScriptSelectorCtrl)
    .controller('bpmConditionBuildCtrl', bpmConditionBuildCtrl)
    .controller('bpmDefSelectorCtrl', bpmDefSelectorCtrl)
    .controller('formBpmDefSelectorCtrl', formBpmDefSelectorCtrl)
    .controller('filedAuthSettingCtrl', filedAuthSettingCtrl)
    .controller('flowStartCtrl', flowStartCtrl)
    .controller('flowAutoTaskCtrl', flowAutoTaskCtrl)
    .controller('approvalItemCtrl', approvalItemCtrl)
    .controller('approvalItemEditCtrl', approvalItemEditCtrl)
    .controller('agentCtrl', agentCtrl)
    .controller('agentEditCtrl', agentEditCtrl)
    .controller('flowAuthorizeListCtrl', flowAuthorizeListCtrl)
    .controller('flowAuthorizeEditCtrl', flowAuthorizeEditCtrl)
    .controller('flowMsgTemplateGetCtrl', flowMsgTemplateGetCtrl)
    .controller('flowMsgTemplateEditCtrl', flowMsgTemplateEditCtrl)
    .controller('flowMsgTemplateListCtrl', flowMsgTemplateListCtrl)
    .controller('flowFormRigthSettingCtrl', flowFormRigthSettingCtrl)
    .controller('handledCtrl', handledCtrl)
    .controller('allInstanceCtrl', allInstanceCtrl)
    .controller('taskListCtrl', taskListCtrl)
    .controller('procNotifyController', procNotifyController)
    .controller('bpmHrScriptListCtrl', bpmHrScriptListCtrl)
    .controller('conditionScriptListCtrl', conditionScriptListCtrl)
    .controller('conditionScriptEditCtrl', conditionScriptEditCtrl)
    .controller('conditionScriptGetCtrl', conditionScriptGetCtrl)
    .controller('scriptListCtrl', scriptListCtrl)
    .controller('scriptEditCtrl', scriptEditCtrl)
    .controller('scriptGetCtrl', scriptGetCtrl);