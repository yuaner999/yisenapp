using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;

/// <summary>
/// Login 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class SaveClientid : WebService
{

    public SaveClientid()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    /// <summary>
    /// 保存
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "saveClientid")]
    public void SaveClientidInfo(string loginName, string clientid)
    {

        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断用户是否存在，是否正确
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "update sys_employee set user_clientid =@user_clientid where user_login =@user_login"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
           new MySqlParameter("@user_login", loginName),
           new MySqlParameter("@user_clientid", clientid)
         
        };

        var cid = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
        if (cid >= 1) //信息存在
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "保存成功"));
            return;
        }
        else //不存在或已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "保存信息保存失败"));
            return;
        }
    }
    /// <summary>
    /// 保存
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "checkLogin")]
    public void checkLogin(string loginName)
    {

        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断用户是否存在，是否正确
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "SELECT user_clientid FROM sys_employee where user_login =@user_login"
        };

        MySqlParameter[] commandParameters = new MySqlParameter[]{
           new MySqlParameter("@user_login", loginName)
         
        };

         var info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
        if (info != null ) //信息存在
        {
            var json = Common.DataTableToJson(info.Table);
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1,json ));
            return;
        }
        else //不存在或已删除
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "保存信息保存失败"));
            return;
        }
    }
}
