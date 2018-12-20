//  分类管理 列表
function messageTypeListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.operating = function(id,action){
		if(action == 'get'){
			dialogService.sidebar("messageTypeGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:'查看分类管理',action:action}});
		}else{
			var title = action == "add" ? "添加分类管理" : "编辑分类管理";
			dialogService.sidebar("messageTypeEdit", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
}

//  分类管理 编辑明细
function messageTypeEditCtrl($scope, $compile, baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
		pendingUserId:'',
		isPending:1,
		pendingUserName:""
	}
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${bpmRunTime}/portal/messageType/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
			if($scope.data.isPending==1){
				$("#pendingUser").css("display","block");
			}else{
				$("#pendingUser").css("display","none");
			}
		});	
	}
	
	$scope.userDialog = function() {
		$scope.tempUserList=[];
		if($scope.data.pendingUserId !=''){
			var nameArr=$scope.data.pendingUserName.split(',');
			var idArr=$scope.data.pendingUserId.split(',');
			for(var i=0;i<nameArr.length;i++){
				$scope.tempUserList.push({
					id:idArr[i],
					fullname:nameArr[i]
				})
			}
		}
		var pageParam = {
				 data:$scope.tempUserList
				};
             dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(data){
					$scope.data.pendingUserName = "";
					$scope.data.pendingUserId = "";
					$(data).each(function(index,item) {
						if(index==0){
							$scope.data.pendingUserId += item.account;
							$scope.data.pendingUserName+= item.fullname;
						}else{
							$scope.data.pendingUserId +=','+ item.account;
							$scope.data.pendingUserName+=','+ item.fullname;
						}
					});
			 });
	};
	$("#inlineRadio2").click(function(){
		$scope.data.pendingUserName="";
		$scope.data.pendingUserId="";
		$("#pendingUser").css("display","none");
	});
	$("#inlineRadio1").click(function(){
		$("#pendingUser").css("display","block");
	});
	//保存
	$scope.save = function(){
		baseService
		.post("${bpmRunTime}/portal/messageType/v1/save",$scope.data)
		.then(function(response) {
			if(!response.state){
				dialogService.fail(response.message);
			}else{
				dialogService.success(response.message);
				$scope.close();
			}
		});
	}
	//新增或修改，先判断
	$scope.isExist = function(){
		if($scope.data.isPending==1 && $scope.data.pendingUserName==""){
			dialogService.warn("请选择审批人");
			return;
		}else{
			$scope.save();
		}
	}
}

/**
 *
 * Pass all functions into module
 */
angular.module('messageType', [])
	.controller('messageTypeEditCtrl', messageTypeEditCtrl)
	.controller('messageTypeListCtrl', messageTypeListCtrl)

