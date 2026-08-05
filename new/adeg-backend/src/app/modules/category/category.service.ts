import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// // const createCategory = async (
// //   name: string,
// //   uploadedUrl: any
// // ) => {
// //   const result = await prisma.category.create({
// //     data: {
// //       name,
// //       imageUrl: uploadedUrl,
// //     },
// //   });
// //   return result;
// // };
const getAllCategory = async () => {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    select: { 
      id: true, 
      name: true, 
      displayName: true,
      parentId: true, 
      categoryPhoto: true, 
      ancestors: true, 
      Attribute: {
        select: {
          id: true,
          name: true,
          type: true,
          isRequired: true,
          values: {
            select: {
              id: true,
              value: true,
              isApproved: true
            }
          }
        }
      },
    
      createdAt: true, 
      updatedAt: true 
    },
    orderBy: { createdAt: 'desc' },
  });

  const map: Record<string, any[]> = {};


  categories.forEach(cat => {
    
    const parentKey = cat.parentId?.toString() || "null"; 
    if (!map[parentKey]) map[parentKey] = [];

    map[parentKey].push({ ...cat, subCategories: [] });
  });


  const attachChildren:any = (parentKey: string) => {
    return (map[parentKey] || []).map(cat => ({
      ...cat,
      subCategories: attachChildren(cat.id.toString()),
    }));
  };

 
  return attachChildren("null");
};


const getSingleCategory = async (id: string) => {

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      categoryPhoto: true,
      Attribute: {
        select: {
          id: true,
          name: true,
          type: true,
          isRequired: true,
          values: {
            select: {
              id: true,
              value: true,
              isApproved: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }


  const subCategories = await prisma.category.findMany({
    where: { parentId: id, isDeleted: false },
    select: {
      id: true,
      name: true,
      categoryPhoto: true,
      Attribute: {
        select: {
          id: true,
          name: true,
          type: true,
          isRequired: true,
          values: {
            select: {
              id: true,
              value: true,
              isApproved: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...category,
    subCategories, 
  };
};


// const deleteCategory = async (id: string) => {
//   const category = await prisma.category.findUnique({
//     where: { id, isDeleted: false },
//   });
//   if (!category) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
//   }

//   await prisma.category.update({
//     where: { id },
//     data: { isDeleted: true },
//   });

//   return category;
// };

 



// const updateCategory = async (
//   id: string,
//   name: string,
//   uploadedUrl: any
// ) => {
//   const category = await prisma.category.findUnique({
//     where: { id },
//   });

//   if (!category) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
//   }

//   const updatedCategory = await prisma.category.update({
//     where: { id },
//     data: {
//       name,
//       imageUrl: uploadedUrl,
//     },
//   });

//   return updatedCategory;
// };

export const CategoryServices = {
  getAllCategory,
  getSingleCategory,
    // deleteCategory,
    // updateCategory,
};
