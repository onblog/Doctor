package cn.zyzpp.repository.hospital;

import cn.zyzpp.entity.hospital.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<Symptom,Long> {

    @Query(value = "select distinct id,symptom from symptom;",nativeQuery = true)
    List<Symptom> findDistinctBySymptom();
}
