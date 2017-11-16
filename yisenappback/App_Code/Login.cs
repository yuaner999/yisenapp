using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using Dugufeixue.Common;
using MySql.Data.MySqlClient;
using System.Net.Mail;

/// <summary>
/// Login 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class Login : WebService {

    public Login () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    /// <summary>
    /// 登录验证
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "login")]
    public void UserLogin(string loginName, string password)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        try
        {
            //判断用户是否存在，是否正确
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from sys_employee where binary user_login = @user_login and user_pwd=@user_pwd and emp_isdeleted=0"
            };

            MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@user_login",loginName),
            new MySqlParameter("@user_pwd",password),
         
        };

            var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;

            if (userInfor != null && userInfor.Table.Rows.Count == 1)//用户名密码正确
            {
                bool isAdmin = Common.isAdministator(loginName);
                if (isAdmin)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "管理员不能使用该客户端"));
                    return;
                }
                else
                {
                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "select * from sys_employee where user_login=@user_login and emp_isdeleted='0'"
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                    new MySqlParameter("@user_login",loginName)
                };

                    //var scenes = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0].DefaultView;
                    //if (scenes != null && scenes.Table.Rows.Count > 0)//现场
                    //{
                    ClsCurrentUserInfo.EmpId = loginName;
                    ClsCurrentUserInfo.EmpName = userInfor.Table.Rows[0]["emp_name"].ToString();
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "登录成功"));
                    return;
                    //}
                    //else
                    //{
                    //    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "该用户没有分配的现场"));
                    //    return;
                    //}

                }
            }
            else//用户名密码错误，或用户已删除
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户名或密码错误"));
                return;
            }
        }
        catch (Exception ex) {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未连接到数据库"));
            return;
        }
    }
    /// <summary>
    /// 通过登录名获取用户名
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetUserName")]
    public void GetUserName(string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //查询用户名
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "SELECT emp_name FROM sys_employee WHERE user_login = @user_login"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@user_login",loginName)
         
        };

        var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;

        if (userInfor != null && userInfor.Table.Rows.Count == 1)//
        {
            var json = Common.DataTableToJson(userInfor.Table); //信息的Json形式
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
            return;
        }
        else//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "不存在该用户"));
            return;
        }
    }
    /// <summary>
    /// 发送邮件验证码
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "forgetPwdSendEmail")]
    public void forgetPwdSendEmail(string email)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        if(email.Trim()=="")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱不能为空"));
            return;
        }
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText =
                "select * from sys_employee where emp_email = @emp_email and emp_isdeleted=0"
        };
        MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@emp_email", email)
            };
        var oldre =
            MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                [0].DefaultView;
        if (oldre != null && oldre.Table.Rows.Count == 1) //用户旧密码正确
        {
            string email_code = MakeCodeString.MakeCodeNum(4);
            System.Net.Mail.MailMessage msg = new System.Net.Mail.MailMessage();
            msg.To.Add(email);
            /*   
            * msg.To.Add("b@b.com");   
            * msg.To.Add("b@b.com");   
            * msg.To.Add("b@b.com");可以发送给多人   
            */
            /*    msg.CC.Add("c@c.com");                       
           * msg.CC.Add("c@c.com");   
           * msg.CC.Add("c@c.com");可以抄送给多人   
           */
            msg.From = new MailAddress("acffjj123@163.com", "怡森环保", System.Text.Encoding.UTF8);
            /* 上面3个参数分别是发件人地址（可以随便写），发件人姓名，编码*/
            msg.Subject = "怡森环保数据平台找回密码";//邮件标题    
            msg.SubjectEncoding = System.Text.Encoding.UTF8;//邮件标题编码    
            msg.Body = "您好，您本次申请找回密码的验证码为："+email_code;//邮件内容    
            msg.BodyEncoding = System.Text.Encoding.UTF8;//邮件内容编码    
            msg.IsBodyHtml = false;//是否是HTML邮件    
            msg.Priority = MailPriority.High;//邮件优先级    

            SmtpClient client = new SmtpClient();
            client.Credentials = new System.Net.NetworkCredential("acffjj123@163.com", "456852");
            client.Host = "smtp.163.com";    //Smtp事务的主机
            object userState = msg;

            client.Send(msg);
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE sys_employee SET email_code = @email_code WHERE emp_email = @emp_email"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@emp_email", email),
                    new MySqlParameter("@email_code", email_code)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发送成功"));
                return;
            }
            else 
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "发送邮箱验证码错误"));
                return;
            }
        }
        else //用户密码错误
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到邮箱对应用户"));
            return;
        }
        
    }

    /// <summary>
    /// 忘记密码修改密码
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "forgetPwdModify")]
    public void forgetPwdModify(string email, string code, string newPwd)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        if (email.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱不能为空"));
            return;
        }
        if (code.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "验证码不能为空"));
            return;
        }
        if (newPwd.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "新密码不能为空"));
            return;
        }
        //查询用户名
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "SELECT emp_name FROM sys_employee WHERE emp_email = @emp_email and email_code = @email_code"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@emp_email",email),
            new MySqlParameter("@email_code",code)
         
        };

        var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;

        if (userInfor != null && userInfor.Table.Rows.Count == 1)//
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE sys_employee SET user_pwd = @user_pwd WHERE emp_email = @emp_email"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@emp_email", email),
                    new MySqlParameter("@user_pwd", newPwd)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "密码重置成功"));
                return;
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "重置密码错误"));
                return;
            }
        }
        else//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱验证码错误"));
            return;
        }
    }

    /// <summary>
    /// 发送邮件验证码
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "forgetControlPwdSendEmail")]
    public void forgetControlPwdSendEmail(string email)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        if (email.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱不能为空"));
            return;
        }
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText =
                "select * from sys_employee where emp_email = @emp_email and emp_isdeleted=0"
        };
        MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@emp_email", email)
            };
        var oldre =
            MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                [0].DefaultView;
        if (oldre != null && oldre.Table.Rows.Count == 1) //用户旧密码正确
        {
            string email_code = MakeCodeString.MakeCodeNum(4);
            System.Net.Mail.MailMessage msg = new System.Net.Mail.MailMessage();
            msg.To.Add(email);
            /*   
            * msg.To.Add("b@b.com");   
            * msg.To.Add("b@b.com");   
            * msg.To.Add("b@b.com");可以发送给多人   
            */
            /*    msg.CC.Add("c@c.com");                       
           * msg.CC.Add("c@c.com");   
           * msg.CC.Add("c@c.com");可以抄送给多人   
           */
            msg.From = new MailAddress("acffjj123@163.com", "怡森环保", System.Text.Encoding.UTF8);
            /* 上面3个参数分别是发件人地址（可以随便写），发件人姓名，编码*/
            msg.Subject = "怡森环保数据平台找回密码";//邮件标题    
            msg.SubjectEncoding = System.Text.Encoding.UTF8;//邮件标题编码    
            msg.Body = "您好，您本次申请找回密码的验证码为：" + email_code;//邮件内容    
            msg.BodyEncoding = System.Text.Encoding.UTF8;//邮件内容编码    
            msg.IsBodyHtml = false;//是否是HTML邮件    
            msg.Priority = MailPriority.High;//邮件优先级    

            SmtpClient client = new SmtpClient();
            client.Credentials = new System.Net.NetworkCredential("acffjj123@163.com", "456852");
            client.Host = "smtp.163.com";    //Smtp事务的主机
            object userState = msg;

            client.Send(msg);
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE sys_employee SET email_code_control = @email_code WHERE emp_email = @emp_email"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@emp_email", email),
                    new MySqlParameter("@email_code", email_code)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发送成功"));
                return;
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "发送邮箱验证码错误"));
                return;
            }
        }
        else //用户密码错误
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到邮箱对应用户"));
            return;
        }

    }

    /// <summary>
    /// 忘记控制密码修改密码
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "forgetControlPwdModify")]
    public void forgetControlPwdModify(string email, string code, string newPwd)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        if (email.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱不能为空"));
            return;
        }
        if (code.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "验证码不能为空"));
            return;
        }
        if (newPwd.Trim() == "")//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "新控制密码不能为空"));
            return;
        }
        //查询用户名
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "SELECT emp_name FROM sys_employee WHERE emp_email = @emp_email and email_code_control = @email_code"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@emp_email",email),
            new MySqlParameter("@email_code",code)
         
        };

        var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;

        if (userInfor != null && userInfor.Table.Rows.Count == 1)//
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE sys_employee SET user_pwd_control = @user_pwd WHERE emp_email = @emp_email"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@emp_email", email),
                    new MySqlParameter("@user_pwd", newPwd)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "控制密码重置成功"));
                return;
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "重置控制密码错误"));
                return;
            }
        }
        else//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱验证码错误"));
            return;
        }
    }

    /// <summary>
    /// 获取轮播图
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetAdsPicture")]
    public void GetAdsPicture()
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //查询用户名
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "SELECT * FROM sys_workbook WHERE workbook_name like 'APP轮播广告%'"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
            
        };

        var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0];

        if (userInfor != null && userInfor.Rows.Count >0)//
        {
            DataRow[] drs1 = userInfor.Select("workbook_name='APP轮播广告一图片'");
            if (drs1.Length < 1) 
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告一图片未取到值"));
                return;
            }
            DataRow[] drs1url = userInfor.Select("workbook_name='APP轮播广告一链接'");
            if (drs1url.Length < 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告一链接未取到值"));
                return;
            }
            DataRow[] drs2 = userInfor.Select("workbook_name='APP轮播广告二图片'");
            if (drs2.Length < 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告二图片未取到值"));
                return;
            }
            DataRow[] drs2url = userInfor.Select("workbook_name='APP轮播广告二链接'");
            if (drs2url.Length < 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告二链接未取到值"));
                return;
            }
            DataRow[] drs3 = userInfor.Select("workbook_name='APP轮播广告三图片'");
            if (drs3.Length < 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告三图片未取到值"));
                return;
            }
            DataRow[] drs3url = userInfor.Select("workbook_name='APP轮播广告三链接'");
            if (drs3url.Length < 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "APP轮播广告三链接未取到值"));
                return;
            }
            string ads1picture = drs1[0]["workbook_value"].ToString();
            string ads2picture = drs2[0]["workbook_value"].ToString();
            string ads3picture = drs3[0]["workbook_value"].ToString();
            string ads1url = drs1url[0]["workbook_value"].ToString();
            string ads2url = drs2url[0]["workbook_value"].ToString();
            string ads3url = drs3url[0]["workbook_value"].ToString();
            var json = "[{\"ads1picture\":\"" + ads1picture + "\",\"ads1url\":\"" + ads1url + "\",\"ads2picture\":\"" + ads2picture + "\",\"ads2url\":\"" + ads2url + "\",\"ads3picture\":\"" + ads3picture + "\",\"ads3url\":\"" + ads3url + "\"}]";
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
            return;
        }
        else//用户名密码错误，或用户已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "数据库中不存在轮播图数据"));
            return;
        }
    }
}
