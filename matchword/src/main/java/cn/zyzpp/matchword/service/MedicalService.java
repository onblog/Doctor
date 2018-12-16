package cn.zyzpp.matchword.service;

import cn.zyzpp.matchword.entity.Medical;

import java.util.List;

public interface MedicalService {
    void save(Medical medical);

    List<Medical> findAllByNameLike(String name);

    List<Medical> findAllByPartLike(String name);

    void delete(long id);

    void deleteAll();

    Long count();

    List<Medical> findAllByPartLike(String word, String zm);
}
