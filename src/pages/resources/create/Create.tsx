/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

export default function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('resources'), href: '/resources' },
    { name: t('new_resource'), href: '/resources/create' },
  ];

  return (
    <Default title={t('new_resource')} breadcrumbs={pages}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('create_resource')}</h1>
        <p className="text-gray-600 mt-2">Resource creation form coming soon...</p>
      </div>
    </Default>
  );
} 