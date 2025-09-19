# Script de Deploy Automático no GitHub
# Salve como deploy.ps1 e execute no PowerShell com: .\deploy.ps1

Write-Host "Adicionando arquivos ao Git..."
git add .

Write-Host "Criando commit automático..."
git commit -m "Deploy automático"

Write-Host "Enviando para o GitHub..."
git push origin main

Write-Host "Deploy concluido com sucesso!"
