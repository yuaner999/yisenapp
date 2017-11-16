using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// DLog 的摘要说明
/// </summary>
public class DLog
{
	public DLog()
	{
		//
		// TODO: 在此处添加构造函数逻辑
		//


	}

    public static void w(String o) {
        try {
            string logDir=System.Web.HttpContext.Current.Server.MapPath("~");
            if(logDir==""){
                logDir="C://log/";
            }else {
                logDir = logDir+"/log/";
            }
            string currentDataTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

            string logFilePath = logDir + currentDataTime.Substring(0, 7) + "/" + currentDataTime.Substring(0, 10) + ".log";

            DFile f = new DFile(logFilePath, currentDataTime.Substring(11) + "\t" + o + "-------\r\n");
            f.ReadWriteFile();
        }
        catch{

        }
    }
}