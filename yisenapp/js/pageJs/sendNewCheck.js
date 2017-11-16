var newTokenId= "";
var loginName;
var userName ;
var empId;
	$(function() {
		getLoginName();
		//获取TokenId，并获取用户信息
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
					getTokenIdServer(function(tokenId) { //重新获取TokenId
						newTokenId=tokenId;
						getUserName(tokenId);
						GetInfo(tokenId); //回调函数，获取用户信息
					});
			} else { //获取TokenId成功
					newTokenId=tokenId;
					getUserName(tokenId);
					GetInfo(tokenId); //回调函数，获取用户信息
			}
		});
//		$("select").click(function(){
//			$(this).find(".remove").css("display","none");
//		});
	})
	function getUserName(tokenId){
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/getUserName?jsoncallback?",
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
				var json = eval("(" + data.result + ")");
				$("#respons").val(json[0].emp_name);
				userName=json[0].emp_name;
				empId=json[0].emp_id;
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
	function GetInfo(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Check.asmx/GetSceneName?jsoncallback?",
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
				var $scene = $("select").eq(0);
				$scene.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="" class="remove">请选择现场</option>';
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
	//将所选择的信息保存到数据库  状态变为等待审批
	function submit(){
		$("#submit").hide();
		var loading1 = layer.load(2, {shade: [0.2, '#000']});
		var scene_id = $("select").eq(0).find("option:selected").val();
		var scene_name = $("select").eq(0).find("option:selected").text();
		var check_type =$("select").eq(1).find("option:selected").text();
		var time = $("#date").val();
		var memo =$("textarea").eq(0).val();
		memo = memo.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
		if(time ==""){
			console.log(33)
			layer.close(loading1);
			$("#submit").show();
			layer.msg("请选择日期");
			return;
		}
		if(scene_name ==""){
			console.log(22)
			layer.close(loading1);
			$("#submit").show();
			layer.msg("请选择设备");
			return;
		}
		if(check_type ==""){
			console.log(11)
			layer.close(loading1);
			$("#submit").show();
			layer.msg("请选择类型");
			return;
		}
		
		var jsonData='{"scene_id":"'+scene_id+'","scene_name":"'+scene_name+'","check_type":"'+check_type+'","time":"'+time+'","memo":"'+memo+'","loginName":"'+loginName+'"}';
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Check.asmx/SaveNewCheckInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
				"jsonData":jsonData
			},
			timeout: 30000,
			success: function(data) {
				if (data.status == 0) {
					layer.msg(data.result);
					return;
				}
				layer.close(loading1);
				layer.msg("保存成功");
					setTimeout(function(){
	        			$("body").fadeOut("fast",function(){
	        				window.location = "check_info.html";
	        			});
	        		},1314);

			},
			error: function() {
				layer.close(loading1);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				layer.close(loading1);
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}