//维度列表
function demensionListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.remove = function(id){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/demension/v1/dem/deleteDemByIds?ids="+id)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.dataTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
    }
	
	$scope.operating = function(code,action){
		if(action == 'get'){
			dialogService.sidebar("uc.demensionGet", {bodyClose: false, width: '50%', pageParam: {code:code, title:'查看维度',action:action}});
		}else{
			var title = action == "add" ? "添加维度" : "编辑维度";
			dialogService.sidebar("uc.demensionEdit", {bodyClose: false, width: '50%', pageParam: {code:code, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	$scope.setDefault = function(row){
		baseService
		.put(getContext()['uc']+"/api/demension/v1/dem/setDefaultDem?code="+row.demCode)
		.then(function(response) {
			if(response.state){
				dialogService.success(response.message);
				$scope.dataTable.query();
			}else{
				dialogService.fail(response.message);
			}
		});	
	}
}
//维度编辑明细
function demensionEditCtrl($scope, $compile,  baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {}
	
	if($scope.pageParam.code){
		baseService
		.get(getContext()['uc']+"/api/demension/v1/dem/getDem?code="+$scope.pageParam.code)
		.then(function(response) {
			if(response.id){
				$scope.data.name = response.demName;
				$scope.data.code = response.demCode;
				$scope.data.isDefault = response.isDefault;
				$scope.data.description = response.demDesc;
			}
		});	
		
	}
	//保存
	$scope.save = function(){
		if($scope.pageParam.action == 'edit'){
			baseService
			.put(getContext()['uc']+"/api/demension/v1/dem/updateDem",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
				}
			});	
		}else{
			baseService
			.post(getContext()['uc']+"/api/demension/v1/dem/addDem",$scope.data)
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
}
//职务列表
function jobListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.remove = function(id){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/job/v1/job/deleteJobByIds?ids="+id)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.dataTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
    }
	
	$scope.operating = function(code,action){
		if(action == 'get'){
			dialogService.sidebar("uc.jobGet", {bodyClose: false, width: '50%', pageParam: {code:code, title:'查看职务',action:action}});
		}else{
			var title = action == "add" ? "添加职务" : "编辑职务";
			dialogService.sidebar("uc.jobEdit", {bodyClose: false, width: '50%', pageParam: {code:code, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
}

//职务编辑明细
function jobEditCtrl($scope, $compile,  baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {}
	
	if($scope.pageParam.code){
		baseService
		.get(getContext()['uc']+"/api/job/v1/job/getJob?code="+$scope.pageParam.code)
		.then(function(response) {
			if(response.id){
				$scope.data.name = response.name;
				$scope.data.code = response.code;
				$scope.data.postLevel = response.postLevel;
				$scope.data.description = response.description;
			}
		});	
		
	}
	//保存
	$scope.save = function(){
		if($scope.pageParam.action == 'edit'){
			baseService
			.put(getContext()['uc']+"/api/job/v1/job/updateJob",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
				}
			});	
		}else{
			baseService
			.post(getContext()['uc']+"/api/job/v1/job/addJob",$scope.data)
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
}

//用户组织参数列表
function paramsListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.remove = function(id){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/params/v1/param/deleteParamsByIds?ids="+id)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.dataTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
    }
	
	$scope.operating = function(code,action){
		if(action == 'get'){
			dialogService.sidebar("uc.paramsGet", {bodyClose: false, width: '50%', pageParam: {code:code, title:'查看参数',action:action}});
		}else{
			var title = action == "add" ? "添加参数" : "编辑参数";
			dialogService.sidebar("uc.paramsEdit", {bodyClose: false, width: '50%', pageParam: {code:code, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
}

//用户组织参数编辑明细
function paramsEditCtrl($scope, $compile,  baseService,dialogService,ArrayToolService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
		json:[]
	}
	
	if($scope.pageParam.code){
		baseService
		.get(getContext()['uc']+"/api/params/v1/param/getParams?code="+$scope.pageParam.code)
		.then(function(response) {
			if(response.id){
				$scope.data.name = response.name;
				$scope.data.code = response.code;
				$scope.data.type = response.type;
				$scope.data.ctrType = response.ctlType;
				$scope.data.json = response.json?JSON.parse(response.json):[];
			}
		});	
		
	}
	//保存
	$scope.save = function(){
		if($scope.pageParam.action == 'edit'){
			baseService
			.put(getContext()['uc']+"/api/params/v1/param/updateParams",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
				}
			});
		}else{
			baseService
			.post(getContext()['uc']+"/api/params/v1/param/addParams",$scope.data)
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
	
	$scope.addItem = function(){
		$scope.data.json.push(angular.copy({key:"",value:""}));
	}
	
	$scope.changeItem = function(index,method){
		switch (method) {
		case 'up':
			ArrayToolService.up(index,$scope.data.json);
			break;
		case 'down':
			ArrayToolService.down(index,$scope.data.json);
			break;
		case 'delete':
			ArrayToolService.del(index,$scope.data.json);
			break;
		default:
			break;
		}
	}
}

//角色列表
function roleListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.remove = function(id){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/role/v1/role/deleteRoleByIds?ids="+id)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.roleListTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
    }
	
	$scope.operating = function(code,action){
		if(action == 'get'){
			dialogService.sidebar("uc.roleGet", {bodyClose: false, width: '50%', pageParam: {code:code, title:'查看角色',action:action}});
		}else{
			var title = action == "add" ? "添加角色" : "编辑角色";
			dialogService.sidebar("uc.roleEdit", {bodyClose: false, width: '50%', pageParam: {code:code, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.roleListTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
	$scope.toSetRoleUserPage = function(row){
		dialogService.page("uc.roleAssignUser", {pageParam:row})
        .then(function(result){
        });
	}
	
	$scope.editRoleRes=function(row){
		if(row.enabled==0){
			dialogService.fail('该角色已被禁用无法进行授权');
			return ;
		}
		dialogService.sidebar('system.authorizationResourceDialog', { bodyClose: false,width: 'calc(100% - 225px)',pageParam:{alias:row.code}});
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

//角色用户
function roleUserListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.$on("dataTable:ready", function(){
		if($scope.pageParam.id){
			$scope.roleUserTable.query();
		}
	});
	
	$scope.$on("dataTable:query:begin", function(t, d){
    	if(d.name == 'roleUserTable'){
    		$scope.roleUserTable.url = "${uc}/api/role/v1/role/getRoleUsers?code="+$scope.pageParam.code;
    	}
	});
	
	$scope.doAddRoleUser = function(underAccounts){
		baseService
		.post(getContext()['uc']+"/api/role/v1/roleUser/saveUserRole?code="+$scope.pageParam.code+"&accounts="+underAccounts)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "添加成功!");
    			$scope.roleUserTable.query();
    		}else{
    			dialogService.fail(response.message || "添加失败!");
    		}
		});
	};
	
	$scope.addRoleUser = function (){
		var pageParam = {
				 single:false, /*是否单选*/ 
				 data:[
					 
				 ]
				};
			dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
				 if(result && result.length > 0){
					 var accountArray = [];
					 angular.forEach(result, function(item){
						 accountArray.push(item.account);
					 });
					 $scope.doAddRoleUser(accountArray.join(","))
				 }
			 });
	}
	
	$scope.removeRoleUser = function (){
		if($scope.roleUserTable.selectRow().length == 0){
			return;
		}
		
		var accountArray = [];
		angular.forEach($scope.roleUserTable.selectRow(), function(item){
			accountArray.push(item.account);
		});
		$scope.doRemoveRoleUser(accountArray.join(","));
	}
	
	$scope.doRemoveRoleUser = function (accounts){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/role/v1/roleUser/deleteUserRole?code="+$scope.pageParam.code+"&accounts="+accounts)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.roleUserTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
	}
}

//角色编辑明细
function roleEditCtrl($scope, $compile,  baseService,dialogService){
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {
		enabled:1	
	}
	
	if($scope.pageParam.code){
		baseService
		.get(getContext()['uc']+"/api/role/v1/role/getRole?code="+$scope.pageParam.code)
		.then(function(response) {
			if(response.state){
				$scope.data.name = response.value.name;
				$scope.data.code = response.value.code;
				$scope.data.enabled = response.value.enabled;
				$scope.data.description = response.value.description;
			}
		});	
		
	}
	//保存
	$scope.save = function(){
		if($scope.pageParam.action == 'edit'){
			baseService
			.put(getContext()['uc']+"/api/role/v1/role/updateRole",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
				}
			});	
		}else{
			baseService
			.post(getContext()['uc']+"/api/role/v1/role/addRole",$scope.data)
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
}


//用户列表
function userListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.isAdmin = false;
	var currentUserInfo = parseToJson(window.sessionStorage['ngStorage-currentUser']);
	$scope.currentASccount = currentUserInfo.account;
	baseService.get("${uc}/api/user/v1/user/isAdmin")
	.then(function(response) {
		if(response.state){
			$scope.isAdmin = response.value;
		}
	});
	
	$scope.changUserPwd = function(account){
		dialogService.page("changUserPwd", {area:['430px', '235px'],pageParam:{account:account}}).then(function(result){
			if(result){
				baseService.post("${uc}/api/user/v1/user/updateUserPsw",{account:account,newPwd:result}).then(
				  function(data){
					if(data.state){
						dialogService.success(data.message);
					}else{
						dialogService.fail(data.message);
					}
				});
			}else{
				dialogService.error("新密码不能为空！");
			}
		});
	}
	
	$scope.remove = function(id){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/user/v1/user/deleteUserByIds?ids="+id)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.dataTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
	}
	
	$scope.operating = function(account,action){
		if(action == 'get'){
			dialogService.sidebar("uc.userGet", {bodyClose: false, width: '50%', pageParam: {account:account, title:'查看用户',action:action}});
		}else if(action == 'edit'){
			dialogService.sidebar("uc.userEdit", {bodyClose: false, width: '70%', pageParam: {account:account, title:"编辑用户",action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}else{
			dialogService.sidebar("uc.userAdd", {bodyClose: false, width: '70%', pageParam: {account:account, title:"用户",action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
}


function changUserPwdCtrl($scope) {
	$scope.pageSure = function(){
		return $scope.newPassword;
	}
}

//用户编辑明细
function userEditCtrl($scope, $compile,  baseService,dialogService){
	
	$scope.myImage='';
    $scope.myCroppedImage='';
    
    $scope.tabs = [
		{ title: '基础信息', url: 'views/uc/user/userMessage.html',active:false },
		{ title: '所属组织岗位', url: 'views/uc/user/userPostList.html',active:false },
		{ title: '所属角色', url: 'views/uc/user/userRoleList.html',active:false },
		{ title: '用户参数', url: 'views/uc/user/userParamsEdit.html',active:false }
    ]
    
    $scope.handleFileSelect=function(evt) {
    	var file=evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function($scope){
                $scope.myImage=evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };
    
    $(document).ready(function () {
    	angular.element(document.querySelector('#fileInput')).on('change',$scope.handleFileSelect);
    });  
    
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	$scope.data = {}
	
	if($scope.pageParam.account){
		baseService
		.get(getContext()['uc']+"/api/user/v1/user/getUser?account="+$scope.pageParam.account)
		.then(function(response) {
			if(response.account){
				$scope.data = response;
				if($scope.data.leaveDate){
					$scope.data.leaveDate = new Date($scope.data.leaveDate.replace(/-/g, "/"));
				}
				if($scope.data.photo){
					$scope.showPortrait = getContext()['portal']+$scope.data.photo;
				}
			}
		});	

		$scope.$on("dataTable:ready", function(t,d){
			if(d == 'userPostTable'){
				$scope.userPostTable.url = getContext()['uc']+"/api/org/v1/orgs/getUserOrgPage";
				$scope.userPostTable.query();
			}
			if(d == 'userRoleTable'){
				$scope.userRoleTable.url = getContext()['uc']+"/api/user/v1/userRoles/userRolePage";
				$scope.userRoleTable.query();
			}
		});
		
		$scope.$on("dataTable:query:begin", function(t, d){
	    	if(d.name == 'userPostTable'){
	    		$scope.userPostTable.addQuery({property: 'u.account_', operation: 'equal', value: $scope.pageParam.account});
	    	}
	    	if(d.name == 'userRoleTable'){
	    		$scope.userRoleTable.addQuery({property: 'u.account_', operation: 'equal', value: $scope.pageParam.account});
	    	}
		});
		
		baseService
		.get(getContext()['uc']+"/api/params/v1/userParams/getUserParams")
		.then(function(userParams) {
			if(userParams.length > 0){
				$scope.userParams = [];
				baseService
				.get(getContext()['uc']+"/api/user/v1/user/getUserParams?account="+$scope.pageParam.account)
				.then(function(response) {	
					angular.forEach(userParams,function(obj2, idx2){
						if(obj2.json){
							obj2.json = JSON.parse(obj2.json);
						}
						angular.forEach(response,function(obj, idx){
							if(obj.alias == obj2.code){
								if(obj2.ctlType == 'number'){
									obj2.value = Number(obj.value);
								}else{
									obj2.value = obj.value;
								}
							}
						});
						$scope.userParams.push(obj2);
					});
				});
			}
		});
	}
	
	$scope.saveUserParams = function(){
		var saveParams = [];
		for(var i = 0 ; i < $scope.userParams.length ; i++){
			var param = $scope.userParams[i];
			if(param.value !== '' && typeof param.value != 'undefine'){
				var j = {
					alias:param.code,
					value:param.value
				}
				saveParams.push(j);
			}
		}
		baseService
		.post(getContext()['uc']+"/api/user/v1/user/saveUserParams?account="+$scope.pageParam.account,JSON.stringify(saveParams))
		.then(function(response) {	
			if(response.state){
    			dialogService.success(response.message || "保存成功!");
    		}else{
    			dialogService.fail(response.message || "保存失败!");
    		}
		});
	}
	
	//保存
	$scope.save = function(){
		//如果更改了头像，就先上传文件
		if($scope.myImage){
			$scope.savePortrait();
		}else{
			$scope._save();
		}
	}
	
	$scope._save = function(){
		if($scope.data.leaveDate && $scope.data.leaveDate.constructor.name=='Date')$scope.data.leaveDate=$scope.data.leaveDate.format('yyyy-MM-dd');
		if($scope.pageParam.action == 'edit'){
			baseService
			.put(getContext()['uc']+"/api/user/v1/user/updateUser",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.value || response.message);
				}else{
					dialogService.success(response.message).then(function(){
						$scope.close();
					});
					
				}
			});	
		}else{
			baseService
			.post(getContext()['uc']+"/api/user/v1/user/addUser",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.value || response.message);
				}else{
					dialogService.success(response.message).then(function(){
						$scope.close();
					});
				}
			});	
		}
	}
	
	function getBlobBydataURL(dataURI,type){
    	var binary = window.atob(dataURI.split(',')[1]);
		var array = [];
		for(var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
		return new File([new Uint8Array(array)], 'portrait.jpeg', {type:type});
	 }
    
    
    //保存用户头像
	$scope.savePortrait=function(){
		var formData = new FormData();
		var imageScope = $('img-crop').scope();
		var file = getBlobBydataURL(imageScope.myCroppedImage,"image/*");
		formData.append("files",file);
		formData.append("fileFormates","");
		$.ajax({
            type: 'post',
            url: getContext()['portal']+"/system/file/v1/fileUpload",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success:function(response){
            	if(response.success && response.fileId){
            		$scope.data.photo = "/system/file/v1/downloadFile?fileId="+response.fileId;
            		$scope._save();
            	}
            },
            error: function(rep){
            	dialogService
            	.confirm("头像上传失败，是否放弃上传头像，仅保存用户信息？")
            	.then(function(){
            		$scope._save();
            	});
            }
        });
	}
	
	$scope.setIsMaster = function(row,isMaster){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgPost/setMasterById?id="+row.orgUserId)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.userPostTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	
	$scope.removeRoleUser = function (row){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/role/v1/roleUser/deleteUserRole?code="+row.alias+"&accounts="+$scope.pageParam.account)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.userRoleTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
	}
	
	$scope.removeUserOrg = function (row){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(getContext()['uc']+"/api/org/v1/orgUser/delOrgUser?ids="+row.orgUserId)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.userPostTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
	}
}

//组织管理
function orgManagerCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.dems = [];
	$scope.currentDem = null;
	$scope.orgDetail =true;
	$scope.org = "";
	$scope.orgActionTitle = "组织简介";
	$scope.tabActive = 0;
	// 当前选中的数据
	$scope.orgTreeData = [];
	
	$scope.treeConfig = {
			data: {
				simpleData:{
					enable: true,
					idKey: "id",
					pIdKey: "parentId"
				}
			}
	};
	
	//组织树右击
	// 右键菜单点击前事件
    $scope.beforeRightClick = function(treeNode){
		if(treeNode.parentId!=null){
			$scope.contextMenu = ['添加子组织','编辑当前组织','删除当前组织','刷新'];
		}else{
			$scope.contextMenu = ['添加子组织','刷新'];
		}

    }
 // 点击某个右键菜单项
    $scope.menuClick = function(menu,treeNode){
        switch(menu){
            case '添加子组织':
            	$scope.tabActive  = 0;
            	$scope.addOrg(treeNode);
                break;
            case '编辑当前组织':
            	$scope.tabActive  = 0;
            	$scope.editNode(treeNode);
                break;
            case '刷新':
            	$scope.loadOrgTreeData(treeNode.id);
                break;
            case '删除当前组织':
                dialogService.confirm("确认要删除吗?").then(function(){
                    baseService.post(getContext()['uc']+"/api/org/v1/org/deleteOrg",treeNode.code).then(function(response){
                    	if(response.state){
                    		dialogService.success(response.message || "删除成功！");
                    		$scope.orgTree.removeNode(treeNode);
                    	}else{
                    		dialogService.fail(response.message || "删除失败！");
                    	}
                    });
                }, function(){
                });
                break;
        }
    }
    
    $scope.addOrg = function (parentNode){
    	$scope.orgActionTitle = "添加子组织";
    	$scope.orgDetail =false;
    	$scope.org = {
			parentId:parentNode.id,
    		parentOrgName:parentNode.name,
    		grade:parentNode.grade+1,
    		demId:parentNode.demId,
    		orderNo:new Date().getMilliseconds()
    	};
    	$scope.$apply();
    }
    
    $scope.editNode = function (parentNode){
    	$scope.orgTree_click(null,null,parentNode);
    	$scope.orgActionTitle = "编辑当前组织";
    	$scope.orgDetail =false;
    	$scope.orgEdit = true
    }
    
    //保存组织
    $scope.saveOrg = function(){
    	var saveO = {
			name:$scope.org.name,
			code:$scope.org.code,
			parentId:$scope.org.parentId,
			grade:$scope.org.grade,
			demId:$scope.org.demId,
			orderNo:$scope.org.orderNo
    	}
    	if($scope.org.id){
    		baseService
    		.put(getContext()['uc']+"/api/org/v1/org/updateOrg",saveO)
    		.then(function(response) {
    			if(response.state){
        			dialogService.success(response.message || "保存成功!");
        			$scope.loadOrgTreeData(saveO.parentId);
        			$scope.orgDetail = true;
        			$scope.orgActionTitle = "组织简介";
        		}else{
        			dialogService.fail(response.message || "保存失败!");
        		}
    		});
    	}else{
    		baseService
    		.post(getContext()['uc']+"/api/org/v1/org/addOrg",saveO)
    		.then(function(response) {
    			if(response.state){
        			dialogService.success(response.message || "保存成功!");
        			$scope.loadOrgTreeData(saveO.parentId);
        			$scope.orgDetail = true;
        			$scope.orgActionTitle = "组织简介";
					$scope.org = '';
        		}else{
        			dialogService.fail(response.message || "保存失败!");
        		}
    		});
    	}
    }
    $scope.$on("dataTable:query:begin", function(t, d){
    	var currentNode = t.currentScope.orgTree.getSelectedNodes()[0];
    	
    	if(d.name == 'orgUserTable'){
    		$scope.orgUserTable.addQuery({property: 'org.ID_', operation: 'equal', value: currentNode.id});
    	}
    	if(d.name == 'orgPostTable'){
    		$scope.orgPostTable.addQuery({property: 'o.ID_', operation: 'equal', value: currentNode.id});
    	}
    	
	});
    
	//组织树左击
	$scope.orgTree_click = function(e, i, n){
		$scope.orgDetail = true;
		if(n.code){
			$scope.orgCode = n.code;
			baseService
			.get(getContext()['uc']+"/api/org/v1/org/getOrg?code="+n.code)
			.then(function(response) {
				if(response.code){
					$scope.org = response;
				}
			});
			if(n.id!='0'){
				
			}else{
				$scope.orgUserTable.clearQuery();
				$scope.orgPostTable.clearQuery();
			}
			//执行列表查询
			$scope.orgUserTable.query();
			$scope.orgPostTable.query();
			
			$scope.orgAuthTable.url = getContext()['uc']+"/api/orgAuth/v1/orgAuths/getOrgAuthPage?orgCode="+n.code;
			$scope.orgAuthTable.query();
			
			baseService
			.get(getContext()['uc']+"/api/params/v1/orgParams/getOrgParams")
			.then(function(orgParams) {
				if(orgParams.length > 0){
					$scope.orgParams = [];
					baseService
					.get(getContext()['uc']+"/api/org/v1/orgParam/getOrgParams?orgCode="+n.code)
					.then(function(response) {	
						angular.forEach(orgParams,function(obj2, idx2){
							if(obj2.json){
								obj2.json = JSON.parse(obj2.json);
							}
							angular.forEach(response,function(obj, idx){
								if(obj.alias == obj2.code){
									if(obj2.ctlType == 'number'){
										obj2.value = Number(obj.value);
									}else{
										obj2.value = obj.value;
									}
								}
							});
							$scope.orgParams.push(obj2);
						});
					});
				}
			});
		}
	}
	
	$scope.saveOrgParams = function(){
		var saveParams = [];
		for(var i = 0 ; i < $scope.orgParams.length ; i++){
			var param = $scope.orgParams[i];
			if(param.value !== '' && typeof param.value != 'undefine'){
				var j = {
					alias:param.code,
					value:param.value
				}
				saveParams.push(j);
			}
		}
		baseService
		.post(getContext()['uc']+"/api/org/v1/orgParam/saveOrgParams?orgCode="+$scope.orgCode,JSON.stringify(saveParams))
		.then(function(response) {	
			if(response.state){
    			dialogService.success(response.message || "保存成功!");
    		}else{
    			dialogService.fail("保存失败，请填写参数!");
    		}
		});
	}
	
	$scope.orgTree_expand = function(e, i, n){
		if(!n.hasLoadChildren){
			n.hasLoadChildren = true;
			$scope.loadOrgTreeData(n.id);
		}
	}
	
	
	// 获取所有维度
	baseService
	.get(getContext()['uc']+"/api/demension/v1/dems/getAll")
	.then(function(response){
		if(response && response.length > 0){
			$scope.dems = response;
			for(var i = 0 ; i < $scope.dems.length ; i++){
				if($scope.dems[i].isDefault == 1){
					$scope.currentDem = $scope.dems[i];
					$scope.currentDemItem = $scope.dems[i].id;
					break;
				}
			}
			if($scope.currentDem == null){
				$scope.currentDem = $scope.dems[response.length - 1];
			}
		}
	});
	
	// 监控维度变化
	$scope.$watch('currentDemItem', function(n, o){
		if(n!==o){
			// 重置组织树的数据
			for(var i = 0 ; i < $scope.dems.length ; i++){
				if($scope.dems[i].id == n){
					$scope.currentDem = $scope.dems[i];
					break;
				}
			}
			$scope.org = '';
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
		baseService.post(getContext()['uc']+"/api/org/v1/orgs/getByParentAndDem", params)
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
	
	$scope.addOrgUser = function(){
		var pageParam = {
						 single:false, /*是否单选*/ 
						 data:[
							 
						 ]
						};
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
					 .then(function(result){
						 if(result && result.length > 0){
							 var accountArray = [];
							 angular.forEach(result, function(item){
								 accountArray.push(item.account);
							 });
							 baseService.post(getContext()['uc']+"/api/org/v1/orgUsers/addUsersForOrg?orgCode="+$scope.org.code+"&accounts="+accountArray.join(","))
							   .then(function(rep){
								   if(rep.state){
						    			dialogService.success(rep.message || "添加成功!");
						    			$scope.orgUserTable.query();
						    		}else{
						    			dialogService.fail(rep.message || "添加失败!");
						    		}
							   });
						 }
						 
					 });
	}
	
	$scope.addOrgPost = function(postCode,action){
		var title = action == "edit" ? "编辑岗位" : "添加岗位";
		dialogService.sidebar("orgPostEdit", {bodyClose: false, width: '50%', pageParam: {orgCode:$scope.org.code, title:title,postCode:postCode}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
			$scope.orgPostTable.query();//子页面关闭,父页面数据刷新
	    });
	}
	
	$scope.editOrgAuth = function(id,action){
		var title = action == "edit" ? "编辑组织分级管理" : "添加组织分级管理";
		dialogService.sidebar("uc.org.orgAuthEdit", {bodyClose: false, width: '50%', pageParam: {orgCode:$scope.org.code,demCode:$scope.currentDem.demCode, title:title,id:id}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
			$scope.orgAuthTable.query();//子页面关闭,父页面数据刷新
	    });
	}
	
	$scope.isIndex = function(perms,item){
		if(perms){
			if(perms.indexOf(item) > -1){
				return true;
			}else{
				return false;
			}
		}
	}
	//设置设置岗位
	$scope.setMainPost = function(row,isMain){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgPost/setPostMaster?postCode="+row.code+"&isMain="+isMain)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgPostTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	//设置主组织
	$scope.setMainOrg = function(row,isMain){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgPost/setMasterById?id="+row.orgUserId)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgUserTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	
	$scope.setCharge = function(row,isCharge){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgUser/setOrgCharge?account="+row.account+"&orgCode="+row.orgCode+"&isCharge="+isCharge)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgUserTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	
	$scope.toUnderUserPage = function(row){
		dialogService.page("underUserList", {pageParam:row})
        .then(function(result){
        });
	}
	
	$scope.toPostUserPage = function(row){
		dialogService.page("uc.orgAuthManagerPostUserList", {pageParam:row})
        .then(function(result){
        });
	}
}

//分级组织管理
function orgAuthManagerCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.orgDetail =true;
	$scope.org = "";
	$scope.orgActionTitle = "组织简介";
	$scope.tabActive = 0;
	// 当前选中的数据
	$scope.orgTreeData = [];
	
	$scope.treeConfig = {
			data: {
				simpleData:{
					enable: true,
					idKey: "id",
					pIdKey: "parentId"
				}
			}
	};
	//组织树右击
	// 右键菜单点击前事件
    $scope.beforeRightClick = function(treeNode){
    	$scope.contextMenu = [];
    	if($scope.isIndex($scope.currentAuthOrg.orgPerms,'add')){
    		$scope.contextMenu.push('添加子组织')
    	}
    	if($scope.isIndex($scope.currentAuthOrg.orgPerms,'edit')){
    		$scope.contextMenu.push('编辑当前组织')
    	}
    	if($scope.isIndex($scope.currentAuthOrg.orgPerms,'delete')){
    		$scope.contextMenu.push('删除当前组织')
    	}
    	$scope.contextMenu.push('刷新');
    }
    
    
 // 点击某个右键菜单项
    $scope.menuClick = function(menu,treeNode){
        switch(menu){
            case '添加子组织':
            	$scope.tabActive = 0;
            	$scope.addOrg(treeNode);
                break;
            case '编辑当前组织':
            	$scope.tabActive = 0;
            	$scope.editNode(treeNode);
                break;
            case '刷新':
            	$scope.loadOrgTreeData(treeNode.id);
                break;
            case '删除当前组织':
                dialogService.confirm("确认要删除吗?").then(function(){
                    baseService.post(getContext()['uc']+"/api/org/v1/org/deleteOrg",treeNode.code).then(function(response){
                    	if(response.state){
                    		dialogService.success(response.message || "删除成功！");
                    		$scope.orgTree.removeNode(treeNode);
                    	}else{
                    		dialogService.fail(response.message || "删除失败！");
                    	}
                    });
                }, function(){
                });
                break;
        }
    }
    
    $scope.addOrg = function (parentNode){
    	$scope.orgActionTitle = "添加子组织";
    	$scope.orgDetail =false;
    	$scope.org = {
			parentId:parentNode.id,
    		parentOrgName:parentNode.name,
    		grade:parentNode.grade+1,
    		demId:parentNode.demId,
    		orderNo:new Date().getMilliseconds()
    	};
    	$scope.$apply();
    }
    
    $scope.editNode = function (parentNode){
    	$scope.orgTree_click(null,null,parentNode);
    	$scope.orgActionTitle = "编辑当前组织";
    	$scope.orgDetail =false;
    	$scope.orgEdit = true
    }
    
    //保存组织
    $scope.saveOrg = function(){
    	var saveO = {
			name:$scope.org.name,
			code:$scope.org.code,
			parentId:$scope.org.parentId,
			grade:$scope.org.grade,
			demId:$scope.org.demId,
			orderNo:$scope.org.orderNo
    	}
    	if($scope.org.id){
    		baseService
    		.put(getContext()['uc']+"/api/org/v1/org/updateOrg",saveO)
    		.then(function(response) {
    			if(response.state){
        			dialogService.success(response.message || "保存成功!");
        			$scope.loadOrgTreeData(saveO.parentId);
        			$scope.orgDetail = true;
        		}else{
        			dialogService.fail(response.message || "保存失败!");
        		}
    		});
    	}else{
    		baseService
    		.post(getContext()['uc']+"/api/org/v1/org/addOrg",saveO)
    		.then(function(response) {
    			if(response.state){
        			dialogService.success(response.message || "保存成功!");
        			$scope.loadOrgTreeData(saveO.parentId);
        			$scope.orgDetail = true;
        		}else{
        			dialogService.fail(response.message || "保存失败!");
        		}
    		});
    	}
    }
    $scope.$on("dataTable:query:begin", function(t, d){
    	var currentNode = t.currentScope.orgTree.getSelectedNodes()[0];
    	
    	if(d.name == 'orgUserTable'){
    		$scope.orgUserTable.addQuery({property: 'org.ID_', operation: 'equal', value: currentNode.id});
    	}
    	if(d.name == 'orgPostTable'){
    		$scope.orgPostTable.addQuery({property: 'o.ID_', operation: 'equal', value: currentNode.id});
    	}
    	
	});
    
	//组织树左击
	$scope.orgTree_click = function(e, i, n){
		$scope.orgDetail = true;
		if(n.code){
			$scope.orgCode = n.code;
			baseService
			.get(getContext()['uc']+"/api/org/v1/org/getOrg?code="+n.code)
			.then(function(response) {
				if(response.code){
					$scope.org = response;
				}
			});
			if(n.id!='0'){
				
			}else{
				$scope.orgUserTable.clearQuery();
				$scope.orgPostTable.clearQuery();
			}
			//执行列表查询
			$scope.orgUserTable.query();
			$scope.orgPostTable.query();
			
			$scope.orgAuthTable.url = getContext()['uc']+"/api/orgAuth/v1/orgAuths/getOrgAuthPage?orgCode="+n.code;
			$scope.orgAuthTable.query();
			
			baseService
			.get(getContext()['uc']+"/api/params/v1/orgParams/getOrgParams")
			.then(function(orgParams) {
				if(orgParams.length > 0){
					$scope.orgParams = [];
					baseService
					.get(getContext()['uc']+"/api/org/v1/orgParam/getOrgParams?orgCode="+n.code)
					.then(function(response) {	
						angular.forEach(orgParams,function(obj2, idx2){
							if(obj2.json){
								obj2.json = JSON.parse(obj2.json);
							}
							angular.forEach(response,function(obj, idx){
								if(obj.alias == obj2.code){
									if(obj2.ctlType == 'number'){
										obj2.value = Number(obj.value);
									}else{
										obj2.value = obj.value;
									}
								}
							});
							$scope.orgParams.push(obj2);
						});
					});
				}
			});
		}
	}
	
	$scope.saveOrgParams = function(){
		var saveParams = [];
		for(var i = 0 ; i < $scope.orgParams.length ; i++){
			var param = $scope.orgParams[i];
			if(param.value !== '' && typeof param.value != 'undefine'){
				var j = {
					alias:param.code,
					value:param.value
				}
				saveParams.push(j);
			}
		}
		baseService
		.post(getContext()['uc']+"/api/org/v1/orgParam/saveOrgParams?orgCode="+$scope.orgCode,JSON.stringify(saveParams))
		.then(function(response) {	
			if(response.state){
    			dialogService.success(response.message || "保存成功!");
    		}else{
    			dialogService.fail(response.message || "保存失败!");
    		}
		});
	}
	
	$scope.orgTree_expand = function(e, i, n){
		if(!n.hasLoadChildren){
			n.hasLoadChildren = true;
			$scope.loadOrgTreeData(n.id);
		}
	}
	
	//获取分级组织树
	baseService
	.get(getContext()['uc']+"/api/orgAuth/v1/orgAuths/getAllOrgAuth")
	.then(function(response){
		if(response.length > 0){
			$scope.authOrgs = response;
			$scope.currentAuthOrg = response[0]
			$scope.currentAuthOrgId = $scope.currentAuthOrg.id
		}
	});
	
	// 监控维度变化
	$scope.$watch('currentAuthOrgId', function(n, o){
		if(n!==o){
			// 重置组织树的数据
			$scope.org = '';
			for(var i = 0 ; i < $scope.authOrgs.length; i++ ){
				if($scope.authOrgs[i].id === n){
					$scope.currentAuthOrg = $scope.authOrgs[i];
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
	
	$scope.addOrgUser = function(){
		var pageParam = {
						 single:false, /*是否单选*/ 
						 data:[
							 
						 ]
						};
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
					 .then(function(result){
						 if(result && result.length > 0){
							 var accountArray = [];
							 angular.forEach(result, function(item){
								 accountArray.push(item.account);
							 });
							 baseService.post(getContext()['uc']+"/api/org/v1/orgUsers/addUsersForOrg?orgCode="+$scope.org.code+"&accounts="+accountArray.join(","))
							   .then(function(rep){
								   if(rep.state){
						    			dialogService.success(rep.message || "添加成功!");
						    			$scope.orgUserTable.query();
						    		}else{
						    			dialogService.fail(rep.message || "添加失败!");
						    		}
							   });
						 }
						 
					 });
	}
	
	$scope.addOrgPost = function(postCode,action){
		var title = action == "edit" ? "编辑岗位" : "添加岗位";
		dialogService.sidebar("orgPostEdit", {bodyClose: false, width: '50%', pageParam: {orgCode:$scope.org.code, title:title,postCode:postCode}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
			$scope.orgPostTable.query();//子页面关闭,父页面数据刷新
	    });
	}
	
	$scope.editOrgAuth = function(id,action){
		var title = action == "edit" ? "编辑组织分级管理" : "添加组织分级管理";
		dialogService.sidebar("uc.org.orgAuthEdit", {bodyClose: false, width: '50%', pageParam: {orgCode:$scope.org.code,demCode:$scope.currentAuthOrg.demCode, title:title,id:id}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
			$scope.orgAuthTable.query();//子页面关闭,父页面数据刷新
	    });
	}
	
	$scope.isIndex = function(perms,item){
		if(perms){
			if(perms.indexOf(item) > -1){
				return true;
			}else{
				return false;
			}
		}
	}
	//设置设置岗位
	$scope.setMainPost = function(row,isMain){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgPost/setPostMaster?postCode="+row.code+"&isMain="+isMain)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgPostTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	//设置主组织
	$scope.setMainOrg = function(row,isMain){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgPost/setMasterById?id="+row.orgUserId)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgUserTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	
	$scope.setCharge = function(row,isCharge){
		baseService
		.put(getContext()['uc']+"/api/org/v1/orgUser/setOrgCharge?account="+row.account+"&orgCode="+row.orgCode+"&isCharge="+isCharge)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "设置成功!");
    			$scope.orgUserTable.query();
    		}else{
    			dialogService.fail(response.message || "设置失败!");
    		}
		});
	}
	
	$scope.toUnderUserPage = function(row){
		dialogService.page("underUserList", {pageParam:row})
        .then(function(result){
        });
	}
	
	$scope.toPostUserPage = function(row){
		dialogService.page("uc.orgAuthManagerPostUserList", {pageParam:row})
        .then(function(result){
        });
	}
}

function editOrgPostCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.postCode = $scope.pageParam.postCode;//列表页面传过来的postCode
	$scope.title = $scope.pageParam.title;//列表页面传过来的title
	$scope.jobs = [];
	$scope.data={};
	baseService
	.post(getContext()['uc']+"/api/job/v1/jobs/getJobPage",{pageBean:{page: 1, pageSize: 1000}})
	.then(function(response){
		if(response.rows){
			$scope.jobs = response.rows;
		}
	});

	//定义根据postCode查询数据事件
	$scope.detail = function(postCode) {
		if($scope.title=="添加岗位"){
			$("#jobCode").css("display","block")
		}
		if(!postCode)return;
		baseService.get(getContext()['uc']+"/api/org/v1/orgPost/getOrgPost?postCode="+postCode).then(function (rep) {
			$scope.data=rep.value;
		});
	}
	$scope.detail($scope.postCode);//运行事件
	
	$scope.saveOrgPost = function (){
		$scope.data.orgCode = $scope.pageParam.orgCode
		if($scope.title=="添加岗位"){
			baseService.post(getContext()['uc']+"/api/org/v1/orgPost/saveOrgPost",$scope.data).then(function(response){
				if(response.state){
					dialogService.success(response.message || "添加成功!");
					dialogService.closeSidebar();//关闭窗口
				}else{
					dialogService.fail(response.message || "添加失败!");
				}
			});
		}else{
			baseService.post(getContext()['uc']+"/api/org/v1/orgPost/updateOrgPost",$scope.data).then(function(response){
				if(response.state){
					dialogService.success(response.message || "更新成功!");
					dialogService.closeSidebar();//关闭窗口
				}else{
					dialogService.fail(response.message || "更新失败!");
				}
			});
		}
	}
	
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

function editOrgAuthCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.id = $scope.pageParam.id;//列表页面传过来的postCode
	$scope.title = $scope.pageParam.title;//列表页面传过来的title
	$scope.data = {};
	//定义根据id查询数据事件
	$scope.detail = function(id) {
		if(!id)return;
		baseService.get(getContext()['uc']+"/api/org/v1/orgAuth/getOrgAuth?id="+id).then(function (rep) {
			$scope.data=rep;
			$scope.data.account = rep.userAccount;
		});
	}
	$scope.detail($scope.id);//运行事件
	//关闭
	$scope.close = function(){
		dialogService.closeSidebar();
	}

	$scope.isSelected = function(perms,item){
		var data = $scope.data;
		if(perms){
			if(perms.indexOf(item) > -1){
				return true;
			}else{
				return false;
			}
		}
	}
	
	$scope.saveOrgAuth = function(){
		if($scope.data.account){
			$scope.data.demCode = $scope.pageParam.demCode;
			$scope.data.orgCode = $scope.pageParam.orgCode;
			baseService
			.post(getContext()['uc']+"/api/org/v1/orgAuth/saveOrgAuth",$scope.data)
			.then(function(response){
				if(response.state){
	    			dialogService.success(response.message || "操作成功!");
					dialogService.closeSidebar();//关闭窗口
	    		}else{
	    			dialogService.fail(response.message || "操作失败!");
	    		}
			});
		}
	}
	
	$scope.addAuthUser = function(){
		var assigns = [];
		if($scope.data.userId){
			var assign = new Object();
			assign.id = $scope.data.userId;
			assign.fullname = $scope.data.userName;
			assigns.push(assign);
		}
		var pageParam = {
				 single:true, /*是否单选*/ 
				 data:assigns
				};
			dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
				 if(result && result.length > 0){
					 $scope.userName = result[0].fullname;
					 $scope.data.account = result[0].account;
					 $scope.data.userId =  result[0].id;
					 $scope.data.userName =  result[0].fullname;
					 $("#userName").val($scope.userName);
				 }
			 });
	}
}
//下属列表
function underUserListCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.$on("dataTable:ready", function(){
		if($scope.pageParam.userId){
			$scope.underUserTable.query();
		}
	});
	
	$scope.$on("dataTable:query:begin", function(t,d){
		if(d.name == 'underUserTable'){
			$scope.underUserTable.addQuery({property: 'USER_ID_', operation: 'equal', value: $scope.pageParam.userId});
			$scope.underUserTable.addQuery({property: 'ORG_ID_', operation: 'equal', value: $scope.pageParam.orgId});
		}
	});
	
	$scope.doAddUnderUser = function(underAccounts){
		baseService
		.post(getContext()['uc']+"/api/org/v1/orgUsers/setUnderUsers?orgId="+$scope.pageParam.orgId+"&account="+$scope.pageParam.account+"&underAccounts="+underAccounts)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "添加成功!");
    			$scope.underUserTable.query();
    		}else{
    			dialogService.fail(response.message || "添加失败!");
    		}
		});
	};
	
	$scope.addUnderUser = function (){
		var pageParam = {
				 single:false, /*是否单选*/ 
				 data:[
					 
				 ]
				};
			dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
				 if(result && result.length > 0){
					 var accountArray = [];
					 angular.forEach(result, function(item){
						 accountArray.push(item.account);
					 });
					 $scope.doAddUnderUser(accountArray.join(","))
				 }
			 });
	}
}
//岗位用户
function postUserListCtrl($scope,baseService,dialogService,ArrayToolService){
	
	$scope.$on("dataTable:ready", function(){
		if($scope.pageParam.id){
			$scope.postUserTable.query();
		}
	});
	
	$scope.$on("dataTable:query:begin", function(t, d){
    	if(d.name == 'postUserTable'){
    		$scope.postUserTable.addQuery({property: 'POS_ID_', operation: 'equal', value: $scope.pageParam.id});
    	}
	});
	
	$scope.doAddPostUser = function(underAccounts){
		baseService
		.post(getContext()['uc']+"/api/org/v1/userPost/saveUserPost?postCode="+$scope.pageParam.code+"&accounts="+underAccounts)
		.then(function(response){
			if(response.state){
    			dialogService.success(response.message || "添加成功!");
    			$scope.postUserTable.query();
    		}else{
    			dialogService.fail(response.message || "添加失败!");
    		}
		});
	};
	
	$scope.addPostUser = function (){
		var pageParam = {
				 single:false, /*是否单选*/ 
				 data:[
					 
				 ]
				};
			dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
				 if(result && result.length > 0){
					 var accountArray = [];
					 angular.forEach(result, function(item){
						 accountArray.push(item.account);
					 });
					 $scope.doAddPostUser(accountArray.join(","))
				 }
			 });
	}
}

/**
 * 汇报线管理
 * @param $scope
 * @param baseService
 * @param dialogService
 * @param $timeout
 */
function reportLineCtrl($scope, baseService,dialogService,$timeout){
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
	$scope.lineTypeData = [];
	$scope.lineTreeData = [];
	$scope.data={};
	$scope.data.load="/n";
	$scope.data.sysMethods=[];
	$scope.isEditable=false;
	$scope.parentId="";
	$scope.typeName = "汇报线分类";
	$scope.crrentTypeId = '';
	$scope.crrentAlias = '';
	$scope.getLineTypeData=function(){
		var url = "${portal}/sys/sysType/v1/getTypesByKey?typeKey=REPORT_LINE"
			//加载树
			baseService
			.get(url)
			.then(function(response){
				if(response){
					$scope.typeName = response[0].name;
					if(response[0].children){
						$scope.lineTypeData = response[0].children;
					}
				}
			});
	}
	$scope.getLineTypeData();
	
	$scope.getReportLineData = function(typeId){
		$scope.crrentTypeId = typeId;
		$scope.lineTreeData = null;
		var url = "${uc}/api/userRel/v1/userRels/getUserRelByTypeId?typeId="+typeId;
			//加载树
			baseService
			.get(url)
			.then(function(response){
				$scope.dataHandle(response);
				$scope.lineTreeData = response;
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

	

	$scope.beforeRightClick = function(treeNode){
		if(!treeNode) return;
		if(treeNode.parentId=='-1'){
			$scope.contextMenu = ['刷新'];
			if(treeNode.children.length<1){
				$scope.contextMenu.push('添加汇报线');
			}
		}
		else{
			$scope.contextMenu = ['分配下级用户组', '编辑节点', '删除节点','分配管理员','刷新'];
		}
	}

	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		switch(menu){
		case '刷新':
			$scope.getReportLineData($scope.crrentTypeId);
			break;
		case '添加汇报线':
			addReportLine(treeNode,false);
			break;
		case '分配下级用户组':
			addReportLine(treeNode,false);
			break;
		case '编辑节点':
			addReportLine(treeNode,true)
			break;
		case '删除节点':
			dialogService.confirm("确定要删除该汇报节点吗？").then(function(){
				baseService.post('${uc}/api/userRel/v1/userRel/deleteUserRel',treeNode.alias).then(function(response){
					if(response.state){
						dialogService.success(response.message);
						$scope.getReportLineData($scope.crrentTypeId);
					}else{
						dialogService.fail(response.message);
					}
				});
			});
			break;
		case '分配管理员':
			dialogService.page('uc.relAuthList', {area:['1000px', '480px'],pageParam:{relCode:treeNode.alias,typeCode:treeNode.typeId}})
			 .then(function(result){
				 
			 });
			break;
		}
	}
	
	
	function addReportLine(treeNode,isEdit){
		$scope.crrentAlias = treeNode.alias;
		dialogService.page('uc.addReportLine', {area:['600px', '220px'],pageParam: isEdit?{nodeType:treeNode.groupType,value:treeNode.value,alias:treeNode.alias,selectName:treeNode.name}:null})
		 .then(function(result){
			 if(result){
				 result.parentAlias = $scope.crrentAlias;
				 var list = [result];
				 baseService.post('${uc}/api/userRel/v1/userRel/addUserRel',list).then(function(response){
					if(response.state){
						dialogService.success(response.message);
						$scope.getReportLineData($scope.crrentTypeId);
					}else{
						dialogService.fail(response.message);
					}
				});
			 }
		 });
	}
}

function addReportLineCtrl($scope, baseService,dialogService){
	$scope.nodeType = $scope.pageParam?$scope.pageParam.nodeType:'user';
	$scope.selectName = $scope.pageParam?$scope.pageParam.selectName:''
	$scope.value = $scope.pageParam?$scope.pageParam.value:'';
	$scope.alias = $scope.pageParam?$scope.pageParam.alias:'';
	
	$scope.$watch('nodeType',function(newVal,oldVal){
		if(newVal && newVal !=oldVal ){
			$scope.value = '';
			$scope.selectName = '';
			$scope.alias = '';
		}
	});
	
	$scope.toSelector = function(){
		if($scope.nodeType!='role'){
			var initData = $scope.nodeType=='user'?{single:true,data:[{id:$scope.value, fullname:$scope.selectName}]}:{single:true,data:[{id:$scope.value, name:$scope.selectName}]};
			dialogService.page($scope.nodeType+'-selector', {area:['1120px', '650px'], pageParam: initData})
			 .then(function(result){
				 if(result && result.length > 0){
					 $scope.value = result[0].id;
					 $scope.selectName = $scope.nodeType=='user'?result[0].fullname:result[0].name;
					 $scope.alias = $scope.nodeType=='user'?result[0].account:result[0].code;
				 }
			 });
		}else{
			dialogService.page('role-selector', {area:['800px', '650px'], pageParam: {single:true,data:[{id:$scope.value, name:$scope.selectName}]}})
			 .then(function(result){
				 if(result){
					 $scope.value = result.id;
					 $scope.selectName = result.name;
					 $scope.alias = result.code;
				 }
			 });
		}
		
	}
	
	$scope.pageSure = function(){
		return {type:$scope.nodeType,value:$scope.value,alias:$scope.alias};
	}
}


//汇报线管理员
function relAuthListCtrl($scope, $compile,  baseService,dialogService) {
	$scope.$on("dataTable:ready", function(){
		if($scope.pageParam.id){
			$scope.relAuthTable.query();
		}
	});
	
	$scope.$on("dataTable:query:begin", function(t, d){
		$scope.relAuthTable.url = "${uc}/api/relAuth/v1/relAuths/getRelAuthPage?relCode="+$scope.pageParam.relCode;
	});
	
	$scope.doAddRelAuth = function(underAccounts){
		baseService.post("${uc}/api/relAuth/v1/relAuths/addRelAuths?code="+$scope.pageParam.relCode+"&accounts="+underAccounts).then(function(response){
			if(response.state){
    			dialogService.success(response.message || "添加成功!");
    			$scope.relAuthTable.query();
    		}else{
    			dialogService.fail(response.message || "添加失败!");
    		}
		});
	};
	
	$scope.addRelAuth = function (){
		var pageParam = {
				 single:false, /*是否单选*/ 
				 data:[
					 
				 ]
				};
			dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: pageParam})
			 .then(function(result){
				 if(result && result.length > 0){
					 var accountArray = [];
					 angular.forEach(result, function(item){
						 accountArray.push(item.account);
					 });
					 $scope.doAddRelAuth(accountArray.join(","))
				 }
			 });
	}
	
	$scope.removeRelAuth = function (){
		if($scope.relAuthTable.selectRow().length == 0){
			return;
		}
		
		var accountArray = [];
		angular.forEach($scope.relAuthTable.selectRow(), function(item){
			accountArray.push(item.account);
		});
		$scope.doRemoveRelAuth(accountArray.join(","));
	}
	
	$scope.doRemoveRelAuth = function (accounts){
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove("${uc}/api/relAuth/v1/relAuth/delRelAuth?relCode="+$scope.pageParam.relCode,accounts)
	    	.then(function(response) {
	    		if(response.state){
	    			dialogService.success("删除成功");
	    			$scope.relAuthTable.query();
	    		}else{
	    			dialogService.fail(response.message || "删除失败!");
	    		}
	    	});	
		}, function(){
		});
	}
}




/**
 *
 * Pass all functions into module
 */
angular.module('uc', [])
	.controller('demensionListCtrl', demensionListCtrl)
	.controller('demensionEditCtrl', demensionEditCtrl)	
	.controller('jobListCtrl', jobListCtrl)
	.controller('jobEditCtrl', jobEditCtrl)
	.controller('paramsListCtrl', paramsListCtrl)
	.controller('paramsEditCtrl', paramsEditCtrl)
	.controller('roleListCtrl', roleListCtrl)
	.controller('roleEditCtrl', roleEditCtrl)
	.controller('userListCtrl', userListCtrl)
	.controller('userEditCtrl', userEditCtrl)
	.controller('orgManagerCtrl', orgManagerCtrl)
	.controller('editOrgPostCtrl', editOrgPostCtrl)
	.controller('editOrgAuthCtrl', editOrgAuthCtrl)
	.controller('underUserListCtrl', underUserListCtrl)
	.controller('postUserListCtrl', postUserListCtrl)
	.controller('roleUserListCtrl', roleUserListCtrl)
	.controller('orgAuthManagerCtrl', orgAuthManagerCtrl)
	.controller('reportLineCtrl', reportLineCtrl)
	.controller('addReportLineCtrl', addReportLineCtrl)
	.controller('relAuthListCtrl', relAuthListCtrl)
	.controller('changUserPwdCtrl', changUserPwdCtrl)
	;

