/**
 * API Client for SME Retention Intelligence.
 */

import {
  OverviewData,
  PaginatedSMEs,
  SMEDetail,
  FeatureDefinition,
  VelocityFinding,
  PrioritizationSummary,
  ModelEvaluation
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${BASE_URL.replace(/\/$/, '')}/api/v1`;

export async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to fetch executive overview');
  return res.json();
}

export async function fetchSMEs(params: {
  page?: number;
  pageSize?: number;
  priorityTier?: string;
  industry?: string;
  region?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PaginatedSMEs> {
  const q = new URLSearchParams();
  if (params.page) q.append('page', params.page.toString());
  if (params.pageSize) q.append('page_size', params.pageSize.toString());
  if (params.priorityTier && params.priorityTier !== 'All') q.append('priority_tier', params.priorityTier);
  if (params.industry && params.industry !== 'All') q.append('industry', params.industry);
  if (params.region && params.region !== 'All') q.append('region', params.region);
  if (params.search) q.append('search', params.search);
  if (params.sortBy) q.append('sort_by', params.sortBy);
  if (params.sortOrder) q.append('sort_order', params.sortOrder);

  const res = await fetch(`${API_BASE}/smes?${q.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch SME portfolio');
  return res.json();
}

export async function fetchSMEDetail(smeId: string): Promise<SMEDetail> {
  const res = await fetch(`${API_BASE}/smes/${smeId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for ${smeId}`);
  return res.json();
}

export async function fetchFeatureRegistry(): Promise<FeatureDefinition[]> {
  const res = await fetch(`${API_BASE}/features/registry`);
  if (!res.ok) throw new Error('Failed to fetch feature registry');
  return res.json();
}

export async function fetchFeatureDistributions(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/features/distributions`);
  if (!res.ok) throw new Error('Failed to fetch feature distributions');
  return res.json();
}

export async function fetchVelocityFinding(): Promise<VelocityFinding> {
  const res = await fetch(`${API_BASE}/statistics/velocity`);
  if (!res.ok) throw new Error('Failed to fetch velocity finding');
  return res.json();
}

export async function fetchStatisticalTests(): Promise<any> {
  const res = await fetch(`${API_BASE}/statistics/feature-tests`);
  if (!res.ok) throw new Error('Failed to fetch statistical tests');
  return res.json();
}

export async function fetchModelEvaluation(modelId: string = 'logistic_regression'): Promise<ModelEvaluation> {
  const res = await fetch(`${API_BASE}/models/${modelId}/evaluation`);
  if (!res.ok) throw new Error(`Failed to fetch evaluation for model ${modelId}`);
  return res.json();
}

export async function fetchPrioritizationSummary(): Promise<PrioritizationSummary> {
  const res = await fetch(`${API_BASE}/prioritization/summary`);
  if (!res.ok) throw new Error('Failed to fetch prioritization summary');
  return res.json();
}

export async function recalculatePrioritization(thresholds: {
  tier1_prob_threshold: number;
  tier1_exposure_threshold: number;
  tier2_prob_threshold: number;
  tier2_exposure_threshold: number;
}): Promise<PrioritizationSummary> {
  const res = await fetch(`${API_BASE}/prioritization/recalculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  });
  if (!res.ok) throw new Error('Failed to recalculate prioritization');
  return res.json();
}

export async function fetchDatasetMetadata(): Promise<any> {
  const res = await fetch(`${API_BASE}/datasets/metadata`);
  if (!res.ok) throw new Error('Failed to fetch dataset metadata');
  return res.json();
}

export async function fetchVerificationSummaryReport(): Promise<{ markdown: string }> {
  const res = await fetch(`${API_BASE}/reports/verification-summary`);
  if (!res.ok) throw new Error('Failed to fetch verification summary');
  return res.json();
}
