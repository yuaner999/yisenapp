var newTokenId= "";
		var loginName;
		var userName ;
		var empId;
		getLoginName();
		$(function() {
			//获取TokenId，并获取用户信息
			getTokenIdLocal(function(tokenId) {
				if (tokenId == "null") { //Token过期或者首次没有Token
						getTokenIdServer(function(tokenId) { //重新获取TokenId
							newTokenId=tokenId;
							getUserName(tokenId);
							GetInfo(tokenId); //回调函数，获取用户信息
						});
				} else { //获取TokenId成功
						newTokenId=tokenId;
						getUserName(tokenId);
						GetInfo(tokenId); //回调函数，获取用户信息
				}
			});
			//  TODO   将来完善下 
			$("select").click(function(){
				$(this).find(".remove").css("display","none");
			});
		})
	function getUserName(tokenId){
		var loading = layer.load(2, {shade: [0.2, '#000']});
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/getUserName?jsoncallback?",
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
				var json = eval("(" + data.result + ")");
				$(".form>li>b").html(json[0].emp_name);
				userName=json[0].emp_name;
				empId=json[0].emp_id;
				
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
	function GetInfo(tokenId){
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
				var $scene = $("select").eq(0);
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
	//  获取 select 选中的值  $('#aa option:selected').val()
	function loadEquipment(e){
		var sceneName = $(e).val();
//		console.log($(e).val());
		var id = $("select").eq(0).val();
		if(!id){
			layer.msg("请选择现场");
			return;
		}
		//加载维修的设备
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/GetEquipmentName?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
				"id":id
			},
			timeout: 30000,
			success: function(data) {
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
//				给现场信息赋值
				var $equipment = $("select").eq(1);
				$equipment.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="" class="remove" >请选择设备</option>';
				for (var i = 0; i < json.length; i++) {
					str += '<option value="'+json[i].equipment_id+'">'+json[i].equipment_name+'</option>';
				}
				$equipment.html(str);
			},
			error: function() {
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}
	function loadComponent(e){
		var equipmentName =$(e).val();
//		console.log($(e).val());
		var id = $("select").eq(1).val();
		if(!id){
			layer.msg("请选择设备");
			return;
		}
		//加载维修的部件
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/GetComponentName?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
				"id":id
			},
			timeout: 30000,
			success: function(data) {
				if (data.status == '0') {
					layer.msg(data.result);
					return;
				}
//				给现场信息赋值
				var $component = $("select").eq(2);
				$component.html();
				var json = eval("(" + data.result + ")");
				var str = '<option value="" class="remove">请选择部件</option>';
				for (var i = 0; i < json.length; i++) {
					str += '<option  value="'+json[i].equipment_component_id+'">'+json[i].component_name+'</option>';
//					str += '<span style="padding-right:1rem" >' + result2[i].component_name + result2[i].equipment_component_code + '</span>';
				}
				$component.html(str);
			},
			error: function() {
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}
	//将所选择的信息保存到数据库
	function submit(){
		//$("select").eq(0).find("option:selected")-获得选中的option(.text .val)
		var scene_id = $("select").eq(0).find("option:selected").val();
		var scene_name = $("select").eq(0).find("option:selected").text();
		if(scene_id == "" || scene_name =="" ){
			layer.msg("请选择现场");
			return;
		}
		var equipment_id = $("select").eq(1).find("option:selected").val();
		var equipment_name =$("select").eq(1).find("option:selected").text();
		if(equipment_id == "" || equipment_name==""){
			layer.msg("请选择设备");
			return;
		}
		
		var equipment_component_id =$("select").eq(2).find("option:selected").val();
		var component_name =$("select").eq(2).find("option:selected").text();
//		var equipment_component_id =$("select").eq(2).find("option:selected").attr("name");
		if(equipment_component_id == "" || component_name== "" ){
			layer.msg("请选择部件");
			return;
		}
		var jsonData='{"scene_id":"'+scene_id+'","scene_name":"'+scene_name+'","equipment_id":"'+equipment_id+'","equipment_name":"'+equipment_name+'",'+
		'"equipment_component_id":"'+equipment_component_id+'","component_name":"'+component_name+'","emp_id":"'+empId+'",'+
		'"emp_name":"'+userName+'","report_create_man":"'+userName+'"}';
//		var jsonData = jsonData1.toString();
//		console.log(jsonData);
//		var jsons = eval(jsonData);
//		alert(typeof jsons);
//		console.log(typeof jsonData);
		var ajax = $.ajax({
			type: "post",
			url: url + "/handler/Repair.asmx/SaveSelectedInfo?jsoncallback?",
			dataType: "jsonp",
			jsonp: 'jsoncallback',
			data: {
				"tokenId": newTokenId,
//				"sceneName":sceneName,
//				"equName":equName,
//				"comName":comName
				"jsonData":jsonData
			},
			timeout: 30000,
			success: function(data) {
//				console.log(typeof data.status );
				if (data.status == 0) {
					layer.msg(data.result);
					return;
				}
				layer.msg("保存成功");
					setTimeout(function(){
	        			$("body").fadeOut("fast",function(){
	        				window.location = "repair_info.html";
//						window.location ="orderTime.html?type=2&id="+ data.result ;
	        			});
	        		},1314);

			},
			error: function() {
				layer.msg("服务器连接失败");
			},
			complete: function(XMLHttpRequest, status) {
				if (status == 'timeout') { //超时,status还有success,error等值的情况
					ajax.abort(); //取消请求
					layer.msg("请求超时");
				}
			}
		});
	}