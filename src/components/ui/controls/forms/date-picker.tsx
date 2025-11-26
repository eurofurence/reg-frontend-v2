/** @jsxImportSource @emotion/react */
/* eslint-disable max-len */

import styled from '@emotion/styled'
import { endOfYear, formatISO, isValid, startOfYear } from 'date-fns'
import { type ChangeEventHandler, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { useDetectClickOutside } from 'react-detect-click-outside'

import formControlStyle from './form-control'
import FormHeaderLabel from './form-header-label'

const Container = styled.section`
	${formControlStyle}

	position: relative;

	.react-datepicker {
		width: 100%;
		border: 2px solid var(--color-grays-300);
		border-radius: 0.1875em;
		user-select: none;
		line-height: 1.171875;
		background-color: var(--color-grays-000);
	}

	.react-datepicker__current-month {
		display: none;
	}

	.react-datepicker__navigation {
		position: absolute;
		cursor: pointer;
	}

	.react-datepicker__navigation--previous {
		top: 36px;
		left: 24px;
		z-index: 1;
	}

	.react-datepicker__navigation--next {
		top: 36px;
		right: 24px;
		z-index: 1;
	}

	.react-datepicker__navigation-icon--previous {
		content: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDggMTMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNNy40MSAxMS4wOUwyLjgzIDYuNUw3LjQxIDEuOTFMNiAwLjVMMCA2LjVMNiAxMi41TDcuNDEgMTEuMDlaIiBmaWxsPSIjMjk1MkU4Ii8+DQo8L3N2Zz4=");
	}

	.react-datepicker__navigation-icon--next {
		content: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDggMTMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMC41ODk4NDQgMTEuMzRMNS4xNjk4NCA2Ljc1TDAuNTg5ODQ0IDIuMTZMMS45OTk4NCAwLjc1TDcuOTk5ODQgNi43NUwxLjk5OTg0IDEyLjc1TDAuNTg5ODQ0IDExLjM0WiIgZmlsbD0iIzI5NTJFOCIvPg0KPC9zdmc+");
	}

	.react-datepicker__month-year-dropdown-container {
		color: var(--color-brand-2-900);
		position: relative;
		margin-bottom: 36px;
		cursor: pointer;
	}

	.react-datepicker__month-year-dropdown {
		border: 2px solid var(--color-grays-300);
		border-radius: 0.1875em;
		position: absolute;
		left: 50%;
		top: 0px;
		z-index: 2;
		transform: translate(-50%);
		background-color: var(--color-grays-000);
	}

	.react-datepicker__month-container {
		margin: 36px 24px;
		text-align: center;
	}

	.react-datepicker__header {
	}

	.react-datepicker__day-names, .react-datepicker__week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.react-datepicker__week {
		justify-items: stretch;
		align-items: stretch;

		margin: 13.375px 0px;
	}

	.react-datepicker__day-names {
		justify-items: center;
		align-items: center;

		font-weight: 700;
		border-bottom: solid 1px var(--color-brand-2-100);
		padding-bottom: 0.5em;
	}

	.react-datepicker__month {
	}

	.react-datepicker__day-text {
		width: 2em;
		height: 2em;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.react-datepicker__day {
		display: flex;
		align-items: center;
		justify-content: space-around;

		position: relative;

		cursor: pointer;
	}

	.react-datepicker__day--outside-month {
		color: var(--color-grays-300);
	}

	.react-datepicker__day--in-range {
		&::before {
			content: "";

			background-color: var(--color-semantic-info);
			opacity: 0.2;

			position: absolute;
			top: 50%;
			z-index: -1;
			transform: translateY(-50%);

			height: 24px;
		}

		&:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end)::before {
			left: 0px;
			width: 100%;
		}

		&.react-datepicker__day--range-start::before {
			right: 0px;
			width: 50%;
		}

		&.react-datepicker__day--range-end::before {
			left: 0px;
			width: 50%;
		}
	}

	.react-datepicker__day--selected, .react-datepicker__day--range-start, .react-datepicker__day--range-end {
		.react-datepicker__day-text {
			width: 2em;
			height: 2em;
			background-color: var(--color-semantic-info);
			border-radius: 1em;
			color: var(--color-grays-000);
		}
	}
`

const Inputs = styled.section`
	display: flex;
	gap: 24px;

	> * {
		flex: 1;
	}
`

const Input = styled.input`
	width: 100%;
	height: 3em;
	border: 2px solid var(--color-grays-300);
	border-radius: 0.1875em;
	padding: 0.75em 1em;

	color: var(--color-grays-900);

	&::placeholder {
		color: var(--color-grays-300);
	}
`

type CommonProps = {
  readonly gridSpan?: number
}

type InputProps = {
  readonly label: string
  readonly value: string
  readonly placeholder?: string
  readonly onChange?: (date: string) => void
}

type Prefixed<P extends string, Type> = {
  readonly [K in keyof Type as `${P}${Capitalize<string & K>}`]: Type[K]
}

type RangeDatePickerProps = CommonProps &
  Prefixed<'start' | 'end', InputProps> & {
    readonly onChange?: ({ start, end }: { readonly start: string; readonly end: string }) => void
  }
type SimpleDatePickerProps = CommonProps & InputProps

export type DatePickerProps =
  | ({ readonly range: true } & RangeDatePickerProps)
  | ({ readonly range: false } & SimpleDatePickerProps)

const Overlay = styled.section<{ isOpen: boolean }>`
	position: absolute;
	left: 0px;
	top: 100%;
	width: 100%;
	margin-top: 12px;
	z-index: 1;

	display: ${({ isOpen }) => (isOpen ? 'unset' : 'none')};
`

const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)

  const insideRef = useDetectClickOutside({
    onTriggered: () => {
      setIsOpen(false)

      if (document.activeElement != null && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    },
  })

  return {
    isOpen,
    insideRef,
    open: () => setIsOpen(true),
  }
}

const RangeDatePicker = ({
  gridSpan,
  startLabel,
  startValue,
  startPlaceholder,
  startOnChange,
  endLabel,
  endValue,
  endPlaceholder,
  endOnChange,
  onChange,
}: RangeDatePickerProps) => {
  const dateStartValue = new Date(startValue)
  const dateEndValue = new Date(endValue)

  const pickerStartValue = isValid(dateStartValue) ? dateStartValue : null
  const pickerEndValue = isValid(dateEndValue) ? dateEndValue : null

  const onStartInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const startStr = e.target.value

    if (startOnChange !== undefined) {
      startOnChange(startStr)
    }

    if (onChange !== undefined) {
      onChange({ start: startStr, end: endValue })
    }
  }

  const onEndInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const endStr = e.target.value

    if (endOnChange !== undefined) {
      endOnChange(endStr)
    }

    if (onChange !== undefined) {
      onChange({ start: startValue, end: endStr })
    }
  }

  const onPickerChange = ([start, end]: readonly [
    Readonly<Date> | null,
    Readonly<Date> | null,
  ]) => {
    const startStr = start === null ? '' : formatISO(start, { representation: 'date' })
    const endStr = end === null ? '' : formatISO(end, { representation: 'date' })

    if (startOnChange !== undefined) {
      startOnChange(startStr)
    }

    if (endOnChange !== undefined) {
      endOnChange(endStr)
    }

    if (onChange !== undefined) {
      onChange({ start: startStr, end: endStr })
    }
  }

  const { isOpen, open, insideRef } = useDropdown()

  return (
    <Container gridSpan={gridSpan} ref={insideRef}>
      <Inputs>
        <FormHeaderLabel label={startLabel}>
          <Input
            value={startValue}
            onChange={onStartInputChange}
            placeholder={startPlaceholder}
            onFocus={open}
          />
        </FormHeaderLabel>
        <FormHeaderLabel label={endLabel}>
          <Input
            value={endValue}
            onChange={onEndInputChange}
            placeholder={endPlaceholder}
            onFocus={open}
          />
        </FormHeaderLabel>
      </Inputs>
      <Overlay isOpen={isOpen}>
        <ReactDatePicker
          inline
          formatWeekDay={(d: string) => d.slice(0, 1)}
          minDate={startOfYear(new Date())}
          maxDate={endOfYear(new Date())}
          selectsRange
          selected={pickerStartValue}
          startDate={pickerStartValue}
          endDate={pickerEndValue}
          onChange={onPickerChange}
          showMonthYearDropdown
          renderDayContents={(day: number) => (
            <span className="react-datepicker__day-text">{day}</span>
          )}
        />
      </Overlay>
    </Container>
  )
}

const SimpleDatePicker = ({ gridSpan, label, value, onChange, ...rest }: SimpleDatePickerProps) => {
  const dateValue = new Date(value)

  const pickerValue = isValid(dateValue) ? dateValue : null

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const valueStr = e.target.value

    if (onChange !== undefined) {
      onChange(valueStr)
    }
  }

  const onPickerChange = (v: Readonly<Date> | null) => {
    const str = v === null ? '' : formatISO(v, { representation: 'date' })

    if (onChange !== undefined) {
      onChange(str)
    }
  }

  const { isOpen, open, insideRef } = useDropdown()

  return (
    <Container ref={insideRef}>
      <FormHeaderLabel label={label} gridSpan={gridSpan}>
        <Input value={value} onChange={onInputChange} {...rest} onFocus={open} />
        <Overlay isOpen={isOpen}>
          <ReactDatePicker
            inline
            formatWeekDay={(d: string) => d.slice(0, 1)}
            minDate={startOfYear(new Date())}
            maxDate={endOfYear(new Date())}
            selected={pickerValue}
            onChange={onPickerChange}
            showMonthYearDropdown
            renderDayContents={(day: number) => (
              <span className="react-datepicker__day-text">{day}</span>
            )}
            customInput={<Input {...rest} />}
          />
        </Overlay>
      </FormHeaderLabel>
    </Container>
  )
}

const DatePicker = (props: DatePickerProps) =>
  props.range ? <RangeDatePicker {...props} /> : <SimpleDatePicker {...props} />

export default DatePicker
