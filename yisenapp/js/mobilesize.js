$(function  () {
	//动态加载font-size
	document.documentElement.style.fontSize = document.documentElement.clientWidth / 18.75 + 'px';
	window.onresize=function  () {
		document.documentElement.style.fontSize = document.documentElement.clientWidth / 18.75 +"px";
	}
	setTimeout(function  () {		
		var h=$("body").css("height")
		$("body").css("height",h);
	},100)
})
