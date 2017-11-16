using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

/// <summary>
/// CRC 的摘要说明
/// </summary>
public class CRC
{
    public static String getCrc16Code(String crcString)
    {
        String cRC_Result = crc161(Encoding.Default.GetBytes(crcString));

        return cRC_Result;
    }
    public static String crc161(byte[] data)
    {
        int crc = 0xffff;
        int dxs = 0xa001;
        int hibyte;
        int sbit;
        for (int i = 0; i < data.Length; i++)
        {
            hibyte = crc >> 8;
            crc = hibyte ^ data[i];
            for (int j = 0; j < 8; j++)
            {
                sbit = crc & 0x0001;
                crc = crc >> 1;
                if (sbit == 1)
                    crc ^= dxs;
            }
        }

        return bytesToHexString(new byte[] {
                (byte) ((crc & 0xff00) >> 8), (byte) (crc & 0xff) });

    }

    //将字节数组按16进制输出
    public static String bytesToHexString(byte[] src)
    {
        StringBuilder stringBuilder = new StringBuilder("");
        if (src == null || src.Length <= 0)
        {
            return null;
        }
        for (int i = 0; i < src.Length; i++)
        {
            int v = src[i] & 0xFF;
            String hv = Convert.ToString(v, 16);

            if (hv.Length < 2)
            {
                stringBuilder.Append(0);
            }
            stringBuilder.Append(hv);
        }
        return stringBuilder.ToString().ToUpper();
    }

}

