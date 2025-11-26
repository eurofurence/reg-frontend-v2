/** @jsxImportSource @emotion/react */

import styled from '@emotion/styled'

const Container = styled.div`
	color: var(--color-semantic-error);
`

export interface ErrorMessageProps {
  readonly children: string
}

const ErrorMessage = ({ children }: ErrorMessageProps) => (
  <Container role="alert">{children}</Container>
)

export default ErrorMessage
