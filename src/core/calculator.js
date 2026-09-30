// =========================================================
// 排盘核心：六宫基础数据 + 知识常量（SHEN/QIN/XING/COMBOS）+ 起卦函数（农历/六神/江氏派/解卦）
// （从 V2.1.2 app-all.js 物理切分，保持 1:1 逻辑不变；去 IIFE 后共享 Script scope）
// =========================================================
'use strict';

            // ===== 六宫基础数据 =====
            var SHEN_NAMES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
            var SHEN_CLS = {
                '大安': 'da-an',
                '留连': 'liu-lian',
                '速喜': 'su-xi',
                '赤口': 'chi-kou',
                '小吉': 'xiao-ji',
                '空亡': 'kong-wang'
            };
            var SHEN_MEANING = {
                '大安': '平安吉祥，诸事顺利',
                '留连': '事有拖延，需耐心等待',
                '速喜': '喜事临门，快速达成',
                '赤口': '口舌是非，谨慎行事',
                '小吉': '小有吉利，渐进成功',
                '空亡': '谋事落空，徒劳无功'
            };
            var SHEN_DETAIL = {
                '大安': '五行属木，东方，青龙，主数1、5、7',
                '留连': '五行属土，北方，玄武，主数2、8、10',
                '速喜': '五行属火，南方，朱雀，主数3、6、9',
                '赤口': '五行属金，西方，白虎，主数4、7、10',
                '小吉': '五行属水，东方，六合，主数5、8、11',
                '空亡': '五行属土，中央，勾陈，主数6、9、12'
            };

            // 六亲知识
            var QIN_KNOWLEDGE = [
                { name: '自身', desc: '代表问卦者本人，一切以我为中心。' },
                { name: '父母', desc: '生我者，代表长辈、文书、学业、房产、庇佑。' },
                { name: '兄弟', desc: '同我者，代表朋友、同事、竞争、破财。' },
                { name: '子孙', desc: '我生者，代表晚辈、下属、投资、福气、医药。' },
                { name: '妻财', desc: '我克者，代表妻子、财物、感情、收益。' },
                { name: '官鬼', desc: '克我者，代表事业、压力、疾病、官非、小人。' }
            ];

            // 六神知识
            var SHEN_KNOWLEDGE = [
                { name: '青龙', desc: '大吉，主喜庆、贵人、婚庆、升迁。' },
                { name: '朱雀', desc: '主口舌、文书、信息、诉讼、争吵。' },
                { name: '勾陈', desc: '主勾连、阻滞、旧事、拖延、牵连。' },
                { name: '白虎', desc: '主凶灾、血光、压力、疾病、刑伤。' },
                { name: '玄武', desc: '主暗昧、盗贼、暧昧、小人、隐藏。' },
                { name: '腾蛇', desc: '主虚惊、多疑、缠绕、梦魇、幻象。' }
            ];

            // 六星知识
            var XING_KNOWLEDGE = [
                { name: '木星', desc: '主生机、扩张、生长，宜积极进取。' },
                { name: '火星', desc: '主急躁、快速、火爆，宜速战速决。' },
                { name: '土星', desc: '主迟缓、稳定、厚重，宜耐心等待。' },
                { name: '金星', desc: '主果断、变革、刚毅，宜果断决策。' },
                { name: '水星', desc: '主智慧、流动、变通，宜灵活应变。' },
                { name: '天星', desc: '主虚无、落空、幻想，宜保守观望。' }
            ];

            // ===== 五行与地支 =====
            var DZ_WUXING = {
                '子': '水',
                '丑': '土',
                '寅': '木',
                '卯': '木',
                '辰': '土',
                '巳': '火',
                '午': '火',
                '未': '土',
                '申': '金',
                '酉': '金',
                '戌': '土',
                '亥': '水'
            };
            var YANG_DZ = ['子', '寅', '辰', '午', '申', '戌'];
            var YIN_DZ = ['丑', '卯', '巳', '未', '酉', '亥'];

            // ===== 六神顺序 =====
            var LIU_SHEN_NAMES = ['青龙', '朱雀', '勾陈', '白虎', '玄武', '腾蛇'];
            const LIU_XING_NAMES = ['木星', '火星', '土星', '金星', '水星', '天星'];

            // ===== 组合断语（完整） =====
            var COMBOS = [
                { names: '大安 · 大安 · 大安', desc: '大吉，万事亨通，求谋顺遂，百事皆宜。' },
                { names: '大安 · 大安 · 留连', desc: '先难后易，终有贵人助，但需耐心。' },
                { names: '大安 · 大安 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '大安 · 大安 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '大安 · 大安 · 小吉', desc: '大吉大利，所求皆遂，贵人扶持。' },
                { names: '大安 · 大安 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '大安 · 留连 · 大安', desc: '事有波折，终得安宁，耐心为上。' },
                { names: '大安 · 留连 · 留连', desc: '拖延难进，需待时机，不宜妄动。' },
                { names: '大安 · 留连 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '大安 · 留连 · 赤口', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '大安 · 留连 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '大安 · 留连 · 空亡', desc: '事多落空，徒劳无功，宜谨慎。' },
                { names: '大安 · 速喜 · 大安', desc: '喜事连连，万事如意，大吉之兆。' },
                { names: '大安 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '大安 · 速喜 · 速喜', desc: '双喜临门，所求速成，大吉大利。' },
                { names: '大安 · 速喜 · 赤口', desc: '喜事临门，但防口舌，需谨言慎行。' },
                { names: '大安 · 速喜 · 小吉', desc: '吉庆有余，名利双收，万事亨通。' },
                { names: '大安 · 速喜 · 空亡', desc: '喜中有虚，需防落空，宜务实。' },
                { names: '大安 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '大安 · 赤口 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '大安 · 赤口 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '大安 · 赤口 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '大安 · 赤口 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '大安 · 赤口 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '大安 · 小吉 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '大安 · 小吉 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '大安 · 小吉 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '大安 · 小吉 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '大安 · 小吉 · 小吉', desc: '吉上加吉，万事如意，大吉之兆。' },
                { names: '大安 · 小吉 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '大安 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '大安 · 空亡 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '大安 · 空亡 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '大安 · 空亡 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '大安 · 空亡 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '大安 · 空亡 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },

                { names: '留连 · 大安 · 大安', desc: '先忧后喜，终得安宁，耐心为上。' },
                { names: '留连 · 大安 · 留连', desc: '事有拖延，需待时机，不宜妄动。' },
                { names: '留连 · 大安 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '留连 · 大安 · 赤口', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '留连 · 大安 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '留连 · 大安 · 空亡', desc: '事多落空，徒劳无功，宜谨慎。' },
                { names: '留连 · 留连 · 大安', desc: '事有转机，终得安宁，耐心为上。' },
                { names: '留连 · 留连 · 留连', desc: '拖延难进，需待时机，不宜妄动。' },
                { names: '留连 · 留连 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '留连 · 留连 · 赤口', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '留连 · 留连 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '留连 · 留连 · 空亡', desc: '事多落空，徒劳无功，宜谨慎。' },
                { names: '留连 · 速喜 · 大安', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '留连 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '留连 · 速喜 · 速喜', desc: '双喜临门，所求速成，大吉大利。' },
                { names: '留连 · 速喜 · 赤口', desc: '喜事临门，但防口舌，需谨言慎行。' },
                { names: '留连 · 速喜 · 小吉', desc: '吉庆有余，名利双收，万事亨通。' },
                { names: '留连 · 速喜 · 空亡', desc: '喜中有虚，需防落空，宜务实。' },
                { names: '留连 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '留连 · 赤口 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '留连 · 赤口 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '留连 · 赤口 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '留连 · 赤口 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '留连 · 赤口 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '留连 · 小吉 · 大安', desc: '小有成就，终得安宁，耐心为上。' },
                { names: '留连 · 小吉 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '留连 · 小吉 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '留连 · 小吉 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '留连 · 小吉 · 小吉', desc: '吉上加吉，万事如意，大吉之兆。' },
                { names: '留连 · 小吉 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '留连 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '留连 · 空亡 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '留连 · 空亡 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '留连 · 空亡 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '留连 · 空亡 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '留连 · 空亡 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },

                { names: '速喜 · 大安 · 大安', desc: '喜事连连，万事如意，大吉之兆。' },
                { names: '速喜 · 大安 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '速喜 · 大安 · 速喜', desc: '双喜临门，所求速成，大吉大利。' },
                { names: '速喜 · 大安 · 赤口', desc: '喜事临门，但防口舌，需谨言慎行。' },
                { names: '速喜 · 大安 · 小吉', desc: '吉庆有余，名利双收，万事亨通。' },
                { names: '速喜 · 大安 · 空亡', desc: '喜中有虚，需防落空，宜务实。' },
                { names: '速喜 · 留连 · 大安', desc: '先忧后喜，终得安宁，耐心为上。' },
                { names: '速喜 · 留连 · 留连', desc: '事有拖延，需待时机，不宜妄动。' },
                { names: '速喜 · 留连 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '速喜 · 留连 · 赤口', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '速喜 · 留连 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '速喜 · 留连 · 空亡', desc: '事多落空，徒劳无功，宜谨慎。' },
                { names: '速喜 · 速喜 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '速喜 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '速喜 · 速喜 · 速喜', desc: '三喜临门，万事如意，大吉之兆。' },
                { names: '速喜 · 速喜 · 赤口', desc: '喜事临门，但防口舌，需谨言慎行。' },
                { names: '速喜 · 速喜 · 小吉', desc: '吉庆有余，名利双收，万事亨通。' },
                { names: '速喜 · 速喜 · 空亡', desc: '喜中有虚，需防落空，宜务实。' },
                { names: '速喜 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '速喜 · 赤口 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '速喜 · 赤口 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '速喜 · 赤口 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '速喜 · 赤口 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '速喜 · 赤口 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '速喜 · 小吉 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '速喜 · 小吉 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '速喜 · 小吉 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '速喜 · 小吉 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '速喜 · 小吉 · 小吉', desc: '吉上加吉，万事如意，大吉之兆。' },
                { names: '速喜 · 小吉 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '速喜 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '速喜 · 空亡 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '速喜 · 空亡 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '速喜 · 空亡 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '速喜 · 空亡 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '速喜 · 空亡 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },

                { names: '赤口 · 大安 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 大安 · 留连', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '赤口 · 大安 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 大安 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 大安 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 大安 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '赤口 · 留连 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 留连 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '赤口 · 留连 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 留连 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 留连 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 留连 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '赤口 · 速喜 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '赤口 · 速喜 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 速喜 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 速喜 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 速喜 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '赤口 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 赤口 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '赤口 · 赤口 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 赤口 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 赤口 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 赤口 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '赤口 · 小吉 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 小吉 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '赤口 · 小吉 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 小吉 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 小吉 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 小吉 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '赤口 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '赤口 · 空亡 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '赤口 · 空亡 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '赤口 · 空亡 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '赤口 · 空亡 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '赤口 · 空亡 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },

                { names: '小吉 · 大安 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '小吉 · 大安 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '小吉 · 大安 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '小吉 · 大安 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '小吉 · 大安 · 小吉', desc: '吉上加吉，万事如意，大吉之兆。' },
                { names: '小吉 · 大安 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '小吉 · 留连 · 大安', desc: '小有成就，终得安宁，耐心为上。' },
                { names: '小吉 · 留连 · 留连', desc: '事有拖延，需待时机，不宜妄动。' },
                { names: '小吉 · 留连 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '小吉 · 留连 · 赤口', desc: '事多阻碍，口舌纷争，宜忍让。' },
                { names: '小吉 · 留连 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '小吉 · 留连 · 空亡', desc: '事多落空，徒劳无功，宜谨慎。' },
                { names: '小吉 · 速喜 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '小吉 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '小吉 · 速喜 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '小吉 · 速喜 · 赤口', desc: '喜事临门，但防口舌，需谨言慎行。' },
                { names: '小吉 · 速喜 · 小吉', desc: '吉庆有余，名利双收，万事亨通。' },
                { names: '小吉 · 速喜 · 空亡', desc: '喜中有虚，需防落空，宜务实。' },
                { names: '小吉 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜忍耐。' },
                { names: '小吉 · 赤口 · 留连', desc: '事多阻碍，口舌是非，宜静不宜动。' },
                { names: '小吉 · 赤口 · 速喜', desc: '先难后易，终有喜讯，可望成功。' },
                { names: '小吉 · 赤口 · 赤口', desc: '口舌重重，事多不顺，宜避让。' },
                { names: '小吉 · 赤口 · 小吉', desc: '虽有小吉，但防小人，需谨慎。' },
                { names: '小吉 · 赤口 · 空亡', desc: '事多落空，口舌是非，宜守拙。' },
                { names: '小吉 · 小吉 · 大安', desc: '大吉大利，所求皆遂，贵人相助。' },
                { names: '小吉 · 小吉 · 留连', desc: '小有成就，但需耐心，不可急躁。' },
                { names: '小吉 · 小吉 · 速喜', desc: '吉庆之兆，喜事速至，名利双收。' },
                { names: '小吉 · 小吉 · 赤口', desc: '先吉后凶，需防口舌，谨慎行事。' },
                { names: '小吉 · 小吉 · 小吉', desc: '吉上加吉，万事如意，大吉之兆。' },
                { names: '小吉 · 小吉 · 空亡', desc: '吉中藏凶，事多反复，宜守不宜攻。' },
                { names: '小吉 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '小吉 · 空亡 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '小吉 · 空亡 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '小吉 · 空亡 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '小吉 · 空亡 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '小吉 · 空亡 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },

                { names: '空亡 · 大安 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 大安 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '空亡 · 大安 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 大安 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 大安 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 大安 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },
                { names: '空亡 · 留连 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 留连 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '空亡 · 留连 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 留连 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 留连 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 留连 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },
                { names: '空亡 · 速喜 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 速喜 · 留连', desc: '喜中有忧，需防小人，谨慎行事。' },
                { names: '空亡 · 速喜 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 速喜 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 速喜 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 速喜 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },
                { names: '空亡 · 赤口 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 赤口 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '空亡 · 赤口 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 赤口 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 赤口 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 赤口 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },
                { names: '空亡 · 小吉 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 小吉 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '空亡 · 小吉 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 小吉 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 小吉 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 小吉 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' },
                { names: '空亡 · 空亡 · 大安', desc: '先凶后吉，终得平安，宜耐心。' },
                { names: '空亡 · 空亡 · 留连', desc: '事多阻滞，需防落空，宜谨慎。' },
                { names: '空亡 · 空亡 · 速喜', desc: '先忧后喜，终有佳音，可望成功。' },
                { names: '空亡 · 空亡 · 赤口', desc: '事多口舌，防小人，宜忍让。' },
                { names: '空亡 · 空亡 · 小吉', desc: '虽有小成，但需努力，不可懈怠。' },
                { names: '空亡 · 空亡 · 空亡', desc: '事多落空，徒劳无功，宜守拙。' }
            ];



            // ===== 工具函数 =====
            function getShenByIndex(idx) {
                return {
                    index: idx,
                    name: SHEN_NAMES[idx],
                    cls: SHEN_CLS[SHEN_NAMES[idx]],
                    meaning: SHEN_MEANING[SHEN_NAMES[idx]],
                    detail: SHEN_DETAIL[SHEN_NAMES[idx]]
                };
            }

            function walk(startIdx, remainder) {
                const offset = remainder === 0 ? 5 : (remainder - 1) % 6;
                return (startIdx + offset) % 6;
            }

            function getRemainder(num) {
                const n = Math.floor(Math.abs(num));
                return n % 6;
            }

            function formatTime(ts) {
                const d = new Date(ts);
                const pad = n => String(n).padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            }

            // ===== 时辰 =====
            function getShiChen(hours) {
                const sc = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
                let idx = Math.floor((hours + 1) / 2) % 12;
                return sc[idx];
            }

            // ===== 农历转换 =====
// ===== Lunar conversion (V2.1: use lunar-javascript library, data from Purple Mountain Observatory) =====
            // Old hand-written lunarInfo bit-algorithm had data errors (2025/2046/2057 etc off by 1 day).
            // Now uses lunar-javascript (github 6tail/lunar-javascript), GB/T 33661-2017 national standard.
            // Return shape kept identical to old: { lunarYear, lunarMonth, lunarDay, isLeap }
            function solarToLunar(year, month, day) {
                try {
                    const solar = Solar.fromYmd(year, month, day);
                    const lunar = solar.getLunar();
                    const m = lunar.getMonth(); // leap month is negative, e.g. -6 = leap 6th month
                    return {
                        lunarYear: lunar.getYear(),
                        lunarMonth: Math.abs(m),
                        lunarDay: lunar.getDay(),
                        isLeap: m < 0
                    };
                } catch (e) {
                    return { lunarYear: 0, lunarMonth: 0, lunarDay: 0, isLeap: false };
                }
            }

            // ===== 江氏排盘核心 =====
            function generateJiangPai(answers, shiChenDz) {
                const renGongName = answers[2].shen.name;
                const renIdx = SHEN_NAMES.indexOf(renGongName);

                const isYang = YANG_DZ.includes(shiChenDz);
                const dzList = isYang ? YANG_DZ : YIN_DZ;
                let startIdx = dzList.indexOf(shiChenDz);
                if (startIdx === -1) startIdx = 0;
                let diZhiMap = {};
                for (let i = 0; i < 6; i++) {
                    let shenName = SHEN_NAMES[i];
                    diZhiMap[shenName] = dzList[(startIdx + i) % 6];
                }

                const selfDz = diZhiMap[renGongName];
                const selfWx = DZ_WUXING[selfDz] || '';
                let qinMap = {};
                for (let shenName of SHEN_NAMES) {
                    if (shenName === renGongName) { qinMap[shenName] = '自身'; continue; }
                    let wx = DZ_WUXING[diZhiMap[shenName]] || '';
                    if (!selfWx || !wx) { qinMap[shenName] = ''; continue; }
                    const sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
                    const ke = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
                    if (selfWx === wx) qinMap[shenName] = '兄弟';
                    else if (sheng[selfWx] === wx) qinMap[shenName] = '子孙';
                    else if (sheng[wx] === selfWx) qinMap[shenName] = '父母';
                    else if (ke[selfWx] === wx) qinMap[shenName] = '妻财';
                    else if (ke[wx] === selfWx) qinMap[shenName] = '官鬼';
                    else qinMap[shenName] = '';
                }

                let shenMap = {};
                for (let i = 0; i < 6; i++) {
                    shenMap[SHEN_NAMES[i]] = LIU_SHEN_NAMES[i];
                }

                let xingMap = {};
                for (let i = 0; i < 6; i++) {
                    let shenName = SHEN_NAMES[i];
                    xingMap[shenName] = LIU_XING_NAMES[i];
                }

                let result = [];
                for (let shenName of SHEN_NAMES) {
                    result.push({
                        gong: shenName,
                        dz: diZhiMap[shenName],
                        qin: qinMap[shenName] || '',
                        shen: shenMap[shenName] || '',
                        xing: xingMap[shenName] || ''
                    });
                }
                return result;
            }

            // ===== 农历中文转换 =====
            function toChineseLunar(year, month, day, isLeap) {
                const cnNums = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
                const yearStr = String(year).split('').map(d => cnNums[parseInt(d)]).join('');
                const monthNames = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
                const monthStr = (isLeap ? '闰' : '') + monthNames[month] + '月';
                function dayToChinese(d) {
                    if (d === 10) return '初十';
                    if (d < 10) return '初' + cnNums[d];
                    if (d === 20) return '二十';
                    if (d < 20) return '十' + cnNums[d - 10];
                    if (d === 30) return '三十';
                    return '廿' + cnNums[d - 20];
                }
                return yearStr + '年 ' + monthStr + dayToChinese(day);
            }

            // ===== 排盘详情弹窗 =====
            function showPaiPanDetail(answers, shiChenDz, jiangData) {
                const renGongName = answers[2].shen.name;
                const isYang = YANG_DZ.includes(shiChenDz);
                const dzList = isYang ? YANG_DZ : YIN_DZ;
                let startIdx = dzList.indexOf(shiChenDz);
                const selfDz = jiangData.find(d => d.gong === renGongName).dz;
                const selfWx = DZ_WUXING[selfDz];
                const sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
                const ke = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

                let html = '<div style="font-size:13px;line-height:1.85;color:#3d3226;">';

                html += '<div style="margin-bottom:8px;font-size:14px;"><b>⏰ 时辰</b>：' + shiChenDz + '时 → ' + (isYang ? '阳支' : '阴支') + '序列 [' + dzList.join('、') + ']，从 <b>' + dzList[startIdx] + '</b>（第' + (startIdx + 1) + '位）开始</div>';

                html += '<div style="margin-bottom:6px;color:#c8a84e;font-weight:600;">▎地支排法（从大安起，依次分配）</div>';
                for (let i = 0; i < 6; i++) {
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' ← ' + dzList[(startIdx + i) % 6] + '</div>';
                }

                html += '<div style="margin-top:8px;margin-bottom:4px;color:#c8a84e;font-weight:600;">▎六亲排法（人宫「' + renGongName + '」地支' + selfDz + '→五行"' + selfWx + '"为自身）</div>';
                jiangData.forEach(item => {
                    if (item.gong === renGongName) {
                        html += '<div style="margin-left:13px;">' + item.gong + ' → <b>自身</b></div>';
                    } else {
                        let wx = DZ_WUXING[item.dz];
                        let rel = '';
                        if (selfWx === wx) rel = '比和→兄弟';
                        else if (sheng[selfWx] === wx) rel = selfWx + '生' + wx + '→子孙';
                        else if (sheng[wx] === selfWx) rel = wx + '生' + selfWx + '→父母';
                        else if (ke[selfWx] === wx) rel = selfWx + '克' + wx + '→妻财';
                        else if (ke[wx] === selfWx) rel = wx + '克' + selfWx + '→官鬼';
                        html += '<div style="margin-left:13px;">' + item.gong + ' 地支' + item.dz + '→五行"' + wx + '" → ' + rel + '</div>';
                    }
                });

                html += '<div style="margin-top:8px;margin-bottom:4px;color:#c8a84e;font-weight:600;">▎六神排法（固定映射，从大安起）</div>';
                for (let i = 0; i < 6; i++) {
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' → ' + LIU_SHEN_NAMES[i] + '</div>';
                }

                html += '<div style="margin-top:8px;margin-bottom:4px;color:#c8a84e;font-weight:600;">▎六星排法（固定映射，从大安起）</div>';
                for (let i = 0; i < 6; i++) {
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' → ' + LIU_XING_NAMES[i] + '</div>';
                }

                html += '</div>';

                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

                const box = document.createElement('div');
                box.style.cssText = 'background:#fffef9;border-radius:13px;padding:21px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:420px;width:90%;max-height:80vh;overflow-y:auto;font-family:system-ui,"Microsoft YaHei",sans-serif;';
                box.innerHTML = '<div style="font-size:16px;font-weight:600;color:#2c2416;margin-bottom:13px;">📐 排盘逻辑详情</div>' + html + '<div style="margin-top:13px;text-align:center;"><button style="padding:8px 28px;border:none;border-radius:8px;background:#c8a84e;color:#fff;font-size:13px;font-weight:600;cursor:pointer;" onclick="this.closest(\'div\').parentElement.remove()">关闭</button></div>';

                overlay.appendChild(box);
                document.body.appendChild(overlay);
            }

            // ===== 解卦生成 =====
            function generateJieGua(jiangData, renGongName) {
                let renItem = jiangData.find(d => d.gong === renGongName);
                if (!renItem) return '暂无解卦信息。';
                const qin = renItem.qin;
                const shen = renItem.shen;
                const xing = renItem.xing;
                let parts = [];
                if (qin === '自身') parts.push('此卦以人宫为自身，主问事之人本身状态。');
                else if (qin === '父母') parts.push('父母主长辈、文书、学业、房产等，临此宫需关注相关事宜。');
                else if (qin === '兄弟') parts.push('兄弟主朋友、同事、竞争、破财等，临此宫需注意人际关系与财务。');
                else if (qin === '子孙') parts.push('子孙主晚辈、下属、投资、福气等，临此宫多主福泽与付出。');
                else if (qin === '妻财') parts.push('妻财主财运、感情、女性等，临此宫多主财物与情感之事。');
                else if (qin === '官鬼') parts.push('官鬼主事业、压力、疾病、官非等，临此宫需谨慎应对。');
                if (shen === '青龙') parts.push('青龙主吉庆、喜事、贵人，临此宫多主顺利。');
                else if (shen === '朱雀') parts.push('朱雀主口舌、文书、信息，临此宫需注意沟通与是非。');
                else if (shen === '勾陈') parts.push('勾陈主勾连、阻滞、旧事，临此宫多主牵连与拖延。');
                else if (shen === '白虎') parts.push('白虎主凶灾、血光、压力，临此宫需防范意外。');
                else if (shen === '玄武') parts.push('玄武主暗昧、盗贼、暧昧，临此宫需防小人暗算。');
                else if (shen === '腾蛇') parts.push('螣蛇主虚惊、多疑、缠绕，临此宫需放宽心态。');
                if (xing === '木星') parts.push('木星主生机、扩张，宜积极进取。');
                else if (xing === '火星') parts.push('火星主急躁、快速，宜速战速决。');
                else if (xing === '土星') parts.push('土星主迟缓、稳定，宜耐心等待。');
                else if (xing === '金星') parts.push('金星主果断、变革，宜果断决策。');
                else if (xing === '水星') parts.push('水星主智慧、流动，宜灵活应变。');
                else if (xing === '天星') parts.push('天空主虚无、落空，宜保守观望。');
                if (parts.length === 0) return '此卦信息不足，请重新起卦。';
                return parts.join(' ');
            }

            // ===== 组合断语匹配 =====
            function matchInterpretation(answers) {
                const names = answers.map(a => a.shen.name).join(' · ');
                for (let combo of COMBOS) {
                    if (combo.names === names) return combo.desc;
                }
                return '';
            }

            // ===== 核心推算 =====
            function calculate(n1, n2, n3) {
                const r1 = getRemainder(n1);
                const r2 = getRemainder(n2);
                const r3 = getRemainder(n3);
                const idx1 = walk(0, r1);
                const idx2 = walk(idx1, r2);
                const idx3 = walk(idx2, r3);
                const finalShen = getShenByIndex(idx3);
                const answers = [
                    { step: 1, shen: getShenByIndex(idx1) },
                    { step: 2, shen: getShenByIndex(idx2) },
                    { step: 3, shen: getShenByIndex(idx3) }
                ];
                const interpretation = matchInterpretation(answers);
                return { answers, finalShen, numbers: [n1, n2, n3], interpretation };
            }

            // =========================================================
            // 道传小六壬排盘算法（从 V3.0 迁移，死活六神双轨体系）
            // =========================================================

            // 十二地支 + 对应五行
            var DAO_DZ = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            var DAO_DZ_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

            // 死六神（固定对应每一宫，六宫本体之神）
            // 0=大安,1=留连,2=速喜,3=赤口,4=小吉,5=空亡
            var DAO_SI_LIU_SHEN = [
                { name: '青龙', wx: '木', desc: '主喜庆、贵人、顺利、婚姻、升迁' },
                { name: '勾陈', wx: '土', desc: '主阻滞、牵连、旧事、拖延、田宅' },
                { name: '朱雀', wx: '火', desc: '主口舌、文书、信息、诉讼、喜事' },
                { name: '白虎', wx: '金', desc: '主凶灾、血光、压力、疾病、刑伤' },
                { name: '玄武', wx: '水', desc: '主暗昧、盗贼、暧昧、小人、隐藏' },
                { name: '腾蛇', wx: '土', desc: '主虚惊、多疑、缠绕、梦魇、幻象' }
            ];

            // 活六神顺序（永远固定）
            var DAO_HUO_LIU_SHEN_ORDER = ['青龙', '朱雀', '勾陈', '白虎', '玄武', '腾蛇'];
            var DAO_HUO_LIU_SHEN_DESC = {
                '青龙': '主喜庆、贵人、顺利、婚姻、升迁',
                '朱雀': '主口舌、文书、信息、诉讼、争吵',
                '勾陈': '主勾连、阻滞、旧事、拖延、牵连',
                '白虎': '主凶灾、血光、压力、疾病、刑伤',
                '玄武': '主暗昧、盗贼、暧昧、小人、隐藏',
                '腾蛇': '主虚惊、多疑、缠绕、梦魇、幻象'
            };

            // 活六神起始宫位（按时辰）
            var DAO_HUO_SHEN_START_GONG = {
                '子': 0, '午': 0,
                '丑': 1, '未': 1,
                '寅': 2, '申': 2,
                '卯': 3, '酉': 3,
                '辰': 4, '戌': 4,
                '巳': 5, '亥': 5
            };

            // 六宫五行（留连属土、小吉属水，与 V3 体系一致）
            var DAO_GONG_WUXING = ['木', '土', '火', '金', '水', '土'];

            // 计算六亲关系（以人宫五行为"我"）
            function daoCalcQin(selfWx, otherWx) {
                if (selfWx === otherWx) return { name: '兄弟', desc: '同我者，代表朋友、同事、竞争、破财' };
                var SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
                var KE    = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
                if (SHENG[otherWx] === selfWx) return { name: '父母', desc: '生我者，代表长辈、文书、学业、房产' };
                if (SHENG[selfWx] === otherWx) return { name: '子孙', desc: '我生者，代表晚辈、下属、投资、福气' };
                if (KE[selfWx] === otherWx)    return { name: '妻财', desc: '我克者，代表妻子、财物、感情、收益' };
                if (KE[otherWx] === selfWx)    return { name: '官鬼', desc: '克我者，代表事业、压力、疾病、官非' };
                return { name: '自身', desc: '代表问卦者本人，一切以我为中心' };
            }

            /**
             * 生成道传小六壬排盘数据
             * @param {Array} answers - 三宫结果 [{step, shen:{name,index}}]
             * @param {string} shiChen - 时辰地支
             * @returns {Array} rows
             */
            function generateDaoPai(answers, shiChen) {
                var shiChenIdx = DAO_DZ.indexOf(shiChen);
                if (shiChenIdx === -1) return [];
                var rows = [];
                var startGongIdx = DAO_HUO_SHEN_START_GONG[shiChen] != null ? DAO_HUO_SHEN_START_GONG[shiChen] : 0;

                // 人宫索引（地支隔位相排的基准点）
                var renIdx = answers[2].shen.index;

                for (var i = 0; i < 3; i++) {
                    var gong = answers[i].shen.name;
                    var gongIdx = answers[i].shen.index;

                    // 地支排法：传统"隔位相排"
                    // 从人宫时辰地支开始，顺时针隔一个排一个
                    // 公式：(时辰索引 + 2 * 宫位偏移) % 12
                    var offset = (gongIdx - renIdx + 6) % 6;
                    var dzIdx = (shiChenIdx + 2 * offset) % 12;
                    var dz = DAO_DZ[dzIdx];
                    var dzWx = DAO_DZ_WUXING[dzIdx];
                    var gongWx = DAO_GONG_WUXING[gongIdx];

                    var siShenObj = DAO_SI_LIU_SHEN[gongIdx] || { name: '', wx: '', desc: '' };
                    var huoShenIdx = (gongIdx - startGongIdx + 6) % 6;
                    var huoShen = DAO_HUO_LIU_SHEN_ORDER[huoShenIdx];

                    var renWx = DAO_GONG_WUXING[answers[2].shen.index];
                    var qinObj = i === 2
                        ? { name: '自身', desc: '代表问卦者本人，一切以我为中心' }
                        : daoCalcQin(renWx, gongWx);

                    rows.push({
                        position: i === 0 ? '天宫' : (i === 1 ? '地宫' : '人宫'),
                        gong: gong,
                        gongIdx: gongIdx,
                        dz: dz,
                        dzWx: dzWx,
                        gongWx: gongWx,
                        qin: qinObj.name,
                        qinDesc: qinObj.desc,
                        siShen: siShenObj.name,
                        siShenWx: siShenObj.wx,
                        siShenDesc: siShenObj.desc,
                        huoShen: huoShen,
                        huoShenDesc: DAO_HUO_LIU_SHEN_DESC[huoShen] || ''
                    });
                }
                return rows;
            }

            // 生成道传排盘解卦摘要
            function generateDaoJieGuaText(rows, shiChen) {
                if (!rows || rows.length === 0) return '';
                var ren = rows[2];
                var startGongIdx = DAO_HUO_SHEN_START_GONG[shiChen] != null ? DAO_HUO_SHEN_START_GONG[shiChen] : 0;
                var startGongName = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'][startGongIdx];
                return [
                    '【道传·死活六神双轨合参】',
                    '时辰「' + shiChen + '」→ 青龙起于「' + startGongName + '」（活六神轮值起点）。',
                    '地支排法：以人宫时辰「' + shiChen + '」为基准，顺时针隔位相排。',
                    '人宫落' + ren.gong + '（五行' + ren.gongWx + '，地支' + ren.dz + '）：',
                    '死六神「' + ren.siShen + '」' + ren.siShenWx + '（' + ren.siShenDesc + '）；',
                    '活六神「' + ren.huoShen + '」（' + ren.huoShenDesc + '）；',
                    '六亲为' + ren.qin + '（' + ren.qinDesc + '）。',
                    '死神为体（事之本），活神为用（时之机），双轨合参断事理。'
                ].join('');
            }

            // ===== 道传排盘逻辑弹窗 =====
            function showDaoPaiPanDetail(answers, shiChenDz, daoRows) {
                var renGongName = answers[2].shen.name;
                var renIdx = answers[2].shen.index;
                var shiChenIdx = DAO_DZ.indexOf(shiChenDz);
                var startGongIdx = DAO_HUO_SHEN_START_GONG[shiChenDz] != null ? DAO_HUO_SHEN_START_GONG[shiChenDz] : 0;
                var startGongName = SHEN_NAMES[startGongIdx];

                var html = '<div style="font-size:13px;line-height:1.85;color:#3d3226;">';

                // 时辰
                html += '<div style="margin-bottom:8px;font-size:14px;"><b>⏰ 时辰</b>：' + shiChenDz + '时 → 五行' + DAO_DZ_WUXING[shiChenIdx] + '</div>';

                // 地支排法
                html += '<div style="margin-bottom:6px;color:#7b1fa2;font-weight:600;">▎地支排法（隔位相排）</div>';
                html += '<div style="margin-left:13px;margin-bottom:4px;">以人宫「' + renGongName + '」时辰地支<b>' + shiChenDz + '</b>为基准，顺时针隔一个排一个：</div>';
                for (var i = 0; i < 6; i++) {
                    var offset = (i - renIdx + 6) % 6;
                    var dzIdx = (shiChenIdx + 2 * offset) % 12;
                    var isRen = (i === renIdx);
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + (isRen ? ' ← ' : ' ← ') + DAO_DZ[dzIdx] + (isRen ? ' <b>(人宫基准)</b>' : '') + '</div>';
                }

                // 死六神排法
                html += '<div style="margin-top:8px;margin-bottom:4px;color:#7b1fa2;font-weight:600;">▎死六神（固定对应·宫位本体之神）</div>';
                html += '<div style="margin-left:13px;margin-bottom:4px;">每宫固定对应一个六神，不随时辰变化：</div>';
                for (var i = 0; i < 6; i++) {
                    var s = DAO_SI_LIU_SHEN[i];
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' → ' + s.name + '(' + s.wx + ') — ' + s.desc + '</div>';
                }

                // 活六神排法
                html += '<div style="margin-top:8px;margin-bottom:4px;color:#7b1fa2;font-weight:600;">▎活六神（按时轮值·青龙起首）</div>';
                html += '<div style="margin-left:13px;margin-bottom:4px;">时辰「' + shiChenDz + '」→ 青龙起于「' + startGongName + '」，顺布六宫：</div>';
                html += '<div style="margin-left:13px;margin-bottom:4px;">顺序：青龙 → 朱雀 → 勾陈 → 白虎 → 玄武 → 腾蛇</div>';
                for (var i = 0; i < 6; i++) {
                    var huoShenIdx = (i - startGongIdx + 6) % 6;
                    var huoShen = DAO_HUO_LIU_SHEN_ORDER[huoShenIdx];
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' → ' + huoShen + ' (' + DAO_HUO_LIU_SHEN_DESC[huoShen] + ')</div>';
                }

                // 六亲排法
                html += '<div style="margin-top:8px;margin-bottom:4px;color:#7b1fa2;font-weight:600;">▎六亲排法（以人宫五行为"我"）</div>';
                var renWx = DAO_GONG_WUXING[renIdx];
                html += '<div style="margin-left:13px;margin-bottom:4px;">人宫「' + renGongName + '」五行=<b>' + renWx + '</b>为自身，其余宫位按五行生克定六亲：</div>';
                var sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
                var ke = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
                for (var i = 0; i < 6; i++) {
                    var gongWx = DAO_GONG_WUXING[i];
                    var rel = '';
                    if (i === renIdx) {
                        rel = '自身';
                    } else if (renWx === gongWx) {
                        rel = '兄弟（比和）';
                    } else if (sheng[gongWx] === renWx) {
                        rel = '父母（' + gongWx + '生' + renWx + '）';
                    } else if (sheng[renWx] === gongWx) {
                        rel = '子孙（' + renWx + '生' + gongWx + '）';
                    } else if (ke[renWx] === gongWx) {
                        rel = '妻财（' + renWx + '克' + gongWx + '）';
                    } else if (ke[gongWx] === renWx) {
                        rel = '官鬼（' + gongWx + '克' + renWx + '）';
                    }
                    html += '<div style="margin-left:13px;">' + SHEN_NAMES[i] + ' 五行=' + gongWx + ' → ' + rel + '</div>';
                }

                // 合参说明
                html += '<div style="margin-top:10px;padding:8px 12px;background:#f3e5f5;border-radius:8px;color:#5d3a82;font-size:12px;">';
                html += '<b>💀 死六神</b> = 事之体（本性固定不变）；<b>🔄 活六神</b> = 时之用（随时辰轮转）。两者合参，体用兼察，方断事理。';
                html += '</div>';

                html += '</div>';

                var overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;';
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

                var box = document.createElement('div');
                box.style.cssText = 'background:#fffef9;border-radius:13px;padding:21px;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:460px;width:90%;max-height:80vh;overflow-y:auto;font-family:system-ui,"Microsoft YaHei",sans-serif;';
                box.innerHTML = '<div style="font-size:16px;font-weight:600;color:#5d3a82;margin-bottom:13px;"><span class="type-char char-dao" style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;font-size:12px;font-weight:700;line-height:1;vertical-align:middle;margin-right:5px;background:linear-gradient(135deg,#ab47bc,#7b1fa2);color:#fff;box-shadow:0 2px 4px rgba(123,31,162,0.2);">道</span>道传排盘逻辑详情</div>' + html + '<div id="__daoLogicClose" style="margin-top:13px;text-align:center;"><button style="padding:8px 28px;border:none;border-radius:8px;background:#7b1fa2;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">关闭</button></div>';

                overlay.appendChild(box);
                document.body.appendChild(overlay);

                var btnCloseDaoLogic = box.querySelector('#__daoLogicClose button');
                if (btnCloseDaoLogic) btnCloseDaoLogic.addEventListener('click', function() { overlay.remove(); });
            }