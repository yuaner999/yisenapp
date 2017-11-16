using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using com.force.json;
using Dugufeixue.BLL;
using Dugufeixue.Common;
using Dugufeixue.Model;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;


/// <summary>
/// Check 巡检表的相关的信息
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class Check : WebService
{

    public Check()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    /// <summary>
    /// 获取用户信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="loginName">登录名</param>
    [ValidateInput(false)]
    [WebMethod(Description = "getRoutingInspection")]
    public void GetRoutingInspection(string tokenId, string loginName)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取用户信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from sys_employee where user_login = @user_login and emp_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@user_login",loginName)
            };
            var userInfor = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (userInfor != null && userInfor.Table.Rows.Count == 1)//用户存在
            {
                var json = Common.DataTableToJson(userInfor.Table);//用户信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else//用户不存在或已删除
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "用户不存在"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    //跟据员工的id 加载巡检列表的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetCheckInfo")]
    public void GetCheckInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate)
    {
        GetCheckInfo2(tokenId, userName, startNum, num, startDate, endDate, "", "","");
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetCheckInfo2")]
    public void GetCheckInfo2(string tokenId, string userName, int startNum, int num, string startDate, string endDate, string scene_id, string check_type, string check_status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + userName + "'");
            string CommandText = "SELECT *  " +
                               "FROM  ep_check WHERE scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) " +
                               "and (check_emp_id='' or isnull(check_emp_id) or check_emp_id=@emp_id)" +
                               "AND check_isdeleted =0 AND check_datetime_set>@startDate AND check_datetime_set<@endDate ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += "AND ep_check.scene_id=@scene_id ";
            }

            if (check_type != null && check_type != "")
            {
                CommandText += "AND ep_check.check_type=@check_type ";
            }
            if (check_status != null && check_status != "")
            {
                CommandText += "AND ep_check.check_status=@check_status ";
            }
            CommandText += " ORDER BY check_datetime_set desc " +
                              "limit @startNum,@num";

            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@emp_id",tbluser.emp_id),
                new MySqlParameter("@startNum",startNum),
                new MySqlParameter("@num",num),
                new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59")),
                new MySqlParameter("@scene_id",scene_id),
                new MySqlParameter("@check_type",check_type),
                new MySqlParameter("@check_status",check_status),
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

    //跟据员工和现场id获得巡检时间 设备的名字 巡检类型等 
    [ValidateInput(false)]
    [WebMethod(Description = "GetTitleInfo")]
    public void GetTitleInfo(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " SELECT  *   FROM " +
                              "ep_check  WHERE   check_id = @id "+
                              "AND check_isdeleted='0' "
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

    //跟据巡检类型加载巡检位置
    [ValidateInput(false)]
    [WebMethod(Description = "GetPositionInfo")]
    public void GetPositionInfo(string tokenId, string checkType)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT COUNT(item_position) FROM  ep_check_detail_default WHERE check_type =@type "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@type",checkType)
            };
            var position = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (position != null)//查询成功
            {
                var json = Common.DataTableToJson(position.Table); //信息的Json形式
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
    //跟据巡检位置 查询其他的信息
    [ValidateInput(false)]
    [WebMethod(Description = "GetOtherinfo")]
    public void GetOtherinfo(string tokenId, string checkId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM  ep_check_detail WHERE check_id = @checkId  ORDER BY item_position,item_component"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@checkId",checkId)
            };
            var otherInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (otherInfo != null)//查询成功
            {
                var json = Common.DataTableToJson(otherInfo.Table); //信息的Json形式
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

    //查询点检位置
    [ValidateInput(false)]
    [WebMethod(Description = "GetPositionName")]
    public void GetPositionName(string tokenId, string checkId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT DISTINCT(item_position) FROM ep_check_detail where check_id = @checkId ORDER BY item_position"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@checkId",checkId)
            };
            var nameInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
            if (nameInfo != null)//查询成功
            {
                var json = Common.DataTableToJson(nameInfo.Table); //信息的Json形式
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
    //单条保存巡检的信息
    [ValidateInput(false)]
    [WebMethod(Description = "SaveCheckInfo")]
    public void SaveCheckInfo(string tokenId, string status, string detailid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
       { 
                MySqlCommand sqlcom1 = new MySqlCommand
                {
                    //保存新密码
                    CommandText = "update ep_check_detail set check_status =@status where check_detail_id =@detailid"
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
                CommandText = "UPDATE  ep_check_detail SET check_memo =@content  WHERE check_detail_id =@detailid "
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


    //巡检的信息的提交
    [ValidateInput(false)]
    [WebMethod(Description = "SumbitCheckInfo")]
    public void SumbitCheckInfo(string tokenId,string checkid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE  ep_check SET check_datetime =NOW(), check_status  =1    WHERE   check_id =@checkid  "
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@checkid", checkid),
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
    //单条新建的巡检信息
    [ValidateInput(false)]
    [WebMethod(Description = "SaveNewCheckInfo")]
    public void SaveNewCheckInfo(string tokenId, string jsonData)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //将传过来的json 字符串转换为json格式
            JSONObject json = new JSONObject(jsonData);
            string scene_id = json.getString("scene_id");
            string scene_name = json.getString("scene_name");
            string check_type = json.getString("check_type");
            string time = json.getString("time");
            string memo = json.getString("memo");
            string loginName = json.getString("loginName");
            if (scene_name == "请选择现场")
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请先选择现场"));
                return;
            }
            if (check_type == "请选择类型")
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "请先选择类型"));
                return;
            }
            tbl_sys_employee tblAfter = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + loginName + "'");
            List<SqlAndArgs> sqlAndArgses = new List<SqlAndArgs>();
            tbl_ep_check tbl = new tbl_ep_check();
            tbl.check_id = Guid.NewGuid().ToString();
            tbl.scene_name = scene_name;
            tbl.check_datetime_set = Convert.ToDateTime(time);
            tbl.check_memo = memo;
            tbl.check_type = check_type;
            tbl.check_status = 0;
            tbl.check_create_man = loginName;
            tbl.check_create_datetime = DateTime.Now;
            tbl.check_emp_id = tblAfter.emp_id;
            tbl.check_emp_name = tblAfter.emp_name;
            tbl.scene_id = scene_id;
            sqlAndArgses.Add(BF<bll_ep_check>.Instance.PrepareAddArgs(tbl));
            //添加巡检表，事物操作
            tbl_ep_check_detail tbl_detail = new tbl_ep_check_detail();
            var dt = BF<bll_ep_check_detail_default>.Instance.GetDataTable("scene_id='" +scene_id + "' and check_type='" + check_type + "'", "sort_order");
            foreach (DataRow row in dt.Rows)
            {
                tbl_detail.check_detail_id = Guid.NewGuid().ToString();
                tbl_detail.check_id = tbl.check_id;
                tbl_detail.item_position = row["item_position"].ToString();
                tbl_detail.item_component = row["item_component"].ToString();
                tbl_detail.item_content = row["item_content"].ToString();
                tbl_detail.item_method = row["item_method"].ToString();
                tbl_detail.item_standard = row["item_standard"].ToString();
                tbl_detail.sort_order = int.Parse(row["sort_order"].ToString());
                sqlAndArgses.Add(BF<bll_ep_check_detail>.Instance.PrepareAddArgs(tbl_detail));
            }
            
            bool result = SqlHelper.ExecuteMulSql(sqlAndArgses);
            if (result)
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
}
