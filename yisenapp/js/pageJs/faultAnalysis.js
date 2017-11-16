var componentId = GetQueryString("id");
var loginName;
var userName;
getLoginName();
$(function() {
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
	//按钮点击事件
	$(".b").click(function(){
//		alert()
//		var analysisid = $("input[name='radio']:checked").val();
		var analysisid = $(".active").find("input").val();
		var reason = $(".active").find("label").html();
		console.log(encodeURI(encodeURI(reason)))
		if (analysisid != null){
			location.href = "faultAnalysis2.html?id=" + analysisid + "&oldid=" + componentId + "&reason="+encodeURI(encodeURI(reason));
		} else {
			layer.msg("请先选择一个原因");
		}
	})
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
		url: url + "/handler/FaultAnalysis.asmx/GetAnalysisListInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": componentId
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var json = eval("(" + data.result + ")");
			if(json.length < 1) {
				layer.msg("暂无对应的故障分析");
				return;
			}
			var str="";
			for(var i = 0; i < json.length; i++) {
				var failure = json[i].reason;
				str+='<li><i class="icon"></i><label for="' + json[i].failure_analysis_id + '">' + failure + '</label>'
				   +'<input type="hidden" value="' + json[i].failure_analysis_id + '"/></li>';
				
//				str += '<li>' +
//					'<div class="mui-input-row mui-radio "><label>' + failure + '</label>' +
//					'<input name="radio" type="radio" value="' + json[i].failure_analysis_id + '"></div></li>';
			}
			str = str.replace(/null/gi, "");
			$("#analysislist").html(str);
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