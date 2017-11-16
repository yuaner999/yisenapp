using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using MySql.Data.MySqlClient;


/// <summary>
/// Scene 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class WarnInfo : WebService
{

    public WarnInfo()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

     /// <summary>
    /// 加载报警信息
    /// </summary>
    /// 
    /// <param name="warnid"> 报警id</param>
    [ValidateInput(false)]
    [WebMethod(Description = "LoadWarnInfo")]
    public void LoadWarnInfo(string tokenId, string warnid, string loginName, string spage, string rows)
    {
        LoadWarnInfo2(tokenId,  warnid,  loginName,  spage,  rows,  "");
    }

    /// <summary>
    /// 加载报警信息
    /// </summary>
    /// 
    /// <param name="warnid"> 报警id</param>
    [ValidateInput(false)]
    [WebMethod(Description = "LoadWarnInfo2")]
    public void LoadWarnInfo2(string tokenId, string warnid, string loginName, string spage, string rows,string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        int sspage = int.Parse(spage);
        int srows = int.Parse(rows);
        int page = (sspage - 1) * srows;

        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT ep_equipment_component.*,ep_warning_log.* FROM ep_warning_log LEFT JOIN ep_equipment_component ON(ep_warning_log.equipment_component_id = ep_equipment_component.equipment_component_id) WHERE warning_status in('报警中','处理中') and ep_equipment_component.scene_id in (select scene_id from ep_scene_employee where user_login=@loginName) and ep_warning_log.warning_level=@warning_id ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += " AND ep_warning_log.scene_id=@scene_id ";
            }
            CommandText += " ORDER BY case warning_status when '报警中' then 1 when '已处理' then 2 else 3 end,warning_datetime desc limit @spage,@rows";
            //读取报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText=CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@warning_id", warnid),
                new MySqlParameter("@loginName", loginName),
                new MySqlParameter("@spage", page),
                new MySqlParameter("@rows", srows),
                new MySqlParameter("@scene_id", scene_id)
            
            };
            try
            {
                var warnInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (warnInfo != null && warnInfo.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(warnInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报警信息不存在"));
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
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }

    }

    /// <summary>
    /// 根据报警ID加载报警信息
    /// </summary>
    /// 
    /// <param name="warnid"> 报警id</param>
    [ValidateInput(false)]
    [WebMethod(Description = "LoadWarnInfoById")]
    public void LoadWarnInfoById(string tokenId, string warnid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        

        if (Common.VerifyTokenId(tokenId))
        {
            //读取报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_warning_log.* FROM ep_warning_log WHERE warning_log_id=@warning_log_id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@warning_log_id", warnid)
            };
            try
            {
                var warnInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (warnInfo != null && warnInfo.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(warnInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报警信息不存在"));
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
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }

    }

    [ValidateInput(false)]
    [WebMethod(Description = "Checkfix")]
    public void Checkfix(string tokenId, string id, string status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //检修
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_warning_log SET warning_status =@status  WHERE warning_log_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id", id),
                new MySqlParameter("@status", status)
            };
            try
            {
                var cf = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (cf == 1) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "处理信息保存失败"));
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
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }


    /// <summary>
    /// 跟据部件的id查看故障分析
    /// </summary>
    /// 

    [ValidateInput(false)]
    [WebMethod(Description = "getReasonsInfo")]
    public void getReasonsInfo(string tokenId, string comId, string warntype)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
      
        if (Common.VerifyTokenId(tokenId))
        {
            //跟据部件的id 查看原因
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "  select  * from `ep_failure_analysis` where component_id=@comId and warning_type=@warntype"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@comId", comId),
                 new MySqlParameter("@warntype", warntype)
            };
            try
            {
                var reasonInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (reasonInfo != null && reasonInfo.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(reasonInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有对应的故障分析"));
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
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }

    }



    /// <summary>
    /// 查看解决的方案
    /// </summary>
    /// 
    [ValidateInput(false)]
    [WebMethod(Description = "getsolutionInfo")]
    public void getsolutionInfo(string tokenId, string reason)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        if (Common.VerifyTokenId(tokenId))
        {
            //跟据部件的id 查看原因
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "  select  * from `ep_failure_analysis` where reason=@reason"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@reason", reason)
            };
            try
            {
                var reasonInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (reasonInfo != null && reasonInfo.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(reasonInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有对应的解决方案"));
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
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }

    }
}
