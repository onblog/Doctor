package cn.zyzpp.repository.disease;

import cn.zyzpp.entity.disease.Propertiy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertiyDao extends JpaRepository<Propertiy, Integer> {

    Propertiy queryAllById(int id);

}
