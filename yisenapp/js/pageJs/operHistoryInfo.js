//数据的id
var id = GetQueryString("id");
var startNum = 0;
var num = 5;
//加载列表的信息
var newtokenId = null;
var startDate;
var endDate;
$(function() {
	getTokenIdLocal(function(tokenId) {
		startDate = dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
		endDate = dateformat(new Date(), "yyyy-MM-dd");
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getlistinfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getlistinfo(tokenId);

		}
	});
});

window.onscroll = function() {
		if(getScrollTop() + getClientHeight() >= getScrollHeight() - 1) {
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

//加载歷史記錄
function getlistinfo(tokenId) {
	taskBack = "";
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetReverseControlHistory?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id,
			"num": num,
			"startnum": startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate)
		},
		timeout: 30000,
		success: function(data) {

			layer.close(loading);
			if(data.status == "0") {
				if(startNum > 0) {
					layer.msg("没有更多的信息");
				} else {
					$(".box").html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}
			var $box = $(".box");

			var text = data.result.replace(/\n/g, "\\n").replace(/\\r/g, "\\r");
			var json = eval("(" + text + ")");
//			console.log(json)

			var str = "";

			for(var i = 0; i < json.length; i++) {
				//console.log(json[i].check_datetime_set);
				str += '<div class="infoItem">' +
					'<p>' +
					'<mark>' +
					json[i].type +
					'</mark>' +
					'<span class="right">' +
					'<span>' + json[i].send_date + '</span>' +
					'</span>' +
					'</p>' +
					'<div class="info">' +
					'<b class="yellow">' + '操作人    ' + '</b>' +
					'<b>' + json[i].emp_name + '</b>';

				if(json[i].status == '执行成功') {
					str += '<span class="deepBlue right">' + json[i].status + '</span>';
				} else {
					str += '<span class="red right">' + json[i].status + '</span>';
				}
				str += '</div>' +
					'<ul>' +
					'<li>' +
					'<span>' + '部件名称' + '</span>' +
					'<span>' + json[i].component_name + '</span>' +
					'</li>' +
					'<li>' +
					'<span>' + '发送数值' + '</span>' +
					'<span>' + json[i].value + '</span>' +
					'</li>' +
					'</ul>' +
					'</div>';

			}
			str = str.replace(/null/gi, "");
			$box.append(str);
		},
		error: function(data) {
			layer.close(loading);
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
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
