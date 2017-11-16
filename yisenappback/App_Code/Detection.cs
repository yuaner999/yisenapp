using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using MySql.Data.MySqlClient;

/// <summary>
/// Detection 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
// [System.Web.Script.Services.ScriptService]
public class Detection : System.Web.Services.WebService {

    public Detection () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }
    /// <summary>
    /// 加载检测列表信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="userName"></param>
    /// <param name="startNum"></param>
    /// <param name="num"></param>
    /// <param name="startDate"></param>
    /// <param name="endDate"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetDetectionListInfo")]
    public void GetDetectionListInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate)
    {
        GetDetectionListInfo2(tokenId, userName, startNum, num, startDate, endDate, "");
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetDetectionListInfo2")]
    public void GetDetectionListInfo2(string tokenId, string userName, int startNum, int num, string startDate, string endDate,string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT  *   FROM  ep_detection "+
                              "WHERE scene_id IN (SELECT scene_id FROM ep_scene_employee WHERE user_login=@loginName) "+
                              "AND  detection_isdeleted=0 "+
                              "AND  DATE(detection_date)>=@startDate "+
                              "AND  DATE(detection_date)<=@endDate ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += "AND scene_id=@scene_id ";
            }
            CommandText += "ORDER BY detection_date DESC  " +
           "LIMIT @startNum,@num";
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@loginName",userName),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd")),
                new MySqlParameter("@scene_id",scene_id)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "检测信息不存在"));
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
    [WebMethod(Description = "getDetectioninfo")]
    public void getDetectioninfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_detection_detail WHERE detection_id = @id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id",id),

            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "检测信息不存在"));
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
    [WebMethod(Description = "GetPrimitiveInfo")]
    public void GetPrimitiveInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_detection.scene_name,ep_detection.equipment_name, ep_detection_detail.item_name,ep_detection.detection_date,DATE_ADD(ep_detection.detection_date, INTERVAL -3 MONTH) date2 " +
                              "FROM  environmental_protection.ep_detection INNER JOIN environmental_protection.ep_detection_detail "+
                              "ON (ep_detection.detection_id = ep_detection_detail.detection_id) "+
                              "where detection_detail_id=@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id",id),

            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "检测信息不存在"));
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
    [WebMethod(Description = "GetValue")]
    public void GetValue(string tokenId, string sceneName, string equName, string itemName, string date1, string date2)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " SELECT ep_detection_detail.value,detection_date FROM environmental_protection.ep_detection INNER JOIN environmental_protection.ep_detection_detail " +
                              " ON (ep_detection.detection_id = ep_detection_detail.detection_id) " +
                              " WHERE  scene_name= @sceneName "+
                              " AND equipment_name=@equName "+
                              " AND item_name=@itemName "+
	                          " AND DATE(detection_date)>=@date1 "+
                              " AND DATE(detection_date)<=@date2  " +
                              " ORDER BY detection_date ASC "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@sceneName",sceneName),
                new MySqlParameter("@equName",equName),
                new MySqlParameter("@itemName",itemName),
                new MySqlParameter("@date1",date1),
                new MySqlParameter("@date2",date2)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "检测对应的数据不存在"));
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
