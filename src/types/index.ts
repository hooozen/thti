// 维度等级
export type Level = 'L' | 'M' | 'H';
export type LevelNum = 1 | 2 | 3;

// 模型代码
export type ModelCode = 'P' | 'A' | 'R' | 'T' | 'S';

// 维度代码（15 个）
export type DimensionCode =
  | 'P1' | 'P2' | 'P3'
  | 'A1' | 'A2' | 'A3'
  | 'R1' | 'R2' | 'R3'
  | 'T1' | 'T2' | 'T3'
  | 'S1' | 'S2' | 'S3';

export const DIMENSION_ORDER: DimensionCode[] = [
  'P1', 'P2', 'P3',
  'A1', 'A2', 'A3',
  'R1', 'R2', 'R3',
  'T1', 'T2', 'T3',
  'S1', 'S2', 'S3',
];

export interface QuestionOption {
  label: string;
  value: 1 | 2 | 3;
}

export interface Question {
  id: string;              // q1..q30
  dimension: DimensionCode;
  text: string;
  options: [QuestionOption, QuestionOption, QuestionOption];
  footnotes?: { term: string; explain: string }[];
  reversed?: boolean;
}

export interface GateQuestion {
  id: 'g1' | 'g2';
  kind: 'gate';
  text: string;
  options: { label: string; value: number; triggers?: 'g2' | 'degen' }[];
}

export interface PersonalityType {
  code: string;            // PRO / SHARK / ...
  cn: string;
  pattern: string;         // "HHH-HHH-HHH-HHH-MHM"
  tagline: string;
  poker: string;           // 牌桌上
  life: string;            // 生活里
  warning: string;
  hidden?: boolean;
}

export interface ScoreResult {
  code: string;
  cn: string;
  pattern: string;
  distance: number;
  similarity: number;
  exactCount: number;
  userPattern: string;
  userVector: LevelNum[];
  dimensionBreakdown: { code: DimensionCode; level: Level; value: LevelNum; raw: number }[];
  secondary?: Omit<ScoreResult, 'secondary'>;
  hiddenTrigger?: 'degen' | 'lucky';
}

export type AnswerMap = Record<string, number>;
