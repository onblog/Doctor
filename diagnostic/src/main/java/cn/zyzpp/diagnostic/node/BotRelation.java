package cn.zyzpp.diagnostic.node;

import org.neo4j.ogm.annotation.*;

import java.io.Serializable;

/**
 * Create by yster@foxmail.com 2018/6/16/016 20:18
 */
@RelationshipEntity(type = "BotRelation")
public class BotRelation implements Serializable {
    @GraphId
    private Long id;
    @StartNode
    private BotNode startNode;
    @EndNode
    private BotNode endNode;
    @Property
    private String relation;

    public BotRelation() {
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
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
