package cn.zyzpp.spider;

import cn.zyzpp.entity.disease.Department;
import cn.zyzpp.entity.disease.Disease;
import cn.zyzpp.entity.disease.Propertiy;
import cn.zyzpp.repository.disease.DepartmentDao;
import cn.zyzpp.repository.disease.DiseaseDao;
import cn.zyzpp.repository.disease.PropertiyDao;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

/**
 * Create by yster@foxmail.com 2018/6/2/002 15:56
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpiderTest {
    private final Logger logger = LoggerFactory.getLogger(getClass().getName());
    @Autowired
    private DepartmentDao departmentService;
    @Autowired
    private DiseaseDao diseaseService;
    @Autowired
    private PropertiyDao propertiyService;

    /**
     * 单线程爬虫（建议同时启动多个项目，起到多线程的效果）
     */
    @Test
    public void oneTest(){
        long start = System.currentTimeMillis();
        SpiderService spiderService = new SpiderService();
        for (int i=0;i<36; i++) {
            Department department = spiderService.queryAllDepar(i);
            if (department == null){
                break;
            }
            for (Disease disease : department.getDiseases()) {//疾病
                for (Propertiy propertiy : disease.getPropertiys()) {//属性
                    propertiyService.save(propertiy);
                }
                diseaseService.save(disease);
            }
            departmentService.save(department);
        }
        long end = System.currentTimeMillis();
        logger.info("共耗时："+(end-start)/1000/60+"分钟");
    }


}
