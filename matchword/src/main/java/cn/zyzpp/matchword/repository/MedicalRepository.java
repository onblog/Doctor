package cn.zyzpp.matchword.repository;

import cn.zyzpp.matchword.entity.Medical;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRepository extends ElasticsearchRepository<Medical,Long> {
    List<Medical> findAllByNameLike(String name, Pageable pageable);

    List<Medical> findAllByPartLike(String name);
}
