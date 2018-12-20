function logCtrl($scope, $timeout,baseService,dialogService){
	$scope.operating = function(id,action){
		if(action == 'get'){
			dialogService.sidebar("sysLogsSettingsGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:'查看日志配置',action:action}});
		}else{
			var title = action == "add" ? "添加日志配置" : "编辑日志配置";
			dialogService.sidebar("sysLogsSettingsEdit", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
	$scope.logDetail = function(id){
		dialogService.sidebar("sysLogsGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:'查看日志详情',action:"get"}});
	}
}


//日志配置 编辑明细
function sysLogsSettingsEditCtrl($scope, $compile, baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
	}
	
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${portal}/sys/sysLogsSettings/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
		});	
	}
	
	//保存
	$scope.save = function(){
			baseService
			.post("${portal}/sys/sysLogsSettings/v1/save",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
					$scope.close();
				}
			});	
	}
}


//系统操作日志 编辑明细
function sysLogsEditCtrl($scope, $compile, baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
	}
	
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${portal}/sys/sysLogs/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
	});	
}

//保存
$scope.save = function(){
		baseService
		.post("${portal}/sys/sysLogs/v1/save",$scope.data)
		.then(function(response) {
			if(!response.state){
				dialogService.fail(response.message);
			}else{
				dialogService.success(response.message);
				$scope.close();
			}
		});	
}
}

/**
 *
 * Pass all functions into module 
 */
angular
    .module('log', [])
    .controller('sysLogsSettingsEditCtrl', sysLogsSettingsEditCtrl)
    .controller('sysLogsEditCtrl', sysLogsEditCtrl)
    .controller('logCtrl', logCtrl);