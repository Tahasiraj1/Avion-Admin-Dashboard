import { defineType, defineField } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      description: "A unique identifier for the product.",
    }),
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      description: "The name of the product.",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "string",
      description: "The price of the product.",
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image" }],
      description: "Images of the product.",
    }),
    defineField({
      name: "ratings",
      title: "Ratings",
      type: "number",
      description: "The average ratings of the product (e.g., '5.0').",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Tags to categorize the product (e.g., 'Best Selling').",
    }),
    defineField({
      name: "discountPercentage",
      type: "number",
      title: "Discount Percentage",
    }),
    defineField({
      name: "priceWithoutDiscount",
      type: "string",
      title: "Price Without Discount",
      description: "Original price before discount",
    }),
    defineField({
      name: "ratingCount",
      type: "number",
      title: "Rating Count",
      description: "Number of ratings",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "A detailed description of the product.",
    }),
    defineField({
      name: "variations",
      title: "Product Variations",
      type: "array",
      of: [
        defineField({
          name: "variation",
          type: "object",
          fields: [
            {
              name: "color",
              title: "Color",
              type: "string",
              description: "Color of the product variation.",
            },
            {
              name: "size",
              title: "Size",
              type: "string",
              description: "Size of the product variation.",
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
              description: "Available quantity for this variation.",
            },
          ],
        }),
      ],
      description: "List of variations for the product, including size, color, and quantity.",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      description: "A list of categories this product belongs to.",
    }),
  ],
});