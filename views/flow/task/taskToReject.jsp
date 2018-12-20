<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>驳回任务</title>
<%@include file="/commons/include/edit.jsp"%>

<script type="text/javascript">
	//定义中配置指定的返回方式
	var theBackMode = "${backMode}";
	//定义中配置指定只能驳回的节点
	var thebackNode = "${backNode}";
	$(function() {
		$(".nodeChoice").hide();
		var frm = $('#agreeForm').form();
		$("a.fa-save").click(function() {
			var isRejectPreAct = $("input[name='rejectMode']:checked").attr("id") == "rejectPreAct";
			var rejectMode = $("#actionName").val();
			var backMode = theBackMode || $("input[name='backHandMode']:checked").val();

			if ($("textarea[name='opinion']").val() == "") {
				$.topCall.error("请填写驳回意见！");
				return false;
			}

			if (rejectMode == "reject") {
				if (isRejectPreAct == false) {
					$("#destination").val(backMode == "direct" ? $("#userNodeSelect").val() : $("#goMapUserNodeSelect").val());
				} else {
					//取可退回的最近节点
					$("#destination").val(backMode == "direct" ? $("#userNodeSelect").find("option:eq(1)").val() : $("#goMapUserNodeSelect").find("option:eq(1)").val());
				}
			}

			//如果流程定义中配置的仅只能驳回的节点
			if (thebackNode != "" && "${canRejectToStart}" != "true") {
				$("#destination").val(thebackNode);
				//检查可驳回合法性
				var isLegality = false;
				var select = theBackMode == "direct" ? "userNodeSelect" : "goMapUserNodeSelect";
				//直来直往
				$("#" + select + " option").each(function(index, item) {
					if ($(this).val() == thebackNode) {
						isLegality = true;
						return false;
					}
				});

				if (!isLegality) {
					$.topCall.error("流程配置中指定的仅能驳回到节点[" + thebackNode + "]，当前此驳回不被允许，如有疑问请联系系统管理员！");
					return false;
				}

			} else if (rejectMode == "reject" && $("#destination").val() == "" && $("input[showDestination='true']:checked").length == 1) {
				$.topCall.error("请选择驳回到的节点！");
				return false;
			}

			if (!frm.valid()) {
				return;
			}
			frm.ajaxForm({
				success : showResponse
			});
			$.topCall.progress();
			frm.submit();
		});

		$("[name='rejectMode']").click(function() {

			$("#destination").val("");
			var me = $(this), val = me.val();
			$("#actionName").val(val);
			//退回方式

			showNodeChoice();
		});

		$("[name='backHandMode']").click(function() {
			showNodeChoice();
		});
	});

	function showNodeChoice() {
		//退回方式
		var rejectRadio = $("input[name='rejectMode']:checked");
		var rejectMode = rejectRadio.val();
		var backHandMode = $("input[name='backHandMode']:checked").val()||theBackMode;
		if (rejectRadio.attr("showDestination")) {
			rejectMode = "rejectToDestination" //驳回指定节点与驳回使用同一handle ，区别有没有destination
		}

		$("#destination").val("");
		if (rejectMode == "backToStart"||rejectRadio.attr("id") == "rejectPreAct") {
			$(".nodeChoice").hide();
		} else {
			if (backHandMode == "direct") {
				$("#nodeChoice1").hide();
				$("#nodeChoice2").show();
			} else {
	
				
				//按流程图走
				$("#nodeChoice1").show();
				$("#nodeChoice2").hide();
			}
		}
	}

	function showResponse(responseText) {
		$.topCall.closeProgress();
		var data = JSON.parse(responseText);
		var script = "var tempFunction = function(data){ " + window.parent.curent_btn_after_script_ + "};"
		var afterScriptPassed = eval(script + "tempFunction(data);");

		var resultMessage = new com.hotent.form.ResultMessage(responseText);
		if (resultMessage.isSuccess()) {
			refreshWelcomeList();//刷新首页信息列表
			$.topCall.message({
				base : {
					type : 'alert',
					title : '温馨提示',
					msg : resultMessage.getMessage(),
					fn : function(r) {

						try {
							window.parent.opener.refreshTargetGrid("grid");
							if (afterScriptPassed !== false)
								window.parent.close();
						} catch (err) {
							window.parent.close();
						}

					}
				}
			});
		} else {
			$.topCall.error(resultMessage.getMessage(), resultMessage.getCause());
		}
	}
	
	function refreshWelcomeList(){
		try {
			window.parent.opener.location.reload();
		 } catch(err){}
	}
</script>
</head>
<body>
	<div>
		<div class="toolbar-panel">
			<div class="buttons">
				<a href="javascript:;" class="btn btn-primary fa fa-save">确定</a> <a href="javascript:;" onClick="javascript:window.selfDialog.dialog('close');" class="btn btn-default fa fa-close">取消</a>
			</div>
		</div>

		<form id="agreeForm" action="complete" method="post">
			<input type="hidden" name="taskId" value="${taskId}"> <input type="hidden" id="actionName" name="actionName" value="${canRejectToStart?'backToStart':'reject'}">
			<table cellspacing="0" class="table-form">
				<c:if test="${!canRejectToStart&&backNode==''}">
					<tr>
						<th width="20%" style="text-align: right; font-size: 14px; font-weight: normal; padding-right: 5px; color: #10451A;">驳回方式:</th>
						<td><c:if test="${canRejectPreAct && canReject}">
								<label class="radio-inline"> <input type="radio" id="rejectPreAct" name="rejectMode" value="reject" checked="checked" />驳回上一步
								</label>
							</c:if> <c:if test="${canRejectToAnyNode}">
								<label class="radio-inline"> <input type="radio" name="rejectMode" showDestination="true" value="reject" />驳回指定节点
								</label>
							</c:if></td>
					</tr>
				</c:if>
				<c:choose>
					<c:when test="${backMode==''}">
						<tr>
							<th width="20%" style="text-align: right; font-size: 14px; font-weight: normal; padding-right: 5px; color: #10451A;">返回方式:</th>
							<td><c:if test="${backMode!=null&&(fn:indexOf(backMode,'direct')!=-1)}">
									<label class="radio-inline"> <input type="radio" name="backHandMode" value="direct" checked="checked" />回到本节点
									</label>
								</c:if> <c:if test="${backMode!=null&&(fn:indexOf(backMode,'normal')!=-1)}">
									<label class="radio-inline"> <input type="radio" name="backHandMode" value="normal" <c:if test="${fn:indexOf(backMode,'direct')==-1}">checked="checked"</c:if> />按流程图执行
									</label>
								</c:if></td>
						</tr>
					</c:when>
					<c:otherwise>
						<tr style="display: none;">
							<th></th>
							<td><input type="hidden" name="backHandMode" value="${backMode}" /></td>
						</tr>
					</c:otherwise>
				</c:choose>

				<c:if test="${!canRejectToStart}">
					<tr id="nodeChoice1" class="nodeChoice">
						<th width="20%" style="text-align: right; font-size: 14px; font-weight: normal; padding-right: 5px; color: #10451A;">驳回到节点</br>(按流程图)
						</th>
						<td><select class="inputText" id='goMapUserNodeSelect'>
								<option value="">请选择...</option>
								<c:forEach var="bpmExeStack" items="${bpmExeStacksGoMapUserNode}">
									<option value="${bpmExeStack.nodeId}">${bpmExeStack.name}</option>
								</c:forEach>
						</select></td>
					</tr>
					<tr id="nodeChoice2" class="nodeChoice">
						<th width="20%" style="text-align: right; font-size: 14px; font-weight: normal; padding-right: 5px; color: #10451A;">驳回到节点</br>(直来直往)
						</th>
						<td><select class="inputText" id="userNodeSelect">
								<option value="">请选择...</option>
								<c:forEach var="bpmExeStack" items="${bpmExeStacksUserNode}">
									<option value="${bpmExeStack.nodeId}">${bpmExeStack.name}</option>
								</c:forEach>
						</select></td>
					</tr>
				</c:if>

				<tr>
					<th width="20%" style="text-align: right; font-size: 14px; font-weight: normal; padding-right: 5px; color: #10451A;">意见:</th>
					<td><textarea style="width:400px;" name="opinion" cols="60" rows="5" class="inputText" validate="{required:true}"></textarea> <input id='destination' name='destination' type="hidden" /></td>
				</tr>
			</table>
		</form>
	</div>
</body>
</html>