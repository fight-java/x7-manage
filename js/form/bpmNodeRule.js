var editor = null;

function changeType(type) {
	if (type == 2) {
		$('#filterSetting').hide();
		$('#sqlSetting').show();
		editor.setValue("");
	} else {
		$('#filterSetting').show();
		$('#sqlSetting').hide();
	}
}

function initType(type, condition) {
	$('#type').val(type);
	changeType(type);
	if (type == 2) {
		editor.setValue(condition);
		condition = "";
	}
	return condition
}

function varsChange() {
	var me = $(this), val = me.val();
	if ($.isEmpty(val)){
		return;
	}
	me.val('');
	editor.replaceSelection(val);
}

function fieldChange() {
	var me = $(this), selected = me.find("option:selected"), source = selected.attr('source'), val = me.val();
	if ($.isEmpty(val)){
		return;
	}
	val = (source == 1 ? ("F_" + val) : val);
	me.val('');
	editor.replaceSelection(val);
}

function tableChange() {
	var me = $(this), selected = me.find("option:selected"), source = selected.attr('source'), val = me.val();
	if ($.isEmpty(val)){
		return;
	}
	val = (source == 1 ? ("W_" + val) : val);
	me.val('');
	editor.replaceSelection(val);
}

/**
 * 获得初始化数据
 * 
 * @return {String}
 */
function getInitData() {
	var data = $("#filterTxt").val().trim();
	if (data == ""){
		return '';
	}
	var json = eval("(" + data + ")");
	if (json.length == 0){
		return '';
	}
	return json;
};

/**
 * 设置判定值
 * 
 * @param {}
 *            p
 * @param {}
 *            val
 * @param {}
 *            isJudgeCon
 */
function setJudgeValue(p, val, isJudgeCon) {
	if (!p){
		return;
	}
	if (!isJudgeCon) {
		p.find("input").each(function() {
			var me = $(this), value = me.val(), type = me.attr("type");
			if (type == "checkbox" || type == "radio") {
				if (val.indexOf(value) > -1) {
					me.attr("checked", "checked");
				}
			} else {
				if (/\&\&/.test(val)) {
					var vals = val.split(/\&\&/);
					if (me.attr("type") == "hidden"){
						me.val(vals[0]);
					}
					else{
						me.val(vals[1]);
					}
				}
				else{
					me.val(val);
				}
			}
		});
	}
	var sel = p.find("select");
	sel.each(function() {
		var me = $(this), name = me.attr("name");
		if ((name == "judgeCondition") == isJudgeCon) {
			me.val(val);
		}
	});
	// 处理变量问题
	if (isJudgeCon) {
		sel.trigger("change");
	}
};

/**
 * 更新内容
 * 
 * @param {}
 *            item
 * @param {}
 *            data
 */
function updateContent(item, data) {
	var nobr = $('<div class="nobr" style="float:left;margin-right:-999em;"></div>');
	// 字段克隆
	var flowVarsSelect = $("#flowVarsSelect").clone(true).removeAttr("id");
	var paramKey = $("#paramKey").clone(true).removeAttr("id");
	var paramCondition = $("#paramCondition").clone(true).removeAttr("id");
	var paramValue = $("#paramValue").clone(true).removeAttr("id");
	var ruleType;
	if (!data) {
		ruleType = "1";
	} else {
		ruleType = data.ruleType;
	}

	// 普通条件
	if (ruleType == '1') {
		labelSpan = $('<span class="label-span left"></span>').attr("ruleType", ruleType).text('普通条件');
		nobr.append(labelSpan).append(flowVarsSelect).append($('<div class="judge left margin-set"></div>'));
		$("div.nobr", item).remove();
		item.append(nobr);
		if (data) {
			flowVarsSelect.val(data.flowvarKey).trigger("change");
			var judgeExp = $("div.judgeExp", item);
			var judgeExp2 = $("div.judgeExp2", item);
			if (judgeExp) {
				setJudgeValue(judgeExp, data.judgeCon1, true);
				setJudgeValue(judgeExp, data.judgeVal1, false);
			}
			if (judgeExp2) {
				setJudgeValue(judgeExp2, data.judgeCon2, true);
				setJudgeValue(judgeExp2, data.judgeVal2, false);
			}
		}
	}
	// 脚本规则
	else if (ruleType == '2') {
		labelSpan = $('<span class="label-span left"></span>').attr("ruleType", ruleType).text('脚本条件');
		var judge = $('<div class="judge left margin-set"></div>').append($('<a name="script" href="###" onclick="editConditionScript(this)">脚本</a>'));
		nobr.append(labelSpan).append(judge);
		$("div.nobr", item).remove();
		item.append(nobr);
		if (data.script) {
			item.data("script", data.script);
			item.data("tables", data.tables);
		} else if (typeof data.script === 'undefined') {
			addConditionScript(item);
		}
	} else {// 组织属性、用户属性
		if (ruleType == '3') {
			labelSpan = $('<span class="label-span left"></span>').attr("ruleType", ruleType).text('用户属性');
		} else {
			labelSpan = $('<span class="label-span left"></span>').attr("ruleType", ruleType).text('组织属性');
		}
		nobr.append(labelSpan).append(paramKey).append(paramCondition).append(paramValue);
		$("div.nobr", item).remove();
		item.append(nobr);
		if (data) {
			paramKey.val(data.paramKey);
			paramCondition.val(data.paramCondition);
			paramValue.val(data.paramValue);
		}
	}
};

/**
 * rule生成json
 * 
 * @params item
 * @returns {Object}
 */
function rule2json(item) {
	var jobject = {}, ruleType = $("span.label-span", item).attr("ruleType");

	// 普通规则
	if (ruleType == "1") {
		var flowvarKey = $("select[name='flowVars']", item).val(), objSel = $("select[name='flowVars']", item).find("option:selected"), flowvarText = objSel.text(), source = objSel.attr("source"), table = objSel.attr("table"), mainTable = objSel.attr("maintable"), relation = objSel.attr("relation"), judgeExp = $("div.judgeExp", item), judgeExp2 = $("div.judgeExp2", item), isHidden = objSel.attr("ishidden"), conDesc = [];
		// 数据来源通过前面传入
		jobject.source = source;
		// 数据表
		jobject.table = table;
		// 主表
		jobject.mainTable = mainTable;
		// 外键
		jobject.relation = relation;
		// 是否隐藏
		jobject.isHidden = isHidden;

		if (!judgeExp || judgeExp.length == 0){
			return null;
		}
		conDesc.push(flowvarText);
		var optType = judgeExp.attr("optType");
		jobject.optType = optType;
		jobject.flowvarKey = flowvarKey;

		jobject.datefmt = judgeExp.attr("datefmt");

		jobject.judgeCon1 = $("select[name='judgeCondition']", judgeExp).val();
		conDesc.push($("select[name='judgeCondition']", judgeExp).find("option:selected").text());
		jobject.judgeVal1 = getJudgeValue(judgeExp);
		conDesc.push(getJudgeText(judgeExp));
		if (judgeExp2 && judgeExp2.length > 0) {
			jobject.judgeCon2 = $("select[name='judgeCondition']", judgeExp2).val();
			conDesc.push('并且');
			conDesc.push($("select[name='judgeCondition']", judgeExp2).find("option:selected").text());
			jobject.judgeVal2 = getJudgeValue(judgeExp2);
			conDesc.push(getJudgeText(judgeExp2));
		}
		jobject.conDesc = conDesc.join(' ');
	}
	// 脚本规则
	else if (ruleType == '2') {
		var script = item.data("script"), tables = item.data("tables");
		jobject.script = script;
		jobject.tables = tables;
		jobject.conDesc = ' 脚本 ';
	} else {// ruleType=3:用户属性 ruleType=4:组织属性
		var typeTCondesc = [];
		var paramKey = $("select[name='paramKey']", item).val(),
		    dataType = $("select[name='paramKey']", item).find("option:selected").attr("title");
		var paramCondition = $("select[name='paramCondition']", item).val();
		var paramValue = $("input[name='paramValue']", item).val();
		jobject.paramKey = paramKey;
		jobject.paramCondition = paramCondition;
		jobject.paramValue = paramValue;
		typeTCondesc.push(paramKey);
		typeTCondesc.push(paramCondition);
		typeTCondesc.push(paramValue);
		jobject.conDesc = typeTCondesc.join(' ');
		jobject.expression = paramKey + paramCondition + paramValue;
		jobject.dataType = dataType;
	}

	jobject.ruleType = ruleType;
	var compType = $("select.computing-select", item).val();
	if (compType) {
		// 运算类型
		jobject.compType = compType;
	}
	return jobject;
};

/**
 * 获取字段类型类型识别码 1、 数字标识 2、字符串标识 3、 日期标识 4、数据字典标识 5、选择器标识
 * 
 */
function getFlowVarType(opt) {
	var value = opt.val(), ctltype = opt.attr("ctltype"), ftype = opt.attr("ftype");

	// 首先判断控件类型
	if (ctltype) {
		switch (ctltype.toString()) {
		// 用户、角色、岗位、组织选择器
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "17":
		case "18":
		case "19":
			return 5;
			// 字典
		case "3":
		case "11":
		case "13":
		case "14":
			return 4;
			// 日期
		case "15":
			return 3;
		}
	}
	// 发起人
	if (value == "startUser"){
		return 5;
	}
	if (ftype) {
		// 根据变量类型识别
		switch (ftype.toLowerCase()) {
		case "int":
		case "number":
			return 1;
		case "varchar":
		case "string":
			return 2;
		case "date":
			return 3;
		}
	}
	return 2;
};

/**
 * 获取判定值表达式
 * 
 * @param {}
 *            optType
 * @param {}
 *            option
 * @return {}
 */
function getInput(optType, option) {
	var input;
	switch (optType) {
	case 1:
	case 2:
	case 4:
		input = $("#normal-input").clone(true).removeAttr("id");
		break;
	case 3:
		var datefmt = option.attr("datefmt");
		if ($.isEmpty(datefmt)){
			datefmt = 'yyyy-MM-dd';
		}
		input = $("#date-input").clone(true).removeAttr("id").attr("datefmt", datefmt);
		break;
	case 5:
		input = getSelector(option).children();
		break;
	}

	return input;

}

/**
 * 获取判定值表达式
 * 
 * @param {}
 *            optType
 * @param {}
 *            option
 * @return {}
 */
function getJudgeExp(optType, option) {
	var expDiv = $('<div class="judgeExp left"></div>');
	var judgeCon = $("#judgeCon-" + optType).clone(true).removeAttr("id");
	if (!judgeCon || judgeCon.length == 0) {
		judgeCon = $("#judgeCon-1").clone(true).removeAttr("id");
	}
	var selVal = judgeCon.find('select').val();
	expDiv.attr("optType", optType).append(judgeCon);
	var input = getInput(optType, option);
	expDiv.append(input);
	return expDiv;
};

/**
 * 字段选择事件
 */
function flowVarChange(el) {
	var me = el || $(this);
	var nobr = me.parents("div.nobr");
	var option = me.find("option:selected");

	if (!option.val()){
		return;
	}

	var optType = getFlowVarType(option);
	var datefmt = option.attr("datefmt");
	var judgeCon = null;
	var judgeDiv = $("div.judge", nobr).empty();
	// 获取判定条件
	var judgeExp = getJudgeExp(optType, option);

	judgeDiv.append(judgeExp);
	// 数字或日期则为多个
	if (optType == 1 || optType == 3) {
		var judgeExp2 = judgeExp.clone(true).removeClass("judgeExp").addClass("judgeExp2");
		judgeDiv.append(judgeExp2);
	}
};

/**
 * 判断条件的改变
 */
function judgeConditionChange() {
	var me = $(this), judgeConditionSpan = me.parent(), judgeValueSpan = judgeConditionSpan.next(".judge-value"), type = judgeValueSpan.attr("type"), opttype = judgeConditionSpan.parent().attr("opttype"), firstVal = 1, secendVal = 2, val = me.val();
	switch (opttype) {
	case 1:
	case "1":
		if ($.inArray(parseInt(val), [ 7, 8 ]) == -1) {
			judgeValueSpan.remove();
			judgeConditionSpan.after($("#normal-input").clone());
			return;
		}
		break;
	case 2:
	case "2":
		if ($.inArray(parseInt(val), [ 7, 8 ]) == -1) {
			judgeValueSpan.remove();
			judgeConditionSpan.after($("#normal-input").clone());
			return;
		}
		break;
	case 5:
	case "5":
		break;
	default:
		return;
		break;
	}
	if (val == firstVal || val == secendVal) {
		if (type == firstVal){
			return;
		}
		var option = judgeConditionSpan.parent().parent().parent().find("option:selected");
		var optType = getFlowVarType(option);
		var input = getInput(optType, option);
		judgeValueSpan.remove();
		judgeConditionSpan.parent().append(input);
	} else {
		if (type == secendVal){
			return;
		}
		var commonVar = $('#commonVar').clone(true).removeAttr("id");
		judgeValueSpan.remove();
		judgeConditionSpan.parent().append(commonVar);
	}
}

/**
 * 获取字典类型的 条件值 控件
 * 
 * @param {}
 *            option
 * @return {}
 */
function getDicControl(option) {
	var value = option.val(), ctltype = option.attr("ctltype"), chosenopt = option.attr("chosenopt"), opts = eval("(" + chosenopt + ")"), html = '', data = [], type = "";
	var tempHtml = $("#dic-radio-checkbox").val();
	// 控件13或者14都为多选
	if (ctltype.toString() == '13' || ctltype.toString() == '14'){
		type = "checkbox";
	}
	else {
		tempHtml = $("#dic-select").val();
	}

	for (var i = 0, c; c = opts[i++];) {
		data.push({
			type : type,
			name : value,
			option : c.key,
			memo : c.value
		});
	}

	html = easyTemplate(tempHtml, data).toString();
	return $(html);
};

/**
 * 获取不同类型的选择器
 * 
 * @param {}
 *            option
 * @return {}
 */
function getSelector(option) {
	var ctltype = option.attr("ctltype"), value = option.val(), str = "user-div";
	switch (ctltype.toString()) {
	case "4":// 用户单选
	case "8":// 用户多选
		str = "user-div";
		break;
	case "5":// 角色
	case "17":// 角色
		str = "role-div";
		break;
	case "6":// 组织
	case "18":// 组织
		str = "org-div";
		break;
	case "7":// 岗位
	case "19":// 岗位
		str = "position-div";
		break;
	}
	var control = $("#" + str).clone(true, true).removeAttr("id");
	$("input[type='text']", control).attr("name", value);
	$("input[type='hidden']", control).attr("name", value + "ID");
	$("a.link", control).attr("name", value);
	return control;
};

/**
 * 获取判定值
 * 
 * @param {}
 *            p
 * @return
 */
function getJudgeValue(p) {
	if (!p)
		return '';
	var val = [];
	p.find("input").each(function() {
		var me = $(this), type = me.attr("type");
		if (type == "checkbox" || type == "radio") {
			if (me.attr("checked"))
				val.push(me.val());
		} else
			val.push(me.val());
	});
	p.find("select").each(function() {
		var me = $(this), name = me.attr("name");
		if (name == "judgeCondition")
			return true;
		val.push(me.val());
	});
	return val.join('&&');
};

/**
 * 获取判定text
 * 
 * @param {}
 *            p
 * @return {String}
 */
function getJudgeText(p) {
	if (!p)
		return '';
	var val = [];
	p.find("input:visible").each(function() {
		var me = $(this), type = me.attr("type");
		if (type == "checkbox" || type == "radio") {
			if (me.attr("checked")) {
				val.push(me.parent().text());
			}
		} else
			val.push(me.val());
	});
	p.find("select").each(function() {
		var me = $(this), name = me.attr("name");
		if (name == "judgeCondition")
			return true;
		val.push(me.find("option:selected").text());
	});
	return val.join('&&');
};

/**
 * 添加条件或脚本
 * 
 * @param {}
 *            ruleType 1、条件；2、脚本
 */
function addDiv(ruleType) {
	$("#ruleDiv").linkdiv("addDiv", {
		ruleType : ruleType
	});
};

/**
 * 删除条件
 */
function removeDiv() {
	$("#ruleDiv").linkdiv("removeDiv");
};

/**
 * 组合条件
 */
function assembleDiv() {
	$("#ruleDiv").linkdiv("assembleDiv");
};

/**
 * 拆分条件
 */
function splitDiv() {
	$("#ruleDiv").linkdiv("splitDiv");
};

/**
 * 获得数据
 * 
 * @return {}
 */
function getData() {
	return $("#ruleDiv").linkdiv("getData");
};

/**
 * 保存
 */
function save() {
	var condition = "", name = $('#name'), nameV = name.val(), key = $('#key'), keyV = key.val(), type = $('#type').val(), rtn = {};
	if (nameV == "" || keyV == "") {
		alert("请输入过滤名称或key！");
		return;
	}
	if (type == 2) {
		editor.save();
		condition = $('#sql').val();
	} else {
		condition = getData();
	}
	rtn.condition = condition;
	rtn.name = nameV;
	rtn.key = keyV;
	rtn.type = type;
}

function getPingyin(inputObj) {
	var input = $(inputObj).val();
	if ($.trim(input).length < 1)
		return;
	var py = Share.getPingyin({
		input : input
	});
	if ($.trim($('#key').val()).length > 1)
		return;
	$('#key').val(py);
}