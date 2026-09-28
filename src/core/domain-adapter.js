// 2.2 仍使用共享 Script scope；本层把页面全局函数指向公共领域构建产物，
// 不复制三数、江氏或道传算法。道传使用唯一的人宫隔支规则。
//
// 结构适配：V2.2 页面沿用嵌套结构 { step, shen: { index, name, cls, meaning, detail } }，
// 公共领域核心使用扁平结构 { index, name, meaning, detail }（且不提供 cls）。
// 本层负责两种结构之间的双向转换，页面与核心各自保持原有契约，互不感知。
(function attachPublicDomain(root) {
    'use strict';
    const domain = root.XiaoliurenDomain;
    if (!domain) throw new Error('public_domain_not_loaded');
    const required = ['calculate', 'generateJiangPai', 'generateJieGuaText', 'generateDaoPai', 'generateDaoJieGuaText'];
    if (required.some(name => typeof domain[name] !== 'function')) throw new Error('public_domain_exports_missing');

    // cls 为页面样式类名，公共领域核心不产出，这里按宫名补回（取自 calculator.js 的 SHEN_CLS）
    function shenCls(name) {
        const map = root.SHEN_CLS;
        return (map && map[name]) || '';
    }

    // 页面嵌套结构 → 核心扁平结构（同时兼容传入已是扁平结构的情况）
    function toFlatAnswers(answers) {
        if (!Array.isArray(answers)) return [];
        return answers.map(function (a, i) {
            const shen = (a && a.shen) ? a.shen : (a || {});
            return {
                index: typeof shen.index === 'number' ? shen.index : i,
                name: shen.name || '',
                meaning: shen.meaning || '',
                detail: shen.detail || ''
            };
        });
    }

    // 核心扁平结果 → 页面嵌套结构（补 step / cls / finalShen）
    root.calculate = function calculate(n1, n2, n3) {
        const result = domain.calculate(n1, n2, n3);
        const answers = (result.answers || []).map(function (a, i) {
            return {
                step: i + 1,
                shen: {
                    index: a.index,
                    name: a.name,
                    cls: shenCls(a.name),
                    meaning: a.meaning,
                    detail: a.detail
                }
            };
        });
        return {
            answers: answers,
            finalShen: {
                index: result.finalIndex,
                name: result.finalName,
                cls: shenCls(result.finalName),
                meaning: result.finalMeaning,
                detail: result.finalDetail
            },
            numbers: result.numbers,
            interpretation: result.interpretation
        };
    };

    root.generateJiangPai = function generateJiangPai(answers, shiChen) {
        return domain.generateJiangPai(toFlatAnswers(answers), shiChen);
    };
    root.generateJieGua = domain.generateJieGuaText;
    root.generateDaoPai = function generateDaoPai(answers, shiChen) {
        return domain.generateDaoPai(toFlatAnswers(answers), shiChen);
    };
    root.generateDaoJieGuaText = domain.generateDaoJieGuaText;
    root.__xiaoliurenDomainAdapter = Object.freeze({
        source: 'serverless/packages/domain',
        ruleSetId: 'dao-human-palace-alternating',
        adapts: 'nested-answers <-> flat-answers'
    });
})(globalThis);
