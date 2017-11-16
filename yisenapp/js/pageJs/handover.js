//用户登录名
var loginName = null;
//现场ID
var sceneId = null;
var handoverid = GetQueryString("handoverid");
var newtokenId;
var memos = [];
var index = 0;
var message_scene = GetQueryString("message_scene");
$(function() {
	init();
})

//初始化页面 
function init() {
	//	getSceneId();
	getLoginName();

	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				GetScene(tokenId);
				if(handoverid != "-1") {
					getCategory(tokenId);
					$("#scene").attr("disabled", "disabled");
					$("#hman").attr("disabled", "disabled");
					getHandoverInfo(tokenId)
				} else {}
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			GetScene(tokenId); //回调函数，获取全部设备
			if(handoverid != "-1") {
				getCategory(tokenId);
				$("#scene").attr("disabled", "disabled");
				$("#hman").attr("disabled", "disabled");
				getHandoverInfo(tokenId)
			}
		}
	});
}
function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "handover2info.html?message_scene="+message_scene+"&taskBack=taskBack";
}
function GetScene(tokenId) {
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetScene?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"loginName": loginName
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == 1) {
				var json = eval("(" + data.result + ")");
				var str = "";
				str += '<option value="1">请选择现场</option>'
				for(var i = 0; i < json.length; i++) {
					str += '<option value="' + json[i].scene_id + '">' + json[i].scene_name + '</option>';
				}
				$("#scene").html(str);
				//     		GetHandoverMan();
				//     		GetHandoverDefault();
			} else {
				layer.msg(data.result);
			}
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
//获得接班人
function getReceiveMan() {
	var sid = $("#scene").val();
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/getReceiveMan?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"sid": sid
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == 1) {
				var json = eval("(" + data.result + ")");
				var str = "";
				str += '<option value="1">请选择接班人</option>'
				for(var i = 0; i < json.length; i++) {
					str += '<option value="' + json[i].user_login + '">' + json[i].emp_name + '</option>';
				}
				$("#hman").html(str);
			} else {
				layer.msg(data.result);
			}
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

//获取现场接班人
function GetHandoverMan() {
	var sid = $("#scene").val();
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				GetHandoverMan2(tokenId, sid);
			});
		} else { //获取TokenId成功
			GetHandoverMan2(tokenId, sid); //回调函数，获取全部设备
		}
	});
}

//获取现场其他接班人
function getOtherHandoverMan() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var sid = $("#scene").val();
	var userlogin = $("#hman").val();
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetOtherHandoverMan?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"sid": sid,
			"userlogin": userlogin
		},
		timeout: 30000,
		success: function(data) {
			$(".itemInfo .checkboxBox").html("");
			layer.close(loading);
			if(data.status == '0') {
				layer.msg(data.result);
				return;
			}
			var json = eval("(" + data.result + ")");
			var str = "";
			for(var i = 0; i < json.length; i++) {
				str += "<li>" +
					"<input  name='equid' value='" + json[i].emp_id + "' type='checkbox' />" +
					"<label>" + json[i].emp_name + "</label>" +
					"</li>";
			}
			$(".itemInfo .checkboxBox").html(str);
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
			"id": handoverid
		},
		timeout: 30000,
		success: function(data) {
			$("#equTable").html("");
			layer.close(loading);
			var category = eval("(" + data.result + ")");
			if(category.length < 1) {
				return;
			}
			var arr = new Array();
			var str = "";
			for(var i = 0; i < category.length; i++) {
				arr[i] = category[i].item_category;
				str += "<h3 class='dataTitle'>" + category[i].item_category + "</h3>" +
					"<table  class='state dataTable active' border='1'>" +
					"<thead>" +
					"<tr>" +
					"<th colspan='2'>设备名称'</th>" +
					"<th>交接情况</th>" +
					"</tr>" +
					"</thead>" +
					"<tbody>" +
					"</tbody>" +
					"</table>";
			}
			str = str.replace(/null/gi, "");
			$("#equTable").html(str);
			for(var i = 0; i < arr.length; i++) {
				getDetail(arr[i], newtokenId, i);
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

function getDetail(name, tokenId, i) {
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
			"id": handoverid,
			"category": name
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			//格式化空格和回车
			var text = data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
			var content = eval("(" + text + ")");
			$("tbody").eq(i).html("");
			var str = "";
			for(var a = 0; a < content.length; a++) {
				str +=
					"<tr>" +
					"<td style='display:none'>" + content[a].handover_detail_id + "</td>" +
					"<td style='display:none'>" + content[a].handover_memo + "</td>" +
					"<td>" + content[a].item_type + "</td>" +
					"<td>" + content[a].item_name + "</td>" +
					"<td>" +
					"<span class='radius'>" + '备注' + "</span>" +
					"</td>" +
					"</tr>";

			}
			//去除null 变为空字符串
			str = str.replace(/null/gi, "");
			$("tbody").eq(i).html(str);
			$(".radius").off("click");
			$(".radius").on("click", function() {
				var detailId = $(this).parent().parent().find('td:eq(0)').html()
				var memo = $(this).parent().parent().find('td:eq(1)').html()
				$(".window .dialog .txtBox textarea").val(memo)
				windowFilp(memo, ".window", function() {
					var text = $(".window .dialog .txtBox textarea").val();
					//修改备注
					saveMemoInfo(text, detailId);
				}, function() {
					//关闭回调
				});
			});
		},
		error: function(data) {
			layer.close(loading);
			layer.msg("加载标题信息失败");
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

function getNewCategory() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var scene_id = $("#scene").val();
	$.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetNewCategory?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"id": scene_id
		},
		timeout: 30000,
		success: function(data) {
			$("#equTable").html("");
			layer.close(loading);
			var category = eval("(" + data.result + ")");
			if(category.length < 1) {
				return;
			}
			var arr = new Array(category.length);

			var str = "";
			for(var i = 0; i < category.length; i++) {
				arr[i] = category[i].item_category;
				str += "<h3 class='dataTitle'>" + category[i].item_category + "</h3>" +
					"<table  class='state dataTable active' border='1'>" +
					"<thead>" +
					"<tr>" +
					"<th colspan='2'>设备名称</th>" +
					"<th>交接情况</th>" +
					"</tr>" +
					"</thead>" +
					"<tbody>" +
					"</tbody>" +
					"</table>"
			}
			str = str.replace(/null/gi, "");
			$("#equTable").html(str);
			for(var i = 0; i < arr.length; i++) {
				getNewDetail(arr[i], newtokenId, i);
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

function getNewDetail(name, tokenId, i) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var scene_id = $("#scene").val();
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetNewHandoverInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": scene_id,
			"category": name
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var content = eval("(" + data.result + ")");
			$("tbody").eq(i).html("");
			var str = "";
			for(var a = 0; a < content.length; a++) {
				str +=
					"<tr>" +
					"<td style='display:none'>" + content[a].handover_detail_default_id + "</td>" +
					"<td>" + content[a].item_type + "</td>" +
					"<td>" + content[a].item_name + "</td>" +
					"<td>" +
					"<span class='radius disable'>" + '备注' + "</span>" +
					"</td>" +
					"</tr>";

			}
			//去除null 变为空字符串
			str = str.replace(/null/gi, "");
			$("tbody").eq(i).html(str);

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

//获取保存的交班信息
function getHandoverInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	$.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/GetHandoverInfoById?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": handoverid
		},
		timeout: 30000,
		success: function(data) {
			// 			$("table").html("");
			//	 		layer.close(loading);
			var handover = eval("(" + data.result + ")");
			var scene = '<option value="' + handover.scene_id + '">' + handover.scene_name + '</option>';
			$("#scene").html(scene);
			var hman = '<option value="' + handover.after_login + '">' + handover.after_name + '</option>';
			$("#hman").html(hman);
			$(".checkboxBox").html(handover.aftername);
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

function getUniqueName(arr, className) {
	//	console.log(arr);
	//判断元素str是否在数组中 arr.indexOf(str);
	//	console.log(arr.indexOf("泵壳"));
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
	//	console.log("defalut之前的位置:  "+indexArr);//0,3,5
	//	console.log("新的arr:  "+arr);//需要把defalut中的选项display：none
	//	console.log(map);
	//通过indexArr获得数量
	//把indexArr中的元素设置rowspan
	for(var i = 0; i < indexArr.length; i++) {
		$(className).eq(indexArr[i]).attr("rowspan", map[$(className).eq(indexArr[i]).html()]);
	}
	//把相同元素的删掉 需要反着来 
	//	console.log(arr);
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

function changeMemo(div) {
	$(div).children().eq(0).show(0);
}

//保存备注信息
function saveMemoInfo(content, detailid) {
	console.log("sda"+content)
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Handover.asmx/saveMemoInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"content": content,
			"detailid": detailid
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg("修改成功");
			init();
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

//提交
function submitThis() {
	if(handoverid == "-1") {
		var sid = $("#scene").val();
		var sname = $("#scene").find("option:selected").text();
		if(sid == "1" || sid == null) {
			layer.alert("请选择现场");
			return;
		}
		var receivedManName = $("#hman").find("option:selected").text();
		var receivedManLogin = $("#hman").val();
		if(receivedManLogin == "1" || receivedManLogin == null) {
			layer.alert("请选择接班人");
			return;
		}
		var relation_empid = new Array();
		var $relation = $(":checkbox:checked");
		for(var i = 0; i < $relation.length; i++) {
			relation_empid[i] = $relation.eq(i).val();
		}
		var empid = relation_empid.toString();
		var memo = memos.toString();
		var loading = layer.load(2, {
			shade: [0.2, '#000']
		});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Handover.asmx/AddReceivedInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newtokenId,
				"sid": sid,
				"sname": sname,
				"hm1": loginName,
				"hm2": receivedManName,
				"login": receivedManLogin,
				"empid": empid,
				"memo": memo
			},
			timeout: 30000,
			success: function(data) {
				if(data.status == 1) {
					layer.msg(data.result);
					setTimeout(function() {
						window.location.href = "handover2info.html"
					}, 1314);
				}
			},
			error: function() {
				layer.close(loading);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if(status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.close(loading);
					layer.msg("请求超时");
				}
			}
		});
	} else {
		var loading = layer.load(2, {
			shade: [0.2, '#000']
		});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Handover.asmx/UpdateHandover?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newtokenId,
				"id": handoverid
			},
			timeout: 30000,
			success: function(data) {
				if(data.status == 1) {
					layer.msg(data.result);
					setTimeout(function() {
						window.location.href = "handover2info.html"
					}, 1314);
				}
			},
			error: function() {
				layer.close(loading);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if(status == 'timeout') { //超时,status还有success,error等值的情况
					layer.close(loading);
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}

}

function saveThis() {
	if(handoverid == "-1") {
		var sid = $("#scene").val();
		var sname = $("#scene").find("option:selected").text();
		if(sid == "1" || sid == null) {
			layer.alert("请选择现场");
			return;
		}
		var receivedManName = $("#hman").find("option:selected").text();
		var receivedManLogin = $("#hman").val();
		if(receivedManLogin == "1" || receivedManLogin == null) {
			layer.alert("请选择接班人");
			return;
		}
		var relation_empid = new Array();
		var $relation = $(":checkbox:checked");
		for(var i = 0; i < $relation.length; i++) {
			relation_empid[i] = $relation.eq(i).val();
		}
		var empid = relation_empid.toString();
		var memo = memos.toString();
		var loading = layer.load(2, {
			shade: [0.2, '#000']
		});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Handover.asmx/SaveReceivedInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newtokenId,
				"sid": sid,
				"sname": sname,
				"hm1": loginName,
				"hm2": receivedManName,
				"login": receivedManLogin,
				"empid": empid,
				"handoverid": handoverid,
				"memo": memo
			},
			timeout: 30000,
			success: function(data) {
				if(data.status == 1) {
					layer.msg("保存成功");
					setTimeout(function() {
						window.location.href = "handover2info.html"
					}, 1314);
				}
			},
			error: function() {
				layer.close(loading);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if(status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.close(loading);
					layer.msg("请求超时");
				}
			}
		});
	} else {
		layer.msg("保存成功!");
		setTimeout(function() {
			window.location.href = "handover2info.html"
		}, 1314);
	}

}