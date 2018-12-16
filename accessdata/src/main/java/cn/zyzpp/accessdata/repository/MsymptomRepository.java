package cn.zyzpp.accessdata.repository;

import cn.zyzpp.accessdata.medical.Msymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MsymptomRepository extends JpaRepository<Msymptom,Long> {

    Msymptom findAllByName(String name);

}
