package cn.zyzpp.accessdata.repository;

import cn.zyzpp.accessdata.medical.Medical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalRepository extends JpaRepository<Medical,Long> {
    Medical findAllByName(String name);

}
