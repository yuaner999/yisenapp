<%@ Page Language="C#" AutoEventWireup="true" CodeFile="UploadFile.aspx.cs" Inherits="UploadFile" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
    <script type="text/javascript" src="assets/js/jquery-1.11.0.min.js"></script>
    <script>
        
    </script>
</head>
<body>
    <h1>Mysql</h1>
    <input type="button" name="name" value="ASMX" />

    <form method="post" action="/handler/Person.asmx/PhotoUpload" enctype="multipart/form-data">
         <input type="text" name="desc"/>
         <input type="file" name="pic"/>
        <button type="submit">提交</button>
    </form>

</body>
</html>
