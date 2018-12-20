function systemMenuListCtrl($scope, baseService,dialogService,$timeout,commonService){
	$scope.currentTree = '';
	// 处理返回的数据，没有子节点时不显示'减号'图标
	$scope.dataHandle = function(ary){
		for(var i=0,c;c=ary[i++];){
			if(c.children && c.children.length > 0){
				$scope.dataHandle(c.children);
			}
			else{
				c.isParent = false;
			}
		}
	}
	$timeout(function () {
		$scope.contentHeight=$(window).height()-280;
    });
	$scope.treeData = [];
	$scope.data={};
	$scope.data.load="/n";
	$scope.data.sysMethods=[];
	$scope.isEditable=false;
	$scope.parentId="";
	$scope.loadTree=function(){
		var url = "${portal}/sys/sysMenu/v1/getTree"
			//加载树
			baseService
			.get(url)
			.then(function(response){
				$scope.dataHandle(response);
				$scope.treeData = response;
			});
	}
	$scope.loadTree();
	$scope.$on('sidebar:close',
		function() { //添加监听事件,监听子页面是否关闭
			if($scope.currentTree=="0"){
				$scope.treeData = "";
				$scope.loadTree();
			}
		})
	$scope.add=function(){
		var temp = {};
		$scope.data.sysMethods.push(temp);
	}
	$scope.deleteSysMethods=function(index,list){
		list.splice(index,1);
	}
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	 };
	$scope.isMenuExistByAlias=function(){
		var url = "${portal}/sys/sysMenu/v1/isMenuExistByAlias?alias="+$scope.data.alias;
		baseService
		.get(url)
		.then(function(response){
			if(response.value){
				$scope.data.alias="";
				dialogService.fail("菜单资源别名已经存在!请重新输入");
			}
		});
		
	}
	$scope.getJson=function(id){
		$scope.currentTree="0";
		var url = "${portal}/sys/sysMenu/v1/getJson?id="+id;
		baseService
		.get(url)
		.then(function(response){
			$scope.data=response;
			$scope.data.sysMethods=$scope.data.sysMethods;
			$("#categoryDisplay").css("display","block");
		});
	}

	//树左击事件
	$scope.tree_click = function(e, i, n){
		if(n.id!=0){
			$scope.data=$scope.getJson(n.id);
			$scope.isEditable=false;
		}
		//dialogService.closeSidebar();
	}

	$scope.beforeRightClick = function(treeNode){
		if(!treeNode) return;
		if(treeNode.id==0){
			$scope.contextMenu = [ '添加资源','刷新'];
		}
		else{
			$scope.contextMenu = ['添加资源', '编辑资源', '删除资源'];
		}
		//dialogService.closeSidebar();
	}
	$scope.close=function(){
        $("#categoryDisplay").css("display","none");
        dialogService.closeSidebar();
	}
	$scope.save=function(){
		var url = "${portal}/sys/sysMenu/v1/save";
		if($scope.data.parentId==""||$scope.data.parentId==null){
			$scope.data.parentId=$scope.parentId;
		}
		$scope.data.open=$scope.data.open==1;
		baseService
		.post(url,$scope.data)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$("#categoryDisplay").css("display","none");
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '删除失败');
			}
		});
	}

	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		switch(menu){
		case '添加资源':
			$scope.getJson('');
			$scope.parentId=treeNode.id;
			$scope.isEditable=true;
			break;
		case '编辑资源':
			$scope.getJson(treeNode.id);
			$scope.isEditable=true;
			break;
		case '删除资源':
			$scope.currentTree="0";
			var url = "${portal}/sys/sysMenu/v1/remove?id="+treeNode.id;
			dialogService.confirm("是否确认删除？").then(function(){
				baseService.remove(url).then(function(rep){
					if(rep && rep.state){
						dialogService.success(rep.message).then(function(){
							$("#categoryDisplay").css("display","none");
							dialogService.closeSidebar();//关闭窗口
						});
					}else{
						dialogService.fail(rep.message || '删除失败');
					}
				});
			});
			break;				
		}
	}
	
	$scope.addI18nMessage = function(key){
		 //跳转操作页面
        dialogService.sidebar("i18n.i18nMessageEdit", {bodyClose: false, width: '40%', pageParam: {key:key,title:key+" 菜单资源国际化"}});
        
	} 
}


function systemAttributesCtrl($scope, dialogService,baseService){
	$scope.edit = function(id, action) {
		dialogService.sidebar("system.systemAttributesEdit", {
			bodyClose: false,
			width: '600px',
			pageParam: {
				id: id,
				action: action
			}
		});
		$scope.$on('sidebar:close',
				function() { //添加监听事件,监听子页面是否关闭
			$scope.dataTable.query(); //子页面关闭,父页面数据刷新
		})
	};

	$scope.removeList=function(id){
		var url = "${portal}/sys/sysProperties/v1/remove?id="+id;
		baseService.post(url).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '删除失败');
			}
		});
	}
}

//系统属性
function systemAttributesEditCtrl($scope, dialogService,baseService){
	$scope.data={
		encrypt: false
	};
	
	$scope.disabled=false;
	$scope.category={};
	$scope.detail = function(id){
		var url = "${portal}/sys/sysProperties/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
			$scope.data.encrypt = !!$scope.data.encrypt;
		});
	}
	$scope.disabled=false;
	$scope.title=""
	if($scope.pageParam.action=='add'){
		$scope.title="添加系统属性"
	}else if($scope.pageParam.action=='edit'){
		$scope.title="编辑系统属性";
	}else{
		$scope.title="查看系统属性";
		$scope.disabled=true;
	}	
		
	$scope.id = $scope.pageParam.id;
	$scope.detail($scope.id);
	
	$scope.save = function(id){
		var url = "${portal}/sys/sysProperties/v1/save";
		$scope.data.encrypt=$scope.data.encrypt==true?1:0;
		baseService.post(url,$scope.data).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
			}
		});
	}

	$scope.changeGroup=function(){
		$scope.data.group=$scope.category;
	}

	$scope.close=function(){
		dialogService.closeSidebar();
	}
}

function classifyEditCtrl($scope,baseService,dialogService){
	$scope.data={};
	$scope.category={};
	$scope.detail = function(id,parentId){
		var url = "${portal}/file/catalog/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
			if(parentId!=''){
				$scope.data.parentId=parentId;
			}
		});
	}
	$scope.title=$scope.pageParam.action=='add'?"添加附件分类":"编辑附件分类";
	$scope.id = $scope.pageParam.id;
	$scope.parentId = $scope.pageParam.parentId;
	$scope.detail($scope.id,$scope.parentId);

	$scope.save = function(id){
		var url = "${portal}/file/catalog/v1/save";
		baseService.post(url,$scope.data).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
			}
		});
	}
	$scope.close=function(){
		dialogService.closeSidebar();
	}
}


function systemFileListCtrl($scope,baseService,dialogService,context,$state){
	$scope.currentTree = '';
	$scope.getTree=function(){
		var url = "${portal}/file/catalog/v1/getTree"
			//加载树
			baseService
			.get(url)
			.then(function(response){
				$scope.treeData = response;
			});
	}
	$scope.treeData={};
	$scope.getTree();
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});
    $scope.$on('sidebar:close',function() { //添加监听事件,监听子页面是否关闭
		if($scope.currentTree=="0"){
			$scope.treeData="";
			$scope.getTree();
		}
    });
	$scope.download=function(id){
		var contexts = context();
		var portal=contexts.portal;
		var url = portal+"/system/file/v1/downloadFile?fileId="+id;
		document.location.href=url;
	}
	$scope.readOffice=function(id){
        var url = "${portal}/file/onlinePreviewController/v1/onlinePreview?fileId="+id;
        baseService.get(url).then(function(rep){
            var data=JSON.stringify(rep);
            data=$.base64.encode(data,"utf-8");
            var stateUrl="system."+rep.result;
             $state.go(stateUrl,{data:data});
        });
	}
	$scope.remove=function(id){
		$scope.currentTree="0";
		var url="${portal}/file/catalog/v1/remove?id="+id;
		dialogService.confirm("是否确认删除？").then(function(){
			baseService.remove(url).then(function(rep){
				if(rep && rep.state){
					dialogService.success(rep.message).then(function(){
						dialogService.closeSidebar();//关闭窗口
					});
				}else{
					dialogService.fail(rep.message || '删除失败');
				}
			});
		});
	}

	//树单击事件
	$scope.tree_click = function(e, i, n){
		if(n.id!=-1){
			$scope.dataTable.addQuery({property: 'xbTypeId', operation: 'equal', value: n.id});
		}else{
			$scope.dataTable.reset();
		}

		$scope.dataTable.query();
	}
	//树右击事件
	$scope.beforeRightClick = function(treeNode){
		if(treeNode.id==-1){
			$scope.contextMenu = [ '添加分类'];
		}
		else{
			$scope.contextMenu = ['添加分类', '编辑分类', '删除分类'];
		}
	}
	$scope.edit=function(id,action,nodeId){
		$scope.currentTree="0";
		dialogService.sidebar("system.fileClassifyEdit", {
			bodyClose: false,
			width: '300px',
			pageParam: {
				id: id,
				parentId:nodeId,
				action: action
			}
		});
	}
	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		switch(menu){
		case '添加分类':
			$scope.edit('','add',treeNode.id);
			break;
		case '编辑分类':
			$scope.edit(treeNode.id,'edit','');
			break;
		case '删除分类':
			$scope.remove(treeNode.id);
			break;				
		}
	}

}
function schedulerListCtrl($scope, baseService,dialogService,$state){
	$scope.jobName="";
	var url = "${portal}/job/scheduler/v1/getStand"
		//获取定时计划的状态
		baseService
		.get(url)
		.then(function(response){
			$scope.isStandby = response;
		});
	$scope.changeStart=function(isStandby){
		var url = '${portal}/job/scheduler/v1/changeStart?isStandby='+isStandby;
		baseService
		.post(url)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
				});
			}else{
				dialogService.fail(rep.message || '操作失败');
			}
		});
	}
	$scope.add=function(){
		dialogService.sidebar("system.schedulerListAddScheduler", {
			bodyClose: false,
			width: 'calc(100% - 225px)',
			pageParam: {

			}
		});
		$scope.$on('sidebar:close',
				function() { //添加监听事件,监听子页面是否关闭
			$scope.dataTable.query(); //子页面关闭,父页面数据刷新
		})
	}
	
	//执行计划
	$scope.executeJob=function(jobName){
		var url = '${portal}/job/scheduler/v1/executeJob?jobName='+jobName;
		baseService
		.post(url)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.dataTable.query();
				});
			}else{
				dialogService.fail(rep.message || '操作失败');
			}
		});
	}
	//查看日志
	$scope.lookLog=function(jobName,trigName){
		$state.go('system.schedulerListTriggerListExecuteJobList',{jobName:jobName,trigName:trigName});
	}
	
	//查看计划列表
	$scope.triggersJob=function(jobName){
		$state.go('system.schedulerListTriggerList',{jobName:jobName});
	}


    $scope.delJob=function(jobName){
        var url = '${portal}/job/scheduler/v1/delJob?jobName='+jobName;
        dialogService.confirm("是否确认删除？").then(function(){
            baseService.remove(url).then(function(rep){
                if(rep && rep.state){
                    dialogService.success(rep.message).then(function(){
                        $scope.dataTable.query();
                    });
                }else{
                    dialogService.fail(rep.message || '删除失败');
                }
            });
        });
    }
	
	
}
function executeJobListCtrl($scope,$stateParams,$state,baseService){
	$scope.jobName=$stateParams.jobName;
	$scope.trigName=$stateParams.trigName;
	$scope.back=function(jobName){
		if($scope.trigName==''){
			$state.go('system.schedulerList',{});
		}else{
			$state.go('system.schedulerListTriggerList',{jobName:$scope.jobName});
		}
	}
}




function triggersListCtrl($scope,dialogService,$stateParams,$state,baseService){
	$scope.jobName=$stateParams.jobName;
	
	$scope.lookLog=function(jobName,trigName){
		$state.go('system.schedulerListTriggerListExecuteJobList',{jobName:jobName,trigName:trigName});
	}
	
	
	$scope.addTriggers=function(){
		dialogService.sidebar("system.schedulerListTriggerListAddTriggers", {
			bodyClose: false,
			width: '40%',
			pageParam: {
				jobName:$scope.jobName
			}
		});
		$scope.$on('sidebar:close',
				function() { //添加监听事件,监听子页面是否关闭
			$scope.dataTable.query(); //子页面关闭,父页面数据刷新
		})
	}
	$scope.back=function(jobName){
		$state.go('system.schedulerList',{});
	}
	
	$scope.banAndPlay=function(triggerName){
		var url = '${portal}/job/scheduler/v1/toggleTriggerRun?name='+triggerName;
		baseService
		.post(url)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.dataTable.url="${portal}/job/scheduler/v1/getTriggersJsonByJob?jobName="+$scope.jobName;
					$scope.dataTable.query();
				});
			}else{
				dialogService.fail(rep.message || '操作失败');
			}
		});
	}
	
	$scope.deltriggers=function(triggerName){
		var url = '${portal}/job/scheduler/v1/delTrigger?name='+triggerName;
		dialogService.confirm("是否确认删除？").then(function(){
			baseService.remove(url).then(function(rep){
				if(rep && rep.state){
					dialogService.success(rep.message).then(function(){
						$scope.dataTable.url="${portal}/job/scheduler/v1/getTriggersJsonByJob?jobName="+$scope.jobName;
						$scope.dataTable.query();
					});
				}else{
					dialogService.fail(rep.message || '删除失败');
				}
			});
		});
	}
}

function addTriggersCtrl($scope,baseService,dialogService){
	$scope.data={};
	$scope.data.jobName=$scope.pageParam.jobName;
	$scope.txtOnceHours=[];
	$scope.chkMons= new Array(31)
	$scope.rdoTimeType="2";
    $scope.txtMon="00:00";
    $scope.txtWeek="00:00";
	$scope.selEveryDay=1;
	$scope.selEveryDays=[{"key":1,"value":"1分钟"},{"key":5,"value":"5分钟"},{"key":10,"value":"10分钟"},{"key":15,"value":"15分钟"},{"key":30,"value":"30分钟"},{"key":60,"value":"1小时"}];
	$scope.getPlan=function(planType){
		var str="";
		switch(planType)
		{
			case "1":
				str=$("#sampleDate").val();
				str="{\"type\":1,\"timeInterval\":\"" +str+"\"}";
				break; 
			case "2":
				str= $scope.selEveryDay;
				str="{\"type\":2,\"timeInterval\":\"" +str+"\"}"; 
				break; 
			case "3":
				 var h= $scope.txtDayHour;
				  var m= $scope.txtDayMinute;
		          str=  h +":" + m ;
		          str="{\"type\":3,\"timeInterval\":\"" +str+"\"}"; 
				break; 
			case "4":
				 str=$.getChkValue("chkWeek");

		          str+="|" + $scope.txtWeek;
		          str="{\"type\":4,\"timeInterval\":\"" +str+"\"}"; 
				break; 
			case "5":
				 str=$.getChkValue("chkMon");
		          str+="|" + $scope.txtMon;
		          str="{\"type\":5,\"timeInterval\":\"" +str+"\"}"; 
				break; 
			case "6":
				str+=$scope.txtCronExpression;
				str="{\"type\":6,\"timeInterval\":\"" +str+"\"}"; 
				break; 
			 
		}
		return str;
	}
    $scope.close=function(){
        dialogService.closeSidebar();
	}

	$scope.save=function(){
		var rdoTimeType=$scope.rdoTimeType;
		var str=$scope.getPlan(rdoTimeType);
		$scope.data.description=str;
		var url="${portal}/job/scheduler/v1/addTrigger";
		baseService
		.post(url,$scope.data)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
			}

		});
	}
}

function addSchedulerCtrl($scope,baseService,dialogService){
	$scope.data={};
	$scope.paraTypes=[{key:'int',value:'int'},{key:'long',value:'long'},{key:'float',value:'float'},{key:'string',value:'string'},{key:'blooean',value:'blooean'}];;
	$scope.data.parameterJson=[];
	$scope.addRow=function(){
		var temp = {};
		temp.paraName="";
		temp.paraType="";
		temp.paraValue="";
		$scope.data.parameterJson.push(temp);
	}
	$scope.save=function(){
	    if($scope.data.jobName==""||$scope.data.jobName==undefined){
            dialogService.fail('任务名为必填字段');
            return;
        }
        if($scope.data.className==""||$scope.data.className==undefined){
            dialogService.fail('任务类为必填字段');
            return;
        }
		var url="${portal}/job/scheduler/v1/addJob";
		if($scope.data.parameterJson!=null&&$scope.data.parameterJson.length>0){
			$scope.data.parameterJson=JSON.stringify($scope.data.parameterJson);
		}else{
            $scope.data.parameterJson="";
		}
		baseService
		.post(url,$scope.data)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
				if($scope.data.parameterJson==""){
                    $scope.data.parameterJson=[];
				}else{
                    $scope.data.parameterJson=JSON.parse($scope.data.parameterJson);
				}
			}

		});
	}
	$scope.close=function(){
		dialogService.closeSidebar();
	}
	$scope.del=function(idx, list){
            list.splice(idx, 1);
	}
	$scope.isExist=function(type){
		var name =$scope.data.className;
		if(type=="jobName"){
			name =$scope.data.jobName;
		}
		var url="${portal}/job/scheduler/v1/isExist?type="+type+"&name="+name;
		baseService
		.get(url)
		.then(function(response){
			if(response){
				var msg = type=="jobName"?'任务名称已经存在，请重新填写！':'任务列表中已添加该任务类记录，不能多次添加同一任务类！';
				dialogService.fail(msg).then(function(){
					if(type=="jobName"){
						$scope.data.jobName="";
					}else{
						$scope.data.className="";
					}
				});
			}

		});
	}
	$scope.validClass=function(){
		var className =$scope.data.className;
		if (!className || (!!className&& className.length == 0)) {
			dialogService.fail("请先输入任务类名再点击验证按钮").then(function(){
			});
			return;
		}
		var data = "className=" + className;
		var url="${portal}/job/scheduler/v1/validClass?className="+className;
		baseService
		.get(url)
		.then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
				});
			}else{
				dialogService.fail(rep.message || '验证失败');
			}

		});
	}
}
//授权列表
function authorizationCtrl($scope,dialogService){
	$scope.editRoleRes=function(row){
		if(row.enabled==0){
			dialogService.fail('该角色已被禁用无法进行授权');
			return ;
		}
		dialogService.page('system.authorizationResourceDialog', {pageParam:{alias:row.code}}).then(function(r){
			dialogService.close();
		});
	}
	//权限复制
	$scope.permissionCopy=function(row){
		if(row.enabled==0){
			dialogService.fail('该角色已被禁用无法进行权限复制');
			return ;
		}
		dialogService.page('resourceDialogCopy',{pageParam:row}).then(function(r){
			dialogService.close();
		});
	}
}

//复制权限
function resourceDialogCopyCtrl($scope,dialogService,baseService){
	$scope.row = $scope.pageParam;//原角色信息
	$scope.data={};
	baseService.get(getContext()['uc']+"/api/role/v1/roles/getNotCodeAll?code="+$scope.row.code).then(function(response){
			if(response){
				$scope.roles = response;
			}
		});
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		if($scope.data.rowCode == undefined){
			dialogService.warn('请选择权限复制角色');
			return;
		}
		var url = "${portal}/sys/sysRoleAuth/v1/saveCopy?oldCode="+$scope.row.code+"&newCodes="+$scope.data.rowCode;
		baseService.post(url).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
			}
		});
	}
}

//授权管理
function authorizationEditCtrl($rootScope,$scope,dialogService,baseService,$window){
	$scope.autoHeight = $window.innerHeight-160;
	$scope.data={};
	$scope.data.arrMenuAlias=[];
	$scope.data.arrMethodAlias=[];
	$scope.data.dataPermission={};
	var resourcesTree;
	var setting = {
			data: {
				key : {
					name: "name",
					title: "name"
				},
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: -1
				}
			},
			view: {
				selectedMulti: true,
				showIconFont:true
			},
			check: {
				enable: true,
				chkboxType: { "Y": "ps", "N": "ps" }
			}
		};
	
	var url = "${portal}/sys/sysMenu/v1/getAllMenuRoleAlias?roleAlias="+$scope.pageParam.alias;
	
	$scope.treeConfig = {
			data:{
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: "-1"
				}
			},
			check: {
				enable: true,
				chkboxType: { "Y": "ps", "N": "ps" }
			}
	}
	
	baseService.get(url).then(function(result){
		$scope.treeData = result;
	});
	
	$scope.back = function(){
		dialogService.closeSidebar();//关闭窗口
	}
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.save = function(){
		var resourcesTree =  $scope.treeInstance;
		var nodes = resourcesTree.getCheckedNodes(true);
		angular.forEach(nodes,function(obj,n){
			if(obj.id != -1){
				$scope.data.arrMenuAlias.push(obj.alias);
			}
		});
		angular.forEach($scope.dataTable.rows,function(method,key){
			if(method.isSelected){
				$scope.data.arrMethodAlias.push(method.alias);
				if(method.dataPermission){
					if(typeof method.dataPermission == "object" ){
						method.dataPermission = JSON.stringify(method.dataPermission);
					}
					$scope.data.dataPermission[method.alias] = method.dataPermission;
				}
			}
		})
		
		var url = "${portal}/sys/sysRoleAuth/v1/save";
		baseService.post(url,$scope.data).then(function(rep){
			if(rep && rep.state){
				dialogService.success(rep.message).then(function(){
					dialogService.closeSidebar();//关闭窗口
				});
			}else{
				dialogService.fail(rep.message || '保存失败');
			}
		});
	}
	$scope.data.roleAlias=$scope.pageParam.alias;
	$scope.roleAlias = $scope.data.roleAlias
	$scope.search = "";
	$scope.treeClik = function(e, i, n){
		$scope.search = n.alias;
	}
	$scope.zTreeOnCheck = function(e,i,n){
		if(n.checked){
			$scope.search = n.alias;
		}
	}
	
	
	$scope.setDataPermission = function(row){
		if(!row.dataPermission){ 
			row.dataPermission = [];
		}else{
		 	if( typeof row.dataPermission  == "string" ){
		 		row.dataPermission = $.parseJSON(row.dataPermission);
		 	}
		}
		
		dialogService.page('dataPermissionSetting', { bodyClose: false,width: 'calc(100%-425px)',pageParam:{dataPermission:row.dataPermission}})
		.then(function(result){
			row.dataPermission = JSON.stringify(result);
		 });
	}
	
}

function dataPermissionEditCtrl($rootScope,$scope,dialogService){
	$scope.dataPermission = {loginUser:0,loginUserOrgs:0,loginUserSubOrgs:0};
	if($scope.pageParam && $scope.pageParam.dataPermission){
		for (var int = 0; int < $scope.pageParam.dataPermission.length; int++) {
			var obj = $scope.pageParam.dataPermission[int];
			if( "customOrgs" != obj.type ){
				$scope.dataPermission[obj.type] = 1;
			}else{
				$scope.orgSelectedArray = obj.orgs;
			}
		}
	}
	
	
	var resultData = [];
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		
		if($scope.dataPermission.loginUser){
			resultData.push( {type: "loginUser",name: "当前登录用户数据"} );
		}
		
		if($scope.dataPermission.loginUserOrgs){
			resultData.push( {type: "loginUserOrgs",name: "当前登录用户部门数据"} );
		}
		
		if($scope.dataPermission.loginUserSubOrgs){
			resultData.push( {type: "loginUserSubOrgs",name: "当前登录用户部门及下级部门数据"} );
		}
		
		if($scope.orgSelectedArray){
			var customOrgs = {type: "customOrgs",name: "自定义选择组织",orgs:[]};
			for (var int = 0; int < $scope.orgSelectedArray.length; int++) {
				var selectOrg = $scope.orgSelectedArray[int];
				var orgObj = {};
				orgObj.id = selectOrg.id;
				orgObj.name = selectOrg.name;
				customOrgs.orgs.push(orgObj);
			}
			resultData.push(customOrgs);
		}
		
		return resultData;
	}
	
	
	var pageParam = {
			 data:[
			 ]
			};
	
	$scope.orgSelector = function(){
		pageParam.data =  $scope.orgSelectedArray;
		dialogService.page("org-selector", {area:['1120px', '650px'], pageParam: pageParam})
		 .then(function(result){
			 $scope.orgSelectedArray  = result;
		 });
	}
	
	$scope.removeSelectedArr = function(arr,item){
		$scope[arr].remove(obj);
	};
	
	
}

function resourcesIconsCtrl($scope,dialogService,baseService){
	$scope.iconList = [];
	var selectedImg=null;
	
	function showResponse(responseText){
		
	};
	
	$.ajax({
		url:'./fonts/fonts.json',
		dataType:'text',
		async:false,
		success:function(data){
			$scope.iconList = parseToJson(data);
			initSelectEvent();
		}
	});
	
	$scope.pageSure = function(){
		var selected = $("#iconList").find(".selected");
		if(selected&&selected.length>0){
			return $(selected[0]).attr('alias');
		}
		return "";
	}
	
	function initSelectEvent(){
		setTimeout(function(){
			$("#iconList i").click(function(){
				if(selectedImg){
					$(selectedImg).removeClass('selected');
				}
				$(this).addClass('selected');
				selectedImg=this;
			});
			
		})
	}
	
}


function uploadCtrl($scope,dialogService,baseService, FileUploader){
	var type = $scope.pageParam.type;
	var	max = $scope.pageParam.max;
	var	size = Number($scope.pageParam.size);
	var showCountMessage=false;
	var sameOrigin = true;
	var url = window.getContext().portal+"/system/file/v1/upload";
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
					dialogService.fail("最多只能上传" + max + "个文件");
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
				debugger;
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
	uploader.onSuccessItem = function(fileItem, response) {
		if(response.state){
			var result = parseToJson(response.value);
			fileItem.json = {
				id : result.fileId,
				name : result.fileName,
				size : result.size
			};
		}else{
			dialogService.fail("文件上传失败："+response.message);
		}
	};
	
	uploader.onRemoveItem = function(fileItem){
		if(fileItem.isUploaded){
			var url  = window.getContext().portal+"/system/file/v1/remove";
			baseService.post(url,fileItem.json.id).then(function(){
			},function(data){
				dialogService.fail("删除附件失败");
			});
		}
	}
	
	$scope.pageSure = function(){
		var fileArray = [];
		if($scope.uploader.queue){
			var queue = $scope.uploader.queue;
			for (var i = 0; i < queue.length; i++) {
				if(queue[i].json){
					fileArray.push(queue[i].json);
				}
			}
		}
		return fileArray;
	}
}




angular
	.module('system', [])
	.controller('executeJobListCtrl', executeJobListCtrl)
	.controller('authorizationCtrl', authorizationCtrl)
	.controller('authorizationEditCtrl', authorizationEditCtrl)
	.controller('triggersListCtrl', triggersListCtrl)
	.controller('addTriggersCtrl', addTriggersCtrl)
	.controller('addSchedulerCtrl', addSchedulerCtrl)
	.controller('schedulerListCtrl', schedulerListCtrl)
	.controller('systemMenuListCtrl', systemMenuListCtrl)
	.controller('classifyEditCtrl', classifyEditCtrl)
	.controller('systemFileListCtrl', systemFileListCtrl)
	.controller('systemAttributesCtrl', systemAttributesCtrl)
	.controller('systemAttributesEditCtrl', systemAttributesEditCtrl)
	.controller('resourcesIconsCtrl', resourcesIconsCtrl)
	.controller('uploadCtrl', uploadCtrl)
	.controller('dataPermissionEditCtrl', dataPermissionEditCtrl)
	.controller('resourceDialogCopyCtrl', resourceDialogCopyCtrl);
