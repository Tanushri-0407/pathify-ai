// Fix: Import `ReactNode` directly from 'react' for type definitions
import { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface ModeAInputs {
  files: File[];
  goal: string;
  skills: string;
}

export interface ModeBInputs {
  skill: string;
  knowledge: string;
  duration: string;
}

export interface ParsedDuration {
  value: number;
  unit: 'days' | 'weeks' | 'months';
  original: string;
}