using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

/// <summary>
/// DFile 的摘要说明
/// </summary>
public class DFile
{
	public DFile()
	{
		//
		// TODO: 在此处添加构造函数逻辑
		//
	}

    private string _FilePath;
    /// &lt;summary&gt;
    /// 写文件或读文件的地址
    /// &lt;/summary&gt;
    public string FilePath
    {
        get { return _FilePath; }
        set { _FilePath = value; }
    }

    private string _InfoString;
    /// &lt;summary&gt;
    /// 读取或写入文件的信息
    /// &lt;/summary&gt;
    public string InfoString
    {
        get { return _InfoString; }
        set { _InfoString = value; }
    }

    private string _CharSet;
    /// &lt;summary&gt;
    /// 设置读写的编码，默认为GB2312
    /// &lt;/summary&gt;
    public string CharSet
    {
        get { return _CharSet; }
        set { _CharSet = value; }
    }

    private bool _IsReadWrite;
    /// &lt;summary&gt;
    /// 设置读还是写，读：true;写false
    /// &lt;/summary&gt;
    public bool IsReadWrite
    {
        get { return _IsReadWrite; }
        set { _IsReadWrite = value; }
    }

    private string _ErrorString;
    /// &lt;summary&gt;
    /// 读或写失败的原因
    /// &lt;/summary&gt;
    public string ErrorString
    {
        get { return _ErrorString; }
        set { _ErrorString = value; }
    }


    public bool ReadWriteFile()
    {
        if (IsReadWrite == true)
        {
            //读文件的方法
            return ReadFile();
        }
        else
        {

            //写文件的方法
            return WriteFile();
        }
    }

    public DFile(String filePath,String InfoString)
    {
        this._FilePath = filePath;
        this._InfoString = InfoString;
        this._CharSet = "GB2312";
    }

    private bool WriteFile()
    {
        FileInfo FInfo = new FileInfo(_FilePath);

        //判断文件是否存在
        if (FInfo.Exists == false)
        {
            try
            {
                //文件目录不存在时，创建文件目录
                if (Directory.Exists(FInfo.DirectoryName) == false)
                {
                    DirectoryInfo DI = new DirectoryInfo(FInfo.DirectoryName);
                    DI.Create();
                }

                File.WriteAllText(_FilePath, _InfoString + "\r\n", Encoding.GetEncoding(_CharSet));
            }
            catch (IOException e)
            {

                _ErrorString = "写入文件时,发生异常:" + _FilePath;
                return false;
            }
            return true;
        }
        else
        {
            //文件已存在时，删除文件，并再次调用本方法
            try
            {
                File.AppendAllText(_FilePath, _InfoString + "\r\n", Encoding.GetEncoding(_CharSet));
            }
            catch (IOException e)
            {
                _ErrorString = "写入文件时,文件已存在,删除时发生异常:" + _FilePath;
                return false;
            }
            return true;

        }
    }

    /// &lt;summary&gt;
    /// 读取文件的方法，成功返回true
    /// &lt;/summary&gt;
    /// &lt;returns&gt;&lt;/returns&gt;
    public bool ReadFile()
        {
            FileInfo FInfo = new FileInfo(_FilePath);

            //判断文件是否存在
            if (FInfo.Exists == true)
            {
                //文件大小为0时不读取
                if (FInfo.Length > 1)
                {
                    //字符编码未设置时，默认为GB2312    
                    if (_CharSet == null)
                    {
                        _CharSet = "GB2312";
                    }
                    FileStream FStream = new FileStream(_FilePath, FileMode.Open, FileAccess.Read, FileShare.Read);

                    byte[] data = new byte[FStream.Length];

                    //读取字符开始的位置
                    int OffSet = 0;

                    //读取的长度
                    int remaining = data.Length;

                    while (remaining> 0)
                    {
                        int ReadCount = FStream.Read(data, OffSet, Convert.ToInt32(FStream.Length));

                        if (ReadCount <= 0)
                        {
                            _ErrorString = "文件读取到" + ReadCount.ToString() + "失败！";
                            return false;
                        }
                        else
                        {
                            //减少剩余未读取的字节数量
                            remaining -= ReadCount;
                            //增加剩余字节开始位置
                            OffSet += ReadCount;
                        }
                    }

                    //将二进制字节数组转换为字符串
                    _InfoString = System.Text.Encoding.GetEncoding(_CharSet).GetString(data);
                    return true;


                }
                else
                {
                    _ErrorString = string.Format("文件为空,地址为：{0}", _FilePath); ;
                    return false;
                }
            }
            else
            {
                _ErrorString = string.Format("未找到地址为：{0}的文件", _FilePath); ;
                return false;
            }
        }

}