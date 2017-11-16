var newTokenId= "";
var maintainid = GetQueryString("id");
var loginName;
var userName ;
var empId;
getLoginName();
	$(function() {
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
			url: url + "/handler/Maintain.asmx/GetMaintainInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"id":maintainid
			},
			timeout: 30000,
			success: function(data) {
				layer.close(loading);
				var json = eval("(" + data.result + ")");
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

	//将所选择的信息保存到数据库  状态变为等待审批
	function submit(){
		var solution =$("textarea").eq(0).val();
		if(solution ==""){
			layer.msg("请填写保养方案");
			return;
		}
		
		var jsonData='{"solution":"'+solution+'"}';
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Maintain.asmx/SaveModifyMaintainInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
				"jsonData":jsonData,
				"id":maintainid
			},
			timeout: 30000,
			success: function(data) {
				if (data.status == 0) {
					layer.msg(data.result);
					return;
				}
				layer.msg("保存成功");
					setTimeout(function(){
	        			$("body").fadeOut("fast",function(){
	        				window.location = "maintain_info.html";
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
	
	//验证数字
	 function   validate(str){
	// 	console.log(str);
	   	var reg = new RegExp("^[0-9]{1,2}$");
	    if(!reg.test(str)){
	//      layer.msg("请输入1-99之间的数!");
	        return false;
	       }
	    return true;
	}
