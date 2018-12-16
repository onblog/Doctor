package cn.zyzpp.word;

import org.apdplat.word.WordFrequencyStatistics;
import org.apdplat.word.WordSegmenter;
import org.apdplat.word.dictionary.DictionaryFactory;
import org.apdplat.word.segmentation.SegmentationAlgorithm;
import org.apdplat.word.segmentation.Word;
import org.apdplat.word.util.WordConfTools;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

/**
 * Create by yster@foxmail.com 2018/6/17/017 10:03
 */
public class wordTest {
    String s = "\"卵巢畸胎瘤发生的部位、并发症以及恶变的情况，在临床上有不同的症状。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"1.卵巢畸胎瘤症状\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"如果畸胎瘤发生继发感染和囊内出血时，肿块增大较快，局部压痛感明显，并同时伴有发热、贫血、休克等全身感染或失血症状；一旦腹膜后、卵巢、盆腔、骶尾部等部位肿瘤破裂发生大出血，会出现急腹痛，休克等危险表现。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"2.卵巢畸胎瘤恶变的症状\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"恶性卵巢畸胎瘤常表现为肿瘤生长快，多为实体性，质地硬、可见浅表静脉怒张、充血、局部皮肤被浸润，早期即可穿透包膜，直接扩散至盆腹腔进行种植，还可通过淋巴和血行转移到淋巴节、肺及骨等，同时逐渐消瘦、贫血、瘤性发热等全身症状。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"3.包块\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"包块是最常见的症状，多为圆形囊性、边界清楚、质地软硬不匀，甚至可扪及骨性结节。其中外生性肿瘤以骶尾部、枕、额、鼻等中线部位常见，骶尾部畸胎瘤常可根据位置分为显型、隐型和混合型三种类型。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"四检查\\n\" +\n" +
            "                \"1.超声\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（1）成熟畸胎瘤边界清晰，包膜、轮廓多完整、光滑。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（2）表现物质均匀、光点密集细小，部分或完全布满囊腔。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（3）油脂与黏液、浆液在同一个囊腔时，则可见一回声增强的水平，称液脂面。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（4）有毛发时可见球形光团，随着声影或声衰减。液内的毛发光团有浮动感。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（5）实质性肿块部分呈现不均性，有弥漫分布的中等回声或强回声。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"2.CT\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（1）单侧或双侧性显示密度不均的囊性肿块。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（2）囊壁厚薄不均，边缘光整。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（3）可见自囊壁突起的实体性结节影。如囊内同时含有脂肪和液体，则可见到上脂肪下液体的液-脂界面，并可随体位变动而改变。还可见脂肪密度影和发育不全的骨骼及牙。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（4）皮样囊肿时，CT仅表现为含液体的囊性占位，但囊壁可有钙化。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"（5）恶性畸胎瘤侵及邻近周围组织，表现为肿瘤与周围器官的脂肪层消失；肿瘤侵及膀胱、盆腔肌肉或肠管，则表现为与他们之间的分界不清。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"3.磁共振\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"(1) 诊断畸胎瘤的主要依据是肿瘤内液性脂肪部分的信号强度呈短T1、长T2信号。\\n\" +\n" +
            "                \"\\n\" +\n" +
            "                \"(2)肿瘤内部主要有碎屑和壁突两种结构，壁突的成分为脂类组织、头发、牙齿、骨骼。碎屑常位于囊性部分的下层，液性脂肪位于上层而产生分层信号。\"";

    long start_time = 0;
    @Before
    public void before(){
        start_time = System.currentTimeMillis();
    }

    @Test
    public void fenci() {
        String word="有低热乏力倦怠体重下降";
        //设置词典
        WordConfTools.set("dic.path", "classpath:wordLink.txt");
        //设置最多多少个字为一词
        WordConfTools.set("intercept.length","10");
        DictionaryFactory.reload();//更改词典路径之后，重新加载词典
        List<Word> words = WordSegmenter.seg(word, SegmentationAlgorithm.MaximumMatching);
        System.out.println(words);
    }

    @Test
    public void cipin(){
        //词频统计设置
        WordFrequencyStatistics wordFrequencyStatistics = new WordFrequencyStatistics();
        wordFrequencyStatistics.setRemoveStopWord(true);
        wordFrequencyStatistics.setResultPath("util-frequency-statistics.txt");
        wordFrequencyStatistics.setSegmentationAlgorithm(SegmentationAlgorithm.MaxNgramScore);
        //开始分词
        wordFrequencyStatistics.seg(s);
        //输出词频统计结果
        wordFrequencyStatistics.dump();
    }

    @After
    public void time(){
        long end = System.currentTimeMillis();
        System.out.print((end - start_time)/1000);
        System.out.println("：秒");
    }
}
