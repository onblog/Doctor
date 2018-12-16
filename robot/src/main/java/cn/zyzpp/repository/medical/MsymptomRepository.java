package cn.zyzpp.repository.medical;

import cn.zyzpp.entity.medical.Msymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MsymptomRepository extends JpaRepository<Msymptom,Long> {

    @Query(value = "SELECT id,name FROM MSYMPTOM limit ?1,?2",nativeQuery = true)
    List<Msymptom> findAllName(int start, int num);

    boolean existsMsymptomByName(String name);
}
