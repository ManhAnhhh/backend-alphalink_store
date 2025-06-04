const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");

const index = async (req, res) => {
  const categories = await CategoryModel.aggregate([
    {
      $match: { parent_id: null },
    },
    {
      $lookup: {
        from: "categories",
        let: { parentId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$parent_id", "$$parentId"],
              },
            },
          },
          {
            $addFields: {
              categoryIdStr: { $toString: "$_id" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "categoryIdStr",
              foreignField: "category_id", // kiểu string trong bảng product
              as: "products",
            },
          },
          {
            $addFields: {
              product_count: { $size: "$products" },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              status: 1,
              product_count: 1,
            },
          },
        ],
        as: "children",
      },
    },
    {
      $addFields: {
        categoryIdStr: { $toString: "$_id" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "categoryIdStr",
        foreignField: "category_id",
        as: "products",
      },
    },
    {
      $addFields: {
        product_count: { $size: "$products" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        status: 1,
        product_count: 1,
        children: 1,
      },
    },
  ]);

  categories.forEach((item) => {
    item.children_count = item.children.length;
    if (item.children.length > 0) {
      item.product_count = item.children.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.product_count;
      }, 0);
    }
  });
  res.render("admin/categories/category.ejs", {
    // categoriesActive: categoriesActive,
    // categoriesInactive: categoriesInactive,
    categories: categories,
  });
};

const create = (req, res) => {
  res.render("admin/categories/category", {});
};

const edit = async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.findById({ _id: id });
  
  res.render("admin/categories/edit_category", {
    error: "",
    category: category,
    oldCat: [],
    oldStatus: [],
  });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, status, cat = [], new_status = [] } = req.body;

  
  const currentCategory = await CategoryModel.findById(id);

  // Nếu là danh mục cấp cao (parent_id == null), kiểm tra trùng tên
  if (!currentCategory.parent_id) {
    const existingTop = await CategoryModel.findOne({
      name: name.trim(),
      parent_id: null,
      _id: { $ne: id }, // loại trừ chính nó
    });

    if (existingTop) {
      return res.render("admin/categories/edit_category", {
        error: "Tên danh mục đã tồn tại.",
        category: currentCategory,
        oldCat: cat,
        oldStatus: new_status,
      });
    }
  }

  if (currentCategory.parent_id) {
    const existingSibling = await CategoryModel.findOne({
      name: name.trim(),
      parent_id: currentCategory.parent_id, // kiểm tra cùng cha
      _id: { $ne: id },
    });

    if (existingSibling) {
      return res.render("admin/categories/edit_category", {
        error: "Tên danh mục đã tồn tại trong cùng một thư mục cha.",
        category: currentCategory,
        oldCat: cat,
        oldStatus: new_status,
      });
    }
  }

  // Nếu đang muốn đổi từ inactive -> active
  if (currentCategory.status === "inactive" && status === "active") {
    const parentId = currentCategory.parent_id;

    if (parentId) {
      const parentCategory = await CategoryModel.findOne({ _id: parentId });
      if (parentCategory && parentCategory.status === "inactive") {
        return res.render("admin/categories/edit_category", {
          error:
            "Không thể chuyển trạng thái sang hoạt động vì thư mục cha đang không hoạt động.",
          category: currentCategory,
          oldCat: cat,
          oldStatus: new_status,
        });
      }
    }
  }
  
  if (cat.length > 0) {
    // Kiểm tra trùng tên trong 1 lần submit
    const trimmedNames = cat.map(name => name.trim());
    const nameSet = new Set(trimmedNames);
    if (nameSet.size !== trimmedNames.length) {
      return res.render('admin/categories/edit_category',{ 
        category: currentCategory,
        error: 'Tên danh mục con không được trùng nhau.',
        oldCat: cat,
        oldStatus: new_status,
      });
    }

    // Kiểm tra trùng với DB
    const existing = await CategoryModel.find({
      name: { $in: trimmedNames },
      parent_id: id, // chỉ kiểm tra trong nhánh cha hiện tại
    });
    if (existing.length > 0) {
      const names = existing.map(e => e.name).join(', ');
      return res.render('admin/categories/edit_category', { 
        category: currentCategory, 
        error: `Các tên danh mục đã tồn tại: ${names}`,
        oldCat: cat,
        oldStatus: new_status,
      });
    }

    // Nếu danh mục cha là inactive thì không cho thêm
    if (status === 'inactive') {
      return res.render('admin/categories/edit_category', { 
        category: currentCategory, 
        error: 'Không thể thêm danh mục con khi danh mục cha đang không hoạt động.',
        oldCat: cat,
        oldStatus: new_status, 
      });
    }
    
    // Tạo danh mục con
    const children = trimmedNames.map((childName, index) => ({
      name: childName,
      status: new_status[index],
      parent_id: id,
    }));

    await CategoryModel.insertMany(children);
  }
  
  // console.log(body);

  await CategoryModel.updateOne(
    { _id: id }, // Điều kiện để tìm bản ghi
    {
      $set: {
        name: name,
        status: status,
      },
    } // Cập nhật các trường cần sửa
  );

  // Nếu status mới là 'inactive', cập nhật các thư mục con cấp 1
  if (status === "inactive") {
    await CategoryModel.updateMany(
      { parent_id: id }, // Vì parent_id đang là string
      { $set: { status: "inactive" } }
    );
  }

  res.redirect("/admin/categories");
};

const del = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryModel.deleteOne({ _id: id });
     // Xóa sản phẩm thuộc danh mục đang xóa
    await ProductModel.deleteMany({ category_id: id });
    const totalCategories = await CategoryModel.countDocuments({parent_id: null});
    res.json({ success: true, totalCategories: totalCategories });
  } catch (err) {
    res.json({ success: false, message: "Xóa thất bại" });
  }
};
module.exports = {
  index,
  create,
  edit,
  update,
  del
};
