using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;

/// <summary>
/// Token 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.ComponentModel.ToolboxItem(false)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Token : System.Web.Services.WebService
{

    public Token () {
        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    /// <summary>
    /// 获取服务器时间
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "getTime")]
    public void GetTime()
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        TimeSpan ts = DateTime.Now - DateTime.Parse("1970-1-1");
        HttpContext.Current.Response.Write(jsonCallBackFunName + "({'time':'" + ts.TotalMilliseconds + "'})");
    }

    /// <summary>
    /// 获取TokenID
    /// </summary>
    /// <param name="username">用户名</param>
    /// <param name="hash">用户名、密码、发送时间的Hash值</param>
    /// <param name="sendTime">发送时间，毫秒数</param>
    [ValidateInput(false)]
    [WebMethod(Description = "getTokenId")]
    public void GetTokenId(string username, string hash, long sendTime)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        TimeSpan ts = DateTime.Now - DateTime.Parse("1970-1-1");
        var now = ts.TotalMilliseconds;//系统当前时间，毫秒数
        if (Math.Abs(sendTime - now) > 300000)//请求时间超时，超过5分钟
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请求超时"));
            return;
        }

        //获取用户信息
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "select * from sys_employee where user_login = @user_login and emp_isdeleted=0"
        };
        MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@user_login",username)
        };
        try
        {
            var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (userInfor != null && userInfor.Table.Rows.Count > 0)//存在用户
            {
                var hashStr = userInfor.Table.Rows[0]["user_login"].ToString() + userInfor.Table.Rows[0]["user_pwd"].ToString() + sendTime;
                var x = hash;
                var y = Md5Utils.Md5Encrypt32(hashStr);
                if (hash.Equals(Md5Utils.Md5Encrypt32(hashStr)))//如果hash值正确
                {
                    var tokenId = Guid.NewGuid().ToString();
                    var tokenExpireTime = sendTime + 7200000;//Token过期时间，2个小时
                    sqlcom = new MySqlCommand
                    {
                        CommandText = "insert into token(tokenId,tokenUserId,tokenCreateTime,tokenExpireTime,createTime) values(@tokenId,@tokenUserId,@tokenCreateTime,@tokenExpireTime,now())"
                    };
                    commandParameters = new MySqlParameter[]{
                        new MySqlParameter("@tokenId",tokenId),
                        new MySqlParameter("@tokenUserId",username),
                        new MySqlParameter("@tokenCreateTime",sendTime),
                        new MySqlParameter("@tokenExpireTime",tokenExpireTime)
                    };
                    try
                    {
                        var rowNums = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);//将Token记录插入数据库
                        if (rowNums == 1)//插入成功
                        {
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, tokenId));
                            return;
                        }
                        else//插入失败
                        {
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "写入失败"));
                            return;
                        }
                    }
                    catch (Exception e)
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                        DLog.w("系统异常:"+e.Message);
                        return;
                    }
                }
                else//如果不正确
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "hash值错误"));
                    DLog.w("Token.cs->GetTokenId()->hash值错误");
                    return;
                }
            }
            else//用户不存在
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户不存在"));
                return;
            }
        }
        catch (Exception e)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
            DLog.w("系统异常:"+e.Message);
            return;
        }
    }
}
