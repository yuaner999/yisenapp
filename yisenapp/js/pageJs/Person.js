//用户登录名
var loginName = null;
var sceneId = null;
//加载层
var load = null;
//先写为admin测试用
$(function(){
	getLoginName();
	if(loginName==null||loginName==""){
		layer.msg("无用户名");
		return;
	}
	//加载层
	load = layer.load(1, {
		shade: [0.3,'#000'] //0.1透明度的白色背景
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getPersonCallback(tokenId);//回调函数，获取用户信息
			});
		}else{//获取TokenId成功
			getPersonCallback(tokenId);//回调函数，获取用户信息
		}
	});
});
function upload(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				photoupload(tokenId);//回调函数，获取用户信息
			});
		}else{//获取TokenId成功
			photoupload(tokenId);//回调函数，获取用户信息
		}
	});
}
//获取用户信息的回调函数
function getPersonCallback(tokenId){
	if(tokenId == "close"){//回调过程中出错
		layer.close(load);//关闭加载层
		return;
	}
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Person.asmx/GetPersonInfor?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
			"loginName":loginName
        },
        timeout:30000,
        success: function (data) {
        	layer.close(load);//关闭加载层
            if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");
            	var str = 'images/'+json[0].emp_photo+'';
            	$(".info>li>span").eq(0).text(json[0].emp_name);
            	$(".info>a>li>span").eq(0).text(json[0].emp_email);
            	$(".info>a>li>span").eq(1).text(json[0].emp_phone);
            	$(".info>li>span").eq(1).text(json[0].scene_name);
            	$(".info>a>li>span").eq(2).text(json[0].emp_post);
            	$(".photo img").attr("src",str);
            }else{
            	layer.msg(data.result);
            }
        },
        error:function(data){
        	layer.close(load);//关闭加载层
        	layer.msg("获取用户信息失败");
        },
        complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
        	layer.close(load);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
            }
        }
    });
}
function photoupload(tokenId){
	var str = $("#file").val();
	if ($.trim(str) == "") {  
            layer.msg("请选择文件"); 
            return;
        }else{
        	 var postfix = str.substring(str.lastIndexOf(".") + 1).toUpperCase();  
            if (postfix == "JPG" || postfix == "JPEG" || postfix == "PNG" || postfix == "GIF" || postfix == "BMP"){
            	$.ajaxFileUpload({
            		url: url+"/handler/Person.asmx/PhotoUpload?jsoncallback?",
            		secureuri: false, 
            		fileElementId:'file', 
            		data:{      					
							"tokenId":tokenId
    					},
            		dataType: "jsonp",
        			jsonp: 'jsoncallback',
        			success: function (data) {
        				layer.msg(data.result);
        			}
            	})
            }else{
            	layer.msg("文件格式错误")
            	return;
            }
        }
}
