/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks';
import { resourceAtom } from './common/atoms';
import { useEffect, useState } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useResourceQuery } from '$app/common/queries/resources';
import { cloneDeep } from 'lodash';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { useSave } from './edit/hooks/useSave';



export default function Resource() {
  const { documentTitle } = useTitle('edit_resource');

  const [t] = useTranslation();

  const { id } = useParams();

  const hasPermission = useHasPermission();

  const actions = useActions();
  const [resource, setResource] = useAtom(resourceAtom);

  const { data, isLoading } = useResourceQuery({ id });

  const [errors, setErrors] = useState<ValidationBag>();
  const [saveChanges, setSaveChanges] = useState<boolean>(false);

  const save = useSave({ setErrors });

  const pages: Page[] = [
    { name: t('resources'), href: '/resources' },
    { name: t('edit_resource'), href: route('/resources/:id/edit', { id }) },
  ];

  const tabs = [
    {
      name: t('edit'),
      href: route('/resources/:id/edit', { id }),
    },
  ];

  // Clear atom when ID changes
  useEffect(() => {
    setResource(undefined);
  }, [id, setResource]);

  // Set new data when it arrives
  useEffect(() => {
    if (data && data.id === id && !isLoading) {
      const _resource = cloneDeep(data);
      setResource(_resource);
    }
  }, [data, id, setResource, isLoading]);

  useEffect(() => {
    if (saveChanges && resource) {
      save(resource);
      setSaveChanges(false);
    }
  }, [saveChanges, resource, save]);

  return (
    <Default
      key={id}
      title={documentTitle}
      breadcrumbs={pages}
      {...(hasPermission('edit_expense') &&
        resource && {
          navigationTopRight: (
            <ResourceActions
              resource={resource}
              actions={actions}
              onSaveClick={() => setSaveChanges(true)}
              disableSaveButton={resource && resource.is_deleted}
            />
          ),
        })}
    >
      {!isLoading && resource?.id === id ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              resource,
              setResource,
              errors,
              setErrors,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </Default>
  );
} 