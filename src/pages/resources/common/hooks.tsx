/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Resource } from '$app/common/interfaces/resource';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdRestore,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { resourceAtom } from './atoms';
import { useSetAtom } from 'jotai';
import { useBulk } from '$app/common/queries/resources';
import { Divider } from '$app/components/cards/Divider';
import { EntityState } from '$app/common/enums/entity-state';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { DynamicLink } from '$app/components/DynamicLink';

export function useActions() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const navigate = useNavigate();
  const bulk = useBulk();

  const setResource = useSetAtom(resourceAtom);

  const cloneToResource = (resource: Resource) => {
    setResource({
      ...resource,
      id: '',
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    navigate('/resources/create?action=clone');
  };

  const actions: Action<Resource>[] = [
    (resource) =>
      hasPermission('create_expense') && (
        <DropdownElement
          onClick={() => cloneToResource(resource)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      ),
    () => <Divider withoutPadding />,
    (resource) =>
      getEntityState(resource) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([resource.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (resource) =>
      (getEntityState(resource) === EntityState.Archived ||
        getEntityState(resource) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([resource.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (resource) =>
      (getEntityState(resource) === EntityState.Active ||
        getEntityState(resource) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([resource.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

export const defaultColumns: string[] = [
  'name',
  'description',
  'rate',
];

export function useAllResourceColumns() {
  const resourceColumns = [
    'name',
    'description',
    'rate',
  ] as const;

  return resourceColumns;
}

export function useResourceColumns() {
  const { t } = useTranslation();

  const formatMoney = useFormatMoney();

  const resourceColumns = useAllResourceColumns();
  type ResourceColumns = (typeof resourceColumns)[number];

  const columns: DataTableColumnsExtended<Resource, ResourceColumns> = [
    {
      column: 'name',
      id: 'name',
      label: t('name'),
      format: (field, resource) => (
        <DynamicLink
          to={route('/resources/:id/edit', { id: resource.id })}
        >
          {field}
        </DynamicLink>
      ),
    },
    {
      column: 'description',
      id: 'description',
      label: t('description'),
      format: (value) => (
        <span className="truncate max-w-xs" title={value as string}>
          {value}
        </span>
      ),
    },
    {
      column: 'rate',
      id: 'rate',
      label: t('rate'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource.company?.settings?.country_id,
          resource.company?.settings?.currency_id
        ),
    },
  ];

  return columns;
}

interface HandleChangeResourceParams {
  setResource: Dispatch<SetStateAction<Resource | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function useHandleChange(params: HandleChangeResourceParams) {
  return (
    property: keyof Resource,
    value: Resource[keyof Resource]
  ) => {
    params.setErrors(undefined);

    params.setResource(
      (current) => current && { ...current, [property]: value }
    );
  };
}

export function useResourceFilters() {
  const [t] = useTranslation();

  const filters = [
    {
      label: t('all'),
      value: 'all',
    },
    {
      label: t('active'),
      value: 'active',
    },
    {
      label: t('archived'),
      value: 'archived',
    },
    {
      label: t('deleted'),
      value: 'deleted',
    },
  ];

  return filters;
} 