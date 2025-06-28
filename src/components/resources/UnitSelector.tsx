/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Resource } from '$app/common/interfaces/resource';
import { useState, useEffect } from 'react';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  resource?: Resource | null;
  resourceId?: string;
}

export type UnitType = 'hour' | 'day' | 'week' | 'month';

export function UnitSelector(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const [fetchedResource, setFetchedResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch resource data if resourceId is provided but resource is not
  useEffect(() => {
    if (props.resourceId && !props.resource && !fetchedResource && !isLoading) {
      setIsLoading(true);
      request('GET', endpoint('/api/v1/resources/:id', { id: props.resourceId }))
        .then((response) => {
          setFetchedResource(response.data.data);
        })
        .catch((error) => {
          console.warn('Could not fetch resource data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [props.resourceId, props.resource, fetchedResource, isLoading]);

  const getUnitOptions = (): { value: UnitType; label: string }[] => {
    const resource = props.resource || fetchedResource;
    
    if (resource) {
      return [
        { 
          value: 'hour', 
          label: `${formatMoney(resource.rate_per_hour, undefined, undefined)} ${t('per')} ${t('hour')}` 
        },
        { 
          value: 'day', 
          label: `${formatMoney(resource.rate_per_day, undefined, undefined)} ${t('per')} ${t('day')}` 
        },
        { 
          value: 'week', 
          label: `${formatMoney(resource.rate_per_week, undefined, undefined)} ${t('per')} ${t('week')}` 
        },
        { 
          value: 'month', 
          label: `${formatMoney(resource.rate_per_month, undefined, undefined)} ${t('per')} ${t('month')}` 
        },
      ];
    }

    // Fallback when no resource is provided
    return [
      { value: 'hour', label: t('hour') },
      { value: 'day', label: t('day') },
      { value: 'week', label: t('week') },
      { value: 'month', label: t('month') },
    ];
  };

  const unitOptions = getUnitOptions();

  const handleChange = (value: string) => {
    props.onChange(value);
  };

  return (
    <SelectField
      className={props.className}
      value={props.value || 'hour'}
      onValueChange={handleChange}
      withBlank={false}
    >
      {unitOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
} 