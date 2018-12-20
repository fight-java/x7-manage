if (typeof FormMath == 'undefined') {
	FormMath = {};
}

/****************数学统计的扩展方法********************/
FormMath.toNumber = function(x){
	if(x === null || x === undefined ||  x === '')
		return '';
	if(typeof x == "string"){
		x = x.replace(/,/g, "");
	}
	var match = x.toString().match(/([$|￥])\d+\.?\d*/);
	if(match){
		x = x.replace(match[1],'');
	}
	return Number(x);
};

/**
 * 返回x的绝对值
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.abs = function(x){
    return Math.abs(x);
}

/**
 * 把x四舍五入为最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.round = function(x){
	return Math.round(x);
}

/**
 * 对x进行上舍入，返回等于或者大于x,并且与x最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.ceil = function(x){
	return Math.ceil(x);
}

/**
 * 对x进行下舍入，返回小于或者等于x，并且与x最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.floor = function(x){
	return Math.floor(x);
}

/**
 * 返回集合ary中最大的数
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.max = function(ary){
	var tmp,
		x = 0,
		size = ary.length;
	for(var i=0;i<size;i++){
		x = FormMath.toNumber(ary[i]);
		if(isNaN(x))continue;
		if(tmp===undefined){
			tmp = x;
		}
		else{
			if(x>tmp)
				tmp = x;	
		}
	}
	tmp = FormMath.toNumber(tmp);
	return tmp;
}

/**
 * 返回集合ary中最小的数
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.min = function(ary){
	var tmp,
		x = 0,
		size = ary.length;
	for(var i=0;i<size;i++){
		x = FormMath.toNumber(ary[i]);
		if(isNaN(x))continue;
		if(tmp===undefined){
			tmp = x;
		}
		else{
			if(x<tmp)
				tmp = x;	
		}
	}
	tmp = FormMath.toNumber(tmp);
	return tmp;
}

/**
 * 返回x的平方根
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.sqrt = function(x){
	return Math.sqrt(x);
}

/**
 * 获取ary的平均值
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.average = function(ary){
	var tmp,
		x = 0,
		size = ary.length;
	for(var i=0;i<size;i++){
		x = FormMath.toNumber(ary[i]);
		if(isNaN(x))continue;
		if(tmp===undefined){
			tmp = x;
		}
		else{
			tmp += x;
		}
	}
	tmp = FormMath.toNumber(tmp/size);
	return tmp;
};

/**
 * 求ary的和
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.sum = function(ary){
	var tmp,
		x = 0,
		size = ary.length;
	for(var i=0;i<size;i++){
		x = FormMath.toNumber(ary[i]);
		if(isNaN(x))continue;
		if(tmp===undefined){
			tmp = x;
		}
		else{
			tmp += x;
		}
	}
	tmp = FormMath.toNumber(tmp);
	return tmp;
};

/**
 * 返回保留小数点后b位的x的四舍五入值
 * @param  {[type]} x [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
FormMath.tofixed = function(x,b){
	var tmp = FormMath.toNumber(x);
	b = FormMath.toNumber(b);
	if(isNaN(tmp)||isNaN(b))return x;
	return tmp.toFixed(b);
};

/**
 * 将数字转换为人民币大写
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.convertCurrency = function(x){
	var tmp = FormMath.toNumber(x);
	if(isNaN(tmp))return x;
	return $.convertCurrency(tmp);
};


/****************数学统计的逻辑代码********************/
FormMath.doMath = function(){
		var me = $(this),
			exp = me.attr("ht-stat-fun");
		var value = FormMath.replaceSingleValue(exp,me);
		value = FormMath.replaceMultiValue(value);
		try{
			//计算表达式进行运算
			value = eval("("+value+")");
		}
		catch(e){
			return true;
		}
		if(/^(Infinity|NaN)$/i.test(value))return true;
		
		
		if(/^[0-9]*$/.test(value)){
			value = Number(value);
			//按字段的小数点设置处理小数点的问题（四舍五入）
			
			var jsonStr = me.attr("ht-number-format");
				json = eval('(' + jsonStr + ')');
			if(jsonValidate.length>0){
				var jsonObj = eval("("+jsonValidate+")");
				if(jsonObj.maxDecimalLen>=0){
					value = value.toFixed(jsonObj.maxDecimalLen);
				}
			}
		}
		
		me.val(value).trigger("change");
};

FormMath.replaceSingleValue = function(exp,t,sub){
	if(!exp)return 0;
	var reg=sub?/\[.*?\(([item].*?)\)\]/g:/\{.*?\(([data|item].*?)\)\}/g;
	exp = exp.replace(reg,function(){
		var name = arguments[1],
		value = 0;
		var	object;
		//子表
		if(sub){
			var pTr = t.closest("tr.owner-div");
			if(pTr.length == 0){
				pTr = $(t).closest("table");
			}
			object = $("[ng-model='"+name+"']",pTr);
		}else{
			object=$("[ng-model='"+name+"']");
		}
		if(object){
			var val = getValByScope(object);
			val = FormMath.toNumber(val);
			if(!isNaN(val))
				value = val;
		}
		return value;
	});
	return exp;
};

FormMath.replaceMultiValue = function(exp,sub){
	if(!exp)return 0;
	var reg = /\[.*?\(([data|item].*?)\)\]/g;// /\{.*?\((\w+\:\w+\:\w+)\)\}/g;
	exp = exp.replace(reg,function(){
		var name = arguments[1],
			value = [],
			object=sub?$("[ng-model='"+name+"']",sub):$("[ng-model='"+name+"']");
		//子表
		$(object).each(function(){
			var me = $(this);
			if(me){
				var val=FormMath.toNumber(getValByScope(me));
				if(!val=='')
				value.push(val);
			}
		});
		value = '[' + value.join(',') + ']'; 
		return value;
	});
	return exp;
};

/****************数学统计的逻辑代码********************/
/*
 * 将函数表达式中的目标字段获取出来
 * **/
FormMath.replaceName2Value = function(exp,scope){
	
	//{手机数字(item.sj)}*2
	//FormMath.sum([合计(data.sub.zbcs.hj)])  //"FormMath.sum([人数(data.csbdjs.sub_myclass.rs)])"
	if(!exp)return 0;
	var reg = /\{.*?\(([data.main|data.sub|item].*?)\)\}/g; 
	exp = exp.replace(reg,function(){
		var name = arguments[1],
			value=0;
		var	object;
		//子表
		if(scope){
			//子表统计计算情况。多行数据
			if(name.split(".").length>3){
				var valArray =[];
				var subMsg = name.split(".");
				var fieldName = subMsg[3];
				var subTableSrc =name.replace("."+fieldName,"");
				var rows = eval('scope.'+subTableSrc);
				for(var i=0,row;row=rows[i++];){
					valArray.push(row[fieldName]); 
				}
				value = valArray.join(",");
			}else{
				var val = eval('scope.'+name);
				val = FormMath.toNumber(val);
				if(!isNaN(val) && ""!=val) value = val;
			}
		}
		if(!value){
			value = 0;
		}
		return value;
	});
	return exp;
};


/******
 * --------------------------日期计算--------------------------------
 */


//日期格式YYYY-MM-DD
FormMath.dateVal = function(startTime, endTime, diffType){
	startTime = startTime.replace(/\-/g, "/");
	endTime = endTime.replace(/\-/g, "/");
	diffType = diffType.toLowerCase();
	var sTime = new Date(startTime); //开始时间
	var eTime = new Date(endTime); //结束时间
	
	if(diffType == "month"){
		return FormMath.getMonthBetween(sTime,eTime);
	}
	
	var divNum = FormMath.getDiffType(diffType);
	var result = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
	//作为除数的数字        结果+1 如，1号到1号则为1天
	if("day" == diffType && ((eTime.getTime() - sTime.getTime())%divNum)>0)result++;
	return result;
}

//日期格式为 hh:mm:ss
FormMath.timeVal = function(startTime, endTime, diffType){
	
	if(diffType == "month"){//若以月为单位  直接返回0
		return 0;
	}
	
	var temptype = diffType;
	if (diffType == "hour"){
		diffType = "minute";
	}
	var divNum = FormMath.getDiffType(diffType)
	var sTime = startTime.split(':', 3);
	var eTime = endTime.split(':', 3);
	var h=(parseInt(eTime[0])-parseInt(sTime[0]));//时
	var m=(parseInt(eTime[1])-parseInt(sTime[1]));//分
	var s = (parseInt(eTime[2])-parseInt(sTime[2]));//秒
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

FormMath.getMonthBetween = function(startDate,endDate){
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

FormMath.getDiffType=function(diffType){
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