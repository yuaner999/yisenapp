var mid = GetQueryString("mid");
$(function(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetMessages(tokenId);//回调函数，获取用户信息
			});
		}else{//获取TokenId成功
			GetMessages(tokenId);//回调函数，获取用户信息
		}
	});
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				DealMsgStatus(tokenId);//回调函数，获取用户信息
			});
		}else{//获取TokenId成功
			DealMsgStatus(tokenId);//回调函数，获取用户信息
		}
	});
})

function GetMessages(tokenId){
 	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
		type:"post",
		url: url+"/handler/Messages.asmx/GetMessagesDetail?jsoncallback?",
		dataType: "jsonp",
        jsonp: 'jsoncallback',
		data:{
	        	"tokenId":tokenId,
	        	"mid":mid
	        },
	        timeout:30000,
	 		success: function (data) {
	 			layer.close(loading);
	 			if(data.status==1){
        			var json = eval("("+data.result+")");
        			var str = "";
        			for(var i=0;i<json.length;i++){
        				var title = json[i].message_title.split("|");
        				str+='<div><span>消息标题:</span><span>'+title[0]+'</span></div>'+
        				'<div><span>消息时间:</span><span>'+json[i].message_time+'</span></div>'+
        				'<div><span>'+json[i].message_content+'</span></div>';
        			}
        			$("#detail").html(str);
	 			}
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.msg("加载信息失败");
	 		},
	 		complete:function(XMLHttpRequest,status){
	 		layer.close(loading);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
 			} 
	 	}
	});
}
function DealMsgStatus(tokenId,id){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
 	var ajax = $.ajax({
	        type: "post",
	        url: url+"/handler/Messages.asmx/DealMsgStatus?jsoncallback?",
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data:{
	        	"tokenId":tokenId, 
	        	"id":mid
	        },
	        timeout:30000,
	 		success: function (data) {
	 			layer.close(loading);
	 			if(data.status==1){
	 				layer.msg(data.result);
	 			}
	 			
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.msg("加载信息失败");
	 		},
	 		complete:function(XMLHttpRequest,status){
	 		layer.close(loading);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
 			} 
	 	}
	    	});
}