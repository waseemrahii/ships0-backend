import mongoose from "mongoose"

export const buildFilterQuery = (query) => {
    const {
        category, latest, newArrival, status, userId, userType, vendorNew4Days
    } = query;
    let filter = {};

    if (category) filter.category = category;

    if (status) filter.status = status;


 
    // if (userId) filter.userId = userId;
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);

    if (userType) filter.userType = userType;

      if (vendorNew4Days === 'true') {
        const last4Days = new Date();
        last4Days.setDate(last4Days.getDate() - 4);
        filter.createdAt = { $gte: last4Days };
        delete filter.createdAt;
    }
    if (latest === 'true') {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        filter.createdAt = { $gte: last7Days };
    }

    if (newArrival === 'true') {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        filter.createdAt = { $gte: last30Days };
    }

    return filter;
};

export const buildSortOptions = (sort, order) => {
    let sortOptions = {};
    if (sort) {
        sortOptions[sort] = order === 'asc' ? 1 : -1;
    } else {
        sortOptions.createdAt = -1;
    }
    return sortOptions;
};