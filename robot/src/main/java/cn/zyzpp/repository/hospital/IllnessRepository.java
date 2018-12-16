package cn.zyzpp.repository.hospital;

import cn.zyzpp.entity.hospital.Illness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IllnessRepository extends JpaRepository<Illness,Long> {
    Illness findAllById(long id);

    /**
     * value：写SQL语句，参数有多种形式如?1,?2
     * nativeQuery：为true则为原生SQL语句，则from 表名 而不是 from 类名。
     * @return
     */
    @Query(value = "select id,name from illness group by name having count(name)>1",nativeQuery = true)
    List<Illness> findListByCountName();

    /**
     * 最大ID值
     * @return
     */
    @Query(value = "select max(id) from illness",nativeQuery = true)
    int findMaxById();
}
