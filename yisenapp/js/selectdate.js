//日期
			$(".on p").click(function  () {
				$(".window").fadeIn(0);
				$(".window2").fadeOut(0);
			})
			var now=new Date();
			var nowyear=now.getFullYear();
			var aYear=new Array;
			//循环添加年
			for(i=0;i<11;i++){
				aYear.push(nowyear-10+i);
				var op=$("<option></option>");
				$(op).appendTo($(".window .year"));
				$(op).text(aYear[i]);
				if($(op).text()==nowyear - 1){
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
				if($(op).text()==nowmonth-1||$(op).text()=="0"+nowmonth-1){
					$(op).attr("selected","selected");
				}
			}
			if(nowmonth==1){
				$(".window .month option").eq(11).attr("selected","selected");
				$(".window .year option").eq(9).attr("selected","selected");
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
				$(".window .day li ").eq(beginday.getDay()+i).html("<a>"+(i+1)+"</a>")
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
					$(".window .day li a").click(function  () {
						$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
						for(i=0;i<$(".window.day li").length/7+1;i++){
							$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
							$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
						}
						$(this).css({"background":"#017d7b","color":"#fff"});
						$(".black,.window").fadeOut(0);
						var d=$(this).text()
						if($(this).text()<10){
							d="0"+d;
						}
						$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-"+d+"<b></b>");
						reloadinfo();
					})
			})
			$(".window .day li a").click(function  () {
				$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
				for(i=0;i<$(".window .day li").length/7+1;i++){
					$(".window .day li").eq(0+i*7).children("a").css("color","#017d7b");
					$(".window .day li").eq(6+i*7).children("a").css("color","#017d7b")
				}
				$(this).css({"background":"#017d7b","color":"#fff"});
				$(".black,.window").fadeOut(0);
				var d=$(this).text()
				if($(this).text()<10){
					d="0"+d;
				}
				$(".on p").html($(".window .year").val()+"-"+$(".window .month").val()+"-"+d+"<b></b>");
				reloadinfo();
			})
			//日期
			$(".on2 p").click(function  () {
				$(".window2").fadeIn(0);
				$(".window").fadeOut(0);
			})
			var now=new Date();
			var nowyear=now.getFullYear();
			var aYear=new Array;
			//循环添加年
			for(i=0;i<11;i++){
				aYear.push(nowyear-10+i);
				var op=$("<option></option>");
				$(op).appendTo($(".window2 .year"));
				$(op).text(aYear[i]);
				if($(op).text()==nowyear){
					$(op).attr("selected","selected");
				}
			}
			//循环添加月
			var nowmonth=now.getMonth()+1;
			for(i=1;i<13;i++){
				var op=$("<option></option>");
				$(op).appendTo($(".window2 .month"));
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
				$("<li><a></a></li>").appendTo($(".window2 .day"));
			}
			for(i=0;i<month[beginday.getMonth()];i++){
				$("<li><a></a></li>").appendTo($(".window2 .day"));
			}
			for(i=0;i<month[now.getMonth()];i++){
				$(".window2 .day li ").eq(beginday.getDay()+i).children("a").text(i+1)
			}
			//初始化头部的日期
			var d=now.getDate();
			if(d<10){
				d="0"+d;
			}
			$(".on2 p").html($(".window2 .year").val()+"-"+$(".window2 .month").val()+"-"+d+"<b></b>");
			//网页样式
			$(".window2 .day").css("height",Math.ceil($(".window2 .day li").length/7)*2+"rem");
			for(i=0;i<$(".window2 .day li").length/7+1;i++){
				$(".window2 .day li").eq(0+i*7).children("a").css("color","#017d7b");
				$(".window2 .day li").eq(6+i*7).children("a").css("color","#017d7b")
			}
			$(".window2 .day li").eq(now.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
			$(".window2 .year,.month").change(function  () {
					$(".window2 .day li").remove();
					//循环添加日
					var beginday=new Date();
					beginday.setFullYear($(".window2 .year").val());
					beginday.setMonth($(".window2 .month").val()-1,1);
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
						$("<li><a></a></li>").appendTo($(".window2 .day"));
					}
					for(i=0;i<month[$(".window2 .month").val()-1];i++){
						$("<li><a></a></li>").appendTo($(".window2 .day"));
					}
					for(i=0;i<month[$(".window2 .month").val()-1];i++){
						$(".window2 .day li ").eq(beginday.getDay()+i).children("a").text(i+1)
					}
					//网页样式
					$(".window2 .day").css("height",Math.ceil($(".window2 .day li").length/7)*2+"rem");
					for(i=0;i<$(".window2 .day li").length/7+1;i++){
						$(".window2 .day li").eq(0+i*7).children("a").css("color","#017d7b");
						$(".window2 .day li").eq(6+i*7).children("a").css("color","#017d7b")
					}
					$(".window2 .day li").eq(beginday.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
					$(".window2 .day li a").click(function  () {
						$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
						for(i=0;i<$(".window2 .day li").length/7+1;i++){
							$(".window2 .day li").eq(0+i*7).children("a").css("color","#017d7b");
							$(".window2 .day li").eq(6+i*7).children("a").css("color","#017d7b")
						}
						$(this).css({"background":"#017d7b","color":"#fff"});
						$(".black,.window2").fadeOut(0);
						var d=$(this).text()
						if($(this).text()<10){
							d="0"+d;
						}
						$("#endDate").html($(".window2 .year").val()+"-"+$(".window2 .month").val()+"-"+d+"<b></b>");
						reloadinfo();
					})
			})
			$(".window2 .day li a").click(function  () {
				$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
				for(i=0;i<$(".window2 .day li").length/7+1;i++){
					$(".window2 .day li").eq(0+i*7).children("a").css("color","#017d7b");
					$(".window2 .day li").eq(6+i*7).children("a").css("color","#017d7b")
				}
				$(this).css({"background":"#017d7b","color":"#fff"});
				$(".black,.window2").fadeOut(0);
				var d=$(this).text()
				if($(this).text()<10){
					d="0"+d;
				}
				$(".on2 p").html($(".window2 .year").val()+"-"+$(".window2 .month").val()+"-"+d+"<b></b>");
				reloadinfo();
			})
			var startDate = $("#startDate").text();
			var endDate= $("#endDate").text();