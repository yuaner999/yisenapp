using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Net;
using System.IO;
using System.Text;

/// <summary>
/// SMSUtils 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
// [System.Web.Script.Services.ScriptService]
public class SMSUtils : System.Web.Services.WebService {

    public SMSUtils () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    [WebMethod] 
    public string GetHtmlFromUrl()
    {
        string url = "http://utf8.sms.webchinese.cn/?Uid=wangdongkw&Key=6ed20e396fb9861afe89&smsMob=18004022440&smsText=校验码：931107，您正在使用京东快捷支付69990.00元，工作人员绝不会向您索取，请勿泄露【京东金融】";
        //Uid	本站用户名（如您无本站用户名请先注册）
        //Key	注册时填写的接口秘钥（可到用户平台修改接口秘钥）
        //如需要加密参数，请把Key变量名改成KeyMD5，
        //KeyMD5=接口秘钥32位MD5加密，大写。
        //smsMob	目的手机号码（多个手机号请用半角逗号隔开）
        //smsText	短信内容，最多支持400个字，普通短信70个字/条，长短信64个字/条计费
        string strRet = null;
        if (url == null || url.Trim().ToString() == "")
        {
            return strRet;
        }
        string targeturl = url.Trim().ToString();
        try
        {
            HttpWebRequest hr = (HttpWebRequest)WebRequest.Create(targeturl);
            hr.UserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)";
            hr.Method = "GET";
            hr.Timeout = 30 * 60 * 1000;
            WebResponse hs = hr.GetResponse();
            Stream sr = hs.GetResponseStream();
            StreamReader ser = new StreamReader(sr, Encoding.Default);
            strRet = ser.ReadToEnd();
        }
        catch (Exception ex)
        {
            strRet = null;
        }
        return strRet;
    }
    
}
