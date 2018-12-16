package cn.zyzpp.diagnostic.repository;

import cn.zyzpp.diagnostic.node.BotNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BotRepository extends Neo4jRepository<BotNode,Long> {

    BotNode findAllByName(String name);

}
