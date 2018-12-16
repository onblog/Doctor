package cn.zyzpp.repository.medical.node;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.entity.medical.Msymptom;
import cn.zyzpp.entity.nodes.BotNode;
import cn.zyzpp.entity.nodes.BotRelation;
import cn.zyzpp.repository.medical.MedicalRepository;
import cn.zyzpp.repository.medical.MsymptomRepository;
import cn.zyzpp.repository.nodes.BotRelationRepository;
import cn.zyzpp.repository.nodes.BotRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.List;
//最新方案
@RunWith(SpringRunner.class)
@SpringBootTest
public class MedicalRepositoryTest {
    private Logger logger = LoggerFactory.getLogger(getClass());
    //neo4j
    @Autowired
    BotRepository botRepository;
    @Autowired
    BotRelationRepository botRelationRepository;
    //mysql
    @Autowired
    MedicalRepository medicalRepository;
    @Autowired
    MsymptomRepository msymptomRepository;
    //关系
    final String BRING = "bring";
    final String JB = "疾病";
    final String ZZ = "症状";

    /**
     * 先保存症状到neo4j
     */
    @Test
    public void test() {
        int num = 0;//当前第几页
        int size = 1000;//每页1000条
        Sort sort = new Sort(Sort.Direction.ASC, "id");
        Pageable pageable = new PageRequest(num++, size, sort);
        Page<Msymptom> msymptomPage = msymptomRepository.findAll(pageable);
        List<Msymptom> content = msymptomPage.getContent();
        //先保存第一页
        for (Msymptom msymptom : content) {
            botRepository.save(new BotNode(msymptom.getName(), ZZ, msymptom.getFamily(), msymptom.getPart()));
        }
        //如果还有下一页
        while (msymptomPage.hasNext()) {
            pageable = new PageRequest(num++, size, sort);
            msymptomPage = msymptomRepository.findAll(pageable);
            for (Msymptom msymptom : msymptomPage.getContent()) {
                botRepository.save(new BotNode(msymptom.getName(), ZZ, msymptom.getFamily(), msymptom.getPart()));
            }
        }
        logger.info("保存到neo4j完成");
    }

    int tj = 0; //标记

    /**
     * 再保存疾病到数据库和关系
     * 注意：确保症状保存完
     */
    @Test
    public void test6() {
        int num = 4;//当前第几页3/7
        int size = 1000;//每页1000条
        Sort sort = new Sort(Sort.Direction.ASC, "id");
        Pageable pageable = new PageRequest(num, size, sort);
        Page<Medical> medicalPage = medicalRepository.findAll(pageable);
        List<Medical> content = medicalPage.getContent();
        //先保存第一页
        for (Medical medical : content) {
            saveNeo4j(medical);
//            deletenode(medical);
        }
        //如果还有下一页
        while (medicalPage.hasNext()){
            medicalPage = medicalRepository.findAll(pageable = pageable.next());
            for (Medical medical : medicalPage.getContent()){
                saveNeo4j(medical);
            }
        }
        logger.info(num + "保存到neo4j完成");
    }

    private void saveNeo4j(Medical medical) {
        if (tj>734){
            //保存主节点
            BotNode node = new BotNode(medical.getName(), JB, medical.getFamily(), medical.getPart());
            botRepository.save(node);
            //保存子节点
            List<BotRelation> botRelationList = new ArrayList<>();
            for (String symptom : medical.getSymptom_list()) {
                BotNode botNode = botRepository.findAllByName(symptom);
                if (botNode != null) {
                    logger.info("保存关系 " + medical.getName());
//                    botRelationRepository.save(new BotRelation(node, botNode, BRING));
                    botRelationList.add(new BotRelation(node, botNode, BRING));
                }
            }
            botRelationRepository.save(botRelationList);
        }
        logger.info("保存完成 " + tj++);//3179小袋纤毛虫病
    }

    /**
     * 下标 4
     * 第109：特发性面神经
     * 下次从这里爬！
     * 下标 5
     * 第14：颅内脂肪瘤
     * 下标 6
     * 不详
     * 下标 7
     * 第22：老年人心肌梗死
     */
    private void deletenode(Medical medical){
        if (botRepository.findAllByName(medical.getName())!=null){
            botRelationRepository.deleteBotRelationByStartNodeName(medical.getName());
            logger.info("删除完成 " + medical.getName() + tj++);    //109
        }else {
            logger.info("查不到 " + medical.getName() + tj++);
        }

    }

}