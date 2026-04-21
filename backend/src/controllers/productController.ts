import type { Request, Response } from "express";

import * as queries from "../db/queries";
import cloudinary from "../config/cloudinary";
import { getAuth } from "@clerk/express";
import multer from "multer";
import { lstat } from "fs";
import { clearScreenDown } from "readline";

// Get all products (public)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await queries.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
};

// Get products by current user (protected)
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await queries.getProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting user products:", error);
    res.status(500).json({ error: "Failed to get user products" });
  }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = await queries.getProductById(id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
};

// Create product (protected)
export const createProduct = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, handoverDate, releaseDate } = req.body;

    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    if (!title || !description || !handoverDate) {
      res
        .status(400)
        .json({ error: "Title, description  and handoverDate are required" });
      return;
    }

    // const product = await queries.createProduct({
    //   title,
    //   description,
    //   imageUrl,
    //   userId: 'user_39F3HhT4cjOW2dL6E60i2SWnHQZ',
    //   handoverDate,
    //   releaseDate: releaseDate || null,
    // });

    // res.status(201).json(product);

    //****************************** */
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    // Upload image to Cloudinary if file exists
    if (req.file) {
      const file = req.file;

      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vehicle-services" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        stream.end(file.buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      console.log("public id", imagePublicId);
    }

    // Save product in database
    const product = await queries.createProduct({
      title,
      description,
      imageUrl,
      imagePublicId,
      userId /*"user_39F3HhT4cjOW2dL6E60i2SWnHQZ", // temporary user */,
      handoverDate: new Date(handoverDate),
      releaseDate: releaseDate ? new Date(releaseDate) : null,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update product (protected - owner only)
export const updateProduct = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { userId } = getAuth(req);
    /*const userId = "user_39F3HhT4cjOW2dL6E60i2SWnHQZ"; // temporary user */
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, description, handoverDate, releaseDate } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid product id" });
    }

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only update your own products" });
      return;
    }

    let imageUrl = existingProduct.imageUrl;
    let imagePublicId = existingProduct.imagePublicId;

    // const product = await queries.updateProduct(id, {
    //   title,
    //   description,
    //   imageUrl,
    //   handoverDate,
    //   releaseDate,
    // });

    // res.status(200).json(product);

    // If new image uploaded
    if (req.file) {
      // Delete old Cloudinary image
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(existingProduct.imagePublicId);
      }

      // Upload new image
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vehicle-services" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        stream.end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // 🔥 SAFE UPDATE OBJECT
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (handoverDate) updateData.handoverDate = new Date(handoverDate);
    if (releaseDate) updateData.releaseDate = new Date(releaseDate);

    updateData.imageUrl = imageUrl;
    updateData.imagePublicId = imagePublicId;
    updateData.updatedAt = new Date(); // ✅ important

    const updatedProduct = await queries.updateProduct(id, updateData);

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product (protected - owner only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid product id" });
    }

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own products" });
      return;
    }

    await queries.deleteProduct(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
