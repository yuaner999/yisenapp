var tid = GetQueryString("id");
var newtokenId = null;
var loginName = getLoginName();
var acept_LoginName = "";   //申请者登录名
var send_LoginName = "";   //发布者登录名
var btnText = "";
var task_status = GetQueryString("task_status");
$(function() {
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getTaskInfo(tokenId);
				getReplyList(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getTaskInfo(tokenId);
			getReplyList(tokenId);
		}
	});
});

function tiaozhuan(){
	window.location.href = "task_info.html?task_status="+task_status+"&taskBack=taskBack";
}

//加载列表的信息
function getTaskInfo(tokenId) {
	$("#tasklist").html("");
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/GetTaskDetail?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"tid": tid,
		},
		timeout: 30000,
		success: function(data) {

			if (data.status == "0") {
				layer.msg(data.result);
				return;
			}
			var $ul = $(".list");
			var json = eval("(" + data.result + ")");
			var str = "";
			var taskStatus = ""; //任务状态
			var acptEmpName ="";   //申请者姓名		
			if (json[0].task_status == 0) {
				taskStatus = "未接收";
			} else if (json[0].task_status == 1) {
				taskStatus = "处理中";
			} else if (json[0].task_status == 2) {
				taskStatus = "审核中";
			} else if (json[0].task_status == 3) {
				taskStatus = "已完成";
			} else if (json[0].task_status == 4) {
				taskStatus = "已终止";
			}
			if (json[0].accept_emp_name != "" && json[0].accept_emp_name != null) {
				acptEmpName = json[0].accept_emp_name;
			} else {
				acptEmpName = "暂无申请者";
			}

			if (json.length == 1) { //任务未接收状态
				//alert(json[0].user_login);
				if (loginName == json[0].user_login) { //发布者
					btnText = "终止任务";
				} else {
					btnText = "申请任务";
				}
			} else if (json.length == 2) { //任务接收之后的状态
				//alert(json[0].user_login + "||" + json[1].user_login);
				
				acept_LoginName = json[1].user_login;
				send_LoginName = json[0].user_login;
				
				if (loginName == json[1].user_login) { //申请者
					if (json[0].task_status == 1) {
						btnText = "申请完成任务";
					} else {
						btnText = "0";
					}
				} else if (loginName == json[0].user_login) { //发布者
					btnText = "终止任务";
				} else {
					btnText = "0";
				}
			}

			if (btnText == "0") {
			str = '<div class="infoItem">'+
					 '<p>'+
						'<mark>发布时间</mark>'+
						'<span class="right">'+
							'<span>'+json[0].task_time+'</span>'
						+'</span>'
					+'</p>'+
					'<div class="info">'+
						'<b class="yellow">发布者</b>'+
						'<b>'+json[0].emp_name+'</b>'+
						'<span class="yellow right">'+taskStatus+'</span>'
					+'</div>'+
					'<ul>'+
						'<li>'+
							'<span>任务</span>'+
							'<span>'+json[0].task_content+'</span>'
						+'</li>'+
						'<li>'+
							'<span>申请者</span>'+
							'<span>'+acptEmpName+'</span>'
						+'</li>'
					+'</ul>'
				 +'</div>';
//				str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//					json[0].task_content + '</span></p><li><a>申请者：</a><span class="">' + acptEmpName + '</span></li><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li><div class="btnn1"></div></ol></li>';
			} else if (btnText == "申请任务") {
			str = '<div class="infoItem">'+
				 '<p>'+
					'<mark>发布时间</mark>'+
					'<span class="right">'+
						'<span>'+json[0].task_time+'</span>'
					+'</span>'
				+'</p>'+
				'<div class="info">'+
					'<b class="yellow">发布者</b>'+
					'<b>'+json[0].emp_name+'</b>'+
					'<span class="yellow right">'+taskStatus+'</span>'
				+'</div>'+
				'<ul>'+
					'<li>'+
						'<span>任务</span>'+
						'<span>'+json[0].task_content+'</span>'
					+'</li>'+
					'<li>'+
						'<span>申请者</span>'+
						'<span>'+acptEmpName+'</span>'
					+'</li>'
				+'</ul>'
				+'<div class="btnBox">'
	    			+'<button class="blockBox b" onclick="ApplyTask()">申请任务</button>'
	    		+'</div>'
			 +'</div>';
			 
//				str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//					json[0].task_content + '</span></p><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li><div class="btnn1">' + '<a href="task.html?id=' + json[0].task_id + '" onclick="ApplyTask()">' + btnText + '</a></div></ol></li>';
			} else if (btnText == "申请完成任务") {
			str = '<div class="infoItem">'+
					 '<p>'+
						'<mark>发布时间</mark>'+
						'<span class="right">'+
							'<span>'+json[0].task_time+'</span>'
						+'</span>'
					+'</p>'+
					'<div class="info">'+
						'<b class="yellow">发布者</b>'+
						'<b>'+json[0].emp_name+'</b>'+
						'<span class="yellow right">'+taskStatus+'</span>'
					+'</div>'+
					'<ul>'+
						'<li>'+
							'<span>任务</span>'+
							'<span>'+json[0].task_content+'</span>'
						+'</li>'+
						'<li>'+
							'<span>申请者</span>'+
							'<span>'+acptEmpName+'</span>'
						+'</li>'
					+'</ul>'
					+'<div class="btnBox">'
		    			+'<button class="blockBox nulg" onclick="ApplyCompleteTask()">' + btnText + '</button>'
		    		+'</div>'
				 +'</div>';
//				str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//					json[0].task_content + '</span></p><li><a>申请者：</a><span class="">' + acptEmpName + '</span></li><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li>' + '<div class="btnn1"><a href="task.html?id=' + json[0].task_id + '" onclick="ApplyCompleteTask()">' + btnText + '</a></div></ol></li>';
			} else if (btnText == "终止任务") {
				if (taskStatus == "审核中") {
//					str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//						json[0].task_content + '</span></p><li><a>申请者：</a><span class="">' + acptEmpName + '</span></li><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li><div class="btnn1">' 
						str = '<div class="infoItem">'+
								 '<p>'+
									'<mark>发布时间</mark>'+
									'<span class="right">'+
										'<span>'+json[0].task_time+'</span>'
									+'</span>'
								+'</p>'+
								'<div class="info">'+
									'<b class="yellow">发布者</b>'+
									'<b>'+json[0].emp_name+'</b>'+
									'<span class="yellow right">'+taskStatus+'</span>'
								+'</div>'+
								'<ul>'+
									'<li>'+
										'<span>任务</span>'+
										'<span>'+json[0].task_content+'</span>'
									+'</li>'+
									'<li>'+
										'<span>申请者</span>'+
										'<span>'+acptEmpName+'</span>'
									+'</li>'
								+'</ul>'
								+'<div class="btnBox">'
					    			+'<button class="blockBox y" onclick="StopTask()">'+btnText+'</button>'
					    			+'<button class="blockBox g" onclick="CompleteTask()">确认完成</button>'
					    			+'<button class="blockBox r" onclick="RejectTask()">驳回完成</button>'
					    		+'</div>'
							+'</div>';
				}else if(taskStatus == "已终止") {
				str = '<div class="infoItem">'+
						 '<p>'+
							'<mark>发布时间</mark>'+
							'<span class="right">'+
								'<span>'+json[0].task_time+'</span>'
							+'</span>'
						+'</p>'+
						'<div class="info">'+
							'<b class="yellow">发布者</b>'+
							'<b>'+json[0].emp_name+'</b>'+
							'<span class="yellow right">'+taskStatus+'</span>'
						+'</div>'+
						'<ul>'+
							'<li>'+
								'<span>任务</span>'+
								'<span>'+json[0].task_content+'</span>'
							+'</li>'+
							'<li>'+
								'<span>申请者</span>'+
								'<span>'+acptEmpName+'</span>'
							+'</li>'
						+'</ul>'
					 +'</div>';
//					str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//						json[0].task_content + '</span></p><li><a>申请者：</a><span class="">' + acptEmpName + '</span></li><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li>' + '<div class="btnn1"></div></ol></li>';
				} else {
				str = '<div class="infoItem">'+
						 '<p>'+
							'<mark>发布时间</mark>'+
							'<span class="right">'+
								'<span>'+json[0].task_time+'</span>'
							+'</span>'
						+'</p>'+
						'<div class="info">'+
							'<b class="yellow">发布者</b>'+
							'<b>'+json[0].emp_name+'</b>'+
							'<span class="yellow right">'+taskStatus+'</span>'
						+'</div>'+
						'<ul>'+
							'<li>'+
								'<span>任务</span>'+
								'<span>'+json[0].task_content+'</span>'
							+'</li>'+
							'<li>'+
								'<span>申请者</span>'+
								'<span>'+acptEmpName+'</span>'
							+'</li>'
						+'</ul>'
					 +'</div>';
//					str = '<li><p>发布者：' + json[0].emp_name + '<span></span><span>' + json[0].task_time + '</span></p><ol><p><span style="color: #017d7b;">任务：</span><span>' +
//						json[0].task_content + '</span></p><li><a>申请者：</a><span class="">' + acptEmpName + '</span></li><li><a>任务完成状态：</a><span class="no_ok">' + taskStatus + '</span></li>' + '<div class="btnn1"><a href="task.html?id=' + json[0].task_id + '" onclick="StopTask()">' + btnText + '</a></div></ol></li>';
				}
			}

			str = str.replace(/null/gi, "");
			$(".box").html(str);
		},
		error: function(data) {
			layer.alert("加载任务失败");
		},
		complete: function(XMLHttpRequest, status) {
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//加载回复信息列表
function getReplyList(tokenId) {
	$(".detailContainer").html("");
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/GetTaskReply?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"tid": tid,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				var str='<div class="item">'+
					'<p>'+
						'<b></b>'+
						'<span class="right">'+
							'<span></span>'
						+'</span>'
					+'</p>'+
					'<article>暂无回复</article>'
				+'</div>';
				str = str.replace(/null/gi, "");
				$(".detailContainer").html(str);
				return;
			}
			var $ul = $(".list");
			var json = eval("(" + data.result + ")");
			var str = "";
			for (var i = 0; i < json.length; i++) {
//				str = '<li><p> 回复者：' + json[i].reply_emp_name + '<span></span><span>' + json[i].reply_time + '</span></p><ol><p><span style="color: #017d7b;">' +
//					'内容：</span><span>' + json[i].reply_content + '</span></p></ol></li>';
				str = 
				'<div class="item">'+
					'<p>'+
						'<b>'+json[i].reply_emp_name+'</b>'+
						'<span class="right">'+
							'<span>'+json[i].reply_time+'</span>'
						+'</span>'
					+'</p>'+
					'<article>'+json[i].reply_content+'</article>'
				+'</div>'
				str = str.replace(/null/gi, "");
				if (i == 0) {
					$(".detailContainer").html(str);
				} else {
					$(".detailContainer").append(str);
				}
			}
		},
		error: function(data) {
			layer.alert("加载任务失败");
		},
		complete: function(XMLHttpRequest, status) {
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//发表回复
function replyTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var content = "";
	content = $("#replyContent").val();
	if (content == "") {
		layer.close(loading);
		layer.alert("回复内容不能为空");
		return;
	}

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/ReplyTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": loginName,
			"content": content,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//申请完成
function ApplyTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/ApplyTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": loginName,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//确认完成任务（审核任务）
function CompleteTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/CompleteTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": acept_LoginName,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
//申请完成任务
function ApplyCompleteTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/ApplyCompleteTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": loginName,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
//驳回完成
function RejectTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/RejectTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": send_LoginName,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//终止任务
function StopTask() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/StopTask?jsoncallback?",
		async: false, // 同步请求
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"tid": tid,
			"userName": send_LoginName,
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				layer.msg(data.result);
				return;
			} else {
				if (data.status == "1") {
					layer.msg(data.result);
					return;
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.reload();
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}