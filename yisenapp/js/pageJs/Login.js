//打开本地数据库
var db = openDatabase('YSenApp', '1.0', 'YSenApp Database', 1024 * 1024 * 20); //如果数据库存在 则打开,不存在的则创建 然后在打开
var load = null;
var version = 28; //本地APP版本号
var system_name = "安卓";
var datenow = new Date().toLocaleDateString();

//外网 0   内网1 
var netType = 0;
if(url == "http://192.168.1.234:86") {
	netType = 1;
}
//版本升级
//if(system_name == "安卓") {
//	var update = $.ajax({
//		url: url + "/handler/AutoUpdate.asmx/Update?jsoncallback?",
//		type: "post",
//		dataType: "jsonp",
//		jsonp: 'jsoncallback',
//		data: {
//			"netType": netType,
//		},
//		timeout: 30000,
//		success: function(data) {
//			if(data.status > version) {
//				alert("版本过低请升级");
//				var urll = data.result;
//				document.addEventListener("plusready", function() {
//					plus.runtime.openURL(urll);
//				})
//				return;
//			}
//		},
//		error: function() {}
//	});
//}

//自动登录
//db.transaction(function(tx){
//	//查询本地用户
//	tx.executeSql("select * from user where id=?",["localUserId"],function(tx,data){
//		if(data.rows.length==1){//如果有用户
//			var loginName = data.rows.item(0)["loginName"];//用户名
//			var password = data.rows.item(0)["password"];//密码
//			var loginTime = data.rows.item(0)["time"];//登录时间
//			//当自动登录的时间超过90 天的时候必须再登录一次
//			var oldTime = new Date(loginTime);
//			var nowTime = new Date(datenow);
////			console.log(nowTime.getTime()-oldTime.getTime());
//			var  date3 = nowTime.getTime()-oldTime.getTime();
//			var days = Math.floor(date3/(24*3600*1000));
////			console.log(days);
//			if(days >=90){
//				layer.msg("请登录");
//				return;
//			}
//			checkLogin(loginName,password);
////			Login(loginName,password,false);
//		}
//	},function(){
//		
//	});
//});

$(function() {
	if(url == "http://192.168.1.234:86") {
//		$("#nei").click();
		$("#a0").click();
		$("#wai").attr("checked",false);
		$("#nei").attr("checked",'checked');
	} else {
//		$("#wai").click();
		$("#a1").click();
		$("#nei").attr("checked",false);
		$("#wai").attr("checked",'checked');
	}
	//点击登录
	$("#Login").click(function() {
		var userName = $.trim($("#UserName").val()); //用户名
		var password = $("#Password").val(); //密码
		if(userName == "") { //用户名非空验证
			layer.msg("请输入用户名");
			return;
		}
		if(password == "") { //密码非空验证
			layer.msg("请输入密码");
			return;
		}
		//加载层
		load = layer.load(1, {
			shade: [0.3, '#000'] //0.1透明度的白色背景
		});

		//登录
		Login(userName, $.md5(password).toUpperCase(), true);
	});
});

//发送Ajax异步请求，判断用户是否正确
function Login(userName, password, isInsert) {
	//发送Ajax请求，验证用户是否正确
	var loginAjax = $.ajax({
		type: "post",
		url: url + "/handler/Login.asmx/UserLogin?jsoncallback?",
		dataType: "jsonp",
		//      async:false,
		jsonp: 'jsoncallback',
		data: {
			"loginName": userName,
			"password": password

		},
		timeout: 30000,
		success: function(data) {

			if(data.status == 0) {
				layer.close(load);
				layer.msg(data.result);
				//      		$("#UserName").val("");
				//      		$("#Password").val("");
				//				return;
				//      		setTimeout(function(){
				//	        				window.location.reload(); 
				//	        		},999);
			} else {
				//登录成功
				layer.msg("登录成功");
				layer.close(load); //关闭加载层
				if(isInsert) {
					//				不自动登录时保存	clientid
					saveClientid(userName);
					insert(userName, password);
				} else {
					//现场用户的自动登录
					setTimeout(function() {
						$("body").fadeOut("fast", function() {
							window.location = "SelectScene.html";
						});
					}, 1500);
				}
			}
		},
		error: function(data) {
			layer.close(load); //关闭加载层
			layer.msg("登录失败");
		},
		complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
			layer.close(load); //关闭加载层
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				loginAjax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//将用户信息写入本地数据库
function insert(loginName, password) {

	db.transaction(function(tx) {
		//删除用户表
		tx.executeSql("drop table if exists user", [], function(tx, data) {
			//创建用户表，如果有则创建失败
			tx.executeSql("CREATE TABLE user (id TEXT UNIQUE, loginName TEXT, password TEXT,time TEXT)", [], function(tx, data) {
				//将用户信息写入User表
				tx.executeSql("insert into user(id,loginName,password,time) VALUES(?,?,?,?)", ["localUserId", loginName, password, datenow], function(tx, data) {
					layer.msg("登录成功");
					//插入成功的回调函数
					setTimeout(function() {
						$("body").fadeOut("fast", function() {
							//window.location = "Person.html?loginName="+loginName;
							window.location = "SelectScene.html";
						});
					}, 1500);
				}, function() {
					//插入失败的回调函数
					layer.msg("插入失败");
				});
			});
		});
	});
}

function insert2(loginName, password, id) {
	db.transaction(function(tx) {
		//删除用户表
		tx.executeSql("drop table if exists user", [], function(tx, data) {
			//创建用户表，如果有则创建失败
			tx.executeSql("CREATE TABLE user (id TEXT UNIQUE, loginName TEXT, password TEXT,time datetime)", [], function(tx, data) {
				//将用户信息写入User表
				tx.executeSql("insert into user(id,loginName,password,time) VALUES(?,?,?,?)", ["localUserId", loginName, password, datenow], function(tx, data) {
					//	        			console.log(data);
					layer.msg("登录成功");
					//插入成功的回调函数
					setTimeout(function() {
						$("body").fadeOut("fast", function() {
							//window.location = "Person.html?loginName="+loginName;
							window.location = "homepage.html?sid=" + id;
						});
					}, 1500);
				}, function() {
					//插入失败的回调函数
					layer.msg("插入失败");
				});
			});
		});
	});
}

function saveClientid(userName) {
	var clientid = $("#test").html();
	//		alert(clientid);
	if(clientid == "clientid") {
		return;
	}
	//        	将clientid存到数据库
	$.ajax({
		type: "post",
		url: url + "/handler/SaveClientid.asmx/SaveClientidInfo?jsoncallback?",
		dataType: "jsonp",
		//      		async:false,
		jsonp: 'jsoncallback',
		data: {
			"loginName": userName,
			"clientid": clientid,
		},
		success: function(data) {
			//      			  layer.alert(clientid);
		}
	});
}

function loginAuoto(clientid) {
	db.transaction(function(tx) {
		//查询本地用户
		tx.executeSql("select * from user where id=?", ["localUserId"], function(tx, data) {
			if(data.rows.length == 1) { //如果有用户
				var loginName = data.rows.item(0)["loginName"]; //用户名
				var password = data.rows.item(0)["password"]; //密码
				var loginTime = data.rows.item(0)["time"]; //登录时间
				//当自动登录的时间超过90 天的时候必须再登录一次
				var oldTime = new Date(loginTime);
				var nowTime = new Date(datenow);
				//			console.log(nowTime.getTime()-oldTime.getTime());
				var date3 = nowTime.getTime() - oldTime.getTime();
				var days = Math.floor(date3 / (24 * 3600 * 1000));
				//			console.log(days);
				if(days >= 90) {
					layer.msg("请登录");
					return;
				}
				checkLogin(loginName, password, clientid);
				//			Login(loginName,password,false);
			}
		}, function() {

		});
	});

}

function checkLogin(loginName, password, clientid) {
	$.ajax({
		type: "post",
		url: url + "/handler/SaveClientid.asmx/checkLogin?jsoncallback?",
		dataType: "jsonp",
		//      		async:false,
		jsonp: 'jsoncallback',
		data: {
			"loginName": loginName,
		},
		success: function(data) {
			if(data.result != 0) {
				var result = eval("(" + data.result + ")");
				if(result.length > 0) {
					var cid = result[0].user_clientid;
					//      				alert(cid);
					//      				alert(clientid);
					if(clientid == cid) {
						Login(loginName, password, false);
					}
				}
			}
			//      			  layer.alert(clientid);
		}
	});
}

//填写邮箱发送验证码
function forgetPwdSendEmail() {
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
		url: url + "/handler/Login.asmx/forgetPwdSendEmail?jsoncallback?",
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
function forgetPwdModify() {
	var email = $('#email').val();
	var code = $('#code').val();
	var pwd = $('#pwd').val();
	var newPwd = $('#newPwd').val();
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
		url: url + "/handler/Login.asmx/forgetPwdModify?jsoncallback?",
		dataType: "jsonp",
		async: false,
		jsonp: 'jsoncallback',
		data: {
			"email": email,
			"code": code,
			"newPwd": $.md5(newPwd).toUpperCase()
		},
		success: function(data) {
			if(data.status == 1) {
				layer.msg(data.result);
				setTimeout(function() {
					window.location.href = 'Login.html';
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