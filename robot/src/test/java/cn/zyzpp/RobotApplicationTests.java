package cn.zyzpp;

import cn.zyzpp.entity.test.NameHref;
import cn.zyzpp.repository.medical.MedicalRepository;
import cn.zyzpp.repository.medical.MsymptomRepository;
import cn.zyzpp.repository.test.NameHrefRepository;
import cn.zyzpp.util.ProjectPath;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;


@RunWith(SpringRunner.class)
@SpringBootTest
public class RobotApplicationTests {
    final Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private NameHrefRepository nameHrefRepository;
    @Autowired
    private MedicalRepository medicalRepository;
    @Autowired
    private MsymptomRepository msymptomRepository;

    @Test
    public void test() throws IOException{
        logger.info("开始");
        int bufferSize = 1 * 1024 * 1024;//设读取文件的缓存为3MB
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(
                    new File(ProjectPath.getRootPath("word_link.txt")))),bufferSize);
        String name = bufferedReader.readLine();
        String href = bufferedReader.readLine();
        logger.info("name: "+name+" href:"+href);
        int i = 1;
        while (name!=null&&href!=null){
            logger.info("第"+i+++"对"+"name: "+name+" href:"+href);
            if(i<=5888688){
                continue;
            }
            if (medicalRepository.existsMedicalByName(name)||msymptomRepository.existsMsymptomByName(name)||nameHrefRepository.existsByName(name)){
                logger.error("exists: "+ name +href);
                name = bufferedReader.readLine();
                href = bufferedReader.readLine();
                continue;
            }
            try {
                nameHrefRepository.save(new NameHref(name, href));
            } catch (Exception e) {
                logger.error("save faild "+ name +href);
            }
            name = bufferedReader.readLine();
            href = bufferedReader.readLine();
        }
        bufferedReader.close();
    }

}
