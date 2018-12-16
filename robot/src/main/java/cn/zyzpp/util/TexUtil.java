package cn.zyzpp.util;

import java.io.*;
import java.nio.charset.Charset;

/**
 * Create by yster@foxmail.com 2018/7/13/013 19:46
 */
public class TexUtil {

    /**
     * Writer 字符
     * @param text
     * @throws IOException
     */
    public static void write(String text,String path) throws IOException {
        BufferedWriter bufferedWriter = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(new File(path),true),Charset.forName("UTF-8")));
        bufferedWriter.write(text);
        bufferedWriter.flush();
        bufferedWriter.close();
    }

    public static BufferedReader read(String path) throws FileNotFoundException {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(new File(path))));
        return bufferedReader;
    }

}
