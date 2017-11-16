using System;
using System.Data;
using System.Text;
using System.Web.UI;
using MySql.Data.MySqlClient;
using Dugufeixue.Common;
using Dugufeixue.BLL;
using Dugufeixue.Model;
using System.Configuration;
using System.Web;

public partial class Mysql : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
//        string constr = "server=192.168.27.239;User Id=developerGroup2;password=developer_203;Database=environmental_protection";
//        MySqlConnection mycon = new MySqlConnection(constr);
//        mycon.Open();
//        MySqlCommand mycmd = new MySqlCommand("insert into token(tokenId,tokenUserId,tokenCreateTime,tokenExpireTime) values(uuid(),'',now(),now());", mycon);
//        if (mycmd.ExecuteNonQuery() > 0)
//        {
//            Console.WriteLine("数据插入成功！");
//        }
        //        Console.ReadLine();zq+2oE4AYSvTs56gHJODzA==/49BA59ABBE56E057
//        mycon.Close();
//        var data = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, "select * from token", null).Tables[0].DefaultView;
//
//        var p = Md5Utils.Md5Encrypt32("123456");
//        var u = "e1adc3949ba59abbe56e057f2f883e".ToUpper();
//        //e10adc3949ba59abbe56e057f20f883e
//        //E1ADC3949BA59ABBE56E057F2F883E
//        //E1ADC3949BA59ABBE56E057F2F883E
//        //e1adc3949ba59abbe56e057f2f883e
//        var x = data.Table.Rows[0]["tokenUserId"];
//        MySqlCommand sqlcom = new MySqlCommand
//        {
//            CommandText = "INSERT INTO `token` (`tokenId`,`tokenUserId`) VALUES(uuid(),@tokenUserId);"
//        };
//        MySqlParameter[] commandParameters = new MySqlParameter[]{
//            new MySqlParameter("@tokenUserId","赵云")
//        };
//        MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn,CommandType.Text,sqlcom.CommandText, commandParameters);
//        TimeSpan ts = DateTime.Now - DateTime.Parse("1970-1-1");
//        var milliseconds = ts.TotalMilliseconds;
//        var x = "";
//        DLog.w("123");
        //toList接口每个用户状态返回是否开启，可选
     //   Console.OutputEncoding = Encoding.GetEncoding(936);
        Environment.SetEnvironmentVariable("needDetails", "true");

        //对单个用户的推送
        //pushMessageToApp();
        //PushMessage.PushMessageToSingle();
        //对指定列表用户推送
        //PushMessageToList();
        //PushMessage.PushMessageToList();
        //对指定应用群推送
        //pushMessageToApp();
        //PushMessage.PushMessageToApp();

        //APN简化推送
        //apnPush();

        MySqlCommand sqlcom = new MySqlCommand
        {
            CommandText = "select * from ep_args_code  WHERE code =@id"
        };
        MySqlParameter[] commandParameters = new MySqlParameter[]
        {
            new MySqlParameter("@id","201")
        };
            
        var cf = MySqlHelper.ExecuteNonQuery(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters);
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        tbl_ep_args_code tbl = BF<bll_ep_args_code>.Instance.GetModel("201");
        Console.Write(tbl.name);
        HttpContext.Current.Response.Write(tbl.name);
    }
}