function boSelectorCtrl($scope, dialogService){
	// 获取父页面传递过来的值
	if($scope.pageParam){
		$scope.id = $scope.pageParam.id;
	}
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.dataTable.selectRow();
	}
    $scope.$on("table:ready", function(t, m){
        var status="normal";
        var deployed=true;
        $scope.dataTable.addQuery({property: 'status_', operation: 'equal', value: status});
        $scope.dataTable.addQuery({property: 'deployed', operation: 'equal', value: deployed});
        m.query();
    });
}

function scriptSelectorCtrl($scope, dialogService){
	// 获取父页面传递过来的值
	if($scope.pageParam){
		$scope.id = $scope.pageParam.id;
	}
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.dataTable.selectRow();
	}
}

function userSelectorCtrl($scope,dialogService,baseService){
	// 手风琴菜单的展开状态
	$scope.openStatus = {
		org: false,
		pos: false,
		role: false
	};
	//有些情况下，初始化的数据中不一定有id。所以需要标记区分
	var uniqueKeyName='id';
	
	$scope.treeConfig = {
			data: {
				simpleData:{
					enable: true,
					idKey: "id",
					pIdKey: "parentId"
				}
			}
	};
	
	// 初始化组织分类
	$scope.orgInit = function(){
		// 获取所有维度
		baseService.get("${uc}/api/demension/v1/dems/getAll")
				   .then(function(response){
						if(response && response.length > 0){
							$scope.dems = response;
							$scope.currentDem = $scope.dems[response.length - 1];
						}
				    });
		
		// 监控维度变化
		$scope.$watch('currentDem.id', function(n, o){
			if(n!==o){
				// 重置组织树的数据
				$scope.orgTreeData = [];
				$scope.loadOrgTreeData();
			}
		});
		
		// 加载组织树数据
		$scope.loadOrgTreeData = function(p){
			var params = {demId:$scope.currentDem.id};
			if(p){
				params["parentId"] = p;
			}
			baseService.post("${uc}/api/org/v1/orgs/getByParentAndDem", params)
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
		
		// 树节点展开事件
		$scope.orgTree_expand = function(e, i, n){
			if(!n.hasLoadChildren){
				n.hasLoadChildren = true;
				$scope.loadOrgTreeData(n.id);
			}
		}
		
		//将当前选中项作为查询条件
		$scope.orgTree_click = function(e, i, n){
			if(n.id!='0'){
				$scope.dataTable.addQuery({property: 'org_id_', operation: 'equal', value: n.id});
			}
			else{
				$scope.dataTable.clearQuery();
			}
			//执行列表查询
			$scope.dataTable.query();
		}
	}
	
	// 初始化岗位分类
	$scope.posInit = function(){
		baseService.post("${uc}/api/org/v1/orgPosts/getOrgPostPage", {})
		   .then(function(response){
			   $scope.posTreeData = response.rows;
		   });

		$scope.posTree_click = function(e, i, n){
			//将当前选中项作为查询条件
			$scope.dataTable.addQuery({property: 'pos_id_', operation: 'equal', value: n.id});
			//执行列表查询
			$scope.dataTable.query();
		}
	}
	
	// 初始化角色分类
	$scope.roleInit = function(){
		baseService.post("${uc}/api/role/v1/roles/getAll")
				   .then(function(response){
						$scope.roleTreeData = response;
				   });

		$scope.roleTree_click = function(e, i, n){
			//将当前选中项作为查询条件
			$scope.dataTable.addQuery({property: 'role_id_', operation: 'equal', value: n.id});
			//执行列表查询
			$scope.dataTable.query();
		}
	}
	
	// 展开某个分类时才加载分类数据
	$scope.$watch('openStatus', function(n, o){
		if(n!==o){
			if(n.org && !n.orgReady){
				n.orgReady = true;
				$scope.orgInit();
			}
			if(n.pos && !n.posReady){
				n.posReady = true;
				$scope.posInit();
			}
			if(n.role && !n.roleReady){
				n.roleReady = true;
				$scope.roleInit();
			}
		}
	}, true);
	
	$scope.userSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.userSelectArr = $scope.pageParam.data;
		//如果初始化数据中没有id属性，有账号，将会账号作为唯一标识
		if($scope.userSelectArr[0] && $scope.userSelectArr[0].account && !$scope.userSelectArr[0].id)uniqueKeyName='account';
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.userSelectArr;
	}

	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.userSelectArr.push(data);
	
			$scope.userSelectArr.unique(function(x,y){
				return x[uniqueKeyName]==y[uniqueKeyName];
			});
			if($scope.pageParam.single){
				angular.forEach($scope.userSelectArr, function(item){
					if(item[uniqueKeyName]!=data[uniqueKeyName]){
						$scope.removeSelectedArr('userSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.userSelectArr.remove(data);
			data.isSelected = false;
		}
	}

	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.dataTable.unSelectRow(obj);
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}

	$scope.$on("dataTable:query:reset", function(event,dataTableName){
		if(dataTableName.name == $scope.dataTable.name){
			$scope.treeInstance && $scope.treeInstance.cancelSelectedNode();
			$scope.orgTree && $scope.orgTree.cancelSelectedNode();
			$scope.posTree && $scope.posTree.cancelSelectedNode();
		}
	});
}

function orgSelectorCtrl($scope, dialogService, baseService){
	$scope.dems = [];
	$scope.currentDem = null;
	// 当前选中的数据
	$scope.orgSelectedArray = [];
	$scope.orgTreeData = [];
	
	// 初始化值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.orgSelectedArray = $scope.pageParam.data;
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
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.orgSelectedArray;
	}
	
	$scope.orgTree_click = function(e, i, n){
		if(n.id!='0'){
			//将当前选中项作为查询条件
			$scope.orgDataTable.addQuery({property: 'path', operation: 'right_like', value: n.path});
		}
		else{
			$scope.orgDataTable.clearQuery();
		}
		//执行列表查询
		$scope.orgDataTable.query();
	}
	
	$scope.orgTree_expand = function(e, i, n){
		if(!n.hasLoadChildren){
			n.hasLoadChildren = true;
			$scope.loadOrgTreeData(n.id);
		}
	}
	
	$scope.orgSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.orgSelectedArray.push(data);
			$scope.orgSelectedArray.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam.single){
				angular.forEach($scope.orgSelectedArray, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('orgSelectedArray', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.orgSelectedArray.remove(data);
			data.isSelected = false;
		}
	}
	
	// 获取所有维度
	baseService
	.get("${uc}/api/demension/v1/dems/getAll")
	.then(function(response){
		if(response && response.length > 0){
			$scope.dems = response;
			$scope.currentDem = $scope.dems[response.length - 1];
		}
	});
	
	// 监控维度变化
	$scope.$watch('currentDem.id', function(n, o){
		if(n!==o){
			// 重置组织树的数据
			$scope.orgTreeData = [];
			$scope.loadOrgTreeData();
		}
	});
	
	$scope.$on("dataTable:query:reset", function(event,dataTableName){
		if(dataTableName.name == $scope.orgDataTable.name){
			$scope.orgTree.cancelSelectedNode();
		}
	});
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.orgDataTable.unSelectRow(obj);
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.orgDataTable.unSelectRow();
	}
	
	// 加载组织树数据
	$scope.loadOrgTreeData = function(p){
		var params = {demId:$scope.currentDem.id};
		if(p){
			params["parentId"] = p;
		}
		baseService.post("${uc}/api/org/v1/orgs/getByParentAndDem", params)
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
}

function postSelectorCtrl($scope, dialogService, baseService){
	$scope.dems = [];
	$scope.currentDem = null;
	// 当前选中的数据
	$scope.posSelectedArray = [];
	$scope.orgTreeData = [];
	
	// 初始化值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.posSelectedArray = $scope.pageParam.data;
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
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.posSelectedArray;
	}
	
	$scope.orgTree_click = function(e, i, n){
		if(n.id!='0'){
			//将当前选中项作为查询条件
			$scope.posDataTable.addQuery({property: 'orgId', operation: 'equal', value: n.id});
		}
		else{
			$scope.posDataTable.clearQuery();
		}
		//执行列表查询
		$scope.posDataTable.query();
	}
	
	$scope.orgTree_expand = function(e, i, n){
		if(!n.hasLoadChildren){
			n.hasLoadChildren = true;
			$scope.loadOrgTreeData(n.id);
		}
	}
	
	$scope.posSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.posSelectedArray.push(data);
			$scope.posSelectedArray.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam.single){
				angular.forEach($scope.posSelectedArray, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('posSelectedArray', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.posSelectedArray.remove(data);
			data.isSelected = false;
		}
	}
	
	// 获取所有维度
	baseService
	.get("${uc}/api/demension/v1/dems/getAll")
	.then(function(response){
		if(response && response.length > 0){
			$scope.dems = response;
			$scope.currentDem = $scope.dems[response.length - 1];
		}
	});
	
	// 监控维度变化
	$scope.$watch('currentDem.id', function(n, o){
		if(n!==o){
			// 重置组织树的数据
			$scope.orgTreeData = [];
			$scope.loadOrgTreeData();
		}
	});
	
	$scope.$on("dataTable:query:reset", function(event,dataTableName){
		if(dataTableName.name == $scope.posDataTable.name){
			$scope.orgTree && $scope.orgTree.cancelSelectedNode();
		}
	});
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.posDataTable.unSelectRow(obj);
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.posDataTable.unSelectRow();
	}
	
	// 加载组织树数据
	$scope.loadOrgTreeData = function(p){
		var params = {demId:$scope.currentDem.id};
		if(p){
			params["parentId"] = p;
		}
		baseService.post("${uc}/api/org/v1/orgs/getByParentAndDem", params)
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
}


function roleSelectorCtrl($scope, dialogService, baseService){
	
    
	$scope.roleSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.roleSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.roleSelectArr;
	}
	
	$scope.roleSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.roleSelectArr.push(data);
			$scope.roleSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.roleSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('roleSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.roleSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.roleDataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.roleDataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.roleSelectArr[0];
		return $scope.roleSelectArr;
	}
}

function jobSelectorCtrl($scope, dialogService, baseService){
	
    
	$scope.jobSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.jobSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.jobSelectArr;
	}
	
	$scope.jobSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.jobSelectArr.push(data);
			$scope.jobSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.jobSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('jobSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.jobSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.jobDataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.jobDataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.jobSelectArr[0];
		return $scope.jobSelectArr;
	}
}


function sysTypeSelectorCtrl($scope, dialogService, baseService){
	var url = null;
	$scope.groupKey = "FORM_TYPE";
	if($scope.pageParam && $scope.pageParam.groupKey){
		$scope.groupKey = $scope.pageParam.groupKey;
	}
	if($scope.groupKey == "INDEX_COLUMN_TYPE"){
		url = "${portal}/sys/sysType/v1/getTypesByKey?typeKey="+$scope.groupKey
	}else{
		url = "${portal}/sys/sysType/v1/getByGroupKey?groupKey="+$scope.groupKey;
	}
	
	baseService.get(url).then(function(rep){
         $scope.treeData = rep;
    });
	
	$scope.resulData = [];
	
	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.resulData;
	}
	
	$scope.treeClik = function(e, i, n){
		$scope.resulData.push({id:n.id,name:n.name});
	}
}

function demSelectorCtrl($scope, dialogService, baseService){
	
    
	$scope.demSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.demSelectArr = $scope.pageParam.data;
	}

	// 响应对话框的确定按钮，并返回值到父页面
	$scope.pageSure = function(){
		return $scope.demSelectArr;
	}
	
	$scope.demSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.demSelectArr.push(data);
			$scope.demSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.demSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('demSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.demSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.demDataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.demDataTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.demSelectArr[0];
		return $scope.demSelectArr;
	}
}


angular
    .module('selector', [])
    .controller('scriptSelectorCtrl', scriptSelectorCtrl)
    .controller('boSelectorCtrl', boSelectorCtrl)
    .controller('userSelectorCtrl', userSelectorCtrl)
    .controller('orgSelectorCtrl', orgSelectorCtrl)
    .controller('roleSelectorCtrl', roleSelectorCtrl)
    .controller('demSelectorCtrl', demSelectorCtrl)
    .controller('postSelectorCtrl', postSelectorCtrl)
    .controller('sysTypeSelectorCtrl', sysTypeSelectorCtrl)
    .controller('jobSelectorCtrl', jobSelectorCtrl);