using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


    /// <summary>
    /// 本类用于生成验证码字符串
    /// </summary>
    public class MakeCodeString
    {
        private static Random rnd = new Random();
        /// <summary>
        /// 生成纯数字的验证码
        /// </summary>
        /// <param name="codelength">获取验证码的位数</param>
        /// <returns></returns>
        public static string MakeCodeNum(int codelength)
        {
            char[] character = { '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' };
            string chkCode = "";

            //生成验证码字符串 
            for (int i = 0; i < codelength; i++)
            {
                int rnum = rnd.Next(1000) % character.Length;
                chkCode += character[rnd.Next(rnum)];
            }
            return chkCode;
        }
        public static string MakeCodeNum2(int codelength)
        {
            string random = "";
            for (int j = 0; j < codelength; j++)
            {
                random += "9";
            }
            int ranNum = Convert.ToInt32(random);
            string chkCode = rnd.Next(ranNum).ToString();
            return chkCode;

        }
        /// <summary>
        /// 生成字母数字组合的验证码
        /// </summary>
        /// <param name="codelength">获取验证码的位数</param>
        /// <returns></returns>
        public static string MakeCodeStr(int codelength)
        {
            string chkCode = "";
            char[] character =
            {
                '2', '3', '4', '5', '6', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W', 'X', 'Y',
                'a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','w','x','y'
            };
            //生成验证码字符串 
            for (int i = 0; i < codelength; i++)
            {
                int rnum = rnd.Next(10000) % character.Length;
                chkCode += character[rnd.Next(rnum)];
            }
            return chkCode;
        }
    }
