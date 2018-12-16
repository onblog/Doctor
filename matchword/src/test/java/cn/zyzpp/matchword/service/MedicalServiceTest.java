package cn.zyzpp.matchword.service;

import cn.zyzpp.matchword.entity.Medical;
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
public class MedicalServiceTest {
    Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    MedicalService medicalService;

    @Test
    public void deleteAll() {
        logger.info(medicalService.count()+"");
        medicalService.deleteAll();
        logger.info(medicalService.count()+"");
    }
    @Test
    public void findListByName() {
        List<Medical> like = medicalService.findAllByPartLike("胸部");
        logger.info(like.toString());
    }
}