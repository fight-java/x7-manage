var formApp = angular.module('formApp', ['base','BpmFormService','formDirective','CustomQueryService']);

formApp.controller('formCtrl',['$scope','$compile','baseService','$rootScope','CustomQuery',function($scope,$compile,baseService,$rootScope,CustomQuery){
	$scope.mobiscroll_setting={ 
            theme: 'ios', 
            lang: 'zh',
            display: 'bottom',
            onSet: function (event, inst) {
            	
            }
        }
	
	$scope.data = eval("("+data+")");
	$scope.permission =eval("("+permission+")");
	$scope.formHtml=$("#txtForm").val().replace("&quot;","'");
	$scope.CustomQuery = CustomQuery;
	$("#pageHtml").trigger("click");
	

	$scope.add = function(path,dialogService){
		var arr = path.split(".");
		if(arr.length<2)dialogService.alert("subtable path is error!")
		var subTableName = arr[1].replace("sub_","")
		var tempData = $scope.data[arr[0]].initData[subTableName];
		
		if(!tempData)tempData={};
		var ary = eval("$scope.data." + path); 
		if(!angular.isArray(ary)) ary = [];
		
		ary.push(angular.copy(tempData));
		eval("$scope.data." + path+"=ary");
		!$rootScope.$$phase && $rootScope.$digest();
	};
	
	$scope.remove = function(path,index){
		var ary = eval("($scope.data." + path + ")");
		if(ary&&ary.length>0){
			ary.splice(index,1);
		}
	};
	$scope.initSubTableData = function(){
			var initSubTable = [];
			var data = $scope.data;
			$("[type='subGroup'][initdata]").each(function(i,item){
				initSubTable.push($(item).attr("tablename"));
			});
			
			for(var i=0,subTable;subTable=initSubTable[i++];){
				for(var boCode in $scope.data){
					var initData =data[boCode].initData[subTable];
					if(initData &&(!data[boCode]["sub_"+subTable]||data[boCode]["sub_"+subTable].length==0)){
						data[boCode]["sub_"+subTable] = [];
						data[boCode]["sub_"+subTable].push($.extend({},initData));
					}
				}
			}
			!$scope.$$phase&&$scope.$digest();
			
	}
	$scope.showJson = function(){
		var popupDialog =$.popup($("#json"))
	}
	
	$scope.showOrHide = function(id){
		if(id == "pageHtml"){
			$("#"+id).css({"display":"block"});
			$("#dataStr").css({"display":"none"});
		}else{
			$("#"+id).css({"display":"block"});
			$("#pageHtml").css({"display":"none"});
		}
	}
	
	window.setTimeout($scope.initSubTableData,1000);
	
	
	if(window.ngReady){
		window.setTimeout(ngReady,10,$scope);
	}
}]);