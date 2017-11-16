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

public partial class UploadFile : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        var files = Request.Files;
        HttpContext.Current.Response.Write("success");
    }
}