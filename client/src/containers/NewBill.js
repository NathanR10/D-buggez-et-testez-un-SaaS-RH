import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()

    // clear error msg
    document.querySelector('#inputImgMessage').innerHTML = "";

    // get input value
    const fileInput = this.document.querySelector(`input[data-testid="file"]`)
    const file = fileInput.files[0]

    if (!file) {
      // no file ? do nothing
      return
    }

    // whitelist file extention
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const validExtensions = ['png', 'gif', 'jpeg', 'jpg']
    const fileExtension = fileName.split('.').pop().toLowerCase()

    if (validExtensions.indexOf(fileExtension) === -1) {
      // show error below input
      document.querySelector('#inputImgMessage').innerHTML = "Seuls les fichiers png, jpeg, jpg et gif sont autorisés.";
      // clear input
      fileInput.value = ''
      return
    }
  }
  handleSubmit = e => {
    e.preventDefault()

    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = file.name.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    let fileExtension = fileName.split(".");
    fileExtension = fileExtension[1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;

    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ filePath, key }) => {
        this.billId = key
        this.fileUrl = filePath
        this.fileName = fileName

        const bill = {
          email,
          type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
          name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
          amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
          date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
          vat: e.target.querySelector(`input[data-testid="vat"]`).value,
          pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
          commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
          fileUrl: this.fileUrl,
          fileName: this.fileName,
          status: 'pending'
        }
        this.updateBill(bill)
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => {
        console.error(error)
      })
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}