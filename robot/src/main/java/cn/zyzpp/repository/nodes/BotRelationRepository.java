package cn.zyzpp.repository.nodes;

import cn.zyzpp.entity.nodes.BotRelation;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.GraphRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BotRelationRepository extends GraphRepository<BotRelation> {
//    @Query("MATCH p=(n:Bot)-[r:BotRelation]->(m:Bot) WHERE id(n)={0} or id(m)={0} RETURN p")
//    List<BotRelation> findAllByBotNode(BotNode botNode);

    @Query("MATCH p=(n:Bot)<-[r:BotRelation]->(m:Bot) WHERE m.name={name} RETURN p")
    List<BotRelation> findAllBySymptom(@Param("name") String name);

    @Query("MATCH p=(n:Bot)<-[r:BotRelation]-(m:Bot) WHERE m.name={name} RETURN p")
    List<BotRelation> findAllByMedical(@Param("name") String name);

    @Query("MATCH p=(n:Bot)<-[r:BotRelation]->(m:Bot)<-[:BotRelation]->(:Bot)<-[:BotRelation]->(n:Bot) WHERE n.name={name} RETURN p")
    List<BotRelation> findAllByStartNode(@Param("name") String name);

    @Query("MATCH (n:Bot)<-[r:BotRelation]->(:Bot) WHERE n.name={name} DELETE r,n")
    void deleteBotRelationByStartNodeName(@Param("name") String name);


}
