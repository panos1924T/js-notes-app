const daysGR = [`Κυριακή`, `Δευτέρα`, `Τρίτη`, `Τετάρτη`, `Πέμπτη`, `Παρασκευή`, `Σάββατο`]
const monthsGR = [`Ιανουαρίου`, `Φεβρουαρίου`, `Μαρτίου`, `Απριλίου`, `Μαϊου`, `Ιουνίου`, `Ιουλίου`, `Αυγούστου`, `Σεπτεμβρίου`, `Οκτωβρίου`, `Νοεμβρίου`, `Δεκεμβρίου`]

let notes = loadNotes()
let nextId = notes.length > 0 ? Math.max(...notes.map(n => n.key)) + 1 : 1

window.addEventListener(`DOMContentLoaded`, function(){
    const inputNote = document.querySelector(`#inputNote`)
    const addButton = document.querySelector(`#addNoteBtn`)
    const getNoteValue = () => inputNote.value.trim()

    const getNewNote = () => ({
        key: nextId,
        note: getNoteValue(),
        softDeleted: false
    });

    this.setInterval(() => printGrDate(), 1000)

    addButton.addEventListener(`click`, () => {
        onInsertHandler(getNewNote())
        inputNote.value = ``
    })

    inputNote.addEventListener(`keyup`, function(e) {
        if (e.key === `Enter`) {
            onInsertHandler(getNewNote())
            inputNote.value = ``
        }
    })

    renderNotes()

})

function printGrDate() {
    const now = new Date()
    const pad = n => String(n).padStart(2, `0`)

    const dateStr = `${daysGR[now.getDay()]} ${now.getDate()} ${monthsGR[now.getMonth()]} ${now.getFullYear()}`
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    document.getElementById(`datetxt`).innerHTML = `${dateStr}<br>${timeStr}`
}

function onInsertHandler(noteObj) {
    if (!noteObj?.note) return

    insertNote(noteObj)
    renderNotes()
}

function insertNote(noteObj) {
    notes = [...notes, noteObj] //immutable insert/update
    nextId ++
    saveNotes()
}

function renderNotes() {
    const notesContainer = document.querySelector(`#notesWrapper`)
    notesContainer.textContent = ``
    notes.forEach(noteObj => notesContainer.appendChild(createNoteElement(noteObj)))
}

function strikeThrough(key) {
    notes = notes.map(note => note.key === key ? {...note, softDeleted: !note.softDeleted} : note)
    saveNotes()
    renderNotes()
}

function deleteNote(key) {
    notes = notes.filter(noteObj => noteObj.key !== key) // immutable delete
    saveNotes()
    renderNotes()
}

function createNoteElement(noteObj) {
    const div = document.createElement(`div`)
    div.id = `noteTemplate` + noteObj.key
    div.className = `flex justify-between items-center px-[2px] border-b border-black`

    const checkbox = document.createElement(`input`)
    checkbox.id = `checkbox` + noteObj.key
    checkbox.type = `checkbox`
    checkbox.checked = noteObj.softDeleted
    checkbox.addEventListener(`click`, () => strikeThrough(noteObj.key))

    const label = document.createElement(`label`)
    label.htmlFor = checkbox.id
    label.textContent = noteObj.note
    label.className = `w-[200px] max-h-[100px] overflow-hidden break-words whitespace-normal text-base ${noteObj.softDeleted ? `line-through text-gray-500` : ``}`

    const deleteBtn = document.createElement(`button`)
    deleteBtn.id = `deleteBtn` + noteObj.key
    deleteBtn.textContent = `X`
    deleteBtn.className = `w-[35px] rounded-full border border-black`
    deleteBtn.addEventListener(`click`, () => deleteNote(noteObj.key))

    div.appendChild(checkbox)
    div.appendChild(label)
    div.appendChild(deleteBtn)

    return div
}

function loadNotes() {
    const saved = localStorage.getItem("notes")
    return saved ? JSON.parse(saved) : []
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes))
}