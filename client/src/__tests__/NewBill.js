/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill"
import { ROUTES_PATH } from "../constants/routes"
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store"
import router from "../app/Router"
import { bills } from "../fixtures/bills"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // for every test
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorage }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))

      // inject html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      document.body.innerHTML = NewBillUI();
      window.onNavigate(ROUTES_PATH.NewBill);
    })

    test("Then in left menu, mail icon should be highlighted", () => {
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className).toEqual('active-icon')
    })

    test('When I change file with a valid one, should be ok', () => {
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

      const fileInput = screen.getByTestId('file')
      fileInput.addEventListener("change", handleChangeFile)

      const file = new File(["test"], "test.png", { type: "image/png" })
      fireEvent.change(fileInput, {
        target: {
          files: [file]
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(handleChangeFile).toBeTruthy()
      expect(fileInput.files[0]).toBe(file)
      expect(fileInput.files).toHaveLength(1)
    })

    // TODO: bellow code don't incrase cover range
    test('Then All required input are required', () => {
      let expenseType = screen.getAllByTestId('expense-type')
      expect(expenseType[0]).toHaveProperty('required')
      let datePicker = screen.getAllByTestId('datepicker')
      expect(datePicker[0]).toHaveProperty('required')
      let amount = screen.getAllByTestId('amount')
      expect(amount[0]).toHaveProperty('required')
      let pct = screen.getAllByTestId('pct')
      expect(pct[0]).toHaveProperty('required')
      let file = screen.getAllByTestId('file')
      expect(file[0]).toHaveProperty('required')
    })

    test("Test if file input is valid", () => {
      const fileInput = screen.getByTestId('file')
      // screen.debug(fileInput)

      // INSERT FILE

      // TEST IF FILE EXISTE

      // const mockFormData = {
      //   "expense-type": "Restaurants et bars",
      //   "expense-name": "Lunch Meeting",
      //   datepicker: "",
      //   amount: "200",
      //   vat: "40",
      //   pct: "20",
      //   commentary: "Business discussion",
      //   file: new File(["file-content"], "file.jpg", { type: "image/jpeg" }),
      // };

      // const querySelectorMock = (selector) => {
      //   const key = selector.match(/\[data-testid="([^"]+)"\]/)[1];
      //   return { value: mockFormData[key] };
      // };

      // const html = NewBillUI();
      // document.body.innerHTML = html;

      // const onNavigate = jest.fn();
      // const localStorage = window.localStorage;
      // const newBill = new NewBill({
      //   document,
      //   onNavigate,
      //   store: null,
      //   localStorage,
      // });

      // const form = screen.getByTestId("form-new-bill");

      // newBill.handleSubmitTest = jest.fn(newBill.handleSubmit);

      // newBill.handleSubmitTest({
      //   preventDefault: () => {},
      //   target: {
      //     elements: mockFormData,
      //     querySelector: querySelectorMock,
      //   },
      // });

      // expect(newBill.handleSubmitTest).toHaveBeenCalled();
      // expect(form.checkValidity()).toBe(false);
    })
  })
})
