//  会议室预约 列表
function meetingRoomAppointmentListCtrl($scope, $compile,  baseService,dialogService) {
	
	$scope.operating = function(id,action){
		if(action == 'get'){
			dialogService.sidebar("meetingRoomAppointmentGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:'查看会议室预约',action:action}});
		}else{
			var title = action == "add" ? "添加会议室预约" : "编辑会议室预约";
			dialogService.sidebar("meetingRoomAppointmentEdit", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
}

//  会议室预约 编辑明细
function meetingRoomAppointmentEditCtrl($scope, $compile, baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
	}
	
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${portal}/portal/meetingRoomAppointment/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
		});	
	}
	
	//保存
	$scope.save = function(){
			baseService
			.post("${portal}/portal/meetingRoomAppointment/v1/save",$scope.data)
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
angular.module('meetingRoomAppointment', [])
	.controller('meetingRoomAppointmentEditCtrl', meetingRoomAppointmentEditCtrl)
	.controller('meetingRoomAppointmentListCtrl', meetingRoomAppointmentListCtrl)

