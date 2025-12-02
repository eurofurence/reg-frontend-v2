# End 2 End Testing

This document specifies test cases for end-to-end testing

Not all of these will be worthwhile to automate, in fact at the moment there is no automation,
but since we're building a new version of this frontend, a high level description of test cases
could be helpful, so here it is.

## 1. Initial Registration

All these tests are performed with an identity that does not have a server-side registration yet.

- visit without being logged in -> should redirect to identity and ask for login
- visit while logged in, but countdown to reg start still ongoing -> should notify about countdown
- visit while logged in -> should work
- select full ticket, later change your mind and switch to day ticket -> addons should change accordingly (stage pass removed)
- close browser and return -> data should be retained in local storage
- add sponsor -> price and addons should change accordingly (tshirt as individually charged item removed from invoice)
- add supersponsor -> addon beneficiary should become visible
- add first fursuit badge -> should register in invoice and additional badges picker should become available
- select, then change number of additional fursuit badges -> invoice should update accordingly
- close browser and return while logged in as different user -> should NOT pick up data from local storage, instead clear it
- field validation tests
  - nickname rules
  - mandatory field rules
- switch language
- try to submit without accepting rules -> should not be possible
- submit a new valid registration -> should work

## 2. Registration from Backend

These tests are performed with an identity that has a server-side registration. Where registration
status is relevant, it is mentioned in the test case, otherwise both new or approved can be used.

- visit without being logged in -> should redirect to identity and ask for login, then show the registration
- visit while logged in -> should show the registration
- sponsor upgrade without tshirt -> should add tshirt at no charge, and not allow deselecting it
- sponsor upgrade with tshirt -> should remove separately billed tshirt, but still show tshirt as selected
- supersponsor upgrade -> should allow benefactor
- downgrade from supersponsor with benefactor to sponsor -> should remove benefactor and adjust bill accordingly
- downgrade from supersponsor no longer possible once any payment was made (needs to open a ticket)
- visit by a different identity, both with and without a server-side registration -> should drop cached data from local storage
- switch language
- save changes
- go back without accepting changes on each of the pages

## 3. Payment and handling of paid / checked in registrations

These tests are performed with an identity that has a server-side registration in status at least
approved. Where further status requirements exist, the test case mentions them.

- perform a test credit card payment, successfully and unsuccessfully -> registration status and dues should update accordingly (paid on success)
- perform a money transfer payment -> pending payment registered, shows as "processing", but no status update yet, cannot try to pay a second time
- click cancel on money transfer payment page -> no pending payment registered
- delete a pending payment from money transfer -> can now try to pay again
- checked in registrations can no longer add sponsor/supersponsor, or indeed add packages

## Browser testing

Try out a sample of test cases from 1., 2., 3. on a selection of browsers and devices, watch out for design breakage
and/or

- Windows/Firefox
- Windows/Chrome
- Linux/Firefox
- Linux/Chrome
- Android phone
- Android tablet
- half-eaten fruit devices
