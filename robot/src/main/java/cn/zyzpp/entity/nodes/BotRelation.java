package cn.zyzpp.entity.nodes;

import org.neo4j.ogm.annotation.*;

/**
 * Create by yster@foxmail.com 2018/6/16/016 20:18
 */
@RelationshipEntity(type = "BotRelation")
public class BotRelation {
    @GraphId
    private Long id;
    @StartNode
    private BotNode startNode;
    @EndNode
    private BotNode endNode;
    @Property
    private String relation;

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public BotRelation() {
    }

    public BotRelation(BotNode startNode, BotNode endNode, String relation) {
        this.id = id;
        this.startNode = startNode;
        this.endNode = endNode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BotNode getStartNode() {
        return startNode;
    }

    public void setStartNode(BotNode startNode) {
        this.startNode = startNode;
    }

    public BotNode getEndNode() {
        return endNode;
    }

    public void setEndNode(BotNode endNode) {
        this.endNode = endNode;
    }

}
