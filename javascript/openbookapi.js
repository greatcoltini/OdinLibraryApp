// Make the fetch request.
async function GET_BOOK_DATA(title){
    // Construct the URL for the Google Books API search.
    const bookTitle = title;
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const book_list = []
        const data = await response.json();

        var listSize = data.items.length;

        // data.items.forEach(item => {

        // })
        for (let i = 0; i < listSize; i++)
        {
            const ISBN = data.items[i].volumeInfo.industryIdentifiers[1].identifier;
            const properAuthor = data.items[i].volumeInfo.authors[0];
            const properTitle = data.items[i].volumeInfo.title;
            var imgLink = ""
            if (data.items[i].volumeInfo.imageLinks){
                imgLink = data.items[i].volumeInfo.imageLinks.thumbnail;
            }
            const pageCount = data.items[i].volumeInfo.pageCount;
            book_list.push([ISBN, properAuthor, properTitle, imgLink, pageCount])
        }
        console.log(data.items[0].volumeInfo);
        
        return book_list;
    } catch (error) {
        // Handle errors.
        console.error('There was a problem with the fetch operation:', error);
        return ""; // Return an empty string or handle the error accordingly
    }
}






