package cn.zyzpp.repository.disease;

import cn.zyzpp.entity.disease.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentDao extends JpaRepository<Department,Integer> {

    Department queryAllById(int id);
    void deleteAllById(int id);

}
