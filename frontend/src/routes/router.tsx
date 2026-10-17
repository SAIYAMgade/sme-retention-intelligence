import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

import { OverviewPage } from '../features/overview/OverviewPage';
import { PortfolioPage } from '../features/customers/PortfolioPage';
import { CustomerDetailPage } from '../features/customers/CustomerDetailPage';
import { PrioritizationPage } from '../features/risk/PrioritizationPage';
import { FeatureExplorerPage } from '../features/features/FeatureExplorerPage';
import { StatisticalFindingsPage } from '../features/statistics/StatisticalFindingsPage';
import { ModelPerformancePage } from '../features/models/ModelPerformancePage';
import { VolumeAtRiskPage } from '../features/exposure/VolumeAtRiskPage';
import { DataQualityPage } from '../features/quality/DataQualityPage';
import { ReportsExportsPage } from '../features/reports/ReportsExportsPage';
import { MethodologyPage } from '../features/methodology/MethodologyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'customers', element: <PortfolioPage /> },
      { path: 'customers/:smeId', element: <CustomerDetailPage /> },
      { path: 'prioritization', element: <PrioritizationPage /> },
      { path: 'features', element: <FeatureExplorerPage /> },
      { path: 'statistics', element: <StatisticalFindingsPage /> },
      { path: 'models', element: <ModelPerformancePage /> },
      { path: 'exposure', element: <VolumeAtRiskPage /> },
      { path: 'quality', element: <DataQualityPage /> },
      { path: 'reports', element: <ReportsExportsPage /> },
      { path: 'methodology', element: <MethodologyPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
