<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Library System') }}</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />
    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/react-app/main.tsx'])
</head>
<body class="font-sans antialiased text-gray-900 bg-gray-50">
    <div id="app"></div>
</body>
</html>
