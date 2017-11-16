//设定 和 推迟 到达的时间
var type = GetQueryString("type");//0(设定)1(推迟)  保养 2(设定) 3(推迟) 报修
var url1 = null;//返回的url
var id = GetQueryString("id");//获得其id
//var id2 =  GetQueryString("id2");//获得其部件的id
var url2 = null;//ajax保存
$(function(){
	if(type=='0'){//设定保养的预期完成时间
		url1= "maintain_info.html";
		url2 = "/handler/Maintain.asmx/DealStartTime?jsoncallback?";
		$(".top a").attr("href",url1);
		
	}else if(type=='1'){//推迟保养的到达时间1
		$(".top a").html("推迟完成的时间");
		url1= "maintain_info.html";
		url2 = "/handler/Maintain.asmx/DealExpectFinishTime?jsoncallback?";
		$(".top a").attr("href",url1);
		
	}else if(type=='2'){//设定报修的预期完成时间
		url1= "repair_info.html";
		url2 = "/handler/Repair.asmx/DealStartTime?jsoncallback?";
		$(".top a").attr("href",url1);
		
	}else if(type=='3'){//推迟报修的预期完成时间
		$(".top span").html("推迟完成的时间");
		url1= "repair_info.html";
		url2 = "/handler/Repair.asmx/DealExpectFinishTime?jsoncallback?";
		$(".top a").attr("href",url1);		
	}
//	else if(type=='4'){//维修完成
//		$(".top span").html("维修完成");
//		url1= "repair_info.html";
//		url2 = "/handler/Repair.asmx/DealFinishTime?jsoncallback?";
//		$(".top a").attr("href",url1);		
//	}
	
})

function orderTime(){
	var time1 =  $("#startDate").text();
//	console.log(time1);
	var time = time1;
	 time =  time.replace(/分/g,":00");
	console.log(time);
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				saveOrderTime(tokenId,time);
			});
		}else{//获取TokenId成功
			saveOrderTime(tokenId,time); 
		} 
	});	
}
//保存预约时间
function saveOrderTime(tokenId,time){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ajax = $.ajax({
        type: "post",
        url: url+url2,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
        	"id":id,
			"time":time,
			"tokenId":tokenId,
        },
        timeout:30000,
   		success: function (data) {
   			console.log(url2);
 			layer.close(loading);
   			data.result =  data.result.replace(/{/g,"");
   			data.result =  data.result.replace(/}/g,"");
   			layer.msg(data.result);
			setTimeout(function(){
	        			$("body").fadeOut("fast",function(){
	        				window.location = url1;
	        			});
	        		},1314);
   		},
   		error: function (data) {
	 		layer.close(loading);
   			data.result =  data.result.replace(/{/g,"");
   			data.result =  data.result.replace(/}/g,"");
   			layer.alert(data.result);
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
