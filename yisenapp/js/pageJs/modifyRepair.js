var newTokenId= "";
var repairId = GetQueryString("id");
var loginName;
var userName ;
var empId;
var isWarning = 0;
getLoginName();
	$(function() {
		//获取TokenId，并获取用户信息
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
					getTokenIdServer(function(tokenId) { //重新获取TokenId
						newTokenId=tokenId;
						getUserName(tokenId);
						GetInfoById(tokenId);
					});
			} else { //获取TokenId成功
					newTokenId=tokenId;
					getUserName(tokenId);
					GetInfoById(tokenId);
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
	function GetInfoById(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/LoadRepairInfoById?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"id":repairId
			},
			timeout: 30000,
			success: function(data) {
				layer.close(loading);
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
				//给现场信息赋值
				var json = eval("(" + data.result + ")");
				var $reason = $("#reason");
				var $reasontext = json[0].reason;
				$reason.append($reasontext);
				var $solution = $("#solution");
				var $solutiontext = json[0].solution;
				$solution.append($solutiontext);
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
	
	//将所选择的信息保存到数据库  
	function submit(){
		var reason =$("textarea").eq(0).val();
		var solution =$("textarea").eq(1).val();
		if(reason ==""){
			layer.msg("请填写原因");
			return;
		}
		if(solution ==""){
			layer.msg("请填写解决方案");
			return;
		}
		
		var jsonData='{"reason":"'+reason+'","solution":"'+solution+'"}';
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/SaveModifyRepairInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
				"jsonData":jsonData,
				"repairid":repairId
			},
			timeout: 30000,
			success: function(data) {
				if (data.status == 0) {
					layer.msg(data.result);
					return;
				}
				layer.msg("修改成功");
					setTimeout(function(){
	        			$("body").fadeOut("fast",function(){
	        				window.location = "repair_info.html";
	        			});
	        		},1314);

			},
			error: function() {
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}