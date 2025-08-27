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
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Employees = lazy(() => import('$app/pages/employees/index/Employees'));
const Create = lazy(() => import('$app/pages/employees/create/Create'));
const Edit = lazy(() => import('$app/pages/employees/edit/Edit'));

export const employeeRoutes = (
  <Route path="/employees">
    <Route
      path=""
      element={
        <Guard
          guards={[permission('view_employee')]}
          component={<Employees />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[permission('create_employee')]}
          component={<Create />}
        />
      }
    />
    <Route
      path=":id/edit"
      element={
        <Guard
          guards={[permission('edit_employee')]}
          component={<Edit />}
        />
      }
    />
  </Route>
);