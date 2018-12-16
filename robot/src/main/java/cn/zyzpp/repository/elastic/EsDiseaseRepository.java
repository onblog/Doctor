package cn.zyzpp.repository.elastic;

import cn.zyzpp.entity.elastic.EsDisease;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface EsDiseaseRepository extends ElasticsearchRepository<EsDisease,Integer> {
    EsDisease findAllByName(String name);
    EsDisease findAllById(int id);

}
