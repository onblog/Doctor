package cn.zyzpp.repository.nodes;

import cn.zyzpp.entity.hospital.Illness;
import cn.zyzpp.entity.hospital.Symptom;
import cn.zyzpp.entity.nodes.BotNode;
import cn.zyzpp.entity.nodes.BotRelation;
import cn.zyzpp.repository.hospital.IllnessRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class BotRepositoryTest {

    @Autowired
    BotRepository botRepository;
    @Autowired
    IllnessRepository illnessRepository;
    @Autowired
    BotRelationRepository botRelationRepository;

    final String DISEASE = "疾病";
    final String SYMPTOM = "症状";
    final String RELATOION = "产生";
    final List<String> FAMILY = null;
    final List<String> PART = null;

    @Test
    public void test() {
        //BotNode node = botRepository.findAllByName("头痛");
//        System.out.println(botRelationRepository.findAllByBotNode(node));
        System.out.println(botRelationRepository.findAllByStartNode("头痛"));
    }

    @Test
    public void test2() {
        botRepository.deleteAll();
        //读取数据库所有疾病并保存到Neo4j
        List<Illness> illRepositoryAll = illnessRepository.findAll();
        for (Illness illness : illRepositoryAll) {
            BotNode botNode = new BotNode(illness.getName(),DISEASE,FAMILY,PART);
            botRepository.save(botNode); //保存疾病节点
            System.out.println("save illness "+illness.getName());
        }
        for (Illness illness: illRepositoryAll){
            BotNode botNode1 = botRepository.findAllByName(illness.getName());
            for (Symptom symptom : illness.getSymptom()) {
                BotNode botNode = botRepository.findAllByName(symptom.getSymptom());
                if (botNode == null) {
                    botNode = new BotNode(symptom.getSymptom(), SYMPTOM, FAMILY,PART);
                    botRepository.save(botNode); //保存症状节点
                    botNode = botRepository.findAllByName(symptom.getSymptom());
                }
                botRelationRepository.save(new BotRelation(botNode1,botNode,RELATOION));
                System.out.println("save symptom "+symptom.getSymptom());
            }
        }

    }

}