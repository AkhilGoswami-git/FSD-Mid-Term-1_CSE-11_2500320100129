const express = require('express');

const app = express();

app.use(express.json());

let books = [];

const PORT = 3000;

app.post('/api/books', (req, res) => {

    const { id, title, author, category, quantity, available } = req.body;

    if (!id || !title || !author || !category ||
        quantity === undefined || available === undefined) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (books.some(book => book.id === id)) {
        return res.status(400).json({
            message: "Duplicate Book ID"
        });
    }

    if (!Number.isInteger(quantity) ||
        !Number.isInteger(available) ||
        quantity < 0 || available < 0 ||
        available > quantity) {
        return res.status(400).json({
            message: "Invalid quantity values"
        });
    }

    const newBook = {
        id,
        title,
        author,
        category,
        quantity,
        available
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

app.get('/api/books', (req, res) => {

    res.status(200).json(books);

});

app.get('/api/books/:id', (req, res) => {

    const book = books.find(b => b.id == req.params.id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);

});


app.put('/api/books/:id', (req, res) => {

    const book = books.find(b => b.id == req.params.id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { id, title, author, category, quantity, available } = req.body;

    if (id !== undefined && id != book.id) {
        return res.status(400).json({
            message: "Book ID cannot be changed"
        });
    }

    const updatedBook = { ...book };

    if (title !== undefined) updatedBook.title = title;
    if (author !== undefined) updatedBook.author = author;
    if (category !== undefined) updatedBook.category = category;

    if (quantity !== undefined) {
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({
                message: "Invalid quantity"
            });
        }

        updatedBook.quantity = quantity;
    }

    if (available !== undefined) {
        if (!Number.isInteger(available) || available < 0) {
            return res.status(400).json({
                message: "Invalid available quantity"
            });
        }

        updatedBook.available = available;
    }

    if (updatedBook.available > updatedBook.quantity) {
        return res.status(400).json({
            message: "Available cannot exceed quantity"
        });
    }

    Object.assign(book, updatedBook);

    res.status(200).json({
        message: "Book updated successfully",
        book: book
    });

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.delete('/api/books/:id', (req, res) => {

    const index = books.findIndex(b => b.id == req.params.id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const book = books[index];

    if (book.available < book.quantity) {
        return res.status(400).json({
            message: "Cannot delete book. Some copies are issued."
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });

});

// Task 6: Search Books
app.get('/api/books/search', (req, res) => {

    const title = req.query.title;

    if (!title) {
        return res.status(400).json({
            message: "Please provide a title to search"
        });
    }

    const result = books.filter(book =>
        book.title.toLowerCase().includes(title.toLowerCase())
    );

    res.status(200).json({
        message: "Search results",
        books: result
    });

});
// Task 7A: Issue Book
app.post('/api/books/:id/issue', (req, res) => {

    const book = books.find(b => b.id == req.params.id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.available <= 0) {
        return res.status(400).json({
            message: "No books available for issue"
        });
    }

    book.available--;

    res.status(200).json({
        message: "Book issued successfully",
        book: book
    });

});