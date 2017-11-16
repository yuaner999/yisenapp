var id = GetQueryString("id");
var oldid = GetQueryString("oldid");
var reason = decodeURI(GetQueryString("reason"));
var loginName;
var userName;
getLoginName();
$(function() {
	$("#reason").text(reason);
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newTokenId = tokenId;
				getUserName(tokenId);
				GetInfo(tokenId); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			newTokenId = tokenId;
			getUserName(tokenId);
			GetInfo(tokenId); //回调函数，获取用户信息
		}
	});
	$("#top_left").attr("href", "faultAnalysis.html?id=" + oldid);
})
function getUserName(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/getUserName?jsoncallback?",
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
			var json = eval("(" + data.result + ")");
			$("#respons").val(json[0].emp_name);
			userName = json[0].emp_name;
			empId = json[0].emp_id;

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
function GetInfo(tokenId) {
	$("#analysislist").html("");
	//加载现场
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/FaultAnalysis.asmx/GetAnalysisInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var json = eval("(" + data.result + ")");
			var str="";
			for(var i = 0; i < json.length; i++) {
				var failure = json[i].failure_name;
				str+='<li><span class="green">可能解决的方案</span><span class="green"> '+ (i+1) + '：</span>'
					+'<span>' + json[i].solution + '</span></li>'
//				str += '<li class="mui-table-view-cell">' +
//					'<span>可能的解决方案' + (i+1) + '：</span>' +
//					'<span>' + json[i].solution + '</span></li>';
			}
//			str += '<li class="libtnbox" style="height: 43px;">' +
//				'<button onclick="goback()" class="fault mui-btn mui-btn-warning mui-btn-outlined">返回上一步</button>' +
//				'<button onclick="havesolved()" class="fault mui-btn mui-btn-success mui-btn-outlined">已解决</button></li>';
			str = str.replace(/null/gi, "");
			$("#solutionlist").html(str);
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
function goback(){
	location.href = "faultAnalysis.html?id=" + oldid;
}
function havesolved(){
	location.href = "report.html#lv1";
}
