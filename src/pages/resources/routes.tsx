/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '$app/common/guards/Guard';
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';

const Resources = lazy(() => import('$app/pages/resources/index/Resources'));
const Create = lazy(() => import('$app/pages/resources/create/Create'));
const Resource = lazy(() => import('$app/pages/resources/Resource'));
const Edit = lazy(() => import('$app/pages/resources/edit/Edit'));

export const resourceRoutes = (
  <Route path="resources">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            or(
              permission('view_expense'),
              permission('create_expense'),
              permission('edit_expense')
            ),
          ]}
          component={<Resources />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            permission('create_expense'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Expenses),
            or(
              permission('view_expense'),
              permission('edit_expense'),
              assigned('/api/v1/resources/:id')
            ),
          ]}
          component={<Resource />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
    </Route>
  </Route>
); 