#!/bin/bash

echo "Iniciando a correção do erro de push do Git..."

# 1. Buscar e mesclar as alterações do repositório remoto
echo "Realizando git pull origin main..."
git pull origin main

# Verificar se o pull foi bem-sucedido ou se há conflitos
if [ $? -ne 0 ]; then
    echo "
--- ATENÇÃO: Conflitos de mesclagem detectados! ---
Por favor, resolva os conflitos manualmente no seu editor de código.
Após resolver, adicione os arquivos (git add .), faça o commit (git commit -m \"Resolvendo conflitos\") e execute este script novamente.
"
    exit 1
fi

echo "
--- Git pull concluído com sucesso. ---
"

# 2. Tentar enviar as alterações novamente
echo "Realizando git push origin main..."
git push origin main

if [ $? -ne 0 ]; then
    echo "
--- ERRO: O push ainda falhou. ---
Verifique as mensagens acima para mais detalhes ou tente novamente mais tarde.
"
    exit 1
fi

echo "
--- Git push concluído com sucesso! ---
"

