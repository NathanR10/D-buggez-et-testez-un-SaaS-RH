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

      document.body.innerHTML = NewBillUI()
      window.onNavigate(ROUTES_PATH.NewBill)
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

    test("Test if file is required", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = jest.fn()
      const localStorage = window.localStorage
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage,
      })

      const form = screen.getByTestId("form-new-bill")

      newBill.handleSubmitTest = jest.fn(newBill.handleSubmit)

      newBill.handleSubmitTest({
        preventDefault: () => {}
      })

      const event = {
        preventDefault: jest.fn()
      };

      const result = newBill.handleSubmit(event);

      expect(newBill.handleSubmitTest).toHaveBeenCalled()
      expect(result.succes).toBe(false);
      expect(result.error).toBe('invalide or empty file(s)');
    })

    test("Test if file has an invalid format", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage,
      });

      const event = {
        preventDefault: jest.fn()
      };

      // Create file with invalide format, like .PDF
      const invalidFile = new File(['file contents'], 'invalid.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByTestId("file");

      // Trigger change event
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // Call handleChangeFile manually
      newBill.handleChangeFile(event);

      // Check if error appened
      const inputImgMessage = document.querySelector('#inputImgMessage');
      expect(inputImgMessage.innerHTML).toBe("Seuls les fichiers png, jpeg, jpg et gif sont autorisés.");
      expect(fileInput.value).toBe(''); // be sure that input file is empty
    });

    test("Test if no file is selected", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage,
      });

      const event = {
        preventDefault: jest.fn()
      };

      const fileInput = screen.getByTestId("file");

      // Call handleChangeFile manually
      const result = newBill.handleChangeFile(event);

      // Check result's succes === false
      expect(result.succes).toBe(false);
      expect(result.error).toBe("empty file(s)");
    });

    test("Test if file has an invalid format or is empty", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage,
      });

      const event = {
        preventDefault: jest.fn()
      };

      // Create file with invalide format, like .PDF
      const invalidFile = new File(['file contents'], 'invalid.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByTestId("file");

      // Use jest.spyOn to simulate empty
      jest.spyOn(fileInput, 'files', 'get').mockReturnValue([]);

      // Call handleChangeFile manually
      const emptyFileResult = newBill.handleSubmit(event);

      // Check result's succes === false
      expect(emptyFileResult.succes).toBe(false);
      expect(emptyFileResult.error).toBe("invalide or empty file(s)");

      // Reset input file to test invalide format
      jest.spyOn(fileInput, 'files', 'get').mockReturnValue([invalidFile]);

      // Call handleChangeFile manually
      const result = newBill.handleSubmit(event);

      // Check result's succes === false
      expect(result.succes).toBe(false);
      expect(result.error).toBe("invalide or empty file(s)");

      // Reset input after testing
      jest.restoreAllMocks();
    });

    test("Test bill creation in handleSubmit", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      // Simulate filling form inputs
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "TGV Paris Tlse";
      screen.getByTestId("datepicker").value = "2023-04-27";
      screen.getByTestId("amount").value = "40";
      screen.getByTestId("vat").value = "60";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "commentary";

      // Create valide file
      const validFile = new File(['file contents'], 'valid.png', { type: 'image/png' });
      const fileInput = screen.getByTestId("file");
      jest.spyOn(fileInput, 'files', 'get').mockReturnValue([validFile]);

      // Call handleChangeFile manually
      const event = {
        preventDefault: jest.fn(),
        target: document.querySelector(`form[data-testid="form-new-bill"]`),
      };
      const result = newBill.handleSubmit(event);

      // Check is creation succeed
      expect(result.succes).toBe(true);
    });

    test("Test bill creation with invalid fields", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      // Simulate filling only the first input field (expense-type)
      screen.getByTestId("expense-type").value = "Transports";

      // Create invalid file
      const validFile = new File(['file contents'], 'valid.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId("file");
      jest.spyOn(fileInput, 'files', 'get').mockReturnValue([validFile]);

      // Call handleSubmit manually
      const event = {
        preventDefault: jest.fn(),
        target: document.querySelector(`form[data-testid="form-new-bill"]`),
      };
      const result = newBill.handleSubmit(event);

      // Check if creation fails when other fields are empty
      expect(result.succes).toBe(false);
    });
  })
})
