//打开本地数据库
var db = openDatabase('YSenApp', '1.0', 'YSenApp Database', 1024*1024*20);//如果数据库存在 则打开,不存在的则创建 然后在打开
//从服务器重新获取TokenId
function getTokenIdServer(callback){ 
	//查询User表，获得用户数据
	db.transaction(function (tx) {
    	tx.executeSql("select * from user where id='localUserId'",[],function(tx,data){
    		if(data.rows.length==1){//如果本地有用户
//  			console.log(data.rows);
    			var loginName = data.rows.item(0)["loginName"];//用户名
    			var password = data.rows.item(0)["password"];//密码
    			var hash = "";
    			var sendTime = 0;
    			//获取请求时间
    			var getTimeAjax = $.ajax({
		            type: "post",
		            async: false,
		            url: url+"/handler/Token.asmx/GetTime?jsoncallback?",
		            dataType: "jsonp",
		            jsonp: 'jsoncallback',
		            timeout:30000,
		            success: function (data) {
		            	sendTime = parseInt(data.time);//发送请求的时间
		            	hash = $.md5(loginName+password+sendTime);//hash值为MD5加密
						//请求获取TokenId
						var getTokenIdAjax = $.ajax({
				            type: "post",
				            async: false,
				            url: url+"/handler/Token.asmx/GetTokenId?jsoncallback?",
				            dataType: "jsonp",
				            jsonp: 'jsoncallback',
				            data: {
				            	"username":loginName,
								"hash":hash,
								"sendTime":sendTime
				            },
				            timeout:30000,
				            success: function (data) {
				                if(data.status==1){//获取成功
				                	var tokenId = data.result;//TokenId
					    			var tokenExpireTime = sendTime + 7200000;//Token过期时间
							        //删除Token表
							        db.transaction(function (tx) {
								        tx.executeSql("drop table if exists token",[],function(tx,data){
								        	//创建Token表，如果有则创建失败
									        tx.executeSql("CREATE TABLE token (tokenId TEXT UNIQUE, tokenExpireTime INT)",[],
									        	function(tx,data){
										        	//将TokenId写入Token表
										        	tx.executeSql("insert into token(tokenId,tokenExpireTime) VALUES(?,?)",
										        		[tokenId,tokenExpireTime],function(tx,data){//插入成功的回调函数
										        		callback(tokenId);
									        	},function(){
									        		//插入失败的回调函数
									        		callback("close");
									        		layer.msg("插入失败");
									        	});
									        });
								        });
								    });
				                }else{//获取失败
				                	callback("close");
				                	layer.msg(data.result);
				                }
				            },
				            error:function(data){
				            	callback("close");
				            	layer.msg("获取TokenId失败");
				            },
				            complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
				                if(status=='timeout'){//超时,status还有success,error等值的情况
				                	callback("close");
				                    getTokenIdAjax.abort(); //取消请求
				                    layer.msg("请求超时");
				                }
				            }
				        });
		            },
		            error:function(data){
		            	callback("close");
		            	layer.msg("获取请求时间失败");
		            },
		            complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
		                if(status=='timeout'){//超时,status还有success,error等值的情况
		                	callback("close");
		                    getTimeAjax.abort(); //取消请求
		                    layer.msg("请求超时");
		                }
		            }
		        });
    		}else{
    			callback("close");
    			layer.msg("没有用户");
    		}
    	},function(){
    		callback("close");
    		layer.msg("查询用户失败");
    	});
   	});
}

//从本地获取TokenId
function getTokenIdLocal(callback){
	db.transaction(function(tx){
        //查询本地TokenId表
        tx.executeSql("select * from token",[],function(tx,data){
        	if(data.rows.length==1){//本地存在TokenId
        		var date = new Date();
        		var now = date.getTime() + 28800000;
        		var tokenExpireTime = data.rows.item(0)["tokenExpireTime"];
        		var timeDiffer = tokenExpireTime - now;
        		if(timeDiffer<600000){//小于10分钟，视为过期
        			callback("null");
        		}else{//获取成功
        			callback(data.rows.item(0)["tokenId"]);
        		}
        	}else{
        		callback("close");
        		layer.msg("没有TokenId");
        	}
        },function(){//第一次没有token表
        	callback("null");
        });
    });
}