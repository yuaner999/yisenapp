
//填写邮箱发送验证码
function forgetControlPwdSendEmail() {
	var email = $('#email').val();
	if(!_Email(email)) {
		layer.msg("邮箱格式错误");
		return false;
	}
	var t = 61;
	var timer;
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	$.ajax({
		type: "post",
		url: url + "/handler/Login.asmx/forgetControlPwdSendEmail?jsoncallback?",
		dataType: "jsonp",
		async: false,
		jsonp: 'jsoncallback',
		data: {
			"email": email,
		},
		success: function(data) {
			layer.close(loading); //关闭加载层
			if(data.status == 0) {
				layer.msg(data.result);
			} else {
				layer.msg(data.result);
				$("#sendCode").attr("disabled", "disabled");
				clearInterval(timer);
				timer = setInterval(loop, 1000);
			}
		}
	});

	//60秒之后从新发送
	function loop() {
		ele = $(".formRow .abs").eq(1 - 1);
		t--;
		$(ele).text("重新发送(" + t + "s)");
		if(t <= 0) {
			clearInterval(timer);
			$(ele).removeAttr("disabled");
			$(ele).text("发送验证码");
		}
	}

}

//修改密码
function forgetControlPwdModify() {
	var email = $('#email').val();
	var code = $('#code').val();
	var pwd = $('#pwd').val();
	var newPwd = $('#newPwd').val();
	if(email=='' || email==null) {
		layer.msg("邮箱不能为空");
		return false;
	}
	if(!_Email(email)) {
		layer.msg("邮箱格式错误");
		return false;
	}
	if(code == '' || code == null) {
		layer.msg("验证码不能为空");
		return false;
	}
	if(pwd == '' || pwd == null) {
		layer.msg("密码不能为空");
		return false;
	}
	if(newPwd == '' || newPwd == null) {
		layer.msg("密码不能为空");
		return false;
	}
	if(pwd != newPwd) {
		layer.msg("两次输入密码不一致");
		return false;
	}

	$.ajax({
		type: "post",
		url: url + "/handler/Login.asmx/forgetControlPwdModify?jsoncallback?",
		dataType: "jsonp",
		async: false,
		jsonp: 'jsoncallback',
		data: {
			"email": email,
			"code": code,
			"newPwd": $.md5(newPwd).toUpperCase()
		},
		success: function(data) {
			console.log(data)
			if(data.status == 1) {
				layer.msg(data.result);
				setTimeout(function() {
					window.location.href = 'User.html';
				}, 1000)
			}
			if(data.status == 0) {
				layer.msg(data.result);
			}
			//		
		}
	});

}

//验证是否为邮箱
function _Email(num) {
	if(!(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(num))) {
		return false;
	}
	return true;
}