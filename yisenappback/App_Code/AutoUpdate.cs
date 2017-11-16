using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Services;

/// <summary>
/// AutoUpdate 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class AutoUpdate : System.Web.Services.WebService {

    public AutoUpdate () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    [WebMethod(Description = "Update")]
    public void Update(string netType)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        var version = Convert.ToInt32(ConfigurationManager.AppSettings["appversion"].ToString());//版本号
        if (netType == "0")//外网
        {
            var url = ConfigurationManager.AppSettings["appurl"].ToString();//升级地址
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(version, url));
        }
        else//内网
        {
            var url = ConfigurationManager.AppSettings["appurl_nei"].ToString();//升级地址
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(version, url));
        }
       
  
    }
    
}
