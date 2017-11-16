//数据的id
//var id= GetQueryString("id");
//var id="1";
var reason= GetQueryString("reason");
//var reason ="清灰无效";


$(function() {
	$("#reason span").eq(1).html(reason);
//	reloadinfo();
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getsolutionInfo(tokenId);
			});
		} else { //获取TokenId成功
			getsolutionInfo(tokenId);
		}
	});
});

function getsolutionInfo(tokenId){
	var loading = layer.load(2, {shade: [0.2, '#000']});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/WarnInfo.asmx/getsolutionInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"reason": reason
		},
		timeout: 30000,
		success: function(data) {
	      	$("#solution").html("");
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("没有对应的故障分析");
				return;
			}
			var result= eval("(" + data.result + ")");
			var str = "";
			for (var i = 0; i < result.length; i++) {
				var index= i+1;
				str+='<span>可能解决的方案'+index+':</span>'+
					 '<span>'+result[i].solution+'</span>';
			}
			str = str.replace(/null/gi, "");
			$("#solution").html(str);
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
