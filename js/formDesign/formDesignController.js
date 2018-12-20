var formId = '',
 	defId = '',
 	typeId = '',
 	type = '',
	formDefName = '',
 	formDefKey = '',
 	bos = '',
 	desc = '',
 	formType = 'pc',
 	fieldsStr = '',
 	flowFieldStr = '',
 	gangedStr = '',
 	opinionStr = '',
 	formName = '',
 	formKey = '';

function formDesignCtrl($scope,$rootScope,$compile,dialogService,baseService,ArrayToolService,$location,$state,$stateParams, $timeout) {
    formId = '';
    defId = '';
    typeId = '';
    type = ''
    formDefName = '';
    formDefKey = '';
    bos = '';
    desc = '';
    formType = 'pc';
    fieldsStr = '';
    flowFieldStr = '';
    gangedStr = '';
    opinionStr = '';
    formName = '';
    formKey = '';
	$scope.isInit = false;
	$scope.isBoDefInit = false;
	
	$scope.dicConfig={
		key:'typeKey',
		url:"${portal}/sys/sysType/v1/getByGroupKey?groupKey=DIC",
		treeConf:{pIdKey: "parentId"},
	    hideRoot: false
	}
	
	$timeout(function(){
		$scope.contentHeight = $(window).height() - 280;
	}, 100);
	var initParam = $stateParams.params;
	if(!initParam){
		dialogService.warn("未获取到表单的初始化数据").then(function(){
			$scope.back();
		});
		return;
	}
	
	//这里用try是由于某种情况下新增进这个页面会刷两次，第二次的时候出现乱码，暂时没有找到刷两次的原因，应急做法
	try {
		var initParamStr = $.base64.decode(initParam,"utf-8");
		initParam = JSON.parse(initParamStr);
	} catch (e) {
		initParam = initParam.replace(/%2F/g,"/");
		var initParamStr = $.base64.decode(initParam,"utf-8");
		initParam = JSON.parse(initParamStr);
	}
	
	
	$scope.back = function(){
		dialogService.confirm("是否返回",{}).then(function(){
			$rootScope.back();
		})
	}
	
	function initData(){
		if(initParam.typeId){
			typeId = initParam.typeId;
		}
		if(initParam.type){
			type = initParam.type;
		}
		if(initParam.formId){
			formId = initParam.formId;
		}
		if(initParam.desc){
			desc = initParam.desc;
		}
		if(initParam.name){
			formDefName = initParam.name;
		}
		if(initParam.key){
			formDefKey = initParam.key;
		}
		if(initParam.formType){
			formType = initParam.formType;
		}
		if(initParam.bos){
			bos = initParam.bos;
		}
		if(formId){
			var defer = baseService.get("${form}/form/form/v1/formDesign?formId="+formId);
			defer.then(function(data){
				gangedStr = data.ganged;
				opinionStr = data.opinion;
				formKey = data.formKey;
				formName = data.formName;
				formType = data.formType;
				fieldsStr = data.fields;
				flowFieldStr = data.flowField;
				bos = data.bos; 
				formDefName = data.name;
				formDefKey = data.key;
				type = data.type;
				defId = data.defId;
				$scope.includeFiles = data.includeFiles?data.includeFiles:'';
				
				$scope.fieldList = fieldsStr?getFieldList(JSON.parse(fieldsStr)):[]; 
				
				$scope.form={ganged:gangedStr?JSON.parse(gangedStr):[],
					     name:formName?formName:formDefName,
						 formKey:formKey?formKey:formDefKey,formType:formType};
				
				$scope.opinionConfig = opinionStr?getOpinionConfig(JSON.parse(opinionStr)):{};
				
				getBodef();
			});
		}else{
			 getBodef();
		}
	}
	
	initData();
	
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	$scope.editingField = {
	        defaultValueType: 'static',
	        ctrlType:'multitext',
	        label:''
	};

		$scope.sort = {};
		$scope.defaultOneColumn = 'col-md-12';
		$scope.OneColumnTempList = ['htbpmflowimage','history','opinion','sub'];
		$scope.editingField = {};
		$scope.opinionConfig = opinionStr?getOpinionConfig(JSON.parse(opinionStr)):{};
		$scope.fieldList = fieldsStr?getFieldList(JSON.parse(fieldsStr)):[];    
		$scope.notValidateObj = {};
		$scope.ArrayTool=ArrayToolService;
		$scope.fields=[];
		$scope.showFieldAttr=true;
		$scope.ckeckedDatevalidType='';
		$scope.BoDataList='';
		$scope.form={ganged:gangedStr?JSON.parse(gangedStr):[],
				     name:formName?formName:formDefName,
					 formKey:formKey?formKey:formDefKey};
	    var isSelectCtl=false;//是否选择控件
	    
	    if(formType == 'mobile'){
	    	$scope.status = {
    	        isBasicOpen: true,
    	        isSeniorOpen: false,
    	        isFlowOpen: false,
    	        isOtherOpen: false,
    	        isColumnOpen:false,
    	        isColLableOpen:false,
    	        defaultColumnTemp:'col-md-12',
    	        defaultSubColumnTemp:'col-md-12'
    	    };
	    	
	    }else{
	    	$scope.status = {
    	        isBasicOpen: true,
    	        isSeniorOpen: false,
    	        isFlowOpen: false,
    	        isOtherOpen: false,
    	        isColumnOpen:false,
    	        isColLableOpen:false,
    	        defaultColumnTemp:'col-md-6',
    	        defaultSubColumnTemp:'col-md-4'
    	    };
	    }
	    
	    function getBodef(){
	    	var bosJson= bos?bos:initParam.bos;
	    	if(bosJson) bosJson=parseToJson(bosJson);
	    	var boIds=[];
	    	for(var i=0;i<bosJson.length;i++){
	    		boIds.push(bosJson[i].id);
	    	}
	    	$scope.boIds =boIds;
			var get = baseService.post("${form}/bo/def/v1/getBOTree",boIds.join(","))
			get.then(function(data){
				for(var i=0,child;child=data.children[i++];){
					converstData(child);
				}
				
				$scope.BoDataList = angular.copy($scope.fields);
				
				$scope.isBoDefInit = true;
				
			},function(code){
				dialogService.fail("error!"+code);
			})
		};
		
		function getFieldList(fields){
			var list = [];
			var index = 0;
			for (var i = 0; i < fields.length; i++) {
				var table = fields[i];
				if(table.children&&table.type!='sub'){
					var children = table.children;
					for (var j = 0; j < children.length; j++) {
						//if(children[j].fieldType=='field'){
							list[index] = children[j];
							index++;
						//}
					}
				}
			}
			if(flowFieldStr){
				var len = list.length;
				var flowField = JSON.parse(flowFieldStr);
				for (var i = 0; i < flowField.length; i++) {
					list[len+i] = flowField[i];
				}
			}
			return list;
		}
		
		//将上下级类型的主子表关系。转化成为list<表> 类型
		function converstData( treeNode){
			var ary = [];
			var outTime = 600;
			ary.push($scope.treeNode2Field(treeNode));
			
			for(var int = 0,child; child=treeNode.children[int++];) {
				if(child.children && child.children.length>0 && child.nodeType=="sub"){
					child.parentName=treeNode.name;
					ary.push($scope.treeNode2Field(child));
				}
			}
			if(! $scope.fields) $scope.fields=[];
			if($scope.fields.length>0){
				for(var i = 0;i<$scope.fields.length;i++){
					if($scope.fields[i].path == treeNode.path){
						outTime = 100;
						break;
					}
				}
			}
			
			for(var i = 0,f; f=ary[i++];){
				if($("."+f.entId+"ent").length==0){
					f.sn = $scope.fields.length;
					$scope.fields.push(f);
				}
			}
				
			!$scope.$$phase&&($scope.$digest());
		}
		
		/**将BO转成 {表.children(字段)}的形式*/
		$scope.treeNode2Field = function(treeNode){
			if(treeNode.children && treeNode.children.length>0){
				var table = getField(treeNode);
				table.children =[];
				for (var int = 0,node;node=treeNode.children[int++];) {
					if(node.children && node.children.length>0||node.nodeType!="field")continue;
					//获取字段
					var field =getField(node,int-1);
					field.tableName=table.name;

					table.children.push(field);
				}
				return table;
			}else{
				return getField(treeNode);
			}
			//boDefAlias
			function getField(node,sn){
				var isRequired = node.isRequired ? true : false;
				var field = {
						name	:	node.name,
						desc	:	node.desc, 
						path	:	node.path,
						type	:	node.dataType||node.nodeType, 		//字段的类型。表的类型 sub main
						fieldType:	node.nodeType,
						boAttrId:	node.id,		
						boDefId	:	node.boDefId, 	
						entId	:	node.nodeType=="field"?node.entId:node.id,
						sn		:	sn,  
						attrLength :   node.nodeType=="field"?node.attrLength:0,//字段长度
						decimalLen :   node.nodeType=="field" && node.dataType=='number'?node.decimalLen:0,//小数位长度
						validRule:	{"required":isRequired},
						required: isRequired,
						relation:	node.type  // 子表的时候才有用。为表的关系 
					}; 
				
				//给字段一个默认的控件类型
				$($scope.controlType).each(function(index,control){
					if(isInArray(control.supports,field.type)){
						field.ctrlType = control.id;
						return false;
					}
				});
				
				if(field.type=="number"){
					try {
						//添加对整数位长度的校验
						field.validRule["maxIntLen"] = node.intLen;
						//添加对小数位长度的校验
						field.validRule["maxDecimalLen"] = node.decimalLen;
					} catch (e) {}
					
					var json = [{name:"数字",text:"number"}];
					field.validRule["rules"] = json;
				}
				if(field.type=="date"){
					field.option={};
					field.option.dataFormat =node.format;
					field.option.unmodifiable = true;
					var json = [{name:"日期",text:"date"}];
					if(node.format == 'HH:mm:ss'){
						 json = [{name:"时间",text:"time"}];
					}
					field.validRule["rules"] = json; 
				}
				if(field.type=="varchar"){
					try {
						//添加对字符串长度验证
						field.validRule["maxLength"] = node.attrLength;
					} catch (e) {}
					
				}
				
				return field
			}
		} 
		
	    $scope.spinOption2 = {
	        min: 0,
	        max: 2147483647,
	        step: 1,
	        decimals: 0,
	        boostat: 5,
	        maxboostedstep: 10,
	        verticalbuttons: true
	    }
		
	    $scope.showContentTyp =function(type) {
	      if(type==0){
	    	  showFieldAttr=true;
	      }else{
	    	  showFieldAttr=false;
	      }
	   }
	    
	    $scope.onChangeIsBindBtn = function(){
	    	for (var i = 0; i < $scope.fieldList.length; i++) {
				if($scope.fieldList[i].uuid==$scope.editingField.uuid){
					if(!$scope.editingField.bindEventjson){
						$scope.editingField.bindEventjson = {name:'选择',isDiy:false};
					}
					if($scope.editingField.isBindBtn){
						$scope.fieldList[i].ctrlType = 'onetextBtn';
			    		$scope.editingField.ctrlType = 'onetextBtn';
			    	}else{
			    		$scope.fieldList[i].ctrlType = 'onetext';
			    		$scope.editingField.ctrlType = 'onetext';
			    	}
					var $currentDiv = $('div[uuid='+$scope.editingField.uuid+']');
					var html = $currentDiv[0].outerHTML;
					var $parentDiv = $currentDiv.parent();
					$parentDiv.empty();
					var template = angular.element(html);
					$scope.field = $scope.fieldList[i];
					var newElement = $compile(template)($scope);
					 angular.element($parentDiv).append(newElement);
					break;
				}
			}
	    }
	    
	    $scope.onChangeIsBindIdentity = function(){
	    	for (var i = 0; i < $scope.fieldList.length; i++) {
				if($scope.fieldList[i].uuid==$scope.editingField.uuid){
					if(!$scope.editingField.bindIdentityjson){
						$scope.editingField.bindIdentityjson = {isEdit:false};
					}
					break;
				}
			}
	    }
	    
	    $scope.templates = {
	    	'onetext': '<input type="text" class="form-control">',
	        'onetextBtn': '<div class="input-group">'
				 +'	<input type="text" class="form-control">'
				 +'	<span class="input-group-btn">'
				 +'		<button type="button" disabled class="btn btn-default">{{showBindEventBtnName(field, child)}}</button>'
				 +'	</span>'
				 +'</div>',
	        'multitext': '<textarea type="text" rows="1" class="form-control"></textarea>',
	        'select': '<select class="form-control"></select>',
	        'multiselect': '<select class="form-control" multiple="" ></select>',
	        'radio': '<div class="p-xxs">'
	        		+'	<label ng-repeat="choice in field.option.choice" ng-if="field.ctrlType!=\'sub\' && choice.value" class="radio-inline"><input type="radio">{{choice.value}}</label>'
	        		+'	<label ng-repeat="choice in child.option.choice" ng-if="field.ctrlType==\'sub\' && choice.value" class="radio-inline"><input type="radio">{{choice.value}}</label>'
	        		+'</div>',
	        'checkbox': '<div class="p-xxs">'
	        		   +'	<label ng-repeat="choice in field.option.choice" ng-if="field.ctrlType!=\'sub\' && choice.value" class="checkbox-inline"><input type="checkbox">{{choice.value}}</label>'
	        		   +'	<label ng-repeat="choice in child.option.choice" ng-if="field.ctrlType==\'sub\' && choice.value" class="checkbox-inline"><input type="checkbox">{{choice.value}}</label>'
	        		   +'</div>',
	        'date': '<div class="input-group">'
	   			   +'	<input type="text" class="form-control">'
	   			   +'	<span class="input-group-addon">'
	   			   +'		<i class="fa fa-calendar"></i>'
	   			   +'	</span>'
	   			   +'</div>',
	        'selector': '<div class="input-group">'
	   			   	   +'	<input type="text" class="form-control">'
	   			   	   +'	<span class="input-group-addon">'
	   			   	   +'		<i class="fa fa-user"></i>'
	   			   	   +'	</span>'
	   			   	   +'</div>',
	        'dic': '<select class="form-control"></select>',
	        'dialog': '<div class="input-group">'
					 +'	<input type="text" class="form-control">'
					 +'	<span class="input-group-btn">'
					 +'		<button type="button" disabled class="btn btn-default">{{showDialogBtnName(field, child)}}</button>'
					 +'	</span>'
					 +'</div>',
	        'fileupload': '<div class="input-group">'
	        			 +'	<input type="text" class="form-control">'
						 +'	<span class="input-group-addon">'
						 +'		<i class="fa fa-upload"></i>'
						 +'	</span>'
	        			 +'</div>',
	        'htbpmflowimage': '<object svg-data="../../css/svg/flowImage.svg" type="image/svg+xml" style="width:{{field.option.width}}px;height:{{field.option.height}}px;"></object>',
	        'history': '<object svg-data="../../css/svg/history.svg" type="image/svg+xml" style="width:{{field.option.width}}px;height:{{field.option.height}}px;"></object>',
	        'opinion': '<div class="form-control" ht-bpm-opinion="data.__form_opinion.{{field.name}}" opinion-history="" ></div>',
	        'sub': '<div class="sub-container">'
	        	  +'	<div class="sub-header" ng-click="selectField(field)">'
	        	  +'		<label ng-bind="field.desc"></label>'
	        	  +'	</div>'
	        	  +'	<div class="dropto sub-body">'
	        	  +'		<div class="field-item {{child.widthClass}}" ng-class="{\'selected\':editingField===child}" ng-repeat="child in field.children" ng-click="selectField(child, $event)">'
	        	  +'    		<div class="form-group agile-detail">'
	        	  +'      			<label ng-bind="child.desc" class="control-label lable-left"></label>'
	        	  +'	      		<div class="content-right">'
	        	  +'	      			<div field-template="child" uuid="{{child.uuid}}" puuid="{{child.puuid}}" itemtype="{{child.ctrlType}}" templates="templates"></div>'
	        	  +'	      		</div>'
	        	  +'	   		</div>'
	        	  +'			<div ng-if="editingField===child" class="tooltip-container" style="bottom:3px;">'
				  +'				<a  class="btn btn-danger fa fa-trash-o" title="移除" ng-click="removeField(child)"></a>'
				  +'			</div>'
	        	  +' 		</div>'
	        	  +'	</div>'
	        	  +'	<div class="sub-footer" style="height:30px;" ng-click="selectField(field)">'
	        	  +'	</div>'
	        	  +'</div>',
	        'customQuery': '<select class="form-control"></select>'
	    };
	    
	    if(formType == 'mobile'){
	    	$scope.columnTemplates = [
	 	    	 {name:'单列',fname:'整行', width:'col-md-12'}
	 	    ];
	 	    $scope.subColumnTemplates = [
	 	    	{name:'两列',fname:'1/2行', width:'col-md-6'}
	 	    ];
	    	
	    }else{
	    	$scope.columnTemplates = [
	 	    	 {name:'单列',fname:'整行', width:'col-md-12'},
	 	    	 {name:'两列',fname:'1/2行', width:'col-md-6'},
	 	    	 {name:'三列',fname:'1/3行', width:'col-md-4'},
	 	    	 {name:'四列',fname:'1/4行', width:'col-md-3'}
	 	    ];
	 	    $scope.subColumnTemplates = [
	 	    	{name:'两列',fname:'1/2行', width:'col-md-6'},
	 	    	{name:'三列',fname:'1/3行', width:'col-md-4'},
	 	    	{name:'四列',fname:'1/4行', width:'col-md-3'},
	 	    	{name:'六列',fname:'1/6行', width:'col-md-2'}
	 	    ];
	    }
	    
	    if(formType == "mobile"){
	    	$scope.fieldLib = {
	    	        basic: [
	    	            {name:'单行', ctrlType:'onetext', icon: 'i-cursor'},
	    	            {name:'多行', ctrlType:'multitext', icon: 'navicon'},
	    	            {name:'下拉框', ctrlType:'select', icon: 'chevron-circle-down'},
	    	            {name:'单选按钮', ctrlType:'radio', icon: 'dot-circle-o'},
	    	            {name:'复选框', ctrlType:'checkbox', icon: 'check-square-o'},
	    	            {name:'日期', ctrlType:'date', icon: 'calendar'},
	    	            {name:'数据字典', ctrlType:'dic', icon: 'book'},
	    	            {name:'文件上传', ctrlType:'fileupload', icon: 'paperclip'},           
	    	            {name:'子表', ctrlType:'sub', icon: 'table', notSuportSub: true}
	    	        ],
	    	        flow: [
	    	            
	    	        ],
	    	        other: [
	    	            {name:'描述', icon: 'file-text-o'},
	    	            {name:'选项卡', icon: 'th-list'},
	    	            {name:'文本', icon: 'edit'},
	    	            {name:'分页', icon: 'dedent '}
	    	        ]
	    	    };
	    }else{
	    	$scope.fieldLib = {
	    	        basic: [
	    	            {name:'单行', ctrlType:'onetext', icon: 'i-cursor'},
	    	            {name:'多行', ctrlType:'multitext', icon: 'navicon'},
	    	            {name:'下拉框', ctrlType:'select', icon: 'chevron-circle-down'},
	    	            {name:'单选按钮', ctrlType:'radio', icon: 'dot-circle-o'},
	    	            {name:'复选框', ctrlType:'checkbox', icon: 'check-square-o'},
	    	            {name:'日期', ctrlType:'date', icon: 'calendar'},
	    	            {name:'选择器', ctrlType:'selector', icon: 'drivers-license-o'},
	    	            {name:'数据字典', ctrlType:'dic', icon: 'book'},
	    	            {name:'文件上传', ctrlType:'fileupload', icon: 'paperclip'},           
	    	            {name:'子表', ctrlType:'sub', icon: 'table', notSuportSub: true},
	                    {name:'对话框', ctrlType:'dialog',icon: 'search-plus'},
	    	            {name:'关联数据',ctrlType:'customQuery', icon: 'recycle'}
	    	        ],
	    	        flow: [
	    	            {name:'流程图', ctrlType:'htbpmflowimage', icon: 'photo', notSuportSub: true},
	    	            {name:'意见', ctrlType:'opinion', icon: 'commenting-o', notSuportSub: true},
	    	            {name:'审批历史', ctrlType:'history', icon: 'history', notSuportSub: true}
	    	        ],
	    	        other: [
	    	            {name:'描述', icon: 'file-text-o'},
	    	            {name:'选项卡', icon: 'th-list'},
	    	            {name:'文本', icon: 'edit'},
	    	            {name:'分页', icon: 'dedent '}
	    	        ]
	    	    };
	    }
	    
	    $scope.selectors = [
	    	{name: "用户选择器", alias: "user-selector", fields: [{key:"id", label:"用户ID"},{key:"account", label:"用户账号"},{key:"fullname", label:"用户姓名"}]},
	    	{name: "组织选择器", alias: "org-selector", fields: [{key:"id", label:"组织ID"},{key:"code", label:"组织代码"},{key:"name", label:"组织名称"}]},
	    	{name: "角色选择器", alias: "role-selector", fields: [{key:"id", label:"角色ID"},{key:"code", label:"角色代码"},{key:"name", label:"角色名称"}]},
	    	{name: "职务选择器", alias: "job-selector", fields: [{key:"id", label:"职务ID"},{key:"code", label:"职务代码"},{key:"name", label:"职务名称"}]},
	    	{name: "岗位选择器", alias: "pos-selector", fields: [{key:"id", label:"岗位ID"},{key:"code", label:"岗位代码"},{key:"name", label:"岗位名称"}]},
	    	{name: "维度选择器", alias: "dem-selector", fields: [{key:"id", label:"维度ID"},{key:"code", label:"维度代码"},{key:"name", label:"维度名称"}]}
	    ];
	    
	    //alias为对应指令
	    $scope.bindEvents = [
	         {name: "用户组授权", alias: "ht-auth-set-event"}
	    ];

	    setTimeout(function(){
	        $(".dragfrom").each(function (i, el) {
	            Sortable.create(el, {
	                sort: false,
	                group: {
	                    name:'advanced',
	                    pull: 'clone',
	                    put: false
	                },
	                animation: 150
	            });
	        });
	        $scope.initDroptoArea(".dropto");
	    },100);
	    
	    $scope.initDroptoArea = function(dropto){
	    	$(dropto).each(function (i, el) {
	        	$scope.sort = Sortable.create(el, {
	                sort: true,
	                group: {
	                    name:'advanced',
	                    pull: false,
	                    put: true
	                },
	                animation: 150,
	                onAdd: function (evt){
	                	if($(evt.target).hasClass("sub-body")){
	                		$scope.addSubField(evt.item);
	                	}
	                    else{
	                    	$scope.addField(evt.item);
	                    }
	                	// 添加字段缓冲期
	                	$scope.onAddEventPeriod = true;
	                	setTimeout(function(){
	                		$scope.onAddEventPeriod = false;
	                	}, 10);
	                },
	                onSort: function(evt){
	                	// 因为添加字段时会先触发onAdd事件，后触发onSort事件，在onSort事件中会错误的对字段进行排序调整，所以通过判断 添加事件缓冲期 来避免
	                	if($scope.onAddEventPeriod) return;
	                	// 排序时更新字段列表中的顺序
	                	var oldIndex = evt.oldIndex,
	                		newIndex = evt.newIndex;
	                	if(oldIndex==newIndex) return;
	                	
	                	var fieldEle = $("[field-template]",evt.item),
	                		subTableEle = $("[sub-template]",evt.item),
	                		uuid = fieldEle.attr("uuid"),
	                		puuid = fieldEle.attr("puuid");
	                	
	                	if(subTableEle && subTableEle.length>0){
	                		uuid = subTableEle.attr("uuid");
	                		puuid = null;
	                	}
	                	
	                	var ary = $scope.fieldList;
	                	
	                	if(puuid){
	                		var subField = $scope.getFieldByUUID(puuid);
	                		
	                		if(!subField || !subField.children || subField.children.length == 0){
	                			throw new Error("It seems that has sorted a field in sub-table, but we get a empty fieldList in sub-table.");
	                		}
	                		ary = subField.children;
	                	}
	                	// 从前面拖到后面
	                	if(newIndex > oldIndex){
	                		var temp = ary[oldIndex];
	                		for(var i = oldIndex; i < newIndex; i++){
		                		ary[i] = ary[i+1];
		                	}
	                		ary[newIndex] = temp;
	                	}
	                	// 从后面拖到前面
	                	else{
	                		var temp = ary[oldIndex];
	                		for(var i = oldIndex; i > newIndex; i--){
		                		ary[i] = ary[i-1];
		                	}
	                		ary[newIndex] = temp;
	                	}
	                	!$scope.$$phase&&$scope.$digest();
	                }
	            });
	        });
	    	$scope.isInit = true;
	    }
	    
	    //生成uuid
	    function getMathUUID(len, radix){
	    	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
	    	var chars = CHARS, uuid = [], i; 
		    radix = radix || chars.length; 
		    if (len) { 
		      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix]; 
		    } else { 
		      var r; 
		      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'; 
		      uuid[14] = '4'; 
		      for (i = 0; i < 36; i++) { 
		        if (!uuid[i]) { 
		          r = 0 | Math.random()*16; 
		          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]; 
		        } 
		      } 
		    } 
		    return uuid.join(''); 
	    }
	    
	    function getSelectedItemType(item){
	    	item?item:getSelectedDocument();
	    	if(item){
	    		var itemTypeEle = $(item).find('div[itemtype]');
	    		if(itemTypeEle.length>0){
	        		return itemTypeEle.attr('itemtype');
	        	}
	    	}
	    	return null;
	    }
	    
	    //获取当前选中元素
	    function getSelectedDocument(){
	    	var selected = $('div.dropto div.field-item.selected');
	    	if(selected.length>0){
	    		return selected[0];
	    	}
	    	return null;
	    }
	    
	    //获取意见数组
	    function getOpinionList(){
	    	var opinionList = [];
	    	angular.forEach($scope.opinionConfig, function(value, key) {
    		  this.push(value);
    		}, opinionList);
	    	return opinionList;
	    }
	    
	    //获取意见对象
	    function getOpinionConfig(array){
	    	var opinionConfig = {};
	    	angular.forEach(array ,function(data,index,array){
	    		opinionConfig[data['name']]= array[index];
    		});
	    	return opinionConfig;
	    }
	    
	    $scope.showDialogBtnName = function(field, child){
	    	var btnName = null;
	    	if(field.ctrlType=='sub'){
	    		if(child.customDialogjson){
	    			btnName = child.customDialogjson.name;
	    		}
	    	}
	    	else if(field.customDialogjson){
	    		btnName = field.customDialogjson.name;
	    	}
	    	return btnName || '选择';
	    }
	    
	    $scope.showBindEventBtnName = function(field, child){
	    	var btnName = null;
	    	if(field.ctrlType=='sub'){
	    		if(child.bindEventjson){
	    			btnName = child.bindEventjson.name;
	    		}
	    	}
	    	else if(field.bindEventjson){
	    		btnName = field.bindEventjson.name;
	    	}
	    	return btnName || '选择';
	    }
	    
	    
	    $scope.opinionSet = function(){

            var item = getSelectedDocument();
            var opinionEle = $(item).find('div[ht-bpm-opinion]');
            if(item&&opinionEle.length>0){
                var opinionStr = $(opinionEle).attr('ht-bpm-opinion');
                var propname = opinionStr?opinionStr.split('.__form_opinion.')[1]:'';
                var passConf=$scope.opinionConfig[propname];
                dialogService.page('opinionPage', {alwaysClose: false,pageParam:{passConf:passConf}}).then(function(result){
                    var opinionConf=result.result;
                    var html = "<div class='form-control' ht-bpm-opinion='data.__form_opinion."+opinionConf.name+"' opinion-history='opinionList."+opinionConf.name+"' permission='permission.opinion."+opinionConf.name+"' style='width:"+opinionConf.width+opinionConf.widthunit+"!important;height:"+opinionConf.height+opinionConf.heightunit+"'></div>";
                    var opinionObj = $('div.dropto div.field-item').find('div[ht-bpm-opinion="data.__form_opinion.'+opinionConf.name+'"]');
                    if(opinionObj&&opinionObj.length>0&&$(opinionObj).parent().attr('uuid')!=$(item).find('div[uuid]').attr('uuid')){
                        dialogService.fail("名称为【"+opinionConf.name+"】的意见标识已存在，设置失败！");
                        dialogService.close(result.index);
                        return;
                    }else{
                        opinionEle.replaceWith(html);
                        $scope.editingField.desc = opinionConf.desc;
                        $scope.editingField.name = opinionConf.name;
                        $scope.editingField.option = {};
                        $scope.editingField.option.width = opinionConf.width;
                        $scope.editingField.option.height = opinionConf.height;
                        $scope.opinionConfig[opinionConf.name]=opinionConf;
                        dialogService.close(result.index);
					}
                });
			}
	    }

	    $scope.addField = function(ele){
	        var parent = $(ele).parent(),
	            children = parent.children(),
	            type = 'input',
	            label = ele.innerText;

	        for(var i=0,c;c=children[i++];){
	            if(c===ele){
	                type = $(c).attr("type");
	                $scope.$apply(function(){
	                	var uuid=getMathUUID(16,16);
	                	var newField = {
		                         name:label,
		                         desc:label,
		                         ctrlType:type,
		                         uuid:uuid,
		                         widthClass:$.inArray(type, $scope.OneColumnTempList)==-1?$scope.status.defaultColumnTemp:$scope.defaultOneColumn
		                    };
	                	if(type=='sub'){
	                		newField.children = [];
	                		newField.defaultColumn = $scope.status.defaultSubColumnTemp;
	                		
	                	}else if(type=='dialog'){
	                		newField.customDialogjson= {name:'选择'};
	                	}else if(type=='onetext'||type=='onetextBtn'){
	                		newField.bindEventjson= {name:'选择'};
	                	}
	                    $scope.fieldList.splice(i-1, 0, newField);
	                    //新拖拽的控件，没有任何配置，所以将其放入到校验不通过的数组里。
	                    if($.inArray(type, $scope.OneColumnTempList)<0){
	                    	$scope.notValidateObj[uuid]='属性名称必填';
	                    }
	                });
	                ele.remove();
	            }
	        }
	    }
	    
	    $scope.addSubField = function(ele){
	        var parent = $(ele).parent(),
	            children = parent.children(),
	            type = 'input',
	            label = ele.innerText,
	            puuid = $(ele).parents('div[uuid]').attr('uuid');
	        
	        for(var i=0,c;c=children[i++];){
	            if(c===ele&&puuid){
	                type = $(c).attr("type");
	                if($(c).attr("not-suport-sub")){
	                	ele.remove();
	                	dialogService.msg("该类型不支持在子表中使用.");
	                	break;
	                }
	                var pIndex = $scope.getFieldByUUID(puuid,null,true);
	                $scope.$apply(function(){
	                	var subTableField = $scope.fieldList[pIndex];
	                	var uuid=getMathUUID(16,16);
	                	$scope.selectField(subTableField);
	                	var newSubField = {
	                			 name:label,
		                         desc:label,
		                         ctrlType:type,
		                         uuid:uuid,
		                         puuid:puuid,
		                         widthClass: subTableField.defaultColumn
		                    };
	                	 if(type=='dialog'){
	                		 newSubField.customDialogjson= {name:'选择'};
		                	}
	                	subTableField.children.splice(i-1, 0,newSubField);
	                	//新拖拽的控件，没有任何配置，所以将其放入到校验不通过的数组里。
	                	if($.inArray(type, $scope.OneColumnTempList)<0){
	                		$scope.notValidateObj[uuid]='属性名称必填';
	                    }
	                });
	                ele.remove();
	            }
	        }
	    }
	    
	    //根据uuid查找field
	    $scope.getFieldByUUID = function(uuid,puuid,isIndex){
	    	var uid = puuid?puuid:uuid;
	    	for (var i = 0; i < $scope.fieldList.length; i++) {
	    		var pfield = $scope.fieldList[i];
				if(pfield.uuid==uid){
					if(puuid){
						var chirdrens = pfield.children;
						for (var j = 0; j < chirdrens.length; j++) {
							if(chirdrens[j].uuid==uuid){
								return isIndex?j:chirdrens[i];
							}
						}
					}else{
						return isIndex?i:pfield;
					}
				}
			}
	    }

	    $scope.selectUser = function(){
	        //dialogService.page("views/user_selector.html", {title:'选择用户',btn:['确定','取消']});
	    }
	    
		//------------->以下是数组
		//常用的字段验证列表
		$scope.common_ruleList=[];
		for(var i = 1 ;i < ConstUtil.rules.length ; i++){
			var tempRule = ConstUtil.rules[i];
			if(tempRule.formRule){
				$scope.common_ruleList.push({
					name : tempRule.title,
					text : tempRule.name,
					msg:tempRule.msg,
					isDefault:true
				})
			}
		}
		
		//选择了一个常用验证
		$scope.selectCommonRule=function(key){
			if(key==null||key=="") return;
			var rule = {};
			for(var i = 0 ; i < $scope.common_ruleList.length ; i++){
				if($scope.common_ruleList[i].text == key) {
					rule = $scope.common_ruleList[i];
					break;
				}
			}
			$scope.newRule=true;
			$scope.editingRule={};
			$scope.editingRule.name=rule.name;
			$scope.editingRule.tip=rule.msg;
			$scope.editingRule.text=rule.text;
			$scope.editingRule.isDefault=rule.isDefault;
			$scope.saveEditingRule(true);
			$scope.commonRule="";
			this.commonRule = "";
		};
		
		//保存一个字段验证
		$scope.saveEditingRule=function(notdoValid){
			if(!notdoValid){// TODO 校验 
				dialogService.fail("请检查表单数据是否正确");
				return false ;
			}
			//初始化
			if($scope.editingField.validRule==null) {
				$scope.editingField.validRule={};
			}
			if($scope.editingField.validRule.rules==null) {
				$scope.editingField.validRule.rules=[];
			}
			if($scope.newRule){
				$scope.editingField.validRule.rules.push($scope.editingRule);
			}else{	
				editingRule.name=$scope.editingRule.name;
				editingRule.text=$scope.editingRule.text;
				editingRule.tip=$scope.editingRule.tip;
			}
			$scope.editingField.validRule.rules.unique(function(n, o){
				return n.text===o.text;
			});
			editingRule=null;
			$scope.editingRule={};
			$scope.newRule=false;
			!$scope.$$phase&&$scope.$digest();
		};
		
		//子表调整布局
		$scope.$watch("editingField.defaultColumn",function(newVal,oldVal){
			if(newVal!==oldVal){
				angular.forEach($scope.editingField.children, function(item){
					// 子表中没有单列布局的字段
					item.widthClass = newVal;
				});
			}
		},false);
		
		// 是否单行布局字段
		$scope.isOneColumnField = function(field){
			var r = $.inArray(field.ctrlType, $scope.OneColumnTempList);
			return r!=-1;
		}
		
		//全局调整列宽
		$scope.$watch("status.defaultColumnTemp",function(newVal,oldVal){
			if(newVal!==oldVal){
				for (var i = 0; i < $scope.fieldList.length; i++) {
					if(!$scope.isOneColumnField($scope.fieldList[i])){
						$scope.fieldList[i].widthClass = newVal; 
					}
				}
			}
		},false);
		
		$scope.cacadeRemoveField = function(ary, uuid){
			for (var i = 0; i < ary.length; i++) {
				var current = ary[i];
				if(current.uuid==uuid){
					ary.splice(i,1);
					var item = getSelectedDocument();
					if(item){
						//如果是意见控件，则删除意见相关配置
						var opinionEle = $(item).find('div[ht-bpm-opinion]');
				    	if(item&&opinionEle.length>0){
				    		var opinionStr = $(opinionEle).attr('ht-bpm-opinion');
				    		var propname = opinionStr?opinionStr.split('.__form_opinion.')[1]:'';
				    		delete $scope.opinionConfig[propname];
				    	}
					}				
					break;
				}
				if(current.children && current.children.length > 0){
					$scope.cacadeRemoveField(current.children, uuid);
				}
			}
		}

	$scope.removeField = function(field){
		if(!field || !field.uuid){
			dialogService.msg("无法移除该字段.");
			return;
		}
		var uuid = field.uuid;
		//如果删除的控件uuid和当前选择的控件一致，则删除当前选择的控件。
		if($scope.editingField.uuid==uuid) $scope.editingField = {};
		//移除该控件的校验不通过记录
		delete $scope.notValidateObj[uuid];
		$scope.cacadeRemoveField($scope.fieldList, uuid);
	}
	
	//按照页面dom的顺序对fieldList进行排序
	function sortFieldList(puuid){
		var arr = [];
		if(!puuid){
			$('#fieldListBox').find('[uuid]').not("[puuid]").each(function(){
				var me = $(this),
					uuid = me.attr("uuid");
				
				for(var j=0,f;f=$scope.fieldList[j++];){
					if(f && f.uuid==uuid) arr.push(f); 
				}
			});
		}
		else{
			$("#fieldListBox").find("[puuid='"+puuid+"']").each(function(){
				var me = $(this),
					uuid = me.attr("uuid");
				
				for(var j=0,f;f=$scope.fieldList[j++];){
					 if(f.ctrlType=='sub'&& f.uuid==puuid){
						 var children = f.children;
						 for(var i=0,c;c=children[i++];){
							 if(c && c.uuid==uuid) arr.push(c); 
						}
					 }
				}
			});
		}
		return arr;
	}
	
	function getEntity(tableName){
		var obj = null;
		angular.forEach($scope.BoDataList, function(boData){
			if(!tableName && boData['type']=='main'){
				obj = angular.copy(boData);
			}
			else if(boData['name']==tableName){
				obj = angular.copy(boData);
			}
		});
		return obj;
	}
	
	//将fieldList数组转化成，list > table> fields类型的数组
	function fmtFieldList(){
		var oldArr = [];
		var sortList=sortFieldList();
		var expandItem = getEntity();
		expandItem["children"] = sortList;
		oldArr.push(expandItem);
		//遍历所有子表
		angular.forEach(sortList, function(mainField){
			if(mainField.ctrlType=='sub'){
				var subChildren = sortFieldList(mainField.uuid),
					exp = getEntity(mainField.tableName);
				
				exp["children"] = subChildren;
				oldArr.push(exp);
			}
		});
		return oldArr;
	}
	
	//获取流程字段
	function getFlowField(){
		var flowField = [];
		var sortList=sortFieldList();
		for(var j=0,f;f=sortList[j++];){
			if($.inArray(f.ctrlType, $scope.OneColumnTempList)!=-1&&f.ctrlType!='sub'){
				flowField.push(f);   
			}
		}
		return flowField;
	}
	
	//提交之前的检验
	 function beforeSubmitCkeck(){
		if($scope.fieldList.length==0){
			dialogService.fail("请至少添加一个字段！");
			return false;
		}
		//$scope.notValidateObj[$scope.editingField.uuid]=errMsg;
		var fieldPathObj={};
		var repeatPathObj={path:''};
		for(var i=0,f;f=$scope.fieldList[i++];){
			//如果是以下几种控件。不需要绑定实体，所以不做实体绑定相关校验
			if('sub,opinion,htbpmflowimage,history,'.indexOf(f.ctrlType+',')<0) {
				if(fieldPathObj.hasOwnProperty(f.fieldPath)){
					if(repeatPathObj.path==''){
						repeatPathObj.path=f.fieldPath;
						repeatPathObj.boName=f.boName;
						repeatPathObj.desc=fieldPathObj[f.fieldPath]+'，'+f.desc;
					}else if(repeatPathObj.path==f.fieldPath){
						repeatPathObj.desc+='，'+f.desc;
					}				
				}else{
					fieldPathObj[f.fieldPath]=f.desc;
				}
			}
			//如果是子表
			if('sub,'.indexOf(f.ctrlType+',')>-1) {
			  for(var z=0,subit;subit=f.children[z++];){
					//如果是以下几种控件。不需要绑定实体，所以不做实体绑定相关校验
					if('sub,opinion,htbpmflowimage,history,'.indexOf(subit.ctrlType+',')<0) {
						if(fieldPathObj.hasOwnProperty(subit.fieldPath)){
							if(repeatPathObj.path==''){
								repeatPathObj.path=subit.fieldPath;
								repeatPathObj.boName=subit.boName;
								repeatPathObj.desc=fieldPathObj[subit.fieldPath]+'，'+subit.desc;
							}else if(repeatPathObj.path==subit.fieldPath){
								repeatPathObj.desc+='，'+subit.desc;
							}				
						}else{
							fieldPathObj[subit.fieldPath]=subit.desc;
						}
					}
			  }
			}
		}
		if(repeatPathObj.path !=''){
			dialogService.fail("属性【"+repeatPathObj.boName+"】,绑定了多个控件【"+repeatPathObj.desc+'】,只能绑定一个');
			return false;
		}

    	//提交之前校验改控件的配置是否正确
		if(JSON.stringify($scope.editingField) !='{}'){
			var errMsg =validateFormDef();
	    	if(errMsg !=''){
	    		$scope.notValidateObj[$scope.editingField.uuid]=errMsg;
	    		dialogService.msg(errMsg, {icon:2, offset:'t', time:5000});
				return false;
	    	}else{
	    		delete $scope.notValidateObj[$scope.editingField.uuid];
	    	}
		}
    	if(JSON.stringify($scope.notValidateObj) !='{}'){
			for(var uuid in $scope.notValidateObj){
				if(uuid){
					for(var i=0,f;f=$scope.fieldList[i++];){
						if(f.ctrlType=='sub'){
							for(var j=0,subf;subf=f.children[j++];){
								if(subf.uuid==uuid){
									 $scope.selectField(subf);
									 dialogService.msg($scope.notValidateObj[uuid], {icon:2, offset:'t', time:5000});
									 return false;
								}
							}
						}else{
							if(f.uuid==uuid){
								 $scope.selectField(f);
								 dialogService.msg($scope.notValidateObj[uuid], {icon:2, offset:'t', time:5000});
								 return false;
							}
						}
				
					}
				}
			}
		}
    	return true;
	}
	
	$scope.preview= function(){
		if(!beforeSubmitCkeck()) return;
		window.onbeforeunload  =  null ;
		var design = getDesignJson();
		
		var param = {};
		param.id = formId;
		param.bos =  bos instanceof Array? JSON.stringify(bos):bos; 
		param.design = design;
		param.formType = formType;
		param.form = JSON.stringify($scope.form);
		if(formType == 'mobile'){
			dialogService.page('form.formDesignListPreviewMobileDesign', {
                alwaysClose: false,
                area:['350px', '650px'],
                pageParam: param
            }).then(function (r) {
                dialogService.close(r.index);
            });
		}else{
			dialogService.sidebar("form.formDesignListPreviewDesign", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: param});
		}
	};
		
	$scope.save = function(){
		if(!beforeSubmitCkeck()) return;
		var formStr = getDesignJson();
		var url="${form}/form/form/v1/saveDesign";
		var rtn = baseService.post(url,formStr);
		rtn.then(function(data) {
			if(data.state){
				dialogService.success(data.message,function(r){
					
     			});
				$state.go("form.formDesignList",{});
			}
			else{
				dialogService.fail(data.message);
			}
		});
    }
		
	function getDesignJson(){
			var design = {};
			design.ganged = $scope.form.ganged;
			design.expand = {};
			design.expand.fields = fmtFieldList();
			design.expand.boDefList = bos instanceof Array? bos:JSON.parse(bos);
			design.expand.flowField = [];//getFlowField();
			design.expand.separators = [{"key":"0","name":"基本信息","isShow":true,"isOpen":true}];
			design.expand.includeFiles = $scope.includeFiles;
			design.opinion = getOpinionList();
			design.formDef = {};
			design.formDef.typeId = typeId;
			design.formDef.name = formDefName;
			design.formDef.key = formDefKey;
			design.formDef.type = type;
			design.formDef.desc = desc;
			design.form = {};
			design.form.formId = formId;
			design.form.name = $scope.form.name;
			design.form.formType = formType;
			design.form.formKey = $scope.form.formKey;
			return angular.toJson(design);
		}
		
	//为是否需要在页面上显示DIV内容做判断的方法
	$scope.isShowDIVByRule=function(keys){
		if(!$scope.editingField)return false;
		return isInArray(keys.split(","),$scope.editingField.ctrlType);
	}; 
	 function getCurSubTabNamePid(pid){
		 for(var i=0,f;f=$scope.fieldList[i++];){
			 if(f.ctrlType=='sub' && f.uuid==pid) return f.tableName;
		 }
	 }
	//为是否需要在页面上显示DIV内容做判断的方法
	$scope.isShowDIVByRule=function(keys){
		if(!$scope.editingField)return false;
		return isInArray(keys.split(","),$scope.editingField.ctrlType);
	}; 
	
	//点击选中某个控件时，根据该控件类型，筛选对应的bo字段、并且去掉已选择的字段  BoDataList
    $scope.selectField = function(clickField, $event){
    	//切换控件之前校验改控件的配置是否正确
    	if($scope.editingField.uuid){
    	   	var errMsg =validateFormDef();
        	if(errMsg !=''){
        		$scope.notValidateObj[$scope.editingField.uuid]=errMsg;
        	}else{
        		delete $scope.notValidateObj[$scope.editingField.uuid];
        	}
    	}
    	$scope.editingField = clickField;
    	var subName=false;
    	if(clickField.puuid) {
    		$event.stopPropagation();
    		subName=getCurSubTabNamePid(clickField.puuid);
    		if(!subName){
    			 dialogService.fail("请先绑定子表对象！");
    			 $scope.chooseFiledList='';
    			 return;
    		}
    	}
    	var arr= angular.copy($scope.BoDataList);
    	for(var i=arr.length;i>0;){
    		var tab=arr[--i];
    		//如果是子表,不是子表的移除，表名和子表不一致的移除
    		if(subName ){
    			if( tab.type !='sub' || tab.name !=subName){
    				arr.splice(i,1);
    				continue;
    			} 			
    		}else{
    			if(tab.type =='sub') {
    				arr.splice(i,1);
        			continue;
    			}
    		}
    		for(var j=tab.children.length;j>0;){
    		  var field=tab.children[--j]; 
    		//是否移除
    		 var isRemove=true;
    		 //字段没有数据类型的，或者有子表的。移除
    	     if(field.children || !field.type){
    	    	 isRemove=true;
    	     }else if(field.type=='varchar'){//字段类型是字符串的，保留
    	    	 isRemove=false;
    	    //字段类型是number类型的。如果所选的控件是onetext，select，radio，dic则保留
    		 }else if(field.type=='number' && ( $scope.editingField.ctrlType=='onetext'|| 
    				 field.type=='select' || field.type=='radio' || field.type=='dic') ){
    			 isRemove=false;
    		//字段类型是clob类型的。如果所选的控件是multitext则保留
    		 }else if(field.type=='clob' &&  ($scope.editingField.ctrlType=='multitext'||$scope.editingField.ctrlType=='fileupload') ){
    			 isRemove=false;
    		//字段类型是date类型的。如果所选的控件是date则保留
    		 }else if(field.type=='date' &&  $scope.editingField.ctrlType=='date' ){
    			 isRemove=false;
    		 }
    	     //如果不保留则移除
    	     if(isRemove) tab.children.splice(j,1);
        	}
    	}
    	$scope.chooseFiledList=arr;
    	!$scope.$$phase&&$scope.$digest();
        isSelectCtl=true;
    }
    
	function validateFormDef(){
		var errArr=[];
		$("[ht-validate-design^='{']",$("[name='formDef']")).each(function(index,element){
			  var validate = $(element).attr('ht-validate-design');
      	  if(!validate) return;
      	  //修正验证的bug。
      	  validate=validate.replace(/'/g,"\"");
      	  if( validate=="{}")return;
  		  var validateJson = eval('(' + validate + ')');
      	  var ngModel=$(element).attr('ng-model');
      	  var value='';
      	  if(ngModel){
              value= $(element).val()=='? undefined:undefined ?' ? '': $(element).val();
              if(!value || value=='') {
            	  try{
            		  value=eval("($scope." +ngModel +")");
            	  }catch (e) {}
              }
      	   }
      	  // var validRes=  $.fn.validRules(value, validateJson, $(element));
          var validRes = {_valid:true};
      	  if(validRes && !validRes._valid ) errArr.push(validRes.errMsg);
		})
	   return errArr.length>0?errArr.join('，'):'';
	}
	
    $scope.chooseField = function(field){
    	if(!isSelectCtl){
    	   $scope.editingField.fieldPath='';
    	   dialogService.fail("请先选择控件再编辑字段！");
    	}else{//fieldPath
            var value=$scope.editingField.fieldPath;
            if(value){
             	for(var i=0,tab;tab=$scope.BoDataList[i++];){
    	    		for(var j=0,f;f=tab.children[j++];){
    	    			if(f.path+'.'+f.tableName+'.'+f.name==value){
    	    				f.boName= f.desc;
    	    				angular.extend($scope.editingField,f);
    	    			}
    	    		}
    	    	} 
            }else{
            	for(var i=0,f;f=$scope.fieldList[i++];){
            		if(f.uuid!=$scope.editingField.uuid && f.ctrlType=='sub' && f.tableName==$scope.editingField.tableName){
            			$scope.editingField.tableName='';
            			 dialogService.fail("该对象已绑定子表，请重新选择！");
            		}
            	}
            	var subChildren=$scope.editingField.children;
            	var oldTabName=angular.copy($scope.editingField.tableName);
            	if($scope.editingField.ctrlType=='sub'&&$scope.editingField.tableName){
            		for (var i = 0; i < $scope.BoDataList.length; i++) {
						if($scope.BoDataList[i].name==oldTabName && $scope.BoDataList[i].type == 'sub'){
							$scope.editingField.relation = $scope.BoDataList[i].relation;
							break;
						}
					}
            	}

            	for(var i=0,f;f=subChildren[i++];){
            		if(f.tableName && $scope.editingField.ctrlType=='sub' &&f.tableName !=oldTabName ) {
            			$scope.editingField.tableName=f.tableName;
            			dialogService.confirm("当前子表已绑定对象，更换其他对象将清空子表对象。是否更换？", {
            				 btn: ['更换', '取消']
            				  ,yes: function(index){
            					layer.close(index);
            					$scope.editingField.children=[];
                  				$scope.editingField.tableName=oldTabName;
                  				!$scope.$$phase&&$scope.$digest();
            				  }
            				}
            			)
            			continue;
            		}
            	}
            }
	   	   	
    	}
    	!$scope.$$phase&&$scope.$digest();
    }
 
	$scope.delAttr=function(attrPath){
		if(attrPath.indexOf('editingField.validRule.date')>-1){
			$scope.removeAllDate(attrPath);
		}else{
			if($scope.editingField.option)eval("delete $scope."+attrPath);
			!$scope.$$phase&&$scope.$digest();
		}
	}
	
	$scope.removeAllDate=function(attrPath){
		var validRuleType=attrPath.split('.')[2];
		if($scope.editingField.validRule){
			//如果当前是选中
			if($scope.editingField.validRule[validRuleType]){
				$scope.ckeckedDatevalidType=validRuleType;
				eval("delete $scope.editingField.validRule.daterangestart");
				eval("delete $scope.editingField.validRule.datemorethan");
				eval("delete $scope.editingField.validRule.daterangeend");
				eval("delete $scope.editingField.validRule.datelessthan");
				$scope.editingField.validRule[validRuleType]=true;
			}else{
				$scope.ckeckedDatevalidType="";
			}	
		}
		!$scope.$$phase&&$scope.$digest();
	}
	//因为要兼容之前的表单元数据页面。所以处特殊处理
	$scope.changeDatevalidTarget=function(){
		$scope.editingField.validRule[$scope.ckeckedDatevalidType].target=$scope.datevalidTarget;
	}
	
	//获取可以用来比较的字段
	$scope.getDateTargets = function(dateField){
		var targetFields=[];
		for(var k = 0,table ; table=$scope.fieldList[k++];){
			if(table.type !='date' || table.name==dateField.name) continue;
			if(table.fieldType=="sub")table.dateName = "item."+table.name.split('.')[1];
			else table.dateName = "data."+table.name;
			targetFields.push(table);
		 }		
		return targetFields;
	}
	
	$scope.$watch("editingField.option.choiceType",function(newVal,oldVal){
		if(newVal!==oldVal){
			var json = $.extend({},$scope.editingField);
			if(newVal=='static'){
				(!$scope.editingField.option.choice||$scope.editingField.option.choice.length==0)&&($scope.editingField.option.choice=[{}]);
				delete $scope.editingField.option.customQuery;
			}
			else if(newVal=='dynamic'){
				(!$scope.editingField.option.customQuery)&&($scope.editingField.option.customQuery={});
				delete $scope.editingField.option.choice;
			}
		}
	},false);
	
	
	//监视控件类型修改
	$scope.$watch('editingField.ctrlType',function(newVal,oldVal){
		if(newVal&&newVal!==oldVal){
			if(!$scope.editingField.option) $scope.editingField.option={};
			if(newVal!="select"&&newVal!="checkbox"&&newVal!="radio"&&newVal!="multiselect"&&newVal!="customQuery"){
				delete $scope.editingField.option.choiceType;
				delete $scope.editingField.option.choice;
				delete $scope.editingField.option.customQuery;
			}
			else{
				//复选框和单选按钮没有动态选项
				if(newVal=="checkbox" || newVal=="radio"){
					$scope.editingField.option.choiceType='static';
				}else if(newVal=="customQuery"){
					$scope.editingField.option.choiceType='dynamic';
				}
				($scope.editingField.option&&!$scope.editingField.option.choiceType)&&($scope.editingField.option.choiceType='static');
			}
			//当字段为数字，并且控件选择为非单行文本时，清空数字格式化设置
			if(oldVal=='onetext' && $scope.editingField.ctrlType=='number'){
				delete $scope.editingField.option.numberFormat;
				delete $scope.editingField.validRule.maxvalue;
				delete $scope.editingField.validRule.minvalue;
				$scope.editingField.numberBigger = false;
				$scope.editingField.numberLess = false;
			}
			if(oldVal=='date'){
				if(!$scope.editingField.option) $scope.editingField.option={};
				if(!$scope.editingField.validRule) $scope.editingField.validRule={};
				delete $scope.editingField.daterangestart;
				delete $scope.editingField.daterangeend;
				delete $scope.editingField.validRule.daterangestart;
				delete $scope.editingField.validRule.daterangeend;
				delete $scope.editingField.option.dataFormat;
				delete $scope.editingField.option.showCurrentDate;
			}
			if(newVal!='onetext'&&newVal!='multitext'&&newVal!='hidtext'){
				delete $scope.editingField.option.statFun;
				delete $scope.editingField.datecalc;
			}
		}
		!$scope.$$phase&&$scope.$digest();
	},false);
	
	
	//监听正在编辑的对象属性 如果是数值型  是否存在格式化货币字符 若存在 则显示出来
	$scope.$watch('editingField.option.numberFormat.coinValue',function(newVal,oldVal){
		if(newVal!==oldVal){
			if(newVal){
				$scope.editingField.option.numberFormat.isShowCoin=true;
			}
		}
	},false);
	
	$scope.$watch('editingField.datecalc.start',function(newVal,oldVal){
		if(newVal!==oldVal){
			debugger;
		}
	},false);
	
	//监听正在编辑的对象属性 如果是数值型  是否显示格式化货币字符 若显示  则联动显示千分位
	$scope.$watch('editingField.option.numberFormat.isShowCoin',function(newVal,oldVal){
		if(newVal!==oldVal){
			if(newVal){
				$scope.editingField.option.numberFormat.isShowComdify=true;
				if(!$scope.editingField.option.numberFormat.coinValue)$scope.editingField.option.numberFormat.coinValue ="￥";
			}else{
				$scope.editingField.option.numberFormat.isShowComdify = false;
				$scope.editingField.option.numberFormat.coinValue = "";
			}
		}
	},false);
	
	$scope.$watch('editingField.option.selector.alias',function(newVal,oldVal){
		if(newVal!==oldVal){
			!$scope.$$phase&&$scope.$digest();
		}
	});
	
	$scope.$watch('editingField.option.numberFormat.isShowComdify',function(newVal,oldVal){
		if(newVal!==oldVal){
			if(newVal){
				$scope.editingField.option.numberFormat.intValue = "";
				$scope.editingField.option.numberFormat.decimalValue = 3;
			}
		}
	},false);
	
	
	$scope.addOption = function(){
		$scope.editingField.option.choice.push({});
	};
	$scope.removeOption = function(opt){
		$scope.editingField.option.choice.remove(opt);
	};
	
	$scope.setCurrentCustomQuery = function(){
		if(!$scope.editingField.option.customQuery.alias||!$scope.customQuerys){
			return;
		}
		$.each($scope.customQuerys,function(i,item){
			if(item.alias ==$scope.editingField.option.customQuery.alias) {
				$scope.editingField.option.customQuery =$.extend({},item);
				return;
			}
		});
		if(typeof $scope.editingField.option.customQuery.conditionfield=='string'){
			$scope.editingField.option.customQuery.conditionfield = parseToJson($scope.editingField.option.customQuery.conditionfield);
			$scope.editingField.option.customQuery.resultfield = parseToJson($scope.editingField.option.customQuery.resultfield);
		}
		 //删除掉无效的参数
		var bind= [];
		$.each($scope.editingField.option.customQuery.conditionfield,function(i,item){
			if(item.defaultType==1) {
				bind.push(item);
			}
		});
		$scope.editingField.option.bind=bind;
	}
	
    $scope.chooseDicBind = function(elem,s){
    	var dom = getScopeElm(elem.$id);
    	var value=$scope.editingField.bindDicPath;
    	for(var i=0,tab;tab=$scope.BoDataList[i++];){
    		for(var j=0,f;f=tab.children[j++];){
    			if(f.path+'.'+f.name==value){
    				$scope.editingField.bindDicName=f;
    			}
    		}
    	} 	   	
    }
    
    $scope.chooseSelectorBind = function(elem,s){
    	var dom = getScopeElm(elem.$id);
    	var value=$(dom).find('select')[0].value;
    	for(var i=0,tab;tab=$scope.BoDataList[i++];){
    		for(var j=0,f;f=tab.children[j++];){
    			if(f.path+'.'+f.name==value){
    				s.json = f;
    			}
    		}
    	} 	   	
    }
	function getScopeElm(id) {
		 var elem;
		 $('.ng-scope').each(function(){
			 var s = angular.element(this).scope(),
			 sid = s.$id;
			 if(sid == id) {
				 elem = this;
				 return false;
			 }
		 });
		 return elem;
	}
	
	$scope.$watch("editingField.option.selector.type",function(newVal,oldVal){
		if(newVal!==oldVal){
			changeFieldBind();
		}
	}, true);
	
	function changeFieldBind(){
		if(!$scope.editingField||!$scope.editingField.option||!$scope.editingField.option.selector||!$scope.editingField.option.selector.type) return;
		var alias = $scope.editingField.option.selector.type.alias,
			oldBind = $scope.editingField.option.bind;
		if(!alias){
			delete $scope.editingField.option;
			return;
		}
		if(oldBind&&oldBind.length>0&&$scope.editingField.option.bind[0].alias==alias) return;
		var keyValues = [];
		for(var i =0 ; i< $scope.selectors.length;i++){
			if(alias == $scope.selectors[i].alias){
				var fields = $scope.selectors[i].fields;
				for(var j =0 ; j<fields.length;j++){
					keyValues.push({
						alias : alias,
						key: fields[j].key,
						value: fields[j].label
					});
				}
			}
		}
		$scope.editingField.option.bind = keyValues;
	}
  
	$scope.statFun = function() {
		dialogService.page('mathExpEditor',{area:['760px', '560px'],pageParam:{scope:$scope}}).then(function(result){
			if(result){
				$scope.editingField.option.statFun = result;
			}else{
				return;
			}
			
		});
	}
		
	 $scope.openGanged = function(){
			var confScope={};
			confScope.form=angular.copy($scope.form);
			confScope.fields=fmtFieldList();
			confScope.separators=$scope.separators;
			var config = {
    				passConf:{scope:confScope},
    				type: 2,
    				title : '表单联动',
    				content:__ctx+ '/form/formDef/gangedSetList',
    				icon: 'icon-collapse',
    				area: ['950px', '520px'],
    				btn:['确定', '取消'],
    				yes: function(index, layero){
					    var innerWin = dialogService.getIframeWin(index,layero); 
					    var data = innerWin.getResult();
                    	if(!data) return;
            			layer.close(index);
						$scope.$apply(function(){
							$scope.form.ganged = data;
						});
    				},
    				cancel: function(index, layero){
						layer.close(index);
    				}
    		}
			dialogService.open(config);
		}
	 
		// 自定义对话和change事件
		$scope.changeCustDialog = function(ztreeId,isInnit){
			if($scope.customDialogs.length==0)return;
			if($scope.editingField.customDialogjson.custDialog.alias==null){
				$scope.editingField.customDialogjson.custDialog.conditions = [];
				return ;
			}
			for(var i=0,d;d=$scope.customDialogs[i++];){
				if(d.alias ==$scope.editingField.customDialogjson.custDialog.alias){
					var treeData;
					if(d.listDialog && d.listDialog.resultfield){
						treeData =eval("(" + d.listDialog.resultfield + ")");
						$scope.editingField.customDialogjson.custDialog.type="combiDialog";
					}
					if(d.resultfield){
						treeData =eval("(" + d.resultfield + ")");
						$scope.editingField.customDialogjson.custDialog.type="custDialog";
					}
					for(var q=0,f;f=treeData[q++];){
						f.field =f.comment;
					}
					$scope.editingField.customDialogjson.resultField=treeData;
					var conditionList = eval("(" + d.conditionfield + ")");
					if(!isInnit){
						$scope.editingField.customDialogjson.custDialog.conditions = [];
					}
					//只处理类型等于4的对话框参数
					if(conditionList && conditionList.length>0){
						for(var j=0,c;c=conditionList[j++];){
							if(c.defaultType=="4"){
								var has = false;
								if(isInnit){//初始化的时候、将新增参数配置进行添加
									for(var k=0,old;old=$scope.editingField.customDialogjson.custDialog.conditions[k++];){
										if(old.field ==c.field) {
											has = true;
											break;
										}
									}
								}
							if(!has) $scope.editingField.customDialogjson.custDialog.conditions.push(c);
						}}
					}
				}
			}
		}
		
		$scope.selectIcon = function(){
			
			dialogService.page('icons-selector',{area:['900px', '520px']}).then(function(result){
				if(result){
					$scope.editingField.customDialogjson.icon = result;
				}else{
					dialogService.fail("请选择图标");
					return;
				}
				
			});
		}
		
		$scope.selectEventIcon = function(){
			
			dialogService.page('icons-selector',{area:['900px', '520px']}).then(function(result){
				if(result){
					$scope.editingField.bindEventjson.icon = result;
				}else{
					dialogService.fail("请选择图标");
					return;
				}
				
			});
		}
		
		 //关联数据设置
		 $scope.setCustDialogRes = function(){
			var item = getSelectedDocument();
			var initObj={};
			var initConf=angular.copy($scope.editingField.customDialogjson.custDialog.mappingConf);
			if(initConf){
				for(var i=0,c;c=initConf[i++];){
					if(!c) continue;
					var target=c.target;
					if(target) target=target.join(',');
					initObj[c.from]=target;
				}
			}
		
	    	if(item){
	    		var resultfield = $scope.editingField.customDialogjson.resultField;
	    		var chooseFiledList = $scope.chooseFiledList;
	    		if($scope.editingField.ctrlType=='sub'){
	    			var bos = fmtFieldList();
	    			for (var i = 0; i < bos.length; i++) {
	    				if(bos[i].name == $scope.editingField.tableName){
	    					chooseFiledList = [];
	    					chooseFiledList.push(bos[i]);
	    					break;
	    				}
					}
	    		}
	    		
	    		dialogService.page("form-queryGanged", {area: ['450px', '500px'],
					pageParam:{chooseFiledList:chooseFiledList,resultfield:resultfield,prop:initObj},
				    title:'设置对话框返回值',
				    btn: ['保存','取消'],
				    alwaysClose:false
				}).then(function(opinionConf){
					 if(opinionConf){
						var mappingConf=[];
                 		for(var key in opinionConf.result){
                 			mappingConf.push({
                 				from:key,
                 				target:[opinionConf.result[key]]
                 			})
                 		}
                 		$scope.editingField.customDialogjson.custDialog.mappingConf= mappingConf;
						layer.close(opinionConf.index);
					 }
				 });
	    	}
		 }
		 
		 
	 //打开自定义对话框配置
	 $scope.openCustomDialog = function(){
		    if($scope.editingField.customDialogjson) $scope.editingField.customDialogjson=JSON.parse($scope.editingField.customDialogjson)
			var config = {
 				passConf:{fieldList:angular.copy($scope.fields),customDialogjson:$scope.editingField.customDialogjson },
 				type: 2,
 				title : '对话框设置',
 				content:__ctx+ '/form/custBtn/customDialog',
 				icon: 'icon-collapse',
 				area: ['750px', '660px'],
 				btn:['确定', '取消'],
 				yes: function(index, layero){
					    var innerWin = dialogService.getIframeWin(index,layero); 
					    var data = innerWin.triggerScopeFun("getResult");
                 	if(!data) return;
         			layer.close(index);
						$scope.$apply(function(){
							$scope.editingField.customDialogjson = JSON.stringify(data);
						});
 				},
 				cancel: function(index, layero){
						layer.close(index);
 				}
 		}
			dialogService.open(config);
		}
	 
	//打开自定义脚本配置
	 $scope.setBindEventDiy = function(){
		 dialogService.page("customScriptDiy", {area: ['600px', '535px'],
			pageParam:{script:$scope.editingField.bindEventjson.script},
		    title:'自定义脚本设置',
		    btn: ['保存','取消']
		}).then(function(diyScript){
			$scope.editingField.bindEventjson.script = $.base64.encode(diyScript,"utf-8");
		});
	}
	 
	 $scope.isHideDIVByRule = function(str){
		 if(str.indexOf($scope.editingField.ctrlType+',')>-1) return false;
		 return true;
 		}
	 
	 $scope.getBindFields = function(isSub){
		 var fieldList = angular.copy($scope.fieldList);
		 var bindFields = [];
		 for (var i = 0; i < fieldList.length; i++) {
			 if(fieldList[i].ctrlType != 'sub' && fieldList[i]['fieldPath']){
				 bindFields.push(fieldList[i]);
			 }else{
				 if(isSub&&fieldList[i].ctrlType == 'sub'){
					 var childrenFields = fieldList[i].children;
					 for (var j = 0; j < childrenFields.length; j++) {
						if(childrenFields[j]['fieldPath']){
							bindFields.push(childrenFields[j]);
						}
					}
				 } 
			 }
		 }
		 return bindFields;
	 }
	 
	 //关联数据设置
	 $scope.queryGanged = function(){
		var item = getSelectedDocument();
    	if(item){
    		var resultfield = $scope.editingField.option.customQuery.resultfield;
    		var chooseFiledList = $scope.chooseFiledList;
    		dialogService.page("form-queryGanged", {area: ['450px', '500px'],
				pageParam:{chooseFiledList:chooseFiledList,resultfield:resultfield,prop:$scope.editingField.option.gangedBind},
			    title:'设置关联数据返回值',
			    btn: ['保存','取消'],
			    alwaysClose:false
			}).then(function(opinionConf){
				 if(opinionConf){
					 $scope.editingField.option.gangedBind = opinionConf.result;
					layer.close(opinionConf.index);
				 }
			 });
    	}
	 }
	 
	 $scope.includdingFile = function(){
		 dialogService.page("includdingFile", {area: ['800px', '535px'],
			pageParam:{includeFiles:$scope.includeFiles},
		    title:'引入脚本样式',
		    btn: ['保存','取消']
		}).then(function(includeFiles){
			$scope.includeFiles = $.base64.encode(JSON.stringify(includeFiles),"utf-8");
		});
	 }
}

function queryGangedController($scope){
	$scope.resultfield = $scope.pageParam.resultfield;
	$scope.chooseFiledList = $scope.pageParam.chooseFiledList;
	$scope.prop = $scope.pageParam.prop?$scope.pageParam.prop:{};
	//过滤上一次不同对话框产生的多余设置
	if(JSON.stringify($scope.prop) != "{}"&&$scope.resultfield&&$scope.resultfield.length>0){
		$scope.newprop = {};
		for (var i = 0; i < $scope.resultfield.length; i++) {
			if($scope.prop[$scope.resultfield[i]['comment']]){
				$scope.newprop[$scope.resultfield[i]['comment']] = $scope.prop[$scope.resultfield[i]['comment']];
			}
		}
		$scope.prop = $scope.newprop;
	}
	
	
	$scope.isSelect = function(field,bindField){
		var bindValue = bindField.path+'.'+bindField.name;
		return $scope.prop[field]==bindValue;
	}
	
	$scope.pageSure = function(){
		if(!$scope.opinionForm.$valid){
			baseService.fail("当前表单不合法！");
			return;
		}
		return $scope.prop;
	};
}

function Controller($scope,dialogService){
    $scope.unitList=[
        {
            value:'px'
        },
        {
            value:'%'
        }
    ];
	var passConf=$scope.pageParam.passConf;

    if(passConf){
        $scope.prop={width:passConf.width,widthunit:passConf.widthunit,heightunit:passConf.heightunit,height:passConf.height};
        $scope.prop.name = passConf.name;
        $scope.prop.desc = passConf.desc;
    }else{
        $scope.prop={width:400,widthunit:"px",heightunit:"px",height:100};
        $scope.prop.widthunit= $scope.unitList[0].value;//默认px
        $scope.prop.heightunit=$scope.unitList[0].value;
	}
    $scope.valid = function(name,value){
        if(!value||$.trim(value)==''){
            dialogService.fail(name+'不能为空！');
            return false;
        }
        return true;
    }
    $scope.pageSure = function(){
        var isa = $scope.valid('意见描述',$scope.prop.desc);
        var isb = $scope.valid('意见标识',$scope.prop.name);
        var isc = $scope.valid('控件宽度',$scope.prop.width);
        var isd = $scope.valid('控件高度',$scope.prop.height);
        if(!isa||!isb||!isc||!isd){
            return false;
        }
        return $scope.prop;
    };
}
/**
 *
 * Pass all functions into module
 */
angular
.module('formDesignApp', [])
.controller('Controller', Controller)
.controller('formDesignCtrl', formDesignCtrl)
.controller('queryGangedController', queryGangedController);