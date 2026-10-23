-- Sample database for local development.
--
-- This is a HAND-WRITTEN, deliberately tiny subset in the same MySQL layout the
-- importer expects (`medical`, `symptom` plus one side table per list column). It
-- exists so the project can be cloned and run without the commercial dataset:
--
--   node scripts/convert-mysql-dump.mjs db/sample-dump.sql
--   npm run data:load -- --local --init
--
-- The real `robot.sql` has exactly the same shape, so the converter is exercised by
-- this file in `npm test` as well.
--
-- The medical text here is illustrative only; it is not medical advice.

DROP TABLE IF EXISTS `medical`;
CREATE TABLE `medical` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cause` longtext,
  `complication` longtext,
  `cure` longtext,
  `diagnose` longtext,
  `intro` longtext,
  `name` varchar(255) DEFAULT NULL,
  `prevent` longtext,
  `symptom` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `medical_part`;
CREATE TABLE `medical_part` (
  `medical_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `part` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medical_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `medical_family`;
CREATE TABLE `medical_family` (
  `medical_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `family` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medical_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `medical_symptom_list`;
CREATE TABLE `medical_symptom_list` (
  `medical_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `symptom_list` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medical_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `medical_intro_list`;
CREATE TABLE `medical_intro_list` (
  `medical_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `intro_list` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`medical_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `symptom`;
CREATE TABLE `symptom` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cause` longtext,
  `diagnose` longtext,
  `examine` longtext,
  `intro` longtext,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_sym_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `symptom_part`;
CREATE TABLE `symptom_part` (
  `symptom_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `part` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`symptom_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `symptom_family`;
CREATE TABLE `symptom_family` (
  `symptom_id` bigint(20) NOT NULL,
  `position` int(11) NOT NULL,
  `family` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`symptom_id`,`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `symptom` VALUES
(1,'颅内外血管舒缩功能障碍。','结合病史与查体排除继发性病因。','头颅CT、磁共振。','头部疼痛为主观感受。','头痛'),
(2,'胃肠道受刺激或前庭功能异常。','询问进食史与伴随症状。','血常规、腹部超声。','上腹部不适想吐的感觉。','恶心'),
(3,'胃内容物经口排出。','观察呕吐物性状与频次。','血常规、电解质。','胃内容物反流出口。','呕吐'),
(4,'腹腔脏器炎症、痉挛或缺血。','结合压痛位置判断。','腹部超声、血常规。','腹部疼痛不适。','腹痛'),
(5,'肠道感染或动力异常。','记录排便次数与性状。','大便常规、大便培养。','排便次数增多且稀薄。','腹泻'),
(6,'感染、炎症或免疫反应。','测量体温并寻找感染灶。','血常规、C反应蛋白。','体温高于正常范围。','发热'),
(7,'气道受刺激。','听诊并询问持续时间。','胸片、肺功能。','保护性反射性排气动作。','咳嗽'),
(8,'气道分泌物增多。','观察痰液颜色与量。','痰培养、胸片。','咳嗽时排出气道分泌物。','咳痰'),
(9,'胸壁、胸膜或心肺病变。','结合心电图排除心脏急症。','心电图、胸片。','胸部疼痛或压迫感。','胸痛'),
(10,'通气或换气功能受限。','评估呼吸频率与血氧。','血气分析、胸片。','主观感到空气不足。','呼吸困难'),
(11,'咽部黏膜炎症。','检查咽部充血与扁桃体。','咽拭子。','咽喉疼痛不适。','咽痛'),
(12,'鼻黏膜分泌物增多。','观察分泌物性状。','鼻内镜。','鼻腔流出分泌物。','流鼻涕'),
(13,'视网膜对光敏感度升高。','结合头痛特点判断。','眼科检查。','对光线不耐受。','畏光'),
(14,'脑膜刺激征。','被动屈颈观察抵抗感。','腰椎穿刺。','颈部僵硬活动受限。','颈项强直'),
(15,'入睡困难或睡眠维持障碍。','评估睡眠日记。','多导睡眠监测。','睡眠质量下降。','失眠'),
(16,'前庭、血压或脑供血异常。','测量血压并评估眼震。','血压监测、前庭功能。','头昏沉或自身旋转感。','头晕'),
(17,'心律异常或交感兴奋。','心电图与动态心电监测。','心电图、甲状腺功能。','自觉心跳不适。','心悸'),
(18,'腰部肌肉紧张或盆腔充血。','结合月经周期判断。','盆腔超声。','腰部酸胀不适。','腰酸'),
(19,'膀胱或前列腺刺激。','询问排尿习惯。','尿常规、前列腺液。','排尿次数增多。','尿频'),
(20,'膀胱逼尿肌过度活动。','评估排尿日记。','尿流率检查。','突然强烈的排尿感。','尿急'),
(21,'尿路黏膜炎症。','尿常规白细胞检测。','尿常规、尿培养。','排尿时疼痛。','尿痛'),
(22,'腰肌劳损或泌尿系牵涉痛。','结合叩击痛判断。','泌尿系超声。','腰部疼痛。','腰痛'),
(23,'皮肤血管或炎症反应。','观察形态与分布。','皮肤科查体。','皮肤出现颜色或形态改变。','皮疹'),
(24,'中枢神经系统退行性改变。','认知量表评估。','神经心理量表、头颅MRI。','近期记忆能力下降。','记忆减退'),
(25,'皮质功能全面下降。','认知与日常生活能力评估。','神经心理评估。','理解、判断与执行能力下降。','认知障碍');

INSERT INTO `symptom_part` VALUES
(1,0,'头部'),(2,0,'腹部'),(3,0,'腹部'),(4,0,'腹部'),(5,0,'腹部'),(6,0,'全身'),
(7,0,'胸部'),(8,0,'胸部'),(9,0,'胸部'),(10,0,'胸部'),(11,0,'颈部'),(12,0,'鼻部'),
(13,0,'头部'),(14,0,'颈部'),(15,0,'全身'),(16,0,'头部'),(17,0,'胸部'),(18,0,'腰部'),
(19,0,'下腹部'),(20,0,'下腹部'),(21,0,'下腹部'),(22,0,'腰部'),(23,0,'全身'),
(24,0,'头部'),(25,0,'头部');

INSERT INTO `symptom_family` VALUES
(1,0,'神经内科'),(1,1,'呼吸内科'),(1,2,'心血管内科'),(2,0,'消化内科'),(3,0,'消化内科'),
(4,0,'消化内科'),(4,1,'妇科'),(5,0,'消化内科'),(6,0,'呼吸内科'),(6,1,'小儿科'),
(7,0,'呼吸内科'),(8,0,'呼吸内科'),(9,0,'呼吸内科'),(9,1,'心血管内科'),(10,0,'呼吸内科'),
(11,0,'呼吸内科'),(12,0,'呼吸内科'),(13,0,'神经内科'),(14,0,'神经内科'),(15,0,'神经内科'),
(16,0,'神经内科'),(16,1,'心血管内科'),(17,0,'心血管内科'),(18,0,'妇科'),(19,0,'男科'),
(20,0,'男科'),(21,0,'男科'),(22,0,'男科'),(23,0,'小儿科'),(23,1,'皮肤科'),
(24,0,'老年科'),(25,0,'老年科');

INSERT INTO `medical` VALUES
(1,'神经血管舒缩功能异常，与遗传、内分泌、饮食及情绪相关。','可能合并焦虑、睡眠障碍。','急性期止痛，缓解期预防用药。','依据头痛发作特点与伴随症状诊断。','一种反复发作的原发性头痛，常伴恶心与畏光。','偏头痛','规律作息，避免已知诱因。','反复发作的中重度头痛，可伴恶心、呕吐、畏光。'),
(2,'长期精神紧张致头颈肌肉持续收缩。','慢性头痛、睡眠障碍。','放松训练、物理治疗与对症止痛。','依据头痛性质与压痛点诊断。','双侧压迫样头痛，与精神压力相关。','紧张性头痛','缓解压力，纠正姿势。','双侧紧箍样头痛，午后加重。'),
(3,'进食不洁食物后细菌或病毒感染。','脱水、电解质紊乱。','补液、对症止吐止泻，必要时抗感染。','结合饮食史与大便检查诊断。','胃肠黏膜急性炎症，起病急。','急性胃肠炎','注意饮食卫生，饭前洗手。','恶心、呕吐、腹泻与腹痛。'),
(4,'鼻病毒等呼吸道病毒感染。','继发细菌感染、鼻窦炎。','休息、补液与对症治疗。','依据症状与流行季节诊断。','上呼吸道病毒感染，病程自限。','普通感冒','勤洗手，流行季戴口罩。','发热、咳嗽、咽痛、流鼻涕与头痛。'),
(5,'细菌感染肺泡引起实变。','脓胸、呼吸衰竭。','按指南抗感染治疗并评估住院指征。','胸片见实变影，结合炎症指标。','肺实质的细菌感染，需及时治疗。','细菌性肺炎','接种疫苗，戒烟。','发热、咳嗽、咳痰、胸痛与呼吸困难。'),
(6,'月经期子宫内膜前列腺素升高。','影响工作与生活质量。','止痛药、热敷，必要时激素治疗。','依据周期性发作特点诊断。','月经期出现的下腹痉挛性疼痛。','原发性痛经','规律运动，经期保暖。','经期腹痛、腰酸与恶心。'),
(7,'病原体感染、久坐与盆底紧张。','性功能与排尿功能障碍。','抗感染、物理治疗与生活方式调整。','前列腺液检查与症状评分。','前列腺的慢性炎症状态。','慢性前列腺炎','避免久坐，规律排精。','尿频、尿急、尿痛与腰痛。'),
(8,'人类疱疹病毒 6 型感染。','少见惊厥。','对症退热，多可自愈。','依据年龄与热退疹出特点诊断。','婴幼儿常见的病毒性出疹性疾病。','幼儿急疹','减少交叉感染。','突发高热，热退后出现皮疹。'),
(9,'β 淀粉样蛋白沉积与神经元退变。','生活不能自理、走失。','认知训练与药物治疗延缓进展。','认知量表与影像学检查。','进行性认知功能下降的神经退行性疾病。','阿尔茨海默病','保持社交与认知活动。','记忆减退与认知障碍。'),
(10,'遗传与环境因素导致血压持续升高。','心脑血管事件。','生活方式干预与降压药物。','多次测量血压确诊。','以体循环动脉压升高为主要表现。','原发性高血压','限盐、减重、规律运动。','头晕、头痛与心悸。');

INSERT INTO `medical_part` VALUES
(1,0,'头部'),(2,0,'头部'),(3,0,'腹部'),(4,0,'全身'),(5,0,'胸部'),
(6,0,'腹部'),(7,0,'下腹部'),(8,0,'全身'),(9,0,'头部'),(10,0,'头部');

INSERT INTO `medical_family` VALUES
(1,0,'神经内科'),(2,0,'神经内科'),(3,0,'消化内科'),(4,0,'呼吸内科'),(5,0,'呼吸内科'),
(6,0,'妇科'),(7,0,'男科'),(8,0,'小儿科'),(9,0,'老年科'),(10,0,'心血管内科');

INSERT INTO `medical_symptom_list` VALUES
(1,0,'头痛'),(1,1,'恶心'),(1,2,'呕吐'),(1,3,'畏光'),
(2,0,'头痛'),(2,1,'颈项强直'),(2,2,'失眠'),
(3,0,'恶心'),(3,1,'呕吐'),(3,2,'腹泻'),(3,3,'腹痛'),
(4,0,'发热'),(4,1,'咳嗽'),(4,2,'咽痛'),(4,3,'流鼻涕'),(4,4,'头痛'),
(5,0,'发热'),(5,1,'咳嗽'),(5,2,'咳痰'),(5,3,'胸痛'),(5,4,'呼吸困难'),
(6,0,'腹痛'),(6,1,'腰酸'),(6,2,'恶心'),
(7,0,'尿频'),(7,1,'尿急'),(7,2,'尿痛'),(7,3,'腰痛'),
(8,0,'发热'),(8,1,'皮疹'),
(9,0,'记忆减退'),(9,1,'认知障碍'),
(10,0,'头晕'),(10,1,'头痛'),(10,2,'心悸');

INSERT INTO `medical_intro_list` VALUES
(1,0,'偏头痛'),(1,1,'原发性头痛'),(2,0,'紧张性头痛');
