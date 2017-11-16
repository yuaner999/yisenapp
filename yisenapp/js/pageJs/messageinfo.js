//信息的数量
var startNum = 0;
var num = 5;
var statusupdate=1;
var newtokenId = null;
var loginName = null;
var message_type = "";
var message_scene = "";
$(function() {
	startDate =  new Date(dateformatByMonthPrior(new Date()));
	endDate = new Date();
	getLoginName();
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
				var str = '<option value="" class="remove">请选择现场</option>';
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
	message_scene = $(e).val();
	startNum = 0;
	statusupdate = 0;
	getlistinfo(newtokenId);
}
//类型下拉框选择
function changeType(e){
	message_type = $(e).val();
	startNum = 0;
	statusupdate = 0;
	getlistinfo(newtokenId);
}
window.onscroll = function() {
		if(getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
			startNum += num;
			$("#loadmore").show();
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
//加载列表的信息
function getlistinfo(tokenId) {
//	console.log(startDate);
//	console.log(endDate);
//	console.log("message_scene:"+message_scene);
//	console.log("message_type:"+message_type);
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/GetMessageListInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"userName": loginName,
			"num": num,
			"startNum": startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"message_scene":message_scene,
			"message_type":message_type
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				if(startNum>0){
					layer.msg("没有更多的信息");
				}else{
					$(".box").html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}		
			var json = eval("(" + data.result + ")");
			if(json.length < 1) {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
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
				var date1 = json[i].message_time.split(" ");
				var day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0] + ":" + time[1];
				var status = "";
				
			str +="<div class='infoItem'>"
	    		+"<p>"
	    		+"	<mark>"+ json[i].message_type +"</mark>"
	    			+"<span class='right'>"
	    				+"<span>"+ day +"</span>&nbsp;&nbsp;" 
	    				+"<span>"+ hour +"</span> "
	    			+"</span>"
	    		+"</p>"
	    		+"<div class='info'>"
	    			+"<b>标&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;题：</b>"
	    			+"<span>"+ json[i].message_title +"</span>";
	    	if(json[i].message_status == 0) {
					status = "未读";
					str += "<span class='red right'>"+status+"</span>"
				} else if(json[i].message_status == 1) {
					status = "已读"
					str += "<span class='gray right'>"+status+"</span>";
				} else {
					layer.msg("消息状态出错");
					$("#loadmore").hide();
					return;
				}
				str+= "</div>"
				    		+"<div>"
						if(json[i].scene_name !='' && json[i].scene_name != null ){
							str+="<span class='justify'>现场名称</span>："
							+"<span>"+json[i].scene_name+"</span> <br/>"
						}else{
							str+="";
						}
			    		if(json[i].equipment_name !='' && json[i].equipment_name != null){
			    			str+="<span class='justify'>设备名称</span>："
			    			+"<span>"+json[i].equipment_name+"</span> <br/>"
			    		}
			    		if(json[i].component_name !='' && json[i].component_name != null){
			    			str+="<span class='justify'>部件名称</span>："
			    			+"<span>"+json[i].component_name+"</span>"
			    		}
			    		str+="	<div>"
			    		+"		<span class='justify'>详 情</span>："
			    		+"		<span>"+json[i].message_content+"</span>"
			    		+"	</div>"
			    		+"</div>"
			    		+"<div class='btnBox'>";
			    		if((json[i].message_type =='' || json[i].message_type =="聊天记录") && json[i].send_emp_name != ""){
			    			console.log(json[i].send_emp_name);
			    			str+="<button class='blockBox g' onclick='reMes(\""+json[i].send_emp_id+"\")' >回复</button>";
			    		}
			    		str+="	<a href='messages.html?id=" + json[i].message_id + "'><button class='blockBox g'>查看详情</button></a>"
			    		+"	<button class='blockBox r' onclick='delMes(\""+json[i].message_id+"\")' >删除</button>"
			    		+"</div>"
				    	+"</div>";	
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
			if(status == 'timeout') { //超时,status还有success,error等值的情况
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
	if(newstartDate != startDate) {
		startDate = newstartDate;
		startNum = 0;
		statusupdate = 0;
		getlistinfo(newtokenId);
	}
	if(newendDate != endDate) {
		endDate = newendDate;
		startNum = 0;
		statusupdate = 0;
		getlistinfo(newtokenId);
	}
}

function allRead() {
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/GetAllUnreadMessage?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"userName": loginName,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"message_scene":message_scene,
			"message_type":message_type
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				layer.msg(data.result);	
			}
			if(data.status == "1") {
				layer.msg(data.result);	
			}
			startNum = 0;
			statusupdate=0;
			getlistinfo(newtokenId);
			return;
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

function delMes(id) {
	layer.confirm('确定删除这条消息吗？', {
			title :"友情提示",
		    btn: ['确定','取消'], //按钮
		    shade: false
		}, function(index){
		    delMessage(id);	   
		});
}


function reMes(id) {
	window.location.href = "sendmessages.html?type=1&id="+id;
}


function delMessage(id){
	var ajax = $.ajax({
		type: "post",
		async : false,
		url: url + "/handler/Messages.asmx/DeleteMessage?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"Messageid": id,			
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				layer.msg(data.result);			
			}
			if(data.status == "1") {				
				layer.msg(data.result);		
			}
			startNum = 0;
			statusupdate=0;
			getlistinfo(newtokenId);
			return;
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



function dateformat(time, formateStr) { //author: meizz
	var date;
	if(!formateStr) formateStr = "yyyy-MM-dd";
	if(time) date = new Date(time);
	else date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var h = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	formateStr = formateStr.replace("yyyy", "" + year);
	formateStr = formateStr.replace("MM", "" + month > 9 ? month : "0" + month);
	formateStr = formateStr.replace("dd", "" + day > 9 ? day : "0" + day);
	formateStr = formateStr.replace("HH", "" + h > 9 ? h : "0" + h);
	formateStr = formateStr.replace("mm", "" + min > 9 ? min : "0" + min);
	formateStr = formateStr.replace("ss", "" + sec > 9 ? sec : "0" + sec);
	return formateStr;
}

function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}
function resend() {

}