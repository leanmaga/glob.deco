const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, isAdmin } = require("../middleware/auth");

// ==========================================
// RUTAS GET - ¡ESTAS FALTABAN!
// ==========================================

// Obtener todos los productos (público - solo activos)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category", "name icon")
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

// Obtener productos por categoría
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    })
      .populate("category", "name icon")
      .sort({ featured: -1, order: 1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

// Obtener un producto específico
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name icon")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
    });
  }
});

// ==========================================
// RUTAS POST/PUT/DELETE (admin)
// ==========================================

// Crear producto (admin)
router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;

    // Validación
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Nombre, precio y categoría son requeridos",
      });
    }

    // Validar que el precio sea un número válido
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "El precio debe ser un número válido mayor a 0",
      });
    }

    // Crear producto
    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: parsedPrice,
      category,
      stock: stock || null,
      featured: featured || false,
      images: [],
      isActive: true,
    });

    // Poblar la categoría antes de devolver
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name icon"
    );

    res.status(201).json({
      success: true,
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);

    // Error de validación de Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Error de referencia (categoría no existe)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "La categoría seleccionada no es válida",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
    });
  }
});

// Actualizar producto
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;

    const updateData = {
      name: name?.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      category,
      stock: stock || null,
      featured: featured || false,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name icon");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
    });
  }
});

// Eliminar producto
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el producto",
    });
  }
});

module.exports = router;
