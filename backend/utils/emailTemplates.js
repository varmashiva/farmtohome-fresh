export const generateOrderHtml = (order, customerName, isForAdmin = false, statusUpdate = null) => {
    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                ${item.name} (${item.size})
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                x${item.qty}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${item.price * item.qty}
            </td>
        </tr>
    `).join('');

    const address = order.shippingAddress || order.address || {}; // Safety fallback

    let titleText = isForAdmin ? 'New Order Received! 🎉' : 'Order Confirmed! 🎉';
    let introText = isForAdmin
        ? `A new order (<strong>#${order._id}</strong>) has been placed successfully by <strong>${customerName}</strong>. Please find the details below.`
        : `Hi <strong>${customerName}</strong>,<br>Thank you for choosing Farm to Home! We're preparing your fresh catch. Your order (<strong>#${order._id}</strong>) details are below.`;

    if (statusUpdate === 'delivered') {
        titleText = 'Order Delivered! 🚚';
        introText = `Hi <strong>${customerName}</strong>,<br>Your Farm to Home order (<strong>#${order._id}</strong>) has been successfully delivered! Enjoy your premium seafood.`;
    } else if (statusUpdate === 'cancelled') {
        titleText = 'Order Cancelled ❌';
        introText = `Hi <strong>${customerName}</strong>,<br>Your Farm to Home order (<strong>#${order._id}</strong>) has been cancelled. If you have any questions, please reach out to our support.`;
    }

    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
        
        <!-- Header -->
        <div style="background-color: #050505; padding: 30px 20px; text-align: center; border-bottom: 3px solid #111;">
            <img src="https://raw.githubusercontent.com/varmashiva/Fresh_prowns/main/frontend/src/assets/media/farm%20to%20homelll.png" alt="Farm to Home Logo" style="max-height: 40px; margin-bottom: 10px;" />
            <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">FARM TO HOME</h1>
            <p style="color: #888888; letter-spacing: 1px; font-size: 12px; margin-top: 5px; text-transform: uppercase;">Pristine Seafood Delivery</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; color: #333333;">
            <h2 style="font-size: 20px; margin-top: 0; color: #111111;">
                ${titleText}
            </h2>
            <p style="font-size: 15px; line-height: 1.6; color: #555555;">
                ${introText}
            </p>

            <!-- Order Details -->
            <div style="margin-top: 30px; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #777777; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left; color: #555;">Item</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center; color: #555;">Qty</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right; color: #555;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 15px 12px 0 12px; text-align: right; font-weight: bold; color: #111;">Total Amount:</td>
                            <td style="padding: 15px 12px 0 12px; text-align: right; font-weight: bold; color: #111; font-size: 18px;">
                                ₹${order.totalPrice}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Shipping Information -->
            <div style="margin-top: 30px;">
                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #777777; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Delivery Details</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #444444; margin: 0; background-color: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee;">
                    <strong>Name:</strong> ${address.fullName || customerName}<br>
                    <strong>Address:</strong> ${address.address || 'N/A'}<br>
                    <strong>Community:</strong> ${order.community || 'N/A'}<br>
                    <strong>City:</strong> ${address.city ? address.city + (address.postalCode ? ', ' + address.postalCode : '') : 'N/A'}<br>
                    <strong>Phone:</strong> ${address.phone || 'N/A'}
                </p>
            </div>

            <!-- Footer Notes -->
            ${!isForAdmin ? `
            <div style="margin-top: 40px; text-align: center;">
                <p style="font-size: 13px; color: #888888; line-height: 1.5;">
                    If you have any questions about this order, please contact our support team at<br>
                    <strong><a href="https://wa.me/918884143699" style="color: #4CAF50; text-decoration: none;">+91 8884143699</a></strong>
                </p>
            </div>
            ` : ''}

        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="font-size: 11px; color: #999999; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                &copy; ${new Date().getFullYear()} Farm to Home. All rights reserved.
            </p>
        </div>

    </div>
    `;
};
