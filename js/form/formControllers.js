function boDefListCtrl($scope, baseService, dialogService) {
    $scope.treeData = [];
    baseService.get("${portal}/sys/sysType/v1/getTypesByKey?typeKey=DEF_TYPE").then(function(data) {
        $scope.treeData = data;
    })

    $scope.$on("dataTable:query:reset", function (t, d) {
        if (d.name !== $scope.dataTable.name) {
            return;
        }
        $scope.treeInstance.cancelSelectedNode();
    });

    $scope.tree_click = function (e, i, n) {
        if(n.parentId==-1){
            $scope.dataTable.reset();
        }else {
            $scope.dataTable.addQuery({property: 'categoryId', operation: 'equal', value: n.id});
            $scope.dataTable.query();
        }

    }

    //编辑或查看
    $scope.edit = function (data, action) {
        dialogService.sidebar("form.modelingManagemenEdit", {
            bodyClose: false,
            width: 'calc(100% - 225px)',
            pageParam: {id: data.id, action: action}
        });
        $scope.$on('sidebar:close', function () {//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }

    //查看数据结构
    $scope.preview = function (data) {
        dialogService.sidebar("form.modelingManagemenPreview", {bodyClose: true, width: '300px', pageParam: {alias: data.alias}});
    }
    //发布
    $scope.deploy = function (id) {
        if (!id) return;
        var url = "${form}/bo/def/v1/deploy?id=" + id;
        baseService.get(url, $scope.data).then(function (rep) {
            if (rep && rep.state) {
                dialogService.success(rep.message).then(function () {
                    $scope.dataTable.query();
                });
            }
            else {
                dialogService.fail(rep.message || '发布失败');
            }
        });
    }
    //修改状态
    $scope.setStatus = function (id, status) {
        if (!id) return;
        var url = "${form}/bo/def/v1/setStatus?id=" + id + "&status=" + status;
        baseService.get(url, $scope.data).then(function (rep) {
            if (rep && rep.state) {

                dialogService.success(rep.message).then(function () {
                    $scope.dataTable.query();
                });
            }
            else {
                dialogService.fail(rep.message || '发布失败');
            }
        });
    }
}

function boPreviewCtrl($scope, baseService, dialogService) {
    $scope.detail = function (alias) {
        if (!alias) return;
        var url = "${form}/bo/def/v1/getBoJson?alias=" + alias;
        baseService.get(url).then(function (rep) {
            $scope.json = rep;
        });
    }
    $scope.alias = $scope.pageParam.alias;
    $scope.detail($scope.alias);
    $scope.close=function (){
        dialogService.closeSidebar();
    }

}


function boEditCtrl($scope, baseService, ArrayChangeService, dialogService) {
    $scope.ArrayChange = ArrayChangeService;
    $scope.data = {};
    $scope.data.supportDb = 1;
    $scope.data.status = "normal";
    $scope.data.deployed = 0;
    $scope.data.ents = [];
    $scope.data.isExternal = "0";
    $scope.isAddAttr = $scope.pageParam.action?true:false;//允许增加字段
    $scope.data.dsName = "LOCAL";
    $scope.data.isCreateTable = "0";
    //可以编辑
    $scope.isEditable = true;
    // 当前选中的实体
    $scope.currentEnt = angular.noop();
    $scope.show = true;
    
    
    //添加实体
    $scope.addEnts = function () {
        if(!addEntCheck()){
        	return ;
        }
        var temp = {};
        temp.relation = "onetoone";
        temp.show = "子实体";
        if ($scope.data.ents.length == 0) {
            temp.show = "主实体";
            temp.relation = "main";
        }
        temp.index = $scope.data.ents.length;
        temp.packageId = "";
        temp.name = "";
        temp.desc = "";
        temp.status = "";
        temp.attributeList = [];
        $scope.data.ents.push(temp);
    };
    
    function addEntCheck(){
    	if($scope.data.ents.length>0){
            if($scope.currentEnt.desc==undefined || $scope.currentEnt.desc==""){
                dialogService.fail('实体描述不能为空，请重新输入');
                return false;
            }
            if($scope.currentEnt.name==undefined || $scope.currentEnt.name==""){
                dialogService.fail('实体名称不能为空，请重新输入');
                return false;
            }
            if($scope.currentEnt.attributeList==undefined || $scope.currentEnt.attributeList.length==0){
                dialogService.fail('实体至少需要一个字段');
                return false;
            }else{
                var index=isRepeat($scope.currentEnt.attributeList);
                if(index>0){
                    dialogService.fail($scope.currentEnt.name+'实体中'+'字段属性名称为：'+$scope.currentEnt.attributeList[index].name+"已存在");
                    return false;
                }
                for (var i = 0; i <$scope.currentEnt.attributeList.length ; i++) {
                    var attribute=$scope.currentEnt.attributeList[i];
                    if(attribute.desc=="" || attribute.desc==undefined){
                        dialogService.fail('字段属性中注释不能为空，请重新输入');
                        return false;
                    }else if(attribute.name=="" || attribute.name==undefined){
                        dialogService.fail('字段属性中名称不能为空，请重新输入');
                        return false;
                    }
                }
            }
        }
    	return true;
    }
    
    $scope.addEntExts = function(){
    	if(!addEntCheck()){
        	return ;
        }
    	 var temp = {};
         temp.relation = "onetoone";
         temp.show = "子实体";
         if ($scope.data.ents.length == 0) {
             temp.show = "主实体";
             temp.relation = "main";
         }
         temp.index = $scope.data.ents.length;
         temp.packageId = "";
         temp.name = "";
         temp.desc = "";
         temp.status = "";
         temp.isExternal = "1";
         temp.attributeList = [];
         var param = $.base64.encode(JSON.stringify(temp),"utf-8");
         dialogService.page("form.entExtEdit", {pageParam:param})
         .then(function(result){
             if(result&&result.name){
            	 $scope.data.ents.push(result);
             }
         });
    }

    $scope.detail = function (id) {
        if (!id) return;
        if ($scope.pageParam.action != 'update') {
            $scope.isEditable = false;
        }
        var url = "${form}/bo/def/v1/getJson?id=" + id;
        baseService.get(url).then(function (rep) {
            $scope.isEditable = !rep.deployed;
            $scope.data = rep;
        });
    }
    $scope.id = $scope.pageParam.id;
    $scope.detail($scope.id);


    $scope.close = function () {
        dialogService.closeSidebar();
    }
    $scope.save = function () {
        var url = "${form}/bo/def/v1/save?json=" + $scope.data;
        if($scope.data.description=="" || $scope.data.description==undefined){
            dialogService.fail('描述不能为空，请重新输入');
            return;
        }
        if($scope.data.alias=="" || $scope.data.alias==undefined){
            dialogService.fail('别名不能为空，请重新输入');
            return;
        }
        if($scope.data.categoryId=="" || $scope.data.categoryId==undefined){
            dialogService.fail('请选择分类');
            return;
        }
        if($scope.data.ents==undefined || $scope.data.ents.length==0){
            dialogService.fail('请添加实体');
            return;
        }
        if($scope.currentEnt.desc==undefined || $scope.currentEnt.desc==""){
            dialogService.fail('实体描述不能为空，请重新输入');
            return;
        }
        if($scope.currentEnt.name==undefined || $scope.currentEnt.name==""){
            dialogService.fail('实体名称不能为空，请重新输入');
            return;
        }
        if($scope.currentEnt.attributeList==undefined || $scope.currentEnt.attributeList.length==0){
            dialogService.fail('实体至少需要一个字段');
            return;
        }else{
            var index=isRepeat($scope.currentEnt.attributeList);
            if(index>0){
                dialogService.fail($scope.currentEnt.name+'实体中'+'字段属性名称为：'+$scope.currentEnt.attributeList[index].name+"已存在");
                return;
            }

            for (var i = 0; i <$scope.currentEnt.attributeList.length ; i++) {
                var attribute=$scope.currentEnt.attributeList[i];
                if(attribute.desc==""){
                    dialogService.fail('字段属性中注释不能为空，请重新输入');
                    return;
                }else if(attribute.name==""){
                    dialogService.fail('字段属性中名称不能为空，请重新输入');
                    return;
                }
            }
        }
        for (var i = 0; i <$scope.data.ents.length ; i++) {
            for (var j = 0; j <$scope.data.ents[i].attributeList.length ; j++) {
                $scope.data.ents[i].attributeList[j].isRequired=$scope.data.ents[i].attributeList[j].isRequired==true?1:0;
            }
        }
        baseService.post(url, $scope.data).then(function (rep) {
            if (rep && rep.state) {
                dialogService.success(rep.message).then(function () {
                    dialogService.closeSidebar();
                });
            }
            else {
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }

    // 选择实体事件
    $scope.switchEnt = function (ent) {
        $scope.currentEnt = ent;
    }

    $scope.$watchCollection('data.ents', function (n, o) {
        if (n && n.length > 0) {
            $scope.currentEnt = $scope.data.ents[n.length - 1];
            for (var i = 0; i <$scope.currentEnt.attributeList.length ; i++) {
                $scope.currentEnt.attributeList[i].isRequired=$scope.currentEnt.attributeList[i].isRequired==1?true:false;
            }
        }
    });

    /**
     * 修改数据类型。
     */
    $scope.changeDbType = function(row) {
        var type = row.dataType;
        switch (type) {
            case "number":
                row.attrLength = 10;
                row.decimalLen = 0;
                break;
            case "varchar":
                row.attrLength = 50;
                break;
            case "date":
                row.format = "yyyy-MM-dd HH:mm:ss";
                break;
            default:
                row.attrLength = 0;
                row.decimalLen = 0;
                break;
        }
    }
    $scope.judgeLength=function (row) {
        var type = row.dataType;
        if(type=='number' && row.attrLength>10){
            dialogService.fail( '数字型整数长度部允许超过10');
            row.attrLength=10;
            $scope.apply();
        }
    }

    function isRepeat(arr){
        var hash = {};
        for (var i = 0; i <arr.length ; i++) {
            if(hash[arr[i].name])
                return i;
            hash[arr[i].name] = true;
        }
        return -1;
    }
    /**
     * 添加一条新字段属性
     */
    $scope.addAttr = function () {
    	if(!$scope.currentEnt){
    		dialogService.warn("需要先添加或选中一个实体");
    		return;
    	}
        for (var i = 0; i <$scope.currentEnt.attributeList.length ; i++) {
            var attribute=$scope.currentEnt.attributeList[i];
            if(attribute.desc=="" || attribute.desc==undefined){
                dialogService.fail('字段属性中注释不能为空，请重新输入');
                return;
            }else if(attribute.name=="" || attribute.name==undefined){
                dialogService.fail('字段属性中名称不能为空，请重新输入');
                return;
            }
        }
        if($scope.currentEnt.attributeList.length>0){
            var index=isRepeat($scope.currentEnt.attributeList);
            if(index>0){
                dialogService.fail($scope.currentEnt.name+'实体中'+'字段属性名称为：'+$scope.currentEnt.attributeList[index].name+"已存在");
                return;
            }
        }


        var temp = {};
        temp.desc = "";
        temp.isRequired = false;
        temp.dataType = "varchar";
        temp.attrLength = "50";
        temp.isNew = true;
        $scope.currentEnt.attributeList.push(temp);
    };


    $scope.dialogDetail = function () {
        /*dialogService.page("bo-selector", {pageParam:{id:1}})
         .then(function(result){
             dialogService.msg("回传的数据:" + JSON.stringify(result));
         });*/
    }

}

function boEntExtEditCtrl($scope, baseService, dialogService, $state){
	$scope.data =  parseToJson($.base64.decode($scope.pageParam,"utf-8"));
	baseService.get("${portal}/sys/sysDataSource/v1/getDataSources").then(function (data) {
        $scope.dataSourcesInBean = data;
    });
	
	/**
	 * 获取外部数据源的表
	 */
	$scope.getExternalTable = function(){
		if(!$scope.data.dsName){
			dialogService.warn("请选择数据源！");
			return ;
		}
		var rtn=baseService.post('${form}/form/customQuery/v1/getByDsObjectName',{dsalias:$scope.data.dsName,isTable:"1",objName:$scope.data.tableName});
		rtn.then(function(data){
			dialogService.warn("查询成功，请选择外部表！");
  		  	$scope.externalTable= data;
  		  	$scope.data.tableName="";
		});
	};
	
	
	/**
	 * 获取外部数据源的表
	 */
	$scope.tableChange = function(){
		if(!$scope.data.tableName){
			return;
		}
		
		var rtn=baseService.post('${form}/form/customQuery/v1/getTable',{dsalias:$scope.data.dsName,isTable:"1",objName:$scope.data.tableName});
		rtn.then(function(data){
			if(!data){
				return;
			}
			if(data.table.primayKey.length==0){
				dialogService.fail("该表无主键!");
				return;
			}
			$scope.data.pk = data.table.primayKey[0]["fieldName"];
			var pkType = data.table.primayKey[0]["columnType"];
			//主键类型不是字符串就是数字
			if(pkType.indexOf("varchar")>=0){
				$scope.data.pkType="varchar";
			}else{
				$scope.data.pkType="number";
			}
			$scope.data.attributeList=[];//重置字段
			//拼装成字段
			$(data.table.columnList).each(function(){
				if(this.isPk) return;//主键不展示
				
				var attr = {};
				attr.desc = this.comment;
				attr.name = this.fieldName;
				attr.fieldName = this.fieldName;
				attr.isRequired = this.isNull?"0":"1";
				attr.dataType = this.columnType;
				if(this.columnType=="number"){
					attr.attrLength = this.intLen;
					attr.decimalLen = this.decimalLen;
				}else{
					attr.attrLength = this.charLen;
				}
				
				attr.defaultValue = this.defaultValue;
				attr.fcolumnType = this.fcolumnType;
				$scope.data.attributeList.push(attr);
			});
			
		});
	};
	
	$scope.pageSure = function(){
		if(!$scope.data.name){
			dialogService.fail("名称必填!");
			return ;
		}
		if(!$scope.data.desc){
			dialogService.fail("描述必填!");
			return ;
		}
		return $scope.data;
	}
	
}


function paramDialogCtrl($scope) {
    if ($scope.pageParam) {
        $scope.param = $scope.pageParam.param;
    }
    $scope.pageSure = function () {
        var mapParam = {};
        var urlParam = "";
        $("[name]").each(function () {
            var val = $(this).val();
            var name = $(this).attr("name");
            if (!val) {
                return;
            }
            if (urlParam) {
                urlParam += "&";
            }
            urlParam += name + "=" + val;
            mapParam[$(this).attr("name")] = val;
        });
        return mapParam;
    }
}

//自定义对话框列表页面
function customDialogListCtrl($scope, dialogService, $state, baseService) {
    $scope.preview = function (alias) {
        var url = '${form}/form/customDialog/v1/getByAlias?alias=' + alias;
        baseService.get(url).then(function (customDialog) {
        	//if(customDialog.dsType=='dataSource'){
        		var list = JSON.parse(customDialog.conditionfield);
                var param = {};
                $(list).each(function () {
                    if (this.defaultType == "4") {
                        param[this.field] = this.comment;
                    }
                });
                if ($.isEmptyObject(param)) {//没有动态传入的字段
                    if (customDialog.style == 0) {
                        dialogService.page('customDialogShow', {
                            alwaysClose: false,
                            pageParam: {alias: alias, customDialog: customDialog}
                        }).then(function (r) {
                            dialogService.msg("回传的数据:" + JSON.stringify(r.result));
                            dialogService.close(r.index);
                        });
                    } else {
                        dialogService.page('customDialogShowTree', {
                            alwaysClose: false,
                            pageParam: {alias: alias, customDialog: customDialog}
                        }).then(function (r) {
                            dialogService.msg("回传的数据:" + JSON.stringify(r.result));
                            dialogService.close(r.index);
                        });
                    }
                } else {
                    dialogService.page('paramDialog', {alwaysClose: false, pageParam: {param: param}}).then(function (rs) {
                        dialogService.close(rs.index);
                        if (customDialog.style == 0) {
                            dialogService.page('customDialogShow', {
                                alwaysClose: false,
                                pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
                            }).then(function (r) {
                                dialogService.msg("回传的数据:" + JSON.stringify(r.result));
                                dialogService.close(r.index);
                            });
                        } else {
                            dialogService.page('customDialogShowTree', {
                                alwaysClose: false,
                                pageParam: {alias: alias, customDialog: customDialog, param: rs.result}
                            }).then(function (r) {
                                dialogService.msg("回传的数据:" + JSON.stringify(r.result));
                                dialogService.close(r.index);
                            });
                        }
                    });
                }
//        	}else{
//        		
//        	}
            
        });
    }

    $scope.edit = function (id) {
        $state.go("form.customDialogEdit", {id: id});
    }
}
//自定义对话框编辑页面
function customDialogEditCtrl($scope, baseService, dialogService, $stateParams, $state) {
    $scope.yesOrNoList = [
        {
            key: '是',
            value: true
        },
        {
            key: "否",
            value: false
        }
    ];
    $scope.isTableList = [{
        key: '视图',
        value: 0
    }, {
        key: "表",
        value: 1
    }];
    $scope.prop = {};// 初始化，设置默认值
    $scope.prop.id = "";
    $scope.prop.style = 0;
    $scope.prop.width = 800;
    $scope.prop.height = 600
    $scope.prop.needPage = 1;
    $scope.prop.pageSize = 10;
    $scope.prop.selectNum = 1;
    $scope.prop.system = false;
    $scope.prop.isTable = 1;
    $scope.prop.dsType = "dataSource";
    $scope.prop.dsalias = "LOCAL";// 本地数据源
    $scope.tableOrViewList = [];
    var id = $stateParams.id;

    $scope.detail = function (id) {
        if (!id) return;
        var url = "${form}/form/customDialog/v1/getById?id=" + id;
        baseService.get(url).then(function (data) {
            $scope.prop = data;
            $scope.prop.displayfield = JSON.parse(data.displayfield);
            $scope.prop.resultfield = JSON.parse(data.resultfield);
            $scope.prop.sortfield = JSON.parse(data.sortfield);
            $scope.prop.conditionfield = JSON.parse(data.conditionfield);
        });
    }
    $scope.detail($stateParams.id);

    // 获取数据源池，新建才可以选择
    if (id == undefined || id == "") {
        $scope.prop.id = "";
        var url = "";
        baseService.get("${portal}/sys/sysDataSource/v1/getDataSources").then(function (data) {
            $scope.dataSourcesInBean = data;
        });
    }
    $scope.close = function () {
        $state.go("form.customDialogList");
    }
    $scope.save = function () {
        if ($scope.prop.needPage == 0) {
            $scope.prop.needPage = false;
        } else {
            $scope.prop.needPage = true;
        }
        if($scope.prop.dsType=='dataSource'&&$scope.prop.id==""){
            if($scope.prop.objName==undefined){
                dialogService.fail("请设置表或视图");
                return;
            }
        }
        if($scope.prop.dsType=='restful'&&!$scope.prop.url){
        	 dialogService.fail("请设置接口地址");
             return;
        }
        if($scope.prop.displayfield==undefined||$scope.prop.displayfield.length==0){
            dialogService.fail("请设置需要显示的字段");
            return;
        }
        if($scope.prop.dsType!='dataSource'){
        	$scope.prop.dsalias = "";
        }
        var url = "${form}/form/customDialog/v1/save?json=" + $scope.prop;
        baseService.post(url, $scope.prop).then(function (rep) {
            if (rep && rep.state) {
                dialogService.success(rep.message).then(function () {
                    $state.go("form.customDialogList");
                });
            }
            else {
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }

    // 获取表或视图列表
    $scope.getByDsObjectName = function () {
        if ($scope.prop.dsalias == null) {
            dialogService.fail("请选择数据源");
            return;
        }
        $scope.params = {};
        $scope.params.dsalias = $scope.prop.dsalias;
        $scope.params.isTable = $scope.prop.isTable;
        $scope.params.objName = $scope.objName;

        var url = "${form}/form/customQuery/v1/getByDsObjectName";
        baseService.post(url, $scope.params).then(function (data) {
            if (!data || data.length == 0) {
                dialogService.fail('该数据源中未查询到表或视图');
            }
            $scope.tableOrViewList = data;
            if ($scope.tableOrViewList[0])
                $scope.prop.objName = $scope.tableOrViewList[0].name;
        });

    }


    $scope.showSettingDialog = function () {
        if ($scope.prop.dsType=='dataSource'&&$scope.prop.objName == null) {
            dialogService.fail('请选择目标表或视图');
        }
            var title = "未命名";
            if ($scope.prop.name != null) {
                title = '' + $scope.prop.name + "-设置列";
            }
            dialogService.sidebar("form.customDialogListSetting", {
                bodyClose: false,
                width: '80%',
                pageParam: {title: title, prop: $scope.prop}
            });
    }

    //参数设置
	$scope.showSetParamDialog = function(){
		dialogService.page('dialogParamSet', {
            alwaysClose: false,
            area: ['500px', '320px'],
            pageParam: {dataParam: $scope.prop.dataParam}
        }).then(function (r) {
        	layer.close(r.index);
        	$scope.prop.dataParam = r.result=="{}"?"":r.result;
        });
	}

}


function customDialogParamSetCtrl($scope){
	$scope.dataParam = $scope.pageParam.dataParam;
	$scope.pageSure = function(){
		return $scope.dataParam?$scope.dataParam:"{}";
	}
}


//自定义对话框设置字段页面
function customDialogSettingCtrl($scope, dialogService, baseService, ArrayChangeService) {
    $scope.prop=$scope.pageParam.prop;
    $scope.tabStatus =$scope.prop.style!=undefined?'display':'condition';
    $scope.customVar="";
    $scope.ArrayChange = ArrayChangeService;
    $scope.switchTabStatus = function(status){
        $scope.tabStatus = status;
    }
    $scope.exitCustomDialogList=[];

    $scope.exitSelectorList=[];
    $scope.close=function(){
        dialogService.closeSidebar();
    }
    //保存按钮
    $scope.save=function(){
        for(var i in $scope.prop.conditionfield){
            var column = $scope.prop.conditionfield[i];
            if(column.dbType=='date'&&column.condition=='BETWEEN'){
                column.defaultValue+="|"+column.endDate;
                delete column.endDate;
            }
        }
        if($scope.prop.sortfield&&$scope.prop.sortfield.length>3){
            dialogService.fail("您添加的排序字段太多，最多只能添加3个排序字段！");
            return ;
        }
        var s=$scope.prop;
        dialogService.closeSidebar();//关闭窗口
    }

    //全选和反选
    $scope.TotalSelection=function(){
    	var checkboxe = document.getElementById("checkboxId");
    	var checkboxes = document.getElementsByName("checkboxName");
		for (var i = 0; i < checkboxes.length; i++) {
            if(checkboxe.checked==true){
            	$scope.table.columnList[i].selected=true;
            }else{
                $scope.table.columnList[i].selected=false;
            }
        }

    }

    if($scope.prop.dsType=='dataSource'){
    	var params = {
	        dsalias:$scope.prop.dsalias,
	        isTable:$scope.prop.isTable,
	        objName:$scope.prop.objName
	    };
    	var url="${form}/form/customQuery/v1/getTable";
        baseService.post(url,params).then(function(data){
            $scope.table=data.table;

        });
    }
    
    //获取系统已有自定义对话框列表
    $scope.getAll=function(){
        var url="${form}/form/customDialog/v1/getAll";
        baseService.post(url,params).then(function(data){
            for(var i=0;i<data.length;i++){
                var cd = data[i];
                cd.id=cd.id;
                cd.displayfield=JSON.parse(cd.displayfield);
                cd.resultfield=JSON.parse(cd.resultfield);
                if(cd.resultfield==null)continue;
                for(var j=0;j<cd.resultfield.length;j++)
                {
                    cd.resultfield[j].field=cd.resultfield[j].comment;
                }
                cd.sortfield=JSON.parse(cd.sortfield);
                cd.conditionfield=JSON.parse(cd.conditionfield);
                $scope.exitCustomDialogList.push(cd);
            }

        });
    }
   
    
    //获取系统已有的选择器
    $scope.getSelectorAll=function(){
        var url="${form}/form/selectorDef/v1/getAll";
        /*baseService.get(url,params).then(function(data){
            for(var i=0;i<data.length;i++){
                var cd ={};
                cd.id=data[i].id;
                cd.resultfield=[];
                cd.name=data[i].name;
                cd.alias=data[i].alias;
                var groupField=JSON.parse(data[i].groupField);
                for(var j=0;j<groupField.length;j++)
                {
                    var item={field:groupField[j].name,comment:groupField[j].key};
                    cd.resultfield.push(item);
                }
                $scope.exitSelectorList.push(cd);
            }
        });*/

    }
    if($scope.prop.dsType=='dataSource'){
    	$scope.getAll();
    	$scope.getSelectorAll();
    }
    
    if($scope.prop.sqlBuildType==null) $scope.prop.sqlBuildType=0;
    $scope.prop.sqlBuildType=$scope.prop.sqlBuildType+"";

    $scope.addColumns=function(){
        if($scope.prop.displayfield==null&&$scope.prop.style=='0'){
            $scope.prop.displayfield=[];
        }
        if($scope.prop.displayfield==null&&$scope.prop.style=='1'){
            $scope.prop.displayfield={};
        }
        if($scope.prop.conditionfield==null){
            $scope.prop.conditionfield=[];
        }
        if($scope.prop.resultfield==null){
            $scope.prop.resultfield=[];
        }
        if($scope.prop.sortfield==null){
            $scope.prop.sortfield=[];
        }

        //检查是否选择了列
        for(var i in $scope.table.columnList){
            var c = $scope.table.columnList[i];
            if(c.selected)break;
            if(i==$scope.table.columnList.length-1){
                if(i==$scope.table.columnList.length-1){
                    dialogService.fail('请选择左边的列');
                }
            }
        }
        if($scope.tabStatus == 'display'){
            for(var i in $scope.table.columnList){
                var c = $scope.table.columnList[i];
                if(!c.selected) continue;
                var column = {};
                column.field=c.fieldName;
                column.comment=c.comment;
                column.nameKey="0";
                if($scope.prop.style=='0'){
                    $scope.prop.displayfield.push(column);
                }else if($scope.prop.style=='1'){
                    eval("$scope."+$scope.activeModelStr+"='"+c.fieldName+"'");
                }
            }
        }else if($scope.tabStatus == 'condition'){
            for(var i in $scope.table.columnList){
                var c = $scope.table.columnList[i];
                if(!c.selected) continue;
                var column = {};
                column.field=c.fieldName;
                column.comment=c.comment;
                column.condition='EQ';
                column.dbType=c.columnType;
                column.defaultType='2';
                column.defaultValue='';
                $scope.prop.conditionfield.push(column);
            }
            //去除重复项
            $scope.prop.resultfield.unique(function(a,b){
                return a.field==b.field;
            });
        }else if($scope.tabStatus == 'return'){
            for(var i in $scope.table.columnList){
                var c = $scope.table.columnList[i];

                if(!c.selected) continue;
                var column = {};
                column.field=c.fieldName;
                column.comment=c.fieldName;
                column.idKey="0";
                column.AggFuncOp='';//合计函数运算符

                $scope.prop.resultfield.push(column);
            }
            //去除重复项
            $scope.prop.resultfield.unique(function(a,b){
                return a.field==b.field;
            });
        }else if($scope.tabStatus == 'order'){
            for(var i in $scope.table.columnList){
                var c = $scope.table.columnList[i];
                if(!c.selected) continue;
                var column = {};
                column.field=c.fieldName;
                column.sortType="asc";

                $scope.prop.sortfield.push(column);
            }
            //去除重复项
            $scope.prop.sortfield.unique(function(a,b){
                return a.field==b.field;
            });
        }
    }
    
    $scope.addFields=function(){
    	if(!$scope.table){
    		$scope.table = {columnList:[]};
    	}
    	 var column = {};
         column.field = "";
         column.comment = "";
         column.columnType = "varchar";
         $scope.table.columnList.push(column);
    }

    //运算条件数组-number
    $scope.number_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"大于等于",
            value:'GE'
        },
        {
            key:"大于",
            value:'GT'
        },
        {
            key:"小于",
            value:'LT'
        },
        {
            key:"小于等于",
            value:'LE'
        },
        {
            key:"in",
            value:'IN'
        }
    ];

    //运算条件数组-varchar
    $scope.string_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"like",
            value:'LK'
        },
        {
            key:"likeEnd",
            value:'LFK'
        },
        {
            key:"in",
            value:'IN'
        }
    ];

    //运算条件数组-日期
    $scope.date_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"between",
            value:'BETWEEN'
        },
        {
            key:"大于等于",
            value:'GE'
        },
        {
            key:"小于等于",
            value:'LE'
        }
    ];

    //值来源数组_列表
    $scope.value_sourceList_list=[
        {
            key:'参数传入',
            value:'1'
        },
        {
            key:"固定值",
            value:'2'
        },
        {
            key:"脚本",
            value:'3'
        },
        {
            key:"动态传入",
            value:'4'
        },
        {
            key:"可选条件",
            value:'7'
        }
    ];

    //值来源数组_树
    $scope.value_sourceList_tree=[
        {
            key:"固定值",
            value:'2'
        },
        {
            key:"脚本",
            value:'3'
        },
        {
            key:"动态传入",
            value:'4'
        }
    ];
    
    if($scope.prop.dsType!='dataSource'){
    	//值来源数组_列表
        $scope.value_sourceList_list=[
            {
                key:'参数传入',
                value:'1'
            },
            {
                key:"固定值",
                value:'2'
            }
        ];

        //值来源数组_树
        $scope.value_sourceList_tree=[
            {
                key:"固定值",
                value:'2'
            }
        ];
        
    }

    //排序字段升序还是降序
    $scope.sort_typeList=[
        {
            key:'升序',
            value:'asc'
        },
        {
            key:'降序',
            value:'desc'
        }
    ];

    //控制器的类型
    $scope.param_ctList=[
        {
            key:'自定义对话框',
            value:'0'
        },
        {
            key:'单行文本框',
            value:'1'
        },
        {
            key:'控件选择器',
            value:'2'
        }
    ];
    $scope.changeCt=function(column){
        if(column.controllerType==0||column.controllerType==2){
            column.customDialogCt={};
        }else{
            delete column.customDialogCt;
        }
    }

    $scope.changeCustomDiaologCt=function(column){
        var theData=$scope.exitCustomDialogList;
        if(column.controllerType==2){
            theData=$scope.exitSelectorList;
        }
        for(var i=0;i<theData.length;i++){
            var cd = theData[i];
            if(cd.id==column.customDialogCt.id){
                column.customDialogCt.resultfield=cd.resultfield;
                column.customDialogCt.width=cd.width;
                column.customDialogCt.height=cd.height;
                column.customDialogCt.name=cd.name;
                column.customDialogCt.alias=cd.alias;
                return;
            }

        }
    }

    //选择自定义sql常用脚本
    $scope.selectScript_diySql = function(){
        dialogService.page('script-selector', {alwaysClose: false}).then(function(r){
            if(!$scope.prop.diySql) $scope.prop.diySql="";
            var result=r.result;
            for(var i=0;i<result.length;i++){
                $scope.prop.diySql+=result[i].script;
            }
            dialogService.close(r.index);
        });
    };

    //选择条件字段时脚本sql常用脚本
    $scope.selectScript_column = function(column){
        dialogService.page('script-selector', {alwaysClose: false}).then(function(r){
            if(!column.defaultValue) column.defaultValue="";
            var result=r.result;
            for(var i=0;i<result.length;i++){

                column.defaultValue+=result[i].script;
            }
            dialogService.close(r.index);
        });
    };

    //选择回填相关的nameKey
    $scope.selectNameKey = function(column){
        $($scope.prop.displayfield).each(function(){
            this.nameKey="0";
        });
        column.nameKey="1";
    };

    //选择回填相关的idKey
    $scope.selectIdKey = function(column){
        $($scope.prop.resultfield).each(function(){
            this.idKey="0";
        });
        column.idKey="1";
    };

    $scope.selectVar = function(customVar){
        if(!$scope.prop.diySql){
            $scope.prop.diySql = "";
        }
        $scope.prop.diySql += " " +customVar;
    }
}
//自定义对话框列表数据查看
function customDialogShowListCtrl($scope, $compile) {
    $scope.SelectArr = [];
    $scope.mapParam = "";
    $scope.conditionParams = [];
    if ($scope.pageParam) {
        if ($scope.pageParam.param != undefined && $scope.pageParam.param != "") {
            var mapParams = JSON.stringify($scope.pageParam.param);
            $scope.mapParam = mapParams.substring(1, mapParams.length - 1);
        }
        $scope.customDialog = $scope.pageParam.customDialog;
        $scope.requestType = $scope.customDialog.requestType?$scope.customDialog.requestType:'POST';
        var conditionfield = JSON.parse($scope.customDialog.conditionfield);
        $scope.conditionParams=conditionfield;
        $scope.comment = "";
        $scope.value = "";
        $scope.showPage = $scope.customDialog.needPage;
        $scope.pageParam.single = $scope.customDialog.selectNum == 1;
        if(conditionfield!=null){
            for (var i = 0; i < conditionfield.length; i++) {
                if (conditionfield[i].defaultType == 1) {
                    $scope.comment = $scope.comment + conditionfield[i].comment + ",";
                    $scope.value = $scope.value + conditionfield[i].field + ",";
                }
            }
        }
        if ($scope.comment != "") $scope.comment = $scope.comment.substring(0, $scope.comment.length - 1);
        if ($scope.value != "") $scope.value = $scope.value.substring(0, $scope.value.length - 1);
        //显示的字段
        $scope.displayfield = JSON.parse($scope.customDialog.displayfield);
        if($scope.customDialog.dsType=='dataSource'){
        	for (var i = 0; i < $scope.displayfield.length; i++) {
                $scope.displayfield[i].field = $scope.displayfield[i].field.toUpperCase();
            }
        }
        $scope.alias = $scope.pageParam.alias;
        $scope.queryUrl = $scope.customDialog.dsType=='dataSource'?'${form}/form/customDialog/v1/getListData?alias='+$scope.alias+'&mapParam='+$scope.mapParam:$scope.customDialog.url;
        $scope.htSelectEvent = function (data) {
        	var pk = getIdField(data);
            if (data.isSelected) {
                $scope.SelectArr.push(data);
                $scope.SelectArr.unique(function (x, y) {
                    return pk?x[pk]==y[pk] : $.base64.encode(JSON.stringify(x)) == $.base64.encode(JSON.stringify(y));
                });
                if ($scope.pageParam.single) {
                    angular.forEach($scope.SelectArr, function (item) {
                        if (pk? item[pk]!=data[pk] : $.base64.encode(JSON.stringify(item)) != $.base64.encode(JSON.stringify(data))) {
                            $scope.removeSelectedArr('SelectArr', item);
                        }
                    });
                }
            } else {
                // remove
                data.isSelected = true;
                $scope.SelectArr.remove(data);
                data.isSelected = false;
            }
        }

        $scope.removeSelectedArr = function (arr, obj) {
            $scope[arr].remove(obj);
            $scope.customDialogDataTable.unSelectRow(obj);
        }

    }
    
    //获取数据中的主键字段，如果有定义中的字段，则以定义的为主键，如果没有，则取第一个属性作为主键
    function getIdField(data){
    	var pk = '';
    	var pkArray = ['id_','ID_','id','ID'];
    	for (var i = 0; i < pkArray.length; i++) {
			if(data[pkArray[i]]){
				pk = pkArray[i];
				break;
			}
		}
    	return pk;
    }
    // 响应对话框的确定按钮，并返回值到父页面

    $scope.pageSure = function () {
        var returnStr = JSON.parse($scope.customDialog.resultfield);
        //拿到返回的字段
        var field = new Array([returnStr.length]);
        var comment = new Array([returnStr.length]);
        var str = [];
        for (var i = 0; i < returnStr.length; i++) {
            field[i] = $scope.customDialog.dsType=='dataSource'?returnStr[i].field.toUpperCase():returnStr[i].field;
            comment[i] = $scope.customDialog.dsType=='dataSource'?returnStr[i].comment.toUpperCase():returnStr[i].comment;
        }
        var s = $scope.customDialogDataTable.selectRow();
        if ($scope.pageParam.single) {
            var temp = "";
            for (var i = 0; i < comment.length; i++) {
                temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
            }
            if (temp != "") {
                temp = "{" + temp.substring(0, temp.length - 1) + "}";
            }
            str.push(JSON.parse(temp));
        } else {
            for (var i = 0; i < s.length; i++) {
                var temp = "";
                for (var j = 0; j < comment.length; j++) {
                    temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
                }
                if (temp != "") {
                    temp = "{" + temp.substring(0, temp.length - 1) + "}";
                }
                str.push(JSON.parse(temp));
            }
        }

        return str;
    }
}
//自定义对话框树形数据查看
function customDialogShowTreeCtrl($scope, baseService) {
    var name = "";
    var customDialog = {};
    if ($scope.pageParam) {
        $scope.alias = $scope.pageParam.alias;
        customDialog = $scope.pageParam.customDialog;
        var resourcesTree;
        var isMulti = false;
        var idKey = JSON.parse(customDialog.displayfield).id;
        var pIdKey = JSON.parse(customDialog.displayfield).pid;
        name = JSON.parse(customDialog.displayfield).displayName;
        if (customDialog.selectNum != 1) {// 多选
            isMulti = true;
            var str = "";
            if (customDialog.parentCheck == 1) {
                str += "p";
            }
            if (customDialog.childrenCheck == 1) {
                str += "s";
            }
        }
        var setting = {
            data: {
                key: {
                    name: name,
                    title: name
                },
                simpleData: {
                    enable: true,
                    idKey: idKey,
                    pIdKey: pIdKey,
                    rootPId: -1
                }
            },
            view: {
                selectedMulti: isMulti,
                showIconFont: true
            },
            check: {
                enable: isMulti,
                chkboxType: {"Y": str, "N": str}
            },
            callback: {
                onClick: zTreeOnClick
            }
        };
        var mapParam = "";
        if ($scope.pageParam.param != undefined) {
            mapParam = JSON.stringify($scope.pageParam.param);
            mapParam = mapParam.substring(1, mapParam.length - 1);
        }
        var requestType = customDialog.dsType=='dataSource'?'GET':customDialog.requestType?customDialog.requestType:'POST';
        var url = "${form}/form/customDialog/v1/getTreeData?alias=" + $scope.alias + "&mapParam=" + mapParam;
        var paramsObj = {};
        if(customDialog.dsType!='dataSource'){
        	url = customDialog.url;
        	var templatePa = customDialog.dataParam;
        	if(customDialog.conditionfield){
        		var conditions = parseToJson(customDialog.conditionfield);
        		for (var i = 0; i < conditions.length; i++) {
					var con = conditions[i];
					if(requestType == 'POST'){
						if(templatePa){
							templatePa = templatePa.replace(new RegExp("\\{"+con.field+"\\}","g"), con.defaultValue);
						}else{
							paramsObj[con.field] = con.defaultValue;
						}
					}else{
						var ljChar = url.indexOf('?')==-1?'?':'&';
						url = url + ljChar + con.field + '=' + con.defaultValue;
					}
				}
        		if(templatePa){
        			paramsObj = parseToJson(templatePa);
        		}
        	}
        }
        var query = requestType == 'POST'?baseService.post(url,paramsObj):baseService.get(url);
        query.then(function (result) {
            resourcesTree = $.fn.zTree.init($("#resourcesTree"), setting, eval(result));
        });

        function zTreeOnClick() {
            var treeObj = $.fn.zTree.getZTreeObj("resourcesTree");
            var nodes = treeObj.getSelectedNodes();
        }
    }
    $scope.pageSure = function () {
        var treeObj = $.fn.zTree.getZTreeObj("resourcesTree");
        var returnStr = JSON.parse(customDialog.resultfield);
        var field = new Array([returnStr.length]);
        var comment = new Array([returnStr.length]);
        var str = [];
        for (var i = 0; i < returnStr.length; i++) {
            field[i] = returnStr[i].field;
            comment[i] = returnStr[i].comment;
        }
        if (!isMulti) {
            var nodes = treeObj.getSelectedNodes()[0];
            var temp = "";
            for (var i = 0; i < comment.length; i++) {
                temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
            }
            if (temp != "") {
                temp = "{" + temp.substring(0, temp.length - 1) + "}";
            }
            str.push(JSON.parse(temp));
        } else {
            var nodes = resourcesTree.getCheckedNodes(true);
            $.each(nodes, function (i, n) {
                var temp = "";
                for (var i = 0; i < comment.length; i++) {
                    temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
                }
                if (temp != "") {
                    temp = "{" + temp.substring(0, temp.length - 1) + "}";
                }
                str.push(JSON.parse(temp));
            });
        }
        return str;

    }

}


//自定义查询列表
function customQueryListCtrl($scope, dialogService, $state, baseService) {
    $scope.edit = function (id) {
        $state.go("form.customQueryListEdit", {id: id});
    }
    $scope.preview = function (id) {
        var url = '${form}/form/customQuery/v1/getById?id=' + id;
        baseService.get(url).then(function (customQuery) {
            dialogService.page('customQueryShow', {
                alwaysClose: false,
                pageParam: {customQuery: customQuery}
            }).then(function (r) {

            });
        });
    }
}
//自定义查询预览
function  customQueryShowCtrl($scope,baseService) {
    $scope.querydata = {};
    $scope.prop=$scope.pageParam.customQuery;
    if(! $scope.prop.conditionfield) $scope.prop.conditionfield="[]";
    $scope.prop.conditionfield=JSON.parse($scope.prop.conditionfield);
    for(var i in $scope.prop.conditionfield){
        var c = $scope.prop.conditionfield[i];
        if(c.defaultType!='1'){
            continue;
        }
        c.defaultValue='';//置空
        $scope.querydata[c.field] = "";
    }
    $scope.search=function () {
    	var requestType = $scope.prop.requestType?$scope.prop.requestType:'POST';
    	var url = "${form}/form/customQuery/v1/doQuery?alias="+$scope.prop.alias+"&page=1";
    	if($scope.prop.dsType!='dataSource'){
    		url = $scope.prop.url;
    	}
        var querydata = [];
        var templatePa = $scope.prop.dataParam || "";
        //获取参数输入
        for(var i=0; i<$scope.prop.conditionfield.length; i++){
            var column = $scope.prop.conditionfield[i];
            if(requestType=='POST'){
            	if(($scope.prop.dsType=='dataSource'&&column.defaultType=='1')||($scope.prop.dsType!='dataSource'&&!templatePa)){
            		var param = {};
                    param.key=column.field;
                    param.value="";
                    param.value=column.defaultValue;
                    if(column.condition=='BETWEEN'&&column.endDate!=null){
                        param.value+="|"+column.endDate;
                    }
                    querydata.push(param);
            	}else{
					templatePa = templatePa.replace(new RegExp("\\{"+column.field+"\\}","g"), column.condition=='BETWEEN'&&column.endDate!=null?column.defaultValue+"|"+column.endDate:column.defaultValue);
            	}
        	}else{
        		var ljChar = url.indexOf('?')==-1?'?':'&';
        		var value = column.condition=='BETWEEN'&&column.endDate!=null?(column.defaultValue+"|"+column.endDate):column.defaultValue;
        		url = url + ljChar + column.field +'='+value;
        	}
        }
        if(templatePa){
        	querydata = parseToJson(templatePa); 
        }
        var query = requestType=='POST'?baseService.post(url,JSON.stringify(querydata)):baseService.get(url);
        query.then(function (data) {
        	$scope.tableOrViewList = {};
        	if(data.constructor==Array){
        		$scope.tableOrViewList.rows = data;
        	}else if(data.constructor==Object){
        		if(!data.rows){
        			$scope.customQueryData = data;
        			$scope.tableOrViewList.rows = eval("($scope.customQueryData." + $scope.prop.listKey +")");
        		}else{
        			$scope.tableOrViewList = data;
        		}
        	}
        });
    }
}
//自定义查询编辑
function customQueryEditCtrl($scope, dialogService, $state, baseService, $stateParams) {
    $scope.yesOrNoList = [
        {
            key: '是',
            value: true
        },
        {
            key: "否",
            value: false
        }
    ];
    $scope.isTableList = [{
        key: '视图',
        value: 0
    }, {
        key: "表",
        value: 1
    }];
    $scope.prop = {};// 初始化，设置默认值
    $scope.prop.id = "";
    $scope.prop.needPage = 1;
    $scope.prop.pageSize = 10;
    $scope.prop.selectNum = 1;
    $scope.prop.system = false;
    $scope.prop.isTable = 1;
    $scope.prop.dsType = "dataSource";
    $scope.prop.dsalias = "LOCAL";// 本地数据源
    $scope.prop.sqlBuildType="0";
    $scope.tableOrViewList = [];
    var id = $stateParams.id;


    $scope.showSettingDialog = function () {
        if ($scope.prop.dsType=='dataSource'&&$scope.prop.objName == null) {
            dialogService.fail('请选择目标表或视图');
            return;
        }
        var title = "未命名";
        if ($scope.prop.name != null) {
            title = '' + $scope.prop.name + "-设置列";
        }
        dialogService.sidebar("form.querySetting", {
            bodyClose: false,
            width: '80%',
            pageParam: {title: title, prop: $scope.prop}
        });
    }
    
    //参数设置
	$scope.showSetParamDialog = function(){
		dialogService.page('dialogParamSet', {
            alwaysClose: false,
            area: ['500px', '320px'],
            pageParam: {dataParam: $scope.prop.dataParam}
        }).then(function (r) {
        	layer.close(r.index);
        	$scope.prop.dataParam = r.result=="{}"?"":r.result;
        });
	}

    $scope.getByDsObjectName = function () {
        if ($scope.prop.dsalias == null) {
            dialogService.fail("请选择数据源");
            return;
        }
        $scope.params = {};
        $scope.params.dsalias = $scope.prop.dsalias;
        $scope.params.isTable = $scope.prop.isTable;
        $scope.params.objName = $scope.prop.objName;
        var url = "${form}/form/customQuery/v1/getByDsObjectName";
        baseService.post(url, $scope.params).then(function (data) {
            if (!data || data.length == 0) {
                dialogService.fail('该数据源中未查询到表或视图');
            }
            $scope.tableOrViewList = data;
        });

    }
    $scope.detail = function (id) {
        if (!id) return;
        var url = "${form}/form/customQuery/v1/getById?id=" + id;
        baseService.get(url).then(function (data) {
            $scope.prop = data;
            $scope.prop.resultfield = JSON.parse(data.resultfield);
            $scope.prop.sortfield = JSON.parse(data.sortfield);
            $scope.prop.conditionfield = JSON.parse(data.conditionfield);
        });
    }
    $scope.detail($stateParams.id);

    // 获取数据源池，新建才可以选择
    if (id == undefined || id == "") {
        $scope.prop.id = "";
        var url = "";
        baseService.get("${portal}/sys/sysDataSource/v1/getDataSources").then(function (data) {
            $scope.dataSourcesInBean = data;
        });
    }
    $scope.close = function () {
        $state.go("form.customQueryList");
    }
    if($scope.prop.dsType!='dataSource'){
    	$scope.prop.dsalias = "";
    }
    $scope.save = function () {
        if($scope.prop.dsType=='dataSource'&& ($scope.prop.id=="" || $scope.prop.id==undefined)){
            if($scope.tableOrViewList==undefined||$scope.tableOrViewList.length==0){
                dialogService.fail('请选择表或视图');
                return;
            }
        }
        if($scope.prop.dsType=='restful'&&!$scope.prop.url){
        	dialogService.fail("请设置接口地址");
            return;
        }
        if($scope.prop.dsType!='dataSource'){
        	$scope.prop.dsalias = "";
        }
        $scope.prop.conditionfield=$scope.prop.conditionfield==undefined?[]:$scope.prop.conditionfield;
        $scope.prop.resultfield=$scope.prop.resultfield==undefined?[]:$scope.prop.resultfield;
        $scope.prop.sortfield=$scope.prop.sortfield==undefined?[]:$scope.prop.sortfield;
        var url = "${form}/form/customQuery/v1/save";
        baseService.post(url, $scope.prop).then(function (rep) {
            if (rep && rep.state) {
                dialogService.success(rep.message).then(function () {
                    $state.go("form.customQueryList");
                });
            }
            else {
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }
}
//自定义查询设置字段页面
function customQuerySettingCtrl($scope, dialogService, baseService, ArrayChangeService) {
    $scope.prop = $scope.pageParam.prop;
    $scope.tabStatus = 'condition';
    $scope.customVar = "";
    $scope.ArrayChange = ArrayChangeService;
    $scope.switchTabStatus = function (status) {
        $scope.tabStatus = status;
    }
    $scope.exitCustomDialogList = [];

    $scope.exitSelectorList = [];

    $scope.prop.sqlBuildType = $scope.prop.sqlBuildType + "";
    $scope.close = function () {
        dialogService.closeSidebar();
    }
    //保存按钮
    $scope.save = function () {
        for (var i in $scope.prop.conditionfield) {
            var column = $scope.prop.conditionfield[i];
            if (column.dbType == 'date' && column.condition == 'BETWEEN') {
                column.defaultValue += "|" + column.endDate;
                delete column.endDate;
            }
        }
        var s = $scope.prop;
        dialogService.closeSidebar();//关闭窗口
    }
    // 处理between
    for (var i in $scope.prop.conditionfield) {
        var column = $scope.prop.conditionfield[i];
        if (column.condition == 'BETWEEN') {
            var strs = column.defaultValue.split("|");
            column.defaultValue = strs[0];
            column.endDate = strs[1];
        }
    }

    
    if($scope.prop.dsType=='dataSource'){
    	var params = {
	        dsalias: $scope.prop.dsalias,
	        isTable: $scope.prop.isTable,
	        objName: $scope.prop.objName
	    };
	    var url = "${form}/form/customQuery/v1/getTable";
	    baseService.post(url, params).then(function (data) {
	        $scope.table = data.table;

	    });
    }
    


    $scope.addColumns = function () {
        if ($scope.prop.conditionfield == null) {
            $scope.prop.conditionfield = [];
        }
        if ($scope.prop.resultfield == null) {
            $scope.prop.resultfield = [];
        }
        if ($scope.prop.sortfield == null) {
            $scope.prop.sortfield = [];
        }

        //检查是否选择了列
        for (var i in $scope.table.columnList) {
            var c = $scope.table.columnList[i];
            if (c.selected) break;
            if (i == $scope.table.columnList.length - 1) {
                if (i == $scope.table.columnList.length - 1) {
                    dialogService.fail('请选择左边的列');
                }
            }
        }
        if ($scope.tabStatus == 'condition') {
            for (var i in $scope.table.columnList) {
                var c = $scope.table.columnList[i];
                if (!c.selected) continue;
                var column = {};
                column.field = c.fieldName;
                column.comment = c.comment;
                column.condition = 'EQ';
                column.dbType = c.columnType;
                column.defaultType = '2';
                column.defaultValue = '';
                $scope.prop.conditionfield.push(column);
            }
            //去除重复项
            $scope.prop.resultfield.unique(function (a, b) {
                return a.field == b.field;
            });
        } else if ($scope.tabStatus == 'return') {
            for (var i in $scope.table.columnList) {
                var c = $scope.table.columnList[i];

                if (!c.selected) continue;
                var column = {};
                column.field = c.fieldName;
                column.comment = c.fieldName;
                column.idKey = "0";
                column.AggFuncOp = '';//合计函数运算符

                $scope.prop.resultfield.push(column);
            }
            //去除重复项
            $scope.prop.resultfield.unique(function (a, b) {
                return a.field == b.field;
            });
        } else if ($scope.tabStatus == 'order') {
            for (var i in $scope.table.columnList) {
                var c = $scope.table.columnList[i];
                if (!c.selected) continue;
                var column = {};
                column.field = c.fieldName;
                column.sortType = "asc";

                $scope.prop.sortfield.push(column);
            }
            //去除重复项
            $scope.prop.sortfield.unique(function (a, b) {
                return a.field == b.field;
            });
        }
    }
    
    $scope.addFields=function(){
    	if(!$scope.table){
    		$scope.table = {columnList:[]};
    	}
    	 var column = {};
         column.field = "";
         column.comment = "";
         column.columnType = "varchar";
         $scope.table.columnList.push(column);
    }

    //运算条件数组-number
    $scope.number_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"大于等于",
            value:'GREAT_EQUAL'
        },
        {
            key:"大于",
            value:'GREAT'
        },
        {
            key:"小于",
            value:'LESS'
        },
        {
            key:"小于等于",
            value:'LESS_EQUAL'
        }
    ];

    //运算条件数组-varchar
    $scope.string_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"like",
            value:'LIKE'
        },
        {
            key:"likeEnd",
            value:'LEFT_LIKE'
        }
    ];

    //运算条件数组-string
    $scope.date_opList=[
        {
            key:'等于',
            value:'EQ'
        },
        {
            key:"between",
            value:'BETWEEN'
        },
        {
            key:"大于等于",
            value:'GREAT_EQUAL'
        },
        {
            key:"小于等于",
            value:'LESS_EQUAL'
        }
    ];

    //值来源数组
    $scope.value_sourceList=[
        {
            key:'参数传入',
            value:'1'
        },
        {
            key:"固定值",
            value:'2'
        },
        {
            key:"脚本",
            value:'3'
        }
    ];
    
    if($scope.prop.dsType!='dataSource'){
    	$scope.value_sourceList=[
			{
			    key:'参数传入',
			    value:'1'
			},
             {
                 key:"固定值",
                 value:'2'
             }
         ];
    }

    //返回字段合计函数数组
    $scope.agg_func_opList=[
        {
            key:'',
            value:''
        },
        {
            key:'sum',
            value:'sum'
        },
        {
            key:"max",
            value:'max'
        },
        {
            key:"min",
            value:'min'
        }
    ];

    //排序字段升序还是降序
    $scope.sort_typeList=[
        {
            key:'升序',
            value:'asc'
        },
        {
            key:'降序',
            value:'desc'
        }
    ];
    $scope.changeCt = function (column) {
        if (column.controllerType == 0 || column.controllerType == 2) {
            column.customDialogCt = {};
        } else {
            delete column.customDialogCt;
        }
    }

    $scope.changeCustomDiaologCt = function (column) {
        var theData = $scope.exitCustomDialogList;
        if (column.controllerType == 2) {
            theData = $scope.exitSelectorList;
        }
        for (var i = 0; i < theData.length; i++) {
            var cd = theData[i];
            if (cd.id == column.customDialogCt.id) {
                column.customDialogCt.resultfield = cd.resultfield;
                column.customDialogCt.width = cd.width;
                column.customDialogCt.height = cd.height;
                column.customDialogCt.name = cd.name;
                column.customDialogCt.alias = cd.alias;
                return;
            }

        }
    }

    //选择自定义sql常用脚本
    $scope.selectScript_diySql = function () {
        dialogService.page('script-selector', {alwaysClose: false}).then(function (r) {
            if (!$scope.prop.diySql) $scope.prop.diySql = "";
            var result = r.result;
            for (var i = 0; i < result.length; i++) {
                $scope.prop.diySql += result[i].script;
            }
            dialogService.close(r.index);
        });
    };

    //选择条件字段时脚本sql常用脚本
    $scope.selectScript_column = function (column) {
        dialogService.page('script-selector', {alwaysClose: false}).then(function (r) {
            if (!column.defaultValue) column.defaultValue = "";
            var result = r.result;
            for (var i = 0; i < result.length; i++) {

                column.defaultValue += result[i].script;
            }
            dialogService.close(r.index);
        });
    };

    //选择回填相关的nameKey
    $scope.selectNameKey = function (column) {
        $($scope.prop.displayfield).each(function () {
            this.nameKey = "0";
        });
        column.nameKey = "1";
    };

    //选择回填相关的idKey
    $scope.selectIdKey = function (column) {
        $($scope.prop.resultfield).each(function () {
            this.idKey = "0";
        });
        column.idKey = "1";
    };

    $scope.selectVar = function (customVar) {
        if (!$scope.prop.diySql) {
            $scope.prop.diySql = "";
        }
        $scope.prop.diySql += " " + customVar;
    }
}

/**
 * 表单模板列表控制器 
 */
function formTemplateListCtrl($scope, baseService, dialogService, $state){
	
	$scope.tempEdit = function(id){
		dialogService.sidebar('form.templateEdit', {width: "calc(100% - 500px)", pageParam: {id: id}});
	}
	//初始化模板
	$scope.initFormTemplate = function(){
		dialogService.confirm("是否确定要初始化？").then(function(){
			baseService.post('${form}/form/template/v1/init',{}).then(function(data){
				if(data.state){
					dialogService.success(data.message);
					$state.go('form.templateList');
				}else{
					dialogService.fail(data.message);
				}
			});
		});
	}
}

function formTemplateEditCtrl($scope, baseService, dialogService, $stateParams){
	$scope.editorOptions = {
		lineWrapping : true,
		lineNumbers: true
	};
	
	$scope.getTemplate = function(templateId){
		baseService.post('${form}/form/template/v1/templateGet', templateId).then(function(data){
			if(data.state){
				$scope.data = data.value.bpmFormTemplate;
			}else{
				dialogService.fail(data.message);
			}
		});
	}
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	if($scope.pageParam && $scope.pageParam.id){
		$scope.getTemplate($scope.pageParam.id);
	}
}

function fieldAuthListCtrl($scope, dialogService,baseService,$state){
	 $scope.edit = function (id,action) {
		 if(action=='get'){
			 $state.go("form.fieldAuthGet", {id: id});
		 }else{
			 $state.go("form.fieldAuthEdit", {id: id});
		 }
       
   }

	$scope.removeList=function(id){
		var url = "${form}/form/fieldAuth/v1/remove?id="+id;
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

function fieldAuthEditCtrl($scope, dialogService,baseService,$stateParams,$state){
		$scope.data = {};
		$scope.defaultPermissionList = [];
		$scope.permissionList = {};

	 	$scope.tableOrViewList = [];
	    var id = $stateParams.id;

	    $scope.detail = function (id) {
	        if (!id) return;
	        var url = "${form}/form/fieldAuth/v1/get/" + id;
	        baseService.get(url).then(function (data) {
	            $scope.data = data;
	            $scope.data.fieldList = JSON.parse(data.fieldList);
	            $scope.objName = data.tableName;
	            $scope.getByDsObjectName();
	        });
	    }
	   

	    // 获取数据源池，新建才可以选择
	    baseService.get("${portal}/sys/sysDataSource/v1/getDataSources").then(function (data) {
            $scope.dataSourcesInBean = data;
            $scope.detail($stateParams.id);
        });
	    
	    
	    /**
		 * 获取外部数据源的表
		 */
		$scope.tableChange = function(){
			$scope.onChangeTable();
			if(!$scope.data.tableName){
				return;
			}
			
			var rtn=baseService.post('${form}/form/customQuery/v1/getTable',{dsalias:$scope.data.dsAlias,isTable:"1",objName:$scope.data.tableName});
			rtn.then(function(data){
				if(!data){
					return;
				}
				$scope.data.fieldList = [];//重置字段
				//拼装成字段
				$(data.table.columnList).each(function(){
					if(this.isPk) return;//主键不展示
					var attr = {};
					attr.desc = this.comment;
					attr.name = this.fieldName;
					attr.fieldName = this.fieldName;
					attr.dataType = this.columnType;
					attr.defaultValue = this.defaultValue;
					attr.fcolumnType = this.fcolumnType;
					attr.right = [{'type':'everyone','title':'所有人'}];
					$scope.data.fieldList.push(attr);
				});
				
			});
		};
		
	    
	    $scope.onChangeTable = function(){
	    	for(var i=0;i<$scope.tableOrViewList.length;i++){
	    		if($scope.tableOrViewList[i].name==$scope.data.tableName){
	    			$scope.data.desc = $scope.tableOrViewList[i].comment;
	    			return ;
	    		}
	    	}
			$scope.data.desc = '';
	    }
	    
	    if($scope.type=='0'){
	    	$scope.getBoList();
	    }
	    
	    $scope.close = function () {
	        $state.go("form.fieldAuthList");
	    }
	    $scope.save = function () {
        	if(!$scope.fieldAuthForm.$valid){
        		dialogService.fail("当前表单校验不通过！");
    			return;
    		}
        	if(!$scope.data.fieldList || $scope.data.fieldList.length<1){
        		dialogService.fail("还未设置权限字段！");
        		return ;
        	}
	    	$scope.data.fieldList = JSON.stringify($scope.data.fieldList);
	    	var url = "${form}/form/fieldAuth/v1/save";
	        baseService.post(url, $scope.data).then(function (data) {
	            if (data.state) {
	                dialogService.success(data.message);
	                $scope.close();
	            }else{
	            	 dialogService.fail(data.message);
	            }
	        });
	    }

	    // 获取表或视图列表
	    $scope.getByDsObjectName = function () {
	        if ($scope.data.dsAlias == null) {
	            dialogService.fail("请选择数据源");
	            return;
	        }
	        $scope.params = {};
	        $scope.params.dsalias = $scope.data.dsAlias;
	        $scope.params.isTable = '1';
	        $scope.params.objName = $scope.objName;

	        var url = "${form}/form/customQuery/v1/getByDsObjectName";
	        baseService.post(url, $scope.params).then(function (data) {
	            if (!data || data.length == 0) {
	                dialogService.fail('该数据源中未查询到表!');
	            }
	            $scope.tableOrViewList = data;
	            if ($scope.tableOrViewList[0])
	                $scope.objName = $scope.tableOrViewList[0].name;
	        });

	    }
	    
	    baseService.get("${bpmModel}/flow/defAuthorize/v1/getPermissionList").then(function(result){
    		$scope.defaultPermissionList=result;
    		if(result){
    			for(var i=0;i<result.length;i++){
    				$scope.permissionList[result[i].type] = result[i].title;
    			}
    			$scope.permissionList['none'] = '无';
    		}
    	});
	    
	    $scope.rightToDesc = function(right) {
			if(right){
				right = parseToJson(right);
			}
			var desc = "";
			$(right).each(function() {
				if (desc) {
					desc += " 和 ";
				}
				var str = $scope.permissionList[this.type];
				if (this.name) {
					str += ":" + this.name;
				} else if (this.id) {
					str += ":" + this.id;
				}
				desc += str;
			});
			return desc;
		}
	    
	    $scope.fieldDialog = function(f){
			var _this = this;
			var permissionList = $scope.defaultPermissionList;
			var conf={
        			  right:f.right?parseToJson(f.right):[],
        			  permissionList:permissionList
        		   }
        		dialogService.page("flow-filedAuthSetting", {
        		    title:'授权选择器',
        		    pageParam:{data:conf},
        		 }).then(function(data){
        			 var tmpAry=[];
        				for(var i=0;i<data.length;i++){
        					var obj=data[i];
        					if(obj.id){
        						var tmp={"type":obj.type,"title":obj.title, "id":obj.id,"name":obj.name};
        						tmpAry.push(tmp);
        					}
        					else{
        						var tmp={"type":obj.type,"title":obj.title};
        						tmpAry.push(tmp);
        					}
        				}
        				f.right = tmpAry.length>0?JSON.stringify(tmpAry):[{'title':'无','type':'none'}];
        		 });
		}
		

}

/**
 *
 * Pass all functions into module
 */
angular
    .module('form', [])
    .controller('customQueryShowCtrl', customQueryShowCtrl)
    .controller('customQuerySettingCtrl', customQuerySettingCtrl)
    .controller('customQueryListCtrl', customQueryListCtrl)
    .controller('customQueryEditCtrl', customQueryEditCtrl)
    .controller('paramDialogCtrl', paramDialogCtrl)
    .controller('customDialogShowTreeCtrl', customDialogShowTreeCtrl)
    .controller('customDialogShowListCtrl', customDialogShowListCtrl)
    .controller('boEditCtrl', boEditCtrl)
    .controller('boEntExtEditCtrl', boEntExtEditCtrl)
    .controller('boDefListCtrl', boDefListCtrl)
    .controller('boPreviewCtrl', boPreviewCtrl)
    .controller('customDialogListCtrl', customDialogListCtrl)
    .controller('customDialogSettingCtrl', customDialogSettingCtrl)
    .controller('customDialogEditCtrl', customDialogEditCtrl)
    .controller('formTemplateListCtrl', formTemplateListCtrl)
    .controller('formTemplateEditCtrl', formTemplateEditCtrl)
    .controller('customDialogParamSetCtrl', customDialogParamSetCtrl)
    .controller('fieldAuthListCtrl', fieldAuthListCtrl)
    .controller('fieldAuthEditCtrl', fieldAuthEditCtrl);