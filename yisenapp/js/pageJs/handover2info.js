//信息的数量
var startDate;
var endDate;
var newtokenId = null;
var loginName = null;
var message_scene = "";
var message_scene = GetQueryString("message_scene");
var taskBack = GetQueryString("taskBack");
getLoginName();
$(function() {
	init();
});
//初始化页面
function init() {
	startDate = dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
	endDate = dateformat(new Date(), "yyyy-MM-dd")
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getSceneList(tokenId);
				getlistinfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getSceneList(tokenId);
			getlistinfo(tokenId);

		}
	});
}
var statusupdate = 1;
var startNum = 0;
var num = 5;

window.onscroll = function() {

		if(getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
			startNum += num;
			getlistinfo(newtokenId);
		}

	}
	//获取滚动条当前的位置 
function getScrollTop() {
	var scrollTop = 0;
	if(document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if(document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}

//获取当前可是范围的高度 
function getClientHeight() {
	var clientHeight = 0;
	if(document.body.clientHeight && document.documentElement.clientHeight) {
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

//加载现场下拉列表
function getSceneList(tokenId) {
	//加载现场
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetSceneName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"name": loginName
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if(data.status == '0') {
				layer.msg(data.result);
				return;
			}
			//				给现场信息赋值
			var $scene = $("#message_scene");
			$scene.html();
			var json = eval("(" + data.result + ")");
			var str = '<option value="请选择现场" class="remove">请选择现场</option><option value="" class="remove">查看全部现场</option>';
			for(var i = 0; i < json.length; i++) {
				str += '<option value="' + json[i].scene_id + '">' + json[i].scene_name + '</option>';
			}
			$scene.html(str);
		},
		error: function() {
			layer.close(loading);
			layer.msg("服务器连接失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
//现场下拉框选择
function changeScene(e) {
	message_scene = $(e).val();
	startNum = 0;
	statusupdate = 0;
	if(message_scene == "请选择现场"){
		return;
	}
	getlistinfo(newtokenId);
}

//加载列表的信息
function getlistinfo(tokenId) {
	if(message_scene == 'null'){
		message_scene = '';
	}
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetHandoverListInfo21?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"scene_id": message_scene,
			"tokenId": tokenId,
			"username": loginName,
			"num": num,
			"startnum": startNum,
			"startDate": startDate,
			"endDate": endDate
		},
		timeout: 30000,
		success: function(data) {
			console.log(data)
			layer.close(loading);
			var box = $(".box");
			if(data.status == "0") {
				if(startNum > 0) {
					layer.msg("没有更多的信息");
				} else {
					box.html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			if(json.length < 1) {
				if(startNum > 0) {
					layer.msg("没有更多的信息");
				} else {
					box.html("");
					layer.msg("信息不存在");
				}
				$("#loadmore").hide();
				return;
			}
			if(json.length < num) {
				$("#loadmore").hide();
			}
			var str = "";
			for(var i = 0; i < json.length; i++) {
				var date1 = json[i].handover_datetime_before.split(" ");
				var day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0] + ":" + time[1];
				if(json[i].handover_status == '0') { //0已提交的
					str += "<div class='infoItem'>" +
						"<p>" +
						"<mark>" + '交班' + "</mark>" +
						"<span class='right'>" +
						"<span>" + json[i].handover_datetime_before + "</span>" +
						"</span>" +
						"</p>" +
						"<div class='info'>" +
						"<b class='yellow'>" + '交班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_before + "</b>" +
						"<span class='deepBlue right'>" + '已提交' + "</span>" +
						"</div>" +
						"<div class='info'>" +
						"<b class='green'>" + '接班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_after + "</b>" +
						"</div>" +
						"<ul style='padding-bottom: 15px;'>" +
						"<li>" +
						"<span>" + '现场名称' + "</span>" +
						"<span>&nbsp;" + json[i].scene_name + "</span>" +
						"</li>" +
						"</ul>" +
						"</div>"
				} else if(json[i].handover_status == '2') { //2已交班的
					str += "<div class='infoItem'>" +
						"<p>" +
						"<mark>" + '交班' + "</mark>" +
						"<span class='right'>" +
						"<span>" + json[i].handover_datetime_before + "</span>" +
						"</span>" +
						"</p>" +
						"<div class='info'>" +
						"<b class='yellow'>" + '交班人' + "</b>&nbsp;" +
						"<b>&nbsp;" + json[i].handover_man_before + "</b>" +
						"<span class='deepBlue right'>" + '已交班' + "</span>" +
						"</div>" +
						"<div class='info'>" +
						"<b class='green'>" + '接班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_after + "</b>" +
						"</div>" +
						"<ul style='margin-bottom: 15px;'>" +
						"<li>" +
						"<span>" + '现场名称' + "</span>" +
						"<span>&nbsp;" + json[i].scene_name + "</span>" +
						"</li>" +
						//						"<button class='green' onclick='preHandoverDetail(this)' name='" + json[i].handover_id + "'>查看详情</button>" +
						"</ul>" +
						"<div class='btnBox'>" +
						"<button class='blockBox g'  onclick='preHandoverDetail(this)' name='" + json[i].handover_id + '&message_scene='+message_scene+"'>查看详情</button>" +
						"</div>" +
						"</div>"
				} else if(json[i].handover_status == '3') { //3不同意
					str += "<div class='infoItem'>" +
						"<p>" +
						"<mark>" + '交班' + "</mark>" +
						"<span class='right'>" +
						"<span>" + json[i].handover_datetime_before + "</span>" +
						"</span>" +
						"</p>" +
						"<div class='info'>" +
						"<b class='yellow'>" + '交班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_before + "</b>" +
						"<span class='red right'>" + '不同意' + "</span>" +
						"</div>" +
						"<div class='info'>" +
						"<b class='green'>" + '接班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_after + "</b>" +
						"</div>" +
						"<ul style='padding-bottom: 15px;'>" +
						"<li>" +
						"<span>" + '现场名称' + "</span>" +
						"<span>&nbsp;" + json[i].scene_name + "</span>" +
						"</li>" +
						"</ul>" +
						"<div class='btnBox'>" +
						"<button class='blockBox g' onclick='preHandoverDetail(this)' name='" + json[i].handover_id + "'>查看详情</button>" +
						"</div>" +
						"</div>"

				} else { //4未提交
					str += "<div class='infoItem'>" +
						"<p>" +
						"<mark>" + '交班' + "</mark>" +
						"<span class='right'>" +
						"<span>" + json[i].handover_datetime_before + "</span>" +
						"</span>" +
						"</p>" +
						"<div class='info'>" +
						"<b class='yellow'>" + '交班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_before + "</b>" +
						"<span class='deepBlue right'>" + '未提交' + "</span>" +
						"</div>" +
						"<div class='info'>" +
						"<b class='green'>" + '接班人' + "</b>" +
						"<b>&nbsp;" + json[i].handover_man_after + "</b>" +
						"</div>" +
						"<ul style='margin-bottom: 15px;'>" +
						"<li>" +
						"<span>" + '现场名称' + "</span>" +
						"<span>&nbsp;" + json[i].scene_name + "</span>" +
						"</li>" +
						//						"<button class='yellow' onclick='preInsertHandover(this)' name='" + json[i].handover_id + "'>修改</button>" +
						"</ul>" +
						"<div class='btnBox'>" +
						"<button class='blockBox y'  onclick='preInsertHandover(this)' name='" + json[i].handover_id + "'>修改</button>" +
						"<button class='blockBox r' onclick='delMes(this)' name='" + json[i].handover_id + "'>删除</button>" +
						"</div>" +
						"</div>";
				}
			}
			str = str.replace(/null/gi, "");
			if(statusupdate == 0) {
				box.html(str);
			} else {
				box.append(str);
			}
			statusupdate = 1;

		},
		error: function(data) {
			layer.close(loading);
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.close(loading);
				layer.msg("请求超时");
			}
		}
	});
}

//提醒
function delMes(handover) {
	layer.confirm('确定删除这条消息吗？', {
			title :"友情提示",
		    btn: ['确定','取消'], //按钮
		    shade: false
		}, function(index){
		   preDeleteHandoverById(handover)
		});
}

//删除交班
function preDeleteHandoverById(handover) {
	var handover_id = handover.name;
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/handover.asmx/DeleteHandoverById?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"handover_id": handover_id
		},
		timeout: 30000,
		success: function(data) {
			console.log(data)
			layer.close(loading);
			statusupdate = 0;
			getlistinfo(newtokenId);
			layer.msg("删除成功");
		},
		error: function() {
			layer.close(loading);
			layer.msg("服务器连接失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//点击修改跳转页面
function preInsertHandover(handover) {
	location.href = "handover2.html?handoverid=" + handover.name+'&message_scene='+message_scene;
}

//点击详情跳转页面
function preHandoverDetail(handover) {
	location.href = "handover_homepg2.html?type=0&id=" + handover.name;
}