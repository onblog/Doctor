package cn.zyzpp.word;

import cn.zyzpp.util.ProjectPath;
import org.junit.Test;

import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 数据清洗
 * 1.提取中文关键词
 * 2.一词一行
 * Create by yster@foxmail.com 2018/6/18/018 16:04
 */
public class DataClean {
    String old_path = ProjectPath.getRootPath("src/main/resources/搜狗症状词库-未清洗.txt");
    String new_path = ProjectPath.getRootPath("src/main/resources/搜狗症状词库.txt");

    @Test
    public void clean() throws IOException {
        //读取文件到缓冲流
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(new File(old_path))));
        //从缓冲区按字读
        StringBuffer stringBuffer = new StringBuffer();
        int l = bufferedReader.read();
        //布尔值标识是否是第一个中文
        boolean flag = true;
        while (l >= 0){
            String line = ((char)l)+"";
            //若有字符，则进行处理
            Pattern p = Pattern.compile("[\u4e00-\u9fa5]");
            Matcher m = p.matcher(line);
            //发现中文
            if (m.find()){
                if (flag){
                    stringBuffer.append("\n");
                    flag = false;
                }
                stringBuffer.append(line);
                System.out.println(line);
            }else{
                flag = true;
            }
            //继续读取下一行
            l = bufferedReader.read();
        }
        bufferedReader.close();
        BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(new_path))));
        bufferedWriter.write(stringBuffer.toString().replaceAll("\n","\r\n").replaceFirst("\r\n",""));
        bufferedWriter.flush();
        bufferedWriter.close();
        System.out.println("数据清洗完成");
    }
}
