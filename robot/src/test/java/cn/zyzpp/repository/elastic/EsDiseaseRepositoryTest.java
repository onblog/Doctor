package cn.zyzpp.repository.elastic;

import cn.zyzpp.entity.elastic.EsDisease;
import cn.zyzpp.entity.hospital.Illness;
import cn.zyzpp.entity.hospital.Symptom;
import cn.zyzpp.repository.hospital.IllnessRepository;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.query.DeleteQuery;

import java.util.ArrayList;
import java.util.List;

//@RunWith(SpringRunner.class)
//@SpringBootTest
public class EsDiseaseRepositoryTest {
    @Autowired
    IllnessRepository illnessRepository;
    @Autowired
    EsDiseaseRepository esDiseaseRepository;
    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    /**
     * 保存数据到Elasticsearch检索系统
     */
    @Test
    public void test() {
        long id = illnessRepository.findMaxById();
        for (long i = 1; i <= id; i++) {
            Illness illness = illnessRepository.findAllById(i);
            if (illness == null){
                continue;
            }
            EsDisease esDisease = new EsDisease(illness.getId(), illness.getName());
            esDisease.setSymptom(getListByIllness(illness));
            esDiseaseRepository.save(esDisease);
        }
    }

    private List<String> getListByIllness(Illness illness) {
        List<String> list = new ArrayList<>();
        for (Symptom s: illness.getSymptom()){
            list.add(s.getSymptom());
        }
        return list;
    }

    /**
     * 删除所有的数据
     */
    @Test
    public void deleteES(){
        DeleteQuery deleteQuery = new DeleteQuery();
        deleteQuery.setIndex("diseases");
        deleteQuery.setType("disease");
        elasticsearchTemplate.delete(deleteQuery);
    }
}