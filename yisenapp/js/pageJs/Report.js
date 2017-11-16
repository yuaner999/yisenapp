var sceneId = null;
//报警级别ID
var warnid = '1';
//加载层
//var load = null;
//系统当前时间
var now = new Date();
//获取TokenId时间
var tokenTime = null;
//分页
var spage = 1;
var rows = 3;
var select_scene = "";	
var loginName;
var statusupdate=1;
var select_scene = GetQueryString("select_scene");
getLoginName();
$(function() {
	getSceneId();
	//加载层
	//	var url = 'homepage.html?sid='+sceneId+'';
	//	$(".foot li a").eq(0).attr("href",url);//添加URL链接 
	load = layer.load(2, {shade: [0.2, '#000'] //0.1透明度的白色背景
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getSceneList(tokenId);
				getWarnInfo(tokenId); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			getSceneList(tokenId);
			getWarnInfo(tokenId); //回调函数，获取全部设备
		}
	});
	$("#lv1").click(function() {
		$(".box").html("");
		spage = 1;
		warnid = '1';
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					getWarnInfo(tokenId); //回调函数，获取全部设备
				});
			} else { //获取TokenId成功
				getWarnInfo(tokenId); //回调函数，获取全部设备
			}
		});
	})
	$("#lv2").click(function() {
		$(".box").html("");
		spage = 1;
		warnid = '2';
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					getWarnInfo(tokenId); //回调函数，获取全部设备
				});
			} else { //获取TokenId成功
				getWarnInfo(tokenId); //回调函数，获取全部设备
			}
		});
	})
	$("#lv3").click(function() {
			$(".box").html("");
			spage = 1;
			warnid = '3';
			getTokenIdLocal(function(tokenId) {
				if (tokenId == "null") { //Token过期或者首次没有Token
					getTokenIdServer(function(tokenId) { //重新获取TokenId
						getWarnInfo(tokenId); //回调函数，获取全部设备
					});
				} else { //获取TokenId成功
					getWarnInfo(tokenId); //回调函数，获取全部设备
				}
			});
		})
		//	$("#chec").click(function(){
		//		warnid='cf';
		//		$(".list").html("");
		//		getTokenIdLocal(function(tokenId){
		//		if(tokenId=="null"){//Token过期或者首次没有Token
		//			getTokenIdServer(function(tokenId){//重新获取TokenId
		//				getWarnInfo(tokenId);//回调函数，获取全部设备
		//			});
		//		}else{//获取TokenId成功
		//			getWarnInfo(tokenId);//回调函数，获取全部设备
		//		}
		//	});
		//	})
});
//加载现场下拉列表
function getSceneList(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/GetSceneName?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"name":loginName
			},
			timeout: 30000,
			success: function(data) {
				layer.close(loading);
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
//				给现场信息赋值
				var $scene = $("#select_scene");
				$scene.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="请选择现场" class="remove">请选择现场</option><option value="" class="remove">查看全部现场</option>';
				for (var i = 0; i < json.length; i++) {
					str += '<option value="'+json[i].scene_id+'">'+json[i].scene_name+'</option>';
				}
				$scene.html(str);
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
//现场下拉框选择
function changeScene(e){
	
	select_scene = $(e).val();
	if(select_scene == "请选择现场"){
		return;
	}
	spage = 1;
	statusupdate = 0;
	console.log(select_scene);
	$(".nextpage").html("加载中...");
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getWarnInfo(tokenId); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			getWarnInfo(tokenId); //回调函数，获取全部设备
		}
	});
}

function getWarnInfo(tokenId) {
	load = layer.load(2, {shade: [0.2, '#000'] //0.1透明度的白色背景
	});
	tokenTime = now.getTime();
	if (tokenId == "close") { //回调过程中出错
		layer.close(load); //关闭加载层
		return;
	}
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/WarnInfo.asmx/LoadWarnInfo2?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"warnid": warnid,
			"loginName": loginName,
			"scene_id":select_scene,
			"spage": spage,
			"rows": rows
		},
		timeout: 30000,
		success: function(data) {
			layer.close(load); //关闭加载层      	
			if (data.status == 1 || data.status == 2) { //获取成功
				$(".nextpage").remove();
				var json = eval("(" + data.result + ")");
				//  		console.log(json);
				var str = "";
				var str2 = "";
				for (var i = 0; i < json.length; i++) {
					json[i].warning_datetime =  dateformat(new Date(json[i].warning_datetime.replace(/\//g,"-")),"yyyy-MM-dd HH:mm:ss");
					//				console.log(json[i].warning_status);
					if (json[i].warning_level == '1') {
						if (json[i].warning_status == "已处理"||json[i].warning_status == "处理中") { //2.3 级的已处理状态
							
						   str+="<div class='infoItem'><p><mark>一级报警</mark><span class='right'><span>"+ json[i].warning_datetime +"</span></span></p>"
	    		            +"<div class='info'><b class='yellow'>现场</b><b>"+ json[i].scene_name +"</b><span class='yellow right'>"+ json[i].warning_status + "</span></div>"
				    		+"<ul><li><span>设备名称</span><span>"+ json[i].equipment_name +"</span></li><li><span>部件名称</span><span>"+ json[i].component_name +"</span></li><li><span>报警值</span><span>"+ json[i].warning_value +"</span></li></ul>"
//				    		+"<div class='btnBox'><button class='blockBox g'><a href='sendNewRepair.html?id=" + json[i].warning_log_id + "'>发起报修</a></button>"
				    		+"<div class='btnBox'><a href='sendNewRepair.html?id=" + json[i].warning_log_id + "'><button class='blockBox g' style='display:none;'>发起报修</button></a>"
				    		
				    		+"<a href='faultAnalysis.html?id=" + json[i].warning_id + "'><button class='blockBox b'>故障分析</button></a></div></div>"
//						str += '<li><p><img src="images/danger_07.png"/><div class="content">现场名称：' + json[i].scene_name + '</div><div class="content">设备名称：' + json[i].equipment_name + '</div><div class="content">部件名称：' + json[i].component_name + '</div><div class="content">报警值 ：&nbsp;' + json[i].warning_value + '</div>' +
//							'</p><div><span>' + json[i].warning_datetime + '</span><ol>' +
//							'<li  class="twofont">' + json[i].warning_status + '</li></ol></div>' +
//							'<div class="btnn"><a style="visibility:hidden;" href="sendNewRepair.html?id=' + json[i].warning_log_id + '">发起报修</a>' +
//							'<a href="faultAnalysis.html?id=' + json[i].warning_id + '">故障分析</a></div>' +
//							'</li>';
						}	
						else{
							str+="<div class='infoItem'><p><mark>一级报警</mark><span class='right'><span>"+ json[i].warning_datetime +"</span></span></p>"
	    		            +"<div class='info'><b class='yellow'>现场</b><b>"+ json[i].scene_name +"</b><span class='yellow right'>"+ json[i].warning_status + "</span></div>"
				    		+"<ul><li><span>设备名称</span><span>"+ json[i].equipment_name +"</span></li><li><span>部件名称</span><span>"+ json[i].component_name +"</span></li><li><span>报警值</span><span>"+ json[i].warning_value +"</span></li></ul>"
				    		+"<div class='btnBox'><a href='sendNewRepair.html?id=" + json[i].warning_log_id + "'><button class='blockBox g'>发起报修</button></a>"
				    		+"<a href='faultAnalysis.html?id=" + json[i].warning_id + "'><button class='blockBox b'>故障分析</button></a></div></div>"
//						str += '<li><p><img src="images/danger_07.png"/><div class="content">现场名称：' + json[i].scene_name + '</div><div class="content">设备名称：' + json[i].equipment_name + '</div><div class="content">部件名称：' + json[i].component_name + '</div><div class="content">报警值 ：&nbsp;' + json[i].warning_value + '</div>' +
//							'</p><div><span>' + json[i].warning_datetime + '</span><ol>' +
//							'<li  class="twofont">' + json[i].warning_status + '</li></ol></div>'+
//							'<div class="btnn"><a href="sendNewRepair.html?id=' + json[i].warning_log_id + '">发起报修</a>' +
//							'<a href="faultAnalysis.html?id=' + json[i].warning_id + '">故障分析</a></div>' +
//							'</li>';
						}
					} else { //2 3 级的报警中状态
						if(json[i].warning_level == '2'){
							str+="<div class='infoItem'><p><mark>二级报警</mark><span class='right'><span>"+ json[i].warning_datetime +"</span></span></p>"
						}
						if(json[i].warning_level == '3'){
							str+="<div class='infoItem'><p><mark>三级报警</mark><span class='right'><span>"+ json[i].warning_datetime +"</span></span></p>"
						}
						str+="<div class='info'><b class='yellow'>现场</b><b>"+ json[i].scene_name +"</b><span class='yellow right'>"+ json[i].warning_status + "</span></div>"
				    		+"<ul><li><span>设备名称</span><span>"+ json[i].equipment_name +"</span></li><li><span>部件名称</span><span>"+ json[i].component_name +"</span></li><li><span>报警值</span><span>"+ json[i].warning_value +"</span></li></ul>"
				    		+"<div class='btnBox'><a href='faultAnalysis.html?id=" + json[i].warning_id + "'><button class='blockBox b'>故障分析</button></a></div></div>"
//						str += '<li><p><img src="images/danger_07.png"/><div class="content">现场名称：' + json[i].scene_name + '</div><div class="content">设备名称：' + json[i].equipment_name + '</div><div class="content">部件名称：' + json[i].component_name + '</div><div class="content">报警值 ：&nbsp;' + json[i].warning_value + '</div>' +
//							'</p><div><span>' + json[i].warning_datetime + '</span><ol>' +
//							'<li  class="twofont">' + json[i].warning_status + '</li></ol></div>' +
//							'<div class="btnn"><a href="faultAnalysis.html?id=' + json[i].warning_id + '">故障分析</a></div>' + 
//							'</li>';
					}
				}

				//				$(".list").html("");
				if(statusupdate==0)
				{
					$(".box").html(str);			
				}
				else{
					$(".box").append(str);
				}
				statusupdate=1;
				if (json.length == rows) {
					$(".box").append('<div class="nextpage" onclick="nextpage()">加载更多</div>');
				}
			} else {
				
//				spage = 1;
//				layer.msg("没有更多的报警信息");
//				return;
				if(spage>1){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg(data.result);
				}
				$(".nextpage").remove();
				return;
			}
		},
		error: function(data) {
			layer.close(load); //关闭加载层
			layer.msg("获取报警信息失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
			layer.close(load); //关闭加载层
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

function checkfix(id) {
	var status = "已处理";
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				checkandfix(tokenId, id, status); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			checkandfix(tokenId, id, status); //回调函数，获取全部设备
		}
	});
}

function nextpage() {
	spage++;
	$(".nextpage").html("加载中");
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getWarnInfo(tokenId); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			getWarnInfo(tokenId); //回调函数，获取全部设备
		}
	});
}

window.onscroll = function() {
	if(getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
		spage++;
		$(".nextpage").html("加载中...");
		getTokenIdLocal(function(tokenId) {
			if(tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					getWarnInfo(tokenId); //回调函数，获取全部设备
				});
			} else { //获取TokenId成功
				getWarnInfo(tokenId); //回调函数，获取全部设备
			}
		});
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


function fixed(id) {
	var status = "已检修完成";
	var wid = '#' + id;
	if ($(wid).html() == "已检修完成") {
		return;
	}
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				checkandfix(tokenId, id, status); //回调函数，获取全部设备
			});
		} else { //获取TokenId成功
			checkandfix(tokenId, id, status); //回调函数，获取全部设备
		}
	});
}

function checkandfix(tokenId, id, status) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/WarnInfo.asmx/Checkfix?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id,
			"sid": sceneId,
			"status": status
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result);
			$(".box").html("");
			getTokenIdLocal(function(tokenId) {
				if (tokenId == "null") { //Token过期或者首次没有Token
					getTokenIdServer(function(tokenId) { //重新获取TokenId
						getWarnInfo(tokenId); //回调函数，获取全部设备
					});
				} else { //获取TokenId成功
					getWarnInfo(tokenId); //回调函数，获取全部设备
				}
			});
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