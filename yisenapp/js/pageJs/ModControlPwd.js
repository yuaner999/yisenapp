var loginName = GetQueryString("loginName");

$(function(){
	getLoginName();
	$("#submit").click(function(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				ModControlPwd(tokenId);//回调函数，修改密码
			});
		}else{//获取TokenId成功
			ModControlPwd(tokenId);//回调函数，修改密码
		}
	});
	})
});

//修改密码
function ModControlPwd(tokenId){
		var opwd = $("#opwd").val();
		var npwd1 = $("#npwd1").val();
		var npwd2 = $("#npwd2").val();
		
		if(opwd == "" || opwd == null){
			layer.msg("旧密码不能为空");
			return;
		}
		if(npwd1 == "" || npwd1 == null){
			layer.msg("新密码不能为空");
			return;
		}
		if(npwd2 == "" || npwd2 == null){
			layer.msg("新密码不能为空");
			return;
		}
		if(npwd1!=npwd2){
			layer.msg("两次密码输入的不一致");
			return;
		}
		if(opwd==npwd1||opwd==npwd2){
			layer.msg("新旧密码相同");
			return;
		}
		
//		alert($.md5(opwd).toUpperCase())
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ModpwdAjax = $.ajax({
			type:"post",
			url:url+"/handler/Person.asmx/ModControlPwd?jsoncallback?",
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
 
        		layer.close(loading);
        		layer.msg(data.result);
        		setTimeout(function(){
        			window.location.href = 'User.html';
        		},1000);
        	},
        	error:function(data){
        		layer.close(loading);
        		layer.msg("数据库连接失败");
        }
        })
	};

