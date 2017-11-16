//var time1 = null;
//	    	var time2 = null ;
	    	//日期
			$(".on p").click(function  () {
				$(".window").fadeIn(0);
				$(".hours").hide(0);
				$(".box button").show(0);
				$(".box input").hide(0);
				
			})
			var now=new Date();
			var nowyear=now.getFullYear();
			var aYear=new Array;
			//循环添加年
			for(i=0;i<11;i++){
				aYear.push(nowyear+i);
				var op=$("<option></option>");
				$(op).appendTo($(".window .year"));
				$(op).text(aYear[i]);
				if($(op).text()==nowyear){
					$(op).attr("selected","selected");
				}
			}
			//循环添加月
			var nowmonth=now.getMonth()+1;
			for(i=1;i<13;i++){
				var op=$("<option></option>");
				$(op).appendTo($(".window .month"));
				if(i<10){
					$(op).text("0"+i);
				}else{
					$(op).text(i);
				}
				if($(op).text()==nowmonth||$(op).text()=="0"+nowmonth){
					$(op).attr("selected","selected");
				}
				
			}
			//循环添加日
			var beginday=new Date();
			beginday.setDate(1);
			var month=["31","28","31","30","31","30","31","31","30","31","30","31"];
			function isLeapYear (Year) {
				if (((Year % 4)==0) && ((Year % 100)!=0) || ((Year % 400)==0)) {
				return (true);
				} else { return (false); }
			}
			if(isLeapYear(beginday.getFullYear())){
				month[1]=29;
			}
			for(i=0;i<beginday.getDay();i++){
				$("<li><a></a></li>").appendTo($(".window .day"));
			}
			for(i=0;i<month[beginday.getMonth()];i++){
				$("<li><a></a></li>").appendTo($(".window .day"));
			}
			for(i=0;i<month[now.getMonth()];i++){
				$(".window .day li ").eq(beginday.getDay()+i).children("a").text(i+1)
			}
			//初始化头部的日期
			var d=now.getDate();
			if(d<10){
				d="0"+d;
			}
			$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-"+d+"<b></b>");
			//网页样式
			$(".window .day").css("height",Math.ceil($(".window .day li").length/7)*2+"rem");
			for(i=0;i<$(".day li").length/7+1;i++){
				$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
				$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
			}
			$(".window .day li").eq(now.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
			$(".window .year,.month").change(function  () {
					$(".window .day li").remove();
					//循环添加日
					var beginday=new Date();
					beginday.setFullYear($(".window .year").val());
					beginday.setMonth($(".window .month").val()-1,1);
					var month=["31","28","31","30","31","30","31","31","30","31","30","31"];
					function isLeapYear (Year) {
						if (((Year % 4)==0) && ((Year % 100)!=0) || ((Year % 400)==0)) {
						return (true);
						} else { return (false); }
					}
					if(isLeapYear(beginday.getFullYear())){
						month[1]=29;
					}
					for(i=0;i<beginday.getDay();i++){
						$("<li><a></a></li>").appendTo($(".window .day"));
					}
					for(i=0;i<month[$(".month").val()-1];i++){
						$("<li><a></a></li>").appendTo($(".window .day"));
					}
					for(i=0;i<month[$(".window .month").val()-1];i++){
						$(".window .day li ").eq(beginday.getDay()+i).children("a").text(i+1)
					}
					//网页样式
					$(".window .day").css("height",Math.ceil($(".window .day li").length/7)*2+"rem");
					for(i=0;i<$(".window .day li").length/7+1;i++){
						$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
						$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
					}
					$(".window .day li").eq(beginday.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
					$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-01");
					$(".window .day li a").click(function  () {
						if($(this).html()==""){return};
						$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
						for(i=0;i<$(".window .day li").length/7+1;i++){
							$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
							$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
						}
						$(this).css({"background":"#017d7b","color":"#fff"});
						var d=$(this).text()
						if($(this).text()<10){
							d="0"+d;
						}
						$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-"+d+"<b></b>");
					})
			})
			$(".window .day li a").click(function  () {
				if($(this).html()==""){return};
				$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
				for(i=0;i<$(".window .day li").length/7+1;i++){
					$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
					$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
				}
				$(this).css({"background":"#017d7b","color":"#fff"});
				var d=$(this).text()
				if($(this).text()<10){
					d="0"+d;
				}
				$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-"+d+"<b></b>");
			})
			//选择提醒日期
			$(".box button").click(function() {
				$(".window").css("display","none");
				$(".hours").fadeIn(0);
				$(".box button").hide(0);
				$(".box input").show(0);
//				time1 = $(".on p").text();
				
			})
			//选择提醒时间
			$(".box input").click(function  () {
				var hor=parseFloat($(".hour").val());
				if(hor<10){
				    hor="0"+hor
				}
				$(".on2 p").html(hor+":"+$(".minute").val());
				$(".hours").fadeOut(0);
				$(".box button").hide(0);
				$(".box input").hide(0);
//				time2 = $(".on2 p").text(); 
//				orderTime();
				$(".yes").show();
			})
			$(".on2 p").click(function  () {
				$(".hours").fadeIn(0);
				$(".window").css("display","none");
				$(".box input").show(0);
				$(".box button").hide(0);
			})
			//时间初始化
			for(i=0;i<24;i++){
				var op=$("<option></option>");
				$(op).appendTo($(".hour"));
				if(i<10){
					$(op).text("0"+i+" 时 ");
				}else{
					$(op).text(i+" 时 ");
				}
			}
			for(i=0;i<60;i++){
				var op=$("<option></option>");
				$(op).appendTo($(".minute"));
				if(i<10){
					$(op).text("0"+i+" 分");
				}else{
					$(op).text(i+" 分");
				}
			}
			