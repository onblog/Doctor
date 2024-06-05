> 请邮件联系作者查看演示视频。项目采用 Java 技术栈，非Python机器学习！邮箱地址在文章底部

# 一.科学性

## 1.研究意义

信息科技经过 60 余年的发展，已经普及到社会生活的每一个角落。随着信息技术在国家治理、经济运行的方方面面的应用，大量的数据随之产生。而互联网技术的爆发式发展使得近年来产生的数据总量超过了人类以往产生的历史数据的总和，医疗行业的数据增长幅度尤为突出。

医疗大数据具有巨大的价值,尤其是在临床辅助诊疗和健康管理方面。医疗大数据已经上升到国家战略，同时也是全球学术界与产业界竞争的研究热点。如何利用这些医疗数据，挖掘数据的深层价值，是未来信息科技发展的趋势，也是医疗大数据技术产生的背景。

本项目利用知识图谱将各种琐碎、零散的医疗信息知识相互连接，以支持综合型知识检索问答、辅助决策和智能医疗诊断。精准医学知识与大数据相结合，能够利用庞大的全人类对疾病的理解和医生的经验形成知识库，让医生能够通过大数据的信息系统直接根据病人的个体实际情况来对他们进行针对性的诊断和治疗，辅助医生的诊疗过程，使得普通医生也能够像最好的资深医生一样为病人提供高质量的诊疗服务。

本项目结合知识图谱和医疗大数据技术，可以帮助患者自我评估病情，帮助医生找到最佳治疗方案，提高医生工作效率和诊疗质量，为慢病患者提供远程指导和干预。

## 2.医疗大数据的爬取与存储

(1)利用互联网搜寻可靠、权威的医疗数据来源，按照疾病所属科室利用多线程技术分段爬取全部数据，保证涵盖全部疾病内容，并在数据爬取过程中，分析数据结构，包括科室、症状、病因、并发症、治疗、预防等。

(2)针对爬取的数据进行分词，用于后续算法设计，最后将全部数据结构化存储至本地 MySQL 数据库。

(3)利用 Elastic Search 数据库快速地储存、搜索和分析海量数据。将MySQL 中存储的数据抽取部分部分存入到 Elastic Search 数据库，然后开发相应接口，返回JSON 格式的数据。ES 数据库的主要功能：一是用户在输入框输入症状词时提供实时搜索结果；二是点击部位时搜索到全部相关症状。

(4)使用 Neo4j 图形数据库存储一部分结构化的数据，便于进行算法设计，搭配分词、检索、排除、统计等算法提升诊断正确率。

## 3.系统运行流程

本系统需要用户输入个人信息（年龄、性别、职业、提供的症状词），系统根据用户年龄、性别、症状等个人信息进行算法分析、统计、排除、排序、得出相关性得分，最后将算法分析结果反馈给用户。关于算法的设计细节，本申报书的创新性部分会详细说明。项目的大致流程图如图一所示：

![](https://user-images.githubusercontent.com/31175877/70017228-8c981200-15bd-11ea-8246-317e4736ab41.png)

​					 图一：系统运行流程图

# 二.创新性

## 1.研究并实现一种基于知识图谱的智能医疗诊断方法

本项目从互联网爬取了庞大的医疗知识库，总体可以分为疾病库与症状库，如何分析出疾病与疾病、疾病与症状、症状与症状的内在联系是本系统设计的难点与核心。基于此问题，我们研究出了一种基于知识图谱的智能医疗诊断方法。

### 1.1 医疗知识图谱的构建

知识图谱可以大致概括为节点与关系的组成图谱，非常有助于本项目对医疗数据的分析与研究。关于知识图谱的节点设计，我们抽取医疗知识库中的全部症状词与全部疾病词构成了知识图谱的全部节点，这部分数据也成为了本项目的医学词典。每个节点都有许多属性，包括科室、症状、病因、并发症、治疗、预防等，但这些属性都是以长文本的形式存储，医学命名实体并没有被单独标注区分。前面已经说明，研究的主要方向是针对疾病与症状的联系，我们利用医学词典对疾病的症状属性进行分词。由此症状节点与疾病节点有了直接的关联，此时的节点知识图谱如图二所示：

![](https://user-images.githubusercontent.com/31175877/70017239-96217a00-15bd-11ea-894c-cbdb7e494192.png)

当每个疾病节点都与它所属的症状或一些并发症进行了关联之后，相互之间难免出现交叉。以图二所示举例，偏头痛会导致一系列症状与并发症，这种关系以箭头指向表示，偏头痛指向丛集性头痛，丛集性头痛又指向症状词头痛，偏头痛也指向了头痛，各种复杂的疾病、症状关系正是通过这种复杂的指向关系（也就是知识图谱），进行了清晰的展示。

### 1.2 智能诊断方法

如何基于这种复杂的知识图谱研究出一套科学的智能诊断算法是本系统的核心与关键。前面已经提到，系统在诊断之前需要用户提供症状、年龄、性别等信息，当获取用户提供的本系统医学词典范围内的症状词后，系统会马上根据症状词获取此症状的知识图谱，假设用户提供了“头痛”与“恶心”两个症状词，此时的知识图谱如图三、图四所示：

![](https://user-images.githubusercontent.com/31175877/70017246-9b7ec480-15bd-11ea-8de6-d9b0c35a313a.png)

![](https://user-images.githubusercontent.com/31175877/70017253-a0dc0f00-15bd-11ea-873f-f3eee619ec8f.png)

由知识图谱可以看到指向它们自身的节点，也就是导致这两个症状的疾病是存在共同之处的。当我们把这两张知识图谱合二为一后，此时的知识图谱如图五所示：

![](https://user-images.githubusercontent.com/31175877/70017267-a6d1f000-15bd-11ea-99fe-8e9eff8f24db.png)

该方法到此正式分析出了引起用户症状的“病因”，但此刻获取的疾病结果还是有些笼统，存在一些误差，这些误差来源于每个人的性别、年龄、职业等具体的个人特征，因此需要进一步的提升诊断准确率。

针对疾病所属的部分科室对人群的严格划分，我们详细列出了特殊科室人群分布表格，如表格1所示：

表 1 特殊科室人群分布表

| 科室     | 人群 |
| -------- | ---- |
| 妇科     | 女   |
| 产科     | 女   |
| 妇产科   | 女   |
| 男科     | 男   |
| 小儿科   | 小儿 |
| 老年科   | 老年 |
| 乳腺外科 | 女   |

由此表格辅助，再搭配用户提供的年龄、性别信息，可以成功排除相当大的一部分不可能疾病，大大提升了诊断的正确率。

到此，系统已初步诊断出引发这些症状的一系列疾病。但这些的疾病哪些的正确率最大，哪些的正确率最小暂时还不知道。为了解决这个问题，特提出“相关性得分”的概念进行最终的排序。系统需要计算诊断得出的疾病的匹配症状的多少，比如，用户提供了3个症状词，系统诊断得出了10个疾病结果，其中有的疾病的所有症状中只匹配用户提供的3个症状的其中2个，有的疾病的所有症状中包含全部的3个症状，匹配症状越多的疾病得分越高，这是第一步的大体排序。但此时很容易就出现匹配度相同的疾病，类似出现两种疾病的所有症状都匹配了两个症状的情况。如何处理这种情况，仅使用匹配算法是不能满足的。因此，需要进一步对匹配度相同的疾病结果进行单独的排序。经过两次排序后的结果就是诊断系统的最终诊断结果。

## 2.提出一种面向大规模知识图谱快速存储和数据读写的方法

本系统在开发过程中，涉及到的技术与框架繁多，为了使各个业务系统分离，使用微服务架构，为了进一步提高系统并发量与高可用，使用分布式技术。系统架构如图六所示：

![](https://user-images.githubusercontent.com/31175877/70017281-acc7d100-15bd-11ea-824f-b5ad4f356292.png)

(1)针对支撑知识图谱的Neo4j数据库、支撑快速检索医学词典的Elastic Search数据库与提供医学知识库的MySQL数据库，为了进一步提升三个数据库的读写能力，使用分布式架构，将三者有关的功能模块进行分离。

(2)在系统的前后端分离上，使用Nginx服务器进行静态资源的读写，进一步提升系统的吞吐等待量与高可用。

(3)使用Spring Cloud框架用于分离各个系统功能模块，便于后续系统的升级与维护。

⚠️注意：考虑到后期应用的启动和维护微服务架构代码，已整合为(Java)Maven多模块架构。

# 三.实用性

## 1.使用范围

(1)是为个人提供快速自诊服务，轻松掌握自身病情的一种方法，病急不再乱投医。

(2)是为研究人员或医生提供辅助诊断服务，帮助医生发现症状与疾病的各种关联，辅助诊断研究过程。

## 2.可行性

我们将逐步完善以知识图谱的形式对医疗数据进行展示的功能，作为医生进行诊断的参考，也可以帮助用户了解更多的医疗知识。

本项目的开发已经基本完成，原型系统已经上线。整个项目从技术上来讲，是完全可行的。

本项目已内部进行多次测试，辅助诊断的正确率能够达到80%以上，系统的可用性也是有保证的。

## 3.推广前景

越来越多的民众愿意积极参与健康管理。这种意愿正在延伸到 AI 和机器人领域。此外，智能医疗市场前景广阔，且增速可观。到 2020 年市场规模将达 79.88 亿美元，未来 5 年 CAGR 达 52.68%。同时， 资本和政策的双重支持将驱动智能医疗继续加速发展。 自 2012 年以来， 智能医疗的融资总额一直是最高的。目前， 无论是科技巨头还是传统的医疗机构， 都在纷纷抢滩智能医疗领域。科技巨头主要是通过与医疗机构合作获取海量的医疗数据来训练自己的模型从而提供更好的产品和服务。而医疗机构更倾向与垂直行业的领先公司合作，从各个方面来智能化整个机构。

在中国新医改的大背景下，智能医疗正在走进寻常百姓的生活。随着人均寿命的延长、出生率的下降和人们对健康的关注，现代社会人们需要更好的医疗系统。这样，远程医疗、电子医疗(e-health)就显得非常急需。

本项目作为智能医疗的一个具体应用，具有良好的推广前景和市场价值。

## 4.经济社会效益预测

基于知识图谱的智能诊疗系统的建设和推广，可以取得以下经济社会效益：

(1)可以为广大人民群众可提供便利的病情自我评估，利于人们尽早发现病情并积极诊治，“病急不再乱投医”；

(2)可以为医生提供丰富的医学知识图谱，利于医生查找相关疾病知识，以准确分析患者病症；

(3)可以根据知识图谱和患者病症，全面分析推断可能的疾病并提供潜在的医疗方案，辅助医生的诊疗过程，减少医疗事故的发生。

本项目的研究和推广，能够产生巨大的社会效益，减少社会的医疗成本支出，提高医疗质量，改善人们生活。

## 版权声明

根据《中华人民共和国著作权法》、《中华人民共和国商标法》、《中华人民共和国专利法》及适用之国际公约中有关著作权、商标权、专利权以及或其它财产所有权法律的保护，相应的版权或许可使用权均属作者所有。

本作品禁止任何人/企业在未经作者同意的前提下申请专利，禁止任何人未经作者同意的前提下使用本作品参加任何比赛或作为毕业设计，本作品仅限提供个人学习用途，如使用本作品源码进行其它用途务必邮件联系作者。如果已侵权，请自行删除。同时，我们保留进一步追究相关行为主体的法律责任的权利。


## 完整代码包和数据库请邮件联系购买

admin@onblogs.net

记得备注来意！

