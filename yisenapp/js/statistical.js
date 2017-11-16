$(function  () {
//	导航变色
	$(".header li").click(function  () {
		for(i=0;i<$(".head li").length;i++){
			if($(".head li").eq(i).text()==$(this).text()){
				var now=i;
			}
		}
		$(".header li:last-child").stop(true).animate({left:now*8.1-0.075+"rem"},200);
		$(this).siblings().removeClass("ani");
		$(this).siblings().addClass("end");
		$(this).removeClass("end");
		$(this).addClass("ani");
	})
	//导航变色2
	$(".header2 li").click(function  () {
		for(i=0;i<$(".header2 li").length;i++){
			if($(".header2 li").eq(i).text()==$(this).text()){
				var now=i;
			}
		}
		$(".header2 li:last-child").stop(true).animate({left:now*4.9375-0.075+"rem"},200);
		$(this).siblings().removeClass("ani");
		$(this).siblings().addClass("end");
		$(this).removeClass("end");
		$(this).addClass("ani");
	})
	//日期
	$(".on p").click(function  () {
		$(".black,.window").fadeIn(0);
	})
	var now=new Date();
	var nowyear=now.getFullYear();
	var aYear=new Array;
	//循环添加年
	for(i=0;i<11;i++){
		aYear.push(nowyear-10+i);
		var op=$("<option></option>");
		$(op).appendTo($(".year"));
		$(op).text(aYear[i]);
		if($(op).text()==nowyear-1){
			$(op).attr("selected","selected");
		}
	}
	//循环添加月
	var nowmonth=now.getMonth()+1;
	for(i=1;i<13;i++){
		var op=$("<option></option>");
		$(op).appendTo($(".month"));
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
		$("<li><a></a></li>").appendTo($(".day"));
	}
	for(i=0;i<month[beginday.getMonth()];i++){
		$("<li><a></a></li>").appendTo($(".day"));
	}
	for(i=0;i<month[now.getMonth()];i++){
		$(".day li ").eq(beginday.getDay()+i).children("a").text(i+1)
	}
	//初始化头部的日期
	var d=now.getDate();
	if(d<10){
		d="0"+d;
	}
	$(".on p").html($(".year").val()+"-"+$(".month").val()+"-"+d+"<b></b>");
	//网页样式
	$(".day").css("height",Math.ceil($(".day li").length/7)*2+"rem");
	for(i=0;i<$(".day li").length/7+1;i++){
		$(".day li").eq(0+i*7).children("a").css("color","#017d7b");
		$(".day li").eq(6+i*7).children("a").css("color","#017d7b")
	}
	$(".day li").eq(now.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
	$(".year,.month").change(function  () {
			$(".day li").remove();
			//循环添加日
			var beginday=new Date();
			beginday.setFullYear($(".year").val());
			beginday.setMonth($(".month").val()-1,1);
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
				$("<li><a></a></li>").appendTo($(".day"));
			}
			for(i=0;i<month[$(".month").val()-1];i++){
				$("<li><a></a></li>").appendTo($(".day"));
			}
			for(i=0;i<month[$(".month").val()-1];i++){
				$(".day li ").eq(beginday.getDay()+i).children("a").text(i+1)
			}
			//网页样式
			$(".day").css("height",Math.ceil($(".day li").length/7)*2+"rem");
			for(i=0;i<$(".day li").length/7+1;i++){
				$(".day li").eq(0+i*7).children("a").css("color","#017d7b");
				$(".day li").eq(6+i*7).children("a").css("color","#017d7b")
			}
			$(".day li").eq(beginday.getDate()+beginday.getDay()-1).children("a").css({"background":"#017d7b","color":"#fff"});
			$(".day li a").click(function  () {
				$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
				for(i=0;i<$(".day li").length/7+1;i++){
					$(".day li").eq(0+i*7).children("a").css("color","#017d7b");
					$(".day li").eq(6+i*7).children("a").css("color","#017d7b")
				}
				$(this).css({"background":"#017d7b","color":"#fff"});
				$(".black,.window").fadeOut(0);
				var d=$(this).text()
				if($(this).text()<10){
					d="0"+d;
				}
				$(".on p").html($(".year").val()+"-"+$(".month").val()+"-"+d+"<b></b>");
			})
	})
	$(".day li a").click(function  () {
		$(this).parent().siblings().children("a").css({"background":"#fff","color":"#97c0bf"});
		for(i=0;i<$(".day li").length/7+1;i++){
			$(".day li").eq(0+i*7).children("a").css("color","#017d7b");
			$(".day li").eq(6+i*7).children("a").css("color","#017d7b")
		}
		$(this).css({"background":"#017d7b","color":"#fff"});
		$(".black,.window").fadeOut(0);
		var d=$(this).text()
		if($(this).text()<10){
			d="0"+d;
		}
		$(".on p").html($(".year").val()+"-"+$(".month").val()+"-"+d+"<b></b>");
	})
})
