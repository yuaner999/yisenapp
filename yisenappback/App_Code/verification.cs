using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Dugufeixue.Model;
using Dugufeixue.BLL;
using Dugufeixue.Common;


/// <summary>
/// Verification 巡检表的相关的信息
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class Verification : WebService
{

    public Verification()
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
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

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
    [WebMethod(Description = "GetVerificationInfo")]
    public void GetVerificationInfo(string tokenId, string userName, int startNum, int num, string startDate, string endDate)
    {
        GetVerificationInfo2(tokenId, userName, startNum, num, startDate, endDate, "", "");
    }
    [ValidateInput(false)]
    [WebMethod(Description = "GetVerificationInfo2")]
    public void GetVerificationInfo2(string tokenId, string userName, int startNum, int num, string startDate, string endDate, string scene_id, string verification_status)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_sys_employee tbluser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("user_login ='" + userName + "'");

            string CommandText = "SELECT *  " +
                               "FROM ep_verification WHERE scene_id in (select scene_id from ep_scene_employee where emp_id=@emp_id) " +
                               "and (verification_emp_id='' or isnull(verification_emp_id) or verification_emp_id=@emp_id)" +
                               "AND verification_isdeleted =0 AND verification_datetime_set>@startDate AND verification_datetime_set<@endDate ";
            if (scene_id != null && scene_id != "")
            {
                CommandText += "AND scene_id=@scene_id ";
            }
            if (verification_status != null && verification_status != "")
            {
                CommandText += "AND verification_status=@verification_status ";
            }
            CommandText+=" ORDER BY verification_datetime_set desc " +
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
                new MySqlParameter("@verification_status",verification_status)
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
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = " SELECT  *   FROM " +
                              "ep_verification  WHERE   verification_id = @id "+
                              "AND verification_isdeleted='0' "
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
    public void GetPositionInfo(string tokenId, string verificationType)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT COUNT(item_position) FROM  ep_verification_detail_default WHERE verification_type =@type "
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@type",verificationType)
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
    public void GetOtherinfo(string tokenId, string verificationId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM  ep_verification_detail WHERE verification_id = @verificationId  ORDER BY item_position,item_component"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@verificationId",verificationId)
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
    public void GetPositionName(string tokenId, string verificationId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //读取巡检位置
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT DISTINCT(item_position) FROM ep_verification_detail where verification_id = @verificationId ORDER BY item_position"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@verificationId",verificationId)
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
    [WebMethod(Description = "SaveVerificationInfo")]
    public void SaveVerificationInfo(string tokenId, string status, string detailid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
       { 
                MySqlCommand sqlcom1 = new MySqlCommand
                {
                    //保存新密码
                    CommandText = "update ep_verification_detail set verification_status =@status where verification_detail_id =@detailid"
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
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE  ep_verification_detail SET verification_memo =@content  WHERE verification_detail_id =@detailid "
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
    [WebMethod(Description = "SumbitVerificationInfo")]
    public void SumbitVerificationInfo(string tokenId, string verificationid)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"];

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            MySqlCommand sqlcom1 = new MySqlCommand
            {
                //保存新密码
                CommandText = "UPDATE  ep_verification SET verification_datetime =NOW(), verification_status  =1    WHERE   verification_id =@verificationid  "
            };
            MySqlParameter[] commandParameters1 = new MySqlParameter[]
                {
                    new MySqlParameter("@verificationid", verificationid),
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
}
