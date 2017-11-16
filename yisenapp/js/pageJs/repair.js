var type = GetQueryString("type");
var id = GetQueryString("id");
var select_type = GetQueryString("select_type");
var select_scene = GetQueryString("select_scene");
var loginName = "";

function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "repair_info.html?select_scene="+select_scene+"&select_type="+select_type+"&taskBack=taskBack";
}

$(function() {
		getLoginName();
		//	getSceneId();
		//获取TokenId，并获取用户信息
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					if (type == "0") {
						getCompleteInfo(tokenId);

					} else {
						GetRepairInfo(tokenId); //回调函数，获取用户信息
					}
				});
			} else { //获取TokenId成功
				if (type == "0") {
					getCompleteInfo(tokenId);

				} else {
					GetRepairInfo(tokenId); //回调函数，获取用户信息
				}
			}
		});
		//var type=GetQueryString("type");
		if (type == "0") {
			$("#submit").hide();
			var onlyread = $("<div></div>").appendTo($("body"));
			$(onlyread).css({
				"width": "100%",
				"height": "100vh",
				"position": "fixed",
				"top": "3rem",
				"left": "0",
				"z-index": "999999999"
			})
		}
		//	$("#submit").click(function(){
		//		layer.msg("提交成功",{shift: -1},function(){
		//			window.location.href="repair_info.html";
		//		});
		//		
		//	})
	});
	//加载的信息
function getCompleteInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/getCompleteInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			console.log(data);
			//      	$("#equ").html("");
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("报修信息不存在");
				$("ul,ol,button").hide();
				return;
			}
//			data.result = data.result.replace(/:""/g,":\"未设定\"");
			var result = data.result.split("&");
			var json = eval("(" + data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r") + ")");
			var result1 = eval("(" + result[0].replace(/\n/g,"\\n").replace(/\\r/g, "\\r") + ")");
			var result2 = eval("(" + result[1].replace(/\n/g,"\\n").replace(/\\r/g, "\\r") + ")");
			if(result1[0].report_time == ''){
				result1[0].report_time = '未设定';
			}
			if(result1[0].expect_repair_date == ''){
				result1[0].expect_repair_date = '未设定';
			}
			if(result1[0].repair_date == ''){
				result1[0].repair_date = '未设定';
			}
			if(result1[0].expect_finish_date == ''){
				result1[0].expect_finish_date = '未设定';
			}
			if(result1[0].finish_date == ''){
				result1[0].finish_date = '未设定';
			}
			if(result1[0].scene_name == ''){
				result1[0].scene_name = '未设定';
			}
			if(result1[0].emp_name == ''){
				result1[0].emp_name = '未设定';
			}
			if(result1[0].equipment_name == ''){
				result1[0].equipment_name = '未设定';
			}
			$(".form").find("span").eq(1).html(result1[0].report_time);
			$(".form").find("span").eq(3).html(result1[0].expect_repair_date);
			$(".form").find("span").eq(5).html(result1[0].repair_date);
			$(".form").find("span").eq(7).html(result1[0].expect_finish_date);
			$(".form").find("span").eq(9).html(result1[0].finish_date);
			$(".form").find("span").eq(11).html(result1[0].scene_name);
			$(".form").find("span").eq(13).html(result1[0].emp_name);
			$(".form").find("span").eq(15).html(result1[0].equipment_name);
			
//			console.log($(".form").find("span").eq(3).html(result1[0].repair_date));
//			if(result1[0].report_time != '' && result1[0].report_time != null){
//				$(".form").find("span").eq(1).html(result1[0].report_time);
//			}else{
//				$(".form").find("span").eq(1).html("未设定");
//			}
//			if(result1[0].repair_date != '' && result1[0].repair_date != null){
//				$(".form").find("span").eq(3).html(result1[0].repair_date);
//			}else{
//				$(".form").find("span").eq(3).html("未设定");
//			}
//			if(result1[0].scene_name != '' && result1[0].scene_name != null){
//				$(".form").find("span").eq(5).html(result1[0].scene_name);
//			}else{
//				$(".form").find("span").eq(5).html("未设定");
//			}
//			if(result1[0].emp_name != '' && result1[0].emp_name != null){
//				$(".form").find("span").eq(7).html(result1[0].emp_name);
//			}else{
//				$(".form").find("span").eq(7).html("未设定");
//			}
//			if(result1[0].equipment_name != '' && result1[0].equipment_name != null){
//				$(".form").find("span").eq(9).html(result1[0].equipment_name);
//			}else{
//				$(".form").find("span").eq(9).html("未设定");
//			}	
//			$(".form").find("span").eq(1).html(result1[0].report_time);
//			$(".form").find("span").eq(3).html(result1[0].repair_date);
//			$(".form").find("span").eq(5).html(result1[0].scene_name);
//			$(".form").find("span").eq(7).html(result1[0].emp_name);
//			$(".form").find("span").eq(9).html(result1[0].equipment_name);
			
			$("textarea").eq(0).html(result1[0].reason);
			$("textarea").eq(1).html(result1[0].solution);
			$("textarea").eq(2).html(result1[0].approve_advice);
			var str = "";
			
			if((result2[0].component_name + result2[0].equipment_component_code) != ""){
				for (var i = 0; i < result2.length; i++) {
					str+='<li><input  name="equid" type="checkbox" checked="checked" readonly="readonly" value="' + result2[i].equipment_component_id + '" /><label for="c1">' + result2[i].component_name +result2[i].equipment_component_code+ '</label></li>';
//					str += '<span style="padding-right:1rem" >' + result2[i].component_name + result2[i].equipment_component_code + '</span>';
				}
			}else{
				str="未设定";
			}
			
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

function GetRepairInfo(tokenId) {
	GetEmpName();
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetRepairInfo?jsoncallback?",
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
				layer.msg("报修信息不存在");
				$("ul,ol,button").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			if (data.status == 1) {
				console.log($(".form").find("span").eq(3).html(json[0].repair_date));
				if(json[0].report_time != '' && json[0].report_time != null){
					$(".form").find("span").eq(1).html(json[0].report_time);
				}else{
					$(".form").find("span").eq(1).html("未设定");
				}
				if(json[0].repair_date != '' && json[0].repair_date != null){
					$(".form").find("span").eq(3).html(json[0].repair_date);
				}else{
					$(".form").find("span").eq(3).html("未设定");
				}
				if(json[0].scene_name != '' && json[0].scene_name != null){
					$(".form").find("span").eq(5).html(json[0].scene_name);
				}else{
					$(".form").find("span").eq(5).html("未设定");
				}
				if(json[0].emp_name != '' && json[0].emp_name != null){
					$(".form").find("span").eq(7).html(json[0].emp_name);
				}else{
					$(".form").find("span").eq(7).html("未设定");
				}
				if(json[0].equipment_name != '' && json[0].equipment_name != null){
					$(".form").find("span").eq(9).html(json[0].equipment_name);
				}else{
					$(".form").find("span").eq(9).html("未设定");
				}	
			}
			var str = "";

			for (var i = 0; i < json.length; i++) {
				str+='<li><input  name="equid" type="checkbox" value="' + json[i].equipment_component_id + '"  /><label for="c1">' + json[i].component_name +json[i].equipment_component_code+ '</label></li>'
//				str += '<p><input type="checkbox" name="equid" value="' + json[i].equipment_component_id + '" />' + json[i].component_name +json[i].equipment_component_code+ '</p> ';
			}
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

function Submit() {
	$("#submit").hide();
	var equi = "";
	$("input:checkbox[name='equid']:checked").each(function() {
		equi += $(this).val() + ",";
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				DealRepairInfo(tokenId, equi); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			DealRepairInfo(tokenId, equi); //回调函数，获取用户信息
		}
	});
}
//处理报修信息
function DealRepairInfo(tokenId, equi) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var reason = $("textarea").eq(0).val();
	var solu = $("textarea").eq(1).val();
	alert(reason);
	alert(solu);
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/DealRepairInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"reason": reason,
			"equi": equi,
			"solu": solu,
			"id": id,
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result, {
				shift: -1
			}, function() {
				window.location.href = "repair_info.html";
			});
		},
		error: function() {
			layer.close(loading);
			layer.msg("加载信息失败");
			$("#submit").show();

		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading); //关闭加载层
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	})
}

function GetEmpName() {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Login.asmx/GetUserName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"loginName": loginName
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			var json = eval("(" + data.result + ")");
			if (data.status == 1) {
				$(".form").find("span").eq(5).html(json[0].emp_name);
			}
		},
		error: function(data) {
			layer.close(loading);
			layer.msg("加载信息失败");
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