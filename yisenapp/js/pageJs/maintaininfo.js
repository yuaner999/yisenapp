//信息的数量
var startNum = 0;
var num = 5;
var statusupdate=1;

var newtokenId = null;
var loginName = null;

var scene_id = "";
var maintain_status = "";
var startDate;
var endDate;
var maintain_status = GetQueryString("maintain_status");
var scene_id = GetQueryString("scene_id");
getLoginName();
$(function(){			
	getTokenIdLocal(function(tokenId){
		startDate = dateformatByMonthPrior(new Date(), "yyyy-MM-dd");
		endDate = dateformat(new Date(), "yyyy-MM-dd")
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				newtokenId = tokenId;
				getlistinfo1(tokenId);
				getMainTainInfo(tokenId);
			});
		}else{//获取TokenId成功
				newtokenId = tokenId;
 				getlistinfo1(tokenId);
 				getMainTainInfo(tokenId);
		} 
	});
 }); 
window.onscroll = function() {
		if (getScrollTop() + getClientHeight() >= getScrollHeight()-1) {
			console.log(getScrollTop()+" "+getClientHeight()+" "+getScrollHeight())
			startNum += num;
			getMainTainInfo(newtokenId);
		}
	}
//获取滚动条当前的位置 
function getScrollTop() {
	var scrollTop = 0;
	if(document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if(document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}

//获取当前可是范围的高度 
function getClientHeight() {
	var clientHeight = 0;
	if(document.body.clientHeight && document.documentElement.clientHeight) {
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

//加载列表的信息
function getMainTainInfo(tokenId) {
	taskBack = "";
	var loading = layer.load(2, {shade: [0.2, '#000']});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/GetMaintainListInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"username": loginName,
			"num": num,
			"startnum": startNum,
			"startDate": dateConvert(startDate),
			"endDate": dateConvert(endDate),
			"maintain_status":scene_id,
			"scene_id":maintain_status
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if(data.status=="0"){
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg(data.result);}
//				$("#loadmore").hide();
				return;
			}
			var text = data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
			var json = eval("(" + text + ")");
			if (json.length < 1) {
				if(startNum>0){layer.msg("没有更多的信息");}
				else{
					$(".box").html("");
					layer.msg("没有信息");
				}
//				$("#loadmore").hide();
				return;
			}
			if (json.length < num) {
//				$("#loadmore").hide();
			}
			var str = "";
			for (var i = 0; i < json.length; i++) {
				var date1 = json[i].maintain_create_datetime.split(" ");
				var day = date1[0];
				var time = date1[1].split(":");
				var hour = time[0] + ":" + time[1];
				if (json[i].maintain_status == '0') { //发起
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="blue">发起</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<div class="btnn"><a href="orderTime.html?type=0&id=' + json[i].maintain_id + '">设定预计到达时间</a><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="deepBlue right">发起</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="orderTime.html?type=0&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox b">设定预计到达的时间</button>'
								+'</a>'+
								'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'
				} else if (json[i].maintain_status == '1') { //收到
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="no_ok">收到</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<p>预计到达时间：<span>' + json[i].expect_maintain_date + '</span></p>' +
//						'<div class="btnn"><a href="maintain.html?type=1&id=' + json[i].maintain_id + '">填写表单</a>' +
//						'<a href="orderTime.html?type=1&id=' + json[i].maintain_id + '">推迟到达的时间</a>' +
//						'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="blue right">收到</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="orderTime.html?type=1&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox y">推迟到达的时间</button>'
								+'</a>'+
								'<a href="maintain.html?type=0&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'
				} else if (json[i].maintain_status == '2') { //开始保养 													
					if (json[i].expect_finish_date != "") {
//						str += '<li>' +
//							'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//							'<ol>' +
//							'<li><a>保养状态：</a><span class="wait_ok">开始保养</span></li>' +
//							'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//							'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//							'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//							'</ol>' +
//							'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//							'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//							'<p>预计完成时间：<span>' + json[i].expect_finish_date + '</span></p>' +
//							'<div class="btnn"><a href="complete.html?type=1&id=' + json[i].maintain_id + '">保养完成</a>' +
//							'<a href="completeOrDelay.html?type=1&id=' + json[i].maintain_id + '">推迟完成的时间</a>' +
//							'<a href="modifyMaintain.html?id=' + json[i].maintain_id + '">修改</a><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//							'<span class="frompath">' + json[i].from_path + '</span>'+
//							'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="yellow right">开始保养</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="complete.html?type=1&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">保养完成</button>'
								+'</a>'+
								'<a href="completeOrDelay.html?type=1&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox y">推迟完成的时间</button>'
								+'</a>'+
								'<a href="modifyMaintain.html?id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox nulg">修改</button>'
								+'</a>'+
								'<a href="maintain.html?type=0&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'
					} else {
//						str += '<li>' +
//							'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//							'<ol>' +
//							'<li><a>保养状态：</a><span class="wait_ok">开始保养</span></li>' +
//							'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//							'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//							'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//							'</ol>' +
//							'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//							'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
////							'<p>预计完成时间：<span>' + json[i].expect_finish_date + '</span></p>' +
//							'<div class="btnn"><a href="completeOrDelay.html?type=0&id=' + json[i].maintain_id + '">设定完成的时间</a>' +
////							'<a href="completeOrDelay.html?type=1&id=' + json[i].maintain_id + '">推迟完成的时间</a>' +
//							'<a href="modifyMaintain.html?id=' + json[i].maintain_id + '">修改</a><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//							'<span class="frompath">' + json[i].from_path + '</span>'+
//							'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="yellow right">开始保养</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="completeOrDelay.html?type=0&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox b">设定完成的时间</button>'
								+'</a>'+
								'<a href="completeOrDelay.html?type=1&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox b">推迟完成的时间</button>'
								+'</a>'+
								'<a href="modifyMaintain.html?id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox nulg">修改</button>'
								+'</a>'+
								'<a href="maintain.html?type=0&id='  + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'	
					}

				}else if (json[i].maintain_status == '4') { //等待审批
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="wait_ok">等待审批</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<div class="btnn"><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="yellow right">等待审批</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'		
				}else if (json[i].maintain_status == '5') { //审批未通过
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="no_ok">审批未通过</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<div class="btnn"><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="red right">审批未通过</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'&meid=5">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'	
				}else if (json[i].maintain_status == '6') { //审批通过
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="ok">审批通过</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<div class="btnn"><a href="completeOrDelay.html?type=0&id=' + json[i].maintain_id + '">开始保养</a>' +
//						'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="red right">审批通过</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="completeOrDelay.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox b">开始保养</button>'
								+'</a>'+
								'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
						  +'</div>'	
				}else { //3 保养完成
//					str += '<li>' +
//						'<p> 保养的创建时间<span>' + hour + '</span><span>' + day + '</span></p>' +
//						'<ol>' +
//						'<li><a>保养状态：</a><span class="ok">保养完成</span></li>' +
//						'<li><a>现场名称：</a><span>' + json[i].scene_name + '</span></li>' +
//						'<li><a>设备名称：</a><span>' + json[i].equipment_name + '</span></li>' +
//						'<li><a>保养设备部件：</a><span>' + json[i].maintain_component_name + '</span></li>' +
//						'</ol>' +
//						'<p>保养负责人：<span>' + json[i].emp_name + '</span></p>' +
//						'<p>保养人数：<span>' + json[i].maintain_person_number + '</span></p>' +
//						'<p>到达时间：<span>' + json[i].expect_maintain_date + '</span></p>' +
//						'<p>完成时间：<span>' + json[i].finish_date + '</span></p>' +
//						'<div class="btnn"><a href="maintain.html?type=0&id=' + json[i].maintain_id + '">查看详情</a></div>' +
//						'<span class="frompath">' + json[i].from_path + '</span>'+
//						'</li>';

						if(json[i].expect_maintain_date == null || json[i].expect_maintain_date ==undefined){
							json[i].expect_maintain_date = "";
						}
						if(json[i].from_path == "" || json[i].from_path == null || json[i].from_path==undefined){
							json[i].from_path = "后台发起";
						}

						str += '<div class="infoItem">'+
							'<p>'+
								'<mark>'+json[i].from_path+'</mark>'+
								'<span class="right">'+
									'<span>'+day+" "+hour+'</span>'
								+'</span>'
							+'</p>'+
							'<div class="info">'+
								'<b class="yellow">负责人</b>'+
								'<b>'+json[i].emp_name+'</b>'+
								'<span class="blue right">保养完成</span>'
							+'</div>'+
							'<ul>'+
								'<li>'+
									'<span>保养人数</span>'+
									'<span>'+json[i].maintain_person_number+'</span>'
								+'</li>'+
								'<li>'+
									'<span>现场名称</span>'+
									'<span>'+json[i].scene_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备名称</span>'+
									'<span>'+json[i].equipment_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>设备部件</span>'+
									'<span>'+json[i].maintain_component_name+'</span>'
								+'</li>'+
								'<li>'+
									'<span>到达时间</span>'+
									'<span>'+json[i].maintain_date+'</span>'
								+'</li>'+
								'<li>'+
									'<span>完成时间</span>'+
									'<span>'+json[i].finish_date+'</span>'
								+'</li>'
							+'</ul>'+
							'<div class="btnBox">'+
								'<a href="maintain.html?type=0&id=' + json[i].maintain_id + '&scene_id='+scene_id+'&maintain_status='+maintain_status+'">'+
									'<button class="blockBox g">查看详情</button>'
								+'</a>'
							+'</div>'
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
		error: function(data) {
			layer.close(loading);
			layer.alert("加载信息失败");
		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading);
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	});
}

//现场下拉框选择
function changeScene(e){
maintain_status = $(e).val();
startNum = 0;
statusupdate = 0;
if(maintain_status == "请选择现场"){
	return;
}
if(taskBack == 'taskBack'){
	scene_id = "";
	$(".box").html("");
	getMainTainInfo(newtokenId);
	return;
}
$(".box").html("");
getMainTainInfo(newtokenId);
}
//状态下拉框选择
function changeType(e){
scene_id = $(e).val();
startNum = 0;
statusupdate = 0;
if(scene_id == "请选择状态"){
	return;
}
if(taskBack == 'taskBack'){
	maintain_status = "";
	$(".box").html("");
	getMainTainInfo(newtokenId);
	return;
}
$(".box").html("");
getMainTainInfo(newtokenId);
}
function dateConvert(d) {
	return dateformat(d, "yyyy-MM-dd HH:mm:ss")
}