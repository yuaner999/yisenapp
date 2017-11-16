//获得员工的id
var username =getLoginName();
//加载列表的信息
$(function(){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Check.asmx/GetCheckInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"username":username
        },
        timeout:30000,
 		success: function (data) {
	 			layer.close(loading);
 			var json = eval("("+data.result+")");
 			if(json.length != 1){
 				layer.alert("没有信息");
 				return;
 			}
 			//写列表的信息 红色代表正要完成 绿色代表已完成  灰色代表没完成
 			var $div = $("#info"); 
 			$div.html("");
 			var str = "";
 			for(var i=0;i<json.length;i++){
 				if(json[i].check_status=='0'){//已完成的
 					
 				}else if(json[i].check_status=='1'){//正要完成的
 					
 				}else{//没完成
 					
 				}
 				str+="";
 				
 			}
 			 str = str.replace(/null/gi, "");
             $div.append(str);
 		},
 		error: function (data) {
	 		layer.close(loading);
 			layer.alert(error);
 		},
 		complete:function(XMLHttpRequest,status){
 			layer.close(loading);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
 			} 
	 	}
	});
})
