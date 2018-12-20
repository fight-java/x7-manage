//分类标识
function sysCategoryListCtrl($scope, dialogService){
    //操作按钮
    $scope.operating = function(id,action){
        var title = action == "edit" ? "编辑分类标识" : "添加分类标识";
        //跳转操作页面
        dialogService.sidebar("dataClassification.sysCategoryListEdit", {bodyClose: false, width: '40%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}
//操作分类标识
function sysCategoryEditCtrl($scope, baseService, dialogService){
    $scope.id = $scope.pageParam.id;//列表页面传过来的ID
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    $scope.data = {type:"1"};//定义修改页面接收数据的实体
    //定义根据id查询数据事件
    $scope.detail = function(id) {
        if(!id)return;
        var url = '${portal}/sys/category/v1/getJson?id=' + id;
        baseService.get(url).then(function (rep) {
            $scope.data=rep;
            $scope.data.type = $scope.data.type.toString();
        });
    }
    $scope.detail($scope.id);//运行事件
    //定义保存班次数据事件
    $scope.save = function(){
        var url = "${portal}/sys/category/v1/save";
        baseService.post(url,$scope.data).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.data.groupKey == undefined || $scope.data.name == undefined){
            return;
        }else {
            $scope.save();
        }
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}
//分类管理
function sysCategoryTreeCtrl($scope, baseService,dialogService){
    $scope.treeConfig = {
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentId",
                rootPId: 0
            }
        }
    };

    $scope.data = {};
    $scope.dataEdit = {};
    //加载分类标识下拉列表
    baseService.post("${portal}/sys/sysType/v1/sysTypeTree").then(function(rep){
        $scope.data = rep;
        loadTree();
    });

    //根据分类标识获取树
    function loadTree() {
       $scope.treeData = [];
       baseService.get("${portal}/sys/sysType/v1/getByParentId?catId="+$scope.data.sysCategory.id).then(function(rep){
           $scope.treeData = rep;
       });
    }
    //改变分类
    $scope.categoryChange = function(){
        $("#parentNodeDisplay").css("display","none");
        $("#categoryDisplay").css("display","none");
        loadTree();
    }
    //左键菜单点击前事件
    $scope.tree_click = function(e, i, n){
        if(n.parentId!=0){
            $("#parentNodeDisplay").css("display","none");
            $("#categoryDisplay").css("display","block");
            addNode(n,0,"edit");
        }
    }
    // 右键菜单点击前事件
    $scope.beforeRightClick = function(treeNode){
        if(treeNode.parentId==0){
            $scope.contextMenu = ['添加子项'];
        }else{
            $scope.contextMenu = ['添加','删除','刷新'];
        }
    }
    //添加节点
    function addNode(treeNode,isPriNode,title) {
        var isRoot = 0;
        if(treeNode.parentId==0){
            isRoot = 1;
        }
        var url = "";
        if(title=="edit"){
            $scope.title="编辑分类";
            url="${portal}/sys/sysType/v1/editJson?isPriNode=" + isPriNode + "&isRoot=" + isRoot + "&id="+ treeNode.id +"&parentId=";
        }else {
            $scope.title="添加分类";
            url = "${portal}/sys/sysType/v1/editJson?parentId="+treeNode.id+"&isPriNode=" + isPriNode + "&isRoot=" + isRoot + "&id=";
        }
        baseService.get(url).then(function (rep) {
            $scope.dataEdit = rep;
        });
    }
    // 点击某个右键菜单项
    $scope.menuClick = function(menu,treeNode){
        switch(menu){
            case '添加子项':
                $("#parentNodeDisplay").css("display","block");
                $("#categoryDisplay").css("display","block");
                addNode(treeNode,0);
                break;
            case '添加':
                $("#parentNodeDisplay").css("display","block");
                $("#categoryDisplay").css("display","block");
                addNode(treeNode,0);
                break;
            case '刷新':
                loadTree();
                break;
            case '删除':
                dialogService.confirm("确认要删除吗?").then(function(){
                    baseService.remove("${portal}/sys/sysType/v1/remove?id="+treeNode.id).then(function(response){
                        dialogService.success(response.message).then(function(){
                            loadTree();
                        });
                    });
                }, function(){
                    dialogService.msg("您选择了取消");
                });
                break;
        }
    }
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.dataEdit.sysType.name==undefined || $scope.dataEdit.sysType.typeKey==undefined){
            return;
        }else {
            $scope.save();
        }
    }
    //定义保存日历分配数据事件
    $scope.save = function() {
        var url = "${portal}/sys/sysType/v1/save?parentId="+$scope.dataEdit.parentId+
        "&isRoot="+$scope.dataEdit.isRoot+"&isPriNode="+$scope.dataEdit.isPriNode;
        baseService.post(url,$scope.dataEdit.sysType).then(function(response){
            dialogService.success(response.message).then(function(){
                loadTree();
                $scope.dataEdit.sysType.name=undefined;
                $scope.dataEdit.sysType.typeKey=undefined;
            });
        });
    }

}

//数据字典
function sysDictTreeCtrl($scope, baseService,dialogService,$rootScope){
    $scope.currentTree = '';
    $scope.treeConfig = {
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parentId",
                rootPId: 0
            }
        }
    };

    $scope.data = {};
    loadTree();

    //根据分类标识获取树
    function loadTree() {
        $scope.treeData = [];
        //加载数据字典树
        baseService.get("${portal}/sys/sysType/v1/getTypesByKey?typeKey=DIC").then(function(rep){
            $scope.treeData = rep;
        });
    }
    //左键菜单点击前事件
    var dictValId;
    $scope.tree_click = function(e, i, n){
        dictValId = n.id;
        $scope.dictTree(dictValId);
    }
    //加载数据字典值树
    $scope.dictTree = function(id){
        $scope.treeSubgradeData = [];
        baseService.post("${portal}/sys/dataDict/v1/getByTypeId", id) .then(function(response){
            $scope.treeSubgradeData = response;
        });
    }
    // 右键菜单点击前事件
    $scope.beforeRightClick = function(treeNode){
        if(treeNode.parentId==0){
            $scope.contextMenu = ['添加子项','刷新'];
        }else{
            $scope.contextMenu = ['添加','编辑', '删除','刷新'];
        }
    }
    //添加节点
    function addNode(treeNode,isPriNode,title,type) {
        var action = title == "edit" ? "编辑数据字典分类" : "添加数据字典分类";
        var isRoot = 0;
        if(treeNode.parentId==0){
            isRoot = 1;
        }
        //跳转操作页面
        dialogService.sidebar("dataClassification.sysDictTreeEdit", {bodyClose: false, width: '35%', pageParam: {id:treeNode.id,title:action,isPriNode:isPriNode,isRoot:isRoot,type:type}});
        $scope.currentTree="0";
    }

    $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
        if($scope.currentTree=="0"){
            loadTree();
        }else if($scope.currentTree=="1"){
            $scope.dictTree(dictValId);
        }

    });
    // 点击某个右键菜单项
    $scope.menuClick = function(menu,treeNode){
        switch(menu){
            case '添加子项':
                addNode(treeNode,0,"add","block");
                break;
            case '添加':
                addNode(treeNode,0,"add","block");
                break;
            case '编辑':
                addNode(treeNode,0,"edit","none");
                break;
            case '删除':
                dialogService.confirm("确认要删除吗?").then(function(){
                    baseService.remove("${portal}/sys/sysType/v1/remove?id="+treeNode.id).then(function(response){
                        dialogService.success(response.message).then(function(){
                            loadTree();
                        });
                    });
                }, function(){
                    dialogService.msg("您选择了取消");
                });
                break;
            case '刷新':
                loadTree();
                break;
        }
    }

    // 右键菜单点击前事件
    $scope.beforeRightClickDict = function(treeNode){
        if(treeNode.parentId==0){
            $scope.contextMenu = ['添加子项','刷新'];
        }else{
            $scope.contextMenu = ['添加','编辑', '删除','刷新'];
        }
    }
    //添加节点
    function addNodeDict(treeNode,title) {
        var action = title == "edit" ? "编辑数据字典" : "添加数据字典";
        var isRoot = 0;
        if(treeNode.parentId==0){
            isRoot = 1;
        }
        //跳转操作页面
        dialogService.sidebar("dataClassification.sysDictTreeEditDataEdit", {bodyClose: false, width: '35%', pageParam: {id:treeNode.id,title:action,isRoot:isRoot}});
        $scope.currentTree="1";
    }
    //编辑节点
    function editNodeDict(treeNode,title) {
        var action = title == "edit" ? "编辑数据字典" : "添加数据字典";
        if(treeNode.parentId==0){
            return;
        }
        //跳转操作页面
        dialogService.sidebar("dataClassification.sysDictTreeEditDataEdit", {bodyClose: false, width: '35%', pageParam: {id:treeNode.id,title:action,isRoot:"0"}});
        $scope.currentTree="1";
    }
    // 点击某个右键菜单项
    $scope.menuClickDict = function(menu,treeNode){
        switch(menu){
            case '添加子项':
                addNodeDict(treeNode,"add");
                break;
            case '添加':
                addNodeDict(treeNode,"add");
                break;
            case '编辑':
                editNodeDict(treeNode,"edit");
                break;
            case '删除':
                dialogService.confirm("确认要删除吗?").then(function(){
                    baseService.remove("${portal}/sys/dataDict/v1/remove?id="+treeNode.id).then(function(response){
                        dialogService.success(response.message).then(function(){
                            $scope.dictTree(dictValId);
                        });
                    });
                }, function(){
                    dialogService.msg("您选择了取消");
                });
                break;
            case '刷新':
                $scope.dictTree(dictValId);
                break;
        }
    }
}
//操作数据字典分类
function sysDictEditCtrl($scope, baseService,dialogService){
    $scope.id = $scope.pageParam.id;//数据字典树传过来的ID
    $scope.isPriNode = $scope.pageParam.isPriNode;//数据字典树传过来的isPriNode 标记添加的节点是公共节点还是私有节点  ，0 ==公共节点 ，1==私有节点
    $scope.isRoot = $scope.pageParam.isRoot;//数据字典树传过来的isRoot  是否根节点
    $scope.title = $scope.pageParam.title;//数据字典树传过来的title
    $scope.type = $scope.pageParam.type;//数据字典树传过来的type 是否显示父节点
    $scope.dataEdit={sysType:{struType:"1"}};
    //定义根据id查询数据事件
    $scope.detail = function(id) {
        if(!id)return;
        var url = "";
        if($scope.title=="编辑数据字典分类"){
            url="${portal}/sys/sysType/v1/editJson?isPriNode=" + $scope.isPriNode + "&isRoot=" + $scope.isRoot + "&id="+ $scope.id +"&parentId=";
        }else {
            url = "${portal}/sys/sysType/v1/editJson?parentId="+$scope.id+"&isPriNode=" + $scope.isPriNode + "&isRoot=" + $scope.isRoot + "&id=";
        }
        baseService.get(url).then(function (rep) {
            if($scope.type=="none"){
                $("#parentNodeDisplay").css("display","none");
            }else{
                $("#parentNodeDisplay").css("display","block");
            }
            $scope.dataEdit=rep;
            $scope.dataEdit.sysType.struType = $scope.dataEdit.sysType.struType.toString();
        });
    }
    $scope.detail($scope.id,$scope.isPriNode,$scope.isRoot,$scope.type,$scope.title);//运行事件
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.dataEdit.sysType.name==undefined || $scope.dataEdit.sysType.typeKey==undefined){
            return;
        }else {
            $scope.save();
        }
    }
    //定义保存数据字典分类事件
    $scope.save = function() {
        var url = "${portal}/sys/sysType/v1/save?parentId="+$scope.dataEdit.parentId+
            "&isRoot="+$scope.dataEdit.isRoot+"&isPriNode="+$scope.dataEdit.isPriNode;
        baseService.post(url,$scope.dataEdit.sysType).then(function(response){
            dialogService.success(response.message).then(function(){
                dialogService.closeSidebar();//关闭窗口
            });
        });
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}
//操作数据字典分类值
function sysDictDataEditCtrl($scope,baseService,dialogService){
    $scope.id = $scope.pageParam.id;//数据字典树传过来的ID
    $scope.title = $scope.pageParam.title;//数据字典树传过来的title
    $scope.isRoot = $scope.pageParam.isRoot;//数据字典树传过来的isRoot  是否根节点
    $scope.data = {};
    //定义根据id查询数据事件
    $scope.detail = function(id) {
        if(!id)return;
        var url = "";
        if($scope.title=="编辑数据字典"){
            url="${portal}/sys/dataDict/v1/dataDictEdit?id="+id+"&isAdd=0&isRoot="+$scope.isRoot;
        }else{
            url="${portal}/sys/dataDict/v1/dataDictEdit?id="+id+"&isAdd=1&isRoot="+$scope.isRoot;
        }
        baseService.get(url).then(function (rep) {
            $scope.data = rep;
        });
    }
    $scope.detail($scope.id,$scope.title,$scope.isRoot);//运行事件
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.data.dataDict.name==undefined || $scope.data.dataDict.key==undefined){
            return;
        }else {
            $scope.save();
        }
    }
    //定义保存数据字典值事件
    $scope.save = function() {
        var url = "${portal}/sys/dataDict/v1/save";
        var dict = {};
        if(JSON.stringify($scope.data)=="{}"){
            return;
        }
        if($scope.data.dataDict.id == undefined){
            dict = {"typeId":$scope.data.typeId,"key":$scope.data.dataDict.key,"name":$scope.data.dataDict.name,"parentId":$scope.data.parentId};
        }else{
            dict = {"id":$scope.data.dataDict.id,"typeId":$scope.data.dataDict.typeId,"key":$scope.data.dataDict.key,"name":$scope.data.dataDict.name,"parentId":$scope.data.dataDict.parentId};
        }
        baseService.post(url,dict).then(function(response){
            dialogService.success(response.message).then(function(){
                if(response.message!="该字典项值已经存在"){
                    dialogService.closeSidebar();//关闭窗口
                }

            });
        });
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}
//流水号
function identityListCtrl($scope,dialogService){
    //操作按钮
    $scope.operating = function(id,action){
        var title = action == "edit" ? "编辑流水号" : "添加流水号";
        //跳转操作页面
        dialogService.sidebar("dataClassification.identityListEdit", {bodyClose: false, width: '50%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}
//操作流水号
function identityEditCtrl($scope,dialogService,baseService){
    $scope.id = $scope.pageParam.id;//传过来的ID
    $scope.title = $scope.pageParam.title;//传过来的title
    $scope.identity = {"genType":"1"};
    //定义根据id查询数据事件
    $scope.detail = function(id) {
        if (!id)return;
        baseService.get("${portal}/sys/identity/v1/getJson?id="+id).then(function (rep) {
            $scope.identity = rep;
        });
    }
    $scope.detail($scope.id);//运行事件
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.identity.name==undefined || $scope.identity.alias==undefined || $scope.identity.regulation==undefined
        || $scope.identity.noLength==undefined || $scope.identity.initValue==undefined || $scope.identity.step==undefined){
            return;
        }else {
            $scope.save();
        }
    }
    //定义保存流水号数据事件
    $scope.save = function() {
        var url = "${portal}/sys/identity/v1/save";
        baseService.post(url,$scope.identity).then(function(response){
            if(response.state){
                dialogService.success(response.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.warn(response.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
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
    .module('dataClass', [])
    .controller('sysCategoryTreeCtrl', sysCategoryTreeCtrl)
    .controller('sysCategoryListCtrl',sysCategoryListCtrl)
    .controller('sysCategoryEditCtrl',sysCategoryEditCtrl)
    .controller('sysDictTreeCtrl',sysDictTreeCtrl)
    .controller('sysDictEditCtrl',sysDictEditCtrl)
    .controller('sysDictDataEditCtrl',sysDictDataEditCtrl)
    .controller('identityListCtrl',identityListCtrl)
    .controller('identityEditCtrl',identityEditCtrl);