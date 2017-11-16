var newTokenId = "";
var loginName;
var userName;
var empId;
getLoginName();
$(function() {
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newTokenId = tokenId;
				getUserName(tokenId);
				GetInfo(tokenId); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			newTokenId = tokenId;
			getUserName(tokenId);
			GetInfo(tokenId); //回调函数，获取用户信息
		}
	});
	
	chooseDate({
			ele: ".setTime div ", //触发日期弹窗的按钮
			now: dateformat(new Date(), "yyyy-MM-dd HH:mm:ss"), //可以写auto 为目前时间
			minDate: "2010-01-03", //最小日期
			maxDate: "2018-01-03" //最大日期
		}, function(nowDate) {
			console.log(nowDate);
			if(nowDate < new Date()) {
				$("#submit").attr("disabled",true);
				layer.msg("请选择正确的时间顺序");
				return;
			}
			$("#submit").attr("disabled",false);
//			time = dateformat(nowDate, "yyyy-MM-dd")
				//回调函数
		}, true //是否支持选择小时
	);
	//		$("select").click(function(){
	//			$(this).find(".remove").css("display","none");
	//		});

	//		时间绑定
});

function getUserName(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/getUserName?jsoncallback?",
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
			var json = eval("(" + data.result + ")");
			$("#respons").val(json[0].emp_name);
			userName = json[0].emp_name;
			empId = json[0].emp_id;

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

function GetInfo(tokenId) {
	//加载现场
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetSceneName?jsoncallback?",
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
//  获取 select 选中的值  $('#aa option:selected').val()
//加载设备
function loadEquipment(e) {
	var sceneName = $(e).val();
	//		console.log($(e).val());
	var id = $("select").eq(0).val();
	if(!id) {
		layer.msg("请选择现场");
		return;
	}
	//加载维修的设备
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetEquipmentName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == '0') {
				layer.msg(data.result);
				return;
			}
			//				给现场信息赋值
			var $equipment = $("select").eq(1);
			$equipment.html();
			var json = eval("(" + data.result + ")");
			var str = '<option value="" class="remove" >请选择设备</option>';
			for(var i = 0; i < json.length; i++) {
				str += '<option value="' + json[i].equipment_id + '">' + json[i].equipment_name + '</option>';
			}
			$equipment.html(str);
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
//加载部件
function loadComponent(e) {
	var equipmentName = $(e).val();
	//		console.log($(e).val());
	var id = $("select").eq(1).val();
	if(!id) {
		layer.msg("请选择设备");
		return;
	}
	//加载维修的部件
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetComponentName?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == '0') {
				layer.msg(data.result);
				return;
			}
			//				给现场信息赋值
			var $component = $("select").eq(2);
			$component.html();
			var json = eval("(" + data.result + ")");
			var str = '<option value="" class="remove">请选择部件</option>';
			for(var i = 0; i < json.length; i++) {
				str += '<option  value="' + json[i].equipment_component_id + '">' + json[i].component_name + '</option>';
				//					str += '<span style="padding-right:1rem" >' + result2[i].component_name + result2[i].equipment_component_code + '</span>';
			}
			$component.html(str);
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

function showDiv() {
	var scene_id = $("select").eq(0).find("option:selected").val();
	var scene_name = $("select").eq(0).find("option:selected").text();
	var num = $("input").eq(1).val();
	if(!validate(num)) {
		layer.msg("请输入1-99之间的数字");
		return;
	}
	if(scene_id == "" || scene_name == "") {
		layer.msg("请选择现场");
		return;
	}
	var equipment_id = $("select").eq(1).find("option:selected").val();
	var equipment_name = $("select").eq(1).find("option:selected").text();
	if(equipment_id == "" || equipment_name == "") {
		layer.msg("请选择设备");
		return;
	}
	var equipment_component_id = $("select").eq(2).find("option:selected").val();
	var component_name = $("select").eq(2).find("option:selected").text();
	//		var equipment_component_id =$("select").eq(2).find("option:selected").attr("name");
	if(equipment_component_id == "" || component_name == "") {
		layer.msg("请选择部件");
		return;
	}
	$("#detail").show();
	//			$("ul").hide();
	$("#setting").hide();
	loadDatas(equipment_id, equipment_component_id);
}

var relation_comId = new Array();

function loadDatas(equId, comId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetNewRepairCom?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"equId": equId,
			"comId": comId
		},
		timeout: 30000,
		success: function(data) {
			$("#equ").html("");
			layer.close(loading);
			if(data.status == '0') {
				layer.msg(data.result);
				//				$("ul,ol,button").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			var str = "";
			for(var i = 0; i < json.length; i++) {
				//				relation_comId[i]= json[i].equipment_component_id;
				str += '<p><input type="checkbox" name="equid" value="' + json[i].equipment_component_id + '" />' + json[i].component_name + json[i].equipment_component_code + '</p> ';
			}
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

//将所选择的信息保存到数据库  状态变为等待审批
function submit() {
	var scene_id = $("select").eq(0).find("option:selected").val();
	var scene_name = $("select").eq(0).find("option:selected").text();
	var equipment_id = $("select").eq(1).find("option:selected").val();
	var equipment_name = $("select").eq(1).find("option:selected").text();
	var equipment_component_id = $("select").eq(2).find("option:selected").val();
	var component_name = $("select").eq(2).find("option:selected").text();
	var time =dateformat($("#date").text(), "yyyy-MM-dd HH:mm:ss");
	var solution = $("textarea").eq(0).val();
	var num = $("input").eq(1).val();
	var relation_comId = new Array();
	var $relation = $(":checkbox:checked");
	for(var i = 0; i < $relation.length; i++) {
		relation_comId[i] = $relation.eq(i).val();
	}
	if(time == "") {
		layer.close(loading1);
		layer.msg("请选择日期");
		return;
	}
	if(solution === "") {
		layer.close(loading1);
		layer.msg("请填写保养方案");
		return;
	}
	var jsonData = '{"scene_id":"' + scene_id + '","scene_name":"' + scene_name + '","equipment_id":"' + equipment_id + '","equipment_name":"' + equipment_name + '",' +
		'"equipment_component_id":"' + equipment_component_id + '","component_name":"' + component_name + '","emp_id":"' + empId + '",' +
		'"emp_name":"' + userName + '","time":"' + time + '","solution":"' + solution + '","relation_comId":"' + relation_comId + '","num":"' + num + '"}';
	var text = jsonData.replace(/\n/g, "\\n").replace(/\\r/g, "\\r");
	var loading1 = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/SaveNewMaintainInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newTokenId,
			"jsonData": text
		},
		timeout: 30000,
		success: function(data) {
			if(data.status == 0) {
				layer.msg(data.result);
				return;
			}
			layer.close(loading1);
			layer.msg("保存成功");
			setTimeout(function() {
				$("body").fadeOut("fast", function() {
					window.location = "maintain_info.html";
				});
			}, 1314);

		},
		error: function() {
			layer.close(loading1);
			layer.msg("服务器连接失败");
		},
		complete: function(XMLHttpRequest, status) {
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.close(loading1);
				layer.msg("请求超时");
			}
		}
	});
}

//验证数字
function validate(str) {
	// 	console.log(str);
	var reg = new RegExp("^[1-9]{1,2}$");
	if(!reg.test(str)) {
		//      layer.msg("请输入1-99之间的数!");
		return false;
	}
	return true;
}