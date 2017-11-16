//打开本地数据库
var db = openDatabase('YSenApp', '1.0', 'YSenApp Database', 1024 * 1024 * 20); //如果数据库存在 则打开,不存在的则创建 然后在打开
var sceneId = GetQueryString("sid"); //现场ID
var loginName = null; //用户登录名
var passWord = null; //控制密码
var falg = false; //判断是否验证控制密码
var lastStatus = false; //判断是否获取到发送状态
var load = null; //加载层
var loading = null;
var now = new Date(); //系统当前时间
var tokenTime = null; //获取TokenId时间
var newTokenId = null; //
var controlNum = null;
//接收指定定时器
var is_lastLoad = null;
var is_lastLoad2 = null;
var getPin = null;
var getOpen = null;
var controlSetTimeout = null;
//设置定时器时间
var controlTime = 300000;

$(function() {
	//获取用户登入名
	getLoginName();

	insertSceneId(sceneId);

	getSceneId();

	//查询控制密码时间
	loginAuoto();

	loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getSceneName(tokenId);
				getDangBanUser(tokenId)
				getAllEquipments(tokenId); //回调函数，获取全部设备
				GetEquipmentsPic(tokenId);
				newTokenId = tokenId;
				//60秒执行一次
				//				setInterval(function(){
				//					getAllEquipments(tokenId);
				//				},30*1000);
			});
		} else { //获取TokenId成功
			getSceneName(tokenId);
			getDangBanUser(tokenId)
			getAllEquipments(tokenId); //回调函数，获取全部设备
			GetEquipmentsPic(tokenId);
			newTokenId = tokenId;
			//60秒执行一次
			//			setInterval(function(){
			//				getAllEquipments(tokenId);
			//			},30*1000);
		}
	});
});

function getSceneName(tokenId) {
	//	var loading = layer.load(2, {
	//		shade: [0.2, '#000']
	//	});
	if(tokenId == "close") { //回调过程中出错
//		layer.close(loading); //关闭加载层
		return;
	}
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetSceneName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": sceneId
		},
		timeout: 30000,
		success: function(data) {
//						layer.close(loading); //关闭加载层
			if(data.status == 1) { //获取成功
				var json = eval("(" + data.result + ")");
				$(".dataTitle").html(json[0].scene_name);
			} else {
				layer.msg(data.result);
			}
		},
		error: function(data) {
//						layer.close(loading); //关闭加载层
			layer.msg("获取设备信息失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
//						layer.close(loading); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});

}

//获取当前现场的全部设备
function getAllEquipments(tokenId) {
	tokenTime = now.getTime();
	if(tokenId == "close") { //回调过程中出错
//		layer.close(loading); //关闭加载层
		return;
	}
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetAllEquipments?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"scene_id": sceneId
		},
		timeout: 30000,
		success: function(data) {
			//			layer.close(loading); //关闭加载层
			if(data.status == 1) { //获取成功
				//清空界面
				$(".chooseBox").html("");
				var text = data.result.replace(/\n/g, "\\n").replace(/\\r/g, "\\r");
				var json = eval("(" + text + ")");

				equipmentId = json[0].equipment_id;
				controlNum = json[0].controlNum;
				//绑定设备信息
				var equipmentStr = "";
				for(var i = 0; i < json.length; i++) {
					if(json[i].equipment_stoped == 0) {
						equipmentStr +=
							'<span class="start" href="javascript:void(0)" controlNum="' + json[i].controlNum + '" id="' + json[i].equipment_id + '" onclick="loadPointData(this)">' + json[i].equipment_name + '<i class="bge g"></i></span>';
					} else {
						equipmentStr +=
							'<span class="stop" href="javascript:void(0)" controlNum="' + json[i].controlNum + '" id="' + json[i].equipment_id + '" onclick="loadPointData(this)">' + json[i].equipment_name + '<i class="bge r"></i></span>';
					}
				}
				$(".chooseBox").append(equipmentStr);
				//选框
				$(".chooseBox span").eq(0).addClass("active");
				$(".chooseBox span").click(function() {
						$(this).addClass("active");
						$(this).siblings().removeClass("active");
					})
					//加载设备数据
					//          	json[i].equipment_id
				getPointData(tokenId);
				setInterval(function() {
					getPointData(tokenId);
				}, 30 * 1000);
				//          	GetEquipmentsPic(tokenId);
			} else {
				layer.msg(data.result);
			}
		},
		error: function(data) {
//			layer.close(loading); //关闭加载层
			layer.msg("获取设备信息失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
//						layer.close(loading); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

function loadPointData(data) {
	loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	equipmentId = data.id;
	controlNum = data.getAttribute("controlNum");

	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getPointData(tokenId); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			getPointData(tokenId); //回调函数，获取全部设备
		}
	});
	//	getTokenIdLocal(function(tokenId) {
	//		if(tokenId == "null") { //Token过期或者首次没有Token
	//			getTokenIdServer(function(tokenId) { //重新获取TokenId
	//				GetEquipmentsPic(tokenId); //回调函数，获取全部设备
	//			});
	//		} else { //获取TokenId成功
	//			GetEquipmentsPic(tokenId); //回调函数，获取全部设备
	//		}
	//	});
}
//获取设备的部件采集数据信息
function getPointData(tokenId) {
	var nowTime = now.getTime();
	if(nowTime - tokenTime > 6000000) { //大于100分钟，TokenId过期
		//重新获取TokenId
		getTokenIdLocal(function(tokenId) {
			if(tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					tokenTime = now.getTime();
					getPointData(tokenId); //回调函数，获取全部设备
				});
			} else { //获取TokenId成功
				tokenTime = now.getTime();
				getPointData(tokenId); //回调函数，获取全部设备
			}
		});
	} else { //没过期
		//		var loading = layer.load(2, {
		//			shade: [0.2, '#000']
		//		});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Scene.asmx/GetPointData?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"equipment_id": equipmentId
			},
			timeout: 30000,
			success: function(data) {
				
					//  没有数据
				if(data.status == 0) {
					$("#cubeList").html('<h3 class="dataTitle">实时监控数据</h3>' +
						'<table class="dataTable1">' +
						'<thead>' +
						'<tr><th style="width:50%">名称</th><th>运行状态</th></tr>' +
						'</thead><tbody>');

					$(".dataTable1").html('<tr><th>名称</th><th>运行状态</th></tr>');
					layer.msg(data.result);
					layer.close(loading); //关闭加载层
					return;
				}
				if(data.status == 1) { //获取成功
					var json = eval("(" + data.result + ")");
					if(json.length == 0) {
						$("#cubeList").html('<h3 class="dataTitle">实时监控数据</h3>' +
							'<table class="dataTable1">' +
							'<thead>' +
							'<tr><th style="width:50%">名称</th><th>运行状态</th></tr>' +
							'</thead><tbody>');
						$(".dataTable1").html('<tr><th>名称</th><th>运行状态</th></tr>');
						layer.close(loading); //关闭加载层
						return;
					}

					$("#cubeList").html('');
					//
					if(controlNum > 0) {
						$("#monitorList").hide();
						$("#cubeList").show();
						//硝魔方页面显示
						setCubeList(json);
						return;
					} else {
						$("#monitorList").show();
						$("#cubeList").hide();
					}

					var pointDataValue = '';
					var pointDataStatus = '<tr><th>名称</th><th>运行状态</th></tr>';

					//	            	$("#switch >li:not(:first-child)").find("div").html("");
					//	            	$("#data >li:not(:first-child)").find("div").html("");
					//	            	var j = 1;
					//          		var k = 1;
					//					判断数据类型 
					for(var i = 0; i < json.length; i++) {
						if(json[i].采集点类型 == "复合开关-开") {
							pointDataStatus += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							//	            			pointDataStatus += '<li><div>'+json[i].采集点名称1+'('+json[i].部件名称+')</div>';
							//	            			$("#switch").find("li").eq(k).find("div").eq(0).html(json[i].component_name);

							if(json[i].值 == "开") {
								//不同的显示
								pointDataStatus += '<td><div class="kg on"><i class="icon"></i></div></td></tr>';

							} else if(json[i].值 == "关") {
								pointDataStatus += '<td><div class="kg off"><i class="icon"></i></div></td></tr>';
							} else if(json[i].值 == "--") {
								pointDataStatus += '<td class="wait_ok">--</td></tr>';
							} else {
								pointDataStatus += '<td class="wait_ok" style="color: orange;">故障</td></tr>';
							}
							//	            			$("#data").find("li").eq(j).find("div").eq(0).html(json[i].component_name);
							//	            			$("#data").find("li").eq(j).find("div").eq(1).html(json[i].value);
							//	            			j++;
						} else if(json[i].采集点类型 == "运行") {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							if(json[i].值 == "运行") {
								pointDataValue += "<td class='ok'  style='color: #00FF00;'>" + json[i].值 + "</td></tr>";
							} else if(json[i].值 == "停止") {
								pointDataValue += "<td class='no_ok' style='color: red;'>" + json[i].值 + "</td></tr>";
							} else {
								pointDataValue += "<td>" + json[i].值 + "</td></tr>";
							}
						} else if(json[i].采集点类型 == "监管") {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							if(json[i].值 == "需监管") {
								pointDataValue += "<td class='lightblue'>" + json[i].值 + "</td></tr>";
							} else {
								pointDataValue += "<td>" + json[i].值 + "</td></tr>";
							}
						} else if(json[i].采集点类型 == "故障") {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							if(json[i].值 == "故障") {
								pointDataValue += "<td class='lightyellow'>" + json[i].值 + "</td></tr>";
							} else {
								pointDataValue += "<td>" + json[i].值 + "</td></tr>";
							}
						} else if(json[i].采集点类型 == "反馈") {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							if(json[i].值 == "反馈中") {
								pointDataValue += "<td class='green'>" + json[i].值 + "</td></tr>";
							} else {
								pointDataValue += "<td>" + json[i].值 + "</td></tr>";
							}
						} else if(json[i].采集点类型 == "高料位") {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td>';
							if(json[i].值 == "报警") {
								pointDataValue += "<td class='orangered' style='color: red;'>" + json[i].值 + "</td></tr>";
							} else {
								pointDataValue += "<td>" + json[i].值 + "</td></tr>";
							}
						} else {
							pointDataValue += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '&type=' + encodeURI(encodeURI(json[i].采集点类型)) + '">' + json[i].采集点名称1 + '<i class="icon"></i></a></td><td>' + json[i].值 + '</td></tr>';
						}
					}
					//					$(".dataTable").html();
					$(".dataTable1").html(pointDataStatus + pointDataValue);
				} else {
					layer.msg(data.result);
					$("#cubeList").html('');
					//										$(".dataTable").html("");
					$(".dataTable1").html("");
				}
				layer.close(loading); //关闭加载层
			},
			error: function(data) {
				layer.close(loading); //关闭加载层
				layer.msg("刷新数据失败");
			},
			complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
					layer.close(loading); //关闭加载层
				
				if(status == 'timeout') { //超时,status还有success,error等值的情况

					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}

			}
		});
	}
}

//设置页面 硝魔方信息
function setCubeList(json) {

	$("#monitorList").hide();
	var cubeList = '<h3 class="dataTitle">实时监控数据</h3>' +
		'<table class="dataTable">' +
		'<thead>' +
		'<tr><th>名称</th><th class="dataTableth">运行状态</th><th><div id="cubekey" class="kg off-gray"><i class="icon"></i></div></th></tr>' +
		'</thead><tbody>';
	for(var i = 0; i < json.length; i++) {
		if(json[i].采集点类型 == "复合开关-开") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "开") {
				cubeList += '<td><div class="kg on"><i class="icon"></i></div></td>';
			} else if(json[i].值 == "关") {
				cubeList += '<td><div class="kg off"><i class="icon"></i></div></td>';
			} else {
				cubeList += "<td><b class='yellow'>" + json[i].值 + "</b></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}

		} else if(json[i].采集点类型 == "运行") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "运行") {
				cubeList += "<td><b class='green'>" + json[i].值 + "</b></td>";
			} else if(json[i].值 == "停止") {
				cubeList += "<td><b class='red'>" + json[i].值 + "</b></td>";
			} else {
				cubeList += "<td><span>" + json[i].值 + "</span></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		} else if(json[i].采集点类型 == "监管") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "需监管") {
				cubeList += "<td><b class='green'>" + json[i].值 + "</b></td>";
			} else {
				cubeList += "<td><span>" + json[i].值 + "</span></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		} else if(json[i].采集点类型 == "故障") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "故障") {
				cubeList += "<td><b class='yellow'>" + json[i].值 + "</b></td>";
			} else {
				cubeList += "<td><span>" + json[i].值 + "</span></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		} else if(json[i].采集点类型 == "反馈") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "反馈中") {
				cubeList += "<td><b class='green'>" + json[i].值 + "</b></td>";
			} else {
				cubeList += "<td><span>" + json[i].值 + "</span></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		} else if(json[i].采集点类型 == "高料位") {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			if(json[i].值 == "报警") {
				cubeList += "<td><b class='red'>" + json[i].值 + "</b></td>";
			} else {
				cubeList += "<td><span>" + json[i].值 + "</span></td>";
			}
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		} else {
			cubeList += '<tr><td><a href="component_status.html?id=' + json[i].采集点ID + '&name=' + encodeURI(encodeURI(json[i].采集点名称1)) + '&type=' + encodeURI(encodeURI(json[i].采集点类型)) + '"><span>' + json[i].采集点名称1 + '</span><i class="icon"></i></a></td>'
			cubeList += "<td><span>" + json[i].值 + "</span></td>";
			if(json[i].反控类型 === '0') {
				cubeList += '<td></td></tr>'
			} else {
				cubeList += '<td><button class="tableBtn" counterName= "' + json[i].部件名称 + '" counterType ="' + json[i].反控类型 + '" name=' + json[i].采集点ID + ' onclick="controlButton(this)">控制器</button></td></tr>'
			}
		}
	}
	cubeList += '</tbody></table>';
	$("#cubeList").html(cubeList);

	if(falg) {
		$('.tableBtn').removeClass("end").addClass('start');
		$('.kg').removeClass("off-gray").addClass("on");
	} else {
		$('.tableBtn').removeClass("start").addClass('end');
		$('.kg').removeClass("on").addClass("off-gray");
	}
	//密码解锁按钮
	setButton();
	layer.close(loading); //关闭加载层
}

function GetEquipmentsPic(tokenId) {

	var pic = sceneId + '.jpg';
	//	        	var str = '<img src="'+url+'/Images/'+pic+'"/>';
	$(".banner img").attr("src", '' + url + '/Images/' + pic + '');

}

//当班人员表
function getDangBanUser(tokenId) {
	//	loading = layer.load(2, {
	//		shade: [0.2, '#000']
	//	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Scene.asmx/GetDangBanUser?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"scene_id": sceneId
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "1") {
				var json = eval("(" + data.result + ")");
				setDangBanUser(json)
			}

		},
		error: function(data) {
			//			layer.close(loading); //关闭加载层
			layer.msg("获取信息失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
			//			layer.close(loading); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//设置当班人员表页面显示
function setDangBanUser(json) {
	$('.module .dataTable2 tbody').html('');
	var dangBanUserDiv = '';
	for(var i = 0; i < json.length; i++) {
		dangBanUserDiv +=
			"<tr>" +
			"<td>" + json[i].emp_name + "</td>" +
			"<td><a href='tel:" + json[i].emp_phone + "'>" + json[i].emp_phone + "</td>" +
			"</tr>";
	}
	$('.module .dataTable2 tbody').append(dangBanUserDiv);
}

//密码解锁按钮
function setButton() {
	//密码解锁按钮
	$(".kg").click(function() {
		if($(this).hasClass("off-gray")) {
			var unlock = $(this);
			$(".window.pword").show();
			$(".btnBox button", $(".window.pword")).off("click");
			$(".btnBox button", $(".window.pword")).on("click", function() {
				var password = $('#password').val();
				if(password == '' || password == null) {
					layer.msg("密码不能为空");
					return;
				}
				//密码按钮确认
				$(".window.pword").hide(); //隐藏密码窗
				//验证密码
				VerifyControlPwd(unlock);
			});
		} else {
			$('.tableBtn').removeClass("start").addClass('end');
			$(this).removeClass("on").addClass("off-gray");
			db.transaction(function(tx) {
				//查询本地控制密码时间
				tx.executeSql("delete from controlManage where id='localUserId'", [], function(tx, data) {
					falg = false;
				}, function() {
					falg = false;
					layer.msg("查询控制时间失败");
				});
			});
		}
	});

}

//控制器按钮点击事件
function controlButton(data) {
	var id = data.getAttribute('name');
	var counterType = data.getAttribute('counterType');
	var counterName = data.getAttribute('counterName');
	if(!falg) {
		layer.msg("请先输入控制密码解锁");
		return;
	}
	if(counterType == '1') {
		$(".btnBox .g").hide();
		$(".pl").hide();
		//获取开关亮灯信息
		GetOpenStatus(id);
		getOpen = setInterval(function() {
			GetOpenStatus(id);
		}, 15000);
	} else {
		$(".btnBox .g").show();
		$(".pl").show();
		//获取频率信息
		GetPinLvFanKui(id);
		getPin = setInterval(function() {
			GetPinLvFanKui(id);
		}, 15000);
		//获取开关亮灯信息
		GetOpenStatus(id);
		getOpen = setInterval(function() {
			GetOpenStatus(id);
		}, 15000);
	}

	$('#counterName').html(counterName);
	$('#msg').html('');
	$('#freSet').val('');
	$(".window.control").show(); //显示操作窗
	//操作窗确定按钮
	$(".btnBox .g", $(".window.control")).off();
	$(".btnBox .g", $(".window.control")).click(function() {
		if(!falg) {
			layer.msg("超时了,需要重新解锁");
			return;
		} else {
			insert(loginName, passWord)
		}
		clearInterval(is_lastLoad);
		//发送指令
		SetComponentStatus(3, id)

	});
	//操作窗查看历史按钮
	$(".btnBox .voidg", $(".window.control")).off();
	$(".btnBox .voidg", $(".window.control")).click(function() {
		if(!falg) {
			layer.msg("超时了,需要重新解锁");
			return;
		} else {
			insert(loginName, passWord)
		}
		window.location.href = 'operHistory_info.html?id=' + id;
	});
	//操启动
	$(".btnBox .b", $(".window.control")).off();
	$(".btnBox .b", $(".window.control")).click(function() {
		if(!falg) {
			layer.msg("超时了,需要重新解锁");
			return;
		} else {
			console.log(loginName)
			console.log(passWord)
			insert(loginName, passWord)
		}
		clearInterval(is_lastLoad);
		//发送指令
		SetComponentStatus(1, id)

	});
	//操作停止
	$(".btnBox .y", $(".window.control")).off();
	$(".btnBox .y", $(".window.control")).click(function() {
		if(!falg) {
			layer.msg("超时了,需要重新解锁");
			return;
		} else {
			insert(loginName, passWord)
		}
		clearInterval(is_lastLoad);
		//发送指令
		SetComponentStatus(2, id)

	});
}

//验证控制密码
function VerifyControlPwd(unlock) {
	var password = $('#password').val();
	$.ajax({
		type: "post",
		url: url + "/handler/Person.asmx/VerifyControlPwd?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"loginName": loginName,
			"password": $.md5(password).toUpperCase()
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "1") {
				$('.tableBtn').removeClass("end").addClass('start');
				$('.kg').removeClass("off-gray").addClass("on");
				falg = true;
				layer.msg(data.result);
				//将控制密码信息加入本地数据库
				insert(loginName, password)
			} else {
				layer.msg(data.result);
			}
			$('#password').val('');
		},
		error: function(data) {
//			layer.close(loading); //关闭加载层
			layer.msg("获取信息失败");
		}
	});
}

//获取频率反馈
function GetPinLvFanKui(id) {
	$('#freGet').val("");
	$.ajax({
		type: "post",
		url: url + "/handler/scene.asmx/GetPinLvFanKui?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		async: false,
		data: {
			"tokenId": newTokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "1") {
				$('#freGet').val(data.result);
			} else {
				layer.msg("未获取到频率数值");
			}
		},
		error: function(data) {
//			layer.close(loading); //关闭加载层
			layer.msg("获取频率数值失败");
		}
	});
}

//获取开关亮灯数据
function GetOpenStatus(id) {
	$.ajax({
		type: "post",
		url: url + "/handler/scene.asmx/GetOpenStatus?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		async: false,
		data: {
			"tokenId": newTokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == 1) {
				var json = eval('(' + data.result + ')')
				if(json[0].open_status == '1') {
					$('#open_status').addClass('green');
				} else {
					$('#open_status').removeClass('green')
				}
				if(json[0].close_status == '1') {
					$('#close_status').addClass('yellow');
				} else {
					$('#close_status').removeClass('yellow');
				}
			}
		},
		error: function(data) {
//			layer.close(loading); //关闭加载层
			layer.msg("获取信息失败");
		}
	});
}

//发送指令
function SetComponentStatus(type, id) {
	loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	lastStatus = false;
	var password = $.md5(passWord).toUpperCase()
	var no_off = $('.state .active').html();
	var freSet = $('#freSet').val();
	$.ajax({
		type: "post",
		url: url + "/handler/scene.asmx/SetComponentStatus?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"loginName": loginName,
			"password": password,
			"id": id,
			"type": type,
			"val": freSet
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "1") {
				var qn = data.result;
				GetReverseControlStatus(is_lastLoad, qn);
				is_lastLoad2 = setTimeout(function() {
					allClose(); //关闭定时器
					layer.msg("请求指令状态超时");
					layer.close(loading); //关闭加载层
				}, 30000)
				is_lastLoad = setInterval(function() {
					if(!lastStatus) {
						GetReverseControlStatus(is_lastLoad, qn);
					} else {
						allClose(); //关闭定时器
					}
				}, 5000);
			} else {
				layer.msg(data.result);
				layer.close(loading); //关闭加载层
			}
		},
		error: function(data) {
			layer.msg("获取信息失败");
			layer.close(loading); //关闭加载层
			
		}
	});
}

//接收指令码
function GetReverseControlStatus(is_lastLoad, qn) {
	$.ajax({
		type: "post",
		url: url + "/handler/scene.asmx/GetReverseControlStatus?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		async: false,
		data: {
			"tokenId": newTokenId,
			"qn": qn
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "1") {
				var json = eval('(' + data.result + ')');
				if(json[0].is_last == '1') {
					$('#msg').html(json[0].status_msg)
					$('#msg').removeClass('msg').addClass('msg_ok');
					lastStatus = true;
					setTimeout(function() {
						layer.close(loading); //关闭加载层
						allClose(); //关闭定时器
					}, 1000);
				} else {
					$('#msg').html(json[0].status_msg)
					$('#msg').removeClass('msg_ok').addClass('msg');
					lastStatus = false;
				}
			} else {
				lastStatus = false;
				$('#msg').html('执行指令失败')
				$('#msg').removeClass('msg_ok').addClass('msg');
			}
		},
		error: function(data) {
			layer.msg("获取信息失败");
		}
	});
}

//将控制密码时间加入本地数据库
function insert(loginName, password) {
	passWord = password;
	var datenow = new Date();
	db.transaction(function(tx) {
		//删除用户表
		tx.executeSql("drop table if exists controlManage", [], function(tx, data) {
			//创建用户表，如果有则创建失败
			tx.executeSql("CREATE TABLE controlManage (id TEXT UNIQUE, loginName TEXT, password TEXT,time TEXT)", [], function(tx, data) {
				//将用户信息写入User表
				tx.executeSql("insert into controlManage(id,loginName,password,time) VALUES(?,?,?,?)", ["localUserId", loginName, password, datenow], function(tx, data) {
					controlTime = 300000;
					//如果控制时间超过5分钟就关闭按钮
					controlClose();
				}, function() {
					//插入失败的回调函数
					layer.msg("插入失败");
				});
			});
		});
	});
}

//查询控制密码时间
function loginAuoto() {
	db.transaction(function(tx) {
		//查询本地控制密码时间
		tx.executeSql("select * from controlManage where id='localUserId'", [], function(tx, data) {

			if(data.rows.length == 1) { //如果本地有用户
				var loginTime = data.rows.item(0)["time"]; //登录时间
				passWord = data.rows.item(0)["password"]; //登录时间
				var oldTime = new Date(loginTime);
				var nowTime = new Date();
				var date3 = nowTime.getTime() - oldTime.getTime();
				if(date3 >= 300000) {
					return;
				} else {
					controlTime = 300000 - date3;
					//如果控制时间超过5分钟就关闭按钮
					controlClose();
					falg = true;
				}
			} else {
				falg = false;
			}
		}, function() {
			console.log(1)
			falg = false;
		});
	});
}

//如果控制时间超过5分钟就关闭按钮
function controlClose() {
	if(controlSetTimeout != null || controlSetTimeout != '') {
		clearTimeout(controlSetTimeout)
	}
	controlSetTimeout = setTimeout(function() {
		$('.tableBtn').removeClass("start").addClass('end');
		$('.kg').removeClass("on").addClass("off-gray");
		db.transaction(function(tx) {
			//查询本地控制密码时间
			tx.executeSql("delete from controlManage where id='localUserId'", [], function(tx, data) {
				falg = false;
			}, function() {
				falg = false;
			});
		});
	}, controlTime)
}

//关闭全部定时器
function allClose() {
	clearInterval(is_lastLoad);
	clearInterval(is_lastLoad2);
	clearInterval(getPin);
	clearInterval(getOpen);
}