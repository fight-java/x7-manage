function LoginCtrl($scope,$rootScope, $location, $injector, AuthenticationService) {
    $scope.vm = {
    	username: '',
    	password: '',
    	loading: false
    };
    
    initController();
    
    function initController() {
        // reset login status
        AuthenticationService.Logout();
    };

    $scope.login = function() {
        $scope.vm.loading = true;
        AuthenticationService.Login($scope.vm.username, $scope.vm.password, function (rep) {
            if (rep && rep.result) {
            	AuthenticationService.loadDefaultPage();
            } else {
                $scope.vm.error = rep.message;
                $scope.vm.loading = false;
            }
        });
    };
}

/**
 * MainCtrl - controller
 * Contains several global data used in different view
 *
 */
function MainCtrl($scope, $http,$rootScope,$sessionStorage,$state, AuthenticationService) {
	$scope.logout = function(){
    	AuthenticationService.Logout();
    }
};

function bootstrapTableCtrl($scope, $timeout){
}

function treeTableCtrl($scope, baseService, dialogService){
	$scope.treeData = [];
	baseService
	.get("../mock/tree_data.json")
	.then(function(response){
		$scope.treeData = response;
	});
	
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTableTree.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});
	
	$scope.test = function(){
		dialogService.page('bo-selector', {alwaysClose: false}).then(function(r){
			dialogService.close(r.index);
		});
	}
	
	$scope.tree_click = function(e, i, n){
		$scope.dataTableTree.addQuery({property: 'categoryId', operation: 'equal', value: n.id});
		$scope.dataTableTree.query();
	}
}

function messageCtrl($scope, dialogService, baseService, toaster,$timeout){
	//选择国家化资源按钮
	$scope.resources = function() {
		//跳转选择国际化资源页面
		dialogService.page("i18n.i18nMessageSearch", {pageParam:{id:1}})
			.then(function(result){
				dialogService.msg("回传的数据:" + JSON.stringify(result));
			});
	}
	$scope.messageSuccess = function(){
		dialogService.success("操作成功").then(function(){
			dialogService.msg("这是回调");
		});
	}
	
	$scope.messagePrompt = function(){
		dialogService.msg("已完成，但有些记录没有成功删除");
	}
	
	$scope.messageWarn = function(){
		dialogService.warn("该数据已被关联，无法删除");
	}
	
	$scope.dialogError = function(){
		dialogService.fail("操作失败").then(function(){
			dialogService.msg("错误消息的回调");
		});
	}
	
	$scope.dialogConfirm = function(){
		dialogService.confirm("确认要删除吗?").then(function(){
			dialogService.msg("您选择了确定");
		}, function(){
			dialogService.msg("您选择了取消");
		});
	}
	
	$scope.dialogDetail = function(selector){
		
		if(selector=='user-selector'){
			var pageParam = {
							 single:true, /*是否单选*/ 
							 data:[
								 {id:"1", fullname:"张三"}
							 ]
							};
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam})
						 .then(function(result){
							 dialogService.msg("回传的数据:" + JSON.stringify(result));
						 });
		}
		else if(selector=='org-selector'){
			var pageParam = {
					 data:[
						 {id:"1", name:"广州分公司"},
						 {id:"2", name:"深圳分公司"}
					 ]
					};
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam})
						 .then(function(result){
							 dialogService.msg("回传的数据:" + JSON.stringify(result));
						 });
		}
		else if(selector=='pos-selector'){
			var pageParam = {
					 data:[
						 {id:"1", name:"技术部工程师"},
						 {id:"2", name:"销售部业务员"}
					 ]
					};
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam})
						 .then(function(result){
							 dialogService.msg("回传的数据:" + JSON.stringify(result));
						 });
		}else if(selector=='systype-selector' ){
			/**
			 * groupKey: 
			 * 对应表中的portal_sys_type_group 中的 group_key_ 字段
			 * FORM_TYPE，FLOW_TYPE
			 */
			var pageParam = {
					 groupKey: "FORM_TYPE"
					};
			
			dialogService.page(selector, {area:['300px', '600px'],pageParam: pageParam})
			 .then(function(result){
				 dialogService.msg("回传的数据:" + JSON.stringify(result));
			 });
		}
		else{
			dialogService.page(selector, {pageParam:{id:1}})
						 .then(function(result){
							 dialogService.msg("回传的数据:" + JSON.stringify(result));
						 });
		}
	}
	$scope.sidebar = function(){
		dialogService.sidebar("bo-detail", {bodyClose: false, width: '300px', pageParam: {name: '业务对象'}});
	}

	$scope.toasterSuccess = function(){
		toaster.success({ body:"Hi, welcome to Inspinia. This is example of Toastr notification box."});
	}

	$scope.toasterWarning = function(){
        toaster.warning({ title: "Title example", body:"This is example of Toastr notification box."});
    };

	$scope.toasterError = function(){
		toaster.pop({
            type: 'error',
            title: 'Title example',
            body: 'This is example of Toastr notification box.',
            showCloseButton: true,
            timeout: 1000
        });
	}

	$scope.treeData = [];
	baseService
	.get("../mock/tree_data.json")
	.then(function(response){
		$scope.treeData = response;
	});

	// 右键菜单点击前事件
	$scope.beforeRightClick = function(treeNode){
		if(treeNode.isParent){
			$scope.contextMenu = ['添加子项', '删除目录', '-', '授权'];
		}
		else{
			$scope.contextMenu = ['编辑', '删除'];
		}
	}

	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		dialogService.msg(menu);
		switch(menu){
			case '添加子项':
				break;
			case '删除目录':
				break;
			case '授权':
				break;
			case '编辑':
				break;
			case '删除':
				break;
		}
	}
	
	
	$scope.formTypeData = {};
	$scope.flowTypeData = {};
	
	// angularDemo
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	 };
	$scope.angularDemo = {};
	$scope.angularDemo.demo01 = "表达式的写法是{{表达式}} 表达式可以是变量或是运算式 example {{ 100 + 100 }} ";
	
	
	
}

function myHomeCtrl($scope, baseService, indexColumnService, $state, $sessionStorage){
	$scope.html = '';
	$scope.isAuth = true;
	
	$scope.initIndexColumn = function(){
		baseService.get("${portal}/portal/main/v1/myHome")
		.then(function(response) {
			if(response.state){
				html =  $.base64.decode(response.value,"utf-8");
				indexColumnService.showLayout($scope,html);
			}
		});	
	}
	
	if($sessionStorage.manageMenus){
		if($sessionStorage.manageMenus.length>0){
			$scope.initIndexColumn()
		}else{
			$scope.isAuth = false;
		}
	}else{
		$scope.$on("manageMenus:ready", function(e, manageMenus) {
			if(manageMenus.length>0){
				$scope.isAuth = true;
				$scope.initIndexColumn()
			}else{
				$scope.isAuth = false;
			}
	    })
	}
	
	//启动流程
	$scope.startFlow = function(id){
		$state.go("flow.flowListStart",{
			id:id
		});
	}
	
	//查看流程实例
	$scope.instanceDetail = function(id){
		$state.go('flow.instanceDetail',{id:id,state:'flow.defInstanceDetail'});
	}
	
	//任务处理
	//查看流程实例
	$scope.taskDetail = function(id){
		$state.go('flow.taskListDetail',{id:id,taskId:id});
	}
	
	//路由跳转
	$scope.stateGo = function(state,params){
		$state.go(state,params);
	}
	
	//路由跳转
	$scope.toHref = function(url){
		window.location.href = url;
	}
}

/**
 * 欢迎页面控制器
 * @returns
 */
function welcomeCtrl($scope, baseService, dialogService, $sessionStorage, $state){
	$scope.data = {};
	
	$scope.welcomeFail = function(){
		$scope.data = {"message":"您正在访问宏天软件的EIP系统，这是一个试用版本，您需要激活才能继续使用，但是现在系统似乎无法获取您的<span>机器码</span>，请与宏天售前人员联系。"};
	}
	
	$scope.init = function(){
		if($sessionStorage.welcome){
			var dataStr = $.base64.decode($sessionStorage.welcome, "utf-8");
			var data = angular.fromJson(dataStr);
			if(data && data.constructor==Object){
				$scope.data = data;
			}
			else{
				$scope.welcomeFail();
			}
		}
		else{
			$scope.welcomeFail();
		}
	}
	
	$scope.cert = function(){
		var url = "${uc}/actuator/cert";
		baseService
		.post(url, {activeCode: $scope.data.activationCode})
		.then(function(rep){
			if(rep && rep.result){
				dialogService.success(rep.message).then(function(){
					$state.go("login");
				});
			}
		}, function(r){
			if(r && !r.result){
				dialogService.fail(r.message);
			}
		});
	}
	
	$scope.init();
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('eip')
    .controller('LoginCtrl', LoginCtrl)
    .controller('MainCtrl', MainCtrl)
    .controller('myHomeCtrl', myHomeCtrl)
    .controller('bootstrapTableCtrl', bootstrapTableCtrl)
    .controller('treeTableCtrl', treeTableCtrl)
    .controller('messageCtrl', messageCtrl)
    .controller('welcomeCtrl', welcomeCtrl);
