package cn.zyzpp.repository.medical.node;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.entity.medical.Msymptom;
import cn.zyzpp.entity.medical.node.MedicalNode;
import cn.zyzpp.entity.medical.node.MedicalRelation;
import cn.zyzpp.repository.medical.MedicalRepository;
import cn.zyzpp.repository.medical.MsymptomRepository;
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

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MedicalNodeRepositoryTest {
    private Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    MedicalNodeRepository medicalNodeRepository;
    @Autowired
    MedicalRelationRepository medicalRelationRepository;
    @Autowired
    MedicalRepository medicalRepository;
    @Autowired
    MsymptomRepository msymptomRepository;
    final String intro = "简介";
    final String cause = "病因";
    final String diagnose = "诊断";
    final String cure = "治疗";
    final String prevent = "预防";
    final String complication = "并发症";
    final String symptom = "症状";
    final String baohan = "包含";
    final String examine = "检查";

    @Test
    public void test(){
        int num = 0;//当前第几页
        int size = 1000;//每页100条
        boolean s = false;
        Sort sort = new Sort(Sort.Direction.DESC,"id");//降序
        Pageable pageable = new PageRequest(num++,size,sort);
        Page<Medical> medicalPage = medicalRepository.findAll(pageable);
        List<Medical> content = medicalPage.getContent();
        //先保存第一页
        for (Medical medical : content){
//            saveNeo4j(medical);
        }
        //如果还有下一页
        while (medicalPage.hasNext()){
            pageable = new PageRequest(num++,size,sort);
            medicalPage = medicalRepository.findAll(pageable);
            for (Medical medical : medicalPage.getContent()){
                if (s==false&&"肛管直肠周围脓肿".equals(medical.getName())){
                    s = true;
                    logger.info(medical.getName());
                }
                if (s){
                    logger.info("开始保存");
                    saveNeo4j(medical);
                }
            }
        }
        logger.info("保存到neo4j完成");
    }

    //@Test2
    public void saveSymptom(){
        int num = 0;//当前第几页
        int size = 100;//每页100条
        Sort sort = new Sort(Sort.Direction.DESC,"id");
        Pageable pageable = new PageRequest(num++,size,sort);
        Page<Msymptom> msymptomPage = msymptomRepository.findAll(pageable);
        List<Msymptom> content = msymptomPage.getContent();
        for (Msymptom msymptom : content){
            saveSymNeo4j(msymptom);
        }
        //如果还有下一页
        while (msymptomPage.hasNext()){
            pageable = new PageRequest(num++,size,sort);
            msymptomPage = msymptomRepository.findAll(pageable);
            for (Msymptom msymptom : msymptomPage.getContent()){
                saveSymNeo4j(msymptom);
            }
        }
        logger.info("保存到neo4j完成");
    }

    private void saveSymNeo4j(Msymptom msymptom) {
        //保存主节点
        MedicalNode node = new MedicalNode(msymptom.getName(),msymptom.getPart().toString()+msymptom.getFamily());
        node.setMajor(true);//设为主节点
        medicalNodeRepository.save(node);
        //保存子节点们
        MedicalNode node1 = new MedicalNode(intro,msymptom.getIntro());
        medicalNodeRepository.save(node1);
        MedicalNode node2 = new MedicalNode(cause,msymptom.getCause());
        medicalNodeRepository.save(node2);
        MedicalNode node3 = new MedicalNode(diagnose,msymptom.getDiagnose());
        medicalNodeRepository.save(node3);
        MedicalNode node4 = new MedicalNode(examine,msymptom.getExamine());
        medicalNodeRepository.save(node4);
        //保存主节点与子节点的关系
        medicalRelationRepository.save(new MedicalRelation(node,node1, intro));
        medicalRelationRepository.save(new MedicalRelation(node,node2, cause));
        medicalRelationRepository.save(new MedicalRelation(node,node3, diagnose));
        medicalRelationRepository.save(new MedicalRelation(node,node4, examine));
        //保存子节点的子节点
        for (String s : msymptom.getIntro_list()){
            MedicalNode node11 = new MedicalNode(s,s);
            medicalNodeRepository.save(node11);//保存子子节点
            medicalRelationRepository.save(new MedicalRelation(node1,node11, baohan));//保存子子关系
        }
        for (String s : msymptom.getCause_list()){
            MedicalNode node22 = new MedicalNode(s,s);
            medicalNodeRepository.save(node22);
            medicalRelationRepository.save(new MedicalRelation(node2,node22, baohan));
        }
        for (String s : msymptom.getDiagnose_list()){
            MedicalNode node33 = new MedicalNode(s,s);
            medicalNodeRepository.save(node33);
            medicalRelationRepository.save(new MedicalRelation(node3,node33, baohan));
        }
        for (String s : msymptom.getExamine_list()){
            MedicalNode node44 = new MedicalNode(s,s);
            medicalNodeRepository.save(node44);
            medicalRelationRepository.save(new MedicalRelation(node4,node44, baohan));
        }
    }

    private void saveNeo4j(Medical medical) {
        //保存主节点
        MedicalNode node = new MedicalNode(medical.getName(),medical.getPart().toString()+medical.getFamily());
        node.setMajor(true);//设为主节点
        medicalNodeRepository.save(node);
        //保存子节点们
        MedicalNode node1 = new MedicalNode(intro,medical.getIntro());
        medicalNodeRepository.save(node1);
        MedicalNode node2 = new MedicalNode(cause,medical.getCause());
        medicalNodeRepository.save(node2);
        MedicalNode node3 = new MedicalNode(diagnose,medical.getDiagnose());
        medicalNodeRepository.save(node3);
        MedicalNode node4 = new MedicalNode(cure,medical.getCure());
        medicalNodeRepository.save(node4);
        MedicalNode node5 = new MedicalNode(prevent,medical.getPrevent());
        medicalNodeRepository.save(node5);
        MedicalNode node6 = new MedicalNode(complication,medical.getComplication());
        medicalNodeRepository.save(node6);
        MedicalNode node7 = new MedicalNode(symptom,medical.getSymptom());
        medicalNodeRepository.save(node7);
        //保存主节点与子节点的关系
        medicalRelationRepository.save(new MedicalRelation(node,node1, intro));
        medicalRelationRepository.save(new MedicalRelation(node,node2, cause));
        medicalRelationRepository.save(new MedicalRelation(node,node3, diagnose));
        medicalRelationRepository.save(new MedicalRelation(node,node4,cure));
        medicalRelationRepository.save(new MedicalRelation(node,node5,prevent));
        medicalRelationRepository.save(new MedicalRelation(node,node6,complication));
        medicalRelationRepository.save(new MedicalRelation(node,node7,symptom));
        //保存子节点的子节点
        for (String s : medical.getIntro_list()){
            MedicalNode node11 = new MedicalNode(s,s);
            medicalNodeRepository.save(node11);//保存子子节点
            medicalRelationRepository.save(new MedicalRelation(node1,node11, baohan));//保存子子关系
        }
        for (String s : medical.getCause_list()){
            MedicalNode node22 = new MedicalNode(s,s);
            medicalNodeRepository.save(node22);
            medicalRelationRepository.save(new MedicalRelation(node2,node22, baohan));
        }
        for (String s : medical.getDiagnose_list()){
            MedicalNode node33 = new MedicalNode(s,s);
            medicalNodeRepository.save(node33);
            medicalRelationRepository.save(new MedicalRelation(node3,node33, baohan));
        }
        for (String s : medical.getCure_list()){
            MedicalNode node44 = new MedicalNode(s,s);
            medicalNodeRepository.save(node44);
            medicalRelationRepository.save(new MedicalRelation(node4,node44, baohan));
        }
        for (String s : medical.getPrevent_list()){
            MedicalNode node55 = new MedicalNode(s,s);
            medicalNodeRepository.save(node55);
            medicalRelationRepository.save(new MedicalRelation(node5,node55, baohan));
        }
        for (String s : medical.getComplication_list()){
            MedicalNode node66 = new MedicalNode(s,s);
            medicalNodeRepository.save(node66);
            medicalRelationRepository.save(new MedicalRelation(node6,node66, baohan));
        }
        for (String s : medical.getSymptom_list()){
            MedicalNode node77 = new MedicalNode(s,s);
            medicalNodeRepository.save(node77);
            medicalRelationRepository.save(new MedicalRelation(node7,node77, baohan));
        }
    }
}