import { StripeServices } from "../modules/payment/payment.service";

const paymentSuccessTemplate = async () => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        /* Basic Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background-color: #121212;
            color: #ffffff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
        }

        .container {
            background: linear-gradient(145deg, #2c3e50, #34495e);
            border-radius: 10px;
            padding: 50px;
            max-width: 500px;
            width: 100%;
        }

        h1 {
            font-size: 36px;
            margin-bottom: 20px;
        }

        p {
            font-size: 18px;
            margin-bottom: 30px;
        }

        .session-info {
            background-color: #34495e;
            padding: 15px;
            border-radius: 8px;
            color: #ecf0f1;
            font-size: 16px;
            word-wrap: break-word;
            max-width: 100%;
        }

        .button {
            background-color: #1abc9c;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: #16a085;
        }

        footer {
            position: fixed;
            bottom: 10px;
            font-size: 14px;
            color: #95a5a6;
        }

        footer a {
            color: #1abc9c;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

    </style>
</head>
<body>

    <div class="container">
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your payment has been processed successfully.</p>

        <button class="button" onclick="goToDashboard()">Please return to the homepage</button>
    </div>

    <footer>
        <p>Need help? <a href="mailto:support@yourdomain.com">Contact Support</a></p>
    </footer>

    <script>
        // Get session ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        // Display the session ID in the page
        document.getElementById('session-id').textContent = sessionId ? sessionId : 'No session ID found';

        // Optionally, you can send this session ID to the backend to confirm the payment
        // Example: fetch('/api/confirm-payment', { method: 'POST', body: JSON.stringify({ sessionId }) });

        function goToDashboard() {
            window.location.href = 'https://sellapy.com'; // Replace with your dashboard URL
        }
    </script>

</body>
</html>
    `;
};


export default paymentSuccessTemplate;