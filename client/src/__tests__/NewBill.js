/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import { ROUTES_PATH } from "../constants/routes.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

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

    // test('Create a new Bill on submit', () => {
    //   // Init page
    //   const newBill = new NewBill({
    //     document,
    //     onNavigate,
    //     store: mockStore,
    //     bills: bills,
    //     localStorage: window.localStorage
    //   })

    //   // insert data
    //   screen.getAllByTestId('expense-type').value = "Transports"
    //   screen.getAllByTestId('expense-name').value = "Test"
    //   screen.getAllByTestId('datepicker').value = "01-01-2000"
    //   screen.getAllByTestId('amount').value = 200
    //   screen.getAllByTestId('pct').value = 1
    //   screen.getAllByTestId('commentary').value = "Test commentary"

    //   newBill.fileName = "test.png"
    //   newBill.fileUrl = "../assets/images/test.png"

    //   // Use updateBill & handleSubmit
    //   newBill.updateBill = jest.fn()
    //   const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

    //   // Emulate click handleSubmit
    //   const form = screen.getByTestId("form-new-bill");
    //   form.addEventListener("click", handleSubmit);
    //   userEvent.click(form)

    //   expect(handleSubmit).toHaveBeenCalled()
    //   expect(newBill.updateBill).toHaveBeenCalled()
    // })

    // // TODO: bellow code don't incrase cover range
    // test('Then All required input are required', () => {
    //   let expenseType = screen.getAllByTestId('expense-type')
    //   expect(expenseType[0]).toHaveProperty('required')
    //   let datePicker = screen.getAllByTestId('datepicker')
    //   expect(datePicker[0]).toHaveProperty('required')
    //   let amount = screen.getAllByTestId('amount')
    //   expect(amount[0]).toHaveProperty('required')
    //   let pct = screen.getAllByTestId('pct')
    //   expect(pct[0]).toHaveProperty('required')
    //   let file = screen.getAllByTestId('file')
    //   expect(file[0]).toHaveProperty('required')
    // })
  })
})
