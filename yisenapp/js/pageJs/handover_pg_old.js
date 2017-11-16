//存放tokenId 的
var newTokenId =null;
//巡检信息的id
var handoverId = GetQueryString("id");
//var handoverId = '3c430647-1336-4c33-9c4e-9ffcb7b19f03';
// 信息的状态  0 是完成 1 是要填写的
var type = GetQueryString("type");
//var type = '0';

$(function(){
	if(type=='0'){
		$("#sumbit").hide();
	}
	
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
			newTokenId = tokenId;
			getTitleInfo(tokenId);
			getCategory(tokenId);
//			getDetail(tokenId);
	
			});
		}else{//获取TokenId成功
			newTokenId = tokenId;	
			//加载标题的信息
			getTitleInfo(tokenId);
			//加载设备种类名称
			getCategory(tokenId);
//			getDetail(tokenId);

		} 
	});
});

function getTitleInfo(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/GetTitleInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":handoverId
        },
        timeout:30000,
   		success: function (data) {
 			layer.close(loading);
   			var title = eval("("+data.result+")");
   			if(title.length != 1){
   				layer.alert("加载标题信息错误");
   				return;
   			}
   			$(".people span").eq(1).html(title[0].handover_man_before);
   			$(".people span").eq(3).html(title[0].scene_name);
   			
   		},
   		error: function (data) {
 			layer.close(loading);
   			layer.alert("加载标题信息失败");
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

//加载设备的名称
function getCategory(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	$.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/GetCategory?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":handoverId
        },
        timeout:30000,
   		success: function (data) {
   			$("table").html("");
	 		layer.close(loading);
   			var category = eval("("+data.result+")");
   			if(category.length < 1){
   				return;
   			}
   			var arr = new Array(category.length);
   			
			var str = "";
			for(var i=0;i<category.length;i++){
				arr[i] = category[i].item_category;
				str+='<thead>'+
						'<tr style="font-weight: bold;background: #f6f8f4;" onclick="showTable(this)">'+
							'<td colspan="3">'+category[i].item_category+'</td>'+
						'</tr>'+
						'<tr class="hocontent">'+
							'<td colspan="2">设备名称</td>'+
							'<td>交接情况</td>'+
						'</tr>'+
					 '</thead>'+
					 '<tbody  class="hocontent" ></tbody>';
				
			}
			str = str.replace(/null/gi, "");
			$("table").html(str);
//			console.log(arr);
			for(var i =0;i<arr.length;i++){
				getDetail(arr[i],tokenId,i);
			}
   			
   		},
   		error: function (data) {
	 		layer.close(loading);
   			layer.alert("加载设备信息错误");
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

//加载具体的信息
function getDetail(name,tokenId,i){
		var loading=layer.load(2,{shade: [0.2,'#000'] });
		var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Handover.asmx/GetHandoverInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":handoverId,
			"category":name
        },
        timeout:30000,
   		success: function (data) {
	 		layer.close(loading);
   			var content = eval("("+data.result+")");
   			//具体的信息
// 			console.log(content);
   			//判断图片 默认是不提交的
   			var pictureUrl = "images/wrong_06.png";
// 			console.log(i);
// 			console.log($("tbody")[i]);
   			$("tbody").eq(i).html("");
			var str = "";
			for(var a=0;a<content.length;a++){
				if( content[a].handover_status=="交接成功"){
		 				pictureUrl ="images/right_ok.png";
		 			}else{
		 				pictureUrl ="images/wrong_06.png";
		 			}
				str+='<tr>'+
						'<td style="display:none">'+content[a].handover_detail_id+'</td>'+
						'<td class="combine'+i+'" name="'+content[a].item_type+'">'+content[a].item_type+'</td>'+
						'<td>'+content[a].item_name+'</td>'+
						'<td>'+
							'<img onclick="changPicture(this)"  src="'+pictureUrl+'" />'+
								'<div onclick="changeMemo(this)">'+
									'备注'+
									'<div class="window">'+
										'<p>备注：</p>'+
										'<textarea name="" rows="" cols="">'+content[a].handover_memo+'</textarea>'+
										'<div>'+
											'<button class="needHide" onclick="modifyMemo(this)">修改</button>'+
											'<button onclick="closeMemo(this)">关闭</button>'+
										'</div>'+
									'</div>'+
								'</div>'+
						'</td>'+
					'</tr>';			
			}
			//去除null 变为空字符串
			str = str.replace(/null/gi, "");
			$("tbody").eq(i).html(str);
			
   			var arr = new  Array();
   			for(var b=0;b<$(".combine"+i).length;b++){
   				arr[b] = $(".combine"+i).eq(b).attr("name") ;
   			}
// 			console.log(arr);
   			var className =".combine"+i;
   			getUniqueName(arr,className);
   			//获得name属性 $(".combine").attr("name")
   		
   			if(type=='0'){
// 				alert(1);
				$(".needHide").remove();
			}
				
   		},
   		error: function (data) {
	 		layer.close(loading);
   			layer.alert("加载标题信息失败");
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
		
function getUniqueName(arr,className){
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
//	console.log("defalut之前的位置:  "+indexArr);//0,3,5
//	console.log("新的arr:  "+arr);//需要把defalut中的选项display：none
//	console.log(map);
	//通过indexArr获得数量
	//把indexArr中的元素设置rowspan
	for(var i =0;i<indexArr.length;i++){ 
		$(className).eq(indexArr[i]).attr("rowspan",map[$(className).eq(indexArr[i]).html()]);
	}
	//把相同元素的删掉 需要反着来 
//	console.log(arr);
	if(arr.length>1){
		for(var i=arr.length-1;i>0;i--){
			//arr[i]= defalut 项display:none
			if(arr[i]=="defalut"){
	//			$(className).eq(i).remove();
				$(className).eq(i).css("display","none");
			}	
		}	
	}
}		
		
//图片的点击
function  changPicture(img){
	//如果不是已交班 暂定其实type=1 可以过来两个 type=0 提交
	if(type == '0'){
		return;
	}
	var detailId = $(img).parent().parent().find("td").eq(0).html();
	if(img.src.indexOf("wrong_06")>0){
		//将巡检的状态改为完成
		$(img).attr("src","images/right_ok.png");
		saveSelected("交接成功",detailId);
	}else{
		//将巡检的状态改为未完成
		$(img).attr("src","images/wrong_06.png");
		saveSelected("交接失败",detailId);
	}
}
function changeMemo(div){
	$(div).children().eq(0).show(0);
}
//点击修改后--保存备注信息
function modifyMemo(e){
	event.stopPropagation();
	var detailId =$(e).parent().parent().parent().parent().parent().parent().find("td").eq(0).html();
	var memo = $(e).parent().parent();
	var text = memo.find("textarea").val();
	saveMemoInfo(text,detailId);
	memo.hide(0);
}
//点击关闭后
function closeMemo(e){
	event.stopPropagation();
	$(e).parent().parent().hide(0);
}
//单条的保存信息--需要传入detailid status
function saveSelected(status,detailid){ 
	 var loading=layer.load(2,{shade: [0.2,'#000'] });
	 var ajax =$.ajax({
	        type: "post",
	        url: url+"/handler/Handover.asmx/SaveHandoverInfo?jsoncallback?",
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
	var ajax = $.ajax({
	        type: "post",
	        url: url+"/handler/Handover.asmx/saveMemoInfo?jsoncallback?",
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
	 		},
	 		error: function (data) {
	 			layer.close(loading);
   				layer.msg("保存失败");
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
//提交--需要handoverId
function sumbitInfo(){
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
	        url: url+"/handler/Handover.asmx/SumbitHandoverInfo?jsoncallback?",
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data:{
	        	"tokenId":newTokenId,
	        	"handoverId":handoverId
	        },
	        timeout:30000,
	 		success: function (data) {
	 			layer.close(loading);
	 			layer.msg("保存成功");
	 			setTimeout(function(){
	 				window.location.href="handover_info.html";
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
