//存放tokenId 的
var newTokenId = null;
//巡检信息的id
var handoverId = GetQueryString("id");
// 信息的状态  0 是完成 1 是要填写的
var type = GetQueryString("type");
var message_scene = GetQueryString("message_scene");
//模板节点
var cloneNode;
var handover_status = '';
$(function() {
	init();
});
function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "handover2info.html?message_scene="+message_scene+"&taskBack=taskBack";
}
//初始化页面
function init() {
	if(type == '0') {
		$("#sumbit").hide();
		$('#updateMemo').remove();
	}

	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newTokenId = tokenId;
				getTitleInfo(tokenId);
				getCategory(tokenId);
			});
		} else { //获取TokenId成功
			newTokenId = tokenId;
			//加载标题的信息
			getTitleInfo(tokenId);
			//加载设备种类名称
			getCategory(tokenId);
		}
	});
	//保存一个数据模板
	cloneNode = $("tbody").eq(0).clone().children().eq(0);
}

function getTitleInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetTitleInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": handoverId
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var title = eval("(" + data.result + ")");
			if(title.length != 1) {
				layer.alert("加载标题信息错误");
				return;
			}
			handover_status = title[0].handover_status;
			$("#handover_man_before").html(title[0].handover_man_before);
			$("#scene_name").html(title[0].scene_name);
			if(title[0].handover_status == 0) {
				$("#handover_status").html("已提交");
				$("#handover_status").attr("class", "deepBlue")
			}
			if(title[0].handover_status == 2) {
				$("#handover_status").html("已交班");
				$("#handover_status").attr("class", "deepBlue")
			}
			if(title[0].handover_status == 3) {
				$("#handover_status").html("不同意");
				$("#handover_status").attr("class", "red")
			}
			if(title[0].handover_status == 4) {
				$("#handover_status").html("未提交");
				$("#handover_status").attr("class", "deepBlue")
			}
		},
		error: function(data) {
			layer.close(loading);
			layer.alert("加载标题信息失败");
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

//加载设备的名称
function getCategory(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	$.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetCategory?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": handoverId
		},
		timeout: 30000,
		success: function(data) {
			$("table").html("");
			layer.close(loading);
			var category = eval("(" + data.result + ")");
			if(category.length < 1) {
				return;
			}
			var arr = new Array(category.length);

			var str = "";
			for(var i = 0; i < category.length; i++) {
				arr[i] = category[i].item_category;
				str += "<thead>" +
					"<tr>" +
					"<th colspan='2'>" + category[i].item_category + "</th>" +
					"<th>" + '交接情况' + "</th>" +
					"</tr>" +
					"</thead>" +
					"<tbody></tbody>";
			}
			str = str.replace(/null/gi, "");
			$("table").html(str);
			for(var i = 0; i < arr.length; i++) {
				getDetail(arr[i], tokenId, i, arr.length);
			}

		},
		error: function(data) {
			layer.close(loading);
			layer.alert("加载设备信息错误");
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

//加载具体的信息
function getDetail(name, tokenId, i, leng) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetHandoverInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": handoverId,
			"category": name
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var text = data.result.replace(/\n/g, "\\n").replace(/\\r/g, "\\r");
			var content = eval("(" + text + ")");
			//			var content = eval("(" + data.result + ")");
			$("tbody").eq(i).html("");
			for(var a = 0; a < content.length; a++) {
				//				新建一个空模板
				var newClone = cloneNode.clone();
				//赋节点文本值
				newClone.children().eq(0).text(content[a].handover_detail_id);
				newClone.children().eq(1).text(content[a].handover_memo);
				newClone.children().eq(2).text(content[a].item_type);
				newClone.children().eq(3).text(content[a].item_name);
				//判断状态
				var state = content[a].handover_status == "交接成功" ? 'on' : 'off';
				//				var memo = type == 0? 'disable':'';
				//赋状态class
				//				newClone.children().eq(4).find(".radius").addClass(memo);
				newClone.children().eq(4).find(".kg").addClass(state);
				//添加到tbody
				$("tbody").eq(i).append(newClone);
			}

			$(".radius").off("click");
			$(".radius").on("click", function() {
				var detailId = $(this).parent().parent().find('td:eq(0)').html()
				var memo = $(this).parent().parent().find('td:eq(1)').html()

				console.log(memo)
				$(".window .dialog .txtBox textarea").val(memo)
				windowFilp(memo, ".window", function() {
					var text = $(".window .dialog .txtBox textarea").val();
					//修改备注
					saveMemoInfo(text, detailId);
				}, function() {
					//关闭回调
				});
			});

			if(handover_status != 2 && handover_status != 3) {
				//		开关按钮
				$(".kg").off("click");
				$(".kg").on("click", function() {
					var detailId = $(this).parent().parent().find('td:eq(0)').html()
					if($(this).hasClass("on")) {
						$(this).removeClass("on").addClass("off");
						saveSelected("交接失败", detailId);
					} else {
						$(this).removeClass("off").addClass("on");
						saveSelected("交接成功", detailId);
					}
				});
			}

		},
		error: function(data) {
			layer.close(loading);
			layer.alert("加载标题信息失败");
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

function getUniqueName(arr, className) {
	//判断元素str是否在数组中 arr.indexOf(str);
	var map = {};
	var indexArr = new Array(); //存放首个位置
	var arr2 = new Array(); //存放相同的长度
	var index2 = 0;
	for(var i = 0; i < arr.length; i++) {
		var index = 1;
		for(var j = i + 1; j < arr.length; j++) {
			if(arr[i] == 'defalut') {
				continue;
			}
			if(arr[i] == arr[j]) {
				index++;
				arr[j] = "defalut";
				if(index == 2) {
					indexArr[index2] = i;
					index2++;
				}
			}
			if(index != 1 && arr[i] != 'defalut') {
				map[arr[i]] = index;
			}
		}
	}
	//通过indexArr获得数量
	//把indexArr中的元素设置rowspan
	for(var i = 0; i < indexArr.length; i++) {
		$(className).eq(indexArr[i]).attr("rowspan", map[$(className).eq(indexArr[i]).html()]);
	}
	//把相同元素的删掉 需要反着来 
	if(arr.length > 1) {
		for(var i = arr.length - 1; i > 0; i--) {
			//arr[i]= defalut 项display:none
			if(arr[i] == "defalut") {
				//			$(className).eq(i).remove();
				$(className).eq(i).css("display", "none");
			}
		}
	}
}

//图片的点击
function changPicture(e) {
	//如果不是已交班 暂定其实type=1 可以过来两个 type=0 提交
	if(type == '0') {
		return;
	}
	var detailId = $(e).parent().parent().find("td").eq(0).html();
	if($(e).hasClass("on")) {
		$(e).removeClass("on").addClass("off");
		saveSelected("交接失败", detailId);
	} else {
		$(e).removeClass("off").addClass("on");
		saveSelected("交接成功", detailId);
	}
}

//单条的保存信息--需要传入detailid status
function saveSelected(status, detailid) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/SaveHandoverInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		async: false,
		data: {
			"tokenId": newTokenId,
			"status": status,
			"detailid": detailid
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			//	 			layer.msg("保存成功");
		},
		error: function(data) {
			layer.close(loading);
			layer.msg("保存失败!请稍后再试");
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
//
//保存备注信息
function saveMemoInfo(content, detailid) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/saveMemoInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"content": content,
			"detailid": detailid
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			init();
			layer.msg("修改成功");
		},
		error: function(data) {
			layer.close(loading);
			layer.msg("保存失败");
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
//提交--需要handoverId
function sumbitInfo() {
	layer.confirm('确定要提交吗？提交之后就不可以修改', {
		title: "友情提示",
		btn: ['提交', '取消'], //按钮
		shade: 0 //不显示0shade: [0.8, '#393D49']
	}, function(index) {
		sendAjax();
		layer.close(index);
	});

}

function sendAjax() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/SumbitHandoverInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"handoverId": handoverId
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg("保存成功");
			setTimeout(function() {
				window.location.href = "handover_info.html";
			}, 1314)
		},
		error: function(data) {
			layer.close(loading);
			layer.alert("提交失败");
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