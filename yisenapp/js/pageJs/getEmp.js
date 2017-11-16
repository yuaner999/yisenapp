
var usermap = {};
var userarr = new Array();
var arr2 = new Array();
var newtokenid = "";
var sceneId = null;
var startNum = 0;
var num = 8;
var receiver_id;
var temp = true;
var id = GetQueryString("id");
// type 0发送  1回复
var type = GetQueryString("type");
var loginName = "";
getLoginName();
//加载数据
$(function() {
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenid = tokenId;
				if(type == 0) getUsersInfo(tokenId);
				if(type == 1) {
					receiver_id = id;
					$(".formRow .icon").hide();					
					getUserInfo(tokenId);
					getMessageList(tokenId);
				}
			});
		} else { //获取TokenId成功
			newtokenid = tokenId;	
			if(type == 0) getUsersInfo(tokenId);
			if(type == 1) {
					receiver_id = id;
					$(".formRow .icon").hide();
					getUserInfo(tokenId);
					getMessageList(tokenId);
				}

		}
	});
});

window.onscroll = function() {
	if(getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
		startNum += num;
		getMessageList(newtokenid);
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
function getUsersInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/getUsersInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if(data.status == 0) {
				//	 				layer.alert("没有用户信息");
				return;
			}
			var userinfo = eval("(" + data.result + ")");
			var index = 0;
			for(var i = 0; i < userinfo.length; i++) {
				index = 2 * i;
				userarr[index] = userinfo[i].emp_name;
				userarr[index + 1] = userinfo[i].user_login;
				usermap[userinfo[i].emp_name] = userinfo[i].combine;
				usermap[userinfo[i].user_login] = userinfo[i].combine;
				usermap[userinfo[i].combine] = userinfo[i].emp_id;
			}
			//					console.log(usermap);

		},
		error: function(data) {
			layer.close(loading);
			layer.alert(data.result);
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

function getUserInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/getUserInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if(data.status == 0) {
				//	 				layer.alert("没有用户信息");
				return;
			}
			var userinfo = eval("(" + data.result + ")");
			$("#emp").val(userinfo[0].combine);
			$("#emp").attr("readonly", "true");
			usermap[userinfo[0].combine] = userinfo[0].emp_id;
		},
		error: function(data) {
			layer.close(loading);
			layer.alert(data.result);
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

function showul(value) {
	//数据的初始化
	$("#empul").html("");
	arr2 = [];
	//跟据输入显示对应
	if(value.length > 0 && value.length < 10) {
		var teststr = eval("/^" + value + ".*$/");
		var str = "";
		var index = 0;
		for(var i = 0; i < userarr.length; i++) {
			str = userarr[i];
			if(isContains(str, teststr)) {
				arr2[index] = userarr[i];
				index++;
			}
		}
		if(arr2.length > 0) {
			$("#empul").show();
			for(var i = 0; i < arr2.length; i++) {
				$("#empul").append("<li  onclick='changevalue(this)'>" + usermap[arr2[i]] + "</li>");
			}
				console.log($("#empul"))
		} else {
			$("#empul").hide();
		}
	}
}
//判断以什么为开头
function isContains(str, substr) {
	return new RegExp(substr).test(str);
}
//将输入的值改变
function changevalue(e) {
	//		var  e = window.event.target;
	var key = $(e).html();
	receiver_id = usermap[key];
	console.log(receiver_id);
	$("#emp").val(key);
	temp = false;
	getMessageList(newtokenid);
	$("#empul").hide();
	$("#loadmore").show();
}

function commit() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var empCombine = $("#emp").val();
	var myCombine = usermap[loginName];
	//		var messagetitle=$("#message_title").val();
	//kindeditor的获取值的方法
	//		var messagecontent=editor.html();
	//textarea 的内容
	var messagecontent = $("#editor_id").val();
	if(empCombine == "" || empCombine == null) {
		layer.close(loading);
		layer.alert("接收人不能为空");
		return;
	}
	if(empCombine == myCombine) {
		layer.close(loading);
		layer.alert("不能给自己发消息");
		return;
	}
	//		if(messagetitle==""||messagetitle==null)
	//		{
	//			layer.close(loading);
	//			layer.alert("消息标题不能为空");
	//			return;
	//		}
	if(messagecontent.length > 500) {
		layer.close(loading);
		layer.alert("内容不能超过500");
		return;
	}
	if(messagecontent == "" || messagecontent == null) {
		layer.close(loading);
		layer.alert("消息内容不能为空");
		return;
	}
	var empid = usermap[empCombine];
	if(empid == null || empid == "") {
		layer.close(loading);
		layer.alert("你输入的接受人不存在,请重新输入");
		return;
	}
	var emp_name = $("#emp").val().split('(')[0];
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/SendMessage?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenid,
			"sendno": loginName,
			"empno": empid,
			"emp_name": emp_name,
			//				"messagetitle":messagetitle,
			"messagecontent": messagecontent
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				layer.msg(data.result);
				$("#loadmore").hide();
				return;
			} else {
				if(data.status == "1") {
					layer.msg(data.result);
					$("#loadmore").hide();
				}
			}
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			setTimeout('window.location.href="message_info.html"', 1000);
			//				window.location.href="";
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

function getMessageList(tokenId){
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/GetReceiverMessageListInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"userName": loginName,
			"receiverId": receiver_id,
			"num": num,
			"startNum": startNum,
			"startDate": '2000-01-01 00:00:00',
			"endDate": dateConvert(new Date()),
			"message_scene":'',
			"message_type":''
		},
		timeout: 30000,
		success: function(data) {
			console.log(data);
			if(data.status == "0") {
				if(startNum>0){
					layer.msg("没有更多的信息");
				}else{
					$(".record").html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}		
			var json = eval("(" + data.result + ")");
			if(json.length < 1) {
				if(startNum>0){
					layer.msg("没有更多的信息");
				}else{
					$(".record").html("");
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
				str+='<p class="time">'+json[i].message_time+'</p>'
				if(json[i].send_emp_id == receiver_id){
					str+='<li class="your">';    			
				}else{
					str+='<li class="me">';
				}
				if(json[i].scene_name !='' && json[i].scene_name != null ){
					str+='<span>现场名称：</span><span>'+json[i].scene_name+'</span><br/>';
				}
	    		if(json[i].equipment_name !='' && json[i].equipment_name != null){
	    			str+='<span>设备名称：</span><span>'+json[i].equipment_name+'</span><br/>'
	    		}
	    		if(json[i].component_name !='' && json[i].component_name != null){
	    			str+='<span>部件名称：</span><span>'+json[i].component_name+'</span><br/>'
	    		}
			str+='<span>详情：</span><span>'+json[i].message_content+'</span></li>'	    		
			}
			if(temp){
				$(".record").append(str);
			}else{
				$(".record").html(str);
			}
			temp = true;
			$(".record").show();
			$("#loadmore").hide();
			DealMsgStatus(newtokenid, json[0].message_id);
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}

function DealMsgStatus(tokenId, id) {
	console.log(id);
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/DealMsgStatus?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
//			layer.close(loading);
//			if(data.status == 1) {
//				layer.msg(data.result);
//			}
			console.log("成功");
		},
		error: function(data) {
//			layer.close(loading);
			layer.msg("更改消息 已读失败");
		},
		complete: function(XMLHttpRequest, status) {
//			layer.close(loading); //关闭加载层
//			if(status == 'timeout') { //超时,status还有success,error等值的情况
//				ajax.abort(); //取消请求
//				layer.msg("请求超时");
//			}
		}
	});
}