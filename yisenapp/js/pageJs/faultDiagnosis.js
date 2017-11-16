//数据的id
var comId= GetQueryString("id");
//var comId="014b50b7-7cfb-44a9-bcde-efc0c5242627";
var warntype= GetQueryString("warntype");
//var warntype="数值上限";
$(function() {
//	reloadinfo();
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getReasonsInfo(tokenId);
			});
		} else { //获取TokenId成功
			getReasonsInfo(tokenId);
		}
	});
});

function getReasonsInfo(tokenId){
	var loading = layer.load(2, {shade: [0.2, '#000']});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/WarnInfo.asmx/getReasonsInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"comId": comId,
			"warntype":warntype
		},
		timeout: 30000,
		success: function(data) {
	      	$("#equ").html("");
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("没有对应的故障分析");
				return;
			}
			var result= eval("(" + data.result + ")");
			var str = "";
			for (var i = 0; i < result.length; i++) {
				str+='<li><input type="radio" value="'+result[i].failure_analysis_id+'" />'+result[i].reason+'</li>';
			}
			str = str.replace(/null/gi, "");
			$("#equ").html(str);
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

function dealWay(){
	var id =  $(":checked").val();
	var reason = $(":checked").parent().text();
	if(!reason){
		layer.msg("请选择一条原因");
		return;
	}
	window.location.href="faultDiagnosis2.html?reason="+reason;
}
