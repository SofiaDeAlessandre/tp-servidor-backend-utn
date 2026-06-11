import { Book } from "../models/BookModel.js";

// Obtener TODOS los libros

const getBooks = async (req, res) => {
  try {
    const userLogged = req.userLogged;
    const filterBooks = await Book.find(
      { userId: userLogged.id },
      { userId: 0 },
    );
    res.json({
      success: true,
      data: filterBooks,
      message: "Books fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching books" });
  }
};

// Obtener UN libro por su ID

const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    // Protección por usuario:
    // Verifica que el libro pertenezca al usuario autenticado
    const foundBook = await Book.findOne(
      {
        _id: id,
        userId: req.userLogged.id,
      },
      { userId: 0 },
    );

    if (!foundBook) {
      return res.status(404).json({
        success: false,
        error: "Book not found",
      });
    }

    res.json({
      success: true,
      data: foundBook,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }
};

// Agregar un libro

const createBook = async (req, res) => {
  try {
    const body = req.body;
    const userLogged = req.userLogged;

    const newBook = await Book.create({
      title: body.title,
      price: body.price,
      genre: body.genre,
      pages: body.pages,
      read: body.read ?? false, // read no debe depender de pages, el usuario decide si lo leyó
      userId: userLogged.id,
    });

    // destructuring para eliminar el userId del objeto libro y quedarnos con el resto de la data
    const { userId, ...publicDataBook } = newBook.toObject();

    res.json({
      success: true,
      data: publicDataBook,
      message: "Book created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating book" });
  }
};

// Actualizar un libro por ID

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Solo permite modificar libros creados por el usuario autenticado
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: id,
        userId: req.userLogged.id,
      },
      body,
      { new: true, projection: { userId: 0 } },
    ); // pasando body directamente, el usuario manda exactamente lo que quiere actualizar (read es una decisión del usuario, no una consecuencia de otro campo)

    if (!updatedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({
      success: true,
      data: updatedBook,
      message: "Book updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" });
  }
};

// Eliminar UN libro por su ID

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo permite eliminar libros asociados al usuario autenticado
    const deletedBook = await Book.findOneAndDelete({
      _id: id,
      userId: req.userLogged.id,
    });

    if (!deletedBook) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // destructuring para eliminar el userId del objeto libro
    const { userId, ...publicDataBook } = deletedBook.toObject();

    res.json({
      success: true,
      data: publicDataBook,
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid ID format" });
  }
};

export { getBooks, getBook, createBook, updateBook, deleteBook };
