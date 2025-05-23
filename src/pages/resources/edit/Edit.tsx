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
import { useParams } from 'react-router-dom';

export default function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('resources'), href: '/resources' },
    { name: t('edit_resource'), href: `/resources/${id}/edit` },
  ];

  return (
    <Default title={t('edit_resource')} breadcrumbs={pages}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('edit_resource')}</h1>
        <p className="text-gray-600 mt-2">Resource editing form coming soon...</p>
      </div>
    </Default>
  );
} 