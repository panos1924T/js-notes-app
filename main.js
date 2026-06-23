const daysGR = [`Κυριακή`, `Δευτέρα`, `Τρίτη`, `Τετάρτη`, `Πέμπτη`, `Παρασκευή`, `Σάββατο`]
const monthsGR = [`Ιανουαρίου`, `Φεβρουαρίου`, `Μαρτίου`, `Απριλίου`, `Μαϊου`, `Ιουνίου`, `Ιουλίου`, `Αυγούστου`, `Σεπτεμβρίου`, `Οκτωβρίου`, `Νοεμβρίου`, `Δεκεμβρίου`]

let notes = loadNotes()
let nextId = notes.length > 0 ? Math.max(...notes.map(n => n.key)) + 1 : 1
let editingKey = null

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
    if (!confirm(`Διαγραφή σημείωσης;`)) return
    notes = notes.filter(noteObj => noteObj.key !== key) // immutable delete
    saveNotes()
    renderNotes()
}

function createNoteElement(noteObj) {
    const div = document.createElement(`div`)
    div.id = `noteTemplate` + noteObj.key
    div.className = `flex justify-between items-center px-[2px] border-b mx-[10px] border-black`

    const checkbox = document.createElement(`input`)
    checkbox.id = `checkbox` + noteObj.key
    checkbox.type = `checkbox`
    checkbox.checked = noteObj.softDeleted
    checkbox.addEventListener(`click`, () => strikeThrough(noteObj.key))

    div.appendChild(checkbox)

    if (editingKey === noteObj.key) {
        // --- EDIT MODE ---
        const input = document.createElement(`input`)
        input.addEventListener(`keyup`, (e) => {
            if (e.key === `Enter`) updateNote(noteObj.key, input.value)
            })
        input.type = `text`
        input.value = noteObj.note
        input.className = `flex-1 m-[10px] border border-black px-[5px] text-base`

        const saveBtn = document.createElement(`button`)
        saveBtn.textContent = `✓`
        saveBtn.className = `w-[35px] rounded-full border border-black mr-1 text-green-700 font-bold`
        saveBtn.addEventListener(`click`, () => updateNote(noteObj.key, input.value))

        const cancelBtn = document.createElement(`button`)
        cancelBtn.textContent = `✕`
        cancelBtn.className = `w-[35px] rounded-full border border-black`
        cancelBtn.addEventListener(`click`, () => { editingKey = null; renderNotes() })

        div.appendChild(input)
        div.appendChild(saveBtn)
        div.appendChild(cancelBtn)
    } else {
        // --- VIEW MODE ---
        const label = document.createElement(`label`)
        label.htmlFor = checkbox.id
        label.textContent = noteObj.note
        label.className = `flex-1 max-h-[100px] overflow-y-auto break-words whitespace-normal m-[10px] text-base ${noteObj.softDeleted ? `line-through text-gray-500` : ``}`

        const editBtn = document.createElement(`button`)
        editBtn.textContent = `✎`
        editBtn.className = `w-[35px] rounded-full border border-black mr-1`
        editBtn.addEventListener(`click`, () => { editingKey = noteObj.key; renderNotes() })

        const deleteBtn = document.createElement(`button`)
        deleteBtn.id = `deleteBtn` + noteObj.key
        deleteBtn.textContent = `X`
        deleteBtn.className = `w-[35px] rounded-full border border-black`
        deleteBtn.addEventListener(`click`, () => deleteNote(noteObj.key))

        div.appendChild(label)
        div.appendChild(editBtn)
        div.appendChild(deleteBtn)
    }

    return div
}

function loadNotes() {
    const saved = localStorage.getItem("notes")
    return saved ? JSON.parse(saved) : []
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes))
}

function updateNote(key, newText) {
    if (!newText.trim()) return
    notes = notes.map(note => note.key === key ? {...note, note: newText.trim()} : note)
    editingKey = null
    saveNotes()
    renderNotes()
}