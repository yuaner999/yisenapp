//数据的id
var id= GetQueryString("id");
var scene_id = GetQueryString("scene_id");
//var id="1";

$(function() {
//	reloadinfo();
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getDetectionInfo(tokenId);
			});
		} else { //获取TokenId成功
			getDetectionInfo(tokenId);
		}
	});
});
function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "detection_info.html?scene_id="+scene_id+"&taskBack=taskBack";
}
function getDetectionInfo(tokenId){
	var loading = layer.load(2, {shade: [0.2, '#000']});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Detection.asmx/getDetectioninfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
	      	$("#equ").html("");
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("检测信息不存在");
				return;
			}
			var result= eval("(" + data.result + ")");
			var str = "";
			for (var i = 0; i < result.length; i++) {
				str += 
//							'<tr>'+result[i].item_name+'</tr>'+
//							'<tr>'+result[i].item_code+'</tr>'+
//							'<tr>'+result[i].item_unit+'</tr>'+
//							'<tr>'+result[i].value+'</tr>'+
							'<tr>'+
								'<td>'+
									'<span>'+result[i].item_name+'</span>'
								+'</td>'
								+
								'<td>'+
									'<span>'+result[i].item_code+'</span>'
								+'</td>'
								+
								'<td>'+
									'<span>'+result[i].item_unit+'</span>'
								+'</td>'
								+
								'<td>'+
									'<span>'+result[i].value+'</span>'
								+'</td>'
								+
								'<td class="bd">'+
									'<a href="lineChart.html?id='+result[i].detection_detail_id+'">'+'<i class="icon"></i>'+'</a>'
								+'</td>'
							+'</tr>';
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
