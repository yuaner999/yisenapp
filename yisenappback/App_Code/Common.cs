using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Web.Script.Serialization;
using MySql.Data.MySqlClient;

/// <summary>
/// Common 的摘要说明
/// </summary>
public class Common
{
    /// <summary>
    /// 获取返回结果的Json对象
    /// </summary>
    /// <param name="status">结果状态，1成功、0失败</param>
    /// <param name="result">成功返回的结果</param>
    /// <returns></returns>
    public static string GetResultJson(int status, string result)
    {
        var resultJson = "({" +
                    "'status':" + status + "," +
                    "'result':'" + result + "'})";
        return resultJson;
    }

    public static bool isAdministator(string UserLogin)
    {
        if (UserLogin == "admin")//如果是默认管理员,则拥有所有权限
        {
            //System.Data.DataSet DSMenu = BF<bll_sys_menu>.Instance.GetDataSet();             
            return true;
        }
        else
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from sys_employee where user_login=@user_id and role_id in (select role_id from sys_role where role_name = '系统管理员')"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@user_id",UserLogin)
            };
            var result = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView; ;//查询结果
            if (result != null && result.Table.Rows.Count >0)
            {
                return true;//验证成功，返回true
            }
            else
            {
                //System.Data.DataSet DSMenu = BF<bll_sys_menu>.Instance.GetUserMenuDataSet(" user_id=@user_id ", fileorder, new MySqlParameter("@user_id", ClsCurrentUserInfo.UserLogin));
                // DSMenu = bllmenu.GetUserMenuDataSet(" user_id=@user_id ", new System.Data.SqlClient.SqlParameter("@user_id", ClsCurrentUserInfo.UserLogin));
                return false;
            }
        }
    }

    /// <summary>
    /// 验证TokenId是否合法
    /// </summary>
    /// <param name="tokenId">待验证的TokenId</param>
    /// <returns></returns>
    public static bool VerifyTokenId(string tokenId)
    {
        TimeSpan ts = DateTime.Now - DateTime.Parse("1970-1-1");
        var now = ts.TotalMilliseconds;//系统当前时间，毫秒数
        //从数据库里读出TokenId
        try
        {
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select * from token where tokenId=@tokenId and tokenExpireTime>@tokenExpireTime"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@tokenId",tokenId),
                new MySqlParameter("@tokenExpireTime",now)
            };
            var result = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView; ;//查询结果
            if (result != null && result.Table.Rows.Count == 1)
            {
                return true;//验证成功，返回true
            }
        }
        catch (Exception)
        {
            return false;
        }
        
        return false;
    }

    /// <summary>
    /// 将DataTable转成Json
    /// </summary>
    /// <param name="dtDataTable"></param>
    /// <returns></returns>
    public static string DataTableToJson(DataTable dtDataTable)
    {
        JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
        javaScriptSerializer.MaxJsonLength = Int32.MaxValue; //取得最大数值
        ArrayList arrayList = new ArrayList();
        foreach (DataRow dataRow in dtDataTable.Rows)
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>(); //实例化一个参数集合
            foreach (DataColumn dataColumn in dtDataTable.Columns)
            {
                dictionary.Add(dataColumn.ColumnName, dataRow[dataColumn.ColumnName].ToString().Replace("\r\n"," "));
            }
            arrayList.Add(dictionary); //ArrayList集合中添加键值
        }
        return javaScriptSerializer.Serialize(arrayList);  //返回一个json字符串
    }
}