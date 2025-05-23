/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useAllResourceColumns,
  useResourceColumns,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { permission } from '$app/common/guards/guards/permission';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

export default function Resources() {
  useTitle('resources');

  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('resources'), href: '/resources' }];

  const columns = useResourceColumns();

  const actions = useActions();

  const resourceColumns = useAllResourceColumns();

  return (
    <Default title={t('resources')} breadcrumbs={pages} docsLink="en/resources">
      <DataTable
        resource="resource"
        endpoint="/api/v1/resources?include=user,assigned_user&sort=id|desc"
        columns={columns}
        bulkRoute="/api/v1/resources/bulk"
        linkToCreate="/resources/create"
        linkToEdit="/resources/:id/edit"
        customActions={actions}
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={resourceColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="expense"
          />
        }
        linkToCreateGuards={[permission('create_expense')]}
        hideEditableOptions={!hasPermission('edit_expense')}
      />
    </Default>
  );
} 