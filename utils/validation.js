import Category from '../models/categoryModel.js';

export const validateSlug = async (Model, slug) => {
    const obj = slug ? await Model.findOne({ slug }) : null;
    if (slug && !obj) {
        throw new Error(`Invalid ${Model.modelName.toLowerCase()} slug`);
    }
    return obj;
};

export const validateProductDependencies = async ({ category }) => {
    const categoryObj = await validateSlug(Category, category);
 


   
    return {
        categoryObj,
        
    };
};






