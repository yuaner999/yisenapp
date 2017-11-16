//请求的URL
var system_name = "安卓";
//var url = "http://61.161.246.70:86";
//var url = "http://app.ysenhb.com:86";
//var url = "http://localhost:62390";
var url = "http://192.168.0.166:8083";
if(localStorage.getItem("url") != null) {
	url = localStorage.getItem("url");
} else {
	localStorage.setItem("url", url);
}

//===============================验证表单===============================//

//验证手机号码
function _phone(phoneum) {
	var phoneRegex = /^(((13|15|18)[0-9])|14[57]|17[0134678])\d{8}$/;
	if(!phoneRegex.test(phoneum)) {
		return false;
	}
	return true;
}

//验证邮箱
function _email(email) {
	var result = email.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
	if(result == null) {
		return false;
	}
	return true;
}

//验证验证身份证
function isCardNo(card) {
	// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
	var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	if(reg.test(card) === false) {
		return false;
	} else {
		return true;
	}
}

//获取URL参数
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}

/*
 *	只能输入数字
 *	onkeyup="value=value.replace(/[^\d]/g,'')"
 * 
 * 
 * 
 * 
 * 
 * */

//图片加载
$().ready(function() {
	$("img.load").load(function() {
		$(this).css("background", "transparent");
	});
	setTimeout(function() {
		$("img.load").css("background", "url()")
	}, 50);
	$("img.load").error(function() {
		$(this).attr("src", "images/noload.png")
	});
	$("body").fadeIn(100);
});

function insertSceneId(sceneId) {
	db.transaction(function(tx) {
		//查询现场ID
		tx.executeSql("select * from scene where id=?", ['sId'], function(tx, data) {
			//查询成功，将现场ID赋值
			if(data.rows.length == 1) { //查询成功，有现场ID
				if(data.rows.item(0)["sceneId"] != sceneId) {
					tx.executeSql("insert into scene(id,sceneId) VALUES(?,?)", ["sId", sceneId], function(tx, data) {
						//	        			layer.msg("插入成功");
					}, function() {
						//		        		layer.msg("写入现场信息失败");
					});
				}
			} else {
				tx.executeSql("insert into scene(id,sceneId) VALUES(?,?)", ["sId", sceneId], function(tx, data) {
					//	        		layer.msg("插入成功");
				}, function() {
					layer.msg("写入现场信息失败");
				});
			}
		}, function() {
			tx.executeSql("CREATE TABLE scene (id TEXT UNIQUE, sceneId TEXT)", [], function(tx, data) {
				tx.executeSql("insert into scene(id,sceneId) VALUES(?,?)", ["sId", sceneId], function(tx, data) {
					//	        		layer.msg("插入成功");
				}, function() {
					layer.msg("写入现场信息失败");
				});
			});
		});
	});
}

function getSceneId() {
	db.transaction(function(tx) {
		//查询现场ID
		tx.executeSql("select * from scene where id=?", ['sId'], function(tx, data) {
			//查询成功，将现场ID赋值
			if(data.rows.length == 1) { //查询成功，有现场ID
				sceneId = data.rows.item(0)["sceneId"]; //现场ID
				//				layer.msg(sceneId);
			} else {
				layer.msg("没有现场信息");
			}
		}, function() {
			layer.msg("查询现场失败");
		});
	});
}

function getLoginName() {
	db.transaction(function(tx) {
		//查询现场ID
		tx.executeSql("select * from user where id=?", ['localUserId'], function(tx, data) {
			//查询成功，将现场ID赋值
			if(data.rows.length == 1) { //查询成功，有现场ID
				loginName = data.rows.item(0)["loginName"]; //现场ID
				//				layer.msg(loginName);
				//				alert(loginName);
			} else {
				layer.msg("没有用户名信息");
			}
		}, function() {
			layer.msg("查询用户名失败");
		});
	});
}

function Exit() {

	layer.confirm('你确定要退出吗?', {
		icon: 3,
		title: '提示'
	}, function(index) {

		db.transaction(function(tx) {

			tx.executeSql("drop table if exists token", [], function(tx, data) {

			});
			tx.executeSql("drop table if exists scene", [], function(tx, data) {

			});
			tx.executeSql("drop table if exists controlManage", [], function(tx, data) {

			});
			tx.executeSql("drop table if exists user", [], function(tx, data) {
				window.location.href = "Login.html";
			});
		});
		layer.close(index);
	});
}

function changeNetWork1() {
	//外网的
	//		url = "http://61.161.246.70:86";
	//	url = "http://app.ysenhb.com:86";
	//	url = "http://localhost:62390";
	url = "http://192.168.0.166:8083";
	localStorage.setItem("url", url);
	if(system_name == "安卓") {
		var update = $.ajax({
			url: url + "/handler/AutoUpdate.asmx/Update?jsoncallback?",
			type: "post",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"netType": "0",
			},
			timeout: 30000,
			success: function(data) {
				if(data.status > version) {
					alert("已发布新版本请下载安装包升级");
					var urll = data.result;
					document.addEventListener("plusready", function() {
						plus.runtime.openURL(urll);
					})
					return;
				}
			},
			error: function() {}
		});
	}
}

function changeNetWork2() {
	//内网的
	//		url = "http://192.168.1.234:86";
	//	url = "http://61.161.246.70:86";
	//	url = "http://localhost:62390";
	url = "http://192.168.0.166:8083";
	localStorage.setItem("url", url);
	if(system_name == "安卓") {
		var update = $.ajax({
			url: url + "/handler/AutoUpdate.asmx/Update?jsoncallback?",
			type: "post",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"netType": "1",
			},
			timeout: 30000,
			success: function(data) {
				if(data.status > version) {
					alert("已发布新版本请下载安装包升级");
					var urll = data.result;
					document.addEventListener("plusready", function() {
						plus.runtime.openURL(urll);
					})
					return;
				}
			},
			error: function() {}
		});
	}
}

function dateformat(time, formateStr) { //author: meizz
	var date;
	if(!formateStr) formateStr = "yyyy-MM-dd";
	if(time) date = new Date(time);
	else date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var h = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	formateStr = formateStr.replace("yyyy", "" + year);
	formateStr = formateStr.replace("MM", "" + month > 9 ? month : "0" + month);
	formateStr = formateStr.replace("dd", "" + day > 9 ? day : "0" + day);
	formateStr = formateStr.replace("HH", "" + h > 9 ? h : "0" + h);
	formateStr = formateStr.replace("mm", "" + min > 9 ? min : "0" + min);
	formateStr = formateStr.replace("ss", "" + sec > 9 ? sec : "0" + sec);
	return formateStr;
}

function dateformatByMonthPrior(time, formateStr) { //author: meizz
	var date;
	if(!formateStr) formateStr = "yyyy-MM-dd";
	if(time) date = new Date(time);
	else date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();
	var h = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	formateStr = formateStr.replace("yyyy", "" + year);
	formateStr = formateStr.replace("MM", "" + month > 9 ? month : "0" + month);
	formateStr = formateStr.replace("dd", "" + day > 9 ? day : "0" + day);
	formateStr = formateStr.replace("HH", "" + h > 9 ? h : "0" + h);
	formateStr = formateStr.replace("mm", "" + min > 9 ? min : "0" + min);
	formateStr = formateStr.replace("ss", "" + sec > 9 ? sec : "0" + sec);
	return formateStr;
}

//关闭按键输入法
document.onkeyup = function(e) { //按键信息对象以函数参数的形式传递进来了，就是那个e  
	var code = e.charCode || e.keyCode; //取出按键信息中的按键代码(大部分浏览器通过keyCode属性获取按键代码，但少部分浏览器使用的却是charCode)  
	if(code == 13) {
		//此处编写用户敲回车后的代码  
		document.activeElement.blur()
	}
}