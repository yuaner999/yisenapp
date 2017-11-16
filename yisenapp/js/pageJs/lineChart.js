//检测的具体的id detection_detail_id
var id=GetQueryString("id");
//var id ="1";
var sceneName;
var equName;
var itemName;
var  startTime;
var  endTime;
$(function() {
//	reloadinfo();
	startTime =  new Date("2016-10-10");
	endTime = new Date();
	getTokenIdLocal(function(tokenId) {
		if (tokenId == "null") { //Token过期或者首次没有Token
			getTokenIdServer(function(tokenId) { //重新获取TokenId
				newtokenId = tokenId;
				getPrimitiveInfo(tokenId);
//				GetLineInfo(tokenId);
			});
		} else { //获取TokenId成功
			newtokenId = tokenId;
//			GetLineInfo(tokenId);
			getPrimitiveInfo(tokenId);
		}
	});
});
function checkButton(){
	window.history.back();
}
//跟据id 获得初始化的信息
function getPrimitiveInfo(tokenId){
	var loading=layer.load(2,{shade: [0.2,'#000'] });
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Detection.asmx/GetPrimitiveInfo?jsoncallback?",
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: { 
			"tokenId":tokenId,
			"id":id
        },
        timeout:30000,
   		success: function (data) {
   			if(data.status==0){
// 				layer.alert(data.result);
   				setTimeout(function(){
// 					window.location.href="detection_info.html"
   				},1314);
   			}
	 		layer.close(loading);
   			var json = eval("("+data.result+")");
   			sceneName=json[0].scene_name;
			equName=json[0].equipment_name;
			itemName=json[0].item_name;
   			$("#sceneName").html(json[0].scene_name);
   			$("#equ").html(json[0].equipment_name);
   			$("#item").html(json[0].item_name);
   			$("#item1").html(json[0].item_name);
// 			$("#date1").val(json[0].date2);
// 			$("#date2").val(json[0].detection_date);
   			GetLineInfo();

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
var xdata = [];
var ydata = [];
//折线图	
function GetLineInfo(){
//	sceneName,equName,itemName,date1,date2
//	var date1=$("#date1").val();
//	var date2=$("#date2").val();
	xdata = [];
	ydata = [];
	if(new Date(startTime)>new Date(endTime)){
		layer.alert("起始日期应小于结束日期");
		return;
	}
//		console.log(sceneName);
//		console.log(equName);
//		console.log(itemName);
//		console.log(date1);
//		console.log(date2);
	var ajax = $.ajax({
        type: "post",
        url: url+"/handler/Detection.asmx/GetValue?jsoncallback?",
        async:false,
        dataType: "jsonp",
        jsonp: 'jsoncallback',
        data: {
        	"tokenId":newtokenId,
        	"sceneName":sceneName,
        	"equName":equName,
        	"itemName":itemName,
        	"date1":dateformat(startTime),
        	"date2":dateformat(endTime)
        },
        timeout:30000,
        success: function (data) {
        	console.log("折线图");
        	if(data.status==1){//获取成功
            	var json = eval("("+data.result+")");  
            	console.log(data);
       			//折线图数据源
       			for(var i = 0; i < json.length; i++) {	
					xdata.push(json[i].detection_date);
					ydata.push(parseFloat(json[i].value));
				}
				echartsInfo ();
//	   		var data = {
//				labels : [""],
//				datasets : 	[
//						{
//							fillColor : "transparent",
//							strokeColor : "#ef7c1f",
//							pointColor : "#ef7c1f",
//							pointStrokeColor : "#ef7c1f",
//							data : [0]
//						}
//					]
//				}		
//				//填充数据				
//					for(var i=0;i<json.length;i++){ 
//						data.labels[i]=json[i].detection_date;
////						data.labels =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
//						data.datasets[0].data[i]=json[i].value;
//					}
////				$("#ChartLine").remove();//防止重复绘图
////				$("#Histogram").remove();
//				var canvas = '<canvas id="ChartLine" width="500px" height="200px" class="chart_line"></canvas>';
//				var canvas2 = '<canvas id="Histogram" width="500px" height="200px" class="chart_line"></canvas>';
//				$(".chart_line_div").html(canvas);				
//				chart(data);
            		//加载数据
            }else{
            	xdata = [];
				ydata = [];
				echartsInfo ();
            	layer.msg(data.result);
//          	$("#ChartLine").remove();
//      		$("#Histogram").remove();
            }
        }
})
}
function echartsInfo () {
	$("#main").html("");
    $('#main').highcharts({
    	//图的类型为折线，可以沿X轴缩放
        chart: {
            type: 'line',
//          zoomType: 'x',
//          resetZoomButton: {
//              position: {
//                  // align: 'right', // by default
//                  // verticalAlign: 'top', // by default
//                  align : 'right',
//                  relativeTo: 'plot'
//              },
//              //设置重置按钮的样式
//              theme: {
//                  fill: 'white',
//                  stroke: 'silver',
//                  r: 0,
//                  states: {
//                      hover: {
//                          fill: '#41739D',
//                          style: {
//                              color: 'white'
//                          }
//                      }
//                  }
//              }
//          }
        },
        //图标标题
        title: {
            text: ''
        },
        //图表副标题
        subtitle: {
        	align:'left',
            text: '',
            style: {
                color: '#FF3030',
                fontWeight: 'bold'
            }
        },
        credits:{
	            enabled:false // 禁用版权信息
        },
        xAxis: {
        	//这个参数用来调整时间显示间隔，也就是每隔多久显示一个x轴数据（时间轴）
        	tickInterval: 1,
        	//X轴数据，数组内每个元素必须是字符串，格式自己处理
            categories: xdata
        },
        yAxis: {
            title: {
                text: '数据值'
            },
            //格式化数据，可以不写
            formatter: function() {
               return this.value ;
            }
        },
        legend: {//是否显示底注
           	 enabled: true
   		 },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true          // 是否在每个节点上显示数据
                },
                enableMouseTracking: true // 关闭鼠标跟踪，对应的提示框、点击事件会失效
            },
            series: {
                marker: {
                    radius: 4,  //曲线点半径，默认是4
                    symbol: 'circle' //曲线点类型："circle", "square", "diamond", "triangle","triangle-down"，默认是"circle"
                }
            }
        },
        //折线图可左右滚动
        scrollbar: {
      		 enabled: true
   		},
        series: [{
            name: '数据值',
            //Y轴数据，数组，数组内的每个元素必须是数字
            data: ydata
        }]
    });
};
mui.back = function() {

	window.history.back();
}