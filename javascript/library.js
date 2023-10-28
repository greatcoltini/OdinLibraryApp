var bookLibrary = [];

// call modal
var bookSelectionModal = new bootstrap.Modal(document.getElementById("exampleModalCenter"),{
    keyboard: false
})

// Constructor for book object
function Book(title, author, pages, read, cover, favourited){ 
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.cover = cover;
    this.favourited = favourited;

    this.info = function () {
        let bookinfo = title + " by " + author + ", " + pages + " pages, "
        if (!read)
            bookinfo += "not read yet"
        else 
            bookinfo += "and read"
        
        return bookinfo
    }
}

// Function to update library sidebar when books are added / removed
function updateSidebar(){
    // we want to parse through book library, and add entries on the sidebar if we have corresponding books
    const sidebar = document.getElementById("alphabet-list");
    const library_title = document.getElementById("library-title");
    const library_background = document.getElementById("jumbotron");

    let total_books = 0;
    let read_books = 0;
    
    // clear sidebar
    while (sidebar.firstChild){
        sidebar.removeChild(sidebar.lastChild);
    }

    // iterate through book library
    bookLibrary.forEach(book => {
        const bookLink = document.createElement("li");
        bookLink.classList.add("li-small");
        bookLink.innerText = book.title;

        if (book.read){
            bookLink.classList.add("crossed");
            read_books += 1;
        }
        else {
            bookLink.classList.remove("crossed");
        }

        sidebar.appendChild(bookLink);
        total_books += 1;
    })

    library_title.innerHTML = "Library";

    if (total_books > 0){
        if (read_books / total_books < 0.50){library_background.style.backgroundColor = "red"}
        else if (read_books / total_books < 0.75){library_background.style.backgroundColor = "yellow"}
        else (library_background.style.backgroundColor = "green")
        // modify title
        library_title.innerHTML += " - " + read_books + "/" + total_books + " read!"
    }
    else {library_background.style.backgroundColor = "#e9ecef"}
    
}

// function to remove book from library of books
function removeBookFromLibrary(book){
    bookLibrary = bookLibrary.filter((books) => books.title != book.title);
    updateSidebar();
    displayLibraryBooks();
}

// book submission form content
var bookSubmit = document.getElementById("add-book-form");

bookSubmit.addEventListener("submit", async (e) => {
    e.preventDefault();

    // handle submit section
    let form = document.querySelector("#add-book-form");
    let title = document.getElementById("book-title").value;
    let author = document.getElementById("book-author").value;
    let pages = document.getElementById("book-pages").value;
    let read = document.getElementById("book-read").checked;
    let favourite = document.getElementById("book-favourite").checked;

    form.reset();

    // We will call our API from the openbook library to get the ISBN value
    try {
        const book_info = await GET_BOOK_DATA(title);

        // we want to parse through book library, and add entries on the sidebar if we have corresponding books
        let book_modal = document.getElementById("book-modal");
        
        // clear sidebar
        while (book_modal.firstChild){
            book_modal.removeChild(book_modal.lastChild);
        }

        book_info.forEach(book_item =>
            {
            let proper_author = book_item[1];
            let proper_title = book_item[2];
            let img_link = book_item[3];
            let proper_pages = book_item[4];
            let bookEntry = new Book(proper_title, proper_author, proper_pages, read, img_link, favourite);
            addBookToModal(bookEntry);
        })

        bookSelectionModal.toggle();

    } catch (error) {
        console.error('Error:', error);

        // creates book entry
        let bookData = new Book(title, author, pages, read, null);
        // adds the book to our array of books in js
        bookLibrary.push(bookData);
        displayLibraryBooks();
        
    }

})

// Function to create a new book card and populate it with data; add it to our js array
function addBookToPage(bookData) {
    
    // Clone the template
    const template = document.getElementById('book-card-template');
    const clone = document.importNode(template.content, true);

    // Populate the cloned card with data
    const bookCard = clone.querySelector('.book-card');
    bookCard.querySelector('.book-title').textContent = bookData.title;
    bookCard.querySelector('.book-author').textContent = `Author: ${bookData.author}`;
    bookCard.querySelector('.book-pages').textContent = `Pages: ${bookData.pages}`;

    if (!bookData.cover){
        bookCard.removeChild(bookCard.querySelector('.book-cover'));
    }
    else {bookCard.querySelector('.book-cover').src = bookData.cover;}
    const readCheckbox = bookCard.querySelector('.read-checkbox');
    readCheckbox.checked = bookData.read; // Check or uncheck the "Read" checkbox

    // Add an event listener to the delete button
    const deleteButton = bookCard.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
        // Implement deletion logic here
        // You might want to remove this card from the list
        removeBookFromLibrary(bookData);
    });

    // Add an event listener to the checkmark button to change state of book
    readCheckbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked){
            bookData.read = true
        }
        else if (!event.currentTarget.checked){
            bookData.read = false
        }

        updateSidebar();
    })

    // Append the populated book card to the book list
    const bookList = document.querySelector('.book-list');
    bookList.appendChild(bookCard);
    updateSidebar();
    
}

// Function to create a new book modal card and populate it with data; add it to our js array
function addBookToModal(bookData) {
    // Clone the template
    const template = document.getElementById('book-select-template');
    const clone = document.importNode(template.content, true);

    // Populate the cloned card with data
    const bookModalCard = clone.querySelector('.book-modal-card-template');
    bookModalCard.querySelector('.book-title-temp').textContent = bookData.title;
    bookModalCard.querySelector('.book-author-temp').textContent = `Author: ${bookData.author}`;
    bookModalCard.querySelector('.book-pages-temp').textContent = `Pages: ${bookData.pages}`;
    bookModalCard.querySelector('.book-img-temp').src = bookData.cover;

    // adds the book to our array of books in js
    bookModalCard.addEventListener('click', () => {
        // Implement addition logic here
        // You might want to remove this card from the list
        // call modal
        bookSelectionModal.toggle();
        // adds the book to our array of books in js
        bookLibrary.push(bookData);
        displayLibraryBooks();
    });

    // Append the populated book card to the book list
    const bookModal = document.querySelector('.book-modal');
    bookModal.appendChild(bookModalCard);
}

// parse through library and display books on the page
function displayLibraryBooks() {
    // first clear the log
    let bookListing = document.getElementById("book-list");
    while (bookListing.firstChild){
        bookListing.removeChild(bookListing.lastChild);
    }

    bookLibrary = bookLibrary.sort(function(a, b) {
        var favouriteA, favouriteB
        var nameA, nameB;
        nameA = a.title;
        nameB = b.title;

        // sort by favourited
        if (favouriteA > favouriteB){
            return 1;
        }
        else if (favouriteA < favouriteB){
            return -1;
        }

        // sort by name
        if (nameA < nameB) {
            return -1;
        }
        else if (nameA > nameB) {
            return 1;
        }
        return 0;
    })

    // add each book in sequence
    bookLibrary.forEach(book => {addBookToPage(book)});

    updateSidebar();
}

