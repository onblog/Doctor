package cn.zyzpp.diagnostic.entity.graph;

/**
 * Create by yster@foxmail.com 2018/9/14/014 21:08
 */
public class Node {
    private int id;
    private String name;
    private String kind;
    private int weight;

    public Node(int id, String name, String kind, int weight) {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.weight = weight;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }
}
