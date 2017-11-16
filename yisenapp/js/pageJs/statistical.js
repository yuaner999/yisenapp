//现场ID
var sceneId = null;
//设备ID
var equipmentId = "";
//采集点地址
var point_id="";
//加载层
var load = null;
//系统当前时间
var now = new Date();
//获取TokenId时间
var tokenTime = null;
//折线图的数据
var data;
//日期的类型
var timeflag = getNowFormatDate(); 
//系统时间
var mydate = new Date();
//柱状图查询的天数
var dayCount=7;
$(function(){
	getSceneId();
//	var url = 'homepage.html?sid='+sceneId+'';
//	$(".on a").attr("href",url);//添加URL链接 
//	var url1 = 'report.html?sid='+sceneId+'';
//	$("#rep").attr("href",url1);//添加URL链接 
	//加载层
	load = layer.load(2,{shade: [0.2,'#000'] });
	$("#cline").click(function(){
		GetLine();
		$("#ChartLine").show();
		$("#Histogram").hide();
		$("#Pie").hide();
	})
	$("#cbar").click(function(){
		GetBar();
		$("#ChartLine").hide();
		$("#Histogram").show();
		$("#Pie").hide();
	})
	$("#cpie").click(function(){
		GetPie();
		$("#ChartLine").hide();
		$("#Histogram").hide();
		$("#Pie").show();
	})
	$("#day").click(function(){
		//点击触发事件
	timeflag=$(".on p").text();//获取当前时间
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getAllEquipments(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			getAllEquipments(tokenId);//回调函数，获取全部设备
		}
	});

	})
	$("#month").click(function(){
		
		//点击触发事件
		getTokenIdLocal(function(tokenId){
			timeflag=GetTimeType();
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getAllEquipments(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			getAllEquipments(tokenId);//回调函数，获取全部设备
		}
	});
	})
	$("#year").click(function(){
		
		//点击触发事件
	getTokenIdLocal(function(tokenId){
		timeflag=GetTimeType();
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getAllEquipments(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			getAllEquipments(tokenId);//回调函数，获取全部设备
		}
	});
	})
	$(".day li a").click(function(){
		//获取日历选择的日期
	var d = this.innerHTML;
	var m = $(".month").find("option:selected").html();
	var y = $(".year").find("option:selected").html();
	timeflag = y+"-"+m+"-"+d;
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetDetailInfo2(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			GetDetailInfo2(tokenId);//回调函数，获取全部设备
		}
	});
	})
	//获取TokenId，并获取用户信息
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getAllEquipments(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			getAllEquipments(tokenId);//回调函数，获取全部设备
		}
	});
});
//获取当前现场的全部设备
function getAllEquipments(tokenId){	
	tokenTime = now.getTime();
	if(tokenId == "close"){//回调过程中出错
		layer.close(load);//关闭加载层
		return;
	}
 	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetAllEquipments?jsoncallback?",
        async : false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
			"scene_id":sceneId
        },
        timeout:30000,
        success: function (data) {
        	layer.close(load);//关闭加载层
            if(data.status==1){//获取成功
            	$(".check").html("");
            	var json = eval("("+data.result+")");
            	equipmentId = json[0].equipment_id;
            	//绑定设备信息
            	var equipmentStr = "";
            	for(var i=0;i<json.length;i++){
            		equipmentStr +='<li><a href="javascript:void(0)" id="'+json[i].equipment_id+'" onclick="loadPointData(this.id)">'+json[i].equipment_name+'<img src="images/check_07.png"/></a></li>';
            	}
            	$(".check").append(equipmentStr);
            	//选框
            	$(".check li").eq(0).find("img").fadeIn(0);
				$(".check li").eq(0).css("border-color","#017d7b");
				$(".check li").click(function  () {
					$(this).siblings().find("img").fadeOut(0);
					$(this).siblings().css("border-color","#b0b0b0");
					$(this).find("img").fadeIn(0);
					$(this).css("border-color","#017d7b");
				})
            	//加载设备数据
//          	json[i].equipment_id
            	getPointData(tokenId);
            }else{
            	layer.msg(data.result);
            }
        },
        error:function(data){
        	layer.close(load);//关闭加载层
        	layer.msg("获取设备信息失败");
        },
        complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
        	layer.close(load);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
            }
        }
    });
}
function loadPointData(id){
	equipmentId = id;
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				getPointData(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			getPointData(tokenId);//回调函数，获取全部设备
		}
	});
}
//获取设备的部件采集数据信息
function getPointData(tokenId){
	var nowTime = now.getTime();
	if(nowTime-tokenTime>6000000){//大于100分钟，TokenId过期
		//重新获取TokenId
		getTokenIdLocal(function(tokenId){
			if(tokenId=="null"){//Token过期或者首次没有Token
				getTokenIdServer(function(tokenId){//重新获取TokenId
					tokenTime = now.getTime();
					getPointData(tokenId);//回调函数，获取全部设备
				});
			}else{//获取TokenId成功
				tokenTime = now.getTime();
				getPointData(tokenId);//回调函数，获取全部设备
			}
		});
	}else{//没过期
		var ajax = $.ajax({
	        type: "post",
	        url: url+"/handler/Scene.asmx/GetPointData?jsoncallback?",
	        async : false,
	        dataType: "jsonp",
	        jsonp: 'jsoncallback',
	        data: {
	        	"tokenId":tokenId,
				"equipment_id":equipmentId
	        },
	        timeout:30000,
	        success: function (data) {
	            if(data.status==1){
	            	//获取成功
	            	var json = eval("("+data.result+")");
	            	for(var i=0;i<json.length;i++){	
	            		//判断数据类型
	            		if(json[i].采集点类型!="模拟值"){	
	            			
	            		}else{
	            			point_id = json[i].采集点ID;
	            			break;
	            		}
	            	}
	            	//更新数据
	            	var pointDataValue = "";
	            	for(var i=0;i<json.length;i++){	            		
	            		if(json[i].采集点类型!="模拟值"){	
	            		}else{	 
	            			pointDataValue += '<li style="width: 50%;"><a href="javascript:void(0)" id="'+json[i].采集点ID+'" onclick="LoadDetailInfo(\''+json[i].采集点ID+'\')"><img src="images/radius0.png"/><span>'+json[i].采集点名称1+'</span></li>';
//	            			pointDataValue += '<li style="width: 50%;"><a href="javascript:void(0)" id="'+json[i].采集点ID+'" onclick="LoadDetailInfo(\''+json[i].采集点ID+'\')"><img src="images/radius0.png"/><span>'+json[i].采集点名称1+'('+json[i].部件名称+')'+'</span></li>';
	            		}
	            	}
	            	$(".color").html(pointDataValue);
	            	$(".color li").eq(0).find("img").attr("src","images/radius"+(parseInt(Math.random()*6)+1)+".png");
					$(".color li").click(function  () {
						$(this).siblings().find("img").attr("src","images/radius0.png");
						var num=parseInt(Math.random()*6)+1;
						$(this).find("img").attr("src","images/radius"+num+".png");
					})
	            	GetDetailInfo(tokenId);
	            }else{
	            	layer.msg(data.result);
	            	$("#ChartLine").remove();
        			$("#Histogram").remove();
	            }
	        },
	        error:function(data){
	        	layer.msg("刷新数据失败");
	        },
	        complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
	            if(status=='timeout'){//超时,status还有success,error等值的情况
	                ajax.abort(); //取消请求
	                layer.msg("请求超时");
	            }
	        }
	    });
	}
}
function LoadDetailInfo(id){	
	point_id = id;
	getTokenIdLocal(function(tokenId){
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetDetailInfo(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			GetDetailInfo(tokenId);//回调函数，获取全部设备
		}
	});
}
function GetTimeType(){
	//获取选择的是年？月？日
	if($(".ani").html()=="日"){
		timeflag = getNowFormatDate();
	}else{
		if($(".ani").html()=="月"){
			timeflag=getNowFormatMonth();
		}else{
			timeflag=mydate.getFullYear();
		}	
	}
	return timeflag;
}
function GetDetailInfo(tokenId){
	tokenTime = now.getTime();
	if(tokenId == "close"){//回调过程中出错
		layer.close(load);//关闭加载层
		return;
	}
	console.log(timeflag);
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetDetailInfo?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
        	"point_id":point_id,
        	"equipmentId":equipmentId,
        	"time":timeflag
        },
        timeout:30000,
        success: function (data) {
        	layer.close(load);//关闭加载层
            if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");                			
       			//折线图数据源
	   		var data = {
				labels : [""],
				datasets : 	[
						{
							fillColor : "transparent",
							strokeColor : "#ef7c1f",
							pointColor : "#ef7c1f",
							pointStrokeColor : "#ef7c1f",
							data : [0]
						}
					]
				}		
				//填充数据				
					for(var i=0;i<json.length;i++){   
						if(json[i].value!=="0.000"){
							//获取选择的是年？月？日
							if($("#query").find(".ani").html()=="日"){
								var data_time = json[i].data_time;
								var hour= data_time.split(" ")[1].split(":")[0];
//								console.log(data_time);
//								console.log(hour);
								data.labels[i]=hour+'h';
//								data.labels =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
									data.datasets[0].data[i]=json[i].value;
							}else if($("#query").find(".ani").html()=="月"){
//									data.labels =[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
										var day = json[i].time.split("/")[2];
										data.labels[i]=day+"号";
										
										data.datasets[0].data[i]=json[i].value;
								}else{
//									data.labels =[1,2,3,4,5,6,7,8,9,10,11,12];
										data.datasets[0].data[i]=json[i].value;
							}
							//需要真正的数据然后进行调整
						}else{
							return;
						}
//						data.datasets[0].data[i]=json[i].value;										
					}
				$("#ChartLine").remove();//防止重复绘图
				$("#Histogram").remove();
				var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
				var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
				$(".chart_line_div").html(canvas+canvas2);				
				chart(data);
//				chart2(data);
				if($("#hh2").find("li.ani").html()=="折线图"){
					$("#ChartLine").show();
					$("#Histogram").hide();
				}else{
					$("#ChartLine").hide();
					$("#Histogram").show();
				}			
            		//加载数据            	
            	
            }else{
            	layer.msg(data.result);
            	$("#ChartLine").remove();
        		$("#Histogram").remove();
            }
        },
        error:function(data){
        	layer.close(load);//关闭加载层
        	layer.msg("获取设备信息失败");
        },
        complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
        	layer.close(load);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
            }
        }
    });
}
//折线图
function GetDetailInfo2(tokenId){
	tokenTime = now.getTime();
	if(tokenId == "close"){//回调过程中出错
		layer.close(load);//关闭加载层
		return;
	}
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetDetailInfo?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
        	"point_id":point_id,
        	"equipmentId":equipmentId,
        	"time":timeflag
        },
        timeout:30000,
        success: function (data) {
        	layer.close(load);//关闭加载层
            if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");                			
       			//折线图数据源
	   		var data = {
				labels : [""],
				datasets : 	[
						{
							fillColor : "transparent",
							strokeColor : "#ef7c1f",
							pointColor : "#ef7c1f",
							pointStrokeColor : "#ef7c1f",
							data : [0]
						}
					]
				}		
				//数据				
					//填充数据				
					for(var i=0;i<json.length;i++){   
						if(json[i].value!=="0.000"){
								//获取选择的是年？月？日
							if($("#query").find(".ani").html()=="日"){
								var data_time = json[i].data_time;
								var hour= data_time.split(" ")[1].split(":")[0];
								data.labels[i]=hour+'h';
								data.datasets[0].data[i]=json[i].value;
							}else if($("#query").find(".ani").html()=="月"){
									var day = json[i].time.split("/")[2];
									data.labels[i]=day+"号";
									data.datasets[0].data[i]=json[i].value;
							}else{
									data.labels =[1,2,3,4,5,6,7,8,9,10,11,12];
									data.datasets[0].data[i]=json[i].value;
							}
							//需要真正的数据然后进行调整
						}
															
					}
				$("#ChartLine").remove();//防止重复绘图
				$("#Histogram").remove();
				var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
				var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
				$(".chart_line_div").html(canvas+canvas2);				
				chart(data);
//				chart2(data);
				if($("#hh2").find("li.ani").html()=="折线图"){
					$("#ChartLine").show();
					$("#Histogram").hide();
				}else{
					$("#ChartLine").hide();
					$("#Histogram").show();
				}
            }else{
            	layer.msg(data.result);
            	$("#ChartLine").remove();
        		$("#Histogram").remove();
            }
        },
        error:function(data){
        	layer.close(load);//关闭加载层
        	layer.msg("获取设备信息失败");
        },
        complete:function(XMLHttpRequest,status){ //请求完成后最终执行参数
        	layer.close(load);//关闭加载层
            if(status=='timeout'){//超时,status还有success,error等值的情况
                ajax.abort(); //取消请求
                layer.msg("请求超时");
            }
        }
    });
}
//绘图
document.addEventListener('plusready', function(){
	   			//console.log("所有plus api都应该在此事件发生后调用，否则会出现plus is undefined。"
	   	});	   		
			//折现对象
			var chartLine = null;
			function chart(data){				
				//获取Canvas对象
				
				var ctx = null;
				ctx = document.getElementById("ChartLine").getContext("2d");
				chartLine = new Chart(ctx).Line(data);
				//添加事件
				initEvent(chartLine, clickCall);
			}
			//折现对象
			var Histogram = null;
			function chart2(data){		
				//获取Canvas对象
				var ctx = document.getElementById("Histogram").getContext("2d");
				Histogram = new Chart(ctx).Bar(data);
			}
			//Pie
			var Pie1 = null;
			function chart3(data){		
				//获取Canvas对象
				var ctx = document.getElementById("Pie").getContext("2d");
				Pie1 = new Chart(ctx).Pie(data);
			}
			//点击事件
			function clickCall(evt) {
				var point = chartLine.getPointSingleAtEvent(evt);
				if ( point !== null ){
					$("#Label").text(point.label);
					$("#LineItemName").text(point.lineItemName);
					$("#Value").text(point.value);
				}
			}
			//添加事件
			function initEvent(chart, handler) {
				var method = handler;
				var eventType = "click";
				var node = chart.chart.canvas;
				if (node.addEventListener) {
					node.addEventListener(eventType, method);
				} else if (node.attachEvent) {
					node.attachEvent("on" + eventType, method);
				} else {
					node["on" + eventType] = method;
				}
			}
			$(function(){
				$("body").fadeIn("fast");
			});
function getNowFormatDate() {
	//获取当前年月日yyyy-MM-DD
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }

function getNowFormatMonth() {
	//取得当前年月yyyy-MM
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        var strDate = date.getDate();
        var currentdate = year + seperator1 + month;
        return currentdate;
  }
function GetLine(){
		
		getTokenIdLocal(function(tokenId){
			timeflag=GetTimeType();
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetDetailInfo2(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			GetDetailInfo2(tokenId);//回调函数，获取全部设备
		}
	});
}
function GetBar(){
		
		getTokenIdLocal(function(tokenId){
			timeflag=GetTimeType();
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetBarInfo(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			GetBarInfo(tokenId);//回调函数，获取全部设备
		}
	});
}
//折线图
function GetLineInfo(tokenId){
	var newTime = "";
	var time = new Array(dayCount);
	for(var i=0;i<time.length;i++){
		time[i]= '%'+getdate(i)+'%';
		newTime += time[i]+'$';
		if(i == time.length-1 ){
			newTime +=time[i];
		}
	}
//	console.log(newTime);
	
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetBar?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
        	"point_id":point_id,
        	"id":equipmentId,
        	"time1":newTime
        },
        timeout:30000,
        success: function (data) {
        	console.log("折线图");
        	if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");                			
       			//折线图数据源
	   		var data = {
				labels : [""],
				datasets : 	[
						{
							fillColor : "transparent",
							strokeColor : "#ef7c1f",
							pointColor : "#ef7c1f",
							pointStrokeColor : "#ef7c1f",
							data : [0]
						}
					]
				}		
				//填充数据				
					for(var i=0;i<json.length;i++){   
						if(json[i].value!=="0.000"){
								//获取选择的是年？月？日
							if($("#query").find(".ani").html()=="日"){
								var data_time = json[i].data_time;
								var hour= data_time.split(" ")[1].split(":")[0];
//								console.log(data_time);
//								console.log(hour);
								data.labels[i]=hour+'h';
//								data.labels =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
									data.datasets[0].data[i]=json[i].value;
							}else if($("#query").find(".ani").html()=="月"){
//									data.labels =[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
										var day = json[i].time.split("/")[2];
										data.labels[i]=day+"号";
										
										data.datasets[0].data[i]=json[i].value;
								}else{
//									data.labels =[1,2,3,4,5,6,7,8,9,10,11,12];
										data.datasets[0].data[i]=json[i].value;
							}
							//需要真正的数据然后进行调整
						}else{
							return;
						}
//						data.datasets[0].data[i]=json[i].value;										
					}
//				$("#ChartLine").remove();//防止重复绘图
//				$("#Histogram").remove();
				var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
				var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
				$(".chart_line_div").html(canvas+canvas2);				
				chart(data);
//				chart2(data);
				if($("#hh2").find("li.ani").html()=="折线图"){
					$("#ChartLine").show();
					$("#Histogram").hide();
				}else{
					$("#ChartLine").hide();
					$("#Histogram").show();
				}			
            		//加载数据            	
            	
            }else{
            	layer.msg(data.result);
            	$("#ChartLine").remove();
        		$("#Histogram").remove();
            }
        }
})
}
//柱形图信息
function GetBarInfo(tokenId){
	var newTime = "";
	var time = new Array(dayCount);
	var dataTime = new Array(dayCount);
	for(var i=0;i<time.length;i++){
		dataTime[time.length-i-1] = getdate(i);
		time[i]= '%'+dataTime[time.length-i-1]+'%';
		newTime += time[i]+'$';
		if(i == time.length-1 ){
			newTime +=time[i];
		}
	}
//	console.log(newTime);
	
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetBar?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
        	"point_id":point_id,
        	"id":equipmentId,
        	"time1":newTime
        },
        timeout:30000,
        success: function (data) {
        	var data1 = {
				labels : [""],
				datasets : 	[
						{
							fillColor : "transparent",
							strokeColor : "#ef7c1f",
							pointColor : "#ef7c1f",
							pointStrokeColor : "#ef7c1f",
							data : [0]
						},{
							fillColor : "transparent",
							strokeColor : "#00B441",
							pointColor : "#00B441",
							pointStrokeColor : "#00B441",
							data : [0]
						}
					]
				}
        	var result = data.result.split("&");
        	var array= new Array(result.length);
        	for (var i =0;i<result.length-2;i++){
        		array[i]= eval("("+result[i]+")"); 
//      		data1.labels =[1,2,3,4,5,6,7];
        		data1.labels[i] =getWantedTime(dataTime[i])+"号";
        		data1.datasets[0].data[i]=array[i][0].max_val;
        		data1.datasets[1].data[i]=array[i][0].min_val;
        	}
			$("#ChartLine").remove();//防止重复绘图
			$("#Histogram").remove();
        	var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
			var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
				$(".chart_line_div").html(canvas+canvas2);				
//				chart(data);
				chart2(data1);
				if($("#hh2").find("li.ani").html()=="折线图"){
					$("#ChartLine").show();
					$("#Histogram").hide();
				}else{
					$("#ChartLine").hide();
					$("#Histogram").show();
				}
        }
})
}
function GetPie(){
	
		getTokenIdLocal(function(tokenId){
			timeflag=GetTimeType();
		if(tokenId=="null"){//Token过期或者首次没有Token
			getTokenIdServer(function(tokenId){//重新获取TokenId
				GetPieInfo(tokenId);//回调函数，获取全部设备
			});
		}else{//获取TokenId成功
			GetPieInfo(tokenId);//回调函数，获取全部设备
		}
	});
}
//饼图
function GetPieInfo(tokenId){
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Scene.asmx/GetPieInfo?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":tokenId,
        	"point_id":point_id,
        	"id":equipmentId,
        	"time":timeflag
        },
        timeout:30000,
        success: function (data1) {
			if(data1.status==1){//获取成功
	        	var json = eval("("+data1.result+")");
	    
	//      	console.log(typeof json[0].value);
       			//折线图数据源
       			var  data =  new  Array(json.length);
       			
       			for(var i=0;i<json.length;i++){
       				var pieData = {value:"",color:""};
       				pieData.value=parseInt(json[i].value);
       				pieData.color=getRandomColor();
//     				console.log(pieData);
       				data[i] =  pieData;
//     				console.log(data[i]);
       			}

	   		
	   			$("#ChartLine").remove();//防止重复绘图
				$("#Histogram").remove();
				$("#Pie").remove();

        		var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
				var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
				var canvas3 = '<canvas id="Pie" width="300px" height="200px" class="chart_line"></canvas>';
//				$(".chart_line_div").html(canvas+canvas2+canvas3);
				$(".chart_line_div").html(canvas3);
				chart3(data);
			}
   		}
	})
}
//获取时间 格式为‘YYYY-MM-DD’
function getdate(n) { 
var uom = new Date(new Date()-0-n*86400000); 
var  month =uom.getMonth()+1;//获得月份
var day = uom.getDate();//获得天
if(month < 10){ month = "0" + month;}
if(day<10){day = '0'+day;}
uom = uom.getFullYear() + "-" + month + "-" + day; 
return uom; 
} 
//获得随机颜色
function getRandomColor(){    

  return  '#' +    
    (function(color){    
    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])    
      && (color.length == 6) ?  color : arguments.callee(color);    
  })('');    
} 

function getWantedTime(time){
	var time1 = time.split("-");
	return  time1[1]+"-" + time1[2];
}
