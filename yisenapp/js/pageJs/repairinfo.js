//获得员工的id
//var userName = '0001';
//信息的数量
var startNum = 0;
var num = 5;
var newtokenId = null;
var loginName = null;
var select_type = "";
var select_scene = "";	
var select_type = GetQueryString("select_type");
var select_scene = GetQueryString("select_scene");
var taskBack = GetQueryString("taskBack");
var statusupdate=1;
var startDate;
var endDate;
//if(taskBack == "taskBack"){
//	getlistinfo(newtokenId);
//}
$(function() {
	load = layer.load(1, {
		shade: [0.2, '#000'] //0.1透明度的白色背景
	});
//	reloadinfo();
	getLoginName();
	getTokenIdLocal(function(tokenId) {
		startDate =  new Date(dateformatByMonthPrior(new Date()));
		endDate = new Date();
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getSceneList(tokenId);
				getlistinfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
			getSceneList(tokenId);
			getlistinfo(tokenId);
		}
	});
});

window.onscroll = function() {
		if (getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
			startNum += num;
			$("#loadmore").show();
			getlistinfo(newtokenId);
		}
	}
	//获取滚动条当前的位置 
function getScrollTop() {
	var scrollTop = 0;
	if (document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if (document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}
//获取当前可是范围的高度 
function getClientHeight() {
	var clientHeight = 0;
	if (document.body.clientHeight && document.documentElement.clientHeight) {
		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
	} else {
		clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
	}
	return clientHeight;
}
//获取文档完整的高度 
function getScrollHeight() {
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

//加载列表的信息
function getlistinfo(tokenId) {
//	if (newtokenId == "close") { //回调过程中出错
//		//layer.close(load); //关闭加载层
//		return;
//	}	
//	var loading1 = layer.load(2, {shade: [0.2, '#000']});
	taskBack = "";
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Repair.asmx/GetRepairListInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"username": loginName,
			"num": num,
			"startnum": startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"scene_id":select_scene,
			"report_status":select_type
		},
		timeout: 30000,
		success: function(data) {
			layer.close(load); //关闭加载层
			if(data.status=="0"){
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg(data.result);
				}
				$("#loadmore").hide();
				return;
			}
			var json = eval("(" + data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r") + ")");
			console.log(data);
			if (json.length < 1) {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{layer.msg("没有信息");}
				$("#loadmore").hide();
				return;
			}
			//$(".box").html("");
			if (json.length < num) {
				$("#loadmore").hide();
			}
			var str = "";
			for (var i = 0; i < json.length; i++) {
//				var date1 = json[i].report_time.split(" ");
//				var day = date1[0];
//				var time = date1[1].split(":");
//				var hour = time[0] + ":" + time[1];
//				//预计完成的时间
//				if (json[i].expect_finish_date != "") {
//					json[i].expect_finish_date = dealTimeFormat(json[i].expect_finish_date);
//				}
//				//预计到达时间
//				if (json[i].expect_repair_date != "") {
//					json[i].expect_repair_date = dealTimeFormat(json[i].expect_repair_date);
//				}
//				//开始时间
//				if (json[i].repair_date != "") {
//					json[i].repair_date = dealTimeFormat(json[i].repair_date);
//				}
//				//完成时间
//				if (json[i].finish_date != "") {
//					json[i].finish_date = dealTimeFormat(json[i].finish_date);
//				}
				if(json[i].from_path == ''){
					json[i].from_path = "pc端发起";
				}
				console.log(json[i].from_path);
				if (json[i].report_status == '0') { //发起
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
					+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
					+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
	    			+'<span class="green right">发起</span></div>'
	    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
					+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
	    			if(json[i].expect_repair_date != ""){
	    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
	    			}
	    			if(json[i].repair_date != ''){
	    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
	    			}
	    			if(json[i].expect_finish_date != ''){
	    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
	    			}
	    			if(json[i].finish_date != ''){
	    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
	    			}
	    			str+='</ul>'
//	    			+'<button class="red">维修完成</button>'
	    			+'<div class="btnBox">'
//	    			+'<button class="blockBox y">推迟完成时间</button>'
	    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
//	    		   	+'<button class="blockBox b">设定完成的时间</button>'
//	    			+'<button class="blockBox b">开始维修</button>'
//	    			+'<button class="blockBox nullg">修改</button>'
//	    			+'<button class="blockBox nullg">填写报修单</button>'
	    			+'<a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox nulg">设定到达的时间</button></a>'
	    			+'</div></div>'
					
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="blue">发起</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<div class="btnn"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
				} else if (json[i].report_status == '1') { //收到
					
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
					+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
					+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
	    			+'<span class="deepBlue right">收到</span></div>'
	    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
					+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
	    			if(json[i].expect_repair_date != ""){
	    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
	    			}
	    			if(json[i].repair_date != ''){
	    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
	    			}
	    			if(json[i].expect_finish_date != ''){
	    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
	    			}
	    			if(json[i].finish_date != ''){
	    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
	    			}
	    			str+='</ul>'
//	    			+'<button class="red">维修完成</button>'
	    			+'<div class="btnBox">'
//	    			+'<button class="blockBox y">推迟完成时间</button>'
	    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
//	    		   	+'<button class="blockBox b">设定完成的时间</button>'
//	    			+'<button class="blockBox b">开始维修</button>'
//	    			+'<button class="blockBox nullg">修改</button>'
	    			+'<a  href="repair.html?type=1&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox nulg">填写报修单</button></a>'
	    			+'<a href="orderTime.html?type=3&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox nulg">推迟到达的时间</button></a>'
	    			+'</div></div>'
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="wait_ok">收到</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>预计到达时间：<span>' + json[i].expect_repair_date + '</span></p>' +
//						'<div class="btnn"><a  href="repair.html?type=1&id=' + json[i].report_repair_id + '">填写表单</a><a href="orderTime.html?type=3&id=' + json[i].report_repair_id + '">推迟到达的时间</a><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';

				} else if (json[i].report_status == '2') { //维修中
					if (json[i].expect_finish_date != "") {
						str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="yellow right">维修中</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='<button class="red"><a href="complete.html?type=0&id=' + json[i].report_repair_id + '">维修完成</a></button></ul>'
			    			+'<div class="btnBox">'
			    			+'<a href="completeOrDelay.html?type=3&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox y">推迟完成的时间</button></a>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
		//	    		   	+'<button class="blockBox b">设定完成的时间</button>'
		//	    			+'<button class="blockBox b">开始维修</button>'
			    			+'<a href="modifyRepair.html?id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox nulg">修改</button></a>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
						
//						str += '<li>' +
//							'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//							'<ol>' +
//							'<li><a>报修状态：</a><span class="no_ok">维修中</span></li>' +
//							'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//							'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//							'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//							'</ol>' +
//							'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//							'<p>预计完成时间：<span>' + json[i].expect_finish_date + '</span></p>' +
//							'<div class="btnn"><a href="modifyRepair.html?id=' + json[i].report_repair_id + '">修改</a><a href="complete.html?type=0&id=' + json[i].report_repair_id + '">维修完成</a><a href="completeOrDelay.html?type=3&id=' + json[i].report_repair_id + '">推迟完成的时间</a><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//							 '<span class="frompath">' + json[i].from_path + '</span>'+
//							 '</li>';
					} else {
						
						str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="yellow right">维修中</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='</ul>'
		//	    			+'<button class="red">维修完成</button>'
			    			+'<div class="btnBox">'
		//	    			+'<button class="blockBox y">推迟完成时间</button>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id +'&select_scene='+select_scene+'&select_type='+select_type+ '"><button class="blockBox g">查看详情</button></a>'
			    		   	+'<a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id +'&select_scene='+select_scene+'&select_type='+select_type+ '"><button class="blockBox b">设定完成的时间</button></a>'
		//	    			+'<button class="blockBox b">开始维修</button>'
		//	    			+'<button class="blockBox nullg">修改</button>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
//						str += '<li>' +
//							'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//							'<ol>' +
//							'<li><a>报修状态：</a><span class="no_ok">维修中</span></li>' +
//							'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//							'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//							'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//							'</ol>' +
//							'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
////							'<p>预计完成时间：<span>' + json[i].expect_finish_date + '</span></p>' +
//							'<div class="btnn"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '">设定完成的时间</a>'+
//							'<a href="modifyRepair.html?id=' + json[i].report_repair_id + '">修改</a><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//							'<span class="frompath">' + json[i].from_path + '</span>'+
//							'</li>';
					}
				} else if (json[i].report_status == '4') { //等待审批
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="red right">等待审批</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='</ul>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
		//	    			+'<button class="red">维修完成</button>'
			    			+'<div class="btnBox">'
		//	    			+'<button class="blockBox y">推迟完成时间</button>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
//			    		   	+'<button class="blockBox b"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '">设定完成的时间</a></button>'
		//	    			+'<button class="blockBox b">开始维修</button>'
		//	    			+'<button class="blockBox nullg">修改</button>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
					
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="wait_ok">等待审批</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<div class="btnn"><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';

				}else if (json[i].report_status == '5') { //审批未通过
					
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="red right">审批未通过</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='</ul>'
		//	    			+'<button class="red">维修完成</button>'
			    			+'<div class="btnBox">'
		//	    			+'<button class="blockBox y">推迟完成时间</button>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
//			    		   	+'<button class="blockBox b"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '">设定完成的时间</a></button>'
		//	    			+'<button class="blockBox b">开始维修</button>'
		//	    			+'<button class="blockBox nullg">修改</button>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
					
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="no_ok">审批未通过</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<div class="btnn"><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';

				}else if (json[i].report_status == '6') { //审批通过
					
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="blue right">审批通过</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='</ul>'
		//	    			+'<button class="red">维修完成</button>'
			    			+'<div class="btnBox">'
		//	    			+'<button class="blockBox y">推迟完成时间</button>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id +'&select_scene='+select_scene+'&select_type='+select_type+ '"><button class="blockBox g">查看详情</button></a>'
//			    		   	+'<button class="blockBox b"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '">设定完成的时间</a></button>'
			    			+'<a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '&id2=' + json[i].report_equipment_component_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox b">开始维修</button></a>'
		//	    			+'<button class="blockBox nullg">修改</button>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="ok">审批通过</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<div class="btnn"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '&id2=' + json[i].report_equipment_component_id + '">开始维修</a><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';

				}else { //完成
					str+='<div class="infoItem"><p><mark>' + json[i].from_path + '</mark>'
							+'<span class="right"><span>'+json[i].report_time+'</span></span></p>'
							+'<div class="info"><b class="yellow">维修人</b><b>'+json[i].emp_name+'</b>'
			    			+'<span class="blue right">完成</span></div>'
			    			+'<ul><li><span>现场名称</span><span>' + json[i].scene_name + '</span></li><li><span>设备名称</span><span>' + json[i].equipment_name + '</span></li>'
							+'<li><span>设备部件</span><span>' + json[i].report_component_name + '</span></li>'
//			    			if(json[i].report_create_datetime != ""){
//			    				str+='<li><span>创建时间</span><span>' + json[i].report_create_datetime + '</span></li>'
//			    			}
			    			if(json[i].expect_repair_date != ""){
			    				str+='<li><span  style="width: 95px;">预期开始时间</span><span>' + json[i].expect_repair_date + '</span></li>'
			    			}
			    			if(json[i].repair_date != ''){
			    				str+='<li><span  style="width: 95px;">开始维修时间</span><span>' + json[i].repair_date + '</span></li>'
			    			}
			    			if(json[i].expect_finish_date != ''){
			    				str+='<li><span  style="width: 95px;">预期完成时间</span><span>' + json[i].expect_finish_date + '</span></li>'
			    			}
			    			if(json[i].finish_date != ''){
			    				str+='<li><span  style="width: 95px;">完成维修时间</span><span>' + json[i].finish_date + '</span></li>'
			    			}
			    			str+='</ul>'
		//	    			+'<button class="red">维修完成</button>'
			    			+'<div class="btnBox">'
		//	    			+'<button class="blockBox y">推迟完成时间</button>'
			    			+'<a href="repair.html?type=0&id=' + json[i].report_repair_id + '&select_scene='+select_scene+'&select_type='+select_type+'"><button class="blockBox g">查看详情</button></a>'
//			    		   	+'<button class="blockBox b"><a href="completeOrDelay.html?type=2&id=' + json[i].report_repair_id + '">设定完成的时间</a></button>'
		//	    			+'<button class="blockBox b">开始维修</button>'
		//	    			+'<button class="blockBox nullg">修改</button>'
		//	    			+'<button class="blockBox nullg">填写报修单</button>'
//			    			+'<button class="blockBox nullg"><a href="orderTime.html?type=2&id=' + json[i].report_repair_id + '">设定到达的时间</a></button>'
			    			+'</div></div>'
//					str += '<li>' +
//						'<p> 报修时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>报修状态：</a><span class="ok">完成</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>报修设备部件：</a><span>' + json[i].report_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>维修人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>开始时间：<span>' + json[i].repair_date + '</span></p>' +
//						'<p>完成时间：<span>' + json[i].finish_date + '</span></p>' +
//						'<div class="btnn"><a href="repair.html?type=0&id=' + json[i].report_repair_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
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
		error: function(data) {
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

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
				var $scene = $("#select_scene");
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
//现场下拉框选择
function changeScene(e){
	select_scene = $(e).val();
	startNum = 0;
	statusupdate = 0;
	if(select_scene =="请选择现场"){
		return;
	}
	if(taskBack == "taskBack"){
		select_type = "";
	}
	getlistinfo(newtokenId);
}
//状态下拉框选择
function changeType(e){
	select_type = $(e).val();
	startNum = 0;
	statusupdate = 0;
	if(select_type =="请选择状态"){
		return;
	}
	if(taskBack == "taskBack"){
		select_scene = "";
	}
	getlistinfo(newtokenId);
}
// 日期，在原有日期基础上，增加days天数，默认增加1天
function addDate(date, days) {
	var date = new Date(date);
	date.setDate(date.getDate() + days);
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return date.getFullYear() + '-' + getFormatDate(month) + '-' + getFormatDate(day);
}
// 日期月份/天的显示，如果是1位数，则在前面加上'0'
function getFormatDate(arg) {
	if (arg == undefined || arg == '') {
		return '';
	}
	var re = arg + '';
	if (re.length < 2) {
		re = '0' + re;
	}

	return re;
}
//对时间格式进行处理 不带秒
function dealTimeFormat(timestr) {
	if(timestr != ""){
		var date1 = timestr.split(" ");
		var day = date1[0];
		var timestr = date1[1].split(":");
		var hour = timestr[0] + ":" + timestr[1];
	}else{
		day ='';
		hour = '';
	}
	return day + " " + hour;
}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}