//邮箱配置
function mailSettingTypeCtrl($scope, dialogService, baseService) {
	$scope.operating = function(id, action) {
		var title = action == "edit" ? "编辑外部邮箱配置"
				: action == "add" ? "添加外部邮箱配置" : "查看外部邮箱配置";
		if (action == "edit" || action == "add") {
			dialogService.sidebar("m_mail.mailSettingListAdd", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
			$scope.$on('sidebar:close', function() {// 添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();// 子页面关闭,父页面数据刷新
			});
		} else {
			dialogService.sidebar("m_mail.mailSettingListDetail", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
		}
	}
	
	//测试连接
	$scope.testConnect = function(id) {
				var url = '${portal}/mail/mail/mailSetting/v1/getJson?id='+id;
				baseService.get(url).then(function(rep) {
					if(!rep.mailAddress){
						dialogService.fail("请先填写邮箱地址!");
						return false;
					}
					if(!rep.id && !$rep.password){
						dialogService.fail("请先填写邮箱密码!");
						return false;
					}
					var url = "${portal}/mail/mail/mailSetting/v1/test?isEdit=0&&id="+id;
					dialogService.success("测试连接可能需要点时间,请耐心等候下。");
					baseService.post(url, rep).then(function(response) {
						if (response && response.state) {
							dialogService.success("连接成功！" || response.message);
						} else {
							dialogService.fail("测试连接失败！" || response.message);
						}
					});
				});
	}

	// 设为默认
	$scope.setDefault = function(id) {
		var url = "${portal}/mail/mail/mailSetting/v1/setDefault?id=" + id;
		baseService.post(url).then(function() {
			$scope.dataTable.query();
		});
	}
}

// 邮箱配置编辑
function mailSettingEditTypeCtrl($scope, dialogService, baseService) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;

	// 初始化值
	if (!$scope.id) {
		$scope.data.mailType = 'pop3';
		$scope.data.validate = 1;
		$scope.data.isHandleAttach = 1;
	}

	// 自动添加端口
	$scope.showInfos = function() {
		if ($scope.data.mailAddress != '') {
			var address = $scope.data.mailAddress;
			var type = $scope.data.mailType;
			var s = address.substring(address.indexOf('@') + 1,
					address.length + 1).trim();
			if (type == 'pop3') {
				$scope.data.smtpHost = 'smtp.' + s;
				$scope.data.popHost = 'pop.' + s;
			}
			if (type == 'pop3') {
				if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
						|| s == 'live.com' || s == 'hotmail.com') {
					$scope.data.sSL = 0;
				} else {
					$scope.data.popPort = '110';
					$scope.data.smtpPort = '25';
				}
			} else if (type == 'imap') {
				if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
						|| s == 'live.com' || s == 'hotmail.com') {
					$scope.data.sSL = 0;
				} else {
					$scope.data.popPort = '143';
					$scope.data.smtpPort = '25';
				}
				$scope.data.imapHost = 'imap' + '.' + s;
			}else{
				$scope.data.smtpHost = s;
				$scope.data.smtpPort = "mail."+s;
			}
		}
	}

	// 改变ssl
	$scope.changeSSL = function() {
		if ($scope.data.sSL == '1' && $scope.data.mailType != 'exchange') {
			$scope.data.imapPort = '993';
			$scope.data.smtpPort = '465';
			$scope.data.popPort = '995';
		} else if ($scope.data.mailType != 'exchange') {
			$scope.data.imapPort = '143';
			$scope.data.smtpPort = '25';
			$scope.data.popPort = '110';
		}
	}

	// 获取详情
	$scope.detail = function(id) {
		if (!id)
			return;
		var url = '${portal}/mail/mail/mailSetting/v1/getJson?id=' + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}

	$scope.detail($scope.id);

	// 保存事件
	$scope.save = function() {
		if(!$scope.data.mailAddress){
			dialogService.fail("请先填写邮箱地址!");
			$("#mailAddress").focus();
			return false;
		}
		if(!$scope.data.id && !$scope.data.password){
			dialogService.fail("请先填写邮箱密码!");
			$("#password").focus();
			return false;
		}
		var url = "${portal}/mail/mail/mailSetting/v1/save";
		baseService.post(url, $scope.data).then(function(rep) {
			if (rep && rep.state) {
				dialogService.success(rep.message).then(function() {
					$scope.close();
				});
			} else {
				dialogService.fail(rep.message || '保存失败');
			}
		});
	}

	// 测试连接
	$scope.testConnect = function() {
		if(!$scope.data.mailAddress){
			dialogService.fail("请先填写邮箱地址!");
			$("#mailAddress").focus();
			return false;
		}
		if(!$scope.data.id && !$scope.data.password){
			dialogService.fail("请先填写邮箱密码!");
			$("#password").focus();
			return false;
		}
			if($scope.data.id!=null){
				var url = "${portal}/mail/mail/mailSetting/v1/test?isEdit=1&&id="+$scope.data.id;
			}else{
				var url = "${portal}/mail/mail/mailSetting/v1/test?isEdit=1&&id=''";
			}
			dialogService.success("测试连接需要时间,请稍后!。");
			baseService.post(url, $scope.data).then(function(rep) {
				if (rep && rep.state) {
					dialogService.success("连接成功！" || rep.message);
				} else {
					dialogService.fail("测试连接失败！" || rep.message);
				}	
			});
			}
	
	// 关闭事件
	$scope.close = function() {
		dialogService.closeSidebar();
	}
}

// 邮箱联系人
function mailLinkmanTypeCtrl($scope, dialogService, baseService) {
	$scope.operating = function(id, action) {
		var title = action == "edit" ? "编辑邮箱联系人" : action == "add" ? "添加邮箱联系人"
				: "查看邮箱联系人";
		if (action == "edit" || action == "add") {
			dialogService.sidebar("m_mail.mailLinkmanListEdit", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
			$scope.$on('sidebar:close', function() {// 添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();// 子页面关闭,父页面数据刷新
			});
		} else {
			dialogService.sidebar("m_mail.mailLinkmanListDetail", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
		}
	}
}

// 联系人添加编辑
function mailLinkmanEditCtrl($scope, dialogService, baseService) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.detail = function(id) {
		if (!id)
			return;
		var url = "${portal}/mail/mail/mailLinkman/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}

	// 编辑
	$scope.detail($scope.id);
	// 保存
	$scope.save = function() {
		if($scope.data.linkName==null || $scope.data.linkName==''){
			dialogService.fail("联系人名称不能为空！");
			return;
		}else if($scope.data.linkAddress==null || $scope.data.linkAddress==''){
			dialogService.fail("联系人地址不能为空！");
			return;
		}

		$scope.data.sendTime = $("#sampleDate").val();
		var url = "${portal}/mail/mail/mailLinkman/v1/save";
		baseService.post(url, $scope.data).then(function(rep) {
			if (rep || rep.state) {
				dialogService.success(rep.message).then(function() {
					$scope.close();
				});
			} else {
				dialogService.fail(rep.message || '保存失败');
			}
		});

	}

	// 关闭事件
	$scope.close = function() {
		dialogService.closeSidebar();
	}
}

// 邮箱邮件
function mailTypeCtrl($scope, $state, baseService, dialogService) {
	$scope.isTreeExpandAll = true;
	$scope.type = "";
	$scope.mailSetId="";
	$scope.mailType = "";
	
	//树配置
	$scope.treeConfig = {
			data: {
				callback: {
					beforeCollapse: false
				},
				key : {
					name: "nickName",
					title: "nickName"
				},
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: 0,
					
				},
				check: {
					enable: true
				}
			},
			view: {
				selectedMulti: false,
				showLine : false
			}
			
	}
	//加载树事件
	$scope.loadTree = function(){
		$scope.treeData = [];
		
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
		
		//加载树数据
		baseService.get("${portal}/mail/mail/mail/v1/getMailTreeData").then(function(rep) {
			if (!rep) {
				dialogService.fail("请添加邮箱");
			} else {
				$scope.dataHandle(rep);
				$scope.treeData = rep;
				for (var i = 0; i < rep.length; i++) {
					if(rep[i].isDefault==1){
						$scope.mailSetId=rep[i].id;
						$scope.mailType = rep[i].mailType;
//						$scope.sysnc($scope.mailSetId);
					}
				}
			}
			$scope.dataTable.addQuery({property: 'setId', operation: 'equal', value: $scope.mailSetId});
			$scope.dataTable.addQuery({property: 'type', operation: 'equal', value: "1"});
			$scope.dataTable.query();
		})			
	}
	
	//加载树
	$scope.loadTree();
	
	
	//点击事件
	$scope.tree_click = function(e, i, n){
		var id = null;
		$scope.type = n.types;
		if(n.isParent==false){
			id = n.id; 
		}else{
			id = n.parentId;
		}
		baseService.get("${portal}/mail/mail/mailSetting/v1/getJson?id="+n.parentId).then(function(rep) {
			$scope.mailType = rep.mailType;
		});
		if(!n.types){
			$scope.dataTable.addQuery({property: 'setId', operation: 'equal', value: n.id});
			$scope.dataTable.query();
		}
		else{
			$scope.dataTable.addQuery({property: 'setId', operation: 'equal', value: n.parentId});
			$scope.dataTable.addQuery({property: 'type', operation: 'equal', value: $scope.type});
			$scope.dataTable.query();
		}
	}
	
	//监听事件
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});
	
	//操作
	$scope.operating = function(id, action) {
		var title = action == "add" ? "写邮件" : "查看邮件详情";
		if(action=="add"){
			$state.go('m_mail.mailListEdit',{id:id,title:title});
		} else {
			$state.go('m_mail.mailListDetail',{id:id,title:title,type:$scope.mailType});
		}
	}
	
	//展开收缩事件
	$scope.treeExpandAll = function(type) {
		$scope.isTreeExpandAll = type;
		treeObject = $.fn.zTree.getZTreeObj("treeObject");
		treeObject.expandAll(type);
	}
	
	//删除
	$scope.remove = function(){
		 var s = "";
		 $.each($('input:checkbox:checked'),function(){
			 if($(this).val()!="on"){
				 s += $(this).val()+",";
			 }
         });
		 if(s==""){
			 dialogService.fail("请选择要删除的项");
			 return;
		 }
		if($scope.type==""){
			$scope.type="1";
		}
		var url = "${portal}/mail/mail/mail/v1/remove?ids="+s+"&&type="+$scope.type;
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.get(url).then(function(rep){
				if(rep || rep.state){
					dialogService.success(rep.message).then(function() {
						$scope.loadTree();
						$scope.dataTable.query();
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		}, function(){
		});
	}
	
	//同步邮件
	$scope.sysnc = function(){
	if($scope.mailSetId==""){
		return;
	}
	var url = "${portal}/mail/mail/mail/v1/sync?id="+$scope.mailSetId;	
	baseService.post(url).then(function(rep){
		dialogService.success("正在同步邮件中，请稍后。。。。。");
		if(rep || rep.state){
			dialogService.success(rep.message).then(function() {
				$scope.loadTree();
				$scope.dataTable.query();
			});
		}else{
			dialogService.fail(rep.message);
		}
	});

	}
	
	
	//发送
	$scope.send = function(id,action) {
		if (!id)
			return;
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
			$scope.submit(action);
		});
	}
	
	$scope.submit = function(action){
		$scope.data.type = action;
		$scope.data.isReply = 0;
		var index = layer.load(0, {shade: false});
		baseService.post("${portal}/mail/mail/mail/v1/send", $scope.data).then(function(rep){
			layer.close(index);
			if (rep || rep.state) {
				dialogService.success("发送成功！" || rep.message);
				$scope.loadTree();
			} else {
				dialogService.fail(rep.message);
			}
		});
	}
}

function mailGetCtrl($scope,$stateParams,$state, dialogService, baseService,context){
	$scope.id = $stateParams.id;
	$scope.title = $stateParams.title;
	$scope.type = $stateParams.type;
	$scope.detail = function(id) {
		if (!id)
			return;
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
				$scope.data = rep;
				if($scope.type=="exchange"){
					$scope.data.content = $.base64.decode($scope.data.content,"utf-8");
				}
				if ($scope.data.content) {
					$('#content').html($scope.data.content);
				}
		});
	}
	// 编辑
	$scope.detail($scope.id);
	//下载附件
	$scope.downLoadAttach = function(id){
		var contexts = context();
		var portal=contexts.portal;
		var url = portal+"/system/file/v1/downloadFile?fileId="+id;
		document.location.href=url;
	}
	//关闭
	$scope.close = function(){
		$state.go("m_mail.mailList");
	}
}

// 邮件编辑
function mailEditCtrl($scope, $stateParams, $state, dialogService, baseService) {
	$scope.data = {};
	$scope.treeData = [];
	$scope.mailSettingList = {};
	$scope.title = $stateParams.title;
	$scope.data.receiverAddresses = "";
	$scope.data.copyToAddresses = "";
	$scope.data.bcCAddresses = "";
	var focusFiled='';
	$scope.id = $stateParams.id;
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        showCursorWhenSelecting: true
    };
	if($scope.id!=null || $scope.id!=''){
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + $scope.id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}
	
	//获取发送人地址
	baseService.get("${portal}/mail/mail/mail/v1/getMailTreeData").then(function(rep) {
		$scope.mailSettingList = rep;
	});
	
	//加载树
	$scope.loadTree = function(condition){
		$scope.treeData = [];
		baseService.get("${portal}/mail/mail/mailLinkman/v1/getMailLinkmanData?condition="+condition).then(function(rep) {
			$scope.treeData = rep;
		});	
		
		$("input[address='true']").focus(function(){
			focusFiled=$(this).attr('ng-model').split(".")[1];
		}).blur(function(){
			setTimeout(function(){
				focusFiled='';
			}, 200);
		});
	}
	
	$scope.loadTree();
	
	//左键点击
	$scope.tree_click = function(e, i, n){
		/*if(focusFiled==''){
			dialogService.fail("请选择要填入的地址");
			 return;
		}*/
		var address=n.linkAddress;
		address=address.substring(address.indexOf('(')+1,address.indexOf(')'));
		if(!$scope.data.receiverAddresses || $scope.data.receiverAddresses==''){
			$scope.data.receiverAddresses=address;
		}else{
			var arrtemp=$scope.data.receiverAddresses.split(',');
			for(var i=0;i<arrtemp.length;i++){
				if(arrtemp[i]==address){
					 break;
				}else{
					if(i==arrtemp.length-1){
						$scope.data.receiverAddresses+=","+address;
					}
				}
			}
		}
		$scope.$applyAsync();
	}
	
	// 右键菜单点击前事件
	$scope.beforeRightClick = function(treeNode){
		$scope.contextMenu = ['删除该联系人'];
	}
	
	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		var url = "${portal}/mail/mail/mailLinkman/v1/remove?ids="+treeNode.id;
		dialogService.confirm("确认要删除吗?").then(function(){
			baseService.remove(url).then(function(rep) {
				if(rep || rep.state){
					dialogService.success(rep.message).then(function() {
						$scope.loadTree();
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		}, function(){
		});
	}

	
	//树配置
	$scope.treeConfig = {
			data: {
				callback: {
					beforeCollapse: false
				},
				key : {
					name: "linkAddress",
					title: "linkName"
				},
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: 0,
					
				}
				
			},
			view: {
				selectedMulti: false,
				showLine : false
			}
			
	}
	
	 //重 置
	$scope.reset=function() {
		$scope.data='';
	}
	
	var s = [];
	var m = []
	var q = [];
	//打开联系人列表
	$scope.selectLinkMan = function(type) {
		var selector = "user-selector";
		var pageParam = {
				single:false, /*是否单选*/
				data:[]
		};
		if(type=="receiverAddresses"){
			$scope.data.receiverAddresses = "";
			pageParam.data = s;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				s = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.receiverAddresses += result[i].email;
					}else{
						$scope.data.receiverAddresses += result[i].email+",";
					}
				}
			});
		}else if(type=="copyToAddresses"){
			$scope.data.copyToAddresses = "";
			pageParam.data = m;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				m = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.copyToAddresses += result[i].email;
					}else{
						$scope.data.copyToAddresses += result[i].email+",";
					}
				}
			});
		}else{
			$scope.data.bcCAddresses = "";
			pageParam.data = q;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				q = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.bcCAddresses += result[i].email;
					}else{
						$scope.data.bcCAddresses += result[i].email+",";
					}
				}
			});
		}
	}
	
	//发送
	$scope.sendMail = function(action) {
		if(!$scope.data.senderAddress){
			dialogService.fail("请选择发件人!");
			return;
		}
		if(!$scope.data.receiverAddresses){
			dialogService.fail("请填写收件人邮箱地址!");
			return;
		}
		if(!$scope.data.subject){
			dialogService.fail("请填写邮件主题!");
			return;
		}
		if(!$scope.data.content){
			dialogService.fail("请填写邮件内容!");
			return;
		}
		$scope.submit(action);
	}
	
	$scope.submit = function(action){
		$scope.data.type = action;
		$scope.data.isReply = 0;
		baseService.post("${portal}/mail/mail/mail/v1/send", $scope.data).then(function(rep){
			if (rep || rep.state) {
				dialogService.success(rep.message).then(function() {
					$scope.close(); 
//					 dialogService.confirm("是否还需要写邮件?").then(function(rep){
//						 if(rep || rep.state){
//							$scpe.dataTable.refresh(); 
//						 }else{
//					 $scope.close(); 
//						 }
//					 });
				});
			} else {
				dialogService.fail(rep.message);
			}
		});
	}
	
	//关闭
	$scope.close = function(){
		$state.go("m_mail.mailList");
	}
}

/**
 *
 * Pass all functions into module
 */
angular.module('mail', []).controller('mailSettingTypeCtrl',
		mailSettingTypeCtrl).controller('mailSettingEditTypeCtrl',
		mailSettingEditTypeCtrl).controller('mailLinkmanTypeCtrl',
		mailLinkmanTypeCtrl).controller('mailLinkmanEditCtrl',
		mailLinkmanEditCtrl).controller('mailTypeCtrl', mailTypeCtrl)
		.controller('mailGetCtrl', mailGetCtrl)
		.controller('mailEditCtrl', mailEditCtrl);
