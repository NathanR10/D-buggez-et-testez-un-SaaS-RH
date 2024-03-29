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
      return {succes: false, error: 'empty file(s)'}
    }

    // whitelist file extention
    const fileName = file.name
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

    const files = this.document.querySelector(`input[data-testid="file"]`)
      .files;
    if(files.length === 0) {
      return {succes: false, error: 'invalide or empty file(s)'}
    }
    const file = files[0];
    const fileName = file.name
    let fileExtension = fileName.split(".");
    fileExtension = fileExtension[1];

    // verify extension format
    const validExtensions = ['png', 'gif', 'jpeg', 'jpg'];

    if (validExtensions.indexOf(fileExtension.toLowerCase()) === -1) {
      return { succes: false, error: 'invalide or empty file(s)' };
    }

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

        return {succes: false}
      })
    return {succes: true}
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