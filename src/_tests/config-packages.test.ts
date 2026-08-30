import { describe, expect, it } from 'bun:test'
import config from '~/config'

describe('config package parity', () => {
  it('allows package edits for paid registrations', () => {
    expect(config.disablePackageEditForStatuses).not.toContain('paid')
    expect(config.disablePackageEditForStatuses).toContain('checked-in')
    expect(config.disablePackageEditForStatuses).toContain('cancelled')
  })

  it('has the dealer-triple addon', () => {
    expect(config.addons['dealer-triple']).toBeDefined()
    expect(config.addons['dealer-triple'].price).toBe(330)
  })

  it('disables early bird and party, enables late by default', () => {
    expect(config.addons.early.default).toBe(false)
    expect(config.addons.late.default).toBe(true)
    expect(config.addons.party.unavailable).toBe(true)
  })
})
