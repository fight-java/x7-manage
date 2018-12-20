 Namespace.register("com.hotent.form"); 
 
/**
 * 动态创建form类。
 * 使用方法如下：
 * var frm=new com.hotent.form.Form();
 * frm.creatForm("表单名","提交到的页面");
 *清除表单元素
 * frm.clearFormEl();
 * 添加需要提交的表单元素。
 * frm.addFormEl("name","value");
 * 表单提交
 * frm.submit();
 */
 com.hotent.form.Form=function(){
	this.creatForm=function(formName,action)
	{
		var  frm=document.getElementById(formName);
		if(frm==null || frm==undefined){
			frm = document.createElement("FORM");  
			document.body.appendChild(frm);  
		}
		//frm.action=action;
		this.form=frm;
		this.form.method="post";
		this.parseAction(action);
		return this.form;
	};
	
	this.parseAction=function( _action_){
		var idx=_action_.indexOf("?");
		if(idx==-1){
			this.form.action=_action_;
		}
		else{
			var aryStr=_action_.split("?");
			var action=aryStr[0];
			this.form.action=action;
			var queryString=aryStr[1];
			var aryQ=queryString.split("&");
			for(var i=0;i<aryQ.length;i++){
				var pv=aryQ[i].split("=");
				this.addFormEl(pv[0],pv[1]);
			}
		}
		
	}
	
	
	/**
	 * 设置方法
	 * 值：get,post
	 */
	this.setMethod=function(_method){
		this.form.method=_method;
	};
	
	this.setTarget=function(_target){
		this.form.target=_target;
	};
	
	this.clearFormEl=function()
	{
		$(this.form).empty();
//		var childs=this.form.childNodes;
//		for(var i=childs.length;i>0;--i){
//			var node=childs[i];
//			this.form.removeNode(node);
//		}
	};
	/**
	 * 添加字段
	 */
	this.addFormEl=function(name,value){
		 var el = document.createElement("input");  
		 el.setAttribute("name",name);  
		 el.setAttribute("type","hidden");  
		 el.setAttribute("value",value);  
		 this.form.appendChild(el);  
	};
	
	this.submit=function(){
		this.form.submit();
	};
};

    
/**
 * ResponseObject对象
 * @param data
 */
com.hotent.form.ResultMessage = function(data) {
	{
		this.data = eval('(' + data + ')');
	}	
	//如果 ajax 超时 就弹出登陆框。
	if(this.data['result'] == 2){
		toLogin();
		throw "AJAX 超时了！";  
	}
	
	/**
	 * 操作是否成功
	 * @returns {Boolean}
	 */
	this.isSuccess = function() {
		
		return this.data['result'] == 1;
	};
	
	/**
	 * 操作是否成功 
	 * @returns {int}1:表示成功,0：表示失败，-1：表示错误（或者异常）
	 */
	this.getResult = function() {
		return this.data['result'];
	};
	
	/**
	 * 获取响应信息
	 * @returns
	 */
	this.getMessage = function() {
		return this.data['message'];
	};
	
	/**
	 * 获取堆栈信息
	 */
	this.getCause = function(){
		return this.data['cause'];
	};
	/***
	 * 登陆超时，弹出框 
	 */
	function toLogin(){ 
		var dialog;
		var def = {
			        title:'登陆超时，重新注册登陆信息',width:780,height:590, modal:true,resizable:true,
			        buttonsAlign:'center',
			        buttons:[{
						text:'关闭登陆框',
						iconCls:'fa fa-times-circle',
						handler:function(){dialog.dialog('close');} 
					}]
			};
			dialog = $.topCall.dialog({
				src:__ctx+"/login.jsp?isAjaxLogin=true",
				base:def 
			}); 
	}
};
ConstUtil = {
		// 内置的规则。
		rules : [{
					name : "required",
					rule : function(v) {
						if (v == "" || v.length == 0)
							return false;
						return true;
					},
					title:"必填",
					formRule:true,
					msg : "必填"
				}, {
					name : "number",
					rule : function(v) {
						if (v == "" || v.length == 0){
							return true;
						}
						return /^-?[\$|￥]?((\d{1,3}(,\d{3})+?|\d+)(\.\d{1,5})?)$/
								.test(v.trim());
					},
					title:"数字",
					formRule:true,
					msg : "请输入一个合法的数字"
				}, {
					name : "variable",
					rule : function(v) {
						return /^[A-Za-z_0-9]*$/gi.test(v.trim());
					},
					title:"字母或下划线",
					formRule:true,
					msg : "只能是字母、下划线"
				}, {
					name : "fields",
					rule : function(v){
						return /^[A-Za-z]{1}([a-zA-Z0-9_]{1,17})?$/gi.test(v.trim());
					},
					msg : "首字符为字母,最大长度18"
				},{
					name : "minLength",
					rule : function(v, b) {
						return (v.length >= b);
					},
					msg : "长度不少于{0}"
				}, {
					name : "maxLength",
					rule : function(v, b) {
						return (v.trim().length <= b);
					},
					msg : "长度不超过{0}"
				}, {
					name : "rangeLength",
					rule : function(v, args) {
						return (v.trim().length >= args[0] && v.trim().length <= args[1]);
					},
					msg : "长度必须在{0}之{1}间"
				}, {
					name : "email",
					rule : function(v) {
						return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
								.test(v.trim());
					},
					title:"email",
					formRule:true,
					msg : "请输入一合法的邮箱地址"
				}, {
					name : "url",
					rule : function(v) {
						return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(v.trim());
					},
					title:"url",
					formRule:true,
					msg : "请输入一合法的网址"
				}, {
					name : "date",
					rule : function(v) {
						var re = /^[\d]{4}-[\d]{1,2}-[\d]{1,2}\s*[\d]{1,2}:[\d]{1,2}:[\d]{1,2}|[\d]{4}-[\d]{1,2}-[\d]{1,2}|[\d]{1,2}:[\d]{1,2}:[\d]{1,2}$/g
								.test(v.trim());
						return re;
					},
					title:"日期",
					formRule:true,
					msg : "请输入一合法的日期"
				},{
					name : "time",
					rule : function(v) {
						var re = /^(?:[01]?\d|2[0-3])(?::[0-5]?\d){2}$/g
								.test(v.trim());
						return re;
					},
					title:"时间",
					formRule:true,
					msg : "请输入一合法的时间"
				}, {
					name : "digits",
					rule : function(v) {
						return /^-?\d+$/.test(v.trim());
					},
					title:"整数",
					formRule:true,
					msg : "请输入整数"
				}, {
					name : "equalTo",
					rule : function(v, b) {
						var a = $("#" + b).val();
						return (v.trim() == a.trim());
					},
					msg : "两次输入不等"
				}, {
					name : "range",
					rule : function(v, args) {
						return v <= args[1] && v >= args[0];
					},
					msg : "请输入在{0}到{1}范围之内的数字"
				}, {
					name : "maxvalue",
					rule : function(v, max) {
						return v <= max;
					},
					msg : "输入的值不能大于{0}"
				},{
					name : "minvalue",
					rule : function(v, min) {
						return v >= min;
					},
					msg :"输入的值不能小于{0}"
				},{
					// 判断数字整数位
					name : "maxIntLen",
					rule : function(v, b) {
						if(/^[\$|￥]/.test(v.trim())){
							return (v + '').split(".")[0].replaceAll(",","").replaceAll("￥|$","").length <= b+1;
						}else{
							return (v + '').split(".")[0].replaceAll(",","").length <= b;
						}
					},
					msg : "整数位最大长度为{0}"
				}, {
					// 判断数字小数位
					name : "maxDecimalLen",
					rule : function(v, b) {
						return (v + '').replace(/^[^.]*[.]*/, '').length <= b;
					},
					msg : "小数位最大长度为{0}"
				}, {
					// 判断日期范围{dateRangeStart:'xx'} xx：结束时间的日期的ID
					name : "dateRangeStart",
					rule : function(v, b) {
						var end = $("#" + b).val();
						return daysBetween(v, end);
					},
					msg : "开始日期必须小于或等于结束日期"
				}, {
					// 判断日期范围{dateRangeEnd:'xx'} xx：开始时间的日期的ID
					name : "dateRangeEnd",
					rule : function(v, b) {
						var start = $("#" + b).val();
						return daysBetween(start, v);
					},
					msg : "开始日期必须小于或等于结束日期"
				},
				{
					// 空的字段（永远通过验证,返回true）  防止在验证JSON中出现有多余的逗号
					name : "empty",
					rule : function(v, b) {
						return true;
					},
					msg : ""
				},
				{
					// 不能以数字开头
					name : "noDigitsStart",
					rule : function(v) {
						return !/^(\d+)(.*)$/.test(v.trim());
					},
					title:"不以数字开头",
					formRule:true,
					msg : "不能以数字开头"
				}, {
					name : "varirule",
					rule : function(v) {
						return /^[a-zA-Z]\w*$/.test(v.trim());
					},
					title : "以字母开头",
					formRule:true,
					msg : "只能为字母开头,允许字母、数字和下划线"
				}, {
					name : "chinese",
					title : "汉字",
					formRule:true,
					rule : function(v) {
						return /^[\u4E00-\u9FA5]+$/i.test(v.trim());
					},
					msg : "请输入正确的汉字"
				}, {
					name : "QQ",
					title : "QQ号",
					formRule:true,
					rule : function(v) {
						return /^[1-9]*[1-9][0-9]*$/i.test(v.trim());
					},
					msg : "请输入正确的QQ号码"
				}, {
					name : "phonenumber",
					title : "手机号码",
					formRule:true,
					rule : function(v) {
						return /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/i.test(v.trim());
					},
					msg : "请输入正确的手机号码"
				}],
		isInDefaultRules:function(name){
			var tempRules = this.rules;
			for(var i=0;i<tempRules.length;i++){
				if(tempRules[i].name ==name){
					return true;
				}
			}
			return false;
		},
		getRuleByName:function(name){
			var tempRules = this.rules;
			for(var i=0;i<tempRules.length;i++){
				if(tempRules[i].name ==name){
					return tempRules[i];
				}
			}
			return null;
		}
}
