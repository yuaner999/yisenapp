using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;

/// <summary>
/// Login 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[ScriptService]
public class SelectScence : WebService
{

    public SelectScence()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

   /// <summary>
   /// 通过传递id和tokenid
   /// </summary>
   /// <param name="id"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "getScenes")]
    public void getScenes(string loginName, string tokenId)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        bool flag=VerifyTokenId(tokenId);
        if (flag == true)//判断tokenId是否可用
        {
            //读取用户信息
            try
            {
                string where = " A.scene_isdeleted='0'";
                bool isAdmin = Common.isAdministator(loginName);
                if (!isAdmin)//如果是用户角色有系统管理员,则拥有所有权限
                {
                    where += " and A.scene_id in (select scene_id from ep_scene_employee where user_login='" + loginName+ "')";
                }
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "select A.`scene_id`,A.`scene_name`,A.`scene_city_id`,A.`scene_province_name`,A.`scene_city_name`,A.`equipment_number`,A.`scene_type`,A.`scene_address`,A.`position_x`,A.`position_y`,A.`scene_isdeleted`,A.`scene_memo`,A.`scene_create_man`,A.`scene_create_datetime`,A.`scene_update_man`,A.`scene_update_datetime`,A.`scene_shielded`,(case when xiaoNum is null then 0 else xiaoNum end) xiaoNum,(case when xiaoNum is null then scene_name else CONCAT(scene_name,'(硝魔方)') end) scene_name2 from ep_scene A left join (select scene_id,count(0) xiaoNum from ep_equipment where equipment_isdeleted!='1' and equipment_category='硝魔方设备' group by scene_id)B on A.scene_id=B.scene_id  where " + where + " order by xiaoNum,scene_name"
                };
                var scene_id =
                    MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText).Tables[0].DefaultView;
                if (scene_id != null) //数据存在，查找成功
                {
                    var json = Common.DataTableToJson(scene_id.Table); //eq_scene表的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else //没有数据或不存在此表
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "数据不存在"));
                    return;
                }


            }
            catch (Exception e)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "获取数据异常"));
                DLog.w("SelectScene.cs->getId()->获取数据异常");
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    public static bool VerifyTokenId(string tokenId)
    {
        TimeSpan ts = DateTime.Now - DateTime.Parse("1970-1-1");
        var now = ts.TotalMilliseconds;//系统当前时间，毫秒数
        //从数据库里读出TokenId
        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "select * from token where tokenId=@tokenId and tokenExpireTime>@tokenExpireTime"
        };
        MySqlParameter[] commandParameters = new MySqlParameter[]{
            new MySqlParameter("@tokenId",tokenId),
            new MySqlParameter("@tokenExpireTime",now)
        };
        var result = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;;//查询结果
        if (result != null && result.Table.Rows.Count == 1)
        {
            return true; //验证成功，返回true
        }
        return false;//验证失败，返回false
    }
}