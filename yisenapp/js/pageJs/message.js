var sceneId = null;
var id = GetQueryString("id");
var loginName = "";
$(function() {
		getLoginName();
		//	getSceneId();		
			$("#submit").hide();
//			var onlyread = $("<div></div>").appendTo($("body"));
//			$(onlyread).css({
//				"width": "100%",
//				"height": "100vh",
//				"position": "fixed",
//				"top": "3rem",
//				"left": "0",
//				"z-index": "999999999"
//			});		
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
	})
	//加载的信息
function getCompleteInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Messages.asmx/GetMessagesDetail?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"mid": id
		},
		timeout: 30000,
		success: function(data) {			
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("这条消息不存在");
				$("ul,ol,button").hide();
				return;
			}			
			var jsonmessage = eval("(" + data.result + ")");
			var str="";
			if(jsonmessage.length>0)
			{
				$.ajax({
						type: "post",
						url: url + "/handler/Messages.asmx/getMessageRepair?jsoncallback?",
						dataType: "jsonp",
						jsonp: 'jsoncallback',
						async:false,
						data: {
							"tokenId": tokenId,
							"id": id
						},
						timeout: 10000,
						success: function(datadetail) {
	//				str += '<div>'+'<li><span>创建时间：</span><span>'+jsonmessage[0].message_time+'</span></li></div>'+
	//					   '<div>'+'<li><span>消息标题：</span><span>'+jsonmessage[0].message_title+'</span></li></div>'+
	//					   '<div>'+'<li><span>内容：</span><textarea id="editor_id" style="width:auto"">'+jsonmessage[0].message_content+'</textarea></li></div>';
	//					   //'<div style="padding:10px; font-size:0.6rem;">'+'<li><span></span><a>&nbsp;&nbsp;&nbsp;&nbsp;'+jsonmessage[0].message_content+'</a></li></div>';
	//				$("#message_detail").append(str);
					if(jsonmessage[0].scene_name !='' && jsonmessage[0].scene_name != null){
						str +="<div class='itemInfo'><div class='left green justify'>现场名称：</div>"+"<span>"+jsonmessage[0].scene_name+"</span></div>";
					}
					if(jsonmessage[0].equipment_name !='' && jsonmessage[0].equipment_name != null){
						str +="<div class='itemInfo'><div class='left green justify'>设备名称：</div><span>"+jsonmessage[0].equipment_name+"</span></div>";
					}
					if(jsonmessage[0].component_name !='' && jsonmessage[0].component_name != null){
						str +="<div class='itemInfo'><div class='left green justify'>部件名称：</div><span>"+jsonmessage[0].component_name+"</span></div>";
					}	
					str+="<div class='itemInfo'><div class='left green justify'>详 情：</div><div class='txt' readonly>"+jsonmessage[0].message_content+"</div></div>";
					
					if(jsonmessage[0].message_type == '管理员保养提醒' || jsonmessage[0].message_type== '保养'){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='maintain.html?type=0&id" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看保养详情</button></a>"
		    		}else if(jsonmessage[0].message_type == '管理员报修提醒' || jsonmessage[0].message_type== '报修'){
		    			
						if (datadetail.status == '1') {
							var jsondetail = eval("(" + datadetail.result + ")");
							if(jsondetail.length>0)
							{
								str +="<div class='itemInfo'><div class='left green justify'>报修来源：</div><span>"+jsondetail[0].from_path+"</span></div>";
								if(jsondetail[0].from_path=="报警")
								{
									str +="<div class='itemInfo'><div class='left green justify'>说明：</div><span>"+jsondetail[0].memo+"</span></div>";
									str +="<div class='itemInfo'><div class='left green justify'>报警类型：</div><span>"+jsondetail[0].Type+"</span></div>";
									str +="<div class='itemInfo'><div class='left green justify'>报警值：</div><span>"+jsondetail[0].Value+"</span></div>";
									str +="<div class='itemInfo'><div class='left green justify'>报警时间：</div><span>"+jsondetail[0].Time+"</span></div>";
								}
								else if(jsondetail[0].from_path=="故障")
								{
									str +="<div class='itemInfo'><div class='left green justify'>说明：</div><span>"+jsondetail[0].memo+"</span></div>";
									str +="<div class='itemInfo'><div class='left green justify'>故障时间：</div><span>"+jsondetail[0].Time+"</span></div>";

								}
							}
						}
						str+="<div class='btnBox'>";
		    			str+="	<a href='repair.html?type=0&id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看报修详情</button></a>"
		    		}else if(jsonmessage[0].message_type == '管理员巡检提醒' || jsonmessage[0].message_type== '巡检'){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='check.html?type=0&id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看巡检详情</button></a>"
		    		}else if((jsonmessage[0].message_type== '交班' && jsonmessage[0].message_title == '接班人已同意接班') 
		    					|| (jsonmessage[0].message_type== '交班' && jsonmessage[0].message_title == '接班人不同意接班')){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='handover_homepg2.html?type=0&id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看交班详情</button></a>"
		    		}else if(jsonmessage[0].message_type== '接班' && jsonmessage[0].message_title == '请按时接班'){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='handover_homepg.html?type=1&id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看接班详情</button></a>"
		    		}else if(jsonmessage[0].message_type== '管理员交接班提醒' && jsonmessage[0].message_title == '接收到一条成功交接班消息'){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='handover_homepg.html?type=0&id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看接班详情</button></a>"
		    		}else if(jsonmessage[0].message_type== '管理员交接班提醒' && jsonmessage[0].message_title == '接收到一条保存交班信息消息')	{
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='handover2.html?handoverid=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看交班提醒</button></a>"
		    		}else if(jsonmessage[0].message_type == '任务'){
		    			str+="<div class='btnBox'>";
		    			str+="	<a href='task.html?id=" + jsonmessage[0].message_order_id + "'><button class='blockBox g'>查看任务详情</button></a>"
		    		}
		    		str+="</div>";
					$(".info").html(str);
					InitKindeitor();
					},
					error: function() {
					},
					complete: function(XMLHttpRequest, status) {
						if (status == 'timeout') { //超时,status还有success,error等值的情况
							ajax.abort(); //取消请求
							layer.msg("请求超时");
						}
					}
				});
			}						
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

function GetMaintainInfo(tokenId) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/GetMaintainInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"id": id
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			if (data.status == '0') {
				layer.msg("保养信息不存在");
				$("ul,ol,button").hide();
				return;
			}
			var json = eval("(" + data.result + ")");
			if (data.status == 1) {

				$(".form").find("span").eq(1).html(json[0].maintain_create_datetime);
				$(".form").find("span").eq(3).html(json[0].maintain_date);
				$(".form").find("span").eq(5).html(json[0].scene_name);
				$(".form").find("span").eq(8).html(json[0].emp_name);
				$(".text").find("span").eq(0).html(json[0].equipment_name);
				$(".text").find("span").eq(1).html(json[0].maintain_component_name);
			}
			var str = "";
			$("#equ").html("");
			for (var i = 0; i < json.length; i++) {
				str += '<p><input type="checkbox" name="equid" value="' + json[i].equipment_component_id + '" />' + json[i].component_name +json[i].equipment_component_code + '</p> ';
			}
			$("#equ").html(str);
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

function Submit() {
	var equi = "";
	$("input:checkbox[name='equid']:checked").each(function() {
		equi += $(this).val() + ",";
	});
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				DealMaintainInfo(tokenId, equi); //回调函数，获取用户信息
			});
		} else { //获取TokenId成功
			DealMaintainInfo(tokenId, equi); //回调函数，获取用户信息
		}
	});
}

function DealMaintainInfo(tokenId, equi) {
	var loading = layer.load(2, {
		shade: [0.2, '#000']
	});
	var count = $("#count").val();
	var solu = $(".text").find("textarea").eq(0).val();
	var empname = $(".form").find("span").eq(8).html();

	var ajax = $.ajax({
		type: "post",
		url: url + "/handler/Maintain.asmx/DealMaintainInfo?jsoncallback?",
		dataType: "jsonp",
		jsonp: 'jsoncallback',
		data: {
			"tokenId": tokenId,
			"count": count,
			"equi": equi,
			"solu": solu,
			"id": id,
			"empname": empname,
			//			"date":date1
		},
		timeout: 30000,
		success: function(data) {
			layer.close(loading);
			layer.msg(data.result, {
				shift: -1
			}, function() {
				window.location.href = "maintain_info.html";
			});
		},
		error: function() {
			layer.close(loading);
			layer.msg("加载信息失败");

		},
		complete: function(XMLHttpRequest, status) {
			layer.close(loading); //关闭加载层
			if (status == 'timeout') { //超时,status还有success,error等值的情况
				ajax.abort(); //取消请求
				layer.msg("请求超时");
			}
		}
	})
}