var loginName = null;
var  newtokenId ;
	getLoginName();
	//判断是否有未读的信息
	$(function(){			
		getTokenIdLocal(function(tokenId){
			if(tokenId=="null"){//Token过期或者首次没有Token
				getTokenIdServer(function(tokenId){//重新获取TokenId
					newtokenId=tokenId;
					//获得消息数
					checkMessage();
					//获得报警信息数
					getReportNum();
					setInterval(getNum,60*1000);
				});
			}else{//获取TokenId成功
				newtokenId=tokenId;
				//获得消息数
				checkMessage();
				//获得报警信息数
				getReportNum();
				//30秒执行一次
				setInterval(getNum,60*1000);
	 				
			} 
		});
	
	  }); 
	  function getNum(){
			//获得消息数
			checkMessage();
			//获得报警信息数
			getReportNum();
	  }
	  function checkMessage(){
	  	var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Messages.asmx/checkMessage?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newtokenId,
				"uesrName": loginName
			},
			timeout: 30000,
			success: function(data) {
				if(data.status==0){
					layer.msg(data.result);
				}else{
					var result =eval("("+data.result+")");
					//如果没有未读信息就不显示
	//					result.length=3;
					if(result.length>99){
						$("#message").show(); 
						$("#message").html("--"); 
					}
					else if(result.length>0){
	//					$("#mesage").show();
						$("#message").show(); 
						$("#message").html(result.length); 
	//					$("#workControl").html(""); 
					}
				}
				
			},
			error: function(data) {
				layer.alert(data.result);
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
	  })
	  }
	function getReportNum(){
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Messages.asmx/getReportNum?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newtokenId,
				"loginName": loginName,
			},
			timeout: 30000,
			success: function(data) {
				if(data.status==0){
					layer.msg(data.result);
				}else{
					var result =eval("("+data.result+")");
					//如果没有未读信息就不显示
	//					result.length=120;
					if(result[0].num>0){
						$("#repairInfo").show();
						$("#repairInfo").html(result[0].num); 
						
					}
				}
			},
			error: function(data) {
				layer.alert(data.result);
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
	  })
	}
