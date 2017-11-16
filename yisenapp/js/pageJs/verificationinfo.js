//获得员工的id
var loginName = null;
getLoginName();
//var userName = '0001';
//信息的数量
var startNum = 0;
var num =50;
//加载列表的信息
var newtokenId = null;
var statusupdate=1;
var type_id = "";
var scene_id = "";

window.onscroll = function () { 
	
	if (getScrollTop() + getClientHeight() >= getScrollHeight()-1) { 
			startNum +=num;
			getlistinfo(newtokenId);
		} 
} 
//获取滚动条当前的位置 
function getScrollTop() { 
	var scrollTop = 0; 
	if (document.documentElement && document.documentElement.scrollTop) { 
	scrollTop = document.documentElement.scrollTop; 
	} 
	else if (document.body) { 
		scrollTop = document.body.scrollTop; 
	} 
	return scrollTop; 
} 
//获取当前可是范围的高度 
function getClientHeight() { 
	var clientHeight = 0; 
	if (document.body.clientHeight && document.documentElement.clientHeight) { 
		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight); 
		} 
	else { 
		clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight); 
		} 
	return clientHeight; 
} 
//获取文档完整的高度 
function getScrollHeight() { 
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); 
} 
$(function(){
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				newtokenId = tokenId;
				getSceneList(tokenId)
				getlistinfo(tokenId);
			});
		}else{//获取TokenId成功
				newtokenId = tokenId;
				getSceneList(tokenId)
 				getlistinfo(tokenId);
 				
		} 
	});
  }); 

//加载现场下拉列表
function getSceneList(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/GetSceneName?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": tokenId,
				"name":loginName
			},
			timeout: 30000,
			success: function(data) {
				layer.close(loading);
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
//				给现场信息赋值
				var $scene = $("#message_scene");
				$scene.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="" class="remove">请选择现场</option>';
				for (var i = 0; i < json.length; i++) {
					str += '<option value="'+json[i].scene_id+'">'+json[i].scene_name+'</option>';
				}
				$scene.html(str);
			},
			error: function() {
				layer.close(loading);
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				layer.close(loading); //关闭加载层
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}
//现场下拉框选择
function changeScene(e){
	scene_id = $(e).val();
	startNum = 0;
	statusupdate = 0;
	$(".box").html("");
	getlistinfo(newtokenId);
}
//类型下拉框选择
function changeType(e){
	type_id = $(e).val();
	startNum = 0;
	statusupdate = 0;
	$(".box").html("");
	getlistinfo(newtokenId);
}

function getlistinfo(tokenId){
		if($("#startDate").html() > $("#endDate").html()){
			
		}
	
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/verification.asmx/GetVerificationInfo2?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"username":loginName,
			"num":num,
			"startnum":startNum,
			"startDate":$("#startDate").html(),
			"endDate":$("#endDate").html(),
			"scene_id":scene_id,
			"verification_status":type_id
        },
        timeout:30000,
 		success: function (data) {
 			var $ul = $(".list"); 
 			var json = eval("("+data.result+")");
   			if(json.length < 1){
   				if(startNum=0){
   					$(".box").html("");
   					layer.msg("没有信息");
   				}else{
   					layer.msg("没有更多的信息");
   				}
   				$("#loadmore").hide();
   				return;
   			}
   			if(json.length < num){
   				$("#loadmore").hide();
   			}
 			var str = "";
 			for(var i=0;i<json.length;i++){
 				var date1 = json[i].verification_datetime_set.split(" ");
				var  day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0]+":"+time[1];
 				if(json[i].verification_status=='0'){//0未开始校验
					str += '<div class="infoItem">'+
							'<p>'+
								'<mark>校验时间</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">质检员</b>'+
								'<b>'+json[i].verification_emp_name+'</b>'+
								'<span class="yellow right">未开始</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>校验类型</span>'+
									'<span>'+json[i].verification_type+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<a href="verification.html?type=1&id='+json[i].verification_id+'">'
								+'<div class="btnBox">'+
									'<button class="blockBox y">开始校验</button>'
								+'</div>'
							+'</a>'
						+'</div>'
 				}else if(json[i].verification_status=='1'){//1 已提交
 					str += '<div class="infoItem">'+
							'<p>'+
								'<mark>校验时间</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">质检员</b>'+
								'<b>'+json[i].verification_emp_name+'</b>'+
								'<span class="deepBlue right">已提交</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>校验类型</span>'+
									'<span>'+json[i].verification_type+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<a href="verification.html?type=0&id='+json[i].verification_id+'">'
								+'<div class="btnBox">'+
									'<button class="blockBox g">查看详情</button>'
								+'</div>'
							+'</a>'
						+'</div>'
 				}else{//2 未校验
 					str += '<div class="infoItem">'+
							'<p>'+
								'<mark>校验时间</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">质检员</b>'+
								'<b>'+json[i].verification_emp_name+'</b>'+
								'<span class="red right">未校验</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>校验类型</span>'+
									'<span>'+json[i].verification_type+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<a href="verification.html?type=0&id='+json[i].verification_id+'">'
								+'<div class="btnBox">'+
									'<button class="blockBox g">查看详情</button>'
								+'</div>'
							+'</a>'
						+'</div>'
 				}
 			}
 			str = str.replace(/null/gi, "");
          	 if(statusupdate==0)
			{
				$(".box").html(str);				
			}
			else{
				$(".box").append(str);
			}
			statusupdate=1;	
 		},
 		error: function (data) {
 			layer.alert("加载信息失败");
 		},
 		complete:function(XMLHttpRequest,status){
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
 			} 
 		}
 		});
}
function reloadinfo(){
		var newstartDate = $("#startDate").text();
		var newendDate = $("#endDate").text();
		var date1 = new Date(newstartDate);
		var date2 = new Date(newendDate);
		if(date1>date2){
			layer.msg("请选择正确的时间顺序");
			return;
		}
		if(newstartDate != startDate){
			startDate = newstartDate;
			getlistinfo(newtokenId);
		}
		if(newendDate != endDate ){
			endDate = newendDate;
			getlistinfo(newtokenId);
		}
}
