<!DOCTYPE html>
<html>
<head>
    <title>Task Assigned</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            width: 80%;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        h1 {
            color: #333333;
            font-size: 24px;
        }
        p {
            color: #666666;
            font-size: 16px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, {{ $userName }}</h1>
        <p>You have been assigned a new task: <strong>{{ $taskName }}</strong></p>
        <p>Click the button below to view your task:</p>
        <a href="#" class="button">View Task</a>
    </div>
</body>
</html>
