/** @jsxImportSource @emotion/react */

import { forwardRef } from 'react'
import ReactSelect, { type Props } from 'react-select'

import {
  type WithFormHeaderLabelProps,
  type WithFormHeaderLabelWrappedComponentProps,
  withFormHeaderLabel,
} from './form-header-label'

type PassthroughProps =
  | 'name'
  | 'options'
  | 'isMulti'
  | 'isSearchable'
  | 'inputValue'
  | 'onBlur'
  | 'onChange'
  | 'onFocus'
  | 'onInputChange'
  | 'onKeyDown'
  | 'onMenuOpen'
  | 'onMenuClose'
  | 'onMenuScrollToTop'
  | 'onMenuScrollToBottom'
  | 'tabIndex'
  | 'value'

type PlainSelectProps<Option, IsMulti extends boolean = false> = Readonly<
  Pick<Props<Option, IsMulti>, PassthroughProps>
>

// eslint-disable-next-line func-style
function BaseSelect<Option = unknown, IsMulti extends boolean = false>({
  invalid = false,
  ...props
}: WithFormHeaderLabelWrappedComponentProps<PlainSelectProps<Option, IsMulti>>) {
  return (
    <ReactSelect
      {...props}
      isClearable={false}
      components={{
        DropdownIndicator: null,
      }}
      styles={{
        control: ({ boxShadow, '&:hover': hoverCSS, ...defs }, state) => ({
          ...defs,
          borderRadius: state.menuIsOpen ? '3px 3px 0px 0px' : '3px',
          borderWidth: '2px',
          borderColor: invalid ? 'var(--color-semantic-error)' : 'var(--color-grays-300)',
          backgroundColor: 'var(--color-grays-000)',
          minHeight: '3em',
        }),
        valueContainer: ({ padding, ...defs }) => ({
          ...defs,
          gap: '0.5em',
          margin: '0em 0.375em',
          top: '-1px',
        }),
        menu: ({ marginTop, marginBottom, boxShadow, ...defs }) => ({
          ...defs,
          borderRadius: '0px 0px 3px 3px',
          border: 'solid 2px var(--color-grays-300)',
          borderTopStyle: 'none',
        }),
        menuList: ({ paddingTop, paddingBottom, ...defs }) => ({
          ...defs,
        }),
        multiValue: ({ margin, ...defs }) => ({
          ...defs,
          padding: '0.5em 0.75em',
          borderRadius: 'calc(2.8125em / 2)',
          backgroundColor: 'var(--color-grays-100)',
        }),
        multiValueLabel: ({ padding, paddingLeft, ...defs }) => ({
          ...defs,
          fontSize: '0.875em',
          lineHeight: '1.5',
        }),
        option: (defs) => ({
          ...defs,
          padding: '0.25em 0.75em',
          boxShadow: 'inset 0px -1px 0px var(--color-grays-100)',
        }),
      }}
    />
  )
}

export type SelectProps<Option, IsMulti extends boolean = false> = WithFormHeaderLabelProps<
  PlainSelectProps<Option, IsMulti>
>

// eslint-disable-next-line func-style
function Select<Option = unknown, IsMulti extends boolean = false>(
  props: WithFormHeaderLabelProps<PlainSelectProps<Option, IsMulti>>,
) {
  const BSelect = withFormHeaderLabel<never, PlainSelectProps<Option, IsMulti>>(
    forwardRef<
      HTMLDivElement,
      WithFormHeaderLabelWrappedComponentProps<PlainSelectProps<Option, IsMulti>>
    >((forwardRefProps, _ref) => <BaseSelect<Option, IsMulti> {...forwardRefProps} />),
  )

  return <BSelect {...props} />
}

export default Select
