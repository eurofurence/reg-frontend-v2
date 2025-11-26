/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { times } from 'ramda'

type StepState = 'completed' | 'current' | 'remaining'

const indicatorStateStyle = (state: StepState) => {
  switch (state) {
    case 'current':
      return css`
				background-color: var(--color-brand-2-400);
				height: 4px;
			`
    case 'completed':
    case 'remaining':
      return css`
				background-color: var(--color-brand-2-100);
				height: 2px;
			`
  }
}

const Indicator = styled.div<{ readonly state: StepState }>`
	width: 111px;
	border-radius: 10px;

	${({ state }) => indicatorStateStyle(state)}
`

const IndicatorsContainer = styled.div`
	display: flex;
	gap: 8px;
	align-items: flex-end;
`

const Caption = styled.div`
	color: var(--color-brand-2-400);

	font-weight: 400;

	margin-top: 1em;
`

export interface WizardProgressBarProps {
  readonly steps: readonly string[]
  readonly currentStep: number
}

const WizardProgressBar = ({ steps, currentStep }: WizardProgressBarProps) => (
  <section>
    <IndicatorsContainer>
      {times(
        (i) => (
          <Indicator key={i} state="completed" />
        ),
        currentStep,
      )}
      <Indicator state="current" />
      {times(
        (i) => (
          <Indicator key={i} state="remaining" />
        ),
        steps.length - currentStep - 1,
      )}
    </IndicatorsContainer>
    <Caption>{steps[currentStep]}</Caption>
  </section>
)

export default WizardProgressBar
