//图片上传，无预览
function fileupload(url,tag,callback,errorcallback){
	$.upload({
		url: url+"?tag="+tag,
		fileName: 'filedata',
		params: {},
		dataType: 'json',
		onSend: function() {
			return true;
		},
		onComplate: function(data) {
			if(callback) callback(data)
		}
	});
}
//图片上传，可预览
function imguploadandpreview(imgselector,tag,callback,errorcallback){
	$.upload({
		url: url+"/imgupload.form?tag="+tag,
		fileName: 'filedata',
		params: {},
		dataType: 'json',
		onSend: function() {
			return true;
		},
		onComplate: function(data) {
			$(imgselector).attr("src",serverimg(data.fid));
			if(callback) callback(data)
		}
	});
}

//预览图片
function serverimg(imgid){
	return url+"/imgdown.form?imgid="+imgid;
}
function showmsgpc(str){
	layer.msg(str,{time:2000,offset:window.height/2+'px'});
}