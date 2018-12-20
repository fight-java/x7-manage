//  新闻公告 列表
function messageNewsListCtrl($scope, $compile,  baseService,dialogService,$state) {
	var defId='';
		
	$scope.operating = function(id,action){
		if(action == 'get'){
			dialogService.sidebar("messageNewsGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:'查看新闻公告',action:action}});
		}else{
			var title = action == "add" ? "添加新闻公告" : "编辑新闻公告";
			dialogService.sidebar("messageNewsEdit", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
	$scope.startFlow = function(){
		$state.go('flow.flowListStart',{id:defId,url:'m_portal.messageList'});
	}
	
	baseService
	.get("${bpmModel}/flow/def/v1/getBpmDefId?defKey=xwggsp")
	.then(function(response) {
		defId = response;
	});	
	
	
}

//  新闻公告 编辑明细
function messageNewsEditCtrl($scope, $compile, baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
	}
	
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${portal}/portal/messageNews/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
		});	
	}
	
	//保存
	$scope.save = function(){
			baseService
			.post("${portal}/portal/messageNews/v1/save",$scope.data)
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
angular.module('messageNews', [])
	.controller('messageNewsEditCtrl', messageNewsEditCtrl)
	.controller('messageNewsListCtrl', messageNewsListCtrl)

