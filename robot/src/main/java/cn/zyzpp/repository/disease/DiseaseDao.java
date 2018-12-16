package cn.zyzpp.repository.disease;

import cn.zyzpp.entity.disease.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseDao extends JpaRepository<Disease,Integer> {
    Disease queryAllById(int id);
}
