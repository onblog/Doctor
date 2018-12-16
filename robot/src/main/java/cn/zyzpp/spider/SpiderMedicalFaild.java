package cn.zyzpp.spider;

import cn.zyzpp.util.ProjectPath;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;

/**
 * 与 SpiderMedicalService相辅相成
 * 爬取Txt文件的症状详情
 * Create by yster@foxmail.com 2018/7/26/026 14:07
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpiderMedicalFaild extends AbstractSpiderServer{
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Test
    public void getFileContent() throws Exception {
        //缓冲字符输入流-》字符输入流-》文件字节流-》文件
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(
                new FileInputStream(new File(ProjectPath.getRootPath("faild.txt")))));
        String line = bufferedReader.readLine();
        while (line!=null){
            String[] nh = line.split("\\|");
            //getManege(nh[0], nh[1]);
            line = bufferedReader.readLine();
        }
        logger.info("爬取完成");
    }

}
