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
/// Task 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
// [System.Web.Script.Services.ScriptService]
public class Task : System.Web.Services.WebService
{

    public Task()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    [ValidateInput(false)]
    [WebMethod(Description = "GetTaskListInfo")]
    public void GetTaskListInfo(string tokenId, string userName, int num, int startNum, string startDate, string endDate)
    {
        GetTaskListInfo2( tokenId,  userName,  num,  startNum,  startDate,  endDate, "");
    }

    [ValidateInput(false)]
    [WebMethod(Description = "GetTaskListInfo2")]
    public void GetTaskListInfo2(string tokenId, string userName, int num, int startNum, string startDate, string endDate, string task_status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            string CommandText = "SELECT * FROM ep_task WHERE scene_id IN (SELECT scene_id FROM ep_scene_employee WHERE user_login=@userName) AND DATE(task_time)>=@startDate AND DATE(task_time)<=@endDate ";
            if (task_status != null && task_status != "")
            {
                CommandText += "AND task_status=@task_status ";
            }
            CommandText+="ORDER BY task_status , task_time DESC LIMIT @startNum,@num";           
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
                new MySqlParameter("@task_status",task_status)
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
    [WebMethod(Description = "GetTaskDetail")]
    public void GetTaskDetail(string tokenId, string tid)
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
                CommandText = "(SELECT * FROM ep_task,sys_employee WHERE task_id = @task_id and ep_task.emp_id = sys_employee.emp_id ) UNION (SELECT * FROM ep_task,sys_employee WHERE task_id = @task_id and ep_task.accept_emp_id = sys_employee.emp_id)"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@task_id", tid)
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
    [WebMethod(Description = "GetTaskReply")]
    public void GetTaskReply(string tokenId, string tid)
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
                CommandText = "SELECT * FROM ep_task_reply WHERE task_id = @task_id ORDER BY reply_time DESC"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@task_id", tid)
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
    [WebMethod(Description = "ReplyTask")]
    public void ReplyTask(string tokenId, string tid, string userName, string content)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {

                    tbl_ep_task_reply tbl = new tbl_ep_task_reply();
                    tbl.task_reply_id = Guid.NewGuid().ToString();
                    tbl.task_id = tid;
                    tbl.reply_content = content;
                    tbl.reply_emp_id = Info.Table.Rows[0]["emp_id"].ToString();
                    tbl.reply_emp_name = Info.Table.Rows[0]["emp_name"].ToString();
                    tbl.reply_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                    MySqlCommand sqlmess = new MySqlCommand
                    {
                        CommandText = "INSERT INTO ep_task_reply (task_reply_id ,task_id,reply_content,reply_emp_id,reply_emp_name,reply_time) VALUES (@task_reply_id ,@task_id,@reply_content,@reply_emp_id,@reply_emp_name,@reply_time)"
                    };
                    MySqlParameter[] commandParametersmess = new MySqlParameter[]
                    {
                          new MySqlParameter("@task_reply_id", tbl.task_reply_id),
                          new MySqlParameter("@task_id", tbl.task_id),
                          new MySqlParameter("@reply_content", tbl.reply_content),
                          new MySqlParameter("@reply_emp_id", tbl.reply_emp_id),
                          new MySqlParameter("@reply_emp_name", tbl.reply_emp_name),
                          new MySqlParameter("@reply_time", tbl.reply_time),
                    };
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlmess.CommandText, commandParametersmess);
                    if (Info2 == 1) //信息存在
                    {
                        // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发表成功"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "发表失败"));
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
    [WebMethod(Description = "CompleteTask")]
    public void CompleteTask(string tokenId, string tid, string userName)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    tbl_ep_task tbl = BF<bll_ep_task>.Instance.GetModel(tid);
                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "UPDATE ep_task SET task_status = '3' WHERE task_id = @id "
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {                    
                        new MySqlParameter("@id", tid),
                    };

                    var empId = Info.Table.Rows[0]["emp_id"].ToString();
                    var empName = Info.Table.Rows[0]["emp_name"].ToString();
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (Info2 == 1) //信息存在
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "完成任务"));
                        sendPerson("接收到一条完成任务审核通过消息", "申请完成任务已审核通过！", tbl.accept_emp_id, tid);
                        return;
                    }
                    else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "完成失败"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "完成失败"));
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
    [WebMethod(Description = "ApplyCompleteTask")]
    public void ApplyCompleteTask(string tokenId, string tid, string userName)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    tbl_ep_task tbl = BF<bll_ep_task>.Instance.GetModel(tid);

                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "UPDATE ep_task SET task_status = '2' WHERE task_id = @id "
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {                    
                        new MySqlParameter("@id", tid),
                    };

                    var empId = Info.Table.Rows[0]["emp_id"].ToString();
                    var empName = Info.Table.Rows[0]["emp_name"].ToString();
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (Info2 == 1) //信息存在
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "申请完成任务成功"));
                        sendPerson("接收到一条任务完成申请消息", "【" + empName + "】申请完成任务！", tbl.emp_id, tid);
                        return;
                    }
                    else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "申请完成任务失败"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "完成失败"));
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
    [WebMethod(Description = "RejectTask")]
    public void RejectTask(string tokenId, string tid, string userName)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    tbl_ep_task tbl = BF<bll_ep_task>.Instance.GetModel(tid);

                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "UPDATE ep_task SET task_status = '1' WHERE task_id = @id "                  
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {                    
                        new MySqlParameter("@id", tid),
                    };

                    var empId = Info.Table.Rows[0]["emp_id"].ToString();
                    var empName = Info.Table.Rows[0]["emp_name"].ToString();
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (Info2 == 1) //信息存在
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "驳回成功"));
                        sendPerson("接收到一条驳回任务的消息", "【" + empName + "】驳回了任务的完成申请！", tbl.accept_emp_id, tid);
                        return;
                    }
                    else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "驳回失败"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "驳回失败"));
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
    [WebMethod(Description = "StopTask")]
    public void StopTask(string tokenId, string tid, string userName)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    tbl_ep_task tbl = BF<bll_ep_task>.Instance.GetModel(tid);

                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "UPDATE ep_task SET task_status = '4' WHERE task_id = @id "
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {                    
                        new MySqlParameter("@id", tid),
                    };

                    var empId = Info.Table.Rows[0]["emp_id"].ToString();
                    var empName = Info.Table.Rows[0]["emp_name"].ToString();
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (Info2 == 1) //信息存在
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "终止成功"));
                        if (tbl.accept_emp_id != "")
                        {
                            sendPerson("接收到一条终止任务的消息", "【" + empName + "】终止了任务！", tbl.accept_emp_id, tid);
                        }
                        return;
                    }
                    else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "终止失败"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "终止失败"));
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
    [WebMethod(Description = "ApplyTask")]
    public void ApplyTask(string tokenId, string tid, string userName)
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
                CommandText = "SELECT * FROM sys_employee  WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userName)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {
                    tbl_ep_task tbl = BF<bll_ep_task>.Instance.GetModel(tid);

                    MySqlCommand sqlcom2 = new MySqlCommand
                    {
                        CommandText = "UPDATE ep_task SET task_status = '1',accept_emp_id = @emp_id, accept_emp_name= @emp_name,accept_time = @accept_time WHERE task_id = @id"
                    };
                    MySqlParameter[] commandParameters2 = new MySqlParameter[]
                    {                    
                        new MySqlParameter("@emp_id", Info.Table.Rows[0]["emp_id"].ToString()),
                        new MySqlParameter("@emp_name",  Info.Table.Rows[0]["emp_name"].ToString()),
                        new MySqlParameter("@accept_time", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")),
                        new MySqlParameter("@id", tid),
                    };

                    var empId = Info.Table.Rows[0]["emp_id"].ToString();
                    var empName = Info.Table.Rows[0]["emp_name"].ToString();
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2);
                    if (Info2 == 1) //信息存在
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "申请成功"));
                        sendPerson("接收到一条任务申请消息", "【" + empName + "】申请了新任务！", tbl.emp_id, tid);
                        return;
                    }
                    else //不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "申请失败"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "申请失败"));
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


    //发送消息
    public void sendPerson(string message_title, string message_content, string emp_id, string taskId)
    {
        try
        {
            tbl_sys_employee lstEmp = BF<bll_sys_employee>.Instance.GetModel(emp_id);
            tbl_ep_message tbl = new tbl_ep_message();
            tbl.message_id = Guid.NewGuid().ToString();
            tbl.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            tbl.message_title = message_title;
            tbl.message_content = message_content;
            tbl.message_status = 0;
            tbl.emp_id = lstEmp.emp_id;
            tbl.emp_name = lstEmp.emp_name;
            tbl.message_type = "任务";
            tbl.message_order_id = taskId;
            //tbl.send_emp_id = "admin";
            //tbl.send_emp_name = "系统管理员";
            BF<bll_ep_message>.Instance.Add(tbl);
        }
        catch (Exception ex)
        {
            //DialogHelper.DlgError("发送消息错误:" + ex);
            return;
        }

    }

    ///加载现场的名字(所拥有的)
    [ValidateInput(false)]
    [WebMethod(Description = "GetSceneName")]
    public void GetSceneName(string tokenId, string name)
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
    [ValidateInput(false)]
    [WebMethod(Description = "SendTask")]
    public void SendTask(string tokenId, string userlogin, string content, string sceneId, string sceneName)
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
                CommandText = "SELECT * FROM sys_employee WHERE user_login = @user_login"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]
            {
                  new MySqlParameter("@user_login", userlogin)
            };
            try
            {
                var Info = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (Info != null && Info.Table.Rows.Count >= 1) //信息存在
                {

                    tbl_ep_task tbl = new tbl_ep_task();
                    tbl.task_id = Guid.NewGuid().ToString();
                    tbl.task_content = content;
                    tbl.scene_id = sceneId;
                    tbl.scene_name = sceneName;
                    tbl.emp_id = Info.Table.Rows[0]["emp_id"].ToString();
                    tbl.emp_name = Info.Table.Rows[0]["emp_name"].ToString();
                    tbl.task_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                    tbl.task_status = 0;
                    tbl.accept_task_status = 0;

                    MySqlCommand sqlmess = new MySqlCommand
                    {
                        CommandText = "INSERT INTO ep_task (task_id ,emp_id,emp_name,scene_id,scene_name,task_time,task_content,task_status,accept_task_status)" +
                                      " VALUES (@task_id ,@emp_id,@emp_name,@scene_id,@scene_name,@task_time,@task_content,@task_status,@accept_task_status)"
                    };
                    MySqlParameter[] commandParametersmess = new MySqlParameter[]
                    {
                          new MySqlParameter("@task_id", tbl.task_id),                          
                          new MySqlParameter("@emp_id", tbl.emp_id),
                          new MySqlParameter("@emp_name", tbl.emp_name),
                          new MySqlParameter("@scene_id", tbl.scene_id),
                          new MySqlParameter("@scene_name", tbl.scene_name),
                          new MySqlParameter("@task_time", tbl.task_time),
                          new MySqlParameter("@task_content", tbl.task_content),
                          new MySqlParameter("@task_status", tbl.task_status),
                          new MySqlParameter("@accept_task_status", tbl.accept_task_status),
                    };
                    var Info2 = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlmess.CommandText, commandParametersmess);
                    if (Info2 == 1) //信息存在
                    {
                        List<tbl_ep_scene_employee> lstEmp = BF<bll_ep_scene_employee>.Instance.GetModelList("scene_id='" + tbl.scene_id + "'", "");
                        foreach (tbl_ep_scene_employee emp in lstEmp)
                        {
                            tbl_sys_employee tblemp = BF<bll_sys_employee>.Instance.GetModel(emp.emp_id);
                            tbl_ep_message tbl_message = new tbl_ep_message();
                            tbl_message.message_id = Guid.NewGuid().ToString();
                            tbl_message.emp_id = tblemp.emp_id;
                            tbl_message.emp_name = tblemp.emp_name;
                            tbl_message.message_title = "接收到一条新任务";
                            tbl_message.message_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                            tbl_message.message_status = 0;
                            tbl_message.message_content = tbl.emp_name + "发布了一条新任务，请查看！";
                            tbl_message.message_type = "任务";
                            tbl_message.message_order_id = tbl.task_id;
                            BF<bll_ep_message>.Instance.Add(tbl_message);
                        }
                        // var json = Common.DataTableToJson(Info.Table); //信息的Json形式
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发表成功"));
                        return;
                    }

                }
                else //不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "发表失败"));
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
