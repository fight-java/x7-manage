//国际化资源
function i18nMessageCtrl($scope, dialogService,baseService){
    $scope.types = [];
    baseService.post('${portal}/i18n/custom/i18nMessageType/v1/all').then(function(rep){
        $scope.types = rep;
        $scope.dataTable.query();
    });
    //操作按钮
    $scope.operating = function(key,action){
        var title = action == "edit" ? "编辑国际化资源" : "添加国际化资源";
        //跳转操作页面
        dialogService.sidebar("i18n.i18nMessageEdit", {bodyClose: false, width: '40%', pageParam: {key:key,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
    //选择国家化资源按钮
    $scope.resources = function() {
        //跳转选择国际化资源页面
        dialogService.page("i18n.i18nMessageSearch", {pageParam:{id:1}})
            .then(function(result){
                dialogService.msg("回传的数据:" + JSON.stringify(result));
            });
    }
    //初始化国际化资源
    $scope.init = function(){
        baseService.post('${portal}/i18n/custom/i18nMessage/v1/init').then(function(rep){
            dialogService.success("初始化成功");
            $scope.dataTable.query();
        });
    }
    //清除缓存
    $scope.clearAll = function(){
        baseService.post('${portal}/i18n/custom/i18nMessage/v1/clearCache').then(function(rep){
            dialogService.success("清除缓存成功");
            $scope.dataTable.query();
        });
    }
    //删除国际化资源
    $scope.removeByKey = function(key){
        dialogService.confirm("是否确认删除？").then(function() {
            baseService.remove('${portal}/i18n/custom/i18nMessage/v1/delByKey?key='+key).then(function(rep){
                dialogService.success(rep.message);
                $scope.dataTable.query();
            });
        });
    }
}

//操作国际化资源
function i18nMessageEditCtrl($scope, dialogService, baseService){
    $scope.data = {};//定义修改页面接收数据的实体
    $scope.oldKey = $scope.pageParam.key;//列表页面传过来的key
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    //定义根据id查询国际化数据事件
    $scope.detail = function(key){
        var url = '${portal}/i18n/custom/i18nMessage/v1/getI18nMessageJson?key=' + key;
        baseService.post(url).then(function(rep){
            $scope.data = rep;
            if(!$scope.data.key_){
            	$scope.data.key_ = key;
            }
        });
    }
    $scope.detail($scope.oldKey);//运行事件
    //定义保存国际化数据事件
    $scope.save = function(){
        $scope.data.vals = "";
        $scope.data.types = "";
        var noData = true;
        var len = $("input[name='val']").length;
        var mesTypeInfo = [];
        for(var i=0;i<len;i++){
            var val = $($("input[name='val']").get(i)).val();
            var tr = $($("input[name='val']").get(i)).closest("tr");
            var type = $(tr).find("td[name='type']").text().trim();
            var desc = $(tr).find("td[name='desc']").text().trim();
            $scope.data.vals = $scope.data.vals+val+",";
            $scope.data.types = $scope.data.types+type+",";
            if(val != ""){
                noData = false;
            }
            var object = {
                type:type,
                desc:desc,
                val:val
            };
            mesTypeInfo.push(object);
        }
        if(noData){
            dialogService.fail("资源中资源值至少有一个！");
            return;
        }
        $scope.data.key = $scope.data.key_;
        $scope.data.mesTypeInfo = mesTypeInfo;
        var url = "${portal}/i18n/custom/i18nMessage/v1/save";
        baseService.post(url+"?oldKey="+$scope.oldKey, $scope.data).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }
    //新增或修改，先判断key是否存在
    $scope.isExist = function(){
        if(JSON.stringify($scope.data)=="{}" || $scope.data.key_==undefined){
            return;
        }else {
            if($scope.title == "编辑国际化资源") {
                if($scope.oldKey == $scope.data.key_){
                    $scope.save();
                }else{
                    $scope.isType();
                }
            }else{
                $scope.isType();
            }
        }
    }
    //判断Key是否存在
    $scope.isType = function(){
        var url = "${portal}/i18n/custom/i18nMessage/v1/getByMessKey?key=" + $scope.data.key_;
        baseService.post(url).then(function(rep) {
            if(rep.key_== $scope.data.key_){
                dialogService.fail("资源Key【"+rep.key_+"】已存在");
            }else{
                $scope.save();
            }
        });
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}

//国际化语种
function i18nMessageTypeCtrl($scope, dialogService){
    //操作按钮
    $scope.operating = function(id,action,type){
        var title = action == "edit" ? "编辑国际化资源支持的语言类型" : "添加国际化资源支持的语言类型";
        //跳转操作页面
        dialogService.sidebar("i18n.i18nMessageTypeEdit", {bodyClose: false, width: '30%', pageParam: {id:id,title:title,type:type}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}

//操作国际化语种
function i18nMessageTypeEditCtrl($scope, dialogService, baseService){
    $scope.data = {};//定义修改页面接收数据的实体
    $scope.id = $scope.pageParam.id;//列表页面传过来的ID
    $scope.oldType = $scope.pageParam.type;//列表页面传过来的type
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    //定义根据id查询国际化数据事件
    $scope.detail = function(id){
        if(!id) return;
        var url = '${portal}/i18n/custom/i18nMessageType/v1/getJson?id=' + id;
        baseService.get(url).then(function(rep){
            $scope.data = rep;
        });
    }
    $scope.detail($scope.id);//运行事件

    //定义保存国际化数据事件
    $scope.save = function(){
        var url = "${portal}/i18n/custom/i18nMessageType/v1/save";
        baseService.post(url, $scope.data).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.fail(rep.message || '保存失败');
            }
        });
    }
    //新增或修改，先判断类型是否存在
    $scope.isExist = function(){
        if(JSON.stringify($scope.data)=="{}" || $scope.data.type==undefined){
            return;
        }else {
            if($scope.title == "编辑国际化资源支持的语言类型") {
                if($scope.oldType == $scope.data.type){
                    $scope.save();
                }else{
                    $scope.isType();
                }
            }else{
                $scope.isType();
            }
        }
    }
    //判断类型是否存在
    $scope.isType = function(){
        var url = "${portal}/i18n/custom/i18nMessageType/v1/getByType?type=" + $scope.data.type;
        baseService.post(url).then(function(rep) {
            if(rep.type==$scope.data.type){
                dialogService.fail("类型已存在");
            }else{
                $scope.save();
            }
        });
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}

//选择国家化资源
function i18nSelectorCtrl($scope, baseService){
    $scope.types = [];
    baseService.post('${portal}/i18n/custom/i18nMessageType/v1/all').then(function(rep){
        $scope.types = rep;
        $scope.dataSearchTable.query();
    });
    // 响应对话框的确定按钮，并返回值到父页面
    $scope.pageSure = function(){
        return $scope.dataSearchTable.selectRow();
    }
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('i18n', [])
    .controller('i18nMessageTypeCtrl', i18nMessageTypeCtrl)
    .controller('i18nMessageTypeEditCtrl', i18nMessageTypeEditCtrl)
    .controller('i18nMessageCtrl',i18nMessageCtrl)
    .controller('i18nMessageEditCtrl', i18nMessageEditCtrl)
    .controller('i18nSelectorCtrl', i18nSelectorCtrl);