//获得员工的id
var loginName = null;
getLoginName();
//var userName = '0001';
//信息的数量
var startNum = 0;
var num =5;
//加载列表的信息
var newtokenId = null;
var startDate;
var endDate;
var check_type = "";
var check_type1 = "";
var check_status = "";
var scene_id = "";
var taskBack = GetQueryString("taskBack");
var check_status = GetQueryString("check_status");
var check_type = GetQueryString("check_type");
var scene_id = GetQueryString("scene_id");
if(taskBack == 'taskBack'){
	if(check_type=="0"){
		check_type = "日检";
	}
	if(check_type=="1"){
		check_type = "周检";
	}
	if(check_type=="2"){
		check_type = "月检";
	}
}

$(function(){
	getTokenIdLocal(function(tokenId){
		startDate = dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
		endDate = dateformat(new Date(), "yyyy-MM-dd");
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				newtokenId = tokenId;
				getlistinfo1(tokenId)
				getlistinfo(tokenId);
			});
		}else{//获取TokenId成功
				newtokenId = tokenId;
				getlistinfo1(tokenId)
 				getlistinfo(tokenId);
 				
		} 
	});
 }); 


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

function getlistinfo1(tokenId){
		//加载现场
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Check.asmx/GetSceneName?jsoncallback?",
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
				var $scene = $("#select").eq(0);
				$scene.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="请选择现场" class="remove">请选择现场</option><option value="" class="remove">查看全部现场</option>';
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

function getlistinfo(tokenId){
//	console.log(check_type)
//	console.log(check_status)
//	console.log(startDate);
//	console.log(endDate);
		taskBack = "";
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Check.asmx/GetCheckInfo2?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"username":loginName,
			"num":num,
			"startnum":startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"scene_id":scene_id,
			"check_type":check_type,
			"check_status":check_status
        },
        timeout:30000,
 		success: function (data) {
 			layer.close(loading);
 			if(data.status=="0"){
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg(data.result);}
				$("#loadmore").hide();
				return;
			}
 			var $box = $(".box"); 
// 			var json = eval("("+data.result+")");
 			var text = data.result.replace(/\n/g, "\\n").replace(/\\r/g, "\\r");
     	 	var json = eval("(" + text + ")");
   			if (json.length < 1) {
   				if(startNum>0){
   					layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg("没有信息");}
				$("#loadmore").hide();
				return;
			}
			if (json.length < num) {
				$("#loadmore").hide();
			}
 			var str = "";
 			if(check_type=="日检"){
 				check_type1 = 0;
 			}
 			if(check_type=="周检"){
 				check_type1 = 1;
 			}
 			if(check_type=="月检"){
 				check_type1 = 2;
 			}
 			for(var i=0;i<json.length;i++){
 				var date1 = json[i].check_datetime_set.split(" ");
				var  day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0]+":"+time[1];
// 				console.log(json[i].check_datetime_set);
 				if(json[i].check_status=='0'){//0未开始巡检
//					str+='<span>
//							'<span>'+hour+'</span>'+
//							'<span>'+day+'</span>'+
//						'</span>'+
//						'</p>'+
//						'<ol>'+
//							'<li><a>巡检状态：</a><span class="wait_ok">未开始</span>'+
//							'</li>'+
//							'<li>'+
//								'<a>现场名称：</a>'+
//								'<span>'+json[i].scene_name+'</span>'+
//							'</li>'+
//							'<li>'+
//								'<a>巡检名称：</a>'+
//								'<span>'+json[i].check_name+'</span>'+
//							'</li>'+
//						'</ol>'+
//						'<p>检修员：<span>'+json[i].check_emp_name+'</span></p>'+
//						'<div class="btnn">'+
//							'<p>'+json[i].check_type+'</p>'+
//							'<a href="check.html?type=1&id='+json[i].check_id+'">开始巡检</a>'+
//						'</div>';
					str+='<div class="infoItem">'+
							'<p>'+
								'<mark>'+
									json[i].check_type
								+'</mark>'+
								'<span class="right">'+
									'<span>'+json[i].check_create_datetime+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">'+'检修员'+'</b>'+
								'<b>'+json[i].check_emp_name+'</b>'+
								'<span class="deepBlue right">'+'未开始'+'</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>'+'现场名称'+'</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="check.html?type=1&id='+json[i].check_id+'&check_type='+check_type1+'&scene_id='+scene_id+'&check_status='+check_status+'">'+
									'<button class="blockBox b">'+'开始巡检'+'</button>'								
								+'</a>'
							+'</div>'
						+'</div>'
 				}else if(json[i].check_status=='1'){//1 已提交
// 					str+='<li>'+
//						'<p>设定的巡检时间'+
//							'<span>'+hour+'</span>'+
//							'<span>'+day+'</span>'+
//						'</p>'+
//						'<ol>'+
//							'<li><a>巡检状态：</a><span class="ok">已提交</span>'+
//							'</li>'+
//							'<li>'+
//								'<a>现场名称：</a>'+
//								'<span>'+json[i].scene_name+'</span>'+
//							'</li>'+
//						'</ol>'+
//						'<p>检修员：<span>'+json[i].check_emp_name+'</span></p>'+
//						'<div class="btnn">'+
//							'<p>'+json[i].check_type+'</p>'+
//							'<a href="check.html?type=0&id='+json[i].check_id+'">查看详情</a>'+
//						'</div>'+
//					'</li>';
						str+='<div class="infoItem">'+
							'<p>'+
								'<mark>'+
									json[i].check_type
								+'</mark>'+
								'<span class="right">'+
									'<span>'+json[i].check_create_datetime+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">'+'检修员'+'</b>'+
								'<b>'+json[i].check_emp_name+'</b>'+
								'<span class="yellow right">'+'已提交'+'</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>'+'现场名称'+'</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="check.html?type=0&id='+json[i].check_id+'&check_type='+check_type1+'&scene_id='+scene_id+'&check_status='+check_status+'">'+
									'<button class="blockBox g">'+'查看详情'+'</button>'
								+'</a>'
							+'</div>'
						+'</div>'
 				}else{//2 未巡检
// 					str+='<li>'+
//						'<p>设定的巡检时间'+
//							'<span>'+hour+'</span>'+ 
//							'<span>'+day+'</span>'+
//						'</p>'+
//						'<ol>'+
//							'<li><a>巡检状态：</a><span class="no_ok">未巡检</span>'+
//							'</li>'+
//							'<li>'+
//								'<a>现场名称：</a>'+
//								'<span>'+json[i].scene_name+'</span>'+
//							'</li>'+
//						'</ol>'+
//						'<p>检修员：<span>'+json[i].check_emp_name+'</span></p>'+
//						'<div class="btnn">'+
//							'<p>'+json[i].check_type+'</p>'+
//						'</div>'+
//					'</li>';
					str+='<div class="infoItem">'+
							'<p>'+
								'<mark>'+
									json[i].check_type
								+'</mark>'+
								'<span class="right">'+
									'<span>'+json[i].check_create_datetime+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">'+'检修员'+'</b>'+
								'<b>'+json[i].check_emp_name+'</b>'+
								'<span class="red right">'+'未巡检'+'</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>'+'现场名称'+'</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'
							+'</ul>'
						+'</div>'
 				}
 			}
 			 str = str.replace(/null/gi, "");
             $box.append(str);
 		},
 		error: function (data) {
 			layer.close(loading);
 			layer.alert("加载信息失败");
 		},
 		complete:function(XMLHttpRequest,status){
 			layer.close(loading);
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
 			} 
 		}
	});
}
//function reloadinfo(){
//		var newstartDate = $("#startDate").text();
//		console.log("这是新的初始日期"+newstartDate);
//		var newendDate = $("#endDate").text();
//		var date1 = new Date(newstartDate);
//		var date2 = new Date(newendDate);
//		if(date1>date2){
//			layer.msg("请选择正确的时间顺序");
//			return;
//		}
//		if(newstartDate != startDate){
//			startDate = newstartDate;
//			getlistinfo(newtokenId);
//		}
//		if(newendDate != endDate ){
//			endDate = newendDate;
//			getlistinfo(newtokenId);
//		}
//}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}

//现场下拉框选择
function changeStatus(e){
check_status = $(e).val();
startNum = 0;
statusupdate = 0;
if(check_status == "请选择状态"){
	return;
}
if(taskBack == 'taskBack'){
	scene_id = "";
	check_type = "";
	$(".box").html("");
	getlistinfo(newtokenId);
	return;
}
$(".box").html("");
getlistinfo(newtokenId);
}
//状态下拉框选择
function changeType(e){
check_type = $(e).val();
startNum = 0;
statusupdate = 0;
if(check_type == "请选择类型"){
	return;
}
if(taskBack == 'taskBack'){
	scene_id = "";
	check_status = "";
	$(".box").html("");
	getlistinfo(newtokenId);
	return;
}
$(".box").html("");
getlistinfo(newtokenId);
}
function changeScene(e){
scene_id = $(e).val();
startNum = 0;
statusupdate = 0;
if(scene_id == "请选择现场"){
	return;
}
if(taskBack == 'taskBack'){
	check_type = "";
	check_status = "";
	$(".box").html("");
	getlistinfo(newtokenId);
	return;
}
$(".box").html("");
getlistinfo(newtokenId);
}