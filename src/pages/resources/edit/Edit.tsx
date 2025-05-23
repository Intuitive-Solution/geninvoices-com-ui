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
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { resourceAtom } from '../common/atoms';
import { useHandleChange } from '../common/hooks';
import { useAtom } from 'jotai';
import { useResourceQuery } from '$app/common/queries/resources';

export default function Edit() {
  const { documentTitle } = useTitle('edit_resource');
  const [t] = useTranslation();

  const { id } = useParams();

  const { data: resourceData } = useResourceQuery({ id });

  const [resource, setResource] = useAtom(resourceAtom);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setResource, setErrors });

  const pages = [
    { name: t('resources'), href: '/resources' },
    { name: t('edit_resource'), href: `/resources/${id}/edit` },
  ];

  useEffect(() => {
    if (resourceData) {
      setResource(resourceData);
    }
  }, [resourceData, setResource]);

  const onSave = () => {
    if (!isFormBusy && resource) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/resources/:id', { id }), resource)
        .then(() => {
          toast.success('updated_resource');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const statusOptions = [
    { value: 'active', label: t('active') },
    { value: 'archived', label: t('archived') },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={onSave}
      disableSaveButton={isFormBusy}
    >
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

          <Element leftSide={t('rate')} required>
            <InputField
              type="number"
              value={resource?.rate || 0}
              onValueChange={(value) => handleChange('rate', parseFloat(value) || 0)}
              errorMessage={errors?.errors.rate}
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
    </Default>
  );
} 