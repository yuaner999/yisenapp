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
/// Maintain 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Maintain : System.Web.Services.WebService
{

    public Maintain()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }
    //跟据员工的id 加载保养列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetMaintainListInfo")]
    public void GetMaintainListInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate, string scene_id, string maintain_status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT ep_maintain.*  FROM  sys_employee  INNER JOIN ep_maintain ON (sys_employee.emp_id = ep_maintain.emp_id) " +
                              "WHERE user_login=@userName AND maintain_isdeleted =0 " +
                              "AND date(maintain_create_datetime)>=@startDate " +
                              "AND date(maintain_create_datetime)<=@endDate ";
                              if (scene_id != null && scene_id != "")
            {
                CommandText += "AND ep_maintain.scene_id=@scene_id ";
            }
                              if (maintain_status != null && maintain_status != "")
            {
                CommandText += "AND ep_maintain.maintain_status=@maintain_status ";
            }
                              CommandText +="ORDER BY maintain_create_datetime desc " +
                              "LIMIT @startNum,@num";
            MySqlCommand sqlcom = new MySqlCommand
            {
               CommandText=CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@userName",userName),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@scene_id",scene_id),
                new MySqlParameter("@maintain_status",maintain_status),
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
    [WebMethod(Description = "GetMaintainInfo")]
    public void GetMaintainInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_maintain.*, ep_equipment_component.equipment_component_id, ep_equipment_component.component_name, ep_equipment_component.equipment_component_code, ep_equipment_component_1.component_name AS cnm FROM ep_maintain LEFT JOIN ep_equipment_component ON (ep_maintain.equipment_id = ep_equipment_component.equipment_id) LEFT JOIN ep_equipment_component AS ep_equipment_component_1 ON (ep_maintain.maintain_equipment_component_id = ep_equipment_component_1.equipment_component_id)   left join `ep_equipment_component_point` "+
                               " on (ep_equipment_component_point.equipment_component_id= ep_equipment_component.equipment_component_id)  WHERE maintain_id = @id"
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
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "保养信息不存在"));
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
    //跟据保养详情的id 加载已完成的信息
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
                CommandText = "SELECT * FROM ep_maintain where maintain_id=@id and maintain_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                CommandText = "SELECT `ep_equipment_component`.`component_name`,`ep_equipment_component`.`equipment_component_code` FROM ep_maintain INNER JOIN ep_maintain_relation " +
                              "ON (`ep_maintain`.`maintain_id` = `ep_maintain_relation`.`maintain_id`)INNER JOIN ep_equipment_component  " +
                              "ON (`ep_maintain_relation`.`relation_equipment_component_id` = `ep_equipment_component`.`equipment_component_id`) " +
                              "WHERE ep_maintain.maintain_id=@id"
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                var Info1 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom1.CommandText, commandParameters1).Tables[0].DefaultView;

                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    var json1 = Common.DataTableToJson(Info1.Table);
                    var json2 = json + '&' + json1;
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json2));
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "保养信息不存在"));
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
    /// 提交保养单
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "DealMaintainInfo")]
    public void DealMaintainInfo(string tokenId,  string equi, string solu, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET solution = @solution,maintain_date = NOW(),maintain_status = 2 where maintain_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@solution", solu)
                  
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_maintain_relation (maintain_relation_id,maintain_id,relation_equipment_component_id) VALUES( UUID(), @maintain_id , @relation_equipment_component_id)"
            };
            MySqlCommand sqlcom3 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 6 WHERE equipment_component_id =@equipment_component_id"
            };
            string[] sArray = equi.Split(',');
            for (var i = 0; i < sArray.Length-1; i++)
            {
                MySqlParameter[] commandParameters2 = new MySqlParameter[]
            {
                // 循环插入数据
                  new MySqlParameter("@maintain_id", id),
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
                    tbl_ep_maintain maintain = BF<bll_ep_maintain>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条提交保养单消息", "提交保养单提醒：现场【" + maintain.scene_name + "】的设备【" + maintain.equipment_name + "】的部件【" + maintain.maintain_component_name + "】的保养人员提交了保养单！", "管理员保养提醒", id, maintain.scene_id, maintain.scene_name, maintain.equipment_id, maintain.equipment_name, maintain.maintain_equipment_component_id, maintain.maintain_component_name);

                }
                catch (Exception e)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                    DLog.w("系统异常:" + e.Message);
                    return;
                }
            }
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
    //设置到达的时间 状态改为1 || 推迟到达的时间
    [ValidateInput(false)]
    [WebMethod(Description = "DealExpectTime")]
    public void DealExpectTime(string tokenId, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET expect_maintain_date = @time,maintain_status = 1 where maintain_id =@id"
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
                    tbl_ep_maintain maintain = BF<bll_ep_maintain>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条设置预期完成时间消息", "设置预期完成时间提醒：现场【" + maintain.scene_name + "】的设备【" + maintain.equipment_name + "】的部件【" + maintain.maintain_component_name + "】的保养人员设置了预期完成时间！", "管理员保养提醒", id, maintain.scene_id, maintain.scene_name, maintain.equipment_id, maintain.equipment_name, maintain.maintain_equipment_component_id, maintain.maintain_component_name);
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
    //开始保养 设定预期完成的时间 
    [ValidateInput(false)]
    [WebMethod(Description = "DealStartTime")]
    public void DealStartTime(string tokenId, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            time = Convert.ToDateTime(time).ToString("yyyy-MM-dd 12:00:00");
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET maintain_date = now(),expect_finish_date=@time,  maintain_status = 2 where maintain_id =@id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@time", time),
               
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 5 WHERE equipment_component_id IN (SELECT relation_equipment_component_id FROM ep_maintain_relation WHERE maintain_id =@id)"
            };
            MySqlParameter[] commandParameters2 = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
               
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                if (Info == 1 && Info2 >= 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    tbl_ep_maintain tbl = BF<bll_ep_maintain>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条设置预期完成时间消息", "设置预期完成时间提醒：现场【" + tbl.scene_name + "】的设备【" + tbl.equipment_name + "】的部件【" + tbl.maintain_component_name + "】的保养人员设置了预期完成的时间！", "管理员保养提醒", id, tbl.scene_id, tbl.scene_name, tbl.equipment_id, tbl.equipment_name, tbl.maintain_equipment_component_id, tbl.maintain_component_name);
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
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            time = Convert.ToDateTime(time).ToString("yyyy-MM-dd 12:00:00");
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET expect_finish_date = @time where maintain_id =@id"
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
                    tbl_ep_maintain maintain = BF<bll_ep_maintain>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条延后完成时间消息", "延后完成时间提醒：现场【" + maintain.scene_name + "】的设备【" + maintain.equipment_name + "】的部件【" + maintain.maintain_component_name + "】的保养人员延后了完成时间！", "管理员保养提醒", id, maintain.scene_id, maintain.scene_name, maintain.equipment_id, maintain.equipment_name, maintain.maintain_equipment_component_id, maintain.maintain_component_name);
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

    //设置完成的时间 并将状态改为3
    [ValidateInput(false)]
    [WebMethod(Description = "DealFinishTime")]
    public void DealFinishTime(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET finish_date = now(),maintain_status = 3 where maintain_id =@id"
            };
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "UPDATE ep_equipment_component SET status = 0 WHERE equipment_component_id IN (SELECT relation_equipment_component_id FROM ep_maintain_relation WHERE maintain_id =@id)"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
               
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters);
                if (Info == 1 && Info2 >= 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "处理成功"));
                    tbl_ep_maintain maintain = BF<bll_ep_maintain>.Instance.GetModel(id);
                    sendAllCenterPerson("接收到一条完成保养消息", "完成保养提醒：现场【" + maintain.scene_name + "】的设备【" + maintain.equipment_name + "】的部件【" + maintain.maintain_component_name + "】的保养人员已完成保养！", "管理员保养提醒", id, maintain.scene_id, maintain.scene_name, maintain.equipment_id, maintain.equipment_name, maintain.maintain_equipment_component_id, maintain.maintain_component_name);
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
            string num = json.getString("num");
            string id = Guid.NewGuid().ToString();
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("emp_id ='" + emp_id + "'");
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "INSERT INTO ep_maintain (maintain_id, scene_id, scene_name, equipment_id,equipment_name,emp_id,emp_name,maintain_person_number,maintain_equipment_component_id,maintain_component_name, maintain_status,maintain_isdeleted,maintain_create_man,maintain_create_datetime) " +
                              " VALUES( @id, @sceneId,@sceneName,@equipment_id, @equipment_name,@emp_id,@emp_name,@num,@equipment_component_id, " +
                              "@component_name , 4, 0, @user_login,NOW()) "
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
                  new MySqlParameter("@num", num),
                  new MySqlParameter("@id", id)

            };

            try
            {
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, id));
                    sendAllCenterPerson("接收到一条保养申请", "保养申请提醒：现场<" + scene_name + ">的设备<" + equipment_name + ">的部件<" + component_name + ">发起一条保养申请，请尽快审批", "管理员保养提醒", id, scene_id, scene_name, equipment_id, equipment_name, equipment_component_id, component_name);
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
    [WebMethod(Description = "SaveNewMaintainInfo")]
    public void SaveNewMaintainInfo(string tokenId, string jsonData)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
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
            string time = json.getString("time");
            string solution = json.getString("solution");
            string[] relation_id = json.getString("relation_comId").Split(',');
            int num = int.Parse(json.getString("num"));
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
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("emp_id ='" + emp_id + "'");

            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "INSERT INTO  ep_maintain (maintain_id, scene_id, scene_name, equipment_id, equipment_name,emp_id,emp_name,maintain_person_number,maintain_equipment_component_id, maintain_component_name, "+
                              "solution,expect_maintain_date,maintain_status,maintain_isdeleted,maintain_create_man,maintain_create_datetime,from_path) VALUES " +
                              "( @id, @sceneId,@sceneName,@equipment_id, @equipment_name,@emp_id,@emp_name,@num,@equipment_component_id,@component_name,@solution,@time,4,0,@user_login,NOW(),'app发起' )"
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
                  new MySqlParameter("@id", id),
                  new MySqlParameter("@time", time),
                  new MySqlParameter("@num", num),
                  new MySqlParameter("@solution", solution)

            };
            try
            {

                int result = 0;
                for (int i = 0; i < relation_id.Length; i++)
                {
                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "INSERT INTO ep_maintain_relation VALUES (UUID(), @id, @relationId )  "
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                {
                      new MySqlParameter("@id", id),
                      new MySqlParameter("@relationId", relation_id[i])
                };
                    var index = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (index == 1)
                    {
                        result++;
                    }
                }
                var re = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (re == 1 && result == relation_id.Length) //信息存在
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "保存成功"));
                    sendAllCenterPerson("接收到一条保养申请", "保养申请提醒：现场<" + scene_name + ">的设备<" + equipment_name + ">的部件<" + component_name + ">发起一条保养申请，请尽快审批", "管理员保养提醒", id, scene_id, scene_name, equipment_id, equipment_name, equipment_component_id, component_name);
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
    /// <param name="id"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "SaveModifyMaintainInfo")]
    public void SaveModifyMaintainInfo(string tokenId, string jsonData, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //将传过来的json 字符串转换为json格式
            JSONObject json = new JSONObject(jsonData);
            string solution = json.getString("solution");
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_maintain SET solution = @solution WHERE maintain_id = @id"
            };

            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id),
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
