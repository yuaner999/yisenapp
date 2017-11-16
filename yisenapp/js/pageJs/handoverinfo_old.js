//获得员工的id
//var userName =getLoginName();
//var userName = '0001';
//信息的数量
var startNum = 0;
var num =5;
window.onscroll = function () { 
	if (getScrollTop() + getClientHeight() >= getScrollHeight()-1) { 
//		console.log("到达底部");
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
//加载列表的信息
function getlistinfo(tokenId){
//	console.log(startDate);
//	console.log(endDate);
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/GetHandoverListInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"username":loginName,
			"num":num,
			"startnum":startNum,
			"startDate":startDate,
			"endDate":endDate
        },
        timeout:30000,
 		success: function (data) {
 			if(data.status=="0"){
				if(startNum>0){layer.msg("没有更多的信息");}
				else{layer.msg(data.result);}
				$("#loadmore").hide();
				return;
			}
 			var $ul = $(".list"); 
// 			$ul.html("");
 			var json = eval("("+data.result+")");
 			if (json.length < 1) {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{layer.msg("没有信息");}
				$("#loadmore").hide();
				return;
			}
 			$ul.html("");
			if (json.length < num) {
				$("#loadmore").hide();
			}
 			var str = "";
 			for(var i=0;i<json.length;i++){
 				var date1 = json[i].handover_datetime_before.split(" ");
				var  day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0]+":"+time[1];
 				if(json[i].handover_status=='0'){//0已提交的
 					str +='<li>'+
							'<p> 交班时间<span>'+hour+'</span><span>'+day+'</span></p>'+
							'<ol>'+
								'<li><a>接班状态：</a><span class="wait_ok">已提交</span></li>'+
								'<li><a>现场名称：</a><span>'+json[i].scene_name+'</span></li>'+
							'</ol>'+
							'<p>交班人：<span>'+json[i].handover_man_before+'</span></p>'+
							'<p>接班人：<span>'+json[i].handover_man_after+'</span></p>'+
							'<div class="btnn"><a href="handover_homepg.html?type=1&id='+json[i].handover_id+'">填写详情</a>'+
							'<a href="javascript:void(0)"  name="'+json[i].handover_id+'"onclick="disagree()">不同意接班</a></div>'+
						 '</li>';
 				}
// 				else if(json[i].handover_status=='1'){//1 已同意
// 					str +='<a href="handover_homepg.html?type=1&id='+json[i].handover_id+'">'+
//      				'<li>'+
//		        			'<div class="ok"><img src="images/red_03.png" />已同意</div>'+
//		        			'<p>'+json[i].handover_man_after+'</p>'+
//		        			'<span>'+json[i].handover_datetime_before+'</span>'+
//		        			'<b></b>'+
//      				'</li>'+
//      			'</a>';
// 				}
 				else if(json[i].handover_status=='2'){//2已交班的
 					str +='<li>'+
							'<p> 交班时间<span>'+hour+'</span><span>'+day+'</span></p>'+
							'<ol>'+
								'<li><a>接班状态：&nbsp;</a><span class="ok">已交班</span></li>'+
								'<li><a>现场名称：&nbsp;</a><span>'+json[i].scene_name+'</span></li>'+
							'</ol>'+
							'<p>交班人：&nbsp;<span>'+json[i].handover_man_before+'</span></p>'+
							'<p>接班人：&nbsp;<span>'+json[i].handover_man_after+'</span></p>'+
							'<div class="btnn"><a href="handover_homepg.html?type=0&id='+json[i].handover_id+'">查看详情</a></div>'+
						 '</li>';
 				}else{//3不同意
					str +='<li>'+
							'<p> 交班时间<span>'+hour+'</span><span>'+day+'</span></p>'+
							'<ol>'+
								'<li><a>接班状态：&nbsp;</a><span class="no_ok">不同意</span></li>'+
								'<li><a>现场名称：&nbsp;</a><span>'+json[i].scene_name+'</span></li>'+
							'</ol>'+
							'<p>交班人：<span>'+json[i].handover_man_before+'</span></p>'+
							'<p>接班人：<span>'+json[i].handover_man_after+'</span></p>'+
						 '</li>';
 				}
 	
 				
 			}
 			 str = str.replace(/null/gi, "");
             $ul.append(str);
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
//		console.log("这是新的初始日期"+newstartDate);
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


function disagree(){
	var e =window.event.target;
	var  id = $(e).attr("name");
	var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/DisagreeHandover?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":newtokenId,
			"id":id
        },
        timeout:30000,
       	success: function (data) {
   			layer.close(loading);
   			layer.msg("设定成功");
   			window.location.reload();
       	},
       	error: function (data) {
	 		layer.close(loading);
 			layer.msg("设定失败");
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
