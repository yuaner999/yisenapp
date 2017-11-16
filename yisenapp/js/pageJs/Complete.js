//维修、保养完成
var url1 = null; //返回的url
var id = GetQueryString("id"); //获得其id
var type = GetQueryString("type"); //获得类型 ：报修0 保养1
var url2 = null; //ajax保存
var msg = "";
$(function() {
	if (type == 0) {
		msg = "维修";
		$(".top").html("维修完成");
		url1 = "repair_info.html";
		url2 = "/handler/Repair.asmx/DealFinishTime?jsoncallback?";
	} else if (type == 1) {
		msg = "保养";
		$(".top").html("保养完成");
		url1 = "maintain_info.html";
		url2 = "/handler/Maintain.asmx/DealFinishTime?jsoncallback?";
	}

	$(".top a").attr("href", url1);
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				saveOrderTime(tokenId);
			});
		} else { //获取TokenId成功
			saveOrderTime(tokenId);
		}
	});
});

//获取部件ID
function getComponent(tokenId, Id) {

}

//保存预约时间
function saveOrderTime(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + url2,
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"id": id,
			"tokenId": tokenId
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			data.result = data.result.replace(/{/g, "");
			data.result = data.result.replace(/}/g, "");

			layer.confirm(msg + '完成，确认返回' + msg + '记录？', {
				btn: ['确定', '取消'], //按钮
				shade: false //不显示遮罩
			}, function() {
				window.location = url1;
			});
		},
		error: function(data) {
			layer.close(loading);
			data.result = data.result.replace(/{/g, "");
			data.result = data.result.replace(/}/g, "");
			layer.alert(data.result);
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