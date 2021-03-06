/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  InfraMetricModelCreator,
  InfraMetricModelMetricType,
  InfraMetricModel,
} from '../../adapter_types';
import { InfraMetric } from '../../../../../graphql/types';

// see discussion in: https://github.com/elastic/kibana/issues/42687

export const awsDiskioBytes: InfraMetricModelCreator = (
  timeField,
  indexPattern,
  interval
): InfraMetricModel => ({
  id: InfraMetric.awsDiskioBytes,
  requires: ['aws.ec2'],
  index_pattern: indexPattern,
  map_field_to: 'cloud.instance.id',
  id_type: 'cloud',
  interval: '>=5m',
  time_field: timeField,
  type: 'timeseries',
  series: [
    {
      id: 'writes',
      metrics: [
        {
          field: 'aws.ec2.diskio.write.bytes',
          id: 'sum-diskio-out',
          type: InfraMetricModelMetricType.sum,
        },
        {
          id: 'csum-sum-diskio-out',
          field: 'sum-diskio-out',
          type: InfraMetricModelMetricType.cumulative_sum,
        },
        {
          id: 'deriv-csum-sum-diskio-out',
          unit: '1s',
          type: InfraMetricModelMetricType.derivative,
          field: 'csum-sum-diskio-out',
        },
        {
          id: 'posonly-deriv-csum-sum-diskio-out',
          field: 'deriv-csum-sum-diskio-out',
          type: InfraMetricModelMetricType.positive_only,
        },
      ],
      split_mode: 'everything',
    },
    {
      id: 'reads',
      metrics: [
        {
          field: 'aws.ec2.diskio.read.bytes',
          id: 'sum-diskio-in',
          type: InfraMetricModelMetricType.sum,
        },
        {
          id: 'csum-sum-diskio-in',
          field: 'sum-diskio-in',
          type: InfraMetricModelMetricType.cumulative_sum,
        },
        {
          id: 'deriv-csum-sum-diskio-in',
          unit: '1s',
          type: InfraMetricModelMetricType.derivative,
          field: 'csum-sum-diskio-in',
        },
        {
          id: 'posonly-deriv-csum-sum-diskio-in',
          field: 'deriv-csum-sum-diskio-in',
          type: InfraMetricModelMetricType.positive_only,
        },
        {
          id: 'inverted-posonly-deriv-csum-sum-diskio-in',
          type: InfraMetricModelMetricType.calculation,
          variables: [{ id: 'var-rate', name: 'rate', field: 'posonly-deriv-csum-sum-diskio-in' }],
          script: 'params.rate * -1',
        },
      ],
      split_mode: 'everything',
    },
  ],
});
