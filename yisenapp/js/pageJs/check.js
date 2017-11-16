var newTokenId =null;
//巡检信息的id
var checkId = GetQueryString("id");
//  0 不可改 1 可改
var type = GetQueryString("type");
var kgOnInf = "";
var statusButton = "";
var beizhu_inf = "";
var check_status = GetQueryString("check_status");
var check_type1 = GetQueryString("check_type");
var scene_id = GetQueryString("scene_id");
$(function(){
	init();
});
function tiaozhuan(){
//  window.history.back(-1);
	window.location.href = "check_info.html?check_status="+check_status+"&check_type="+check_type1+"&scene_id="+scene_id+"&taskBack=taskBack";
}
//初始化页面
function init(){
	if(type=='0'){
		$("#sumbit").hide();
	}
	else{
		statusButton = "radius";
	}
	if(type=='0'){
		$(".mui-title").html("查看详情");
		statusButton = "radius disable";
	}else{
		statusButton = "radius";
	}
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
			newTokenId = tokenId;	
			getTitleInfo(tokenId);
			getPositionName(tokenId);
	
			});
		}else{//获取TokenId成功
			newTokenId = tokenId;	
			getTitleInfo(tokenId);
			getPositionName(tokenId);

		} 
	});
}

//
////获得标题部分的信息
function getTitleInfo(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Check.asmx/GetTitleInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":checkId
        },
        timeout:30000,
   		success: function (data) {
	 		layer.close(loading);
// 			var title = eval("("+data.result+")");
   			var text = data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
		 	var title = eval("(" + text + ")");
   			if(title.length != 1){
   				layer.alert("加载巡检信息错误");
   				return;
   			}
// 			$(".top span").html(title[0].check_name);
   			$(".xunjianrenname").html(title[0].check_emp_name);
   			$("#xunjianshijian").html(title[0].check_datetime_set);
   			$(".xianchangname").html(title[0].scene_name);
   		},
   		error: function (data) {
	 		layer.close(loading);
   			layer.msg("加载信息失败");
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
////获得点检位置的名称
function getPositionName(tokenId){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
	 	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Check.asmx/GetPositionName?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"checkId":checkId
        },
        timeout:30000,
   		success: function (data) {
	 			layer.close(loading);
   			var json = eval("("+data.result+")");
// 			console.log(json);
   			loadTableInfo(json,tokenId);
   		},
   		error: function (data) {
	 		layer.close(loading);
   			layer.msg("加载信息失败");
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
//记载具体的信息
function loadTableInfo(json,tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Check.asmx/GetOtherinfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"checkId":checkId,
			"tokenId":tokenId
        },
        timeout:30000,
   		success: function (data) {
	 			layer.close(loading);
	 			var text = data.result.replace(/\n/g,"\\n").replace(/\\r/g, "\\r");
 			 	var result = eval("(" + text + ")");

// 			var result = eval("("+data.result+")");
   			
   			//具体的信息
// 			console.log(result);
   			//点检位置名称
// 			console.log(json);
   			//判断图片 默认是不提交的
   			var pictureUrl = "images/wrong_06.png";
   			//跟据点检位置的名称确认其数量
   			var map = getRowspan(json,result);// {除尘设备: 2, 出身设备: 1}
			var length  = Object.keys(map).length //2
   			//清空表格中的所有数据
   			$("#tbody").html("");
//			var value = map[key]; // Object value = map.get(key);
			var str = "";
			var  index = 0;
   			for(var a=0;a<length;a++){
   				var infoFlag = true;
	   			for(var b=0;b<map[json[a].item_position];b++){
	   				//下脚标
					var i = index + b; 
					if( result[i].check_status=="通过"){
		 				kgOnInf = "kg on";
		 			}else{
		 				kgOnInf = "kg off";
		 			}
   					if(infoFlag){
   						
//					if(num == map[json[a].item_position]){
				 		str  +=	'<tr>'+
				 					'<td style="display:none">'+result[i].check_detail_id+'</td>'+
				 					'<td style="display:none">'+result[i].check_memo+'</td>'+
									'<td rowspan="'+map[result[i].item_position]+'">'+result[i].item_position+'</td>'+
									'<td class="secondStage'+a+'">'+result[i].item_component+'</td>'+
									'<td>'+result[i].item_content+'</td>'+
									'<td>'+result[i].item_method+'</td>'+
									'<td>'+result[i].item_standard+'</td>'+
									'<td>'+
//										'<img onclick="changPicture(this)"  src="'+pictureUrl+'" />'+
//										'<div onclick="changeMemo(this)">'+
//											'备注'+
//											'<div class="window">'+
//												'<p>备注：</p>'+
//												'<textarea name="" rows="" cols="">'+result[i].check_memo+'</textarea>'+
//												'<div>'+
//													'<button class="needHide" onclick="modifyMemo(this)">修改</button>'+
//													'<button onclick="closeMemo(this)">关闭</button>'+
//												'</div>'+
//											'</div>'+
//										'</div>'+
										'<div class="'+kgOnInf+'" onclick="changPicture(this)">'+
													'<i class="icon"></i>'
												+'</div>'+
												'<span class="radius" onclick="btnInf(this)">备注</span>'
										'</td>'+ 
								'</tr>';
						infoFlag=false;
					}else{ 
						str  +=	'<tr>'+
									'<td style="display:none">'+result[i].check_detail_id+'</td>'+
									'<td style="display:none">'+result[i].check_memo+'</td>'+
									'<td style="display:none">'+result[i].item_position+'</td>'+
									'<td class="secondStage'+a+'">'+result[i].item_component+'</td>'+
									'<td>'+result[i].item_content+'</td>'+
									'<td>'+result[i].item_method+'</td>'+
									'<td>'+result[i].item_standard+'</td>'+
									'<td>'+
//										'<img onclick="changPicture(this)"  src="'+pictureUrl+'" />'+
//										'<div onclick="changeMemo(this)">'+
//											'备注'+
//											'<div class="window">'+
//												'<p>备注：</p>'+
//												'<textarea name="" rows="" cols="">'+result[i].check_memo+'</textarea>'+
//												'<div>'+
//													'<button class="needHide" onclick="modifyMemo(this)">修改</button>'+
//													'<button onclick="closeMemo(this)">关闭</button>'+
//												'</div>'+
//											'</div>'+
												'<div class="'+kgOnInf+'" onclick="changPicture(this)">'+
													'<i class="icon"></i>'
												+'</div>'+
												'<span class="radius" onclick="btnInf(this)">备注</span>'
										'</div>'+
									'</td>'+
								'</tr>';
					}
		 		}
	   			index += map[json[a].item_position];
   			}
   			str = str.replace(/null/gi, "");
   			$("#tbody").html(str);
   			
   			$(".radius").off("click");
			$(".radius").on("click",function  () {
				var detailId = $(this).parent().parent().find('td:eq(0)').html()
				var memo = $(this).parent().parent().find('td:eq(1)').html()
				
				$(".window .dialog .txtBox textarea").val(memo)
				windowFilp(memo,".window", function() {
					var text = $(".window .dialog .txtBox textarea").val();
					//修改备注
					saveMemoInfo(text, detailId);
					init();
				}, function() {
					//关闭回调
				});
			});
   			
   			
   			//判断第二级 class为secondStage+a
// 			console.log($(".secondStage0").html());
   			//获取的值的方法   $().eq().html()
			for(var a=0;a<length;a++){
   			var arr = new  Array();
   			for(var i=0;i<map[json[a].item_position];i++){
   				arr[i] = $(".secondStage"+a).eq(i).html();
   			}
   			if(type=='0'){
				$(".needHide").remove();
			}
   			//把第二级处理掉
   			getUniqueName(arr,a);
   			}
   			
   		},
   		error: function (data) {
 			layer.close(loading);
   			layer.alert("加载失败");
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
//点击备注弹窗
function btnInf(e){
	if(type=='1'){
		$(".window").show();
		beizhu_inf = $(e).parent().parent().find("td").eq(0).html();
	}
	if(type=='0'){
		$(".window").show();
		$("#changeButtonStatus").attr("disabled",true).hide();
		$("#textareaInf").attr("disabled",true);
		beizhu_inf = $(e).parent().parent().find("td").eq(0).html();
	}
}
//跟据点检位置的名称确认其数量
function getRowspan(json,result){
	var map = {}; // Map map = new HashMap();
	for(var i=0;i<json.length;i++){
		var name = json[i].item_position;
		var num = 0;
		for(var j=0;j<result.length;j++){
			var eName = result[j].item_position;
			if(name == eName){
				num++;
			}
		}
		map[name] = num;
	}
	return map;
}
//  第二级的处理
function getUniqueName(arr,a){
//	console.log(arr);
	//判断元素str是否在数组中 arr.indexOf(str);
//	console.log(arr.indexOf("泵壳"));
	var map = {};
	var indexArr = new  Array();//存放首个位置
	var arr2 = new Array();//存放相同的长度
	var index2 = 0;
	for(var i=0;i<arr.length;i++){
		var index = 1;
		for(var j=i+1;j<arr.length;j++){
			if(arr[i] == 'defalut'){continue;}
			if(arr[i]==arr[j] ){
				index++;
				arr[j] = "defalut";
				if(index==2){
					indexArr[index2] = i;
					index2++;
				}
			}
			if(index != 1 && arr[i] != 'defalut' ){
			map[arr[i]] = index;
			}
		}
	}
//	console.log(indexArr);//0,3,5
//	console.log(arr);//需要把defalut中的选项display：none
//	console.log(map);
	//通过indexArr获得数量
	//把indexArr中的元素设置rowspan
	for(var i =0;i<indexArr.length;i++){ 
		$(".secondStage"+a).eq(indexArr[i]).attr("rowspan",map[$(".secondStage"+a).eq(indexArr[i]).html()]);
	}
	//把相同元素的删掉 需要反着来 
//	console.log(arr);
	if(arr.length>1){
		for(var i=arr.length-1;i>0;i--){
			//arr[i]= defalut 项display:none
			if(arr[i]=="defalut"){
//				console.log(i);
	//			$(".secondStage"+a).eq(i).remove();
				$(".secondStage"+a).eq(i).css("display","none");
			}	
		}	
	}
}
//图片的点击
function  changPicture(e){
	//如果不是已交班 暂定其实type=1 可以过来两个 type=0 提交
	if(type == '0'){
		return;
	}
	var detailId = $(e).parent().parent().find("td").eq(0).html();
	if($(e).hasClass("kg off")) {
		$(e).removeClass("kg off").addClass("kg on");
		saveSelected("通过", detailId);
	} else {
		$(e).removeClass("kg on").addClass("kg off");
		saveSelected("不通过", detailId);
	}
}
function changeMemo(div){
	$(div).children().eq(0).show(0);
}
//点击修改后--保存备注信息
function modifyMemo(e){
	event.stopPropagation();
//	var detailId1 = $(e).parent().parent().parent().parent().parent().find("td").eq(0).html();
//	var detailId = $("#tbody").find("tr").eq(0).find("td").eq(0).html();
//	var detailId = $(e).parent().parent().parent().next("div").find("table").find("tbody").
//	console.log(detailId1)
	console.log(beizhu_inf)
	var text = $(e).parent().parent().find("div").eq(0).find("textarea").val();
	console.log(text)
	saveMemoInfo(text,beizhu_inf);
	$(".window").hide();
}
//点击关闭后
function closeMemo(e){
	event.stopPropagation();
	$("#textareaInf").val("");
	$(".window").hide();
}
//单条的保存信息--需要传入detailid status
function saveSelected(status,detailid){ 
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
	        type: "post",
	        url: url+"/handler/Check.asmx/SaveCheckInfo?jsoncallback?",
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data:{
	        	"tokenId":newTokenId,
	        	"status":status,
	        	"detailid":detailid
	        },
	        timeout:30000,
	 		success: function (data) {
	 			layer.close(loading);
//	 			layer.msg("保存成功");
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.msg("保存失败!请稍后再试");
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
//
//保存备注信息
function saveMemoInfo(content,detailid){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	$.ajax({
	        type: "post",
	        url: url+"/handler/Check.asmx/saveMemoInfo?jsoncallback?",
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data:{
	        	"tokenId":newTokenId, 
	        	"content":content,
	        	"detailid":detailid
	        },
	        timeout:30000,
	 		success: function (data) {
	 			layer.close(loading);
	 			layer.msg("修改成功");
	 			$("#textareaInf").val("");
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.msg("修改失败");
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
//提交--需要checkid
function sumbitInfo(checkid){
	layer.confirm('确定要提交吗？提交之后就不可以修改', {
			title :"友情提示",
		    btn: ['提交','取消'], //按钮
		    shade: 0//不显示0shade: [0.8, '#393D49']
		}, function(index){
		    sendAjax();
		    layer.close(index);
		});

}
function sendAjax(){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ajax = $.ajax({
	        type: "post",
	        url: url+"/handler/Check.asmx/SumbitCheckInfo?jsoncallback?",
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data:{
	        	"tokenId":newTokenId,
	        	"checkid":checkId
	        },
	        timeout:30000,
	 		success: function (data) { 
	 			layer.close(loading);
	 			layer.msg("保存成功");
	 			setTimeout(function(){
	 				window.location.href="check_info.html";
	 			},1314)
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.alert("提交失败");
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
