function dataSourceListControllers($scope, dialogService) {
	//编辑或查看
	$scope.edit = function(id, action) {
		dialogService.sidebar("dataSource.dataSourceListEdit", {
			bodyClose: false,
			width: '1000px',
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

}

function dataSourceEditControllers($scope, dialogService,baseService){
	$scope.prop={};
	$scope.prop.settingJson=[];
    $scope.prop.enabled=false;
    $scope.prop.initOnStart=false;
	$scope.id = $scope.pageParam.id;
    $scope.title=$scope.id==""?"添加数据源":"修改数据源";
	 var url = "${portal}/sys/sysDataSourceDef/v1/getAll";
	baseService
	.get(url)
	.then(function(response){
		$scope.sysDataSourceDefs = response;
	});
	
	$scope.detail = function(id){
        if(!id) return;
        var url = "${portal}/sys/sysDataSource/v1/getJson?id=" + id;
        baseService.get(url).then(function(rep){
            $scope.prop = rep;
            $scope.prop.settingJson=JSON.parse(rep.settingJson);
			$scope.oldAlias = $scope.prop.alias;
        });
    }
	
    $scope.detail($scope.id);
    
    //保存事件
    $scope.save = function(){
        var url = "${portal}/sys/sysDataSource/v1/save";
        var param=angular.copy($scope.prop);
        param.settingJson=JSON.stringify(param.settingJson);
        baseService.post(url,param).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();
                });
            }
            else{
                dialogService.fail(rep.message || '保存失败');
            }
        });
  }
	//新增或修改，先判断alias是否存在
	$scope.isExist = function(){
		if($scope.prop.name==""||$scope.prop.name==undefined){
			dialogService.fail( '名称为必填字段');
			return;
		}else if($scope.prop.alias==""||$scope.prop.alias==undefined){
			dialogService.fail( '别名为必填字段');
			return;
		}else if($scope.prop.dbType==undefined){
			dialogService.fail( '请选择数据源类型');
			return;
		}else if($scope.prop.settingJson.length==0){
			dialogService.fail( '请选择数据源');
			return;
		}else{
			if($scope.title == "修改数据源") {
				if($scope.oldAlias == $scope.prop.alias){
					$scope.save();
				}else{
					$scope.isType();
				}
			}else{
				$scope.isType();
			}
		}
	}
	//判断alias是否存在
	$scope.isType = function(){
		var url = "${portal}/sys/sysDataSource/v1/getBeanByAlias?alias=" +$scope.prop.alias;
		baseService.get(url).then(function(rep) {
			if(rep!=""){
				dialogService.fail("别名已存在");
			}else{
				$scope.save();
			}
		});
	}

   //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
    
	
	//连接测试
	$scope.checkConnection=function(){
		 var url = "${portal}/sys/sysDataSource/v1/checkConnection";
		 if($scope.prop.settingJson.length==0){
             dialogService.fail('连接失败失败');
             return;
		 }
         var param=angular.copy($scope.prop);
         param.settingJson=JSON.stringify(param.settingJson);
		 baseService.post(url,param).then(function(rep){
	            if(rep && rep.state){
	                dialogService.success(rep.message).then(function(){
	                });
	            }
	            else{
	                dialogService.fail(rep.message || '连接失败失败');
	            }
	        });
	}
	//数据源配置别名跟这里的别名一致
	$scope.changeAlias=function(){
		for(var i=0;i<$scope.prop.settingJson.length;i++){
			var attr = $scope.prop.settingJson[i];
			if(attr.name.toLowerCase().indexOf("alias")!=-1){
				attr.value=$scope.prop.alias;
			} 
		}
	}
	
	
	
		//改变了数据池id，那么需要输入的属性也变了
	$scope.changeDsId=function(dsId){
			for(var i=0;i<$scope.sysDataSourceDefs.length;i++){
			var def = $scope.sysDataSourceDefs[i];
			if(def.id!=dsId) continue;
			$scope.prop.settingJson= JSON.parse(def.settingJson);
			$scope.prop.classPath=def.classPath;
			$scope.prop.initMethod=def.initMethod;
			$scope.prop.closeMethod=def.closeMethod;
			//处理配置的初始化值
			$($scope.prop.settingJson).each(function(){
				this.value=this["default"];
			});
		} 
	}
		
	$scope.changeDbType=function(){
		for(var i in $scope.dbTypeList){
			var d = $scope.dbTypeList[i];
			if(d.value!=$scope.prop.dbType) continue;
			for(var i=0;i<$scope.prop.settingJson.length;i++){
				var attr = $scope.prop.settingJson[i];
				if(attr.name.toLowerCase().indexOf("url")!=-1){
					attr.value=d.url;
				}
				else if(attr.name.toLowerCase().indexOf("driver")!=-1){
					attr.value=d.driverName;
				}
			}
		}
	}
		
		//数据库类型数组
	$scope.dbTypeList=[
		{
			value:'mysql',
			driverName:'com.mysql.jdbc.Driver',
			url:'jdbc:mysql://主机:3306/数据库名?useUnicode=true&characterEncoding=utf-8'
		},
		{
			value:'oracle',
			driverName:'oracle.jdbc.OracleDriver',
			url:'jdbc:oracle:thin:@主机:1521:数据库实例'
		},
		{
			value:'sqlserver',
			driverName:'com.microsoft.sqlserver.jdbc.SQLServerDriver',
			url:'jdbc:sqlserver://主机:1433;databaseName=数据库名;'
		}
	];
		
	//普通是否数组
	$scope.yesOrNoList=[
		{
			key:'是',
			value:true
		},
		{
			key:"否",
			value:false
		}
	];
	
}

function connectionPoolListControllers($scope, dialogService){
	$scope.edit = function(id, action) {
		dialogService.sidebar("dataSource.connectionPoolEdit", {
			bodyClose: false,
			width: '60%',
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
	
}


function connectionPoolEditControllers($scope, baseService,ArrayToolService,dialogService){
	$scope.prop={};
	$scope.ArrayTool=ArrayToolService;
	//普通是否数组
	$scope.yesOrNoList=[
		{
			key:'是',
			value:true
		},
		{
			key:"否",
			value:false
		}
	];
	$scope.title=$scope.pageParam.action=="add"?"新增连接池":"修改连接池";
	$scope.id=$scope.pageParam.id;
	$scope.detail = function(id){
        if(!id) return;
        var url = "${portal}/sys/sysDataSourceDef/v1/get?id=" + id;
        baseService.get(url).then(function(rep){
            $scope.prop=rep;
            $scope.prop.settingJson=JSON.parse(rep.settingJson);
        });
    }
    $scope.detail($scope.id);
	
	$scope.getAttr=function(classPath){
		baseService
		.get("${web}/mock/settingJson.json")
		.then(function(response){
			$scope.prop.settingJson=response;
		});
	}
	
	
	
	 //保存事件
    $scope.save = function(){
        var url = "?"+$scope.prop;
        baseService.post(url, $scope.data).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();
                });
            }
            else{
                dialogService.fail(rep.message || '保存失败');
            }
        });
  }
   //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}
/**
 *
 * Pass all functions into module
 */
angular
    .module('dataSource', [])
    .controller('dataSourceListControllers', dataSourceListControllers)
	.controller('dataSourceEditControllers', dataSourceEditControllers)
	.controller('connectionPoolEditControllers', connectionPoolEditControllers)
	.controller('connectionPoolListControllers', connectionPoolListControllers)
	.service('ArrayToolService', [function() {
    var service = {
    		//上移按钮
	    	up:function(idx,list){
	    		if(idx<1){
	    			return;
	    		}
	    		var t=list[idx-1];
	    		list[idx-1]=list[idx];
	    		list[idx]=t;
	    	},
	    	//下移按钮
	    	down:function(idx,list){
	    		if(idx>=list.length-1){
	    			return;
	    		}
	    		var t=list[idx+1];
	    		list[idx+1]=list[idx];
	    		list[idx]=t;
	    	},
	    	//删除按钮
	    	del:function(idx,list){
	    		list.splice(idx,1);
	    	},
	    	//找到指定元素的未知
	    	indexOf:function(val,list){
	    		for (var i = 0; i < list.length; i++) {  
	    	        if (list[i] == val) return i;  
	    	    }  
	    	    return -1; 
	    	},
	    	//删除指定元素
	    	remove:function(val,list){
	    		var index = list.indexOf(val);  
	    	    if (index > -1) {  
	    	    	list.splice(index, 1);  
	    	    }  
	    	}
    }
    return service;
}]);