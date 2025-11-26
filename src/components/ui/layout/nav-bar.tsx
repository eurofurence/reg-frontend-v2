/* eslint-disable max-len */

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import type { DeepReadonly } from 'ts-essentials'

import { desktop, laptop, phone, tablet } from '../media-queries'

const Hamburger = styled.button`
	line-height: 0em;
	height: 64px;
	width: 64px;

	@media ${laptop}, ${desktop} {
		display: none;
	}
`

export const NavBar = styled.header`
	background-color: var(--color-brand-2-900);
	color: var(--color-grays-000);
	display: grid;
	align-items: center;

	user-select: none;

	font-family: Roboto;
	font-weight: 400;
	font-size: 1.6rem;
	line-height: 1.5;

	a {
		text-decoration: none;
		color: unset;
	}

	@media ${phone}, ${tablet} {
		height: 64px;
		position: relative;
		grid: "left right" auto
		      / auto max-content;
	}

	@media ${laptop}, ${desktop} {
		height: 110px;
		grid: "left center right" auto
		      / 1fr max-content 1fr;
	}
`

const NavBarSection = styled.section`
	display: flex;
	align-items: center;
	gap: 1ch;
`

export const NavBarTitle = styled(NavBarSection)`
	grid-area: left;
	justify-self: start;

	font-family: Manrope;
	font-weight: 600;

	@media ${phone}, ${tablet} {
		padding-left: 24px;
		font-size: 2.4rem;
	}

	@media ${laptop}, ${desktop} {
		padding-left: 32px;
		font-size: 3.6rem;
	}
`

export const NavBarCenter = styled(NavBarSection)`
	grid-area: center;
	justify-self: center;
`

const NavBarRightBase = styled(NavBarSection)`
	grid-area: right;
	justify-self: end;

	@media ${laptop}, ${desktop} {
		padding-right: 32px;
	}
`

export const NavBarRight = styled(NavBarRightBase)`
	@media ${phone}, ${tablet} {
		padding-right: 24px;
	}
`

const NavBarMenuContainer = styled.menu<{ readonly isOpen: boolean }>`
	@media ${phone}, ${tablet} {
		display: ${({ isOpen }) => (isOpen ? 'unset' : 'none')};
		position: absolute;
		left: 0px;
		top: 100%;
		background-color: var(--color-brand-2-900);
		width: 100%;
	}

	@media ${laptop}, ${desktop} {
		display: flex;
		align-items: center;
		gap: 1em;
	}
`

const NavBarSubMenuContainer = styled.menu<{ readonly isOpen: boolean }>`
	@media ${phone}, ${tablet} {
		display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
		flex-direction: column;
		align-items: stretch;
		margin-left: 1em;
	}

	@media ${laptop}, ${desktop} {
		position: absolute;
		top: calc(100% - 2px);
		right: 0px;
		min-width: 100%;
		display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
		flex-direction: column;
		align-items: stretch;
		background-color: var(--color-brand-2-900);
		border: solid 2px var(--color-grays-300);
		border-radius: 3px;
		border-top-right-radius: 0px;
		border-top-left-radius: 0px;
	}
`

const NavBarMenuItemContainer = styled.li`
	display: block;

	@media ${laptop}, ${desktop} {
		position: relative;

		header > section > menu > li > menu & {
			:not(:first-of-type) {
				border-top: solid 2px var(--color-grays-300);
			}
		}
	}
`

const NavBarMenuItemLinkContainer = styled.a<{ readonly showArrow: boolean }>`
	color: var(--color-grays-000);
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 1em;
	height: 3em;
	text-decoration: none;
	// line-height: 1.1875em;

	${({ showArrow }) =>
    !showArrow
      ? css``
      : css`
		::after {
			line-height: 0;
			content: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMCAwTDUgNkwxMCAwSDBaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+");
		}
	`}

	@media ${phone}, ${tablet} {
		padding: 0em 1.5em;
	}

	@media ${laptop}, ${desktop} {
		padding: 0em 1em;

		header > section > menu > li > & {
			border: solid 2px var(--color-grays-300);
			border-radius: 3px;
		}
	}
`

type NavBarMenuItemLinkProps = ComponentProps<typeof NavBarMenuItemLinkContainer> & {
  readonly icon?: string
  readonly label: string
}

const NavBarMenuItemLink = ({ icon, label, ...rest }: NavBarMenuItemLinkProps) => (
  <NavBarMenuItemLinkContainer {...rest}>
    {icon === undefined ? undefined : <img src={icon} alt={label ?? ''} />}
    {label}
  </NavBarMenuItemLinkContainer>
)

export type NavBarMenuItemProps = Omit<NavBarMenuItemLinkProps, 'showArrow'> & {
  readonly children?: DeepReadonly<ReactNode>
}

export const NavBarMenuItem = (props: NavBarMenuItemProps) => (
  <NavBarMenuItemContainer>
    <NavBarMenuItemLink showArrow={false} {...props} />
  </NavBarMenuItemContainer>
)

export interface NavBarSubMenuProps {
  readonly icon?: string
  readonly label: string
  readonly children: DeepReadonly<ReactNode>
}

export const NavBarSubMenu = ({ icon, label, children }: NavBarSubMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const insideRef = useDetectClickOutside({
    onTriggered: () => setIsOpen(false),
  })

  return (
    <NavBarMenuItemContainer ref={insideRef}>
      <NavBarMenuItemLink
        icon={icon}
        label={label}
        showArrow={true}
        onClick={() => setIsOpen(!isOpen)}
      />
      <NavBarSubMenuContainer isOpen={isOpen}>{children}</NavBarSubMenuContainer>
    </NavBarMenuItemContainer>
  )
}

export interface NavBarMenuProps {
  readonly children: DeepReadonly<ReactNode>
}

export const NavBarMenu = ({ children }: NavBarMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const insideRef = useDetectClickOutside({
    onTriggered: () => setIsOpen(false),
  })

  return (
    <NavBarRightBase ref={insideRef}>
      <Hamburger onClick={() => setIsOpen(!isOpen)}>
        <img
          src="data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyMCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAgMlYwSDBWMkgyMFpNMjAgNlY4SDBWNkgyMFpNMjAgMTJWMTRIMFYxMkgyMFoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4="
          alt="Menu"
        />
      </Hamburger>
      <NavBarMenuContainer isOpen={isOpen}>{children}</NavBarMenuContainer>
    </NavBarRightBase>
  )
}

export default NavBar
