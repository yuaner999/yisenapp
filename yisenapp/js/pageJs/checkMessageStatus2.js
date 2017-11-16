/*获得除了报警和消息的其他的状态*/
//loginName 已有
//判断是否有未读的信息
//用户登录名
var loginName = null;
var menu;
$(function() {
	getLoginName();
	getTokenIdLocal(function(tokenId) {
		if(tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				//获得其他状态的状态
				getStatusNum(tokenId);
				getRoleMenu(tokenId)
				setInterval(function() {
					getStatusNum(tokenId)
				}, 60 * 1000);
			});
		} else { //获取TokenId成功
			//获得其他状态的状态
			getStatusNum(tokenId);
			getRoleMenu(tokenId)
				//30秒执行一次
			setInterval(function() {
				getStatusNum(tokenId)
			}, 60 * 1000);

		}
	});

});

//获取权限接口
function getRoleMenu(tokenId) {
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
				menu = json[0].menuname.split(';')
			}
		}

	});
}

function getStatusNum() {
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/getStatusNum?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": newtokenId,
			"loginName": loginName
		},
		timeout: 30000,
		success: function(data) {
			var result = data.result.split("&");
			var checkNum = eval("(" + result[1] + ")");
			var handoverNum = eval("(" + result[2] + ")");
			var handoverNum2 = eval("(" + result[3] + ")");
			var repairNum = eval("(" + result[4] + ")");
			var maintainNum = eval("(" + result[5] + ")");
			var taskNum = eval("(" + result[6] + ")");
			var verificationNum = eval("(" + result[7] + ")");
			var warningNum = eval("(" + result[8] + ")");
			var workControl = 0;
			if(menu!=null){
				for(var i = 0; i < menu.length; i++) {
					if(menu[i] !== '') {
						switch(menu[i]) {
							case '保养':
								if(maintainNum!=null){
									workControl = workControl + parseInt(maintainNum[0].maintainNum)
								}
								break;
							case '巡检':
							if(checkNum!=null){
								workControl = workControl + parseInt(checkNum[0].checkNum)
							}
								break;
							case '交班':
							if(handoverNum2!=null){
								workControl = workControl + parseInt(handoverNum2[0].handoverNum2)
							}
								break;
							case '接班':
							if(handoverNum!=null){
								workControl = workControl + parseInt(handoverNum[0].handoverNum)
							}
								break;
							case '报修':
							if(repairNum!=null){
								workControl = workControl + parseInt(repairNum[0].repairNum)
							}
								break;
							case '校验':
							if(verificationNum!=null){
								workControl = workControl + parseInt(verificationNum[0].verificationNum)
							}
								break;
							case '检测':
								break;
							case '任务':
							if(taskNum!=null){
								workControl = workControl + parseInt(taskNum[0].taskNum)
							}
								break;
							case '报警':
							if(warningNum!=null){
								workControl = workControl + parseInt(warningNum[0].warningNum)
							}
								break;
						}
					}
				}
			}	
			if(workControl > 0) {
				$("#workControl").show();
				if(workControl > 99) {
					$("#workControl").html("--")
				} else {
					$("#workControl").html(workControl);
				}
			}
			if(checkNum[0].checkNum > 0) {
				$("#check").show();
				if(checkNum[0].checkNum > 99) {
					$("#check").html("99+")
				} else {
					$("#check").html(checkNum[0].checkNum);
				}

			}
			if(handoverNum[0].handoverNum > 0) {
				$("#handover1").show();
				if(handoverNum[0].handoverNum > 99) {
					$("#handover1").html("99+")
				} else {
					$("#handover1").html(handoverNum[0].handoverNum);
				}

			}
			if(handoverNum2[0].handoverNum2 > 0) {
				$("#handover2").show();
				if(handoverNum2[0].handoverNum2 > 99) {
					$("#handover2").html("99+")
				} else {
					$("#handover2").html(handoverNum2[0].handoverNum2);
				}
			}
			if(maintainNum[0].maintainNum > 0) {
				$("#maintain").show();
				if(maintainNum[0].maintainNum > 99) {
					$("#maintain").html("99+")
				} else {
					$("#maintain").html(maintainNum[0].maintainNum);
				}
			}
			if(repairNum[0].repairNum > 0) {
				$("#repair").show();
				if(repairNum[0].repairNum > 99) {
					$("#repair").html("99+")
				} else {
					$("#repair").html(repairNum[0].repairNum);
				}
			}
			if(taskNum[0].taskNum > 0) {
				$("#repair").show();
				if(taskNum[0].taskNum > 99) {
					$("#taskNum").html("99+")
				} else {
					$("#taskNum").html(taskNum[0].taskNum);
				}
			}
			if(verificationNum[0].verificationNum > 0) {
				$("#verificationNum").show();
				if(verificationNum[0].verificationNum > 99) {
					$("#verificationNum").html("99+")
				} else {
					$("#verificationNum").html(verificationNum[0].verificationNum);
				}
			}
			if(warningNum[0].warningNum > 0) {
				$("#warningNum").show();
				if(warningNum[0].warningNum > 99) {
					$("#warningNum").html("99+")
				} else {
					$("#warningNum").html(warningNum[0].warningNum);
				}
			}

		},
		error: function(data) {
			layer.alert(data.result);
		},
		complete: function(XMLHttpRequest, status) {
			if(status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	})
}