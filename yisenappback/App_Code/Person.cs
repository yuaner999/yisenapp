using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;


/// <summary>
/// Person 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class Person : WebService
{

    public Person()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    /// <summary>
    /// 获取用户信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="loginName">登录名</param>
    [ValidateInput(false)]
    [WebMethod(Description = "getPersonInfor")]
    public void GetPersonInfor(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取用户信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select emp_photo,user_login ,emp_name,emp_email,emp_phone,role_name from sys_employee a left join sys_role b on a.role_id=b.role_id where user_login = @user_login and emp_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName)
            };
            var userInfor =
                MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                    [0].DefaultView;
            if (userInfor != null && userInfor.Table.Rows.Count == 1) //用户存在
            {
                var json = Common.DataTableToJson(userInfor.Table); //用户信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else //用户不存在或已删除
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户不存在"));
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    /// <summary>
    /// 获取用户信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="loginName">登录名</param>
    [ValidateInput(false)]
    [WebMethod(Description = "getRoleMenu")]
    public void getRoleMenu(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取用户信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select emp_photo,user_login ,emp_name,emp_email,emp_phone,role_id from sys_employee where user_login = @user_login and emp_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName)
            };
            var userInfor =
                MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                    [0].DefaultView;
            if (userInfor != null && userInfor.Table.Rows.Count == 1) //用户存在
            {
                MySqlCommand sqlcom2 = new MySqlCommand
                {
                    CommandText = "select menu_id from sys_role_menu where role_id=@role_id"
                };
                MySqlParameter[] commandParameters2 = new MySqlParameter[]
                {
                    new MySqlParameter("@role_id", userInfor.Table.Rows[0]["role_id"].ToString())
                };
                var roles =
                    MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0];
                var json = "[{\"menuname\":\""; //用户信息的Json形式
                if (roles.Select("menu_id='cea3ae39-f060-4f0b-b240-6b9f62a10a1b'").Count() > 0)
                {
                    json += "保养;";
                }
                if (roles.Select("menu_id='0029ed68-008e-47e3-8e5e-7e65fbdbf16'").Count() > 0)
                {
                    json += "巡检;";
                }
                if (roles.Select("menu_id='7eee2a0b-e53b-440a-899e-b94cd55b40f8'").Count() > 0)
                {
                    json += "交班;接班;";
                }
                if (roles.Select("menu_id='0e099dd1-3b66-4ad5-9b11-60fa4592992c'").Count() > 0)
                {
                    json += "报修;";
                }
                if (roles.Select("menu_id='6261b522-191a-4838-aa2f-9110460158a2'").Count() > 0)
                {
                    json += "校验;";
                }
                if (roles.Select("menu_id='23510a1bsdf'").Count() > 0)
                {
                    json += "检测;";
                }
                if (roles.Select("menu_id='86c32b85-666d-4250-a059-0cf79e5bc34b'").Count() > 0)
                {
                    json += "任务;";
                }
                if (roles.Select("menu_id='4421b81b-d9c8-4a63-be5c-b943909ddc05'").Count() > 0)
                {
                    json += "报警;";
                }
                string where = " scene_isdeleted='0' and scene_id in (select scene_id from ep_scene_employee where user_login=@user_login) and scene_id in (select scene_id from ep_equipment where equipment_isdeleted=0 and equipment_category='硝魔方设备')";
                
                MySqlCommand sqlcom4 = new MySqlCommand
                {
                    CommandText = "select `scene_id`,`scene_name`,`scene_city_id`,`scene_province_name`,`scene_city_name`,`equipment_number`,`scene_type`,`scene_address`,`position_x`,`position_y`,`scene_isdeleted`,`scene_memo`,`scene_create_man`,`scene_create_datetime`,`scene_update_man`,`scene_update_datetime`,`scene_shielded` from ep_scene where " + where
                };
                MySqlParameter[] commandParameters4 = new MySqlParameter[]
                {
                    new MySqlParameter("@user_login", loginName)
                };
                var xiao = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom4.CommandText, commandParameters4).Tables[0];

                if (xiao!=null&&xiao.Rows.Count>0)
                {
                    json += "硝魔方;";
                }
                json += "\"}]";
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else //用户不存在或已删除
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户不存在"));
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    [ValidateInput(false)]
    [WebMethod(Description = "ModPwd")]
    public void ModPwd(string tokenId, string loginName, string opwd, string npwd)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取旧密码
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText =
                    "select * from sys_employee where user_login = @user_login and emp_isdeleted=0 and user_pwd = @user_pwd"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName),
                new MySqlParameter("@user_pwd", opwd)
            };
            var oldre =
                MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                    [0].DefaultView;
            if (oldre != null && oldre.Table.Rows.Count == 1) //用户旧密码正确
            {
                MySqlCommand sqlcom1 = new MySqlCommand
                {
                    //保存新密码
                    CommandText = "UPDATE sys_employee SET user_pwd = @user_pwd WHERE user_login = @user_login"
                };
                MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@user_login", loginName),
                    new MySqlParameter("@user_pwd", npwd)
                };
                var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                    commandParameters1);
                if (newre == 1)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                    return;
                }
            }
            else //用户密码错误
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "旧密码错误"));
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    [ValidateInput(false)]
    [WebMethod(Description = "ModControlPwd")]
    public void ModControlPwd(string tokenId, string loginName, string opwd, string npwd)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取旧密码
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText =
                    "select * from sys_employee where user_login = @user_login and emp_isdeleted=0 and user_pwd_control = @user_pwd"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName),
                new MySqlParameter("@user_pwd", opwd)
            };
            var oldre =
                MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables
                    [0].DefaultView;
            if (oldre != null && oldre.Table.Rows.Count == 1) //用户旧密码正确
            {
                MySqlCommand sqlcom1 = new MySqlCommand
                {
                    //保存新密码
                    CommandText = "UPDATE sys_employee SET user_pwd_control = @user_pwd WHERE user_login = @user_login"
                };
                MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@user_login", loginName),
                    new MySqlParameter("@user_pwd", npwd)
                };
                var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                    commandParameters1);
                if (newre == 1)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                    return;
                }
            }
            else //用户密码错误
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "旧控制密码错误"));
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    [ValidateInput(false)]
    [WebMethod(Description = "PhotoUpload")]
    public void PhotoUpload()
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        string tokenId = HttpContext.Current.Request.Params["tokenId"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            var files = HttpContext.Current.Request.Files;
            if (files.Count > 0)
            {
                MySqlCommand sqlcom2 = new MySqlCommand
                {
                    CommandText = "select * from token where tokenId=@tokenId"
                };
                MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                    new MySqlParameter("@tokenId",tokenId)
                };
                var result = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0]; //查询结果
                var user_login = result.Rows[0]["tokenUserId"].ToString();
                string file_name = Guid.NewGuid().ToString() + System.IO.Path.GetExtension(files[0].FileName);
                var filename = Server.MapPath("/Images/user/") + file_name;
                files[0].SaveAs(filename);
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "保存成功"));
                MySqlCommand sqlcom = new MySqlCommand
                {
                    //保存新头像
                    CommandText = "UPDATE sys_employee SET emp_photo = @emp_photo WHERE user_login = @user_login"
                };
                MySqlParameter[] commandParameters = new MySqlParameter[]
                {
                    new MySqlParameter("@user_login", user_login),
                    new MySqlParameter("@emp_photo", "/Images/user/"+file_name)
                };
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText,
                    commandParameters);
                if (re == 1)
                {
                    HttpContext.Current.Response.Write("{" +
                    "'status':1," +
                    "'result':'修改成功'}");
                    return;
                }
                else
                {
                    HttpContext.Current.Response.Write("{" +
                    "'status':1," +
                    "'result':'修改失败'}");
                }
            }
            else
            {
                HttpContext.Current.Response.Write(
                    "{" +
                    "'status':1," +
                    "'result':'读取文件失败'}");
            }
        }
    }
    /// <summary>
    /// 修改手机号
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="loginName">登录名</param>
    /// <param name="phone">手机号</param>
    [ValidateInput(false)]
    [WebMethod(Description = "ModPhoneNum")]
    public void ModPhoneNum(string tokenId, string loginName, string phone)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                //保存新职位
                CommandText = "UPDATE sys_employee SET emp_phone = @emp_phone  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName),
                new MySqlParameter("@emp_phone", phone)
            };
            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                    return;
                }
                else //用户职位
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "修改失败"));
                    return;
                }
            }
            catch (Exception e)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                DLog.w("系统异常:" + e.Message);
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    /// <summary>
    /// 修改邮箱
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="Email">邮箱</param>

    [ValidateInput(false)]
    [WebMethod(Description = "ModEmail")]
    public void ModEmail(string tokenId, string loginName, string email)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                //保存新邮箱
                CommandText = "UPDATE sys_employee SET emp_email = @emp_email WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName),
                new MySqlParameter("@emp_email", email)
            };
            var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
            if (re == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                return;
            }
            else //用户邮箱
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "邮箱格式错误"));
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    [ValidateInput(false)]
    [WebMethod(Description = "ModEmp")]
    public void ModEmp(string tokenId, string loginName, string emp)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                //保存新职位
                CommandText = "UPDATE sys_employee SET emp_post = @emppost  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@user_login", loginName),
                new MySqlParameter("@emppost", emp)
            };
            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                    return;
                }
                else //用户职位
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "职位格式错误"));
                    return;
                }
            }
            catch (Exception e)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                DLog.w("系统异常:" + e.Message);
                return;
            }
        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    /// <summary>
    /// 登录验证
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "VerifyControlPwd")]
    public void VerifyControlPwd(string loginName, string password)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        try
        {
            //判断用户是否存在，是否正确
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from sys_employee where binary user_login = @user_login and user_pwd_control=@user_pwd and emp_isdeleted=0"
            };

            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@user_login",loginName),
                new MySqlParameter("@user_pwd",password),
         
            };

            var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;

            if (userInfor != null && userInfor.Table.Rows.Count == 1)//用户名密码正确
            {

                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "验证控制密码成功"));
                return;
            }
            else//用户名密码错误，或用户已删除
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "控制密码错误"));
                return;
            }
        }
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未连接到数据库"));
            return;
        }
    }
}