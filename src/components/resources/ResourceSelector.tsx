/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Resource } from '$app/common/interfaces/resource';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { Alert } from '../Alert';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onChange?: (value: Entry<Resource>) => unknown;
  onClearButtonClick?: () => unknown;
  onResourceCreated?: (resource: Resource) => unknown;
  onInputFocus?: () => unknown;
  errorMessage?: string | string[];
  onInputValueChange?: (value: string) => void;
  label?: string | undefined;
  withoutAction?: boolean;
  clearInputAfterSelection?: boolean;
}

export function ResourceSelector(props: Props) {
  const [t] = useTranslation();
  const hasPermission = useHasPermission();

  return (
    <>
      <ComboboxAsync<Resource>
        endpoint={endpoint('/api/v1/resources?per_page=800&status=active')}
        inputOptions={{ value: props.defaultValue ?? null, label: props.label }}
        entryOptions={{
          id: 'id',
          label: 'name',
          value: 'id',
          searchable: 'name,description',
          dropdownLabelFn: (resource) => (
            <div>
              <div className="flex space-x-1">
                <p className="font-semibold">{resource.name}</p>
                <p className="text-sm text-gray-500">
                  (${resource.rate}/month)
                </p>
              </div>
              <p className="text-sm truncate">
                {resource.description?.length > 35
                  ? resource.description.substring(0, 35).concat('...')
                  : resource.description}
              </p>
            </div>
          ),
        }}
        onChange={(resource) => props.onChange && props.onChange(resource)}
        onInputValueChange={props.onInputValueChange}
        action={{
          label: t('new_resource'),
          onClick: () => window.location.href = '/resources/create',
          visible: hasPermission('create_expense') && !props.withoutAction,
        }}
        onDismiss={props.onClearButtonClick}
        sortBy="name|asc"
        nullable
        key="resource_selector"
        clearInputAfterSelection={props.clearInputAfterSelection}
      />

      {props.errorMessage && (
        <Alert type="danger" className="mt-2">
          {props.errorMessage}
        </Alert>
      )}
    </>
  );
} 