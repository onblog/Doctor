package cn.zyzpp.repository.medical;

import cn.zyzpp.entity.medical.Medical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRepository extends JpaRepository<Medical,Long> {

    @Query(value = "SELECT id,name FROM MEDICAL Limit ?1,?2 ",
            nativeQuery = true)
    List<Medical> findAllName(int start, int num);

    boolean existsMedicalByName(String name);

    Medical findAllByName(String name);


}
