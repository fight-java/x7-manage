
/**
 *  @description 
 *  手机表单开发工具类
 *   @author miao 
 *  
 */ 
var CustForm = {};
/**
 * 发送ajax请求
 * def=CustForm.post(url,data);
 * def.then(function(data){},function(status){alert(errorCode:status)})
 */
CustForm.post = function(url,data){
	 //主表字段
	var flowService = this.getService("baseService");
	return flowService.postForm(url,data);
}
/** 
 * 修改主表的数据 data为主表数据{name:name,sex:1}
 */
CustForm.setMainData = function(tablePath,data){
	if(!data){return;}
	var mainData = eval("this.getScope().data"+tablePath); //获取主表数据
	for(key in data) {
		mainData[key] =data[key];
	}
	this.$scope.$apply();
}

/**
 * 获取表单json对象。
 */
CustForm.getJson=function(){
	return  this.getScope().data;
}

/**
 * 添加行 rowData 可为空
 */
CustForm.addRow = function(tablePath,rowData){
	var rowTemp =eval("this.getScope().dataTemp."+tablePath);
	var obj=$.extend(rowData ||{}, rowTemp) ;
	
	eval("$scope.data."+tablePath+".push(obj)");
	this.$scope.$apply();
},

/**
 * 编辑行。
 * tablePath ：子表路径 eg: school.class.student
 * index： 索引
 * rowData：行数据
 */
CustForm.editRow = function(tablePath,index,rowData){
	eval("this.getScope().data"+tablePath+"[index]=rowData")
	this.$scope.$apply();
}

/**
 * 删除行
 * tablePath :子表路径 eg: school.class.student
 * index ：第几行
 */
CustForm.removeRow = function(tablePath,index,dialogService){
	var rows =eval("this.getScope().data."+tablePath);
	if(!rows){dialogService.alert("子表不存在,tablePath :"+tablePath);return;}
	
	var permision=eval("this.$scope.permission."+tablePath.replace(/./g, "$$"));
	if(rows.length==1 && permision=='b'){ dialogService.alert("子表必填！"); return ; }
	
	rows.splice(idx,1);
	!$scope.$parent.$$phase&&scope.$parent.$digest();
	
	this.$scope.$apply();
}

/**
 * 获取表单的scope对象。
 */
CustForm.getScope = function(dialogService){
	if(this.$scope) return this.$scope;
	var controllerElement =$("[ng-controller]");
	if(controllerElement.length!=1){
		dialogService.alert("scope 获取失败！");
		return;
	} 
	this.$scope = angular.element(controllerElement).scope(); 
	return this.$scope;
}
/**
 * 获取当前环境中的 service
 * serviceName：指定的服务名称。
 */
CustForm.getService = function(serviceName,dialogService){
	if(!this.$injector){
		this.$injector =angular.element($("[ng-controller]")).injector();
	}
	if(this.$injector.has(serviceName)) {
		return this.$injector.get(serviceName);
	}
	else {
		dialogService.alert(serviceName+"angular环境中没有找到该service！");
	}
}
CustForm.getModelVal = function(element){
	var inputCtrl = $(element).data("$ngModelController");
	return inputCtrl.$modelValue;
}
CustForm.getSubIndex = function(element){
	var repeatRow = $(element).closest("[ng-repeat]");
	var itemScope = repeatRow.data("$scope")
	return itemScope.$index;
}

