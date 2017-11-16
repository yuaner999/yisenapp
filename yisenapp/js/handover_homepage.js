
$(function(){
	var flag = true ;
	$("img").click(function(){
		if(flag){
			$(this).attr("src","images/right_ok.png");
			flag=false;
		}else{
			$(this).attr("src","images/wrong_06.png");
			flag=true;
		}
		
	})
	var txt;
	$("tbody td>div").click(function  () {
		if(event.target==this){
			$(this).find("div").show(0);
		}
		txt=$(this).find("textarea").val();
	})
	$("tbody td>div div button").click(function(){
		if($(this).index()==1){
			$(this).parent().siblings("textarea").val(txt);
			$(this).parent().parent().css("display","none");
		}
		else{
			txt=$(this).parent().siblings("textarea").val();
			$(this).parent().parent().css("display","none");
			$(this).parent().siblings("textarea").val(txt);
		}
	})
}
)
