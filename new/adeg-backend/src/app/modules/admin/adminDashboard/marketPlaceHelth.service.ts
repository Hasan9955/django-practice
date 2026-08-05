import prisma from "../../../../shared/prisma";
import { getWeekOfMonth, getYear, startOfDay, subDays, format, subMonths } from "date-fns";

// Marketplace Health api here 
const getMarketPlaceHealthData = async () => {
    const totalSales = await prisma.order.count({
        where: {
            orderStatus: "Delivered"
        }
    });

    const totalOrders = await prisma.order.count({
        where: {
            isPaid: true,
        }
    });

    const totalProduct = await prisma.product.count({
        where: {
            isDeleted: false,
            isPublished: true,
        }
    });

    const totalRevenue = await prisma.payment.aggregate({
        where: {
            status: "Paid"
        },
        _sum: {
            amount: true
        }
    });

    return ({
        totalSales,
        totalOrders,
        totalProduct,
        totalRevenue: parseFloat(totalRevenue._sum.amount?.toFixed(2) as string) || 0
    })
}


const getMarketPlaceRevenueChartData = async (options: { filter?: "week" | "month" | "year" }) => {
    const now = new Date();
    const filter = options.filter || "month";


    const payments = await prisma.payment.findMany({
        where: {
            status: "Paid",
        },
        select: {
            amount: true,
            createdAt: true,
        },
    });


    const revenueByPeriod: Record<string, number> = {};

    for (const payment of payments) {
        const paymentDate = new Date(payment.createdAt);

        let key = "";
        if (filter === "week") {
            key = `W${getWeekOfMonth(paymentDate)}`;
        } else if (filter === "month") {
            key = paymentDate.toLocaleString("default", { month: "short" });
        } else if (filter === "year") {
            key = getYear(paymentDate).toString();
        }

        revenueByPeriod[key] = (revenueByPeriod[key] || 0) + payment.amount;
    }

    let periods: string[] = [];
    if (filter === "week") {
        periods = ["W1", "W2", "W3", "W4"];
    } else if (filter === "month") {
        periods = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    } else if (filter === "year") {
        const currentYear = getYear(now);
        periods = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
    }

    const chartData = periods.map((period) => ({
        period,
        revenue: Number(revenueByPeriod[period]?.toFixed(2)) || 0,
    }));

    return chartData;
};



const marketPlaceHealthSalesChartData = async (
    options: "12months" | "30days" | "7days" | "24hours"
) => {
    const period = options || "12months";
    const now = new Date();
    let labels: string[] = [];
    const dataMap: Record<string, { listing: number; order: number; delivered: number }> = {};

    if (period === "12months") {
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        labels.forEach((m) => (dataMap[m] = { listing: 0, order: 0, delivered: 0 }));

        const products = await prisma.product.findMany({
            where: {
                createdAt: { gte: new Date(now.getFullYear(), 0, 1) },
                isDeleted: false, 
                isPublished: true 
            },
            select: { createdAt: true }
        });
        products.forEach(p => {
            const month = labels[p.createdAt.getMonth()];
            dataMap[month].listing++;
        });

        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: new Date(now.getFullYear(), 0, 1) }, isPaid: true },
            select: { createdAt: true, orderStatus: true }
        });
        orders.forEach(o => {
            const month = labels[o.createdAt.getMonth()];
            dataMap[month].order++;
            if (o.orderStatus === "Delivered") dataMap[month].delivered++;
        });
    }

    else if (period === "30days") {
        labels = Array.from({ length: 30 }, (_, i) => {
            const d = subDays(now, 29 - i);
            return format(d, "dd MMM");
        });
        labels.forEach(l => (dataMap[l] = { listing: 0, order: 0, delivered: 0 }));

        const startDate = subDays(startOfDay(now), 29);

        const products = await prisma.product.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true }
        });
        products.forEach(p => {
            const day = format(p.createdAt, "dd MMM");
            if (dataMap[day]) dataMap[day].listing++;
        });

        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, orderStatus: true }
        });
        orders.forEach(o => {
            const day = format(o.createdAt, "dd MMM");
            if (dataMap[day]) {
                dataMap[day].order++;
                if (o.orderStatus === "Delivered") dataMap[day].delivered++;
            }
        });
    }

    else if (period === "7days") {
        labels = Array.from({ length: 7 }, (_, i) => format(subDays(now, 6 - i), "EEE"));
        labels.forEach(l => (dataMap[l] = { listing: 0, order: 0, delivered: 0 }));

        const startDate = subDays(startOfDay(now), 6);

        const products = await prisma.product.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true }
        });
        products.forEach(p => {
            const day = format(p.createdAt, "EEE");
            if (dataMap[day]) dataMap[day].listing++;
        });

        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, orderStatus: true }
        });
        orders.forEach(o => {
            const day = format(o.createdAt, "EEE");
            if (dataMap[day]) {
                dataMap[day].order++;
                if (o.orderStatus === "Delivered") dataMap[day].delivered++;
            }
        });
    }

    else if (period === "24hours") {
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        labels.forEach(l => (dataMap[l] = { listing: 0, order: 0, delivered: 0 }));

        const startDate = startOfDay(now);

        const products = await prisma.product.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true }
        });
        products.forEach(p => {
            const hour = `${p.createdAt.getHours()}:00`;
            if (dataMap[hour]) dataMap[hour].listing++;
        });

        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, orderStatus: true }
        });
        orders.forEach(o => {
            const hour = `${o.createdAt.getHours()}:00`;
            if (dataMap[hour]) {
                dataMap[hour].order++;
                if (o.orderStatus === "Delivered") dataMap[hour].delivered++;
            }
        });
    }


    return labels.map(label => ({
        name: label,
        ...dataMap[label]
    }));
};


const getNewlyListedProducts = async () => {
    const oneMonthAgo = subMonths(new Date(), 1);

    // Get products from last 1 month with their total order count
    const products = await prisma.product.findMany({
        where: {
            createdAt: { gte: oneMonthAgo },
            isDeleted: false,
            isPublished: true
        },
        include: {
            shop: {
                include: {
                    seller: {
                        select: {
                            id: true,
                            fullName: true,
                            profileImage: true,
                            location: true,
                        },
                    },
                },
            },
            Varient: {
                include: {
                    Order: true,
                },
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const newListedProduct = products.length;

    const productData = products.map((product) => {

        const totalOrder = product.Varient.reduce((total, varient) => total + varient.Order.length, 0);

        return {
        id: product.id,
        productName: product.productName, 
        productPhoto: product.productPhoto,
        createdAt: product.createdAt,
        totalOrder, 
        sellerInfo: {
            id: product.shop.seller.id,
            fullName: product.shop.seller.fullName,
            profileImage: product.shop.seller.profileImage,
            location: product.shop.seller.location
        },
        store: {
            id: product.shop.id,
            storeName: product.shop.shopName,
            bannerImage: product.shop.bannerImage,
            
        }
    }
    });

    return {
        newListedProduct,
        productData
    };
};




export const marketPlaceHealthService = {
    getMarketPlaceHealthData,
    getMarketPlaceRevenueChartData,
    marketPlaceHealthSalesChartData,
    getNewlyListedProducts
};