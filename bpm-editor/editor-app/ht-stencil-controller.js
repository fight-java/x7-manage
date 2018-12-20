angular.module('activitiModeler')
    .controller('HtStencilController', ['$rootScope', '$scope', '$http', 'templateService', '$timeout', function ($rootScope, $scope, $http, templateService, $timeout) {
        
        $scope.checkRepeatNode = function(shapes,nodeKeys,repeatNames){
        	for(var i = 0 ; i < shapes.length; i++){
        		var overrideid = shapes[i].properties["overrideid"];
        		if(overrideid){
            		if(nodeKeys.indexOf(overrideid) > -1){
            			var name = shapes[i].properties["name"];
            			repeatNames.push(name);
            		}else{
            			nodeKeys.push(overrideid);
            		}
            	}
        		if(shapes[i].childShapes.length > 0){
            		$scope.checkRepeatNode(shapes[i].childShapes,nodeKeys,repeatNames);
            	}
            }
        };
        
        function broadcastMsg(message,state){
        	var topScope=window.parent.getScope();
        	if(topScope)topScope.$root.$broadcast('flowDesignMsg', {state:state,message:message});
        }
        
        $scope.saveModel = function (deploy,successCallback) {
        	
        	var modelMetaData = $scope.editor.getModelMetaData();
            // Indicator spinner image
            var json = $scope.editor.getJSON();
            if(json.childShapes.length==0) {
            	broadcastMsg("流程图不能为空");
            	return ;
            }
            json.properties["name"] = modelMetaData.name;
            json.properties["process_id"] = modelMetaData.defKey;
            json.properties["documentation"] = modelMetaData.desc;
            var nodeKeys = [];
            var repeatNames = [];
            $scope.checkRepeatNode(json.childShapes,nodeKeys,repeatNames);
            if(repeatNames.length > 0){
            	broadcastMsg("节点：【"+repeatNames.join(",")+"】的ID重复")
            	return ;
            }
            
            if(!modelMetaData.typeId){
            	broadcastMsg("请选择一个分类");
            	return;
            }
            
            if(!modelMetaData.name){
            	broadcastMsg("请输入一个流程名称");
            	return;
            }
            if(!modelMetaData.defKey){
            	broadcastMsg("请输入一个流程定义KEY");
            	return;
            }
           
            if(!/^([a-zA-Z]|_)\w*$/.test(modelMetaData.defKey.trim())){
            	broadcastMsg("流程Key必须为英文字母或者数字，开头必须是字母或者下划线！");
            	return;
            }
            //对流程节点进行自定义验证
            if(!$scope.childNodeVerificat(json.childShapes)){
            	return ;
            }
            json = JSON.stringify(json);
            var selection = $scope.editor.getSelection();
            $scope.editor.setSelection([]);
            
            // Get the serialized svg image source
            var svgClone = $scope.editor.getCanvas().getSVGRepresentation(true);
            $scope.editor.setSelection(selection);
            if ($scope.editor.getCanvas().properties["oryx-showstripableelements"] === false) {
                var stripOutArray = jQuery(svgClone).find(".stripable-element");
                for (var i = stripOutArray.length - 1; i >= 0; i--) {
                	stripOutArray[i].remove();
                }
            }

            // Remove all forced stripable elements
            var stripOutArray = jQuery(svgClone).find(".stripable-element-force");
            for (var i = stripOutArray.length - 1; i >= 0; i--) {
                stripOutArray[i].remove();
            }

            // Parse dom to string
            var svgDOM = DataManager.serialize(svgClone);
            
            $scope.btnDisable.save = true;
            
            var params = {
        		isdeploy:deploy?"true":"false",
        		defaultBpmDefinition:{
        			defJson:json,
                	name:modelMetaData.name,
                	defKey:modelMetaData.defKey,
                	desc:modelMetaData.desc,
                	typeId:modelMetaData.typeId,
                	version:modelMetaData.version,
                	reason:modelMetaData.reason,
                	defId:modelMetaData.defId,
                	designer:"WEB"
        		}
            };
            // Update
            $http({    method: 'post',
                data: params,
                ignoreErrors: true,
                headers: {'Accept': 'application/json',
                          'Content-Type': 'application/json; charset=UTF-8',
                          'Authorization':KISBPM.URL.getToken},
                url: KISBPM.URL.putModel(modelMetaData.modelId)})

                .success(function (data, status, headers, config) {
                	$scope.btnDisable.save = false;
                	if(data && data.state){
                		$scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_SAVED
                        });
                        $scope.modelData.name = modelMetaData.name;
                        $scope.modelData.lastUpdated = data.lastUpdated;

                        // Fire event to all who is listening
                        var saveEvent = {
                            type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
                            model: params,
                            modelId: modelMetaData.modelId,
        		            eventType: 'update-model'
                        };
                        KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent);

                        if (successCallback) {
                            successCallback();
                        }
                        
                        if(deploy){
                        	broadcastMsg({message:"发布新版成功",defId:data.value,dep:true},'suc');
                            
                        }else{
                        	broadcastMsg({message:"保存修改成功",defId:data.value},'suc');
                        }
                    }else{
                    	broadcastMsg(data.message,'fail');
                    }
                	$scope.btnDisable.save = false;
                })
                .error(function (data, status, headers, config) {
                	if(data.shortMessage || data.error){
                		broadcastMsg(data.shortMessage ?data.shortMessage:data.error,'fail');
                	}else{
                		broadcastMsg("无法连接到服务器",'fail');
                	}
                	$scope.btnDisable.save = false;
                });
        };
        
        $scope.selectType = function(){
        	layer.ready(function(){
				templateService.get('editor-app/popups/select-type.html?version=' + Date.now(), $scope).then(function(target){
					layer.open({
						  type: 1,
						  title:"选择分类",
						  area: ['300px', '340px'],
						  btn:['确定','取消'],
						  yes:function(index,layerno){
							  var layerScope = layerno.find("[ng-controller='KisBpmShapeSelectionTypeCtrl']").scope(); 
							  layerScope.$apply(function(){
								  var donotClose = layerScope.select();
								  if(!donotClose){
									  layer.close(index);
								  }
							  });
						  },
						  fixed: false, //不固定
						  maxmin: false,
						  content: target
      				});
				});
			});
        };
        
        $rootScope.setShapeProperty = function(name,value,shape){
        	if(!shape){
        		shape = $scope.selectedShape;
        	}
        	$rootScope.forceSelectionRefresh = true;
        	shape.setProperty(name,value);
        	var facade = shape.facade;
        	facade.setSelection([shape]);
        	facade.getCanvas().update();
        	facade.updateSelection();
        };
        
        $rootScope.addNewNodeNum = function(type){
       	 var typeNumJson = $rootScope.stencilIdNumber;
       	 if(!typeNumJson){
       		typeNumJson={};
       	 }
       	 if(typeNumJson[type]){
       		typeNumJson[type] ++;
       	 }else{
       		typeNumJson[type] = 1;
       	 }
       	 $rootScope.stencilIdNumber = typeNumJson;
       };
       //对流程节点进行自定义验证
       $scope.childNodeVerificat = function(childs){
       		//检测外部子流程是否选择
    	   for(var i=0;i<childs.length;i++){
    		   var obj = childs[i];
    		   if(obj.properties){
    			   var properties = obj.properties;
    			   if(properties['ismultiinstance']){
    				   if(properties.hasOwnProperty('callactivitycalledelement')&&!properties['callactivitycalledelement']){
    					   alert("节点“"+properties['name']+"”的key不能为空，请选择！");
    					   return false;
    				   }
    			   }
    		   }
    	   }
    	   return true;
       };
}]);
