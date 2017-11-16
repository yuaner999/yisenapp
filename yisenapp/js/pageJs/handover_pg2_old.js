//巡检信息的id
var handoverId = GetQueryString("id");
//var handoverId = '3c430647-1336-4c33-9c4e-9ffcb7b19f03';

$(function(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getTitleInfo(tokenId);
			});
		}else{//获取TokenId成功
			//加载标题的信息
			getTitleInfo(tokenId);
		} 
	});
});

function getTitleInfo(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/GetTitleInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":handoverId
        },
        timeout:30000,
   		success: function (data) {
 			layer.close(loading);
   			var title = eval("("+data.result+")");
   			if(title.length != 1){
   				layer.alert("加载信息错误");
   				return;
   			}
   			$(".people span").eq(1).html(title[0].handover_man_before);
   			$(".people span").eq(3).html(title[0].scene_name);
   			
   		},
   		error: function (data) {
 			layer.close(loading);
   			layer.alert("加载标题信息失败");
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
