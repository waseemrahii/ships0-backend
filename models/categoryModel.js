import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name."],
      unique: true,
    },
    logo: {
      type: String, // Store Cloudinary URL here
    },
    slug: String,
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
    console.log(`Slug updated to: ${this.slug}`);
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
