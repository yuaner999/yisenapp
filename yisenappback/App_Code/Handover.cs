using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using Dugufeixue.Model;
using MySql.Data.MySqlClient;
using NPOI.SS.Formula.Functions;
using Dugufeixue.BLL;
using Dugufeixue.Common;

/// <summary>
/// Handover 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Handover : System.Web.Services.WebService {

    public Handover () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }
    //跟据员工的id 交接班的列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverListInfo")]
    public void GetHandoverListInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate)
    {
        GetHandoverListInfo11(tokenId, userName, startNum, num, startDate, endDate, "");
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverListInfo11")]
    public void GetHandoverListInfo11(string tokenId, string userName, int startNum, int num, string startDate, string endDate,string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT *  " +
                               "FROM  ep_handover  " +
                               "WHERE handover_man_after_login=@userName " +
                               "AND handover_isdeleted =0 " +
                               "AND handover_datetime_before>@startDate " +
                               "AND handover_datetime_before<@endDate ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += " AND scene_id=@scene_id ";
            }
            CommandText += " order by  handover_datetime_before desc " +
                               "LIMIT @startNum,@num";

            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@userName",userName),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@scene_id",scene_id),
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

    //跟据员工的id 交接班的列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverListInfo2")]
    public void GetHandoverListInfo2(string tokenId, string userName, int startNum, int num, string startDate, string endDate)
    {
        GetHandoverListInfo21(tokenId, userName, startNum, num, startDate, endDate, "");
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverListInfo21")]
    public void GetHandoverListInfo21(string tokenId, string userName, int startNum, int num, string startDate, string endDate,string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT *  FROM ep_handover " +
                              " WHERE handover_man_before_login=@userName " +
                              "AND handover_isdeleted =0 " +
                              "AND date(handover_datetime_before)>=@startDate " +
                              "AND date(handover_datetime_before)<=@endDate ";
                              if (scene_id != null && scene_id != "")
            {
                CommandText += " AND scene_id=@scene_id ";
            }
                              CommandText += "order by  handover_datetime_before desc " +
                              "LIMIT @startNum,@num";
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@userName",userName),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@scene_id",scene_id),
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
    //不同意接班
    [ValidateInput(false)]
    [WebMethod(Description = "DisagreeHandover")]
    public void DisagreeHandover(string tokenId, string id )
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_handover tblHandover = BF<bll_ep_handover>.Instance.GetModel(id);
            if (tblHandover == null)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到交班信息"));
                return;
            }
            if(tblHandover.handover_status!=0)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "交班信息状态不正确"));
                return;
            }
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE ep_handover SET handover_status =3 WHERE handover_id =@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@id", id)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                tbl_sys_employee tblBefore = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + tblHandover.handover_man_before_login + "'");
                tbl_ep_message tbl_message = new tbl_ep_message();
                tbl_message.message_id = Guid.NewGuid().ToString();
                tbl_message.emp_id = tblBefore.emp_id;
                tbl_message.emp_name = tblHandover.handover_man_before;
                tbl_message.message_title = "接班人不同意接班";
                tbl_message.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                tbl_message.message_status = 0;
                tbl_message.message_content = tblHandover.handover_man_after + "不同意交班，请您联系后重新提交！";
                tbl_message.message_type = "交班";
                tbl_message.message_order_id = tblHandover.handover_id;
                tbl_message.scene_id = tblHandover.scene_id;
                tbl_message.scene_name = tblHandover.scene_name;
                BF<bll_ep_message>.Instance.Add(tbl_message);

                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                return;
            }
            else {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "修改失败"));
                return;
            }

        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    //删除接班
    [ValidateInput(false)]
    [WebMethod(Description = "DeleteHandoverById")]
    public void DeleteHandoverById(string tokenId, string handover_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_handover tblHandover = BF<bll_ep_handover>.Instance.GetModel(handover_id);
            if (tblHandover == null)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到交班信息"));
                return;
            }
            if (tblHandover.handover_status != 4)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "该状态的交班信息不能删除"));
                return;
            }
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "delete from ep_handover WHERE handover_id =@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@id", handover_id)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "删除成功"));
                return;
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "删除失败"));
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
    /// 交班
    /// </summary>
    /// <returns></returns>
    [ValidateInput(false)]
    [WebMethod(Description = "AddHandover")]
    public void AddHandover(string tokenId,string sid,string hmb,string hma)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        var guid = Guid.NewGuid().ToString();
         //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //新增交班信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_handover(handover_id,scene_id,handover_man_before,handover_man_after,handover_status,handover_datetime_before) VALUES(@guid,@scene_id,@handover_man_before,@handover_man_after,'0',NOW())"
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_handover(handover_id,scene_id,handover_man_before,handover_man_after,handover_status,handover_datetime_before) VALUES(UUID(),@scene_id,@handover_man_before,@handover_man_after,'0',NOW())"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {    
                new MySqlParameter("@guid", guid),
                new MySqlParameter("@scene_id", sid),
                new MySqlParameter("@handover_man_before", hmb),
                new MySqlParameter("@handover_man_after", hma)

            };
            MySqlParameter[] commandParameters2 = new MySqlParameter[]
            {
                new MySqlParameter("@scene_id", sid),
                new MySqlParameter("@handover_man_before", hmb),
                new MySqlParameter("@handover_man_after", hma)
            };
            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                var re2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                if (re == 1&&re2==1) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "提交成功"));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "信息保存失败"));
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
    
    //读取交接班的标题部分的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetTitleInfo")]
    public void GetTitleInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " SELECT  * FROM  ep_handover   WHERE   handover_id = @id "+
                               " AND handover_isdeleted='0'"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",id),
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

    //通过现场查询交接班设备名
    [ValidateInput(false)]
    [WebMethod(Description = "GetNewCategory")]
    public void GetNewCategory(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " select distinct(item_category) from ep_handover_detail_default where scene_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",id),
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

    //查询交接班设备名
    [ValidateInput(false)]
    [WebMethod(Description = "GetCategory")]
    public void GetCategory(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " select distinct(item_category) from ep_handover_detail where handover_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",id),
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
    [WebMethod(Description = "GetHandoverMan")]
    public void GetHandoverMan(string tokenId,string sid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
         //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT user_login,emp_name FROM sys_employee WHERE scene_id =@sid"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@sid", sid)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "接班人信息不存在"));
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
    [WebMethod(Description = "GetOtherHandoverMan")]
    public void GetOtherHandoverMan(string tokenId, string sid, string userlogin)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
         //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from sys_employee A left join ep_scene_employee B on A.`emp_id`=B.`emp_id` where B.scene_id=@sid and emp_isdeleted='0' and A.user_login != @userlogin"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@sid", sid),
                new MySqlParameter("@userlogin", userlogin),
            };
            try
            {
                var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (titleInfo != null)//查询成功
                {
                    var json = Common.DataTableToJson(titleInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "接班人信息不存在"));
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

    //加载接班内容的具体信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverInfo")]
    public void GetHandoverInfo(string tokenId, string id, string category)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from ep_handover_detail where handover_id = @id and item_category=@category " +
                              "order by sort_order "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id", id),
                 new MySqlParameter("@category", category)
             
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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

    //通过现场加载接班内容的具体信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetNewHandoverInfo")]
    public void GetNewHandoverInfo(string tokenId, string id, string category)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from ep_handover_detail_default where scene_id = @id and item_category=@category " +
                              "order by sort_order "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id", id),
                 new MySqlParameter("@category", category)
             
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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

    //加载交班内容的具体信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetHandoverInfoById")]
    public void GetHandoverInfoById(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            tbl_ep_handover tbl = BF<bll_ep_handover>.Instance.GetModel(id);

            string json = "{\"scene_name\":\"" + tbl.scene_name + "\",\"after_name\":\"" + tbl.handover_man_after + "\",\"scene_id\":\"" + tbl.scene_id + "\",\"after_login\":\"" + tbl.handover_man_after_login;
            string aftername = "";
               
                
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select emp_name from ep_handover_afterman left join sys_employee on afterman_id=sys_employee.emp_id where handover_id=@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                new MySqlParameter("@id", id)
            };
            try
            {
                var warnInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (warnInfo != null && warnInfo.Table.Rows.Count >= 1) //信息存在
                {
                    for (int i = 0; i < warnInfo.Count; i++)
                    {
                        aftername += warnInfo[i]["emp_name"] + ";";
                    }
                    json += "\",\"aftername\":\"" + aftername + "\"}";
                    
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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

    //单条保存接班的信息
    [ValidateInput(false)]
    [WebMethod(Description = "SaveHandoverInfo")]
    public void SaveHandoverInfo(string tokenId, string status, string detailid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE ep_handover_detail SET handover_status =@status WHERE handover_detail_id =@detailid"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@status", status),
                    new MySqlParameter("@detailid", detailid)
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                return;
            }

        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    //保存单条的备注信息
    [ValidateInput(false)]
    [WebMethod(Description = "saveMemoInfo")]
    public void saveMemoInfo(string tokenId, string content, string detailid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE  ep_handover_detail SET handover_memo =@content  WHERE handover_detail_id =@detailid "
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@content", content),
                    new MySqlParameter("@detailid", detailid),
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                return;
            }

        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    //接班的信息的提交
    [ValidateInput(false)]
    [WebMethod(Description = "SumbitHandoverInfo")]
    public void SumbitHandoverInfo(string tokenId, string handoverId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_handover tblHandover = BF<bll_ep_handover>.Instance.GetModel(handoverId);
            if (tblHandover == null)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到交班信息"));
                return;
            }
            if(tblHandover.handover_status!=0)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "交班信息状态不正确"));
                return;
            }
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = " UPDATE  ep_handover SET handover_datetime_after =NOW(), handover_status  =2    WHERE   handover_id =@handoverId  "
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@handoverId", handoverId),
                };
            var newre = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText,
                commandParameters1);
            if (newre == 1)
            {
                tbl_sys_employee tblBefore = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + tblHandover.handover_man_before_login + "'");
                tbl_ep_message tbl_message = new tbl_ep_message();
                tbl_message.message_id = Guid.NewGuid().ToString();
                tbl_message.emp_id = tblBefore.emp_id;
                tbl_message.emp_name = tblHandover.handover_man_before;
                tbl_message.message_title = "接班人已同意接班";
                tbl_message.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                tbl_message.message_status = 0;
                tbl_message.message_content = tblHandover.handover_man_after + "已同意接班，请查看！";
                tbl_message.message_type = "交班";
                tbl_message.message_order_id = tblHandover.handover_id;
                tbl_message.scene_id = tblHandover.scene_id;
                tbl_message.scene_name = tblHandover.scene_name;
                BF<bll_ep_message>.Instance.Add(tbl_message);
                sendAllCenterPerson("接收到一条成功交接班消息", "交接班提醒：接班人【" + tblHandover.handover_man_after + "】与交班人【" + tblHandover.handover_man_before + "】完成交接班。", "管理员交接班提醒", tblHandover.handover_id, tblHandover.scene_id, tblHandover.scene_name, "", "", "", "");
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "修改成功"));
                return;
            }

        }
        else //TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    //获得所在的现场名
    [ValidateInput(false)]
    [WebMethod(Description = "GetScene")]
    public void GetScene(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " select distinct scene_id, scene_name from  `ep_scene_employee` where user_login =@loginName"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@loginName",loginName),
            };
            var sceneInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (sceneInfo != null)//查询成功
            {
                var json = Common.DataTableToJson(sceneInfo.Table); //信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;

            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有现场信息"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    //获得接班人
    [ValidateInput(false)]
    [WebMethod(Description = "getReceiveMan")]
    public void getReceiveMan(string tokenId, string sid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from  sys_employee where  emp_id in (select emp_id from  ep_scene_employee where  scene_id =@sid) and emp_isdeleted='0'"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@sid",sid),
            };
            var info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (info != null)//查询成功
            {
                var json = Common.DataTableToJson(info.Table); //信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;

            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有现场信息"));
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
    /// 添加交班信息
    /// </summary>
    /// <returns></returns>
    [ValidateInput(false)]
    [WebMethod(Description = "AddReceivedInfo")]
    public void AddReceivedInfo(string tokenId, string sid, string sname, string hm1, string hm2, string login, string empid, string memo)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
       
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string[] empids = null;
            if (empid != null)
            {
                empids = empid.Split(',');
            }
            //查询接班人
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                CommandText = "SELECT emp_name,emp_id FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", hm1)
            };
            try
            {

                var Info =MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText, commandParameters1).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    string handverId = Guid.NewGuid().ToString();
                    string man_before = Info.Table.Rows[0][0].ToString();
                    //新增交班信息
                    MySqlCommand sqlcom = new MySqlCommand
                    {
                        CommandText =
                            "INSERT INTO `environmental_protection`.`ep_handover` (handover_id,scene_id, scene_name,handover_man_before, handover_man_after, handover_status,handover_datetime_before,handover_isdeleted,handover_man_before_login,handover_man_after_login) " +
                            " VALUES(@handverId,@sid,@sname, @man_before, @man_after, 0,  NOW(),0,@before_login,@after_login) "
                    };
                    MySqlParameter[] commandParameters = new MySqlParameter[]
                    {   
                        new MySqlParameter("@handverId", handverId),
                        new MySqlParameter("@sid", sid),
                        new MySqlParameter("@sname", sname),
                        new MySqlParameter("@man_before", man_before),
                        new MySqlParameter("@man_after", hm2),
                        new MySqlParameter("@before_login", hm1),
                        new MySqlParameter("@after_login", login)

                    };
                    var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);

                    bool result = true;
                    MySqlCommand sqlcomafter = new MySqlCommand
                    {
                        CommandText = "insert into ep_handover_afterman (handover_afterman_id, handover_id, afterman_id)" +
                        " value(@handover_afterman_id,@handover_id,@afterman_id)"
                    };
                    foreach (string id in empids)
                    {
                        string handoverafterid = Guid.NewGuid().ToString();
                        MySqlParameter[] commandParametersafter = new MySqlParameter[]
                        {   
                            new MySqlParameter("@handover_afterman_id", handoverafterid),
                            new MySqlParameter("@handover_id", handverId),
                            new MySqlParameter("@afterman_id", id)
                        };
                        var reafter = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcomafter.CommandText, commandParametersafter);
                        if (reafter == 0)
                        {
                            result = false;
                        }
                    }
                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "select * from  ep_handover_detail_default where  scene_id =@sid"
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                         new MySqlParameter("@sid",sid),
                     };
                    var defaultInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0].DefaultView;
                    int index = 0;
                    string[] memos = memo.Split(',');
                    if (defaultInfo != null && defaultInfo.Table.Rows.Count >= 1) //信息存在
                    {
                       
                        for (int i = 0; i < defaultInfo.Table.Rows.Count; i++)
                        {
                            string item_category = defaultInfo.Table.Rows[i][3].ToString();
                            string item_type = defaultInfo.Table.Rows[i][4].ToString();
                            string item_name = defaultInfo.Table.Rows[i][5].ToString();
                            //string handover_status = defaultInfo.Table.Rows[i][6].ToString();
                            //string handover_memo = defaultInfo.Table.Rows[i][7].ToString();
                            string sort_order = defaultInfo.Table.Rows[i][8].ToString();
                            string handover_memo = "";
                            int order = Int16.Parse(sort_order);
                            if (order < memos.Length)
                            {
                                handover_memo = memos[order];
                            }
                            else
                            {
                                handover_memo = defaultInfo.Table.Rows[i][7].ToString();
                            }
                            MySqlCommand sqlcom4 = new MySqlCommand
                            {
                                CommandText = "insert into ep_handover_detail (handover_detail_id,handover_id,item_category, "+
                                              "item_type,item_name,handover_memo,sort_order) values "+
                                              "(uuid(),@handverId,@item_category,@item_type, @item_name,@handover_memo,@sort_order) "
                            };
                            MySqlParameter[] commandParameters4 = new MySqlParameter[]
                            {    
                                new MySqlParameter("@handverId", handverId),
                                new MySqlParameter("@item_category", item_category),
                                new MySqlParameter("@item_type", item_type),
                                new MySqlParameter("@item_name", item_name),
                                new MySqlParameter("@handover_memo", handover_memo),
                                new MySqlParameter("@sort_order", sort_order)

                              };
                         var num =   MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom4.CommandText, commandParameters4);
                            if (num==1)
                            {
                                index++;
                            }
                        }
                        
                    }


                    if (re == 1 && index == defaultInfo.Table.Rows.Count)
                    {
                        tbl_sys_employee tblAfter = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + login + "'");
                        tbl_ep_message tbl_message = new tbl_ep_message();
                        tbl_message.message_id = Guid.NewGuid().ToString();
                        tbl_message.emp_id = tblAfter.emp_id;
                        tbl_message.emp_name = tblAfter.emp_name;
                        tbl_message.message_title = "请按时接班";
                        tbl_message.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                        tbl_message.message_status = 0;
                        tbl_message.message_content = man_before + "已交班，请您按时接班！";
                        tbl_message.message_type = "接班";
                        tbl_message.message_order_id = handverId;
                        tbl_message.scene_id = sid;
                        tbl_message.scene_name = sname;
                        BF<bll_ep_message>.Instance.Add(tbl_message);

                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "提交成功"));
                        return;
                    }else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "提交失败"));
                        return;
                    }
                        

                    
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
    /// 更新交班信息
    /// </summary>
    /// <returns></returns>
    [ValidateInput(false)]
    [WebMethod(Description = "UpdateHandover")]
    public void UpdateHandover(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            try
            {
                tbl_ep_handover tbl = BF<bll_ep_handover>.Instance.GetModel(id);
                tbl.handover_status = 0;
                tbl.handover_datetime_before = Dugufeixue.Common.DateTimeServer.GetServerDateTime();
                BF<bll_ep_handover>.Instance.Update(tbl);
                tbl_sys_employee tblAfter = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + tbl.handover_man_after_login + "'");
                tbl_ep_message tbl_message = new tbl_ep_message();
                tbl_message.message_id = Guid.NewGuid().ToString();
                tbl_message.emp_id = tblAfter.emp_id;
                tbl_message.emp_name = tblAfter.emp_name;
                tbl_message.message_title = "请按时接班";
                tbl_message.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                tbl_message.message_status = 0;
                tbl_message.message_content = tbl.handover_man_before + "已交班，请您按时接班！";
                tbl_message.message_type = "接班";
                tbl_message.message_order_id = id;
                tbl_message.scene_id = tbl.scene_id;
                tbl_message.scene_name = tbl.scene_name;
                BF<bll_ep_message>.Instance.Add(tbl_message);

                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "提交成功"));
                return;
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
    /// 保存交班信息
    /// </summary>
    /// <returns></returns>
    [ValidateInput(false)]
    [WebMethod(Description = "SaveReceivedInfo")]
    public void SaveReceivedInfo(string tokenId, string sid, string sname, string hm1, string hm2, string login, string empid, string handoverid,string memo)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string[] empids = null;
            if (empid != null)
            {
                empids = empid.Split(',');
            }
            //查询接班人
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                CommandText = "SELECT emp_name,emp_id FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", hm1)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText, commandParameters1).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    string handverId = Guid.NewGuid().ToString();
                    string man_before = Info.Table.Rows[0][0].ToString();
                    //新增交班信息
                    if (handoverid == "-1")
                    {
                        MySqlCommand sqlcom = new MySqlCommand
                        {
                            CommandText =
                                "INSERT INTO `environmental_protection`.`ep_handover` (handover_id,scene_id, scene_name,handover_man_before, handover_man_after, handover_status,handover_datetime_before,handover_isdeleted,handover_man_before_login,handover_man_after_login) " +
                                " VALUES(@handverId,@sid,@sname, @man_before, @man_after, 4,  NOW(),0,@before_login,@after_login) "
                        };
                        MySqlParameter[] commandParameters = new MySqlParameter[]
                        {   
                            new MySqlParameter("@handverId", handverId),
                            new MySqlParameter("@sid", sid),
                            new MySqlParameter("@sname", sname),
                            new MySqlParameter("@man_before", man_before),
                            new MySqlParameter("@man_after", hm2),
                            new MySqlParameter("@before_login", hm1),
                            new MySqlParameter("@after_login", login)

                        };
                        var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);

                        bool result = true;
                        MySqlCommand sqlcomafter = new MySqlCommand
                        {
                            CommandText = "insert into ep_handover_afterman (handover_afterman_id, handover_id, afterman_id)" +
                            " value(@handover_afterman_id,@handover_id,@afterman_id)"
                        };
                        foreach (string id in empids)
                        {
                            string handoverafterid = Guid.NewGuid().ToString();
                            MySqlParameter[] commandParametersafter = new MySqlParameter[]
                            {   
                                new MySqlParameter("@handover_afterman_id", handoverafterid),
                                new MySqlParameter("@handover_id", handverId),
                                new MySqlParameter("@afterman_id", id)
                            };
                            var reafter = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcomafter.CommandText, commandParametersafter);
                            if (reafter == 0)
                            {
                                result = false;
                            }
                        }
                        MySqlCommand sqlcom2 = new MySqlCommand
                        {
                            CommandText = "select * from  ep_handover_detail_default where scene_id =@sid order by sort_order"
                        };
                        MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                            new MySqlParameter("@sid",sid),
                        };
                        var defaultInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0].DefaultView;
                        int index = 0;
                        string[] memos = memo.Split(',');
                        if (defaultInfo != null && defaultInfo.Table.Rows.Count >= 1) //信息存在
                        {

                            for (int i = 0; i < defaultInfo.Table.Rows.Count; i++)
                            {
                                string item_category = defaultInfo.Table.Rows[i][3].ToString();
                                string item_type = defaultInfo.Table.Rows[i][4].ToString();
                                string item_name = defaultInfo.Table.Rows[i][5].ToString();
                                //string handover_status = defaultInfo.Table.Rows[i][6].ToString();
                                string handover_memo = "";
                                string sort_order = defaultInfo.Table.Rows[i][8].ToString();
                                int order = Int16.Parse(sort_order);
                                if (order < memos.Length)
                                {
                                    handover_memo = memos[order];
                                }
                                else
                                {
                                    handover_memo = defaultInfo.Table.Rows[i][7].ToString();
                                }
                                
                                MySqlCommand sqlcom4 = new MySqlCommand
                                {
                                    CommandText = "insert into ep_handover_detail (handover_detail_id,handover_id,item_category, " +
                                                  "item_type,item_name,handover_memo,sort_order) values " +
                                                  "(uuid(),@handverId,@item_category,@item_type, @item_name,@handover_memo,@sort_order) "
                                };
                                MySqlParameter[] commandParameters4 = new MySqlParameter[]
                                {    
                                    new MySqlParameter("@handverId", handverId),
                                    new MySqlParameter("@item_category", item_category),
                                    new MySqlParameter("@item_type", item_type),
                                    new MySqlParameter("@item_name", item_name),
                                    new MySqlParameter("@handover_memo", handover_memo),
                                    new MySqlParameter("@sort_order", sort_order)

                                  };
                                var num = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom4.CommandText, commandParameters4);
                                if (num == 1)
                                {
                                    index++;
                                }
                            }

                        }

                        if (re == 1 && index == defaultInfo.Table.Rows.Count)
                        {
                            sendAllCenterPerson("接收到一条保存交班信息消息", "交接班提醒：交班人【" + ClsCurrentUserInfo.EmpName + "】保存了交班信息，接班人为【" + hm2 + "】。", "管理员交接班提醒", handverId, sid,sname,"","","","");
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "提交成功"));
                            return;
                        }
                        else //不存在或已删除
                        {
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "提交失败"));
                            return;
                        }
                    }
                    else
                    {
                        
                    }
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

    public void sendAllCenterPerson(string message_title, string message_content, string message_type,
        string message_order_id, string scene_id, string scene_name, string equipment_id, string equipment_name, string equipment_component_id, string component_name)
    {
        Dugufeixue.Common.SystemConfig.ConnectionStringKey =
            System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        try
        {
            List<tbl_sys_employee> lstEmp =
                BF<bll_sys_employee>.Instance.GetModelList(
                    "role_id='1aef5347-9d51-4f07-94e6-affbfb3cea4a' and emp_isdeleted=0", "");
            foreach (tbl_sys_employee tblEmp in lstEmp)
            {
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText =
                        "INSERT INTO ep_message (message_id, message_time, message_title, message_content,message_status,emp_id,emp_name,message_type,message_order_id,scene_id,scene_name,equipment_id,equipment_name,equipment_component_id,component_name) " +
                        " VALUES( @id, @message_time,@message_title,@message_content, @message_status,@emp_id,@emp_name,@message_type,@message_order_id,@scene_id,@scene_name,@equipment_id,@equipment_name,@equipment_component_id,@component_name) "
                };
                int status = 0;
                MySqlParameter[] commandParameters = new MySqlParameter[]
                {
                    new MySqlParameter("@id", Guid.NewGuid().ToString()),
                    new MySqlParameter("@message_time", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")),
                    new MySqlParameter("@message_title", message_title),
                    new MySqlParameter("@message_content", message_content),
                    new MySqlParameter("@message_status", status),
                    new MySqlParameter("@emp_id", tblEmp.emp_id),
                    new MySqlParameter("@emp_name", tblEmp.emp_name),
                    new MySqlParameter("@message_type", message_type),
                    new MySqlParameter("@message_order_id", message_order_id),
                    new MySqlParameter("@scene_id", scene_id),
                    new MySqlParameter("@scene_name", scene_name),
                    new MySqlParameter("@equipment_id", equipment_id),
                    new MySqlParameter("@equipment_name", equipment_name),
                    new MySqlParameter("@equipment_component_id", equipment_component_id),
                    new MySqlParameter("@component_name", component_name)
                };
                try
                {
                    var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText,
                        commandParameters);
                }
                catch (Exception e)
                {
                    DLog.w("系统异常:" + e.Message);
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            DLog.w("发送中心人员消息错误:" + ex.Message);
            return;
        }
    }
}

