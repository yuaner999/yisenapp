var newtokenId = null;
var loginName = getLoginName();

var sceneName = "";
var sceneId = "";

$(function() {
//	getLoginName();
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId	
				newtokenId = tokenId;
				getCompleteInfo(tokenId);
				GetInfo(tokenId); //回调函数，获取现场信息
			});
		} else { //获取TokenId成功		
			newtokenId = tokenId;
			getCompleteInfo(tokenId);
			GetInfo(tokenId); //回调函数，获取用户信息
		}
	});
});
//加载的信息
function getCompleteInfo(tokenId) {
	var str = '<li><textarea id="editor_id"></textarea></li>' +
		'<li><button style="font-size:2em; width: 100%;height: 10%;background-color: yellowgreen" class="  ub-ac bc-text-head  bc-btn " onclick="commitTask()">发&nbsp;&nbsp;布</button></li>';
	$("#task_detail").append(str);
}

function GetInfo(tokenId) {
	//加载现场
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/GetSceneName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"name": loginName
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if(data.status == '0') {
				layer.msg(data.result);
				return;
			}
			//				给现场信息赋值
			var $scene = $("select").eq(0);
			$scene.html();
			var json = eval("(" + data.result + ")");
			var str = '<option value="" class="remove">请选择现场</option>';
			for(var i = 0; i < json.length; i++) {
				str += '<option value="' + json[i].scene_id + '">' + json[i].scene_name + '</option>';
			}
			$scene.html(str);
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

function loadScene() {
	sceneName =  $("select").find("option:selected").text();  
	sceneId = $("select").val();
}

function commitTask() {
	var loading1 = layer.load(2, {shade: [0.2, '#000']});
	var content = $("#editor_id").val();
	content = content.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
	if(content == "" || content == null) {
		layer.close(loading);
		layer.alert("任务内容不能为空！");
		return;
	}
	console.log(loginName)
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Task.asmx/SendTask?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"userlogin": loginName,
			"content": content,
			"sceneId":sceneId,
			"sceneName":sceneName,
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == "0" || data.status == "1") {
				layer.msg(data.result);
				$("#loadmore").hide();
				return;
			}
			layer.close(loading1);
		},
		error: function(data) {
			layer.close(loading1);
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading1);
			window.location.href = "task_info.html";
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}