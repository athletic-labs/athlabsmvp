'use client';

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { TextField } from './TextField';

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: number | string;
  minWidth?: number;
  render?: (value: any, row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  rowKey?: string | ((row: T) => string);
  onRowClick?: (row: T, index: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  density?: 'comfortable' | 'compact' | 'spacious';
  stickyHeader?: boolean;
  maxHeight?: number | string;
  emptyState?: ReactNode;
  bulkActions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: (selectedRows: string[]) => void;
    destructive?: boolean;
  }>;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = 'id',
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  pagination,
  density = 'comfortable',
  stickyHeader = true,
  maxHeight,
  emptyState,
  bulkActions = []
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getRowKey = useCallback((row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return (row as any)[rowKey] || index.toString();
  }, [rowKey]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = data.map((row, index) => getRowKey(row, index));
      onSelectionChange?.(allKeys);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, rowId]);
    } else {
      onSelectionChange?.(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const densityClasses = {
    comfortable: 'py-4 px-6',
    compact: 'py-2 px-4', 
    spacious: 'py-6 px-8'
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="md3-surface-container rounded-xl overflow-hidden">
      {/* Header with search and bulk actions */}
      {(searchable || bulkActions.length > 0) && (
        <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="flex-1 max-w-md">
                <TextField
                  variant="outlined"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  leadingIcon={<Search className="w-4 h-4" />}
                />
              </div>
            )}
            
            {selectedRows.length > 0 && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
                  {selectedRows.length} selected
                </span>
                {bulkActions.map((action) => (
                  <Button
                    key={action.key}
                    variant={action.destructive ? 'outlined' : 'text'}
                    size="small"
                    leftIcon={action.icon}
                    onClick={() => action.onClick(selectedRows)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table container */}
      <div 
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)]">
              {selectable && (
                <th className={cn('text-left', densityClasses[density])}>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <div className={cn(
                        'w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors',
                        isAllSelected || isIndeterminate
                          ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]'
                          : 'border-[var(--md-sys-color-outline)]'
                      )}>
                        {(isAllSelected || isIndeterminate) && (
                          <Check className="w-3 h-3 text-[var(--md-sys-color-on-primary)]" />
                        )}
                      </div>
                    </label>
                  </div>
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'md3-title-small font-medium text-[var(--md-sys-color-on-surface)]',
                    densityClasses[density],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky && 'sticky left-0 z-20 bg-[var(--md-sys-color-surface-container)]'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth
                  }}
                >
                  {column.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:bg-[var(--md-sys-color-on-surface)]/8 p-1 rounded transition-colors"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.title}
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'w-3 h-3 -mb-1',
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-[var(--md-sys-color-primary)]'
                              : 'text-[var(--md-sys-color-on-surface-variant)]'
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            'w-3 h-3',
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-[var(--md-sys-color-primary)]'
                              : 'text-[var(--md-sys-color-on-surface-variant)]'
                          )}
                        />
                      </div>
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--md-sys-color-primary)]"></div>
                    <span className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-12">
                  {emptyState || (
                    <div className="text-[var(--md-sys-color-on-surface-variant)]">
                      <div className="md3-body-large mb-2">No data available</div>
                      <div className="md3-body-medium">There are no items to display</div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const rowId = getRowKey(row, index);
                const isSelected = selectedRows.includes(rowId);
                
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-b border-[var(--md-sys-color-outline-variant)] transition-colors',
                      'hover:bg-[var(--md-sys-color-on-surface)]/4',
                      isSelected && 'bg-[var(--md-sys-color-primary-container)]/20',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <td className={densityClasses[density]}>
                        <div className="flex items-center">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isSelected}
                              onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className={cn(
                              'w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors',
                              isSelected
                                ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]'
                                : 'border-[var(--md-sys-color-outline)]'
                            )}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-[var(--md-sys-color-on-primary)]" />
                              )}
                            </div>
                          </label>
                        </div>
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'md3-body-medium text-[var(--md-sys-color-on-surface)]',
                          densityClasses[density],
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sticky && 'sticky left-0 bg-[var(--md-sys-color-surface)] border-r border-[var(--md-sys-color-outline-variant)]'
                        )}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth
                        }}
                      >
                        {column.render 
                          ? column.render((row as any)[column.key], row, index)
                          : (row as any)[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Rows per page:
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="md3-text-field-outlined py-1 px-2 min-w-0"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="text"
                size="small"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="text"
                size="small"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}