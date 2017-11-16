//信息的数量
var startNum = 0;
var num = 5;
var statusupdate = 1;
var colorStatus = "";
var startDate;
var endDate;
var task_status = "";
var status = "";
var taskBack = GetQueryString("taskBack");
var task_status = GetQueryString("task_status");
window.onscroll = function() {
		if (getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
			startNum += num;
			getlistinfo(newtokenId);
		}
	}
	//获取滚动条当前的位置 
function getScrollTop() {
	var scrollTop = 0;
	if (document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if (document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}

//获取当前可是范围的高度 
function getClientHeight() {
	var clientHeight = 0;
	if (document.body.clientHeight && document.documentElement.clientHeight) {
		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
	} else {
		clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
	}
	return clientHeight;
}
//获取文档完整的高度 
function getScrollHeight() {
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

var newtokenId = null;
var loginName = null;
getLoginName();
$(function() {
	getTokenIdLocal(function(tokenId) {
		startDate = dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
		endDate = dateformat(new Date(), "yyyy-MM-dd");
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getlistinfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getlistinfo(tokenId);
		}
	});

});
//加载列表的信息
function getlistinfo(tokenId) {
//	if(taskBack == 'taskBack'){
//		task_status = task_status1;
//	}
//	console.log(task_status)
	//$("#tasklist").html("");
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/GetTaskListInfo2?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"userName": loginName,
			"num": num,
			"startNum": startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"task_status":task_status
		},
		timeout: 30000,
		success: function(data) {
			if (data.status == "0") {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg("信息不存在");
				}
				$("#loadmore").hide();
				return;	
			}
			var $ul = $(".box");
			var json = eval("(" + data.result + ")");
			if (json.length < 1) {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg("信息不存在");
				}
				$("#loadmore").hide();
				return;	
			}
			if (json.length < num) {
				$("#loadmore").hide();
			}
			var str = "";
			for (var i = 0; i < json.length; i++) {
				var date1 = json[i].task_time.split(" ");
				var day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0] + ":" + time[1];
				var status = "";
				if (json[i].task_status == 0) {
					status = "未接收";
					colorStatus = "yellow right";
				} else if (json[i].task_status == 1) {
					status = "处理中";
					colorStatus = "blue right";
				} else if (json[i].task_status == 2) {
					status = "审核中";
					colorStatus = "blue right";
				} else if (json[i].task_status == 3) {
					status = "已完成";
					colorStatus = "red right";
				} else if (json[i].task_status == 4) {
					status = "已终止";
					colorStatus = "red right";
				}
				if (status != "") {
					str+= '<div class="infoItem">'+
							'<p>'+
								'<mark>发布时间</mark>'+
								'<span class="right">'+
									'<span>'+hour+" "+day+'</span>'
								+'<span>'
							+'</p>'+
							'<div class="info">'+
								'<b>任务状态</b>'+
								'<span class="'+colorStatus+'">'+status+'</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>发布人</span>'+
									'<span>'+json[i].emp_name+'<span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="task.html?id=' + json[i].task_id + '&task_status='+task_status+'">'+
									'<button class="blockBox g">查看任务</button>'
								+'</a>'
							+'</div>'
						+'</div>';
				} else {
					layer.msg("任务状态出错");
					$("#loadmore").hide();
					return;
				}
			}
			str = str.replace(/null/gi, "");
			if (statusupdate == 0) {
				$(".box").html(str);
			} else {
				$(".box").append(str);
			}
			statusupdate = 1;
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

function reloadinfo() {
	var newstartDate = $("#startDate").text();
	var newendDate = $("#endDate").text();
	var date1 = new Date(newstartDate);
	var date2 = new Date(newendDate);
	if(date1 > date2) {
		layer.msg("请选择正确的时间顺序");
		return;
	}
}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}
//状态下拉框选择
function changeType(e){
task_status = $(e).val();
//console.log(task_status)
startNum = 0;
statusupdate = 0;
if(task_status == "请选择类型"){
	return;
}
getlistinfo(newtokenId);
}