/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { Resource } from '$app/common/interfaces/resource';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useHandleChange } from '../common/hooks';
import { useTranslation } from 'react-i18next';

export interface Context {
  resource: Resource | undefined;
  setResource: Dispatch<SetStateAction<Resource | undefined>>;
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export default function Edit() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();

  const {
    resource,
    setResource,
    errors,
    setErrors,
  } = context;

  const handleChange = useHandleChange({ setResource, setErrors });

  const statusOptions = [
    { value: 'active', label: t('active') },
    { value: 'archived', label: t('archived') },
  ];

  if (!resource) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-12 xl:col-span-8 h-max" withScrollableBody>
        <Element leftSide={t('name')} required>
          <InputField
            value={resource?.name || ''}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />
        </Element>

        <Element leftSide={t('description')}>
          <InputField
            element="textarea"
            value={resource?.description || ''}
            onValueChange={(value) => handleChange('description', value)}
            errorMessage={errors?.errors.description}
          />
        </Element>
        <Element leftSide={t('rate') + ' ($) ' + t('per_hour')} required>
          <InputField
            type="number"
            value={resource?.rate_per_hour || 0}
            onValueChange={(value) => handleChange('rate_per_hour', parseFloat(value) || 0)}
            errorMessage={errors?.errors.rate_per_hour}
          />
        </Element>
        <Element leftSide={t('rate') + ' ($) ' + t('per_day')} required>
          <InputField
            type="number"
            value={resource?.rate_per_day || 0}
            onValueChange={(value) => handleChange('rate_per_day', parseFloat(value) || 0)}
            errorMessage={errors?.errors.rate_per_day}
          />
        </Element>
        <Element leftSide={t('rate') + ' ($) ' + t('per_week')} required>
          <InputField
            type="number"
            value={resource?.rate_per_week || 0}
            onValueChange={(value) => handleChange('rate_per_week', parseFloat(value) || 0)}
            errorMessage={errors?.errors.rate_per_week}
          />
        </Element>
        <Element leftSide={t('rate') + ' ($) ' + t('per_month')} required>
          <InputField
            type="number"
            value={resource?.rate_per_month || 0}
            onValueChange={(value) => handleChange('rate_per_month', parseFloat(value) || 0)}
            errorMessage={errors?.errors.rate_per_month}
          />
        </Element>

        <Element leftSide={t('status')}>
          <SelectField
            value={resource?.is_deleted ? 'archived' : 'active'}
            onValueChange={(value) => handleChange('is_deleted', value === 'archived')}
            errorMessage={errors?.errors.is_deleted}
          >
            {statusOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </Element>
      </Card>
    </div>
  );
} 