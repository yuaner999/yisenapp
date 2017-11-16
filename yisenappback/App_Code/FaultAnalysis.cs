using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using Dugufeixue.BLL;
using Dugufeixue.Common;
using Dugufeixue.Model;
using MySql.Data.MySqlClient;

/// <summary>
/// FaultAnalysis 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
// [System.Web.Script.Services.ScriptService]
public class FaultAnalysis : System.Web.Services.WebService {

    public FaultAnalysis () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    //根据部件的id和报警类型 加载故障分析列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetAnalysisListInfo")]
    public void GetAnalysisListInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sql = new MySqlCommand
            {
                CommandText = "select * from ep_warning where warning_id=@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]{
                new MySqlParameter("@id",id)
            };
            var info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sql.CommandText, commandParameters1).Tables[0].DefaultView;
            string componentid = info.Table.Rows[0]["component_id"].ToString();
            string type = info.Table.Rows[0]["warning_type"].ToString();
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT *, COUNT(DISTINCT reason) FROM ep_failure_analysis WHERE component_id=@id AND warning_type=@type and analysis_isdeleted='0' GROUP BY reason"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",componentid),
                new MySqlParameter("@type",type)
            };
            var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (titleInfo != null)//查询成功
            {
                var json = Common.DataTableToJson(titleInfo.Table); //信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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
    [WebMethod(Description = "GetAnalysisInfo")]
    public void GetAnalysisInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sql = new MySqlCommand
            {
                CommandText = "select * from ep_failure_analysis where failure_analysis_id=@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]{
                new MySqlParameter("@id",id)
            };
            var info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sql.CommandText, commandParameters1).Tables[0].DefaultView;
            string componentid = info.Table.Rows[0]["component_id"].ToString();
            string type = info.Table.Rows[0]["warning_type"].ToString();
            string reason = info.Table.Rows[0]["reason"].ToString();
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_failure_analysis WHERE component_id=@id AND warning_type=@type and reason=@reason and analysis_isdeleted='0' GROUP BY solution order by analysis_create_datetime"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",componentid),
                new MySqlParameter("@type",type),
                new MySqlParameter("@reason",reason) 
            };
            var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (titleInfo != null)//查询成功
            {
                var json = Common.DataTableToJson(titleInfo.Table); //信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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
