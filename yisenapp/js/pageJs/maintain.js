var sceneId = null;
//type  等于1 是填写  0 是查看
var type = GetQueryString("type");

var id = GetQueryString("id");

var maintain_status = GetQueryString("meid");
var maintain_status1 = GetQueryString("maintain_status");
var scene_id = GetQueryString("scene_id");
var loginName = "";
$(function() {
		getLoginName();
		//	getSceneId();
		if (type == "0") {
			$("#bohuifanganReason").hide();
			$("#submit").hide();
			var onlyread = $("<div></div>").appendTo($("body"));
			$(onlyread).css({
				"width": "100%",
				"height": "100vh",
				"position": "fixed",
				"top": "3rem",
				"left": "0",
				"z-index": "999999999"
			});
		}
		//获取TokenId，并获取用户信息
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId
					if (type == "0") {
						getCompleteInfo(tokenId);
					} else {
						GetMaintainInfo(tokenId); //回调函数，获取用户信息
					}

				});
			} else { //获取TokenId成功
				if (type == "0") {
					getCompleteInfo(tokenId);

				} else {
					GetMaintainInfo(tokenId); //回调函数，获取用户信息
				}
			}
		});

		//	$("#submit").click(function(){
		//		layer.msg("提交成功",{shift: -1},function(){
		//			window.location.href="maintain_info.html";
		//		});
		//	})
	})
	//加载的信息
function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "maintain_info.html?scene_id="+scene_id+"&maintain_status="+maintain_status1+"&taskBack=taskBack";
}
function getCompleteInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/getCompleteInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			//      	$("#equ").html("");
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("保养信息不存在");
				$("ul,ol,button").hide();
				return;
			}
			var result = data.result.split("&");
//	
//			var json = eval("(" + data.result + ")");
//			console.log(json)
			var text =  result[0].replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
			var result1 = eval("(" + text + ")");
			var result2 = eval("(" + result[1] + ")");
			if(result1[0].expect_maintain_date==""||result1[0].expect_maintain_date==null || result1[0].expect_maintain_date == 'undefined'){
				result1[0].expect_maintain_date = "暂未设定";
			}
			if(result1[0].maintain_date==""||result1[0].maintain_date==null || result1[0].maintain_date ==undefined){
				result1[0].maintain_date = "暂未设定";
			}
			if(result1[0].expect_finish_date==""||result1[0].expect_finish_date==null || result1[0].expect_finish_date ==undefined){
				result1[0].expect_finish_date = "暂未设定";
			}
			if(result1[0].finish_date==""||result1[0].finish_date==null || result1[0].finish_date ==undefined){
				result1[0].finish_date = "暂未设定";
			}
			$("#baoxiushijian").html(result1[0].maintain_create_datetime);
			$("#yuqiTime").html(result1[0].expect_maintain_date);
			$("#kaishiiTime").html(result1[0].maintain_date);
			$("#yuqiwanchengTime").html(result1[0].expect_finish_date);
			$("#wanchengTime").html(result1[0].finish_date);
			//创建时间/预期开始时间/开始保养时间/预期完成时间/完成保养时间
//			$(".form").find("span").eq(3).html(result1[0].maintain_date);
			$("#xianchang").html(result1[0].scene_name);
			$("#baoyangrenshu").html(result1[0].maintain_person_number);
			$("#baoyangfuzeren").html(result1[0].emp_name);
			$("#baoyangshebei").html(result1[0].equipment_name);
			$("#baoyangbujian").html(result1[0].maintain_component_name);
			
			if(maintain_status=='5'){
				$("#fangan5").text("审批意见");
				$("#bohuifanganReason").show();
				$("#baoyangyijian").html(result1[0].solution);
				$("#baoyangfangan").html(result1[0].approve_advice);
				
			}else{
				$("#baoyangfangan").html(result1[0].solution);
			}
			var str = "";
			if(result2.length>0){
				for (var i = 0; i < result2.length; i++) {
					str += '<li><span>' + result2[i].component_name + result2[i].equipment_component_code + '</span></li>';
				}
			}else{
				str="未设定";
			}
			
			$("#guanlianbujian").html(str);
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

function GetMaintainInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/GetMaintainInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("保养信息不存在");
				$("ul,ol,button").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			if (data.status == 1) {

			if(result1[0].expect_maintain_date==""||result1[0].expect_maintain_date==null || result1[0].expect_maintain_date ==undefined){
				result1[0].expect_maintain_date = "暂未设定";
			}
			if(result1[0].maintain_date==""||result1[0].maintain_date==null || result1[0].maintain_date ==undefined){
				result1[0].maintain_date = "暂未设定";
			}
			if(result1[0].expect_finish_date==""||result1[0].expect_finish_date==null || result1[0].expect_finish_date ==undefined){
				result1[0].expect_finish_date = "暂未设定";
			}
			if(result1[0].finish_date==""||result1[0].finish_date==null || result1[0].finish_date ==undefined){
				result1[0].finish_date = "暂未设定";
			}
			$("#baoxiushijian").html(result1[0].maintain_create_datetime);
			$("#yuqiTime").html(result1[0].expect_maintain_date);
			$("#kaishiiTime").html(result1[0].maintain_date);
			$("#yuqiwanchengTime").html(result1[0].expect_finish_date);
			$("#wanchengTime").html(result1[0].finish_date);
			//创建时间/预期开始时间/开始保养时间/预期完成时间/完成保养时间
//			$(".form").find("span").eq(3).html(result1[0].maintain_date);
			$("#xianchang").html(result1[0].scene_name);
			$("#baoyangrenshu").html(result1[0].maintain_person_number);
			$("#baoyangfuzeren").html(result1[0].emp_name);
			$("#baoyangshebei").html(result1[0].equipment_name);
			$("#baoyangbujian").html(result1[0].maintain_component_name);
			
			if(maintain_status=='5'){
				$("#fangan5").text("驳回原因");
				$("#bohuifanganReason").show();
				$("#baoyangyijian").html(result1[0].solution);
				$("#baoyangfangan").html(result1[0].approve_advice);
			}else{
				$("#baoyangfangan").html(result1[0].solution);
			}
		}
			var str = "";
			$("#guanlianbujian").html("");
			for (var i = 0; i < json.length; i++) {
				str += '<p><input type="checkbox" name="equid" value="' + json[i].equipment_component_id + '" />' + json[i].component_name +json[i].equipment_component_code + '</p> ';
			}
			$("#guanlianbujian").html(str);
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
				DealMaintainInfo(tokenId, equi); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			DealMaintainInfo(tokenId, equi); //回调函数，获取用户信息
		}
	});
}

function DealMaintainInfo(tokenId, equi) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
//	var count = $("#count").val();
	var solu = $(".text").find("textarea").eq(0).val();
//	var empname = $(".form").find("span").eq(7).html();

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/DealMaintainInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"equi": equi,
			"solu": solu,
			"id": id,
//			"empname": empname,
			//			"date":date1
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result, {
				shift: -1
			}, function() {
				window.location.href = "maintain_info.html";
			});
		},
		error: function() {
			layer.close(loading);
			layer.msg("保存信息失败");
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