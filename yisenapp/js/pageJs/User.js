//用户登录名
var loginName = null;
//加载层
var load = null;
//现场的id
var sceneId;

$(function(){
getLoginName();

getSceneId();
//	if(loginName==null||loginName==""){
//		layer.msg("无用户名");
//		return;
//	}

	//加载层
	load = layer.load(2,{shade: [0.2,'#000'] });
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
//	绑定退出按钮
	$("button.userExit").click(function  () {
		Exit();
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
	var serverurl=url;
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
            	var json =eval("("+data.result+")") ;
            	var str = 'images/'+json[0].emp_photo+'';
            	
            	var url = 'ModifyPwd.html?loginName='+json[0].user_login+'';
            	$("#emp_name").text(json[0].emp_name+"("+json[0].role_name+")");
            	$("#emp_email").text(json[0].emp_email);
            	$("#emp_phone").text(json[0].emp_phone);
            	$("#emp_post").text(json[0].emp_post);
            	if(json[0].emp_photo !==''){
            		$("#emp_photo").attr('src',serverurl+json[0].emp_photo)
            	}
            	
//          	$(".info a").eq(3).attr("href",url);
//          	$(".photo img").attr("src",str);
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
    var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetSceneName?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
			"id":sceneId
        },
        timeout:30000,
        success: function (data) {
        	layer.close(load);//关闭加载层
            if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");
         	$("#scene_name").text(json[0].scene_name);

            }else{
            	layer.msg(data.result);
            }
        },
        error:function(data){
        	
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
	var str = $("#btn_file").val();
	if ($.trim(str) == "") {  
            layer.msg("请选择文件"); 
            return;
        }else{
        	 var postfix = str.substring(str.lastIndexOf(".") + 1).toUpperCase();  
            if (postfix == "JPG" || postfix == "JPEG" || postfix == "PNG" || postfix == "GIF" || postfix == "BMP"){
            	load = layer.load(2,{shade: [0.2,'#000'] });
            	$.ajaxFileUpload({
            		url: url+"/handler/Person.asmx/PhotoUpload",
            		secureuri: false, 
            		fileElementId:'btn_file', 
            		data:{      					
							tokenId:tokenId,
							jsoncallback:"upload"
    					},
            		dataType: "JSON",
        			success: function (data) {
        				layer.close(load);//关闭加载层
        				getPersonCallback(tokenId);
        			},
        			error: function (data) {
        				layer.close(load);//关闭加载层
//      				layer.msg("文件上传失败");
        			}
            	})
            }else{
            	layer.msg("文件格式错误")
            	return;
            }
        }
	}
function CheckUpdate(){
	
	var version = 28;//本地APP版本号
	var system_name="安卓";
	var  datenow = new Date().toLocaleDateString(); 
	
	//外网 0   内网1 
	var netType = 0;
	if(url=="http://192.168.1.234:86"){
		netType=1;
	}
	//版本升级
	if(system_name=="安卓")
	{
		var update = $.ajax({
					url:url+"/handler/AutoUpdate.asmx/Update?jsoncallback?",
					type: "post",
					dataType: "jsonp",
				    jsonp: 'jsoncallback',
				    data:{ 
							"netType":netType,
					},		
				    timeout:30000,
					success:function(data){
						if(data.status>version){
							alert("发现新版本请升级");
							var urll=data.result; 
							document.addEventListener( "plusready", function(){
							plus.runtime.openURL(urll);
							})
							return; 
						}else
						{
							alert("未发现新版本");
						}
					},
						error:function(){
						}
				});
	}
}
