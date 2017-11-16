<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Mysql.aspx.cs" Inherits="Mysql" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
    <script type="text/javascript" src="assets/js/jquery-1.11.0.min.js"></script>
    <script>
        function Post() {
            var date = new Date();
            var sendTime = date.getTime();
            var hash = $.md5("adminzq+2oE4AYSvTs56gHJODzA==" + sendTime);
            var json = {
                "username": "admin",
                "hash": hash,
                "sendTime": sendTime
            };
            var ajax = $.ajax({
                type: "post",
                url: "Token.asmx/GetTokenId?jsoncallback?",
                dataType: "jsonp",
                jsonp: 'jsoncallback',
                data: json,
                timeout: 30000,
                success: function (data) {
                    alert(data);
                },
                error: function (data) {
                    alert(data);
                },
                complete: function (xmlHttpRequest, status) { //请求完成后最终执行参数
                    if (status === 'timeout') {//超时,status还有success,error等值的情况
                        ajax.abort(); //取消请求
                    }
                }
            });
//            var ajax = $.ajax({
//                type: "post",
//                url: "Token.asmx/GetTokenId?jsoncallback?",
//                dataType: "jsonp",
//                jsonp: 'jsoncallback',
//                data: json,
//                timeout: 30000,
//                success: function (data) {
//                    alert(data);
//                },
//                error: function (data) {
//                    alert(data);
//                },
//                complete: function (xmlHttpRequest, status) { //请求完成后最终执行参数
//                    if (status === 'timeout') {//超时,status还有success,error等值的情况
//                        ajax.abort(); //取消请求
//                    }
//                }
//            });
        }
    </script>
</head>
<body>
    <h1>Mysql</h1>
    <input type="button" name="name" value="ASMX" onclick="Post()" />
    <form id="form1" runat="server">
    <div>
    
    </div>
    </form>
</body>
</html>
