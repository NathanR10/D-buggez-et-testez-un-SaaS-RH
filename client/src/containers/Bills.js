import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const defaultBillUrl = '/src/assets/images/404.png'
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`
      <div style='text-align: center;' class="bill-proof-container">
        <img
          width=${imgWidth}
          src=${billUrl}
          alt="Bill"
          crossorigin="anonymous"
          onerror="this.onerror=null; this.src='${defaultBillUrl}'"
        />
      </div>
    `)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => ({
            ...doc,
            date: doc.date,
            status: formatStatus(doc.status)
          }))
        return bills
      })
      .catch(error => {
        throw error
      })
    }
  }
}
