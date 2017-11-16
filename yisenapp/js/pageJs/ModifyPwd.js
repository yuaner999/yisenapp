var loginName = GetQueryString("loginName");

$(function(){
	$("#submit").click(function(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				ModPwdCallback(tokenId);//回调函数，修改密码
			});
		}else{//获取TokenId成功
			ModPwdCallback(tokenId);//回调函数，修改密码
		}
	});
	})
	$("#send").click(function(){
		getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				SendNumber(tokenId);//回调函数，修改密码
			});
		}else{//获取TokenId成功
			SendNumber(tokenId);//回调函数，修改密码
		}
	});
	})
});
//获取手机号并发送验证码
function SendNumber(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var phonenum=$("#phonenum").val();
	var SendNumberAjax = $.ajax({
		type:"post",
		url:url+"/handler/SMSUtils.asmx/GetHtmlFromUrl?jsoncallback?",
		dataType: "jsonp",
        	jsonp: 'jsoncallback',
        	data: {
        	"url":""//此处拼串需要修改
        			},
        	timeout:30000,
        	success:function(data){
        		layer.close(loading);
        		layer.msg(data.result);
        		
        	},
        	error:function(data){
        		layer.close(loading);
        		layer.msg("数据库连接失败");
       		}
	});
}
//修改密码
function ModPwdCallback(tokenId){
		var opwd = $("#opwd").val();
		var npwd1 = $("#npwd1").val();
		var npwd2 = $("#npwd2").val();
		if(npwd1!=npwd2){
			layer.msg("两次密码输入的不一致");
			return;
		}
		if(opwd==npwd1||opwd==npwd2){
			layer.msg("新旧密码相同");
			return;
		}
		if(npwd1 == "" || npwd1 == null){
			layer.msg("新密码不能为空");
			return;
		}
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ModpwdAjax = $.ajax({
			type:"post",
			url:url+"/handler/Person.asmx/ModPwd?jsoncallback?",
			dataType: "jsonp",
        	jsonp: 'jsoncallback',
        	data: {
        	"tokenId":tokenId,
			"loginName":loginName,
			"opwd":$.md5(opwd).toUpperCase(),
			"npwd":$.md5(npwd1).toUpperCase()
        			},
        	timeout:30000,
        	success:function(data){
        		if(data.status=="1"){
        			layer.close(loading);
	        		alert(data.result);
	        		window.location.href = 'Login.html';
        		}
        		else{
        			layer.close(loading);
	        		layer.msg(data.result);
        		}
        	},
        	error:function(data){
        		layer.close(loading);
        		layer.msg("数据库连接失败");
        }
        })
	};
	function SendEmail(){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		$.ajax({
			type:"post",
			url:url+"/handler/EmailUtils.asmx/SendEmail?mailAddress",
			data: {
			},
        	timeout:30000,
        	success:function(){
        		layer.close(loading);
        		layer.msg("请求成功");
        	},
        	error:function(){
        		layer.close(loading);
        		layer.msg("请求失败");
        	}
        })
	}
