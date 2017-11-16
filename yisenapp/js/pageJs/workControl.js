//用户登录名
//var loginName = null;
//加载层
var load = null;
//先写为admin测试用
$(function() {
//	getLoginName();

	//	if(loginName == null || loginName == "") {
	//		layer.msg("无用户名");
	//		return;
	//	}
	load = layer.load(2, {
		shade: [0.2, '#000']
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				getroleMenu(tokenId); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			getroleMenu(tokenId); //回调函数，获取用户信息
		}
	});
});

//获取权限接口
function getroleMenu(tokenId) {
	$.ajax({
		type: "post",
		url: url + "/handler/Person.asmx/getRoleMenu?jsoncallback?",
		dataType: "jsonp",
		//      		async:false,
		jsonp: 'jsoncallback',
		data: {
			"loginName": loginName,
			"tokenId": tokenId
		},
		success: function(data) {
			if(data) {
				var json = eval("(" + data.result + ")");
				// 测试数据 json[0].menuname = '保养;巡检;交班;接班;报修;校验;检测;任务;报警';
				var menu = json[0].menuname.split(';')
				setRoleMenu(menu)
				layer.close(load); //关闭加载层
			}
		}

	});
}

//设置页面显示
function setRoleMenu(menu) {
	for(var i = 0; i < menu.length; i++) {
		if(menu[i] !== '') {
			switch(menu[i]) {
				case '保养':
					$('.appList a:eq(0)').show();
					break;
				case '巡检':
					$('.appList a:eq(1)').show();
					break;
				case '交班':
					$('.appList a:eq(2)').show();
					break;
				case '接班':
					$('.appList a:eq(3)').show();
					break;
				case '报修':
					$('.appList a:eq(4)').show();
					break;
				case '校验':
					$('.appList a:eq(5)').show();
					break;
				case '检测':
					$('.appList a:eq(6)').show();
					break;
				case '任务':
					$('.appList a:eq(7)').show();
					break;
				case '报警':
					$('.appList a:eq(8)').show();
					break;
				case '硝魔方':
					$('.appList a:eq(9)').show();
					break;
			}
		}

	}
}