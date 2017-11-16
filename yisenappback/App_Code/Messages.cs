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
/// Messages 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Messages : System.Web.Services.WebService {

    public Messages () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetMessageListInfo")]
    public void GetMessageListInfo(string tokenId, string userName, int num, int startNum, string startDate, string endDate, string message_scene, string message_type)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT ep_message.*  FROM  sys_employee  INNER JOIN ep_message ON (sys_employee.emp_id = ep_message.emp_id) " +
                              "WHERE user_login=@userName  " +
                              "AND date(message_time)>=@startDate " +
                              "AND date(message_time)<=@endDate ";
            if(message_scene!=null&&message_scene!="")
            {
                CommandText+= "AND ep_message.scene_id=@message_scene ";
            }
            if (message_type != null && message_type != "")
            {
                CommandText += "AND ep_message.message_type=@message_type ";
            }
            CommandText += "ORDER BY message_status , message_time desc " +
            "LIMIT @startNum,@num";

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
                new MySqlParameter("@message_scene",message_scene),
                new MySqlParameter("@message_type",message_type)
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
    [WebMethod(Description = "GetReceiverMessageListInfo")]
    public void GetReceiverMessageListInfo(string tokenId, string userName, string receiverId, int num, int startNum, string startDate, string endDate, string message_scene, string message_type)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT ep_message.*  FROM  ep_message  left JOIN  sys_employee A ON (A.emp_id = ep_message.emp_id)  left JOIN  sys_employee B ON (B.emp_id = ep_message.send_emp_id) " +
                              "WHERE (A.user_login=@userName and ep_message.send_emp_id=@receiverId) or (B.user_login=@userName and ep_message.emp_id=@receiverId) " +
                              "AND date(message_time)>=@startDate " +
                              "AND date(message_time)<=@endDate ";
            if (message_scene != null && message_scene != "")
            {
                CommandText += "AND ep_message.scene_id=@message_scene ";
            }
            if (message_type != null && message_type != "")
            {
                CommandText += "AND ep_message.message_type=@message_type ";
            }
            CommandText += "ORDER BY message_status , message_time desc " +
            "LIMIT @startNum,@num";

            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@userName",userName),
                new MySqlParameter("@receiverId",receiverId),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@message_scene",message_scene),
                new MySqlParameter("@message_type",message_type)
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
    [WebMethod(Description = "DeleteMessage")]
    public void DeleteMessage(string tokenId, string Messageid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "delete from ep_message where message_id =@Messageid"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@Messageid",Messageid),

            };
            var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
            if (Info == 1)//查询成功
            {
               
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "删除成功"));
                return;

            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "删除失败"));
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
    [WebMethod(Description = "GetAllUnreadMessage")]
    public void GetAllUnreadMessage(string tokenId, string userName, string startDate, string endDate)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_message.*  FROM  sys_employee  INNER JOIN ep_message ON (sys_employee.emp_id = ep_message.emp_id) " +
                              "WHERE user_login=@userName  " +
                              "AND date(message_time)>=@startDate " +
                              "AND date(message_time)<=@endDate " +
                              "AND message_status=0 " +
                              "ORDER BY message_time desc "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@userName",userName),           
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59"))
            };            
            var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0];
            if (!(titleInfo.Rows.Count > 0))
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
                return;
            }
            //bool result = true;
            //foreach (DataRow item in titleInfo.Rows) //查询成功
            //{
            //    string mid = item["message_id"].ToString();
            //    MySqlCommand sqlcommess = new MySqlCommand
            //    {
            //        CommandText = "Update ep_message set message_status=1 where message_id=@message_id"
            //    };
            //    MySqlParameter[] commandParametersmess = new MySqlParameter[]{
            //    new MySqlParameter("@message_id",mid),                        
            //     };
            //    var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcommess.CommandText, commandParametersmess);
            //    if (Info != 1)
            //    {
            //        result = false;
            //    }
                
            //}
            //if (result == true)
            //{
            //    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "全部已读"));
            //    return;
            //}
            //else
            //{
            //    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "全部设为已读失败"));
            //    return;
            //}
            List<SqlAndArgs> sqlAndArgses = new List<SqlAndArgs>();
            foreach (DataRow item in titleInfo.Rows)//查询成功
            {
                string mid = item["message_id"].ToString();

                SqlAndArgs sqlAndArgs2 = new SqlAndArgs("Update ep_message set message_status=1 where message_id='" + mid + "'", null);
                sqlAndArgses.Add(sqlAndArgs2);

            }
            bool result = SqlHelper.ExecuteMulSql(sqlAndArgses);
            if (result == true)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "全部设为已读"));
                return;
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "全部设为已读失败"));
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
    [WebMethod(Description = "GetMessages")]
    public void GetMessages(string tokenId,string empid) {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_message WHERE emp_id = @empid"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@empid", empid)
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

    [ValidateInput(false)]
    [WebMethod(Description = "DealMsgStatus")]
    public void DealMsgStatus(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "UPDATE ep_message SET message_status = '1' WHERE message_id = @id "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            try
            {
                var Info = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
                if (Info == 1) //信息存在
                {
                    // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "已读"));
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

    [ValidateInput(false)]
    [WebMethod(Description = "GetMessagesDetail")]
    public void GetMessagesDetail(string tokenId, string mid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_message WHERE message_id = @message_id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@message_id", mid)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    tbl_ep_message tbl = BF<bll_ep_message>.Instance.GetModel(mid);
                    tbl.message_status = 1;
                    BF<bll_ep_message>.Instance.Update(tbl);
                    return;
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "员工信息不存在"));
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
    [WebMethod(Description = "SendMessage")]
    public void SendMessage(string tokenId, string sendno, string empno, string messagecontent, string emp_name)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //查询接班人
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", sendno)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {                   
                    tbl_ep_message tbl = new tbl_ep_message();
                    tbl.message_id = Guid.NewGuid().ToString();
                    tbl.message_content = messagecontent;
                    tbl.emp_id = empno;
                    tbl.emp_name = emp_name;
                    tbl.message_status = 0;
                    tbl.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                    tbl.message_title = "聊天信息";
                    tbl.message_type = "聊天记录";
                    tbl.send_emp_id = Info.Table.Rows[0]["emp_id"].ToString();
                    tbl.send_emp_name = Info.Table.Rows[0]["emp_name"].ToString();
                    MySqlCommand sqlmess = new MySqlCommand
                    {
                        CommandText = "INSERT INTO ep_message (message_id ,message_content,emp_id,emp_name,message_status,message_time,message_title,send_emp_id,send_emp_name) VALUES (@message_id ,@message_content,@emp_id,@emp_name,@message_status,@message_time,@message_title,@send_emp_id,@send_emp_name)"
                    };
                    MySqlParameter[] commandParametersmess = new MySqlParameter[]
                    {
                          new MySqlParameter("@message_id", tbl.message_id),
                          new MySqlParameter("@message_content", tbl.message_content),
                          new MySqlParameter("@emp_id", tbl.emp_id),
                          new MySqlParameter("@emp_name", emp_name),
                          new MySqlParameter("@message_status", tbl.message_status),
                          new MySqlParameter("@message_time", tbl.message_time),
                          new MySqlParameter("@message_title", tbl.message_title),
                          new MySqlParameter("@send_emp_id", tbl.send_emp_id),
                          new MySqlParameter("@send_emp_name", tbl.send_emp_name),
                    };
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlmess.CommandText, commandParametersmess);
                    if (Info2 == 1) //信息存在
                    {
                        // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发送成功"));
                        return;
                    }
                  
                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "接收人的工号不存在"));
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
    [WebMethod(Description = "getUsersInfo")]
    public void getUsersInfo(string tokenId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            
            string str = "user_login,concat(emp_name,'(',user_login,')') combine from sys_employee";
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select emp_id,emp_name, " + str
            };
            //MySqlParameter[] commandParameters = new MySqlParameter[]{
            //     new MySqlParameter("@id", id),
            //};
            var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText).Tables[0].DefaultView;
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
    [WebMethod(Description = "getUserInfo")]
    public void getUserInfo(string tokenId,string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
   
            string str = "user_login,concat(emp_name,'(',user_login,')') combine from sys_employee WHERE emp_id=@id";
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT emp_id,emp_name,"+str
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                 new MySqlParameter("@id", id),
                 
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
    [WebMethod(Description = "checkMessage")]
    public void checkMessage(string tokenId, string uesrName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {

            string str = "user_login,concat(emp_name,'(',user_login,')') combine from sys_employee WHERE emp_id=@id";
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT ep_message.*  FROM  sys_employee  INNER JOIN ep_message ON (sys_employee.emp_id = ep_message.emp_id)"+ 

                               "WHERE message_status=0 AND user_login =@name"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                 new MySqlParameter("@name", uesrName)
                 
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
    [WebMethod(Description = "getReportNum")]
    public void getReportNum(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {

        
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT COUNT(warning_status) num FROM ep_warning_log LEFT JOIN ep_equipment_component ON(ep_warning_log.equipment_component_id = ep_equipment_component.equipment_component_id) " +
                              " WHERE STATUS =1 AND ep_equipment_component.scene_id IN (SELECT scene_id FROM ep_scene_employee WHERE user_login=@loginName) and ep_warning_log.warning_status='报警中' "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                 new MySqlParameter("@loginName", loginName)
                 
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
    [WebMethod(Description = "getStatusNum")]
    public void getStatusNum(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + loginName + "'");
            //巡检
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " SELECT  COUNT(*) checkNum FROM  ep_check " +
                              " where  check_isdeleted=0 AND check_status=0 and scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) "+
                              " and (check_emp_id='' or isnull(check_emp_id) or check_emp_id=@emp_id)"
            };
            //交班
            MySqlCommand sqlcom2 = new MySqlCommand
            {
                CommandText = "SELECT COUNT(*) handoverNum FROM ep_handover  " +
                             " WHERE handover_isdeleted=0 AND handover_status = 4 AND  handover_man_before_login=@loginName"
            };
            //接班
            MySqlCommand sqlcom3 = new MySqlCommand
            {
                CommandText = "SELECT COUNT(*) handoverNum2 FROM ep_handover  " +
                             " WHERE handover_isdeleted=0 AND handover_status = 0 AND  handover_man_after_login=@loginName"
            };
            //报修
            MySqlCommand sqlcom4 = new MySqlCommand
            {
                CommandText = "SELECT COUNT(*) repairNum FROM ep_report_repair  "+
                              " WHERE report_isdeleted=0 AND report_status !=3 AND report_status!=6 and scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) "
                              + " AND (emp_id='' or isnull(emp_id) or emp_id=@emp_id) "
            };
            //保养
            MySqlCommand sqlcom5 = new MySqlCommand
            {
                CommandText = " SELECT COUNT(*) maintainNum FROM  `ep_maintain` INNER JOIN sys_employee  ON (sys_employee.emp_id = ep_maintain.`emp_id`) "+
                              " WHERE maintain_isdeleted=0 AND maintain_status!=3 AND maintain_status!=6 and sys_employee.user_login=@loginName"
            };
            //任务
            MySqlCommand sqlcom6 = new MySqlCommand
            {
                CommandText = " SELECT COUNT(*) taskNum FROM  `ep_task` " +
                              " WHERE task_status!=3 AND task_status!=4 AND scene_id IN (SELECT scene_id FROM ep_scene_employee WHERE user_login=@loginName)"
            };
            //校验
            MySqlCommand sqlcom7 = new MySqlCommand
            {
                CommandText = " SELECT  COUNT(*) verificationNum FROM  ep_verification " +
                              " where verification_status=0 and scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) " +
                              " and (verification_emp_id='' or isnull(verification_emp_id) or verification_emp_id=@emp_id) and verification_isdeleted =0 "
            };
            //报警
            MySqlCommand sqlcom8 = new MySqlCommand
            {
                CommandText = "SELECT COUNT(warning_status) warningNum FROM ep_warning_log LEFT JOIN ep_equipment_component ON(ep_warning_log.equipment_component_id = ep_equipment_component.equipment_component_id) " +
                              " WHERE STATUS =1 AND ep_equipment_component.scene_id IN (SELECT scene_id FROM ep_scene_employee WHERE user_login=@loginName) and ep_warning_log.warning_status='报警中' "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                 new MySqlParameter("@loginName", loginName),
                 new MySqlParameter("@emp_id", tbluser.emp_id)
            };
            var checkInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            var handoverInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters).Tables[0].DefaultView;
            var handoverInfo2 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom3.CommandText, commandParameters).Tables[0].DefaultView;
            var maintainInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom4.CommandText, commandParameters).Tables[0].DefaultView;
            var repairInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom5.CommandText, commandParameters).Tables[0].DefaultView;
            var taskInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom6.CommandText, commandParameters).Tables[0].DefaultView;
            var verificationInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom7.CommandText, commandParameters).Tables[0].DefaultView;
            var warningInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom8.CommandText, commandParameters).Tables[0].DefaultView;

            if (checkInfo != null || handoverInfo != null || handoverInfo2 != null || maintainInfo != null || repairInfo != null || taskInfo != null || verificationInfo != null || warningInfo != null)//查询成功
            {
                var check = Common.DataTableToJson(checkInfo.Table); //信息的Json形式
                var handover = Common.DataTableToJson(handoverInfo.Table);
                var handover2 = Common.DataTableToJson(handoverInfo2.Table);
                var maintain = Common.DataTableToJson(maintainInfo.Table);
                var repair = Common.DataTableToJson(repairInfo.Table);
                var task = Common.DataTableToJson(taskInfo.Table);
                var verification = Common.DataTableToJson(verificationInfo.Table);
                var warning = Common.DataTableToJson(warningInfo.Table);
                var result = "&" + check + "&" + handover + "&" + handover2 + "&" + maintain + "&" + repair + "&" + task + "&" + verification + "&" + warning + "&";
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, result));
                return;

            }
            else//没有信息
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "查询失败"));
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
                CommandText = "SELECT  repair_date,report_time,scene_name,emp_name,reason,equipment_name,solution FROM ep_report_repair where report_repair_id=@id and report_isdeleted =0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@id", id)
            };
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                CommandText = "SELECT `ep_equipment_component`.component_name,`ep_equipment_component`.`equipment_component_code`  FROM  `environmental_protection`.`ep_report_repair` " +
                            "INNER JOIN `environmental_protection`.`ep_report_repair_relation`  ON (`ep_report_repair`.`report_repair_id` = `ep_report_repair_relation`.`report_repair_id`) " +
                             "INNER JOIN `environmental_protection`.`ep_equipment_component`   ON (`ep_report_repair_relation`.`relation_equipment_component_id` = `ep_equipment_component`.`equipment_component_id`) " +
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

    //跟据报修详情的id 加载已完成的信息
    [ValidateInput(false)]
    [WebMethod(Description = "getMessageRepair")]
    public void getMessageRepair(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            try
            {
                tbl_ep_message tbl = BF<bll_ep_message>.Instance.GetModel(id);
                if (tbl == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "信息不存在"));
                    return;
                }
                string msgOrderId = tbl.message_order_id;
                tbl_ep_report_repair tblRepair = BF<bll_ep_report_repair>.Instance.GetModel(msgOrderId);
                if (tblRepair == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "报修信息不存在"));
                    return;
                }
                else
                {
                    var json = "[{\"from_path\":\"" + tblRepair.from_path + "\"";
                    if (tblRepair.from_path == "报警")
                    {
                        tbl_ep_warning_log tblWarning = BF<bll_ep_warning_log>.Instance.GetModel(tblRepair.warning_log_id);
                        string lbMemo =  tblWarning.warning_level + "级报警";
                        string lbSceneName = tblWarning.scene_name;
                        string lbEquipmentName = tblWarning.equipment_name;
                        string lbComponentName = tblWarning.component_name;
                        string lbTime = tblWarning.warning_datetime.ToString();
                        string lbPointName = tblWarning.collection_point_description;
                        string lbType = tblWarning.warning_type;
                        string lbValue = tblWarning.warning_value;
                        json += ",\"memo\":\""+lbMemo+"\"";
                        json += ",\"SceneName\":\"" + lbSceneName + "\"";
                        json += ",\"EquipmentName\":\"" + lbEquipmentName + "\"";
                        json += ",\"ComponentName\":\"" + lbComponentName + "\"";
                        json += ",\"Time\":\"" + lbTime + "\"";
                        json += ",\"PointName\":\"" + lbPointName + "\"";
                        json += ",\"Type\":\"" + lbType + "\"";
                        json += ",\"Value\":\"" + lbValue + "\"";
                    }
                    else if (tblRepair.from_path == "故障")
                    {
                        tbl_ep_equipment_component_status tblGuZhang = BF<bll_ep_equipment_component_status>.Instance.GetModel(tblRepair.warning_log_id);

                        string lbMemo =  tblGuZhang.status_memo;
                        string lbSceneName =tblGuZhang.scene_name;
                        string lbEquipmentName = tblGuZhang.equipment_name;
                        string lbComponentName = "";
                        if (Dugufeixue.Common.Verification.IsNumbericChar(tblGuZhang.equipment_component_code) == false)
                        {
                            lbComponentName =  tblGuZhang.component_name + "(" + tblGuZhang.equipment_component_code + ")";
                        }
                        else
                        {
                            lbComponentName =  tblGuZhang.component_name;
                        }
                        string lbTime = tblGuZhang.start_time;
                        json += ",\"memo\":\"" + lbMemo + "\"";
                        json += ",\"SceneName\":\"" + lbSceneName + "\"";
                        json += ",\"EquipmentName\":\"" + lbEquipmentName + "\"";
                        json += ",\"ComponentName\":\"" + lbComponentName + "\"";
                        json += ",\"Time\":\"" + lbTime + "\"";
                    }
                    json += "}]";
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
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
