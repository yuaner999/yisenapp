using System;
using System.Data;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;
using MySql.Data.MySqlClient;
using Dugufeixue.BLL;
using Dugufeixue.Model;
using Dugufeixue.Common;
using System.Net;
using System.Net.Sockets;
using System.Text;

/// <summary>
/// Scene 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。 
[System.Web.Script.Services.ScriptService]
public class Scene : WebService {

    public Scene () {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    
    /// <summary>
    /// 获取现场的全部设备
    /// </summary>
    /// <param name="tokenId">tokenId</param>
    /// <param name="sceneId">现场Id</param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetAllEquipments")]
    public void GetAllEquipments(string tokenId, string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //获取设备信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "select A.*,(case when controlNum is null then 0 else controlNum end) controlNum from ep_equipment A left join (select equipment_id,count(0) controlNum from ep_equipment_component_point where is_control=1 and point_isdeleted=0 group by equipment_id)B on A.equipment_id=B.equipment_id where A.equipment_isdeleted=0 and A.scene_id=@scene_id order by A.equipment_name"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@scene_id",scene_id)
            };
            try
            {
                var equipments = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (equipments != null && equipments.Table.Rows.Count > 0)//现场没有设备
                {
                    var json = Common.DataTableToJson(equipments.Table);//用户设备的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else//用户不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无设备"));
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
    /// <summary>
    /// 获取现场的全部设备
    /// </summary>
    /// <param name="tokenId">tokenId</param>
    /// <param name="sceneId">现场Id</param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetDangBanUser")]
    public void GetDangBanUser(string tokenId, string scene_id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            try
            {
                //获取设备信息
                MySqlCommand sqlcom2 = new MySqlCommand
                {
                    CommandText = "SELECT * FROM ep_handover A LEFT JOIN sys_employee B ON A.`handover_man_after_login`=B.`user_login` where A.`handover_status`='2' and A.scene_id=@scene_id order by A.handover_datetime_after desc"
                };
                MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                    new MySqlParameter("@scene_id",scene_id)
                };
                var user1 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0].DefaultView;
                if (user1 != null && user1.Table.Rows.Count > 0)//
                {
                    DataRow row = user1.Table.Rows[0];
                    DataTable dt = new DataTable();
                    dt.Columns.Add("emp_name");
                    dt.Columns.Add("emp_phone");
                    DataRow drnew2 = dt.NewRow();
                    drnew2["emp_name"] = row["emp_name"].ToString();
                    drnew2["emp_phone"] = row["emp_phone"].ToString();
                    dt.Rows.Add(drnew2);
                    MySqlCommand sqlcom = new MySqlCommand
                    {
                        CommandText = "SELECT role_id,user_type,emp_name,emp_age,emp_sex,emp_phone,emp_startdate,user_login FROM ep_handover_afterman A LEFT JOIN sys_employee B ON A.`afterman_id`=B.`emp_id` WHERE A.`handover_id`=@handover_id"
                    };
                    MySqlParameter[] commandParameters = new MySqlParameter[]{
                        new MySqlParameter("@handover_id",row["handover_id"])
                    };
                    var user2 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                    if (user2 != null && user2.Table.Rows.Count > 0)//
                    {
                        foreach(DataRow dr in user2.Table.Rows){
                            DataRow drnew = dt.NewRow();
                            drnew["emp_name"] = dr["emp_name"].ToString();
                            drnew["emp_phone"] = dr["emp_phone"].ToString();
                            dt.Rows.Add(drnew);
                        }
                    }
                    var json = Common.DataTableToJson(dt);//用户设备的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else//用户不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无用户"));
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
    [WebMethod(Description = "GetEquipmentsPic")]
    public void GetEquipmentsPic(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //获取设备信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "SELECT * FROM ep_equipment_component WHERE equipment_id = @equipment_id and equipment_component_isdeleted=0"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@equipment_id",id)
            };
            try
            {
                var equipments = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (equipments != null && equipments.Table.Rows.Count > 0)//现场没有设备
                {
                    var json = Common.DataTableToJson(equipments.Table);//用户设备的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else//用户不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无设备"));
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
    /// <summary>
    /// 获取设备的部件采集点数据
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="equipmentId">设备ID</param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetPointData")]
    public void GetPointData(string tokenId, string equipment_id)
    {
         HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment tblequip = BF<bll_ep_equipment>.Instance.GetModel(equipment_id);
            if (tblequip == null) {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到设备信息"));
                return;
            }
            string CommandText = "SELECT A.*,M.controlValueNum,N.controlOnNum FROM ep_equipment_component_point A left join (select equipment_component_id,count(0) controlValueNum from ep_equipment_component_point where equipment_id = @equipment_id and is_control=1 and point_isdeleted=0 and collection_point_type='控制数值' group by equipment_component_id)M on A.equipment_component_id=M.equipment_component_id left join (select equipment_component_id,count(0) controlOnNum from ep_equipment_component_point where equipment_id = @equipment_id and is_control=1 and point_isdeleted=0 and collection_point_type='控制启动' group by equipment_component_id)N on A.equipment_component_id=N.equipment_component_id WHERE equipment_id = @equipment_id and is_control!=1 and collection_point_type!='复合开关-关' and point_isdeleted=0 ORDER BY (case when collection_point_type='模拟值' then '运行2' when collection_point_type='高料位' then '运行1' else collection_point_type end) desc,collection_point_name;";
            if (tblequip.equipment_category == "硝魔方设备") {
                CommandText = "SELECT A.*,M.controlValueNum,N.controlOnNum FROM ep_equipment_component_point A left join (select equipment_component_id,count(0) controlValueNum from ep_equipment_component_point where equipment_id = @equipment_id and is_control=1 and point_isdeleted=0 and collection_point_type='控制数值' group by equipment_component_id)M on A.equipment_component_id=M.equipment_component_id left join (select equipment_component_id,count(0) controlOnNum from ep_equipment_component_point where equipment_id = @equipment_id and is_control=1 and point_isdeleted=0 and collection_point_type='控制启动' group by equipment_component_id)N on A.equipment_component_id=N.equipment_component_id WHERE equipment_id = @equipment_id and is_control!=1 and collection_point_type!='复合开关-关' and collection_point_type!='故障' and point_isdeleted=0 ORDER BY (case when collection_point_type='模拟值' then '运行2' when collection_point_type='高料位' then '运行1' else collection_point_type end) desc,collection_point_name;";
            }
            //获取设备的部件采集点数据
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = CommandText
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@equipment_id",equipment_id)
            };
            try
            {
                var pointData = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (pointData != null && pointData.Table.Rows.Count > 0)//有数据
                {
                    DataTable dt = new DataTable();
                    dt.Columns.Add("采集点名称");
                    dt.Columns.Add("采集点ID");
                    dt.Columns.Add("值");
                    dt.Columns.Add("时间");
                    dt.Columns.Add("部件名称");
                    dt.Columns.Add("单位");
                    dt.Columns.Add("采集点名称1");
                    dt.Columns.Add("采集点类型");
                    dt.Columns.Add("反控类型");
                    foreach (DataRow dr2 in pointData.Table.Rows)
                    {
                        if (dr2["newest_value"].ToString().Trim() != "")//有数据
                        {
                            double currentvalue = 0;
                            DataRow dr_new = dt.NewRow();
                            dr_new["采集点名称"] = dr2["collection_point_name"].ToString();
                            dr_new["采集点ID"] = dr2["equipment_component_point_id"].ToString();
                            dr_new["值"] = dr2["newest_value"].ToString();
                            dr_new["时间"] = dr2["newest_data_time"].ToString();
                            dr_new["部件名称"] = dr2["component_name"].ToString();
                            if (Dugufeixue.Common.Verification.IsNumbericChar(dr2["equipment_component_code"].ToString()) == false)
                            {
                                //dr_new["部件名称"] = dr2["component_name"].ToString() + "(" + dr2["equipment_component_code"].ToString() + ")";
                                dr_new["部件名称"] = dr2["component_name"].ToString();
                            }
                            dr_new["单位"] = dr2["collection_point_unit"].ToString();
                            dr_new["采集点名称1"] = dr2["collection_point_description"].ToString();
                            dr_new["采集点类型"] = dr2["collection_point_type"].ToString();
                            //tbl_ep_equipment_component_point tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control=1 and collection_point_type='控制数值' and equipment_component_id='" + dr2["equipment_component_id"].ToString() + "'");
                            //if (tblPointControl != null)
                            //{
                            //    dr_new["反控类型"] = "2";
                            //}
                            //else 
                            //{
                            //    tbl_ep_equipment_component_point tblPointControl2 = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control=1 and collection_point_type='控制启动' and equipment_component_id='" + dr2["equipment_component_id"].ToString() + "'");
                            //    if (tblPointControl2 != null)
                            //    {
                            //        dr_new["反控类型"] = "1";
                            //    }
                            //    else 
                            //    {
                            //        dr_new["反控类型"] = "0";
                            //    }
                            //}
                            if (dr2["controlValueNum"].ToString() != "")
                            {
                                dr_new["反控类型"] = "2";
                            }
                            else
                            {
                                if (dr2["controlOnNum"].ToString() != "")
                                {
                                    dr_new["反控类型"] = "1";
                                }
                                else
                                {
                                    dr_new["反控类型"] = "0";
                                }
                            }
                            
                            switch (dr2["collection_point_type"].ToString())
                            {
                                case "运行":
                                    if (tblequip.equipment_category == "硝魔方设备")
                                    {
                                        tbl_ep_equipment_component_point tblpointguzhang = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("equipment_component_id='" + dr2["equipment_component_id"].ToString() + "' and collection_point_type='故障'");

                                        if (tblpointguzhang != null && tblpointguzhang.newest_value.ToString().Trim() != "")//有数据
                                        {
                                            double currentvalue2 = Convert.ToDouble(tblpointguzhang.newest_value.ToString());
                                            if (currentvalue2 == 1)
                                            {
                                                dr_new["值"] = "故障";
                                            }
                                            else
                                            {
                                                currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                                if (currentvalue == 1)
                                                {
                                                    dr_new["值"] = "运行";
                                                }
                                                else
                                                {
                                                    dr_new["值"] = "停止";
                                                }
                                            }

                                        }
                                        else
                                        {
                                            currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                            if (currentvalue == 1)
                                            {
                                                dr_new["值"] = "运行";
                                            }
                                            else
                                            {
                                                dr_new["值"] = "停止";
                                            }
                                        }
                                    }
                                    else 
                                    {
                                        currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                        if (currentvalue == 1)
                                        {
                                            dr_new["值"] = "运行";
                                        }
                                        else
                                        {
                                            dr_new["值"] = "停止";
                                        }
                                    }
                                    break;
                                case "复合开关-开":
                                    tbl_ep_equipment_component_point tblpoint = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("equipment_component_id='" + dr2["equipment_component_id"].ToString() + "' and collection_point_type='复合开关-关'");

                                    if (tblpoint != null && tblpoint.newest_value.ToString().Trim() != "")//有数据
                                    {
                                        double currentvalue2 = Convert.ToDouble(tblpoint.newest_value.ToString());
                                        currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());

                                        if (currentvalue == 1 && currentvalue2 == 0)
                                        {
                                            dr_new["值"] = "开";
                                        }
                                        else if (currentvalue == 0 && currentvalue2 == 1)
                                        {
                                            dr_new["值"] = "关";
                                        }
                                        else
                                        {
                                            dr_new["值"] = "故障";

                                        }

                                    }
                                    break;
                                case "模拟值":
                                    currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                    tbl_ep_equipment tblEquip = BF<bll_ep_equipment>.Instance.GetModel(dr2["equipment_id"].ToString());

                                    if (tblEquip != null && tblEquip.is_data_transfer)//有数据
                                    {
                                        if (dr2["collection_point_name"].ToString() == "01" ||
                                        dr2["collection_point_name"].ToString() == "02" ||
                                        dr2["collection_point_name"].ToString() == "03")
                                        {
                                            DataRow[] drs = pointData.Table.Select("collection_point_name='S01' and equipment_id='" + dr2["equipment_id"].ToString() + "'");
                                            if (drs != null && drs.Length > 0 && drs[0]["newest_value"].ToString() != "")
                                                currentvalue = Math.Round((currentvalue * 12 / (21 - Convert.ToDouble(drs[0]["newest_value"]))) * 1000) * 0.001;
                                        }
                                    }
                                    
                                    dr_new["值"] = currentvalue + dr2["collection_point_unit"].ToString();

                                    break;
                                case "监管":
                                    currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                    if (currentvalue == 1)
                                    {
                                        dr_new["值"] = "需监管";
                                    }
                                    else
                                    {
                                        dr_new["值"] = "正常";
                                    }
                                    break;
                                case "故障":
                                    currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                    if (currentvalue == 1)
                                    {
                                        dr_new["值"] = "故障";
                                    }
                                    else
                                    {
                                        dr_new["值"] = "正常";
                                    }
                                    break;
                                case "反馈":
                                    currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                    if (currentvalue == 1)
                                    {
                                        dr_new["值"] = "反馈中";
                                    }
                                    else
                                    {
                                        dr_new["值"] = "无";
                                    }
                                    break;
                                case "高料位":
                                    currentvalue = Convert.ToDouble(dr2["newest_value"].ToString());
                                    if (currentvalue == 1)
                                    {
                                        dr_new["值"] = "报警";
                                    }
                                    else
                                    {
                                        dr_new["值"] = "正常";
                                    }
                                    break;
                                default:
                                    break;
                            }
                            if (dr2["newest_data_time"].ToString() != "")
                            {
                                DateTime dtime1 = Convert.ToDateTime(dr2["newest_data_time"].ToString());
                                DateTime dtime2 = DateTime.Now;
                                TimeSpan ts = dtime2 - dtime1;
                                if (ts.TotalHours > 2)
                                {
                                    dr_new["值"]  = "--";
                                }
                            }
                            dt.Rows.Add(dr_new);
                        }
                    }

                    var json = Common.DataTableToJson(dt);//数据的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else//没有数据
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
                    return;
                }
            }
            catch (Exception e)
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                DLog.w("系统异常:"+e.Message);
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
    [WebMethod(Description = "GetDetailInfo")]
    public void GetDetailInfo(string tokenId, string point_id, string equipmentId, string time)
    {
        string timetype = '%' + time + '%';

        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(point_id);
            if (tblPoint != null)
            {
                //获取设备的部件采集点数据（day）
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "SELECT * from ep_collection_data_hour  WHERE collection_point_address =@collection_point_address AND collection_point_name= @collection_point_name AND data_time LIKE @time ORDER BY data_time"
                };
                //获取设备的部件采集点数据（month）
                MySqlCommand sqlcommonth = new MySqlCommand
                {
                    CommandText = "SELECT *,date(data_time) time from ep_collection_data_day  WHERE collection_point_address =@collection_point_address AND collection_point_name= @collection_point_name AND data_time LIKE @time ORDER BY data_time"
                };
                //获取设备的部件采集点数据（day）
                MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@collection_point_address",tblPoint.collection_point_address),
                new MySqlParameter("@time",timetype),
                new MySqlParameter("@collection_point_name",tblPoint.collection_point_name)
            };
                //获取设备的部件采集点数据（month）
                MySqlParameter[] commandParametersmonth = new MySqlParameter[]{
                new MySqlParameter("@collection_point_address",tblPoint.collection_point_address),
                new MySqlParameter("@time",timetype),
                new MySqlParameter("@collection_point_name",tblPoint.collection_point_name)
            };
                try
                {
                    //日的数据
                    if (time.Length == 10)
                    {
                        var pointData = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                        if (pointData != null && pointData.Table.Rows.Count > 0) //有数据
                        {
                            var json = Common.DataTableToJson(pointData.Table); //数据的Json形式
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                            return;
                        }
                        else //没有数据
                        {
                            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
                            return;
                        }
                    }
                    else
                    {
                        //月的数据
                        if (time.Length == 7)
                        {
                            var pointData =
                                MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcommonth.CommandText,
                                    commandParametersmonth).Tables[0].DefaultView;
                            if (pointData != null && pointData.Table.Rows.Count > 0) //有数据
                            {
                                var json = Common.DataTableToJson(pointData.Table); //数据的Json形式
                                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                                return;
                            }
                            else //没有数据
                            {
                                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
                                return;
                            }
                        }
                        //其他的情况
                        else
                        {

                        }
                    }
                }
                catch (Exception e)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                    DLog.w("系统异常:" + e.Message);
                    return;
                }
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未找到采集点"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    //跟据现场的id 查看现场的名称
    [ValidateInput(false)]
    [WebMethod(Description = "GetSceneName")]
    public void GetSceneName(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            //获取设备信息
            MySqlCommand sqlcom = new MySqlCommand
            {
                CommandText = "  SELECT scene_name FROM ep_scene WHERE scene_id = @id"
            };
            MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@id",id)
            };
            try
            {
                var name = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                if (name != null && name.Table.Rows.Count > 0)//
                {
                    var json = Common.DataTableToJson(name.Table);//用户设备的Json形式
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                    return;
                }
                else//用户不存在或已删除
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有该现场"));
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
    //获取柱状图数据
    [ValidateInput(false)]
    [WebMethod(Description = "GetBar")]
    public void GetBar(string tokenId, string point_id, string time1, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        string[] time =time1.Split('$');
        string json = "";
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(point_id);
            if (tblPoint != null)
            {
                //获取采集点地址
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "SELECT DISTINCT collection_point_address FROM ep_equipment_component WHERE equipment_id = @id"
                };

                try
                {
                        DataTable dt = new DataTable();
                        dt.Columns.Add("max_value");
                        dt.Columns.Add("min_value");
                        DataRow dr_new = dt.NewRow();
                        MySqlCommand sqlcom2 = new MySqlCommand
                        {
                            CommandText = "SELECT MAX(VALUE) AS max_val,MIN(VALUE) AS min_val FROM ep_collection_data_hour WHERE collection_point_name = @collection_point_name AND collection_point_address = @collection_point_address AND data_time LIKE @time and value>=0"
                        };
                        for (int i = 0; i < time.Length; i++)
                        {
                            MySqlParameter[] commandParameters2 = new MySqlParameter[]{
                            new MySqlParameter("@time",time[i]),
                            new MySqlParameter("@collection_point_name",tblPoint.collection_point_name),
                            new MySqlParameter("@collection_point_address",tblPoint.collection_point_address)
                        };
                            var pointData2 = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom2.CommandText, commandParameters2).Tables[0].DefaultView;
                            //if (pointData2 != null && pointData.Table.Rows.Count > 0)
                            //{
                            //    dr_new["max_value"] = pointData2.Table.Rows[0]["max(value)"].ToString();
                            //    dr_new["min_value"] = pointData2.Table.Rows[0]["min(value)"].ToString();
                            //}
                            //dt.Rows.Add(dr_new);

                            json += Common.DataTableToJson(pointData2.Table) + '&';//数据的Json形式
                            if (i == time.Length - 1)
                            {
                                json += Common.DataTableToJson(pointData2.Table);//数据的Json形式
                            }
                        }


                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                        return;
                    
                }
                catch (Exception e)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "系统异常"));
                    DLog.w("系统异常:" + e.Message);
                    return;
                }
            }
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }
    /// <summary>
    /// 获取饼状图信息
    /// </summary>
    /// <param name="tokenId"></param>
    /// <param name="id"></param>
    [ValidateInput(false)]
    [WebMethod(Description = "GetPieInfo")]
    public void GetPieInfo(string tokenId, string point_id, string id, string time)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();

        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        string timetype = '%' + time + '%';
        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(point_id);
            if (tblPoint != null)
            {
                //获取设备信息
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "SELECT `ep_equipment_component`.* , `ep_collection_data_hour`.`value`, `ep_collection_data_hour`.`data_time`FROM`ep_equipment_component` LEFT JOIN `ep_collection_data_hour` ON (`ep_equipment_component`.`collection_point_address` = `ep_collection_data_hour`.`collection_point_address`) WHERE ep_collection_data_hour.`collection_point_address` = @collection_point_address and  ep_collection_data_hour.`collection_point_name` = @collection_point_name AND data_time LIKE @time "
                };
                MySqlParameter[] commandParameters = new MySqlParameter[]{
                new MySqlParameter("@collection_point_address",tblPoint.collection_point_address),
                new MySqlParameter("@collection_point_name",tblPoint.collection_point_name),
                new MySqlParameter("@time",timetype)
            };
                try
                {
                    var equipments = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0].DefaultView;
                    if (equipments != null && equipments.Table.Rows.Count > 0)//现场没有设备
                    {
                        var json = Common.DataTableToJson(equipments.Table);//用户设备的Json形式
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                        return;
                    }
                    else//用户不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
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
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "暂无数据"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    /// <summary>
    /// 获取现场的部件的详情
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetComponentStatus")]
    public void GetComponentStatus(string tokenId, string id, string startTime, string endTime)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
            if (tblPoint != null)
            {
                //获取设备信息
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = "SELECT * FROM `ep_equipment_component_status` WHERE equipment_component_id=@id  order by start_time desc"
                };
                MySqlParameter[] commandParameters = new MySqlParameter[]
                {
                    new MySqlParameter("@id", tblPoint.equipment_component_id)
                };
                try
                {
                    string equipment_component_id = tblPoint.equipment_component_id;
                    string dateBegin = Convert.ToDateTime(startTime).ToString("yyyy-MM-dd 00:00:00");
                    string dateEnd = Convert.ToDateTime(endTime).ToString("yyyy-MM-dd 23:59:59");

                    String sqlWhere =
                        "equipment_component_id like @equipment_component_id and ((start_time>@dateBegin and start_time<@dateEnd) or (end_time>@dateBegin and end_time<@dateEnd))";

                    MySqlParameter[] parameters = new MySqlParameter[]
                    {
                        new MySqlParameter("@equipment_component_id", "" + equipment_component_id + ""),
                        new MySqlParameter("@dateBegin", dateBegin),
                        new MySqlParameter("@dateEnd", dateEnd)
                    };
                    //按照sqlwhere条件取得套餐列表
                    DataTable dt = BF<bll_ep_equipment_component_status>.Instance.GetDataTable(10000, 1, sqlWhere,
                        "start_time asc", parameters); //分页

                    if (dt != null && dt.Rows.Count > 0) //有信息
                    {
                        var json = Common.DataTableToJson(dt); //信息的Json形式
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                        return;
                    }
                    else //用户不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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
            else {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到该采集点信息"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    /// <summary>
    /// 获取现场的部件的历史详情
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetComponentHistory")]
    public void GetComponentHistory(string tokenId, string id, string startTime, string endTime, int startNum, int num)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();

        //判断TokenId是否合法
        if (Common.VerifyTokenId(tokenId))
        {
            tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
            if (tblPoint != null)
            {
                try
                {
                    tbl_ep_equipment_component tbl_address = BF<bll_ep_equipment_component>.Instance.GetModel(tblPoint.equipment_component_id);
                    String pointAdress = tbl_address.collection_point_address;
                    String equipmentId = tbl_address.equipment_id;
                    string pointName = tblPoint.collection_point_name;
                    tbl_ep_args_code_scene tblCode = BF<bll_ep_args_code_scene>.Instance.GetTop1ModelByWhere("code='" + pointName + "' and scene_id='" + tbl_address.scene_id + "'");
                    string dateBegin = startTime;
                    string dateEnd = endTime;
                    int currentPageNum = 1;
                    int pageSize = 100;
                    int startNo = 1;
                    startNo = (currentPageNum - 1) * pageSize;
                    //按照sqlwhere条件取得套餐列表
                    string sql = "select * from ep_collection_data_" + pointAdress
                      + " where collection_point_name = '" + pointName
                      + "' and data_time>'" + dateBegin
                      + "' and data_time<'" + dateEnd
                      + "'  ORDER BY data_time asc limit " + startNum + "," + num + "";
                    
                    DataTable dt = SqlHelper.GetDataSet(sql, null).Tables[0];
                    dt.Columns.Add("valueText");
                    dt.Columns.Add("equipStatus");
                    DataTable dt2 = null;
                    for (int i=0;i<dt.Rows.Count;i++)
                    {
                        DataRow item = dt.Rows[i];
                        string status = "";
                        switch (tblCode.type)
                        {
                            case "运行":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "运行";
                                }
                                else
                                {
                                    status = "停止";
                                }
                                break;
                            case "监管":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "需监管";
                                }
                                else
                                {
                                    status = "正常";
                                }
                                break;
                            case "故障":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "故障";
                                }
                                else
                                {
                                    status = "正常";
                                }
                                break;
                            case "反馈":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "反馈信号";
                                }
                                else
                                {
                                    status = "无";
                                }
                                break;
                            case "复合开关-开":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "开到位";
                                }
                                else
                                {
                                    status = "未开到位";
                                }
                                break;
                            case "复合开关-关":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "关到位";
                                }
                                else
                                {
                                    status = "未关到位";
                                }
                                break;
                            case "高料位":
                                if (Convert.ToDouble(item["value"].ToString()) == 1)
                                {
                                    status = "报警";
                                }
                                else
                                {
                                    status = "正常";
                                }
                                break;
                            case "模拟值":
                                status = item["value"].ToString();
                                break;
                            default:
                                status = item["value"].ToString();
                                break;
                        }
                        dt.Rows[i]["valueText"] = status;
                        string equipStatus = "";
                        if (dt2 == null)
                        {
                            string sqlWhere2 = "(component_name='锅炉' or component_name like '脱硫塔%') and equipment_id='" + tbl_address.equipment_id + "'  and start_time<'" + Convert.ToDateTime(item["data_time"].ToString()).ToString("yyyy-MM-dd HH:mm:ss") + "'";

                            dt2 = BF<bll_ep_equipment_component_status>.Instance.GetDataTable(1, 1, sqlWhere2,
                                "start_time desc", null);
                            if (dt2 != null && dt2.Rows.Count > 0)
                            {
                                equipStatus = dt2.Rows[0]["equipment_component_status"].ToString();
                            }
                        }
                        else
                        {
                            if (dt2 != null && dt2.Rows.Count > 0)
                            {
                                if (Convert.ToDateTime(dt2.Rows[0]["start_time"].ToString()) > Convert.ToDateTime(item["data_time"].ToString()))
                                {
                                    string sqlWhere2 = "(component_name='锅炉' or component_name like '脱硫塔%') and equipment_id='" + tbl_address.equipment_id + "'  and start_time<'" + Convert.ToDateTime(item["data_time"].ToString()).ToString("yyyy-MM-dd HH:mm:ss") + "'";

                                    dt2 = BF<bll_ep_equipment_component_status>.Instance.GetDataTable(1, 1, sqlWhere2,
                                        "start_time desc", null);
                                    if (dt2 != null && dt2.Rows.Count > 0)
                                    {
                                        equipStatus = dt2.Rows[0]["equipment_component_status"].ToString();
                                    }

                                }
                                else
                                {
                                    equipStatus = dt2.Rows[0]["equipment_component_status"].ToString();
                                }
                            }
                        }
                        if (equipStatus == "")
                        {
                            if (double.Parse(item["value"].ToString()) == 0)
                            {
                                equipStatus = "停炉";
                            }
                            else
                            {
                                equipStatus = "启炉";
                            }
                        }
                        dt.Rows[i]["equipStatus"] = equipStatus;
                    }

                    if (dt != null && dt.Rows.Count > 0) //有信息
                    {
                        var json = Common.DataTableToJson(dt); //信息的Json形式

                        string sqlmax = "select max(value) max_value,min(value) min_value from ep_collection_data_" + pointAdress
                          + " where collection_point_name = '" + pointName
                          + "' and data_time>'" + dateBegin
                          + "' and data_time<'" + dateEnd
                          + "'";

                        DataTable dtmax = SqlHelper.GetDataSet(sqlmax, null).Tables[0];
                        string json2 = "&";
                        if (dtmax.Rows.Count > 0 && dtmax.Rows[0][0].ToString() != "")
                        {
                            if (Convert.ToDouble(dtmax.Rows[0]["max_value"].ToString()) == Convert.ToDouble(dtmax.Rows[0]["min_value"].ToString()))
                            {
                                if (Convert.ToDouble(dtmax.Rows[0]["max_value"].ToString()) == 0) 
                                {
                                    json2 = "&[{\"status\":0}]";
                                }
                                else if (Convert.ToDouble(dtmax.Rows[0]["max_value"].ToString()) > 0)
                                {
                                    json2 = "&[{\"status\":1,\"max_value\":" + dtmax.Rows[0]["max_value"].ToString() + ",\"min_value\":0}]";
                                }
                                else
                                {
                                    json2 = "&[{\"status\":1,\"max_value\":0,\"min_value\":" + dtmax.Rows[0]["min_value"].ToString() + "}]";
                                }
                            }
                            else 
                            {
                                json2 = "&[{\"status\":1,\"max_value\":" + dtmax.Rows[0]["max_value"].ToString() + ",\"min_value\":" + dtmax.Rows[0]["min_value"].ToString() + "}]";
                            }
                        }
                        else
                        {
                            json2 = "&[{\"status\":0}]";
                        }
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json+json2));
                        return;
                    }
                    else //用户不存在或已删除
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "没有信息"));
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
            else
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到该采集点信息"));
                return;
            }
        }
        else//TokenId过期
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
            return;
        }
    }

    /// <summary>
    /// 发送控制指令
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "SetComponentStatus2")]
    public void SetComponentStatus2(string mn,string polid,string sw,string val)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //string mess = "QN=20170907010101001;ST=32;CN=3032;PW=123456;MN=88888881234567;Flag=1;CP=&&PolId=301;SW=01;Val=1.00&&";
            string mess = "QN="+DateTime.Now.ToString("yyyyMMddHHmmssfff")+";ST=32;CN=3032;PW=123456;MN=" + mn + ";Flag=1;CP=&&PolId=" + polid + ";SW=" + sw + ";Val=" + val + "&&";
            int len = mess.Length;
            string code = CRC.getCrc16Code(mess);
            string msg = "##" + len.ToString().PadLeft(4, '0') + mess + code + "**\r\n";
            IPAddress ip = IPAddress.Parse("127.0.0.1");
            TcpClient client = new TcpClient();
            client.Connect(ip, 5008);//5008端口号，必须与服务端给定的端口号一致，否则天堂无门
            NetworkStream dataStream=client.GetStream();
            byte[] buffer=Encoding.Default.GetBytes(msg);
            dataStream.Write(buffer, 0, buffer.Length);//发送数据
            client.Close();//断开连接
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, "发送成功"));
            return;
        }
        catch (Exception ex) 
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:"+ex.Message));
            return;
        }
    }

    /// <summary>
    /// 发送控制指令
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "SetComponentStatus")]
    public void SetComponentStatus(string tokenId, string loginName, string password, string id, string type, string val)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //判断TokenId是否合法
            if (Common.VerifyTokenId(tokenId))
            {
                string typeName = "";
                tbl_sys_employee tblUser = BF<bll_sys_employee>.Instance.GetTop1ModelByWhere("binary user_login = '"+loginName+"' and user_pwd_control='"+password+"' and emp_isdeleted=0");
                if (tblUser == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "控制密码错误"));
                    return;
                }
                tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
                if (tblPoint == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                tbl_ep_equipment_component_point tblPointControl = null;
                if (type == "1")
                {
                    val = "1.00";
                    typeName = "控制启动";
                    tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control=1 and collection_point_type='控制启动' and equipment_component_id='" + tblPoint.equipment_component_id + "'");
                }
                else if (type == "2")
                {
                    val="1.00";
                    typeName = "控制停止";
                    tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control=1 and collection_point_type='控制停止' and equipment_component_id='" + tblPoint.equipment_component_id + "'");
                }
                else if (type == "3")
                {
                    val = val.Trim();
                    double value = 0;
                    bool trystatus = double.TryParse(val,out value);
                    if (!trystatus) {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "给定频率的值不正确"));
                        return;
                    }
                    val = value.ToString();
                    typeName = "控制数值";
                    tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control=1 and collection_point_type='控制数值' and equipment_component_id='" + tblPoint.equipment_component_id + "'");
                }
                if (tblPointControl == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                if (!tblPointControl.collection_point_address.Contains("_") || tblPointControl.collection_point_name == "")
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点地址信息"));
                    return;
                }
                string QN = DateTime.Now.ToString("yyyyMMddHHmmssfff");

                tbl_ep_reversecontrol tblRever = new tbl_ep_reversecontrol();
                tblRever.reversecontrol_id = Guid.NewGuid().ToString();
                tblRever.equipment_component_id = tblPointControl.equipment_component_id;
                tblRever.equipment_component_point_id = tblPointControl.equipment_component_point_id;
                tblRever.user_login = loginName;
                tblRever.emp_name = tblUser.emp_name;
                tblRever.rcl_qn = QN;
                tblRever.send_date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                tblRever.type = typeName;
                tblRever.value = val;
                tblRever.component_name = tblPointControl.component_name;
                BF<bll_ep_reversecontrol>.Instance.Add(tblRever);
                //tbl_ep_reversecontrol_log tbllog = new tbl_ep_reversecontrol_log();
                //tbllog.rcl_qn = QN;
                //tbllog.rcl_status = "1";
                //tbllog.rcl_id = Guid.NewGuid().ToString();
                //tbllog.rcl_mnnum = "yyjyxmfcs_01";
                //tbllog.rcl_cn = "3032";
                //tbllog.rcl_inputtime = DateTime.Now;
                //BF<bll_ep_reversecontrol_log>.Instance.Add(tbllog);

                string mn = tblPointControl.collection_point_address.Split('_')[0];
                string sw = tblPointControl.collection_point_address.Split('_')[1];
                string polid = tblPointControl.collection_point_name;
                ////string mess = "QN=20170907010101001;ST=32;CN=3032;PW=123456;MN=88888881234567;Flag=1;CP=&&PolId=301;SW=01;Val=1.00&&";
                string mess = "QN=" + QN + ";ST=32;CN=3032;PW=123456;MN=" + mn + ";Flag=1;CP=&&PolId=" + polid + ";SW=" + sw + ";Val=" + val + "&&";
                int len = mess.Length;
                string code = CRC.getCrc16Code(mess);
                string msg = "##" + len.ToString().PadLeft(4, '0') + mess + code + "**\r\n";
                IPAddress ip = IPAddress.Parse("127.0.0.1");
                TcpClient client = new TcpClient();
                client.Connect(ip, 5008);//5008端口号，必须与服务端给定的端口号一致，否则天堂无门
                NetworkStream dataStream = client.GetStream();
                byte[] buffer = Encoding.Default.GetBytes(msg);
                dataStream.Write(buffer, 0, buffer.Length);//发送数据
                client.Close();//断开连接
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, QN));
                return;
            }
            else//TokenId过期
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
                return;
            }
        }
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:" + ex.Message));
            return;
        }
    }

    /// <summary>
    /// 获取频率
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetPinLvFanKui")]
    public void GetPinLvFanKui(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //判断TokenId是否合法
            if (Common.VerifyTokenId(tokenId))
            {
                tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
                if (tblPoint == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                tbl_ep_equipment_component_point tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control!=1 and collection_point_type like '模拟值' and collection_point_description like '%频率反馈%' and equipment_component_id='" + tblPoint.equipment_component_id + "'");

                if (tblPointControl == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                if (tblPointControl.newest_data_time == null || tblPointControl.newest_data_time.Value.AddMinutes(15) < DateTime.Now) 
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到最新数值"));
                    return;
                }

                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, tblPointControl.newest_value.ToString()));
                return;
            }
            else//TokenId过期
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
                return;
            }
        }
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:" + ex.Message));
            return;
        }
    }
    /// <summary>
    /// 获取开到位和关到位
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetOpenStatus")]
    public void GetOpenStatus(string tokenId, string id)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //判断TokenId是否合法
            if (Common.VerifyTokenId(tokenId))
            {
                tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
                if (tblPoint == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                tbl_ep_equipment_component_point tblPointControl = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control!=1 and collection_point_type like '运行' and equipment_component_id='" + tblPoint.equipment_component_id + "'");
                if (tblPointControl == null )
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到反馈采集点信息"));
                    return;
                }
                if (tblPointControl.newest_data_time == null || tblPointControl.newest_data_time.Value.AddMinutes(15) < DateTime.Now)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到最新数值"));
                    return;
                }
                string guzhang = "0";
                tbl_ep_equipment_component_point tblPointControl2 = BF<bll_ep_equipment_component_point>.Instance.GetTop1ModelByWhere("point_isdeleted=0 and is_control!=1 and collection_point_type like '故障' and equipment_component_id='" + tblPoint.equipment_component_id + "'");
                if (tblPointControl2 != null&&tblPointControl2.newest_data_time != null && tblPointControl2.newest_data_time.Value.AddMinutes(15) > DateTime.Now)
                {
                    guzhang = tblPointControl2.newest_value.ToString();
                }
                var json = "[{\"open_status\":\"" + tblPointControl.newest_value.ToString() + "\",\"close_status\":\"" + guzhang + "\"}]"; ; //用户信息的Json形式
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else//TokenId过期
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
                return;
            }
        }
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:" + ex.Message));
            return;
        }
    }
    /// <summary>
    /// 获取控制指令状态
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetReverseControlStatus")]
    public void GetReverseControlStatus(string tokenId, string qn)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //判断TokenId是否合法
            if (Common.VerifyTokenId(tokenId))
            {
                tbl_ep_reversecontrol_log tblLog = BF<bll_ep_reversecontrol_log>.Instance.GetTop1ModelByWhere("rcl_qn='" + qn + "'");
                if (tblLog == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到状态信息"));
                    return;
                }
                var json = "[{\"status_msg\":\""; //用户信息的Json形式
                if (tblLog.rcl_status == "1")
                {
                    json += "请求失败";
                    json += "\",\"is_last\":\"1";//是最终status
                }
                else if (tblLog.rcl_status == "2")
                {
                    json += "成功发送等待反馈";
                    json += "\",\"is_last\":\"0";//不是最终status
                }
                else if (tblLog.rcl_status == "3")
                {
                    tbl_ep_reversecontrol_result tblResult = BF<bll_ep_reversecontrol_result>.Instance.GetTop1ModelByWhere("rcr_cn='9011' and rcr_qn='" + qn + "'");

                    if (tblResult == null)
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到9011状态信息"));
                        return;
                    }
                    switch (tblResult.rcr_status)
                    {
                        case "1":
                            json += "准备执行请求";
                            json += "\",\"is_last\":\"0";//不是最终status
                            break;
                        case "2":
                            json += "请求被拒绝";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "3":
                            json += "PW错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "4":
                            json += "MN错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "5":
                            json += "ST错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "6":
                            json += "Flag错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "7":
                            json += "QN错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "8":
                            json += "CN错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "9":
                            json += "CRC校验错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        case "100":
                            json += "未知错误";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                        default:
                            json += "状态未知";
                            json += "\",\"is_last\":\"1";//是最终status
                            break;
                    }
                }
                else if (tblLog.rcl_status == "4")
                {
                    tbl_ep_reversecontrol_result tblResult = BF<bll_ep_reversecontrol_result>.Instance.GetTop1ModelByWhere("rcr_cn='9012' and rcr_qn='" + qn + "'");
                    if (tblResult == null)
                    {
                        HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到9012状态信息"));
                        return;
                    }
                    switch (tblResult.rcr_status)
                    {
                        case "1":
                            json += "执行成功";
                            break;
                        case "2":
                            json += "执行失败，但不知道原因";
                            break;
                        case "3":
                            json += "命令请求条件错误";
                            break;
                        case "4":
                            json += "通讯超时";
                            break;
                        case "5":
                            json += "系统繁忙不能执行";
                            break;
                        case "6":
                            json += "系统故障";
                            break;
                        case "100":
                            json += "没有数据";
                            break;
                        default:
                            json += "状态未知";
                            break;
                    }
                    json += "\",\"is_last\":\"1";//是最终status
                }

                json += "\"}]";
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(1, json));
                return;
            }
            else//TokenId过期
            {
                HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "TokenId过期"));
                return;
            }
        }
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:" + ex.Message));
            return;
        }
    }

    /// <summary>
    /// 获取控制指令状态
    /// </summary>
    [ValidateInput(false)]
    [WebMethod(Description = "GetReverseControlHistory")]
    public void GetReverseControlHistory(string tokenId, string id, int startNum, int num, string startDate, string endDate)
    {
        HttpContext.Current.Response.ContentType = "application/json;charset=utf-8";
        Dugufeixue.Common.SystemConfig.ConnectionStringKey = System.Configuration.ConfigurationManager.ConnectionStrings["ConnStringDes"].ToString();
        var jsonCallBackFunName = HttpContext.Current.Request.Params["jsoncallback"].ToString();
        try
        {
            //判断TokenId是否合法
            if (Common.VerifyTokenId(tokenId))
            {
                tbl_ep_equipment_component_point tblPoint = BF<bll_ep_equipment_component_point>.Instance.GetModel(id);
                if (tblPoint == null)
                {
                    HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "未取到采集点信息"));
                    return;
                }
                string CommandText = "SELECT A.*,B.scene_name,B.equipment_name  " +
                              "FROM  ep_reversecontrol A left join  ep_equipment_component B on A.equipment_component_id=B.equipment_component_id " +
                              "WHERE A.equipment_component_id like @equipment_component_id " +
                              "AND date(send_date)>=@startDate " +
                              "AND date(send_date)<=@endDate ";
                CommandText += " order by send_date desc " +
                                  "LIMIT @startNum,@num";
                MySqlCommand sqlcom = new MySqlCommand
                {
                    CommandText = CommandText
                };
                MySqlParameter[] commandParameters = new MySqlParameter[]{
                    new MySqlParameter("@equipment_component_id",tblPoint.equipment_component_id),
                    new MySqlParameter("@startNum",startNum),
                    new MySqlParameter("@num",num),
                    new MySqlParameter("@startDate",Convert.ToDateTime(startDate).ToString("yyyy-MM-dd 00:00:00")),
                    new MySqlParameter("@endDate",Convert.ToDateTime(endDate).ToString("yyyy-MM-dd 23:59:59"))
                };
                try
                {
                    var titleInfo = MySqlHelper.GetDataSet(MySqlHelper.Conn, CommandType.Text, sqlcom.CommandText, commandParameters).Tables[0];
                    if (titleInfo != null && titleInfo.Rows.Count >= 1) //信息存在
                    {
                        titleInfo.Columns.Add("status");
                        for (int i = 0; i < titleInfo.Rows.Count;i++ )
                        {
                            string equipStatus = "";
                            tbl_ep_reversecontrol_log tblLog = BF<bll_ep_reversecontrol_log>.Instance.GetTop1ModelByWhere("rcl_qn='" + titleInfo.Rows[i]["rcl_qn"].ToString() + "'");
                            if (tblLog == null)
                            {
                                equipStatus = "未取到状态信息";
                            }
                            else
                            {
                                if (tblLog.rcl_status == "1")
                                {
                                    equipStatus = "请求失败";
                                }
                                else if (tblLog.rcl_status == "2")
                                {
                                    equipStatus = "成功发送等待反馈";
                                }
                                else if (tblLog.rcl_status == "3")
                                {
                                    tbl_ep_reversecontrol_result tblResult = BF<bll_ep_reversecontrol_result>.Instance.GetTop1ModelByWhere("rcr_cn='9011' and rcr_qn='" + titleInfo.Rows[i]["rcl_qn"].ToString() + "'");

                                    if (tblResult == null)
                                    {
                                        equipStatus = "未取到9011状态信息";
                                    }
                                    else
                                    {
                                        switch (tblResult.rcr_status)
                                        {
                                            case "1":
                                                equipStatus = "准备执行请求";
                                                break;
                                            case "2":
                                                equipStatus = "请求被拒绝";
                                                break;
                                            case "3":
                                                equipStatus = "PW错误";
                                                break;
                                            case "4":
                                                equipStatus = "MN错误";
                                                break;
                                            case "5":
                                                equipStatus = "ST错误";
                                                break;
                                            case "6":
                                                equipStatus = equipStatus = "Flag错误";
                                                break;
                                            case "7":
                                                equipStatus = "QN错误";
                                                break;
                                            case "8":
                                                equipStatus = "CN错误";
                                                break;
                                            case "9":
                                                equipStatus = "CRC校验错误";
                                                break;
                                            case "100":
                                                equipStatus = "未知错误";
                                                break;
                                            default:
                                                equipStatus = "状态未知";
                                                break;
                                        }
                                    }
                                }
                                else if (tblLog.rcl_status == "4")
                                {
                                    tbl_ep_reversecontrol_result tblResult = BF<bll_ep_reversecontrol_result>.Instance.GetTop1ModelByWhere("rcr_cn='9012' and rcr_qn='" + titleInfo.Rows[i]["rcl_qn"].ToString() + "'");
                                    if (tblResult == null)
                                    {
                                        equipStatus = "未取到9012状态信息";
                                    }
                                    else
                                    {
                                        switch (tblResult.rcr_status)
                                        {
                                            case "1":
                                                equipStatus = "执行成功";
                                                break;
                                            case "2":
                                                equipStatus = "执行失败，但不知道原因";
                                                break;
                                            case "3":
                                                equipStatus = "命令请求条件错误";
                                                break;
                                            case "4":
                                                equipStatus = "通讯超时";
                                                break;
                                            case "5":
                                                equipStatus = "系统繁忙不能执行";
                                                break;
                                            case "6":
                                                equipStatus = "系统故障";
                                                break;
                                            case "100":
                                                equipStatus = "没有数据";
                                                break;
                                            default:
                                                equipStatus = "状态未知";
                                                break;
                                        }
                                    }
                                }
                            }
                            titleInfo.Rows[i]["status"]=equipStatus;
                        }
                        var json = Common.DataTableToJson(titleInfo); //信息的Json形式
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
        catch (Exception ex)
        {
            HttpContext.Current.Response.Write(jsonCallBackFunName + Common.GetResultJson(0, "错误:" + ex.Message));
            return;
        }
    }
}