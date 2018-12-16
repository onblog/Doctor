package cn.zyzpp.entity.medical.node;

import org.neo4j.ogm.annotation.*;

/**
 * Create by yster@foxmail.com 2018/6/16/016 20:18
 */
@RelationshipEntity(type = "medicalRelation")
public class MedicalRelation {
    @GraphId
    private Long id;
    @StartNode
    private MedicalNode startNode;
    @EndNode
    private MedicalNode endNode;
    @Property
    private String relation;

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public MedicalRelation() {
    }

    public MedicalRelation( MedicalNode startNode, MedicalNode endNode, String relation) {
        this.id = -1l;
        this.startNode = startNode;
        this.endNode = endNode;
        this.relation = relation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MedicalNode getStartNode() {
        return startNode;
    }

    public void setStartNode(MedicalNode startNode) {
        this.startNode = startNode;
    }

    public MedicalNode getEndNode() {
        return endNode;
    }

    public void setEndNode(MedicalNode endNode) {
        this.endNode = endNode;
    }
}
