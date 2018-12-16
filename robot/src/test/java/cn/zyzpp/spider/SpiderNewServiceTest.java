package cn.zyzpp.spider;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.repository.medical.MedicalRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class SpiderNewServiceTest {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    MedicalRepository medicalRepository;
    /**
     * 58
     */
    int MAX = SpiderMedicalService.size;

    /**
     * 多进程
     */
    @Test
    public void test(){
        int[] i1 = {0,10};
        int[] i2 = {10,20};
        int[] i3 = {20,30};
        int[] i4 = {30,40};
        int[] i5 = {40,50};//--
        int[] i6 = {50,MAX};//--
        int[] i = i3;
        SpiderMedicalService spiderNewService = new SpiderMedicalService();
        for (;i[0]<i[1];i[0]++) {
            if (i[0]==45){
                continue;
            }
            List<Medical> medicalList = spiderNewService.getIndex(i[0]);
            if (medicalList==null||medicalList.size()<1) {
                logger.warn(i[0]+"科室没有疾病");
                continue;
            }
            logger.info(i[0]+"开始保存,数量"+medicalList.size());
            saveData(medicalList);
            logger.info(i[0]+"完成保存,数量"+medicalList.size());
        }
    }

    /**
     * 保存到数据库
     * @param medicalList
     */
    public void saveData(List<Medical> medicalList) {
        for (Medical medical : medicalList) {
            if (medical==null||medical.getSymptom()==null){
                return;
            }
            try {
                medicalRepository.save(medical); //保存疾病
                logger.info("保存到数据库："+medical.getName());
            } catch (Exception e) {
                //e.printStackTrace();
                logger.info("保存到数据库异常"+e.getMessage());
            }
        }
    }

}