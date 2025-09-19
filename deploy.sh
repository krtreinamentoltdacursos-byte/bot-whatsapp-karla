#!/bin/bash
# Script de Deploy Automático para o Bot WhatsApp

echo "🚀 Iniciando Deploy..."

# Passo 1 - Adiciona todos os arquivos modificados
git add .

# Passo 2 - Cria um commit (com mensagem automática de data/hora)
git commit -m "Deploy automático em $(date +'%d/%m/%Y %H:%M:%S')"

# Passo 3 - Envia para o GitHub
git push origin main

echo "✅ Deploy enviado para o GitHub!"
echo "⏳ O Render vai reconstruir o projeto automaticamente..."
