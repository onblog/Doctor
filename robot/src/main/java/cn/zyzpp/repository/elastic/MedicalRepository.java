package cn.zyzpp.repository.elastic;


import cn.zyzpp.entity.elastic.Medical;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value ="elasticM" )
public interface MedicalRepository extends ElasticsearchRepository<Medical,Long> {
    List<Medical> findAllByNameLike(String name, Pageable pageable);

}
