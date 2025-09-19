#!/bin/bash

echo "Iniciando a correção do erro de push do Git..."

# 1. Buscar e mesclar as alterações do repositório remoto
echo "Realizando git pull origin main..."
git pull origin main --allow-unrelated-histories

# Verificar se o pull foi bem-sucedido ou se há conflitos
if [ $? -ne 0 ]; then
    echo "\n--- ATENÇÃO: Conflitos de mesclagem detectados! ---\nPor favor, resolva os conflitos manualmente no seu editor de código.\nApós resolver, adicione os arquivos (git add .), faça o commit (git commit -m \"Resolvendo conflitos\") e execute este script novamente.\n"
    exit 1
fi

echo "\n--- Git pull concluído com sucesso. ---\n"

# 2. Tentar enviar as alterações novamente
echo "Realizando git push origin main..."
git push origin main

if [ $? -ne 0 ]; then
    echo "\n--- ERRO: O push ainda falhou. ---\nVerifique as mensagens acima para mais detalhes ou tente novamente mais tarde.\n"
    exit 1
fi

echo "\n--- Git push concluído com sucesso! ---\n"
