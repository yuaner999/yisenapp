using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using com.force.json;
using Dugufeixue.BLL;
using Dugufeixue.Common;
using Dugufeixue.Model;
using MySql.Data.MySqlClient;

/// <summary>
/// Repair 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Repair : System.Web.Services.WebService
{

   public Repair()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }
    //跟据员工的id 加载巡检列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetRepairListInfo")]
   public void GetRepairListInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate, string scene_id, string report_status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + userName + "'");

            string CommandText = "SELECT *  " +
                              "FROM  ep_report_repair   " +
                              "WHERE scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) " +
                              "AND (emp_id='' or isnull(emp_id) or emp_id=@emp_id)" +
                              "AND report_isdeleted =0 " +
                              "AND date(report_create_datetime)>=@startDate " +
                              "AND date(report_create_datetime)<=@endDate ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += "AND ep_report_repair.scene_id=@scene_id ";
            }
            if (report_status != null && report_status != "")
            {
                CommandText += "AND ep_report_repair.report_status=@report_status ";
            }
            CommandText += " order by report_create_datetime desc " +
                              "LIMIT @startNum,@num";
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText =CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@emp_id",tbluser.emp_id),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@scene_id",scene_id),
                new MySqlParameter("@report_status",report_status)
            };
            try
            {
                var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (titleInfo != null && titleInfo.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(titleInfo.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "信息不存在"));
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
    /// 根据ID加载报修信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id">报修ID</param>
    [ValidateInput(false)]
    [WebMethod(Description = "LoadRepairInfoById")]
    public void LoadRepairInfoById(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_report_repair WHERE report_repair_id=@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报修信息不存在"));
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
    /// 处理报警信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id">现场ID</param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetRepairInfo")]
    public void GetRepairInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_report_repair.*, ep_equipment_component.equipment_component_id,ep_equipment_component.component_name,ep_equipment_component.equipment_component_code FROM ep_report_repair LEFT JOIN ep_equipment_component ON (ep_report_repair.equipment_id = ep_equipment_component.equipment_id) WHERE report_repair_id = @id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报修信息不存在"));
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
    /// 跟据维修的设备加载相关的部件
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id">现场ID</param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetNewRepairCom")]
    public void GetNewRepairCom(string tokenId, string equId, string comId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT  *  FROM ep_equipment_component  "+
                             "INNER JOIN ep_equipment ON (ep_equipment.equipment_id = ep_equipment_component.equipment_id) "+
                             "WHERE ep_equipment.equipment_id=@equId AND ep_equipment_component.equipment_component_id != @comId " +
                             "AND  (SELECT COUNT(*) FROM ep_equipment_component_point  "+
                             "WHERE ep_equipment_component.equipment_component_id = ep_equipment_component_point.equipment_component_id and ep_equipment_component_point.point_isdeleted=0 and ep_equipment_component_point.is_control!=1)!=0 "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@equId", equId),
                  new MySqlParameter("@comId", comId)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有其他的部件"));
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

    //跟据报修详情的id 加载已完成的信息
    [ValidateInput(false)]
    [WebMethod(Description = "getCompleteInfo")]
    public void getCompleteInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT  * FROM ep_report_repair where report_repair_id=@id and report_isdeleted =0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                CommandText = "SELECT `ep_equipment_component`.component_name,`ep_equipment_component`.`equipment_component_code`  FROM  ep_report_repair " +
                            "left JOIN ep_report_repair_relation  ON (`ep_report_repair`.`report_repair_id` = `ep_report_repair_relation`.`report_repair_id`) " +
                             "left JOIN ep_equipment_component   ON (`ep_report_repair_relation`.`relation_equipment_component_id` = `ep_equipment_component`.`equipment_component_id`) " +
                              "WHERE ep_report_repair.report_repair_id=@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                var Info1 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText, commandParameters1).Tables[0].DefaultView;

                if (Info != null && Info.Table.Rows.Count >= 1 && Info1 != null && Info1.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    var json1 = Common.DataTableToJson(Info1.Table);
                    var json2 = json + '&' + json1;
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json2));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报修信息不存在"));
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
    /// 提交报修单
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "DealRepairInfo")]
    public void DealRepairInfo(string tokenId, string reason, string equi, string solu, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {

            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET reason = @reason,solution = @solution,repair_date = NOW(),report_status = 2 where report_repair_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@reason", reason),
                  new MySqlParameter("@solution", solu),
                
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_report_repair_relation (report_repair_relation_id,report_repair_id,relation_equipment_component_id) VALUES( UUID(), @report_repair_id , @relation_equipment_component_id)"
            };
            MySqlCommand sqlcom3 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 4 WHERE equipment_component_id =@equipment_component_id"
            };
            string[] sArray = equi.Split(',');
            for (var i = 0; i < sArray.Length; i++)
            {
                if (sArray[i] != "")
                {
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {
                        // 循环插入数据
                          new MySqlParameter("@report_repair_id", id),
                          new MySqlParameter("@relation_equipment_component_id", sArray[i])
                    };
                    MySqlParameter[] commandParameters3 = new MySqlParameter[]
                    {
                        // 循环插入数据
                          new MySqlParameter("@equipment_component_id", sArray[i])
                    };
                    try
                    {
                        var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                        var Info3 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom3.CommandText, commandParameters3);
                        if (Info2 != 1 || Info3 != 1)
                        {
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
            }

            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);


                if (Info == 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "报修成功"));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报修失败"));
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

    //设置预期到达的时间 状态改为1 || 推迟到达的时间
    [ValidateInput(false)]
    [WebMethod(Description = "DealExpectTime")]
    public void DealExpectTime(string tokenId, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET expect_repair_date = @time,report_status = 1 where report_repair_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@time", time),
               
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (Info == 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "{处理成功}"));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "处理失败"));
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

    //开始维修 设定预期完成的时间 
    [ValidateInput(false)]
    [WebMethod(Description = "DealStartTime")]
    public void DealStartTime(string tokenId, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            time = Convert.ToDateTime(time).ToString("yyyy-MM-dd 12:00:00");
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET expect_finish_date=@time,repair_date=now(),report_status=2 where report_repair_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@time", time)
               
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 3 WHERE equipment_component_id IN (SELECT relation_equipment_component_id FROM ep_report_repair_relation WHERE report_repair_id =@id)"
            };
            MySqlParameter[] commandParameters2 = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
               
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                
                if (Info == 1 && Info2 >=1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    tbl_ep_report_repair tbl = BF<bll_ep_report_repair>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条设置预期完成时间消息", "设置预期完成时间提醒：现场【" + tbl.scene_name + "】的设备【" + tbl.equipment_name + "】的部件【" + tbl.report_component_name + "】的维修人员设置了预期完成时间！", "管理员报修提醒", id, tbl.scene_id, tbl.scene_name, tbl.equipment_id, tbl.equipment_name, tbl.report_equipment_component_id, tbl.report_component_name);
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "处理失败"));
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
    // 推迟完成的时间 
    [ValidateInput(false)]
    [WebMethod(Description = "DealExpectFinishTime")]
    public void DealExpectFinishTime(string tokenId, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            time = Convert.ToDateTime(time).ToString("yyyy-MM-dd 12:00:00");
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET expect_finish_date = @time where report_repair_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@time", time),
               
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (Info == 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "处理失败"));
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

    //完成的时间 状态改为完成
    [ValidateInput(false)]
    [WebMethod(Description = "DealFinishTime")]
    public void DealFinishTime(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET finish_date = now(),report_status = 3 where report_repair_id =@id"
            };         
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 0 WHERE equipment_component_id IN (SELECT relation_equipment_component_id FROM ep_report_repair_relation WHERE report_repair_id =@id)"
            };
            MySqlCommand sqlcom3 = new MySqlCommand
            {
                CommandText = "UPDATE ep_warning_log SET warning_status = '已处理' where warning_log_id in(select warning_log_id from ep_report_repair where report_repair_id =@id)"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters);
                var Info3 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom3.CommandText, commandParameters);
                if (Info == 1 && Info2 >=1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    tbl_ep_report_repair tbl = BF<bll_ep_report_repair>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条维修完成消息", "维修完成提醒：现场<" + tbl.scene_name + ">的设备<" + tbl.equipment_name + ">的部件<" + tbl.report_component_name + ">的维修人员已完成维修！", "管理员报修提醒", id, tbl.scene_id, tbl.scene_name, tbl.equipment_id, tbl.equipment_name, tbl.report_equipment_component_id, tbl.report_component_name);
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "处理失败"));
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

    ///跟据登录名 获得员工的名称
    [ValidateInput(false)]
    [WebMethod(Description = "getUserName")]
    public void getUserName(string tokenId, string name)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT  emp_id,emp_name FROM  sys_employee WHERE   user_login =@name  AND emp_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@name", name)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户不存在"));
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

    ///加载现场的名字(所拥有的)
    [ValidateInput(false)]
    [WebMethod(Description = "GetSceneName")]
    public void GetSceneName(string tokenId,string name)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select `scene_id`,`scene_name`,`scene_city_id`,`scene_province_name`,`scene_city_name`,`equipment_number`,`scene_type`,`scene_address`,`position_x`,`position_y`,`scene_isdeleted`,`scene_memo`,`scene_create_man`,`scene_create_datetime`,`scene_update_man`,`scene_update_datetime`,`scene_shielded` from ep_scene where scene_isdeleted='0' and scene_id in (select scene_id from ep_scene_employee where user_login=@name)"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@name", name)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "现场信息不存在"));
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
    ///跟据现场的id加载设备名
    [ValidateInput(false)]
    [WebMethod(Description = "GetEquipmentName")]
    public void GetEquipmentName(string tokenId,string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT equipment_name,equipment_id FROM ep_equipment WHERE scene_id=@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "所对应的设备信息不存在"));
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

    ///跟据设备的的id加载部件名
    [ValidateInput(false)]
    [WebMethod(Description = "GetComponentName")]
    public void GetComponentName(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //报警信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT  equipment_component_id,equipment_component_id,component_name FROM ep_equipment_component WHERE equipment_id =@id"

            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "所对应的部件信息不存在"));
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
    /// 保存提交的信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="jsonData"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "SaveSelectedInfo")]
    public void SaveSelectedInfo(string tokenId, string jsonData)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //将传过来的json 字符串转换为json格式
            JSONObject json = new JSONObject(jsonData);
            string scene_id = json.getString("scene_id");
            string scene_name = json.getString("scene_name");
            string equipment_id = json.getString("equipment_id");
            string equipment_name = json.getString("equipment_name");
            string equipment_component_id = json.getString("equipment_component_id");
            string component_name = json.getString("component_name");
            string emp_name = json.getString("emp_name");
            string emp_id = json.getString("emp_id");
            string id = Guid.NewGuid().ToString();
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("emp_id ='" + emp_id + "'");

            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_report_repair ( report_repair_id,scene_id,scene_name,equipment_id,equipment_name, report_time,report_equipment_component_id, report_component_name,emp_id,emp_name,report_status,report_isdeleted,report_create_man,report_create_datetime) "+
                              " VALUES( @id, @sceneId,@sceneName,@equipment_id, @equipment_name,NOW(), @equipment_component_id, " +
                              "@component_name ,@emp_id, @emp_name, 4, 0, @user_login,NOW()) "
            };
           
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@sceneId", scene_id),
                  new MySqlParameter("@sceneName", scene_name),
                  new MySqlParameter("@equipment_id", equipment_id),
                  new MySqlParameter("@equipment_name", equipment_name),
                  new MySqlParameter("@equipment_component_id", equipment_component_id),
                  new MySqlParameter("@component_name", component_name),
                  new MySqlParameter("@emp_id", emp_id),
                  new MySqlParameter("@emp_name", emp_name),
                  new MySqlParameter("@user_login", tbluser.user_login),
                  new MySqlParameter("@id", id)

            };
            
            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1 ) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, id));
                    tbl_ep_report_repair tbl = BF<bll_ep_report_repair>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条提交报修单消息", "提交报修单提醒：现场【" + tbl.scene_name + "】的设备【" + tbl.equipment_name + "】的部件【" + tbl.report_component_name + "】的维修人员提交了一份报修单！", "管理员报修提醒", id, tbl.scene_id, tbl.scene_name, tbl.equipment_id, tbl.equipment_name, tbl.report_equipment_component_id, tbl.report_component_name);
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


    /// <summary>
    /// 保存新的提交的信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="jsonData"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "SaveNewRepairInfo")]
    public void SaveNewRepairInfo(string tokenId, string jsonData)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //将传过来的json 字符串转换为json格式
            JSONObject json = new JSONObject(jsonData);
            string scene_id = json.getString("scene_id");
            string scene_name = json.getString("scene_name");
            string equipment_id = json.getString("equipment_id");
            string equipment_name = json.getString("equipment_name");
            string equipment_component_id = json.getString("equipment_component_id");
            string component_name = json.getString("component_name");
            string emp_name = json.getString("emp_name");
            string emp_id = json.getString("emp_id");
            string time = json.getString("time");
            string reason = json.getString("reason");
            string solution = json.getString("solution");
            string[] relation_id = json.getString("relation_comId").Split(',');
            int isWarning = json.getInt("is_warning");
            if (scene_name == "请选择现场")
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请先选择现场"));
                return;
            }
            if (equipment_name == "请选择设备")
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请先选择设备"));
                return;
            }
            if (component_name == "请选择部件")
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请先选择部件"));
                return;
            }

            try
            {
                tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("emp_id ='" + emp_id + "'");
                List<SqlAndArgs> sqlAndArgses = new List<SqlAndArgs>();
                tbl_ep_report_repair tblRepair = new tbl_ep_report_repair();

                if (isWarning == 1)
                {
                    string warningLogId = json.getString("warning_log_id");
                    tbl_ep_warning_log tbl_warning = BF<bll_ep_warning_log>.Instance.GetModel(warningLogId);
                    tbl_warning.warning_status = "处理中";
                    tbl_warning.repair_man = emp_name;
                    tbl_warning.repair_datetime = Dugufeixue.Common.DateTimeServer.GetServerDateTime();
                    tbl_warning.handle_man = ClsCurrentUserInfo.EmpName;
                    tbl_warning.handle_datetime = DateTimeServer.GetServerDateTime();
                    sqlAndArgses.Add(BF<bll_ep_warning_log>.Instance.PrepareUpdateArgs(tbl_warning));
                    sqlAndArgses.Add(new SqlAndArgs("update ep_equipment_component set status=2 where equipment_component_id='" + tbl_warning.equipment_component_id + "'", null));

                    tblRepair.report_repair_id = Guid.NewGuid().ToString();
                    tblRepair.warning_log_id = tbl_warning.warning_log_id;
                    tblRepair.scene_id = tbl_warning.scene_id;
                    tblRepair.scene_name = tbl_warning.scene_name;
                    tblRepair.equipment_id = tbl_warning.equipment_id;
                    tblRepair.equipment_name = tbl_warning.equipment_name;
                    tblRepair.report_time = DateTimeServer.GetServerDateTime().ToString("yyyy-MM-dd HH:mm:ss");
                    tblRepair.report_equipment_component_id = tbl_warning.equipment_component_id;
                    tblRepair.report_component_name = tbl_warning.component_name;
                    tblRepair.emp_id = emp_id;
                    tblRepair.emp_name = emp_name;
                    tblRepair.from_path = "报警";
                    tblRepair.reason = reason;
                    tblRepair.solution = solution;
                    tblRepair.expect_repair_date = time;
                    tblRepair.report_status = 1;
                    tblRepair.report_isdeleted = false;
                    tblRepair.report_create_man = tbluser.user_login;
                    tblRepair.report_create_datetime = DateTimeServer.GetServerDateTime();

                    //不能在事务中备份和还原数据库
                    sqlAndArgses.Add(BF<bll_ep_report_repair>.Instance.PrepareAddArgs(tblRepair));
                }
                else
                {
                    sqlAndArgses.Add(new SqlAndArgs("update ep_equipment_component set status=2 where equipment_component_id='" + equipment_component_id + "'", null));

                    tblRepair.report_repair_id = Guid.NewGuid().ToString();
                    tblRepair.scene_id = scene_id;
                    tblRepair.scene_name = scene_name;
                    tblRepair.equipment_id = equipment_id;
                    tblRepair.equipment_name = equipment_name;
                    tblRepair.report_time = DateTimeServer.GetServerDateTime().ToString("yyyy-MM-dd HH:mm:ss");
                    tblRepair.report_equipment_component_id = equipment_component_id;
                    tblRepair.report_component_name = component_name;
                    tblRepair.emp_id = emp_id;
                    tblRepair.emp_name = emp_name;
                    tblRepair.from_path = "app发起";
                    tblRepair.reason = reason;
                    tblRepair.solution = solution;
                    tblRepair.expect_repair_date = time;
                    tblRepair.report_status = 4;
                    tblRepair.report_isdeleted = false;
                    tblRepair.report_create_man = tbluser.user_login;
                    tblRepair.report_create_datetime = DateTimeServer.GetServerDateTime();

                    //不能在事务中备份和还原数据库
                    sqlAndArgses.Add(BF<bll_ep_report_repair>.Instance.PrepareAddArgs(tblRepair));
                }

                for (int i = 0; i < relation_id.Length; i++)
                {
                    tbl_ep_equipment_component tbl_component =
                            BF<bll_ep_equipment_component>.Instance.GetModel(relation_id[i]);
                    tbl_component.status = 4;
                    sqlAndArgses.Add(BF<bll_ep_equipment_component>.Instance.PrepareUpdateArgs(tbl_component));

                    //添加关联维修设备部件信息
                    tbl_ep_report_repair_relation tblRepairRelation = new tbl_ep_report_repair_relation();
                    tblRepairRelation.report_repair_relation_id = Guid.NewGuid().ToString();
                    tblRepairRelation.report_repair_id = tblRepair.report_repair_id;
                    tblRepairRelation.relation_equipment_component_id = relation_id[i];
                    sqlAndArgses.Add(BF<bll_ep_report_repair_relation>.Instance.PrepareAddArgs(tblRepairRelation));
                }

                
                bool result = SqlHelper.ExecuteMulSql(sqlAndArgses);
                if (result) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "保存成功"));
                    if (isWarning == 1)
                    {
                        sendAllCenterPerson("接收到一条提交报修单消息", "提交报修单提醒：现场【" + tblRepair.scene_name + "】的设备【" + tblRepair.equipment_name + "】的部件【" + tblRepair.report_component_name + "】的维修人员提交了一份报修单！", "管理员报修提醒", tblRepair.report_repair_id, tblRepair.scene_id, tblRepair.scene_name, tblRepair.equipment_id, tblRepair.equipment_name, tblRepair.report_equipment_component_id, tblRepair.report_component_name);
                    }
                    else
                    {
                        sendAllCenterPerson("接收到一条报修申请", "报修申请提醒：现场【" + tblRepair.scene_name + "】的设备【" + tblRepair.equipment_name + "】的部件【" + tblRepair.report_component_name + "】发起一条报修申请，请尽快审批", "管理员报修提醒", tblRepair.report_repair_id, tblRepair.scene_id, tblRepair.scene_name, tblRepair.equipment_id, tblRepair.equipment_name, tblRepair.report_equipment_component_id, tblRepair.report_component_name);
                    }
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
    /// <summary>
    /// 保存修改的提交的信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="jsonData"></param>
    /// <param name="repairid"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "SaveModifyRepairInfo")]
    public void SaveModifyRepairInfo(string tokenId, string jsonData, string repairid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //将传过来的json 字符串转换为json格式
            JSONObject json = new JSONObject(jsonData);
            string reason = json.getString("reason");
            string solution = json.getString("solution");
            MySqlCommand sqlcom = null;
            sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_report_repair SET reason = @reason,solution = @solution WHERE report_repair_id = @repairId"
            };
            
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@repairId", repairid),
                  new MySqlParameter("@reason", reason),
                  new MySqlParameter("@solution", solution)
            };
            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "保存成功"));
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
    public void sendAllCenterPerson(string message_title, string message_content, string message_type, string message_order_id
        , string scene_id, string scene_name, string equipment_id, string equipment_name, string equipment_component_id, string component_name)
    {
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        try
        {
            List<tbl_sys_employee> lstEmp = BF<bll_sys_employee>.Instance.GetModelList("role_id='1aef5347-9d51-4f07-94e6-affbfb3cea4a' and emp_isdeleted=0", "");
            foreach (tbl_sys_employee tblEmp in lstEmp)
            {
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "INSERT INTO ep_message (message_id, message_time, message_title, message_content,message_status,emp_id,emp_name,message_type,message_order_id,scene_id,scene_name,equipment_id,equipment_name,equipment_component_id,component_name) " +
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
                    var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
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
