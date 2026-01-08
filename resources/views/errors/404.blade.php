<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Página não encontrada - {{ config('app.name', 'Financialite') }}</title>

    <!-- Fonte padrão do app (Figtree, mesma de app.blade.php) -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    @vite(['resources/css/app.css'])

    <script>
        (function () {
            try {
                var stored = window.localStorage.getItem('theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var shouldUseDark = stored === 'dark' || (!stored && prefersDark);

                if (shouldUseDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {
                // silenciosamente ignora qualquer erro de acesso ao localStorage
            }
        })();
    </script>
</head>
<body class="h-full font-sans antialiased bg-gray-100 text-gray-900 dark:bg-[#070707] dark:text-gray-100">
<div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div class="max-w-xl w-full text-center space-y-6">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-orange-500 text-3xl shadow-md text-white mb-3 ring-2 ring-black/5 dark:ring-black/40">
            404
        </div>

        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Oops! Página não encontrada
        </h1>

        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2">
            A rota que você tentou acessar não existe, foi removida
            ou está temporariamente indisponível.
        </p>

        <p class="text-sm text-gray-500 dark:text-gray-400">
            Verifique se o endereço está correto ou volte para uma área segura do Financialite.
        </p>

        <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            @auth
                <a href="{{ route('dashboard') }}"
                   class="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#070707]">
                    Voltar para o dashboard
                </a>
            @else
                <a href="{{ route('login') }}"
                   class="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#070707]">
                    Ir para o login
                </a>
            @endauth

            <a href="{{ url()->previous() }}"
               class="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-[#0b0b0b] dark:text-gray-200 dark:border-gray-700 dark:hover:bg-[#111]">
                Voltar para a página anterior
            </a>
        </div>

        <div class="mt-8 text-xs text-gray-400">
            © {{ date('Y') }} Financialite · Erro 404
        </div>
    </div>
</div>
</body>
</html>
