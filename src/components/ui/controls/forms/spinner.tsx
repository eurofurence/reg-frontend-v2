/** @jsxImportSource @emotion/react */
/* eslint-disable max-len */

import styled from '@emotion/styled'
import {
  type ChangeEventHandler,
  type ForwardedRef,
  forwardRef,
  type RefObject,
  useCallback,
  useRef,
} from 'react'

import { type WithFormHeaderLabelProps, withFormHeaderLabel } from './form-header-label'

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

	text-align: center;
`

const Container = styled.div`
	position: relative;
`

const Control = styled.button<{ side: 'left' | 'right' }>`
	position: absolute;
	top: 0em;
	${({ side }) => (side === 'left' ? 'left' : 'right')}: 0em;
	width: 3em;
	height: 3em;

	display: flex;
	align-items: center;
	justify-content: space-around;
`

interface PlainSpinnerProps {
  readonly name: string
  readonly placeholder: string
  readonly value?: string
  readonly defaultValue?: string
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
  readonly readOnly?: boolean
}

// If someone knows a better way feel free to change because I feel dirty writing this...
// eslint-disable-next-line func-style
function useRefTap<T>(
  ref: ForwardedRef<T>,
): [((instance: T | null) => void) | RefObject<T | null>, () => T | null] {
  const newRef = useRef<T>(null)
  const currentRef = useRef<T | null>(null)

  const callbackRef = useCallback(
    (node: T | null) => {
      currentRef.current = node
      if (ref instanceof Function) {
        ref(node)
      } else if (ref != null) {
        ref.current = node
      } else {
        newRef.current = node
      }
    },
    [ref],
  )

  if (ref == null) {
    return [newRef, () => newRef.current]
  } else if (ref instanceof Function) {
    return [callbackRef, () => currentRef.current]
  } else {
    return [ref, () => ref.current]
  }
}

export type SpinnerProps = WithFormHeaderLabelProps<PlainSpinnerProps>

const Spinner = withFormHeaderLabel<HTMLInputElement, PlainSpinnerProps>(
  forwardRef<HTMLInputElement, PlainSpinnerProps>((props, ref) => {
    const [newRef, getCurrent] = useRefTap(ref)

    return (
      <Container>
        <Input type="number" {...props} ref={newRef} />
        <Control type="button" side="left" onClick={() => getCurrent()?.stepDown()}>
          <img
            src="data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMiIgdmlld0JveD0iMCAwIDE0IDIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMTQgMkgwVjBIMTRWMloiIGZpbGw9IiMwMDQ3RkYiLz4NCjwvc3ZnPg=="
            alt="Decrement"
          />
        </Control>
        <Control type="button" side="right" onClick={() => getCurrent()?.stepUp()}>
          <img
            src="data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTQgOEg4VjE0SDZWOEgwVjZINlYwSDhWNkgxNFY4WiIgZmlsbD0iIzAwNDdGRiIvPg0KPC9zdmc+"
            alt="Increment"
          />
        </Control>
      </Container>
    )
  }),
)

export default Spinner
