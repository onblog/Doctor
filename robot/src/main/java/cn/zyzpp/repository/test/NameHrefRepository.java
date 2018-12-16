package cn.zyzpp.repository.test;

import cn.zyzpp.entity.test.NameHref;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Create by yster@foxmail.com 2018/8/13/013 20:40
 */
@Repository
public interface NameHrefRepository extends JpaRepository<NameHref,Long> {
    boolean existsByName(String name);

    NameHref findAllByName(String name);
}
