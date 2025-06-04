const ProductModel = require("../../models/Product");
const CategoryModel = require("../../models/Category");
const fs = require("fs");
const path = require("path");
const config = require("config");
const Helper = require("../../../helper/utilities");

const index = async (req, res) => {
  const products = await ProductModel.aggregate([
    { $addFields: { catIdObj: { $toObjectId: "$category_id" } } },
    {
      $lookup: {
        from: "categories",
        localField: "catIdObj",
        foreignField: "_id",
        as: "category_info",
      },
    },
    { $unwind: "$category_info" },
    { $sort: { _id: -1 } },
  ]);

  const productsActive = products.filter((item) => item.status == 'active');
  const productsInactive = products.filter((item) => item.status == 'inactive');

  res.render("admin/products/product.ejs", {
    products: productsActive,
    productsInactive: productsInactive,
    formatDateToDDMMYYYYHHMMSS: Helper.formatDateToDDMMYYYYHHMMSS,
  });
};

const inactive = async (req, res) => {
  const productsActive = await ProductModel.aggregate([
    { $match: { status: 'active' } },
    { $addFields: { catIdObj: { $toObjectId: "$category_id" } } },
    {
      $lookup: {
        from: "categories",
        localField: "catIdObj",
        foreignField: "_id",
        as: "category_info",
      },
    },
    { $unwind: "$category_info" },
    { $sort: { _id: -1 } },
  ]);

  const products = await ProductModel.aggregate([
    { $match: { status: 'inactive' } },
    { $addFields: { catIdObj: { $toObjectId: "$category_id" } } },
    {
      $lookup: {
        from: "categories",
        localField: "catIdObj",
        foreignField: "_id",
        as: "category_info",
      },
    },
    { $unwind: "$category_info" },
    { $sort: { _id: -1 } },
  ]);
  res.render("admin/products/inactive_product.ejs", {
    products: products,
    productsActive: productsActive,
    formatDateToDDMMYYYYHHMMSS: Helper.formatDateToDDMMYYYYHHMMSS,
  });
}

const create = async (req, res) => {
  const categories = await CategoryModel.find({});
  // console.log(categories);
  res.render("admin/products/add_product", {
    categories: categories,
  });
};

const store = async (req, res) => {
  const { body, files } = req;
  const product = {
    name: body.name,
    star: 0,
    color: body.color,
    price: Number(body.price),
    discount: 0,
    is_stock: body.is_stock == "on",
    is_feature: body.is_feature == "on",
    product_details: body.product_details,
    accessories: body.accessories,
    category_id: body.category_id,
    sold: 0,
    stock: Number(body.stock),
  };

  // upload
  if (files.length > 0) {
    const images = files.map((file) => {
      return file.filename;
    });
    product["img"] = images;

    await new ProductModel(product).save();
    res.redirect("/admin/products");
  } else {
  }
};

const edit = async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.findById({ _id: id });
  const category = await CategoryModel.findById({ _id: product.category_id });
  const categories = await CategoryModel.find({});
  // console.log(product);
  res.render("admin/products/edit_product", {
    product: product,
    category: category,
    categories: categories,
  });
};

const update = async (req, res) => {
  const { id } = req.params;
  const product = await ProductModel.findById({ _id: id });
  const { body } = req;

  const listImages = body.listImages.split(",");
  const deletedImages = body.deletedImages.split(",");
  const newImages = listImages.filter((item) => !deletedImages.includes(item));
  // để cập nhật tên sau khi xóa các ảnh temp
  const finalImages = [];

  // xóa các ảnh đã xóa trong file
  for (const item of deletedImages) {
    if (item) {
      console.log("anh xoa:", item);
      fs.unlinkSync(
        path.join(config.get("app.static_folder"), `uploads/products/${item}`)
      );
    }
  }

  // đổi tên các ảnh đã cập nhật vào folder và sẽ lưu vào db
  // => xóa các ảnh rác (ảnh cập nhật vào folder nhưng k lưu vào db)
  for (const item of newImages) {
    if (item.includes("temp")) {
      const oldPath = path.join(
        config.get("app.static_folder"),
        `uploads/products/${item}`
      );
      const newName = item.replace("temp-", "");
      const newPath = path.join(
        config.get("app.static_folder"),
        `uploads/products/${newName}`
      );
      fs.renameSync(oldPath, newPath);
      finalImages.push(newName);
    } else {
      finalImages.push(item);
    }
  }

  // xóa các ảnh rác (ảnh cập nhật vào folder nhưng k lưu vào db)
  const folderPath = path.join(
    config.get("app.static_folder"),
    `uploads/products/`
  );
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

    // Lọc những file có tên chứa 'temp'
    const tempFiles = files.filter((file) => file.includes("temp"));

    if (tempFiles.length === 0) {
      console.log("No temp files found.");
      return;
    }

    // Xoá từng file
    tempFiles.forEach((file) => {
      const filePath = path.join(folderPath, file);
      try {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting ${file}:`, err);
          } else {
            console.log(`Deleted: ${file}`);
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  });

  await ProductModel.updateOne(
    { _id: id }, // Điều kiện để tìm bản ghi
    {
      $set: {
        name: body.name,
        color: body.color,
        price: Number(body.price),
        discount: 0,
        is_stock: body.is_stock == "on",
        is_feature: body.is_feature == "on",
        product_details: body.product_details,
        accessories: body.accessories,
        category_id: body.category_id,
        img: finalImages,
      },
    } // Cập nhật các trường cần sửa
  );

  res.redirect("/admin/products");
};

const trash = async (req, res) => {
  try {
    const { id } = req.params;
    // Cập nhật status = 'inactive'
    await ProductModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { status: "inactive" },
      }
    );
    const totalActive = await ProductModel.countDocuments({ status: "active" });
    const totalInactive = await ProductModel.countDocuments({ status: "inactive" });
    // console.log(total);
    res.json({ success: true, totalActive: totalActive, totalInactive: totalInactive });
  } catch (err) {
    res.json({ success: false, message: "Xóa thất bại" });
  }
};

const del = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById({ _id: id });
    // xóa ảnh trong folder
    if (product.img.length > 0) {
      for (const item of product.img) {
        fs.unlinkSync(
          path.join(config.get("app.static_folder"), `uploads/products/${item}`)
        );
      }
    }
    await ProductModel.deleteOne({ _id: id });
    const totalActive = await ProductModel.countDocuments({ status: "active" });
    const totalInactive = await ProductModel.countDocuments({ status: "inactive" });
    // console.log(total);
    res.json({ success: true, totalActive: totalActive, totalInactive: totalInactive });
  } catch (err) {
    res.json({ success: false, message: "Xóa thất bại" });
  }
};

const restore = async (req, res) => {
  try {
    const { id } = req.params;
    // Cập nhật status = 'active'
    await ProductModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { status: "active" },
      }
    );
    const totalActive = await ProductModel.countDocuments({ status: "active" });
    const totalInactive = await ProductModel.countDocuments({ status: "inactive" });
    res.json({ success: true, totalInactive: totalInactive,totalActive: totalActive });
  }catch (err) {
    res.json({ success: false, message: "Khôi phục thất bại" });
  }
}

module.exports = {
  create,
  index,
  store,
  edit,
  update,
  trash,
  del,
  inactive,
  restore
};
