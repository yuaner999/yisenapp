//数据的id
var id = GetQueryString("id");
var sceneName = decodeURI(GetQueryString("name"));
var sceneType = decodeURI(GetQueryString("type"));
//var id="1";
var startNum = 0;
var num = 20;
var statusupdate = 1;
var newtokenId = null;
var startTime;
var endTime;
var hStartTime;
var hEndTime;

$(function() {
	//采集点类型是模拟值只显示历史数据记录
	if(sceneType === '模拟值') {
		$('.tab a:eq(0)').remove();
		$('.tab a:eq(0)').addClass("first active");
		$('.timerBox:eq(0)').removeClass("active");
		$('.timerBox').eq(1).addClass("active");
	} else {
		//tab
		tab(".tab", ".timerBox");
	}
	startTime = new Date(dateformatByMonthPrior(new Date()));
	endTime = new Date();
	hStartTime = new Date(dateformat(new Date(), "yyyy-MM-dd 00:00:00"));
	hEndTime = new Date();
	//	reloadinfo();
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getDetectionInfo(tokenId);
				eChartsLoad(tokenId);
				componentHistoryInfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getDetectionInfo(tokenId);
			eChartsLoad(tokenId);
			componentHistoryInfo(tokenId);
		}
	});
});

window.onscroll = function() {
	if(getScrollTop() + getClientHeight() >= getScrollHeight() - 1) {
		startNum += num;
		componentHistoryInfo(newtokenId);
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

function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}

function getDetectionInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetComponentStatus?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id,
			"startTime": dateConvert(hStartTime),
			"endTime": dateformat(endTime)
		},
		timeout: 30000,
		success: function(data) {
			$("#equ").html("");
			layer.close(loading);
			if(data.status == '0') {
				layer.msg("未查询到状态记录信息");
				return;
			}
			var result = eval("(" + data.result + ")");
			$(".top").find("span").text(result[0].component_name + "状态记录");
			var str = "";
			for(var i = 0; i < result.length; i++) {
				if(result[i].start_time != '') {
					var date1 = result[i].start_time.split(" ");
					var sday = date1[0];
					var stime = date1[1].split(":");
					var shour = stime[0] + ":" + stime[1];
				} else {
					sday = '';
					shour = '';
				}
				var status = result[i].equipment_component_status;
				if(result[i].end_time != '') {
					var date2 = result[i].end_time.split(" ");
					var eday = date2[0];
					var etime = date2[1].split(":");
					var ehour = etime[0] + ":" + etime[1];
				} else {
					eday = '';
					ehour = '';
				}

				str += '<tr>';
				if(status == "故障" || status == "高料位报警" || status == "需监管") { //故障
					str += '<td class="breakdown">' + result[i].equipment_component_status + '</td>';
				} else { //其他
					str += '<td class="normal">' + result[i].equipment_component_status + '</td>';
				}
				str += '<td>' +
					'<span class="date">' + sday + '</span> <br/> <span class="time">' + shour + '</span>' +
					'</td>' +
					'<td>' +
					'<span class="date">' + eday + '</span> <br/> <span class="time">' + ehour + '</span>' +
					'</td>';
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
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
var xdata = [];
var ydata = [];
var max_value = 0;
var min_value = 0;

function eChartsLoad(tokenId) {
	xdata = [];
	ydata = [];
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetComponentHistory?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id,
			"startTime": dateConvert(hStartTime),
			"endTime": dateConvert(hEndTime),
			"startNum": 0,
			"num": 850
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				xdata = [];
				ydata = [];
				echartsInfo();
				layer.msg("未查询到折线图数据");
				return;
			}
			var splitdata = data.result.split("&");
			var result = eval("(" + splitdata[0] + ")");
			for(var i = 0; i < result.length; i++) {
				xdata.push(result[i].data_time);
				ydata.push(parseFloat(result[i].value));
			}
			var resultmax = eval("(" + splitdata[1] + ")");
			if(resultmax[0].status == "1") {
				max_value = resultmax[0].max_value;
				min_value = resultmax[0].min_value;
			}
			echartsInfo();
		},
		error: function() {
			layer.msg("服务器连接失败");
		},
		complete: function(XMLHttpRequest, status) {
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

function componentHistoryInfo(tokenId) {
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetComponentHistory?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id,
			"startTime": dateConvert(hStartTime),
			"endTime": dateConvert(hEndTime),
			"startNum": startNum,
			"num": num
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0") {
				if(startNum > 0) {
					layer.msg("没有更多的信息");
				} else {
					$("#history").html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}
			var splitdata = data.result.split("&");
			var result = eval("(" + splitdata[0] + ")");
			if(result.length < 1) {
				if(startNum > 0) {
					layer.msg("没有更多的信息");
				} else {
					$("#history").html("");
					layer.msg("未查询到历史记录信息");
				}
				$("#loadmore").hide();
				return;
			}
			if(result.length < num) {
				$("#loadmore").hide();
			}
			var str = "";
			for(var i = 0; i < result.length; i++) {
				var date1 = result[i].data_time.split(" ");
				var day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0] + ":" + time[1];
				str += '<tr><td><b>' + result[i].valueText + '</b></td>' +
					'<td><span class="date">' + day + '</span> <br/> <span class = "time">' + hour + '</span></td>' +
					'<td><span class="date">' + result[i].equipStatus + '</span></td></tr>';
			}
			str = str.replace(/null/gi, "");
			if(statusupdate == 0) {
				$("#history").html(str);
			} else {
				$("#history").append(str);
			}
			statusupdate = 1;
		},
		error: function() {
			//			layer.close(loading1);
			layer.msg("服务器连接失败");
		},
		complete: function(XMLHttpRequest, status) {
			//			layer.close(loading1); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

function echartsInfo() {
	$("#main").html("");
	$('#main').highcharts({
		//图的类型为折线，可以沿X轴缩放
		chart: {
			type: 'line',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					// align: 'right', // by default
					// verticalAlign: 'top', // by default
					align: 'right',
					relativeTo: 'plot'
				},
				//设置重置按钮的样式
				theme: {
					fill: 'white',
					stroke: 'silver',
					r: 0,
					states: {
						hover: {
							fill: '#41739D',
							style: {
								color: 'white'
							}
						}
					}
				}
			}
		},
		//图标标题
		title: {
			text: ''
		},
		//图表副标题
		subtitle: {
			align: 'left',
			text: '友情提示:仅缩放可视区域，缩放后请滑动时间轴位置进行左右移动查看，如想查看全部，请滑到最右侧点击重置缩放比例按钮重置视图',
			style: {
				color: '#FF3030',
				fontWeight: 'bold'
			}
		},
		credits: {
			enabled: false // 禁用版权信息
		},
		xAxis: {
			//这个参数用来调整时间显示间隔，也就是每隔多久显示一个x轴数据（时间轴）
			tickInterval: 30,
			//X轴数据，数组内每个元素必须是字符串，格式自己处理
			categories: xdata
		},
		yAxis: {
			title: {
				text: '数据值'
			},
			//格式化数据，可以不写
			formatter: function() {
				return this.value;
			}
		},
		legend: { //是否显示底注
			enabled: true
		},
		plotOptions: {
			line: {
				dataLabels: {
					enabled: false // 是否在每个节点上显示数据
				},
				enableMouseTracking: true // 关闭鼠标跟踪，对应的提示框、点击事件会失效
			},
			series: {
				marker: {
					radius: 2, //曲线点半径，默认是4
					symbol: 'circle' //曲线点类型："circle", "square", "diamond", "triangle","triangle-down"，默认是"circle"
				}
			}
		},
		//折线图可左右滚动
		scrollbar: {
			enabled: true
		},
		series: [{
			name: '数据值',
			//Y轴数据，数组，数组内的每个元素必须是数字
			data: ydata
		}]
	});
};