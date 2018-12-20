UE.registerUI('button', function(editor, uiName) {
	var popup = initPopup(editor);
    //当鼠标经过时，按钮要做的状态反射
	editor.addListener('mouseover', function(t, evt) {
		var element = evt.target || evt.srcElement;
    	
    	var isNgInput = element.hasAttribute('ng-model'); //所有控件    咯咯...
    	
    	//对于单选框控件中的input框，给一个htRadios属性，用于标记此input不做单独删除，要删除就删除整个单选框控件内容
    	if(element.hasAttribute("htradios")){
    		isNgInput = false;
    	}
    	
    	if(element.hasAttribute('ht-bpm-opinion')||element.hasAttribute('ht-bpm-approval-history')
    			||element.hasAttribute('ht-bpm-flow-image') || element.hasAttribute("ht-custdialog")
    			||element.hasAttribute('ht-bpm-approval-history') || element.hasAttribute('ht-bpm-flow-image')
    			||element.hasAttribute("htbpmflowimage") )
    	{
    		isNgInput=true;
    	}
    	if(!isNgInput) return ;
    	
    	if(element.hasAttribute('ht-bpm-flow-image') || element.hasAttribute("htbpmflowimage") ){
    		element = element.closest("fieldset");
    	}
    	
		var menuHtml =  '<span onclick="$$._onInputDelButtonClick()" class="edui-clickable">删除</span>&nbsp;&nbsp;';  //删除按钮
		
    	//菜单
    	html = popup.formatHtml('<nobr>' + menuHtml + '</nobr>');
		if(popup.getDom("content")){//已生成过菜单，要改变其dom元素
			popup.getDom("content").innerHTML = html;
		}else{//第一次dom元素还不存在的，直接设置content则可
			popup.content = html;
		}
		popup.editElement = element;
		popup.showAnchor(popup.editElement);
    });
  
   
});


/**
 * 在此处添加控件事件
 * 删除控件
 * @param id
 */
function delElement_(id){
	var element = edittingElement_[id];
	
	element.qtip('destroy', true); 
	element.remove();
}

function initPopup(editor) {
	var popup = new baidu.editor.ui.Popup({
		editor : editor,
		content : '',
		className : 'edui-bubble',
		// ⑦扩展
		_onInputDelButtonClick : function() {
			this.hide();
			if (popup.editElement) {
				popup.editElement.parentNode.removeChild(popup.editElement); 
			}
		}
	});
	return popup;
}