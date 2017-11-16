//mui退出程序的方法没有重写
mui.init();
document.addEventListener("plusready", function() {
	getPushInfo();
	message = document.getElementById("message");
	plus.push.addEventListener("click", function(msg) {
		//		    	 // 分析msg.payload处理业务逻辑 
		//    			  mui.alert( "You clicked: " + msg.content ); 
		// 判断是从本地创建还是离线推送的消息
		switch(msg.payload) {
			case "LocalMSG":
				outSet("点击本地创建消息启动：");
				break;
			default:
				outSet("点击离线推送消息启动：");
				break;
		}
		// 提示点击的内容
		plus.ui.alert(msg.content);
		// 处理其它数据
		logoutPushMsg(msg);
	}, false);
	// 监听在线消息事件---这里触发通知的监听
	plus.push.addEventListener("receive", function(msg) {
		//		    	alert(typeof msg.payload);//string
		//      让传过来的透传的内容为json格式
		var pushMessage = eval("(" + msg.payload + ")");;
		//对透传信息进行处理
		//		alert(pushMessage.type);
		if(pushMessage.type == "check") { //巡检
			window.location = "check_info.html";
			return;
		}
		if(pushMessage.type=="verification_info"){ //校验
    		window.location = "verification_info.html";
    		return;
    	}
		if(pushMessage.type == "handover") { //接班
			window.location = "handover_info.html";
			return;
		}
		if(pushMessage.type == "handover2") { //交班
			window.location = "handover2info.html";
			return;
		}
		if(pushMessage.type == "maintain") { //保养
			window.location = "handover.html";
			return;
		}
		if(pushMessage.type == "repair") { //报修
			window.location = "repair_info.html";
			return;
		}
		if(pushMessage.type=="task_info"){//任务
    		window.location="task_info.html";
    		return;
    	}
		if(pushMessage.type == "report") { //报警
			window.location = "report.html";
			return;
		}
		if(pushMessage.type == "message_info") { //报修
			window.location = "message_info.html";
			return;
		}
		//		        if ( msg.aps ) {  // Apple APNS message
		//		            outSet( "接收到在线APNS消息：" );
		//		        } else {
		//		            outSet( "接收到在线透传消息：" );
		//		        }
		//		        logoutPushMsg( msg );
	}, false);
}, false);

function getPushInfo() {
	var info = plus.push.getClientInfo();
	//			    outSet( "获取客户端推送标识信息：" );
	//			    outLine( "token: "+info.token );
	//			    outLine( "clientid: "+info.clientid );
	//			    outLine( "appid: "+info.appid );
	//			    outLine( "appkey: "+info.appkey );
	$("#test").html(info.clientid);
}
