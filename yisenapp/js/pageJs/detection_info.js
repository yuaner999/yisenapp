//获得员工的id
//var userName = '0001';
//信息的数量
var startNum = 0;
var num = 5;
var newtokenId = null;
var loginName = null;
var startDate;
var endDate;
var scene_id = "";
var statusupdate=1;
var taskBack = GetQueryString("taskBack");
var scene_id = GetQueryString("scene_id");
if(taskBack == 'taskBack'){
	getlistinfo(newtokenId);
}

$(function() {
	getLoginName();
//	reloadinfo();
	getTokenIdLocal(function(tokenId) {
		startDate =  dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
		endDate = new Date();
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getSceneList(tokenId)
				getlistinfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getSceneList(tokenId)
			getlistinfo(tokenId);
		}
	});
});

//加载现场下拉列表
function getSceneList(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/GetSceneName?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"name":loginName
			},
			timeout: 30000,
			success: function(data) {
				layer.close(loading);
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
//				给现场信息赋值
				var $scene = $("#message_scene");
				$scene.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="请选择现场" class="remove">请选择现场</option><option value="" class="remove">查看全部现场</option>';
				for (var i = 0; i < json.length; i++) {
					str += '<option value="'+json[i].scene_id+'">'+json[i].scene_name+'</option>';
				}
				$scene.html(str);
			},
			error: function() {
				layer.close(loading);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				layer.close(loading); //关闭加载层
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}
//现场下拉框选择
function changeScene(e){
	scene_id = $(e).val();
	startNum = 0;
	statusupdate = 0;
	if(scene_id == "请选择现场"){
		return;
	}
	getlistinfo(newtokenId);
}

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


//加载列表的信息
function getlistinfo(tokenId) {
//	if (newtokenId == "close") { //回调过程中出错
//		//layer.close(load); //关闭加载层
//		return;
//	}
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Detection.asmx/GetDetectionListInfo2?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"username": loginName,
			"num": num,
			"startnum": startNum,
			"scene_id":scene_id,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate)
		},
//		timeout: 30000,
		success: function(data) {
			if(data.status=="0"){
				if(startNum==0){
					$(".box").html("");
				}
				
				layer.msg("没有更多的信息");
				$("#loadmore").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			if (json.length < 1) {
				layer.msg("没有更多的信息");
				$("#loadmore").hide();
				return;
			}
//			$(".box").html("");
			if (json.length < num) {
				$("#loadmore").hide();
			}
			var str = "";
			for (var i = 0; i < json.length; i++) {
				//检测时间
				if (json[i].detection_date != "") {
					json[i].detection_date = dealTimeFormat(json[i].detection_date);
				}
				console.log(json[i].detection_date);
				str+='<a href="detection.html?id='+json[i].detection_id+'&scene_id='+scene_id+'">'+
						'<div class="infoItem">'+
							'<p>'+
								'<mark>检测时间</mark>'+
								'<span class="right">'+json[i].detection_date+'</span>'
							+'</p>'+
							'<ul>'+
								'<li>'+
									'<span>现场名称</span>'
									+'<span>'+json[i].scene_name+'</span>'
								+'</li>'
								+'<li>'+
									'<span>设备名称</span>'
									+'<span>'+json[i].equipment_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<button class="blockBox g">查看详情</button>'
							+'</div>'
						+'</div>'
					  +'</a>';
			}
			str = str.replace(/null/gi, "");
			if(statusupdate==0)
			{
				$(".box").html(str);				
			}
			else{
				$(".box").append(str);
			}
			statusupdate=1;	
		},
		error: function(data) {
			layer.alert("加载信息失败");
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
//	var newstartDate = new Date($("#startDate").html());
//	var newendDate = new Date($("#endDate").html());
//	newstartDate = addDate(newstartDate, 0)
//	newendDate = addDate(newendDate, 1);
//	if (newstartDate > newendDate) {
//		layer.msg("请选择正确的时间顺序");
//		return;
//	}
//	if (newstartDate != startDate) {
//		startDate = newstartDate;
//		getlistinfo(newtokenId);
//	}
//	if (newendDate != endDate) {
//		endDate = newendDate;
//		getlistinfo(newtokenId);
//	}
}

// 日期，在原有日期基础上，增加days天数，默认增加1天
function addDate(date, days) {
	console.log("日期")
	var date = new Date(date);
	date.setDate(date.getDate() + days);
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return date.getFullYear() + '-' + getFormatDate(month) + '-' + getFormatDate(day);
}
// 日期月份/天的显示，如果是1位数，则在前面加上'0'
function getFormatDate(arg) {
	console.log("天数")
	if (arg == undefined || arg == '') {
		return '';
	}
	var re = arg + '';
	if (re.length < 2) {
		re = '0' + re;
	}

	return re;
}
//对时间格式进行处理 不带秒
function dealTimeFormat(timestr) {
//	console.log("不带秒")
	var date1 = timestr.split(" ");
	var day = date1[0];
	if(date1.length>1){
		var timestr = date1[1].split(":");
		var hour = timestr[0] + ":" + timestr[1];
	}else{
		var hour="";
	}
	
	
	return day + " " + hour;
}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}