/**
 * Office插件，用于自定义表单。
 * 
 * 1.OfficePlugin.init();
 *  	加载office控件。
 * 
 * 2.OfficePlugin.submit();
 * 		保存office文档。
 */
OfficePlugin={
		//当前登陆用户相关信息件对象
		//office控件对象
		officeObjs:new Array(),
		//附件对象
		fileObjs:null,
		//判断当前表单页面是否有office控件。
		hasOfficeFields:new Array(),		
		//判断当前表单页面所有office控件是否都提交了。
		hasSubmitOffices:new Array(),
		//有多少文档可以提交的
		submitNum:null,
		//当前提交文档变量
		submitNewNum:null,
		//是否初始化tab中的OFFICE工具栏目的隐藏问题。在FormUtil用到
		isTabItemOffice:true,
		//是否已进行广播。
		hasBroadCast:false,
		//
		scope:null,
		//初始化
		//所做的操作如下：
		//1.检查当前表单中是否有office控件。
		//2.如果存在office控件
		// 	获取文件id，将office控件添加到容器中。
		init:function(scope){
			this.scope = scope;
			this.fileObjs=$("[ht-office-plugin]");
			if(this.fileObjs.length==0) {
				return;
			}
			
			this.officeObjs=new Array();
			this.hasOfficeFields=new Array();
			this.hasSubmitOffices=new Array();
			
			var num = 0;
			var myNum = 0;
			for ( var i = 0; i < this.fileObjs.length; i++) {
				var fileObj = this.fileObjs.get(i);
				
				var name = fileObj.getAttribute("ng-model");
				var permissionPath= fileObj.getAttribute("permission");
				var right = getPermission(permissionPath,scope)
				
				var fileId =eval("scope."+name);

				//获取附件的扩展名
				var doctype = "";
				if(fileId){
					doctype = sysFileType(fileId);
				}else{
					fileId="";
					doctype = fileObj.getAttribute("doctype")||"docx";	
				}
				
				if(doctype){
					doctype = doctype.toLowerCase();
					if(doctype=='pptx'){
						doctype='ppt';
					}else if(doctype=='docx'){
						doctype = 'doc'; 
					}else if(doctype=='xlsx'){
						doctype = 'xls'; 
					}
				}

				//容器的ID  
				var divId="div_" + name.replaceAll("\\.","_");
				$(fileObj).attr("id",divId);
				
				//没有权限，删除div容器。
				if(right=="n"){
					div_rq.remove();
				}
				
				num++;  //做可提交的标志数量
				
				//有读和写的权限，加载控件。
//				$.ligerDialog.waitting('正在加载OFFICE文档,请稍候...');
				//加载控件。
				var officeObj= new OfficeControl();
				this.officeObjs.push(officeObj);
				//加载office控件。
				officeObj.renderTo(divId,{fileId:fileId,doctype:doctype,myNum:myNum,right:right,name:name});
				//是否有office控件。
				this.hasOfficeFields.push(true);
				//office控件文档标志
				this.hasSubmitOffices.push(false);
				myNum++; //序号
//					$.ligerDialog.closeWaitting(); 
			}
			this.submitNum = num;  //文档是可以做提交的数目   总娄
			this.submitNewNum = 0;  //文档是提交了的数目     变化的(重新清空)
		},
		
		/**
		 * 广播事件。
		 */
		boardCast:function(action,params){
				var obj={};
				obj.scope = this.scope;
				obj.action=action;
				obj.params=params;
				this.scope.$broadcast('office:saved',obj);
		},
		//提交文件保存。
		//如果有office控件。则保存后将返回的附件id放到隐藏域。
		// action : 为动作
		// params : 为参数
		submit:function(scope,action,params){
			if(scope){
				this.scope = scope.hasOwnProperty('data')?scope:scope.$parent;
			}
			//如果没有要提交的直接返回
			if(!this.officeObjs || this.officeObjs.length==0){
				this.boardCast(action,params);
				return;
			}
			
			for ( var cn = 0; cn < this.officeObjs.length; cn++) {
				var officeObj= this.officeObjs[cn];
				if(!this.hasOfficeFields[cn]) return;
				var right=officeObj.config.right;
				//可写，保存office内容并上传。
				if(right=="w"||right=="b"){
					//保存到服务器。
					var result=officeObj.saveRemote(cn);
					if(result==-11){
						//由 火狐谷歌浏览器控件文档保存事件（异步的，IE是同步的）回调接管函数 OfficeControl.js 中有  saveToURLOnComplete 处理 
						
					}else if(result==-13){
						//由 火狐谷歌浏览器控件文档保存事件报错不能由回调接管函数 OfficeControl.js 中有  saveToURLOnComplete 处理 ，直接 在这里处理
						//下面处理的是如果没安装控件
						break;
					}
					//同步的方式  返回ID，将ID 放入到scope中。 //"{\"success\":\"true\",\"fileId\":\"10000015850002\",\"fileName\":\"1127264.1627371634.doc\"}\r\n"
					if(result&&result.length>5){
						var json = angular.fromJson(result);
						if(!json.success){
							$.topCall.warn(json.msg,"Office文件保存失败");
							return ;
						}
						
						eval("this.scope."+officeObj.config.name+"=json.fileId");
						this.hasSubmitOffices[cn]=true; //完成标志
						this.submitNewNum = this.submitNewNum + 1;  //文档是提交了的数目     变化的(重新清空)
					}else{
						break; //文件上传失败
					}
				}else{
					this.submitNewNum = this.submitNewNum + 1;
					this.hasSubmitOffices[cn]=true;    //完成标志					
				}
				//IE 情况下。同步方法
				if(this.submitNewNum==this.submitNum){
					this.submitNewNum = 0;
					!OfficePlugin.scope.$$phase && OfficePlugin.scope.$digest();
					this.boardCast(action,params);
				}
			}
		}
};

//获取文件格式
function sysFileType(fileId){
	var doctype = "doc";
	var path = __ctx +'/system/file/getFileType';
    $.ajaxSetup({async:false});  //同步
	$.post(path,{fileId:fileId},function(data){			
	   doctype = data;
    });
	$.ajaxSetup({async:true}); //异步
	return doctype;
};