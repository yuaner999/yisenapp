//设定 和 推迟 到达的时间
var type = GetQueryString("type");//0(设定)1(推迟)  保养 2(设定) 3(推迟) 报修
var url1 = null;//返回的url
var id = GetQueryString("id");//获得其id
var url2 = null;//ajax保存
$(function(){
	if(type=='1' || type=='3'){
		$(".top span").html("推迟到达时间");
	}
	if(type=='0' || type=='1'){//设定||推迟保养的到达时间
		url1= "maintain_info.html";
		url2 = "/handler/Maintain.asmx/DealExpectTime?jsoncallback?";
		$(".top a").attr("href",url1);
		
	}else if(type=='2' || type=='3'){//设定||推迟报修的到达时间
		url1= "repair_info.html";
		url2 = "/handler/Repair.asmx/DealExpectTime?jsoncallback?";
		$(".top a").attr("href",url1);
	}
})

function orderTime(){
	var time1 =  $("#startDate").html();
	var time = time1;
	 time =  time.replace(/分/g,":00");
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
			"tokenId":tokenId
        },
        timeout:30000,
   		success: function (data) {
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
