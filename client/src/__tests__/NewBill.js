/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import { ROUTES_PATH } from "../constants/routes.js"

// Simulate jQuery modal
$.fn.modal = jest.fn()

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // for every test
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))

      // inject html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      Router()

      document.body.innerHTML = NewBillUI();
      window.onNavigate(ROUTES_PATH.NewBill);
    })

    test("Then in left menu, mail icon should be highlighted",  () => {
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className).toEqual('active-icon')
    })
  })
})
