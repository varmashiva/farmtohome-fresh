export const sendEmail = async (to, sub, mailBody) => {
    try {
        const response = await fetch('https://ajgnzpiwj4sxceymhtumapvue40mvpuf.lambda-url.eu-north-1.on.aws/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ to, sub, mailBody })
        });

        // Ensure successful standard response body reading if AWS returns one
        const data = await response.text();
        console.log(`Email successfully dispatched to ${to}. Lambda response:`, data);
        return data;
    } catch (error) {
        console.error(`Failed to dispatch email to ${to}:`, error.message);
        return null; // Fire and forget
    }
};
