var loginName = null;
$(function() {
		//绑定回车键
		$("input[type=text]").keypress(function() {
			if(event.keyCode == 13 || event.which == 13) {
				return false;
			}
		});
		$(".clear").click(function() {
			$(".clear").prev().val("");
		})

		getLoginName();
		$("#changeMail").click(function() {
			var mail = $("#email").val();
			var flag = _email(mail);
			if(flag) {
				getTokenIdLocal(function(tokenId) {
					if(tokenId == "null") { //Token过期或者首次没有Token
						getTokenIdServer(function(tokenId) { //重新获取TokenId
							ModEmail(tokenId, mail); //回调函数，获取全部设备
						});
					} else { //获取TokenId成功
						ModEmail(tokenId, mail); //回调函数，获取全部设备
					}
				});
			} else {
				layer.msg("邮箱格式不正确");
				$("#email").val("");
			}
		})
		$("#changeEmp").click(function() {
			var emp = $("#emp").val();
			getTokenIdLocal(function(tokenId) {
				if(tokenId == "null") { //Token过期或者首次没有Token
					getTokenIdServer(function(tokenId) { //重新获取TokenId
						ModEmp(tokenId, emp); //回调函数，获取全部设备
					});
				} else { //获取TokenId成功
					ModEmp(tokenId, emp); //回调函数，获取全部设备
				}
			})
		});
		$("#changePhone").click(function() {
			var phone = $("#phone").val();
			var flag = _phone(phone);
			if(flag) {
				getTokenIdLocal(function(tokenId) {
					if(tokenId == "null") { //Token过期或者首次没有Token
						getTokenIdServer(function(tokenId) { //重新获取TokenId
							ModPhone(tokenId, phone); //回调函数，获取全部设备
						});
					} else { //获取TokenId成功
						ModPhone(tokenId, phone); //回调函数，获取全部设备
					}
				});
			} else {
				layer.msg("手机号码格式不正确");
				$("#phone").val("");
			}

		});
	})
	//修改邮箱
function ModEmail(tokenId, mail) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Person.asmx/ModEmail?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"loginName": loginName,
			"email": mail
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result);
			setTimeout('window.location.href="User.html"', 1000);
		},
		error: function(data) {
			layer.close(loading);
			layer.msg(data.result);
		}
	})
}
//修改职位
function ModEmp(tokenId, emp) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Person.asmx/ModEmp?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"loginName": loginName,
			"emp": emp
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result);
			setTimeout('window.location.href="User.html"', 1314);
		},
		error: function(data) {
			layer.close(loading);
			layer.msg(data.result);
		}
	})
}

//修改手机号
function ModPhone(tokenId, phone) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Person.asmx/ModPhoneNum?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"loginName": loginName,
			"phone": phone
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result);
			setTimeout('window.location.href="User.html"', 1000);
		},
		error: function(data) {
			layer.close(loading);
			layer.msg(data.result);
		}
	})
}