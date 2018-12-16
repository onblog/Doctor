package cn.zyzpp.repository.medical.node;

import cn.zyzpp.entity.medical.node.MedicalRelation;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalRelationRepository extends GraphRepository<MedicalRelation> {
}
