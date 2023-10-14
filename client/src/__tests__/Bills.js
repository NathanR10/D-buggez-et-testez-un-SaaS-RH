/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import containersBills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

// simulate jquerry modal
$.fn.modal = jest.fn()

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getAllByTestId('icon-window')[0])
      const windowIcon = screen.getAllByTestId('icon-window')[0]

      // check if windowIcon -> class "active-icon"
      expect(windowIcon.className).toEqual('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// check if image modal show up
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    describe("When I click on the eye icon", () => {
      test("A modal should open", () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        const eyes = screen.getAllByTestId("icon-eye")
        const eye = eyes[0]

        const employeeBills = new containersBills({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
        const handleClickIconEye = jest.fn((eye) => employeeBills.handleClickIconEye(eye))

        // check if show modal is called
        eye.addEventListener("click", handleClickIconEye(eye))
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()

        // check if modal is show
        const modal = screen.getByText("Justificatif")
        expect(modal).toBeTruthy()
      })
    })
  })
})

// check if create new bill form show up
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    describe("When I click new bill button", () => {
      test("A form should open", () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const button = screen.getByTestId("btn-new-bill")
        userEvent.click(button)
        const modal = screen.getByTestId("form-new-bill")
        expect(modal).toBeTruthy()
      })
    })
  })
})

// test d'intégration GET
describe("When I navigate to Bills", () => {
  test("fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByText("pending"))
    const contentPending = await screen.getByText("pending")
    expect(contentPending).toBeTruthy()
    const contentAccepted = await screen.getByText("accepted")
    expect(contentAccepted).toBeTruthy()
    expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
    // screen.debug(screen.getByTestId('table-example'))
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: "Employee",
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})