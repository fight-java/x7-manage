var Namespace = new Object();

Namespace.register = function(path) {
	var arr = path.split(".");
	var ns = "";
	for (var i = 0; i < arr.length; i++) {
		if (i > 0)
			ns += ".";
		ns += arr[i];
		eval("if(typeof(" + ns + ") == 'undefined') " + ns + " = new Object();");
	}
};

//This must be applied to a form (or an object inside a form).
jQuery.fn.addHidden = function (name, value) {
    return this.each(function () {
        var input = $("<input>").attr("type", "hidden").attr("name", name).val(value);
        $(this).append($(input));
    });
};

//判断是否出现滚动条
jQuery.fn.hasScrollBar = function() {
    return this.get(0) ? this.get(0).scrollHeight > this.get(0).clientHeight : false;
};

//遍历数据字典的所有项
jQuery.fn.eachComboNode = function(callback){
	if (typeof callback != 'function')
		return;
	var tree = $(this).combotree('tree'),
		roots = tree.tree("getRoots"), children, i, j;
	for (i = 0; i < roots.length; i++) {
		if (!callback(roots[i])) {
			break;
		}
		children = tree.tree('getChildren',roots[i].target);
		for (j = 0; j < children.length; j++) {
			if (!callback(children[j])) {
				break;
			}
		}
	}
};

jQuery.extend({
	/**
	 * 获取当前浏览器的滚动条宽度
	 */
	scrollbarWidth : function () {
	    var w1, w2,
	        div = $("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
	        innerDiv = div.children()[0];

	    $("body").append(div);
	    w1 = innerDiv.offsetWidth;
	    div.css("overflow", "scroll");

	    w2 = innerDiv.offsetWidth;

	    if (w1 === w2) {
	        w2 = div[0].clientWidth;
	    }

	    div.remove();

	    return w1 - w2;
	},
	
	/**
	 * 根据名称全选或反选复选框。
	 * 
	 * @param name
	 * @param checked
	 */
	checkAll : function(name, checked) {

		$("input[name='" + name + "']").attr("checked", checked);
	},
	/**
	 * 根据复选框的名称获取选中值，使用逗号分隔。
	 * 
	 * @param name
	 * @returns {String}
	 */
	getChkValue : function(name) {
		var str = "";
		$('input[type="checkbox"][name=' + name + ']').each(function() {
					if (this.checked) {
						str += $(this).val() + ",";
					}
				});
		if (str != "")
			str = str.substring(0, str.length - 1);
		return str;
	},
	/**
	 * 获取radio的值。
	 * name:元素名称
	 * ctx:为jquery 上下文
	 */
	getRadioValue:function(name,context){
		var v="";
		var filter='input[type="radio"][name=' + name + ']:checked';
		if(context==undefined || context==null){
			v=$(filter).val();
		}
		else{
			v=$(filter,context).val();
		}
		return v;
		
	},
	/**
	 * 根据名称获取下拉框的列表的值，使用逗号分隔。
	 * 
	 * @param name
	 * @returns {String}
	 */
	getSelectValue : function(name) {
		var str = "";
		$('select[name=' + name + '] option').each(function() {
					str += $(this).val() + ",";
				});
		if (str != "")
			str = str.substring(0, str.length - 1);
		return str;
	},
	copyToClipboard : function(txt,dialogService) {
		if (window.clipboardData) {
			window.clipboardData.clearData();
			window.clipboardData.setData("Text", txt);
			return true;
		} else if (navigator.userAgent.indexOf("Opera") != -1) {
			window.location = txt;
			return false;
		} else if (window.netscape) {
			try {
				netscape.security.PrivilegeManager
						.enablePrivilege("UniversalXPConnect");
			} catch (e) {
				dialogService.alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
				return false;
			}
			var clip = Components.classes['@mozilla.org/widget/clipboard;1']
					.createInstance(Components.interfaces.nsIClipboard);
			if (!clip)
				return false;
			var trans = Components.classes['@mozilla.org/widget/transferable;1']
					.createInstance(Components.interfaces.nsITransferable);
			if (!trans)
				return false;
			trans.addDataFlavor('text/unicode');

			var str = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(Components.interfaces.nsISupportsString);
			var copytext = txt;
			str.data = copytext;
			trans.setTransferData("text/unicode", str, copytext.length * 2);
			var clipid = Components.interfaces.nsIClipboard;
			if (!clip)
				return false;
			clip.setData(trans, null, clipid.kGlobalClipboard);
			return true;
		} else {
			dialogService.alert($lang.tip.msg, $lang_js.util.copyToClipboard.notCopy);
			return false;
		}
	},
	/**
	 * 拷贝指定文本框的值。
	 * 
	 * @param objId
	 */
	copy : function(objId,dialogService) {
		var str = $("#" + objId).val();
		var rtn = jQuery.copyToClipboard(str);
		if (rtn) {
			dialogService.alert($lang_js.util.copy.success);
		}
	},
	/**
	 * 判断是否是IE浏览器
	 * 
	 * @returns {Boolean}
	 */
	isIE : function() {
		var appName = navigator.appName;
		var idx = appName.indexOf("Microsoft");
		return idx == 0;
	},
	/**
	 * 判断是否是IE6浏览器
	 * 
	 * @returns {Boolean}
	 */
	isIE6 : function() {
		if (($.browser.msie && $.browser.version == '6.0') && !$.support.style)
			return true;
		return false;
	},
	
	/**
	 * <img src="img/logo.png" onload="$.fixPNG(this);"/> 解决图片在ie中背景透明的问题。
	 * 
	 * @param imgObj
	 */
	fixPNG : function(imgObj) {
		var arVersion = navigator.appVersion.split("MSIE");
		var version = parseFloat(arVersion[1]);
		if ((version >= 5.5) && (version < 7) && (document.body.filters)) {
			var imgID = (imgObj.id) ? "id='" + imgObj.id + "' " : "";
			var imgClass = (imgObj.className) ? "class='" + imgObj.className
					+ "' " : "";
			var imgTitle = (imgObj.title)
					? "title='" + imgObj.title + "' "
					: "title='" + imgObj.alt + "' ";
			var imgStyle = "display:inline-block;" + imgObj.style.cssText;
			var strNewHTML = "<span "
					+ imgID
					+ imgClass
					+ imgTitle
					+ " style=\""
					+ "width:"
					+ imgObj.width
					+ "px; height:"
					+ imgObj.height
					+ "px;"
					+ imgStyle
					+ ";"
					+ "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
					+ "(src=\'" + imgObj.src
					+ "\', sizingMethod='scale');\"></span>";
			imgObj.outerHTML = strNewHTML;
		}
	},
	/**
	 * 获取当前路径中指定键的参数值。
	 * 
	 * @param key
	 * @returns
	 */
	getParameter : function(key) {
		var parameters = decodeURI(window.location.search.substr(1)).split("&");
		for (var i = 0; i < parameters.length; i++) {
			var paramCell = parameters[i].split("=");
			if (paramCell.length == 2
					&& paramCell[0].toUpperCase() == key.toUpperCase()) {
				return paramCell[1];
			}
		}
		return "";
	},
	/**
	 * 清除当前路径中的所有参数值
	 */
	clearParameter : function() {
		var query = window.location.search.substring(1);
    	if(query && query.length){
    		if(window.history != undefined && window.history.replaceState != undefined) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
    	}
	},
	/**
	 * 根据年份和月份获取某个月的天数。
	 * 
	 * @param year
	 * @param month
	 * @returns
	 */
	getMonthDays : function(year, month) {
		if (month < 0 || month > 11) {
			return 30;
		}
		var arrMon = new Array(12);
		arrMon[0] = 31;
		if (year % 4 == 0) {
			arrMon[1] = 29;
		} else {
			arrMon[1] = 28;
		}
		arrMon[2] = 31;
		arrMon[3] = 30;
		arrMon[4] = 31;
		arrMon[5] = 30;
		arrMon[6] = 31;
		arrMon[7] = 31;
		arrMon[8] = 30;
		arrMon[9] = 31;
		arrMon[10] = 30;
		arrMon[11] = 31;
		return arrMon[month];
	},
	/**
	 * 计算日期为当年的第几周
	 * 
	 * @param year
	 * @param month
	 * @param day
	 * @returns
	 */
	weekOfYear : function(year, month, day) {
		// year 年
		// month 月
		// day 日
		// 每周从周日开始
		var date1 = new Date(year, 0, 1);
		var date2 = new Date(year, month - 1, day, 1);
		var dayMS = 24 * 60 * 60 * 1000;
		var firstDay = (7 - date1.getDay()) * dayMS;
		var weekMS = 7 * dayMS;
		date1 = date1.getTime();
		date2 = date2.getTime();
		return Math.ceil((date2 - date1 - firstDay) / weekMS) + 1;
	},
	/**
	 * 时间差计算
	 */
	timeLag:function(difference){
		var  r ="",
		////计算出相差天数
		days=Math.floor(difference/(24*3600*1000)),
		//计算出小时数
		 leave1=difference%(24*3600*1000),   //计算天数后剩余的毫秒数
		 hours=Math.floor(leave1/(3600*1000)),
		//计算相差分钟数
		 leave2=leave1%(3600*1000),      //计算小时数后剩余的毫秒数
		 minutes=Math.floor(leave2/(60*1000)),
		//计算相差秒数
		  leave3=leave2%(60*1000),    //计算分钟数后剩余的毫秒数
		  seconds=Math.round(leave3/1000);
		if(days>0) r +=days+"天";
		if(hours>0) r +=hours+"小时";
		if(minutes>0) r +=minutes+"分钟";
		if(seconds>0) r +=seconds+"秒";
		
		return r;
	},
	/**
	 * 日期格式化
	 */
	dateTimeFormatter:function(value, row, index){
		if (value == null || value == "")
		     return "";
		 var result = value;

		 if (!Object.toIsDateStr(value)) {
		     if (value.toString().indexOf("/Date") > -1) {
		         result = eval("new " + value.substr(1, value.length - 2)).toDateFormat("yyyy-MM-dd hh:mm:ss");
		     } else {
		         result = new Date(value).toDateFormat("yyyy-MM-dd hh:mm:ss");
		     }

		 }
		 return result;
	},
	/**
	 * 时间差计算
	 * date1 开始时间 毫秒数
	 * date2 结束时间 毫秒数
	 */
	timeDifference:function(date1,date2){
		return $.timeLag(date2-date1);
	},
	/**
	 * 添加书签
	 * 
	 * @param title
	 * @param url
	 * @returns {Boolean}
	 */
	addBookmark : function(title, url) {
		if (window.sidebar) {
			window.sidebar.addPanel(title, url, "");
		} else if (document.all) {
			window.external.AddFavorite(url, title);
		} else if (window.opera && window.print) {
			return true;
		}
	},

	/**
	 * 设置cookie
	 * 
	 * @param name
	 * @param value
	 */
	setCookie : function(name, value) {
		var expdate = new Date();
		var argv = arguments;
		var argc = arguments.length;
		var expires = (argc > 2) ? argv[2] : null;
		var path = (argc > 3) ? argv[3] : null;
		var domain = (argc > 4) ? argv[4] : null;
		var secure = (argc > 5) ? argv[5] : false;
		if (expires != null)
			expdate.setTime(expdate.getTime() + (expires * 1000));

		document.cookie = name
				+ "="
				+ escape(value)
				+ ((expires == null) ? "" : (";  expires=" + expdate
						.toGMTString()))
				+ ((path == null) ? "" : (";  path=" + path))
				+ ((domain == null) ? "" : (";  domain=" + domain))
				+ ((secure == true) ? ";  secure" : "");

	},
	/**
	 * 删除cookie
	 * 
	 * @param name
	 */
	delCookie : function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		document.cookie = name + "=" + cval + ";  expires=" + exp.toGMTString();

	},
	/**
	 * 读取cookie
	 * 
	 * @param name
	 * @returns
	 */
	getCookie : function(name) {
		var arg = name + "=";
		var alen = arg.length;
		var clen = document.cookie.length;
		var i = 0;
		while (i < clen) {
			var j = i + alen;
			if (document.cookie.substring(i, j) == arg)
				return $.getCookieVal(j);
			i = document.cookie.indexOf("  ", i) + 1;
			if (i == 0)
				break;
		}
		return null;

	},
	getCookieVal : function(offset)

	{
		var endstr = document.cookie.indexOf(";", offset);
		if (endstr == -1)
			endstr = document.cookie.length;
		return unescape(document.cookie.substring(offset, endstr));
	},
	/**
	 * 通过js设置表单的值。
	 * 
	 * @param data
	 */
	setFormByJson : function(data) {
		var json = data;
		if (typeof(data) == "string") {
			json = jQuery.parseJSON(data);
		}

		for (var p in json) {

			var value = json[p];
			var frmElments = $("input[name='" + p + "'],textarea[name='" + p
					+ "']");
			if (frmElments[0]) {
				frmElments.val(value);
			}
		}
	},
	
	/**
	 * 在数组中指定的位置插入数据。
	 * 
	 * @param aryData
	 * @param data
	 * @param index
	 */
	insert : function(aryData, data, index) {
		if (isNaN(index) || index < 0 || index > aryData.length) {
			aryData.push(data);
		} else {
			var temp = aryData.slice(index);
			aryData[index] = data;
			for (var i = 0; i < temp.length; i++) {
				aryData[index + 1 + i] = temp[i];
			}
		}
	},

	getFirstLower : function(v) {
		var value = "";
		if (v.indexOf('_') != -1) {
			var ary = v.split('_');
			for (var i = 0; i < ary.length; i++) {
				var tmp = ary[i];
				if (i == 0) {
					value += tmp.toLowerCase();
				} else {
					value += tmp.substring(0, 1).toUpperCase()
							+ tmp.substring(1, tmp.length + 1).toLowerCase();
				}
			}
		} else {
			value = v.toLowerCase();
		}
		return value;
	},

	getFirstUpper : function(v) {
		var value = "";
		if (v.indexOf('_') != -1) {
			var ary = v.split('_');
			for (var i = 0; i < ary.length; i++) {
				var tmp = ary[i];
				value += tmp.substring(0, 1).toUpperCase()
						+ tmp.substring(1, tmp.length + 1).toLowerCase();
			}
		} else {
			value = v.substring(0, 1).toUpperCase()
					+ v.substring(1, v.length + 1).toLowerCase();
		}
		return value;
	},
	/**
	 * 打开全屏的窗口
	 * @param url
	 * @returns
	 */
	openFullWindow : function(url) {
		var h = screen.availHeight - 65;
		var w = screen.availWidth - 5;
		var vars = "top=0,left=0,height="
				+ h
				+ ",width="
				+ w
				+ ",status=no,toolbar=no,menubar=no,location=no,resizable=1,scrollbars=1";

		var win = window.open(url, "", vars, true);
		return win;
	},
	/**
	 * 如果传入的值是null、undefined或空字符串，则返回true。（可选的）
	 * 
	 * @param {Mixed}
	 *            value 要验证的值。
	 * @param {Boolean}
	 *            allowBlank （可选的） 如果该值为true，则空字符串不会当作空而返回true。
	 * @return {Boolean}
	 */
	isEmpty : function(v, allowBlank) {
		if(v && v.constructor===Object){
			for (var key in v) {
				return false;
			}
			return true;
		}
		if(v && v.constructor===Array){
			return v.length == 0;
		}
		return v === null || v === undefined
				|| (!allowBlank ? v === '' : false);
	},
	/**
	 * 通过scope的$id获取scope
	 */
	getScopeById: function(id) {
		var scope = null;
		if(!id){
			return scope;
		}
		$('.ng-scope').each(function(){
			var s = angular.element(this).scope(),
			sid = s.$id;

			if(sid == id) {
				scope = s;
				return false; // stop looking at the rest
			}
		});
		return scope;
	},
	/**
	 * 将数字转换成人名币大写。
	 * 
	 * @param currencyDigits
	 * @returns
	 */
	convertCurrency : function(currencyDigits) {

		var MAXIMUM_NUMBER = 99999999999.99;
		var CN_ZERO = "零";
		var CN_ONE = "壹";
		var CN_TWO = "贰";
		var CN_THREE = "叁";
		var CN_FOUR = "肆";
		var CN_FIVE = "伍";
		var CN_SIX = "陆";
		var CN_SEVEN = "柒";
		var CN_EIGHT = "捌";
		var CN_NINE = "玖";
		var CN_TEN = "拾";
		var CN_HUNDRED = "佰";
		var CN_THOUSAND = "仟";
		var CN_TEN_THOUSAND = "万";
		var CN_HUNDRED_MILLION = "亿";
		var CN_SYMBOL = "";
		var CN_DOLLAR = "元";
		var CN_TEN_CENT = "角";
		var CN_CENT = "分";
		var CN_INTEGER = "整";
		var integral;
		var decimal;
		var outputCharacters;
		var parts;
		var digits, radices, bigRadices, decimals;
		var zeroCount;
		var i, p, d;
		var quotient, modulus;
		currencyDigits = currencyDigits.toString();
		if (currencyDigits == "") {
			return "";
		}
		if (currencyDigits.match(/[^,.\d]/) != null) {
			return "";
		}
		if ((currencyDigits)
				.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
			return "";
		}
		currencyDigits = currencyDigits.replace(/,/g, "");
		currencyDigits = currencyDigits.replace(/^0+/, "");

		if (Number(currencyDigits) > MAXIMUM_NUMBER) {
			return "";
		}

		parts = currencyDigits.split(".");
		if (parts.length > 1) {
			integral = parts[0];
			decimal = parts[1];

			decimal = decimal.substr(0, 2);
		} else {
			integral = parts[0];
			decimal = "";
		}

		digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE,
				CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
		radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
		bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
		decimals = new Array(CN_TEN_CENT, CN_CENT);

		outputCharacters = "";

		if (Number(integral) > 0) {
			zeroCount = 0;
			for (i = 0; i < integral.length; i++) {
				p = integral.length - i - 1;
				d = integral.substr(i, 1);
				quotient = p / 4;
				modulus = p % 4;
				if (d == "0") {
					zeroCount++;
				} else {
					if (zeroCount > 0) {
						outputCharacters += digits[0];
					}
					zeroCount = 0;
					outputCharacters += digits[Number(d)] + radices[modulus];
				}
				if (modulus == 0 && zeroCount < 4) {
					outputCharacters += bigRadices[quotient];
				}
			}
			outputCharacters += CN_DOLLAR;
		}

		if (decimal != "") {
			for (i = 0; i < decimal.length; i++) {
				d = decimal.substr(i, 1);
				if (d != "0") {
					outputCharacters += digits[Number(d)] + decimals[i];
				}
			}
		}

		if (outputCharacters == "") {
			outputCharacters = CN_ZERO + CN_DOLLAR;
		}
		if (decimal == "") {
			outputCharacters += CN_INTEGER;
		}
		outputCharacters = CN_SYMBOL + outputCharacters;
		return outputCharacters;
	},
	/**
	 * 转换节点的tagName 示例 var me=$(this); me=$.tagName(me,"span");
	 * 
	 * @param self
	 *            {object} 要转换的单个节点
	 * @param tag
	 *            {string} 转换为tag类型节点
	 * @return {object} 转换后的节点对象
	 */
	tagName : function(self, tag) {
		var attrs = self.attributes, newTag = document.createElement(tag);
		for (var i = 0, c; c = attrs[i++];) {
			if (!c.value || c.value == 'null')
				continue;
			$(newTag).attr(c.name, c.value);
		}
		$(self).before($(newTag));
		$(self).remove();
		return $(newTag);
	},
	/**
	 * 在文本框指定的地方插入文本
	 * 
	 * @param txtarea
	 *            文本框对象
	 * @param tag
	 *            文本
	 */
	insertText : function(txtarea, tag) {
		// IE
		if (document.selection) {
			var theSelection = document.selection.createRange().text;
			if (!theSelection) {
				theSelection = tag;
			}
			txtarea.focus();
			if (theSelection.charAt(theSelection.length - 1) == " ") {
				theSelection = theSelection.substring(0, theSelection.length
								- 1);
				document.selection.createRange().text = theSelection + " ";
			} else {
				document.selection.createRange().text = theSelection;
			}
			// Mozilla
		} else if (txtarea.selectionStart || txtarea.selectionStart == '0') {
			var startPos = txtarea.selectionStart;
			var endPos = txtarea.selectionEnd;
			var myText = (txtarea.value).substring(startPos, endPos);
			if (!myText) {
				myText = tag;
			}
			if (myText.charAt(myText.length - 1) == " ") {
				subst = myText.substring(0, (myText.length - 1)) + " ";
			} else {
				subst = myText;
			}
			txtarea.value = txtarea.value.substring(0, startPos) + subst
					+ txtarea.value.substring(endPos, txtarea.value.length);
			txtarea.focus();
			var cPos = startPos + (myText.length);
			txtarea.selectionStart = cPos;
			txtarea.selectionEnd = cPos;
			// All others
		} else {
			txtarea.value += tag;
			txtarea.focus();
		}
		if (txtarea.createTextRange)
			txtarea.caretPos = document.selection.createRange().duplicate();
	},
	confirm : function(selector, message, callback) {
		$(selector).click(function() {
					if ($(this).hasClass('disabled'))
						return false;

					var ele = this;
					$.ligerDialog.confirm(message, $lang.tip.msg,
							function(rtn) {
								if (rtn) {
									if ($.browser.msie) {
										$.gotoDialogPage(ele.href);
									} else {
										location.href = ele.href;
									}
								}
							});
					return false;
				});
	},
	/**
	 * Dialog窗口跳转
	 * 
	 * @param {}
	 *            url 地址
	 */
	gotoDialogPage : function(url) {
		if ($.browser.msie) {
			var a = document.createElement("a");
			a.href = url;
			document.body.appendChild(a);
			a.click();
		} else {
			location.href = url;
		}
	},
	/**
	 * 克隆对象。//深度克隆
	 */
	cloneObject:function(obj){
	    var result,oClass=isClass(obj);
	        //确定result的类型
	    if(oClass==="Object"){
	        result={};
	    }else if(oClass==="Array"){
	        result=[];
	    }else{
	        return obj;
	    }
	    for(key in obj){
	        var copy=obj[key];
	        if(isClass(copy)=="Object"){
	            result[key]=arguments.callee(copy);//递归调用
	        }else if(isClass(copy)=="Array"){
	            result[key]=arguments.callee(copy);
	        }else{
	            result[key]=obj[key];
	        }
	    }
	    return result;
	},
	/**
	 * 清除表单
	 */
	clearQueryForm : function() {
		$("input[name^='Q_'],select[name^='Q_']").each(function() {
					$(this).val('');
				});
	},
	getFileExtName : function(fileName) {
		var pos = fileName.lastIndexOf(".");
		if (pos == -1)
			return "";
		return fileName.substring(pos + 1);
	},
	// 转成千分位。
	comdify : function(v) {
		if (v && v != '') {
			n = v + "";
			var re = /\d{1,3}(?=(\d{3})+$)/g;
			var n1 = n.trim().replace(/^(\d+)((\.\d+)?)$/, function(s, s1, s2) {
						return s1.replace(re, "$&,") + s2;
					});
			return n1;
		}
		return v;
	},
	toNumber : function(v) {
		if (v && v != '') {
			if (v.indexOf(',') == -1)
				return v;
			var ary = v.split(',');
			var val = ary.join("");
			return val;
		}
		return 0;
	},
	/**
	 * 上下移动
	 * @param            obj 上移的对象
	 * @param           isUp 是否上移
	 */
	moveTr : function(obj, isUp) {
		var thisTr = $(obj).parents("tr");
		if (isUp) {
			var prevTr = $(thisTr).prev();
			if (prevTr) {
				thisTr.insertBefore(prevTr);
			}
		} else {
			var nextTr = $(thisTr).next();
			if (nextTr) {
				thisTr.insertAfter(nextTr);
			}
		}
	},
	getPageSize:function() { 
		var winW, winH; 
		if(window.innerHeight) {// all except IE 
			winW = window.innerWidth; 
			winH = window.innerHeight; 
		} else if (document.documentElement && document.documentElement.clientHeight) {// IE 6 Strict Mode 
			winW = document.documentElement.clientWidth; 
			winH = document.documentElement.clientHeight; 
		} else if (document.body) { // other 
			winW = document.body.clientWidth; 
			winH = document.body.clientHeight; 
		}  // for small pages with total size less then the viewport  
		return {width:winW, height:winH}; 
	}

});

/**
 * 功能：给url添加一个当前时间日期数值，使页面不会被缓存。
 */
String.prototype.getNewUrl = function() {
	// 如果url中没有参数。
	var time = new Date().getTime();
	var url = this;
	// 去除‘#’后边的字符
	if (url.indexOf("#") != -1) {
		var index = url.lastIndexOf("#", url.length - 1);
		url = url.substring(0, index);
	}

	while (url.endWith("#")) {
		url = url.substring(0, url.length - 1);
	}
	url = url.replace(/(\?|&)rand=\d*/g, "");
	if (url.indexOf("?") == -1) {
		url += "?rand=" + time;
	} else {
		url += "&rand=" + time;
	}
	return url;
};


/**
 * 判断字符串是否为空。
 * 
 * @returns {Boolean}
 */
String.prototype.isEmpty = function() {
	var rtn = (this == null || this == undefined || this.trim() == '');
	return rtn;
};
/**
 * 功能：移除首尾空格
 */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
/**
 * 功能:移除左边空格
 */
String.prototype.lTrim = function() {
	return this.replace(/(^\s*)/g, "");
};
/**
 * 功能:移除右边空格
 */
String.prototype.rTrim = function() {
	return this.replace(/(\s*$)/g, "");
};

/**
 * 判断结束是否相等
 * 
 * @param str
 * @param isCasesensitive
 * @returns {Boolean}
 */
String.prototype.endWith = function(str, isCasesensitive) {
	if (str == null || str == "" || this.length == 0
			|| str.length > this.length)
		return false;
	var tmp = this.substring(this.length - str.length);
	if (isCasesensitive == undefined || isCasesensitive) {
		return tmp == str;
	} else {
		return tmp.toLowerCase() == str.toLowerCase();
	}

};
/**
 * 判断开始是否相等
 * 
 * @param str
 * @param isCasesensitive
 * @returns {Boolean}
 */
String.prototype.startWith = function(str, isCasesensitive) {
	if (str == null || str == "" || this.length == 0
			|| str.length > this.length)
		return false;
	var tmp = this.substr(0, str.length);
	if (isCasesensitive == undefined || isCasesensitive) {
		return tmp == str;
	} else {
		return tmp.toLowerCase() == str.toLowerCase();
	}
};

/**
 * 在字符串左边补齐指定数量的字符
 * 
 * @param c
 *            指定的字符
 * @param count
 *            补齐的次数 使用方法： var str="999"; str=str.leftPad("0",3); str将输出 "000999"
 * @returns
 */
String.prototype.leftPad = function(c, count) {
	if (!isNaN(count)) {
		var a = "";
		for (var i = this.length; i < count; i++) {
			a = a.concat(c);
		}
		a = a.concat(this);
		return a;
	}
	return null;
};

/**
 * 在字符串右边补齐指定数量的字符
 * 
 * @param c
 *            指定的字符
 * @param count
 *            补齐的次数 使用方法： var str="999"; str=str.rightPad("0",3); str将输出
 *            "999000"
 * @returns
 */
String.prototype.rightPad = function(c, count) {
	if (!isNaN(count)) {
		var a = this;
		for (var i = this.length; i < count; i++) {
			a = a.concat(c);
		}
		return a;
	}
	return null;
};

/**
 * 对html字符进行编码 用法： str=str.htmlEncode();
 * 
 * @returns
 */
String.prototype.htmlEncode = function() {
	return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g,
			"&gt;").replace(/\"/g, "&#34;").replace(/\'/g, "&#39;");
};

/**
 * 对html字符串解码 用法： str=str.htmlDecode();
 * 
 * @returns
 */
String.prototype.htmlDecode = function() {
	return this.replace(/\&amp\;/g, '\&').replace(/\&gt\;/g, '\>').replace(
			/\&lt\;/g, '\<').replace(/\&quot\;/g, '\'').replace(/\&\#39\;/g,
			'\'');
};

/**
 * 对json中的特殊字符进行转义
 */
String.prototype.jsonEscape = function() {
	return this.replace(/\"/g, "&quot;").replace(/\n/g, "&nuot;");
};

/**
 * 对json中的特殊字符进行转义
 */
String.prototype.jsonUnescape = function() {
	return this.replace(/&quot;/g, "\"").replace(/&nuot;/g, "\n");
};

/**
 * 字符串替换
 * 
 * @param s1
 *            需要替换的字符
 * @param s2
 *            替换的字符。
 * @returns
 */
String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
};

/**
 * 获取url参数
 * 
 * @returns {object}
 */
String.prototype.getArgs = function() {
	var args = {};
	if (this.indexOf("?") > -1) {
		var argStr = this.split("?")[1], argAry = argStr.split("&");

		for (var i = 0, c; c = argAry[i++];) {
			var pos = c.indexOf("=");
			if (pos == -1)
				continue;
			var argName = c.substring(0, pos), argVal = c.substring(pos + 1);
			argVal = decodeURIComponent(argVal);
			args[argName] = argVal;
		}
	}
	return args;
};

/**
 * 移除数组中指定对象
 */
Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.prototype.contains = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            return true;
        }
    }
    return false;
};

Array.prototype.insert = function (index, item) {
	this.splice(index, 0, item);
	return this;
};
/**
 * 去除数组中的重复项
 * @function [method] 判断对象是否相同的方法(可选参数，默认实现是深度匹配两个对象是否相同)，示例：function(x,y){if(x.id===y.id)return true;}
 */
Array.prototype.unique=function(method){
	if(!angular.isArray(this))return this;
	var sameObj = method || function(a, b) {
        var tag = true;
        for (var x in a) {
            if (!b[x])
                return false;
            if (typeof(a[x]) === 'object') {
                tag = sameObj(a[x], b[x]);
            } else {
                if (a[x] !== b[x])
                    return false;
            }
        }
        return tag;
    }
	
	var flag, that = this.slice(0);
	this.length = 0;
	for (var i = 0; i < that.length; i++) {
	    var x = that[i];
	    flag = true;
	    for (var j = 0; j < this.length; j++) {
	        y = this[j];
	        if (sameObj(x, y)) {
	            flag = false;
	            break;
	        }
	    }
	    if (flag) this[this.length] = x;
	}
	return this;
}

/**
 * var str=String.format("姓名:{0},性别:{1}","ray","男"); alert(str);
 * 
 * @returns
 */
String.format = function() {
	var template = arguments[0];
	var args = arguments;
	var str = template.replace(/\{(\d+)\}/g, function(m, i) {
				var k = parseInt(i) + 1;
				return args[k];
			});
	return str;
};

/**
 * 字符串操作 使用方法： var sb=new StringBuffer(); sb.append("aa"); sb.append("aa"); var
 * str=sb.toString();
 * 
 * @returns {StringBuffer}
 */
function StringBuffer() {
	this.content = new Array;
}
StringBuffer.prototype.append = function(str) {
	this.content.push(str);
};
StringBuffer.prototype.toString = function() {
	return this.content.join("");
};


/**
 * 日期格式化。
 * 日期格式：
 * yyyy，yy 年份
 * MM 大写表示月份
 * dd 表示日期
 * hh 表示小时
 * mm 表示分钟
 * ss 表示秒
 * q  表示季度
 * 实例如下：
 * var now = new Date(); 
 * var nowStr = now.format("yyyy-MM-dd hh:mm:ss"); 
 */
Date.prototype.format = function(format){ 
	var o = { 
		"M+" : this.getMonth()+1, //month 
		"d+" : this.getDate(), //day 
		"h+" : this.getHours(), //hour 
		"m+" : this.getMinutes(), //minute 
		"s+" : this.getSeconds(), //second 
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter 
		"S" : this.getMilliseconds() //millisecond 
	} 
	
	if(/(y+)/.test(format)) { 
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	} 

	for(var k in o) { 
		if(new RegExp("("+ k +")").test(format)) { 
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		} 
	} 
	return format; 
} 


/**
 * 求两个时间的天数差 日期格式为 yyyy-MM-dd 或 YYYY-MM-dd HH:mm:ss
 */
function daysBetween(DateOne, DateTwo) {
	if(DateOne && DateOne.constructor.name=='m')DateOne=DateOne.format('YYYY-MM-DD HH:mm:ss');
	if(DateTwo && DateTwo.constructor.name=='m')DateTwo=DateTwo.format('YYYY-MM-DD HH:mm:ss');
	var dayOne = '';
	var dayTwo = '';
	var timeOne = '';
	var timeTwo = '';

	if (DateOne != null && DateOne != '') {
		var arrOne = DateOne.split(' ');
		dayOne = arrOne[0];
		if (arrOne.length > 1) {
			timeOne = arrOne[1];
		}
	}

	if (DateTwo != null && DateTwo != '') {
		var arrTwo = DateTwo.split(' ');
		dayTwo = arrTwo[0];
		if (arrTwo.length > 1) {
			timeTwo = arrTwo[1];
		}
	}

	var OneMonth = 0;
	var OneDay = 0;
	var OneYear = 0;
	if (dayOne != null && dayOne != '') {
		var arrDate = dayOne.split('-');
		OneYear = parseInt(arrDate[0], 10);
		OneMonth = parseInt(arrDate[1], 10);
		OneDay = parseInt(arrDate[2], 10);
	}

	var TwoMonth = 0;
	var TwoDay = 0;
	var TwoYear = 0;
	if (dayTwo != null && dayTwo != '') {
		var arrDate = dayTwo.split('-');
		TwoYear = parseInt(arrDate[0], 10);
		TwoMonth = parseInt(arrDate[1], 10);
		TwoDay = parseInt(arrDate[2], 10);
	}

	var OneHour = 0;
	var OneMin = 0;
	var OneSec = 0;
	if (timeOne != null && timeOne != '') {
		var arrTiem = timeOne.split(':');
		OneHour = parseInt(arrTiem[0]);
		OneMin = parseInt(arrTiem[1]);
		OneSec = parseInt(arrTiem[2]);
	}

	var TwoHour = 0;
	var TwoMin = 0;
	var TwoSec = 0;
	if (timeTwo != null && timeTwo != '') {
		var arrTiem = timeTwo.split(':');
		TwoHour = parseInt(arrTiem[0]);
		TwoMin = parseInt(arrTiem[1]);
		TwoSec = parseInt(arrTiem[2]);
	}

	var vflag = TwoYear > OneYear ? true : false;
	if (!vflag) {
		vflag = TwoMonth > OneMonth ? true : false;
		if (!vflag) {
			vflag = TwoDay > OneDay ? true : false;

			if (!vflag) {
				if (OneDay == TwoDay) {
					vflag = TwoHour > OneHour ? true : false;
					if (!vflag) {
						vflag = TwoMin > OneMin ? true : false;
						if (!vflag) {
							vflag = TwoSec >= OneSec ? true : false;
						}
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
	}

	return vflag;
};

/**
 * 加载多个Script
 * 
 * @param resources
 *            script file array :['file1.js','file2.js']
 * @param callback
 *            function
 * @returns void
 */

jQuery.getMutilScript = function(resources, callback) {
	var getScript = function(url, callback) {
		$.ajax({
					url : url,
					dataType : "script",
					success : callback,
					async : false
				}).done(function() {
					callback && callback();
				});
	};
	var // reference declaration &amp; localization
	length = resources.length, handler = function() {
		counter++;
	}, deferreds = [], counter = 0, idx = 0;

	for (; idx < length; idx++) {
		deferreds.push(getScript(resources[idx], handler));
	}
	jQuery.when(deferreds).done(function() {
				callback && callback();
			});
};



jQuery.getWindowRect = function() {
	var myWidth = 0, myHeight = 0;
	if (typeof(window.innerWidth) == 'number') {
		// Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} else if (document.documentElement
			&& (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
		// IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	} else if (document.body
			&& (document.body.clientWidth || document.body.clientHeight)) {
		// IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	return {
		height : myHeight,
		width : myWidth
	};
}

// 禁用刷新。通过传入浏览器类型 来指定禁用某个浏览器的刷新
function forbidF5(exp) {
	var currentExplorer = window.navigator.userAgent;
	// ie "MSIE" ,, firefox "Firefox" ,,Chrome "Chrome",,Opera "Opera",,Safari
	// "Safari"
	if (currentExplorer.indexOf(exp) >= 0) {
		document.onkeydown = function(e) {
			var ev = window.event || e;
			var code = ev.keyCode || ev.which;
			if (code == 116) {
				ev.keyCode ? ev.keyCode = 0 : ev.which = 0;
				cancelBubble = true;
				return false;
			}
		};
	}
}
//判断数组中是否包含某个元素
function isInArray(arr, obj) {
    for (var i = 0; i < arr.length && arr[i] != obj; i++);
    return !(i == arr.length);
}
//判断数组中是否包含某个元素
function isInArrayByKey(arr, obj, key) {
    for (var i = 0; i < arr.length && arr[i][key] != obj[key]; i++);
    return !(i == arr.length);
}
//删除数组中某个元素
function removeObjFromArr(arrs,dx) 
{ 	
    if(isNaN(dx)||dx>arrs.length){return false;} 
    for(var i=0,n=0;i<arrs.length;i++) 
    { 
        if(arrs[i]!=arrs[dx]) 
        { 
            arrs[n++]=arrs[i] ;
        } 
    } 
    arrs.length-=1 ;
} 
//产生随机数
function GetRandomNum(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return (Min + Math.round(Rand * Range));
}
var JsonUtil = {
	//定义换行符
	n : "\n",
	//定义制表符
	t : "\t",
	//转换String
	convertToString : function(obj) {
		return JsonUtil.__writeObj(obj, 1);
	},
	//写对象
	__writeObj : function(obj //对象
			, level //层次（基数为1）
			, isInArray) { //此对象是否在一个集合内
		//如果为空，直接输出null
		if (obj == null) {
			return "null";
		}
		//为普通类型，直接输出值
		if (obj.constructor == Number || obj.constructor == Date
				|| obj.constructor == String || obj.constructor == Boolean) {
			var v = obj.toString();
			var tab = isInArray
					? JsonUtil.__repeatStr(JsonUtil.t, level - 1)
					: "";
			if (obj.constructor == String || obj.constructor == Date) {
				//时间格式化只是单纯输出字符串，而不是Date对象
				return tab + ("\"" + v + "\"");
			} else if (obj.constructor == Boolean) {
				return tab + v.toLowerCase();
			} else {
				return tab + (v);
			}
		}

		//写Json对象，缓存字符串
		var currentObjStrings = [];
		//遍历属性
		for (var name in obj) {
			var temp = [];
			//格式化Tab
			var paddingTab = JsonUtil.__repeatStr(JsonUtil.t, level);
			temp.push(paddingTab);
			//写出属性名
			temp.push(name + " : ");

			var val = obj[name];
			if (val == null) {
				temp.push("null");
			} else {
				var c = val.constructor;

				if (c == Array) { //如果为集合，循环内部对象
					temp.push(JsonUtil.n + paddingTab + "[" + JsonUtil.n);
					var levelUp = level + 2; //层级+2

					var tempArrValue = []; //集合元素相关字符串缓存片段
					for (var i = 0; i < val.length; i++) {
						//递归写对象                         
						tempArrValue.push(JsonUtil.__writeObj(val[i], levelUp,
								true));
					}

					temp.push(tempArrValue.join("," + JsonUtil.n));
					temp.push(JsonUtil.n + paddingTab + "]");
				} else if (c == Function) {
					temp.push(val);
				} else {
					//递归写对象
					temp.push(JsonUtil.__writeObj(val, level + 1));
				}
			}
			//加入当前对象“属性”字符串
			currentObjStrings.push(temp.join(""));
		}
		return (level > 1 && !isInArray ? JsonUtil.n : "") //如果Json对象是内部，就要换行格式化
				+ JsonUtil.__repeatStr(JsonUtil.t, level - 1) + "{" + JsonUtil.n //加层次Tab格式化
				+ currentObjStrings.join("," + JsonUtil.n) //串联所有属性值
				+ JsonUtil.n + JsonUtil.__repeatStr(JsonUtil.t, level - 1) + "}"; //封闭对象
	},
	__isArray : function(obj) {
		if (obj) {
			return obj.constructor == Array;
		}
		return false;
	},
	__repeatStr : function(str, times) {
		var newStr = [];
		if (times > 0) {
			for (var i = 0; i < times; i++) {
				newStr.push(str);
			}
		}
		return newStr.join("");
	}
};


/**
 * 将字符串转为json对象。
 * @param jsonStr
 * @param type  可不填写
 * @returns
 */
function parseToJson(jsonStr,type){
	type=type||1;
	if(jsonStr === "") return;
	try{
		switch(type){
			case 1:
				return eval("("+jsonStr+")");
			break;
			case 2:
				return $.parseJSON(jsonStr);
				break;
			case 3:
				return angular.fromJson(jsonStr);
				break;
			case 4:
				JSON.parse(jsonStr);
				break;
			default:
				dialogService.fail("解析json对象错误");
				break;
		}
		
	}catch(e){
		return parseToJson(jsonStr,type+1);
	}
}
/**
 * 获取元素当前页angular的scope
 * @param obj
 * @returns
 */
function getScope(obj){
	obj=(obj&&$(obj))||$("[ng-controller]");
	obj=(obj[0]?obj:$("body"));
	return obj.scope();
}
/**
 * 通过载入方法名，调用scope中的某个方法
 * @param funStr
 */
function triggerScopeFun(funStr){
	var scope  = getScope();
	var fun = scope[funStr];
	if(fun) return fun.call(this,arguments);
}

/**
 * 外部JS和angular 交互类。
 * 主要包括两个方法：
 * 1.获取当前上下文的scope。
 * 2.设置修改后的scope。
 */
var AngularUtil={};

/**
 * 获取当前Angularjs scope 。
 */
AngularUtil.getScope=function(){
	return angular.element($("[ng-controller]")[0]).scope();
}

/**
 * 保存外部js对scope的修改。
 */
AngularUtil.setData=function(scope){
	!scope.$$phase && scope.$digest();
};


/**
 * 获取当前环境中的 service
 * serviceName：指定的服务名称。
 * 这里需要注意的是，只能获取当前ng-controller注入模块中的service。
 */
AngularUtil.getService = function(serviceName,dialogService){
	if(!this.$injector){
		this.$injector =angular.element($("[ng-controller]")).injector();
	}
	if(!this.$injector){
		this.$injector =angular.element($("[ng-app]")).injector();
	}
	
	if(this.$injector.has(serviceName)) {
		return this.$injector.get(serviceName);
	}
	else {
		dialogService.alert(serviceName+"angular环境中没有找到该service！");
	}
};

/**
 * 获取元素的纵坐标 
 * @param e
 * @returns
 */
function getTop(e){
	if(!e)return null;
	var offset=e.offsetTop; 
	if(e.offsetParent!=null) offset+=getTop(e.offsetParent); 
	return offset; 
} 
/**
 * 出发checkbox的选中状态改变
 * @param me
 */
function toggleCheck(me){
	if(event&&event.toElement.tagName=="INPUT") return;
	var checkbox=$(me).find("input[type='checkbox']");
	if(checkbox[0]) checkbox[0].checked=!checkbox[0].checked;
}
//通过url片段获取Iframe
function getBpmFormEditIframe(url){
	var iframes=$(parent.document).find("iframe");
	for(var i=iframes.length;i--;){
		if($(iframes[i]).contents()[0].URL.indexOf(url)!=-1){
			return $(iframes[i]);
		}
	}
	return null;
}
function addCssToHtml(str_css) { //Copyright @ rainic.com
	 try { //IE下可行
		  var style = document.createStyleSheet();
		  style.cssText = str_css;
	 }
	 catch (e) { //Firefox,Opera,Safari,Chrome下可行
		  var style = document.createElement("style");
		  style.type = "text/css";
		  style.textContent = str_css;
		  document.getElementsByTagName("HEAD").item(0).appendChild(style);
	 }
}

function isComplexTag(elm){
	return elm.attr("type")=="checkbox"||elm.attr("type")=="radio"||elm.attr("selector-type");
}

function isArrayEquals(arr1,arr2){
	if(!(arr1 instanceof Array)||!(arr2 instanceof Array)) return false;
	for(var i =0;i<arr1.length;i++){
		if(arr1[i]!=arr2[i]) return false;
	}
	return true;
}

function downLoadFileById(fileId){
	var path =__ctx+"/system/file/download.ht?id="+fileId;
	window.open(path,'_blank');	
}

function sleep(n) {
    var start = new Date().getTime();
    while(true)  if(new Date().getTime()-start > n) break;
}

//阻止事件冒泡函数
function stopBubble(e)
{
    if(e && e.stopPropagation){
    	e.stopPropagation();
    }
    else{
    	window.event.cancelBubble=true;
    }
}
//阻止事件默认行为
function stopDefault(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    } else {
        window.event.returnValue = false;
    }
    return false;
}

String.prototype.replaceFirstMacthByIndex = function(oldVal , newVal , start) {
	var oldValLength = oldVal.length;
	var index = this.indexOf(oldVal,start);
	return this.substring(0,index) + this.substring(index+oldValLength);
};

//刷新指定的Grid
function refreshTargetGrid(gridId) {
    if (!gridId || gridId == "") gridId="grid";
    $('#' + gridId).datagrid("reload");
}


/**
 * 克隆工具类
 */
var CloneUtil = {
		/**
		 * 深复制【可以迭代】
		 */
		deep:function(obj){
			return jQuery.extend(true,{}, obj);
		},
		/**
		 * 浅复制【不能迭代】
		 */
		shallow:function(obj){
			return jQuery.extend({}, obj);
		},
		/**
		 * 数组复制
		 */
		list:function(obj){
			return $.map(obj, function (n) { return n; });
		}
}


var HtUtil={};
/**
 * 设置缓存。
 */
HtUtil.set=function(key,value){
	localStorage[key]=value;
}

/**
 * 获取缓存
 */
HtUtil.get=function(key){
	return localStorage[key];
}

/**
 * 删除缓存
 */
HtUtil.clean=function(key){
	localStorage.rmStorage(key);
}

/**
 * 设置缓存，value 为JSON对象。
 */
HtUtil.setJSON=function(key,value){
	var json=JSON.stringify(value)
	localStorage[key]=json;
}

/**
 * 根据键获取json对象。
 */
HtUtil.getJSON=function(key){
	var json=localStorage[key];
	if(json==undefined) return null;
	return JSON.parse(json);
}
//添加htDatecalc指令
HtUtil.doDateCalc=function(startTime,endTime,diffType){
	if(typeof startTime == "undefined" || startTime == ""
		|| typeof endTime == "undefined" || endTime == ""){
		return "";
	}
	var result;
	var temptype = diffType;
	if (diffType == "hour"){
		diffType = "minute";
	}
	if(startTime.indexOf("-") == -1 && endTime.indexOf("-") == -1){
		result=timeVal(startTime,endTime,diffType);//日期格式为 hh:mm:ss
	}else{
		result=dateVal(startTime,endTime,diffType);//日期格式YYYY-MM-DD
	}
	if (isNaN(result)){
		result = "";
	} else if (temptype == "hour") {
		//精确到半小时
		temp = parseInt(result / 60);
		if (result % 60 >= 30){
			temp = temp + 0.5;
		}
		result = temp;
	}
	return result;
}
HtUtil.getParameters=function(){
	var locUrl = window.location.search.substr(1);
	var aryParams=locUrl.split("&");
	var json={};
	for(var i=0;i<aryParams.length;i++){
		var pair=aryParams[i];
		var aryEnt=pair.split("=");
		var key=aryEnt[0];
		var val=aryEnt[1];
		if(json[key]){
			json[key]=json[key] +"," + val;
		}
		else{
			json[key]=val;
		}
		return json;
	}
}

/**
 * iframe 高度自适应。
 * @param obj
 */
function autoFrameHeight(obj){
    var doc=  obj.document || obj.contentDocument;
    if(obj != null && doc != null) {
    	obj.height = doc.body.scrollHeight+10;
    }
}

function loadIframe(obj){
	autoFrameHeight(obj);
	$(obj).parent().css("height",obj.height);
}

//展示背景iframe使改元素能在特殊页面office或者flash置顶处理
function createBackgroundIframe (menu){
	var body = menu.parent("body");
	
	var iframeObj = $("#backgroundIframe",body);
	if(iframeObj.length==0){
		iframeObj=$('<iframe  frameborder="0" id="backgroundIframe" style="position:absolute;z-index:1;"></iframe>');
		iframeObj.appendTo(body);
	}
	iframeObj.css({left:menu.css("left"),top:menu.css("top"),width:menu.css("width"),height:menu.css("height")});
	iframeObj.show();
	iframeObj.data("target",menu);
	
}

//如果改区域触发了关闭按钮则
//修改了源码在关闭的时候添加处理
function hideBackgroundIfream(){
	var backGroundIfream = $("#backgroundIframe");
	if(backGroundIfream.length!=0){
		var target = backGroundIfream.data("target");
		if(!target || target.is(":hidden")){
			backGroundIfream.hide();
		}
	}
}

function isClass(o){
    if(o===null) return "Null";
    if(o===undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8,-1);
}

/**
 * 返回选择的数据。
 * obj：easyui 表格对象。
 * field ：字段名
 */
function getSelectIds(gridId,field){
	var dategrid = $(gridId).datagrid('getChecked');
	if (dategrid == null || dategrid.length < 1) {
	    return null;
	} else {
		var aryId=[];
		for (i = 0; i < dategrid.length; i++) {
			aryId.push(dategrid[i][field]);
		}
		return aryId.join(",");
	}
}

// 用于传参请求后台跳转页面
function skipJsp(action, params) {  
    var form = $("<form></form>");  
    form.attr('action', action);  
    form.attr('method', 'post');  
    form.attr('target', '_self');  
    for(var key in params){
    	var input1 = $("<input type='hidden' name='"+key+"' />");  
        input1.attr('value', params[key]);  
        form.append(input1);
    }
    form.appendTo("body");  
    form.css('display', 'none');  
    form.submit();  
}  

/*Number扩展的原型方法*/
/**
 * 去尾法
 */
Number.prototype.toFloor = function (num) {
	num = (typeof num!="number")?0:num;
	return Math.floor(this * Math.pow(10, num)) / Math.pow(10, num);
};

/**
 * 进一法
 */
Number.prototype.toCeil = function (num) {
	num = (typeof num!="number")?0:num;
	return Math.ceil(this * Math.pow(10, num)) / Math.pow(10, num);
};

/**
 * 四舍五入法
 */
Number.prototype.toRound = function (num) {
	num = (typeof num!="number")?0:num;
	return Math.round(this * Math.pow(10, num)) / Math.pow(10, num);
};
/******
 * --------------------------日期计算--------------------------------
 */


//日期格式YYYY-MM-DD
dateVal = function(startTime, endTime, diffType){
	startTime = startTime.replace(/\-/g, "/");
	endTime = endTime.replace(/\-/g, "/");
	diffType = diffType.toLowerCase();
	var sTime = new Date(startTime); //开始时间
	var eTime = new Date(endTime); //结束时间

	if(diffType == "month"){
		return getMonthBetween(sTime,eTime);
	}

	var divNum = getDiffType(diffType);
	var result = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
	//作为除数的数字        结果+1 如，1号到1号则为1天
	if("day" == diffType)result++;
	return result;
}

//日期格式为 hh:mm:ss
timeVal = function(startTime, endTime, diffType){

	if(diffType == "month"){//若以月为单位  直接返回0
		return 0;
	}

	var temptype = diffType;
	if (diffType == "hour"){
		diffType = "minute";
	}
	var divNum = getDiffType(diffType)
	var sTime = startTime.split(':', 3);
	var eTime = endTime.split(':', 3);
	var h=(parseInt(eTime[0])-parseInt(sTime[0]));//时
	var m=(parseInt(eTime[1])-parseInt(sTime[1]));//分
	var s =eTime[2] ? (parseInt(eTime[2])-parseInt(sTime[2])) :0;//秒
	if(s < 0 ){
		m = m -1;
		s = 60+s;
	}
	if(m<0){
		h=h-1;
		m=60+m;
	}

	var result =parseInt(((h*3600+m*60+s)*1000/parseInt(divNum)));//先统一转换为毫秒，再转为对应的单位
	return result;
}

getMonthBetween = function(startDate,endDate){
	var num=0;
	var year=endDate.getFullYear()-startDate.getFullYear();
	num+=year*12;
	var month=endDate.getMonth()-startDate.getMonth();
	num+=month;
	var day=endDate.getDate()-startDate.getDate();
	if(day>0){
		num+=1;
	}
	return num;
}

getDiffType=function(diffType){
	var divNum=1;
	switch (diffType) {
		case "second":
			divNum = 1000;
			break;
		case "minute":
			divNum = 1000 * 60;
			break;
		case "hour":
			divNum = 1000 * 3600;
			break;
		case "day":
			divNum = 1000 * 3600 * 24;
			break;
		default:
			break;
	}
	return divNum;
}