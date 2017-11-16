var sceneId = null;
var id = GetQueryString("id");
var type=GetQueryString("type");
var loginName = "";
var tokenid="";
$(function() {
		getLoginName();
		//	getSceneId();		
			$("#submit").hide();
			
		
		//获取TokenId，并获取用户信息
		getTokenIdLocal(function(tokenId) {
			if (tokenId == "null") { //Token过期或者首次没有Token
				getTokenIdServer(function(tokenId) { //重新获取TokenId				
						getCompleteInfo(tokenId);					
				});
			} else { //获取TokenId成功				
					getCompleteInfo(tokenId);							
			}
		});

		//	$("#submit").click(function(){
		//		layer.msg("提交成功",{shift: -1},function(){
		//			window.location.href="maintain_info.html";
		//		});
		//	})
	});
	//加载的信息
function getCompleteInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});	
	tokenid=tokenId;
	var str="";
//		if(type==0)
//		{
//			str += 	'<div>'+'<li><span>接收人：</span><span><input type="text" id="emp" /></span></li></div>'+
//			'<div>'+'<li><span>消息标题：</span><span><input type="text" id="message_title" /></span></li></div>'+
//			'<div>'+'<li><span>内容：</span><textarea id="editor_id" style="width:auto""></textarea></li></div>'+
//			'<div  style="text-align:center; width:100%;height:100%;margin:0px; "  >'+ 
//			'<button style="font-size:2em; width: 50%;height: 10%;background-color: yellowgreen" class="  ub-ac bc-text-head  bc-btn " onclick="commit()">发送</button></div>  ';  	
//		}
//		else{
//			str += 	'<div><li><span>接收人：</span><span><input type="text" id="emp" value="'+id+'" /></span></li></div>'+
//			'<div><li><span>消息标题：</span><span><input type="text" id="message_title" /></span></li></div>'+
//			'<div><li><span>内容：</span><textarea id="editor_id" style="width:auto""></textarea></li></div>'+
//			'<div  style="text-align:center; width:100%;height:100%;margin:0px; "  >'+     
//       	'<button style="font-size:2em; width: 50%;height: 10%;background-color: yellowgreen" class="  ub-ac bc-text-head  bc-btn " onclick="commit()">发送</button></div>  ';	  
//		}
		if(type==0)
		{
			str += 	'<div><li><span>接收人：</span><span><input type="text" id="emp" /></span></li></div>'+
			'<div><li><span>消息标题：</span><span><input type="text" id="message_title" /></span></li></div>'+
			'<div><li><span>内容：</span><span><input id="editor_id" type="text" /></span></li></div>'+
			'<div style="text-align:center; width:100%;height:100%;margin:10px; "  >'+ 
			'<button style="font-size:2em; width: 50%;height: 10%;background-color: yellowgreen" class="  ub-ac bc-text-head  bc-btn " onclick="commit()">发送</button></div>  ';  	
		}
		else{
			str += 	'<div><li><span>接收人：</span><span><input type="text" id="emp" value="'+id+'" /></span></li></div>'+
			'<div><li><span>消息标题：</span><span><input type="text" id="message_title" /></span></li></div>'+
			'<div><li><span>内容：</span><span><input id="editor_id" type="text"/></span></li></div>'+
			'<div style="text-align:center; width:100%;height:100%;margin:10px; "  >'+     
         	'<button style="font-size:2em; width: 50%;height: 10%;background-color: yellowgreen" class="  ub-ac bc-text-head  bc-btn " onclick="commit()">发送</button></div>  ';	  
		}
		$("#message_detail").append(str);
		InitKindeitor();
		layer.close(loading);
		
}
function commit()
{
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});	
	alert(emp.value)
	var str=emp.value;
	if(emp.value==""||emp.value==null)
	{
		layer.close(loading);
		layer.alert("接收人的工号不能为空");
		return;
	}
	if(message_title.value==""||message_title.value==null)
	{
		layer.close(loading);
		layer.alert("消息标题不能为空");
		return;
	}
	var empno=emp.value;
	var messagetitle=message_title.value;
	var messagecontent=editor.html();
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/SendMessage?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenid,
			"sendno": loginName,
			"empno":empno,
			"messagetitle":messagetitle,
			"messagecontent":messagecontent
		},
		timeout: 30000,
		success: function(data) {
			if(data.status=="0"){
				layer.msg(data.result);
				$("#loadmore").hide();
				return;
			}
			else{
				if(data.status=="1")
				{				
				layer.msg(data.result);
				$("#loadmore").hide();
				return;
				}
			}			
		},
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			window.location.href="message_info.html";
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}
