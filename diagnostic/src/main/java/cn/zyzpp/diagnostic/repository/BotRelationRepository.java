package cn.zyzpp.diagnostic.repository;

import cn.zyzpp.diagnostic.node.BotRelation;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BotRelationRepository extends Neo4jRepository<BotRelation,Long> {

    //返回指向节点n和n指向的所有关系
    @Query("MATCH p=(n:Bot)<-[r:BotRelation]->(m:Bot) WHERE n.name={name} RETURN p")
    List<BotRelation> findBothWayBySymptom(@Param("name") String name);

    //返回节点n以及n指向或指向n的所有节点以及这些节点间的所有关系
    @Query("MATCH p=(n:Bot)<-[r:BotRelation]->(m:Bot)<-[:BotRelation]->(:Bot)<-[:BotRelation]->(n:Bot) WHERE n.name={name} RETURN p")
    List<BotRelation> findAllByStartNode(@Param("name") String name);

    //返回指向节点n的所有关系
    @Query("MATCH p=(n:Bot)<-[r:BotRelation]-(m:Bot) WHERE n.name={name} RETURN p")
    List<BotRelation> findPointMeBySymptom(@Param("name") String name);

    //返回节点n指向的所有关系
    @Query("MATCH p=(n:Bot)-[r:BotRelation]->(m:Bot) WHERE n.name={name} RETURN p")
    List<BotRelation> findPointYouBySymptom(@Param("name") String name);

    //随便返回几条数据
    @Query("MATCH p=(n:Bot)-[r:BotRelation]->(m:Bot) RETURN p LIMIT {num}")
    List<BotRelation> findAllLimit(@Param("num") int num);

}
