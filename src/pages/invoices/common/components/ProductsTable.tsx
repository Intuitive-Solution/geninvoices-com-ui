/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { AlignJustify, Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  isLineItemEmpty,
  useResolveInputField,
} from '../hooks/useResolveInputField';
import { useResolveTranslation } from '../hooks/useResolveTranslation';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { resolveColumnWidth } from '../helpers/resolve-column-width';
import { resolveProperty } from '../helpers/resolve-property';
import { arrayMoveImmutable } from 'array-move';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { atom, useSetAtom } from 'jotai';
import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { Tooltip } from '$app/components/Tooltip';

export type ProductTableResource = Invoice | RecurringInvoice | PurchaseOrder;
export type RelationType = 'client_id' | 'vendor_id';

export const isDeleteActionTriggeredAtom = atom<boolean | undefined>(undefined);

interface Props {
  type: 'product' | 'resource';
  resource: ProductTableResource;
  items: InvoiceItem[];
  columns: string[];
  relationType: RelationType;
  onLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  onSort: (lineItems: InvoiceItem[]) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  onDeleteRowClick: (index: number) => unknown;
  onCreateItemClick: () => unknown;
  shouldCreateInitialLineItem?: boolean;
}

export function ProductsTable(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const themeColors = useThemeColorScheme();

  const { resource, items, columns, relationType } = props;

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  const resolveTranslation = useResolveTranslation({ type: props.type });

  const resolveInputField = useResolveInputField({
    type: props.type,
    resource: props.resource,
    onLineItemChange: props.onLineItemChange,
    onLineItemPropertyChange: props.onLineItemPropertyChange,
    relationType,
    createItem: props.onCreateItemClick,
    deleteLineItem: props.onDeleteRowClick,
  });

  const onDragEnd = (result: any) => {
    if (result.source.index === result.destination?.index) {
      return;
    }

    // Use arrayMoveImmutable on the filtered items array, then merge back
    const sorted = arrayMoveImmutable(
      items,
      result.source.index,
      result.destination?.index as number
    );

    // Now we need to reconstruct the full line_items array with the sorted items
    const allLineItems = [...props.resource.line_items];
    
    // Replace the items of this type with the sorted ones
    let sortedIndex = 0;
    for (let i = 0; i < allLineItems.length; i++) {
      if (items.includes(allLineItems[i])) {
        allLineItems[i] = sorted[sortedIndex++];
      }
    }

    return props.onSort(allLineItems);
  };

  const isAnyLineItemEmpty = () => {
    return items.some((lineItem) => isLineItemEmpty(lineItem));
  };

  const getLineItemIndex = (lineItem: InvoiceItem) => {
    return resource.line_items.indexOf(lineItem);
  };

  const getLocalIndex = (lineItem: InvoiceItem) => {
    return items.indexOf(lineItem);
  };

  // Helper function to get display value for tooltips
  const getTooltipValue = (lineItem: InvoiceItem, column: string) => {
    const property = resolveProperty(column);
    
    switch (property) {
      case 'product_key':
        return lineItem.product_key || 'No product selected';
      case 'notes':
        return lineItem.notes || 'No description';
      case 'unit':
        return lineItem.unit || 'No unit';
      case 'cost':
        return lineItem.cost ? `$${parseFloat(lineItem.cost.toString()).toFixed(2)}` : 'No cost';
      case 'quantity':
        return lineItem.quantity ? lineItem.quantity.toString() : 'No quantity';
      case 'billable_time':
        return lineItem.billable_time ? lineItem.billable_time.toString() : 'No billable time';
      case 'line_total':
        return lineItem.line_total ? `$${parseFloat(lineItem.line_total.toString()).toFixed(2)}` : 'No total';
      case 'discount':
        return lineItem.discount ? `${lineItem.discount}%` : 'No discount';
      case 'tax_rate1':
        return lineItem.tax_rate1 ? `${lineItem.tax_rate1}%` : 'No tax';
      default:
        return lineItem[property as keyof InvoiceItem]?.toString() || 'No value';
    }
  };

  // This portion of the code pertains to the automatic creation of line items.
  // Currently, we do not support this functionality, and we will comment it out until we begin providing support for it.

  /*useEffect(() => {
    if (
      (resource.client_id || resource.vendor_id) &&
      !resource.line_items.length &&
      (shouldCreateInitialLineItem ||
        typeof shouldCreateInitialLineItem === 'undefined') &&
      !isEditPage
    ) {
      props.onCreateItemClick();
    }
  }, [resource.client_id, resource.vendor_id]); */

  return (
    <Table>
      <Thead backgroundColor={themeColors.$5}>
        {columns.map((column, index) => (
          <Th key={index} textColor={themeColors.$6}>
            {resolveTranslation(column)}
          </Th>
        ))}
      </Thead>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="product-table">
          {(provided) => (
            <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
              {items.map((lineItem, index) => (
                <Draggable
                  key={getLocalIndex(lineItem)}
                  draggableId={getLocalIndex(lineItem).toString()}
                  index={getLocalIndex(lineItem)}
                >
                  {(provided) => (
                    <Tr
                      innerRef={provided.innerRef}
                      key={getLocalIndex(lineItem)}
                      tabIndex={index + 1}
                      {...provided.draggableProps}
                    >
                      {columns.map((column, columnIndex, { length }) => (
                        <Td
                          width={resolveColumnWidth(column)}
                          key={columnIndex}
                        >
                         
                          {length - 1 !== columnIndex && (
                            <Tooltip
                              message={getTooltipValue(lineItem, column)}
                              placement="top"
                              size="regular"
                            >
                              <div
                                className={classNames({
                                  'flex  items-center space-x-3':
                                    columnIndex === 0,
                                })}
                              >
                                {columnIndex === 0 ? (
                                  <button {...provided.dragHandleProps}>
                                    <AlignJustify size={18} />
                                  </button>
                                ) : null}

                                {resolveInputField(
                                  column,
                                  getLineItemIndex(lineItem)
                                )}
                              </div>
                            </Tooltip>
                          )}

                          {length - 1 === columnIndex && (
                            <Tooltip
                              message={getTooltipValue(lineItem, column)}
                              placement="top"
                              size="regular"
                            >
                              <div className="flex justify-between items-center">
                                {resolveInputField(
                                  column,
                                  getLineItemIndex(lineItem)
                                )}

                                {resource && (
                                  <button
                                    style={{ color: colors.$3 }}
                                    className="ml-2 text-gray-600 hover:text-red-600"
                                    onClick={() => {
                                      setIsDeleteActionTriggered(true);

                                      props.onDeleteRowClick(
                                        getLineItemIndex(lineItem)
                                      );
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            </Tooltip>
                          )}
                        </Td>
                      ))}
                    </Tr>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <Tr className="bg-slate-100 hover:bg-slate-200">
                <Td colSpan={100}>
                  <button
                    onClick={() =>
                      !isAnyLineItemEmpty() && props.onCreateItemClick()
                    }
                    className="w-full py-2 inline-flex justify-center items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>
                      {props.type === 'product' ? t('add_item') : t('add_line')}
                    </span>
                  </button>
                </Td>
              </Tr>
            </Tbody>
          )}
        </Droppable>
      </DragDropContext>
    </Table>
  );
}
