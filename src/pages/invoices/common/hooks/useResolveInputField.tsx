/* eslint-disable react/display-name */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resolveProperty } from '$app/pages/invoices/common/helpers/resolve-property';
import { useHandleProductChange } from './useHandleProductChange';
import { InputField } from '$app/components/forms';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useFormatMoney } from './useFormatMoney';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { useGetCurrencySeparators } from '$app/common/hooks/useGetCurrencySeparators';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { ProductSelector } from '$app/components/products/ProductSelector';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CustomField } from '$app/components/CustomField';
import {
  ProductTableResource,
  RelationType,
  isDeleteActionTriggeredAtom,
} from '../components/ProductsTable';
import { useHandleTaxRateChange } from './useHandleTaxRateChange';
import { Product } from '$app/common/interfaces/product';
import { useAtom } from 'jotai';
import collect from 'collect.js';
import {
  TaxCategorySelector,
  useTaxCategories,
} from '$app/components/tax-rates/TaxCategorySelector';
import { Inline } from '$app/components/Inline';
import { FiRepeat } from 'react-icons/fi';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useLocation } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import {
  getTaxRateComboValue,
  TaxNamePropertyType,
} from '$app/common/helpers/tax-rates/tax-rates-combo';
import { ResourceSelector } from '$app/components/resources/ResourceSelector';
import { Resource } from '$app/common/interfaces/resource';
import { UnitSelector } from '$app/components/resources/UnitSelector';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';

const numberInputs = [
  'discount',
  'cost',
  'unit_cost',
  'quantity',
  'billable_time',
  'rate',
  'hours',
];

const taxInputs = ['tax_rate1', 'tax_rate2', 'tax_rate3'];

const defaultCurrencySeparators: DecimalInputSeparators = {
  decimalSeparator: '.',
  precision: 2,
  thousandSeparator: ',',
};

interface Props {
  resource: ProductTableResource;
  type: 'product' | 'resource';
  relationType: RelationType;
  onLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  createItem: () => unknown;
  deleteLineItem: (index: number) => unknown;
}

export const isLineItemEmpty = (lineItem: InvoiceItem) => {
  const properties = Object.keys(lineItem);

  return !properties.some((property) => {
    return (
      property !== '_id' &&
      property !== 'type_id' &&
      property !== 'is_amount_discount' &&
      lineItem[property as keyof InvoiceItem]
    );
  });
};

export function useResolveInputField(props: Props) {
  const location = useLocation();
  const [t] = useTranslation();

  const [inputCurrencySeparators, setInputCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [isDeleteActionTriggered, setIsDeleteActionTriggered] = useAtom(
    isDeleteActionTriggeredAtom
  );
  
  // Track current resources for each line item
  const [currentResources, setCurrentResources] = useState<Record<number, Resource | null>>({});

  const isAnyExceptLastLineItemEmpty = (items: InvoiceItem[]) => {
    const filteredItems = items.filter(
      (item, index) => index !== items.length - 1
    );

    return filteredItems.some((lineItem) => isLineItemEmpty(lineItem));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cleanLineItemsList = useCallback(
    (lineItems: InvoiceItem[]) => {
      let typeId = InvoiceItemType.Product;

      if (props.type === 'resource') {
        typeId = InvoiceItemType.Resource;
      }

      const typeFilteredLineItems = lineItems.filter(
        ({ type_id }) => type_id === typeId
      );

      const lineItemsLength = typeFilteredLineItems.length;

      const lastLineItem = typeFilteredLineItems[lineItemsLength - 1];

      if (lineItemsLength > 0) {
        if (
          !isAnyExceptLastLineItemEmpty(typeFilteredLineItems) &&
          !isLineItemEmpty(lastLineItem)
        ) {
          props.createItem();
        }

        if (
          isAnyExceptLastLineItemEmpty(typeFilteredLineItems) &&
          isLineItemEmpty(lastLineItem)
        ) {
          const lastLineItemIndex = lineItems.indexOf(
            typeFilteredLineItems[lineItemsLength - 1]
          );

          if (lastLineItemIndex > -1) {
            props.deleteLineItem(lastLineItemIndex);
          }
        }
      }
    },
    [props.resource.line_items]
  );

  const handleProductChange = useHandleProductChange({
    relationType: props.relationType,
    resource: props.resource,
    type: props.type,
    onChange: props.onLineItemChange,
  });

  const handleTaxRateChange = useHandleTaxRateChange({
    resource: props.resource,
    type: props.type,
    onChange: props.onLineItemChange,
  });

  const onChange = async (
    key: keyof InvoiceItem,
    value: string | number | boolean,
    index: number
  ) => {
    setIsDeleteActionTriggered(false);

    await props.onLineItemPropertyChange(key, value, index);
  };

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();
  const resource = props.resource;

  const onProductChange = async (
    index: number,
    value: string,
    product: Product | null
  ) => {
    setIsDeleteActionTriggered(false);

    const updatedProduct = cloneDeep(product) as Product;

    if (product && company && company.enabled_item_tax_rates === 0) {
      updatedProduct.tax_name1 = '';
      updatedProduct.tax_rate1 = 0;
      updatedProduct.tax_name2 = '';
      updatedProduct.tax_rate2 = 0;
      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    if (product && company && company.enabled_item_tax_rates === 1) {
      updatedProduct.tax_name2 = '';
      updatedProduct.tax_rate2 = 0;
      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    if (product && company && company.enabled_item_tax_rates === 2) {
      updatedProduct.tax_name3 = '';
      updatedProduct.tax_rate3 = 0;
    }

    await handleProductChange(index, value, updatedProduct);
  };

  const formatMoney = useFormatMoney({
    resource: props.resource,
    relationType: props.relationType,
  });

  const getCurrency = useGetCurrencySeparators(setInputCurrencySeparators);

  useEffect(() => {
    if (resource[props.relationType]) {
      getCurrency(resource[props.relationType], props.relationType);
    } else {
      setInputCurrencySeparators(defaultCurrencySeparators);
    }
  }, [resource?.[props.relationType]]);

  useEffect(() => {
    // if (isDeleteActionTriggered === false) {
    //   cleanLineItemsList(resource?.line_items);
    // } // Disabled, causing infinite loop of line items
  }, [resource?.line_items, isDeleteActionTriggered]);

  const taxCategories = useTaxCategories();
  const { preferences } = usePreferences();

  const showTaxRateSelector = (
    property: 'tax_rate1' | 'tax_rate2' | 'tax_rate3',
    index: number
  ) => {
    // Do this only if `calculate_taxes` is enabled
    if (company.calculate_taxes) {
      const lineItem = resource?.line_items[index];

      // If the value is set to override taxes (7), show the regular element
      if (lineItem.tax_id === '7' || lineItem.tax_id === '') {
        return (
          <Inline>
            <TaxRateSelector
              key={`${property}${resource?.line_items[index][property]}`}
              onChange={(value) =>
                value.resource &&
                handleTaxRateChange(property, index, value.resource)
              }
              onTaxCreated={(taxRate) =>
                handleTaxRateChange(property, index, taxRate)
              }
              defaultValue={getTaxRateComboValue(
                resource?.line_items[index],
                property.replace('rate', 'name') as TaxNamePropertyType
              )}
              onClearButtonClick={() => handleTaxRateChange(property, index)}
            />

            {property === 'tax_rate1' ? (
              <button
                type="button"
                onClick={() => onChange('tax_id', '1', index)}
              >
                <FiRepeat />
              </button>
            ) : null}
          </Inline>
        );
      }

      const categories = collect(taxCategories)
        .pluck('value')
        .filter((i) => i !== '7')
        .toArray();

      if (categories.includes(lineItem.tax_id) && property === 'tax_rate1') {
        return (
          <Inline>
            <TaxCategorySelector
              value={lineItem.tax_id}
              onChange={(taxCategory) =>
                onChange('tax_id', taxCategory.value, index)
              }
            />
          </Inline>
        );
      }

      return null;
    }

    return (
      <TaxRateSelector
        key={`${property}${resource?.line_items[index][property]}`}
        onChange={(value) =>
          value.resource && handleTaxRateChange(property, index, value.resource)
        }
        onTaxCreated={(taxRate) =>
          handleTaxRateChange(property, index, taxRate)
        }
        defaultValue={getTaxRateComboValue(
          resource?.line_items[index],
          property.replace('rate', 'name') as TaxNamePropertyType
        )}
        onClearButtonClick={() => handleTaxRateChange(property, index)}
      />
    );
  };

  const getRateByUnit = (resource: Resource, unit: string): number => {
    switch (unit) {
      case 'hour':
        return resource.rate_per_hour || 0;
      case 'day':
        return resource.rate_per_day || 0;
      case 'week':
        return resource.rate_per_week || 0;
      case 'month':
        return resource.rate_per_month || 0;
      default:
        return resource.rate_per_hour || 0;
    }
  };

  const onResourceChange = async (
    index: number,
    value: string,
    resource: Resource | null
  ) => {
    setIsDeleteActionTriggered(false);

    // Store the resource data for this line item
    setCurrentResources(prev => ({
      ...prev,
      [index]: resource
    }));

    if (resource) {
      const lineItem = { ...props.resource.line_items[index] };
      const currentUnit = lineItem.unit || 'hour';
      const rate = getRateByUnit(resource, currentUnit);
      
      lineItem.product_key = resource.name;
      lineItem.notes = resource.description || '';
      lineItem.cost = rate;
      lineItem.quantity = 1;
      lineItem.billable_time = lineItem.billable_time || 1;
      lineItem.resource_id = resource.id;
      
      // Store the formatted rate with unit in the unit field
      const formattedRate = formatMoney(rate);
      const unitLabel = currentUnit === 'hour' ? t('per_hour') : 
                       currentUnit === 'day' ? t('per_day') : 
                       currentUnit === 'week' ? t('per_week') : 
                       currentUnit === 'month' ? t('per_month') : 
                       `${t('per')} ${currentUnit}`;
      
      lineItem.unit = `${formattedRate} ${unitLabel}`;
      
      await props.onLineItemChange(index, lineItem);
    } else {
      await onChange('product_key', value, index);
    }
  };

  const onUnitChange = async (index: number, unit: string) => {
    console.log('onUnitChange', index, unit);
    setIsDeleteActionTriggered(false);
    
    const lineItem = { ...props.resource.line_items[index] };

    console.log('lineItem', lineItem);
    console.log('props.type', props.type);
    
    // If there's a resource selected, try to update the rate based on the new unit
    if (lineItem.resource_id && props.type === 'resource') {
      try {
        console.log('lineItem.resource_id', lineItem.resource_id);
        // Fetch the resource to get the correct rate for the selected unit
        const response = await request('GET', endpoint('/api/v1/resources/:id', { id: lineItem.resource_id }));
        console.log('response', response);
        const resource = response.data.data;
        
        if (resource) {
          const rate = getRateByUnit(resource, unit);
          lineItem.cost = rate;
          
          // Store the formatted rate with unit in the unit field
          const formattedRate = formatMoney(rate);
          const unitLabel = unit === 'hour' ? t('per_hour') : 
                           unit === 'day' ? t('per_day') : 
                           unit === 'week' ? t('per_week') : 
                           unit === 'month' ? t('per_month') : 
                           `${t('per')} ${unit}`;
          
          lineItem.unit = `${formattedRate} ${unitLabel}`;
        }
      } catch (error) {
        // If we can't fetch the resource, just update the unit without changing the rate
        console.warn('Could not fetch resource data to update rate:', error);
        lineItem.unit = unit;
      }
    } else {
      lineItem.unit = unit;
    }
    
    await props.onLineItemChange(index, lineItem);
  };

  return (key: string, index: number) => {
    const property = resolveProperty(key);
    
    if (property === 'unit') {
      // For resources, show the unit selector with resource data
      if (props.type === 'resource') {
        const lineItem = resource?.line_items[index];
        const resourceData = currentResources[index];
        
        // If no resource is selected, show read-only empty field
        if (!lineItem?.resource_id) {
          return (
            <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-md">
              {resource?.line_items[index][property] || ''}
            </div>
          );
        }
        
        // Extract the current unit from the stored formatted value
        const currentFormattedUnit = lineItem.unit || '';
        let currentUnit = 'hour'; // default
        
        if (currentFormattedUnit.includes('per hour')) currentUnit = 'hour';
        else if (currentFormattedUnit.includes('per day')) currentUnit = 'day';
        else if (currentFormattedUnit.includes('per week')) currentUnit = 'week';
        else if (currentFormattedUnit.includes('per month')) currentUnit = 'month';
        
        // If we have resource data, use it; otherwise, the UnitSelector will fetch it when needed
        return (
          <UnitSelector
            key={`${property}${index}_${lineItem?.resource_id}`}
            value={currentUnit}
            onChange={(value) => onUnitChange(index, value)}
            className="w-auto"
            resource={resourceData}
            resourceId={lineItem.resource_id}
          />
        );
      }
      
      // For products, show the regular unit selector
      return (
        <UnitSelector
          key={`${property}${index}`}
          value={resource?.line_items[index][property] || 'hour'}
          onChange={(value) => onUnitChange(index, value)}
          className="w-auto"
          resource={null}
        />
      );
    }
    
    if (property === 'product_key') {
      if (props.type === 'resource') {
        return (
          <ResourceSelector
            key={`${property}${resource?.line_items[index][property]}`}
            onChange={(value) =>
              onResourceChange(index, value.label, value.resource)
            }
            className="w-auto"
            defaultValue={resource?.line_items[index][property]}
            clearButton
            onInputValueChange={(value: string) => onChange('product_key', value, index)}
            onClearButtonClick={() => onResourceChange(index, '', null)}
          />
        );
      }

      return (
        <ProductSelector
          key={`${property}${resource?.line_items[index][property]}`}
          onChange={(value) =>
            onProductChange(index, value.label, value.resource)
          }
          className="w-auto"
          defaultValue={resource?.line_items[index][property]}
          onProductCreated={(product) =>
            product && onProductChange(index, product.product_key, product)
          }
          clearButton
          onInputValueChange={(value: string) => onChange('product_key', value, index)}
          onClearButtonClick={() => handleProductChange(index, '', null)}
          displayStockQuantity={location.pathname.startsWith('/invoices')}
        />
      );
    }

    if (property === 'notes') {
      return (
        <InputField
          id={property}
          key={`${property}${index}`}
          element="textarea"
          value={resource?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, event.target.value, index)
          }
          style={{ marginTop: '4px' }}
          textareaRows={preferences.auto_expand_product_table_notes ? 1 : 3}
        />
      );
    }

    if (numberInputs.includes(property)) {
      // Make cost field (displayed as rate) non-editable for resources
      if (property === 'cost' && props.type === 'resource') {
        return (
          <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-md">
            {formatMoney((resource?.line_items[index][property] ?? 0) as number)}
          </div>
        );
      }

      return (
        inputCurrencySeparators && (
          <NumberInputField
            precision={
              property === 'quantity' || property === 'billable_time'
                ? 6
                : reactSettings?.number_precision &&
                  reactSettings?.number_precision > 0 &&
                  reactSettings?.number_precision <= 100
                ? reactSettings.number_precision
                : inputCurrencySeparators?.precision || 2
            }
            id={property}
            value={resource?.line_items[index][property] || ''}
            className="auto"
            onValueChange={(value: string) => {
              onChange(
                property,
                isNaN(parseFloat(value)) ? 0 : parseFloat(value),
                index
              );
            }}
          />
        )
      );
    }

    if ('gross_line_total' === property) {
      return formatMoney(
        (resource?.line_items[index][property] ?? 0) as number
      );
    }

    if ('tax_amount' === property) {
      return formatMoney(
        (resource?.line_items[index][property] ?? 0) as number
      );
    }

    if (taxInputs.includes(property)) {
      return showTaxRateSelector(property as 'tax_rate1', index);
    }

    if (['line_total'].includes(property)) {
      return formatMoney(resource?.line_items[index][property] as number);
    }

    if (['product1', 'product2', 'product3', 'product4'].includes(property)) {
      const field = property.replace(
        'product',
        'custom_value'
      ) as keyof InvoiceItem;

      return company.custom_fields?.[property] ? (
        <CustomField
          field={property}
          defaultValue={resource?.line_items[index][field]}
          value={company.custom_fields?.[property]}
          onValueChange={(value) => onChange(field, value, index)}
          fieldOnly
        />
      ) : (
        <InputField
          id={property}
          value={resource?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, event.target.value, index)
          }
        />
      );
    }

    if (['resource1', 'resource2', 'resource3', 'resource4'].includes(property)) {
      const field = property.replace(
        'resource',
        'custom_value'
      ) as keyof InvoiceItem;

      return company.custom_fields?.[property] ? (
        <CustomField
          field={property}
          defaultValue={resource?.line_items[index][field]}
          value={company.custom_fields?.[property]}
          onValueChange={(value) => onChange(field, value, index)}
          fieldOnly
        />
      ) : (
        <InputField
          id={property}
          value={resource?.line_items[index][property]}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(property, event.target.value, index)
          }
        />
      );
    }

    return (
      <InputField
        id={property}
        value={resource?.line_items[index][property]}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(property, event.target.value, index)
        }
      />
    );
  };
}
