import zhQuestions from './zh-CN/questions.json';
import zhTypes from './zh-CN/types.json';
import zhDimensions from './zh-CN/dimensions.json';
import zhUI from './zh-CN/ui.json';

export type Locale = 'zh-CN' | 'en-US';

// For MVP only zh-CN is loaded; en-US can be added later with same shape.
const bundles = {
  'zh-CN': {
    questions: zhQuestions,
    types: zhTypes,
    dimensions: zhDimensions,
    ui: zhUI,
  },
} as const;

let currentLocale: Locale = 'zh-CN';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function bundle() {
  return bundles[currentLocale as 'zh-CN'];
}

export function ui() {
  return bundle().ui;
}

export function questionsData() {
  return bundle().questions;
}

export function typesData() {
  return bundle().types;
}

export function dimensionsData() {
  return bundle().dimensions;
}

/** Simple template replacer: "第 {current} 题" */
export function tpl(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
