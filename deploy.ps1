$ErrorActionPreference = "Stop"

try {
Write-Host "Adicionando arquivos ao Git..."
git add .
Write-Host "Arquivos adicionados com sucesso."

Write-Host "Criando commit automático..."
git commit -m "Deploy automático"
Write-Host "Commit criado com sucesso."

Write-Host "Enviando para o GitHub..."
git push origin main
Write-Host "✅ Deploy concluido com sucesso!"

} catch {
Write-Host "❌ Ocorreu um erro no Git."
Write-Host "Detalhes do erro:"
$_.Exception.Message | Out-Host
Write-Host "Verifique se você está na pasta correta e se a pasta é um repositório Git."
exit 1
}