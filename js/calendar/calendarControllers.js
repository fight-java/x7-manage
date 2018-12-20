//工作日历管理
function workListCtrl($scope,dialogService,baseService){
    //设置为默认
    $scope.isDefault = function(id){
        var url = "${portal}/calendar/work/v1/setDefault?id="+id;
        baseService.get(url).then(function(rep){
            $scope.dataTable.query();
        });
    }
    //操作按钮
    $scope.operating = function(id,action){
        var title = action == "edit" ? "编辑日历" : "添加日历";
        //跳转操作页面
        dialogService.sidebar("calendar.workListEdit", {bodyClose: false, width: '50%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}
//工作日历操作
function workEditCtrl($scope, baseService,dialogService){
    $scope.id = $scope.pageParam.id;//列表页面传过来的ID
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    $scope.calendar = {};
    $scope.shifts = [];
    $scope.setting = {};
    $scope.selected = null;
    $scope.dp = new DayPilot.Scheduler("dp");
    //定义根据id查询数据事件
    $scope.detail = function(id) {
        var calendarUrl = "${portal}/calendar/work/v1/detail?id=" + id;
        //获取工作日历基本信息和班次列表
        baseService.get(calendarUrl).then(function (response) {
            if (response && response.calendar) {
                $scope.calendar = response.calendar;
            }
            if (response && response.shifts) {
                $scope.shifts = response.shifts;
            }
            $scope.getSetting();
        });
    }
    $scope.detail($scope.id);//运行事件
    //获取工作日历设置
    $scope.getSetting = function(){
        if(!$scope.id ) return;
        var year = $scope.dp.startDate.getYear();
        if($scope.setting.hasOwnProperty(year)) return;
        var url ="${portal}/calendar/work/v1/calendarSetting?id=" + $scope.id  + "&year=" + year;
        baseService.get(url).then(function(response){
            if(response && response.result){
                $scope.setting[response.year] = true;
                angular.forEach(response.calendarSettingEvent, function(event){
                    var e = new DayPilot.Event({
                        start: DayPilot.Date.fromYearMonthDay(event.startYear, event.startMonth, event.startDay),
                        end: DayPilot.Date.fromYearMonthDay(event.endYear, event.endMonth, event.endDay + 1),
                        id: DayPilot.guid(),
                        shiftId: event.shiftId,
                        text: event.shiftId?$scope.getShiftName(event.shiftId):"休息",
                        moveDisabled:false
                    });
                    $scope.dp.events.add(e);
                });
            }
        });
    }

    $scope.getShiftName = function(shiftId){
        for(var i=0,c;c=$scope.shifts[i++];){
            if(c.id == shiftId){
                return c.name;
            }
        }
        return "休息";
    }

    $scope.config = {
        startDate : new DayPilot.Date(),
        locale : "zh-cn",
        cellHeight : 80,
        lineSpace:5,
        eventDeleteHandling: "Update",
        onTimeRangeSelect : function(args){
            $scope.selected = args;
        },
        onBeforeCellRender : function(args){
            var month = args.cell.start.getMonth();
            if(month!=$scope.dp.startDate.getMonth()){
                args.cell.headerHtml = '<span style="color:#eee;">'+args.cell.headerHtml+'</span>';
                args.cell.backColor = "#ccc";
            }
        },
        onBeforeEventRender : function(args){
            args.data.deleteDisabled = false;
        },
        onHeaderClick : function(args){

        }
    };

    $scope.save = function(){
        var events = [],
            curYear = $scope.dp.startDate.getYear(),
            curMonth = $scope.dp.startDate.getMonth() + 1;
        angular.forEach($scope.dp.events.list,function(t){
            var event = {dateType:2};
            if(t.shiftId){
                event.dateType = 1;
                event.shiftId = t.shiftId;
            }
            event.startYear = t.start.getYear();
            event.endYear = t.end.getYear();
            event.startMonth = t.start.getMonth() + 1;
            event.endMonth = t.end.getMonth() + 1;
            event.startDay = t.start.getDay();
            event.endDay = t.end.getDay()-1;
            events.push(event);
        });
        var url ="${portal}/calendar/work/v1/save";
        var calendar = {base:$scope.calendar,settingEvents:events};
        baseService.post(url,{calendar:JSON.stringify(calendar)}).then(function(response){
                if(response.state){
                    dialogService.success(response.message).then(function(){
                        dialogService.closeSidebar();//关闭窗口
                    });
                }
                else{
                    dialogService.fail(response.message);
                }
            });
    }

    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.calendar.name==undefined || $scope.calendar.memo==undefined){
            return;
        }else {
            $scope.save();
        }
    }
    $scope.modifyMonth = function(step){
        $scope.dp.startDate = $scope.dp.startDate.addMonths(step);
        $scope.dp.update();
        $scope.getSetting();
    }

    $scope.setDay = function(t){
        if(!$scope.selected) return;
        $scope.dp.clearSelection();
        if(typeof t=='string'){
            switch(t){
                case "rest":
                    var e = new DayPilot.Event({
                        start: $scope.selected.start,
                        end: $scope.selected.end,
                        id: DayPilot.guid(),
                        text: "休息"
                    });
                    $scope.dp.events.add(e);
                    $scope.dp.message("已设置为:休息");
                    break;
                case "empty":
                    break;
            }
        }
        else if(typeof t=='object'){
            var e = new DayPilot.Event({
                start: $scope.selected.start,
                end: $scope.selected.end,
                id: DayPilot.guid(),
                shiftId: t.id,
                text: t.name
            });
            $scope.dp.events.add(e);
            $scope.dp.message("已设置为：" + t.name);
        }
        $scope.selected = null;
    }
    //关闭事件
    $scope.close = function(){
        dialogService.closeSidebar();
    }
}
//工作日历分配
function assignListCtrl($scope,dialogService){
    //操作按钮
    $scope.operating = function(id,action){
        var title = action == "edit" ? "编辑日历分配信息" : "添加日历分配信息";
        //跳转操作页面
        dialogService.sidebar("calendar.assignListEdit", {bodyClose: false, width: '40%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}
//工作日历分配操作
function assignEditCtrl($scope, baseService,dialogService){
    $scope.prop = {assignType:"1"};//定义修改页面接收数据的实体
    $scope.calendarList = [];
    $scope.id = $scope.pageParam.id;//列表页面传过来的ID
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    var selectNum = -1;//用户选择器是否多选；新增时多选，修改时单选；
    //定义根据id查询数据事件
    $scope.detail = function(id){
        var url = '${portal}/calendar/assign/v1/get?id=' + id;
        baseService.get(url).then(function(response){
            if(response && response.calendarList){
                if(response.calendarList.length==0){
                    dialogService.warn("请先设置工作日历，再进行工作日历分配");
                }
                else{
                    $scope.calendarList = response.calendarList;
                    for(var i=0;i<$scope.calendarList.length;i++){
                        if($scope.calendarList[i].isDefault==1){
                            $scope.prop.calendarId=$scope.calendarList[i].id;
                        }
                    }
                }
            }
            if(response && response.calendarAssign){
                selectNum = 1;
                $scope.prop = response.calendarAssign;
                $scope.prop.calendarId = $scope.prop.canlendarId;
                var assigns = [];
                var assign = new Object();
                assign.id = $scope.prop.assignId;
                if($scope.prop.assignType==1){
                    assign.fullname = $scope.prop.assignUserName;
                }else if($scope.prop.assignType==2) {
                    assign.name = $scope.prop.assignUserName;
                }
                assigns.push(assign);
                $scope.prop.assign = assigns;
                setTimeout(function(){
                    $("#receiverId").val($scope.prop.assignId);
                    $("#receiver").val($scope.prop.assignUserName);
                },200);
            }
        },function(response){
            dialogService.fail("未能获取到工作日历信息");
        });
    }
    $scope.detail($scope.id);//运行事件

    //用户、组织选择器
    $scope.dialogDetail = function(selector){
        var pageParam = {};
        if(selectNum==1){
            pageParam = {
                single:true, /*是否单选*/
                data:$scope.prop.assign
            };
        }else if(selectNum==-1){
            pageParam = {
                data:$scope.prop.assign
            };
        }
        dialogService.page(selector, {area:['1150px', '650px'],pageParam:pageParam})
            .then(function(data){
                if($scope.prop.assignType==1){
                    applyByTypeUser(data);
                }else if($scope.prop.assignType==2){
                    applyByTypeOrg(data);
                }

            });
    }
    //用户选择器确认事件
    function applyByTypeUser(data){
        var userId = "";//用户ID
        var userName = "";//用户名称
        var assigns = [];
        for(var i=0;i<data.length;i++){
            userId+=data[i].id+",";
            userName+=data[i].fullname+",";

            var assign = new Object();
            assign.id = data[i].id;
            assign.fullname = data[i].fullname;
            assigns.push(assign);
        }
        userName=userSubstring(userName);
        userId=userSubstring(userId);
        $("#receiverId").val(userId);
        $("#receiver").val(userName);
        $scope.prop.assign=assigns;
    }
    //组织选择器确认事件
    function applyByTypeOrg(data){
        var orgId = "";//组织ID
        var orgName = "";//组织名称
        var assigns = [];
        for(var i=0;i<data.length;i++){
            orgId+=data[i].id+",";
            orgName+=data[i].name+",";

            var assign = new Object();
            assign.id = data[i].id;
            assign.name = data[i].name;
            assigns.push(assign);
        }
        orgName=userSubstring(orgName);
        orgId=userSubstring(orgId);
        $("#receiverId").val(orgId);
        $("#receiver").val(orgName);
        $scope.prop.assign=assigns;
    }
    //去除字符串最后一位
    function userSubstring(str){
        return str.substring(0,str.length-1);
    }

    //定义保存日历分配数据事件
    $scope.save = function(){
        var url = "${portal}/calendar/assign/v1/save";
        baseService.post(url,{assign:JSON.stringify($scope.prop)}).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.fail('用户已经分配了日历，不能再次分配').then(function(){
                });
            }
        });
    }
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($("#calendarId").val()=="?" || $("#receiver").val()==""){
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
//班次管理
function shiftListCtrl($scope, baseService,dialogService){
    //设置为默认
    $scope.isDefault = function(id){
        var url = "${portal}/calendar/shift/v1/setDefault?id="+id;
        baseService.get(url).then(function(rep){
            $scope.dataTable.query();
        });
    }
    //操作按钮
    $scope.operating = function(id,action){
        var title = action == "edit" ? "编辑班次" : "添加班次";
        //跳转操作页面
        dialogService.sidebar("calendar.shiftListEdit", {bodyClose: false, width: '50%', pageParam: {id:id,title:title}});
        $scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
            $scope.dataTable.query();//子页面关闭,父页面数据刷新
        });
    }
}
//班次操作
function shiftEditCtrl($scope, baseService,dialogService){
    $scope.data = {};//定义修改页面接收数据的实体
    $scope.data.shiftPeroidlist = [];//定义修改页面接收数据的实体
    $scope.id = $scope.pageParam.id;//列表页面传过来的ID
    $scope.title = $scope.pageParam.title;//列表页面传过来的title
    //定义根据id查询数据事件
    $scope.detail = function(id){
        if(!id) return;
        var url = '${portal}/calendar/shift/v1/get?id=' + id;
        baseService.get(url).then(function(rep){
            $scope.data=rep;
        });
    }
    $scope.detail($scope.id);//运行事件

    $scope.addPeroid = function(){
        $scope.data.shiftPeroidlist.push({});
    }
    $scope.removePeroid = function(peroid){
        $scope.data.shiftPeroidlist.remove(peroid);
    }
    $scope.peroidMinutes = function(){
        $scope.data.calendarShift.minutes = 0;
        angular.forEach($scope.data.shiftPeroidlist,function(peroid){
            if(peroid && peroid.minutes){
                var m = Number.parseInt(peroid.minutes);
                if(Number.isInteger(m)){
                    $scope.data.calendarShift.minutes += m;
                }
            }
        });
    }
    //定义保存班次数据事件
    $scope.save = function(){
        var url = "${portal}/calendar/shift/v1/save";
        baseService.post(url,$scope.data).then(function(rep){
            if(rep && rep.state){
                dialogService.success(rep.message).then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }else{
                dialogService.fail(rep.message || '保存失败').then(function(){
                    dialogService.closeSidebar();//关闭窗口
                });
            }
        });
    }
    //新增或修改时不能为空
    $scope.isExist = function(){
        if($scope.data.calendarShift.name == undefined || $scope.data.calendarShift.memo == undefined
            || $scope.data.shiftPeroidlist[0].startTime==undefined || $scope.data.shiftPeroidlist[0].endTime==undefined){
            return;
        }else {
            for(var i = 0;i<$scope.data.shiftPeroidlist.length;i++){
                if($scope.data.shiftPeroidlist[i].minutes==undefined){
                    dialogService.fail("工作时段必须大于或等于1分钟");
                    return;
                }
            }
            $scope.save();
        }
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
    .module('calendar', [])
    .controller('workListCtrl', workListCtrl)
    .controller('workEditCtrl', workEditCtrl)
    .controller('assignListCtrl', assignListCtrl)
    .controller('assignEditCtrl', assignEditCtrl)
    .controller('shiftListCtrl', shiftListCtrl)
    .controller('shiftEditCtrl', shiftEditCtrl);
