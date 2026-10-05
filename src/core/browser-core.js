var XiaoliurenDomain = function(exports) {
  "use strict";
  const SHEN_NAMES = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"];
  const SHEN_MEANING = {
    "大安": "平安吉祥，诸事顺利",
    "留连": "事有拖延，需耐心等待",
    "速喜": "喜事临门，快速达成",
    "赤口": "口舌是非，谨慎行事",
    "小吉": "小有吉利，渐进成功",
    "空亡": "谋事落空，徒劳无功"
  };
  const SHEN_DETAIL = {
    "大安": "五行属木，东方，青龙，主数1、5、7",
    "留连": "五行属土，北方，玄武，主数2、8、10",
    "速喜": "五行属火，南方，朱雀，主数3、6、9",
    "赤口": "五行属金，西方，白虎，主数4、7、10",
    "小吉": "五行属水，东方，六合，主数5、8、11",
    "空亡": "五行属土，中央，勾陈，主数6、9、12"
  };
  const COMBOS_MAP = {
    "大安 · 大安 · 大安": "大吉，万事亨通，求谋顺遂，百事皆宜。",
    "大安 · 大安 · 留连": "先难后易，终有贵人助，但需耐心。",
    "大安 · 大安 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "大安 · 大安 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "大安 · 大安 · 小吉": "大吉大利，所求皆遂，贵人扶持。",
    "大安 · 大安 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "大安 · 留连 · 大安": "事有波折，终得安宁，耐心为上。",
    "大安 · 留连 · 留连": "拖延难进，需待时机，不宜妄动。",
    "大安 · 留连 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "大安 · 留连 · 赤口": "事多阻碍，口舌纷争，宜忍让。",
    "大安 · 留连 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "大安 · 留连 · 空亡": "事多落空，徒劳无功，宜谨慎。",
    "大安 · 速喜 · 大安": "喜事连连，万事如意，大吉之兆。",
    "大安 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "大安 · 速喜 · 速喜": "双喜临门，所求速成，大吉大利。",
    "大安 · 速喜 · 赤口": "喜事临门，但防口舌，需谨言慎行。",
    "大安 · 速喜 · 小吉": "吉庆有余，名利双收，万事亨通。",
    "大安 · 速喜 · 空亡": "喜中有虚，需防落空，宜务实。",
    "大安 · 赤口 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "大安 · 赤口 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "大安 · 赤口 · 速喜": "先难后易，终有喜讯，可望成功。",
    "大安 · 赤口 · 赤口": "口舌重重，事多不顺，宜避让。",
    "大安 · 赤口 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "大安 · 赤口 · 空亡": "事多落空，口舌是非，宜守拙。",
    "大安 · 小吉 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "大安 · 小吉 · 留连": "小有成就，但需耐心，不可急躁。",
    "大安 · 小吉 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "大安 · 小吉 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "大安 · 小吉 · 小吉": "吉上加吉，万事如意，大吉之兆。",
    "大安 · 小吉 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "大安 · 空亡 · 大安": "先凶后吉，终得平安，宜耐心。",
    "大安 · 空亡 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "大安 · 空亡 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "大安 · 空亡 · 赤口": "事多口舌，防小人，宜忍让。",
    "大安 · 空亡 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "大安 · 空亡 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "留连 · 大安 · 大安": "先忧后喜，终得安宁，耐心为上。",
    "留连 · 大安 · 留连": "事有拖延，需待时机，不宜妄动。",
    "留连 · 大安 · 速喜": "先难后易，终有喜讯，可望成功。",
    "留连 · 大安 · 赤口": "事多阻碍，口舌纷争，宜忍让。",
    "留连 · 大安 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "留连 · 大安 · 空亡": "事多落空，徒劳无功，宜谨慎。",
    "留连 · 留连 · 大安": "事有转机，终得安宁，耐心为上。",
    "留连 · 留连 · 留连": "拖延难进，需待时机，不宜妄动。",
    "留连 · 留连 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "留连 · 留连 · 赤口": "事多阻碍，口舌纷争，宜忍让。",
    "留连 · 留连 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "留连 · 留连 · 空亡": "事多落空，徒劳无功，宜谨慎。",
    "留连 · 速喜 · 大安": "喜事连连，万事如意，大吉之兆。",
    "留连 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "留连 · 速喜 · 速喜": "双喜临门，所求速成，大吉大利。",
    "留连 · 速喜 · 赤口": "喜事临门，但防口舌，需谨言慎行。",
    "留连 · 速喜 · 小吉": "吉庆有余，名利双收，万事亨通。",
    "留连 · 速喜 · 空亡": "喜中有虚，需防落空，宜务实。",
    "留连 · 赤口 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "留连 · 赤口 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "留连 · 赤口 · 速喜": "先难后易，终有喜讯，可望成功。",
    "留连 · 赤口 · 赤口": "口舌重重，事多不顺，宜避让。",
    "留连 · 赤口 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "留连 · 赤口 · 空亡": "事多落空，口舌是非，宜守拙。",
    "留连 · 小吉 · 大安": "小有成就，终得安宁，耐心为上。",
    "留连 · 小吉 · 留连": "小有成就，但需耐心，不可急躁。",
    "留连 · 小吉 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "留连 · 小吉 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "留连 · 小吉 · 小吉": "吉上加吉，万事如意，大吉之兆。",
    "留连 · 小吉 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "留连 · 空亡 · 大安": "先凶后吉，终得平安，宜耐心。",
    "留连 · 空亡 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "留连 · 空亡 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "留连 · 空亡 · 赤口": "事多口舌，防小人，宜忍让。",
    "留连 · 空亡 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "留连 · 空亡 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "速喜 · 大安 · 大安": "喜事连连，万事如意，大吉之兆。",
    "速喜 · 大安 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "速喜 · 大安 · 速喜": "双喜临门，所求速成，大吉大利。",
    "速喜 · 大安 · 赤口": "喜事临门，但防口舌，需谨言慎行。",
    "速喜 · 大安 · 小吉": "吉庆有余，名利双收，万事亨通。",
    "速喜 · 大安 · 空亡": "喜中有虚，需防落空，宜务实。",
    "速喜 · 留连 · 大安": "先忧后喜，终得安宁，耐心为上。",
    "速喜 · 留连 · 留连": "事有拖延，需待时机，不宜妄动。",
    "速喜 · 留连 · 速喜": "先难后易，终有喜讯，可望成功。",
    "速喜 · 留连 · 赤口": "事多阻碍，口舌纷争，宜忍让。",
    "速喜 · 留连 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "速喜 · 留连 · 空亡": "事多落空，徒劳无功，宜谨慎。",
    "速喜 · 速喜 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "速喜 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "速喜 · 速喜 · 速喜": "三喜临门，万事如意，大吉之兆。",
    "速喜 · 速喜 · 赤口": "喜事临门，但防口舌，需谨言慎行。",
    "速喜 · 速喜 · 小吉": "吉庆有余，名利双收，万事亨通。",
    "速喜 · 速喜 · 空亡": "喜中有虚，需防落空，宜务实。",
    "速喜 · 赤口 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "速喜 · 赤口 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "速喜 · 赤口 · 速喜": "先难后易，终有喜讯，可望成功。",
    "速喜 · 赤口 · 赤口": "口舌重重，事多不顺，宜避让。",
    "速喜 · 赤口 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "速喜 · 赤口 · 空亡": "事多落空，口舌是非，宜守拙。",
    "速喜 · 小吉 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "速喜 · 小吉 · 留连": "小有成就，但需耐心，不可急躁。",
    "速喜 · 小吉 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "速喜 · 小吉 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "速喜 · 小吉 · 小吉": "吉上加吉，万事如意，大吉之兆。",
    "速喜 · 小吉 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "速喜 · 空亡 · 大安": "先凶后吉，终得平安，宜耐心。",
    "速喜 · 空亡 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "速喜 · 空亡 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "速喜 · 空亡 · 赤口": "事多口舌，防小人，宜忍让。",
    "速喜 · 空亡 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "速喜 · 空亡 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "赤口 · 大安 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 大安 · 留连": "事多阻碍，口舌纷争，宜忍让。",
    "赤口 · 大安 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 大安 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 大安 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 大安 · 空亡": "事多落空，口舌是非，宜守拙。",
    "赤口 · 留连 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 留连 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "赤口 · 留连 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 留连 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 留连 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 留连 · 空亡": "事多落空，口舌是非，宜守拙。",
    "赤口 · 速喜 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "赤口 · 速喜 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 速喜 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 速喜 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 速喜 · 空亡": "事多落空，口舌是非，宜守拙。",
    "赤口 · 赤口 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 赤口 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "赤口 · 赤口 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 赤口 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 赤口 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 赤口 · 空亡": "事多落空，口舌是非，宜守拙。",
    "赤口 · 小吉 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 小吉 · 留连": "小有成就，但需耐心，不可急躁。",
    "赤口 · 小吉 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 小吉 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 小吉 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 小吉 · 空亡": "事多落空，口舌是非，宜守拙。",
    "赤口 · 空亡 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "赤口 · 空亡 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "赤口 · 空亡 · 速喜": "先难后易，终有喜讯，可望成功。",
    "赤口 · 空亡 · 赤口": "口舌重重，事多不顺，宜避让。",
    "赤口 · 空亡 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "赤口 · 空亡 · 空亡": "事多落空，口舌是非，宜守拙。",
    "小吉 · 大安 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "小吉 · 大安 · 留连": "小有成就，但需耐心，不可急躁。",
    "小吉 · 大安 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "小吉 · 大安 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "小吉 · 大安 · 小吉": "吉上加吉，万事如意，大吉之兆。",
    "小吉 · 大安 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "小吉 · 留连 · 大安": "小有成就，终得安宁，耐心为上。",
    "小吉 · 留连 · 留连": "事有拖延，需待时机，不宜妄动。",
    "小吉 · 留连 · 速喜": "先难后易，终有喜讯，可望成功。",
    "小吉 · 留连 · 赤口": "事多阻碍，口舌纷争，宜忍让。",
    "小吉 · 留连 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "小吉 · 留连 · 空亡": "事多落空，徒劳无功，宜谨慎。",
    "小吉 · 速喜 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "小吉 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "小吉 · 速喜 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "小吉 · 速喜 · 赤口": "喜事临门，但防口舌，需谨言慎行。",
    "小吉 · 速喜 · 小吉": "吉庆有余，名利双收，万事亨通。",
    "小吉 · 速喜 · 空亡": "喜中有虚，需防落空，宜务实。",
    "小吉 · 赤口 · 大安": "先凶后吉，终得平安，宜忍耐。",
    "小吉 · 赤口 · 留连": "事多阻碍，口舌是非，宜静不宜动。",
    "小吉 · 赤口 · 速喜": "先难后易，终有喜讯，可望成功。",
    "小吉 · 赤口 · 赤口": "口舌重重，事多不顺，宜避让。",
    "小吉 · 赤口 · 小吉": "虽有小吉，但防小人，需谨慎。",
    "小吉 · 赤口 · 空亡": "事多落空，口舌是非，宜守拙。",
    "小吉 · 小吉 · 大安": "大吉大利，所求皆遂，贵人相助。",
    "小吉 · 小吉 · 留连": "小有成就，但需耐心，不可急躁。",
    "小吉 · 小吉 · 速喜": "吉庆之兆，喜事速至，名利双收。",
    "小吉 · 小吉 · 赤口": "先吉后凶，需防口舌，谨慎行事。",
    "小吉 · 小吉 · 小吉": "吉上加吉，万事如意，大吉之兆。",
    "小吉 · 小吉 · 空亡": "吉中藏凶，事多反复，宜守不宜攻。",
    "小吉 · 空亡 · 大安": "先凶后吉，终得平安，宜耐心。",
    "小吉 · 空亡 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "小吉 · 空亡 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "小吉 · 空亡 · 赤口": "事多口舌，防小人，宜忍让。",
    "小吉 · 空亡 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "小吉 · 空亡 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 大安 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 大安 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "空亡 · 大安 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 大安 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 大安 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 大安 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 留连 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 留连 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "空亡 · 留连 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 留连 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 留连 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 留连 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 速喜 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 速喜 · 留连": "喜中有忧，需防小人，谨慎行事。",
    "空亡 · 速喜 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 速喜 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 速喜 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 速喜 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 赤口 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 赤口 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "空亡 · 赤口 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 赤口 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 赤口 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 赤口 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 小吉 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 小吉 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "空亡 · 小吉 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 小吉 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 小吉 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 小吉 · 空亡": "事多落空，徒劳无功，宜守拙。",
    "空亡 · 空亡 · 大安": "先凶后吉，终得平安，宜耐心。",
    "空亡 · 空亡 · 留连": "事多阻滞，需防落空，宜谨慎。",
    "空亡 · 空亡 · 速喜": "先忧后喜，终有佳音，可望成功。",
    "空亡 · 空亡 · 赤口": "事多口舌，防小人，宜忍让。",
    "空亡 · 空亡 · 小吉": "虽有小成，但需努力，不可懈怠。",
    "空亡 · 空亡 · 空亡": "事多落空，徒劳无功，宜守拙。"
  };
  function getRemainder(n) {
    const r = n % 6;
    return r === 0 ? 6 : r;
  }
  function walk(currentIdx, steps) {
    return (currentIdx + steps - 1) % 6;
  }
  function calculate(n1, n2, n3) {
    const r1 = getRemainder(n1);
    const r2 = getRemainder(n2);
    const r3 = getRemainder(n3);
    const idx1 = walk(0, r1);
    const idx2 = walk(idx1, r2);
    const idx3 = walk(idx2, r3);
    const name1 = SHEN_NAMES[idx1];
    const name2 = SHEN_NAMES[idx2];
    const name3 = SHEN_NAMES[idx3];
    const answers = [
      { index: idx1, name: name1, meaning: SHEN_MEANING[name1], detail: SHEN_DETAIL[name1] },
      { index: idx2, name: name2, meaning: SHEN_MEANING[name2], detail: SHEN_DETAIL[name2] },
      { index: idx3, name: name3, meaning: SHEN_MEANING[name3], detail: SHEN_DETAIL[name3] }
    ];
    const comboKey = `${name1} · ${name2} · ${name3}`;
    const interpretation = COMBOS_MAP[comboKey] || "暂无组合断语";
    return {
      numbers: [n1, n2, n3],
      answers,
      finalIndex: idx3,
      finalName: name3,
      finalMeaning: SHEN_MEANING[name3],
      finalDetail: SHEN_DETAIL[name3],
      comboKey,
      interpretation
    };
  }
  const QIN_DESC = {
    "自身": "代表问卦者本人，一切以我为中心",
    "父母": "生我者，代表长辈、文书、学业、房产",
    "兄弟": "同我者，代表朋友、同事、竞争、破财",
    "子孙": "我生者，代表晚辈、下属、投资、福气",
    "妻财": "我克者，代表妻子、财物、感情、收益",
    "官鬼": "克我者，代表事业、压力、疾病、官非"
  };
  const LIU_SHEN_NAMES = ["青龙", "朱雀", "勾陈", "白虎", "玄武", "腾蛇"];
  const LIU_SHEN_DESC = {
    "青龙": "主喜庆、贵人、顺利、婚姻、升迁",
    "朱雀": "主口舌、文书、信息、诉讼、争吵",
    "勾陈": "主勾连、阻滞、旧事、拖延、牵连",
    "白虎": "主凶灾、血光、压力、疾病、刑伤",
    "玄武": "主暗昧、盗贼、暧昧、小人、隐藏",
    "腾蛇": "主虚惊、多疑、缠绕、梦魇、幻象"
  };
  const LIU_XING_NAMES = ["木星", "火星", "土星", "金星", "水星", "天星"];
  const LIU_XING_DESC = {
    "木星": "主生机、扩张、生长，宜积极进取",
    "火星": "主急躁、快速、火爆，宜速战速决",
    "土星": "主迟缓、稳定、厚重，宜耐心等待",
    "金星": "主果断、变革、刚毅，宜果断决策",
    "水星": "主智慧、流动、变通，宜灵活应变",
    "天星": "主虚无、落空、幻想，宜保守观望"
  };
  const DZ_WUXING$1 = {
    "子": "水",
    "丑": "土",
    "寅": "木",
    "卯": "木",
    "辰": "土",
    "巳": "火",
    "午": "火",
    "未": "土",
    "申": "金",
    "酉": "金",
    "戌": "土",
    "亥": "水"
  };
  const YANG_DZ = ["子", "寅", "辰", "午", "申", "戌"];
  const YIN_DZ = ["丑", "卯", "巳", "未", "酉", "亥"];
  function generateJiangPai(answers, shiChen) {
    const renGongName = answers[2].name;
    const renIdx = Math.max(0, SHEN_NAMES.indexOf(renGongName));
    const isYang = YANG_DZ.includes(shiChen);
    const dzList = isYang ? YANG_DZ : YIN_DZ;
    const startIdx = Math.max(0, dzList.indexOf(shiChen));
    // 排地支：以“自身宫（人宫）”起、落“时辰地支”，按阴/阳序列隔位相排（江氏官方“自身宫起”规则）
    const diZhiMap = {};
    for (let i = 0; i < 6; i++) {
      diZhiMap[SHEN_NAMES[i]] = dzList[(startIdx + (i - renIdx) + 12) % 6];
    }
    const selfDz = diZhiMap[renGongName];
    const selfWx = DZ_WUXING$1[selfDz] || "";
    const sheng = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
    const ke = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
    const qinMap = {};
    for (let shenName of SHEN_NAMES) {
      if (shenName === renGongName) {
        qinMap[shenName] = "自身";
        continue;
      }
      const wx = DZ_WUXING$1[diZhiMap[shenName]] || "";
      if (!selfWx || !wx) {
        qinMap[shenName] = "";
        continue;
      }
      if (selfWx === wx) qinMap[shenName] = "兄弟";
      else if (sheng[selfWx] === wx) qinMap[shenName] = "子孙";
      else if (sheng[wx] === selfWx) qinMap[shenName] = "父母";
      else if (ke[selfWx] === wx) qinMap[shenName] = "妻财";
      else if (ke[wx] === selfWx) qinMap[shenName] = "官鬼";
      else qinMap[shenName] = "";
    }
    // 排六神：按身宫（人宫）地支查六神起点表，青龙自起点宫起，顺时针轮转（江氏官方六神起点表）
    const LIU_SHEN_START = { "子": 0, "午": 0, "丑": 1, "未": 1, "寅": 2, "申": 2, "卯": 3, "酉": 3, "辰": 4, "戌": 4, "巳": 5, "亥": 5 };
    const shenStart = LIU_SHEN_START[shiChen] ?? 0;
    const shenMap = {};
    for (let i = 0; i < 6; i++) {
      shenMap[SHEN_NAMES[i]] = LIU_SHEN_NAMES[(i - shenStart + 6) % 6];
    }
    // 排六星：自 A 宫（第一落宫）起木星，顺时针木→火→土→金→水→天（江氏官方“自 A 宫起木星”）
    const aIdx = Math.max(0, answers[0].index);
    const xingMap = {};
    for (let i = 0; i < 6; i++) {
      xingMap[SHEN_NAMES[i]] = LIU_XING_NAMES[(i - aIdx + 6) % 6];
    }
    const rows = [];
    for (let i = 0; i < SHEN_NAMES.length; i++) {
      const shenName = SHEN_NAMES[i];
      const dz = diZhiMap[shenName];
      const qin = qinMap[shenName] || "";
      const shen = shenMap[shenName] || "";
      const xing = xingMap[shenName] || "";
      rows.push({
        gong: shenName,
        gongIdx: i,
        dz,
        dzWx: DZ_WUXING$1[dz] || "",
        qin,
        qinDesc: QIN_DESC[qin] || "",
        shen,
        shenDesc: LIU_SHEN_DESC[shen] || "",
        xing,
        xingDesc: LIU_XING_DESC[xing] || ""
      });
    }
    return rows;
  }
  const DZ = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const DZ_WUXING = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
  // 死六神（固定对应每一宫，宫位本体之神；权威口径：留连=腾蛇、空亡=勾陈）
  const SI_LIU_SHEN = [
    { name: "青龙", wx: "木", desc: "主喜庆、贵人、顺利、婚姻、升迁" },
    { name: "腾蛇", wx: "土", desc: "主虚惊、多疑、缠绕、梦魇、幻象" },
    { name: "朱雀", wx: "火", desc: "主口舌、文书、信息、诉讼、喜事" },
    { name: "白虎", wx: "金", desc: "主凶灾、血光、压力、疾病、刑伤" },
    { name: "玄武", wx: "水", desc: "主暗昧、盗贼、暧昧、小人、隐藏" },
    { name: "勾陈", wx: "土", desc: "主阻滞、牵连、旧事、拖延、田宅" }
  ];
  const HUO_LIU_SHEN_ORDER = ["青龙", "朱雀", "勾陈", "白虎", "玄武", "腾蛇"];
  const HUO_LIU_SHEN_DESC = {
    "青龙": "主喜庆、贵人、顺利、婚姻、升迁",
    "朱雀": "主口舌、文书、信息、诉讼、争吵",
    "勾陈": "主勾连、阻滞、旧事、拖延、牵连",
    "白虎": "主凶灾、血光、压力、疾病、刑伤",
    "玄武": "主暗昧、盗贼、暧昧、小人、隐藏",
    "腾蛇": "主虚惊、多疑、缠绕、梦魇、幻象"
  };
  const HUO_SHEN_START_GONG = {
    "子": 0,
    "午": 0,
    // 子/午时起青龙于大安
    "丑": 1,
    "未": 1,
    // 丑/未时起青龙于留连
    "寅": 2,
    "申": 2,
    // 寅/申时起青龙于速喜
    "卯": 3,
    "酉": 3,
    // 卯/酉时起青龙于赤口
    "辰": 4,
    "戌": 4,
    // 辰/戌时起青龙于小吉
    "巳": 5,
    "亥": 5
    // 巳/亥时起青龙于空亡
  };
  const GONG_WUXING = ["木", "土", "火", "金", "水", "土"];
  function calcQin(selfWx, otherWx) {
    if (selfWx === otherWx) return { name: "兄弟", desc: "同我者，代表朋友、同事、竞争、破财" };
    const SHENG = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
    const KE = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
    if (SHENG[otherWx] === selfWx) return { name: "父母", desc: "生我者，代表长辈、文书、学业、房产" };
    if (SHENG[selfWx] === otherWx) return { name: "子孙", desc: "我生者，代表晚辈、下属、投资、福气" };
    if (KE[selfWx] === otherWx) return { name: "妻财", desc: "我克者，代表妻子、财物、感情、收益" };
    if (KE[otherWx] === selfWx) return { name: "官鬼", desc: "克我者，代表事业、压力、疾病、官非" };
    return { name: "自身", desc: "代表问卦者本人，一切以我为中心" };
  }
  function generateDaoPaiWithDzResolver(answers, shiChen, resolveDzIndex) {
    const shiChenIdx = DZ.indexOf(shiChen);
    if (shiChenIdx === -1) return [];
    const rows = [];
    const startGongIdx = HUO_SHEN_START_GONG[shiChen] ?? 0;
    for (let i = 0; i < 3; i++) {
      const gong = answers[i].name;
      const gongIdx = answers[i].index;
      const dzIdx = resolveDzIndex({ shiChenIdx, gongIdx, answers }) % 12;
      const dz = DZ[dzIdx];
      const dzWx = DZ_WUXING[dzIdx];
      const gongWx = GONG_WUXING[gongIdx];
      const siShenObj = SI_LIU_SHEN[gongIdx] || { name: "", wx: "", desc: "" };
      const huoShenIdx = (gongIdx - startGongIdx + 6) % 6;
      const huoShen = HUO_LIU_SHEN_ORDER[huoShenIdx];
      const renWx = GONG_WUXING[answers[2].index];
      const qinObj = i === 2 ? { name: "自身", desc: "代表问卦者本人，一切以我为中心" } : calcQin(renWx, gongWx);
      rows.push({
        position: i === 0 ? "天宫" : i === 1 ? "地宫" : "人宫",
        gong,
        gongIdx,
        dz,
        dzWx,
        gongWx,
        qin: qinObj.name,
        qinDesc: qinObj.desc,
        siShen: siShenObj.name,
        siShenWx: siShenObj.wx,
        siShenDesc: siShenObj.desc,
        huoShen,
        huoShenDesc: HUO_LIU_SHEN_DESC[huoShen] || ""
      });
    }
    return rows;
  }
  function generateDaoPai(answers, shiChen) {
    var _a;
    const renGongIdx = (_a = answers == null ? void 0 : answers[2]) == null ? void 0 : _a.index;
    if (!Number.isInteger(renGongIdx)) return [];
    return generateDaoPaiWithDzResolver(answers, shiChen, ({ shiChenIdx, gongIdx }) => {
      const offset = (gongIdx - renGongIdx + 6) % 6;
      return shiChenIdx + 2 * offset;
    });
  }
  function getDaoStartGongName(shiChen) {
    return SHEN_NAMES[HUO_SHEN_START_GONG[shiChen] ?? 0];
  }
  function generateJieGuaText(rows, renGongName) {
    if (!rows || rows.length === 0) return "";
    const ren = rows.find((r) => r.gong === renGongName);
    if (!ren) return "暂无解卦信息。";
    const qin = ren.qin;
    const shen = ren.shen;
    const xing = ren.xing;
    const parts = [];
    if (qin === "自身") parts.push("此卦以人宫为自身，主问事之人本身状态。");
    else if (qin === "父母") parts.push("父母主长辈、文书、学业、房产等，临此宫需关注相关事宜。");
    else if (qin === "兄弟") parts.push("兄弟主朋友、同事、竞争、破财等，临此宫需注意人际关系与财务。");
    else if (qin === "子孙") parts.push("子孙主晚辈、下属、投资、福气等，临此宫多主福泽与付出。");
    else if (qin === "妻财") parts.push("妻财主财运、感情、女性等，临此宫多主财物与情感之事。");
    else if (qin === "官鬼") parts.push("官鬼主事业、压力、疾病、官非等，临此宫需谨慎应对。");
    if (shen === "青龙") parts.push("青龙主吉庆、喜事、贵人，临此宫多主顺利。");
    else if (shen === "朱雀") parts.push("朱雀主口舌、文书、信息，临此宫需注意沟通与是非。");
    else if (shen === "勾陈") parts.push("勾陈主勾连、阻滞、旧事，临此宫多主牵连与拖延。");
    else if (shen === "白虎") parts.push("白虎主凶灾、血光、压力，临此宫需防范意外。");
    else if (shen === "玄武") parts.push("玄武主暗昧、盗贼、暧昧，临此宫需防小人暗算。");
    else if (shen === "腾蛇" || shen === "螣蛇") parts.push("螣蛇主虚惊、多疑、缠绕，临此宫需放宽心态。");
    if (xing === "木星") parts.push("木星主生机、扩张，宜积极进取。");
    else if (xing === "火星") parts.push("火星主急躁、快速，宜速战速决。");
    else if (xing === "土星") parts.push("土星主迟缓、稳定，宜耐心等待。");
    else if (xing === "金星") parts.push("金星主果断、变革，宜果断决策。");
    else if (xing === "水星") parts.push("水星主智慧、流动，宜灵活应变。");
    else if (xing === "天星") parts.push("天空主虚无、落空，宜保守观望。");
    if (parts.length === 0) return "此卦信息不足，请重新起卦。";
    return parts.join(" ");
  }
  function generateDaoJieGuaText(rows, shiChen) {
    if (!rows || rows.length === 0) return "";
    const ren = rows[2];
    const startGongName = getDaoStartGongName(shiChen);
    const shiChenIdx = DZ.indexOf(shiChen);
    const shiChenWx = shiChenIdx >= 0 ? DZ_WUXING[shiChenIdx] : "";
    const shiChenQin = shiChenWx ? calcQin(ren.gongWx, shiChenWx).name : "";
    return [
      "【道传·死活六神双轨合参】",
      `时辰「${shiChen}」→ 青龙起于「${startGongName}」（活六神轮值起点）。`,
      `地支排法：以人宫时辰「${shiChen}」为基准，顺时针隔位相排。`,
      `人宫落${ren.gong}（五行${ren.gongWx}，地支${ren.dz}）：`,
      `死六神「${ren.siShen}」${ren.siShenWx}（${ren.siShenDesc}）；`,
      `活六神「${ren.huoShen}」（${ren.huoShenDesc}）；`,
      `六亲为${ren.qin}（${ren.qinDesc}）。`,
      `时辰（用）「${shiChen}」五行${shiChenWx}，与人宫（体）关系：${shiChenQin}。`,
      "体用：人宫为体（所问之事），时辰为用（外缘之变）；死六神定宫位本体之神、活六神按时轮值观机变，双轨合参断事理。"
    ].join("");
  }
  exports.calculate = calculate;
  exports.generateDaoJieGuaText = generateDaoJieGuaText;
  exports.generateDaoPai = generateDaoPai;
  exports.generateJiangPai = generateJiangPai;
  exports.generateJieGuaText = generateJieGuaText;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({});
